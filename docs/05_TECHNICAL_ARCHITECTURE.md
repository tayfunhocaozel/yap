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

------------------------------------------------------------------------

# 11. Hata Yönetimi

-   Kullanıcı dostu hata mesajları
-   Beklenmeyen hatalar için merkezi kayıt mekanizması
-   Veri kurtarma senaryoları

------------------------------------------------------------------------

# 12. Yedekleme

V1: - JSON dışa aktarma - JSON içe aktarma

V2: - Bulut yedekleme

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
