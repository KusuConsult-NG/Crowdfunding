import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Paystack webhook handler for subscription charges
export async function POST(request: NextRequest) {
    try {
        // Verify Paystack signature
        const signature = request.headers.get('x-paystack-signature');
        const body = await request.text();

        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
            .update(body)
            .digest('hex');

        if (hash !== signature) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const event = JSON.parse(body);

        // Handle different webhook events
        switch (event.event) {
            case 'charge.success':
                await handleChargeSuccess(event.data);
                break;

            case 'subscription.create':
                await handleSubscriptionCreate(event.data);
                break;

            case 'subscription.disable':
                await handleSubscriptionDisable(event.data);
                break;

            case 'subscription.not_renew':
                await handleSubscriptionNotRenew(event.data);
                break;

            default:
                console.log('Unhandled webhook event:', event.event);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle successful charge (including recurring charges)
async function handleChargeSuccess(data: any) {
    const { reference, amount, customer, authorization, metadata } = data;

    // Check if this is a subscription charge
    if (metadata?.subscriptionId) {
        // Find subscription
        const subscription = await prisma.subscription.findUnique({
            where: { id: metadata.subscriptionId },
            include: { campaign: true, user: true },
        });

        if (!subscription) {
            console.error('Subscription not found:', metadata.subscriptionId);
            return;
        }

        // Create donation record for this recurring charge
        const donation = await prisma.donation.create({
            data: {
                amount: amount / 100, // Convert from kobo to naira
                currency: 'NGN',
                status: 'SUCCESS',
                paymentReference: reference,
                donorId: subscription.userId,
                campaignId: subscription.campaignId!,
                subscriptionId: subscription.id,
                donationType: 'ONLINE',
            },
        });

        // Update campaign amount
        if (subscription.campaignId) {
            await prisma.campaign.update({
                where: { id: subscription.campaignId },
                data: {
                    currentAmount: {
                        increment: amount / 100,
                    },
                },
            });
        }

        // Update subscription - set last payment date and calculate next
        const nextPaymentDate = calculateNextPaymentDate(
            subscription.interval,
            new Date()
        );

        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                lastPaymentDate: new Date(),
                nextPaymentDate,
                paymentMethodId: authorization.authorization_code,
            },
        });

        console.log('Recurring donation created:', donation.id);
    }
}

// Handle new subscription creation
async function handleSubscriptionCreate(data: any) {
    console.log('Subscription created:', data);
    // Additional logic if needed
}

// Handle subscription disable
async function handleSubscriptionDisable(data: any) {
    const { subscription_code } = data;

    // Find and update subscription status
    const subscription = await prisma.subscription.findFirst({
        where: { paymentMethodId: subscription_code },
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'CANCELLED' },
        });
    }
}

// Handle subscription not renewing
async function handleSubscriptionNotRenew(data: any) {
    const { subscription_code } = data;

    const subscription = await prisma.subscription.findFirst({
        where: { paymentMethodId: subscription_code },
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'FAILED' },
        });
    }
}

// Helper function to calculate next payment date
function calculateNextPaymentDate(
    interval: string,
    fromDate: Date = new Date()
): Date {
    const next = new Date(fromDate);

    switch (interval) {
        case 'WEEKLY':
            next.setDate(next.getDate() + 7);
            break;
        case 'MONTHLY':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'QUARTERLY':
            next.setMonth(next.getMonth() + 3);
            break;
        case 'YEARLY':
            next.setFullYear(next.getFullYear() + 1);
            break;
    }

    return next;
}
