import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, GraduationCap, HeartHandshake, Lock, Mail, Plane, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { postAuthDestination } from '@/lib/navigation';
import type { ProfileType } from '@/types/database.types';
import { AuthField, AuthLayout, SubmitButton } from '../components/AuthLayout';
import { ButtonLink } from '../components/ui/Button';

const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<ProfileType>('voyageur');
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
                    <ButtonLink to="/login" size="lg" className="w-full">Aller à la page de connexion</ButtonLink>
                </div>
            </AuthLayout>
        );
    }

    const roleOption = (value: ProfileType, label: string, hint: string, Icon: typeof Plane) => {
        const active = role === value;
        return (
            <button
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={active}
                className={`flex items-center gap-3.5 rounded-2xl bg-white p-3.5 text-left ring-inset transition-all duration-300 ease-[var(--ease-out-expo)] ${active ? 'shadow-card ring-2 ring-ink-900' : 'ring-1 ring-ink-900/10 hover:ring-ink-900/20'}`}
            >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition ${active ? 'bg-ink-900 text-white' : 'bg-ink-900/[0.04] text-gray-500'}`}>
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                    <span className={`block text-sm font-semibold ${active ? 'text-ink-900' : 'text-gray-700'}`}>{label}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>
                </span>
            </button>
        );
    };

    return (
        <AuthLayout icon={UserPlus} title="Rejoignez Playlife" subtitle="Créez votre compte et lancez votre première mission solidaire." error={error}>
            <form onSubmit={handleRegister} className="space-y-4">
                <fieldset>
                    <legend className="mb-2 block text-sm font-medium text-ink-800">Je suis</legend>
                    <div className="mb-2 grid gap-2.5">
                        {roleOption('voyageur', 'Voyageur solidaire', 'Je pars en voyage et j\'emporte un pack', Plane)}
                        {roleOption('animateur', 'Animateur / Enseignant', 'J\'encadre un groupe d\'enfants', GraduationCap)}
                        {roleOption('autre', 'Autre', 'Je souhaite simplement soutenir Playlife', HeartHandshake)}
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
