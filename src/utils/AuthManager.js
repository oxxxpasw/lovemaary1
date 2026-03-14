/**
 * AuthManager.js
 * Реализует логику поиска аватарок Threads, аналогичную ava.py и get-avatar.js.
 * Для работы во фронтенде используется CORS-прокси.
 */

const CORS_PROXY = "https://corsproxy.io/?";

export const performFileAuth = async (handle) => {
    const username = handle.replace('@', '').trim().toLowerCase();

    // Используем наш собственный API-прокси для корректного скрапинга и обхода CORS
    const url = `/api/get-avatar?username=${username}`;

    console.log(`[AuthManager] Ищем профиль Threads через API: ${username}`);

    try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type");

        // Если мы получили не JSON (а, например, исходный код файла в локальной разработке)
        if (!contentType || !contentType.includes("application/json")) {
            console.warn('[AuthManager] API вернул не JSON. Проверьте запуск (vercel dev) или деплой.');
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
    console.log(`[AuthManager] Используем резервный скрапинг для: ${username}`);
    const CORS_PROXY = "https://corsproxy.io/?";
    const targetUrl = `https://www.threads.net/@${username}`;

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(targetUrl));
        const html = await response.text();

        let avatar = null;
        const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/) ||
            html.match(/property='og:image'\s+content='([^']+)'/) ||
            html.match(/content="([^"]+)"\s+property="og:image"/);

        if (ogMatch) {
            avatar = ogMatch[1].replace(/&amp;/g, '&');
        }

        return {
            success: true,
            data: {
                handle: username,
                bio: "Threads User",
                avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                fromScraper: !!avatar
            }
        };
    } catch (e) {
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
