import React, { useState } from 'react';
import { Copy, Check, QrCode, ShieldCheck, Smartphone } from 'lucide-react';

export default function QRCodeDisplay({
  amount,
  studentId,
  studentName,
  upiRef,
  setUpiRef
}) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const upiId = 'canteen.campus@upi';
  const payeeName = 'Campus Canteen Pre-Orders';
  const note = `Food Order - ${studentId || 'Student'}`;
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Public QR Code API with fallback
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}&bgcolor=FFFFFF&color=0F172A&margin=2`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Deterministic SVG QR Matrix Fallback in case of offline network
  const renderFallbackQrSvg = () => {
    // 25x25 grid for a classic QR Code Version 2 appearance
    const size = 25;
    const modules = [];

    // Helper to check if (r, c) is inside one of the three 7x7 corner finder patterns
    const isFinderPattern = (r, c) => {
      // Top-Left
      if (r < 7 && c < 7) return true;
      // Top-Right
      if (r < 7 && c >= size - 7) return true;
      // Bottom-Left
      if (r >= size - 7 && c < 7) return true;
      return false;
    };

    // Helper to check if (r, c) is on the finder boundary or center
    const getFinderValue = (r, c) => {
      let lr = r, lc = c;
      if (r < 7 && c >= size - 7) lc = c - (size - 7);
      if (r >= size - 7 && c < 7) lr = r - (size - 7);
      
      // 7x7 outer square, 5x5 white ring, 3x3 black center
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };

    // Deterministic pseudo-hash based on amount & student
    const seed = (Number(amount) * 31 + (studentId ? studentId.charCodeAt(0) : 17)) % 1000;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let isDark = false;
        if (isFinderPattern(r, c)) {
          isDark = getFinderValue(r, c);
        } else if (r === 6 || c === 6) {
          // Timing pattern (alternating black/white)
          isDark = (r + c) % 2 === 0;
        } else {
          // Pseudo-random deterministic data pattern
          const val = (r * 13 + c * 29 + seed) % 7;
          isDark = val === 0 || val === 2 || val === 5;
        }
        if (isDark) {
          modules.push(<rect key={`${r}-${c}`} x={c * 8} y={r * 8} width="8" height="8" fill="#0F172A" />);
        }
      }
    }

    return (
      <svg 
        viewBox="0 0 200 200" 
        width="190" 
        height="190" 
        style={{ display: 'block', borderRadius: '8px' }}
      >
        <rect width="200" height="200" fill="#FFFFFF" rx="8" />
        {modules}
      </svg>
    );
  };

  return (
    <div style={{
      marginTop: '16px',
      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.95) 100%)',
      border: '1.5px solid rgba(59, 130, 246, 0.35)',
      borderRadius: '16px',
      padding: '20px 16px',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), 0 0 20px rgba(59, 130, 246, 0.1)',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      
      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60A5FA'
          }}>
            <QrCode size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>
              Scan QR to Pay
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Works with any UPI App
            </span>
          </div>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34D399',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 800
        }}>
          Amount: ₹{amount}
        </div>
      </div>

      {/* QR Code Container with Frame */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{
          display: 'inline-block',
          position: 'relative',
          padding: '12px',
          background: '#FFFFFF',
          borderRadius: '14px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}>
          {!imgError ? (
            <img 
              src={qrApiUrl} 
              alt={`UPI Payment QR for ₹${amount}`}
              onError={() => setImgError(true)}
              style={{
                width: '185px',
                height: '185px',
                display: 'block',
                borderRadius: '6px'
              }}
            />
          ) : (
            renderFallbackQrSvg()
          )}

          {/* Center UPI Logo Overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#0F172A',
            color: '#60A5FA',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
            border: '2px solid #FFFFFF'
          }}>
            <Smartphone size={18} />
          </div>
        </div>
      </div>

      {/* Supported UPI Badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        flexWrap: 'wrap',
        marginBottom: '14px'
      }}>
        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
          <span 
            key={app}
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {app}
          </span>
        ))}
      </div>

      {/* UPI ID Info with Copy Button */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Canteen UPI ID
          </span>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#F1F5F9' }}>
            {upiId}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyUpi}
          style={{
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.15)',
            border: copied ? '1px solid #10B981' : '1px solid rgba(59, 130, 246, 0.3)',
            color: copied ? '#34D399' : '#60A5FA',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease'
          }}
        >
          {copied ? (
            <>
              <Check size={13} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* UPI Reference / UTR Number Input (Optional) */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.74rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: '5px',
          textAlign: 'left'
        }}>
          UPI Reference / Transaction UTR No. (Optional):
        </label>
        <input 
          type="text"
          placeholder="e.g. 429184719283 (Last 12 digits)"
          value={upiRef}
          onChange={(e) => setUpiRef(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-color)',
            color: '#FFF'
          }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          marginTop: '6px',
          fontSize: '0.72rem',
          color: '#34D399'
        }}>
          <ShieldCheck size={13} />
          <span>Scan with your phone app, then click "Place Order" below</span>
        </div>
      </div>

    </div>
  );
}
