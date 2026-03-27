import { Router } from 'express';
import { createSale, getSales, getSaleDetails } from '../controllers/saleController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();

// Everyone can create a sale
router.post('/', authenticate, createSale);

// Only Admins and Managers can view the ledger
router.get('/', authenticate, authorize('Admin', 'Manager'), getSales);
router.get('/:id', authenticate, authorize('Admin', 'Manager'), getSaleDetails);

export default router;
