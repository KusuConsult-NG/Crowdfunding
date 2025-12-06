import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/donations/[id]/test-success - Mark donation as successful for testing
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const donationId = params.id;

        // Find the donation
        const donation = await prisma.donation.findUnique({
            where: { id: donationId },
            include: { campaign: true },
        });

        if (!donation) {
            return NextResponse.json(
                { error: 'Donation not found' },
                { status: 404 }
            );
        }

        if (donation.status === 'SUCCESS') {
            return NextResponse.json(
                { message: 'Donation already processed' },
                { status: 200 }
            );
        }

        // Update donation status to SUCCESS
        await prisma.donation.update({
            where: { id: donationId },
            data: { status: 'SUCCESS' },
        });

        // Update campaign's current amount
        await prisma.campaign.update({
            where: { id: donation.campaignId },
            data: {
                currentAmount: {
                    increment: donation.amount,
                },
            },
        });

        return NextResponse.json({
            message: 'Donation marked as successful',
            donation: {
                ...donation,
                status: 'SUCCESS',
            },
        });
    } catch (error) {
        console.error('Error marking donation as successful:', error);
        return NextResponse.json(
            { error: 'Failed to update donation' },
            { status: 500 }
        );
    }
}
