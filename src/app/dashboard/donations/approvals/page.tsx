'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';

type CashDonation = {
    id: string;
    amount: number;
    receiptCode: string;
    approvalStatus: string;
    createdAt: string;
    notes?: string;
    flagReason?: string;
    donor: { name: string; email: string };
    receiver: { name: string; email: string };
    campaign: { title: string; id: string };
    approver?: { name: string };
};

export default function ApprovalsPage() {
    const [donations, setDonations] = useState<CashDonation[]>([]);
    const [filter, setFilter] = useState<string>('PENDING');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchDonations();
    }, [filter]);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/donations/cash?status=${filter}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setDonations(data);
            } else {
                console.error("API Error:", data);
                setDonations([]);
            }
        } catch (err) {
            console.error('Error fetching donations:', err);
            setDonations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this donation? Campaign total will be updated.')) {
            return;
        }

        setActionLoading(id);
        try {
            const response = await fetch(`/api/donations/${id}/approve`, {
                method: 'PUT',
            });

            if (response.ok) {
                alert('Donation approved successfully!');
                fetchDonations(); // Refresh list
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to approve donation');
            }
        } catch (err) {
            alert('Failed to approve donation');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFlag = async (id: string) => {
        const reason = prompt('Enter reason for flagging this donation:');
        if (!reason) return;

        setActionLoading(id);
        try {
            const response = await fetch(`/api/donations/${id}/flag`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            if (response.ok) {
                alert('Donation flagged successfully!');
                fetchDonations();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to flag donation');
            }
        } catch (err) {
            alert('Failed to flag donation');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            PENDING: { bg: '#fef3c7', text: '#92400e' },
            APPROVED: { bg: '#d1fae5', text: '#065f46' },
            FLAGGED: { bg: '#fee2e2', text: '#991b1b' },
            REJECTED: { bg: '#e5e7eb', text: '#374151' },
        };
        const color = colors[status as keyof typeof colors] || colors.PENDING;

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: color.bg,
                color: color.text,
            }}>
                {status}
            </span>
        );
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Cash Donation Approvals</h1>
                    <p className={styles.subtitle}>
                        Review and approve cash donations
                    </p>
                </div>
                <Link href="/dashboard/donations/cash-entry">
                    <Button>+ Record Cash Donation</Button>
                </Link>
            </div>

            <div className={styles.filters}>
                {['PENDING', 'APPROVED', 'FLAGGED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {filter} Donations ({donations.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : donations.length === 0 ? (
                        <p className={styles.empty}>No {filter.toLowerCase()} donations found.</p>
                    ) : (
                        <div className={styles.donationsList}>
                            {donations.map((donation) => (
                                <div key={donation.id} className={styles.donationCard}>
                                    <div className={styles.donationHeader}>
                                        <div>
                                            <h3 className={styles.donationAmount}>
                                                ₦{donation.amount.toLocaleString()}
                                            </h3>
                                            <p className={styles.receiptCode}>{donation.receiptCode}</p>
                                        </div>
                                        {getStatusBadge(donation.approvalStatus)}
                                    </div>

                                    <div className={styles.donationDetails}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Campaign:</span>
                                            <Link
                                                href={`/campaigns/${donation.campaign.id}`}
                                                className={styles.link}
                                            >
                                                {donation.campaign.title}
                                            </Link>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Donor:</span>
                                            <span>{donation.donor?.name || 'Unknown'} ({donation.donor?.email})</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Recorded by:</span>
                                            <span>{donation.receiver?.name || 'System'}</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Date:</span>
                                            <span>{formatDate(donation.createdAt)}</span>
                                        </div>
                                        {donation.notes && (
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Notes:</span>
                                                <span className={styles.notes}>{donation.notes}</span>
                                            </div>
                                        )}
                                        {donation.flagReason && (
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Flag Reason:</span>
                                                <span className={styles.flagReason}>{donation.flagReason}</span>
                                            </div>
                                        )}
                                        {donation.approver && (
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Reviewed by:</span>
                                                <span>{donation.approver.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {donation.approvalStatus === 'PENDING' && (
                                        <div className={styles.actions}>
                                            <Button
                                                variant="outline"
                                                size="small"
                                                onClick={() => handleFlag(donation.id)}
                                                disabled={actionLoading === donation.id}
                                            >
                                                Flag
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => handleApprove(donation.id)}
                                                disabled={actionLoading === donation.id}
                                            >
                                                {actionLoading === donation.id ? 'Processing...' : 'Approve'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
