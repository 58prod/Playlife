import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, Shield, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';
import logo from '@/assets/logo-playlife-connect.png';
import { ButtonLink } from './ui/Button';
import { UserMenu } from './UserMenu';

export const NAV_ITEMS = [
  { label: 'Missions', path: '/missions' },
  { label: 'Structures', path: '/structures' },
  { label: 'Comment ça marche', path: '/comment-ca-marche' },
  { label: "L'association", path: '/qui-sommes-nous' },
  { label: 'Contact', path: '/contact' },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const loginTarget = pathname.startsWith('/login') || pathname.startsWith('/register') ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <header className={cn('sticky top-0 z-40 transition-all duration-300', scrolled || mobileOpen ? 'bg-surface-50/85 shadow-[0_1px_0_rgb(48_21_54/0.08)] backdrop-blur-xl' : 'bg-transparent')}>
      <div className="container-page flex h-16 items-center gap-4 lg:h-20 xl:gap-6">
        <Link to="/" className="shrink-0" aria-label="Playlife Connect — accueil">
          <img src={logo} alt="Playlife Connect" className="h-9 w-auto lg:h-10" width={800} height={229} />
        </Link>

        <nav aria-label="Navigation principale" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {NAV_ITEMS.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    'relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition xl:px-4',
                    isActive ? 'text-ink-900 after:absolute after:inset-x-3 xl:after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-500' : 'text-gray-600 hover:text-ink-900 hover:bg-ink-900/[0.04]',
                  )}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {user ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <ButtonLink to={loginTarget} variant="ghost" size="sm">Se connecter</ButtonLink>
              <ButtonLink to="/register" size="sm">Créer un compte</ButtonLink>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(o => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="flex size-10 items-center justify-center rounded-xl text-ink-900 hover:bg-ink-900/[0.05] lg:hidden"
          >
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-ink-900/[0.06] bg-surface-50 lg:hidden">
          <nav aria-label="Navigation mobile" className="container-page flex flex-col gap-1 py-6 animate-fade-up">
            {[{ label: 'Accueil', path: '/' }, ...NAV_ITEMS].map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => cn('rounded-xl px-4 py-3 font-display text-2xl font-semibold transition', isActive ? 'bg-white text-brand-500 shadow-soft' : 'text-ink-900 hover:bg-white/70')}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-6 border-t border-ink-900/[0.08] pt-6">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-ink-900 hover:bg-white/70">
                    <LayoutDashboard className="size-5 text-gray-500" aria-hidden="true" /> Mon tableau de bord
                  </Link>
                  {isAdmin && (
                    <Link to="/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-ink-900 hover:bg-white/70">
                      <Shield className="size-5 text-gray-500" aria-hidden="true" /> Administration
                    </Link>
                  )}
                  <button type="button" onClick={signOut} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="size-5" aria-hidden="true" /> Déconnexion
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <ButtonLink to="/register" size="lg">Créer un compte</ButtonLink>
                  <ButtonLink to={loginTarget} variant="secondary" size="lg">Se connecter</ButtonLink>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
