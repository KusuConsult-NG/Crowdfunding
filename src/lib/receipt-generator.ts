/**
 * Generate a unique receipt code for cash donations
 * Format: CASH-YYYYMMDD-RANDOM6
 * Example: CASH-20241204-A8X9K2
 */
export function generateReceiptCode(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dateStr = `${year}${month}${day}`;

    // Generate 6-character random alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 6; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `CASH-${dateStr}-${randomCode}`;
}

/**
 * Check for potential duplicate donations
 * Returns true if a similar donation exists within the last 24 hours
 */
export async function checkDuplicateDonation(
    amount: number,
    donorEmail: string,
    campaignId: string,
    prisma: any
): Promise<boolean> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existing = await prisma.donation.findFirst({
        where: {
            amount,
            campaignId,
            donor: {
                email: donorEmail,
            },
            createdAt: {
                gte: oneDayAgo,
            },
        },
    });

    return !!existing;
}
