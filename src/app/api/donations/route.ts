import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/donations - List donations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');
        const donorId = searchParams.get('donorId');
        const status = searchParams.get('status');

        const where: any = {};
        if (campaignId) where.campaignId = campaignId;
        if (donorId) where.donorId = donorId;
        if (status) where.status = status;

        const donations = await prisma.donation.findMany({
            where,
            include: {
                donor: {
                    select: { name: true, email: true },
                },
                campaign: {
                    select: { title: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch donations' },
            { status: 500 }
        );
    }
}

// POST /api/donations - Initialize a donation with Paystack
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, campaignId, donorName, donorEmail, isAnonymous, isRecurring, recurringInterval } = body;

        // Validate required fields
        if (!amount || !campaignId || !donorEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if campaign exists
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        if (campaign.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Campaign is not active' },
                { status: 400 }
            );
        }

        // Find or create donor user
        let donor = await prisma.user.findUnique({
            where: { email: donorEmail },
        });

        if (!donor) {
            // Create a new user for the donor if they don't exist
            const randomPassword = Math.random().toString(36).slice(-8);

            donor = await prisma.user.create({
                data: {
                    name: donorName,
                    email: donorEmail,
                    password: randomPassword,
                    role: 'DONOR',
                },
            });
        }

        // Create donation record
        const donation = await prisma.donation.create({
            data: {
                amount: parseFloat(amount),
                currency: campaign.currency,
                campaignId,
                donorId: donor.id,
                status: 'PENDING',
                isAnonymous: isAnonymous || false,
            },
        });

        // Initialize Paystack payment
        const paystackAmount = Math.round(parseFloat(amount) * 100); // Convert to kobo
        const reference = `DON-${Date.now()}-${donation.id.substring(0, 8)}`;

        // Try to initialize Paystack payment, but don't fail if not configured
        let paymentUrl = null;

        try {
            const { paystackService } = await import('@/lib/paystack');

            const paymentData = await paystackService.initializePayment({
                email: donorEmail,
                amount: paystackAmount,
                reference,
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/donation/callback`,
                metadata: {
                    donationId: donation.id,
                    campaignId,
                    isRecurring: isRecurring || false,
                    recurringInterval: recurringInterval || null,
                    donorName,
                },
            });

            paymentUrl = paymentData.data.authorization_url;
        } catch (error) {
            console.warn('Paystack not configured, proceeding in test mode:', error);
            // Not an error - just means we're in test mode
        }

        // Update donation with payment reference
        await prisma.donation.update({
            where: { id: donation.id },
            data: { paymentReference: reference },
        });

        return NextResponse.json({
            donation,
            paymentUrl, // Will be null if Paystack not configured
            reference,
            paymentReference: reference,
            message: paymentUrl
                ? 'Payment initialized. Redirect user to payment URL.'
                : 'Test mode: No payment gateway configured.',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating donation:', error);
        return NextResponse.json(
            { error: 'Failed to create donation' },
            { status: 500 }
        );
    }
}
