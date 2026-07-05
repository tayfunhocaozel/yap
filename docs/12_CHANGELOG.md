# 12_CHANGELOG.md

# YAP -- Yazılı Analiz Programı

## Changelog

### Version History

------------------------------------------------------------------------

# Amaç

Bu belge, YAP projesinde yapılan tüm önemli değişikliklerin kronolojik
kaydını tutar.

Her sürüm için aşağıdaki bilgiler kayıt altına alınmalıdır:

-   Yeni özellikler
-   İyileştirmeler
-   Hata düzeltmeleri
-   Kaldırılan özellikler
-   Bilinen sorunlar

------------------------------------------------------------------------

# Sürüm Formatı

## Version

Örnek:

v1.0.0

### Yayın Tarihi

YYYY-MM-DD

### Durum

-   Draft
-   Beta
-   Release Candidate
-   Stable

------------------------------------------------------------------------

# v0.1.2

## Yayın Tarihi

2026-07-05

## Durum

Draft

## Açıklama

`docs/kazanimlar_rows.csv` kaynak müfredat verisi incelendi; veri
modeli buna göre ayarlandı ve kapsam kararları netleştirildi.

### Added

-   01_DATA_MODEL.md: Topic entity'sine opsiyonel `unit` (ünite) alanı
    eklendi; Matematik ve kısmen Fen Bilimleri'nde konu üstü bir
    ünite seviyesi bulunduğu için.
-   01_DATA_MODEL.md: "Kaynak Veri Durumu" bölümü eklendi; kaynak CSV
    ile Subject/Topic eşlemesi ve kapsam dışı bırakılan veriler
    dokümante edildi.

### Changed

-   01_DATA_MODEL.md: Müfredat JSON şemasına opsiyonel `unit` alanı
    eklendi.

### Bilinen Sorunlar

-   Din Kültürü ve Ahlak Bilgisi müfredat verisi henüz sağlanmadı.
-   İngilizce 8. sınıf müfredat verisi henüz sağlanmadı.
-   T.C. İnkılâp Tarihi ve Atatürkçülük dersi (8. sınıf) V1 kapsamı
    dışında tutulmasına karar verildi; kaynak veride mevcut olmasına
    rağmen içe aktarılmayacak.

------------------------------------------------------------------------

# v0.1.1

## Yayın Tarihi

2026-07-05

## Durum

Draft

## Açıklama

Dokümantasyon incelemesinde tespit edilen eksiklikler giderildi.

### Added

-   01_DATA_MODEL.md: Teacher (Öğretmen) entity'si eklendi; Class artık
    bir Teacher'a bağlı.
-   01_DATA_MODEL.md: Müfredat verisinin kaynağı ve içe aktarım şeması
    (JSON seed dosyaları, dosya konumu, yükleme kuralları) tanımlandı.
-   02_SYSTEM_REQUIREMENTS.md: FR-011 Ayarlar / Öğretmen Profili eklendi.
-   05_TECHNICAL_ARCHITECTURE.md: IndexedDB şema versiyonlama
    (Dexie migration) stratejisi tanımlandı.
-   03_UI_UX_GUIDELINES.md: Risk/başarı göstergelerinin yalnızca renge
    dayanmaması kuralı eklendi (erişilebilirlik).
-   04_ANALYSIS_ENGINE.md: Kazanım risk analizinde düşük örneklem
    kısıtı not edildi; gelecek geliştirmeler listesine eklendi.

### Changed

-   01_DATA_MODEL.md: Exam.totalScore alanı kaldırıldı; toplam puan
    artık Question kayıtlarından hesaplanan bir değer olarak
    tanımlandı (saklanmıyor).
-   07_CLAUDE_INSTRUCTIONS.md: Referans doküman listesi 08-12 numaralı
    dokümanları içerecek şekilde güncellendi.
-   YAP_Master_Dokumani_v0_9.md: Doküman "superseded" olarak
    işaretlendi; güncel kaynağın 00-12 numaralı dokümanlar olduğu
    belirtildi.

### Düzeltilenler

Yok

### Kaldırılanlar

Yok

### Bilinen Sorunlar

-   Wireframe'ler ilk taslak seviyesindedir.
-   Kazanım risk analizinde minimum örneklem eşiği V1'de
    uygulanmayacak (bilinçli kapsam kararı).

------------------------------------------------------------------------

# v0.1.0

## Durum

Draft

## Açıklama

Proje dokümantasyonu oluşturulmaya başlandı.

### Eklenenler

-   Product Requirements
-   Data Model
-   System Requirements
-   UI/UX Guidelines
-   Analysis Engine
-   Technical Architecture
-   Coding Standards
-   Claude Instructions
-   User Stories
-   Wireframes
-   Acceptance Criteria
-   Roadmap

### Düzeltilenler

Yok

### Kaldırılanlar

Yok

### Bilinen Sorunlar

-   Wireframe'ler ilk taslak seviyesindedir.
-   Analiz algoritmaları ayrıntılandırılacaktır.

------------------------------------------------------------------------

# Gelecek Sürümler

## v0.2.0

Planlananlar

-   Ayrıntılı ekran tasarımları
-   Veri sözlüğü
-   Analiz formülleri
-   Kullanıcı akış diyagramları

------------------------------------------------------------------------

## v1.0.0

İlk kararlı sürüm hedefi.

İçerik:

-   Çalışan MVP
-   Offline First PWA
-   PDF raporlama
-   Analiz motoru
-   Telafi önerileri

------------------------------------------------------------------------

# Değişiklik Türleri

## Added

Yeni özellik

## Changed

Davranış değişikliği

## Fixed

Hata düzeltmesi

## Removed

Kaldırılan özellik

## Deprecated

Yakında kaldırılacak özellik

## Security

Güvenlik iyileştirmesi

------------------------------------------------------------------------

# Güncelleme Kuralları

Her geliştirme sonunda bu belge güncellenmelidir.

Hiçbir sürüm geriye dönük değiştirilmemelidir.

Yeni kayıtlar en üste eklenmelidir.

------------------------------------------------------------------------

# Sonraki Adım

Temel proje dokümantasyonu tamamlanmıştır.

Bundan sonraki aşama mevcut dokümanların ayrıntılandırılması ve
geliştirme (implementation) sürecine geçiştir.
