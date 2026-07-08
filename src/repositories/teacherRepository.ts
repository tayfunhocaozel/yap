import { db } from '../database/db';
import { createSyncedTable } from '../sync/createSyncedTable';
import type { Teacher } from '../types/entities';

const synced = createSyncedTable(db.teachers, 'teachers');

export const teacherRepository = {
  getById(id: string): Promise<Teacher | undefined> {
    return db.teachers.get(id);
  },

  add(teacher: Omit<Teacher, 'updatedAt'>): Promise<string> {
    return synced.add(teacher);
  },

  update(id: string, changes: Partial<Omit<Teacher, 'updatedAt'>>): Promise<number> {
    return synced.update(id, changes);
  },
};
