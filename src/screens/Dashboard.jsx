import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Heart, User, BarChart3, Settings, Loader2, Sparkles, X } from 'lucide-react';
import { performFileAuth } from '../utils/AuthManager';

const Dashboard = () => {
    const {
        user, setUser, setCurrentScreen,
        sendProposal, receivedProposals, acceptProposal, rejectProposal,
        sentProposals, updateUser, logout, ensureSafeAvatar
    } = useApp();
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [partnerHandle, setPartnerHandle] = useState('');
    const [isProposing, setIsProposing] = useState(false);
    const [showSentSuccess, setShowSentSuccess] = useState(false);
    const [selectedRing, setSelectedRing] = useState('basic');
    const [proposalError, setProposalError] = useState('');

    const ringOptions = [
        { id: 'basic', name: 'Базовое', price: 0, color: '#fff' },
        { id: 'diamond', name: 'Алмазное', price: 300, color: '#00f2ff' },
        { id: 'neon', name: 'Неоновое', price: 500, color: '#ff2d55' }
    ];

    const roles = ['Моногам', 'Серийный жених', 'Дикий шиппер', 'Хаос-друг', 'Призрачный партнер'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen dashboard"
            style={{ paddingTop: '110px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            <div className="hero-glow" />
            <div className="hero-glow-secondary" />

            {/* Elegant Header with larger avatar and badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-neon)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px', opacity: 0.8 }}>Элитный статус</span>
                    <h1 className="text-gradient truncate-text" style={{ fontSize: 'clamp(1.8rem, 7vw, 2.4rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1 }}>
                        @{user.handle}
                    </h1>
                </div>
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    style={{
                        position: 'relative', flexShrink: 0,
                        padding: '3px',
                        background: 'linear-gradient(135deg, var(--accent-neon), var(--accent-hot))',
                        borderRadius: '20px',
                        boxShadow: '0 0 20px rgba(0, 242, 255, 0.3)'
                    }}
                >
                    <div style={{ width: '56px', height: '56px', borderRadius: '17px', overflow: 'hidden', background: '#000', padding: '1px' }}>
                        <img src={ensureSafeAvatar(user.avatar)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                    </div>
                </motion.div>
            </div>

            {/* Futuristic Central Hub */}
            <motion.div
                whileHover={{ y: -4 }}
                className="glass-panel"
                style={{
                    padding: '2rem 1.5rem',
                    marginBottom: '2.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(0, 242, 255, 0.25)',
                    background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.05) 0%, rgba(5, 10, 15, 0.95) 100%)',
                    borderRadius: '32px',
                    boxShadow: '0 20px 40px rgba(0, 242, 255, 0.1)'
                }}
            >
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05, color: 'var(--accent-neon)', pointerEvents: 'none' }}>
                    <Heart size={200} fill="currentColor" />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(0, 242, 255, 0.08)', border: '1px solid rgba(0, 242, 255, 0.2)', marginBottom: '1.5rem' }}>
                        <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.2em', color: 'var(--accent-neon)', textTransform: 'uppercase' }}>Верифицирован</span>
                    </div>

                    <h2 className="glow-text" style={{
                        fontSize: 'clamp(1.5rem, 8vw, 2.4rem)',
                        fontWeight: '900',
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        wordBreak: 'break-word',
                        padding: '0 10px'
                    }}>
                        {user.status || 'Свободен'}
                    </h2>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                        <div style={{ height: '1px', width: '20px', background: 'rgba(255,255,255,0.1)' }} />
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {user.role}
                        </p>
                        <div style={{ height: '1px', width: '20px', background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                </div>
            </motion.div>

            {/* Role Evolution Slider */}
            <div style={{ marginBottom: '2.5rem', width: '100%', overflow: 'hidden' }}>
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    padding: '5px 0 15px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                    width: '100%'
                }}>
                    {roles.map(role => (
                        <button
                            key={role}
                            onClick={() => updateUser({ role })}
                            className={`role-chip ${user.role === role ? 'active' : 'inactive'}`}
                            style={{ flexShrink: 0 }}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>



            {/* Actions Grid - Refined */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                <motion.div
                    whileTap={{ scale: 0.96 }}
                    className="cyber-card"
                    style={{ textAlign: 'center', cursor: 'pointer', padding: '1.8rem', borderRadius: '30px', border: '1px solid rgba(255, 45, 85, 0.15)' }}
                    onClick={() => setShowProposalModal(true)}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255, 45, 85, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}
                    >
                        <Heart size={26} fill="#ff2d55" color="#ff2d55" />
                    </motion.div>
                    <p style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.01em' }}>Предложение</p>
                </motion.div>

                <motion.div
                    whileTap={{ scale: 0.96 }}
                    className="cyber-card"
                    style={{ textAlign: 'center', cursor: 'pointer', padding: '1.8rem', borderRadius: '30px', border: '1px solid rgba(0, 242, 255, 0.15)' }}
                    onClick={() => setCurrentScreen('passport')}
                >
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(0, 242, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                        <User size={26} color="var(--accent-neon)" />
                    </div>
                    <p style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.01em' }}>Паспорт</p>
                </motion.div>
            </div>

            {/* Received Proposals - Cinematic Overlay */}
            {receivedProposals.length > 0 && (
                <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 5 }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--accent-neon)', textTransform: 'uppercase', letterSpacing: '0.25rem', marginBottom: '1.5rem', textAlign: 'center', opacity: 0.8 }}>
                        Входящие сигналы
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {receivedProposals.map(proposal => (
                            <motion.div
                                key={proposal.id}
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="glass-panel"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1.8rem', borderRadius: '35px',
                                    border: '1px solid rgba(255, 45, 85, 0.3)',
                                    background: 'linear-gradient(135deg, rgba(255, 45, 85, 0.05) 0%, rgba(5, 10, 15, 0.98) 100%)',
                                    boxShadow: '0 20px 40px rgba(255, 45, 85, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Decorative Heart in background */}
                                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, color: 'var(--accent-hot)', pointerEvents: 'none' }}>
                                    <Heart size={80} fill="currentColor" />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 2 }}>
                                    <motion.div whileHover={{ scale: 1.05 }} style={{ position: 'relative' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '22px', border: '2px solid var(--accent-hot)', overflow: 'hidden', background: '#000', padding: '1.5px', boxShadow: '0 0 15px rgba(255, 45, 85, 0.2)' }}>
                                            <img src={proposal.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '19px' }} />
                                        </div>
                                        <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--accent-neon)', boxShadow: '0 0 15px var(--accent-neon)', border: '2.5px solid #050508' }} />
                                    </motion.div>
                                    <div>
                                        <div style={{ fontWeight: '900', fontSize: '1.3rem', letterSpacing: '-0.03em', color: 'white' }}>@{proposal.from}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--accent-neon)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>Requesting Union</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 2 }}>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => rejectProposal(proposal.id)}
                                        style={{
                                            width: '52px', height: '52px', borderRadius: '18px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'rgba(255,255,255,0.6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        <X size={22} />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => acceptProposal(proposal)}
                                        style={{
                                            padding: '0 28px',
                                            height: '52px',
                                            borderRadius: '18px',
                                            background: 'var(--accent-hot)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '900',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            boxShadow: '0 10px 25px rgba(255, 45, 85, 0.4)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ПРИНЯТЬ
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sent Proposals Status */}
            {sentProposals.length > 0 && (
                <div style={{ marginBottom: '3rem', padding: '0 5px' }}>
                    <h3 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Исходящие</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {sentProposals.map(p => (
                            <div key={p.id} className="glass-panel" style={{ padding: '10px 18px', borderRadius: '18px', fontSize: '0.8rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                <div className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                                <span style={{ fontWeight: '600' }}>@{p.handle}</span>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Ожидание...</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Proposal Modal - Ultra Premium */}
            {showProposalModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(5, 5, 8, 0.92)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="cyber-card"
                        style={{ width: '100%', maxWidth: '400px', padding: '3rem 2.5rem' }}
                    >
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255, 45, 85, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                            <Heart size={32} fill="#ff2d55" color="#ff2d55" />
                        </div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '0.8rem', letterSpacing: '-0.04em' }}>Найти <span className="text-gradient">пару</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>Свяжите свои Threads-профили в нерушимый цифровой союз.</p>

                        <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                            <input
                                type="text"
                                placeholder="@username"
                                value={partnerHandle}
                                onChange={(e) => { setPartnerHandle(e.target.value); setProposalError(''); }}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '20px',
                                    borderRadius: '20px',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '1.2rem',
                                    fontWeight: '700'
                                }}
                            />
                        </div>

                        {/* Выбор кольца */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Кольцо (Символ вашего союза):</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--accent-neon)', fontWeight: 'bold' }}>Ваш баланс: {user?.silk || 0} Silk</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {ringOptions.map(ring => {
                                    const userSilk = Number(user?.silk) || 0;
                                    const canAfford = userSilk >= ring.price || ring.price === 0;
                                    const isSelected = selectedRing === ring.id;
                                    return (
                                        <div
                                            key={ring.id}
                                            onClick={() => { if (canAfford) setSelectedRing(ring.id) }}
                                            style={{
                                                flex: 1,
                                                padding: '12px 5px',
                                                borderRadius: '16px',
                                                border: `1px solid ${isSelected ? ring.color : 'rgba(255,255,255,0.1)'}`,
                                                background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                textAlign: 'center',
                                                cursor: canAfford ? 'pointer' : 'not-allowed',
                                                opacity: canAfford ? 1 : 0.4,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: isSelected ? ring.color : 'white' }}>{ring.name}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {ring.price === 0 ? 'Бесплатно' : `${ring.price} Silk`}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {proposalError && (
                            <div style={{ color: '#ff2d55', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(255,45,85,0.1)', padding: '10px', borderRadius: '12px' }}>
                                {proposalError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <motion.button whileTap={{ scale: 0.95 }} className="btn-ghost" style={{ flex: 1, borderRadius: '18px', height: '56px' }} onClick={() => setShowProposalModal(false)}>Назад</motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '18px', height: '56px' }}
                                disabled={isProposing}
                                onClick={async () => {
                                    if (partnerHandle) {
                                        setProposalError('');
                                        setIsProposing(true);
                                        const result = await performFileAuth(partnerHandle);

                                        const ring = ringOptions.find(r => r.id === selectedRing);
                                        if (ring.price > 0 && user.silk < ring.price) {
                                            setProposalError('Недостаточно Silk для этого кольца.');
                                            setIsProposing(false);
                                            return;
                                        }

                                        const sendResult = await sendProposal({ ...result.data, ringId: selectedRing });

                                        setIsProposing(false);

                                        if (sendResult.success) {
                                            // Списываем Silk за кольцо
                                            if (ring.price > 0) {
                                                await updateUser({ silk: user.silk - ring.price });
                                            }
                                            setShowProposalModal(false);
                                            setShowSentSuccess(true);
                                            setPartnerHandle('');
                                            setSelectedRing('basic');
                                            setTimeout(() => setShowSentSuccess(false), 3000);
                                        } else {
                                            setProposalError(sendResult.error || 'Ошибка при отправке.');
                                        }
                                    }
                                }}
                            >
                                {isProposing ? <Loader2 className="animate-spin" size={24} /> : 'Пригласить'}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Success Toast */}
            <AnimatePresence>
                {showSentSuccess && (
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '7rem',
                            left: '2rem',
                            right: '2rem',
                            background: 'var(--grad-neon)',
                            padding: '18px',
                            borderRadius: '22px',
                            boxShadow: '0 15px 40px rgba(0, 242, 255, 0.4)',
                            zIndex: 2000
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'black' }}>
                            <Sparkles size={20} />
                            <span style={{ fontWeight: '900', fontSize: '0.95rem', letterSpacing: '0.02em' }}>СИГНАЛ В THREADS ОТПРАВЛЕН</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;
