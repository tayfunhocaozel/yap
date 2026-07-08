import { describe, it, expect, vi } from 'vitest';
import { isReachable } from './networkStatus';
import { supabase } from '../lib/supabaseClient';
import { createQueryBuilder } from '../test-utils/supabaseMock';

describe('isReachable', () => {
  it('hata yoksa true döner', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce(
      createQueryBuilder({ data: [], error: null }) as never,
    );
    expect(await isReachable()).toBe(true);
  });

  it('Supabase hata dönerse false döner', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce(
      createQueryBuilder({ data: null, error: { message: 'network error' } }) as never,
    );
    expect(await isReachable()).toBe(false);
  });

  it('istek fırlatırsa (throw) false döner', async () => {
    vi.mocked(supabase.from).mockImplementationOnce(() => {
      throw new Error('boom');
    });
    expect(await isReachable()).toBe(false);
  });
});
