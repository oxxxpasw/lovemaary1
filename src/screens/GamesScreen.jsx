import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Sparkles, Coins, HelpCircle } from 'lucide-react';

const GamesScreen = () => {
    const { user, updateUser } = useApp();
    const [isPlaying, setIsPlaying] = useState(false);
    const [result, setResult] = useState(null);

    const playCost = 10;

    const handlePlay = async () => {
        if (user.silk < playCost) return;

        setIsPlaying(true);
        setResult(null);

        // Списываем стоимость игры
        await updateUser({ silk: user.silk - playCost });

        // Имитация "Кручения" рулетки/слотов
        setTimeout(async () => {
            const roll = Math.random();
            let winAmount = 0;

            if (roll > 0.95) {
                winAmount = 100; // Джекпот 5%
            } else if (roll > 0.70) {
                winAmount = 25; // Выигрыш х2.5 25%
            } else if (roll > 0.50) {
                winAmount = 5; // Утешительный 20%
            } else {
                winAmount = 0; // Проигрыш 50%
            }

            if (winAmount > 0) {
                await updateUser({ silk: user.silk - playCost + winAmount });
            }

            setResult({ amount: winAmount });
            setIsPlaying(false);
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen games"
            style={{ paddingTop: '110px', paddingBottom: '7rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center' }}
        >
            <div className="hero-glow" style={{ top: '20%', background: 'radial-gradient(circle, rgba(255,45,85,0.2) 0%, rgba(5,5,8,0) 70%)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.04em' }}>Казино</h1>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Баланс</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-neon)' }}>{user.silk || 0} S</div>
                </div>
            </div>

            <motion.div
                className="glass-panel"
                style={{
                    padding: '2.5rem 1.5rem',
                    borderRadius: '32px',
                    border: '1px solid rgba(255, 45, 85, 0.25)',
                    background: 'linear-gradient(135deg, rgba(255, 45, 85, 0.05) 0%, rgba(5, 10, 15, 0.95) 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ marginBottom: '2rem' }}>
                    <motion.div
                        animate={isPlaying ? { rotateY: 360 * 5, scale: [1, 1.1, 1] } : {}}
                        transition={isPlaying ? { duration: 1.5, ease: "easeInOut" } : {}}
                        style={{
                            width: '90px', height: '90px', margin: '0 auto',
                            background: 'rgba(255,45,85,0.1)', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(255,45,85,0.3)'
                        }}
                    >
                        {isPlaying ? <HelpCircle size={45} color="var(--accent-hot)" /> : <Coins size={45} color="var(--accent-hot)" />}
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white' }}>Рулетка Silk</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Крути колесо судьбы. Шанс выиграть джекпот 100 Silk.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                            {result.amount > 0 ? (
                                <>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-neon)', marginBottom: '0.5rem' }}>+{result.amount} S</h2>
                                    <p style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem', marginBottom: '2rem' }}>Отличный куш!</p>
                                </>
                            ) : (
                                <>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Мимо :(</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '2rem' }}>В следующий раз повезет больше.</p>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={isPlaying || user.silk < playCost}
                    onClick={handlePlay}
                    className="btn-primary"
                    style={{
                        width: '100%', height: '56px', borderRadius: '18px', fontSize: '1.1rem',
                        background: user.silk < playCost ? 'var(--card-bg)' : 'var(--grad-hot)',
                        color: user.silk < playCost ? 'var(--text-muted)' : 'white'
                    }}
                >
                    {isPlaying ? 'КРУТИМ...' : `ИГРАТЬ (-${playCost} Silk)`}
                </motion.button>
            </motion.div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Таблица Выплат</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span style={{ color: 'white' }}>Джекпот (5%)</span>
                    <span style={{ color: 'var(--accent-neon)', fontWeight: 'bold' }}>100 Silk</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span style={{ color: 'white' }}>Удача (25%)</span>
                    <span style={{ color: 'var(--accent-hot)', fontWeight: 'bold' }}>25 Silk</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'white' }}>Утешение (20%)</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>5 Silk</span>
                </div>
            </div>

        </motion.div>
    );
};

export default GamesScreen;
