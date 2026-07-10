# 04_ANALYSIS_ENGINE.md

# YAP -- Yazılı Analiz Programı

## Analysis Engine Specification

### Version 1.0

------------------------------------------------------------------------

# 1. Amaç

Bu doküman YAP uygulamasının analiz motorunu tanımlar.

Analiz motoru; öğretmenin girdiği puanlardan anlamlı, güvenilir ve
uygulanabilir sonuçlar üretmekten sorumludur.

Bu dokümanda tanımlanan kurallar sistemin tek referansı olacaktır.

------------------------------------------------------------------------

# 2. Analiz Prensipleri

-   Tüm analizler puan üzerinden yapılır.
-   Doğru/Yanlış mantığı kullanılmaz.
-   Analizler açıklanabilir olmalıdır.
-   Aynı veri her zaman aynı sonucu üretmelidir.
-   Sonuçlar öğretmene karar desteği sunmalıdır.

------------------------------------------------------------------------

# 3. Hesaplanan Analizler

## A. Öğrenci Analizi

Her öğrenci için:

-   Toplam puan
-   Başarı yüzdesi
-   Güçlü konular
-   Güçlü kazanımlar
-   Geliştirilmesi gereken konular
-   Geliştirilmesi gereken kazanımlar

------------------------------------------------------------------------

## B. Sınıf Analizi

Hesaplanacak değerler

-   Ortalama
-   En yüksek puan
-   En düşük puan
-   Başarı dağılımı
-   Soru bazlı başarı
-   Konu bazlı başarı
-   Kazanım bazlı başarı

------------------------------------------------------------------------

## C. Soru Analizi

Her soru için

-   Maksimum puan
-   Ortalama alınan puan
-   Başarı yüzdesi

Formül

Başarı (%) = (Toplam Alınan Puan / Toplam Alınabilecek Puan) ×100

------------------------------------------------------------------------

## D. Konu Analizi

Bir konuya ait tüm sorular birlikte değerlendirilir.

Hesaplanacaklar

-   Ortalama başarı
-   Başarı yüzdesi
-   Eksik öğrenci sayısı

------------------------------------------------------------------------

## E. Kazanım Analizi

Her kazanım için

-   Başarı yüzdesi
-   Ortalama puan
-   Başarısız öğrenci sayısı
-   Durum seviyesi

Bu analiz telafi planlamasının temelidir.

------------------------------------------------------------------------

# 4. Durum Analizi

Önerilen seviyeler

-   %85-100 → Pekiyi
-   %70-84 → İyi
-   %55-69 → Orta
-   %45-54 → Geçer
-   %0-44 → Zayıf

Eşik değerleri ayarlardan değiştirilebilir (ileri sürüm).

## Bilinen Kısıt

V1'de durum seviyesi yalnızca başarı yüzdesine dayanır; bir kazanıma
bağlı soru sayısı çok azsa (örn. tek soru) durum etiketinin
güvenilirliği düşük olabilir. Bu bilinçli bir V1 kapsam kararıdır;
minimum örneklem eşiği eklenmesi Bölüm 9'daki gelecek geliştirmeler
kapsamında değerlendirilebilir.

------------------------------------------------------------------------

# 5. Telafi Karar Motoru

Varsayılan öneriler

    Eksik Öğrenci Sistem Önerisi
  --------------- --------------------
                1 Bireysel Destek
              2-4 Küçük Grup
             5-10 Telafi Grubu
              10+ Sınıf Tekrar Dersi

Öneri yalnızca rehber niteliğindedir.

------------------------------------------------------------------------

# 6. Müdahale Etki Analizi (V2)

Bir sonraki yazılıda aynı konu veya kazanım tekrar ölçüldüğünde:

-   Önceki başarı
-   Sonraki başarı
-   Değişim yüzdesi

hesaplanacaktır.

------------------------------------------------------------------------

# 7. Grafikler

Üretilecek grafikler

-   Puan dağılımı
-   Konu başarı grafiği
-   Kazanım başarı grafiği
-   Durum dağılımı
-   Öğrenci karşılaştırması

------------------------------------------------------------------------

# 8. Analiz İlkeleri

-   Grafikler sayısal tablolarla desteklenmelidir.
-   Analizler anlaşılır dil kullanmalıdır.
-   Teknik terimler gerektiğinde açıklanmalıdır.
-   Öğretmen ham veriye de ulaşabilmelidir.

------------------------------------------------------------------------

# 9. Gelecek Geliştirmeler

-   Standart sapma analizi
-   Ayırt edicilik analizi
-   Güçlük indeksi
-   Kazanım trend analizi
-   Yıllık gelişim grafikleri
-   Yapay zekâ destekli yorumlar
-   Durum seviyesinde minimum örneklem (soru sayısı) eşiği

------------------------------------------------------------------------

# 10. Sonraki Doküman

05_TECHNICAL_ARCHITECTURE.md

Bu belgede uygulamanın teknik mimarisi, klasör yapısı, katmanlar ve
geliştirme standartları tanımlanacaktır.
