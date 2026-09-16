import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { AuthField, AuthLayout, SubmitButton } from '../components/AuthLayout';
import { PageLoader } from '../components/PageLoader';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (authLoading) return <PageLoader />;

    if (!user) {
        return (
            <AuthLayout icon={KeyRound} title="Lien expiré" subtitle="Ce lien de réinitialisation n'est plus valide.">
                <Link to="/mot-de-passe-oublie" className="flex h-13 w-full items-center justify-center rounded-xl bg-brand-500 font-semibold text-white shadow-brand transition hover:bg-brand-600">
                    Demander un nouveau lien
                </Link>
            </AuthLayout>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== confirmation) {
            setError('Les deux mots de passe ne correspondent pas.');
            return;
        }
        setLoading(true);
        setError(null);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (updateError) {
            setError(errorMessage(updateError));
        } else {
            toast.success('Mot de passe modifié.');
            navigate('/dashboard', { replace: true });
        }
    };

    return (
        <AuthLayout icon={KeyRound} title="Nouveau mot de passe" subtitle={user.email} error={error}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthField id="reset-password" label="Nouveau mot de passe" icon={Lock} type="password" required minLength={8}
                    autoComplete="new-password" hint="8 caractères minimum" value={password} onChange={e => setPassword(e.target.value)} />
                <AuthField id="reset-confirmation" label="Confirmation" icon={Lock} type="password" required minLength={8}
                    autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} />
                <SubmitButton loading={loading}>Enregistrer</SubmitButton>
            </form>
        </AuthLayout>
    );
}
