import { db } from '../database/db';
import { createSyncedTable } from '../sync/createSyncedTable';
import type { Question } from '../types/entities';

const synced = createSyncedTable(db.questions, 'questions');

export const questionRepository = {
  getByExam(examId: string): Promise<Question[]> {
    return db.questions.filter((q) => q.examId === examId).sortBy('questionNo');
  },

  findByExamAndNumber(examId: string, questionNo: number): Promise<Question | undefined> {
    return db.questions.filter((q) => q.examId === examId && q.questionNo === questionNo).first();
  },

  add(question: Omit<Question, 'updatedAt'>): Promise<string> {
    return synced.add(question);
  },

  update(id: string, changes: Partial<Omit<Question, 'updatedAt'>>): Promise<number> {
    return synced.update(id, changes);
  },

  delete(id: string): Promise<void> {
    return synced.remove(id);
  },
};
