import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  Layers,
  Filter,
  Check,
  XCircle,
  Eye,
  RotateCcw,
  Banknote,
  Search,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Wallet
} from 'lucide-react';

export default function WorkerPortal({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onRefreshOrders,
  menuItems,
  onOpenAddItem,
  onOpenEditItem,
  onDeleteMenuItem,
  onToggleAvailability,
  activeTab,
  stats,
  onResetData
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Slots State
  const [slotsList, setSlotsList] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Cash Desk State
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('E025015');
  const [customStudentId, setCustomStudentId] = useState('');
  const [cashAmount, setCashAmount] = useState(100);
  const [customCash, setCustomCash] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(null);
  const [rechargeError, setRechargeError] = useState('');
  const [recentRecharges, setRecentRecharges] = useState([]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/auth/students');
      const data = await res.json();
      if (data.success && data.data) {
        setStudents(data.data);
      }
    } catch (e) {
      console.error('Error fetching students:', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch('/api/slots');
      const data = await res.json();
      if (data.success && data.data) {
        setSlotsList(data.data);
      }
    } catch (e) {
      console.error('Error fetching slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleToggleSlot = async (slotId) => {
    try {
      const res = await fetch(`/api/slots/${slotId}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        fetchSlots();
      }
    } catch (e) {
      console.error('Error toggling slot:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'cash-desk') {
      fetchStudents();
    }
    if (activeTab === 'slots') {
      fetchSlots();
    }
  }, [activeTab]);

  const handleWorkerCashTopUp = async (e) => {
    e.preventDefault();
    setRechargeError('');
    setRechargeSuccess(null);
    const targetStudentId = customStudentId.trim() || selectedStudentId;
    const finalAmount = customCash ? Number(customCash) : cashAmount;

    if (!targetStudentId) {
      setRechargeError('Please select or enter a student ID.');
      return;
    }
    if (!finalAmount || finalAmount <= 0) {
      setRechargeError('Please enter a valid cash amount greater than ₹0.');
      return;
    }

    setRechargeLoading(true);
    try {
      const res = await fetch('/api/auth/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetStudentId,
          amount: finalAmount,
          method: 'Cash at Counter (Worker Desk)',
          transactionRef: `CASH-${Date.now().toString().slice(-6)}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update student wallet.');
      }

      setRechargeSuccess(data);
      setCustomCash('');
      await fetchStudents();
      setRecentRecharges(prev => [
        {
          id: Date.now(),
          studentId: targetStudentId,
          studentName: data.studentName,
          amount: finalAmount,
          newBalance: data.newBalance,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 9)
      ]);
    } catch (err) {
      setRechargeError(err.message || 'Failed to complete wallet recharge.');
    } finally {
      setRechargeLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'All') return true;
    return o.status === statusFilter;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '28px 20px 80px 20px' }}>
      
      {/* Canteen Analytics Metrics Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #F97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Orders</span>
            <Clock size={18} color="#F97316" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>
            {stats?.activeOrdersCount || orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#FBBF24' }}>Require kitchen attention</span>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>In Kitchen Cooking</span>
            <ChefHat size={18} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>
            {orders.filter(o => o.status === 'Preparing').length}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#60A5FA' }}>Currently on stoves / pans</span>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ready at Counter</span>
            <CheckCircle size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>
            {orders.filter(o => o.status === 'Ready for Pickup').length}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#34D399' }}>Awaiting student pickup</span>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Today's Revenue</span>
            <TrendingUp size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>
            ₹{stats?.totalRevenue || orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (Number(o.totalAmount) || 0), 0)}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#A78BFA' }}>MERN database synced</span>
        </div>
      </div>

      {/* Main Content: Orders Tab vs Menu Management CRUD Tab */}
      {activeTab === 'orders' ? (
        <div>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>
                👨‍🍳 Kitchen Order Dispatch
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Incoming orders placed by students appear here in real-time. Update their status as you prepare them.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={onRefreshOrders} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <RefreshCw size={15} /> Refresh Live Orders
              </button>
              <button 
                onClick={onResetData} 
                title="Reset to factory demo data" 
                className="btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}
              >
                <RotateCcw size={14} /> Reset Demo Data
              </button>
            </div>
          </div>

          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
            {['All', 'Pending', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: statusFilter === st ? '#3B82F6' : 'rgba(255, 255, 255, 0.04)',
                  color: statusFilter === st ? '#FFF' : 'var(--text-muted)',
                  border: statusFilter === st ? '1px solid #3B82F6' : '1px solid var(--border-color)',
                  transition: 'var(--transition)'
                }}
              >
                {st} {st !== 'All' && `(${orders.filter(o => o.status === st).length})`}
              </button>
            ))}
          </div>

          {/* Orders Feed */}
          {filteredOrders.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ChefHat size={44} style={{ opacity: 0.3, marginBottom: '12px', color: '#3B82F6' }} />
              <h3>No orders under "{statusFilter}"</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
                When students place pre-orders, they will appear here instantly.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {filteredOrders.map(order => {
                const isUpdating = updatingId === (order.id || order._id);
                const isPending = order.status === 'Pending';
                const isPreparing = order.status === 'Preparing';
                const isReady = order.status === 'Ready for Pickup';
                const isCompleted = order.status === 'Completed';

                return (
                  <div
                    key={order.id || order._id}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: isReady ? '5px solid #10B981' : isPreparing ? '5px solid #3B82F6' : isPending ? '5px solid #F59E0B' : '5px solid #6B7280',
                      transition: 'var(--transition)'
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                            {order.orderNumber?.replace(/^#/, '')}
                          </span>
                          <span className={`badge-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Student: <strong style={{ color: '#F97316' }}>{order.studentName || order.studentId}</strong> ({order.studentId})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                          ₹{order.totalAmount}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {order.paymentMethod || 'Wallet'}
                        </div>
                      </div>
                    </div>

                    {/* Pickup Slot & Time */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '14px'
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pickup: <strong style={{ color: '#FFF' }}>{order.pickupSlot}</strong></span>
                      <span style={{ color: 'var(--text-dim)' }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Ordered Items List */}
                    <div style={{
                      flex: 1,
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '12px 0',
                      marginBottom: '14px'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Kitchen Prep Items:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {order.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                background: 'rgba(249, 115, 22, 0.2)',
                                color: '#F97316',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {it.quantity}
                              </span>
                              <span style={{ color: '#FFF', fontWeight: 600 }}>{it.name}</span>
                            </div>
                            <span style={{ color: 'var(--text-dim)' }}>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div style={{
                          marginTop: '8px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          fontSize: '0.76rem',
                          color: '#FBBF24'
                        }}>
                          Note: "{order.notes}"
                        </div>
                      )}
                    </div>

                    {/* Action Buttons to Advance Order Lifecycle */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {isPending && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order.id || order._id, 'Preparing')}
                          className="btn-primary"
                          style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem', background: '#3B82F6' }}
                        >
                          <ChefHat size={14} /> Start Preparing
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order.id || order._id, 'Ready for Pickup')}
                          className="btn-success"
                          style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem' }}
                        >
                          <CheckCircle size={14} /> Mark Ready for Pickup
                        </button>
                      )}

                      {isReady && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order.id || order._id, 'Completed')}
                          className="btn-success"
                          style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
                        >
                          <Check size={14} /> Handover & Complete
                        </button>
                      )}

                      {!isCompleted && order.status !== 'Cancelled' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order.id || order._id, 'Cancelled')}
                          className="btn-danger"
                          style={{ padding: '8px 10px', fontSize: '0.78rem' }}
                        >
                          <XCircle size={14} />
                        </button>
                      )}

                      {isCompleted && (
                        <div style={{ width: '100%', textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', padding: '6px' }}>
                          ✓ Order delivered to student
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'cash-desk' ? (
        /* CASH RECHARGE DESK TAB */
        <div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Banknote size={26} color="#10B981" />
                Canteen Cash Desk (Wallet Top-Up)
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Accept physical cash payments from students and update their digital smart wallet instantly.
              </p>
            </div>

            <button 
              onClick={fetchStudents}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} className={loadingStudents ? 'spin' : ''} />
              <span>Refresh Students</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            
            {/* Top-Up Action Form Panel */}
            <div className="glass-panel" style={{ padding: '28px', borderLeft: '5px solid #10B981' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} color="#10B981" />
                <span>Receive Cash & Update Balance</span>
              </div>

              {rechargeSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <CheckCircle size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#34D399', fontSize: '0.92rem' }}>
                      ₹{rechargeSuccess.amount} Added Successfully!
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                      Student: <strong style={{ color: '#FFF' }}>{rechargeSuccess.studentId}</strong> • New Wallet Balance: <strong style={{ color: '#34D399' }}>₹{rechargeSuccess.newBalance}</strong>
                    </div>
                  </div>
                </div>
              )}

              {rechargeError && (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '18px',
                  color: '#FB7185',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{rechargeError}</span>
                </div>
              )}

              <form onSubmit={handleWorkerCashTopUp}>
                
                {/* Student Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Select Student:
                  </label>
                  
                  {students.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {students.map(st => {
                        const isSelected = (!customStudentId && selectedStudentId === st.username);
                        return (
                          <div
                            key={st.username}
                            onClick={() => {
                              setSelectedStudentId(st.username);
                              setCustomStudentId('');
                            }}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                              border: isSelected ? '1.5px solid #10B981' : '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: '#FFF', fontSize: '0.9rem' }}>
                                {st.username} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.82rem' }}>— {st.name.replace(/\s*\(Student\)/gi, '')}</span>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                                {st.department}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balance</div>
                              <div style={{ fontWeight: 800, color: '#34D399', fontSize: '0.95rem' }}>₹{st.balance !== undefined ? st.balance : 0}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      placeholder="Or enter any Student ID (e.g. E025015)"
                      value={customStudentId}
                      onChange={(e) => setCustomStudentId(e.target.value.toUpperCase())}
                      style={{ width: '100%', fontSize: '0.88rem', padding: '9px 12px' }}
                    />
                  </div>
                </div>

                {/* Amount Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Cash Amount Received (₹):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {[50, 100, 200, 500, 1000].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setCashAmount(amt);
                          setCustomCash('');
                        }}
                        style={{
                          flex: '1 1 calc(33% - 8px)',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: (!customCash && cashAmount === amt) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          color: (!customCash && cashAmount === amt) ? '#34D399' : 'var(--text-muted)',
                          border: (!customCash && cashAmount === amt) ? '1.5px solid #10B981' : '1px solid var(--border-color)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="10"
                    placeholder="Or enter custom cash amount (₹)"
                    value={customCash}
                    onChange={(e) => setCustomCash(e.target.value)}
                    style={{ width: '100%', fontSize: '0.9rem', padding: '10px 14px' }}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={rechargeLoading}
                  className="btn-success"
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Banknote size={18} />
                  <span>
                    {rechargeLoading ? 'Crediting Wallet...' : `Accept Cash & Credit ₹${customCash ? Number(customCash) : cashAmount}`}
                  </span>
                </button>
              </form>
            </div>

            {/* Right Panel: Live Desk Instructions & Recent Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Instructions Banner */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA' }}>
                  <ShieldCheck size={18} />
                  Canteen Staff Cash Procedure
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  <li>Count the cash received directly in front of the student.</li>
                  <li>Verify student ID match from the list above or enter the roll number.</li>
                  <li>Click <strong style={{ color: '#34D399' }}>Accept Cash & Credit</strong> to update MongoDB in real-time.</li>
                  <li>The student's portal reflects their new balance instantly without logging out.</li>
                </ul>
              </div>

              {/* Recent Top-ups Log */}
              <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#FFF' }}>
                  Recent Cash Top-Ups (Today's Shift)
                </h4>

                {recentRecharges.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    No cash top-ups performed yet during this session.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentRecharges.map(rc => (
                      <div
                        key={rc.id}
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.84rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#FFF' }}>
                            {rc.studentId} • <span style={{ color: '#34D399' }}>+₹{rc.amount}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {rc.time} • Bal: ₹{rc.newBalance}
                          </div>
                        </div>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34D399',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          CREDITED
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      ) : activeTab === 'slots' ? (
        /* MANAGE SLOTS TAB */
        <div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={26} color="#8B5CF6" />
                Pickup Time Slots & Capacity Manager
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Manage campus pre-order time slots. Toggle any slot to "FULL" to prevent kitchen overload during peak breaks.
              </p>
            </div>

            <button 
              onClick={fetchSlots}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} className={loadingSlots ? 'spin' : ''} />
              <span>Refresh Slots</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {slotsList.map(slot => (
              <div
                key={slot.id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderLeft: slot.isFull ? '5px solid #EF4444' : '5px solid #10B981',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '5px',
                      background: slot.isFull ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: slot.isFull ? '#FB7185' : '#34D399',
                      border: slot.isFull ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      {slot.isFull ? '⛔ FULL (DISABLED FOR STUDENTS)' : '✓ OPEN FOR PRE-ORDERS'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Cap: {slot.maxCapacity || 25}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', marginBottom: '6px' }}>
                    {slot.label}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    {slot.isFull 
                      ? 'Students cannot checkout under this slot until reopened.' 
                      : 'Students can actively book pre-orders for this pickup window.'}
                  </p>
                </div>

                <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Current bookings: {slot.currentBookings || 0}
                  </span>

                  <button
                    onClick={() => handleToggleSlot(slot.id)}
                    className={slot.isFull ? 'btn-success' : 'btn-danger'}
                    style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    {slot.isFull ? '🔓 Re-Open Slot' : '⛔ Mark as FULL'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MENU CRUD MANAGER TAB */
        <div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>
                🍔 Canteen Menu Management (CRUD)
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Full Create, Read, Update, and Delete operations connected directly to MongoDB.
              </p>
            </div>

            <button
              onClick={onOpenAddItem}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}
            >
              <Plus size={18} /> Add New Food Item
            </button>
          </div>

          {/* Table / Grid of Items */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {menuItems.map(item => (
              <div
                key={item.id || item._id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start'
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)'
                    }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: item.isVeg ? '#34D399' : '#FB7185', fontWeight: 700 }}>
                      {item.isVeg ? '🌱 VEG' : '🍖 NON-VEG'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{item.price}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Stock: {item.inStockCount || 20}
                    </span>
                  </div>

                  {/* CRUD Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onOpenEditItem(item)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem', flex: 1 }}
                      >
                        <Edit3 size={13} /> Edit (Update)
                      </button>
                      <button
                        onClick={() => onDeleteMenuItem(item.id || item._id, item.name)}
                        className="btn-danger"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        title="Delete from MongoDB"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleAvailability && onToggleAvailability(item)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: item.isAvailable === false ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: item.isAvailable === false ? '#FB7185' : '#34D399',
                        border: item.isAvailable === false ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {item.isAvailable === false ? '⚠️ Sold Out (Click to Make Available)' : '✓ Available In Stock (Click to Mark Sold Out)'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
