import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'medium', fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
