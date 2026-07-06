import { classRepository } from '../repositories/classRepository';
import type { SchoolClass, Grade } from '../types/entities';
import { ValidationError } from './errors';

export interface ClassInput {
  teacherId: string;
  name: string;
  grade: Grade;
  academicYear: string;
}

function validate(input: ClassInput): void {
  if (!input.name.trim()) {
    throw new ValidationError('Sınıf adı zorunludur.');
  }
  if (!input.academicYear.trim()) {
    throw new ValidationError('Öğretim yılı zorunludur.');
  }
}

export const classService = {
  getAllActive(): Promise<SchoolClass[]> {
    return classRepository.getAllActive();
  },

  getById(id: string): Promise<SchoolClass | undefined> {
    return classRepository.getById(id);
  },

  async create(input: ClassInput): Promise<void> {
    validate(input);
    const duplicate = await classRepository.findActiveByName(input.name);
    if (duplicate) {
      throw new ValidationError(`"${input.name}" adında aktif bir sınıf zaten var.`);
    }
    await classRepository.add({
      id: crypto.randomUUID(),
      teacherId: input.teacherId,
      name: input.name,
      grade: input.grade,
      academicYear: input.academicYear,
      active: true,
    });
  },

  async update(id: string, input: ClassInput): Promise<void> {
    validate(input);
    const duplicate = await classRepository.findActiveByName(input.name);
    if (duplicate && duplicate.id !== id) {
      throw new ValidationError(`"${input.name}" adında aktif bir sınıf zaten var.`);
    }
    await classRepository.update(id, input);
  },

  async archive(id: string): Promise<void> {
    await classRepository.update(id, { active: false });
  },
};
