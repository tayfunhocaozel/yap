import { db } from '../database/db';
import type { Teacher } from '../types/entities';

export const teacherRepository = {
  getById(id: string): Promise<Teacher | undefined> {
    return db.teachers.get(id);
  },

  add(teacher: Teacher): Promise<string> {
    return db.teachers.add(teacher);
  },

  update(id: string, changes: Partial<Teacher>): Promise<number> {
    return db.teachers.update(id, changes);
  },
};
