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
                .eq('handle', handle)
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
                        .eq('handle', partnerHandle)
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => { setViewingHandle(null); setCurrentScreen('dashboard'); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>{isOwnPassport ? 'Личный паспорт' : `Паспорт @${viewingHandle}`}</h1>
                </div>
            </div>

            {!viewedUser && !isLoading ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                    <Search size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p>Пользователь не найден или еще не зарегистрирован.</p>
                </div>
            ) : (
                <>
                    {/* Passport ID Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="passport-card"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '30px',
                            padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '2.5rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                        }}
                    >
                        <div className="passport-pattern" />

                        {/* ID Header */}
                        <div style={{
                            padding: '1.2rem',
                            borderBottom: '1px solid rgba(0,242,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                                <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>THREADS FEDERATION</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-neon)', fontWeight: 'bold' }}>{passportId}</span>
                        </div>

                        {/* Header с кнопкой назад если это чужой паспорт */}
                        {!isOwnPassport && (
                            <motion.button
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                onClick={() => setViewingHandle(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px 15px',
                                    borderRadius: '12px',
                                    color: 'white',
                                    margin: '1rem 1.5rem 0',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Вернуться
                            </motion.button>
                        )}

                        <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                            {/* Photo Side */}
                            <div style={{ position: 'relative' }}>
                                <div className="passport-glitch" style={{
                                    width: '100px',
                                    height: '110px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--accent-neon)',
                                    background: '#000'
                                }}>
                                    <img src={viewedUser?.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'var(--accent-neon)',
                                    color: 'black',
                                    fontSize: '0.5rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}>
                                    VERIFIED
                                </div>
                            </div>

                            {/* Info Side */}
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '0.8rem' }}>
                                    <label style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>NAME / НИКНЕЙМ</label>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>@{viewedUser?.handle}</span>
                                </div>
                                <div style={{ marginBottom: '0.8rem' }}>
                                    <label style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>STATUS / СТАТУС</label>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-neon)' }}>{viewedUser?.status}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>UNIONS / СОЮЗЫ</label>
                                        <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{viewedMarriages.length}</span>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>EXP / СРОК</label>
                                        <span style={{ fontSize: '0.7rem' }}>FOREVER</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="passport-seal">
                            <Heart size={80} color="var(--accent-neon)" />
                        </div>
                    </motion.div>

                    {/* Anniversary Log */}
                    <div style={{ position: 'relative' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                            <HistoryIcon size={20} color="var(--accent-neon)" /> Журнал записей
                        </h3>

                        {viewedMarriages.length === 0 ? (
                            <div className="glass-panel card" style={{ textAlign: 'center', opacity: 0.3, padding: '3rem' }}>
                                <Sparkles size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
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
                                            borderRadius: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: !isOwnPassport ? 'pointer' : 'default'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                                <img src={m.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.partner}`} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    @{m.partner}
                                                    {m.ring_id === 'diamond' && <span style={{ fontSize: '0.8rem' }} title="Алмазное кольцо">💎</span>}
                                                    {m.ring_id === 'neon' && <span style={{ fontSize: '0.8rem' }} title="Неоновое кольцо">🔥</span>}
                                                    {m.ring_id === 'basic' && <span style={{ fontSize: '0.8rem' }} title="Обычное кольцо">💍</span>}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {m.style} • <span style={{ color: 'var(--accent-hot)' }}>🔥 {m.hype_score}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-neon)' }}>{m.date}</div>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confirmed</div>
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
                                                    style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)', padding: '8px', borderRadius: '12px', color: '#ff2d55', cursor: 'pointer' }}
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
                                navigator.clipboard.writeText(`https://marrythreads.app/passport/${user.handle}`);
                                alert('Ссылка на ваш паспорт скопирована!');
                            }}
                            className="btn-ghost"
                            style={{ width: '100%', height: '55px', borderRadius: '18px', marginTop: '2rem' }}
                        >
                            Поделиться профилем <Share2 size={16} style={{ marginLeft: '8px' }} />
                        </motion.button>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PassportScreen;
