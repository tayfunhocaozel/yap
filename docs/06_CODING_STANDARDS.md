# 06_CODING_STANDARDS.md

# YAP -- Yazılı Analiz Programı

## Coding Standards

### Version 1.0

------------------------------------------------------------------------

# 1. Amaç

Bu doküman, YAP projesinde uygulanacak kodlama standartlarını tanımlar.
Tüm geliştiriciler ve yapay zekâ araçları bu kurallara uymalıdır.

------------------------------------------------------------------------

# 2. Genel Prensipler

-   Okunabilir kod yaz.
-   Basit çözümleri tercih et.
-   Gereksiz karmaşıklıktan kaçın.
-   Tek sorumluluk ilkesini uygula.
-   Kod tekrarından kaçın (DRY).

------------------------------------------------------------------------

# 3. TypeScript Kuralları

-   `strict` modu açık olmalıdır.
-   `any` kullanılmamalıdır.
-   Ortak tipler `types/` klasöründe tutulmalıdır.
-   Enum yerine mümkün olduğunda union type tercih edilmelidir.

------------------------------------------------------------------------

# 4. React Kuralları

-   Functional Component kullanılacaktır.
-   Hooks tercih edilecektir.
-   Component'ler tek sorumluluğa sahip olacaktır.
-   Büyük component'ler küçük parçalara ayrılacaktır.

------------------------------------------------------------------------

# 5. Dosya ve Klasör Yapısı

Her özellik kendi klasöründe bulunmalıdır.

Örnek:

    features/
      exams/
        components/
        hooks/
        pages/
        services/
        types/

------------------------------------------------------------------------

# 6. İsimlendirme

-   Component: PascalCase
-   Hook: useXxx
-   Fonksiyon: camelCase
-   Değişken: camelCase
-   Sabit: UPPER_SNAKE_CASE

Dosya adları:

-   StudentTable.tsx
-   useExam.ts
-   analysisService.ts

------------------------------------------------------------------------

# 7. Servis Katmanı

UI doğrudan veritabanına erişmez.

Akış:

UI → Service → Repository → Database

------------------------------------------------------------------------

# 8. Hata Yönetimi

-   Try/Catch kullanılmalıdır.
-   Kullanıcıya teknik hata mesajı gösterilmemelidir.
-   Beklenmeyen hatalar merkezi olarak loglanmalıdır.

------------------------------------------------------------------------

# 9. Form Doğrulama

Her giriş doğrulanmalıdır.

Örnek:

-   Puan negatif olamaz.
-   Toplam puan 100 olmalıdır.
-   Zorunlu alanlar boş bırakılamaz.

------------------------------------------------------------------------

# 10. Kod İnceleme

Yeni kod şu soruları karşılamalıdır:

-   Anlaşılır mı?
-   Yeniden kullanılabilir mi?
-   Test edilebilir mi?
-   Performanslı mı?

------------------------------------------------------------------------

# 11. Git Kuralları

Commit mesajları:

-   feat:
-   fix:
-   refactor:
-   docs:
-   test:
-   chore:

Örnek:

    feat: add exam analysis module
    fix: validate total score

------------------------------------------------------------------------

# 12. Test

-   İş kuralları Unit Test ile doğrulanmalıdır.
-   Analiz hesaplamaları test edilmelidir.
-   Hatalı veri girişleri test edilmelidir.

------------------------------------------------------------------------

# 13. Dokümantasyon

-   Karmaşık iş kuralları açıklanmalıdır.
-   Public fonksiyonlar açıklayıcı olmalıdır.
-   README güncel tutulmalıdır.

------------------------------------------------------------------------

# 14. Yapay Zekâ ile Geliştirme Kuralları

Kod üretmeden önce:

-   Mevcut mimariyi incele.
-   Yeni kodu mevcut yapıya uygun geliştir.
-   Tekrarlayan kod üretme.
-   Büyük dosyaları gereksiz yere büyütme.
-   Yeni bağımlılık eklemeden önce gerekçeni değerlendir.

------------------------------------------------------------------------

# 15. Kalite Kontrol Listesi

Kod teslim edilmeden önce:

-   Derleme hatası yok.
-   TypeScript uyarısı yok.
-   Lint hatası yok (Oxlint).
-   Gereksiz import yok.
-   Kullanılmayan değişken yok.

------------------------------------------------------------------------

# 16. Sonraki Doküman

07_CLAUDE_INSTRUCTIONS.md

Bu belge Claude'un projede nasıl davranacağını, karar alacağını ve bu
dokümanları nasıl referans alacağını tanımlayacaktır.
