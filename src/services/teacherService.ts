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
  getActive(): Promise<Teacher | undefined> {
    return teacherRepository.getActive();
  },

  async createOrUpdate(input: TeacherInput): Promise<void> {
    validate(input);
    const existing = await teacherRepository.getActive();
    if (existing) {
      await teacherRepository.update(existing.id, input);
      return;
    }
    await teacherRepository.add({
      id: crypto.randomUUID(),
      fullName: input.fullName,
      branch: input.branch,
      schoolName: input.schoolName,
      active: true,
    });
  },
};
