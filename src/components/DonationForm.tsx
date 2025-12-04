'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './DonationForm.module.css';

interface DonationFormProps {
    campaignId: string;
    currency: string;
}

export function DonationForm({ campaignId, currency }: DonationFormProps) {
    const [formData, setFormData] = useState({
        amount: '',
        donorName: '',
        donorEmail: '',
        isAnonymous: false,
        isRecurring: false,
        recurringInterval: 'MONTHLY',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [donationId, setDonationId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Initialize donation
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: formData.amount,
                    campaignId,
                    donorName: formData.donorName,
                    donorEmail: formData.donorEmail,
                    isAnonymous: formData.isAnonymous,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to initialize donation');
            }

            const data = await response.json();
            setDonationId(data.donation.id);

            // In production, redirect to payment gateway here
            // For MVP, we'll simulate payment verification
            const verifyResponse = await fetch('/api/donations/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reference: data.paymentReference,
                    status: 'SUCCESS', // Simulating successful payment
                }),
            });

            if (!verifyResponse.ok) {
                throw new Error('Payment verification failed');
            }

            setSuccess(true);
            setFormData({
                amount: '',
                donorName: '',
                donorEmail: '',
                isAnonymous: false,
                isRecurring: false,
                recurringInterval: 'MONTHLY',
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = 'checked' in e.target ? e.target.checked : false;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    if (success && donationId) {
        return (
            <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <h3>Thank You for Your Donation!</h3>
                <p>Your contribution has been recorded successfully.</p>

                <div className={styles.successActions}>
                    <a
                        href={`/api/donations/${donationId}/receipt`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadButton}
                    >
                        📄 Download Receipt
                    </a>

                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Make Another Donation
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="amount">
                    Donation Amount ({currency})
                </label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    className={styles.input}
                    placeholder="Enter amount"
                    min="100"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="donorName">
                    Your Name
                </label>
                <input
                    type="text"
                    id="donorName"
                    name="donorName"
                    className={styles.input}
                    placeholder="Enter your name"
                    value={formData.donorName}
                    onChange={handleChange}
                    required={!formData.isAnonymous}
                    disabled={formData.isAnonymous}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="donorEmail">
                    Email Address
                </label>
                <input
                    type="email"
                    id="donorEmail"
                    name="donorEmail"
                    className={styles.input}
                    placeholder="your@email.com"
                    value={formData.donorEmail}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="isAnonymous"
                        className={styles.checkbox}
                        checked={formData.isAnonymous}
                        onChange={handleChange}
                    />
                    Make this donation anonymous
                </label>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="isRecurring"
                        className={styles.checkbox}
                        checked={formData.isRecurring}
                        onChange={handleChange}
                    />
                    💚 Make this a recurring donation
                </label>
            </div>

            {formData.isRecurring && (
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="recurringInterval">
                        Donation Frequency
                    </label>
                    <select
                        id="recurringInterval"
                        name="recurringInterval"
                        className={styles.input}
                        value={formData.recurringInterval}
                        onChange={handleChange}
                    >
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly (Every 3 months)</option>
                        <option value="YEARLY">Yearly</option>
                    </select>
                </div>
            )}

            {error && (
                <div className={styles.error}>{error}</div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Processing...' : 'Donate Now'}
            </Button>

            <p className={styles.note}>
                Note: For MVP demonstration, payment is simulated. In production, you'll be redirected to a secure payment gateway (Paystack/Flutterwave).
            </p>
        </form>
    );
}
