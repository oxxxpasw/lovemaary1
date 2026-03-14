import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Flame, TrendingUp } from 'lucide-react';

const ShipScreen = () => {
    const { setCurrentScreen } = useApp();

    const mockShips = [
        { pair: ['@lexa_dev', '@sarah_ux'], score: 1250, rarity: 'Epic' },
        { pair: ['@meme_lord', '@chaos_cat'], score: 980, rarity: 'Legendary' },
        { pair: ['@dev_anon', '@ghost_ui'], score: 850, rarity: 'Rare' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="screen ships"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => setCurrentScreen('dashboard')} style={{ background: 'none', border: 'none', color: 'white' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Горячие <span className="text-gradient">Шипы</span></h1>
            </div>

            <div className="glass-panel card" style={{ marginBottom: '1.5rem', background: 'rgba(255, 45, 85, 0.1)', border: '1px solid rgba(255, 45, 85, 0.3)' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Flame size={18} color="#ff2d55" /> Самые популярные союзы этой недели.
                </p>
            </div>

            {mockShips.map((ship, i) => (
                <div key={i} className="glass-panel card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{ship.pair[0]} + {ship.pair[1]}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Союз уровня: {ship.rarity}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-neon)' }}>
                                <TrendingUp size={14} /> {ship.score}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Очки шиппинга</div>
                        </div>
                    </div>
                </div>
            ))}

            <button className="btn-ghost" style={{ width: '100%', marginTop: '1rem' }}>
                Забустить союз (50 Шёлка)
            </button>
        </motion.div>
    );
};

export default ShipScreen;
