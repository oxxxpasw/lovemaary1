import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Heart, Search, User, BarChart3, Settings, Loader2, Sparkles } from 'lucide-react';
import { performFileAuth } from '../utils/AuthManager';

const Dashboard = () => {
    const {
        user, setUser, setCurrentScreen,
        sendProposal, receivedProposals, acceptProposal, rejectProposal,
        sentProposals, updateUser, logout
    } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [partnerHandle, setPartnerHandle] = useState('');
    const [isProposing, setIsProposing] = useState(false);
    const [showSentSuccess, setShowSentSuccess] = useState(false);

    const roles = ['Моногам', 'Серийный жених', 'Дикий шиппер', 'Хаос-друг', 'Призрачный партнер'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen dashboard"
            style={{ paddingTop: '85px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        >
            <div className="hero-glow" />
            <div className="hero-glow-secondary" />

            {/* Elegant Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '-5px' }}>Приветствую,</span>
                    <h1 className="text-gradient glow-text" style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
                        @{user.handle}
                    </h1>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    style={{
                        position: 'relative',
                        padding: '3px',
                        background: 'var(--grad-neon)',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 242, 255, 0.2)'
                    }}
                >
                    <div style={{ width: '52px', height: '52px', borderRadius: '18px', overflow: 'hidden', background: '#000' }}>
                        <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </motion.div>
            </div>

            {/* Central Control Hub */}
            <motion.div
                whileHover={{ y: -5 }}
                className="cyber-card"
                style={{ padding: '2rem', marginBottom: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
            >
                <div style={{ position: 'absolute', top: '-15%', right: '-10%', opacity: 0.05 }}>
                    <Heart size={180} fill="var(--accent-neon)" color="var(--accent-neon)" />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(0, 242, 255, 0.05)', border: '1px solid rgba(0, 242, 255, 0.1)', marginBottom: '1.5rem' }}>
                        <div className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                        <span style={{ fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.15em', color: 'var(--accent-neon)', textTransform: 'uppercase' }}>System Active</span>
                    </div>

                    <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {user.status || 'Свободен'}
                    </h2>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500', maxWidth: '80%', margin: '0 auto' }}>
                        {user.role} • Готов к новым цифровым связям
                    </p>
                </div>
            </motion.div>

            {/* Role Evolution Slider */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

            {/* Futuristic Search */}
            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'var(--grad-neon)', opacity: 0.05,
                    borderRadius: '24px', filter: 'blur(5px)'
                }} />
                <Search style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-neon)', opacity: 0.6 }} size={20} />
                <input
                    type="text"
                    placeholder="Найти вторую половину..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '18px 18px 18px 54px',
                        borderRadius: '24px',
                        color: 'white',
                        fontSize: '1rem',
                        position: 'relative',
                        zIndex: 1,
                        outline: 'none'
                    }}
                />
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
                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '1.2rem', paddingLeft: '5px' }}>
                        Входящие сигналы
                    </h3>
                    {receivedProposals.map(proposal => (
                        <motion.div
                            key={proposal.id}
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="cyber-card"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1.2rem', marginBottom: '1rem',
                                border: '1px solid rgba(255, 45, 85, 0.25)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ position: 'relative' }}>
                                    <img src={proposal.avatar} style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '12px', height: '12px', borderRadius: '50%', background: '#ff2d55', border: '2px solid #000' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>@{proposal.from}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ожидает согласия</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => rejectProposal(proposal.id)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</motion.button>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => acceptProposal(proposal)} style={{ padding: '0 20px', height: '40px', borderRadius: '12px', background: 'var(--grad-neon)', border: 'none', color: 'black', fontWeight: '900', fontSize: '0.85rem' }}>Принять</motion.button>
                            </div>
                        </motion.div>
                    ))}
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
                                onChange={(e) => setPartnerHandle(e.target.value)}
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

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <motion.button whileTap={{ scale: 0.95 }} className="btn-ghost" style={{ flex: 1, borderRadius: '18px', height: '56px' }} onClick={() => setShowProposalModal(false)}>Назад</motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '18px', height: '56px' }}
                                disabled={isProposing}
                                onClick={async () => {
                                    if (partnerHandle) {
                                        setIsProposing(true);
                                        const result = await performFileAuth(partnerHandle);
                                        sendProposal(result.data);
                                        setIsProposing(false);
                                        setShowProposalModal(false);
                                        setShowSentSuccess(true);
                                        setTimeout(() => setShowSentSuccess(false), 3000);
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
