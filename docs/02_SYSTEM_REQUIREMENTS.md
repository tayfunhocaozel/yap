# 02_SYSTEM_REQUIREMENTS.md

# YAP -- Yazılı Analiz Programı

## System Requirements Specification (SRS)

### Version 1.0 (Draft)

------------------------------------------------------------------------

# 1. Amaç

Bu belge, YAP uygulamasının fonksiyonel ve fonksiyonel olmayan
gereksinimlerini tanımlar. Geliştirme sürecinde tüm ekranlar ve
davranışlar bu belgeye göre uygulanacaktır.

------------------------------------------------------------------------

# 2. Sistem Akışı

1.  Sınıf oluşturulur.
2.  Öğrenciler Excel/CSV ile içe aktarılır.
3.  Ders seçilir.
4.  Yazılı oluşturulur.
5.  Sorular tanımlanır.
6.  Öğrenci puanları girilir.
7.  Analizler üretilir.
8.  Telafi planı oluşturulur.
9.  PDF raporu alınır.

------------------------------------------------------------------------

# 3. Ana Modüller

-   Dashboard
-   Sınıf Yönetimi
-   Öğrenci Yönetimi
-   Müfredat
-   Yazılı Yönetimi
-   Puan Girişi
-   Analiz
-   Telafi Planlama
-   Raporlar
-   Ayarlar

------------------------------------------------------------------------

# 4. Fonksiyonel Gereksinimler

## FR-001 Dashboard

-   Son kullanılan sınıfları gösterir.
-   Son analizleri listeler.
-   Yeni yazılı oluşturma kısayolu içerir.

## FR-002 Sınıf Yönetimi

-   Sınıf ekleme
-   Sınıf düzenleme
-   Arşivleme
-   Öğrenci sayısını görüntüleme

## FR-003 Öğrenci Yönetimi

-   Excel/CSV aktarımı
-   Toplu güncelleme
-   Tekil öğrenci ekleme
-   Pasif duruma alma

## FR-004 Müfredat

-   Ders seçimi
-   Sınıf seçimi
-   Konu listesi
-   Kazanım listesi
-   Müfredat salt okunur olacaktır (V1).
-   Müfredat verisi öğretmen tarafından girilmez; proje sahibi
    tarafından sağlanan JSON seed dosyalarından uygulama derlemesine
    dahil edilir (bkz. 01_DATA_MODEL.md, Bölüm 7).

## FR-005 Yazılı Oluşturma

-   Ders
-   Sınıf
-   Tarih
-   Yazılı adı
-   Açıklama

## FR-006 Soru Tanımlama

Her soru için: - Soru numarası - Puan - Konu - Kazanım

Doğrulamalar: - Toplam puan = 100 - Puan negatif olamaz - Aynı soru
numarası tekrar edemez

## FR-007 Puan Girişi

-   Hücresel giriş ekranı
-   Klavye ile hızlı gezinme
-   Otomatik toplam
-   Eksik giriş uyarısı

## FR-008 Analiz Motoru

Üretilecek analizler: - Sınıf - Öğrenci - Soru - Konu - Kazanım - Risk

## FR-009 Telafi Planlama

Sistem öneri üretir: - Bireysel destek - Küçük grup - Telafi grubu -
Sınıf tekrar dersi

Öğretmen öneriyi değiştirebilir.

## FR-010 Raporlar

-   PDF
-   Yazdırma
-   Önizleme

## FR-011 Ayarlar / Öğretmen Profili

-   Öğretmen adı soyadı, branş ve okul adı girilebilir/düzenlenebilir.
-   Bu bilgiler PDF raporlarının üst bilgisinde kullanılır.
-   V1'de cihaz başına tek öğretmen profili bulunur (bkz.
    01_DATA_MODEL.md, Teacher entity).

------------------------------------------------------------------------

# 5. Fonksiyonel Olmayan Gereksinimler

## NFR-001

İnternet olmadan çalışmalıdır.

## NFR-002

Açılış süresi 3 saniyenin altında olmalıdır.

## NFR-003

Veriler cihazda saklanmalıdır.

## NFR-004

Mobil ve masaüstü uyumlu olmalıdır.

## NFR-005

Arayüz Türkçe olacaktır.

------------------------------------------------------------------------

# 6. Doğrulama Kuralları

-   Yazılı toplam puanı 100 olmalıdır.
-   Öğrenci puanı soru puanını aşamaz.
-   Boş zorunlu alanlarla kayıt yapılamaz.
-   Aynı sınıfta aynı isimli yazılı uyarı vermelidir.

------------------------------------------------------------------------

# 7. Hata Senaryoları

-   Hatalı Excel dosyası
-   Eksik sütunlar
-   Geçersiz puan
-   Toplam puan ≠ 100
-   Yinelenen öğrenci numarası

Her durumda kullanıcıya anlaşılır hata mesajı gösterilecektir.

------------------------------------------------------------------------

# 8. Kabul Kriterleri

-   İlk kullanımda yardım almadan kullanılabilmelidir.
-   Bir yazılı analizi 10 dakika içinde tamamlanmalıdır.
-   Tüm analizler tek tıklamayla oluşmalıdır.
-   PDF çıktıları okunabilir ve yazdırılabilir olmalıdır.

------------------------------------------------------------------------

# 9. Sonraki Doküman

03_UI_UX_GUIDELINES.md Bu belgede ekran yerleşimleri, bileşenler, renk
sistemi ve tasarım standartları tanımlanacaktır.
