import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Share, Check, Heart, Sparkles } from 'lucide-react';

const CertificateScreen = () => {
    const { user, activeWedding, setCurrentScreen, marriages } = useApp();

    // Если активной свадьбы нет, берем последнюю из истории
    // Используем marriages[0] если activeWedding уже сброшен
    const weddingData = activeWedding || (marriages.length > 0 ? marriages[0] : null);

    if (!weddingData) {
        return <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No wedding data found</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="screen"
            style={{
                background: 'var(--grad-main)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 'calc(var(--safe-top) + 4rem)',
                paddingBottom: '2rem'
            }}
        >
            <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                style={{
                    width: '90%',
                    maxWidth: '360px',
                    minHeight: '480px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(40px)',
                    borderRadius: '44px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2.5rem 2rem',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.9)'
                }}
            >
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: -20, left: -20, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(0, 242, 255, 0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: -20, right: -20, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255, 45, 85, 0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Sparkles size={16} color="var(--accent-neon)" />
                        <span style={{ fontSize: '0.65rem', letterSpacing: '0.4em', fontWeight: '900', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Marriage Token</span>
                        <Sparkles size={16} color="var(--accent-hot)" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', margin: 0, letterSpacing: '0.05em' }}>CERTIFICATE</h2>
                </div>

                {/* Avatars Side by Side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '2.5rem', position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '28px', border: '2px solid var(--accent-neon)', overflow: 'hidden', padding: '2px', background: 'rgba(0,0,0,0.3)' }}>
                            <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover' }} />
                        </div>
                        <div style={{ position: 'absolute', top: -5, left: -5, width: '10px', height: '10px', background: 'var(--accent-neon)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-neon)' }} />
                    </div>

                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Heart size={28} fill="var(--accent-hot)" color="var(--accent-hot)" />
                    </motion.div>

                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '28px', border: '2px solid var(--accent-hot)', overflow: 'hidden', padding: '2px', background: 'rgba(0,0,0,0.3)' }}>
                            <img src={weddingData.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${weddingData.partner}`} style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover' }} />
                        </div>
                        <div style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: 'var(--accent-hot)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-hot)' }} />
                    </div>
                </div>

                {/* Main Text */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem', width: '100%' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.8 }}>Союз официально подтвержден в цифровом пространстве Threads</p>
                    <div style={{ fontSize: '1.6rem', fontWeight: '950', marginBottom: '1rem', lineHeight: 1.1, textTransform: 'uppercase' }}>
                        <span className="text-gradient">@{user.handle}</span>
                        <div style={{ fontSize: '0.8rem', opacity: 0.3, margin: '8px 0' }}>CONNECTED WITH</div>
                        <span style={{ color: 'var(--accent-hot)' }}>@{weddingData.partner}</span>
                    </div>
                    <div style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        background: 'rgba(0,242,255,0.05)',
                        border: '1px solid rgba(0,242,255,0.1)',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        color: 'var(--accent-neon)',
                        fontWeight: '800'
                    }}>
                        ВЕЧНОСТЬ: {weddingData.date}
                    </div>
                </div>

                {/* Seal & Footer */}
                <div style={{ marginTop: 'auto', width: '100%' }}>
                    <div style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: -20, left: -20, width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.1em' }}>Protocol Verification</div>
                        <div style={{ fontWeight: '900', fontSize: '0.9rem', color: 'var(--accent-neon)', fontFamily: 'monospace' }}>#{weddingData.id?.toString().substring(0, 8).toUpperCase() || Math.random().toString(36).substring(7).toUpperCase()}</div>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '12px', width: '90%', maxWidth: '360px' }}>
                <button
                    className="btn-primary"
                    style={{ height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'var(--grad-neon)', border: 'none', color: 'black', fontWeight: '900', fontSize: '1.1rem' }}
                >
                    <Share size={22} />
                    Опубликовать в Threads
                </button>
                <button
                    className="btn-ghost"
                    style={{ height: '56px', borderRadius: '18px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', fontSize: '0.9rem', fontWeight: '600' }}
                    onClick={() => setCurrentScreen('dashboard')}
                >
                    Вернуться в Часовню
                </button>
            </div>

            <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.7rem', opacity: 0.6 }}>Сохраните сертификат, чтобы поделиться им с друзьями</p>
        </motion.div>
    );
};

export default CertificateScreen;
