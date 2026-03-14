import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Heart, Sparkles, Download, Loader2, ShieldCheck, ChevronLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import download from 'downloadjs';

const CertificateScreen = () => {
    const { user, activeWedding, setCurrentScreen, marriages, ensureSafeAvatar } = useApp();
    const certificateRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const weddingData = activeWedding || (marriages.length > 0 ? marriages[0] : null);

    const proxyImage = (url) => {
        if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`;
        if (url.includes('/api/get-avatar') || url.includes('dicebear')) return url;
        return ensureSafeAvatar(url);
    };

    const handleShare = async () => {
        if (!certificateRef.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(certificateRef.current, {
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#050508',
                scale: 3,
                logging: false,
                windowWidth: 1200,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('[data-certificate-container]');
                    if (el) {
                        el.style.width = '600px';
                        el.style.padding = '4rem 3rem';
                        el.style.borderRadius = '60px';
                    }
                }
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (navigator.share && isMobile) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'threads-union.png', { type: 'image/png' });

                try {
                    await navigator.share({
                        files: [file],
                        title: 'Threads Bond',
                        text: `Official digital union verified via https://t.me/marrythreadsbot`
                    });
                } catch (shareErr) {
                    download(dataUrl, `threads-marriage-certificate.png`);
                }
            } else {
                download(dataUrl, `threads-marriage-certificate.png`);
            }
        } catch (err) {
            console.error('Export failed', err);
            alert('Не удалось скачать изображение. Сделайте скриншот вручную.');
        } finally {
            setIsExporting(false);
        }
    };

    if (!weddingData) {
        return (
            <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <p style={{ opacity: 0.5 }}>Данные союза не найдены</p>
                <button className="btn-secondary" onClick={() => setCurrentScreen('dashboard')}>Вернуться</button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="screen"
            style={{
                background: '#0a0a0f',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '15px',
                paddingBottom: '20px',
                overflowY: 'auto'
            }}
        >
            {/* BACK BUTTON */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentScreen('dashboard')}
                style={{
                    position: 'absolute', top: '15px', left: '15px',
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 10
                }}
            >
                <ChevronLeft size={20} />
            </motion.button>

            {/* PREVIEW CONTAINER (Scaled for mobile) */}
            <div ref={certificateRef} style={{
                width: '100%',
                padding: '10px 15px',
                background: '#050508',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div
                    data-certificate-container
                    style={{
                        width: '100%',
                        maxWidth: '360px',
                        background: '#000',
                        borderRadius: '45px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '2rem 1.5rem 1.5rem',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
                    }}
                >
                    {/* Background Decor */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <rect width="100%" height="100%" fill="radial-gradient(circle at 50% 0%, rgba(0, 242, 255, 0.1), transparent)" />
                        </svg>
                    </div>

                    {/* SHIMMER */}
                    <motion.div
                        animate={{ left: ['-150%', '300%'] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                        style={{ position: 'absolute', top: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)', transform: 'skewX(-30deg)', pointerEvents: 'none' }}
                    />

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', zIndex: 2 }}>
                        <div style={{ fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Permanent Digital Bond
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'white', margin: 0, letterSpacing: '-0.02em', fontStyle: 'italic' }}>CERTIFICATE</h1>
                        <div style={{ width: '40px', height: '2px', background: 'var(--accent-neon)', margin: '10px auto 0' }} />
                    </div>

                    {/* AVATARS */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '2rem', zIndex: 2 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '85px', height: '85px', borderRadius: '32px', background: '#111', border: '1px solid rgba(255,255,255,0.15)', padding: '5px' }}>
                                <img crossOrigin="anonymous" src={proxyImage(user.avatar)} style={{ width: '100%', height: '100%', borderRadius: '27px', objectFit: 'cover' }} />
                            </div>
                            <div style={{ position: 'absolute', top: '-8px', left: '-8px', background: 'white', color: 'black', padding: '4px 8px', borderRadius: '8px', fontSize: '0.55rem', fontWeight: '900' }}>@YOU</div>
                        </div>

                        <div style={{ margin: '0 -10px', zIndex: 3, width: '36px', height: '36px', background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Heart size={18} fill="var(--accent-hot)" color="var(--accent-hot)" />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '85px', height: '85px', borderRadius: '32px', background: '#111', border: '1px solid rgba(255,255,255,0.15)', padding: '5px' }}>
                                <img crossOrigin="anonymous" src={proxyImage(weddingData.partnerAvatar)} style={{ width: '100%', height: '100%', borderRadius: '27px', objectFit: 'cover' }} />
                            </div>
                            <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-neon)', color: 'black', padding: '4px 8px', borderRadius: '8px', fontSize: '0.55rem', fontWeight: '900' }}>@LOVE</div>
                        </div>
                    </div>

                    {/* Proclamation */}
                    <div style={{ textAlign: 'center', zIndex: 2, width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.6rem', color: 'white', fontWeight: '900', margin: 0 }}>@{user.handle}</h2>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontWeight: '900', letterSpacing: '0.3em' }}>UNITED WITH</div>
                            <h2 style={{ fontSize: '1.6rem', color: 'var(--accent-neon)', fontWeight: '900', margin: 0 }}>@{weddingData.partner}</h2>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            paddingTop: '1.5rem',
                            gap: '30px'
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Date Stamp</div>
                                <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: '800' }}>{weddingData.date}</div>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Protocol</div>
                                <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ShieldCheck size={12} color="var(--accent-neon)" /> VERIFIED
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer ID */}
                    <div style={{ marginTop: 'auto', width: '100%', opacity: 0.2, zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2rem' }}>
                        <div style={{ fontSize: '0.5rem', fontFamily: 'monospace' }}>#{weddingData.id?.toString().toUpperCase()}</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3].map(i => <div key={i} style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }} />)}
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION AREA */}
            <div style={{ marginTop: '1.2rem', width: '90%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isExporting}
                    onClick={handleShare}
                    style={{
                        height: '62px', borderRadius: '22px',
                        background: 'white', color: 'black',
                        fontSize: '1rem', fontWeight: '900',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        boxShadow: '0 10px 20px rgba(255,255,255,0.1)'
                    }}
                >
                    {isExporting ? <Loader2 className="animate-spin" /> : (
                        <>
                            <Download size={20} /> ПОДЕЛИТЬСЯ СОЮЗОМ
                        </>
                    )}
                </motion.button>

                <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '600', lineHeight: 1.3 }}>
                    На iPhone откроется системное меню.<br />
                    На ПК начнется загрузка файла.
                </p>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    style={{ height: '50px', borderRadius: '18px', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', fontSize: '0.85rem', fontWeight: '700', marginTop: '5px' }}
                    onClick={() => setCurrentScreen('dashboard')}
                >
                    Вернуться назад
                </motion.button>
            </div>
        </motion.div>
    );
};

export default CertificateScreen;
