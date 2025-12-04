'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import styles from './page.module.css';

interface AnalyticsData {
    summary: {
        totalRaised: number;
        totalDonations: number;
        totalDonors: number;
        activeCampaigns: number;
        todaysAmount: number;
        todaysCount: number;
        averageDonation: number;
    };
    trends: Array<{
        date: string;
        amount: number;
        count: number;
    }>;
    topCampaigns: Array<{
        id: string;
        title: string;
        targetAmount: number;
        currentAmount: number;
        currency: string;
        category: { name: string; icon: string; color: string } | null;
        _count: { donations: number };
    }>;
    topDonors: Array<{
        id: string;
        name: string;
        email: string;
        totalAmount: number;
        donationCount: number;
    }>;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics/dashboard?days=${period}`);
            const analyticsData = await response.json();
            setData(analyticsData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className={styles.loading}>Loading analytics...</div>;
    }

    const { summary, trends, topCampaigns, topDonors } = data;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Analytics Dashboard</h1>
                    <p>Insights into your giving and campaign performance</p>
                </div>
                <div className={styles.periodSelector}>
                    <button
                        className={period === 7 ? styles.active : ''}
                        onClick={() => setPeriod(7)}
                    >
                        7 Days
                    </button>
                    <button
                        className={period === 30 ? styles.active : ''}
                        onClick={() => setPeriod(30)}
                    >
                        30 Days
                    </button>
                    <button
                        className={period === 90 ? styles.active : ''}
                        onClick={() => setPeriod(90)}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <CardContent>
                        <div className={styles.statLabel}>Total Raised</div>
                        <div className={styles.statValue}>{formatCurrency(summary.totalRaised, 'NGN')}</div>
                        <div className={styles.statSubtext}>{summary.totalDonations} donations</div>
                    </CardContent>
                </Card>

                <Card className={styles.statCard}>
                    <CardContent>
                        <div className={styles.statLabel}>Today's Giving</div>
                        <div className={styles.statValue}>{formatCurrency(summary.todaysAmount, 'NGN')}</div>
                        <div className={styles.statSubtext}>{summary.todaysCount} donations</div>
                    </CardContent>
                </Card>

                <Card className={styles.statCard}>
                    <CardContent>
                        <div className={styles.statLabel}>Active Campaigns</div>
                        <div className={styles.statValue}>{summary.activeCampaigns}</div>
                        <div className={styles.statSubtext}>Accepting donations</div>
                    </CardContent>
                </Card>

                <Card className={styles.statCard}>
                    <CardContent>
                        <div className={styles.statLabel}>Total Donors</div>
                        <div className={styles.statValue}>{summary.totalDonors}</div>
                        <div className={styles.statSubtext}>Avg: {formatCurrency(summary.averageDonation, 'NGN')}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className={styles.chartsRow}>
                <Card className={styles.chartCard}>
                    <CardHeader>
                        <CardTitle>Donation Trends</CardTitle>
                        <CardDescription>Daily donation activity over the last {period} days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                    formatter={(value: number) => formatCurrency(value, 'NGN')}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="amount" stroke="#6366f1" name="Amount" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className={styles.chartCard}>
                    <CardHeader>
                        <CardTitle>Donation Count</CardTitle>
                        <CardDescription>Number of donations per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                <YAxis />
                                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                                <Bar dataKey="count" fill="#10b981" name="Donations" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Campaigns & Donors */}
            <div className={styles.tablesRow}>
                <Card className={styles.tableCard}>
                    <CardHeader>
                        <CardTitle>Top Campaigns</CardTitle>
                        <CardDescription>Campaigns with the most funding</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.campaignsList}>
                            {topCampaigns.map((campaign, index) => (
                                <div key={campaign.id} className={styles.campaignItem}>
                                    <div className={styles.campaignRank}>#{index + 1}</div>
                                    <div className={styles.campaignInfo}>
                                        <div className={styles.campaignTitle}>
                                            {campaign.category?.icon} {campaign.title}
                                        </div>
                                        <div className={styles.campaignProgress}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{
                                                        width: `${Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100)}%`,
                                                        backgroundColor: campaign.category?.color || '#6366f1',
                                                    }}
                                                />
                                            </div>
                                            <div className={styles.progressText}>
                                                {formatCurrency(campaign.currentAmount, campaign.currency)} of {formatCurrency(campaign.targetAmount, campaign.currency)}
                                            </div>
                                        </div>
                                        <div className={styles.campaignMeta}>
                                            {campaign._count.donations} donations
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className={styles.tableCard}>
                    <CardHeader>
                        <CardTitle>Top Donors</CardTitle>
                        <CardDescription>Most generous supporters</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.donorsList}>
                            {topDonors.map((donor, index) => (
                                <div key={donor.id} className={styles.donorItem}>
                                    <div className={styles.donorRank}>#{index + 1}</div>
                                    <div className={styles.donorInfo}>
                                        <div className={styles.donorName}>{donor.name}</div>
                                        <div className={styles.donorEmail}>{donor.email}</div>
                                    </div>
                                    <div className={styles.donorStats}>
                                        <div className={styles.donorAmount}>{formatCurrency(donor.totalAmount, 'NGN')}</div>
                                        <div className={styles.donorCount}>{donor.donationCount} donations</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
