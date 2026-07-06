import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { examService } from './examService';
import { ValidationError } from './errors';

describe('examService', () => {
  beforeEach(async () => {
    await db.exams.clear();
  });

  it('zorunlu alanlar eksikse hata fırlatır', async () => {
    await expect(
      examService.create({ classId: '', subjectId: 'subj-1', title: '1. Yazılı', examDate: '2026-10-01' }),
    ).rejects.toThrow(ValidationError);
  });

  it('yazılıyı oluşturur ve geri döner', async () => {
    const exam = await examService.create({
      classId: 'class-1',
      subjectId: 'subj-1',
      title: '1. Yazılı',
      examDate: '2026-10-01',
    });
    expect(exam.id).toBeDefined();
    expect(exam.title).toBe('1. Yazılı');
  });

  it('aynı sınıfta aynı isimli yazılıyı engellemez, yalnızca tespit eder', async () => {
    await examService.create({
      classId: 'class-1',
      subjectId: 'subj-1',
      title: '1. Yazılı',
      examDate: '2026-10-01',
    });

    const duplicate = await examService.findDuplicateTitle('class-1', '1. Yazılı');
    expect(duplicate).toBeDefined();

    await expect(
      examService.create({
        classId: 'class-1',
        subjectId: 'subj-1',
        title: '1. Yazılı',
        examDate: '2026-11-01',
      }),
    ).resolves.not.toThrow();
  });
});
