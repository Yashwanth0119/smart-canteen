import React from 'react';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  LogOut, 
  Clock, 
  ChefHat, 
  Layers, 
  Wallet,
  Banknote
} from 'lucide-react';

export default function Navbar({ 
  user, 
  onLogout, 
  cartCount, 
  onOpenCart, 
  activeTab, 
  setActiveTab,
  onOpenRecharge,
  dbStatus
}) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)'
          }}>
            <UtensilsCrossed size={22} color="#FFF" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#FFF' }}>
              Campus<span style={{ color: 'var(--primary)' }}>Canteen</span>
            </span>
          </div>
        </div>

        {/* Center Navigation if Student or Worker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user.role === 'student' || user.role === 'teacher' ? (
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveTab('menu')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: activeTab === 'menu' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'menu' ? '#FFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UtensilsCrossed size={16} /> Menu
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'orders' ? '#FFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock size={16} /> My Orders
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: activeTab === 'orders' ? '#3B82F6' : 'transparent',
                  color: activeTab === 'orders' ? '#FFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ChefHat size={16} /> Live Orders
              </button>
              <button
                onClick={() => setActiveTab('menu-crud')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: activeTab === 'menu-crud' ? '#3B82F6' : 'transparent',
                  color: activeTab === 'menu-crud' ? '#FFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={16} /> Menu Manager (CRUD)
              </button>
              <button
                onClick={() => setActiveTab('cash-desk')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: activeTab === 'cash-desk' ? '#10B981' : 'transparent',
                  color: activeTab === 'cash-desk' ? '#FFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Banknote size={16} /> Cash Desk (Wallet Recharge)
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: activeTab === 'slots' ? '#8B5CF6' : 'transparent',
                  color: activeTab === 'slots' ? '#FFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock size={16} /> Manage Slots
              </button>
            </div>
          )}
        </div>

        {/* Right Section: User Info + Cart / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Student/Teacher Wallet & Recharge Button */}
          {(user.role === 'student' || user.role === 'teacher') && (
            <button
              onClick={onOpenRecharge}
              title="Click to recharge wallet money"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(255, 255, 255, 0.04) 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(249, 115, 22, 0.4)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Wallet size={15} color="var(--primary)" />
              <span style={{ color: 'var(--text-muted)' }}>Wallet:</span>
              <span style={{ fontWeight: 700, color: '#FFF' }}>₹{user.balance !== undefined ? user.balance : 0}</span>
              <span style={{
                background: 'var(--primary)',
                color: '#FFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '5px',
                marginLeft: '2px'
              }}>
                + Recharge
              </span>
            </button>
          )}

          {/* Student/Teacher Cart Button */}
          {(user.role === 'student' || user.role === 'teacher') && (
            <button
              onClick={onOpenCart}
              className="btn-primary"
              style={{
                position: 'relative',
                padding: '8px 14px',
                fontSize: '0.85rem'
              }}
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#10B981',
                  color: '#FFF',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 
                user.role === 'admin' ? '#9333EA' :
                user.role === 'teacher' ? '#059669' :
                user.role === 'worker' ? '#2563EB' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>
              {user.username.slice(0, 2)}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>
                {user.username}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: user.role === 'admin' ? '#C084FC' : user.role === 'teacher' ? '#34D399' : user.role === 'worker' ? '#60A5FA' : 'var(--text-muted)' 
              }}>
                {user.role === 'admin' ? '🛡️ Campus Admin' : 
                 user.role === 'teacher' ? '👩‍🏫 Teacher' : 
                 user.role === 'worker' ? '👨‍🍳 Canteen Staff' : '🎓 Student'}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Logout"
            className="btn-secondary"
            style={{ padding: '8px 10px', borderRadius: '8px' }}
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>
    </header>
  );
}
