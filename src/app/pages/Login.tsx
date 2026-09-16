import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { postAuthDestination } from '@/lib/navigation';
import { AuthField, AuthLayout, SubmitButton } from '../components/AuthLayout';
import { PageLoader } from '../components/PageLoader';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && user) navigate(postAuthDestination(searchParams), { replace: true });
    }, [authLoading, user, navigate, searchParams]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (loginError) {
            setError(errorMessage(loginError));
            setLoading(false);
        }
        // En cas de succès, l'effet ci-dessus redirige dès que la session est chargée.
    };

    if (authLoading || user) return <PageLoader label="Vérification de votre session…" />;

    return (
        <AuthLayout icon={LogIn} title="Heureux de vous revoir" subtitle="Connectez-vous à votre espace Playlife" error={error}>
            <form onSubmit={handleLogin} className="space-y-4">
                <AuthField id="login-email" label="Email" icon={Mail} type="email" required autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)} placeholder="jean.dupont@example.com" />
                <AuthField id="login-password" label="Mot de passe" icon={Lock} type="password" required autoComplete="current-password"
                    value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <div className="text-right">
                    <Link to="/mot-de-passe-oublie" className="text-sm text-[#e6244d] hover:underline">Mot de passe oublié ?</Link>
                </div>
                <SubmitButton loading={loading}>Se connecter</SubmitButton>
            </form>
            <p className="text-center text-gray-500 mt-6 text-sm">
                Pas encore de compte ?{' '}
                <Link to={`/register?${searchParams.toString()}`} className="text-[#e6244d] font-bold hover:underline">S'inscrire</Link>
            </p>
        </AuthLayout>
    );
}
