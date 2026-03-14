import { supabase } from './supabase';

/**
 * AuthManager.js
 * Реализует логику поиска аватарок Threads, полностью синхронизированную с get-avatar.js и ava.py.
 * Для работы во фронтенде используется CORS-прокси.
 */

const CORS_PROXY = "https://corsproxy.io/?";

const isRealAvatar = (url) => {
    if (!url) return false;
    const low = url.toLowerCase();
    // Игнорируем логотипы, стили и заглушки (из эталона)
    return !low.includes('threads-logo') &&
        !low.includes('threads_app') &&
        !low.includes('static.cdninstagram.com') &&
        !low.includes('rsrc.php') &&
        !low.endsWith('.css') &&
        !low.endsWith('.js');
};

export const performFileAuth = async (handle) => {
    const username = handle.replace('@', '').trim().toLowerCase();

    // 1. ПЕРВЫМ ДЕЛОМ: Проверяем в нашей базе (Fast Scrape)
    try {
        const { data: dbUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('handle', username)
            .maybeSingle();

        // Если в базе есть профиль и у него есть аватарка (которую мы сохранили как оригинал)
        if (dbUser && dbUser.avatar_url && dbUser.avatar_url.includes('cdninstagram')) {
            console.log(`[AuthManager] Мгновенный вход (Cache-hit): ${username}`);
            return {
                success: true,
                data: {
                    handle: username,
                    bio: "Пользователь Threads",
                    avatar: dbUser.avatar_url, // Чистый URL из базы
                    fromScraper: true
                }
            };
        }
    } catch (e) {
        console.warn('[AuthManager] DB Check failed, proceeding to scrapers...', e);
    }

    // 2. Если в базе нет — используем API
    const url = `/api/get-avatar?username=${username}`;
    console.log(`[AuthManager] Ищем профиль Threads через API: ${username}`);

    try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
            console.warn('[AuthManager] API returned non-JSON response, falling back to direct scrape.');
            return await performDirectScrapeFallback(username);
        }

        const data = await response.json();
        if (data.success && data.avatar) {
            return {
                success: true,
                data: {
                    handle: username,
                    bio: "Пользователь Threads",
                    avatar: data.originalUrl || data.avatar, // Всегда берем оригинал для сохранения в БД
                    fromScraper: true
                }
            };
        }

        // Если API вернул 404 или ошибку, пробуем Turbo-скрапер на клиенте через CORS прокси
        return await performDirectScrapeFallback(username);
    } catch (error) {
        console.error('[AuthManager] Ошибка API, fallback на Turbo-скрапер:', error);
        return await performDirectScrapeFallback(username);
    }
};

const performDirectScrapeFallback = async (username) => {
    console.log(`[AuthManager] Turbo-скрапинг: ${username}`);
    const targetUrl = `https://www.threads.net/@${username}`;
    const PROXY_URL = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(PROXY_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        });

        if (!response.ok) throw new Error(`CORS Proxy failure: ${response.status}`);

        const finalUrl = response.url;
        const html = await response.text();

        // Проверки на валидность страницы (из эталона)
        if (!html || html.length < 100) throw new Error('Empty page');
        if (finalUrl && (finalUrl.includes('login') || finalUrl.includes('accounts'))) throw new Error('Login redirect');
        if (html.includes('loginPage') || html.includes('"login"')) throw new Error('Login block detected');
        if (html.includes('Page not found')) throw new Error('User not found (404)');

        let avatar = null;

        // 1. Ищем в og:image (все варианты регулярок из эталона)
        let ogMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/) ||
            html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/) ||
            html.match(/property='og:image'\s+content='([^']+)'/);

        if (ogMatch) {
            const ogUrl = ogMatch[1].replace(/&amp;/g, '&');
            if (isRealAvatar(ogUrl)) {
                avatar = ogUrl;
            }
        }

        // 2. Fallback на twitter:image (из эталона)
        if (!avatar) {
            const twitterMatch = html.match(/name=["']twitter:image["']\s+content=["']([^"']+)["']/) ||
                html.match(/content=["']([^"']+)["']\s+name=["']twitter:image["']/);
            if (twitterMatch) {
                const twitterUrl = twitterMatch[1].replace(/&amp;/g, '&');
                if (isRealAvatar(twitterUrl)) {
                    avatar = twitterUrl;
                }
            }
        }

        // 3. Fallback на JSON profile_pic_url
        if (!avatar) {
            const jsonMatch = html.match(/"profile_pic_url":"([^"]+)"/);
            if (jsonMatch) {
                const jsonUrl = jsonMatch[1].replace(/\\u0026/g, '&');
                if (isRealAvatar(jsonUrl)) {
                    avatar = jsonUrl;
                }
            }
        }

        // 4. Последний шанс: hd_profile_pic_url_info или любой cdninstagram URL
        if (!avatar) {
            const hdMatch = html.match(/"url":"([^"]+)"/);
            if (hdMatch && hdMatch[1].includes('cdninstagram.com')) {
                const hdUrl = hdMatch[1].replace(/\\u0026/g, '&');
                if (isRealAvatar(hdUrl)) {
                    avatar = hdUrl;
                }
            }
        }

        if (avatar) {
            return {
                success: true,
                data: {
                    handle: username,
                    bio: "Threads User",
                    avatar: avatar, // Чистая оригинальная ссылка
                    fromScraper: true
                }
            };
        }

        throw new Error('Реальный аватар не найден');

    } catch (e) {
        console.error('[AuthManager] Turbo-скрапинг не удался:', e.message);
        return {
            success: false,
            error: "Не удалось найти реальный аватар вашего Threads-профиля. Профиль может быть закрыт или не существует."
        };
    }
};
