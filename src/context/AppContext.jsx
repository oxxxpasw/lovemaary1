import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { notifyProposal, notifyMarriage } from '../utils/notifications';

const AppContext = createContext();

// Провайдер состояния
export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('splash');
    const [activeWedding, setActiveWedding] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [marriages, setMarriages] = useState([]);
    const [receivedProposals, setReceivedProposals] = useState([]);
    const [sentProposals, setSentProposals] = useState([]);

    // Утилита для гарантированного отображения аватарок через прокси
    const ensureSafeAvatar = (url) => {
        if (!url) return null;

        // Если это уже прокси-URL или не инстаграм - не трогаем
        const isStatic = (url || '').includes('rsrc.php') || (url || '').includes('.css') || (url || '').includes('.js');
        if (url.includes('/api/get-avatar') || !url.includes('cdninstagram.com') || isStatic) return url;

        // Проксируем через наш API
        return `/api/get-avatar?proxy=1&url=${encodeURIComponent(url)}`;
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
            .eq('handle', handle)
            .maybeSingle();

        if (error) {
            console.error('[Supabase] Ошибка восстановления сессии (406?):', error);
            if (error.message) console.error('Детали:', error.message);
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
                    .eq('handle', payload.new.from_handle)
                    .maybeSingle();

                setReceivedProposals(prev => [{
                    id: payload.new.id,
                    from: payload.new.from_handle,
                    avatar: ensureSafeAvatar(sender?.avatar_url),
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
                    .eq('handle', p.from_handle)
                    .maybeSingle();

                return {
                    id: p.id,
                    from: p.from_handle,
                    avatar: ensureSafeAvatar(sender?.avatar_url),
                    date: new Date(p.created_at).toLocaleDateString('ru-RU')
                };
            }));
            setReceivedProposals(detailedProposals);
        }

        // Получаем историю браков
        const { data: marriageData } = await supabase
            .from('marriages')
            .select('*')
            .or(`partner_a.eq.${handle},partner_b.eq.${handle}`);

        if (marriageData) {
            const detailedMarriages = await Promise.all(marriageData.map(async m => {
                const partnerHandle = m.partner_a === handle ? m.partner_b : m.partner_a;
                const { data: partner } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('handle', partnerHandle)
                    .maybeSingle();

                return {
                    id: m.id,
                    partner: partnerHandle,
                    partnerAvatar: ensureSafeAvatar(partner?.avatar_url),
                    date: new Date(m.created_at).toLocaleDateString('ru-RU'),
                    style: m.wedding_style
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
            .eq('handle', userData.handle)
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
                status: 'pending'
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
            avatar: proposal.avatar
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
            date: new Date().toLocaleDateString('ru-RU')
        });
        setCurrentScreen('chapel');
    };

    const completeWedding = async () => {
        if (activeWedding) {
            // Сохраняем брак в БД
            const { data: newMarriage } = await supabase
                .from('marriages')
                .insert({
                    partner_a: user.handle,
                    partner_b: activeWedding.partner,
                    wedding_style: activeWedding.style
                })
                .select()
                .single();

            // Обновляем статус текущего пользователя
            const newStatus = `В союзе с @${activeWedding.partner}`;
            await supabase
                .from('profiles')
                .update({
                    status: newStatus,
                    silk: user.silk + 50
                })
                .eq('handle', user.handle);

            // Обновляем статус ПАРТНЁРА тоже!
            const partnerStatus = `В союзе с @${user.handle}`;
            await supabase
                .from('profiles')
                .update({ status: partnerStatus })
                .eq('handle', activeWedding.partner);

            // Начисляем партнёру Silk
            const { data: partnerProfile } = await supabase
                .from('profiles')
                .select('silk')
                .eq('handle', activeWedding.partner)
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
                style: activeWedding.style
            }, ...marriages]);

            setUser(prev => ({
                ...prev,
                status: newStatus,
                silk: prev.silk + 50
            }));

            // Отправляем TG-уведомление партнёру о свадьбе
            notifyMarriage(activeWedding.partner, user.handle);

            setCurrentScreen('certificate');
        }
    };

    const updateUser = async (updates) => {
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('handle', user.handle);

        if (!error) {
            setUser(prev => ({ ...prev, ...updates }));
        }
    };

    return (
        <AppContext.Provider value={{
            user, setUser,
            currentScreen, setCurrentScreen,
            inventory, setInventory,
            marriages, setMarriages,
            receivedProposals, sentProposals,
            activeWedding, startWedding, completeWedding,
            sendProposal, acceptProposal, rejectProposal,
            login, updateUser, logout
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
