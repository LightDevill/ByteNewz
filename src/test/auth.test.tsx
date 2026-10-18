import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { SignupForm } from '../components/auth/SignupForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { UpdatePasswordModal } from '../components/auth/UpdatePasswordModal';
import { ProfileEditModal } from '../components/auth/ProfileEditModal';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../types/database.types';

// Captured callback for onAuthStateChange
let authStateListener: ((event: string, session: Session | null) => void) | null = null;

const { mockAuth, mockFrom, mockRpc } = vi.hoisted(() => ({
  mockAuth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: mockAuth,
    from: mockFrom,
    rpc: mockRpc,
  },
}));

// Test Consumer to inspect AuthContext values in testing
const AuthConsumer: React.FC<{
  onState?: (state: ReturnType<typeof useAuth>) => void;
}> = ({ onState }) => {
  const auth = useAuth();
  if (onState) onState(auth);

  return (
    <div>
      <div data-testid="auth-loading">{auth.isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="auth-user">{auth.user ? auth.user.email : 'guest'}</div>
      <div data-testid="auth-profile">{auth.profile ? auth.profile.username : 'no-profile'}</div>
      <div data-testid="auth-error">{auth.profileError || 'no-error'}</div>
      <button onClick={() => auth.signOut()} data-testid="signout-btn">
        Sign Out
      </button>
      <button
        onClick={() =>
          auth.updateProfile({
            displayName: 'Updated Name',
            bio: 'Updated Bio',
            avatarUrl: 'https://valid.com/avatar.jpg',
            websiteUrl: 'https://valid.com',
          })
        }
        data-testid="update-profile-btn"
      >
        Update Profile
      </button>
    </div>
  );
};

describe('Phase 1 Plan 03 Authentication & Profile Verification', () => {
  const dummyUser: User = {
    id: '11111111-1111-1111-1111-111111111111',
    app_metadata: {},
    user_metadata: { display_name: 'Alex Rivera', username: 'alexr' },
    aud: 'authenticated',
    created_at: '2026-10-18T10:00:00Z',
    email: 'alex@example.com',
  } as User;

  const dummySession: Session = {
    access_token: 'fake-jwt-token',
    refresh_token: 'fake-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: dummyUser,
  };

  const dummyProfile: Profile = {
    id: '11111111-1111-1111-1111-111111111111',
    username: 'alexr',
    display_name: 'Alex Rivera',
    bio: 'Discovering news and links',
    avatar_url: 'https://images.example.com/alex.jpg',
    website_url: 'https://alex.example.com',
    created_at: '2026-10-18T10:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authStateListener = null;

    mockAuth.onAuthStateChange.mockImplementation((cb) => {
      authStateListener = cb;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    // Default guest session
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  describe('Avatar Component & Error Fallbacks', () => {
    it('renders img element for valid https:// URL with no-referrer policy', () => {
      render(
        <Avatar
          avatarUrl="https://example.com/avatar.jpg"
          displayName="Sarah Connor"
          username="sarahc"
          size={40}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
    });

    it('falls back to deterministic initials on img onError failure', () => {
      render(
        <Avatar
          avatarUrl="https://example.com/broken.jpg"
          displayName="Sarah Connor"
          username="sarahc"
          size={40}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();

      // Simulate broken image network failure
      fireEvent.error(img);

      // Img element is removed and initials badge is rendered
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('SC')).toBeInTheDocument();
    });

    it('immediately renders initials without img tag if avatarUrl is non-https or absent', () => {
      render(
        <Avatar
          avatarUrl="http://insecure.com/pic.jpg"
          displayName="John Wick"
          username="johnw"
          size={36}
        />
      );

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('JW')).toBeInTheDocument();
    });
  });

  describe('Registration & Email Confirmation Notice', () => {
    it('shows Check Your Inbox view when registration requires email confirmation', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: dummyUser, session: null },
        error: null,
      });

      render(
        <AuthProvider>
          <SignupForm onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/display name/i), {
        target: { value: 'Alex Rivera' },
      });
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'alexr' },
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'alex@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'secret123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /check your inbox/i })).toBeInTheDocument();
        expect(screen.getByText(/alex@example.com/i)).toBeInTheDocument();
      });

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'alex@example.com',
        password: 'secret123',
        options: {
          data: {
            display_name: 'Alex Rivera',
            username: 'alexr',
          },
        },
      });
    });
  });

  describe('Session Persistence & Hydration', () => {
    it('hydrates session and queries profile record on initial mount', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: dummySession },
        error: null,
      });

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: dummyProfile,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading').textContent).toBe('ready');
      });

      expect(screen.getByTestId('auth-user').textContent).toBe('alex@example.com');
      expect(screen.getByTestId('auth-profile').textContent).toBe('alexr');
      expect(screen.getByTestId('auth-error').textContent).toBe('no-error');
      expect(mockFrom).toHaveBeenCalledWith('profiles');
    });

    it('clears state cleanly to guest when sign out is invoked', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: dummySession },
        error: null,
      });
      mockAuth.signOut.mockResolvedValue({ error: null });

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: dummyProfile,
        error: null,
      });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
        }),
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-user').textContent).toBe('alex@example.com');
      });

      fireEvent.click(screen.getByTestId('signout-btn'));

      await waitFor(() => {
        expect(mockAuth.signOut).toHaveBeenCalled();
        expect(screen.getByTestId('auth-user').textContent).toBe('guest');
        expect(screen.getByTestId('auth-profile').textContent).toBe('no-profile');
      });
    });
  });

  describe('Bounded JIT Profile Self-Healing & Loop Prevention', () => {
    it('triggers ensure_profile_exists RPC when profile record is missing', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: dummySession },
        error: null,
      });

      // 1. Initial query returns null (profile not found in table)
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
        }),
      });

      // 2. RPC recovers profile successfully
      mockRpc.mockResolvedValue({
        data: dummyProfile,
        error: null,
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('ensure_profile_exists');
        expect(screen.getByTestId('auth-profile').textContent).toBe('alexr');
      });
    });

    it('guarantees single-attempt bounded RPC call without infinite retry loop when recovery fails', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: dummySession },
        error: null,
      });

      // 1. Initial query returns null
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
        }),
      });

      // 2. RPC fails with error
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC execution failed' },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading').textContent).toBe('ready');
      });

      // RPC must have been called exactly once
      expect(mockRpc).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('auth-error').textContent).toContain('Unable to load or initialize');
      expect(screen.getByTestId('auth-profile').textContent).toBe('no-profile');
    });
  });

  describe('Password Reset & Recovery Redirect Flow', () => {
    it('requests password reset email with recovery redirect hash', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      render(
        <AuthProvider>
          <ResetPasswordForm onBackToLogin={vi.fn()} />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'alex@example.com' },
      });

      fireEvent.click(screen.getByRole('button', { name: /send recovery link/i }));

      await waitFor(() => {
        expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
          'alex@example.com',
          expect.objectContaining({
            redirectTo: expect.stringContaining('#type=recovery'),
          })
        );
        expect(screen.getByText(/reset link sent/i)).toBeInTheDocument();
      });
    });

    it('mounts UpdatePasswordModal when PASSWORD_RECOVERY event is triggered', async () => {
      render(
        <AuthProvider>
          <UpdatePasswordModal />
        </AuthProvider>
      );

      // Initially closed
      expect(screen.queryByRole('dialog', { name: /set new password/i })).not.toBeInTheDocument();

      // Trigger PASSWORD_RECOVERY auth event
      act(() => {
        if (authStateListener) {
          authStateListener('PASSWORD_RECOVERY', dummySession);
        }
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /set new password/i })).toBeInTheDocument();
      });

      // Submit new password
      mockAuth.updateUser.mockResolvedValue({
        data: { user: dummyUser },
        error: null,
      });

      fireEvent.change(screen.getByLabelText(/^new password/i), {
        target: { value: 'newsecurepass123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm new password/i), {
        target: { value: 'newsecurepass123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /update password/i }));

      await waitFor(() => {
        expect(mockAuth.updateUser).toHaveBeenCalledWith({
          password: 'newsecurepass123',
        });
      });
    });
  });

  describe('Profile Update Validations & Database Constraints', () => {
    it('enforces bio character limit <= 250 in ProfileEditModal', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: dummySession },
        error: null,
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: dummyProfile,
        error: null,
      });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: mockSingle }),
        }),
      });

      render(
        <AuthProvider>
          <ProfileEditModal isOpen={true} onClose={vi.fn()} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Alex Rivera')).toBeInTheDocument();
      });

      // Enter bio exceeding 250 characters (251 chars)
      const longBio = 'a'.repeat(251);
      fireEvent.change(screen.getByLabelText(/bio/i), {
        target: { value: longBio },
      });

      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText(/bio cannot exceed 250 characters/i)).toBeInTheDocument();
    });

    it('rejects non-https URLs for avatar and website', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: dummySession },
        error: null,
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: dummyProfile,
        error: null,
      });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: mockSingle }),
        }),
      });

      render(
        <AuthProvider>
          <ProfileEditModal isOpen={true} onClose={vi.fn()} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Alex Rivera')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/external avatar image url/i), {
        target: { value: 'http://insecure-image.com/pic.jpg' },
      });

      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText(/avatar url must be a valid link starting with https:\/\//i)).toBeInTheDocument();
    });

    it('submits valid updates to profiles table matching database schema', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: dummySession },
        error: null,
      });

      const updatedProfile = { ...dummyProfile, display_name: 'Updated Name', bio: 'Updated Bio' };

      const mockUpdateSingle = vi.fn().mockResolvedValue({
        data: updatedProfile,
        error: null,
      });
      const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
      const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: dummyProfile, error: null }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        return {};
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-user').textContent).toBe('alex@example.com');
      });

      fireEvent.click(screen.getByTestId('update-profile-btn'));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          display_name: 'Updated Name',
          bio: 'Updated Bio',
          avatar_url: 'https://valid.com/avatar.jpg',
          website_url: 'https://valid.com',
        });
      });
    });
  });
});
