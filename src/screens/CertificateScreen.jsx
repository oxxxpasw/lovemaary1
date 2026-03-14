import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Share, Check, Heart, Sparkles, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

const CertificateScreen = () => {
    const { user, activeWedding, setCurrentScreen, marriages } = useApp();
    const certificateRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const weddingData = activeWedding || (marriages.length > 0 ? marriages[0] : null);

    const proxyImage = (url) => {
        if (!url || url.includes('dicebear')) return url;
        // Используем встроенный прокси, чтобы обойти CORS при канвасировании и избежать блокировок wsrv.nl
        return `/api/get-avatar?proxy=1&url=${encodeURIComponent(url)}`;
    };

    const handleShare = async () => {
        if (!certificateRef.current) return;
        setIsExporting(true);

        try {
            const dataUrl = await toPng(certificateRef.current, {
                cacheBust: true,
                backgroundColor: '#050508',
                style: {
                    borderRadius: '0', // Full screen look for export
                }
            });

            // Проверяем мобильное устройство
            if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'threads-marriage.png', { type: 'image/png' });

                await navigator.share({
                    files: [file],
                    title: 'Наш союз в Threads',
                    text: `Мы с @${weddingData.partner} официально связаны в https://t.me/marrythreadsbot`
                });
            } else {
                // Скачивание на ПК
                download(dataUrl, `marriage-certificate-${weddingData.partner}.png`);
            }
        } catch (err) {
            console.error('Export failed', err);
            alert('Не удалось создать изображение. Попробуйте сделать скриншот.');
        } finally {
            setIsExporting(false);
        }
    };

    if (!weddingData) {
        return <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No wedding data found</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen"
            style={{
                background: 'var(--grad-main)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: '85px',
                paddingBottom: '6rem'
            }}
        >
            <div ref={certificateRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-deep)', padding: '10px 0' }}>
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    style={{
                        width: '90%',
                        maxWidth: '360px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(40px)',
                        borderRadius: '40px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '1.8rem 1.5rem',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: -20, left: -20, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(0, 242, 255, 0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                    <div style={{ position: 'absolute', bottom: -20, right: -20, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255, 45, 85, 0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Sparkles size={14} color="var(--accent-neon)" />
                            <span style={{ fontSize: '0.6rem', letterSpacing: '0.4em', fontWeight: '900', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Marriage Token</span>
                            <Sparkles size={14} color="var(--accent-hot)" />
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white', margin: 0, letterSpacing: '0.05em' }}>CERTIFICATE</h2>
                    </div>

                    {/* Avatars Side by Side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '22px', border: '2px solid var(--accent-neon)', overflow: 'hidden', padding: '2px', background: 'rgba(0,0,0,0.3)' }}>
                                <img crossOrigin="anonymous" src={proxyImage(user.avatar)} style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} />
                            </div>
                            <div style={{ position: 'absolute', top: -3, left: -3, width: '10px', height: '10px', background: 'var(--accent-neon)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-neon)' }} />
                        </div>

                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Heart size={24} fill="var(--accent-hot)" color="var(--accent-hot)" />
                        </motion.div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '22px', border: '2px solid var(--accent-hot)', overflow: 'hidden', padding: '2px', background: 'rgba(0,0,0,0.3)' }}>
                                <img crossOrigin="anonymous" src={proxyImage(weddingData.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${weddingData.partner}`)} style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} />
                            </div>
                            <div style={{ position: 'absolute', top: -3, right: -3, width: '10px', height: '10px', background: 'var(--accent-hot)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-hot)' }} />
                        </div>
                    </div>

                    {/* Main Text */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', width: '100%', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.8rem', opacity: 0.8 }}>Союз официально подтвержден в цифровом пространстве Threads</p>
                        <div style={{ fontSize: '1.4rem', fontWeight: '950', marginBottom: '0.8rem', lineHeight: 1.1, textTransform: 'uppercase' }}>
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
                    <div style={{ marginTop: 'auto', width: '100%', position: 'relative', zIndex: 1 }}>
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
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px', width: '90%', maxWidth: '360px' }}>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={isExporting}
                    onClick={handleShare}
                    className="btn-primary"
                    style={{ height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--grad-neon)', border: 'none', color: 'black', fontWeight: '900', fontSize: '1rem', position: 'relative' }}
                >
                    {isExporting ? <Loader2 className="animate-spin" size={24} /> : (
                        <>
                            <Share size={20} />
                            Поделиться в Threads
                        </>
                    )}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="btn-ghost"
                    style={{ height: '48px', borderRadius: '16px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem', fontWeight: '600' }}
                    onClick={() => setCurrentScreen('dashboard')}
                >
                    Вернуться в Часовню
                </motion.button>
            </div>

            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.7rem', opacity: 0.6 }}>Сохраните сертификат, чтобы поделиться им с миром</p>
        </motion.div >
    );
};

export default CertificateScreen;
