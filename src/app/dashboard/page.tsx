'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';

type Campaign = {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    status: string;
    _count: {
        donations: number;
    };
};

function formatCurrency(amount: number, currency: string = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'DONOR';
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalRaised: 0,
        totalDonations: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/campaigns');
            const data = await response.json();

            if (Array.isArray(data)) {
                setCampaigns(data);

                // Calculate stats
                const totalCampaigns = data.length;
                const activeCampaigns = data.filter((c: Campaign) => c.status === 'ACTIVE').length;
                const totalRaised = data.reduce((sum: number, c: Campaign) => sum + c.currentAmount, 0);
                const totalDonations = data.reduce((sum: number, c: Campaign) => sum + c._count.donations, 0);

                setStats({
                    totalCampaigns,
                    activeCampaigns,
                    totalRaised,
                    totalDonations,
                });
            } else {
                console.error('Invalid campaigns data:', data);
                // setCampaigns([]); // Removed as per instruction, but might be good to keep for robustness
            }
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                {isAdmin && (
                    <Link href="/dashboard/campaigns/new">
                        <Button>Create Campaign</Button>
                    </Link>
                )}
            </div>

            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <CardContent>
                        <div>Total Campaigns</div>
                        <div className={styles.statValue}>{stats.totalCampaigns}</div>
                    </CardContent>
                </Card>

                <Card className={styles.statCard}>
                    <CardContent>
                        <div>Active Campaigns</div>
                        <div className={styles.statValue}>{stats.activeCampaigns}</div>
                    </CardContent>
                </Card>

                <Card className={styles.statCard}>
                    <CardContent>
                        <div>Total Raised</div>
                        <div className={styles.statValue}>{formatCurrency(stats.totalRaised)}</div>
                    </CardContent>
                </Card>

                <Card className={styles.statCard}>
                    <CardContent>
                        <div>Total Donations</div>
                        <div className={styles.statValue}>{stats.totalDonations}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className={styles.campaignsTable}>
                        <thead>
                            <tr>
                                <th>Campaign</th>
                                <th>Raised</th>
                                <th>Target</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>Donations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.slice(0, 10).map((campaign) => (
                                <tr key={campaign.id}>
                                    <td>
                                        <Link href={`/campaigns/${campaign.id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                            {campaign.title}
                                        </Link>
                                    </td>
                                    <td>{formatCurrency(campaign.currentAmount, campaign.currency)}</td>
                                    <td>{formatCurrency(campaign.targetAmount, campaign.currency)}</td>
                                    <td>{Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}%</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: campaign.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                                            color: campaign.status === 'ACTIVE' ? '#065f46' : '#991b1b',
                                        }}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td>{campaign._count.donations}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </>
    );
}
