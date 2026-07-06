import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { interventionService, suggestIntervention } from './interventionService';
import { ValidationError } from './errors';

describe('suggestIntervention', () => {
  it('04_ANALYSIS_ENGINE.md Bölüm 5 eşiklerine göre öneri üretir', () => {
    expect(suggestIntervention(0)).toBeNull();
    expect(suggestIntervention(1)).toBe('Bireysel Destek');
    expect(suggestIntervention(2)).toBe('Küçük Grup');
    expect(suggestIntervention(4)).toBe('Küçük Grup');
    expect(suggestIntervention(5)).toBe('Telafi Grubu');
    expect(suggestIntervention(10)).toBe('Telafi Grubu');
    expect(suggestIntervention(11)).toBe('Sınıf Tekrar Dersi');
  });
});

describe('interventionService', () => {
  const EXAM_ID = 'exam-1';
  const OUTCOME_ID = 'outcome-1';

  beforeEach(async () => {
    await db.interventions.clear();
  });

  it('tarih zorunludur', async () => {
    await expect(
      interventionService.save({
        examId: EXAM_ID,
        outcomeId: OUTCOME_ID,
        type: 'Bireysel Destek',
        interventionDate: '',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('kaydeder ve targetType eşlemesini doğru yapar', async () => {
    await interventionService.save({
      examId: EXAM_ID,
      outcomeId: OUTCOME_ID,
      type: 'Sınıf Tekrar Dersi',
      interventionDate: '2026-07-10',
    });

    const [saved] = await interventionService.getByExam(EXAM_ID);
    expect(saved.type).toBe('Sınıf Tekrar Dersi');
    expect(saved.targetType).toBe('class');
  });

  it('aynı kazanım için tekrar kaydedince günceller, kopya oluşturmaz', async () => {
    await interventionService.save({
      examId: EXAM_ID,
      outcomeId: OUTCOME_ID,
      type: 'Bireysel Destek',
      interventionDate: '2026-07-10',
    });
    await interventionService.save({
      examId: EXAM_ID,
      outcomeId: OUTCOME_ID,
      type: 'Küçük Grup',
      interventionDate: '2026-07-12',
      notes: 'Güncellendi',
    });

    const results = await interventionService.getByExam(EXAM_ID);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('Küçük Grup');
    expect(results[0].notes).toBe('Güncellendi');
  });
});
