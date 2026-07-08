import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./syncEngine', () => ({ kickSync: vi.fn() }));

import { db } from '../database/db';
import { kickSync } from './syncEngine';
import { createSyncedTable } from './createSyncedTable';

describe('createSyncedTable', () => {
  const synced = createSyncedTable(db.teachers, 'teachers');

  beforeEach(async () => {
    await db.teachers.clear();
    await db.outbox.clear();
    vi.mocked(kickSync).mockClear();
  });

  it('add: tabloya yazar, updatedAt damgalar ve outbox\'a upsert kaydı ekler', async () => {
    await synced.add({ id: 't1', fullName: 'Ali', branch: 'Matematik', active: true });

    const saved = await db.teachers.get('t1');
    expect(saved?.fullName).toBe('Ali');
    expect(typeof saved?.updatedAt).toBe('string');

    const outboxEntries = await db.outbox.toArray();
    expect(outboxEntries).toHaveLength(1);
    expect(outboxEntries[0]).toMatchObject({ tableName: 'teachers', entityId: 't1', operation: 'upsert' });
  });

  it('add sonrası kickSync çağrılır', async () => {
    await synced.add({ id: 't1', fullName: 'Ali', branch: 'Matematik', active: true });
    expect(kickSync).toHaveBeenCalledTimes(1);
  });

  it('update: tabloyu günceller ve outbox\'a TAM (merge edilmiş) satırı yazar', async () => {
    await synced.add({ id: 't1', fullName: 'Ali', branch: 'Matematik', active: true });
    await db.outbox.clear(); // add'in outbox kaydını temizle, sadece update'inkini incele

    await synced.update('t1', { schoolName: 'Atatürk Ortaokulu' });

    const saved = await db.teachers.get('t1');
    expect(saved?.schoolName).toBe('Atatürk Ortaokulu');
    expect(saved?.fullName).toBe('Ali'); // değişmeyen alan korunmuş

    const outboxEntries = await db.outbox.toArray();
    expect(outboxEntries).toHaveLength(1);
    // Outbox'a partial değil, merge edilmiş TAM satır yazılmalı.
    expect(outboxEntries[0].payload).toMatchObject({ id: 't1', fullName: 'Ali', schoolName: 'Atatürk Ortaokulu' });
  });

  it('update sonrası kickSync çağrılır', async () => {
    await synced.add({ id: 't1', fullName: 'Ali', branch: 'Matematik', active: true });
    vi.mocked(kickSync).mockClear();

    await synced.update('t1', { fullName: 'Veli' });

    expect(kickSync).toHaveBeenCalledTimes(1);
  });
});
