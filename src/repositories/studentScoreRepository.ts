import { db } from '../database/db';
import type { StudentScore } from '../types/entities';

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

  add(score: StudentScore): Promise<string> {
    return db.studentScores.add(score);
  },

  update(id: string, changes: Partial<StudentScore>): Promise<number> {
    return db.studentScores.update(id, changes);
  },
};
