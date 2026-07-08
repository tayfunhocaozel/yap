import Dexie from 'dexie';
import { db } from '../database/db';
import { subjectRepository } from '../repositories/subjectRepository';
import { topicRepository } from '../repositories/topicRepository';
import { curriculumOutcomeRepository } from '../repositories/curriculumOutcomeRepository';
import { questionRepository } from '../repositories/questionRepository';
import { interventionRepository } from '../repositories/interventionRepository';
import { deterministicUuid } from '../utils/deterministicId';
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
 * `seedCurriculum()` (oturumdan bağımsız her açılışta) ve referans veri
 * pull'u (yalnızca oturum açıkken, `startPeriodicSync`) aynı deterministik
 * id'lere aynı anda yazabilir. Pull `table.put()` (sessiz üzerine yazma)
 * kullanırken buradaki taze-ekleme çağrıları `.add()`/`bulkAdd()` kullanır
 * (var olan key'de Dexie `ConstraintError`/`BulkError` fırlatır). Bu dar
 * yarış durumunda "zaten varsa muhtemelen pull yazdı" varsayımıyla hatayı
 * yutuyoruz — pull zaten aynı veriyi doğru içerikle yazmış oluyor.
 */
async function addIgnoringConflict(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    if (error instanceof Dexie.ConstraintError || error instanceof Dexie.BulkError) return;
    throw error;
  }
}

/**
 * Müfredat seed dosyalarını (bkz. 01_DATA_MODEL.md Bölüm 7) Subject/Topic/
 * CurriculumOutcome tablolarına yükler. Aynı `code`'a sahip bir kazanım
 * zaten varsa tekrar oluşturulmaz (idempotent).
 *
 * Id'ler `deterministicUuid` ile doğal anahtardan (isim/kod) üretilir —
 * böylece farklı cihaz/kurulumlarda aynı müfredat verisi için hep aynı id
 * üretilir (bulut senkronunda referans verinin tüm istemcilerde aynı FK'lere
 * sahip olması şart). Daha önce rastgele id ile seed edilmiş kayıtlar
 * bulunursa id'leri yeni deterministik değere geçirilir (re-key) ve buna
 * referans veren Question.topicId/outcomeId, Intervention.outcomeId
 * alanları da güncellenir.
 */
export async function seedCurriculum(): Promise<void> {
  const existingOutcomesByCode = new Map(
    (await curriculumOutcomeRepository.getAll()).map((o) => [o.code, o]),
  );
  const subjectCache = new Map<string, string>();
  const topicCache = new Map<string, string>();
  const newOutcomes: { id: string; topicId: string; code: string; description: string }[] = [];

  async function resolveSubjectId(name: string): Promise<string> {
    const cached = subjectCache.get(name);
    if (cached) return cached;
    const newId = await deterministicUuid(`subject|${name}`);
    const existing = await subjectRepository.findByName(name);
    if (!existing) {
      await addIgnoringConflict(() => subjectRepository.add({ id: newId, name }));
    } else if (existing.id !== newId) {
      await db.topics.where('subjectId').equals(existing.id).modify({ subjectId: newId });
      await subjectRepository.delete(existing.id);
      await addIgnoringConflict(() => subjectRepository.add({ id: newId, name }));
    }
    subjectCache.set(name, newId);
    return newId;
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
    const newId = await deterministicUuid(`topic|${subjectId}|${grade}|${name}`);
    const existing = await topicRepository.findBySubjectGradeName(subjectId, grade, name);
    if (!existing) {
      await addIgnoringConflict(() => topicRepository.add({ id: newId, subjectId, grade, name, unit, order }));
    } else if (existing.id !== newId) {
      // Repository (ve dolayısıyla outbox) üzerinden güncellenir — doğrudan
      // Dexie yazımı Question artık senkronize olduğu için sessizce
      // cihazlar arası veri sapmasına yol açardı.
      const affectedQuestions = await db.questions.where('topicId').equals(existing.id).toArray();
      for (const q of affectedQuestions) {
        await questionRepository.update(q.id, { topicId: newId });
      }
      await topicRepository.delete(existing.id);
      await addIgnoringConflict(() => topicRepository.add({ id: newId, subjectId, grade, name, unit, order }));
    } else if (existing.order !== order) {
      // Eski (order alanından önce) seed edilmiş kayıtları geriye dönük tamamlar.
      await topicRepository.update(newId, { order });
    }
    topicCache.set(cacheKey, newId);
    return newId;
  }

  for (const seed of Object.values(seedModules)) {
    const subjectId = await resolveSubjectId(seed.subject);
    for (const [order, topicSeed] of seed.topics.entries()) {
      const topicId = await resolveTopicId(subjectId, seed.grade, topicSeed.name, topicSeed.unit, order);
      for (const outcomeSeed of topicSeed.outcomes) {
        const newId = await deterministicUuid(`outcome|${outcomeSeed.code}`);
        const existing = existingOutcomesByCode.get(outcomeSeed.code);
        if (!existing) {
          newOutcomes.push({ id: newId, topicId, code: outcomeSeed.code, description: outcomeSeed.description });
        } else if (existing.id !== newId) {
          // Repository üzerinden güncellenir — doğrudan Dexie yazımı Question/
          // Intervention artık senkronize olduğu için sessizce cihazlar arası
          // veri sapmasına yol açardı.
          const affectedQuestions = await db.questions.where('outcomeId').equals(existing.id).toArray();
          for (const q of affectedQuestions) {
            await questionRepository.update(q.id, { outcomeId: newId });
          }
          const affectedInterventions = await db.interventions.where('outcomeId').equals(existing.id).toArray();
          for (const iv of affectedInterventions) {
            await interventionRepository.update(iv.id, { outcomeId: newId });
          }
          await curriculumOutcomeRepository.delete(existing.id);
          newOutcomes.push({ id: newId, topicId, code: outcomeSeed.code, description: outcomeSeed.description });
        }
      }
    }
  }

  await addIgnoringConflict(() => curriculumOutcomeRepository.bulkAdd(newOutcomes));
}
