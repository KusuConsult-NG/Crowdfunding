import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

// GET /api/analytics/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = startOfDay(subDays(new Date(), days));
        const endDate = endOfDay(new Date());

        // Total statistics
        const [
            totalRaised,
            totalDonations,
            totalDonors,
            activeCampaigns,
            todaysDonations,
        ] = await Promise.all([
            // Total amount raised (all time)
            prisma.donation.aggregate({
                where: { status: 'SUCCESS' },
                _sum: { amount: true },
            }),

            // Total donation count
            prisma.donation.count({
                where: { status: 'SUCCESS' },
            }),

            // Unique donors
            prisma.donation.findMany({
                where: { status: 'SUCCESS' },
                select: { donorId: true },
                distinct: ['donorId'],
            }),

            // Active campaigns
            prisma.campaign.count({
                where: { status: 'ACTIVE' },
            }),

            // Today's donations
            prisma.donation.aggregate({
                where: {
                    status: 'SUCCESS',
                    createdAt: {
                        gte: startOfDay(new Date()),
                        lte: endOfDay(new Date()),
                    },
                },
                _sum: { amount: true },
                _count: true,
            }),
        ]);

        // Donation trends (daily breakdown)
        const donations = await prisma.donation.findMany({
            where: {
                status: 'SUCCESS',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                amount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        // Group by date
        const trendsByDate: Record<string, { date: string; amount: number; count: number }> = {};

        donations.forEach((donation: { createdAt: Date; amount: number }) => {
            const dateKey = format(donation.createdAt, 'yyyy-MM-dd');
            if (!trendsByDate[dateKey]) {
                trendsByDate[dateKey] = {
                    date: dateKey,
                    amount: 0,
                    count: 0,
                };
            }
            trendsByDate[dateKey].amount += donation.amount;
            trendsByDate[dateKey].count += 1;
        });

        const trends = Object.values(trendsByDate).sort((a, b) =>
            a.date.localeCompare(b.date)
        );

        // Top campaigns
        const topCampaigns = await prisma.campaign.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                title: true,
                targetAmount: true,
                currentAmount: true,
                currency: true,
                category: {
                    select: {
                        name: true,
                        icon: true,
                        color: true,
                    },
                },
                _count: {
                    select: { donations: true },
                },
            },
            orderBy: { currentAmount: 'desc' },
            take: 5,
        });

        // Top donors
        const donorStats = await prisma.donation.groupBy({
            by: ['donorId'],
            where: {
                status: 'SUCCESS',
                donorId: { not: null },
                isAnonymous: false, // Only count public donations for leaderboard
            },
            _sum: { amount: true },
            _count: true,
            orderBy: {
                _sum: { amount: 'desc' },
            },
            take: 10,
        });

        const topDonors = await Promise.all(
            donorStats.map(async (stat) => {
                const donor = await prisma.user.findUnique({
                    where: { id: stat.donorId! },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                });
                return {
                    ...donor,
                    totalAmount: stat._sum?.amount || 0,
                    donationCount: stat._count,
                };
            })
        );

        // Average donation
        const avgDonation = totalRaised._sum.amount && totalDonations > 0
            ? totalRaised._sum.amount / totalDonations
            : 0;

        return NextResponse.json({
            summary: {
                totalRaised: totalRaised._sum.amount || 0,
                totalDonations,
                totalDonors: totalDonors.length,
                activeCampaigns,
                todaysAmount: todaysDonations._sum.amount || 0,
                todaysCount: todaysDonations._count || 0,
                averageDonation: avgDonation,
            },
            trends,
            topCampaigns,
            topDonors,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
