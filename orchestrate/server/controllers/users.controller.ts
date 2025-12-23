import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

const assertAdmin = (user: any) => {
    if (!user || user.role !== 'ADMIN') {
        const err: any = new Error('Forbidden');
        err.status = 403;
        throw err;
    }
};

export const listUsers = async (req: AuthRequest, res: Response) => {
    try {
        assertAdmin(req.user);
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
        });
        res.json(users);
    } catch (error: any) {
        console.error('List users error detail:', error);
        if (error.status) return res.status(error.status).json({ message: error.message });
        res.status(500).json({ message: 'Internal server error', detail: error.message });
    }
};

export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        assertAdmin(req.user);
        const { name, email, role, password } = req.body;
        if (!name || !email || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashed = await bcrypt.hash(password || 'changeme123', 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                role,
                password: hashed,
                status: 'ACTIVE',
            },
        });
        const { password: _pw, ...clean } = user;
        res.status(201).json(clean);
    } catch (error: any) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        assertAdmin(req.user);
        const { id } = req.params;
        const { status } = req.body;
        if (!['ACTIVE', 'DISABLED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const updated = await prisma.user.update({
            where: { id },
            data: { status },
            select: { id: true, name: true, email: true, role: true, status: true },
        });
        res.json(updated);
    } catch (error: any) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        assertAdmin(req.user);
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (error: any) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

