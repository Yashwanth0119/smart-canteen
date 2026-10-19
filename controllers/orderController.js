import { dataStore } from '../data/store.js';

// READ - Orders list
export const getOrders = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    let orders = await dataStore.getOrders({ studentId });

    if (status && status !== 'All') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve orders', error: error.message });
  }
};

// CREATE - Student places pre-order
export const createOrder = async (req, res) => {
  try {
    const { studentId, studentName, items, totalAmount, pickupSlot, notes, paymentMethod } = req.body;

    if (!studentId || !items || !items.length || totalAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Invalid order data. Items and student info are required.' });
    }

    const orderTotal = Number(totalAmount);
    let newBalance = undefined;

    // Deduct from wallet if student used Smart Wallet
    if (paymentMethod === 'Smart Wallet' || paymentMethod === 'Student Smart Wallet') {
      const user = await dataStore.findUserByUsername(studentId);
      const currentBalance = user && user.balance !== undefined ? Number(user.balance) : 0;
      if (currentBalance < orderTotal) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. You have ₹${currentBalance}, but the order is ₹${orderTotal}. Please recharge your wallet or choose UPI / Pay at Counter.`
        });
      }
      newBalance = await dataStore.updateUserBalance(studentId, -orderTotal);
    }

    const order = await dataStore.createOrder({
      studentId,
      studentName: studentName || 'Student ' + studentId,
      items,
      totalAmount: orderTotal,
      pickupSlot: pickupSlot || 'Immediate (10-15 mins)',
      notes: notes || '',
      paymentMethod: paymentMethod || 'Student Smart Wallet',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: `Order placed successfully!${newBalance !== undefined ? ` ₹${orderTotal} deducted from Smart Wallet.` : ''}`,
      data: order,
      newBalance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error placing pre-order', error: error.message });
  }
};

// UPDATE - Worker changes order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await dataStore.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: `Order status changed to "${status}"`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

// DELETE - Cancel order & refund wallet if applicable
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const allOrders = await dataStore.getOrders();
    const existing = allOrders.find(o => (o.id || o._id) === id || o.orderNumber === id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (existing.status === 'Completed') {
      return res.status(403).json({ 
        success: false, 
        message: 'Action Forbidden (403): Completed orders have already been collected and cannot be cancelled.' 
      });
    }

    let refundedBalance = undefined;
    if (existing && (existing.paymentMethod === 'Smart Wallet' || existing.paymentMethod === 'Student Smart Wallet') && existing.status === 'Pending') {
      refundedBalance = await dataStore.updateUserBalance(existing.studentId, Number(existing.totalAmount));
    }

    const success = await dataStore.deleteOrder(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: `Order cancelled.${refundedBalance !== undefined ? ` ₹${existing.totalAmount} refunded to your wallet.` : ''}`,
      newBalance: refundedBalance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete order', error: error.message });
  }
};

// READ - Analytics and Summary for Worker Dashboard
export const getCanteenStats = async (req, res) => {
  try {
    const orders = await dataStore.getOrders();
    const menuItems = await dataStore.getMenuItems();

    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const preparingCount = orders.filter(o => o.status === 'Preparing').length;
    const readyCount = orders.filter(o => o.status === 'Ready for Pickup').length;
    const completedCount = orders.filter(o => o.status === 'Completed').length;

    res.status(200).json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalRevenue,
        pendingCount,
        preparingCount,
        readyCount,
        completedCount,
        totalMenuItems: menuItems.length,
        activeOrdersCount: pendingCount + preparingCount + readyCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compute stats', error: error.message });
  }
};
