'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: params.token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login?reset=success');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = password.length > 0 ? {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
    } : null;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Card className={styles.card}>
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>
                            {success ? 'Password reset successfully!' : 'Enter your new password'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className={styles.success}>
                                <div className={styles.successIcon}>✓</div>
                                <h3>Password Updated!</h3>
                                <p>Your password has been successfully reset.</p>
                                <p className={styles.hint}>
                                    Redirecting to login page...
                                </p>
                                <Link href="/login">
                                    <Button>Go to Login</Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="password" className={styles.label}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        className={styles.input}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {passwordStrength && (
                                    <div className={styles.strengthIndicator}>
                                        <div className={styles.strengthLabel}>Password Requirements:</div>
                                        <div className={`${styles.requirement} ${passwordStrength.length ? styles.met : ''}`}>
                                            {passwordStrength.length ? '✓' : '○'} At least 8 characters
                                        </div>
                                        <div className={`${styles.requirement} ${passwordStrength.uppercase ? styles.met : ''}`}>
                                            {passwordStrength.uppercase ? '✓' : '○'} One uppercase letter
                                        </div>
                                        <div className={`${styles.requirement} ${passwordStrength.number ? styles.met : ''}`}>
                                            {passwordStrength.number ? '✓' : '○'} One number
                                        </div>
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword" className={styles.label}>
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className={styles.input}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className={styles.error}>{error}</div>
                                )}

                                <Button type="submit" fullWidth disabled={loading}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </Button>

                                <div className={styles.footer}>
                                    <Link href="/login" className={styles.link}>
                                        ← Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
