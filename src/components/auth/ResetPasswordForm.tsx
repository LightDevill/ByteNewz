import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

interface ResetPasswordFormProps {
  onBackToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(cleanEmail);
      setIsSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <CheckCircle2 size={24} />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Reset Link Sent
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          If an account exists for <strong style={{ color: '#f8fafc' }}>{email}</strong>, you will receive an email with instructions to reset your password.
        </p>
        <button
          type="button"
          onClick={onBackToLogin}
          className="btn btn-outline"
          style={{ width: '100%' }}
        >
          <ArrowLeft size={16} />
          <span>Return to Sign In</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
        Enter your account email below. We'll send you a secure link to reset your password.
      </p>

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
        <label htmlFor="reset-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.35rem' }}>
          Email Address
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Mail size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
          <input
            id="reset-email"
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
        style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Sending link...</span>
          </>
        ) : (
          <span>Send Recovery Link</span>
        )}
      </button>

      <button
        type="button"
        onClick={onBackToLogin}
        className="btn btn-ghost"
        style={{ width: '100%', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={15} />
        <span>Back to Sign In</span>
      </button>
    </form>
  );
};
