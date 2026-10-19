import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

export default function WalletRechargeModal({ 
  isOpen, 
  onClose, 
  user, 
  onRechargeSuccess 
}) {
  const [activeTab, setActiveTab] = useState('online'); // 'online' | 'cash'
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  if (!isOpen) return null;

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const upiId = 'canteen.campus@upi';
  const upiString = `upi://pay?pa=${upiId}&pn=Campus%20Canteen&am=${effectiveAmount}&cu=INR&tn=Wallet%20Recharge%20${user?.username || ''}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}&bgcolor=FFFFFF&color=0F172A&margin=2`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleOnlineRecharge = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!effectiveAmount || effectiveAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          amount: effectiveAmount,
          method: 'Online UPI (QR Code)',
          transactionRef: utrNumber.trim() || `UPI-TXN-${Date.now().toString().slice(-6)}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Recharge failed. Please try again.');
      }

      setSuccessInfo(data);
      if (onRechargeSuccess) {
        onRechargeSuccess(data.newBalance);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete recharge.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessInfo(null);
    setErrorMsg('');
    setCustomAmount('');
    setUtrNumber('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '520px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.1) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Wallet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#FFF' }}>Recharge Canteen Wallet</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Current Balance: <strong style={{ color: '#34D399' }}>₹{user?.balance !== undefined ? user.balance : 0}</strong>
              </div>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Success View */}
        {successInfo ? (
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              color: '#10B981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <CheckCircle2 size={38} />
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '6px', color: '#FFF' }}>
              Recharge Successful!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '22px' }}>
              ₹{successInfo.amount} has been instantly credited to your Smart Canteen Wallet.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Added</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>+₹{successInfo.amount}</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-color)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated Balance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>₹{successInfo.newBalance}</div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              Done & Browse Menu
            </button>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            
            {/* Method Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              marginBottom: '24px'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('online')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  background: activeTab === 'online' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'online' ? '#FFF' : 'var(--text-muted)',
                  transition: 'var(--transition)'
                }}
              >
                <QrCode size={17} />
                <span>Online (QR Code)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cash')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  background: activeTab === 'cash' ? '#3B82F6' : 'transparent',
                  color: activeTab === 'cash' ? '#FFF' : 'var(--text-muted)',
                  transition: 'var(--transition)'
                }}
              >
                <Banknote size={17} />
                <span>Cash to Worker</span>
              </button>
            </div>

            {errorMsg && (
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
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: ONLINE PAYMENT (QR CODE) */}
            {activeTab === 'online' && (
              <form onSubmit={handleOnlineRecharge}>
                {/* Amount Selection */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Select Recharge Amount:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {PRESET_AMOUNTS.map(preset => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => {
                          setAmount(preset);
                          setCustomAmount('');
                        }}
                        style={{
                          flex: '1 1 calc(33% - 8px)',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: (!customAmount && amount === preset) ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          color: (!customAmount && amount === preset) ? 'var(--primary)' : 'var(--text-muted)',
                          border: (!customAmount && amount === preset) ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="10"
                    placeholder="Or enter custom amount in ₹ (e.g. 250)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    style={{ width: '100%', fontSize: '0.9rem', padding: '10px 14px' }}
                  />
                </div>

                {/* QR Code Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '18px',
                  textAlign: 'center',
                  marginBottom: '18px'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Scan QR with Google Pay, PhonePe, Paytm, or BHIM
                  </div>

                  <div style={{
                    display: 'inline-block',
                    background: '#FFF',
                    padding: '10px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    marginBottom: '10px'
                  }}>
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI QR Code" 
                      style={{ width: '180px', height: '180px', display: 'block' }}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>UPI ID: <strong style={{ color: '#FFF' }}>{upiId}</strong></span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      title="Copy UPI ID"
                      style={{
                        background: 'transparent',
                        color: copiedUpi ? '#10B981' : 'var(--text-muted)',
                        padding: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Optional UTR / Reference */}
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Enter UPI Reference / UTR No. (Optional)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    style={{ width: '100%', fontSize: '0.82rem', padding: '9px 12px' }}
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading || effectiveAmount <= 0}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <span>Verifying & Adding Money...</span>
                  ) : (
                    <>
                      <span>I Have Paid ₹{effectiveAmount} • Add to Wallet</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: CASH AT CANTEEN COUNTER */}
            {activeTab === 'cash' && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '14px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.74rem', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, marginBottom: '6px' }}>
                    Student Identification Pass
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>
                        {user.username}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {user.name ? user.name.replace(/\s*\(Student\)/gi, '').trim() : 'Student'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Balance</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399' }}>
                        ₹{user.balance !== undefined ? user.balance : 0}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px dashed rgba(59, 130, 246, 0.4)',
                    fontSize: '0.82rem',
                    color: '#93C5FD',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <ShieldCheck size={20} color="#60A5FA" style={{ flexShrink: 0 }} />
                    <span>Show this Student ID at the Canteen Counter to deposit cash.</span>
                  </div>
                </div>

                {/* Steps instructions */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFF', marginBottom: '10px' }}>
                    How to Recharge with Cash:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.84rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 800, flexShrink: 0 }}>1</span>
                      <span style={{ color: 'var(--text-muted)' }}>Walk up to the <strong style={{ color: '#FFF' }}>Canteen Cash Counter / Manager Desk</strong>.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.84rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 800, flexShrink: 0 }}>2</span>
                      <span style={{ color: 'var(--text-muted)' }}>Provide your Student ID: <strong style={{ color: 'var(--primary)' }}>{user.username}</strong> and hand over the cash.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.84rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 800, flexShrink: 0 }}>3</span>
                      <span style={{ color: 'var(--text-muted)' }}>The canteen worker enters your ID on their terminal and clicks <strong style={{ color: '#34D399' }}>Update Wallet Money</strong>.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.84rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 800, flexShrink: 0 }}>✓</span>
                      <span style={{ color: 'var(--text-muted)' }}>Your wallet updates instantly in real time without any processing delay!</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '11px', fontSize: '0.9rem' }}
                >
                  Close Window
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
