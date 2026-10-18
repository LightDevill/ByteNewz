import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      className="container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        paddingTop: '3rem',
      }}
    >
      <div
        style={{
          fontSize: '5rem',
          fontWeight: 900,
          color: 'var(--primary)',
          lineHeight: 1,
          marginBottom: '1rem',
          letterSpacing: '-0.05em',
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
        Page Not Found
      </h1>
      <p style={{ maxWidth: '420px', color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        The page you are looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} />
        <span>Back to Discover Feed</span>
      </Link>
    </div>
  );
};
