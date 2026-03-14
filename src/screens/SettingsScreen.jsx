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
                width: '56px', height: '30px',
                borderRadius: '15px',
                background: value ? 'rgba(0, 242, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${value ? 'rgba(0, 242, 255, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                padding: '3px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
            }}
        >
            <motion.div
                animate={{ x: value ? 26 : 0 }}
                style={{
                    width: '22px', height: '22px',
                    borderRadius: '11px',
                    background: value ? 'var(--accent-neon)' : 'rgba(255,255,255,0.4)',
                    boxShadow: value ? '0 0 15px var(--accent-neon)' : 'none',
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
            {/* ... previous header and profile card code is already there ... */}

            {/* Header and Profile card were already updated in previous step, so I'll just skip to the sections */}
            {/* Actually I need to re-include them because replace_file_content replaces the STRETCH of code */}

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Profile Section */}
                <div style={{ position: 'relative', zIndex: 5 }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3rem', marginBottom: '1.2rem', paddingLeft: '5px', fontWeight: '900' }}>
                        Профиль
                    </h3>
                    <div className="glass-panel" style={{ padding: '8px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <motion.div
                            whileTap={{ background: 'rgba(255,255,255,0.03)' }}
                            onClick={() => setShowRolePicker(!showRolePicker)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderRadius: '18px', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ color: 'var(--accent-neon)', background: 'rgba(0, 242, 255, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <Crown size={22} />
                                </div>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Цифровая Роль</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--accent-neon)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role || 'Моногам'}</span>
                                <ChevronRight size={18} style={{ opacity: 0.3 }} />
                            </div>
                        </motion.div>

                        {showRolePicker && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                style={{ padding: '5px 15px 15px', overflow: 'hidden' }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {roles.map(r => (
                                        <motion.button
                                            key={r}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => changeRole(r)}
                                            style={{
                                                padding: '12px 10px',
                                                borderRadius: '16px',
                                                border: user?.role === r ? '1px solid var(--accent-neon)' : '1px solid rgba(255,255,255,0.05)',
                                                fontSize: '0.75rem',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                cursor: 'pointer',
                                                background: user?.role === r ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                                                color: user?.role === r ? 'var(--accent-neon)' : 'rgba(255,255,255,0.6)',
                                                transition: 'all 0.2s'
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

                {/* Notifications Section */}
                <div style={{ position: 'relative', zIndex: 5 }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3rem', marginBottom: '1.2rem', paddingLeft: '5px', fontWeight: '900' }}>
                        Связь и Контроль
                    </h3>
                    <div className="glass-panel" style={{ padding: '8px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ color: 'var(--accent-hot)', background: 'rgba(255, 45, 85, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <Heart size={22} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>Предложения</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>Сигналы о новых чувствах</div>
                                </div>
                            </div>
                            <Toggle value={notifyProposals} onToggle={toggleNotifyProposals} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ color: 'var(--accent-neon)', background: 'rgba(0, 242, 255, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <Sparkles size={22} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>Свадьбы</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>Оповещения о финализации союзов</div>
                                </div>
                            </div>
                            <Toggle value={notifyMarriages} onToggle={toggleNotifyMarriages} />
                        </div>

                        {/* Telegram Status Card */}
                        <div style={{ padding: '5px' }}>
                            <div style={{
                                padding: '20px',
                                borderRadius: '20px',
                                background: telegramConnected ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0, 242, 255, 0.03)',
                                border: `1px solid ${telegramConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 242, 255, 0.1)'}`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: telegramConnected ? '#10b981' : 'var(--accent-neon)', boxShadow: `0 0 10px ${telegramConnected ? '#10b981' : 'var(--accent-neon)'}` }} />
                                        <span style={{ fontSize: '0.8rem', color: telegramConnected ? '#10b981' : 'var(--accent-neon)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {telegramConnected ? 'Telegram Bot Active' : 'Telegram Bot Offline'}
                                        </span>
                                    </div>
                                    {!telegramConnected && (
                                        <>
                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '18px', fontWeight: '600' }}>
                                                Активируйте систему мгновенных уведомлений через нашего официального бота.
                                            </p>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => window.open(`https://t.me/ThreadsMarryBot?start=${user?.handle}`, '_blank')}
                                                style={{
                                                    width: '100%', padding: '14px', borderRadius: '14px',
                                                    background: 'var(--accent-neon)', color: 'black', border: 'none',
                                                    fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer',
                                                    boxShadow: '0 10px 20px rgba(0, 242, 255, 0.3)'
                                                }}
                                            >
                                                ПОДКЛЮЧИТЬ СИСТЕМУ
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logout Button - Hot Accent */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => logout()}
                    style={{
                        width: '100%',
                        padding: '22px',
                        background: 'rgba(255, 45, 85, 0.05)',
                        border: '1.5px solid rgba(255, 45, 85, 0.15)',
                        borderRadius: '24px',
                        color: 'var(--accent-hot)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        fontWeight: '900',
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginTop: '1rem',
                        transition: 'all 0.3s'
                    }}
                >
                    <LogOut size={22} />
                    Деактивировать сессию
                </motion.button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem', opacity: 0.25 }}>
                <p style={{ fontSize: '0.7rem' }}>MarryThreads v1.0.5</p>
            </div>
        </motion.div>
    );
};

export default SettingsScreen;
