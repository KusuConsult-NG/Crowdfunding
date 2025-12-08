'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface CampaignActionsProps {
    campaignId: string;
}

export function CampaignActions({ campaignId }: CampaignActionsProps) {
    const router = useRouter();

    const handleCancel = async () => {
        if (confirm('Are you sure you want to cancel this campaign? It will be archived and no longer accept donations.')) {
            try {
                const response = await fetch(`/api/campaigns/${campaignId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'ARCHIVED' }),
                });

                if (response.ok) {
                    router.refresh();
                } else {
                    const data = await response.json();
                    alert(data.error || 'Failed to cancel campaign');
                }
            } catch (error) {
                alert('Error canceling campaign');
            }
        }
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Link href={`/dashboard/campaigns/${campaignId}/edit`} style={{ flex: 1 }}>
                <Button variant="outline" size="small" fullWidth>✏️ Edit</Button>
            </Link>
            <Button
                variant="outline"
                size="small"
                fullWidth
                onClick={handleCancel}
            >
                ❌ Cancel
            </Button>
        </div>
    );
}
