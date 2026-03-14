import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Share2, ArrowLeft, Heart, Sparkles, XOctagon, History as HistoryIcon, Search } from 'lucide-react';
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
            style={{ paddingTop: '85px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.3em' }}>DIGITAL PASSPORT</h2>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-neon)', fontWeight: 'bold' }}>{passportId}</span>
                </div>

                {/* Поиск профиля */}
                <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Найти по @username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '15px',
                            padding: '12px 45px 12px 15px',
                            color: 'white',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--accent-neon)' }}>
                        <Search size={18} />
                    </button>
                </form>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setViewingHandle(null); setCurrentScreen('dashboard'); }}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.04em' }}>{isOwnPassport ? 'Личный профиль' : `Профиль @${viewingHandle}`}</h1>
                </div>
            </div>

            {!viewedUser && !isLoading ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                    <Search size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p>Пользователь не найден или еще не зарегистрирован.</p>
                </div>
            ) : (
                <>
                    {/* The Digital Card - Classic Federation Style */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="passport-card"
                        style={{
                            padding: '1.8rem 1.5rem',
                            marginBottom: '2.5rem',
                            borderRadius: '30px',
                            background: 'rgba(5, 10, 15, 0.8)',
                            border: '1px solid rgba(0, 242, 255, 0.2)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Heart Decoration */}
                        <div style={{ position: 'absolute', right: '-20px', bottom: '-10px', opacity: 0.1, pointerEvents: 'none' }}>
                            <Heart size={160} color="var(--accent-neon)" strokeWidth={1} />
                        </div>

                        {/* Top Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon)', boxShadow: '0 0 10px var(--accent-neon)' }} />
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>THREADS FEDERATION</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--accent-neon)', fontFamily: 'monospace' }}>{passportId}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '25px', position: 'relative', zIndex: 2 }}>
                            {/* Avatar Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '110px', height: '110px', borderRadius: '30px', overflow: 'hidden',
                                    border: '2px solid var(--accent-neon)', padding: '2px', background: 'black'
                                }}>
                                    <img src={viewedUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '26px' }} />
                                </div>
                                <div style={{
                                    background: 'var(--accent-neon)', color: 'black',
                                    fontSize: '0.65rem', fontWeight: '900', padding: '5px 15px',
                                    borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 242, 255, 0.3)',
                                    textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>
                                    VERIFIED
                                </div>
                            </div>

                            {/* Info Column */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>NAME / НИКНЕЙМ</p>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'white', margin: 0 }}>
                                        @{viewedUser.handle}
                                    </h3>
                                </div>

                                <div>
                                    <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>STATUS / СТАТУС</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-neon)', margin: 0 }}>{viewedUser.status || 'Active'}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '30px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>UNIONS / СОЮЗЫ</p>
                                        <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', margin: 0 }}>{viewedMarriages.length}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>EXP / СРОК</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white', margin: 0 }}>FOREVER</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Anniversary Log */}
                    <div style={{ position: 'relative' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                            <HistoryIcon size={22} color="var(--accent-neon)" /> Журнал союзов
                        </h3>

                        {viewedMarriages.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign: 'center', opacity: 0.3, padding: '3rem', borderRadius: '24px' }}>
                                <Sparkles size={32} style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--accent-neon)' }} />
                                <p style={{ fontSize: '0.9rem' }}>Ваш журнал пуст.<br />Время создать историю.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {viewedMarriages.map((m, i) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => !isOwnPassport && openPassport(m.partner)}
                                        className="glass-panel"
                                        style={{
                                            padding: '1.2rem',
                                            borderRadius: '20px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: !isOwnPassport ? 'pointer' : 'default',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1px solid var(--accent-neon)', overflow: 'hidden', padding: '1px' }}>
                                                <img src={m.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.partner}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '900', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '-0.02em' }}>
                                                    @{m.partner}
                                                    {m.ring_id === 'diamond' && <span style={{ fontSize: '1rem' }}>💎</span>}
                                                    {m.ring_id === 'neon' && <span style={{ fontSize: '1rem' }}>🔥</span>}
                                                    {m.ring_id === 'basic' && <span style={{ fontSize: '1rem' }}>💍</span>}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                                                    {m.style} • <span style={{ color: 'var(--accent-hot)' }}>Hype: {m.hype_score}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--accent-neon)' }}>{m.date}</div>
                                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: '800' }}>Confirmed</div>
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
                                                    style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)', padding: '10px', borderRadius: '15px', color: '#ff2d55', cursor: 'pointer' }}
                                                >
                                                    <XOctagon size={18} />
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
