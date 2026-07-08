// Sığ (tek seviye) camelCase <-> snake_case dönüştürücü. Yerel entity'ler
// (TS, camelCase) ile Supabase/Postgres tabloları (snake_case) arasında
// köprü kurar. Nested object desteği bilinçli olarak eklenmedi — sync'e
// dahil edilen entity'lerin (Teacher, SchoolClass) hiçbiri nested değil.

function camelToSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());
}

export function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnakeKey(key)] = value;
  }
  return result;
}

export function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamelKey(key)] = value;
  }
  return result;
}
