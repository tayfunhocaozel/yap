-- Faz 4: subjects/topics/curriculum_outcomes için pull senkronu.
--
-- Bu üç tablo paylaşılan, salt-okunur referans veridir (RLS'de yalnızca
-- select var, bkz. 0001_initial_schema.sql) — istemciden hiçbir zaman
-- yazılmaz, yalnızca PULL edilir (bkz. src/sync/pullTable.ts). Pull'un
-- `.gt('updated_at', since)` cursor sorgusu için `updated_at` şart.
--
-- created_at/deleted_at BİLEREK eklenmedi:
--   * created_at hiçbir yerde kullanılmıyor (YAGNI).
--   * Bu veri hiç silinmiyor; düzeltmeler her zaman id'yi değiştiren
--     "re-key" yoluyla yapılıyor (bkz. curriculumSeedService.ts).
--
-- BİLİNÇLİ SINIRLAR (idari işlem yaparken bunlara uyulmalı):
--   1) Bu tablolara ASLA `delete from ...` çalıştırılmasın — deleted_at
--      kolonu olmadığından pull'un cursor'lu sorgusu silinmeyi hiçbir
--      zaman göremez; satır, zaten pull etmiş istemcilerde kalıcı olarak
--      kalır (sessiz, geri döndürülemez sapma).
--   2) subjects.name / topics.name / curriculum_outcomes.code doğal
--      anahtardır — id bu değerden türetilir (deterministicUuid).
--      Bunları değiştirmek "update" değil "re-key"dir: yeni bir id/satır
--      oluşur, eski satır Supabase'de öksüz kalır (zararsız ama kalıcı).
--      description/topic_id/unit/order gibi id'den bağımsız alanlar için
--      gerçek update güvenlidir (bkz. scripts/generate-curriculum-seed-sql.ts).

alter table subjects add column if not exists updated_at timestamptz not null default now();
alter table topics add column if not exists updated_at timestamptz not null default now();
alter table curriculum_outcomes add column if not exists updated_at timestamptz not null default now();
