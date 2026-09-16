import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConfirmProvider } from './components/ConfirmDialog';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PageLoader } from './components/PageLoader';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';

const Missions = lazy(() => import('./pages/Missions'));
const MissionDetail = lazy(() => import('./pages/MissionDetail'));
const Structures = lazy(() => import('./pages/Structures'));
const Impact = lazy(() => import('./pages/Impact'));
const Ressources = lazy(() => import('./pages/Ressources'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

const AUTH_PAGES = ['/login', '/register', '/mot-de-passe-oublie', '/nouveau-mot-de-passe'];
const NO_CTA_PAGES = ['/contact', '/dashboard', '/settings'];

function AppContent() {
  const { pathname } = useLocation();
  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/missions/:id" element={<MissionDetail />} />
            <Route path="/structures" element={<Structures />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/ressources" element={<Ressources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/nouveau-mot-de-passe" element={<ResetPassword />} />
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<RequireAuth admin />}>
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isAuthPage && <Footer showCta={!NO_CTA_PAGES.includes(pathname)} />}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{ style: { fontFamily: 'var(--font-sans)', borderRadius: '14px' } }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <AppContent />
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
