import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Heart, Globe, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

const FeedScreen = () => {
    const { user } = useApp();
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const { data: marriages } = await supabase
                    .from('marriages')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                const items = (marriages || []).map(m => ({
                    id: m.id,
                    type: 'marriage',
                    partners: [m.partner_a, m.partner_b],
                    date: new Date(m.created_at).toLocaleDateString('ru-RU'),
                    style: m.wedding_style || 'Classic'
                }));

                setFeed(items);
            } catch (e) {
                console.error('Feed fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen"
        >
            <div style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Мировая <span className="text-gradient">Лента</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Пульс цифрового Купидона</p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--accent-neon)" />
                </div>
            ) : feed.length === 0 ? (
                <div className="cyber-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Globe size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '600' }}>Пока нет союзов</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.6 }}>Стань первым — отправь предложение!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {feed.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="cyber-card"
                            style={{ padding: '1.5rem', border: '1px solid rgba(0, 242, 255, 0.15)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>
                                        Заключен союз
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.date}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>@{item.partners[0]}</span>
                                <Heart size={18} fill="var(--accent-neon)" color="var(--accent-neon)" />
                                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>@{item.partners[1]}</span>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <Globe size={14} opacity={0.5} />
                                <span>Стиль: <b>{item.style}</b></span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default FeedScreen;
