import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listCategories, listUsers } from '../controllers/metaController.js';

const router = Router();

router.use(requireAuth);
router.get('/categories', asyncHandler(listCategories));
router.get('/users', asyncHandler(listUsers));

export default router;
