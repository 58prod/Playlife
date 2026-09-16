import { forwardRef, type ButtonHTMLAttributes, type ComponentType, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base = 'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-brand-500 text-white shadow-brand hover:bg-brand-600 hover:-translate-y-px',
    secondary: 'bg-white text-ink-900 ring-1 ring-inset ring-gray-200 shadow-soft hover:ring-gray-300 hover:bg-gray-50',
    ghost: 'text-ink-700 hover:bg-ink-50 hover:text-ink-900',
    dark: 'bg-ink-900 text-white hover:bg-ink-800 hover:-translate-y-px',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    soft: 'bg-brand-50 text-brand-600 hover:bg-brand-100',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-13 px-7 text-base',
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
    return cn(base, variants[variant], sizes[size], className);
}

function Content({ icon: Icon, iconRight: IconRight, loading, children }: CommonProps) {
    return (
        <>
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {children}
            {IconRight && !loading && <IconRight className="size-4 shrink-0" aria-hidden />}
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
