import { db } from '../database/db';
import type { CurriculumOutcome } from '../types/entities';

export const curriculumOutcomeRepository = {
  getAll(): Promise<CurriculumOutcome[]> {
    return db.curriculumOutcomes.toArray();
  },

  getByTopic(topicId: string): Promise<CurriculumOutcome[]> {
    return db.curriculumOutcomes.filter((o) => o.topicId === topicId).toArray();
  },

  getByIds(ids: string[]): Promise<CurriculumOutcome[]> {
    return db.curriculumOutcomes.where('id').anyOf(ids).toArray();
  },

  async bulkAdd(outcomes: CurriculumOutcome[]): Promise<void> {
    if (outcomes.length === 0) return;
    await db.curriculumOutcomes.bulkAdd(outcomes);
  },

  delete(id: string): Promise<void> {
    return db.curriculumOutcomes.delete(id);
  },
};
