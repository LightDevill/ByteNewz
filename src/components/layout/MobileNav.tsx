import React, { useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { X, Compass, Info, LogIn, User as UserIcon, LogOut } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { AuthContext } from '../../context/AuthContext';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
  onOpenProfileEdit?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onOpenProfileEdit,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const profile = auth?.profile;

  // Close on Escape key and manage body overflow
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
      className="mobile-nav-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
        style={{
          width: '85%',
          maxWidth: '320px',
          height: '100%',
          backgroundColor: '#0f172a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: '#f8fafc' }}>
              News<span style={{ color: '#6366f1' }}>.</span>
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="btn btn-ghost"
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card if Authenticated */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #1e293b',
              marginBottom: '1.5rem',
            }}
          >
            <Avatar
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name || user.email}
              username={profile?.username}
              size={36}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {profile?.display_name || 'Creator'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                @{profile?.username || 'user'}
              </div>
            </div>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          <Link
            to="/"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: '#f8fafc',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              fontWeight: 500,
            }}
          >
            <Compass size={18} color="#6366f1" />
            <span>Discover Feed</span>
          </Link>

          {user && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenProfileEdit) onOpenProfileEdit();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: '#f8fafc',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              <UserIcon size={18} color="#94a3b8" />
              <span>Edit Profile</span>
            </button>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: '#94a3b8',
              fontSize: '0.9rem',
            }}
          >
            <Info size={18} />
            <span>Public Link Discovery</span>
          </div>
        </nav>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {user ? (
            <button
              onClick={async () => {
                onClose();
                if (auth?.signOut) await auth.signOut();
              }}
              className="btn btn-outline"
              style={{ width: '100%', padding: '0.75rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <LogIn size={16} />
              <span>Sign In / Join</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
