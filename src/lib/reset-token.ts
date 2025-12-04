import crypto from 'crypto';

export interface ResetToken {
    token: string;
    expiresAt: Date;
}

/**
 * Generate a secure random token for password reset
 * Returns a 32-byte hex string (64 characters)
 */
export function generateResetToken(): ResetToken {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    return { token, expiresAt };
}

/**
 * Check if a reset token is still valid
 */
export function isTokenValid(expiresAt: Date, used: boolean): boolean {
    if (used) return false;
    return new Date() < expiresAt;
}

/**
 * Hash a token for storage (optional extra security)
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}
