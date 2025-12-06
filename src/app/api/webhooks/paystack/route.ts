import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Get the raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('x-paystack-signature');

        // Verify webhook signature
        const secret = process.env.PAYSTACK_SECRET_KEY || '';
        const hash = crypto
            .createHmac('sha512', secret)
            .update(body)
            .digest('hex');

        if (hash !== signature) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse the body
        const event = JSON.parse(body);

        console.log('Paystack webhook event:', event.event);

        // Handle different event types
        switch (event.event) {
            case 'charge.success':
                await handleSuccessfulCharge(event.data);
                break;

            case 'charge.failed':
                await handleFailedCharge(event.data);
                break;

            default:
                console.log('Unhandled event type:', event.event);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handleSuccessfulCharge(data: any) {
    try {
        const reference = data.reference;

        // Find the donation by payment reference
        const donation = await prisma.donation.findFirst({
            where: { paymentReference: reference },
            include: { campaign: true },
        });

        if (!donation) {
            console.error('Donation not found for reference:', reference);
            return;
        }

        // Update donation status
        await prisma.donation.update({
            where: { id: donation.id },
            data: {
                status: 'SUCCESS',
            },
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

        console.log('Payment successful for donation:', donation.id);

        // TODO: Send confirmation email to donor
        // TODO: Send notification to campaign creator

    } catch (error) {
        console.error('Error handling successful charge:', error);
        throw error;
    }
}

async function handleFailedCharge(data: any) {
    try {
        const reference = data.reference;

        // Find the donation by payment reference
        const donation = await prisma.donation.findFirst({
            where: { paymentReference: reference },
        });

        if (!donation) {
            console.error('Donation not found for reference:', reference);
            return;
        }

        // Update donation status to FAILED
        await prisma.donation.update({
            where: { id: donation.id },
            data: {
                status: 'FAILED',
            },
        });

        console.log('Payment failed for donation:', donation.id);

        // TODO: Send failure notification to donor

    } catch (error) {
        console.error('Error handling failed charge:', error);
        throw error;
    }
}
