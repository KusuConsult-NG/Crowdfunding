'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';

type Campaign = {
    id: string;
    title: string;
};

export default function CashEntryPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [formData, setFormData] = useState({
        amount: '',
        campaignId: '',
        donorName: '',
        donorEmail: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [receiptCode, setReceiptCode] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/campaigns?status=ACTIVE');
            const data = await response.json();
            setCampaigns(data);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('/api/donations/cash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.status === 409) {
                // Duplicate warning
                if (window.confirm(data.message + '\n\nDo you want to proceed anyway?')) {
                    // User confirmed, allow duplicate
                    setError('');
                } else {
                    setError(data.message);
                    setLoading(false);
                    return;
                }
            } else if (!response.ok) {
                throw new Error(data.error || 'Failed to record donation');
            }

            setSuccess(`Cash donation recorded successfully! Receipt: ${data.donation.receiptCode}`);
            setReceiptCode(data.donation.receiptCode);

            // Reset form
            setFormData({
                amount: '',
                campaignId: '',
                donorName: '',
                donorEmail: '',
                notes: '',
            });

            // Redirect to approvals page after 2 seconds
            setTimeout(() => {
                router.push('/dashboard/donations/approvals');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Record Cash Donation</h1>
                <p className={styles.subtitle}>
                    Manually record cash donations received offline
                </p>
            </div>

            <Card className={styles.formCard}>
                <CardHeader>
                    <CardTitle>Donation Details</CardTitle>
                    <CardDescription>
                        All cash donations require admin approval before being added to campaign totals
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className={styles.successBox}>
                            <div className={styles.successIcon}>✓</div>
                            <h3>Donation Recorded Successfully!</h3>
                            <p className={styles.receiptCode}>Receipt Code: <strong>{receiptCode}</strong></p>
                            <p>This donation is pending admin approval.</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                Redirecting to approvals page...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="campaignId">
                                    Campaign <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="campaignId"
                                    name="campaignId"
                                    className={styles.select}
                                    value={formData.campaignId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a campaign</option>
                                    {campaigns.map((campaign) => (
                                        <option key={campaign.id} value={campaign.id}>
                                            {campaign.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="amount">
                                    Amount (₦) <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    className={styles.input}
                                    placeholder="Enter amount"
                                    min="100"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="donorName">
                                    Donor Name <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="donorName"
                                    name="donorName"
                                    className={styles.input}
                                    placeholder="Enter donor's full name"
                                    value={formData.donorName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="donorEmail">
                                    Donor Email <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="email"
                                    id="donorEmail"
                                    name="donorEmail"
                                    className={styles.input}
                                    placeholder="donor@email.com"
                                    value={formData.donorEmail}
                                    onChange={handleChange}
                                    required
                                />
                                <small className={styles.hint}>
                                    Used for duplicate detection and receipts
                                </small>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="notes">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    className={styles.textarea}
                                    placeholder="Additional notes about this donation..."
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>

                            {error && (
                                <div className={styles.error}>{error}</div>
                            )}

                            <div className={styles.actions}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/dashboard')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Recording...' : 'Record Donation'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
