import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { AtSign, ArrowRight, Loader2 } from 'lucide-react';
import { performFileAuth } from '../utils/AuthManager';

const AuthScreen = () => {
    const { login } = useApp();
    const [handle, setHandle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (handle.trim()) {
            setIsLoading(true);
            setError('');
            const result = await performFileAuth(handle);
            if (result.success) {
                await login(result.data);
            } else {
                setError(result.error || 'Не удалось найти профиль Threads');
            }
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="screen auth-screen"
            style={{ paddingTop: '85px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
            <div className="glass-panel card" style={{ padding: '2.5rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Вход через <span className="text-gradient">Threads</span></h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Свяжите свою цифровую личность, чтобы начать путь виртуального союза.
                </p>

                {error && (
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: [-5, 5, -5, 5, 0] }}
                        style={{ color: '#ff4466', fontSize: '0.8rem', background: 'rgba(255, 68, 102, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(255, 68, 102, 0.2)' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <AtSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-neon)' }} />
                        <input
                            type="text"
                            placeholder="@никнейм_threads"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-glass)',
                                padding: '12px 12px 12px 40px',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? (
                            <>Поиск профиля... <Loader2 className="animate-spin" size={18} /></>
                        ) : (
                            <>Войти в Часовню <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>
            </div>

            <p style={{ position: 'fixed', bottom: '2rem', left: 0, right: 0, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                Входя, вы соглашаетесь с правилами цифровой моногамии.
            </p>
        </motion.div>
    );
};

export default AuthScreen;
