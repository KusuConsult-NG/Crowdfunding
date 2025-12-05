import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function DashboardCampaignsPage() {
    const session = await auth();

    let campaigns = [];
    try {
        if (session?.user?.email) {
            // Fetch campaigns created by this user
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });

            if (user) {
                campaigns = await prisma.campaign.findMany({
                    where: { creatorId: user.id },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: { select: { donations: true } }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Failed to fetch dashboard campaigns:', error);
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Campaigns</h1>
                <Link href="/dashboard/campaigns/new">
                    <Button>Create New Campaign</Button>
                </Link>
            </div>

            {campaigns.length === 0 ? (
                <Card>
                    <CardContent style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You haven't created any campaigns yet.</p>
                        <Link href="/dashboard/campaigns/new">
                            <Button variant="outline">Start Fundraising</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {campaigns.map((campaign: any) => (
                        <Card key={campaign.id}>
                            <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                                <div>
                                    <Link href={`/campaigns/${campaign.id}`} style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary)' }}>
                                        {campaign.title}
                                    </Link>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {campaign.status} • {campaign._count.donations} donations
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: campaign.currency }).format(campaign.currentAmount)}
                                    <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
                                        of {new Intl.NumberFormat('en-NG', { style: 'currency', currency: campaign.currency }).format(campaign.targetAmount)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
