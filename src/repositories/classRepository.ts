import { db } from '../database/db';
import { createSyncedTable } from '../sync/createSyncedTable';
import type { SchoolClass } from '../types/entities';

const synced = createSyncedTable(db.classes, 'classes');

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

  add(schoolClass: Omit<SchoolClass, 'updatedAt'>): Promise<string> {
    return synced.add(schoolClass);
  },

  update(id: string, changes: Partial<Omit<SchoolClass, 'updatedAt'>>): Promise<number> {
    return synced.update(id, changes);
  },
};
