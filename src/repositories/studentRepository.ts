import { db } from '../database/db';
import type { Student } from '../types/entities';

export const studentRepository = {
  getActiveByClass(classId: string): Promise<Student[]> {
    return db.students.filter((s) => s.classId === classId && s.active).toArray();
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
