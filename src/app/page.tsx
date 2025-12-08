import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ExpandableText } from '@/components/ExpandableText';
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
  let campaigns: any[] = [];
  try {
    campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    campaigns = [];
  }

  return (
    <div>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Empower Faith, <br />
              <span className="gradient-text">Fund the Future.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Join the ECWA community in building projects that matter.
              Transparent, secure, and impactful crowdfunding for our churches.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/campaigns">
                <Button size="large">All Campaigns</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="large">Start Fundraising</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.campaignsSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Featured Campaigns</h2>

          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '2rem' }}>
              <p>No active campaigns yet. Be the first to start one!</p>
            </div>
          ) : (
            <div className={styles.campaignsGrid}>
              {campaigns.map((campaign) => {
                const percentage = Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100));

                return (
                  <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className={styles.campaignCard}>
                    <div className={styles.campaignCardContent}>
                      <h3 className={styles.cardTitle}>{campaign.title}</h3>
                      <div className={styles.cardDescription}>
                        <ExpandableText text={campaign.description} maxLines={5} />
                      </div>

                      <div className={styles.progressSection}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className={styles.campaignStats}>
                        <div>
                          <div className={styles.amountRaised}>
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: campaign.currency }).format(campaign.currentAmount)}
                          </div>
                          <div className={styles.targetAmount}>
                            raised of {new Intl.NumberFormat('en-NG', { style: 'currency', currency: campaign.currency }).format(campaign.targetAmount)}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
