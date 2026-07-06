// Kaynak: docs/kazanimlar_rows.csv -> src/database/seeds/curriculum/<ders>-<sinif>.json
// Kurallar 01_DATA_MODEL.md Bölüm 7'de tanımlıdır. Yeni kaynak veri (ör. Din Kültürü,
// İngilizce 8. sınıf) geldiğinde CSV'ye eklenip bu script yeniden çalıştırılmalıdır:
//   node scripts/convert-curriculum-csv.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../docs/kazanimlar_rows.csv');
const OUTPUT_DIR = path.join(__dirname, '../src/database/seeds/curriculum');

// V1 kapsamı dışında tutulan dersler (bkz. 01_DATA_MODEL.md Bölüm 7).
const EXCLUDED_SUBJECTS = new Set(['T.C. İnkılap Tarihi ve Atatürkçülük']);

// Kaynak veride farklı adla geçen, uygulama içinde eşlenmesi gereken dersler.
const SUBJECT_NAME_MAP = {
  'İlköğretim Matematik': 'Matematik',
};

const SUBJECT_SLUGS = {
  Matematik: 'matematik',
  Türkçe: 'turkce',
  'Fen Bilimleri': 'fen-bilimleri',
  'Sosyal Bilgiler': 'sosyal-bilgiler',
  İngilizce: 'ingilizce',
  'Din Kültürü ve Ahlak Bilgisi': 'din-kulturu',
};

function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
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
    } else if (c === ',') {
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

function gradeFromLabel(label) {
  const match = /^(\d)\./.exec(label.trim());
  if (!match) throw new Error(`Beklenmeyen sınıf etiketi: ${label}`);
  return Number(match[1]);
}

function subjectSlug(subjectName) {
  const slug = SUBJECT_SLUGS[subjectName];
  if (!slug) throw new Error(`Ders için slug tanımlı değil: ${subjectName}`);
  return slug;
}

const csvText = readFileSync(CSV_PATH, 'utf-8');
const [header, ...rows] = parseCsv(csvText).filter((r) => r.length > 1);
const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

// key: "ders|sinif" -> { subject, grade, topics: Map<topicKey, {unit, name, outcomes[]}> }
const files = new Map();

for (const row of rows) {
  const rawSubject = row[idx.ders].trim();
  if (EXCLUDED_SUBJECTS.has(rawSubject)) continue;

  const subject = SUBJECT_NAME_MAP[rawSubject] ?? rawSubject;
  const grade = gradeFromLabel(row[idx.sinif]);
  const unit = row[idx.unite].trim();
  const konu = row[idx.konu].trim();
  const code = row[idx.kazanim_kodu].trim();
  const description = row[idx.kazanim_aciklamasi].trim();

  const fileKey = `${subject}|${grade}`;
  if (!files.has(fileKey)) {
    files.set(fileKey, { subject, grade, topics: new Map() });
  }
  const file = files.get(fileKey);

  const topicUnit = unit === konu ? undefined : unit;
  const topicKey = `${topicUnit ?? ''}|${konu}`;
  if (!file.topics.has(topicKey)) {
    file.topics.set(topicKey, { unit: topicUnit, name: konu, outcomes: [] });
  }
  file.topics.get(topicKey).outcomes.push({ code, description });
}

mkdirSync(OUTPUT_DIR, { recursive: true });

let written = 0;
for (const { subject, grade, topics } of files.values()) {
  const data = {
    subject,
    grade,
    topics: Array.from(topics.values()).map((t) =>
      t.unit ? { unit: t.unit, name: t.name, outcomes: t.outcomes } : { name: t.name, outcomes: t.outcomes },
    ),
  };
  const filePath = path.join(OUTPUT_DIR, `${subjectSlug(subject)}-${grade}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  written++;
}

console.log(`${written} müfredat seed dosyası yazıldı: ${OUTPUT_DIR}`);
