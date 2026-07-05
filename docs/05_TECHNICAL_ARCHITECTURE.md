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
-   Veriler yerel cihazda saklanır.
-   İnternet yalnızca isteğe bağlı güncelleme veya yedekleme için
    kullanılır.

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

-   ESLint
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
