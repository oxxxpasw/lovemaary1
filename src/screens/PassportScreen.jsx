import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Share2, ArrowLeft, Heart, Sparkles, XOctagon, History as HistoryIcon, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '../utils/supabase';

const PassportScreen = () => {
    const { user, marriages: myMarriages, divorce, viewingHandle, setViewingHandle, openPassport, setCurrentScreen, ensureSafeAvatar } = useApp();
    const [viewedUser, setViewedUser] = useState(null);
    const [viewedMarriages, setViewedMarriages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const isOwnPassport = !viewingHandle || viewingHandle === user?.handle;

    // Стабильный ID на основе хендла
    const getPseudoId = (handle) => `TH-${(handle || 'UNK').toUpperCase().substring(0, 3)}-${(handle || '').length}${Math.floor(Date.now() / 1000000)}`;
    const passportId = viewedUser ? getPseudoId(viewedUser.handle) : '---';

    useEffect(() => {
        if (!isOwnPassport) {
            loadOtherUserData(viewingHandle);
        } else {
            setViewedUser(user);
            setViewedMarriages(myMarriages);
        }
    }, [viewingHandle, user, myMarriages, isOwnPassport]); // Added dependencies

    const loadOtherUserData = async (handle) => {
        setIsLoading(true);
        try {
            // 1. Профиль
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .ilike('handle', handle)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                setViewedUser(null);
            } else if (profile) {
                setViewedUser({
                    handle: profile.handle,
                    avatar: ensureSafeAvatar(profile.avatar_url),
                    role: profile.role,
                    status: profile.status,
                    silk: profile.silk
                });
            }

            // 2. Браки
            const { data: marriageData, error: marriageError } = await supabase
                .from('marriages')
                .select('id, partner_a, partner_b, wedding_style, ring_id, hype_score, created_at')
                .or(`partner_a.eq.${handle},partner_b.eq.${handle}`);

            if (marriageError) {
                console.error('Error fetching marriages:', marriageError);
                setViewedMarriages([]);
            } else if (marriageData) {
                const seenPair = new Set();
                const uniqueMarriages = marriageData.filter(m => {
                    const pair = [m.partner_a, m.partner_b].sort().join(':');
                    if (seenPair.has(pair)) return false;
                    seenPair.add(pair);
                    return true;
                });

                const detailed = await Promise.all(uniqueMarriages.map(async (m) => {
                    const partnerHandle = m.partner_a === handle ? m.partner_b : m.partner_a;
                    const { data: partner, error: partnerError } = await supabase
                        .from('profiles')
                        .select('avatar_url')
                        .ilike('handle', partnerHandle)
                        .maybeSingle();

                    if (partnerError) console.error('Error fetching partner avatar:', partnerError);

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
                setViewedMarriages(detailed);
            }
        } catch (err) {
            console.error('Error loading passport:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const handle = searchQuery.trim().replace('@', '');
        if (handle) {
            openPassport(handle);
            setSearchQuery('');
        }
    };

    if (isLoading) return <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="animate-spin"><Sparkles size={32} color="var(--accent-neon)" /></div></div>;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="screen passport"
            style={{ paddingTop: '110px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            {/* Premium Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', position: 'relative', zIndex: 10 }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setViewingHandle(null); setCurrentScreen('dashboard'); }}
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
                    <h2 style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: '900', letterSpacing: '0.3rem', textTransform: 'uppercase', marginBottom: '4px' }}>Digital Passport</h2>
                    <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>
                        {isOwnPassport ? 'Личный профиль' : `@${viewingHandle}`}
                    </h1>
                </div>
            </div>

            {/* Futuristic Search Field */}
            <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '2.5rem', zIndex: 10 }}>
                <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={20} />
                <input
                    type="text"
                    placeholder="Найти профиль..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '20px 20px 20px 58px',
                        borderRadius: '24px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        outline: 'none',
                        transition: 'all 0.3s'
                    }}
                />
            </form>

            {!viewedUser && !isLoading ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                    <Search size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p>Пользователь не найден или еще не зарегистрирован.</p>
                </div>
            ) : (
                <>
                    {/* The Digital Card - Platinum Federation Style */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-panel"
                        style={{
                            padding: '2.5rem 2rem',
                            marginBottom: '3rem',
                            borderRadius: '40px',
                            background: 'linear-gradient(145deg, rgba(5, 10, 15, 0.98) 0%, rgba(10, 20, 30, 0.95) 100%)',
                            border: '1.5px solid rgba(0, 242, 255, 0.3)',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 20px rgba(0, 242, 255, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Decoration */}
                        <div style={{ position: 'absolute', right: '-30px', bottom: '-20px', opacity: 0.05, pointerEvents: 'none', color: 'var(--accent-neon)' }}>
                            <ShieldAlert size={220} />
                        </div>

                        {/* Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="animate-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-neon)', boxShadow: '0 0 15px var(--accent-neon)' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Threads ID System</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--accent-neon)', letterSpacing: '0.1em' }}>{passportId}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '30px', position: 'relative', zIndex: 2, alignItems: 'flex-start' }}>
                            {/* Avatar Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    style={{
                                        width: '120px', height: '120px', borderRadius: '35px', overflow: 'hidden',
                                        border: '2.5px solid var(--accent-neon)', padding: '2px', background: '#000',
                                        boxShadow: '0 0 30px rgba(0, 242, 255, 0.3)'
                                    }}
                                >
                                    <img src={viewedUser?.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '31px' }} />
                                </motion.div>
                                <div style={{
                                    background: 'rgba(0, 242, 255, 0.15)', color: 'var(--accent-neon)',
                                    fontSize: '0.65rem', fontWeight: '900', padding: '6px 18px',
                                    borderRadius: '12px', border: '1px solid rgba(0, 242, 255, 0.3)',
                                    textTransform: 'uppercase', letterSpacing: '0.15em'
                                }}>
                                    Verified Union
                                </div>
                            </div>

                            {/* Info Section */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px', fontWeight: '800' }}>Registry Handle</p>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'white', lineHeight: 1 }}>
                                        @{viewedUser?.handle}
                                    </h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px', fontWeight: '800' }}>Status</p>
                                        <p style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--accent-neon)' }}>{viewedUser?.status || 'Active'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px', fontWeight: '800' }}>Role</p>
                                        <p style={{ fontSize: '1rem', fontWeight: '900', color: 'white' }}>{viewedUser?.role}</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                                        <span style={{ fontSize: '0.65rem', color: 'white', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Security Level: Platinum</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Anniversary Log - Premium History Feed */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', paddingLeft: '5px' }}>
                            <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent-neon)' }}>
                                <HistoryIcon size={22} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'white' }}>Журнал союзов</h3>
                        </div>

                        {viewedMarriages.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign: 'center', opacity: 0.4, padding: '4rem 2rem', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Sparkles size={40} style={{ marginBottom: '1.5rem', opacity: 0.3, color: 'var(--accent-neon)', marginLeft: 'auto', marginRight: 'auto' }} />
                                <p style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Архивы пусты.</p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>Время создать историю.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {viewedMarriages.map((m, i) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => !isOwnPassport && openPassport(m.partner)}
                                        className="glass-panel"
                                        style={{
                                            padding: '2rem',
                                            borderRadius: '32px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: !isOwnPassport ? 'pointer' : 'default',
                                            border: '1.5px solid rgba(255, 255, 255, 0.08)',
                                            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                            boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{
                                                width: '60px', height: '60px', borderRadius: '20px',
                                                border: '2px solid var(--accent-neon)', overflow: 'hidden',
                                                padding: '1.5px', background: '#000',
                                                boxShadow: '0 0 15px rgba(0, 242, 255, 0.2)'
                                            }}>
                                                <img src={m.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.partner}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '17px' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '900', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.03em' }}>
                                                    @{m.partner}
                                                    {m.ring_id === 'diamond' && <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }}>💎</span>}
                                                    {m.ring_id === 'neon' && <span style={{ fontSize: '1.2rem' }}>🔥</span>}
                                                    {m.ring_id === 'basic' && <span style={{ fontSize: '1.2rem' }}>💍</span>}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                                                    {m.style} • <span style={{ color: 'var(--accent-hot)' }}>Hype {m.hype_score}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--accent-neon)', letterSpacing: '0.05em' }}>{m.date}</div>
                                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>Established</div>
                                            </div>

                                            {isOwnPassport && (
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Вы уверены, что хотите разорвать цифровой союз с @${m.partner}? Это действие необратимо.`)) {
                                                            divorce(m.id);
                                                        }
                                                    }}
                                                    style={{
                                                        width: '48px', height: '48px', borderRadius: '16px',
                                                        background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.2)',
                                                        color: '#ff2d55', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    <XOctagon size={20} />
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {isOwnPassport && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const shareUrl = `https://t.me/ThreadsMarryBot?start=${user.handle}`;
                                navigator.clipboard.writeText(shareUrl);
                                alert('Ссылка на ваш паспорт скопирована! Отправьте её друзьям в Threads или Telegram.');
                            }}
                            className="btn-primary"
                            style={{ width: '100%', height: '60px', borderRadius: '20px', marginTop: '2.5rem', background: 'var(--grad-neon)' }}
                        >
                            Поделиться профилем <Share2 size={18} style={{ marginLeft: '10px' }} />
                        </motion.button>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PassportScreen;
