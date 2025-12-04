import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST /api/subscriptions - Create a new recurring subscription
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { amount, campaignId, interval, paymentMethodId } = body;

        // Validate required fields
        if (!amount || !interval) {
            return NextResponse.json(
                { error: 'Amount and interval are required' },
                { status: 400 }
            );
        }

        // Calculate next payment date based on interval
        const now = new Date();
        const nextPaymentDate = new Date(now);

        switch (interval) {
            case 'WEEKLY':
                nextPaymentDate.setDate(now.getDate() + 7);
                break;
            case 'MONTHLY':
                nextPaymentDate.setMonth(now.getMonth() + 1);
                break;
            case 'QUARTERLY':
                nextPaymentDate.setMonth(now.getMonth() + 3);
                break;
            case 'YEARLY':
                nextPaymentDate.setFullYear(now.getFullYear() + 1);
                break;
        }

        // Create subscription
        const subscription = await prisma.subscription.create({
            data: {
                userId: session.user.id!,
                campaignId: campaignId || null,
                amount: parseFloat(amount),
                currency: 'NGN',
                interval,
                nextPaymentDate,
                paymentMethodId,
                provider: 'PAYSTACK', // Default to Paystack
                status: 'ACTIVE',
            },
            include: {
                campaign: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        return NextResponse.json(subscription, { status: 201 });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
        );
    }
}

// GET /api/subscriptions - Get user's subscriptions
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const subscriptions = await prisma.subscription.findMany({
            where: { userId: session.user.id! },
            include: {
                campaign: {
                    select: {
                        title: true,
                        id: true,
                    },
                },
                _count: {
                    select: { donations: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(subscriptions);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
}
