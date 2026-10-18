import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  onOpenAuth?: () => void;
  onOpenProfileEdit?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onOpenAuth, onOpenProfileEdit }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
      }}
    >
      <Navbar onOpenAuth={onOpenAuth} onOpenProfileEdit={onOpenProfileEdit} />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {children}
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          backgroundColor: 'rgba(11, 15, 23, 0.95)',
          padding: '2rem 0',
          marginTop: 'auto',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            textAlign: 'center',
            color: 'var(--muted-foreground)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>
            News. <span style={{ fontWeight: 400, color: 'var(--muted-foreground)' }}>— High-signal link discovery</span>
          </div>
          <p style={{ maxWidth: '480px', lineHeight: 1.4 }}>
            A responsive, link-based discovery platform for YouTube, Instagram, and web media.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            &copy; {new Date().getFullYear()} News. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
