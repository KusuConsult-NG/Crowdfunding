import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isTokenValid } from '@/lib/reset-token';
import bcrypt from 'bcryptjs';

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Find reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: 'Invalid or expired reset link' },
                { status: 400 }
            );
        }

        // Check if token is valid (not expired or used)
        if (!isTokenValid(resetToken.expiresAt, resetToken.used)) {
            return NextResponse.json(
                { error: 'Invalid or expired reset link' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { email: resetToken.email },
                data: { password: hashedPassword },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used: true },
            }),
        ]);

        return NextResponse.json({
            message: 'Password reset successfully. You can now login with your new password.',
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    }
}
