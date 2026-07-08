import { vi } from 'vitest';

export interface MockQueryResult {
  data: unknown;
  error: { message: string } | null;
}

/**
 * `@supabase/supabase-js`'in fluent query builder'ını (select/upsert/eq/
 * gt/order/limit zincirlenebilir, sonunda `await`lenebilir) taklit eden
 * sahte bir nesne. Testler `mockSupabase.from` üzerinde `mockReturnValueOnce`
 * ile bu builder'ı override ederek istedikleri senaryoyu (başarı/hata)
 * simüle edebilir.
 */
export function createQueryBuilder(result: MockQueryResult = { data: [], error: null }) {
  const builder = {
    select: vi.fn(() => builder),
    upsert: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    gt: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    abortSignal: vi.fn(() => builder),
    then: (resolve: (value: MockQueryResult) => void) => resolve(result),
  };
  return builder;
}

export function createSupabaseMock() {
  return {
    from: vi.fn(() => createQueryBuilder()),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  };
}
