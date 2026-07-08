import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../database/db';
import { supabase } from '../lib/supabaseClient';
import { createQueryBuilder } from '../test-utils/supabaseMock';
import { pushOutbox } from './pushOutbox';

describe('pushOutbox', () => {
  beforeEach(async () => {
    await db.outbox.clear();
    vi.mocked(supabase.from).mockReset();
  });

  it('boş outbox için hiçbir şey yapmaz', async () => {
    await pushOutbox();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('başarılı upsert sonrası kaydı outbox\'tan siler', async () => {
    await db.outbox.add({
      tableName: 'teachers',
      entityId: 't1',
      operation: 'upsert',
      payload: { id: 't1', fullName: 'Ali' },
      createdAt: '2026-01-01T00:00:00.000Z',
      attempts: 0,
    });

    vi.mocked(supabase.from).mockReturnValue(
      createQueryBuilder({ data: [{ id: 't1' }], error: null }) as never,
    );

    await pushOutbox();

    expect(await db.outbox.count()).toBe(0);
  });

  it('camelCase payload\'ı snake_case olarak gönderir', async () => {
    await db.outbox.add({
      tableName: 'teachers',
      entityId: 't1',
      operation: 'upsert',
      payload: { id: 't1', fullName: 'Ali', schoolName: 'Okul' },
      createdAt: '2026-01-01T00:00:00.000Z',
      attempts: 0,
    });

    const builder = createQueryBuilder({ data: [{ id: 't1' }], error: null });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    await pushOutbox();

    expect(builder.upsert).toHaveBeenCalledWith({ id: 't1', full_name: 'Ali', school_name: 'Okul' });
  });

  it('delete operasyonunu gerçek DELETE yerine deleted_at damgalayan update olarak gönderir', async () => {
    await db.outbox.add({
      tableName: 'questions',
      entityId: 'q1',
      operation: 'delete',
      payload: { id: 'q1', deletedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      createdAt: '2026-01-01T00:00:00.000Z',
      attempts: 0,
    });

    const builder = createQueryBuilder({ data: [{ id: 'q1' }], error: null });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    await pushOutbox();

    expect(builder.update).toHaveBeenCalledWith({
      id: 'q1',
      deleted_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });
    expect(builder.eq).toHaveBeenCalledWith('id', 'q1');
    expect(builder.upsert).not.toHaveBeenCalled();
    expect(await db.outbox.count()).toBe(0);
  });

  it('bir kayıt hata verince sıradaki (farklı tabloya ait olsa bile) kayıtları bekletir', async () => {
    await db.outbox.add({
      tableName: 'teachers',
      entityId: 't1',
      operation: 'upsert',
      payload: { id: 't1', fullName: 'Ali' },
      createdAt: '2026-01-01T00:00:00.000Z',
      attempts: 0,
    });
    await db.outbox.add({
      tableName: 'classes',
      entityId: 'c1',
      operation: 'upsert',
      payload: { id: 'c1', teacherId: 't1', name: '7/A' },
      createdAt: '2026-01-01T00:00:01.000Z',
      attempts: 0,
    });

    vi.mocked(supabase.from).mockReturnValueOnce(
      createQueryBuilder({ data: null, error: { message: 'network error' } }) as never,
    );

    await pushOutbox();

    // İlk kayıt hata aldı, işaretlendi ama silinmedi; ikinci kayda hiç dokunulmadı.
    expect(supabase.from).toHaveBeenCalledTimes(1);
    const remaining = await db.outbox.toCollection().sortBy('localId');
    expect(remaining).toHaveLength(2);
    expect(remaining[0].attempts).toBe(1);
    expect(remaining[0].lastError).toBe('network error');
    expect(remaining[1].attempts).toBe(0);
  });
});
