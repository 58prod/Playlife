import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database.types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isAdmin: boolean;
    /** true tant que la session initiale (et le profil associé) n'est pas chargée */
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadProfile(user: User): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) {
        console.error('Chargement du profil impossible :', error.message);
        return null;
    }
    if (data) return data;

    // Filet de sécurité pour les anciens comptes créés avant le trigger handle_new_user()
    const meta = user.user_metadata ?? {};
    const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({
            id: user.id,
            full_name: meta.full_name || user.email?.split('@')[0] || 'Utilisateur',
            email: user.email ?? null,
            role: meta.role || 'voyageur',
            user_type: meta.role === 'animateur' ? 'animateur' : 'voyageur',
        })
        .select()
        .single();
    if (insertError) {
        console.error('Création du profil impossible :', insertError.message);
        return null;
    }
    return created;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // useNavigate change à chaque changement de page : on passe par une ref pour ne pas se réabonner
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    useEffect(() => {
        let active = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const nextUser = session?.user ?? null;
            setUser(nextUser);

            if (event === 'PASSWORD_RECOVERY') {
                navigateRef.current('/nouveau-mot-de-passe', { replace: true });
            }

            if (!nextUser) {
                setProfile(null);
                setLoading(false);
                return;
            }

            // Ne pas appeler Supabase directement dans ce callback (risque de blocage) : on diffère.
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                setTimeout(async () => {
                    const nextProfile = await loadProfile(nextUser);
                    if (!active) return;
                    setProfile(nextProfile);
                    setLoading(false);
                }, 0);
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            // Session déjà expirée côté serveur : on nettoie quand même la session locale.
            await supabase.auth.signOut({ scope: 'local' });
        }
        setUser(null);
        setProfile(null);
        navigateRef.current('/', { replace: true });
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) setProfile(await loadProfile(user));
    }, [user]);

    const value = useMemo(() => ({
        user,
        profile,
        isAdmin: !!profile?.is_super_admin,
        loading,
        signOut,
        refreshProfile,
    }), [user, profile, loading, signOut, refreshProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return context;
}
