import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { AuthField, AuthLayout, SubmitButton } from '../components/AuthLayout';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
        });
        setLoading(false);
        if (resetError) setError(errorMessage(resetError));
        else setSent(true);
    };

    return (
        <AuthLayout icon={KeyRound} title="Mot de passe oublié" subtitle="Recevez un lien pour choisir un nouveau mot de passe" error={error}>
            {sent ? (
                <div className="text-center space-y-6" role="status">
                    <p className="text-gray-600">
                        Si un compte existe pour <strong className="break-all">{email}</strong>, un email contenant un lien de réinitialisation vient d'être envoyé.
                    </p>
                    <Link to="/login" className="block w-full py-4 bg-[#e6244d] text-white font-bold rounded-xl hover:bg-[#c91d41] transition-all">
                        Retour à la connexion
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthField id="forgot-email" label="Email" icon={Mail} type="email" required autoComplete="email"
                        value={email} onChange={e => setEmail(e.target.value)} placeholder="jean.dupont@example.com" />
                    <SubmitButton loading={loading}>Envoyer le lien</SubmitButton>
                    <p className="text-center text-sm">
                        <Link to="/login" className="text-[#e6244d] hover:underline">Retour à la connexion</Link>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
}
