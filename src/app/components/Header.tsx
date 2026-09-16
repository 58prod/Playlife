import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { avatarSrc } from '@/lib/format';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const avatar = avatarSrc(profile);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="px-4 md:px-8 h-[72px] lg:h-[95px] flex items-center justify-end">
        <div className="flex items-center gap-2 md:gap-3">
          {!user ? (
            <>
              <Link
                to="/register"
                className="px-3 md:px-5 py-2 bg-white text-[#22081c] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium"
              >
                S'inscrire
              </Link>
              <Link
                to="/login"
                className="px-3 md:px-5 py-2 bg-[#e6244d] text-white rounded-lg hover:bg-[#d11d42] transition-colors text-xs md:text-sm font-medium"
              >
                Se connecter
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-semibold text-[#22081c] hidden sm:block">
                  {profile?.full_name || user.email}
                </span>
                <span className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" aria-hidden="true" />
                  )}
                </span>
                <span className="sr-only">Mon tableau de bord</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
