import { describe, it, expect } from 'vitest';
import {
  calculateStudentAnalyses,
  calculateClassAnalysis,
  calculateQuestionAnalyses,
  calculateTopicAnalyses,
  calculateOutcomeAnalyses,
  riskLevelFor,
} from './analysisService';
import type { Question, Student, StudentScore, Topic, CurriculumOutcome } from '../types/entities';

const students: Student[] = [
  { id: 's1', schoolNumber: '1', fullName: 'Ali', classId: 'c1', active: true },
  { id: 's2', schoolNumber: '2', fullName: 'Veli', classId: 'c1', active: true },
  { id: 's3', schoolNumber: '3', fullName: 'Ayşe', classId: 'c1', active: true },
];

const questions: Question[] = [
  { id: 'q1', examId: 'e1', questionNo: 1, score: 40, topicId: 't1', outcomeId: 'o1' },
  { id: 'q2', examId: 'e1', questionNo: 2, score: 60, topicId: 't2', outcomeId: 'o2' },
];

const topics: Topic[] = [
  { id: 't1', subjectId: 'subj1', grade: 7, name: 'Konu A' },
  { id: 't2', subjectId: 'subj1', grade: 7, name: 'Konu B' },
];

const outcomes: CurriculumOutcome[] = [
  { id: 'o1', topicId: 't1', code: 'K.7.1', description: '' },
  { id: 'o2', topicId: 't2', code: 'K.7.2', description: '' },
];

// Ali: q1=40 (tam), q2=60 (tam) -> toplam 100, tam not
// Veli: q1=20 (yarım), q2 eksik -> toplam 20, eksik
// Ayşe: q1=0, q2=15 (60'ta 15 -> %25) -> toplam 15
const scores: StudentScore[] = [
  { id: 'sc1', studentId: 's1', questionId: 'q1', earnedScore: 40 },
  { id: 'sc2', studentId: 's1', questionId: 'q2', earnedScore: 60 },
  { id: 'sc3', studentId: 's2', questionId: 'q1', earnedScore: 20 },
  { id: 'sc4', studentId: 's3', questionId: 'q1', earnedScore: 0 },
  { id: 'sc5', studentId: 's3', questionId: 'q2', earnedScore: 15 },
];

describe('riskLevelFor', () => {
  it('eşik değerlerine göre doğru seviyeyi döner', () => {
    expect(riskLevelFor(90)).toBe('Çok İyi');
    expect(riskLevelFor(85)).toBe('Çok İyi');
    expect(riskLevelFor(84)).toBe('İyi');
    expect(riskLevelFor(70)).toBe('İyi');
    expect(riskLevelFor(69)).toBe('Geliştirilmeli');
    expect(riskLevelFor(50)).toBe('Geliştirilmeli');
    expect(riskLevelFor(49)).toBe('Kritik');
    expect(riskLevelFor(0)).toBe('Kritik');
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
  it('ortalama, en yüksek ve en düşük değerleri hesaplar', () => {
    const studentAnalyses = calculateStudentAnalyses(students, questions, scores);
    const result = calculateClassAnalysis(studentAnalyses);

    expect(result.studentCount).toBe(3);
    expect(result.max).toBe(100);
    expect(result.min).toBe(15);
    expect(result.average).toBeCloseTo((100 + 20 + 15) / 3);
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
  it('risk seviyesini ve başarısız öğrenci sayısını hesaplar', () => {
    const result = calculateOutcomeAnalyses(students, questions, scores, outcomes);
    const o2 = result.find((r) => r.outcomeId === 'o2')!;

    // o2 (q2, max 60): Ali 60/60=%100, Ayşe 15/60=%25 -> ortalama %62.5 -> Geliştirilmeli
    // Ayşe %25 < %50 -> başarısız
    expect(o2.riskLevel).toBe('Geliştirilmeli');
    expect(o2.failingStudentCount).toBe(1);
  });
});
