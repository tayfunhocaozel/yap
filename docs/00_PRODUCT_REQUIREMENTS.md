# 00_PRODUCT_REQUIREMENTS.md

# YAP -- Yazılı Analiz Programı

## Product Requirements Document (PRD)

### Version 1.0 (Draft)

## 1. Ürün Tanımı

**YAP**, ortaokul (5-8. sınıf) öğretmenlerinin yazılı sınav sonrası
analizlerini MEB mevzuatına uygun şekilde hazırlamasını sağlayan Offline
First PWA uygulamasıdır.

## 2. Amaç

-   Yazılı analizini 10 dakikada tamamlatmak.
-   Kazanım eksiklerini belirlemek.
-   Telafi planlamasını kolaylaştırmak.
-   Standart rapor üretmek.

## 3. Hedef Kullanıcılar

-   Matematik
-   Türkçe
-   Fen Bilimleri
-   Sosyal Bilgiler
-   İngilizce
-   Din Kültürü öğretmenleri
-   Zümre başkanları

## 4. MVP Kapsamı

1.  Sınıf Yönetimi
2.  Öğrenci Yönetimi
3.  Müfredat
4.  Yazılı Oluşturma
5.  Soru Tanımlama
6.  Puan Girişi
7.  Analiz Motoru
8.  Telafi Önerileri
9.  PDF Raporları

## 5. Temel İş Kuralları

-   Her yazılı 100 puandır.
-   Her sorunun puanı vardır.
-   Öğrenci her sorudan aldığı puan girilir.
-   Analiz puan üzerinden yapılır.
-   Konu ve kazanımlar sistemde hazır gelir.
-   Öğrenciler Excel/CSV ile yüklenebilir.

## 6. Kullanıcı Akışı

1.  Sınıf oluştur.
2.  Öğrencileri yükle.
3.  Yazılı oluştur.
4.  Soruları tanımla.
5.  Puanları gir.
6.  Analizi çalıştır.
7.  Telafi önerilerini incele.
8.  PDF oluştur.

## 7. Analizler

-   Sınıf
-   Öğrenci
-   Soru
-   Konu
-   Kazanım
-   Risk

## 8. Telafi Önerileri

    Eksik Öğrenci Öneri
  --------------- -----------------
                1 Bireysel Destek
              2-4 Küçük Grup
             5-10 Telafi Grubu
              10+ Sınıf Tekrarı

## 9. Teknik Gereksinimler

-   PWA
-   React
-   TypeScript
-   IndexedDB
-   Responsive tasarım
-   Offline First
-   PDF çıktısı

## 10. Ürün Prensibi

YAP bir not programı değildir. Öğretmenin analiz yapmasını ve telafi
planlamasını kolaylaştıran profesyonel bir karar destek sistemidir.
