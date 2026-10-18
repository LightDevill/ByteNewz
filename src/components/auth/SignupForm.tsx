import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, AtSign, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setConfirmationNotice(null);

    const cleanEmail = email.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplay = displayName.trim();

    if (!cleanEmail || !password || !cleanDisplay || !cleanUsername) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      setErrorMsg('Username must be 3-30 characters (letters, numbers, underscores only).');
      return;
    }

    if (cleanDisplay.length < 1 || cleanDisplay.length > 50) {
      setErrorMsg('Display name must be between 1 and 50 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUpWithEmail(cleanEmail, password, cleanDisplay, cleanUsername);
      if (result.needsEmailConfirmation) {
        setConfirmationNotice(
          `Registration successful! A verification link has been sent to ${cleanEmail}. Please check your inbox to activate your account.`
        );
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmationNotice) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <CheckCircle2 size={24} />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Check Your Inbox
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {confirmationNotice}
        </p>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
        <label htmlFor="signup-display" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>
          Display Name
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <User size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
          <input
            id="signup-display"
            type="text"
            required
            placeholder="Alex Smith"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
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
        <label htmlFor="signup-username" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>
          Username Handle
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <AtSign size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
          <input
            id="signup-username"
            type="text"
            required
            autoCapitalize="none"
            placeholder="alexsmith"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
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
        <label htmlFor="signup-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>
          Email Address
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Mail size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
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
        <label htmlFor="signup-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>
          Password (min 6 characters)
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Lock size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
          <input
            id="signup-password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
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
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Sign in
        </button>
      </div>
    </form>
  );
};
