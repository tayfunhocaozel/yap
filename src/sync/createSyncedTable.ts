import type { EntityTable } from 'dexie';
import { db } from '../database/db';
import { kickSync } from './syncEngine';
import type { SyncedTableName } from './types';

/**
 * `add`/`update` çağrılarını hem ilgili Dexie tablosuna hem de `outbox`
 * push kuyruğuna (aynı transaction içinde, atomik olarak) yazan bir
 * fabrika. `updatedAt` otomatik damgalanır. `kickSync()` transaction
 * PROMISE'İ RESOLVE OLDUKTAN SONRA (`.then()` ile, callback'in dışında)
 * çağrılır — Dexie transaction callback'i içinde ekstra Dexie çağrıları
 * tetiklememek için.
 */
export function createSyncedTable<T extends { id: string; updatedAt: string }>(
  table: EntityTable<T, 'id'>,
  tableName: SyncedTableName,
) {
  async function add(entity: Omit<T, 'updatedAt'>): Promise<string> {
    const updatedAt = new Date().toISOString();
    const withTimestamp = { ...entity, updatedAt } as T;

    const result = await db.transaction('rw', table, db.outbox, async () => {
      await table.add(withTimestamp);
      await db.outbox.add({
        tableName,
        entityId: entity.id,
        operation: 'upsert',
        payload: withTimestamp,
        createdAt: updatedAt,
        attempts: 0,
      });
      return entity.id;
    });

    kickSync();
    return result;
  }

  async function update(id: string, changes: Partial<Omit<T, 'updatedAt'>>): Promise<number> {
    const updatedAt = new Date().toISOString();
    const withTimestamp = { ...changes, updatedAt } as Partial<T>;

    const result = await db.transaction('rw', table, db.outbox, async () => {
      // Dexie'nin IDType<T, 'id'> mapped tipi generic T ile tam çözümlenemiyor
      // (bilinen bir Dexie/TS kısıtı); id zaten her zaman string.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = await table.update(id as any, withTimestamp as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const full = await table.get(id as any);
      if (full) {
        await db.outbox.add({
          tableName,
          entityId: id,
          operation: 'upsert',
          payload: full,
          createdAt: updatedAt,
          attempts: 0,
        });
      }
      return count;
    });

    kickSync();
    return result;
  }

  return { add, update };
}
