import React from 'react';
import { CheckCircle2, Clock, MapPin, Receipt, ArrowRight, Utensils, Hash } from 'lucide-react';

export default function OrderReceiptModal({ isOpen, onClose, order, onViewOrders }) {
  if (!isOpen || !order) return null;

  const orderNum = (order.orderNumber || 'CAN-101').replace(/^#/, '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '460px', textAlign: 'center', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Success Header Icon */}
        <div style={{ padding: '32px 24px 20px 24px', background: 'rgba(16, 185, 129, 0.04)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            color: '#10B981',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.45rem', marginBottom: '6px', color: '#FFF' }}>
            Pre-Order Confirmed!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Your meal order has been transmitted directly to the Canteen Kitchen screen.
          </p>
        </div>

        {/* Digital Pickup Token Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderTop: '1px dashed var(--border-color)',
          borderBottom: '1px dashed var(--border-color)',
          padding: '20px 24px',
          margin: '0 24px 20px 24px',
          borderRadius: '14px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', fontWeight: 700 }}>
            Counter Pickup Token
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            TOKEN {orderNum}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Order ID</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>{order.orderNumber || order.id || 'CAN-101'}</div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pickup Slot</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F97316', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> {order.pickupSlot || 'Immediate'}
              </div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Amount Paid</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34D399' }}>₹{order.totalAmount}</div>
            </div>
          </div>
        </div>

        {/* Ordered Items Preview */}
        {order.items && order.items.length > 0 && (
          <div style={{ padding: '0 24px 20px 24px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              Items Being Prepared:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {order.items.map((it, idx) => (
                <span 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#FFF'
                  }}
                >
                  <strong style={{ color: 'var(--primary)' }}>{it.quantity}x</strong> {it.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ padding: '0 24px 24px 24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, padding: '12px', fontSize: '0.88rem' }}
          >
            Order More Food
          </button>
          
          <button
            onClick={() => {
              onClose();
              if (onViewOrders) onViewOrders();
            }}
            className="btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: '0.88rem', fontWeight: 700 }}
          >
            <span>Go to My Orders</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
