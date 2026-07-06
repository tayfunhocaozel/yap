import * as XLSX from 'xlsx';
import { studentService } from './studentService';
import { ValidationError } from './errors';

export interface StudentImportRow {
  rowNumber: number;
  schoolNumber: string;
  fullName: string;
}

export interface StudentImportRowError {
  rowNumber: number;
  reason: string;
}

export interface StudentImportParseResult {
  validRows: StudentImportRow[];
  errors: StudentImportRowError[];
}

export interface StudentImportCommitResult {
  successCount: number;
  errors: StudentImportRowError[];
}

const HEADER_SCHOOL_NUMBER = 'öğrenci no';
const HEADER_FIRST_NAME = 'adı';
const HEADER_LAST_NAME = 'soyadı';

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('tr');
}

function findHeaderRow(rows: string[][]): { rowIndex: number; columns: Record<string, number> } {
  for (let i = 0; i < rows.length; i++) {
    const columns: Record<string, number> = {};
    rows[i].forEach((cell, col) => {
      const value = normalize(cell ?? '');
      if (value === HEADER_SCHOOL_NUMBER) columns.schoolNumber = col;
      if (value === HEADER_FIRST_NAME) columns.firstName = col;
      if (value === HEADER_LAST_NAME) columns.lastName = col;
    });
    if (columns.schoolNumber !== undefined && columns.firstName !== undefined && columns.lastName !== undefined) {
      return { rowIndex: i, columns };
    }
  }
  throw new ValidationError(
    `Beklenen sütunlar bulunamadı ("${HEADER_SCHOOL_NUMBER}", "${HEADER_FIRST_NAME}", "${HEADER_LAST_NAME}").`,
  );
}

function rowsToStudents(rows: string[][]): StudentImportParseResult {
  const { rowIndex: headerRowIndex, columns } = findHeaderRow(rows);
  const validRows: StudentImportRow[] = [];
  const errors: StudentImportRowError[] = [];
  const seenSchoolNumbers = new Set<string>();

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;
    const schoolNumberRaw = (row[columns.schoolNumber] ?? '').trim();

    // Öğrenci No sayısal değilse veri satırları bitmiştir (özet/altbilgi satırlarına ulaşıldı).
    if (!/^\d+$/.test(schoolNumberRaw)) break;

    const firstName = (row[columns.firstName] ?? '').trim();
    const lastName = (row[columns.lastName] ?? '').trim();

    if (!firstName || !lastName) {
      errors.push({ rowNumber, reason: 'Ad veya soyad eksik.' });
      continue;
    }
    if (seenSchoolNumbers.has(schoolNumberRaw)) {
      errors.push({ rowNumber, reason: `"${schoolNumberRaw}" okul numarası dosyada birden fazla kez geçiyor.` });
      continue;
    }
    seenSchoolNumbers.add(schoolNumberRaw);

    validRows.push({ rowNumber, schoolNumber: schoolNumberRaw, fullName: `${firstName} ${lastName}` });
  }

  return { validRows, errors };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',' || c === ';') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

async function extractRows(file: File): Promise<string[][]> {
  const isCsv = file.name.toLocaleLowerCase('tr').endsWith('.csv');
  if (isCsv) {
    const text = await file.text();
    return parseCsv(text);
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' });
}

export async function parseStudentFile(file: File): Promise<StudentImportParseResult> {
  const rows = await extractRows(file);
  return rowsToStudents(rows);
}

export async function importStudents(
  classId: string,
  rows: StudentImportRow[],
): Promise<StudentImportCommitResult> {
  let successCount = 0;
  const errors: StudentImportRowError[] = [];

  for (const row of rows) {
    try {
      await studentService.create({ classId, schoolNumber: row.schoolNumber, fullName: row.fullName });
      successCount++;
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push({ rowNumber: row.rowNumber, reason: error.message });
        continue;
      }
      throw error;
    }
  }

  return { successCount, errors };
}
