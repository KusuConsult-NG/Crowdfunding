import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateReceiptPDF } from '@/lib/receipt-pdf';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const donation = await prisma.donation.findUnique({
            where: { id: params.id },
            include: {
                campaign: {
                    select: { title: true },
                },
                donor: {
                    select: { name: true },
                },
            },
        });

        if (!donation) {
            return NextResponse.json(
                { error: 'Donation not found' },
                { status: 404 }
            );
        }

        // Generate PDF
        const pdfBuffer = generateReceiptPDF({
            receiptNumber: donation.receiptCode || donation.paymentReference || donation.id.slice(0, 8).toUpperCase(),
            date: donation.createdAt,
            donorName: donation.isAnonymous ? 'Anonymous Donor' : (donation.donor?.name || 'Guest Donor'),
            amount: donation.amount,
            currency: donation.currency,
            campaignTitle: donation.campaign.title,
            paymentMethod: donation.donationType || 'ONLINE',
        });

        // Return PDF
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="receipt-${donation.receiptCode || donation.id}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error generating receipt:', error);
        return NextResponse.json(
            { error: 'Failed to generate receipt' },
            { status: 500 }
        );
    }
}
