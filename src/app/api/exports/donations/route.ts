import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { format } from 'date-fns';

// GET /api/exports/donations - Export donations to CSV
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const campaignId = searchParams.get('campaignId');
        const status = searchParams.get('status');

        // Build where clause
        const where: any = {};

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        if (campaignId) {
            where.campaignId = campaignId;
        }

        if (status) {
            where.status = status;
        }

        // Fetch donations
        const donations = await prisma.donation.findMany({
            where,
            include: {
                donor: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                campaign: {
                    select: {
                        title: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Convert to CSV format
        const csvData = donations.map((donation) => ({
            'Date': format(donation.createdAt, 'yyyy-MM-dd HH:mm:ss'),
            'Donor Name': donation.donor?.name || 'Anonymous',
            'Donor Email': donation.donor?.email || 'N/A',
            'Campaign': donation.campaign.title,
            'Amount': donation.amount,
            'Currency': donation.currency,
            'Payment Method': donation.donationType || 'ONLINE',
            'Receipt Code': donation.receiptCode || donation.paymentReference || 'N/A',
            'Status': donation.status,
            'Approval Status': donation.approvalStatus || 'N/A',
        }));

        // Convert to CSV string
        const headers = Object.keys(csvData[0] || {});
        const csvRows = [
            headers.join(','),
            ...csvData.map(row =>
                headers.map(header => {
                    const value = row[header as keyof typeof row];
                    // Escape commas and quotes
                    const escaped = String(value).replace(/"/g, '""');
                    return `"${escaped}"`;
                }).join(',')
            ),
        ];

        const csvString = csvRows.join('\n');

        // Return CSV file
        return new NextResponse(csvString, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="donations_${format(new Date(), 'yyyy-MM-dd')}.csv"`,
            },
        });
    } catch (error) {
        console.error('Error exporting donations:', error);
        return NextResponse.json(
            { error: 'Failed to export donations' },
            { status: 500 }
        );
    }
}
