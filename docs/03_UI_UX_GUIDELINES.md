# 03_UI_UX_GUIDELINES.md

# YAP -- Yazılı Analiz Programı

## UI / UX Design Guidelines

### Version 1.0

------------------------------------------------------------------------

# 1. Amaç

Bu doküman, YAP uygulamasının tüm ekranlarında kullanılacak tasarım
standartlarını tanımlar.

Amaç; sade, hızlı öğrenilebilen ve öğretmen odaklı bir arayüz
oluşturmaktır.

------------------------------------------------------------------------

# 2. Tasarım İlkeleri

-   Öğretmen odaklı
-   Minimum tıklama
-   Tutarlı bileşenler
-   Dikkat dağıtmayan arayüz
-   Mobil uyumlu
-   Masaüstü öncelikli

------------------------------------------------------------------------

# 3. Genel Yerleşim

## Sol Menü

-   Dashboard
-   Sınıflar
-   Yazılılar
-   Analizler
-   Raporlar
-   Ayarlar

## Üst Çubuk

-   Sayfa başlığı
-   Arama
-   Tema
-   Profil

------------------------------------------------------------------------

# 4. Renk Sistemi

Ana Renk: - Mavi → İşlemler

Başarı: - Yeşil

Uyarı: - Turuncu

Risk: - Kırmızı

Bilgi: - Gri

Renkler erişilebilirlik kurallarına uygun kontrasta sahip olmalıdır.

Risk seviyesi gibi anlam taşıyan hiçbir gösterge yalnızca renkle ifade
edilmez. Renk körlüğü olan kullanıcılar için risk/başarı seviyeleri
her zaman bir ikon, etiket metni veya desenle (örn. "Kritik" yazısı,
ünlem ikonu) desteklenir. (Bkz. Bölüm 9 Analiz Sayfası, Riskli
Öğrenciler bileşeni.)

------------------------------------------------------------------------

# 5. Tipografi

-   Başlıklar belirgin
-   Büyük okunabilir yazı
-   Yoğun metinden kaçınılmalı

------------------------------------------------------------------------

# 6. Kart Tasarımı

Her ana modül kart yapısında gösterilir.

Kartlarda:

-   Başlık
-   Açıklama
-   İkon
-   İşlem butonu

bulunmalıdır.

------------------------------------------------------------------------

# 7. Tablolar

Tüm veri tablolarında:

-   Sıralama
-   Filtreleme
-   Arama
-   Sayfalama
-   Sütun gizleme (ileri sürüm)

desteklenmelidir.

------------------------------------------------------------------------

# 8. Puan Giriş Ekranı

Bu ekran Excel kullanım alışkanlığına benzemelidir.

Özellikler:

-   Klavye ile gezinme
-   Enter ile alt satıra geçiş
-   Ok tuşları desteği
-   Otomatik toplam
-   Geçersiz puan uyarısı
-   Kaydetmeden önce doğrulama

------------------------------------------------------------------------

# 9. Analiz Sayfası

Gösterilecek bileşenler:

-   Sınıf özeti
-   Başarı grafiği
-   Konu analizi
-   Kazanım analizi
-   Riskli öğrenciler
-   Telafi önerileri

------------------------------------------------------------------------

# 10. Grafik Standartları

Kullanılacak grafik türleri:

-   Çubuk grafik
-   Çizgi grafik
-   Pasta grafik
-   Isı haritası

Grafikler yazdırılabilir olmalıdır.

------------------------------------------------------------------------

# 11. Mobil Davranış

-   Sol menü açılır hale gelir.
-   Kartlar tek sütun olur.
-   Tablolar yatay kaydırılabilir.
-   Büyük dokunma alanları kullanılmalıdır.

------------------------------------------------------------------------

# 12. Kullanılabilirlik Kuralları

-   Aynı işlem için farklı butonlar kullanılmaz.
-   Aynı ikon aynı anlamı taşır.
-   Kullanıcı yaptığı işlemi her zaman geri alabilir.
-   Kritik işlemler onay ister.

------------------------------------------------------------------------

# 13. Tasarım Prensibi

YAP'ın arayüzü modern görünmelidir ancak gösterişli olmamalıdır.

Öğretmen ekranı açtığında odak noktası analizler olmalı; tasarım hiçbir
zaman verinin önüne geçmemelidir.

------------------------------------------------------------------------

# 14. Sonraki Doküman

04_ANALYSIS_ENGINE.md

Bu belgede analiz algoritmaları, hesaplama yöntemleri ve telafi öneri
mantığı ayrıntılı olarak tanımlanacaktır.
