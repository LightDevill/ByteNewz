import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { NotFoundPage } from '../pages/NotFoundPage';

describe('Phase 1 Plan 01 Navigation & Accessibility Verification', () => {
  it('renders brand logo and action button in Navbar', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/News/i)).toBeInTheDocument();
    expect(screen.getByText(/Discover/i)).toBeInTheDocument();
  });

  it('renders search input as explicitly non-functional disabled placeholder UI', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const searchInput = screen.getByRole('textbox', { name: /search links and topics/i });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeDisabled();
    expect(searchInput).toHaveAttribute('aria-disabled', 'true');
    expect(searchInput).toHaveAttribute('placeholder', 'Search links, topics... (coming soon)');
  });

  it('renders mobile navigation drawer with proper accessibility dialog attributes', () => {
    const handleClose = () => {};
    render(
      <MemoryRouter>
        <MobileNav isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    const dialog = screen.getByRole('dialog', { name: /mobile navigation drawer/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('closes mobile navigation drawer on Escape key press', () => {
    let closed = false;
    render(
      <MemoryRouter>
        <MobileNav isOpen={true} onClose={() => { closed = true; }} />
      </MemoryRouter>
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(closed).toBe(true);
  });

  it('renders 404 page with return link for invalid routes', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to discover feed/i })).toBeInTheDocument();
  });
});
