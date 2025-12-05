import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DonationForm } from '@/components/DonationForm';
import { DonateButton } from '@/components/DonateButton';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number, currency: string = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default async function CampaignDetail({ params }: { params: { id: string } }) {
    let campaign = null;
    try {
        campaign = await prisma.campaign.findUnique({
            where: { id: params.id },
            include: {
                branch: true,
                creator: {
                    select: { name: true, email: true },
                },
            },
        });
    } catch (error) {
        console.error('Failed to fetch campaign:', error);
    }

    if (!campaign) {
        notFound();
    }

    const percentageRaised = ((campaign.currentAmount / campaign.targetAmount) * 100).toFixed(0);

    return (
        <div className={styles.campaignDetail}>
            <div className="container">
                <Link href="/" className={styles.backLink}>
                    ← Back to Campaigns
                </Link>

                <div className={styles.grid}>
                    <div>
                        <div className={styles.campaignHeader}>
                            <h1 className={styles.campaignTitle}>{campaign.title}</h1>
                            <p className={styles.campaignDescription}>{campaign.description}</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProgressBar
                                    value={campaign.currentAmount}
                                    max={campaign.targetAmount}
                                />
                                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                        {percentageRaised}% funded
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {campaign.branch && (
                            <Card style={{ marginTop: '1.5rem' }}>
                                <CardHeader>
                                    <CardTitle>Branch Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p><strong>Name:</strong> {campaign.branch.name}</p>
                                    {campaign.branch.location && (
                                        <p><strong>Location:</strong> {campaign.branch.location}</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Prominent Donate Section */}
                        <div className={styles.donateSection}>
                            <h2 className={styles.donateSectionTitle}>Support This Campaign</h2>
                            <p className={styles.donateSectionSubtitle}>
                                Your donation makes a difference. Help us reach our goal!
                            </p>
                            <DonateButton />
                        </div>
                    </div>

                    <div>
                        <Card className={styles.statsCard}>
                            <CardHeader>
                                <CardTitle>Campaign Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Amount Raised</div>
                                    <div className={styles.statValue}>
                                        {formatCurrency(campaign.currentAmount, campaign.currency)}
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Target Amount</div>
                                    <div className={styles.statValue}>
                                        {formatCurrency(campaign.targetAmount, campaign.currency)}
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Remaining</div>
                                    <div className={styles.statValue}>
                                        {formatCurrency(campaign.targetAmount - campaign.currentAmount, campaign.currency)}
                                    </div>
                                </div>

                                <div id="donation-form" className={styles.donationForm}>
                                    <DonationForm
                                        campaignId={campaign.id}
                                        currency={campaign.currency}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
