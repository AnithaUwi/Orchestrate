import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Build Prisma where clause based on optional filters
const buildTaskFilters = (query: any) => {
    const { projectId, assigneeId, status, priority, search } = query;
    return {
        AND: [
            projectId ? { projectId } : {},
            assigneeId ? { assignedToId: assigneeId } : {},
            status ? { status } : {},
            priority ? { priority } : {},
            search
                ? {
                    OR: [
                        { title: { contains: search } },
                        { description: { contains: search } },
                    ],
                }
                : {},
        ],
    };
};

const syncProjectMember = async (projectId: string, userId: string | null) => {
    if (!userId) return;
    try {
        await prisma.projectMember.upsert({
            where: {
                projectId_userId: { projectId, userId }
            },
            update: {},
            create: {
                projectId,
                userId,
                role: 'DEVELOPER'
            }
        });
    } catch (error) {
        console.error('Sync project member error:', error);
    }
};

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, priority, estimatedHours, projectId, assignedToId, dueDate } = req.body;
        const user = req.user;

        if (user.role !== 'PROJECT_MANAGER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                estimatedHours,
                projectId,
                assignedToId,
                dueDate: dueDate ? new Date(dueDate) : null,
                createdById: user.userId,
            },
        });

        // Auto-sync project membership
        if (assignedToId) {
            await syncProjectMember(projectId, assignedToId);
        }

        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const filters = buildTaskFilters(req.query);

        // Role-based visibility
        let roleFilter: any = {};
        if (user.role === 'DEVELOPER') {
            roleFilter = { assignedToId: user.userId };
        } else if (user.role === 'PROJECT_MANAGER') {
            // Tasks in projects managed by this PM or assigned to them
            const managedProjects = await prisma.project.findMany({
                where: { pmId: user.userId },
                select: { id: true },
            });
            const projectIds = managedProjects.map(p => p.id);
            roleFilter = {
                OR: [
                    { projectId: { in: projectIds.length ? projectIds : [''] } },
                    { assignedToId: user.userId },
                ],
            };
        } else if (user.role === 'STAFF') {
            // Staff should not see project tasks
            return res.status(403).json({ message: 'Forbidden' });
        } // Admin sees all

        const where = { AND: [filters, roleFilter] };

        const tasks = await prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                project: { select: { id: true, name: true, pmId: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });

        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, actualHours, assignedToId, priority, title, description, dueDate, estimatedHours, loggedHours, projectId } = req.body;
        const user = req.user;

        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Permissions: PM/ADMIN can update anything. Dev can update status/hours of OWN task.
        const isOwner = task.assignedToId === user.userId;
        const isManager = user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN';

        if (!isOwner && !isManager) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                status,
                actualHours,
                estimatedHours: estimatedHours !== undefined ? Number(estimatedHours) : task.estimatedHours,
                loggedHours: loggedHours !== undefined ? Number(loggedHours) : task.loggedHours,
                dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
                assignedToId: isManager ? (assignedToId === "" ? null : (assignedToId || task.assignedToId)) : task.assignedToId,
                projectId: isManager ? (projectId || task.projectId) : task.projectId,
                priority: isManager ? (priority || task.priority) : task.priority,
                title: isManager ? (title || task.title) : task.title,
                description: isManager ? (description || task.description) : task.description,
            }
        });

        // Auto-sync project membership on update
        if (isManager && updatedTask.assignedToId) {
            await syncProjectMember(updatedTask.projectId, updatedTask.assignedToId);
        }

        res.json(updatedTask);
    } catch (error) {
        console.error('Update task error detail:', error);
        res.status(500).json({ message: 'Internal server error', detail: error instanceof Error ? error.message : String(error) });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        console.log(`[BACKEND] Delete task attempt: ID=${id}, User=${user.userId}, Role=${user.role}`);

        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            console.log(`[BACKEND] Task not found: ${id}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        // Only ADMIN or PM can delete tasks
        if (user.role !== 'ADMIN' && user.role !== 'PROJECT_MANAGER') {
            console.log(`[BACKEND] Forbidden delete attempt. Role: ${user.role}`);
            return res.status(403).json({ message: 'Forbidden: Only Admins or Project Managers can delete tasks' });
        }

        await prisma.task.delete({ where: { id } });
        console.log(`[BACKEND] Task deleted successfully: ${id}`);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('[BACKEND] Delete task error detail:', error);
        res.status(500).json({ message: 'Internal server error', detail: error instanceof Error ? error.message : String(error) });
    }
};

export const getWorkloadOverview = async (req: AuthRequest, res: Response) => {
    try {
        const requester = req.user;

        // Limit developers visible to PM by their projects; Dev sees self only; Admin sees all.
        let developerFilter: any = { role: 'DEVELOPER' };
        if (requester.role === 'DEVELOPER') {
            developerFilter = { id: requester.userId, role: 'DEVELOPER' };
        } else if (requester.role === 'PROJECT_MANAGER') {
            const managedProjects = await prisma.project.findMany({
                where: { pmId: requester.userId },
                select: { id: true },
            });
            const projectIds = managedProjects.map(p => p.id);
            developerFilter = {
                role: 'DEVELOPER',
                tasksAssigned: {
                    some: {
                        projectId: { in: projectIds.length ? projectIds : [''] },
                    },
                },
            };
        }

        const users = await prisma.user.findMany({
            where: developerFilter,
            select: {
                id: true,
                name: true,
                email: true,
                tasksAssigned: {
                    where: { status: { not: 'DONE' } },
                    select: { id: true, title: true, priority: true, status: true, estimatedHours: true, actualHours: true },
                },
            },
        });

        const workloadOverview = users.map(user => {
            const activeTasksCount = user.tasksAssigned.length;
            const estimatedHoursTotal = user.tasksAssigned.reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0);
            const actualHoursTotal = user.tasksAssigned.reduce((sum: number, t: any) => sum + (t.actualHours || 0), 0);

            let workloadIntensity = 'GREEN';
            if (activeTasksCount >= 7) workloadIntensity = 'RED';
            else if (activeTasksCount >= 4) workloadIntensity = 'YELLOW';

            return {
                ...user,
                activeTasksCount,
                estimatedHoursTotal,
                actualHoursTotal,
                workloadIntensity,
            };
        });

        res.json(workloadOverview);
    } catch (error) {
        console.error('Workload overview error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
