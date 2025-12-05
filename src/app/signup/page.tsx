'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import styles from '../login/page.module.css';

export default function SignupSelectionPage() {
    return (
        <div className={styles.loginPage}>
            <div style={{ maxWidth: '800px', width: '100%', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#1f2937' }}>
                        Join ChurchFlow
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
                        Choose how you want to contribute to the community
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {/* Donor Option */}
                    <Link href="/signup/donor" style={{ textDecoration: 'none' }}>
                        <Card className="campaignCard" style={{ height: '100%', transition: 'all 0.3s ease' }}>
                            <CardContent style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>❤️</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>As a Donor</h2>
                                <p style={{ color: '#6b7280', marginBottom: '2rem', flex: 1 }}>
                                    I want to support campaigns, make donations, and track my giving history.
                                </p>
                                <Button fullWidth size="large">Join as Donor</Button>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Admin/Organizer Option */}
                    <Link href="/signup/admin" style={{ textDecoration: 'none' }}>
                        <Card className="campaignCard" style={{ height: '100%', transition: 'all 0.3s ease' }}>
                            <CardContent style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🚀</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>As an Organizer</h2>
                                <p style={{ color: '#6b7280', marginBottom: '2rem', flex: 1 }}>
                                    I want to create campaigns, manage funds, and post updates for my project.
                                </p>
                                <Button fullWidth variant="outline" size="large">Join as Organizer</Button>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
