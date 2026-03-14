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
            <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 10 }}>
                <h1 style={{ fontSize: '2.6rem', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>Мировая <span className="text-gradient" style={{ filter: 'drop-shadow(0 0 15px rgba(0, 242, 255, 0.3))' }}>Лента</span></h1>
                <p style={{ color: 'var(--accent-neon)', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '8px', opacity: 0.8 }}>Пульс цифрового Купидона</p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--accent-neon)" />
                </div>
            ) : feed.length === 0 ? (
                <div className="cyber-card" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Globe size={64} color="var(--accent-neon)" style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                    <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Пока нет союзов</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>Стань первым — отправь предложение!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {feed.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel"
                            style={{
                                padding: '2.5rem 2rem',
                                border: '1px solid rgba(0, 242, 255, 0.2)',
                                borderRadius: '35px',
                                background: 'linear-gradient(145deg, rgba(5, 10, 15, 0.9) 0%, rgba(10, 20, 30, 0.8) 100%)',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Background decoration */}
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, color: 'var(--accent-neon)' }}>
                                <Globe size={120} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => openPassport(item.partners[0])}
                                        style={{ width: 'clamp(56px, 16vw, 68px)', height: 'clamp(56px, 16vw, 68px)', borderRadius: '20px', border: '2.5px solid var(--accent-neon)', overflow: 'hidden', cursor: 'pointer', background: '#000', padding: '1.5px', boxShadow: '0 0 15px rgba(0, 242, 255, 0.2)', flexShrink: 0 }}
                                    >
                                        <img src={item.avatar_a} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '17px' }} alt="Avatar A" />
                                    </motion.div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '300', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>&</div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => openPassport(item.partners[1])}
                                        style={{ width: 'clamp(56px, 16vw, 68px)', height: 'clamp(56px, 16vw, 68px)', borderRadius: '20px', border: '2.5px solid var(--accent-hot)', overflow: 'hidden', cursor: 'pointer', background: '#000', padding: '1.5px', boxShadow: '0 0 15px rgba(255, 45, 85, 0.2)', flexShrink: 0 }}
                                    >
                                        <img src={item.avatar_b} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '17px' }} alt="Avatar B" />
                                    </motion.div>
                                </div>
                                <div style={{ textAlign: 'right', background: 'rgba(0, 242, 255, 0.05)', padding: '10px 15px', borderRadius: '18px', border: '1px solid rgba(0, 242, 255, 0.1)' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: '900', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '4px' }}>Создан</span>
                                    <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--accent-neon)', letterSpacing: '0.05em' }}>{item.date}</span>
                                </div>
                            </div>

                            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '18px',
                                    background: 'linear-gradient(135deg, rgba(255, 45, 85, 0.2), rgba(255, 45, 85, 0.05))',
                                    color: 'var(--accent-hot)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid rgba(255, 45, 85, 0.2)'
                                }}>
                                    <Heart size={26} fill="currentColor" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 className="truncate-text" style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'white', marginBottom: '4px' }}>
                                        @{item.partners[0]} <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>&</span> @{item.partners[1]}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                        <span className="truncate-text" style={{ fontSize: '0.65rem', color: 'var(--accent-neon)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {item.style} издание
                                        </span>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                                        <span className="truncate-text" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Официальный союз</span>
                                    </div>
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
