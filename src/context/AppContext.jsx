import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

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
        if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`;
        if (url.includes('cdninstagram.com') && !url.includes('weserv.nl')) {
            return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=identicon`;
        }
        return url;
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
            // Fallback: заходим как "гость" если БД лежит, но даем пользователю поиграть
            setUser({
                handle: userData.handle,
                avatar: finalAvatar,
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
        } else {
            setSentProposals([{ ...partnerData, id: Date.now() }, ...sentProposals]);
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

            // Обновляем статус пользователя
            const newStatus = `В союзе с @${activeWedding.partner}`;
            await supabase
                .from('profiles')
                .update({
                    status: newStatus,
                    silk: user.silk + 50
                })
                .eq('handle', user.handle);

            setMarriages([{
                id: newMarriage?.id || Date.now(),
                partner: activeWedding.partner,
                date: activeWedding.date,
                style: activeWedding.style
            }, ...marriages]);

            setUser(prev => ({
                ...prev,
                status: newStatus,
                silk: prev.silk + 50
            }));

            setActiveWedding(null);
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
