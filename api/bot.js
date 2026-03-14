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
    console.log('[Bot Webhook] Incoming:', JSON.stringify(body));

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
                    await sendMsg(chatId, `❌ <b>Ошибка привязки:</b> @${handle}\n\nПожалуйста, убедитесь, что вы уже зашли в приложение MarryThreads хотя бы один раз.`);
                } else {
                    await sendMsg(chatId, `🤝 <b>Профиль @${handle} успешно привязан!</b>\n\nТеперь я буду присылать вам мгновенные уведомления о:\n💍 Новых предложениях\n🎉 Заключенных союзах\n💔 Разводах\n\nИспользуйте Mini App, чтобы управлять своей личной жизнью в Threads! ✨`);
                }
            } catch (err) {
                await sendMsg(chatId, `❌ <b>Системная ошибка:</b>\n${err.message}`);
            }
        } else {
            await sendMsg(chatId, `✨ <b>Добро пожаловать в MarryThreads!</b> 💍\n\nЯ — официальный бот первого сервиса цифровых браков в Threads.\n\n<b>Что я умею:</b>\n— Сообщаю о новых сигналах внимания\n— Уведомляю о регистрации союзов\n— Помогаю делиться вашим цифровым паспортом\n\n🚀 <b>Запустите приложение ниже, чтобы начать!</b>\n\n<i>Если вы зашли не через Mini App, используйте команду:</i>\n<code>/start ваш_ник_threads</code>`);
        }
    }

    return res.status(200).json({ ok: true });
}

async function sendMsg(chatId, text) {
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });
        const data = await res.json();
        if (!data.ok) console.error('[TG API] Error:', data);
    } catch (err) {
        console.error('[TG Fetch] Error:', err);
    }
}
