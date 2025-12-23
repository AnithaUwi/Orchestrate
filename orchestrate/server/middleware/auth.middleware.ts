import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, async (err: any, payload: any) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Ensure the user still exists and is active
        const dbUser = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!dbUser) {
            return res.status(403).json({ message: 'User not found' });
        }

        if ((dbUser as any).status !== 'ACTIVE') {
            return res.status(403).json({ message: 'User disabled' });
        }

        req.user = { userId: dbUser.id, role: dbUser.role, email: dbUser.email, name: dbUser.name };
        next();
    });
};
