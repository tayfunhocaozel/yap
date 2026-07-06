import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { classService } from './classService';
import { ValidationError } from './errors';

const TEACHER_ID = 'teacher-1';

describe('classService', () => {
  beforeEach(async () => {
    await db.classes.clear();
  });

  it('aynı isimde ikinci aktif sınıf oluşturulamaz', async () => {
    await classService.create({
      teacherId: TEACHER_ID,
      name: '7/A',
      grade: 7,
      academicYear: '2026-2027',
    });

    await expect(
      classService.create({
        teacherId: TEACHER_ID,
        name: '7/A',
        grade: 7,
        academicYear: '2026-2027',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('arşivlenen sınıfla aynı isimde yeni sınıf oluşturulabilir', async () => {
    await classService.create({
      teacherId: TEACHER_ID,
      name: '7/A',
      grade: 7,
      academicYear: '2026-2027',
    });
    const [existing] = await classService.getAllActive();
    await classService.archive(existing.id);

    await expect(
      classService.create({
        teacherId: TEACHER_ID,
        name: '7/A',
        grade: 7,
        academicYear: '2027-2028',
      }),
    ).resolves.not.toThrow();
  });

  it('arşivlenen sınıflar aktif listede görünmez', async () => {
    await classService.create({
      teacherId: TEACHER_ID,
      name: '7/A',
      grade: 7,
      academicYear: '2026-2027',
    });
    const [created] = await classService.getAllActive();
    await classService.archive(created.id);

    const active = await classService.getAllActive();
    expect(active).toHaveLength(0);
  });
});
