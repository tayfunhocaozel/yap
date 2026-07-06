import { db } from '../database/db';
import type { Question } from '../types/entities';

export const questionRepository = {
  getByExam(examId: string): Promise<Question[]> {
    return db.questions.filter((q) => q.examId === examId).sortBy('questionNo');
  },

  findByExamAndNumber(examId: string, questionNo: number): Promise<Question | undefined> {
    return db.questions.filter((q) => q.examId === examId && q.questionNo === questionNo).first();
  },

  add(question: Question): Promise<string> {
    return db.questions.add(question);
  },

  update(id: string, changes: Partial<Question>): Promise<number> {
    return db.questions.update(id, changes);
  },

  delete(id: string): Promise<void> {
    return db.questions.delete(id);
  },
};
