import { supabase } from './supabase';

/**
 * AuthManager.js
 * Реализует логику поиска аватарок Threads, аналогичную ava.py и get-avatar.js.
 * Для работы во фронтенде используется CORS-прокси.
 */

const CORS_PROXY = "https://corsproxy.io/?";

export const performFileAuth = async (handle) => {
    const username = handle.replace('@', '').trim().toLowerCase();

    // 1. ПЕРВЫМ ДЕЛОМ: Проверяем в нашей базе (Fast Scrape)
    try {
        const { data: dbUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('handle', username)
            .maybeSingle();

        if (dbUser && dbUser.avatar_url && dbUser.avatar_url.includes('cdninstagram')) {
            console.log(`[AuthManager] Мгновенный вход (Cache-hit): ${username}`);
            return {
                success: true,
                data: {
                    handle: username,
                    bio: "Пользователь Threads",
                    avatar: dbUser.avatar_url, // URL уже проксируется в AppContext если надо
                    fromScraper: true
                }
            };
        }
    } catch (e) {
        console.warn('[AuthManager] DB Check failed, proceeding to scrapers...', e);
    }

    // 2. Если в базе нет — используем API или резервный скрапинг
    const url = `/api/get-avatar?username=${username}`;
    console.log(`[AuthManager] Ищем профиль Threads через API: ${username}`);

    try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
            return await performDirectScrapeFallback(username);
        }

        const result = await response.json();
        if (result.success && result.avatar) {
            return {
                success: true,
                data: {
                    handle: username,
                    bio: "Пользователь Threads",
                    avatar: result.avatar,
                    fromScraper: true
                }
            };
        }
        throw new Error('Профиль не найден');
    } catch (error) {
        console.error('[AuthManager] Ошибка API:', error);
        return await performDirectScrapeFallback(username);
    }
};

const performDirectScrapeFallback = async (username) => {
    console.log(`[AuthManager] Turbo-скрапинг: ${username}`);
    // corsproxy.io намного быстрее AllOrigins для первичного получения HTML
    const targetUrl = `https://www.threads.net/@${username}`;
    const PROXY_URL = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(PROXY_URL);
        if (!response.ok) throw new Error('CORS Proxy failure');
        const html = await response.text();

        let avatar = null;
        // Расширенное регулярное выражение для поиска og:image
        const ogMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/) ||
            html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/);

        if (ogMatch) {
            avatar = ogMatch[1].replace(/&amp;/g, '&');
            if (avatar.includes('threads-logo') || avatar.includes('threads_app')) {
                avatar = null;
            }
        }

        // Если через мета-тег не вышло, ищем в JSON-строках внутри HTML
        if (!avatar) {
            const jsonMatch = html.match(/"profile_pic_url":"([^"]+)"/);
            if (jsonMatch) {
                avatar = jsonMatch[1].replace(/\\u0026/g, '&');
            }
        }

        // КРИТИЧНО: Используем weserv.nl для самого изображения
        const finalAvatar = avatar
            ? `https://images.weserv.nl/?url=${encodeURIComponent(avatar)}&default=identicon`
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        return {
            success: true,
            data: {
                handle: username,
                bio: "Threads User",
                avatar: finalAvatar,
                fromScraper: !!avatar
            }
        };
    } catch (e) {
        console.error('[AuthManager] Turbo-скрапинг не удался:', e);
        return {
            success: true,
            data: {
                handle: username,
                bio: "Гость",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                fromScraper: false
            }
        };
    }
};
