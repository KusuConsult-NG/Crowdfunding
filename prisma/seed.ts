import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@ecwa.org' },
        update: {},
        create: {
            email: 'admin@ecwa.org',
            password: hashedPassword,
            name: 'Admin User',
            role: 'SUPER_ADMIN',
        },
    });

    console.log('Created admin user:', adminUser.email);

    // Create a branch
    const branch = await prisma.branch.upsert({
        where: { id: 'branch-1' },
        update: {},
        create: {
            id: 'branch-1',
            name: 'ECWA Headquarters',
            location: 'Jos, Plateau State',
        },
    });

    console.log('Created branch:', branch.name);

    // Create campaigns
    const campaigns = await Promise.all([
        prisma.campaign.upsert({
            where: { id: 'campaign-1' },
            update: {},
            create: {
                id: 'campaign-1',
                title: 'Mission Support 2025',
                description: 'Supporting our missionaries across Africa with resources and training.',
                targetAmount: 5000000,
                currentAmount: 3250000,
                status: 'ACTIVE',
                branchId: branch.id,
                creatorId: adminUser.id,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
            },
        }),
        prisma.campaign.upsert({
            where: { id: 'campaign-2' },
            update: {},
            create: {
                id: 'campaign-2',
                title: 'Church Building Project',
                description: 'Construction of new worship center in Abuja district.',
                targetAmount: 10000000,
                currentAmount: 6500000,
                status: 'ACTIVE',
                branchId: branch.id,
                creatorId: adminUser.id,
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-06-30'),
            },
        }),
        prisma.campaign.upsert({
            where: { id: 'campaign-3' },
            update: {},
            create: {
                id: 'campaign-3',
                title: 'Youth Empowerment Program',
                description: 'Skills training and mentorship for young people in our community.',
                targetAmount: 2000000,
                currentAmount: 1200000,
                status: 'ACTIVE',
                branchId: branch.id,
                creatorId: adminUser.id,
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-11-30'),
            },
        }),
    ]);

    console.log('Created campaigns:', campaigns.length);

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
