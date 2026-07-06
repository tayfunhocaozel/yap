import Dexie, { type EntityTable } from 'dexie';
import type {
  Teacher,
  SchoolClass,
  Student,
  Subject,
  Topic,
  CurriculumOutcome,
  Exam,
  Question,
  StudentScore,
  Intervention,
  Report,
} from '../types/entities';

export class YapDatabase extends Dexie {
  teachers!: EntityTable<Teacher, 'id'>;
  classes!: EntityTable<SchoolClass, 'id'>;
  students!: EntityTable<Student, 'id'>;
  subjects!: EntityTable<Subject, 'id'>;
  topics!: EntityTable<Topic, 'id'>;
  curriculumOutcomes!: EntityTable<CurriculumOutcome, 'id'>;
  exams!: EntityTable<Exam, 'id'>;
  questions!: EntityTable<Question, 'id'>;
  studentScores!: EntityTable<StudentScore, 'id'>;
  interventions!: EntityTable<Intervention, 'id'>;
  reports!: EntityTable<Report, 'id'>;

  constructor() {
    super('yap');
    this.version(1).stores({
      teachers: 'id, active',
      classes: 'id, teacherId, active, name',
      students: 'id, classId, active, schoolNumber',
      subjects: 'id, name',
      topics: 'id, subjectId, grade',
      curriculumOutcomes: 'id, topicId, code',
      exams: 'id, classId, subjectId, examDate',
      questions: 'id, examId, topicId, outcomeId',
      studentScores: 'id, studentId, questionId',
      interventions: 'id, examId, outcomeId',
      reports: 'id, examId',
    });
  }
}

export const db = new YapDatabase();
