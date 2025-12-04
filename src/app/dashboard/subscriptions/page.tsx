'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';

function formatCurrency(amount: number, currency: string = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

interface Subscription {
    id: string;
    amount: number;
    currency: string;
    interval: string;
    status: string;
    nextPaymentDate: string;
    campaign?: {
        id: string;
        title: string;
    };
    _count: {
        donations: number;
    };
    createdAt: string;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('/api/subscriptions');
            const data = await response.json();
            setSubscriptions(data);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: string) => {
        if (action === 'cancel' && !confirm('Are you sure you want to cancel this subscription?')) {
            return;
        }

        try {
            const response = await fetch(`/api/subscriptions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                throw new Error('Failed to update subscription');
            }

            await fetchSubscriptions();
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Failed to update subscription');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusStyles = {
            ACTIVE: styles.statusActive,
            PAUSED: styles.statusPaused,
            CANCELLED: styles.statusCancelled,
            FAILED: styles.statusFailed,
        };

        return (
            <span className={`${styles.statusBadge} ${statusStyles[status as keyof typeof statusStyles] || ''}`}>
                {status}
            </span>
        );
    };

    const getIntervalLabel = (interval: string) => {
        return interval.charAt(0) + interval.slice(1).toLowerCase();
    };

    if (loading) {
        return <div className={styles.loading}>Loading subscriptions...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>My Recurring Donations</h1>
                    <p>Manage your automatic monthly giving</p>
                </div>
            </div>

            {subscriptions.length === 0 ? (
                <Card>
                    <CardContent>
                        <div className={styles.emptyState}>
                            <p>You don't have any recurring donations yet.</p>
                            <p className={styles.emptyHint}>
                                Set up a recurring donation on any campaign page to support ongoing!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className={styles.grid}>
                    {subscriptions.map((sub) => (
                        <Card key={sub.id} className={styles.subscriptionCard}>
                            <CardHeader>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <CardTitle>{sub.campaign?.title || 'General Fund'}</CardTitle>
                                        <CardDescription>
                                            {getIntervalLabel(sub.interval)} Donation
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(sub.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.subscriptionDetails}>
                                    <div className={styles.amountSection}>
                                        <div className={styles.amount}>
                                            {formatCurrency(sub.amount, sub.currency)}
                                        </div>
                                        <div className={styles.interval}>per {sub.interval.toLowerCase()}</div>
                                    </div>

                                    <div className={styles.stats}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Next Payment</span>
                                            <span className={styles.statValue}>
                                                {new Date(sub.nextPaymentDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Total Donations</span>
                                            <span className={styles.statValue}>{sub._count.donations}</span>
                                        </div>
                                    </div>

                                    <div className={styles.actions}>
                                        {sub.status === 'ACTIVE' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => handleAction(sub.id, 'pause')}
                                                >
                                                    Pause
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="small"
                                                    onClick={() => handleAction(sub.id, 'cancel')}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {sub.status === 'PAUSED' && (
                                            <>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleAction(sub.id, 'resume')}
                                                >
                                                    Resume
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="small"
                                                    onClick={() => handleAction(sub.id, 'cancel')}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {sub.status === 'CANCELLED' && (
                                            <span className={styles.cancelledText}>Subscription ended</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
