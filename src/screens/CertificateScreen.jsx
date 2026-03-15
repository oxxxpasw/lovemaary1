import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Heart, Sparkles, Download, Loader2, ShieldCheck, ChevronLeft, Check, Ghost } from 'lucide-react';
import html2canvas from 'html2canvas';
import download from 'downloadjs';

const CertificateScreen = () => {
    const { user, activeWedding, setCurrentScreen, marriages, ensureSafeAvatar, getPet, adoptPet, feedPet } = useApp();
    const certificateRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isShared, setIsShared] = useState(false);

    // Pet State
    const [pet, setPet] = useState(null);
    const [loadingPet, setLoadingPet] = useState(true);
    const [isAdopting, setIsAdopting] = useState(false);
    const [isFeeding, setIsFeeding] = useState(false);

    const weddingData = activeWedding || (marriages.length > 0 ? marriages[0] : null);

    useEffect(() => {
        const fetchPet = async () => {
            if (weddingData && weddingData.id) {
                setLoadingPet(true);
                const data = await getPet(weddingData.id);
                setPet(data);
                setLoadingPet(false);
            } else {
                setLoadingPet(false);
            }
        };
        fetchPet();
    }, [weddingData, getPet]);

    const handleAdoptPet = async () => {
        if (!weddingData?.id) return;
        setIsAdopting(true);
        const names = ['Нэо', 'Кибер', 'Спарк', 'Глюк', 'Пиксель', 'Зиро'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const result = await adoptPet(weddingData.id, randomName);
        if (result.success) {
            setPet(result.pet);
        } else {
            alert(result.error || 'Ошибка при создании питомца. Проверьте базу данных.');
        }
        setIsAdopting(false);
    };

    const handleFeedPet = async () => {
        if (!pet) return;
        setIsFeeding(true);
        const result = await feedPet(pet.id, 20); // Стоит 20 Silk
        if (result.success) {
            setPet(prev => ({ ...prev, happiness: result.newHappiness, health: result.newHealth }));
        } else {
            alert(result.error || 'Ошибка');
        }
        setIsFeeding(false);
    };

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
                        el.style.padding = '5rem 4rem';
                        el.style.borderRadius = '60px';
                    }
                    const hideOnExport = clonedDoc.querySelectorAll('.hide-on-export');
                    hideOnExport.forEach(n => n.style.display = 'none');
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
                    setIsShared(true);
                } catch (shareErr) {
                    download(dataUrl, `threads-marriage-certificate.png`);
                    setIsShared(true);
                }
            } else {
                download(dataUrl, `threads-marriage-certificate.png`);
                setIsShared(true);
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

            {/* ART PIECE */}
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
                        border: '1px solid rgba(0, 242, 255, 0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '2.5rem 1.5rem 2rem',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
                    }}
                >
                    {/* Background Decor */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(0, 242, 255, 0.1), transparent)' }} />
                    </div>

                    <Heart size={36} color="var(--accent-neon)" fill="rgba(0, 242, 255, 0.1)" style={{ marginBottom: '1.5rem', zIndex: 2 }} />

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem', zIndex: 2 }}>
                        <div style={{ fontSize: '0.55rem', letterSpacing: '0.4em', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Permanent Digital Bond
                        </div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', margin: 0, letterSpacing: '-0.02em', fontStyle: 'italic' }}>CERTIFICATE</h1>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginTop: '10px' }}>ID: {weddingData.id?.toString().toUpperCase()}</div>
                    </div>

                    {/* AVATARS */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '2.5rem', zIndex: 2 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '85px', height: '85px', borderRadius: '32px', border: '2px solid var(--accent-neon)', overflow: 'hidden', padding: '1px' }}>
                                <img crossOrigin="anonymous" src={proxyImage(user.avatar)} style={{ width: '100%', height: '100%', borderRadius: '30px', objectFit: 'cover' }} />
                            </div>
                            <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: 'white', color: 'black', padding: '4px 10px', borderRadius: '8px', fontSize: '0.5rem', fontWeight: '900' }}>@YOU</div>
                        </div>

                        <div style={{ width: '30px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />

                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '85px', height: '85px', borderRadius: '32px', border: '2px solid var(--accent-hot)', overflow: 'hidden', padding: '1px' }}>
                                <img crossOrigin="anonymous" src={proxyImage(weddingData.partnerAvatar)} style={{ width: '100%', height: '100%', borderRadius: '30px', objectFit: 'cover' }} />
                            </div>
                            <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-neon)', color: 'black', padding: '4px 10px', borderRadius: '8px', fontSize: '0.5rem', fontWeight: '900' }}>@LOVE</div>
                        </div>
                    </div>

                    {/* Proclamation */}
                    <div style={{ textAlign: 'center', zIndex: 2, width: '100%' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ОФИЦИАЛЬНЫЙ СОЮЗ</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white', letterSpacing: '-0.02em', marginBottom: '2rem' }}>
                            @{user.handle} & @{weddingData.partner}
                        </div>

                        <div style={{
                            padding: '12px 20px',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            justifyContent: 'space-around',
                            gap: '20px',
                            marginBottom: '10px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Date</div>
                                <div style={{ fontSize: '0.8rem', color: 'white', fontWeight: '800' }}>{weddingData.date}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-neon)', fontWeight: '800' }}>VERIFIED</div>
                            </div>
                        </div>
                    </div>

                    {/* TAMAGOTCHI PET INTEGRATION */}
                    <div style={{ width: '100%', marginTop: '1rem', zIndex: 2 }}>
                        {!loadingPet && (
                            pet ? (
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,45,85,0.2)', borderRadius: '24px', padding: '15px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <Ghost size={16} color="var(--accent-hot)" />
                                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-hot)', textTransform: 'uppercase', fontWeight: 'bold' }}>СЕМЕЙНЫЙ ПИТОМЕЦ: {pet.name}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '15px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Счастье</div>
                                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${pet.happiness}%`, height: '100%', background: pet.happiness > 50 ? 'var(--accent-neon)' : 'var(--accent-hot)' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="hide-on-export"
                                        onClick={handleFeedPet}
                                        disabled={isFeeding}
                                        style={{
                                            width: '100%', padding: '8px', borderRadius: '12px',
                                            background: 'var(--accent-hot)', color: 'white', border: 'none',
                                            fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        {isFeeding ? <Loader2 size={14} className="animate-spin" style={{ margin: '0 auto' }} /> : 'ПОКОРМИТЬ (-20 Silk)'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="hide-on-export"
                                    onClick={handleAdoptPet}
                                    disabled={isAdopting}
                                    style={{
                                        width: '100%', padding: '15px', borderRadius: '24px',
                                        background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)',
                                        color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    {isAdopting ? <Loader2 size={16} className="animate-spin" /> : <><Ghost size={16} /> ЗАВЕСТИ КИБЕР-ПИТОМЦА</>}
                                </button>
                            )
                        )}
                    </div>

                    <div style={{ position: 'absolute', bottom: '10px', fontSize: '0.45rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.2em', zIndex: 2 }}>
                        MARRYTHREADS.APP
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
                        background: isShared ? 'rgba(255,255,255,0.1)' : 'white',
                        color: isShared ? 'white' : 'black',
                        fontSize: '1rem', fontWeight: '900',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        boxShadow: isShared ? 'none' : '0 10px 20px rgba(255,255,255,0.1)'
                    }}
                >
                    {isExporting ? <Loader2 className="animate-spin" /> :
                        isShared ? <><Check size={24} color="#10b981" /> СОХРАНЕНО</> :
                            <>
                                <Download size={20} /> ПОДЕЛИТЬСЯ СОЮЗОМ
                            </>
                    }
                </motion.button>

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
