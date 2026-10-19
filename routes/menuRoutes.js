import express from 'express';
import { 
  getMenuItems, 
  getMenuItemById, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from '../controllers/menuController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', authenticateJWT, authorizeRoles('admin', 'worker'), createMenuItem);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'worker'), updateMenuItem);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'worker'), deleteMenuItem);

export default router;

