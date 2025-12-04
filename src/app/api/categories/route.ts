import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/categories - Get all categories
export async function GET() {
    try {
        const categories = await prisma.campaignCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { campaigns: true },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create new category (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized. Only administrators can create categories.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, icon, color } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        const category = await prisma.campaignCategory.create({
            data: {
                name,
                description,
                icon,
                color,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A category with this name already exists' },
                { status: 409 }
            );
        }

        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}
