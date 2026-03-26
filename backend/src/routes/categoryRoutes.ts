import { Router } from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/', authenticate, getCategories);
router.get('/:id', authenticate, getCategoryById);
router.post('/', authenticate, authorize('Admin', 'Manager'), createCategory);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), updateCategory);
router.delete('/:id', authenticate, authorize('Admin', 'Manager'), deleteCategory);

export default router;
