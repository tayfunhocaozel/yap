import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { studentService } from './studentService';
import { ValidationError } from './errors';

const CLASS_ID = 'class-1';

describe('studentService', () => {
  beforeEach(async () => {
    await db.students.clear();
  });

  it('aynı sınıfta aynı okul numarası tekrar kullanılamaz', async () => {
    await studentService.create({
      classId: CLASS_ID,
      schoolNumber: '101',
      fullName: 'Ali Yılmaz',
    });

    await expect(
      studentService.create({
        classId: CLASS_ID,
        schoolNumber: '101',
        fullName: 'Veli Kaya',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('farklı sınıflarda aynı okul numarası kullanılabilir', async () => {
    await studentService.create({
      classId: CLASS_ID,
      schoolNumber: '101',
      fullName: 'Ali Yılmaz',
    });

    await expect(
      studentService.create({
        classId: 'class-2',
        schoolNumber: '101',
        fullName: 'Veli Kaya',
      }),
    ).resolves.not.toThrow();
  });

  it('pasifleştirilen öğrenci aktif listede görünmez', async () => {
    await studentService.create({
      classId: CLASS_ID,
      schoolNumber: '101',
      fullName: 'Ali Yılmaz',
    });
    const [created] = await studentService.getActiveByClass(CLASS_ID);
    await studentService.deactivate(created.id);

    const active = await studentService.getActiveByClass(CLASS_ID);
    expect(active).toHaveLength(0);
  });
});
