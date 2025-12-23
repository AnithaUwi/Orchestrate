import { Router } from 'express';
import { createProject, getProjects, addProjectMember } from '../controllers/projects.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken); // All project routes require auth

router.get('/', getProjects);
router.post('/', createProject);
router.post('/:projectId/members', addProjectMember);

export default router;
