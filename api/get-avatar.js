export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { url, proxy } = req.query;

    if (proxy === '1' && url) {
        try {
            const targetUrl = decodeURIComponent(url);
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'image/*',
                    'Referer': 'https://www.threads.net/'
                }
            });

            if (!response.ok) throw new Error('Proxy fetch failed');

            const contentType = response.headers.get('content-type') || 'image/jpeg';
            const buffer = Buffer.from(await response.arrayBuffer());

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    const username = req.query.username?.replace('@', '').trim().toLowerCase();
    if (!username) return res.status(400).json({ error: 'No username' });

    try {
        const targetUrl = `https://www.threads.net/@${username}`;
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        const html = await response.text();

        // Improved Regex from working scripts
        let avatar = null;
        const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/) ||
            html.match(/property='og:image'\s+content='([^']+)'/) ||
            html.match(/content="([^"]+)"\s+property="og:image"/);

        if (ogMatch) {
            const ogImage = ogMatch[1].replace(/&amp;/g, '&');
            if (!ogImage.includes('threads-logo') && !ogImage.includes('threads_app')) {
                avatar = ogImage;
            }
        }

        // Proxy the avatar URL through ourselves to fix CORS/hotlinking
        const proto = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers['host'];
        const proxiedAvatar = avatar ? `${proto}://${host}/api/get-avatar?proxy=1&url=${encodeURIComponent(avatar)}` : null;

        return res.status(200).json({
            success: !!avatar,
            handle: username,
            avatar: proxiedAvatar,
            fromScraper: !!avatar
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
