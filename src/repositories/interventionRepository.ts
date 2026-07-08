import { db } from '../database/db';
import { createSyncedTable } from '../sync/createSyncedTable';
import type { Intervention } from '../types/entities';

const synced = createSyncedTable(db.interventions, 'interventions');

export const interventionRepository = {
  getByExam(examId: string): Promise<Intervention[]> {
    return db.interventions.filter((i) => i.examId === examId).toArray();
  },

  findByExamAndOutcome(examId: string, outcomeId: string): Promise<Intervention | undefined> {
    return db.interventions
      .filter((i) => i.examId === examId && i.outcomeId === outcomeId)
      .first();
  },

  add(intervention: Omit<Intervention, 'updatedAt'>): Promise<string> {
    return synced.add(intervention);
  },

  update(id: string, changes: Partial<Omit<Intervention, 'updatedAt'>>): Promise<number> {
    return synced.update(id, changes);
  },
};
