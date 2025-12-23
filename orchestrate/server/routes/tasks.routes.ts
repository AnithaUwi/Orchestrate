import { Router } from 'express';
import { createTask, updateTask, getWorkloadOverview, getTasks, deleteTask } from '../controllers/tasks.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/workload', getWorkloadOverview);
router.get('/', getTasks);

export default router;
