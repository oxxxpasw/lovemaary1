import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Heart, Globe, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

const FeedScreen = () => {
    const { user, openPassport, ensureSafeAvatar } = useApp();
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

                const seenPair = new Set();
                const uniqueMarriages = (marriages || []).filter(m => {
                    const pair = [m.partner_a, m.partner_b].sort().join(':');
                    if (seenPair.has(pair)) return false;
                    seenPair.add(pair);
                    return true;
                });

                const items = await Promise.all(uniqueMarriages.map(async m => {
                    const { data: pA } = await supabase.from('profiles').select('avatar_url').eq('handle', m.partner_a).maybeSingle();
                    const { data: pB } = await supabase.from('profiles').select('avatar_url').eq('handle', m.partner_b).maybeSingle();

                    return {
                        id: m.id,
                        type: 'marriage',
                        partners: [m.partner_a, m.partner_b],
                        avatar_a: ensureSafeAvatar(pA?.avatar_url),
                        avatar_b: ensureSafeAvatar(pB?.avatar_url),
                        date: new Date(m.created_at).toLocaleDateString('ru-RU'),
                        style: m.wedding_style || 'Classic'
                    };
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
            style={{ paddingTop: '85px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div
                                        onClick={() => openPassport(item.partners[0])}
                                        style={{ width: '45px', height: '45px', borderRadius: '15px', border: '2px solid var(--accent-neon)', overflow: 'hidden', cursor: 'pointer' }}
                                    >
                                        <img src={item.avatar_a || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.partners[0]}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar A" />
                                    </div>
                                    <div
                                        onClick={() => openPassport(item.partners[1])}
                                        style={{ width: '45px', height: '45px', borderRadius: '15px', border: '2px solid var(--accent-neon)', overflow: 'hidden', cursor: 'pointer' }}
                                    >
                                        <img src={item.avatar_b || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.partners[1]}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar B" />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        <span onClick={() => openPassport(item.partners[0])} style={{ cursor: 'pointer', color: 'var(--accent-neon)' }}>@{item.partners[0]}</span> +
                                        <span onClick={() => openPassport(item.partners[1])} style={{ cursor: 'pointer', color: 'var(--accent-neon)' }}> @{item.partners[1]}</span>
                                    </div>
                                    <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase' }}>{item.date}</div>
                                </div>
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
