import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignup,
  onSwitchToForgot,
}) => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {errorMsg && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.35rem' }}>
          Email Address
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Mail size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              backgroundColor: '#0f172a',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--foreground)',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label htmlFor="login-password" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
            Password
          </label>
          <button
            type="button"
            onClick={onSwitchToForgot}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Forgot password?
          </button>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Lock size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              backgroundColor: '#0f172a',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--foreground)',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
        style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Create one now
        </button>
      </div>
    </form>
  );
};
