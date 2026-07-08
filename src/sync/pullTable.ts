import type { EntityTable } from 'dexie';
import { db } from '../database/db';
import { supabase } from '../lib/supabaseClient';
import { toCamelCase } from './caseConverter';
import type { SyncedTableName } from './types';

// Supabase satırlarında olup yerel TS entity tiplerinde karşılığı olmayan
// (yalnızca sync/audit amaçlı) alanlar; yerel tabloya yazılmadan önce atılır.
const SYNC_ONLY_FIELDS = ['createdAt', 'deletedAt'];

/**
 * `syncMeta.lastPulledAt` cursor'ından itibaren değişen satırları çeker.
 * O satırın id'si için outbox'ta bekleyen bir yerel değişiklik varsa, o
 * satır atlanır (henüz gönderilmemiş yerel değişikliğin ezilmemesi için).
 * `deletedAt` dolu gelen satırlar (tombstone) yerelde hard-delete edilir.
 */
export async function pullTable<T extends { id: string }>(
  tableName: SyncedTableName,
  table: EntityTable<T, 'id'>,
): Promise<void> {
  const meta = await db.syncMeta.get(tableName);
  const since = meta?.lastPulledAt ?? '1970-01-01T00:00:00.000Z';

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .gt('updated_at', since)
    .order('updated_at');

  if (error || !data) return;

  const rows = data as Record<string, unknown>[];

  for (const row of rows) {
    const camelRow = toCamelCase(row);
    const id = camelRow.id as string;

    const pending = await db.outbox.where('entityId').equals(id).first();
    if (pending) continue;

    if (camelRow.deletedAt) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await table.delete(id as any);
      continue;
    }

    for (const field of SYNC_ONLY_FIELDS) {
      delete camelRow[field];
    }

    await table.put(camelRow as T);
  }

  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    await db.syncMeta.put({ tableName, lastPulledAt: lastRow.updated_at as string });
  }
}
