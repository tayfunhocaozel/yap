import { db } from '../database/db';
import type { Subject } from '../types/entities';

export const subjectRepository = {
  getAll(): Promise<Subject[]> {
    return db.subjects.toArray();
  },

  findByName(name: string): Promise<Subject | undefined> {
    return db.subjects.filter((s) => s.name === name).first();
  },

  add(subject: Subject): Promise<string> {
    return db.subjects.add(subject);
  },

  delete(id: string): Promise<void> {
    return db.subjects.delete(id);
  },
};
