import { db } from '../database/db';
import { createSyncedTable } from '../sync/createSyncedTable';
import type { StudentScore } from '../types/entities';

const synced = createSyncedTable(db.studentScores, 'student_scores');

export const studentScoreRepository = {
  getByQuestionIds(questionIds: string[]): Promise<StudentScore[]> {
    if (questionIds.length === 0) return Promise.resolve([]);
    return db.studentScores.where('questionId').anyOf(questionIds).toArray();
  },

  findByStudentAndQuestion(studentId: string, questionId: string): Promise<StudentScore | undefined> {
    return db.studentScores
      .filter((s) => s.studentId === studentId && s.questionId === questionId)
      .first();
  },

  add(score: Omit<StudentScore, 'updatedAt'>): Promise<string> {
    return synced.add(score);
  },

  update(id: string, changes: Partial<Omit<StudentScore, 'updatedAt'>>): Promise<number> {
    return synced.update(id, changes);
  },
};
