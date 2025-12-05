import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDonationConfirmationEmail } from '@/lib/email';

// POST /api/donations/verify - Verify payment and update donation status
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reference, status } = body;

        if (!reference) {
            return NextResponse.json(
                { error: 'Payment reference is required' },
                { status: 400 }
            );
        }

        // Find donation by payment reference
        const donation = await prisma.donation.findUnique({
            where: { paymentReference: reference },
            include: {
                campaign: true,
                donor: true,
            },
        });

        if (!donation) {
            return NextResponse.json(
                { error: 'Donation not found' },
                { status: 404 }
            );
        }

        if (donation.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Donation already processed' },
                { status: 400 }
            );
        }

        // Verify payment with payment gateway
        const { paystackService } = await import('@/lib/paystack');
        let paymentStatus: 'SUCCESS' | 'FAILED' = 'FAILED';

        try {
            const verification = await paystackService.verifyPayment(reference);
            if (verification.status && verification.data.status === 'success') {
                // Verify amount matches (paystack returns kobo)
                const expectedAmountKobo = Math.round(donation.amount * 100);
                if (verification.data.amount >= expectedAmountKobo) {
                    paymentStatus = 'SUCCESS';
                } else {
                    console.error('Payment amount mismatch', { expected: expectedAmountKobo, got: verification.data.amount });
                }
            }
        } catch (err) {
            console.error('Paystack verification failed:', err);
        }

        // Update donation status
        const updatedDonation = await prisma.donation.update({
            where: { id: donation.id },
            data: { status: paymentStatus },
        });

        // If payment successful, update campaign amount
        if (paymentStatus === 'SUCCESS') {
            await prisma.campaign.update({
                where: { id: donation.campaignId },
                data: {
                    currentAmount: {
                        increment: donation.amount,
                    },
                },
            });

            // Send confirmation email (async, don't block response)
            if (donation.donor) {
                sendDonationConfirmationEmail({
                    donorName: donation.donor.name || 'Valued Donor',
                    donorEmail: donation.donor.email,
                    amount: donation.amount,
                    currency: donation.campaign.currency,
                    campaignTitle: donation.campaign.title,
                    campaignId: donation.campaign.id,
                    receiptCode: donation.paymentReference || 'N/A',
                    paymentMethod: 'ONLINE',
                    donationDate: new Date(),
                    isRegisteredUser: !!donation.donor.password, // Has password = registered
                }).catch((error) => {
                    console.error('Failed to send confirmation email:', error);
                    // Don't fail the donation if email fails
                });
            }
        }

        return NextResponse.json({
            donation: updatedDonation,
            message: paymentStatus === 'SUCCESS'
                ? 'Payment verified and donation recorded successfully. Confirmation email sent.'
                : 'Payment verification failed',
        });
    } catch (error) {
        console.error('Error verifying donation:', error);
        return NextResponse.json(
            { error: 'Failed to verify donation' },
            { status: 500 }
        );
    }
}
