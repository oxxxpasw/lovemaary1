import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Share2, ArrowLeft, Heart, Sparkles, XOctagon, History as HistoryIcon, Search, ShieldAlert, ShieldCheck, Loader2, Ghost } from 'lucide-react';
import { supabase } from '../utils/supabase';

const PassportScreen = () => {
    const { user, marriages: myMarriages, divorce, viewingHandle, setViewingHandle, openPassport, setCurrentScreen, ensureSafeAvatar, getPet, adoptPet, feedPet } = useApp();
    const [viewedUser, setViewedUser] = useState(null);
    const [viewedMarriages, setViewedMarriages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Pet State
    const [pet, setPet] = useState(null);
    const [loadingPet, setLoadingPet] = useState(true);
    const [isAdopting, setIsAdopting] = useState(false);
    const [isFeeding, setIsFeeding] = useState(false);

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

    useEffect(() => {
        const fetchPet = async () => {
            if (viewedMarriages.length > 0) {
                setLoadingPet(true);
                // Загружаем питомца для первого брака в списке
                const data = await getPet(viewedMarriages[0].id);
                setPet(data);
                setLoadingPet(false);
            } else {
                setPet(null);
                setLoadingPet(false);
            }
        };
        fetchPet();
    }, [viewedMarriages, getPet]);

    const handleAdoptPet = async () => {
        if (viewedMarriages.length === 0) return;
        setIsAdopting(true);
        const names = ['Нэо', 'Кибер', 'Спарк', 'Глюк', 'Пиксель', 'Зиро'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const result = await adoptPet(viewedMarriages[0].id, randomName);
        if (result.success) {
            setPet(result.pet);
        } else {
            alert(result.error || 'Ошибка при создании питомца.');
        }
        setIsAdopting(false);
    };

    const handleFeedPet = async () => {
        if (!pet) return;
        setIsFeeding(true);
        const result = await feedPet(pet.id, 20); // Стоит 20 Silk
        if (result.success) {
            setPet(prev => ({ ...prev, happiness: result.newHappiness, health: result.newHealth }));
            // Also deduct local silk just for UI snappiness if own passport
            if (isOwnPassport) {
                // The context handles deducting user silk internally
            }
        } else {
            alert(result.error || 'Ошибка');
        }
        setIsFeeding(false);
    };

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
            style={{ paddingTop: '110px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            {/* Premium Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', position: 'relative', zIndex: 10 }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setViewingHandle(null); setCurrentScreen('dashboard'); }}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        width: '52px', height: '52px',
                        borderRadius: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: '900', letterSpacing: '0.3rem', textTransform: 'uppercase', marginBottom: '4px' }}>Digital Passport</h2>
                    <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>
                        {isOwnPassport ? 'Личный профиль' : `@${viewingHandle}`}
                    </h1>
                </div>
            </div>

            {/* Futuristic Search Field */}
            <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '2.5rem', zIndex: 10 }}>
                <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={20} />
                <input
                    type="text"
                    placeholder="Найти профиль..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '20px 20px 20px 58px',
                        borderRadius: '24px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        outline: 'none',
                        transition: 'all 0.3s'
                    }}
                />
            </form>

            {!viewedUser && !isLoading ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                    <Search size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p>Пользователь не найден или еще не зарегистрирован.</p>
                </div>
            ) : (
                <>
                    {/* The Digital Card - Platinum Federation Style */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-panel"
                        style={{
                            padding: '1.5rem',
                            marginBottom: '2.5rem',
                            borderRadius: '32px',
                            background: 'linear-gradient(145deg, rgba(5, 10, 15, 0.98) 0%, rgba(10, 20, 30, 0.95) 100%)',
                            border: '1.5px solid rgba(0, 242, 255, 0.25)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 20px rgba(0, 242, 255, 0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '260px'
                        }}
                    >
                        {/* Background Decoration */}
                        <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.03, pointerEvents: 'none', color: 'var(--accent-neon)' }}>
                            <Heart size={280} fill="currentColor" />
                        </div>

                        {/* Card Header Area */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="glow-active" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                                <span style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>ID SYSTEM</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--accent-neon)', letterSpacing: '0.1em', opacity: 0.8 }}>{passportId}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(80px, 25vw, 100px) 1fr', gap: '15px', position: 'relative', zIndex: 2 }}>
                            {/* Avatar Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        width: 'clamp(80px, 25vw, 100px)', height: 'clamp(80px, 25vw, 100px)', borderRadius: '24px', overflow: 'hidden',
                                        border: '2px solid rgba(0, 242, 255, 0.4)', padding: '2px', background: '#000'
                                    }}
                                >
                                    <img src={viewedUser?.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }} />
                                </motion.div>
                                <div style={{
                                    background: 'rgba(0, 242, 255, 0.08)', color: 'var(--accent-neon)',
                                    fontSize: '0.55rem', fontWeight: '900', padding: '5px 0', width: '100%',
                                    textAlign: 'center', borderRadius: '10px', border: '1px solid rgba(0, 242, 255, 0.2)',
                                    textTransform: 'uppercase', letterSpacing: '0.1em'
                                }}>
                                    VERIFIED
                                </div>
                            </div>

                            {/* Data Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', justifyContent: 'center', overflow: 'hidden' }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px', fontWeight: '800' }}>Registry Handle</p>
                                    <h3 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontWeight: '900', letterSpacing: '-0.02em', color: 'white', wordBreak: 'break-all' }}>
                                        @{viewedUser?.handle}
                                    </h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px', fontWeight: '800' }}>Статус</p>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--accent-neon)', wordBreak: 'break-word', lineHeight: 1.2 }}>{viewedUser?.status || 'Active'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px', fontWeight: '800' }}>Роль</p>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '900', color: 'white', wordBreak: 'break-word', lineHeight: 1.2 }}>{viewedUser?.role}</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '5px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Heart size={12} color="var(--accent-neon)" opacity={0.6} />
                                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Защита: Платиновый уровень</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* TAMAGOTCHI PET INTEGRATION */}
                    {viewedMarriages.length > 0 && isOwnPassport && (
                        <div style={{ width: '100%', marginBottom: '2.5rem', zIndex: 2 }}>
                            {!loadingPet && (
                                pet ? (
                                    <div className="glass-panel" style={{ border: '1px solid rgba(255,45,85,0.2)', padding: '20px', textAlign: 'center', boxShadow: '0 10px 20px rgba(255,45,85,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,85,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'var(--accent-hot)' }}>
                                                <Ghost size={24} />
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>КИБЕР-ПИТОМЕЦ</div>
                                                <div style={{ fontSize: '1.2rem', color: 'white', fontWeight: '900', letterSpacing: '-0.02em' }}>{pet.name}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
                                            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '14px' }}>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '800' }}>Счастье</div>
                                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pet.happiness}%`, height: '100%', background: pet.happiness > 50 ? 'var(--accent-neon)' : 'var(--accent-hot)', transition: 'width 0.5s', boxShadow: '0 0 10px var(--accent-neon)' }} />
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'white', marginTop: '6px', fontWeight: 'bold' }}>{pet.happiness}%</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleFeedPet}
                                            disabled={isFeeding}
                                            style={{
                                                width: '100%', padding: '14px', borderRadius: '16px',
                                                background: 'var(--accent-hot)', color: 'white', border: 'none',
                                                fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer',
                                                boxShadow: '0 5px 15px rgba(255,45,85,0.3)'
                                            }}
                                        >
                                            {isFeeding ? <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto' }} /> : 'ПОКОРМИТЬ (-20 Silk)'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAdoptPet}
                                        disabled={isAdopting}
                                        style={{
                                            width: '100%', padding: '20px', borderRadius: '24px',
                                            background: 'rgba(255,255,255,0.02)', border: '1.5px dashed rgba(255,45,85,0.3)',
                                            color: 'var(--accent-hot)', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer',
                                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {isAdopting ? <Loader2 size={24} className="animate-spin" /> : (
                                            <>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(255,45,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Ghost size={24} />
                                                </div>
                                                ЗАВЕСТИ СЕМЕЙНОГО ПИТОМЦА
                                            </>
                                        )}
                                    </button>
                                )
                            )}
                        </div>
                    )}

                    {/* Anniversary Log - Premium History Feed */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', paddingLeft: '5px' }}>
                            <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent-neon)' }}>
                                <HistoryIcon size={22} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'white' }}>Журнал союзов</h3>
                        </div>

                        {viewedMarriages.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign: 'center', opacity: 0.4, padding: '4rem 2rem', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Sparkles size={40} style={{ marginBottom: '1.5rem', opacity: 0.3, color: 'var(--accent-neon)', marginLeft: 'auto', marginRight: 'auto' }} />
                                <p style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Архивы пусты.</p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>Время создать историю.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {viewedMarriages.map((m, i) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => !isOwnPassport && openPassport(m.partner)}
                                        className="glass-panel"
                                        style={{
                                            padding: '2rem',
                                            borderRadius: '32px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: !isOwnPassport ? 'pointer' : 'default',
                                            border: '1.5px solid rgba(255, 255, 255, 0.08)',
                                            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                            boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{
                                                width: '60px', height: '60px', borderRadius: '20px',
                                                border: '2px solid var(--accent-neon)', overflow: 'hidden',
                                                padding: '1.5px', background: '#000',
                                                boxShadow: '0 0 15px rgba(0, 242, 255, 0.2)'
                                            }}>
                                                <img src={m.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.partner}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '17px' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '900', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.03em' }}>
                                                    @{m.partner}
                                                    {m.ring_id === 'diamond' && <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }}>💎</span>}
                                                    {m.ring_id === 'neon' && <span style={{ fontSize: '1.2rem' }}>🔥</span>}
                                                    {m.ring_id === 'basic' && <span style={{ fontSize: '1.2rem' }}>💍</span>}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                                                    {m.style} • <span style={{ color: 'var(--accent-hot)' }}>Hype {m.hype_score}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--accent-neon)', letterSpacing: '0.05em' }}>{m.date}</div>
                                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>Создан</div>
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
                                                    style={{
                                                        width: '48px', height: '48px', borderRadius: '16px',
                                                        background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.2)',
                                                        color: '#ff2d55', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    <XOctagon size={20} />
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
