import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { listUsers, createUser, updateUserStatus, deleteUser } from '../controllers/users.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;

