import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PUT /api/donations/[id]/flag - Flag suspicious donation
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        // Only admins and super admins can flag
        if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { reason } = body;

        if (!reason) {
            return NextResponse.json(
                { error: 'Flag reason is required' },
                { status: 400 }
            );
        }

        const donation = await prisma.donation.findUnique({
            where: { id: params.id },
        });

        if (!donation) {
            return NextResponse.json(
                { error: 'Donation not found' },
                { status: 404 }
            );
        }

        const updatedDonation = await prisma.donation.update({
            where: { id: params.id },
            data: {
                approvalStatus: 'FLAGGED',
                flagReason: reason,
                approvedBy: session.user!.id,
                approvedAt: new Date(),
            },
        });

        return NextResponse.json({
            donation: updatedDonation,
            message: 'Donation flagged for review',
        });
    } catch (error) {
        console.error('Error flagging donation:', error);
        return NextResponse.json(
            { error: 'Failed to flag donation' },
            { status: 500 }
        );
    }
}
