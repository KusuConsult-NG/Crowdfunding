'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset link');
            }

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Card className={styles.card}>
                    <CardHeader>
                        <CardTitle>Forgot Password?</CardTitle>
                        <CardDescription>
                            {submitted
                                ? 'Check your email for reset instructions'
                                : 'Enter your email address and we\'ll send you a link to reset your password'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className={styles.success}>
                                <div className={styles.successIcon}>✓</div>
                                <h3>Email Sent!</h3>
                                <p>
                                    If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
                                </p>
                                <p className={styles.hint}>
                                    Check your spam folder if you don't see it within a few minutes.
                                </p>
                                <div className={styles.actions}>
                                    <Link href="/login">
                                        <Button variant="outline">Back to Login</Button>
                                    </Link>
                                    <Button onClick={() => {
                                        setSubmitted(false);
                                        setEmail('');
                                    }}>
                                        Send Another Link
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.label}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className={styles.input}
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className={styles.error}>{error}</div>
                                )}

                                <Button type="submit" fullWidth disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </Button>

                                <div className={styles.footer}>
                                    <Link href="/login" className={styles.link}>
                                        ← Back to Login
                                    </Link>
                                    <span className={styles.divider}>•</span>
                                    <Link href="/signup" className={styles.link}>
                                        Create Account
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
