/**
 * AuthManager.js
 * Реализует логику поиска аватарок Threads, аналогичную ava.py и get-avatar.js.
 * Для работы во фронтенде используется CORS-прокси.
 */

const CORS_PROXY = "https://corsproxy.io/?";

export const performFileAuth = async (handle) => {
    const username = handle.replace('@', '').trim().toLowerCase();
    const url = `https://www.threads.net/@${username}`;

    console.log(`[AuthManager] Ищем профиль Threads: ${username}`);

    try {
        // В браузере мы не можем напрямую делать fetch к Threads без CORS, 
        // поэтому используем прокси, как это часто делается в Мини-аппах для демо.
        const response = await fetch(CORS_PROXY + encodeURIComponent(url));

        if (!response.ok) {
            throw new Error('Профиль не найден или ошибка сети');
        }

        const html = await response.text();

        // Поиск og:image (как в get-avatar.js)
        let avatar = null;
        const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/) ||
            html.match(/property='og:image'\s+content='([^']+)'/) ||
            html.match(/content="([^"]+)"\s+property="og:image"/);

        if (ogMatch) {
            const ogImage = ogMatch[1].replace(/&amp;/g, '&');
            // Игнорируем стандартные логотипы, как в get-avatar.js
            if (!ogImage.includes('threads-logo') && !ogImage.includes('threads_app') && !ogImage.includes('static.cdninstagram.com')) {
                avatar = ogImage;
            }
        }

        // Fallback на DiceBear если аватарка не найдена (например, профиль закрыт)
        const finalAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        return {
            success: true,
            data: {
                handle: username,
                bio: "Пользователь Threads",
                avatar: finalAvatar,
                fromScraper: !!avatar
            }
        };
    } catch (error) {
        console.error('[AuthManager] Ошибка скрапинга:', error);
        // Даже при ошибке возвращаем успех с аватаркой-заглушкой для плавности UX
        return {
            success: true,
            data: {
                handle: username,
                bio: "Гость Часовни",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                fromScraper: false
            }
        };
    }
};
