'use client';

export default function Card({
    children,
    className = '',
    hover = false,
    padding = 'default',
    background = 'surface',
    border = true,
    ...props
}) {
    const baseClasses = 'rounded-xl transition-all duration-300';

    const paddingClasses = {
        none: '',
        sm: 'p-4',
        default: 'p-6 lg:p-8',
        lg: 'p-8 lg:p-12'
    };

    const backgroundClasses = {
        surface: 'bg-surface-dark',
        primary: 'bg-primary/10',
        white: 'bg-white/5 backdrop-blur-md',
        transparent: 'bg-transparent'
    };

    const hoverClasses = hover
        ? 'hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer'
        : '';

    const borderClasses = border
        ? 'border border-white/10'
        : '';

    const classes = `
        ${baseClasses}
        ${paddingClasses[padding] || paddingClasses.default}
        ${backgroundClasses[background] || backgroundClasses.surface}
        ${borderClasses}
        ${hoverClasses}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}
