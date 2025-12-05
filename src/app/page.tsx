import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
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

export default async function Home() {
  // Fetch active campaigns from database
  const campaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE' },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Support God's Work</h1>
          <p className={styles.heroSubtitle}>
            Join us in making a difference through your generosity
          </p>
          <Link href="/campaigns">
            <Button variant="secondary">View All Campaigns</Button>
          </Link>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className={styles.campaignsSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Featured Campaigns</h2>
          <div className={styles.campaignsGrid}>
            {campaigns.map((campaign: any) => (
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
        </div>
      </section>
    </div>
  );
}
