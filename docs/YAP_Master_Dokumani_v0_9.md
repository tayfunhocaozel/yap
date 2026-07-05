\% YAP (Yazılı Analiz Programı) - Yazılım Gereksinim ve Tasarım Dokümanı
(SRS Taslağı)

> **NOT (Superseded):** Bu doküman ilk taslak (v0.9) niteliğindedir.
> İçeriği `docs/00_PRODUCT_REQUIREMENTS.md` ile başlayan 00-12
> numaralı dokümanlar halinde ayrıntılandırılmış ve genişletilmiştir.
> Güncel ve geçerli kaynak `docs/index.md`'de listelenen dokümanlardır.
> Bu dosya yalnızca tarihsel referans amacıyla saklanmaktadır; çelişki
> durumunda 00-12 numaralı dokümanlar esas alınır.

# YAP -- Yazılı Analiz Programı

**Sürüm:** 0.9 (Analiz Taslağı)

**Slogan:** *Veriyi Analize, Analizi Karara Dönüştür.*

------------------------------------------------------------------------

# 1. Projenin Amacı

YAP, ortaokul (5, 6, 7 ve 8. sınıf) branş öğretmenlerinin yazılı sınav
sonrasında MEB mevzuatına uygun olarak;

-   sınıf analizlerini,
-   öğrenci analizlerini,
-   konu ve kazanım analizlerini,
-   telafi planlamalarını,
-   öğretmen raporlarını

hızlı ve standart biçimde hazırlamalarını sağlayan **Offline First PWA**
uygulamasıdır.

Ana hedef:

> Bir öğretmen, herhangi bir eğitim almadan ilk yazılı analizini **10
> dakika içinde** tamamlayabilmelidir.

------------------------------------------------------------------------

# 2. Kapsam

İlk sürümde;

-   Öğrenci yönetimi
-   Sınıf yönetimi
-   Hazır müfredat
-   Yazılı oluşturma
-   Soru tanımlama
-   Puan girişi
-   Analizler
-   PDF raporları

yer alacaktır.

------------------------------------------------------------------------

# 3. Hedef Kullanıcılar

## Birincil

-   Matematik
-   Türkçe
-   Fen Bilimleri
-   Sosyal Bilgiler
-   İngilizce
-   Din Kültürü

branş öğretmenleri.

## İkincil

-   Zümre başkanları

------------------------------------------------------------------------

# 4. Platform Kararı

## Seçilen Mimari

**Progressive Web App (PWA)**

Özellikleri:

-   Offline çalışır.
-   Bilgisayara kurulabilir.
-   Tabletlerde çalışır.
-   Telefonda çalışır.
-   İnternet zorunlu değildir.
-   Veriler cihazda saklanır.

------------------------------------------------------------------------

# 5. Teknoloji

-   React
-   TypeScript
-   IndexedDB
-   Chart.js
-   PDF oluşturma

------------------------------------------------------------------------

# 6. Temel Tasarım İlkeleri

1.  Basit arayüz
2.  En fazla 5 ana menü
3.  Gereksiz veri girişi olmayacak.
4.  Öğretmen tekrar veri yazmayacak.
5.  Aynı bilgi ikinci kez istenmeyecek.

------------------------------------------------------------------------

# 7. Modüller

## 7.1 Sınıf Yönetimi

Özellikler

-   Yeni sınıf oluştur
-   Excel içe aktar
-   CSV içe aktar
-   Öğrenci düzenle
-   Öğrenci sil
-   Toplu güncelle

### Öğrenci Alanları

-   Okul No
-   Ad Soyad
-   Şube
-   Durum

------------------------------------------------------------------------

## 7.2 Müfredat

Program içerisinde hazır bulunacaktır.

Hiyerarşi

Ders

↓

Sınıf

↓

Konu

↓

Kazanım

Öğretmen manuel kazanım oluşturmayacaktır.

------------------------------------------------------------------------

## 7.3 Yazılı Oluşturma

Bilgiler

-   Ders
-   Sınıf
-   Yazılı Adı
-   Tarih
-   Açıklama

------------------------------------------------------------------------

## 7.4 Soru Tanımlama

Her soru için;

-   Soru No
-   Puan
-   Konu
-   Kazanım

girilecektir.

### Kural

Toplam puan

=100

olmalıdır.

100 değilse kayıt yapılamaz.

------------------------------------------------------------------------

## 7.5 Puan Girişi

Her öğrenci için;

her sorudan aldığı puan girilecektir.

Örnek

  Öğrenci     S1   S2   S3   Toplam
  --------- ---- ---- ---- --------
  Ali         10    8   17       92

------------------------------------------------------------------------

# 8. Analiz Motoru

## 8.1 Sınıf Analizi

-   Ortalama
-   Medyan
-   En yüksek
-   En düşük
-   Standart sapma (ileri sürüm)

------------------------------------------------------------------------

## 8.2 Soru Analizi

Her soru için;

-   Ortalama puan
-   Başarı yüzdesi
-   En düşük başarı

------------------------------------------------------------------------

## 8.3 Konu Analizi

Her konu için;

-   Ortalama başarı
-   Başarı yüzdesi
-   Risk seviyesi

------------------------------------------------------------------------

## 8.4 Kazanım Analizi

Her kazanım için;

-   Başarı oranı
-   Öğrenci sayısı
-   Risk düzeyi

------------------------------------------------------------------------

## 8.5 Öğrenci Analizi

Her öğrenci için;

-   Genel başarı
-   Güçlü yönler
-   Geliştirilecek yönler
-   Riskli kazanımlar

------------------------------------------------------------------------

# 9. Telafi Motoru

Program öneri üretir.

    Eksik Öğrenci Öneri
  --------------- --------------------
                1 Bireysel destek
              2-4 Küçük grup
             5-10 Telafi grubu
              10+ Sınıf tekrar dersi

Bu öneriler öğretmen tarafından değiştirilebilir.

------------------------------------------------------------------------

# 10. Müdahale Takibi

Her telafi çalışması kaydedilebilir.

Örnek kayıtlar

-   Tekrar dersi
-   Küçük grup
-   Bireysel çalışma
-   Etüt
-   Çalışma kâğıdı
-   Veli görüşmesi

İlerleyen yazılılarda bu çalışmaların etkisi raporlanacaktır.

------------------------------------------------------------------------

# 11. Raporlar

Üretilecek raporlar

-   Sınıf Analiz Raporu
-   Öğrenci Analiz Raporu
-   Konu Analiz Raporu
-   Kazanım Analiz Raporu
-   Telafi Planı
-   PDF Çıktıları

------------------------------------------------------------------------

# 12. Veri Modeli (İlk Taslak)

Temel tablolar

-   Okullar (opsiyonel)
-   Sınıflar
-   Öğrenciler
-   Dersler
-   Konular
-   Kazanımlar
-   Yazılılar
-   Sorular
-   Öğrenci Puanları
-   Müdahaleler

------------------------------------------------------------------------

# 13. Kullanıcı Akışı

1.  Sınıf oluştur.
2.  Öğrencileri Excel'den yükle.
3.  Yazılı oluştur.
4.  Soruları tanımla.
5.  Puanları gir.
6.  Analizi çalıştır.
7.  Telafi önerilerini incele.
8.  Raporu PDF olarak al.

------------------------------------------------------------------------

# 14. Gelecek Sürümler

## V2

-   Yıllık gelişim grafikleri
-   Aynı kazanımın dönemsel takibi

## V3

-   Yapay zekâ destekli öğretim önerileri
-   Otomatik çalışma planları

## V4

-   Bulut yedekleme
-   Çoklu cihaz senkronizasyonu

------------------------------------------------------------------------

# 15. Proje Prensipleri

-   Program öğretmenin yerine karar vermez; karar vermesini
    kolaylaştırır.
-   Veri girişi minimum düzeyde tutulur.
-   Analizler anlaşılır ve uygulanabilir olmalıdır.
-   Her özellik öğretmenin zaman kazandırmalıdır.

------------------------------------------------------------------------

# 16. Açık Konular

Bu doküman yaşayan bir belgedir.

Bir sonraki çalışmada ayrıntılı olarak tasarlanacaktır:

-   Veritabanı şeması
-   Ekran tasarımları (Wireframe)
-   UI standartları
-   Analiz algoritmaları
-   PDF şablonları
-   Renk sistemi
-   İkon seti
-   Yetkilendirme
-   Yedekleme sistemi
