import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PUT /api/categories/[id] - Update category
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, icon, color } = body;

        const category = await prisma.campaignCategory.update({
            where: { id: params.id },
            data: {
                name,
                description,
                icon,
                color,
            },
        });

        return NextResponse.json(category);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only super admins can delete categories.' },
                { status: 403 }
            );
        }

        // Check if category is in use
        const category = await prisma.campaignCategory.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { campaigns: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        if (category._count.campaigns > 0) {
            return NextResponse.json(
                { error: `Cannot delete category. It is used by ${category._count.campaigns} campaign(s).` },
                { status: 400 }
            );
        }

        await prisma.campaignCategory.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
