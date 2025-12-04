import { prisma } from '../src/lib/prisma';

const DEFAULT_CATEGORIES = [
    {
        name: 'Building Projects',
        description: 'Church construction, renovation, and infrastructure',
        icon: '🏗️',
        color: '#f59e0b',
    },
    {
        name: 'Missions',
        description: 'Evangelism, outreach, and missionary work',
        icon: '🌍',
        color: '#10b981',
    },
    {
        name: 'Education & Training',
        description: 'Theological education, workshops, and capacity building',
        icon: '📚',
        color: '#3b82f6',
    },
    {
        name: 'Community Outreach',
        description: 'Humanitarian aid, social services, and community development',
        icon: '❤️',
        color: '#ef4444',
    },
    {
        name: 'Worship & Music',
        description: 'Worship equipment, choir, and music ministry',
        icon: '🎵',
        color: '#8b5cf6',
    },
    {
        name: 'Youth & Children',
        description: 'Youth programs, children ministry, and camping',
        icon: '👦',
        color: '#ec4899',
    },
    {
        name: 'Special Events',
        description: 'Conferences, rallies, and special programs',
        icon: '🎉',
        color: '#f97316',
    },
    {
        name: 'General Fund',
        description: 'General church operations and miscellaneous needs',
        icon: '💼',
        color: '#6b7280',
    },
];

async function seed() {
    console.log('Seeding campaign categories...');

    for (const category of DEFAULT_CATEGORIES) {
        try {
            await prisma.campaignCategory.upsert({
                where: { name: category.name },
                update: {},
                create: category,
            });
            console.log(`✓ ${category.name}`);
        } catch (error) {
            console.error(`✗ Failed to seed ${category.name}:`, error);
        }
    }

    console.log('Seeding complete!');
}

seed()
    .catch((error) => {
        console.error('Error seeding categories:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
