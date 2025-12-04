'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        currency: 'NGN',
        startDate: '',
        endDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create campaign');
            }

            const campaign = await response.json();
            router.push(`/campaigns/${campaign.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <div className="container">
                <Link href="/dashboard" style={{ color: 'var(--primary)', fontWeight: 500, marginBottom: '2rem', display: 'inline-block' }}>
                    ← Back to Dashboard
                </Link>

                <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <CardHeader>
                        <CardTitle>Create New Campaign</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                    min="1"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="currency">
                                    Currency
                                </label>
                                <select
                                    id="currency"
                                    name="currency"
                                    className={styles.input}
                                    value={formData.currency}
                                    onChange={handleChange}
                                >
                                    <option value="NGN">NGN (₦)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="startDate">
                                    Start Date
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
                                    End Date
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

                            {error && (
                                <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                    {error}
                                </div>
                            )}

                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'Creating...' : 'Create Campaign'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
