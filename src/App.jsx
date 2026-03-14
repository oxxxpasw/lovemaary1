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
import { Heart, User, BarChart3, Settings, Globe } from 'lucide-react';
import SettingsScreen from './screens/SettingsScreen';
import FeedScreen from './screens/FeedScreen'; // New
import { motion } from 'framer-motion';

const NavIcon = ({ currentScreen, screen, Icon, setCurrentScreen, activeColor = 'var(--accent-neon)' }) => (
  <motion.div
    whileTap={{ scale: 0.8 }}
    onClick={() => setCurrentScreen(screen)}
    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
  >
    <Icon size={22} color={currentScreen === screen ? activeColor : 'var(--text-muted)'} />
    <div style={{
      width: '4px', height: '4px', borderRadius: '50%',
      background: currentScreen === screen ? activeColor : 'transparent',
      marginTop: '2px'
    }} />
  </motion.div>
);

function AppContent() {
  const { currentScreen, user, setCurrentScreen, logout } = useApp();
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

  // Keyboard Detection — только для текстовых полей, не для кнопок!
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const handleFocus = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        setKeyboardVisible(true);
      }
    };
    const handleBlur = () => setKeyboardVisible(false);
    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const showNavbar = user && !['splash', 'auth'].includes(currentScreen) && !isKeyboardVisible;

  return (
    <div className="app" style={{ height: viewportHeight }}>
      <AnimatePresence>
        {currentScreen === 'splash' && <SplashScreen key="splash" />}
        {currentScreen === 'auth' && <AuthScreen key="auth" />}
        {currentScreen === 'dashboard' && <Dashboard key="dashboard" />}
        {currentScreen === 'chapel' && <ChapelScreen key="chapel" />}
        {currentScreen === 'passport' && <PassportScreen key="passport" />}
        {currentScreen === 'ships' && <ShipScreen key="ships" />}
        {currentScreen === 'feed' && <FeedScreen key="feed" />}
        {currentScreen === 'settings' && <SettingsScreen key="settings" />}
        {currentScreen === 'certificate' && <CertificateScreen key="certificate" />}
      </AnimatePresence>

      {showNavbar && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="nav-island"
        >
          <NavIcon currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} screen="feed" Icon={Globe} />
          <NavIcon currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} screen="dashboard" Icon={Heart} />
          <NavIcon currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} screen="ships" Icon={BarChart3} />
          <NavIcon currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} screen="passport" Icon={User} />
          <NavIcon currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} screen="settings" Icon={Settings} />
        </motion.div>
      )}
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
