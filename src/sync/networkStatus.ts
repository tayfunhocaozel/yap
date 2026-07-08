import { supabase } from '../lib/supabaseClient';

const PROBE_TIMEOUT_MS = 5000;

/**
 * `navigator.onLine` tek başına güvenilmez (Wi-Fi'ye bağlı ama internetsiz
 * durumları yanlış "online" gösterebilir). Bunun yerine gerçek, hafif bir
 * Supabase isteği (tek satır, limit 1) ile bağlantıyı doğrudan test eder.
 */
export async function isReachable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const { error } = await supabase.from('teachers').select('id').limit(1).abortSignal(controller.signal);
    clearTimeout(timeout);
    return !error;
  } catch {
    return false;
  }
}
