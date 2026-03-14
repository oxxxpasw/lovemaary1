export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { url, proxy, username: queryUsername } = req.query;

    // 1. Проксирование самого изображения (для обхода Referer/Hotlinking)
    if (proxy === '1' && url) {
        try {
            const targetUrl = decodeURIComponent(url);

            // Используем images.weserv.nl как ультимативный прокси для картинок
            // Он отлично справляется с обходом защиты Instagram CDN
            const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(targetUrl)}&default=identicon`;

            return res.redirect(302, proxyUrl);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // 2. Скрапинг профиля
    const username = queryUsername?.replace('@', '').trim().toLowerCase();
    if (!username) return res.status(400).json({ error: 'No username' });

    try {
        const targetUrl = `https://www.threads.net/@${username}`;

        // Пытаемся получить HTML с "настоящими" заголовками
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        const html = await response.text();

        // Расширенный поиск og:image
        const ogMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/) ||
            html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/);

        let avatar = null;
        if (ogMatch) {
            avatar = ogMatch[1].replace(/&amp;/g, '&');
            // Игнорируем бесполезные логотипы
            if (avatar.includes('threads-logo') || avatar.includes('threads_app')) {
                avatar = null;
            }
        }

        // Если мета-тег не найден, ищем в JSON (иногда Threads так отдает данные)
        if (!avatar) {
            const jsonMatch = html.match(/"profile_pic_url":"([^"]+)"/);
            if (jsonMatch) {
                avatar = jsonMatch[1].replace(/\\u0026/g, '&');
            }
        }

        const proto = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers['host'];

        // Генерируем ссылку через наш прокси
        const proxiedAvatar = avatar ? `${proto}://${host}/api/get-avatar?proxy=1&url=${encodeURIComponent(avatar)}` : null;

        return res.status(200).json({
            success: !!avatar,
            handle: username,
            avatar: proxiedAvatar,
            fromScraper: !!avatar
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
