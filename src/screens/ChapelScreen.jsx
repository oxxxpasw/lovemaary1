import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Heart, Sparkles, Check } from 'lucide-react';

const ChapelScreen = () => {
    const { user, activeWedding, completeWedding } = useApp();
    const [stage, setStage] = useState('intro'); // intro, ritual, signing, result

    useEffect(() => {
        const timer = setTimeout(() => setStage('ritual'), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--bg-deep)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}
        >
            {/* Background Atmosphere */}
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0, 242, 255, 0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none' }} />

            <AnimatePresence mode="wait">
                {stage === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        style={{ textAlign: 'center' }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 90, 180, 270, 360] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            style={{ width: '100px', height: '100px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Sparkles size={40} color="var(--accent-neon)" />
                        </motion.div>
                        <h1 style={{ fontSize: '0.8rem', letterSpacing: '0.6em', color: 'rgba(255,255,255,0.4)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>Initiating Connection</h1>
                        <h2 className="glow-text" style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-0.04em' }}>ЧАСОВНЯ</h2>
                    </motion.div>
                )}

                {stage === 'ritual' && (
                    <motion.div
                        key="ritual"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ textAlign: 'center', width: '100%', padding: '2rem', zIndex: 1 }}
                    >
                        {/* Avatar Display - Premium Neon Case */}
                        <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 3rem' }}>
                            <motion.div
                                animate={{ boxShadow: ['0 0 40px rgba(0, 242, 255, 0.2)', '0 0 80px rgba(0, 242, 255, 0.4)', '0 0 40px rgba(0, 242, 255, 0.2)'] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '70px',
                                    border: '2px solid var(--accent-neon)',
                                    background: 'rgba(0,0,0,0.6)',
                                    overflow: 'hidden',
                                    padding: '5px'
                                }}
                            >
                                <img src={activeWedding?.partnerAvatar} alt="Partner" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '65px' }} />
                                {/* Overlay Gradient */}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />
                            </motion.div>

                            {/* Rotating Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    inset: '-15px',
                                    borderRadius: '85px',
                                    border: '1px solid rgba(0, 242, 255, 0.2)',
                                    borderStyle: 'dashed'
                                }}
                            />
                        </div>

                        <h2 className="glow-text" style={{ marginBottom: '1rem', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                            Принять союз с <br />
                            <span style={{ background: 'var(--grad-neon)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>@{activeWedding?.partner}</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3.5rem', fontSize: '1rem', fontWeight: '600' }}>Сквозь цифровую пустоту рождается новая связь.</p>

                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 242, 255, 0.5)' }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                            onClick={() => {
                                setStage('signing');
                                setTimeout(() => setStage('result'), 4000);
                            }}
                            style={{
                                width: '280px',
                                height: '70px',
                                fontSize: '1.2rem',
                                borderRadius: '25px',
                                background: 'var(--grad-neon)',
                                color: 'black',
                                border: 'none',
                                fontWeight: '900'
                            }}
                        >
                            СОГЛАСЕН(НА)
                        </motion.button>
                    </motion.div>
                )}

                {stage === 'signing' && (
                    <motion.div
                        key="signing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', width: '90%', maxWidth: '400px' }}
                    >
                        <div className="glass-panel" style={{ padding: '3rem 2.5rem', borderRadius: '40px', border: '1px solid rgba(0, 242, 255, 0.3)', position: 'relative', overflow: 'hidden' }}>
                            {/* Scanning effect */}
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: 'var(--accent-neon)', opacity: 0.4, zIndex: 2, filter: 'blur(4px)' }}
                            />

                            <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--accent-neon)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2rem' }}>ЦИФРОВОЙ КОНТРАКТ №{Math.floor(Math.random() * 900000 + 100000)}</h3>

                            <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: 1.6, color: 'white', opacity: 0.8, marginBottom: '2.5rem' }}>
                                <p>Настоящим подтверждается намерение сторон вступить в неизменный союз в сети Threads.</p>
                                <div style={{ margin: '1.5rem 0', height: '1px', background: 'rgba(0, 242, 255, 0.2)' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontWeight: '800' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>CORE:</span>
                                        <span>@{user?.handle}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>PARTNER:</span>
                                        <span style={{ color: 'var(--accent-neon)' }}>@{activeWedding?.partner}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ position: 'relative', height: '120px', border: '1px solid rgba(0, 242, 255, 0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                                <svg width="240" height="80" viewBox="0 0 240 80">
                                    <motion.path
                                        d="M30,50 Q70,20 110,50 T190,40 Q210,60 230,30"
                                        fill="transparent"
                                        stroke="var(--accent-neon)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0, filter: 'drop-shadow(0 0 0px var(--accent-neon))' }}
                                        animate={{ pathLength: 1, filter: 'drop-shadow(0 0 10px var(--accent-neon))' }}
                                        transition={{ duration: 3, delay: 0.5 }}
                                    />
                                </svg>
                                <motion.div
                                    initial={{ scale: 3, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 2.8, type: 'spring' }}
                                    style={{
                                        position: 'absolute',
                                        right: '20px',
                                        bottom: '15px',
                                        padding: '6px 15px',
                                        border: '3px solid var(--accent-hot)',
                                        color: 'var(--accent-hot)',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '900',
                                        transform: 'rotate(-12deg)',
                                        textTransform: 'uppercase',
                                        boxShadow: '0 0 15px rgba(255, 45, 85, 0.3)'
                                    }}
                                >
                                    VERIFIED
                                </motion.div>
                            </div>
                        </div>
                        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--accent-neon)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '900' }}>Запись в реестре...</p>
                    </motion.div>
                )}

                {stage === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ textAlign: 'center', padding: '2rem', zIndex: 1 }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            style={{
                                width: '100px',
                                height: '100px',
                                background: 'white', // Pure light
                                borderRadius: '35px',
                                margin: '0 auto 2.5rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'black',
                                boxShadow: '0 0 60px rgba(255,255,255,0.4)'
                            }}
                        >
                            <Check size={50} strokeWidth={3} />
                        </motion.div>
                        <h1 className="glow-text" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>УЗЕЛ ЗАТЯНУТ</h1>
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto 3rem', lineHeight: 1.5 }}>Ваш союз официально зафиксирован в блокчейне чувств.</p>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary"
                            onClick={completeWedding}
                            style={{
                                width: '100%',
                                height: '64px',
                                background: 'var(--grad-neon)',
                                color: 'black',
                                borderRadius: '18px',
                                fontWeight: '900',
                                fontSize: '1rem',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            ПОЛУЧИТЬ СЕРТИФИКАТ <Sparkles size={20} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChapelScreen;
