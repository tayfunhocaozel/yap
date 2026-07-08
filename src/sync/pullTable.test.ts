import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../database/db';
import { supabase } from '../lib/supabaseClient';
import { createQueryBuilder } from '../test-utils/supabaseMock';
import { pullTable } from './pullTable';

describe('pullTable', () => {
  beforeEach(async () => {
    await db.teachers.clear();
    await db.topics.clear();
    await db.curriculumOutcomes.clear();
    await db.outbox.clear();
    await db.syncMeta.clear();
    vi.mocked(supabase.from).mockReset();
  });

  it('gelen satırı camelCase\'e çevirip yerel tabloya yazar, sync-only alanları atar', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createQueryBuilder({
        data: [
          {
            id: 't1',
            full_name: 'Ali',
            branch: 'Matematik',
            school_name: null,
            active: true,
            updated_at: '2026-01-01T00:00:00.000Z',
            created_at: '2026-01-01T00:00:00.000Z',
            deleted_at: null,
          },
        ],
        error: null,
      }) as never,
    );

    await pullTable('teachers', db.teachers);

    const saved = await db.teachers.get('t1');
    expect(saved).toMatchObject({ id: 't1', fullName: 'Ali', branch: 'Matematik', active: true });
    expect(saved).not.toHaveProperty('createdAt');
    expect(saved).not.toHaveProperty('deletedAt');
  });

  it('deleted_at dolu gelen satırı yerelde hard-delete eder (tombstone)', async () => {
    await db.teachers.add({
      id: 't1',
      fullName: 'Ali',
      branch: 'Matematik',
      active: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    vi.mocked(supabase.from).mockReturnValue(
      createQueryBuilder({
        data: [
          {
            id: 't1',
            full_name: 'Ali',
            branch: 'Matematik',
            active: true,
            updated_at: '2026-01-02T00:00:00.000Z',
            deleted_at: '2026-01-02T00:00:00.000Z',
          },
        ],
        error: null,
      }) as never,
    );

    await pullTable('teachers', db.teachers);

    expect(await db.teachers.get('t1')).toBeUndefined();
  });

  it('id\'si outbox\'ta bekleyen bir satırı atlar', async () => {
    await db.outbox.add({
      tableName: 'teachers',
      entityId: 't1',
      operation: 'upsert',
      payload: { id: 't1', fullName: 'Yerel (henüz gönderilmemiş)' },
      createdAt: '2026-01-01T00:00:00.000Z',
      attempts: 0,
    });
    await db.teachers.add({
      id: 't1',
      fullName: 'Yerel (henüz gönderilmemiş)',
      branch: 'Matematik',
      active: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    vi.mocked(supabase.from).mockReturnValue(
      createQueryBuilder({
        data: [
          {
            id: 't1',
            full_name: 'Sunucudan (eski)',
            branch: 'Matematik',
            active: true,
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        ],
        error: null,
      }) as never,
    );

    await pullTable('teachers', db.teachers);

    const saved = await db.teachers.get('t1');
    expect(saved?.fullName).toBe('Yerel (henüz gönderilmemiş)');
  });

  it('syncMeta.lastPulledAt\'i en son satırın updated_at\'ine göre günceller', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createQueryBuilder({
        data: [
          { id: 't1', full_name: 'Ali', branch: 'Mat', active: true, updated_at: '2026-01-01T00:00:00.000Z' },
          { id: 't2', full_name: 'Veli', branch: 'Fen', active: true, updated_at: '2026-01-02T00:00:00.000Z' },
        ],
        error: null,
      }) as never,
    );

    await pullTable('teachers', db.teachers);

    const meta = await db.syncMeta.get('teachers');
    expect(meta?.lastPulledAt).toBe('2026-01-02T00:00:00.000Z');
  });

  it('hiç değişiklik yoksa syncMeta\'ya dokunmaz', async () => {
    vi.mocked(supabase.from).mockReturnValue(createQueryBuilder({ data: [], error: null }) as never);

    await pullTable('teachers', db.teachers);

    expect(await db.syncMeta.get('teachers')).toBeUndefined();
  });

  it('cursor olarak son pull\'un lastPulledAt\'ini kullanır', async () => {
    await db.syncMeta.put({ tableName: 'teachers', lastPulledAt: '2026-01-05T00:00:00.000Z' });
    const builder = createQueryBuilder({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    await pullTable('teachers', db.teachers);

    expect(builder.gt).toHaveBeenCalledWith('updated_at', '2026-01-05T00:00:00.000Z');
  });

  it('Faz 4: topics tablosunda "order" ve subject_id alanlarını doğru camelCase\'e çevirir', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createQueryBuilder({
        data: [
          {
            id: 'topic-1',
            subject_id: 'subject-1',
            grade: 7,
            name: 'Tam Sayılar',
            unit: null,
            order: 3,
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        ],
        error: null,
      }) as never,
    );

    await pullTable('topics', db.topics);

    const saved = await db.topics.get('topic-1');
    expect(saved).toMatchObject({ id: 'topic-1', subjectId: 'subject-1', grade: 7, name: 'Tam Sayılar', order: 3 });
  });

  it('Faz 4: curriculum_outcomes tablosunda topic_id alanını doğru camelCase\'e çevirir', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createQueryBuilder({
        data: [
          {
            id: 'outcome-1',
            topic_id: 'topic-1',
            code: 'M.7.1.1.1',
            description: 'Örnek kazanım açıklaması.',
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        ],
        error: null,
      }) as never,
    );

    await pullTable('curriculum_outcomes', db.curriculumOutcomes);

    const saved = await db.curriculumOutcomes.get('outcome-1');
    expect(saved).toMatchObject({
      id: 'outcome-1',
      topicId: 'topic-1',
      code: 'M.7.1.1.1',
      description: 'Örnek kazanım açıklaması.',
    });
  });
});
