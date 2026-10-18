import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, LogIn, ExternalLink, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { Avatar } from '../common/Avatar';
import { AuthContext } from '../../context/AuthContext';

export interface NavbarProps {
  onOpenAuth?: () => void;
  onOpenProfileEdit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenProfileEdit }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const auth = useContext(AuthContext);
  const user = auth?.user;
  const profile = auth?.profile;

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    if (auth?.signOut) {
      try {
        await auth.signOut();
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
  };

  return (
    <>
      <header
        className="glass-panel"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          width: '100%',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4rem',
            gap: '1rem',
          }}
        >
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 800,
                fontSize: '1.35rem',
                letterSpacing: '-0.03em',
                color: 'var(--foreground)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <ExternalLink size={16} strokeWidth={2.5} />
              </div>
              <span>
                News<span style={{ color: 'var(--primary)' }}>.</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '1.25rem',
              }}
              className="desktop-nav-links"
            >
              <Link
                to="/"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--foreground)',
                }}
              >
                Discover
              </Link>
            </nav>
          </div>

          {/* Explicitly Non-Functional Placeholder Search Bar */}
          <div
            className="search-container"
            style={{
              flex: 1,
              maxWidth: '420px',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  color: 'var(--muted-foreground)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                disabled
                aria-disabled="true"
                aria-label="Search links and topics (coming soon)"
                placeholder="Search links, topics... (coming soon)"
                title="Search functionality will be available in v2"
                style={{
                  width: '100%',
                  height: '2.35rem',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--muted-foreground)',
                  fontSize: '0.85rem',
                  cursor: 'not-allowed',
                  opacity: 0.8,
                }}
              />
            </div>
          </div>

          {/* Actions & Mobile Menu Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Desktop Actions */}
            <div className="desktop-auth-actions" style={{ display: 'none' }}>
              {user ? (
                <div style={{ position: 'relative' }} ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="User account menu"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.35rem 0.6rem 0.35rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      color: 'var(--foreground)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <Avatar
                      avatarUrl={profile?.avatar_url}
                      displayName={profile?.display_name || user.email}
                      username={profile?.username}
                      size={28}
                    />
                    <span
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {profile?.display_name || profile?.username || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={14} style={{ opacity: 0.7 }} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      role="menu"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 0.5rem)',
                        width: '220px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                        zIndex: 50,
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderBottom: '1px solid #1e293b',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>
                          {profile?.display_name || 'Creator'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          @{profile?.username || 'user'}
                        </div>
                      </div>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenProfileEdit) onOpenProfileEdit();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#e2e8f0',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <UserIcon size={16} />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#f87171',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="btn btn-primary"
                  style={{ fontSize: '0.825rem', padding: '0.45rem 0.95rem' }}
                >
                  <LogIn size={15} />
                  <span>Sign In / Join</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="btn btn-ghost mobile-menu-btn"
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Nav Sheet */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAuth={onOpenAuth}
        onOpenProfileEdit={onOpenProfileEdit}
      />

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .desktop-search-wrapper {
            display: block !important;
          }
          .desktop-auth-actions {
            display: block !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
