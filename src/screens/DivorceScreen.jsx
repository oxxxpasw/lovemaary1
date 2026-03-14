import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Share, Check, Download, Loader2, HeartCrack } from 'lucide-react';
import html2canvas from 'html2canvas';

const DivorceScreen = () => {
    const { user, setCurrentScreen } = useApp();
    const certificateRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isShared, setIsShared] = useState(false);

    const divorceId = `DIV-${user.handle.toUpperCase().substring(0, 3)}-${Math.floor(Math.random() * 10000)}`;

    const handleShare = async () => {
        if (!certificateRef.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(certificateRef.current, {
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#050508',
                scale: 2,
                proxy: '/api/get-avatar?proxy=1',
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

            if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'divorce.jpg', { type: 'image/jpeg' });
                await navigator.share({
                    files: [file],
                    title: 'Сертификат о разводе в Threads',
                    text: 'Всё кончено... Мой эксклюзивный развод в Threads! 💔 @marrythreads'
                });
                setIsShared(true);
            } else {
                const link = document.createElement('a');
                link.download = `divorce_${user.handle}.jpg`;
                link.href = dataUrl;
                link.click();
                setIsShared(true);
            }
        } catch (error) {
            console.error('Ошибка при экпорте:', error);
            alert('Ошибка при создании сертификата.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="screen certificate"
            style={{ paddingTop: '100px', paddingBottom: '7rem', paddingLeft: '1.2rem', paddingRight: '1.2rem', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: '900', color: '#ff2d55', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Свобода
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Ваш цифровой союз расторгнут.</p>
            </div>

            {/* Экспортируемая зона */}
            <div
                ref={certificateRef}
                style={{
                    position: 'relative',
                    background: '#050508',
                    padding: '1.5rem 1rem',
                    border: '1px solid rgba(255, 45, 85, 0.4)',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 15px 40px rgba(255, 45, 85, 0.12)',
                    marginBottom: '1.5rem'
                }}
            >
                {/* Фоновый шум/глитч (имитация) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at center, rgba(255,45,85,0.1) 0%, transparent 70%)',
                    opacity: 0.5, pointerEvents: 'none'
                }} />

                <HeartCrack size={56} color="#ff2d55" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(255,45,85,0.8))' }} />

                <h2 style={{ color: '#ff2d55', fontSize: '0.8rem', letterSpacing: '0.3em', textAlign: 'center', marginBottom: '0.5rem' }}>СЕРТИФИКАТ О РАЗВОДЕ</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.1em', marginBottom: '2rem' }}>ID: {divorceId}</div>

                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2rem' }}>
                    <div style={{
                        width: '100px', height: '100px',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: '2px solid #ff2d55',
                        background: '#111',
                        filter: 'grayscale(100%) contrast(1.2)'
                    }}>
                        <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                    </div>
                    {/* Анимация перечеркивания */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '120px',
                        height: '4px',
                        background: '#ff2d55',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        boxShadow: '0 0 10px #ff2d55'
                    }} />
                </div>

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>ОФИЦИАЛЬНО СВОБОДЕН(А)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'white', marginBottom: '1.5rem' }}>
                        @{user.handle}
                    </div>
                    <div style={{
                        padding: '10px 20px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: '#ff2d55',
                        letterSpacing: '0.1em'
                    }}>
                        СОЮЗ АННУЛИРОВАН
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '15px', fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
                    MARRYTHREADS.APP
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    disabled={isExporting}
                    style={{
                        width: '100%', height: '60px', borderRadius: '20px',
                        background: isShared ? 'rgba(255,255,255,0.1)' : '#ff2d55',
                        border: 'none', color: isShared ? 'white' : 'black',
                        fontSize: '1.1rem', fontWeight: '900',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                >
                    {isExporting ? <Loader2 className="animate-spin" size={24} /> :
                        isShared ? <><Check size={24} color="#10b981" /> Сохранено</> :
                            <><Share size={24} /> Поделиться драмой</>}
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentScreen('dashboard')}
                    className="btn-ghost"
                    style={{
                        width: '100%', height: '60px', borderRadius: '20px',
                        fontSize: '1.1rem', fontWeight: '700'
                    }}
                >
                    Вернуться в Паспорт
                </motion.button>
            </div>
        </motion.div>
    );
};

export default DivorceScreen;
