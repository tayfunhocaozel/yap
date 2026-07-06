import { teacherRepository } from '../repositories/teacherRepository';
import type { Teacher } from '../types/entities';
import { ValidationError } from './errors';

export interface TeacherInput {
  fullName: string;
  branch: string;
  schoolName?: string;
}

function validate(input: TeacherInput): void {
  if (!input.fullName.trim()) {
    throw new ValidationError('Ad soyad zorunludur.');
  }
  if (!input.branch.trim()) {
    throw new ValidationError('Branş zorunludur.');
  }
}

export const teacherService = {
  getById(id: string): Promise<Teacher | undefined> {
    return teacherRepository.getById(id);
  },

  async createOrUpdate(id: string, input: TeacherInput): Promise<void> {
    validate(input);
    const existing = await teacherRepository.getById(id);
    if (existing) {
      await teacherRepository.update(id, input);
      return;
    }
    await teacherRepository.add({
      id,
      fullName: input.fullName,
      branch: input.branch,
      schoolName: input.schoolName,
      active: true,
    });
  },
};
