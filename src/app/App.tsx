import { lazy, Suspense, useEffect, useRef } from 'react';
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
const CommentCaMarche = lazy(() => import('./pages/CommentCaMarche'));
const Contact = lazy(() => import('./pages/Contact'));
const Association = lazy(() => import('./pages/Association'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

const AUTH_PAGES = ['/login', '/register', '/mot-de-passe-oublie', '/nouveau-mot-de-passe'];
const NO_CTA_PAGES = ['/contact', '/dashboard', '/settings'];

function AppContent() {
  const { pathname, hash } = useLocation();
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Haut de page à chaque navigation, ou défilement vers l'ancre (#ressources…) une fois la page chargée
  const previousPath = useRef(pathname);
  useEffect(() => {
    const samePage = previousPath.current === pathname;
    previousPath.current = pathname;
    if (!hash) {
      if (!samePage) window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    let tries = 0;
    const timer = setInterval(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target || ++tries > 40) {
        clearInterval(timer);
        // Immédiat en arrivant d'une autre page, en douceur sur la même page
        target?.scrollIntoView({ behavior: samePage ? 'smooth' : 'instant', block: 'start' });
      }
    }, 50);
    return () => clearInterval(timer);
  }, [pathname, hash]);

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
            <Route path="/comment-ca-marche" element={<CommentCaMarche />} />
            <Route path="/impact" element={<Navigate to="/comment-ca-marche" replace />} />
            <Route path="/ressources" element={<Navigate to="/comment-ca-marche#ressources" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/qui-sommes-nous" element={<Association />} />
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
