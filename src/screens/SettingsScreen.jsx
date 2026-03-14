import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ArrowLeft, User, LogOut, Bell, BellOff, ChevronRight, Heart, Sparkles, Crown } from 'lucide-react';
import { supabase } from '../utils/supabase';

const SettingsScreen = () => {
    const { setCurrentScreen, logout, user, updateUser } = useApp();

    // Настройки уведомлений
    const [notifyProposals, setNotifyProposals] = useState(true);
    const [notifyMarriages, setNotifyMarriages] = useState(true);
    const [telegramConnected, setTelegramConnected] = useState(false);
    const [showRolePicker, setShowRolePicker] = useState(false);

    const roles = ['Моногам', 'Полиамор', 'Серийный женатик', 'Купидон', 'Сводник'];

    useEffect(() => {
        const loadSettings = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('profiles')
                .select('telegram_id, notify_proposals, notify_marriages')
                .eq('handle', user.handle)
                .maybeSingle();

            if (data) {
                setNotifyProposals(data.notify_proposals !== false);
                setNotifyMarriages(data.notify_marriages !== false);
                setTelegramConnected(!!data.telegram_id);
            }
        };
        loadSettings();
    }, [user]);

    // Сохраняем telegram_id при первом входе через TG
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg && user) {
            const tgUser = tg.initDataUnsafe?.user;
            if (tgUser?.id) {
                supabase
                    .from('profiles')
                    .update({ telegram_id: tgUser.id })
                    .eq('handle', user.handle)
                    .then(() => setTelegramConnected(true));
            }
        }
    }, [user]);

    const toggleNotifyProposals = async () => {
        const newVal = !notifyProposals;
        setNotifyProposals(newVal);
        await supabase
            .from('profiles')
            .update({ notify_proposals: newVal })
            .eq('handle', user.handle);
    };

    const toggleNotifyMarriages = async () => {
        const newVal = !notifyMarriages;
        setNotifyMarriages(newVal);
        await supabase
            .from('profiles')
            .update({ notify_marriages: newVal })
            .eq('handle', user.handle);
    };

    const changeRole = async (newRole) => {
        await updateUser({ role: newRole });
        setShowRolePicker(false);
    };

    const Toggle = ({ value, onToggle }) => (
        <div
            onClick={onToggle}
            style={{
                width: '48px', height: '28px',
                borderRadius: '14px',
                background: value ? 'var(--accent-neon)' : 'rgba(255,255,255,0.1)',
                padding: '3px',
                cursor: 'pointer',
                transition: 'background 0.2s ease, justify-content 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: value ? 'flex-end' : 'flex-start'
            }}
        >
            <div
                style={{
                    width: '22px', height: '22px',
                    borderRadius: '11px',
                    background: 'white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s ease',
                    transform: value ? 'translateX(0)' : 'translateX(0)'
                }}
            />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="screen"
            style={{ paddingTop: '85px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingTop: '1rem' }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentScreen('dashboard')}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0 }}>Настройки</h1>
            </div>

            {/* User Card */}
            {user && (
                <div className="cyber-card" style={{ padding: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '20px', overflow: 'hidden', border: '2px solid var(--accent-neon)', flexShrink: 0 }}>
                        <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>@{user.handle}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.status || 'Свободен'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-neon)' }}>{user.silk}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Silk</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Роль */}
                <div>
                    <h3 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.8rem', paddingLeft: '5px' }}>
                        Профиль
                    </h3>
                    <div className="cyber-card" style={{ padding: '5px' }}>
                        <motion.div
                            whileTap={{ background: 'rgba(255,255,255,0.05)' }}
                            onClick={() => setShowRolePicker(!showRolePicker)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 15px', borderRadius: '15px', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Crown size={20} color="var(--accent-neon)" />
                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Роль</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--accent-neon)', fontWeight: '700' }}>{user?.role || 'Моногам'}</span>
                                <ChevronRight size={16} color="var(--text-muted)" style={{ opacity: 0.3 }} />
                            </div>
                        </motion.div>

                        {showRolePicker && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                style={{ padding: '0 15px 15px', overflow: 'hidden' }}
                            >
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {roles.map(r => (
                                        <motion.button
                                            key={r}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => changeRole(r)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: 'none',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                background: user?.role === r ? 'var(--grad-neon)' : 'rgba(255,255,255,0.05)',
                                                color: user?.role === r ? 'black' : 'white'
                                            }}
                                        >
                                            {r}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Уведомления */}
                <div>
                    <h3 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.8rem', paddingLeft: '5px' }}>
                        Уведомления
                    </h3>
                    <div className="cyber-card" style={{ padding: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 15px', borderRadius: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Heart size={20} color="var(--accent-hot)" />
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Предложения</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Когда кто-то шлет сигнал</div>
                                </div>
                            </div>
                            <Toggle value={notifyProposals} onToggle={toggleNotifyProposals} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 15px', borderRadius: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Sparkles size={20} color="#a855f7" />
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Свадьбы</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Когда союз оформлен</div>
                                </div>
                            </div>
                            <Toggle value={notifyMarriages} onToggle={toggleNotifyMarriages} />
                        </div>

                        {!telegramConnected && (
                            <div style={{ padding: '12px 15px', borderRadius: '15px', background: 'rgba(255, 45, 85, 0.05)', margin: '5px', border: '1px solid rgba(255,45,85,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <BellOff size={16} color="var(--accent-hot)" />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Откройте приложение через Telegram для активации уведомлений
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Выход */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => logout()}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: 'rgba(255, 45, 85, 0.08)',
                        border: '1px solid rgba(255, 45, 85, 0.15)',
                        borderRadius: '20px',
                        color: '#ff2d55',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        marginTop: '0.5rem'
                    }}
                >
                    <LogOut size={20} />
                    Выйти из аккаунта
                </motion.button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem', opacity: 0.25 }}>
                <p style={{ fontSize: '0.7rem' }}>MarryThreads v1.0.5</p>
            </div>
        </motion.div>
    );
};

export default SettingsScreen;
