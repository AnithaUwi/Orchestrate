import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@orchestrate.com';
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existing) {
        console.log('Admin user already exists.');
        return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: {
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });

    console.log('Admin user created successfully: admin@orchestrate.com / admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
