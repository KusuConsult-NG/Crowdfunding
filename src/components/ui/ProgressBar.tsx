import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    value: number;
    max: number;
    className?: string;
}

export function ProgressBar({ value, max, className }: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={`${styles.progressBar} ${className || ''}`}>
            <div
                className={styles.progressFill}
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            />
        </div>
    );
}
