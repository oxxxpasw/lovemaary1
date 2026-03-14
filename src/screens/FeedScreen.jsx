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
                    const { data: pA } = await supabase.from('profiles').select('avatar_url').ilike('handle', m.partner_a).maybeSingle();
                    const { data: pB } = await supabase.from('profiles').select('avatar_url').ilike('handle', m.partner_b).maybeSingle();

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
            style={{ paddingTop: '110px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.04em' }}>Мировая <span className="text-gradient">Лента</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px' }}>Пульс цифрового Купидона</p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {feed.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel"
                            style={{ padding: '2rem 1.5rem', border: '1px solid rgba(0, 242, 255, 0.15)', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div
                                        onClick={() => openPassport(item.partners[0])}
                                        style={{ width: '60px', height: '60px', borderRadius: '20px', border: '2px solid var(--accent-neon)', overflow: 'hidden', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', padding: '1.5px', boxShadow: '0 0 15px rgba(0, 242, 255, 0.2)' }}
                                    >
                                        <img src={item.avatar_a} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} alt="Avatar A" />
                                    </div>
                                    <div
                                        onClick={() => openPassport(item.partners[1])}
                                        style={{ width: '60px', height: '60px', borderRadius: '20px', border: '2px solid var(--accent-hot)', overflow: 'hidden', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', padding: '1.5px', boxShadow: '0 0 15px rgba(255, 45, 85, 0.2)' }}
                                    >
                                        <img src={item.avatar_b} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} alt="Avatar B" />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block' }}>Wedding Date</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-neon)' }}>{item.date}</span>
                                </div>
                            </div>

                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-hot)' }}>
                                    <Heart size={20} fill="currentColor" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'white' }}>
                                        @{item.partners[0]} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', fontSize: '0.9rem' }}>&</span> @{item.partners[1]}
                                    </h3>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                                        Стиль союза: <span style={{ color: 'white' }}>{item.style}</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default FeedScreen;
