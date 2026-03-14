// Vercel Serverless Function: отправляет Telegram-уведомления
// Endpoint: POST /api/notify
// Body: { telegram_id, message }

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { telegram_id, message } = req.body;

    if (!telegram_id || !message) {
        return res.status(400).json({ error: 'telegram_id and message are required' });
    }

    // Бот-токен — вставь свой сюда или через env
    const BOT_TOKEN = process.env.TG_BOT_TOKEN || 'YOUR_BOT_TOKEN';

    try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegram_id,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const result = await tgRes.json();

        if (!result.ok) {
            console.error('[TG API] Error:', result);
            return res.status(500).json({ error: result.description });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('[TG Notify] Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
