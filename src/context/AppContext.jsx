import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { notifyProposal, notifyMarriage } from '../utils/notifications';

const AppContext = createContext();

// Провайдер состояния
export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('splash');
    const [activeWedding, setActiveWedding] = useState(null);
    const [isPerformingWedding, setIsPerformingWedding] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [marriages, setMarriages] = useState([]);
    const [receivedProposals, setReceivedProposals] = useState([]);
    const [sentProposals, setSentProposals] = useState([]);
    const [viewingHandle, setViewingHandle] = useState(null); // Для публичных паспортов

    // Утилита для гарантированного отображения аватарок через прокси
    const ensureSafeAvatar = (url) => {
        if (!url) return null;

        // Если это уже прокси-URL или не инстаграм - не трогаем
        const isStatic = (url || '').includes('rsrc.php') || (url || '').includes('.css') || (url || '').includes('.js');
        if (url.includes('/api/get-avatar') || !url.includes('cdninstagram.com') || isStatic) return url;

        // Проксируем через наш API
        return `/api/get-avatar?proxy=1&url=${encodeURIComponent(url)}`;
    };

    const sendTGNotification = async (targetHandle, message) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('telegram_id, notify_proposals, notify_marriages')
                .ilike('handle', targetHandle)
                .maybeSingle();

            if (profile?.telegram_id) {
                const wantsProposals = profile.notify_proposals !== false;
                const wantsMarriages = profile.notify_marriages !== false;

                const isProposal = message.includes('предложение') || message.includes('Proposal');
                if ((isProposal && !wantsProposals) || (!isProposal && !wantsMarriages)) return;

                await fetch('/api/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegram_id: profile.telegram_id,
                        message: message
                    })
                });
            }
        } catch (err) {
            // Error hidden
        }
    };

    // 1. Начальная загрузка и восстановление сессии
    useEffect(() => {
        const savedHandle = localStorage.getItem('marrythreads_handle');
        if (savedHandle) {
            restoreSession(savedHandle);
        } else {
            const timer = setTimeout(() => {
                if (currentScreen === 'splash') setCurrentScreen('auth');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const restoreSession = async (handle) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('handle', handle)
            .maybeSingle();

        if (error) {
            setCurrentScreen('auth');
            return;
        }

        if (data) {
            setUser({
                handle: data.handle,
                avatar: ensureSafeAvatar(data.avatar_url),
                silk: data.silk,
                role: data.role,
                status: data.status
            });
            setCurrentScreen('dashboard');
        } else {
            setCurrentScreen('auth');
        }
    };

    // 2. Real-time подписка на входящие предложения
    useEffect(() => {
        if (!user) return;

        console.log(`[Supabase] Попытка подписки для пользователя: ${user.handle}`);

        const subscription = supabase
            .channel('proposals_channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'proposals',
                filter: `to_handle=eq.${user.handle}`
            }, async (payload) => {
                console.log('[Supabase] ПОЛУЧЕН НОВЫЙ СИГНАЛ:', payload.new);

                // Получаем данные отправителя (аватарку)
                const { data: sender } = await supabase
                    .from('profiles')
                    .select('*')
                    .ilike('handle', payload.new.from_handle)
                    .maybeSingle();

                setReceivedProposals(prev => [{
                    id: payload.new.id,
                    from: payload.new.from_handle,
                    avatar: ensureSafeAvatar(sender?.avatar_url),
                    ring_id: payload.new.ring_id || 'basic',
                    date: new Date().toLocaleDateString('ru-RU')
                }, ...prev]);

                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                }
            })
            .subscribe((status) => {
                console.log(`[Supabase] Статус подписки для @${user.handle}:`, status);
            });

        // Загружаем существующие предложения при логине
        loadInitialData(user.handle);

        return () => {
            console.log('[Supabase] Отписка...');
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const loadInitialData = async (handle) => {
        // Получаем входящие предложения
        const { data: proposals } = await supabase
            .from('proposals')
            .select('*')
            .eq('to_handle', handle)
            .eq('status', 'pending');

        if (proposals) {
            // Для каждого предложения подтягиваем аватарку
            const detailedProposals = await Promise.all(proposals.map(async p => {
                const { data: sender } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .ilike('handle', p.from_handle)
                    .maybeSingle();

                return {
                    id: p.id,
                    from: p.from_handle,
                    avatar: ensureSafeAvatar(sender?.avatar_url),
                    ring_id: p.ring_id || 'basic',
                    date: new Date(p.created_at).toLocaleDateString('ru-RU')
                };
            }));
            setReceivedProposals(detailedProposals);
        }

        // Получаем историю браков
        const { data: marriageData } = await supabase
            .from('marriages')
            .select('id, partner_a, partner_b, wedding_style, ring_id, hype_score, created_at')
            .or(`partner_a.eq.${handle},partner_b.eq.${handle}`);

        if (marriageData) {
            const seenPair = new Set();
            const uniqueMarriages = marriageData.filter(m => {
                const pair = [m.partner_a, m.partner_b].sort().join(':');
                if (seenPair.has(pair)) return false;
                seenPair.add(pair);
                return true;
            });

            const detailedMarriages = await Promise.all(uniqueMarriages.map(async m => {
                const partnerHandle = m.partner_a === handle ? m.partner_b : m.partner_a;
                const { data: partner } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .ilike('handle', partnerHandle)
                    .maybeSingle();

                return {
                    id: m.id,
                    partner: partnerHandle,
                    partnerAvatar: ensureSafeAvatar(partner?.avatar_url),
                    date: new Date(m.created_at).toLocaleDateString('ru-RU'),
                    style: m.wedding_style,
                    ring_id: m.ring_id || 'basic',
                    hype_score: m.hype_score || 0
                };
            }));
            setMarriages(detailedMarriages);
        }
    };

    const login = async (userData) => {
        // userData в формате { handle, avatar, bio, fromScraper }
        localStorage.setItem('marrythreads_handle', userData.handle);

        // Проверяем, есть ли уже такой пользователь и какой у него аватар
        const { data: existingUser, error: checkError } = await supabase
            .from('profiles')
            .select('avatar_url, status')
            .ilike('handle', userData.handle)
            .maybeSingle();

        if (checkError) {
            console.warn('[Supabase] Ошибка при проверке профиля:', checkError);
        }

        let finalAvatar = userData.avatar;
        // Если у нас уже есть аватарка в базе, а сейчас пришла заглушка - не перезаписываем хорошую аватарку
        if (existingUser?.avatar_url && !userData.fromScraper && existingUser.avatar_url.includes('cdninstagram')) {
            finalAvatar = existingUser.avatar_url;
        }

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                handle: userData.handle,
                avatar_url: finalAvatar,
                status: existingUser?.status || 'Свободен'
            }, { onConflict: 'handle' })
            .select()
            .maybeSingle();

        if (error) {
            console.error('[Supabase] Ошибка входа (UPSERT):', error);
            setUser({
                handle: userData.handle,
                avatar: ensureSafeAvatar(finalAvatar),
                silk: 100,
                role: 'Моногам',
                status: 'Свободен'
            });
        } else if (data) {
            setUser({
                handle: data.handle,
                avatar: ensureSafeAvatar(data.avatar_url),
                silk: data.silk,
                role: data.role,
                status: data.status
            });
        }
        setCurrentScreen('dashboard');
    };

    const logout = () => {
        localStorage.removeItem('marrythreads_handle');
        setUser(null);
        setCurrentScreen('auth');
        window.location.reload(); // Перезагружаем для чистой очистки состояния
    };

    const sendProposal = async (partnerData) => {
        // partnerData = { handle, avatar }

        // Проверка 1: Уже в браке с этим пользователем?
        const { data: existingMarriage } = await supabase
            .from('marriages')
            .select('id')
            .or(`and(partner_a.eq.${user.handle},partner_b.eq.${partnerData.handle}),and(partner_a.eq.${partnerData.handle},partner_b.eq.${user.handle})`)
            .maybeSingle();

        if (existingMarriage) {
            console.error('[Supabase] Вы уже состоите в браке с этим пользователем.');
            // В идеале здесь нужен toast, но пока прерываем логику
            return { success: false, error: 'Вы уже состоите в браке с этим пользователем.' };
        }

        // Проверка 2: Уже есть активное предложение? (в любую сторону)
        const { data: existingProposal } = await supabase
            .from('proposals')
            .select('id')
            .eq('status', 'pending')
            .or(`and(from_handle.eq.${user.handle},to_handle.eq.${partnerData.handle}),and(from_handle.eq.${partnerData.handle},to_handle.eq.${user.handle})`)
            .maybeSingle();

        if (existingProposal) {
            console.error('[Supabase] У вас уже есть активное ожидающее предложение с этим пользователем.');
            return { success: false, error: 'У вас уже есть активное предложение с этим пользователем.' };
        }

        // Проверка 3: Лимит браков (Полиамория)
        const polyRoles = ['Хаос-друг', 'Серийный женатик', 'Полиамор', 'Сводник'];
        const maxMarriages = (polyRoles.includes(user.role) || user.silk >= 1000) ? 3 : 1;

        const { count } = await supabase
            .from('marriages')
            .select('*', { count: 'exact', head: true })
            .or(`partner_a.eq.${user.handle},partner_b.eq.${user.handle}`);

        if (count >= maxMarriages) {
            return { success: false, error: `Достигнут лимит браков (${maxMarriages}) для вашей роли/баланса.` };
        }

        // Сначала регистрируем партнера в базе, если его там нет (чтобы сработал Foreign Key)
        await supabase
            .from('profiles')
            .upsert({
                handle: partnerData.handle,
                avatar_url: partnerData.avatar,
                status: 'Свободен'
            }, { onConflict: 'handle' });

        const { error } = await supabase
            .from('proposals')
            .insert({
                from_handle: user.handle,
                to_handle: partnerData.handle,
                status: 'pending',
                ring_id: partnerData.ringId || 'basic'
            });

        if (error) {
            console.error('[Supabase] Send proposal error:', error);
            return { success: false, error: 'Ошибка при отправке предложения.' };
        } else {
            setSentProposals([{ ...partnerData, id: Date.now() }, ...sentProposals]);
            // Отправляем TG-уведомление партнёру
            notifyProposal(partnerData.handle, user.handle);
            return { success: true };
        }
    };

    const acceptProposal = async (proposal) => {
        // Сначала обновляем статус предложения
        await supabase
            .from('proposals')
            .update({ status: 'accepted' })
            .eq('id', proposal.id);

        setReceivedProposals(receivedProposals.filter(p => p.id !== proposal.id));

        startWedding({
            handle: proposal.from,
            avatar: proposal.avatar,
            ringId: proposal.ring_id
        });
    };

    const rejectProposal = async (id) => {
        await supabase
            .from('proposals')
            .update({ status: 'rejected' })
            .eq('id', id);

        setReceivedProposals(receivedProposals.filter(p => p.id !== id));
    };

    const startWedding = (partnerData) => {
        setActiveWedding({
            partner: partnerData.handle,
            partnerAvatar: partnerData.avatar,
            style: 'Кибер-ЗАГС',
            ringId: partnerData.ringId || 'basic',
            date: new Date().toLocaleDateString('ru-RU')
        });
        setCurrentScreen('chapel');
    };

    const completeWedding = async () => {
        if (activeWedding && !isPerformingWedding) {
            setIsPerformingWedding(true);
            try {
                // Сохраняем брак в БД
                const { data: newMarriage, error: insertError } = await supabase
                    .from('marriages')
                    .insert({
                        partner_a: user.handle,
                        partner_b: activeWedding.partner,
                        wedding_style: activeWedding.style,
                        ring_id: activeWedding.ringId || 'basic'
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('[Supabase] Ошибка при сохранении брака:', insertError);
                }

                // Обновляем статус текущего пользователя
                const newStatus = `В союзе с @${activeWedding.partner}`;
                await supabase
                    .from('profiles')
                    .update({
                        status: newStatus,
                        silk: user.silk + 50
                    })
                    .ilike('handle', user.handle);

                // Обновляем статус ПАРТНЁРА тоже!
                const partnerStatus = `В союзе с @${user.handle}`;
                await supabase
                    .from('profiles')
                    .update({ status: partnerStatus })
                    .ilike('handle', activeWedding.partner);

                // Начисляем партнёру Silk
                const { data: partnerProfile } = await supabase
                    .from('profiles')
                    .select('silk')
                    .ilike('handle', activeWedding.partner)
                    .maybeSingle();

                if (partnerProfile) {
                    await supabase
                        .from('profiles')
                        .update({ silk: (partnerProfile.silk || 0) + 50 })
                        .eq('handle', activeWedding.partner);
                }

                setMarriages([{
                    id: newMarriage?.id || Date.now(),
                    partner: activeWedding.partner,
                    partnerAvatar: activeWedding.partnerAvatar,
                    date: activeWedding.date,
                    style: activeWedding.style,
                    ring_id: activeWedding.ringId || 'basic'
                }, ...marriages]);

                // Уведомляем партнёра в TG
                notifyMarriage(activeWedding.partner, user.handle);

                setUser(prev => ({
                    ...prev,
                    status: newStatus,
                    silk: prev.silk + 50
                }));

                // Отправляем TG-уведомление партнёру о свадьбе
                notifyMarriage(activeWedding.partner, user.handle);

                setCurrentScreen('certificate');
            } finally {
                setIsPerformingWedding(false);
            }
        }
    };

    const updateUser = async (updates) => {
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .ilike('handle', user.handle);

        if (!error) {
            setUser(prev => ({ ...prev, ...updates }));
        }
    };

    const divorce = async (marriageId) => {
        try {
            console.log(`[Supabase] Попытка развода для брака ID: ${marriageId}`);
            // Удаляем запись о браке из БД
            const { error } = await supabase.from('marriages').delete().eq('id', marriageId);

            if (error) {
                console.error('[Supabase] Ошибка при разводе:', error);
                alert('Не удалось расторгнуть брак. Возможно, он уже расторгнут.');
                return;
            }

            // Обновляем локальный стейт
            const remainingMarriages = marriages.filter(m => m.id !== marriageId);
            setMarriages(remainingMarriages);

            // Обновляем статус: если остались другие браки (полиамория) – ставим имя другого партнера, иначе "Свободен"
            let newStatus = 'Свободен';
            if (remainingMarriages.length > 0) {
                newStatus = `В союзе с @${remainingMarriages[0].partner}`;
            }
            await updateUser({ status: newStatus });

            setCurrentScreen('divorce'); // Переход на экран разбитого сертификата
        } catch (err) {
            console.error('[Supabase] Критическая ошибка при разводе:', err);
        }
    };

    const openPassport = (handle) => {
        setViewingHandle(handle);
        setCurrentScreen('passport');
    };

    const boostHype = async (marriageId) => {
        if (!user) return { success: false, error: 'Нужна авторизация' };

        // 1. Проверяем, голосовал ли уже этот юзер за этот брак
        const { data: existingVote } = await supabase
            .from('marriage_votes')
            .select('id')
            .eq('marriage_id', marriageId)
            .ilike('voter_handle', user.handle)
            .maybeSingle();

        if (existingVote) {
            return { success: false, error: 'Вы уже поддержали эту пару!' };
        }

        // 2. Регистрируем голос
        const { error: voteError } = await supabase
            .from('marriage_votes')
            .insert({
                marriage_id: marriageId,
                voter_handle: user.handle
            });

        if (voteError) return { success: false, error: 'Ошибка голосования' };

        // 3. Увеличиваем счетчик в таблице marriages (с помощью RPC или инкремента)
        // Для простоты используем инкремент через update, но в идеале нужен RPC
        const { data: marriage } = await supabase
            .from('marriages')
            .select('hype_score')
            .eq('id', marriageId)
            .single();

        await supabase
            .from('marriages')
            .update({ hype_score: (marriage.hype_score || 0) + 1 })
            .eq('id', marriageId);

        return { success: true };
    };

    // 5. Автоматическая синхронизация Telegram ID
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg && user && !user.telegram_id) {
            const tgUser = tg.initDataUnsafe?.user;
            if (tgUser?.id) {
                console.log('[TG Sync] Auto-linking telegram_id:', tgUser.id);
                supabase
                    .from('profiles')
                    .update({ telegram_id: tgUser.id })
                    .ilike('handle', user.handle)
                    .then(() => {
                        setUser(prev => ({ ...prev, telegram_id: tgUser.id }));
                    });
            }
        }
    }, [user]);

    return (
        <AppContext.Provider value={{
            user, setUser,
            currentScreen, setCurrentScreen,
            inventory, setInventory,
            marriages, setMarriages,
            receivedProposals, sentProposals,
            activeWedding, startWedding, completeWedding,
            sendProposal, acceptProposal, rejectProposal,
            login, updateUser, logout, divorce,
            viewingHandle, setViewingHandle, openPassport, boostHype,
            ensureSafeAvatar
        }}>
            {children}
        </AppContext.Provider>
    );
};

// Хук для использования контекста
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
