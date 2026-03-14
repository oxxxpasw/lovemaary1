import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Award, History, Heart, Sparkles } from 'lucide-react';

const PassportScreen = () => {
    const { user, marriages, setCurrentScreen } = useApp();
    const passportId = `TH-${user.handle.toUpperCase().substring(0, 3)}-${Math.floor(Math.random() * 10000)}`;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="screen passport"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => setCurrentScreen('dashboard')} style={{ background: 'none', border: 'none', color: 'white' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Личный <span className="text-gradient">паспорт</span></h1>
            </div>

            {/* Passport ID Card */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="passport-card card"
                style={{ padding: '0', borderRadius: '24px', marginBottom: '2.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
                <div className="passport-pattern" />

                {/* ID Header */}
                <div style={{
                    padding: '1.2rem',
                    borderBottom: '1px solid rgba(0,242,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon)' }} />
                        <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>THREADS FEDERATION</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-neon)', fontWeight: 'bold' }}>{passportId}</span>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                    {/* Photo Side */}
                    <div style={{ position: 'relative' }}>
                        <div className="passport-glitch" style={{
                            width: '100px',
                            height: '110px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--accent-neon)',
                            background: '#000'
                        }}>
                            <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--accent-neon)',
                            color: 'black',
                            fontSize: '0.5rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                        }}>
                            VERIFIED
                        </div>
                    </div>

                    {/* Info Side */}
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '0.8rem' }}>
                            <label style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>NAME / НИКНЕЙМ</label>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>@{user.handle}</span>
                        </div>
                        <div style={{ marginBottom: '0.8rem' }}>
                            <label style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>STATUS / СТАТУС</label>
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-neon)' }}>{user.status}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>UNIONS / СОЮЗЫ</label>
                                <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{marriages.length}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>EXP / СРОК</label>
                                <span style={{ fontSize: '0.7rem' }}>FOREVER</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="passport-seal">
                    <Heart size={80} color="var(--accent-neon)" />
                </div>
            </motion.div>

            {/* Anniversary Log */}
            <div style={{ position: 'relative' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    <History size={20} color="var(--accent-neon)" /> Журнал записей
                </h3>

                {marriages.length === 0 ? (
                    <div className="glass-panel card" style={{ textAlign: 'center', opacity: 0.3, padding: '3rem' }}>
                        <Sparkles size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ fontSize: '0.9rem' }}>Ваш журнал пуст.<br />Время создать историю.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {marriages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel"
                                style={{ padding: '1.2rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                        <img src={m.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.partner}`} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>@{m.partner}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.style}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-neon)' }}>{m.date}</div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confirmed</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PassportScreen;
