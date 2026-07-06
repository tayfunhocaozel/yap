# 05_TECHNICAL_ARCHITECTURE.md

# YAP -- Yazılı Analiz Programı

## Technical Architecture

### Version 1.0

------------------------------------------------------------------------

# 1. Amaç

Bu doküman YAP uygulamasının teknik mimarisini tanımlar. Amaç;
sürdürülebilir, ölçeklenebilir ve bakımı kolay bir yazılım altyapısı
oluşturmaktır.

------------------------------------------------------------------------

# 2. Mimari Yaklaşım

-   Offline First
-   Progressive Web App (PWA)
-   Component-Based Architecture
-   Feature-Based Folder Structure
-   TypeScript ile güçlü tip denetimi

------------------------------------------------------------------------

# 3. Teknoloji Yığını

## Frontend

-   React
-   TypeScript
-   Vite

## UI

-   Material UI (veya benzeri modern bileşen kütüphanesi)
-   Chart.js

## Veri Saklama

-   IndexedDB
-   Dexie.js (IndexedDB yönetimi için önerilir)

## Raporlama

-   PDF oluşturma kütüphanesi

------------------------------------------------------------------------

# 4. Klasör Yapısı

    src/
      app/
      features/
        classes/
        students/
        curriculum/
        exams/
        analysis/
        reports/
        settings/
      components/
      hooks/
      services/
      repositories/
      database/
      types/
      utils/
      assets/

------------------------------------------------------------------------

# 5. Katmanlar

## Presentation

Kullanıcı arayüzü

## Business

İş kuralları ve analiz motoru

## Data

IndexedDB erişimi

------------------------------------------------------------------------

# 6. State Yönetimi

Merkezi durum yönetimi kullanılacaktır.

İlk tercih: - Zustand

Alternatif: - Redux Toolkit

------------------------------------------------------------------------

# 7. Veri Erişimi

UI katmanı doğrudan IndexedDB'ye erişmez.

Akış:

UI → Service → Repository → IndexedDB

------------------------------------------------------------------------

# 8. Offline Stratejisi

-   Tüm temel işlemler internet olmadan çalışır.
-   Veriler yerel cihazda (IndexedDB) saklanır.
-   İnternet yalnızca isteğe bağlı güncelleme veya yedekleme için
    kullanılır.
-   `vite-plugin-pwa` (Workbox `generateSW` modu) ile uygulama kabuğu
    (HTML/CSS/JS/font) build sırasında service worker precache'ine
    alınır; `registerType: 'autoUpdate'` ile yeni bir sürüm yayınlanınca
    sekme kapatılıp açıldığında otomatik güncellenir. Uygulamanın
    kendisi harici bir API'ye istek atmadığı için `runtimeCaching`
    tanımlı değildir. Manifest ve ikonlar (`public/pwa-*.png`)
    uygulamanın ana ekrana eklenebilir (installable) olmasını sağlar.
-   PWA davranışı yalnızca production build'de (`npm run build` +
    `npm run preview`) aktiftir; `npm run dev` service worker
    kaydetmez.

------------------------------------------------------------------------

# 8.1 Dağıtım (Deployment)

-   Uygulama tamamen istemci tarafında çalışan (sunucu/backend
    gerektirmeyen) bir SPA olduğu için GitHub Pages üzerinde statik
    olarak barındırılır.
-   `.github/workflows/deploy.yml`: `master` branch'e her push'ta
    `npm ci && npm run build` çalıştırır ve `dist/` klasörünü GitHub
    Pages'e yayınlar.
-   Routing `HashRouter` ile yapılır (`.../#/siniflar` gibi); GitHub
    Pages server-side rewrite desteklemediği için `BrowserRouter` ile
    doğrudan bir alt sayfa açılması/yenilenmesi 404 ile sonuçlanırdı.
-   `vite.config.ts`'teki `base` yolu, GitHub Actions'ın otomatik
    sağladığı `GITHUB_REPOSITORY` değişkeninden türetilir
    (`/repo-adı/`); yerel geliştirmede etkisi yoktur.
-   Öğretmen tarafında "kurulum": bir dosya indirmek yerine, yayınlanan
    URL'e tarayıcıdan gidip "Ana Ekrana Ekle" ile PWA olarak
    yüklenir; sonraki her açılış (bkz. Bölüm 8) internetsiz çalışır ve
    yeni bir sürüm yayınlandığında otomatik güncellenir.

------------------------------------------------------------------------

# 8.2 Bulut Senkronu (Supabase) — Kademeli Geçiş

Veri kaybı riskini azaltmak (cihaz kaybı/değişimi, tarayıcı verisi
silinmesi) için uygulama, IndexedDB'yi yerel öncelikli (offline-first)
tutarak arka planda Supabase'e (PostgreSQL + Auth) senkronize olacak
şekilde kademeli olarak geçiriliyor. Bu, tek adımda değil, her biri
ayrı test edilen fazlarla ilerliyor:

-   **Faz 0 (tamamlandı)**: `curriculumSeedService.ts`, Subject/Topic/
    CurriculumOutcome için `crypto.randomUUID()` yerine deterministik
    UUID v5 (`src/utils/deterministicId.ts`, doğal anahtardan SHA-1
    ile) üretir; böylece bu referans veri Supabase'e taşındığında tüm
    istemciler aynı id'leri üretir. Önceden rastgele id ile seed
    edilmiş kayıtlar, uygulama her açıldığında otomatik olarak yeni
    id'ye geçirilir (re-key) ve buna referans veren `Question`/
    `Intervention` kayıtları da güncellenir.
-   **Faz 1 (tamamlandı)**: Supabase Auth (e-posta+şifre) eklendi.
    `src/app/AuthProvider.tsx` + `src/app/authContext.ts` oturum
    durumunu tutar; `src/app/RequireAuth.tsx` route guard'dır; giriş/
    kayıt ekranları `src/features/auth/pages/`. `Teacher.id` artık
    `auth.uid()` ile birebir aynıdır (`teacherService.getById`/
    `createOrUpdate(id, input)`). **Bu fazda veri hâlâ %100 yerel
    kalır** — Supabase tablolarına henüz hiçbir satır yazılmaz, sync
    motoru sonraki fazların konusudur. SQL şeması ve RLS politikaları
    `supabase/migrations/0001_initial_schema.sql`'de tanımlıdır;
    service_role erişimi olmadığı için Supabase Dashboard → SQL
    Editor'dan elle uygulanır.
-   **Faz 2-6 (planlandı, henüz yapılmadı)**: outbox tabanlı senkron
    kuyruğu, push/pull, `updated_at` bazlı last-write-wins çakışma
    çözümü, kalan entity'lere pattern'in uygulanması, Realtime,
    ilk-giriş rekey migrasyonu, test altyapısı (Supabase mock) ve e2e
    güncellemesi. Detaylı plan ve riskler için proje geçmişindeki
    plan dosyasına bakılabilir; bu bölüm her faz tamamlandıkça
    güncellenecektir.

**Bilinen sınır**: last-write-wins stratejisi tek öğretmen + çoklu
cihaz senaryosunu hedefler; aynı kaydın iki cihazda offline değişip
çakışması durumunda birleştirme arayüzü sunulmaz (geç senkronize olan
kazanır). Gerçek çoklu-kullanıcı işbirlikli düzenleme bu stratejiyle
desteklenmez (V3.0'da ayrıca ele alınmalı).

------------------------------------------------------------------------

# 9. Performans

-   Lazy Loading
-   Code Splitting
-   Memoization
-   Sanal listeleme (gerekirse)

------------------------------------------------------------------------

# 10. Güvenlik

-   Yerel veri doğrulama
-   Girdi kontrolleri
-   Zararlı veri girişlerinin engellenmesi
-   Supabase Auth (e-posta+şifre) ile kimlik doğrulama; Row Level
    Security (RLS) politikaları her öğretmenin yalnızca kendi verisini
    okuyup yazabilmesini sağlar (bkz. Bölüm 8.2,
    `supabase/migrations/0001_initial_schema.sql`). `.env` dosyası
    (Supabase URL/anon key) commit edilmez.

------------------------------------------------------------------------

# 11. Hata Yönetimi

-   Kullanıcı dostu hata mesajları
-   Beklenmeyen hatalar için merkezi kayıt mekanizması
-   Veri kurtarma senaryoları

------------------------------------------------------------------------

# 12. Yedekleme

V1: - JSON dışa aktarma - JSON içe aktarma

V2: - Bulut yedekleme (bkz. Bölüm 8.2 — Supabase senkronu, kademeli
    olarak geliştiriliyor; JSON dışa/içe aktarma henüz eklenmedi)

------------------------------------------------------------------------

# 12.1 Şema Versiyonlama (IndexedDB Migration)

Uygulama uzun yıllar kullanılacağı ve veri yalnızca kullanıcının
cihazında saklandığı için, veri modeli değiştiğinde mevcut kullanıcının
verisinin kaybolmaması kritik önemdedir.

## Kural

-   Veritabanı şeması Dexie.js'in `version()` mekanizması ile
    yönetilir.
-   Tabloların alanlarında (entity, ilişki, index) herhangi bir
    değişiklik yapıldığında Dexie versiyon numarası **artırılır**;
    var olan bir versiyon asla geriye dönük değiştirilmez.
-   Yeni alan eski kayıtlarda anlam değişikliğine yol açıyorsa
    (örn. zorunlu hale geliyorsa) bir `upgrade()` fonksiyonu yazılarak
    mevcut kayıtlar dönüştürülür.
-   Her şema değişikliği 12_CHANGELOG.md dosyasına
    `Changed: veritabanı şeması - <özet>` şeklinde not düşülür.
-   Şema değişikliği içeren her geliştirme, 07_CLAUDE_INSTRUCTIONS.md
    kapsamında "Veritabanı yapısını değiştirmek" kategorisine girer ve
    kullanıcı onayı gerektirir.

------------------------------------------------------------------------

# 13. Kod Kalitesi

-   Oxlint (Rust tabanlı, hızlı linter; Vite scaffold varsayılanı)
-   Prettier
-   TypeScript Strict Mode

------------------------------------------------------------------------

# 14. Test Stratejisi

-   Unit Test
-   Component Test
-   Integration Test
-   Manuel kabul testleri

------------------------------------------------------------------------

# 15. Gelecek Genişlemeler

-   Çoklu kullanıcı
-   Bulut senkronizasyonu
-   AI destekli analiz
-   Okul bazlı kullanım

------------------------------------------------------------------------

# 16. Sonraki Doküman

06_CODING_STANDARDS.md

Bu belgede kodlama kuralları, isimlendirme standartları, commit
politikası ve geliştirme prensipleri tanımlanacaktır.
