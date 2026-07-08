import { db } from '../database/db';
import { createSyncedTable } from '../sync/createSyncedTable';
import type { Student } from '../types/entities';

function sortBySchoolNumber(students: Student[]): Student[] {
  return students.sort((a, b) =>
    a.schoolNumber.localeCompare(b.schoolNumber, undefined, { numeric: true }),
  );
}

const synced = createSyncedTable(db.students, 'students');

export const studentRepository = {
  async getActiveByClass(classId: string): Promise<Student[]> {
    const students = await db.students.filter((s) => s.classId === classId && s.active).toArray();
    return sortBySchoolNumber(students);
  },

  async getInactiveByClass(classId: string): Promise<Student[]> {
    const students = await db.students.filter((s) => s.classId === classId && !s.active).toArray();
    return sortBySchoolNumber(students);
  },

  findActiveBySchoolNumber(classId: string, schoolNumber: string): Promise<Student | undefined> {
    return db.students
      .filter((s) => s.classId === classId && s.active && s.schoolNumber === schoolNumber)
      .first();
  },

  add(student: Omit<Student, 'updatedAt'>): Promise<string> {
    return synced.add(student);
  },

  update(id: string, changes: Partial<Omit<Student, 'updatedAt'>>): Promise<number> {
    return synced.update(id, changes);
  },
};
