import React, { useEffect } from 'react'
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from 'lenis'
import { Toaster } from 'react-hot-toast'

// Context & Auth
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Components & Pages
import { Sidebar } from './components/Sidebar'
import { FloatingBackground } from './components/3d/FloatingBackground'
import { Home } from './pages/Home'
import { NotesPage } from './pages/NotesPage'
import { Dashboard } from './pages/Dashboard'
import { SettingsPage } from './pages/SettingsPage'
import { AuthPage } from './pages/AuthPage'
import { CommandPalette } from './components/CommandPalette'

// Store
import { useNotesStore } from './store/useNotesStore'

import './App.css'

// Page wrapper to handle shared fade/blur/scale transitions
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="w-full h-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

// Animated Route controller
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
        
        {/* Protected Routes */}
        <Route path="/notes" element={<PageWrapper><ProtectedRoute><NotesPage /></ProtectedRoute></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><ProtectedRoute><Dashboard /></ProtectedRoute></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><ProtectedRoute><SettingsPage /></ProtectedRoute></PageWrapper>} />
        
        {/* Fallback */}
        <Route path="*" element={<PageWrapper><Home /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const syncNotes = useNotesStore((state) => state.syncNotes);

  // Sync Notes to user state (Firestore vs LocalStorage)
  useEffect(() => {
    syncNotes(currentUser ? currentUser.uid : null);
  }, [currentUser, syncNotes]);

  // Initialize Lenis Smooth Scroll on load
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-purple-600/30 selection:text-purple-200">
      {/* Floating background canvas blobs and dust particles */}
      <FloatingBackground />

      {/* Global floating sidebar */}
      <Sidebar />

      {/* Main page transition routes */}
      <main className="relative w-full min-h-screen">
        <AnimatedRoutes />
      </main>

      {/* Toast notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'glass-panel text-slate-100 border border-white/10 font-display font-medium text-sm rounded-2xl shadow-2xl px-5 py-3.5',
          duration: 4000,
          style: {
            background: 'rgba(13, 12, 28, 0.85)',
            backdropFilter: 'blur(20px)',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          },
          success: {
            iconTheme: {
              primary: '#a855f7',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />

      {/* Keyboard Shortcuts Command Palette */}
      <CommandPalette />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
