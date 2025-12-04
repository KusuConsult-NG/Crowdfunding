import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { generateReceiptCode, checkDuplicateDonation } from '@/lib/receipt-generator';
import { sendDonationConfirmationEmail } from '@/lib/email';

// POST /api/donations/cash - Record cash donation
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        // Only admins and super admins can record cash donations
        if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized. Only administrators can record cash donations.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { amount, campaignId, donorName, donorEmail, notes, isAnonymous } = body;

        // Validate required fields
        if (!amount || !campaignId || !donorEmail) {
            return NextResponse.json(
                { error: 'Amount, campaign, and donor email are required' },
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

        // Check for potential duplicates
        const isDuplicate = await checkDuplicateDonation(
            parseFloat(amount),
            donorEmail,
            campaignId,
            prisma
        );

        if (isDuplicate) {
            return NextResponse.json(
                { error: 'Potential duplicate donation detected. Please wait a moment before recording again.' },
                { status: 409 }
            );
        }

        // Find or create donor user
        let donor = await prisma.user.findUnique({
            where: { email: donorEmail },
        });

        if (!donor) {
            // Create a new user for the donor if they don't exist
            // Generate a random password since they are created via admin entry
            const randomPassword = Math.random().toString(36).slice(-8);

            donor = await prisma.user.create({
                data: {
                    name: donorName,
                    email: donorEmail,
                    password: randomPassword, // In a real app, we'd handle this better
                    role: 'DONOR',
                },
            });
        }

        // Generate receipt code
        const receiptCode = generateReceiptCode('CASH');

        // Create the donation
        const donation = await prisma.donation.create({
            data: {
                amount: parseFloat(amount),
                currency: 'NGN', // Default to NGN for cash
                campaignId,
                donorId: donor.id,
                status: 'SUCCESS', // Cash donations are successful immediately
                donationType: 'CASH',
                receiptCode,
                receivedBy: session.user.id,
                approvalStatus: 'PENDING', // Needs approval
                notes,
                isAnonymous: isAnonymous || false,
            },
        });

        if (isDuplicate) {
            return NextResponse.json(
                {
                    warning: 'Potential duplicate detected',
                    message: 'A similar donation was recorded in the last 24 hours. Please verify before proceeding.',
                },
                { status: 409 }
            );
        }

        // Find or create donor user
        let donor = await prisma.user.findUnique({
            where: { email: donorEmail },
        });

        if (!donor) {
            // Create donor user if not exists
            donor = await prisma.user.create({
                data: {
                    email: donorEmail,
                    name: donorName || 'Anonymous Donor',
                    password: '', // No password for auto-created donors
                    role: 'DONOR',
                },
            });
        }

        // Generate unique receipt code
        const receiptCode = generateReceiptCode();

        // Create cash donation
        const donation = await prisma.donation.create({
            data: {
                amount: parseFloat(amount),
                currency: campaign.currency,
                donationType: 'CASH',
                status: 'SUCCESS', // Cash is already received
                receiptCode,
                campaignId,
                donorId: donor.id,
                receivedBy: session.user!.id, // Staff who recorded this
                approvalStatus: 'PENDING', // Requires admin approval
                notes,
            },
            include: {
                donor: {
                    select: { name: true, email: true },
                },
                receiver: {
                    select: { name: true, email: true },
                },
                campaign: {
                    select: { title: true },
                },
            },
        });

        // Send confirmation email immediately for cash donations
        sendDonationConfirmationEmail({
            donorName: donor.name || 'Valued Donor',
            donorEmail: donor.email,
            amount: parseFloat(amount),
            currency: campaign.currency,
            campaignTitle: campaign.title,
            campaignId: campaign.id,
            receiptCode,
            paymentMethod: 'CASH',
            donationDate: new Date(),
            isRegisteredUser: !!donor.password,
        }).catch((error) => {
            console.error('Failed to send confirmation email:', error);
        });

        return NextResponse.json({
            donation,
            message: 'Cash donation recorded successfully. Awaiting admin approval to update campaign total. Confirmation email sent.',
        }, { status: 201 });
    } catch (error) {
        console.error('Error recording cash donation:', error);
        return NextResponse.json(
            { error: 'Failed to record cash donation' },
            { status: 500 }
        );
    }
}

// GET /api/donations/cash - Get all cash donations (for admin review)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = {
            donationType: 'CASH',
        };

        if (status) {
            where.approvalStatus = status;
        }

        const cashDonations = await prisma.donation.findMany({
            where,
            include: {
                donor: {
                    select: { name: true, email: true },
                },
                receiver: {
                    select: { name: true, email: true },
                },
                approver: {
                    select: { name: true, email: true },
                },
                campaign: {
                    select: { title: true, id: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(cashDonations);
    } catch (error) {
        console.error('Error fetching cash donations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cash donations' },
            { status: 500 }
        );
    }
}
