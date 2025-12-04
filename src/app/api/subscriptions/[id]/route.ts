import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PATCH /api/subscriptions/[id] - Update subscription (pause, resume, cancel)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { action } = body; // 'pause', 'resume', 'cancel'

        // Find subscription
        const subscription = await prisma.subscription.findUnique({
            where: { id: params.id },
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'Subscription not found' },
                { status: 404 }
            );
        }

        // Check ownership
        if (subscription.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        let newStatus = subscription.status;

        switch (action) {
            case 'pause':
                newStatus = 'PAUSED';
                break;
            case 'resume':
                newStatus = 'ACTIVE';
                break;
            case 'cancel':
                newStatus = 'CANCELLED';
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        // Update subscription
        const updatedSubscription = await prisma.subscription.update({
            where: { id: params.id },
            data: { status: newStatus },
            include: {
                campaign: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedSubscription);
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
        );
    }
}
