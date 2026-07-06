import { db } from '../database/db';
import type { Teacher } from '../types/entities';

export const teacherRepository = {
  getActive(): Promise<Teacher | undefined> {
    return db.teachers.filter((t) => t.active).first();
  },

  add(teacher: Teacher): Promise<string> {
    return db.teachers.add(teacher);
  },

  update(id: string, changes: Partial<Teacher>): Promise<number> {
    return db.teachers.update(id, changes);
  },
};
