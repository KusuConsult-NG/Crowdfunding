import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { prisma } from '@/lib/prisma';
import styles from '../page.module.css'; // Reusing home page styles for consistency

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number, currency: string = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default async function CampaignsPage() {
    const campaigns = await prisma.campaign.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles.sectionTitle} style={{ margin: 0 }}>All Campaigns</h1>
                <Link href="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>

            {campaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No active campaigns found</h3>
                    <p style={{ color: '#6b7280' }}>Check back later for new fundraising campaigns.</p>
                </div>
            ) : (
                <div className={styles.campaignsGrid}>
                    {campaigns.map((campaign) => (
                        <Card key={campaign.id} className={styles.campaignCard}>
                            <CardHeader>
                                <CardTitle>{campaign.title}</CardTitle>
                                <CardDescription>{campaign.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.progressSection}>
                                    <ProgressBar
                                        value={campaign.currentAmount}
                                        max={campaign.targetAmount}
                                    />
                                </div>
                                <div className={styles.campaignStats}>
                                    <span className={styles.amountRaised}>
                                        {formatCurrency(campaign.currentAmount, campaign.currency)}
                                    </span>
                                    <span className={styles.targetAmount}>
                                        of {formatCurrency(campaign.targetAmount, campaign.currency)}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/campaigns/${campaign.id}`} style={{ width: '100%' }}>
                                    <Button fullWidth>Donate Now</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
