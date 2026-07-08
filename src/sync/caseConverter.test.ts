import { describe, it, expect } from 'vitest';
import { toSnakeCase, toCamelCase } from './caseConverter';

describe('caseConverter', () => {
  it('toSnakeCase: camelCase alanları snake_case yapar', () => {
    expect(
      toSnakeCase({ fullName: 'Ayşe Yılmaz', schoolName: 'Atatürk Ortaokulu', active: true }),
    ).toEqual({ full_name: 'Ayşe Yılmaz', school_name: 'Atatürk Ortaokulu', active: true });
  });

  it('toSnakeCase: tek kelimelik alanları değiştirmez', () => {
    expect(toSnakeCase({ id: '1', name: 'x', grade: 7 })).toEqual({ id: '1', name: 'x', grade: 7 });
  });

  it('toCamelCase: snake_case alanları camelCase yapar', () => {
    expect(
      toCamelCase({ full_name: 'Ayşe Yılmaz', teacher_id: 't1', academic_year: '2025-2026' }),
    ).toEqual({ fullName: 'Ayşe Yılmaz', teacherId: 't1', academicYear: '2025-2026' });
  });

  it('toSnakeCase -> toCamelCase round-trip orijinal objeyi verir', () => {
    const original = { fullName: 'Ali', teacherId: 't1', schoolName: undefined };
    expect(toCamelCase(toSnakeCase(original))).toEqual(original);
  });
});
