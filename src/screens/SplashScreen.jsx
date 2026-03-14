import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen splash-screen"
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="glass-panel"
                style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '30px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '3rem',
                    boxShadow: '0 0 50px rgba(0, 242, 255, 0.15)'
                }}
            >
                ✨
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '2rem', fontSize: '1.5rem' }}
            >
                THREADS <span className="text-gradient">СВАДЬБА</span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                style={{ marginTop: '0.5rem', letterSpacing: '0.2em', fontSize: '0.7rem' }}
            >
                ВИРТУАЛЬНАЯ ЧАСОВНЯ
            </motion.p>
        </motion.div>
    );
};

export default SplashScreen;
