import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { vi } from 'vitest';
import { createSupabaseMock } from './test-utils/supabaseMock';

// Kritik: bu mock olmadan testler gerçek Supabase'e (gerçek .env kimlik
// bilgileriyle) ağ isteği atmaya çalışırdı — hem yavaş/flaky hem de .env
// olmayan bir ortamda (temiz clone) supabaseClient.ts import anında throw
// edip TÜM testleri kırardı.
vi.mock('./lib/supabaseClient', () => ({
  supabase: createSupabaseMock(),
}));
