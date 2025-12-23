import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, pmId, deadline } = req.body;
        const user = req.user;

        // Only PM or ADMIN can create projects
        if (user.role !== 'PROJECT_MANAGER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                pmId,
                deadline: deadline ? new Date(deadline) : null,
            },
        });

        // Auto-add PM as a project member
        if (pmId) {
            await prisma.projectMember.upsert({
                where: {
                    projectId_userId: { projectId: project.id, userId: pmId }
                },
                update: {},
                create: {
                    projectId: project.id,
                    userId: pmId,
                    role: 'PROJECT_MANAGER'
                }
            });
        }

        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        // Sync PMs and Task assignees to ProjectMember table
        const allProjects = await prisma.project.findMany({ select: { id: true, pmId: true } });
        for (const p of allProjects) {
            if (p.pmId) {
                await prisma.projectMember.upsert({
                    where: { projectId_userId: { projectId: p.id, userId: p.pmId } },
                    update: {},
                    create: { projectId: p.id, userId: p.pmId, role: 'PROJECT_MANAGER' }
                });
            }
            // Sync task assignees
            const tasks = await prisma.task.findMany({ where: { projectId: p.id }, select: { assignedToId: true } });
            for (const t of tasks) {
                if (t.assignedToId) {
                    await prisma.projectMember.upsert({
                        where: { projectId_userId: { projectId: p.id, userId: t.assignedToId } },
                        update: {},
                        create: { projectId: p.id, userId: t.assignedToId, role: 'DEVELOPER' }
                    });
                }
            }
        }

        const projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: { tasks: true, members: true },
                },
                pm: {
                    select: { id: true, name: true, email: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, role: true }
                        }
                    }
                }
            },
        });
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addProjectMember = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const { userId, role } = req.body;
        const user = req.user;

        if (user.role !== 'PROJECT_MANAGER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const membership = await prisma.projectMember.create({
            data: {
                projectId,
                userId,
                role: role || 'DEVELOPER',
            },
        });

        res.status(201).json(membership);
    } catch (error) {
        console.error('Add project member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
