import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';

describe('Supabase Client & Type Definitions Verification', () => {
  it('exports an initialized supabase client instance', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.rpc).toBe('function');
  });

  it('provides typed profile table query builder', () => {
    const query = supabase.from('profiles').select('*');
    expect(query).toBeDefined();
  });

  it('exports valid Profile interface matching database types', () => {
    const mockProfile: Profile = {
      id: '11111111-1111-1111-1111-111111111111',
      username: 'test_creator',
      display_name: 'Test Creator',
      bio: 'Testing profile type definitions',
      avatar_url: 'https://example.com/avatar.png',
      website_url: 'https://example.com',
      created_at: '2026-10-18T12:00:00Z',
      updated_at: '2026-10-18T12:00:00Z',
    };

    expect(mockProfile.username).toBe('test_creator');
    expect(mockProfile.avatar_url?.startsWith('https://')).toBe(true);
  });
});
