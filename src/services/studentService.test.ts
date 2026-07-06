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

  it('okul numarasına göre sayısal sırada döner (2 önce, 10 sonra)', async () => {
    await studentService.create({ classId: CLASS_ID, schoolNumber: '10', fullName: 'Zeynep' });
    await studentService.create({ classId: CLASS_ID, schoolNumber: '2', fullName: 'Ayşe' });
    await studentService.create({ classId: CLASS_ID, schoolNumber: '1', fullName: 'Ali' });

    const active = await studentService.getActiveByClass(CLASS_ID);
    expect(active.map((s) => s.schoolNumber)).toEqual(['1', '2', '10']);
  });

  it('pasifleştirilen öğrenci aktif listede görünmez, pasif listede görünür', async () => {
    await studentService.create({
      classId: CLASS_ID,
      schoolNumber: '101',
      fullName: 'Ali Yılmaz',
    });
    const [created] = await studentService.getActiveByClass(CLASS_ID);
    await studentService.deactivate(created.id);

    const active = await studentService.getActiveByClass(CLASS_ID);
    expect(active).toHaveLength(0);

    const inactive = await studentService.getInactiveByClass(CLASS_ID);
    expect(inactive.map((s) => s.id)).toEqual([created.id]);
  });

  it('pasif öğrenci tekrar aktifleştirilebilir', async () => {
    await studentService.create({
      classId: CLASS_ID,
      schoolNumber: '101',
      fullName: 'Ali Yılmaz',
    });
    const [created] = await studentService.getActiveByClass(CLASS_ID);
    await studentService.deactivate(created.id);

    await studentService.activate(created.id, CLASS_ID, created.schoolNumber);

    const active = await studentService.getActiveByClass(CLASS_ID);
    expect(active.map((s) => s.id)).toEqual([created.id]);
    const inactive = await studentService.getInactiveByClass(CLASS_ID);
    expect(inactive).toHaveLength(0);
  });

  it('okul numarası başka bir aktif öğrenciye aitse aktifleştirme reddedilir', async () => {
    await studentService.create({
      classId: CLASS_ID,
      schoolNumber: '101',
      fullName: 'Ali Yılmaz',
    });
    const [created] = await studentService.getActiveByClass(CLASS_ID);
    await studentService.deactivate(created.id);

    // Aynı okul numarasıyla yeni bir aktif öğrenci kaydedildi.
    await studentService.create({
      classId: CLASS_ID,
      schoolNumber: '101',
      fullName: 'Veli Kaya',
    });

    await expect(
      studentService.activate(created.id, CLASS_ID, created.schoolNumber),
    ).rejects.toThrow(ValidationError);
  });
});
