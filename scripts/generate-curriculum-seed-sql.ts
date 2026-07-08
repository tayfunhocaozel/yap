// Faz 3 (Supabase sync) ön koşulu: subjects/topics/curriculum_outcomes
// tabloları Supabase'de yalnızca okunabilir (RLS'de yazma politikası yok,
// istemciden doldurulamaz), bu yüzden bir kerelik SQL ile Dashboard'dan
// elle doldurulmalı. Bu script, `deterministicUuid`'i (gerçek kaynak
// dosyadan import ederek — kopyalamadan, iki algoritmanın sürüklenip
// farklı id üretmesi en tehlikeli hata sınıfı olur) kullanarak istemcinin
// üreteceği id'lerin BİREBİR aynısını üretir.
//
// Çalıştırma: node scripts/generate-curriculum-seed-sql.ts
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { deterministicUuid } from '../src/utils/deterministicId.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, '../src/database/seeds/curriculum');
const OUTPUT_PATH = path.join(__dirname, '../supabase/seed/0001_curriculum_reference_data.sql');

interface CurriculumSeedTopic {
  unit?: string;
  name: string;
  outcomes: { code: string; description: string }[];
}

interface CurriculumSeedFile {
  subject: string;
  grade: number;
  topics: CurriculumSeedTopic[];
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlOptionalString(value: string | undefined): string {
  return value === undefined ? 'null' : sqlString(value);
}

async function main() {
  const files = readdirSync(SEED_DIR).filter((f) => f.endsWith('.json'));

  const subjects = new Map<string, { id: string; name: string }>();
  const topics = new Map<
    string,
    { id: string; subjectId: string; grade: number; name: string; unit?: string; order: number }
  >();
  const outcomes = new Map<string, { id: string; topicId: string; code: string; description: string }>();

  for (const file of files) {
    const seed = JSON.parse(readFileSync(path.join(SEED_DIR, file), 'utf-8')) as CurriculumSeedFile;

    const subjectId = await deterministicUuid(`subject|${seed.subject}`);
    if (!subjects.has(subjectId)) {
      subjects.set(subjectId, { id: subjectId, name: seed.subject });
    }

    for (const [order, topicSeed] of seed.topics.entries()) {
      const topicId = await deterministicUuid(`topic|${subjectId}|${seed.grade}|${topicSeed.name}`);
      if (!topics.has(topicId)) {
        topics.set(topicId, {
          id: topicId,
          subjectId,
          grade: seed.grade,
          name: topicSeed.name,
          unit: topicSeed.unit,
          order,
        });
      }

      for (const outcomeSeed of topicSeed.outcomes) {
        const outcomeId = await deterministicUuid(`outcome|${outcomeSeed.code}`);
        if (!outcomes.has(outcomeId)) {
          outcomes.set(outcomeId, {
            id: outcomeId,
            topicId,
            code: outcomeSeed.code,
            description: outcomeSeed.description,
          });
        }
      }
    }
  }

  const lines: string[] = [];
  lines.push('-- Otomatik üretildi: scripts/generate-curriculum-seed-sql.ts');
  lines.push('-- Kaynak: src/database/seeds/curriculum/*.json');
  lines.push("-- Bu dosyayı Supabase Dashboard > SQL Editor'da bir kez çalıştırın.");
  lines.push("-- id'ler deterministicUuid ile üretildi; istemci tarafındaki id'lerle birebir eşleşir.");
  lines.push('');

  lines.push('insert into subjects (id, name) values');
  lines.push(
    Array.from(subjects.values())
      .map((s) => `  ('${s.id}', ${sqlString(s.name)})`)
      .join(',\n') + '\non conflict (id) do nothing;',
  );
  lines.push('');

  lines.push('insert into topics (id, subject_id, grade, name, unit, "order") values');
  lines.push(
    Array.from(topics.values())
      .map(
        (t) =>
          `  ('${t.id}', '${t.subjectId}', ${t.grade}, ${sqlString(t.name)}, ${sqlOptionalString(t.unit)}, ${t.order})`,
      )
      .join(',\n') + '\non conflict (id) do nothing;',
  );
  lines.push('');

  lines.push('insert into curriculum_outcomes (id, topic_id, code, description) values');
  lines.push(
    Array.from(outcomes.values())
      .map((o) => `  ('${o.id}', '${o.topicId}', ${sqlString(o.code)}, ${sqlString(o.description)})`)
      .join(',\n') + '\non conflict (id) do nothing;',
  );
  lines.push('');

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf-8');
  console.log(`Yazıldı: ${OUTPUT_PATH}`);
  console.log(`${subjects.size} subject, ${topics.size} topic, ${outcomes.size} outcome.`);
}

main();
