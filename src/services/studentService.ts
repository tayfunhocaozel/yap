import { studentRepository } from '../repositories/studentRepository';
import type { Student } from '../types/entities';
import { ValidationError } from './errors';

export interface StudentInput {
  classId: string;
  schoolNumber: string;
  fullName: string;
}

function validate(input: StudentInput): void {
  if (!input.fullName.trim()) {
    throw new ValidationError('Ad soyad zorunludur.');
  }
  if (!input.schoolNumber.trim()) {
    throw new ValidationError('Okul numarası zorunludur.');
  }
}

export const studentService = {
  getActiveByClass(classId: string): Promise<Student[]> {
    return studentRepository.getActiveByClass(classId);
  },

  getInactiveByClass(classId: string): Promise<Student[]> {
    return studentRepository.getInactiveByClass(classId);
  },

  async create(input: StudentInput): Promise<void> {
    validate(input);
    const duplicate = await studentRepository.findActiveBySchoolNumber(
      input.classId,
      input.schoolNumber,
    );
    if (duplicate) {
      throw new ValidationError(`"${input.schoolNumber}" okul numarası bu sınıfta zaten kayıtlı.`);
    }
    await studentRepository.add({
      id: crypto.randomUUID(),
      classId: input.classId,
      schoolNumber: input.schoolNumber,
      fullName: input.fullName,
      active: true,
    });
  },

  async update(id: string, input: StudentInput): Promise<void> {
    validate(input);
    const duplicate = await studentRepository.findActiveBySchoolNumber(
      input.classId,
      input.schoolNumber,
    );
    if (duplicate && duplicate.id !== id) {
      throw new ValidationError(`"${input.schoolNumber}" okul numarası bu sınıfta zaten kayıtlı.`);
    }
    await studentRepository.update(id, input);
  },

  async deactivate(id: string): Promise<void> {
    await studentRepository.update(id, { active: false });
  },

  async activate(id: string, classId: string, schoolNumber: string): Promise<void> {
    const duplicate = await studentRepository.findActiveBySchoolNumber(classId, schoolNumber);
    if (duplicate && duplicate.id !== id) {
      throw new ValidationError(
        `"${schoolNumber}" okul numarası bu sınıfta başka bir aktif öğrenciye ait. Aktifleştirmeden önce okul numarasını güncelleyin.`,
      );
    }
    await studentRepository.update(id, { active: true });
  },
};
