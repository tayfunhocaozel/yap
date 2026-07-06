import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { seedCurriculum } from './curriculumSeedService';

describe('curriculumSeedService', () => {
  beforeEach(async () => {
    await db.subjects.clear();
    await db.topics.clear();
    await db.curriculumOutcomes.clear();
    await db.questions.clear();
    await db.interventions.clear();
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

  it('konulara müfredat kaynak sırasına göre artan order atar', async () => {
    await seedCurriculum();

    const matematik = await db.subjects.filter((s) => s.name === 'Matematik').first();
    const topics = await db.topics
      .filter((t) => t.subjectId === matematik!.id && t.grade === 7)
      .toArray();

    const orders = topics.map((t) => t.order).sort((a, b) => a - b);
    expect(orders).toEqual(topics.map((_, i) => i));
  });

  it('order alanı olmayan eski kayıtları tekrar çalıştırıldığında geriye dönük doldurur', async () => {
    await seedCurriculum();
    const before = await db.topics.toArray();

    // Eski (order eklenmeden önce) seed edilmiş veriyi simüle et.
    await db.topics.toCollection().modify({ order: undefined });

    await seedCurriculum();
    const after = await db.topics.toArray();

    expect(after.every((t) => typeof t.order === 'number')).toBe(true);
    expect(after.map((t) => t.order).sort()).toEqual(before.map((t) => t.order).sort());
  });

  it('iki bağımsız temiz kurulumda aynı id\'leri üretir (deterministik)', async () => {
    await seedCurriculum();
    const firstSubjects = await db.subjects.toArray();
    const firstTopics = await db.topics.toArray();
    const firstOutcomes = await db.curriculumOutcomes.toArray();

    await db.subjects.clear();
    await db.topics.clear();
    await db.curriculumOutcomes.clear();
    await seedCurriculum();
    const secondSubjects = await db.subjects.toArray();
    const secondTopics = await db.topics.toArray();
    const secondOutcomes = await db.curriculumOutcomes.toArray();

    expect(secondSubjects.map((s) => s.id).sort()).toEqual(firstSubjects.map((s) => s.id).sort());
    expect(secondTopics.map((t) => t.id).sort()).toEqual(firstTopics.map((t) => t.id).sort());
    expect(secondOutcomes.map((o) => o.id).sort()).toEqual(firstOutcomes.map((o) => o.id).sort());
  });

  it('eski rastgele id ile seed edilmiş kayıtları deterministik id\'ye geçirir (re-key) ve referansları günceller', async () => {
    // Önce gerçek (deterministik id'li) bir kurulum yap, sonra bunun
    // içeriğini "eski" (deterministik id öncesi) rastgele-id'li bir kurulum
    // gibi göstermek için aynı alanlarla ama rastgele id'lerle yeniden ekle.
    await seedCurriculum();
    const realSubject = (await db.subjects.toArray())[0];
    const realTopic = (await db.topics.filter((t) => t.subjectId === realSubject.id).toArray())[0];
    const realOutcome = (
      await db.curriculumOutcomes.filter((o) => o.topicId === realTopic.id).toArray()
    )[0];

    const oldSubjectId = crypto.randomUUID();
    const oldTopicId = crypto.randomUUID();
    const oldOutcomeId = crypto.randomUUID();
    await db.subjects.clear();
    await db.topics.clear();
    await db.curriculumOutcomes.clear();
    await db.subjects.add({ ...realSubject, id: oldSubjectId });
    await db.topics.add({ ...realTopic, id: oldTopicId, subjectId: oldSubjectId });
    await db.curriculumOutcomes.add({ ...realOutcome, id: oldOutcomeId, topicId: oldTopicId });

    // Bu eski id'lere referans veren bir soru ve telafi kaydı.
    await db.questions.add({
      id: crypto.randomUUID(),
      examId: 'exam-1',
      questionNo: 1,
      score: 10,
      topicId: oldTopicId,
      outcomeId: oldOutcomeId,
    });
    await db.interventions.add({
      id: crypto.randomUUID(),
      examId: 'exam-1',
      outcomeId: oldOutcomeId,
      type: 'individual',
      targetType: 'individual',
      interventionDate: '2026-01-01',
    });

    await seedCurriculum();

    // Eski id'ler artık yok.
    expect(await db.subjects.get(oldSubjectId)).toBeUndefined();
    expect(await db.topics.get(oldTopicId)).toBeUndefined();
    expect(await db.curriculumOutcomes.get(oldOutcomeId)).toBeUndefined();

    // Referans veren kayıtlar, orijinal deterministik id'lere geri döndü.
    const question = await db.questions.filter((q) => q.examId === 'exam-1').first();
    const intervention = await db.interventions.filter((i) => i.examId === 'exam-1').first();
    expect(question?.topicId).toBe(realTopic.id);
    expect(question?.outcomeId).toBe(realOutcome.id);
    expect(intervention?.outcomeId).toBe(realOutcome.id);
  });
});
