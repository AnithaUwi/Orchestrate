import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { roomId, startTime, endTime, title, description, attendees, guestName, guestEmail, isExternal } = req.body;

        // If isExternal is true, this is a guest booking (no user required)
        const user = isExternal ? null : req.user;

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Double-booking prevention
        const overlapping = await prisma.booking.findFirst({
            where: {
                roomId,
                OR: [
                    {
                        startTime: { lt: end },
                        endTime: { gt: start },
                    },
                ],
            },
        });

        if (overlapping) {
            return res.status(400).json({ message: 'Room is already booked for this time slot' });
        }

        const booking = await prisma.booking.create({
            data: {
                roomId,
                startTime: start,
                endTime: end,
                title,
                userId: user ? user.userId : null,
                guestName: isExternal ? guestName : null,
                guestEmail: isExternal ? guestEmail : null,
                isExternal: !!isExternal,
                description,
                attendees,
                status: 'confirmed',
            },
        });

        res.status(201).json(booking);
    } catch (error: any) {
        console.error('Create booking error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { date } = req.query;
        let where = {};

        if (date) {
            const startDate = new Date(date as string);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date as string);
            endDate.setHours(23, 59, 59, 999);

            where = {
                startTime: {
                    gte: startDate,
                    lte: endDate
                }
            };
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                room: true,
                user: {
                    select: { name: true, email: true, id: true },
                },
            },
            orderBy: { startTime: 'asc' }
        });

        // Mask details for staff users (they should only see their own details)
        const requester = req.user;
        if (requester && requester.role === 'STAFF') {
            const masked = bookings.map(b => {
                const isOwn = b.userId === requester.userId;
                if (isOwn) return b;
                return {
                    ...b,
                    title: 'Booked',
                    user: null,
                    guestName: null,
                    guestEmail: null,
                    description: null,
                    attendees: null,
                };
            });
            return res.json(masked);
        }

        res.json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBookingsPublic = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        let where = {};

        if (date) {
            const startDate = new Date(date as string);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date as string);
            endDate.setHours(23, 59, 59, 999);

            where = {
                startTime: {
                    gte: startDate,
                    lte: endDate
                }
            };
        }

        const bookings = await prisma.booking.findMany({
            where,
            select: {
                id: true,
                roomId: true,
                startTime: true,
                endTime: true,
                title: true,
                status: true,
                guestName: true,
                user: {
                    select: { name: true }
                }
            },
            orderBy: { startTime: 'asc' }
        });
        res.json(bookings);
    } catch (error) {
        console.error('Get public bookings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, attendees, startTime, endTime, roomId } = req.body;
        const user = req.user;

        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Permissions: Only the owner or Admin/PM can update
        if (booking.userId !== user.userId && user.role !== 'ADMIN' && user.role !== 'PROJECT_MANAGER') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const start = startTime ? new Date(startTime) : booking.startTime;
        const end = endTime ? new Date(endTime) : booking.endTime;
        const targetRoomId = roomId || booking.roomId;

        if (start >= end) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Conflict check (exclude self)
        const overlapping = await prisma.booking.findFirst({
            where: {
                id: { not: id },
                roomId: targetRoomId,
                OR: [
                    {
                        startTime: { lt: end },
                        endTime: { gt: start },
                    },
                ],
            },
        });

        if (overlapping) {
            return res.status(400).json({ message: 'Room is already booked for this time slot' });
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: {
                title: title !== undefined ? title : booking.title,
                description: description !== undefined ? description : booking.description,
                attendees: attendees !== undefined ? attendees : booking.attendees,
                startTime: start,
                endTime: end,
                roomId: targetRoomId,
            },
        });

        res.json(updated);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Permissions: Only the owner or Admin/PM can delete
        if (booking.userId !== user.userId && user.role !== 'ADMIN' && user.role !== 'PROJECT_MANAGER') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await prisma.booking.delete({ where: { id } });
        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany();
        res.json(rooms);
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
