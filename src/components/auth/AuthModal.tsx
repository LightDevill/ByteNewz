import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ResetPasswordForm } from './ResetPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-primary">
                <Sparkles size={11} style={{ marginRight: '0.2rem' }} />
                News Community
              </span>
            </div>
            <h2 id="auth-modal-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.025em' }}>
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Creator Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="btn btn-ghost"
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher (Visible in Login & Signup modes) */}
        {mode !== 'forgot' && (
          <div
            style={{
              display: 'flex',
              padding: '0.25rem',
              backgroundColor: '#111827',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                backgroundColor: mode === 'login' ? 'var(--primary)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : 'var(--muted-foreground)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                backgroundColor: mode === 'signup' ? 'var(--primary)' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : 'var(--muted-foreground)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Contents */}
        {mode === 'login' && (
          <LoginForm
            onSuccess={onClose}
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToForgot={() => setMode('forgot')}
          />
        )}

        {mode === 'signup' && (
          <SignupForm
            onSuccess={onClose}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {mode === 'forgot' && (
          <ResetPasswordForm
            onBackToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
};
