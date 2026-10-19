import { forwardRef, type ButtonHTMLAttributes, type ComponentType, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base = 'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-full transition-all duration-300 ease-[var(--ease-out-expo)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] select-none';

const variants: Record<ButtonVariant, string> = {
    // Rouge plein et profond, pas de dégradé : c'est le seul aplat coloré de
    // l'interface, il doit rester net.
    primary: 'bg-brand-600 text-white shadow-brand ring-1 ring-inset ring-white/10 hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgb(170_13_58/0.55)]',
    secondary: 'bg-white text-ink-900 ring-1 ring-inset ring-ink-900/10 shadow-card hover:-translate-y-0.5 hover:ring-ink-900/18 hover:shadow-card-hover',
    ghost: 'text-ink-700 hover:bg-ink-900/[0.05] hover:text-ink-900',
    dark: 'bg-ink-900 text-white ring-1 ring-inset ring-white/10 hover:bg-ink-800 hover:-translate-y-0.5 hover:shadow-lift',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    soft: 'bg-ink-900/[0.05] text-ink-900 ring-1 ring-inset ring-ink-900/[0.07] hover:bg-ink-900/[0.08]',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5.5 text-sm',
    lg: 'h-14 px-8 text-base',
};

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

interface CommonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: IconType;
    iconRight?: IconType;
    loading?: boolean;
    className?: string;
    children?: ReactNode;
}

export function buttonClass({ variant = 'primary', size = 'md', className }: Pick<CommonProps, 'variant' | 'size' | 'className'> = {}) {
    return cn('group/btn', base, variants[variant], sizes[size], className);
}

function Content({ icon: Icon, iconRight: IconRight, loading, children }: CommonProps) {
    return (
        <>
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {children}
            {IconRight && !loading && <IconRight className="size-4 shrink-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0.5" aria-hidden />}
        </>
    );
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant, size, icon, iconRight, loading, className, children, disabled, type = 'button', ...props }, ref,
) {
    return (
        <button ref={ref} type={type} disabled={disabled || loading} className={buttonClass({ variant, size, className })} {...props}>
            <Content icon={icon} iconRight={iconRight} loading={loading}>{children}</Content>
        </button>
    );
});

type ButtonLinkProps = CommonProps & LinkProps;

export function ButtonLink({ variant, size, icon, iconRight, className, children, ...props }: ButtonLinkProps) {
    return (
        <Link className={buttonClass({ variant, size, className })} {...props}>
            <Content icon={icon} iconRight={iconRight}>{children}</Content>
        </Link>
    );
}
