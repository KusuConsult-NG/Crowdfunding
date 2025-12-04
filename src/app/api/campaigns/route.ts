import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const branchId = searchParams.get('branchId');

        const where: any = {};
        if (status) where.status = status;
        if (branchId) where.branchId = branchId;

        const campaigns = await prisma.campaign.findMany({
            where,
            include: {
                branch: true,
                creator: {
                    select: { name: true, email: true },
                },
                _count: {
                    select: { donations: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaigns' },
            { status: 500 }
        );
    }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, targetAmount, currency, branchId, startDate, endDate } = body;

        // Validate required fields
        if (!title || !description || !targetAmount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user from database to use as creator
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                description,
                targetAmount: parseFloat(targetAmount),
                currency: currency || 'NGN',
                branchId: branchId || null,
                creatorId: user.id,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                status: 'ACTIVE',
            },
            include: {
                branch: true,
                creator: {
                    select: { name: true, email: true },
                },
            },
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign' },
            { status: 500 }
        );
    }
}
