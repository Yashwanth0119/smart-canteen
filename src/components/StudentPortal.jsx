import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Timer, 
  RefreshCw, 
  Utensils, 
  Check, 
  Star, 
  RotateCcw, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const CATEGORIES = ['All', 'Breakfast', 'Meals', 'Fast Food', 'Snacks', 'Beverages'];

export default function StudentPortal({ 
  user, 
  menuItems, 
  loadingMenu, 
  onAddToCart, 
  cartItems, 
  activeTab, 
  setActiveTab, 
  onOpenCart, 
  orders, 
  onRefreshOrders, 
  onCancelOrder,
  onOpenRecharge
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [orderSubTab, setOrderSubTab] = useState('active'); // 'active' | 'past'
  const [refreshing, setRefreshing] = useState(false);

  // Rating Modal State
  const [ratingModalOrder, setRatingModalOrder] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratedOrders, setRatedOrders] = useState({});

  // Filter items for menu
  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const isItemVeg = item.isVeg === true || item.isVeg === 'true';
    const matchesVeg = !vegOnly || isItemVeg;
    return matchesCat && matchesQuery && matchesVeg;
  });

  const getItemQuantityInCart = (itemId) => {
    const found = cartItems.find(i => i.id === itemId || i._id === itemId);
    return found ? found.quantity : 0;
  };

  // Separate Active Orders from Past Orders
  const activeOrders = orders.filter(o => 
    o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready for Pickup'
  );
  const pastOrders = orders.filter(o => 
    o.status === 'Completed' || o.status === 'Cancelled'
  );

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await onRefreshOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Reorder Handler: adds items from past order into active cart
  const handleReorder = (order) => {
    order.items.forEach(it => {
      const match = menuItems.find(m => (m.id || m._id) === it.menuItemId);
      const product = match || {
        id: it.menuItemId,
        name: it.name,
        price: it.price,
        image: it.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
      };
      onAddToCart(product, it.quantity || 1);
    });
    onOpenCart();
  };

  // Rating Submit Handler
  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!ratingModalOrder) return;
    const id = ratingModalOrder.id || ratingModalOrder._id;
    setRatedOrders(prev => ({
      ...prev,
      [id]: { stars: ratingStars, comment: ratingComment }
    }));
    setRatingModalOrder(null);
    setRatingComment('');
  };

  // Render Status Tracker with correct step progression
  const renderStatusTracker = (order) => {
    const isCompleted = order.status === 'Completed';
    const isReady = order.status === 'Ready for Pickup';
    const isPreparing = order.status === 'Preparing';
    const isPending = order.status === 'Pending';
    const isCancelled = order.status === 'Cancelled';

    if (isCancelled) {
      return (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#FB7185',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <AlertCircle size={15} /> Order was cancelled.
        </div>
      );
    }

    let currentStep = 1;
    if (isCompleted) currentStep = 4;
    else if (isReady) currentStep = 3;
    else if (isPreparing) currentStep = 2;
    else if (isPending) currentStep = 1;

    const steps = [
      { num: 1, label: 'Order Received' },
      { num: 2, label: 'Cooking in Kitchen' },
      { num: 3, label: 'Ready at Counter' },
      { num: 4, label: 'Collected' }
    ];

    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '18px 16px',
        marginBottom: '18px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {steps.map((st, idx) => {
            const isPassedOrCurrent = st.num <= currentStep;
            const isCurrent = st.num === currentStep;

            // Strict coloring requirement:
            // 1. For "Completed" order: ALL FOUR should be green (#10B981)
            // 2. For active order: Highlight steps up to current status in orange or green, keep remaining steps grey
            let dotBg = '#374151';
            let dotColor = '#9CA3AF';
            let textColor = '#6B7280';
            let connectorColor = '#2D3748';

            if (isCompleted) {
              dotBg = '#10B981';
              dotColor = '#FFF';
              textColor = '#34D399';
              connectorColor = '#10B981';
            } else if (isPassedOrCurrent) {
              dotBg = isReady ? '#10B981' : '#F97316';
              dotColor = '#FFF';
              textColor = isCurrent ? '#FFF' : (isReady ? '#34D399' : '#F97316');
              connectorColor = isReady ? '#10B981' : '#F97316';
            }

            return (
              <React.Fragment key={st.num}>
                {/* Connector Line */}
                {idx > 0 && (
                  <div style={{
                    flex: 1,
                    height: '3px',
                    background: isCompleted ? '#10B981' : (st.num <= currentStep ? (isReady ? '#10B981' : '#F97316') : '#2D3748'),
                    margin: '0 8px',
                    marginBottom: '20px',
                    borderRadius: '2px',
                    transition: 'background 0.3s ease'
                  }} />
                )}

                {/* Step Circle & Label */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', zIndex: 1 }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: dotBg,
                    color: dotColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: isCurrent && !isCompleted ? `0 0 0 4px ${isReady ? 'rgba(16, 185, 129, 0.3)' : 'rgba(249, 115, 22, 0.3)'}` : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {isCompleted || (isPassedOrCurrent && !isCurrent) ? (
                      <Check size={14} strokeWidth={3} />
                    ) : (
                      <span>{st.num}</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: isPassedOrCurrent || isCompleted ? 700 : 500,
                    color: textColor,
                    marginTop: '8px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    {st.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '28px 20px 80px 20px' }}>
      
      {activeTab === 'menu' ? (
        /* MENU VIEW */
        <div>
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>
                Hey, {user.name ? user.name.replace(/\s*\(Student\)/gi, '').trim() : 'Yashwanth'}! 🍱
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '520px' }}>
                Skip long canteen queues. Choose your favorite freshly prepared meal, select your pickup time, and pick it up hot at the counter!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student ID</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{user.username}</div>
              </div>
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smart Balance</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34D399' }}>₹{user.balance !== undefined ? user.balance : 0}</div>
                {onOpenRecharge && (
                  <button
                    onClick={onOpenRecharge}
                    style={{
                      background: 'rgba(249, 115, 22, 0.2)',
                      border: '1px solid rgba(249, 115, 22, 0.4)',
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginTop: '2px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    + Recharge
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
              <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search food, beverages, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '42px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: vegOnly 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  color: vegOnly ? '#34D399' : 'var(--text-muted)',
                  border: vegOnly ? '1.5px solid #10B981' : '1px solid var(--border-color)',
                  boxShadow: vegOnly ? '0 0 16px rgba(16, 185, 129, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: vegOnly ? '#10B981' : '#6B7280',
                  boxShadow: vegOnly ? '0 0 8px #10B981' : 'none'
                }} />
                <span>{vegOnly ? '✓ Only Veg' : '🌱 Only Veg'}</span>
              </button>

              {cartItems.length > 0 && (
                <button onClick={onOpenCart} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                  <ShoppingBag size={16} /> View Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)})
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat ? '#FFF' : 'var(--text-muted)',
                  border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  transition: 'var(--transition)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {loadingMenu ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <RefreshCw size={32} className="spin" style={{ marginBottom: '12px', color: 'var(--primary)' }} />
              <div>Fetching delicious canteen menu...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Utensils size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
              <h3>No items found matching your filter</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Try searching for a different dish or category.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {filteredItems.map(item => {
                const qty = getItemQuantityInCart(item.id || item._id);
                const isSoldOut = item.isAvailable === false || item.inStockCount === 0;

                return (
                  <div
                    key={item.id || item._id}
                    className="glass-panel"
                    style={{
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'var(--transition)',
                      position: 'relative',
                      opacity: isSoldOut ? 0.75 : 1,
                      minHeight: '350px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSoldOut) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                          filter: isSoldOut ? 'grayscale(0.4)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSoldOut) e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      
                      {/* Dietary Tag */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: item.isVeg ? '#34D399' : '#FB7185'
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: item.isVeg ? '#10B981' : '#F43F5E'
                        }} />
                        {item.isVeg ? 'VEG' : 'NON-VEG'}
                      </div>

                      {/* Sold Out Badge or Prep Time */}
                      {isSoldOut ? (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#EF4444',
                          padding: '4px 9px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#FFF',
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                        }}>
                          SOLD OUT
                        </div>
                      ) : (
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#FFF'
                        }}>
                          <Timer size={12} color="#F97316" />
                          {item.prepTime || 10}m prep
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h4 style={{ fontSize: '1.05rem', lineHeight: 1.3, marginBottom: '6px', color: '#FFF' }}>
                        {item.name}
                      </h4>
                      <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.82rem',
                        lineHeight: 1.4,
                        marginBottom: '14px',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.description}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        marginTop: 'auto',
                        gap: '12px'
                      }}>
                        <div style={{ flexShrink: 0 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Price</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>₹{item.price}</span>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          {isSoldOut ? (
                            <button
                              disabled
                              style={{
                                padding: '8px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                color: '#9CA3AF',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                cursor: 'not-allowed'
                              }}
                            >
                              Sold Out
                            </button>
                          ) : qty > 0 ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: 'rgba(249, 115, 22, 0.15)',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              border: '1px solid rgba(249, 115, 22, 0.3)'
                            }}>
                              <button
                                type="button"
                                onClick={() => onAddToCart(item, -1)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  background: 'rgba(255,255,255,0.1)',
                                  color: '#FFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <Minus size={14} />
                              </button>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '18px', textAlign: 'center', color: '#FFF' }}>
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => onAddToCart(item, 1)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  background: 'var(--primary)',
                                  color: '#FFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onAddToCart(item, 1)}
                              className="btn-primary"
                              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                            >
                              <Plus size={15} /> Add to Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ORDERS VIEW - SPLIT INTO ACTIVE ORDERS & PAST ORDERS */
        <div>
          {/* Top Bar with Sub-tabs and Refresh */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Split Subtabs: Active Orders vs Past Orders */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                onClick={() => setOrderSubTab('active')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  background: orderSubTab === 'active' ? 'var(--primary)' : 'transparent',
                  color: orderSubTab === 'active' ? '#FFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Clock size={16} /> Active Orders ({activeOrders.length})
              </button>

              <button
                onClick={() => setOrderSubTab('past')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  background: orderSubTab === 'past' ? '#10B981' : 'transparent',
                  color: orderSubTab === 'past' ? '#FFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={16} /> Past Orders ({pastOrders.length})
              </button>
            </div>

            <button
              onClick={handleManualRefresh}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} className={refreshing ? 'spin' : ''} /> Refresh Status
            </button>
          </div>

          {/* SUBTAB 1: ACTIVE ORDERS */}
          {orderSubTab === 'active' && (
            activeOrders.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 20px' }}>
                <Clock size={48} style={{ opacity: 0.35, marginBottom: '14px', color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>No active orders right now</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '22px' }}>
                  Browse our fresh canteen menu and order your favorite food in seconds!
                </p>
                <button onClick={() => setActiveTab('menu')} className="btn-primary">
                  <Utensils size={16} /> Browse Canteen Menu
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {activeOrders.map(order => {
                  const isReady = order.status === 'Ready for Pickup';
                  const isPreparing = order.status === 'Preparing';
                  const isPending = order.status === 'Pending';
                  const tokenText = (order.orderNumber || '101').replace(/^#/, '');

                  return (
                    <div
                      key={order.id || order._id}
                      className="glass-panel"
                      style={{
                        padding: '24px',
                        borderLeft: isReady ? '5px solid #10B981' : isPreparing ? '5px solid #3B82F6' : '5px solid #F59E0B'
                      }}
                    >
                      {/* Active Order Header */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`badge-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.status}
                          </span>
                          {isReady && (
                            <span style={{ fontSize: '0.82rem', color: '#34D399', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              🔔 Ready for Pickup at Canteen Counter!
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Pickup: <strong style={{ color: '#FFF' }}>{order.pickupSlot}</strong>
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                            ₹{order.totalAmount}
                          </div>
                        </div>
                      </div>

                      {/* Counter Pickup Token Box */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
                        border: '1px solid rgba(249, 115, 22, 0.3)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '18px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '2px' }}>
                            Counter Pickup Token
                          </div>
                          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                            TOKEN {tokenText}
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(249, 115, 22, 0.15)',
                          border: '1px solid rgba(249, 115, 22, 0.3)',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Token ID</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>{tokenText}</div>
                        </div>
                      </div>

                      {/* Status Tracker: Only passed/current steps highlighted, rest grey */}
                      {renderStatusTracker(order)}

                      {/* Items List */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                        {order.items.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid var(--border-color)',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{it.quantity}x</span>
                            <span style={{ color: '#FFF' }}>{it.name}</span>
                            <span style={{ color: 'var(--text-dim)' }}>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Notes & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div>
                          {order.notes && <span>Chef Note: <em>"{order.notes}"</em></span>}
                        </div>

                        {isPending && (
                          <button
                            onClick={() => onCancelOrder(order.id || order._id)}
                            className="btn-danger"
                            style={{ fontSize: '0.76rem', padding: '5px 12px' }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* SUBTAB 2: PAST ORDERS (COLLECTED / CANCELLED) */}
          {orderSubTab === 'past' && (
            pastOrders.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 20px' }}>
                <CheckCircle2 size={48} style={{ opacity: 0.35, marginBottom: '14px', color: '#10B981' }} />
                <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>No past orders yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '22px' }}>
                  Your completed and collected orders will appear here once picked up.
                </p>
                <button onClick={() => setActiveTab('menu')} className="btn-secondary">
                  <Utensils size={16} /> Explore Menu
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {pastOrders.map(order => {
                  const id = order.id || order._id;
                  const isCompleted = order.status === 'Completed';
                  const userRating = ratedOrders[id];

                  return (
                    <div
                      key={id}
                      className="glass-panel"
                      style={{
                        padding: '24px',
                        borderLeft: isCompleted ? '5px solid #10B981' : '5px solid #6B7280',
                        opacity: order.status === 'Cancelled' ? 0.75 : 1
                      }}
                    >
                      {/* Past Order Header */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`badge-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Slot: <strong style={{ color: '#FFF' }}>{order.pickupSlot}</strong>
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                            ₹{order.totalAmount}
                          </div>
                        </div>
                      </div>

                      {/* Status Tracker: All 4 Green for Completed */}
                      {renderStatusTracker(order)}

                      {/* Items List */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                        {order.items.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid var(--border-color)',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#10B981' }}>{it.quantity}x</span>
                            <span style={{ color: '#FFF' }}>{it.name}</span>
                            <span style={{ color: 'var(--text-dim)' }}>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Bar for Past Orders: Reorder & Rate Buttons */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        paddingTop: '14px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <div>
                          {userRating ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24', fontSize: '0.84rem', fontWeight: 700 }}>
                              <Star size={15} fill="#FBBF24" />
                              <span>You rated this meal: {userRating.stars}/5 ★</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Enjoyed your meal? Share your feedback!
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Rate Button */}
                          <button
                            onClick={() => {
                              setRatingModalOrder(order);
                              setRatingStars(userRating ? userRating.stars : 5);
                              setRatingComment(userRating ? userRating.comment : '');
                            }}
                            className="btn-secondary"
                            style={{
                              padding: '8px 14px',
                              fontSize: '0.82rem',
                              borderColor: userRating ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'
                            }}
                          >
                            <Star size={15} color={userRating ? '#FBBF24' : 'inherit'} fill={userRating ? '#FBBF24' : 'none'} />
                            <span>{userRating ? 'Edit Rating' : 'Rate'}</span>
                          </button>

                          {/* Reorder Button */}
                          <button
                            onClick={() => handleReorder(order)}
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                          >
                            <RotateCcw size={15} />
                            <span>Reorder</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

      {/* RATING MODAL */}
      {ratingModalOrder && (
        <div className="modal-overlay" onClick={() => setRatingModalOrder(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '440px', padding: '28px 24px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Rate Your Meal</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Help the canteen kitchen improve meal quality
                </span>
              </div>
              <button
                onClick={() => setRatingModalOrder(null)}
                className="btn-secondary"
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRatingSubmit}>
              {/* Star selector */}
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      style={{
                        background: 'transparent',
                        padding: '4px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Star
                        size={32}
                        color={star <= ratingStars ? '#FBBF24' : '#4B5563'}
                        fill={star <= ratingStars ? '#FBBF24' : 'none'}
                      />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FBBF24', marginTop: '10px' }}>
                  {ratingStars === 5 && 'Outstanding! 🌟'}
                  {ratingStars === 4 && 'Very Good! 😊'}
                  {ratingStars === 3 && 'Good / Decent 👍'}
                  {ratingStars === 2 && 'Could be better 🤔'}
                  {ratingStars === 1 && 'Needs Improvement 👎'}
                </div>
              </div>

              {/* Comment text */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '8px' }}>
                  Comments or Feedback (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Sambar was hot and flavorful, dosa was perfectly crisp!"
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setRatingModalOrder(null)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '11px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '11px' }}
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
