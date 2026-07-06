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
}

export interface QuestionAnalysis {
  questionId: string;
  questionNo: number;
  maxScore: number;
  averageScore: number;
  successRate: number;
  gradedCount: number;
}

export type RiskLevel = 'Çok İyi' | 'İyi' | 'Geliştirilmeli' | 'Kritik';

export interface TopicAnalysis {
  topicId: string;
  topicName: string;
  successRate: number;
  missingStudentCount: number;
}

export interface OutcomeAnalysis {
  outcomeId: string;
  code: string;
  successRate: number;
  averageScore: number;
  failingStudentCount: number;
  riskLevel: RiskLevel;
}

export interface ExamAnalysis {
  classAnalysis: ClassAnalysis;
  studentAnalyses: StudentAnalysis[];
  questionAnalyses: QuestionAnalysis[];
  topicAnalyses: TopicAnalysis[];
  outcomeAnalyses: OutcomeAnalysis[];
}

// 04_ANALYSIS_ENGINE.md Bölüm 4'teki eşikler.
export function riskLevelFor(successRate: number): RiskLevel {
  if (successRate >= 85) return 'Çok İyi';
  if (successRate >= 70) return 'İyi';
  if (successRate >= 50) return 'Geliştirilmeli';
  return 'Kritik';
}

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

export function calculateClassAnalysis(studentAnalyses: StudentAnalysis[]): ClassAnalysis {
  if (studentAnalyses.length === 0) {
    return { studentCount: 0, average: 0, max: 0, min: 0 };
  }
  const totals = studentAnalyses.map((s) => s.totalScore);
  return {
    studentCount: studentAnalyses.length,
    average: totals.reduce((a, b) => a + b, 0) / totals.length,
    max: Math.max(...totals),
    min: Math.min(...totals),
  };
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
    return {
      topicId,
      topicName: topic ? (topic.unit ? `${topic.unit} — ${topic.name}` : topic.name) : '-',
      successRate: maxSum > 0 ? (earnedSum / maxSum) * 100 : 0,
      missingStudentCount,
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
        // "Başarısız" eşiği, risk bantlarındaki "Kritik" sınırıyla (50) tutarlı tutulmuştur.
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
      riskLevel: riskLevelFor(successRate),
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
    questionAnalyses: calculateQuestionAnalyses(students, questions, scores),
    topicAnalyses: calculateTopicAnalyses(students, questions, scores, topics),
    outcomeAnalyses: calculateOutcomeAnalyses(students, questions, scores, outcomes),
  };
}
