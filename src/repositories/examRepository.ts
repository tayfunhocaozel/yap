import { db } from '../database/db';
import { createSyncedTable } from '../sync/createSyncedTable';
import type { Exam } from '../types/entities';

const synced = createSyncedTable(db.exams, 'exams');

export const examRepository = {
  getAll(): Promise<Exam[]> {
    return db.exams.orderBy('examDate').reverse().toArray();
  },

  getById(id: string): Promise<Exam | undefined> {
    return db.exams.get(id);
  },

  findByClassAndTitle(classId: string, title: string): Promise<Exam | undefined> {
    return db.exams.filter((e) => e.classId === classId && e.title === title).first();
  },

  add(exam: Omit<Exam, 'updatedAt'>): Promise<string> {
    return synced.add(exam);
  },
};
