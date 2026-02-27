'use client';

import Link from 'next/link';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'right',
    href,
    onClick,
    className = '',
    disabled = false,
    ...props
}) {
    const baseClasses = 'inline-flex items-center justify-center font-bold rounded transition-all';

    const variants = {
        primary: 'bg-primary text-background-dark hover:bg-white hover:shadow-[0_0_30px_rgba(242,185,13,0.3)]',
        secondary: 'bg-white/5 backdrop-blur-md text-white border border-white/20 hover:bg-white/10',
        outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-background-dark',
        ghost: 'bg-transparent text-white hover:bg-white/10'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-10 py-4 text-lg'
    };

    const classes = `
        ${baseClasses}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    const content = (
        <>
            {icon && iconPosition === 'left' && (
                <span className="material-icons-outlined mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
                <span className="material-icons-outlined ml-2">{icon}</span>
            )}
        </>
    );

    if (href && !disabled) {
        return (
            <Link href={href} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={classes}
            {...props}
        >
            {content}
        </button>
    );
}
