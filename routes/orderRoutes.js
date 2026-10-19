import express from 'express';
import { 
  getOrders, 
  createOrder, 
  updateOrderStatus, 
  deleteOrder, 
  getCanteenStats 
} from '../controllers/orderController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', getCanteenStats);
router.get('/', getOrders);
router.post('/', createOrder);
router.patch('/:id/status', authenticateJWT, authorizeRoles('admin', 'worker'), updateOrderStatus);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteOrder);

export default router;

