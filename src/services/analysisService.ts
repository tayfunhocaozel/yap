import { examService } from './examService';
import { classService } from './classService';
import { studentService } from './studentService';
import { questionRepository } from '../repositories/questionRepository';
import { topicRepository } from '../repositories/topicRepository';
import { curriculumOutcomeRepository } from '../repositories/curriculumOutcomeRepository';
import { scoreService } from './scoreService';
import type { CurriculumOutcome, Question, Student, StudentScore, Topic } from '../types/entities';

export interface StudentAnalysis {
  studentId: string;
  schoolNumber: string;
  fullName: string;
  totalScore: number;
  gradedCount: number;
  isFullyGraded: boolean;
}

export interface ClassAnalysis {
  studentCount: number;
  average: number;
  max: number;
  min: number;
  stdDeviation: number;
}

export interface QuestionAnalysis {
  questionId: string;
  questionNo: number;
  maxScore: number;
  averageScore: number;
  successRate: number;
  gradedCount: number;
}

export type Durum = 'Zayif' | 'Gecer' | 'Orta' | 'Iyi' | 'Pekiyi';

export interface TopicAnalysis {
  topicId: string;
  topicName: string;
  successRate: number;
  missingStudentCount: number;
  durum: Durum;
}

export interface OutcomeAnalysis {
  outcomeId: string;
  code: string;
  successRate: number;
  averageScore: number;
  failingStudentCount: number;
  durum: Durum;
}

export interface StudentTopicBreakdown {
  topicId: string;
  topicName: string;
  successRate: number | null;
}

export interface StudentOutcomeBreakdown {
  outcomeId: string;
  code: string;
  successRate: number | null;
}

export interface StudentDetail extends StudentAnalysis {
  topicBreakdown: StudentTopicBreakdown[];
  outcomeBreakdown: StudentOutcomeBreakdown[];
  strongTopics: string[];
  weakTopics: string[];
  strongOutcomes: string[];
  weakOutcomes: string[];
}

export interface StudentQuestionRow {
  studentId: string;
  schoolNumber: string;
  fullName: string;
  questionScores: (number | null)[];
  totalScore: number;
  durum: Durum;
}

export interface ScoreDistributionBucket {
  durum: Durum;
  label: string;
  count: number;
}

export interface ExamAnalysis {
  classAnalysis: ClassAnalysis;
  studentAnalyses: StudentAnalysis[];
  studentDetails: StudentDetail[];
  questionAnalyses: QuestionAnalysis[];
  topicAnalyses: TopicAnalysis[];
  outcomeAnalyses: OutcomeAnalysis[];
  questionNumbers: number[];
  studentQuestionBreakdown: StudentQuestionRow[];
  scoreDistribution: ScoreDistributionBucket[];
}

// 04_ANALYSIS_ENGINE.md Bölüm 4'teki eşikler.
export function getDurum(successRate: number): Durum {
  if (successRate >= 85) return 'Pekiyi';
  if (successRate >= 70) return 'Iyi';
  if (successRate >= 55) return 'Orta';
  if (successRate >= 45) return 'Gecer';
  return 'Zayif';
}

export interface DurumInfo {
  label: string;
  color: string;
  textColor: string;
}

export const DURUM_STYLES: Record<Durum, DurumInfo> = {
  Zayif: { label: 'Zayıf', color: '#F09595', textColor: '#791F1F' },
  Gecer: { label: 'Geçer', color: '#FAC775', textColor: '#633806' },
  Orta: { label: 'Orta', color: '#85B7EB', textColor: '#0C447C' },
  Iyi: { label: 'İyi', color: '#97C459', textColor: '#27500A' },
  Pekiyi: { label: 'Pekiyi', color: '#AFA9EC', textColor: '#3C3489' },
};

function buildScoreLookup(scores: StudentScore[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of scores) map.set(`${s.studentId}:${s.questionId}`, s.earnedScore);
  return map;
}

// Henüz puanlanmamış hücreler ortalamalara 0 olarak değil, hiç dahil
// edilmeyecek şekilde işlenir; eksiklik ayrı bir sayaç olarak raporlanır
// (bkz. Puan Girişi'ndeki "eksik" göstergesiyle aynı ilke).
export function calculateStudentAnalyses(
  students: Student[],
  questions: Question[],
  scores: StudentScore[],
): StudentAnalysis[] {
  const lookup = buildScoreLookup(scores);
  return students.map((student) => {
    let total = 0;
    let gradedCount = 0;
    for (const q of questions) {
      const earned = lookup.get(`${student.id}:${q.id}`);
      if (earned !== undefined) {
        total += earned;
        gradedCount++;
      }
    }
    return {
      studentId: student.id,
      schoolNumber: student.schoolNumber,
      fullName: student.fullName,
      totalScore: total,
      gradedCount,
      isFullyGraded: questions.length > 0 && gradedCount === questions.length,
    };
  });
}

// Ortalama/en yüksek/en düşük/std. sapma yalnızca tam puanlanmış öğrenciler
// üzerinden hesaplanır; kısmi puanlı bir öğrencinin eksik toplamı bu
// istatistikleri yapay olarak aşağı çeker (bkz. 2. tur düzeltme notu).
export function calculateClassAnalysis(studentAnalyses: StudentAnalysis[]): ClassAnalysis {
  const graded = studentAnalyses.filter((s) => s.isFullyGraded);
  if (graded.length === 0) {
    return { studentCount: studentAnalyses.length, average: 0, max: 0, min: 0, stdDeviation: 0 };
  }
  const totals = graded.map((s) => s.totalScore);
  const average = totals.reduce((a, b) => a + b, 0) / totals.length;
  const variance = totals.reduce((sum, t) => sum + (t - average) ** 2, 0) / totals.length;
  return {
    studentCount: studentAnalyses.length,
    average,
    max: Math.max(...totals),
    min: Math.min(...totals),
    stdDeviation: Math.sqrt(variance),
  };
}

// "Riskli" = en az bir soru puanlanmış ve toplamı düşük; hiç puanlanmamış
// öğrenci "henüz değerlendirilmedi" demektir, riskli değil.
export function isAtRiskStudent(s: StudentAnalysis): boolean {
  return s.gradedCount > 0 && s.totalScore < 70;
}

const SCORE_BANDS: ReadonlyArray<{ durum: Durum; label: string; min: number; max: number }> = [
  { durum: 'Zayif', label: '0-44', min: 0, max: 44 },
  { durum: 'Gecer', label: '45-54', min: 45, max: 54 },
  { durum: 'Orta', label: '55-69', min: 55, max: 69 },
  { durum: 'Iyi', label: '70-84', min: 70, max: 84 },
  { durum: 'Pekiyi', label: '85-100', min: 85, max: 100 },
];

// Sınıf ortalamasıyla tutarlı olması için aynı popülasyon (tam puanlanmış
// öğrenciler) kullanılır.
export function calculateScoreDistribution(studentAnalyses: StudentAnalysis[]): ScoreDistributionBucket[] {
  const graded = studentAnalyses.filter((s) => s.isFullyGraded);
  return SCORE_BANDS.map((band) => ({
    durum: band.durum,
    label: band.label,
    count: graded.filter((s) => s.totalScore >= band.min && s.totalScore <= band.max).length,
  }));
}

export function calculateStudentQuestionBreakdown(
  students: Student[],
  questions: Question[],
  scores: StudentScore[],
): StudentQuestionRow[] {
  const lookup = buildScoreLookup(scores);
  const sortedQuestions = [...questions].sort((a, b) => a.questionNo - b.questionNo);

  return students.map((student) => {
    let totalScore = 0;
    const questionScores = sortedQuestions.map((q) => {
      const earned = lookup.get(`${student.id}:${q.id}`);
      if (earned !== undefined) totalScore += earned;
      return earned ?? null;
    });
    return {
      studentId: student.id,
      schoolNumber: student.schoolNumber,
      fullName: student.fullName,
      questionScores,
      totalScore,
      durum: getDurum(totalScore),
    };
  });
}

export function calculateQuestionAnalyses(
  students: Student[],
  questions: Question[],
  scores: StudentScore[],
): QuestionAnalysis[] {
  const lookup = buildScoreLookup(scores);
  return questions.map((q) => {
    const earnedValues = students
      .map((s) => lookup.get(`${s.id}:${q.id}`))
      .filter((v): v is number => v !== undefined);
    const averageScore = earnedValues.length
      ? earnedValues.reduce((a, b) => a + b, 0) / earnedValues.length
      : 0;
    return {
      questionId: q.id,
      questionNo: q.questionNo,
      maxScore: q.score,
      averageScore,
      successRate: q.score > 0 ? (averageScore / q.score) * 100 : 0,
      gradedCount: earnedValues.length,
    };
  });
}

export function calculateTopicAnalyses(
  students: Student[],
  questions: Question[],
  scores: StudentScore[],
  topics: Topic[],
): TopicAnalysis[] {
  const lookup = buildScoreLookup(scores);
  const topicIds = Array.from(new Set(questions.map((q) => q.topicId)));

  return topicIds.map((topicId) => {
    const topicQuestions = questions.filter((q) => q.topicId === topicId);
    let earnedSum = 0;
    let maxSum = 0;
    let missingStudentCount = 0;

    for (const student of students) {
      let studentMissing = false;
      for (const q of topicQuestions) {
        const earned = lookup.get(`${student.id}:${q.id}`);
        if (earned === undefined) {
          studentMissing = true;
        } else {
          earnedSum += earned;
          maxSum += q.score;
        }
      }
      if (studentMissing) missingStudentCount++;
    }

    const topic = topics.find((t) => t.id === topicId);
    const successRate = maxSum > 0 ? (earnedSum / maxSum) * 100 : 0;
    return {
      topicId,
      topicName: topic ? (topic.unit ? `${topic.unit} — ${topic.name}` : topic.name) : '-',
      successRate,
      missingStudentCount,
      durum: getDurum(successRate),
    };
  });
}

export function calculateOutcomeAnalyses(
  students: Student[],
  questions: Question[],
  scores: StudentScore[],
  outcomes: CurriculumOutcome[],
): OutcomeAnalysis[] {
  const lookup = buildScoreLookup(scores);
  const outcomeIds = Array.from(new Set(questions.map((q) => q.outcomeId)));

  return outcomeIds.map((outcomeId) => {
    const outcomeQuestions = questions.filter((q) => q.outcomeId === outcomeId);
    let failingStudentCount = 0;
    let earnedSum = 0;
    let maxSum = 0;
    let gradedStudentCount = 0;

    for (const student of students) {
      let studentEarned = 0;
      let studentMax = 0;
      let hasScore = false;
      for (const q of outcomeQuestions) {
        const earned = lookup.get(`${student.id}:${q.id}`);
        if (earned !== undefined) {
          studentEarned += earned;
          studentMax += q.score;
          hasScore = true;
        }
      }
      if (hasScore) {
        gradedStudentCount++;
        earnedSum += studentEarned;
        maxSum += studentMax;
        const studentRate = studentMax > 0 ? (studentEarned / studentMax) * 100 : 0;
        // "Başarısız" eşiği (50), Durum bantlarından bağımsız ayrı bir iş kuralıdır.
        if (studentRate < 50) failingStudentCount++;
      }
    }

    const successRate = maxSum > 0 ? (earnedSum / maxSum) * 100 : 0;
    const outcome = outcomes.find((o) => o.id === outcomeId);
    return {
      outcomeId,
      code: outcome?.code ?? '-',
      successRate,
      averageScore: gradedStudentCount > 0 ? earnedSum / gradedStudentCount : 0,
      failingStudentCount,
      durum: getDurum(successRate),
    };
  });
}

// 04_ANALYSIS_ENGINE.md Bölüm 3.A - Öğrenci Analizi: güçlü/geliştirilmesi
// gereken konu ve kazanımlar. successRate=null, öğrencinin o konu/kazanıma
// ait sorularının hiçbirinin henüz puanlanmadığı anlamına gelir (0 değil).
export function calculateStudentDetails(
  students: Student[],
  questions: Question[],
  scores: StudentScore[],
  topics: Topic[],
  outcomes: CurriculumOutcome[],
): StudentDetail[] {
  const lookup = buildScoreLookup(scores);
  const studentAnalyses = calculateStudentAnalyses(students, questions, scores);
  const topicIds = Array.from(new Set(questions.map((q) => q.topicId)));
  const outcomeIds = Array.from(new Set(questions.map((q) => q.outcomeId)));

  function breakdown(
    studentId: string,
    ids: string[],
    getQuestions: (id: string) => Question[],
    resolveLabel: (id: string) => string,
  ): { id: string; label: string; successRate: number | null }[] {
    return ids.map((id) => {
      let earned = 0;
      let max = 0;
      let hasScore = false;
      for (const q of getQuestions(id)) {
        const value = lookup.get(`${studentId}:${q.id}`);
        if (value !== undefined) {
          earned += value;
          max += q.score;
          hasScore = true;
        }
      }
      return {
        id,
        label: resolveLabel(id),
        successRate: hasScore && max > 0 ? (earned / max) * 100 : null,
      };
    });
  }

  return studentAnalyses.map((analysis) => {
    const topicBreakdown: StudentTopicBreakdown[] = breakdown(
      analysis.studentId,
      topicIds,
      (topicId) => questions.filter((q) => q.topicId === topicId),
      (topicId) => {
        const topic = topics.find((t) => t.id === topicId);
        return topic ? (topic.unit ? `${topic.unit} — ${topic.name}` : topic.name) : '-';
      },
    ).map(({ id, label, successRate }) => ({ topicId: id, topicName: label, successRate }));

    const outcomeBreakdown: StudentOutcomeBreakdown[] = breakdown(
      analysis.studentId,
      outcomeIds,
      (outcomeId) => questions.filter((q) => q.outcomeId === outcomeId),
      (outcomeId) => outcomes.find((o) => o.id === outcomeId)?.code ?? '-',
    ).map(({ id, label, successRate }) => ({ outcomeId: id, code: label, successRate }));

    return {
      ...analysis,
      topicBreakdown,
      outcomeBreakdown,
      strongTopics: topicBreakdown
        .filter((t) => t.successRate !== null && t.successRate >= 70)
        .map((t) => t.topicName),
      weakTopics: topicBreakdown
        .filter((t) => t.successRate !== null && t.successRate < 50)
        .map((t) => t.topicName),
      strongOutcomes: outcomeBreakdown
        .filter((o) => o.successRate !== null && o.successRate >= 70)
        .map((o) => o.code),
      weakOutcomes: outcomeBreakdown
        .filter((o) => o.successRate !== null && o.successRate < 50)
        .map((o) => o.code),
    };
  });
}

export async function getExamAnalysis(examId: string): Promise<ExamAnalysis | null> {
  const exam = await examService.getById(examId);
  if (!exam) return null;

  const [questions, scores, schoolClass] = await Promise.all([
    questionRepository.getByExam(examId),
    scoreService.getByExam(examId),
    classService.getById(exam.classId),
  ]);

  const students = schoolClass ? await studentService.getActiveByClass(schoolClass.id) : [];
  const topicIds = Array.from(new Set(questions.map((q) => q.topicId)));
  const outcomeIds = Array.from(new Set(questions.map((q) => q.outcomeId)));

  const [topics, outcomes] = await Promise.all([
    topicRepository.getByIds(topicIds),
    curriculumOutcomeRepository.getByIds(outcomeIds),
  ]);

  const studentAnalyses = calculateStudentAnalyses(students, questions, scores);

  return {
    classAnalysis: calculateClassAnalysis(studentAnalyses),
    studentAnalyses,
    studentDetails: calculateStudentDetails(students, questions, scores, topics, outcomes),
    questionAnalyses: calculateQuestionAnalyses(students, questions, scores),
    topicAnalyses: calculateTopicAnalyses(students, questions, scores, topics),
    outcomeAnalyses: calculateOutcomeAnalyses(students, questions, scores, outcomes),
    questionNumbers: [...questions].map((q) => q.questionNo).sort((a, b) => a - b),
    studentQuestionBreakdown: calculateStudentQuestionBreakdown(students, questions, scores),
    scoreDistribution: calculateScoreDistribution(studentAnalyses),
  };
}
