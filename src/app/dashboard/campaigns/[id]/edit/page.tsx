'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import styles from '../../new/page.module.css';

export default function EditCampaignPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        currency: 'NGN',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchCampaign();
    }, []);

    const fetchCampaign = async () => {
        try {
            const response = await fetch(`/api/campaigns/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch campaign');

            const campaign = await response.json();
            setFormData({
                title: campaign.title || '',
                description: campaign.description || '',
                targetAmount: campaign.targetAmount?.toString() || '',
                currency: campaign.currency || 'NGN',
                status: campaign.status || 'ACTIVE',
                startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
                endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/campaigns/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update campaign');
            }

            router.push('/dashboard/campaigns');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading campaign...</div>;
    }

    return (
        <div style={{ padding: '2rem 0' }}>
            <div className="container">
                <Link href="/dashboard/campaigns" style={{ color: 'var(--primary)', fontWeight: 500, marginBottom: '2rem', display: 'inline-block' }}>
                    ← Back to My Campaigns
                </Link>

                <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <CardHeader>
                        <CardTitle>Edit Campaign</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="title">
                                    Campaign Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    className={styles.input}
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="description">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className={styles.textarea}
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="targetAmount">
                                    Target Amount *
                                </label>
                                <input
                                    type="number"
                                    id="targetAmount"
                                    name="targetAmount"
                                    className={styles.input}
                                    value={formData.targetAmount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="status">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    className={styles.input}
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="startDate">
                                    Start Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    className={styles.input}
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="endDate">
                                    End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    className={styles.input}
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <Button type="submit" fullWidth disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
