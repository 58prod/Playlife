import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { avatarSrc, profileUserType, USER_TYPE_LABELS } from '@/lib/format';
import { cn } from '@/lib/cn';

export function Avatar({ src, name, className }: { src: string | null; name?: string | null; className?: string }) {
    const initials = (name ?? '').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
    return (
        <span className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100 font-semibold text-ink-700 ring-2 ring-white', className)}>
            {src ? <img src={src} alt="" className="size-full object-cover" /> : initials || <User className="size-1/2" aria-hidden="true" />}
        </span>
    );
}

export function UserMenu() {
    const { user, profile, isAdmin, signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    if (!user) return null;
    const name = profile?.full_name || user.email;
    const type = profileUserType(profile);
    const item = 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-800 hover:bg-ink-50';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Menu du compte"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-ink-900/[0.05]"
            >
                <Avatar src={avatarSrc(profile)} name={name} className="size-9 text-xs" />
                <span className="hidden max-w-36 truncate text-sm font-medium text-ink-900 xl:block">{profile?.full_name || 'Mon compte'}</span>
                <ChevronDown className={cn('size-4 text-gray-500 transition', open && 'rotate-180')} aria-hidden="true" />
            </button>

            {open && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-2xl bg-white p-2 shadow-lift ring-1 ring-ink-900/[0.06] animate-pop">
                    <div className="px-3 pb-3 pt-2">
                        <p className="truncate text-sm font-semibold text-ink-900">{name}</p>
                        <p className="truncate text-xs text-gray-500">{type ? USER_TYPE_LABELS[type] : user.email}</p>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                        <Link role="menuitem" to="/dashboard" onClick={() => setOpen(false)} className={item}>
                            <LayoutDashboard className="size-4 text-gray-500" aria-hidden="true" /> Mon tableau de bord
                        </Link>
                        {isAdmin && (
                            <Link role="menuitem" to="/settings" onClick={() => setOpen(false)} className={item}>
                                <Shield className="size-4 text-gray-500" aria-hidden="true" /> Administration
                            </Link>
                        )}
                        <button role="menuitem" type="button" onClick={() => { setOpen(false); signOut(); }} className={cn(item, 'text-red-600 hover:bg-red-50')}>
                            <LogOut className="size-4" aria-hidden="true" /> Déconnexion
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
