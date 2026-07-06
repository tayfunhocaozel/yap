import { interventionRepository } from '../repositories/interventionRepository';
import type { Intervention, InterventionType } from '../types/entities';
import { ValidationError } from './errors';

export type SuggestionLabel = 'Bireysel Destek' | 'Küçük Grup' | 'Telafi Grubu' | 'Sınıf Tekrar Dersi';

export const SUGGESTION_LABELS: SuggestionLabel[] = [
  'Bireysel Destek',
  'Küçük Grup',
  'Telafi Grubu',
  'Sınıf Tekrar Dersi',
];

const TARGET_TYPE_BY_LABEL: Record<SuggestionLabel, InterventionType> = {
  'Bireysel Destek': 'individual',
  'Küçük Grup': 'group',
  'Telafi Grubu': 'group',
  'Sınıf Tekrar Dersi': 'class',
};

// 04_ANALYSIS_ENGINE.md Bölüm 5 - Telafi Karar Motoru eşikleri.
// Öneri yalnızca rehber niteliğindedir; öğretmen değiştirebilir.
export function suggestIntervention(failingStudentCount: number): SuggestionLabel | null {
  if (failingStudentCount <= 0) return null;
  if (failingStudentCount === 1) return 'Bireysel Destek';
  if (failingStudentCount <= 4) return 'Küçük Grup';
  if (failingStudentCount <= 10) return 'Telafi Grubu';
  return 'Sınıf Tekrar Dersi';
}

export interface InterventionInput {
  examId: string;
  outcomeId: string;
  type: SuggestionLabel;
  interventionDate: string;
  notes?: string;
}

function validate(input: InterventionInput): void {
  if (!input.interventionDate) throw new ValidationError('Tarih zorunludur.');
}

export const interventionService = {
  getByExam(examId: string): Promise<Intervention[]> {
    return interventionRepository.getByExam(examId);
  },

  async save(input: InterventionInput): Promise<void> {
    validate(input);
    const targetType = TARGET_TYPE_BY_LABEL[input.type];
    const existing = await interventionRepository.findByExamAndOutcome(input.examId, input.outcomeId);
    const changes = {
      type: input.type,
      targetType,
      interventionDate: input.interventionDate,
      notes: input.notes,
    };
    if (existing) {
      await interventionRepository.update(existing.id, changes);
    } else {
      await interventionRepository.add({
        id: crypto.randomUUID(),
        examId: input.examId,
        outcomeId: input.outcomeId,
        ...changes,
      });
    }
  },
};
