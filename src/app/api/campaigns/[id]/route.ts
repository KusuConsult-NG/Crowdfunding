import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: params.id },
            include: {
                branch: true,
                creator: {
                    select: { name: true, email: true },
                },
                donations: {
                    include: {
                        donor: {
                            select: { name: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaign' },
            { status: 500 }
        );
    }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user details
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true, role: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if campaign exists and get creator
        const existingCampaign = await prisma.campaign.findUnique({
            where: { id: params.id },
            select: { creatorId: true }
        });

        if (!existingCampaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Authorization: Only creator or SUPER_ADMIN can edit
        if (existingCampaign.creatorId !== user.id && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'You do not have permission to edit this campaign' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, description, targetAmount, currency, status, startDate, endDate } = body;

        const campaign = await prisma.campaign.update({
            where: { id: params.id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(targetAmount && { targetAmount: parseFloat(targetAmount) }),
                ...(currency && { currency }),
                ...(status && { status }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
            },
            include: {
                branch: true,
                creator: {
                    select: { name: true, email: true },
                },
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to update campaign' },
            { status: 500 }
        );
    }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if campaign has donations
        const campaign = await prisma.campaign.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { donations: true },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        if (campaign._count.donations > 0) {
            return NextResponse.json(
                { error: 'Cannot delete campaign with existing donations. Archive it instead.' },
                { status: 400 }
            );
        }

        await prisma.campaign.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        return NextResponse.json(
            { error: 'Failed to delete campaign' },
            { status: 500 }
        );
    }
}
