import { Router } from 'express';
import { getDashboard, generateInsights } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();

// Only Admins and Managers can access overarching analytics and AI
router.get('/dashboard', authenticate, authorize('Admin', 'Manager'), getDashboard);
router.post('/insights', authenticate, authorize('Admin', 'Manager'), generateInsights);

export default router;
