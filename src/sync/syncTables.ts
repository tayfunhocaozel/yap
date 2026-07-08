import { db } from '../database/db';
import type { SyncedTableName } from './types';

interface SyncTableDescriptor {
  tableName: SyncedTableName;
  // Dexie'nin generic EntityTable<T,'id'> tipi farklı entity tiplerini tek
  // bir listede tutmamıza izin vermiyor (somut Teacher/SchoolClass/Student
  // tipleriyle yapısal olarak uyuşmuyor); registry salt pull döngüsü için
  // kullanıldığından (pullTable kendi generic'ini çağrı anında çıkarır)
  // bu güvenlidir.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any;
}

/**
 * Senkronize edilen tüm tabloların merkezi kaydı. `syncEngine.ts`'in pull
 * döngüsü bu listeyi gezer — yeni bir entity sync'e eklendiğinde tek
 * yapılması gereken buraya bir satır eklemektir.
 */
export const SYNC_TABLES: SyncTableDescriptor[] = [
  { tableName: 'teachers', table: db.teachers },
  { tableName: 'classes', table: db.classes },
  { tableName: 'students', table: db.students },
  { tableName: 'exams', table: db.exams },
  { tableName: 'questions', table: db.questions },
  { tableName: 'student_scores', table: db.studentScores },
  { tableName: 'interventions', table: db.interventions },
  { tableName: 'reports', table: db.reports },
];
