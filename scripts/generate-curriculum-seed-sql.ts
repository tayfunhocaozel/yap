// Faz 4: subjects/topics/curriculum_outcomes tabloları Supabase'de yalnızca
// okunabilir (RLS'de yazma politikası yok, istemciden doldurulamaz) — bu
// yüzden bu script, müfredat JSON'unda bir değişiklik olduğunda TEKRAR
// ÇALIŞTIRILABİLİR bir idari araçtır (bir kerelik değil). `deterministicUuid`'i
// (gerçek kaynak dosyadan import ederek — kopyalamadan, iki algoritmanın
// sürüklenip farklı id üretmesi en tehlikeli hata sınıfı olur) kullanarak
// istemcinin üreteceği id'lerin BİREBİR aynısını üretir.
//
// Runbook (müfredat metninde bir düzeltme gerektiğinde):
//   1) src/database/seeds/curriculum/*.json dosyasını düzenleyin.
//   2) node scripts/generate-curriculum-seed-sql.ts çalıştırın.
//   3) Çıkan supabase/seed/0001_curriculum_reference_data.sql'i Supabase
//      Dashboard > SQL Editor'da çalıştırın.
//   4) JSON değişikliğini commit'leyip uygulamayı yeniden deploy edin
//      (yeni kurulumlarda yerel seed de güncel olsun diye).
//
// BİLİNÇLİ SINIR: `subjects.name`/`topics.name`/`curriculum_outcomes.code`
// id'nin türetildiği doğal anahtardır — bunları değiştirmek "update" değil
// "re-key"dir (yeni id/satır oluşur, eski satır Supabase'de öksüz kalır,
// script bunu temizlemez). description/topic_id/unit/order gibi id'den
// bağımsız alanlar için ise gerçek update (on conflict do update) güvenlidir.
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
      const newTopic = { id: topicId, subjectId, grade: seed.grade, name: topicSeed.name, unit: topicSeed.unit, order };
      const existingTopic = topics.get(topicId);
      if (existingTopic && (existingTopic.unit !== newTopic.unit || existingTopic.order !== newTopic.order)) {
        throw new Error(
          `Tutarsız konu tanımı: "${seed.subject}" / ${seed.grade}. sınıf / "${topicSeed.name}" birden fazla ` +
            `dosyada farklı unit/order değerleriyle tanımlanmış. JSON dosyalarında kopyala-yapıştır hatası olabilir.`,
        );
      }
      if (!existingTopic) {
        topics.set(topicId, newTopic);
      }

      for (const outcomeSeed of topicSeed.outcomes) {
        const outcomeId = await deterministicUuid(`outcome|${outcomeSeed.code}`);
        const newOutcome = { id: outcomeId, topicId, code: outcomeSeed.code, description: outcomeSeed.description };
        const existingOutcome = outcomes.get(outcomeId);
        if (
          existingOutcome &&
          (existingOutcome.topicId !== newOutcome.topicId || existingOutcome.description !== newOutcome.description)
        ) {
          throw new Error(
            `Tutarsız kazanım tanımı: kod "${outcomeSeed.code}" birden fazla yerde farklı topic/description ` +
              `değerleriyle tanımlanmış. JSON dosyalarında kopyala-yapıştır hatası olabilir.`,
          );
        }
        if (!existingOutcome) {
          outcomes.set(outcomeId, newOutcome);
        }
      }
    }
  }

  const lines: string[] = [];
  lines.push('-- Otomatik üretildi: scripts/generate-curriculum-seed-sql.ts');
  lines.push('-- Kaynak: src/database/seeds/curriculum/*.json');
  lines.push("-- Bu dosyayı Supabase Dashboard > SQL Editor'da çalıştırın (tekrar çalıştırmak güvenlidir).");
  lines.push("-- id'ler deterministicUuid ile üretildi; istemci tarafındaki id'lerle birebir eşleşir.");
  lines.push('');

  // subjects: "do nothing" kalır — tek alanı `name`, zaten id'nin kaynağı;
  // bir dersin adını değiştirmek "update" değil "re-key"dir.
  lines.push('insert into subjects (id, name) values');
  lines.push(
    Array.from(subjects.values())
      .map((s) => `  ('${s.id}', ${sqlString(s.name)})`)
      .join(',\n') + '\non conflict (id) do nothing;',
  );
  lines.push('');

  // topics/curriculum_outcomes: id'den bağımsız alanlar (unit/order,
  // description/topic_id) gerçek içerik düzeltmeleri olabilir — "do update"
  // + "is distinct from" guard'ı, içerik değişmediyse updated_at'i (ve
  // dolayısıyla tüm istemcilerdeki gereksiz re-pull'u) bump etmemek için.
  lines.push('insert into topics (id, subject_id, grade, name, unit, "order") values');
  lines.push(
    Array.from(topics.values())
      .map(
        (t) =>
          `  ('${t.id}', '${t.subjectId}', ${t.grade}, ${sqlString(t.name)}, ${sqlOptionalString(t.unit)}, ${t.order})`,
      )
      .join(',\n') +
      '\non conflict (id) do update set\n' +
      '  unit = excluded.unit,\n' +
      '  "order" = excluded."order",\n' +
      '  updated_at = now()\n' +
      'where topics.unit is distinct from excluded.unit\n' +
      '   or topics."order" is distinct from excluded."order";',
  );
  lines.push('');

  lines.push('insert into curriculum_outcomes (id, topic_id, code, description) values');
  lines.push(
    Array.from(outcomes.values())
      .map((o) => `  ('${o.id}', '${o.topicId}', ${sqlString(o.code)}, ${sqlString(o.description)})`)
      .join(',\n') +
      '\non conflict (id) do update set\n' +
      '  topic_id = excluded.topic_id,\n' +
      '  description = excluded.description,\n' +
      '  updated_at = now()\n' +
      'where curriculum_outcomes.topic_id is distinct from excluded.topic_id\n' +
      '   or curriculum_outcomes.description is distinct from excluded.description;',
  );
  lines.push('');

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf-8');
  console.log(`Yazıldı: ${OUTPUT_PATH}`);
  console.log(`${subjects.size} subject, ${topics.size} topic, ${outcomes.size} outcome.`);
}

main();
