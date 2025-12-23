import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@orchestrate.com' },
        update: {},
        create: {
            email: 'admin@orchestrate.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    const pm = await prisma.user.upsert({
        where: { email: 'pm@orchestrate.com' },
        update: {},
        create: {
            email: 'pm@orchestrate.com',
            name: 'Project Manager',
            password: hashedPassword,
            role: 'PROJECT_MANAGER',
        },
    });

    const dev1 = await prisma.user.upsert({
        where: { email: 'dev1@orchestrate.com' },
        update: {},
        create: {
            email: 'dev1@orchestrate.com',
            name: 'John Developer',
            password: hashedPassword,
            role: 'DEVELOPER',
        },
    });

    const dev2 = await prisma.user.upsert({
        where: { email: 'dev2@orchestrate.com' },
        update: {},
        create: {
            email: 'dev2@orchestrate.com',
            name: 'Jane Coder',
            password: hashedPassword,
            role: 'DEVELOPER',
        },
    });

    const staff = await prisma.user.upsert({
        where: { email: 'staff@orchestrate.com' },
        update: {},
        create: {
            email: 'staff@orchestrate.com',
            name: 'Staff Member',
            password: hashedPassword,
            role: 'STAFF',
        },
    });

    // 2. Create Rooms
    const roomA = await prisma.room.create({
        data: {
            name: 'Boardroom A',
            capacity: 12,
        },
    });

    const roomB = await prisma.room.create({
        data: {
            name: 'Boardroom B',
            capacity: 8,
        },
    });

    // 3. Create Projects
    const project1 = await prisma.project.create({
        data: {
            name: 'Orchestrate System',
            description: 'Internal project management and booking system',
        },
    });

    const project2 = await prisma.project.create({
        data: {
            name: 'Zenith CRM',
            description: 'Customer relationship management for Zenith Corp',
        },
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
