import { describe, it, expect } from 'vitest';
import {
  calculateStudentAnalyses,
  calculateClassAnalysis,
  calculateQuestionAnalyses,
  calculateTopicAnalyses,
  calculateOutcomeAnalyses,
  calculateStudentDetails,
  calculateScoreDistribution,
  calculateStudentQuestionBreakdown,
  isAtRiskStudent,
  getDurum,
} from './analysisService';
import type { Question, Student, StudentScore, Topic, CurriculumOutcome } from '../types/entities';

const students: Student[] = [
  { id: 's1', schoolNumber: '1', fullName: 'Ali', classId: 'c1', active: true, updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 's2', schoolNumber: '2', fullName: 'Veli', classId: 'c1', active: true, updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 's3', schoolNumber: '3', fullName: 'Ayşe', classId: 'c1', active: true, updatedAt: '2026-01-01T00:00:00.000Z' },
];

const questions: Question[] = [
  { id: 'q1', examId: 'e1', questionNo: 1, score: 40, topicId: 't1', outcomeId: 'o1', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'q2', examId: 'e1', questionNo: 2, score: 60, topicId: 't2', outcomeId: 'o2', updatedAt: '2026-01-01T00:00:00.000Z' },
];

const topics: Topic[] = [
  { id: 't1', subjectId: 'subj1', grade: 7, name: 'Konu A', order: 0 },
  { id: 't2', subjectId: 'subj1', grade: 7, name: 'Konu B', order: 1 },
];

const outcomes: CurriculumOutcome[] = [
  { id: 'o1', topicId: 't1', code: 'K.7.1', description: '' },
  { id: 'o2', topicId: 't2', code: 'K.7.2', description: '' },
];

// Ali: q1=40 (tam), q2=60 (tam) -> toplam 100, tam not
// Veli: q1=20 (yarım), q2 eksik -> toplam 20, eksik
// Ayşe: q1=0, q2=15 (60'ta 15 -> %25) -> toplam 15
const scores: StudentScore[] = [
  { id: 'sc1', studentId: 's1', questionId: 'q1', earnedScore: 40, updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc2', studentId: 's1', questionId: 'q2', earnedScore: 60, updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc3', studentId: 's2', questionId: 'q1', earnedScore: 20, updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc4', studentId: 's3', questionId: 'q1', earnedScore: 0, updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'sc5', studentId: 's3', questionId: 'q2', earnedScore: 15, updatedAt: '2026-01-01T00:00:00.000Z' },
];

describe('getDurum', () => {
  it('eşik değerlerine göre doğru seviyeyi döner', () => {
    expect(getDurum(90)).toBe('Pekiyi');
    expect(getDurum(85)).toBe('Pekiyi');
    expect(getDurum(84)).toBe('Iyi');
    expect(getDurum(70)).toBe('Iyi');
    expect(getDurum(69)).toBe('Orta');
    expect(getDurum(55)).toBe('Orta');
    expect(getDurum(54)).toBe('Gecer');
    expect(getDurum(45)).toBe('Gecer');
    expect(getDurum(44)).toBe('Zayif');
    expect(getDurum(0)).toBe('Zayif');
  });
});

describe('calculateStudentAnalyses', () => {
  it('toplam puanı eksik girişleri sıfır saymadan hesaplar', () => {
    const result = calculateStudentAnalyses(students, questions, scores);
    const ali = result.find((r) => r.studentId === 's1')!;
    const veli = result.find((r) => r.studentId === 's2')!;

    expect(ali.totalScore).toBe(100);
    expect(ali.isFullyGraded).toBe(true);
    expect(veli.totalScore).toBe(20);
    expect(veli.isFullyGraded).toBe(false);
  });
});

describe('calculateClassAnalysis', () => {
  it('ortalama/en yüksek/en düşük/std.sapma yalnızca tam puanlanmış öğrencilerden hesaplanır', () => {
    const studentAnalyses = calculateStudentAnalyses(students, questions, scores);
    const result = calculateClassAnalysis(studentAnalyses);

    // Veli tam puanlanmamış (1/2 soru) -> hesaplamaya dahil edilmez.
    // Sadece Ali (100) ve Ayşe (15) kalır.
    expect(result.studentCount).toBe(3);
    expect(result.max).toBe(100);
    expect(result.min).toBe(15);
    expect(result.average).toBeCloseTo((100 + 15) / 2);
    expect(result.stdDeviation).toBeCloseTo(42.5);
  });
});

describe('isAtRiskStudent', () => {
  it('en az bir soru puanlanmış ve toplamı 70 altında olan öğrenciyi riskli sayar', () => {
    const studentAnalyses = calculateStudentAnalyses(students, questions, scores);
    const ali = studentAnalyses.find((s) => s.studentId === 's1')!;
    const veli = studentAnalyses.find((s) => s.studentId === 's2')!;
    const ayse = studentAnalyses.find((s) => s.studentId === 's3')!;

    expect(isAtRiskStudent(ali)).toBe(false);
    expect(isAtRiskStudent(veli)).toBe(true);
    expect(isAtRiskStudent(ayse)).toBe(true);
  });
});

describe('calculateScoreDistribution', () => {
  it('tam puanlanmış öğrencileri Durum bantlarına göre sayar', () => {
    const studentAnalyses = calculateStudentAnalyses(students, questions, scores);
    const result = calculateScoreDistribution(studentAnalyses);

    expect(result.find((b) => b.durum === 'Pekiyi')?.count).toBe(1); // Ali (100)
    expect(result.find((b) => b.durum === 'Zayif')?.count).toBe(1); // Ayşe (15)
    expect(result.find((b) => b.durum === 'Orta')?.count).toBe(0); // Veli tam puanlanmamış, dahil değil
  });
});

describe('calculateStudentQuestionBreakdown', () => {
  it('soru numarasına göre sıralı puanları ve eksik hücreleri null olarak döner', () => {
    const result = calculateStudentQuestionBreakdown(students, questions, scores);
    const veli = result.find((r) => r.studentId === 's2')!;

    expect(veli.questionScores).toEqual([20, null]);
    expect(veli.totalScore).toBe(20);
    expect(veli.durum).toBe('Zayif');
  });
});

describe('calculateQuestionAnalyses', () => {
  it('soru başına ortalama ve başarı yüzdesini hesaplar', () => {
    const result = calculateQuestionAnalyses(students, questions, scores);
    const q1 = result.find((r) => r.questionId === 'q1')!;

    // q1 puanları: 40, 20, 0 -> ortalama 20, maksimum 40 -> %50
    expect(q1.gradedCount).toBe(3);
    expect(q1.averageScore).toBeCloseTo(20);
    expect(q1.successRate).toBeCloseTo(50);
  });
});

describe('calculateTopicAnalyses', () => {
  it('eksik öğrenci sayısını doğru tespit eder', () => {
    const result = calculateTopicAnalyses(students, questions, scores, topics);
    const topicB = result.find((r) => r.topicId === 't2')!;

    // Konu B (q2) sadece Ali ve Ayşe'de var, Veli'de eksik
    expect(topicB.missingStudentCount).toBe(1);
  });
});

describe('calculateOutcomeAnalyses', () => {
  it('durum seviyesini ve başarısız öğrenci sayısını hesaplar', () => {
    const result = calculateOutcomeAnalyses(students, questions, scores, outcomes);
    const o2 = result.find((r) => r.outcomeId === 'o2')!;

    // o2 (q2, max 60): Ali 60/60=%100, Ayşe 15/60=%25 -> ortalama %62.5 -> Orta
    // Ayşe %25 < %50 -> başarısız
    expect(o2.durum).toBe('Orta');
    expect(o2.failingStudentCount).toBe(1);
  });
});

describe('calculateStudentDetails', () => {
  it('güçlü ve geliştirilmesi gereken konuları doğru sınıflandırır', () => {
    const result = calculateStudentDetails(students, questions, scores, topics, outcomes);

    const ali = result.find((r) => r.studentId === 's1')!;
    expect(ali.strongTopics).toEqual(['Konu A', 'Konu B']);
    expect(ali.weakTopics).toEqual([]);

    const ayse = result.find((r) => r.studentId === 's3')!;
    expect(ayse.weakTopics).toEqual(['Konu A', 'Konu B']);
    expect(ayse.strongTopics).toEqual([]);
  });

  it('hiç puanlanmamış konu/kazanımı null olarak işaretler (0 değil)', () => {
    const result = calculateStudentDetails(students, questions, scores, topics, outcomes);
    const veli = result.find((r) => r.studentId === 's2')!;
    const topicB = veli.topicBreakdown.find((t) => t.topicId === 't2')!;

    expect(topicB.successRate).toBeNull();
  });
});
