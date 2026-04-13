import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  categoryReport,
  createNewTask,
  createTaskComment,
  getTask,
  listAllTasks,
  othersCompletedReport,
  patchTaskStatus,
  removeTask,
  updateExistingTask,
  workloadReport
} from '../controllers/taskController.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(listAllTasks));
router.post('/', asyncHandler(createNewTask));
router.get('/reports/workload', asyncHandler(workloadReport));
router.get('/reports/categories', asyncHandler(categoryReport));
router.get('/reports/completed-by-others', asyncHandler(othersCompletedReport));
router.get('/:taskId', asyncHandler(getTask));
router.put('/:taskId', asyncHandler(updateExistingTask));
router.patch('/:taskId/status', asyncHandler(patchTaskStatus));
router.delete('/:taskId', asyncHandler(removeTask));
router.post('/:taskId/comments', asyncHandler(createTaskComment));

export default router;
