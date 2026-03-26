import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/', authenticate, getProducts);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorize('Admin', 'Manager'), createProduct);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), updateProduct);
router.delete('/:id', authenticate, authorize('Admin', 'Manager'), deleteProduct);

export default router;
