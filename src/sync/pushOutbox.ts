import { db } from '../database/db';
import { supabase } from '../lib/supabaseClient';
import { toSnakeCase } from './caseConverter';

/**
 * Outbox'taki bekleyen değişiklikleri (ekleme sırasına — `localId` —
 * göre) Supabase'e gönderir. İlk hatada durur: `classes.teacher_id`
 * gibi FK'ler `teachers.id`'ye bağlı olduğu için sıranın bozulmaması
 * (bir üst kaydın gönderilmeden bir alt kaydın gönderilmemesi) önemli.
 * Başarısız kayıt `attempts`/`lastError` ile işaretlenir, bir sonraki
 * senkron denemesinde kaldığı yerden devam edilir.
 */
export async function pushOutbox(): Promise<void> {
  const entries = await db.outbox.toCollection().sortBy('localId');

  for (const entry of entries) {
    const { error } = await supabase.from(entry.tableName).upsert(toSnakeCase(entry.payload));

    if (error) {
      await db.outbox.update(entry.localId!, {
        attempts: entry.attempts + 1,
        lastError: error.message,
      });
      break;
    }

    await db.outbox.delete(entry.localId!);
  }
}
