import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ConfirmProvider } from './components/ConfirmDialog';
import { CtaContact } from './components/CtaContact';
import { PageLoader } from './components/PageLoader';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';

const Missions = lazy(() => import('./pages/Missions'));
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

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [pathname]);

  const showCta = pathname !== '/contact' && !AUTH_PAGES.includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={setMobileMenuOpen}
      />
      <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/missions" element={<Missions />} />
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
          {showCta && <CtaContact />}
        </main>
      </div>
      <Toaster position="top-center" richColors closeButton />
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
