import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PUT /api/donations/[id]/approve - Approve cash donation
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        // Only super admins can approve
        if (!session || !session.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only super administrators can approve donations.' },
                { status: 403 }
            );
        }

        const donation = await prisma.donation.findUnique({
            where: { id: params.id },
            include: { campaign: true },
        });

        if (!donation) {
            return NextResponse.json(
                { error: 'Donation not found' },
                { status: 404 }
            );
        }

        if (donation.donationType !== 'CASH') {
            return NextResponse.json(
                { error: 'Only cash donations require approval' },
                { status: 400 }
            );
        }

        if (donation.approvalStatus !== 'PENDING') {
            return NextResponse.json(
                { error: 'Donation has already been processed' },
                { status: 400 }
            );
        }

        // Approve donation and update campaign amount
        const [updatedDonation] = await prisma.$transaction([
            prisma.donation.update({
                where: { id: params.id },
                data: {
                    approvalStatus: 'APPROVED',
                    approvedBy: session.user!.id,
                    approvedAt: new Date(),
                },
            }),
            prisma.campaign.update({
                where: { id: donation.campaignId },
                data: {
                    currentAmount: {
                        increment: donation.amount,
                    },
                },
            }),
        ]);

        return NextResponse.json({
            donation: updatedDonation,
            message: 'Donation approved and campaign amount updated',
        });
    } catch (error) {
        console.error('Error approving donation:', error);
        return NextResponse.json(
            { error: 'Failed to approve donation' },
            { status: 500 }
        );
    }
}
