import React from 'react';
import { useApp, AppProvider } from './context/AppContext';
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import Dashboard from './screens/Dashboard';
import PassportScreen from './screens/PassportScreen';
import ShipScreen from './screens/ShipScreen';
import ChapelScreen from './screens/ChapelScreen';
import CertificateScreen from './screens/CertificateScreen';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

function AppContent() {
  const { currentScreen } = useApp();
  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#050508');
      tg.setBackgroundColor('#050508');
      setViewportHeight(tg.viewportHeight + 'px');
    }

    const handleResize = () => {
      if (tg) {
        setViewportHeight(tg.viewportHeight + 'px');
      } else {
        setViewportHeight(window.innerHeight + 'px');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app" style={{ height: viewportHeight }}>
      <AnimatePresence mode="wait">
        {currentScreen === 'splash' && <SplashScreen key="splash" />}
        {currentScreen === 'auth' && <AuthScreen key="auth" />}
        {currentScreen === 'dashboard' && <Dashboard key="dashboard" />}
        {currentScreen === 'chapel' && <ChapelScreen key="chapel" />}
        {currentScreen === 'passport' && <PassportScreen key="passport" />}
        {currentScreen === 'ships' && <ShipScreen key="ships" />}
        {currentScreen === 'certificate' && <CertificateScreen key="certificate" />}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
