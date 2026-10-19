import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  Building,
  Phone,
  UserCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regRole, setRegRole] = useState('student'); // 'student' | 'worker'
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your User ID and Password.');
      return;
    }

    try {
      await login(username.trim(), password.trim());
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regUsername.trim() || !regPassword.trim() || !regName.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    try {
      await register({
        username: regUsername.trim().toUpperCase(),
        password: regPassword.trim(),
        name: regName.trim(),
        role: regRole,
        department: regDepartment.trim() || 'General',
        phone: regPhone.trim()
      });
      setSuccessMessage('Account created successfully! Logging you in...');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative'
    }}>
      
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%)',
        top: '10%',
        left: '20%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.10) 0%, transparent 70%)',
        bottom: '10%',
        right: '20%',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '480px', width: '100%', zIndex: 10 }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 12px 30px rgba(249, 115, 22, 0.4)'
          }}>
            <UtensilsCrossed size={32} color="#FFF" />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            Smart Canteen System
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pre-order hot food, skip lines, & manage kitchen operations
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel" style={{ padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
          
          {/* Sign In vs Register Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'login' ? 'var(--primary)' : 'transparent',
                color: mode === 'login' ? '#FFF' : 'var(--text-muted)',
                transition: 'var(--transition)'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'register' ? 'var(--primary)' : 'transparent',
                color: mode === 'register' ? '#FFF' : 'var(--text-muted)',
                transition: 'var(--transition)'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              color: '#FB7185',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              color: '#34D399',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              {/* User ID */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  User ID / Student Roll Number
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Enter ID (e.g. E025015 or WORKER01)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '44px',
                      fontSize: '0.95rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '44px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '1rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* 2. REGISTER FORM */
            <form onSubmit={handleRegisterSubmit}>
              {/* Role Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Registering Role (RBAC):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { key: 'student', label: '🎓 Student', color: 'var(--primary)', bg: 'rgba(249, 115, 22, 0.15)' },
                    { key: 'teacher', label: '👩‍🏫 Teacher', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' }
                  ].map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRegRole(r.key)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: regRole === r.key ? r.bg : 'rgba(255, 255, 255, 0.03)',
                        color: regRole === r.key ? r.color : 'var(--text-muted)',
                        border: regRole === r.key ? `1.5px solid ${r.color}` : '1px solid var(--border-color)'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ width: '100%', fontSize: '0.9rem', padding: '9px 12px' }}
                />
              </div>

              {/* User ID */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {regRole === 'student' ? 'Student ID / Roll No.' : 'Teacher / Faculty ID'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={regRole === 'student' ? 'e.g. E025017' : 'e.g. TEACHER01'}
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toUpperCase())}
                  style={{ width: '100%', fontSize: '0.9rem', padding: '9px 12px', textTransform: 'uppercase' }}
                />
              </div>

              {/* Department */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Department / Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Mechanical, Kitchen"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  style={{ width: '100%', fontSize: '0.9rem', padding: '9px 12px' }}
                />
              </div>

              {/* Password & Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ width: '100%', fontSize: '0.9rem', padding: '9px 12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-type"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    style={{ width: '100%', fontSize: '0.9rem', padding: '9px 12px' }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '1rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create Account & Log In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
