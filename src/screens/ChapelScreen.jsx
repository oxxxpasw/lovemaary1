import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Heart, Sparkles, Check } from 'lucide-react';

const ChapelScreen = () => {
    const { user, activeWedding, completeWedding } = useApp();
    const [stage, setStage] = useState('intro'); // intro, ritual, result

    useEffect(() => {
        const timer = setTimeout(() => setStage('ritual'), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen chapel"
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <AnimatePresence>
                {stage === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        style={{ textAlign: 'center' }}
                    >
                        <h1 style={{ fontSize: '1.2rem', letterSpacing: '0.3em', color: 'var(--accent-neon)' }}>ВХОД</h1>
                        <h2 style={{ fontSize: '2rem' }}>В ЧАСОВНЮ</h2>
                    </motion.div>
                )}

                {stage === 'ritual' && (
                    <motion.div
                        key="ritual"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ textAlign: 'center', width: '100%', padding: '2rem' }}
                    >
                        <motion.div
                            animate={{
                                boxShadow: ['0 0 20px #00f2ff', '0 0 60px #00f2ff', '0 0 20px #00f2ff'],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                width: '180px',
                                height: '180px',
                                borderRadius: '50%',
                                border: '2px solid var(--accent-neon)',
                                margin: '0 auto 2rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.05)'
                            }}
                        >
                            {activeWedding?.partnerAvatar ? (
                                <img src={activeWedding.partnerAvatar} alt="Partner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Heart size={80} color="white" fill="white" style={{ opacity: 0.2 }} />
                            )}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                style={{ position: 'absolute', inset: '-5px', borderRadius: '50%', border: '1px dashed var(--accent-neon)' }}
                            />
                        </motion.div>

                        <h2 style={{ marginBottom: '1rem' }}>Скрепление союза с <br /><span className="text-gradient">@{activeWedding?.partner}</span></h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Сквозь цифровую пустоту рождается новая связь.</p>

                        <button
                            className="btn-primary"
                            onClick={() => {
                                setStage('signing');
                                setTimeout(() => setStage('result'), 4000);
                            }}
                            style={{ width: '200px', fontSize: '1.2rem', padding: '15px' }}
                        >
                            СОГЛАСЕН(НА)
                        </button>
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
                        <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--grad-neon)' }} />

                            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '1.5rem' }}>ЦИФРОВОЙ КОНТРАКТ №{Math.floor(Math.random() * 100000)}</h3>

                            <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                <p>Настоящим подтверждается намерение сторон вступить в неизменный союз в сети Threads.</p>
                                <div style={{ margin: '1rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                                    <span>Сторона А: @{user?.handle}</span>
                                    <span>Сторона Б: @{activeWedding?.partner}</span>
                                </div>
                            </div>

                            {/* Signature Animation */}
                            <div style={{ position: 'relative', height: '100px', border: '1px dashed rgba(0,242,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                <svg width="200" height="60" viewBox="0 0 200 60">
                                    <motion.path
                                        d="M20,40 Q50,20 80,40 T140,30 Q160,50 180,20"
                                        fill="transparent"
                                        stroke="var(--accent-neon)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, delay: 0.5 }}
                                    />
                                </svg>
                                <motion.div
                                    initial={{ scale: 2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 2.5, type: 'spring' }}
                                    style={{
                                        position: 'absolute',
                                        right: '20px',
                                        bottom: '10px',
                                        padding: '4px 12px',
                                        border: '2px solid var(--accent-hot)',
                                        color: 'var(--accent-hot)',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        transform: 'rotate(-15deg)',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    SEALED
                                </motion.div>
                            </div>
                        </div>
                        <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--accent-neon)' }}
                        >
                            Внесение записи в блокчейн...
                        </motion.p>
                    </motion.div>
                )}

                {stage === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        style={{ textAlign: 'center', padding: '2rem' }}
                    >
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'var(--grad-neon)',
                            borderRadius: '50%',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'black'
                        }}>
                            <Check size={50} strokeWidth={3} />
                        </div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>СОЮЗ ЗАКЛЮЧЕН</h1>
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Запись внесена в Кибер-Реестр.</p>

                        <button
                            className="btn-ghost"
                            onClick={completeWedding}
                            style={{ marginTop: '2.5rem', width: '100%' }}
                        >
                            Открыть мой Паспорт <Sparkles size={16} style={{ marginLeft: '8px' }} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChapelScreen;
