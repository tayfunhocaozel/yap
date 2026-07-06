import { db } from '../database/db';
import type { Student } from '../types/entities';

function sortBySchoolNumber(students: Student[]): Student[] {
  return students.sort((a, b) =>
    a.schoolNumber.localeCompare(b.schoolNumber, undefined, { numeric: true }),
  );
}

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

  add(student: Student): Promise<string> {
    return db.students.add(student);
  },

  update(id: string, changes: Partial<Student>): Promise<number> {
    return db.students.update(id, changes);
  },
};
