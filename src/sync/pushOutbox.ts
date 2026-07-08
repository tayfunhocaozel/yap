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
 *
 * `delete` operasyonu Postgres'te gerçek `DELETE` değil, `deleted_at`
 * damgalayan bir `update`'tir (tombstone) — diğer cihazların pull
 * sorgusu (`updated_at` cursor'lı) silinmiş satırı da görebilsin diye.
 */
export async function pushOutbox(): Promise<void> {
  const entries = await db.outbox.toCollection().sortBy('localId');

  for (const entry of entries) {
    const { error } =
      entry.operation === 'delete'
        ? await supabase.from(entry.tableName).update(toSnakeCase(entry.payload)).eq('id', entry.entityId)
        : await supabase.from(entry.tableName).upsert(toSnakeCase(entry.payload));

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
