import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

export const UpdatePasswordModal: React.FC = () => {
  const { isPasswordRecovery, setIsPasswordRecovery, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isPasswordRecovery) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      setIsSuccess(true);
      setTimeout(() => {
        setIsPasswordRecovery(false);
        setIsSuccess(false);
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      console.error('Update password error:', err);
      setErrorMsg(err.message || 'Failed to update password. Recovery link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-password-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <KeyRound size={22} />
          </div>
          <h2 id="update-password-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Set New Password
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            Enter your new secure password below to complete recovery.
          </p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
              Password updated successfully!
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Redirecting...
            </p>
          </div>
        ) : (
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
              <label htmlFor="new-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.35rem' }}>
                New Password (min 6 characters)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
                <input
                  id="new-password"
                  type="password"
                  required
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

            <div>
              <label htmlFor="confirm-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
                <input
                  id="confirm-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
