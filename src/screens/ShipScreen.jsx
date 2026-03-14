import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Flame, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

const ShipScreen = () => {
    const { setCurrentScreen } = useApp();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                // Получаем топ пользователей по количеству браков
                // В текущей схеме нужно считать вхождения в таблицу marriages
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('handle, silk')
                    .order('silk', { ascending: false })
                    .limit(10);

                // Считаем количество браков для каждого
                const enrichedStats = await Promise.all(profiles.map(async p => {
                    const { count } = await supabase
                        .from('marriages')
                        .select('*', { count: 'exact', head: true })
                        .or(`partner_a.eq.${p.handle},partner_b.eq.${p.handle}`);

                    return {
                        handle: p.handle,
                        silk: p.silk,
                        marriages: count || 0,
                        rarity: count > 3 ? 'Legendary' : count > 1 ? 'Epic' : 'Rare'
                    };
                }));

                setStats(enrichedStats.sort((a, b) => b.marriages - a.marriages));
            } catch (e) {
                console.error('Error fetching rankings:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="screen ships"
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
                <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Топ <span className="text-gradient">Шипперов</span></h1>
            </div>

            <div className="glass-panel card" style={{ marginBottom: '1.5rem', background: 'rgba(0, 242, 255, 0.05)', border: '1px solid rgba(0, 242, 255, 0.1)' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--accent-neon)', fontWeight: '600' }}>
                    <Flame size={18} /> Реальный рейтинг на основе браков.
                </p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--accent-neon)" />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {stats.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="cyber-card"
                            style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px',
                                    background: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.05)',
                                    color: i < 3 ? 'black' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem'
                                }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>@{item.handle}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {item.rarity} • {item.silk} Silk
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-neon)', fontWeight: '900', fontSize: '1.2rem' }}>
                                    <TrendingUp size={16} /> {item.marriages}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '600' }}>БРАКОВ</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ShipScreen;
