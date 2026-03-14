import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('splash');
    const [activeWedding, setActiveWedding] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [marriages, setMarriages] = useState([]);
    const [receivedProposals, setReceivedProposals] = useState([]);
    const [sentProposals, setSentProposals] = useState([]);

    // 1. Начальная загрузка и Real-time подписка
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentScreen === 'splash') setCurrentScreen('auth');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // 2. Real-time подписка на входящие предложения
    useEffect(() => {
        if (!user) return;

        console.log(`[Supabase] Setting up subscription for: ${user.handle}`);

        const subscription = supabase
            .channel('proposals_channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'proposals',
                filter: `to_handle=eq.${user.handle}`
            }, async (payload) => {
                console.log('[Supabase] NEW PROPOSAL RECEIVED:', payload.new);

                // Получаем данные отправителя (аватарку)
                const { data: sender } = await supabase
                    .from('users')
                    .select('*')
                    .eq('handle', payload.new.from_handle)
                    .single();

                setReceivedProposals(prev => [{
                    id: payload.new.id,
                    from: payload.new.from_handle,
                    avatar: sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.from_handle}`,
                    date: new Date(payload.new.created_at).toLocaleDateString('ru-RU')
                }, ...prev]);
            })
            .subscribe();

        // Загружаем существующие предложения при логине
        loadInitialData(user.handle);

        return () => {
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
                    .from('users')
                    .select('avatar_url')
                    .eq('handle', p.from_handle)
                    .single();

                return {
                    id: p.id,
                    from: p.from_handle,
                    avatar: sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.from_handle}`,
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
                    .from('users')
                    .select('avatar_url')
                    .eq('handle', partnerHandle)
                    .single();

                return {
                    id: m.id,
                    partner: partnerHandle,
                    partnerAvatar: partner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerHandle}`,
                    date: new Date(m.created_at).toLocaleDateString('ru-RU'),
                    style: m.wedding_style
                };
            }));
            setMarriages(detailedMarriages);
        }
    };

    const login = async (userData) => {
        // userData в формате { handle, avatar, bio, fromScraper }
        const { data, error } = await supabase
            .from('users')
            .upsert({
                handle: userData.handle,
                avatar_url: userData.avatar,
                status: 'Свободен'
            }, { onConflict: 'handle' })
            .select()
            .single();

        if (error) {
            console.error('[Supabase] Login error:', error);
            // Fallback если что-то не так с БД
            setUser({
                handle: userData.handle,
                avatar: userData.avatar,
                silk: 100,
                role: 'Моногам',
                status: 'Свободен'
            });
        } else {
            setUser({
                handle: data.handle,
                avatar: data.avatar_url,
                silk: data.silk,
                role: data.role,
                status: data.status
            });
        }
        setCurrentScreen('dashboard');
    };

    const sendProposal = async (partnerData) => {
        // partnerData = { handle, avatar }

        // Сначала регистрируем партнера в базе, если его там нет (чтобы сработал Foreign Key)
        await supabase
            .from('users')
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
                .from('users')
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
            .from('users')
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
            login, updateUser
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
