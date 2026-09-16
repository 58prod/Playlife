import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, GraduationCap, Lock, Mail, Plane, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { postAuthDestination } from '@/lib/navigation';
import type { UserType } from '@/types/database.types';
import { AuthField, AuthLayout, SubmitButton } from '../components/AuthLayout';

const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserType>('voyageur');
    const [error, setError] = useState<string | null>(null);
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

    useEffect(() => {
        if (user) navigate(postAuthDestination(searchParams), { replace: true });
    }, [user, navigate, searchParams]);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
            return;
        }
        setLoading(true);
        setError(null);

        // Le trigger handle_new_user() crée le profil côté serveur à partir de ces métadonnées.
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: { full_name: fullName.trim(), role },
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });
        setLoading(false);

        if (signUpError) {
            setError(errorMessage(signUpError));
        } else if (!data.session) {
            // Confirmation par email activée
            setRegisteredEmail(email.trim());
        }
    };

    if (registeredEmail) {
        return (
            <AuthLayout icon={CheckCircle} title="Inscription réussie !">
                <div className="text-center" role="status">
                    <p className="text-gray-600 mb-2">Un email de confirmation a été envoyé à :</p>
                    <p className="font-bold text-ink-900 mb-6 break-all">{registeredEmail}</p>
                    <p className="text-gray-500 text-sm mb-8">
                        Cliquez sur le lien dans l'email pour activer votre compte, puis connectez-vous.
                        Pensez à vérifier vos courriers indésirables.
                    </p>
                    <Link to="/login" className="flex h-13 w-full items-center justify-center rounded-xl bg-brand-500 font-semibold text-white shadow-brand transition hover:bg-brand-600">
                        Aller à la page de connexion
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    const roleOption = (value: UserType, label: string, Icon: typeof Plane) => (
        <button
            type="button"
            onClick={() => setRole(value)}
            aria-pressed={role === value}
            className={`flex flex-col items-center gap-2 rounded-2xl bg-white p-4 ring-inset transition ${role === value ? 'ring-2 ring-brand-500 shadow-soft' : 'ring-1 ring-gray-200 hover:ring-gray-300'}`}
        >
            <Icon className={`w-6 h-6 ${role === value ? 'text-brand-500' : 'text-gray-400'}`} />
            <span className={`text-center text-sm font-semibold ${role === value ? 'text-ink-900' : 'text-gray-600'}`}>{label}</span>
        </button>
    );

    return (
        <AuthLayout icon={UserPlus} title="Rejoignez Playlife" subtitle="Créez votre compte et lancez votre première mission solidaire." error={error}>
            <form onSubmit={handleRegister} className="space-y-4">
                <fieldset>
                    <legend className="mb-2 block text-sm font-medium text-ink-800">Je suis</legend>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        {roleOption('voyageur', 'Voyageur solidaire', Plane)}
                        {roleOption('animateur', 'Animateur / Enseignant', GraduationCap)}
                    </div>
                </fieldset>
                <AuthField id="register-fullname" label="Nom complet" icon={User} type="text" required autoComplete="name"
                    value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Dupont" />
                <AuthField id="register-email" label="Email" icon={Mail} type="email" required autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)} placeholder="jean.dupont@example.com" />
                <AuthField id="register-password" label="Mot de passe" icon={Lock} type="password" required autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH} hint={`${MIN_PASSWORD_LENGTH} caractères minimum`}
                    value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <SubmitButton loading={loading}>S'inscrire</SubmitButton>
            </form>
            <p className="text-center text-gray-500 mt-6 text-sm">
                Déjà un compte ?{' '}
                <Link to={`/login?${searchParams.toString()}`} className="font-semibold text-brand-600 hover:text-brand-700">Se connecter</Link>
            </p>
        </AuthLayout>
    );
}
