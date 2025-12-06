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
        paymentMethod: 'CARD', // New field
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
                    paymentMethod: formData.paymentMethod,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to initialize donation');
            }

            const data = await response.json();
            setDonationId(data.donation.id);

            // For Cash Transfer, show banking details and don't auto-verify
            if (formData.paymentMethod === 'CASH_TRANSFER') {
                setSuccess(true);
                return;
            }

            // For Card payment
            // Check if we have a payment URL (real Paystack integration)
            if (data.paymentUrl) {
                // Redirect to Paystack payment page
                window.location.href = data.paymentUrl;
                return;
            }

            // Otherwise, simulate payment for testing (when Paystack is not configured)
            // Create a simple test reference if one wasn't provided
            const testReference = data.reference || data.paymentReference || `TEST-${Date.now()}`;

            // Update donation to SUCCESS and update campaign amount
            const updateResponse = await fetch(`/api/donations/${data.donation.id}/test-success`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!updateResponse.ok) {
                // Fallback: Try the verify endpoint
                const verifyResponse = await fetch('/api/donations/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        reference: testReference,
                        status: 'SUCCESS',
                    }),
                });

                if (!verifyResponse.ok) {
                    throw new Error('Payment processing failed');
                }
            }

            setSuccess(true);
            setFormData({
                amount: '',
                donorName: '',
                donorEmail: '',
                isAnonymous: false,
                isRecurring: false,
                recurringInterval: 'MONTHLY',
                paymentMethod: 'CARD',
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

                {formData.paymentMethod === 'CASH_TRANSFER' ? (
                    <>
                        <p>Please complete your donation by transferring to the account below:</p>

                        <div style={{
                            background: '#f3f4f6',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                            margin: '1rem 0',
                            textAlign: 'left'
                        }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                                Bank Transfer Details
                            </h4>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Bank Name:</strong> Example Bank
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Account Name:</strong> ChurchFlow Crowdfunding
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Account Number:</strong> 0123456789
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Amount:</strong> {currency} {Number(formData.amount).toLocaleString()}
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Reference:</strong> DON-{donationId.slice(0, 8).toUpperCase()}
                            </div>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
                            Please use the reference code above when making your transfer.
                            Your donation will be confirmed once payment is received.
                        </p>
                    </>
                ) : (
                    <p>Your contribution has been recorded successfully.</p>
                )}

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
                <label className={styles.label} htmlFor="paymentMethod">
                    Payment Method
                </label>
                <select
                    id="paymentMethod"
                    name="paymentMethod"
                    className={styles.input}
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                >
                    <option value="CARD">💳 Card Payment (Paystack/Flutterwave)</option>
                    <option value="CASH_TRANSFER">🏦 Bank Transfer</option>
                </select>
                {formData.paymentMethod === 'CASH_TRANSFER' && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        You will receive bank account details after submitting the form.
                    </p>
                )}
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
