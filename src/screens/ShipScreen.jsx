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
                const { data: pA } = await supabase.from('profiles').select('avatar_url').eq('handle', s.partner_a).maybeSingle();
                const { data: pB } = await supabase.from('profiles').select('avatar_url').eq('handle', s.partner_b).maybeSingle();
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
            style={{ paddingTop: '85px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem', paddingTop: '1rem' }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentScreen('dashboard')}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '45px', height: '45px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div className="glass-panel card" style={{ flex: 1, margin: 0, padding: '1rem 1.5rem', background: 'rgba(0, 242, 255, 0.05)', border: '1px solid rgba(0, 242, 255, 0.1)' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>HOT <span className="text-gradient">SHIPS</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Самые горячие союзы сети Threads.</p>
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
                            className="cyber-card"
                            style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
                        >
                            {/* Ранг */}
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                background: index === 0 ? 'var(--accent-neon)' : index === 1 ? '# silver' : index === 2 ? '# cd7f32' : 'rgba(255,255,255,0.05)',
                                color: index < 3 ? 'black' : 'white',
                                padding: '4px 12px',
                                borderBottomRightRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: '900'
                            }}>
                                RANK #{index + 1}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div
                                            onClick={() => openPassport(ship.partner_a)}
                                            style={{ width: '50px', height: '50px', borderRadius: '15px', border: '2px solid var(--accent-neon)', overflow: 'hidden', cursor: 'pointer' }}
                                        >
                                            <img src={ship.avatar_a || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ship.partner_a}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ width: '20px', height: '2px', background: 'var(--accent-neon)', margin: '0 4px' }} />
                                        <div
                                            onClick={() => openPassport(ship.partner_b)}
                                            style={{ width: '50px', height: '50px', borderRadius: '15px', border: '2px solid var(--accent-neon)', overflow: 'hidden', cursor: 'pointer' }}
                                        >
                                            <img src={ship.avatar_b || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ship.partner_b}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1rem', letterSpacing: '-0.02em' }}>
                                            <span style={{ cursor: 'pointer' }} onClick={() => openPassport(ship.partner_a)}>@{ship.partner_a}</span> + <span style={{ cursor: 'pointer' }} onClick={() => openPassport(ship.partner_b)}>@{ship.partner_b}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ship.wedding_style}</div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-hot)' }}>
                                        🔥 {ship.hype_score}
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        disabled={votingId === ship.id}
                                        onClick={() => handleBoost(ship.id)}
                                        style={{
                                            background: 'rgba(255, 45, 85, 0.1)',
                                            border: '1px solid #ff2d55',
                                            color: '#ff2d55',
                                            padding: '6px 14px',
                                            borderRadius: '10px',
                                            fontSize: '0.7rem',
                                            fontWeight: '900',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        BOOST / ХАЙП
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ShipScreen;
