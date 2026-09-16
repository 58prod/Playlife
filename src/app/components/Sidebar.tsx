import { BookOpen, ChevronLeft, ChevronRight, FileText, Globe, Heart, Home, LogIn, LogOut, Mail, Menu, Settings, User, Users, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { avatarSrc, profileUserType, USER_TYPE_LABELS } from '@/lib/format';
import logoFull from '@/assets/logo-playlife-connect.png';
import logoIcon from '@/assets/logo-coeur.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileToggle: (open: boolean) => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileToggle }: SidebarProps) {
  const { pathname } = useLocation();
  const { profile, user, isAdmin, signOut } = useAuth();
  const avatar = avatarSrc(profile);
  const userType = profileUserType(profile);
  // Sur mobile, le menu ouvert s'affiche toujours en version complète
  const compact = collapsed && !mobileOpen;

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    ...(user ? [{ icon: FileText, label: 'Mon tableau de bord', path: '/dashboard' }] : []),
    { icon: Globe, label: 'Missions', path: '/missions' },
    { icon: Users, label: 'Structures', path: '/structures' },
    { icon: Heart, label: 'Parcours Playlife', path: '/impact' },
    { icon: BookOpen, label: 'Ressources', path: '/ressources' },
    ...(isAdmin ? [{ icon: Settings, label: 'Paramètres', path: '/settings' }] : []),
  ];

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-[#e6244d] text-white' : 'text-gray-700 hover:bg-gray-50'}`;

  return (
    <>
      <button
        type="button"
        onClick={() => onMobileToggle(!mobileOpen)}
        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={mobileOpen}
        aria-controls="sidebar"
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm"
      >
        {mobileOpen ? <X className="w-5 h-5 text-gray-600" aria-hidden="true" /> : <Menu className="w-5 h-5 text-gray-600" aria-hidden="true" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => onMobileToggle(false)} aria-hidden="true" />
      )}

      <aside
        id="sidebar"
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-40
          ${compact ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="px-5 h-[72px] lg:h-[95px] border-b border-gray-100 relative flex items-center">
          <Link to="/" className={compact ? 'flex justify-center w-full' : 'w-full pl-10 lg:pl-0'}>
            {compact ? (
              <img src={logoIcon} alt="Playlife" className="h-[60px] w-auto" />
            ) : (
              <img src={logoFull} alt="Playlife Connect" className="w-full h-auto max-h-[60px] object-contain object-left" />
            )}
          </Link>

          <button
            type="button"
            onClick={() => onToggle(!collapsed)}
            aria-label={collapsed ? 'Déplier la navigation' : 'Réduire la navigation'}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            {collapsed ? <ChevronRight className="w-3 h-3 text-gray-600" aria-hidden="true" /> : <ChevronLeft className="w-3 h-3 text-gray-600" aria-hidden="true" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4" aria-label="Navigation principale">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const active = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    aria-label={compact ? item.label : undefined}
                    title={compact ? item.label : undefined}
                    className={linkClass(active)}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    {!compact && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
          {user && !compact && (
            <Link to="/dashboard" className="px-4 py-3 mb-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-400" aria-hidden="true" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-[#22081c] truncate">{profile?.full_name || user.email}</span>
                <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold truncate">
                  {userType ? USER_TYPE_LABELS[userType] : 'Membre'}
                </span>
              </span>
            </Link>
          )}

          <Link
            to="/contact"
            aria-current={pathname === '/contact' ? 'page' : undefined}
            aria-label={compact ? 'Contact' : undefined}
            className={linkClass(pathname === '/contact')}
          >
            <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!compact && <span className="text-sm font-medium">Contact</span>}
          </Link>
          {user ? (
            <button
              type="button"
              onClick={signOut}
              aria-label={compact ? 'Déconnexion' : undefined}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors mt-2 text-sm font-medium"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {!compact && <span>Déconnexion</span>}
            </button>
          ) : (
            <Link
              to="/login"
              aria-label={compact ? 'Connexion' : undefined}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#e6244d] hover:bg-[#e6244d]/5 transition-colors mt-2 text-sm font-medium"
            >
              <LogIn className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {!compact && <span>Connexion</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
