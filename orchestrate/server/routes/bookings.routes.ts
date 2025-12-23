import { Router } from 'express';
import { createBooking, getBookings, getRooms, getBookingsPublic, updateBooking, deleteBooking } from '../controllers/bookings.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/rooms', getRooms);
router.get('/', getBookings);
router.get('/public', getBookingsPublic);

// Booking operations - allow both authenticated and guest bookings
router.post('/', (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        // If auth header present, authenticate
        authenticateToken(req, res, next);
    } else {
        // If no auth header, allow through for guest booking
        next();
    }
}, createBooking);

router.put('/:id', authenticateToken, updateBooking);
router.delete('/:id', authenticateToken, deleteBooking);

export default router;
