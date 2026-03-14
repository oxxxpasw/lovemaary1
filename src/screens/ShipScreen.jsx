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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentScreen('dashboard')}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.04em' }}>Platinum <span className="text-gradient">Ships</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>Элита цифровых союзов</p>
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><div className="animate-spin"><Sparkles size={32} /></div></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {topShips.map((ship, index) => (
                        <motion.div
                            key={ship.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel"
                            style={{
                                padding: '1.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '25px',
                                background: index < 3 ? 'rgba(0, 242, 255, 0.03)' : 'var(--bg-panel)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '1.5rem', fontWeight: '900', color: index < 3 ? 'var(--accent-neon)' : 'rgba(255,255,255,0.2)',
                                        width: '40px', textAlign: 'center'
                                    }}>
                                        #{index + 1}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', border: '2px solid var(--accent-neon)', overflow: 'hidden', zIndex: 2, background: '#000' }}>
                                            <img src={ship.avatar_a} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', border: '2px solid var(--accent-hot)', overflow: 'hidden', marginLeft: '-15px', zIndex: 1, background: '#000' }}>
                                            <img src={ship.avatar_b} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                                            @{ship.partner_a} <span style={{ color: 'rgba(255,255,255,0.3)' }}>&</span> @{ship.partner_b}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Level: Platinum {ship.wedding_style}
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleBoost(ship.id)}
                                    disabled={votingId === ship.id}
                                    style={{
                                        background: 'rgba(255, 45, 85, 0.1)',
                                        border: '1px solid rgba(255, 45, 85, 0.3)',
                                        padding: '10px 15px',
                                        borderRadius: '16px',
                                        color: 'var(--accent-hot)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {votingId === ship.id ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <Flame size={16} fill="currentColor" />
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
