// Vercel Serverless Function: обработка вебхуков Telegram
// Endpoint: POST /api/bot

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
);

const BOT_TOKEN = '8612737038:AAFMUDR3hFoF1O6JzWOBmY_f5GhjeOH_bgw';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const body = req.body;
    if (!body.message) return res.status(200).end();

    const chatId = body.message.chat.id;
    const text = body.message.text || '';

    // Обработка /start <handle>
    if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
            const handle = parts[1].replace('@', '').trim().toLowerCase();

            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ telegram_id: chatId })
                    .ilike('handle', handle);

                if (error) {
                    await sendMsg(chatId, `❌ Ошибка привязки профиля @${handle}: ${error.message}`);
                } else {
                    await sendMsg(chatId, `✅ <b>Уведомления активированы!</b>\n\nТеперь вы будете получать сообщения о новых предложениях и свадьбах для аккаунта @${handle}.`);
                }
            } catch (err) {
                await sendMsg(chatId, `❌ Системная ошибка: ${err.message}`);
            }
        } else {
            await sendMsg(chatId, "👋 <b>Добро пожаловать в MarryThreads!</b>\n\nЧтобы активировать уведомления, используйте кнопку в приложении или введите <code>/start ваш_ник_threads</code>");
        }
    }

    return res.status(200).json({ ok: true });
}

async function sendMsg(chatId, text) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    });
}
