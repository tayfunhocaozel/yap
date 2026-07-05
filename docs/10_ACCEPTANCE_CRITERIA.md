# 10_ACCEPTANCE_CRITERIA.md

# YAP -- Yazılı Analiz Programı

## Acceptance Criteria

### Version 1.0

------------------------------------------------------------------------

# Amaç

Bu doküman, YAP projesindeki her modül için test edilebilir kabul
kriterlerini tanımlar. Bir özelliğin tamamlanmış sayılabilmesi için bu
kriterlerin tamamını karşılaması gerekir.

------------------------------------------------------------------------

# AC-001 Dashboard

## Kabul Kriterleri

-   Uygulama açıldığında Dashboard görüntülenir.
-   Son kullanılan sınıflar listelenir.
-   Son analizler görüntülenir.
-   "Yeni Yazılı" işlemi tek tıklamayla başlatılır.

------------------------------------------------------------------------

# AC-002 Sınıf Yönetimi

-   Yeni sınıf oluşturulabilir.
-   Aynı isimde ikinci sınıf oluşturulamaz.
-   Sınıf düzenlenebilir.
-   Sınıf arşivlenebilir.
-   Arşivlenen sınıflar varsayılan listede görünmez.

------------------------------------------------------------------------

# AC-003 Öğrenci Aktarımı

-   Excel (.xlsx) dosyası içe aktarılabilir.
-   CSV dosyası içe aktarılabilir.
-   Zorunlu sütunlar doğrulanır.
-   Hatalı satırlar raporlanır.
-   Başarılı kayıt sayısı gösterilir.

------------------------------------------------------------------------

# AC-004 Yazılı Oluşturma

-   Ders seçimi zorunludur.
-   Sınıf seçimi zorunludur.
-   Tarih seçimi zorunludur.
-   Yazılı başarıyla kaydedilir.

------------------------------------------------------------------------

# AC-005 Soru Tanımlama

-   Her soruya puan atanabilir.
-   Her soruya konu atanabilir.
-   Her soruya kazanım atanabilir.
-   Toplam puan 100 değilse kayıt engellenir.

------------------------------------------------------------------------

# AC-006 Puan Girişi

-   Her hücre yalnızca geçerli puan kabul eder.
-   Puan soru puanını aşamaz.
-   Toplam puan otomatik hesaplanır.
-   Klavye ile hızlı giriş desteklenir.

------------------------------------------------------------------------

# AC-007 Analiz

Analiz çalıştırıldığında;

-   Sınıf analizi oluşur.
-   Öğrenci analizi oluşur.
-   Konu analizi oluşur.
-   Kazanım analizi oluşur.
-   Risk analizi oluşur.

------------------------------------------------------------------------

# AC-008 Telafi Önerileri

-   Sistem öneri üretir.
-   Öğretmen öneriyi değiştirebilir.
-   Seçilen telafi yöntemi kaydedilebilir.

------------------------------------------------------------------------

# AC-009 PDF

-   PDF önizleme açılır.
-   Yazdırılabilir çıktı oluşturulur.
-   Grafikler bozulmaz.
-   Tablolar hizalı görünür.

------------------------------------------------------------------------

# AC-010 Performans

-   İlk açılış 3 saniyenin altında olmalıdır.
-   Analiz 5 saniyenin altında tamamlanmalıdır (100 öğrencilik sınıf
    için hedef).
-   Arayüz donmamalıdır.

------------------------------------------------------------------------

# AC-011 Offline

-   İnternet bağlantısı olmadan çalışmalıdır.
-   Veriler cihazda korunmalıdır.
-   Yeniden açıldığında son veriler yüklenmelidir.

------------------------------------------------------------------------

# AC-012 Genel Kalite

-   TypeScript hatası bulunmamalıdır.
-   Lint hatası bulunmamalıdır.
-   Kritik hata oluşmamalıdır.
-   Tüm zorunlu alanlar doğrulanmalıdır.

------------------------------------------------------------------------

# Tamamlanma Tanımı (Definition of Done)

Bir özellik tamamlanmış sayılırsa:

-   Kabul kriterlerinin tamamı sağlanmıştır.
-   Kod standartlarına uygundur.
-   Dokümantasyon güncellenmiştir.
-   Test edilmiştir.
-   Mevcut mimariyi bozmamaktadır.

------------------------------------------------------------------------

# Sonraki Doküman

11_ROADMAP.md

Bu belgede geliştirme fazları, sürüm planları ve önceliklendirme
tanımlanacaktır.
