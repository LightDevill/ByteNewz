import { Compass, Flame, Clock, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Feed Filter / Intro Bar */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary">
                <Sparkles size={12} style={{ marginRight: '0.25rem' }} />
                Public Discovery
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#f8fafc' }}>
              Latest Discoveries
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Curated links to high-signal videos, stories, and articles across the web.
            </p>
          </div>

          {/* Feed Filter Pills (Newest First MVP Baseline) */}
          <div
            style={{
              display: 'inline-flex',
              padding: '0.25rem',
              backgroundColor: '#111827',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              gap: '0.25rem',
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
              }}
            >
              <Clock size={14} />
              <span>Newest First</span>
            </button>
            <button
              type="button"
              disabled
              title="Trending feed arriving in v2"
              className="btn btn-ghost"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
            >
              <Flame size={14} />
              <span>Trending</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feed Layout Placeholder */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #334155',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '1rem',
            }}
          >
            <Compass size={24} />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Phase 1 Foundation Operational
          </h2>
          <p style={{ maxWidth: '440px', color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Application shell, accessible responsive navigation, and design tokens are ready. The public feed and keyset infinite scrolling will connect in Phase 2.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <span className="badge">React 18 + TS</span>
            <span className="badge">Vite</span>
            <span className="badge">Supabase Ready</span>
          </div>
        </div>
      </section>
    </div>
  );
};
