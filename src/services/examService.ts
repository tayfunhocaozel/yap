import { examRepository } from '../repositories/examRepository';
import type { Exam } from '../types/entities';
import { ValidationError } from './errors';

export interface ExamInput {
  classId: string;
  subjectId: string;
  title: string;
  examDate: string;
  description?: string;
}

function validate(input: ExamInput): void {
  if (!input.classId) throw new ValidationError('Sınıf seçimi zorunludur.');
  if (!input.subjectId) throw new ValidationError('Ders seçimi zorunludur.');
  if (!input.title.trim()) throw new ValidationError('Yazılı adı zorunludur.');
  if (!input.examDate) throw new ValidationError('Tarih seçimi zorunludur.');
}

export const examService = {
  getAll(): Promise<Exam[]> {
    return examRepository.getAll();
  },

  getById(id: string): Promise<Exam | undefined> {
    return examRepository.getById(id);
  },

  /**
   * Aynı sınıfta aynı isimli yazılı için (bkz. 02_SYSTEM_REQUIREMENTS.md
   * Doğrulama Kuralları) sert bir engel değil, yalnızca uyarı verilir.
   * Bu yüzden create() öncesinde çağırıp kullanıcıya onay sorulmalıdır.
   */
  findDuplicateTitle(classId: string, title: string): Promise<Exam | undefined> {
    return examRepository.findByClassAndTitle(classId, title.trim());
  },

  async create(input: ExamInput): Promise<Omit<Exam, 'updatedAt'>> {
    validate(input);
    const exam: Omit<Exam, 'updatedAt'> = {
      id: crypto.randomUUID(),
      classId: input.classId,
      subjectId: input.subjectId,
      title: input.title.trim(),
      examDate: input.examDate,
      description: input.description?.trim() || undefined,
    };
    await examRepository.add(exam);
    return exam;
  },
};
