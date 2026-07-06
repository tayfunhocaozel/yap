import { db } from '../database/db';
import type { SchoolClass } from '../types/entities';

export const classRepository = {
  getAllActive(): Promise<SchoolClass[]> {
    return db.classes.filter((c) => c.active).toArray();
  },

  getById(id: string): Promise<SchoolClass | undefined> {
    return db.classes.get(id);
  },

  findActiveByName(name: string): Promise<SchoolClass | undefined> {
    return db.classes.filter((c) => c.active && c.name === name).first();
  },

  add(schoolClass: SchoolClass): Promise<string> {
    return db.classes.add(schoolClass);
  },

  update(id: string, changes: Partial<SchoolClass>): Promise<number> {
    return db.classes.update(id, changes);
  },
};
