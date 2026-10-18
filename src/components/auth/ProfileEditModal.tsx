import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { X, User, Globe, Image, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setWebsiteUrl(profile.website_url || '');
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanDisplay = displayName.trim();
    const cleanBio = bio.trim();
    const cleanAvatar = avatarUrl.trim();
    const cleanWebsite = websiteUrl.trim();

    if (!cleanDisplay || cleanDisplay.length > 50) {
      setErrorMsg('Display name must be between 1 and 50 characters.');
      return;
    }

    if (cleanBio.length > 250) {
      setErrorMsg('Bio cannot exceed 250 characters.');
      return;
    }

    if (cleanAvatar && !cleanAvatar.startsWith('https://')) {
      setErrorMsg('Avatar URL must be a valid link starting with https://');
      return;
    }

    if (cleanWebsite && !cleanWebsite.startsWith('https://')) {
      setErrorMsg('Website URL must start with https://');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        displayName: cleanDisplay,
        bio: cleanBio || null,
        avatarUrl: cleanAvatar || null,
        websiteUrl: cleanWebsite || null,
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-edit-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
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
          maxWidth: '480px',
          backgroundColor: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 id="profile-edit-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Edit Profile
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
              Update your public creator profile and bio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile editor"
            className="btn btn-ghost"
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={18} />
          </button>
        </div>

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
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#10b981',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Avatar Preview & Handle Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem',
              backgroundColor: '#111827',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <Avatar
              avatarUrl={avatarUrl}
              displayName={displayName || profile.display_name}
              username={profile.username}
              size={52}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                  @{profile.username}
                </span>
                <span className="badge" style={{ fontSize: '0.7rem' }}>
                  Creator
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                Handle is permanent. Live avatar preview shown.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="edit-display-name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.3rem' }}>
              Display Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
              <input
                id="edit-display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <label htmlFor="edit-bio" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                Bio
              </label>
              <span style={{ fontSize: '0.75rem', color: bio.length > 250 ? '#f87171' : 'var(--muted-foreground)' }}>
                {bio.length} / 250
              </span>
            </div>
            <textarea
              id="edit-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={250}
              placeholder="Tell others what topics and media links you discover..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                backgroundColor: '#0f172a',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--foreground)',
                fontSize: '0.875rem',
                resize: 'none',
              }}
            />
          </div>

          <div>
            <label htmlFor="edit-avatar-url" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.3rem' }}>
              External Avatar Image URL (https://)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Image size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
              <input
                id="edit-avatar-url"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
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
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Direct HTTPS link. Zero file uploads or storage buckets required.
            </p>
          </div>

          <div>
            <label htmlFor="edit-website-url" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.3rem' }}>
              Website / Social Link (https://)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Globe size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
              <input
                id="edit-website-url"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://youtube.com/@channel"
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

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
