import type { ComponentType, InputHTMLAttributes, ReactNode } from 'react';
import photo from '@/assets/connexion.jpg';
import heart from '@/assets/coeur-playlife.png';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';

interface AuthLayoutProps {
    icon?: ComponentType<{ className?: string }>;
    title: string;
    subtitle?: ReactNode;
    error?: string | null;
    children: ReactNode;
}

export function AuthLayout({ title, subtitle, error, children }: AuthLayoutProps) {
    return (
        <div className="container-page grid min-h-[calc(100dvh-5rem)] gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-10">
            <div className="flex items-center justify-center">
                <div className="w-full max-w-md animate-fade-up">
                    <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
                    {subtitle && <p className="mt-3 text-gray-600">{subtitle}</p>}
                    {error && (
                        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100" role="alert">{error}</div>
                    )}
                    <div className="mt-8">{children}</div>
                </div>
            </div>
            <aside className="relative hidden overflow-hidden rounded-[2rem] bg-ink-900 lg:block" aria-hidden="true">
                <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-10 text-white">
                    <img src={heart} alt="" className="w-20" />
                    <div>
                        <p className="font-display text-4xl font-bold leading-tight text-white">« Un ballon, et c'est tout un terrain de jeu qui s'ouvre. »</p>
                        <p className="mt-4 max-w-sm text-ink-200">Rejoignez les voyageurs et les éducateurs qui font rayonner le sport auprès des enfants, partout dans le monde.</p>
                    </div>
                </div>
            </aside>
        </div>
    );
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: ReactNode;
    icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    hint?: string;
}

export function AuthField({ id, label, icon, hint, ...input }: AuthFieldProps) {
    return (
        <Field id={id} label={label} hint={hint}>
            <Input id={id} icon={icon} className="h-12" {...input} />
        </Field>
    );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
    return <Button type="submit" size="lg" loading={loading} className="w-full">{children}</Button>;
}
