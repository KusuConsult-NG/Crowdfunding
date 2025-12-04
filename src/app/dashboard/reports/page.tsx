'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { format } from 'date-fns';
import styles from './page.module.css';

export default function ReportsPage() {
    const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [filter, setFilter] = useState<{ campaignId?: string; status?: string }>({});
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);

        try {
            const params = new URLSearchParams({
                startDate,
                endDate,
                ...(filter.campaignId && { campaignId: filter.campaignId }),
                ...(filter.status && { status: filter.status }),
            });

            const response = await fetch(`/api/exports/donations?${params}`);

            if (!response.ok) {
                throw new Error('Export failed');
            }

            // Trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `donations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export donations');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Reports & Exports</h1>
                    <p>Generate and export donation reports</p>
                </div>
            </div>

            <div className={styles.content}>
                <Card>
                    <CardHeader>
                        <CardTitle>Donation Export</CardTitle>
                        <CardDescription>
                            Export donation data to CSV for analysis and record-keeping
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Status Filter</label>
                                    <select
                                        value={filter.status || ''}
                                        onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="SUCCESS">Success</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="FAILED">Failed</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.exportInfo}>
                                <div className={styles.infoBox}>
                                    <h4>📊 Export Includes:</h4>
                                    <ul>
                                        <li>Date & time</li>
                                        <li>Donor name & email</li>
                                        <li>Campaign name</li>
                                        <li>Amount & currency</li>
                                        <li>Payment method</li>
                                        <li>Receipt/reference code</li>
                                        <li>Status & approval status</li>
                                    </ul>
                                </div>

                                <div className={styles.infoBox}>
                                    <h4>💡 Use Cases:</h4>
                                    <ul>
                                        <li>Financial reporting</li>
                                        <li>Tax compliance</li>
                                        <li>Donor analysis</li>
                                        <li>Auditing & record-keeping</li>
                                    </ul>
                                </div>
                            </div>

                            <Button
                                onClick={handleExport}
                                disabled={exporting}
                                fullWidth
                                size="large"
                            >
                                {exporting ? 'Exporting...' : '📥 Export to CSV'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className={styles.quickExports}>
                    <h3>Quick Exports</h3>
                    <div className={styles.quickGrid}>
                        <Card className={styles.quickCard} onClick={() => {
                            setStartDate(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
                            setEndDate(format(new Date(), 'yyyy-MM-dd'));
                            setFilter({});
                        }}>
                            <div className={styles.quickIcon}>📅</div>
                            <div className={styles.quickTitle}>This Month</div>
                            <div className={styles.quickDesc}>All donations this month</div>
                        </Card>

                        <Card className={styles.quickCard} onClick={() => {
                            const lastMonth = new Date();
                            lastMonth.setMonth(lastMonth.getMonth() - 1);
                            setStartDate(format(new Date(lastMonth.setDate(1)), 'yyyy-MM-dd'));
                            setEndDate(format(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0), 'yyyy-MM-dd'));
                            setFilter({});
                        }}>
                            <div className={styles.quickIcon}>📆</div>
                            <div className={styles.quickTitle}>Last Month</div>
                            <div className={styles.quickDesc}>Previous month's donations</div>
                        </Card>

                        <Card className={styles.quickCard} onClick={() => {
                            const yearStart = new Date(new Date().getFullYear(), 0, 1);
                            setStartDate(format(yearStart, 'yyyy-MM-dd'));
                            setEndDate(format(new Date(), 'yyyy-MM-dd'));
                            setFilter({});
                        }}>
                            <div className={styles.quickIcon}>📊</div>
                            <div className={styles.quickTitle}>Year to Date</div>
                            <div className={styles.quickDesc}>All donations this year</div>
                        </Card>

                        <Card className={styles.quickCard} onClick={() => {
                            setStartDate(format(new Date(new Date().setFullYear(new Date().getFullYear() - 10)), 'yyyy-MM-dd'));
                            setEndDate(format(new Date(), 'yyyy-MM-dd'));
                            setFilter({});
                        }}>
                            <div className={styles.quickIcon}>🗂️</div>
                            <div className={styles.quickTitle}>All Time</div>
                            <div className={styles.quickDesc}>Complete donation history</div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
