export type Grade = 5 | 6 | 7 | 8;

export interface Teacher {
  id: string;
  fullName: string;
  branch: string;
  schoolName?: string;
  active: boolean;
  /** Supabase senkronu için son değişiklik zaman damgası (ISO string). */
  updatedAt: string;
}

export interface SchoolClass {
  id: string;
  teacherId: string;
  name: string;
  grade: Grade;
  academicYear: string;
  active: boolean;
  /** Supabase senkronu için son değişiklik zaman damgası (ISO string). */
  updatedAt: string;
}

export interface Student {
  id: string;
  schoolNumber: string;
  fullName: string;
  classId: string;
  active: boolean;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  grade: Grade;
  name: string;
  unit?: string;
  /** Müfredat kaynak verisindeki (kazanimlar_rows.csv) doğal sıra; listelerde bu sıraya göre gösterilir. */
  order: number;
}

export interface CurriculumOutcome {
  id: string;
  topicId: string;
  code: string;
  description: string;
}

export interface Exam {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  examDate: string;
  description?: string;
}

export interface Question {
  id: string;
  examId: string;
  questionNo: number;
  score: number;
  topicId: string;
  outcomeId: string;
}

export interface StudentScore {
  id: string;
  studentId: string;
  questionId: string;
  earnedScore: number;
}

export type InterventionType = 'individual' | 'group' | 'class';

export interface Intervention {
  id: string;
  examId: string;
  outcomeId: string;
  type: string;
  targetType: InterventionType;
  notes?: string;
  interventionDate: string;
}

export interface Report {
  id: string;
  examId: string;
  reportType: string;
  createdAt: string;
}
