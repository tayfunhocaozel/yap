import { subjectRepository } from '../repositories/subjectRepository';
import { topicRepository } from '../repositories/topicRepository';
import { curriculumOutcomeRepository } from '../repositories/curriculumOutcomeRepository';
import type { Grade } from '../types/entities';

interface CurriculumSeedTopic {
  unit?: string;
  name: string;
  outcomes: { code: string; description: string }[];
}

interface CurriculumSeedFile {
  subject: string;
  grade: Grade;
  topics: CurriculumSeedTopic[];
}

const seedModules = import.meta.glob('../database/seeds/curriculum/*.json', {
  eager: true,
}) as Record<string, CurriculumSeedFile>;

/**
 * Müfredat seed dosyalarını (bkz. 01_DATA_MODEL.md Bölüm 7) Subject/Topic/
 * CurriculumOutcome tablolarına yükler. Aynı `code`'a sahip bir kazanım
 * zaten varsa tekrar oluşturulmaz (idempotent).
 */
export async function seedCurriculum(): Promise<void> {
  const existingCodes = new Set(await curriculumOutcomeRepository.getAllCodes());
  const subjectCache = new Map<string, string>();
  const topicCache = new Map<string, string>();
  const newOutcomes: { id: string; topicId: string; code: string; description: string }[] = [];

  async function resolveSubjectId(name: string): Promise<string> {
    const cached = subjectCache.get(name);
    if (cached) return cached;
    const existing = await subjectRepository.findByName(name);
    const id = existing?.id ?? (await createSubject(name));
    subjectCache.set(name, id);
    return id;
  }

  async function createSubject(name: string): Promise<string> {
    const id = crypto.randomUUID();
    await subjectRepository.add({ id, name });
    return id;
  }

  async function resolveTopicId(
    subjectId: string,
    grade: Grade,
    name: string,
    unit: string | undefined,
    order: number,
  ): Promise<string> {
    const cacheKey = `${subjectId}|${grade}|${name}`;
    const cached = topicCache.get(cacheKey);
    if (cached) return cached;
    const existing = await topicRepository.findBySubjectGradeName(subjectId, grade, name);
    let id: string;
    if (existing) {
      id = existing.id;
      // Eski (order alanından önce) seed edilmiş kayıtları geriye dönük tamamlar.
      if (existing.order !== order) {
        await topicRepository.update(id, { order });
      }
    } else {
      id = await createTopic(subjectId, grade, name, unit, order);
    }
    topicCache.set(cacheKey, id);
    return id;
  }

  async function createTopic(
    subjectId: string,
    grade: Grade,
    name: string,
    unit: string | undefined,
    order: number,
  ): Promise<string> {
    const id = crypto.randomUUID();
    await topicRepository.add({ id, subjectId, grade, name, unit, order });
    return id;
  }

  for (const seed of Object.values(seedModules)) {
    const subjectId = await resolveSubjectId(seed.subject);
    for (const [order, topicSeed] of seed.topics.entries()) {
      const topicId = await resolveTopicId(subjectId, seed.grade, topicSeed.name, topicSeed.unit, order);
      for (const outcomeSeed of topicSeed.outcomes) {
        if (existingCodes.has(outcomeSeed.code)) continue;
        existingCodes.add(outcomeSeed.code);
        newOutcomes.push({
          id: crypto.randomUUID(),
          topicId,
          code: outcomeSeed.code,
          description: outcomeSeed.description,
        });
      }
    }
  }

  await curriculumOutcomeRepository.bulkAdd(newOutcomes);
}
