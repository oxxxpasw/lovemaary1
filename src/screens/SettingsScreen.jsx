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
            style={{ paddingTop: '110px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            {/* Premium Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', position: 'relative', zIndex: 10 }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentScreen('dashboard')}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        width: '52px', height: '52px',
                        borderRadius: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '0.65rem', color: 'var(--accent-neon)', fontWeight: '900', letterSpacing: '0.3rem', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.8 }}>System Core</h2>
                    <h1 className="text-gradient glow-text" style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>Настройки</h1>
                </div>
            </div>

            {/* User Profile Summary Card */}
            {user && (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-panel"
                    style={{
                        padding: '1.8rem',
                        marginBottom: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        borderRadius: '32px',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(5, 10, 15, 0.95) 100%)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.03, color: 'var(--accent-neon)', pointerEvents: 'none' }}>
                        <User size={120} />
                    </div>

                    <div style={{
                        width: '72px', height: '72px', borderRadius: '22px',
                        border: '2px solid var(--accent-neon)', padding: '2px',
                        background: '#000', flexShrink: 0,
                        boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)'
                    }}>
                        <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
                        <div style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-0.03em', color: 'white' }}>@{user.handle}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user.status || 'Свободен'}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', position: 'relative', zIndex: 2 }}>
                        <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '900' }}>{user.silk}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>Silk Crystal</div>
                    </div>
                </motion.div>
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

                        {!telegramConnected ? (
                            <div style={{ padding: '15px', borderRadius: '15px', background: 'rgba(0, 242, 255, 0.05)', margin: '5px', border: '1px solid rgba(0, 242, 255, 0.1)' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--accent-neon)', marginBottom: '4px' }}>Бот не подключен</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                        Подключите нашего бота, чтобы получать мгновенные уведомления о предложениях и свадьбах.
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.open(`https://t.me/ThreadsMarryBot?start=${user.handle}`, '_blank')}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        background: 'var(--accent-neon)', color: 'black', border: 'none',
                                        fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer'
                                    }}
                                >
                                    ПОДКЛЮЧИТЬ БОТА
                                </motion.button>
                            </div>
                        ) : (
                            <div style={{ padding: '12px 15px', borderRadius: '15px', background: 'rgba(16, 185, 129, 0.05)', margin: '5px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '800' }}>
                                        Telegram Bot подключен
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
