import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Flame, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabase';

const ShipScreen = () => {
    const { user, boostHype, openPassport, ensureSafeAvatar, setCurrentScreen } = useApp();
    const [topShips, setTopShips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [votingId, setVotingId] = useState(null);

    useEffect(() => {
        fetchTopShips();
    }, []);

    const fetchTopShips = async () => {
        setIsLoading(true);
        // Получаем браки с самым высоким hype_score
        const { data: ships, error } = await supabase
            .from('marriages')
            .select(`
                id,
                partner_a,
                partner_b,
                wedding_style,
                hype_score,
                created_at
            `)
            .order('hype_score', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching ships:', error);
        } else if (ships) {
            // Фильтр дубликатов по парам
            const seenPair = new Set();
            const uniqueShips = ships.filter(s => {
                const pair = [s.partner_a, s.partner_b].sort().join(':');
                if (seenPair.has(pair)) return false;
                seenPair.add(pair);
                return true;
            });

            const enriched = await Promise.all(uniqueShips.map(async (s) => {
                const { data: pA } = await supabase.from('profiles').select('avatar_url').ilike('handle', s.partner_a).maybeSingle();
                const { data: pB } = await supabase.from('profiles').select('avatar_url').ilike('handle', s.partner_b).maybeSingle();
                return {
                    ...s,
                    avatar_a: ensureSafeAvatar(pA?.avatar_url),
                    avatar_b: ensureSafeAvatar(pB?.avatar_url)
                };
            }));
            setTopShips(enriched);
        }
        setIsLoading(false);
    };

    const handleBoost = async (id) => {
        setVotingId(id);
        const res = await boostHype(id);
        if (res.success) {
            // Обновляем локально
            setTopShips(prev => prev.map(s => s.id === id ? { ...s, hype_score: (s.hype_score || 0) + 1 } : s).sort((a, b) => b.hype_score - a.hype_score));
        } else {
            alert(res.error);
        }
        setVotingId(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="screen ships"
            style={{ paddingTop: '110px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            {/* Header with improved alignment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', position: 'relative', zIndex: 10 }}>
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
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1, margin: 0 }}>
                        Platinum <span className="text-gradient" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 242, 255, 0.3))' }}>Ships</span>
                    </h1>
                    <p style={{ color: 'var(--accent-neon)', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '6px', opacity: 0.8 }}>Элита цифровых союзов</p>
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--accent-neon)" />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {topShips.map((ship, index) => (
                        <motion.div
                            key={ship.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel"
                            style={{
                                padding: '1.8rem',
                                border: '1px solid rgba(0, 242, 255, 0.15)',
                                borderRadius: '30px',
                                background: index < 3
                                    ? 'linear-gradient(135deg, rgba(0, 242, 255, 0.08) 0%, rgba(5, 10, 15, 0.95) 100%)'
                                    : 'rgba(5, 10, 15, 0.8)',
                                boxShadow: index < 3 ? '0 20px 40px rgba(0, 242, 255, 0.1)' : '0 15px 30px rgba(0,0,0,0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Decorative Rank background */}
                            <div style={{
                                position: 'absolute', right: '-10px', top: '-10px',
                                fontSize: '6rem', fontWeight: '900', color: 'var(--accent-neon)',
                                opacity: 0.03, pointerEvents: 'none'
                            }}>
                                #{index + 1}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr auto', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 2 }}>
                                {/* Rank */}
                                <div style={{
                                    fontSize: '1.2rem', fontWeight: '900',
                                    color: index < 3 ? 'var(--accent-neon)' : 'rgba(255,255,255,0.3)',
                                    width: '45px', height: '45px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: index < 3 ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${index < 3 ? 'rgba(0, 242, 255, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                                    flexShrink: 0
                                }}>
                                    #{index + 1}
                                </div>

                                {/* Content */}
                                <div style={{ minWidth: 0 }}>
                                    <div className="truncate-text" style={{ fontWeight: '900', fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em' }}>
                                        @{ship.partner_a} <span style={{ opacity: 0.3, fontWeight: '400' }}>&</span> @{ship.partner_b}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-neon)', flexShrink: 0 }} />
                                        <span className="truncate-text" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {ship.wedding_style || 'Cyber Union'}
                                        </span>
                                    </div>
                                </div>

                                {/* Vote Action */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleBoost(ship.id)}
                                    disabled={votingId === ship.id}
                                    style={{
                                        background: 'linear-gradient(to bottom, rgba(255, 45, 85, 0.15), rgba(255, 45, 85, 0.05))',
                                        border: '1px solid rgba(255, 45, 85, 0.4)',
                                        padding: '10px 15px',
                                        borderRadius: '18px',
                                        color: 'var(--accent-hot)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '2px',
                                        cursor: 'pointer',
                                        minWidth: '65px',
                                        backdropFilter: 'blur(5px)',
                                        flexShrink: 0
                                    }}
                                >
                                    {votingId === ship.id ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <Flame size={18} fill="currentColor" />
                                    )}
                                    <span style={{ fontWeight: '900', fontSize: '1rem' }}>{ship.hype_score || 0}</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ShipScreen;
