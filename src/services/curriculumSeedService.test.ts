import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { seedCurriculum } from './curriculumSeedService';

describe('curriculumSeedService', () => {
  beforeEach(async () => {
    await db.subjects.clear();
    await db.topics.clear();
    await db.curriculumOutcomes.clear();
  });

  it('seed dosyalarından Subject/Topic/CurriculumOutcome oluşturur', async () => {
    await seedCurriculum();

    const subjectCount = await db.subjects.count();
    const outcomeCount = await db.curriculumOutcomes.count();

    expect(subjectCount).toBeGreaterThan(0);
    expect(outcomeCount).toBeGreaterThan(0);

    const matematik = await db.subjects.filter((s) => s.name === 'Matematik').first();
    expect(matematik).toBeDefined();
  });

  it('iki kez çalıştırıldığında kazanımları tekrar oluşturmaz (idempotent)', async () => {
    await seedCurriculum();
    const firstCount = await db.curriculumOutcomes.count();

    await seedCurriculum();
    const secondCount = await db.curriculumOutcomes.count();

    expect(secondCount).toBe(firstCount);
  });

  it('İnkılap Tarihi dersini içe aktarmaz (V1 kapsamı dışında)', async () => {
    await seedCurriculum();
    const inkilap = await db.subjects
      .filter((s) => s.name === 'T.C. İnkılap Tarihi ve Atatürkçülük')
      .first();
    expect(inkilap).toBeUndefined();
  });
});
