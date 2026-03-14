// Утилита для отправки Telegram-уведомлений через API
import { supabase } from './supabase';

/**
 * Отправляет Telegram-уведомление пользователю
 * @param {string} handle - Threads хендл получателя
 * @param {string} message - Текст сообщения (поддерживает HTML)
 */
export const sendNotification = async (handle, message) => {
    try {
        // Получаем telegram_id и настройки уведомлений
        const { data: profile } = await supabase
            .from('profiles')
            .select('telegram_id, notify_proposals, notify_marriages')
            .eq('handle', handle)
            .maybeSingle();

        if (!profile?.telegram_id) {
            console.log(`[Notify] Нет telegram_id для @${handle}, пропускаем`);
            return;
        }

        const res = await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: profile.telegram_id,
                message
            })
        });

        const result = await res.json();
        if (result.success) {
            console.log(`[Notify] Уведомление отправлено @${handle}`);
        }
    } catch (err) {
        console.error('[Notify] Ошибка:', err);
    }
};

/**
 * Уведомление о новом предложении
 */
export const notifyProposal = async (toHandle, fromHandle) => {
    const { data } = await supabase
        .from('profiles')
        .select('notify_proposals')
        .eq('handle', toHandle)
        .maybeSingle();

    if (data?.notify_proposals === false) return;

    const message = `💍 <b>Новый сигнал!</b>\n\n@${fromHandle} хочет заключить союз с тобой.\n\nОткрой приложение, чтобы ответить! 💒`;
    await sendNotification(toHandle, message);
};

/**
 * Уведомление о завершении свадьбы
 */
export const notifyMarriage = async (partnerHandle, yourHandle) => {
    const { data } = await supabase
        .from('profiles')
        .select('notify_marriages')
        .eq('handle', partnerHandle)
        .maybeSingle();

    if (data?.notify_marriages === false) return;

    const message = `🎉 <b>Союз заключен!</b>\n\nТы и @${yourHandle} теперь официально связаны в MarryThreads!\n\nОткрой приложение, чтобы получить сертификат 📜`;
    await sendNotification(partnerHandle, message);
};
