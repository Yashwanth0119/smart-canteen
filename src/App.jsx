import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import LoginPage from './components/LoginPage.jsx';
import StudentPortal from './components/StudentPortal.jsx';
import WorkerPortal from './components/WorkerPortal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ItemModal from './components/ItemModal.jsx';
import OrderReceiptModal from './components/OrderReceiptModal.jsx';
import WalletRechargeModal from './components/WalletRechargeModal.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { api } from './services/api.js';

export default function App() {
  const { user, role, isAuthenticated, logout, updateBalance } = useAuth();

  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders' | 'menu-crud' | 'slots' | 'cash-desk'
  const [dbStatus, setDbStatus] = useState(null);

  // Sync activeTab when user role changes
  useEffect(() => {
    if (user?.role === 'worker' || user?.role === 'admin') {
      setActiveTab('orders');
    } else {
      setActiveTab('menu');
    }
  }, [user?.role]);

  // CRUD Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Receipt Modal
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Recharge Modal
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  // Toast / notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Check backend health & DB connection
  const checkHealth = async () => {
    try {
      const h = await api.getHealth();
      setDbStatus(h.database);
    } catch (e) {
      console.warn('Health check failed:', e);
    }
  };

  // Fetch Menu Items (Read)
  const loadMenu = useCallback(async () => {
    try {
      setLoadingMenu(true);
      const items = await api.getMenu();
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  // Fetch Orders (Read)
  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      const filter = user.role === 'student' ? { studentId: user.username } : {};
      const orderList = await api.getOrders(filter);
      setOrders(orderList);

      if (user.role === 'worker') {
        const s = await api.getStats();
        setStats(s);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    checkHealth();
    loadMenu();
  }, [loadMenu]);

  // Auto-refresh orders every 5 seconds for real-time kitchen reflection
  useEffect(() => {
    if (!user) return;
    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
    }, 4500);
    return () => clearInterval(interval);
  }, [user, loadOrders]);

  const handleRechargeSuccess = (newBalance) => {
    updateBalance(newBalance);
    showToast(`Wallet recharged! New balance: ₹${newBalance}`, 'success');
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    setCartItems([]);
    setIsCartOpen(false);
    showToast('Logged out of Smart Canteen.');
  };

  // CART HANDLERS
  const handleAddToCart = (item, delta = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => (i.id || i._id) === (item.id || item._id));
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(i => (i.id || i._id) !== (item.id || item._id));
        }
        return prev.map(i => (i.id || i._id) === (item.id || item._id) ? { ...i, quantity: newQty } : i);
      } else if (delta > 0) {
        return [...prev, { ...item, quantity: 1 }];
      }
      return prev;
    });
  };

  const handleUpdateQty = (itemId, delta) => {
    setCartItems(prev => {
      return prev.map(i => {
        if ((i.id || i._id) === itemId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => (i.id || i._id) !== itemId));
  };

  // CHECKOUT: Student places pre-order (Create)
  const handleCheckout = async (checkoutDetails) => {
    try {
      const orderPayload = {
        studentId: user.username,
        studentName: user.name,
        items: cartItems.map(i => ({
          menuItemId: i.id || i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image
        })),
        totalAmount: checkoutDetails.totalAmount,
        pickupSlot: checkoutDetails.pickupSlot,
        notes: checkoutDetails.notes,
        paymentMethod: checkoutDetails.paymentMethod
      };

      const result = await api.placeOrder(orderPayload);
      setIsCartOpen(false);
      setCartItems([]);
      await loadOrders();

      // Update wallet balance if returned
      if (result.newBalance !== undefined) {
        updateBalance(result.newBalance);
      }

      // Show receipt modal with token
      setReceiptOrder(result.data);
      setIsReceiptOpen(true);
      showToast(result.message || 'Order placed successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    }
  };


  // WORKER: Update Order Status (Update)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      showToast(res.message);
      await loadOrders();
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  // STUDENT/WORKER: Cancel / Delete Order (Delete)
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.deleteOrder(orderId);
      if (res && res.newBalance !== undefined) {
        updateBalance(res.newBalance);
      }
      showToast(res?.message || 'Order cancelled successfully.');
      await loadOrders();
    } catch (err) {
      showToast(err.message || 'Cancel failed', 'error');
    }
  };

  // Quick toggle availability for canteen staff
  const handleToggleAvailability = async (item) => {
    try {
      const newAvail = item.isAvailable === false ? true : false;
      await api.updateMenuItem(item.id || item._id, { isAvailable: newAvail });
      showToast(`Updated "${item.name}" to ${newAvail ? 'Available' : 'Sold Out'}`);
      await loadMenu();
    } catch (err) {
      showToast(err.message || 'Error updating availability', 'error');
    }
  };

  // MENU CRUD: Create or Update Item
  const handleSaveMenuItem = async (itemData) => {
    try {
      if (itemToEdit) {
        // UPDATE (PUT)
        await api.updateMenuItem(itemToEdit.id || itemToEdit._id, itemData);
        showToast(`"${itemData.name}" updated successfully!`);
      } else {
        // CREATE (POST)
        await api.createMenuItem(itemData);
        showToast(`"${itemData.name}" added to canteen menu!`);
      }
      setIsItemModalOpen(false);
      setItemToEdit(null);
      await loadMenu();
    } catch (err) {
      showToast(err.message || 'Error saving menu item', 'error');
    }
  };

  // MENU CRUD: Delete Item
  const handleDeleteMenuItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${itemName}" from the database?`)) return;
    try {
      await api.deleteMenuItem(itemId);
      showToast(`"${itemName}" deleted from menu.`);
      await loadMenu();
    } catch (err) {
      showToast(err.message || 'Error deleting menu item', 'error');
    }
  };

  // Reset Demo Data
  const handleResetData = async () => {
    if (!window.confirm('Reset all menu items and sample orders to original state?')) return;
    try {
      await api.resetData();
      showToast('System reset to default seed data.');
      await loadMenu();
      await loadOrders();
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#FFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '0.88rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main App Layout */}
      {!isAuthenticated || !user ? (
        <LoginPage dbStatus={dbStatus} />
      ) : (
        <>
          <Navbar
            user={user}
            onLogout={handleLogout}
            cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenRecharge={() => setIsRechargeOpen(true)}
            dbStatus={dbStatus}
          />

          <main style={{ flex: 1 }}>
            {user.role === 'student' || user.role === 'teacher' ? (
              <StudentPortal
                user={user}
                menuItems={menuItems}
                loadingMenu={loadingMenu}
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenCart={() => setIsCartOpen(true)}
                orders={orders}
                onRefreshOrders={loadOrders}
                onCancelOrder={handleCancelOrder}
                onOpenRecharge={() => setIsRechargeOpen(true)}
              />
            ) : (
              <ProtectedRoute allowedRoles={['worker', 'admin']}>
                <WorkerPortal
                  orders={orders}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onDeleteOrder={handleCancelOrder}
                  onRefreshOrders={loadOrders}
                  menuItems={menuItems}
                  onOpenAddItem={() => {
                    setItemToEdit(null);
                    setIsItemModalOpen(true);
                  }}
                  onOpenEditItem={(item) => {
                    setItemToEdit(item);
                    setIsItemModalOpen(true);
                  }}
                  onDeleteMenuItem={handleDeleteMenuItem}
                  onToggleAvailability={handleToggleAvailability}
                  activeTab={activeTab}
                  stats={stats}
                  onResetData={handleResetData}
                />
              </ProtectedRoute>
            )}
          </main>

          {/* Cart Drawer for Student */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            user={user}
            onOpenRecharge={() => {
              setIsCartOpen(false);
              setIsRechargeOpen(true);
            }}
          />


          {/* Item CRUD Modal for Worker */}
          <ItemModal
            isOpen={isItemModalOpen}
            onClose={() => {
              setIsItemModalOpen(false);
              setItemToEdit(null);
            }}
            onSave={handleSaveMenuItem}
            itemToEdit={itemToEdit}
          />

          {/* Order Receipt / Token Modal */}
          <OrderReceiptModal
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
            order={receiptOrder}
            onViewOrders={() => setActiveTab('orders')}
          />

          {/* Wallet Recharge Modal (Online QR + Cash at Counter) */}
          <WalletRechargeModal
            isOpen={isRechargeOpen}
            onClose={() => setIsRechargeOpen(false)}
            user={user}
            onRechargeSuccess={handleRechargeSuccess}
          />
        </>
      )}

    </div>
  );
}
