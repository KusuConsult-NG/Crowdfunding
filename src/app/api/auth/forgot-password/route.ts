import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateResetToken } from '@/lib/reset-token';
import { sendPasswordResetEmail } from '@/lib/password-reset-email';

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists (but don't reveal if they don't for security)
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: 'If an account exists with that email, you will receive a password reset link.',
            });
        }

        // Invalidate any existing tokens for this email
        await prisma.passwordResetToken.updateMany({
            where: {
                email: email.toLowerCase(),
                used: false,
            },
            data: { used: true },
        });

        // Generate new reset token
        const { token, expiresAt } = generateResetToken();

        // Save token to database
        await prisma.passwordResetToken.create({
            data: {
                email: email.toLowerCase(),
                token,
                expiresAt,
            },
        });

        // Send reset email
        await sendPasswordResetEmail(email, token);

        return NextResponse.json({
            message: 'If an account exists with that email, you will receive a password reset link.',
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
