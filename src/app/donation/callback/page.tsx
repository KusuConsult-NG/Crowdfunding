'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

function VerificationContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');
    const [donationId, setDonationId] = useState<string | null>(null);
    const verifiedRef = useRef(false);

    useEffect(() => {
        if (!reference || verifiedRef.current) return;

        const verifyPayment = async () => {
            verifiedRef.current = true;
            try {
                const response = await fetch('/api/donations/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference }),
                });

                const data = await response.json();

                if (response.ok && data.donation?.status === 'SUCCESS') {
                    setStatus('success');
                    setMessage('Your donation was successful! Thank you so much for your support.');
                    setDonationId(data.donation.id);
                } else {
                    setStatus('failed');
                    setMessage(data.message || 'Payment verification failed.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('failed');
                setMessage('An error occurred while checking your payment.');
            }
        };

        verifyPayment();
    }, [reference]);

    if (!reference) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Invalid Request</h2>
                <p>No payment reference found.</p>
                <Link href="/campaigns">
                    <Button style={{ marginTop: '1rem' }}>Back to Campaigns</Button>
                </Link>
            </div>
        );
    }

    return (
        <Card style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
            <CardHeader>
                <CardTitle>
                    {status === 'verifying' && '⏳ Verifying Payment...'}
                    {status === 'success' && '✅ Payment Successful!'}
                    {status === 'failed' && '❌ Payment Failed'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>{message}</p>

                {status === 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link href="/dashboard">
                            <Button fullWidth>Go to Dashboard</Button>
                        </Link>
                        {donationId && (
                            <Link href={`/dashboard/donations/${donationId}`}>
                                <Button variant="outline" fullWidth>View Receipt</Button>
                            </Link>
                        )}
                    </div>
                )}

                {status === 'failed' && (
                    <Link href="/campaigns">
                        <Button fullWidth>Try Again</Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}

export default function DonationCallbackPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <div className="container" style={{ padding: '2rem 0' }}>
                <VerificationContent />
            </div>
        </Suspense>
    );
}
