import { db } from '../database/db';
import type { Intervention } from '../types/entities';

export const interventionRepository = {
  getByExam(examId: string): Promise<Intervention[]> {
    return db.interventions.filter((i) => i.examId === examId).toArray();
  },

  findByExamAndOutcome(examId: string, outcomeId: string): Promise<Intervention | undefined> {
    return db.interventions
      .filter((i) => i.examId === examId && i.outcomeId === outcomeId)
      .first();
  },

  add(intervention: Intervention): Promise<string> {
    return db.interventions.add(intervention);
  },

  update(id: string, changes: Partial<Intervention>): Promise<number> {
    return db.interventions.update(id, changes);
  },
};
