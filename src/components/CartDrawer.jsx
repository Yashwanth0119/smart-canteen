import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  ShoppingBag, 
  Wallet, 
  QrCode,
  Banknote,
  ArrowRight, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay.jsx';

const FALLBACK_SLOTS = [
  { id: 'slot_1', label: 'Immediate (10-15 mins)', isFull: false },
  { id: 'slot_2', label: '12:45 PM Lunch Break (Shift 1)', isFull: false },
  { id: 'slot_3', label: '01:15 PM Lunch Break (Shift 2)', isFull: true },
  { id: 'slot_4', label: '02:00 PM Afternoon Break', isFull: false },
  { id: 'slot_5', label: '04:30 PM Evening Snack Time', isFull: false },
  { id: 'slot_6', label: '05:30 PM Dinner Pre-Order', isFull: false }
];

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  user,
  onOpenRecharge
}) {
  const [slots, setSlots] = useState(FALLBACK_SLOTS);
  const [pickupSlot, setPickupSlot] = useState('Immediate (10-15 mins)');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Smart Wallet'); // 'Smart Wallet' | 'Online UPI' | 'Pay at Counter'
  const [upiRef, setUpiRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch slots from API whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/slots')
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setSlots(data.data);
            // If current pickupSlot is full, pick first available
            const currentObj = data.data.find(s => s.label === pickupSlot);
            if (!currentObj || currentObj.isFull) {
              const firstAvail = data.data.find(s => !s.isFull);
              if (firstAvail) setPickupSlot(firstAvail.label);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currentBalance = Number(user?.balance !== undefined ? user.balance : 0);
  const isWalletInsufficient = paymentMethod === 'Smart Wallet' && currentBalance < totalAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (isWalletInsufficient) return;

    setSubmitting(true);
    try {
      await onCheckout({
        pickupSlot,
        notes: upiRef ? `${notes ? notes + ' | ' : ''}UPI Ref: ${upiRef}` : notes,
        paymentMethod,
        totalAmount
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      
      {/* Click outside to close */}
      <div style={{ flex: 1 }} onClick={onClose} />

      {/* Drawer content */}
      <div 
        className="slide-in-right"
        style={{
          width: '100%',
          maxWidth: '470px',
          height: '100%',
          background: '#0F172A',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#FFF' }}>Pre-Order Checkout</h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {items.reduce((s, i) => s + i.quantity, 0)} items in your food tray
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body: Cart Items & Checkout Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '14px' }} />
              <h4 style={{ color: '#FFF' }}>Your tray is currently empty</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Add delicious dishes from the canteen menu to pre-order and skip the rush.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Order Summary
              </div>
              {items.map(item => (
                <div
                  key={item.id || item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '0.88rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#FFF' }}>
                      {item.name}
                    </h5>
                    <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>

                  {/* Quantity Stepper on Card */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    padding: '3px 6px',
                    borderRadius: '6px'
                  }}>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id || item._id, -1)}
                      style={{ background: 'transparent', color: '#FFF', display: 'flex', cursor: 'pointer' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: '16px', textAlign: 'center', color: '#FFF' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id || item._id, 1)}
                      style={{ background: 'transparent', color: '#FFF', display: 'flex', cursor: 'pointer' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id || item._id)}
                    style={{ background: 'transparent', color: '#9CA3AF', display: 'flex', cursor: 'pointer', padding: '4px' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. PICKUP SLOT SELECTION (WITH FULL SLOTS DISABLED) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>
                  <Clock size={16} color="var(--primary)" />
                  Select Pickup Time Slot:
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {slots.map(slot => {
                    const isSelected = pickupSlot === slot.label && !slot.isFull;
                    return (
                      <div
                        key={slot.id || slot.label}
                        onClick={() => {
                          if (!slot.isFull) setPickupSlot(slot.label);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: slot.isFull 
                            ? 'rgba(255, 255, 255, 0.02)' 
                            : isSelected 
                            ? 'rgba(249, 115, 22, 0.15)' 
                            : 'rgba(255, 255, 255, 0.04)',
                          border: slot.isFull 
                            ? '1px dashed rgba(255, 255, 255, 0.1)' 
                            : isSelected 
                            ? '1.5px solid var(--primary)' 
                            : '1px solid var(--border-color)',
                          cursor: slot.isFull ? 'not-allowed' : 'pointer',
                          opacity: slot.isFull ? 0.55 : 1,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="radio"
                            name="pickup_slot_radio"
                            disabled={slot.isFull}
                            checked={isSelected}
                            onChange={() => {
                              if (!slot.isFull) setPickupSlot(slot.label);
                            }}
                            style={{ accentColor: 'var(--primary)', cursor: slot.isFull ? 'not-allowed' : 'pointer' }}
                          />
                          <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500, color: slot.isFull ? 'var(--text-dim)' : isSelected ? '#FFF' : 'var(--text-muted)' }}>
                            {slot.label}
                          </span>
                        </div>

                        {slot.isFull ? (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            background: 'rgba(244, 63, 94, 0.15)',
                            color: '#FB7185',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            FULL (Capacity Reached)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 600 }}>
                            Available
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. SPECIAL INSTRUCTIONS */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '8px' }}>
                  <FileText size={15} color="var(--primary)" /> Chef Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, extra sambar, crisp dosa"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem', padding: '9px 12px' }}
                />
              </div>

              {/* 3. PAYMENT CHOICE (WALLET, UPI, OR PAY AT COUNTER) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#FFF', marginBottom: '10px' }}>
                  <Wallet size={16} color="var(--primary)" /> Payment Choice:
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  
                  {/* Option A: Wallet */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Smart Wallet')}
                    style={{
                      background: paymentMethod === 'Smart Wallet' ? 'rgba(249, 115, 22, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: paymentMethod === 'Smart Wallet' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      padding: '12px 8px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Wallet size={18} color={paymentMethod === 'Smart Wallet' ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: paymentMethod === 'Smart Wallet' ? '#FFF' : 'var(--text-muted)' }}>
                      Wallet
                    </div>
                    <div style={{ fontSize: '0.72rem', color: currentBalance < totalAmount ? '#FB7185' : '#34D399', fontWeight: 700, marginTop: '2px' }}>
                      ₹{currentBalance}
                    </div>
                  </button>

                  {/* Option B: UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Online UPI')}
                    style={{
                      background: paymentMethod === 'Online UPI' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: paymentMethod === 'Online UPI' ? '1.5px solid #3B82F6' : '1px solid var(--border-color)',
                      padding: '12px 8px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <QrCode size={18} color={paymentMethod === 'Online UPI' ? '#60A5FA' : 'var(--text-muted)'} style={{ margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: paymentMethod === 'Online UPI' ? '#FFF' : 'var(--text-muted)' }}>
                      UPI Pay
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Instant QR
                    </div>
                  </button>

                  {/* Option C: Pay at Counter */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Pay at Counter')}
                    style={{
                      background: paymentMethod === 'Pay at Counter' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: paymentMethod === 'Pay at Counter' ? '1.5px solid #10B981' : '1px solid var(--border-color)',
                      padding: '12px 8px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Banknote size={18} color={paymentMethod === 'Pay at Counter' ? '#34D399' : 'var(--text-muted)'} style={{ margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: paymentMethod === 'Pay at Counter' ? '#FFF' : 'var(--text-muted)' }}>
                      At Counter
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Cash / Card
                    </div>
                  </button>
                </div>

                {/* Insufficient Balance Alert */}
                {isWalletInsufficient && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#FB7185',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', marginBottom: '2px' }}>Insufficient balance in wallet</strong>
                      <span>Order total is ₹{totalAmount}, but your wallet balance is ₹{currentBalance}. Please select <strong>UPI Pay</strong>, <strong>Pay at Counter</strong>, or recharge your wallet.</span>
                      {onOpenRecharge && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={onOpenRecharge}
                            style={{
                              background: 'var(--primary)',
                              color: '#FFF',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            + Recharge Wallet Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* QR Code Display for Online UPI Payment */}
                {paymentMethod === 'Online UPI' && (
                  <QRCodeDisplay
                    amount={totalAmount}
                    studentId={user?.username}
                    studentName={user?.name}
                    upiRef={upiRef}
                    setUpiRef={setUpiRef}
                  />
                )}
              </div>

            </div>
          )}

        </div>

        {/* Drawer Footer with Place Order Button */}
        {items.length > 0 && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(15, 23, 42, 0.98)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'block' }}>Payment via {paymentMethod}</span>
                <span style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: 600 }}>Pickup: {pickupSlot}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Amount</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || isWalletInsufficient}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '1rem',
                fontWeight: 700,
                opacity: submitting || isWalletInsufficient ? 0.6 : 1,
                cursor: submitting || isWalletInsufficient ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? (
                <span>Placing Pre-Order...</span>
              ) : isWalletInsufficient ? (
                <span>⚠️ Insufficient Balance — Choose Other Payment</span>
              ) : (
                <>
                  <span>Place Order • ₹{totalAmount}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
