import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles, fallback }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback || null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 28px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '2px solid rgba(244, 63, 94, 0.4)',
            color: '#FB7185',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShieldAlert size={34} />
          </div>

          <div style={{
            display: 'inline-block',
            background: 'rgba(244, 63, 94, 0.18)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#FDA4AF',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '999px',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            HTTP 403 FORBIDDEN — RBAC GUARD
          </div>

          <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#FFF' }}>
            Authorisation Denied
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
            You are authenticated, but your role <strong style={{ color: '#F97316' }}>[{user.role}]</strong> does not have permission to view or manage this administrative portal.
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '12px 16px',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            textAlign: 'left',
            color: 'var(--text-muted)',
            marginBottom: '24px'
          }}>
            <div style={{ fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>Semantic Status Distinction:</div>
            <div>• <strong style={{ color: '#EF4444' }}>401 Unauthorized:</strong> Missing or expired JWT credentials (Not Authenticated).</div>
            <div>• <strong style={{ color: '#F59E0B' }}>403 Forbidden:</strong> Valid JWT, but lacking role privileges (Not Authorised).</div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Safe Area</span>
          </button>
        </div>
      </div>
    );
  }

  return children;
}
