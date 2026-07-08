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
import type { OutboxEntry, SyncMetaEntry, SyncedTableName } from '../sync/types';

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
  outbox!: EntityTable<OutboxEntry, 'localId'>;
  syncMeta!: EntityTable<SyncMetaEntry, 'tableName'>;

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

    // Faz 2: Supabase senkronu için outbox (push kuyruğu) ve syncMeta (pull
    // cursor'ları). Teacher/SchoolClass'a `updatedAt` eklendiği için, bu
    // sürümden önce oluşturulmuş kayıtlar geriye dönük damgalanır ve her
    // biri için ilk senkron amaçlı bir outbox kaydı oluşturulur — aksi
    // halde zaten var olan kullanıcı verisi hiç Supabase'e gönderilmezdi.
    this.version(2)
      .stores({
        outbox: '++localId, tableName, entityId',
        syncMeta: 'tableName',
      })
      .upgrade(async (tx) => {
        const now = new Date().toISOString();
        const syncedTables: SyncedTableName[] = ['teachers', 'classes'];
        for (const tableName of syncedTables) {
          const rows = await tx.table(tableName).toArray();
          for (const row of rows) {
            await tx.table(tableName).update(row.id, { updatedAt: now });
            await tx.table('outbox').add({
              tableName,
              entityId: row.id,
              operation: 'upsert',
              payload: { ...row, updatedAt: now },
              createdAt: now,
              attempts: 0,
            });
          }
        }
      });
  }
}

export const db = new YapDatabase();
