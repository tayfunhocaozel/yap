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

# v0.11.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Kullanım sırasında not edilen küçük iyileştirmeler (bkz. proje notu,
V1.1 kapsamına girmeyen ama düşük riskli ve bağımsız 5 madde).

### Added

-   Sol menünün altına "© tayfunhoca" copyright metni eklendi.
-   Öğrenci listesi artık okul numarasına göre sayısal sırada
    (`localeCompare(..., { numeric: true })`) listeleniyor; önceden
    veritabanı ekleme sırasına göre karışık görünüyordu.
-   Sınıflar ekranına, sınıf adına göre (büyük/küçük harf duyarsız)
    filtreleme yapan bir arama kutusu eklendi.
-   Pasifleştirilen bir öğrenci artık tekrar aktif duruma alınabiliyor:
    `studentService.activate` (aynı okul numarasını kullanan başka bir
    aktif öğrenci varsa reddeder), Öğrenci Listesi'nde "Pasif
    öğrencileri göster" anahtarı ve "Aktifleştir" işlemi.
-   `Topic` entity'sine `order` alanı eklendi (01_DATA_MODEL.md);
    konular artık veritabanı kayıt sırasına göre rastgele değil,
    kaynak müfredat CSV'sindeki (kazanimlar_rows.csv) doğal sıraya
    göre listeleniyor (Soru Tanımlama ekranındaki Konu seçimi dahil).
    `curriculumSeedService`, `order` alanı olmayan önceden seed
    edilmiş kayıtları uygulama her açıldığında geriye dönük doldurur
    (ID'ler değişmediği için var olan Question/StudentScore
    referansları bozulmaz).

### Doğrulama

-   Tarayıcıda test edildi: öğrenci listesi okul numarasına göre
    sıralı; sınıf arama kutusu eşleşmeyen aramada "Aramanızla eşleşen
    sınıf bulunamadı" mesajı gösterdi; daha önce pasifleştirilmiş
    "ASAL ERAMI" öğrencisi "Pasif öğrencileri göster" açıkken listede
    görüldü, "Aktifleştir" ile tekrar aktif listeye (okul numarası
    sırasına uygun konumda) döndü; Matematik 7. sınıf konu listesi
    artık "Sayılar ve Nicelikler → Cebirsel Düşünme ve Değişimler →
    Geometrik Şekiller → ... → Veriden Olasılığa" şeklinde doğru
    müfredat sırasında görüntülendi (önceden rastgele sıradaydı).
-   `npx tsc -b`, `npx vitest run` (45 test), `npm run lint`,
    `npm run build`, `npx playwright test` tamamı yeşil.

------------------------------------------------------------------------

# v0.10.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Dashboard eklendi (FR-001, AC-001) — 11_ROADMAP.md'deki V1.0 MVP modül
listesindeki son eksik parça.

### Added

-   "Dashboard" ekranı (`/`, uygulama açılış adresi): "Son Kullanılan
    Sınıflar", "Son Analizler" ve tek tıklamayla "Yeni Yazılı"
    kısayolu.
-   `src/utils/recentClasses.ts`: veri modelinde bir "son erişim"
    alanı olmadığı için, sınıf ziyaretleri `localStorage`'da
    (en fazla 10 kayıt) izlenir. Bir sınıfın Öğrenci Listesi ekranı
    her açıldığında kayıt güncellenir/başa alınır.
-   "Son Analizler": mevcut `Exam` kayıtları `examDate`'e göre azalan
    sırada listelenir (ayrı bir "görüntülenme" takibi eklenmedi);
    her satırdan doğrudan ilgili yazılının Analiz sayfasına gidilir.
-   "Yeni Yazılı" kısayolu, Yazılılar ekranına `?yeni=1` parametresiyle
    yönlendirip oluşturma dialogunu otomatik açar; dialog
    kapatıldığında parametre URL'den temizlenir.
-   Sol menüye "Dashboard" eklendi; sayfa başlığı eşlemesi "/" için
    özel olarak ele alınacak şekilde düzeltildi (aksi halde her rota
    "/" ile başladığından her zaman "Dashboard" görünürdü).
-   Unit testler: `recentClasses` — ziyaret kaydı, tekrar ziyarette
    kopya oluşturmadan başa alma, limit uygulama.

### Doğrulama

-   Tarayıcıda test edildi: Dashboard'da hiç sınıf ziyaret edilmeden
    "Henüz ziyaret edilen bir sınıf yok." mesajı gösterildi; bir
    sınıfın öğrenci listesi açıldıktan sonra Dashboard'a dönüldüğünde
    o sınıf "Son Kullanılan Sınıflar"da doğru bilgilerle (isim,
    seviye, öğretim yılı) göründü. "Yeni Yazılı" butonuna tıklanınca
    Yazılılar ekranına geçilip oluşturma dialogu otomatik açıldı;
    "Vazgeç" ile kapatılınca URL'deki `?yeni=1` parametresi temizlendi.
-   `npx tsc -b`, `npx vitest run` (40 test), `npm run lint`,
    `npm run build`, `npx playwright test` tamamı yeşil.

------------------------------------------------------------------------

# v0.9.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

PDF Raporları eklendi (FR-010, AC-009).

### Added

-   `@react-pdf/renderer` ve `@expo-google-fonts/noto-sans` kuruldu.
    Varsayılan Helvetica fontu Türkçe karakterleri (ğ, ş, ı, İ, ö, ü, ç)
    render edemediği için Noto Sans TTF olarak `Font.register` ile
    kaydedildi.
-   `analysisService`: `calculateStudentDetails` ile öğrenci bazlı
    konu/kazanım kırılımı, güçlü/zayıf yönler eklendi (Analiz Motoru
    diliminde eksik kalan bir parça). `RISK_HEX_COLOR` sabiti
    grafik/PDF renklerinde tekrar kullanılmak üzere dışa aktarıldı.
-   `chartImageService`: Chart.js grafiklerini DOM dışı bir `<canvas>`
    üzerinde PNG'ye çevirip PDF içine gömülebilir hale getirir.
-   "Raporlar" ekranı (`/yazililar/:examId/raporlar`): Sınıf Raporu ve
    Öğrenci Raporu (öğrenci başına ayrı sayfa) arasında geçiş, canlı
    önizleme (`PDFViewer`) ve indirme (`PDFDownloadLink`). Sınıf
    Raporu; sınıf özeti, soru/konu/kazanım analizi ve (varsa) Telafi
    Planı'nı içerir. Rapor üretimi `reportService` ile loglanır.
-   Telafi Planlama ekranına "Raporlara Geç" butonu eklendi.

### Fixed

-   **react-pdf/textkit glyph kaybı (patches/@react-pdf+textkit+6.3.0.patch)**:
    Tarayıcıda üretilen PDF'lerde bazı kelimelerin ilk karakteri
    (örn. "Toplam" → "oplam") rastgele kayboluyordu. Kök neden,
    react-pdf'in üstündeki `@react-pdf/textkit` paketinin, fontkit'in
    bir glyph'i önce ID ile (cache'ten) sonra `layout()` ile boş
    `codePoints` ile döndürdüğü durumlarda kaynak karakteri kaybetmesi
    (yukarı akış: [react-pdf#3404](https://github.com/diegomura/react-pdf/issues/3404),
    henüz üst akışta düzeltilmedi). `patch-package` ile eksik
    `codePoints` orijinal metinden geri kazanılacak şekilde yamalandı;
    `postinstall` script'i her `npm install` sonrası otomatik uygular.
-   Font dosyası tarayıcıda asenkron indirildiği için, render
    tetiklenmeden önce `Font.load()` ile yüklemenin tamamlanması
    beklenir (`ensureFontsLoaded`).

### Doğrulama

-   Tarayıcıda gerçek 27 öğrencilik veriyle test edildi: hem Sınıf hem
    Öğrenci Raporu indirilip PDF metin katmanı programatik olarak
    (pdfjs-dist ile) incelendi; Türkçe karakterler (ı, ş, ğ, ü, ö, ç,
    İ) ve önceden bozuk çıkan "Toplam Puan" gibi ifadeler 27 sayfanın
    tamamında doğru render edildiği doğrulandı. Telafi Planı verisi
    (kazanım, yöntem, tarih, not) Sınıf Raporu'na doğru yansıdı.
-   `npx vitest run`, `npm run lint`, `npm run build`, `npx playwright
    test` tamamı yeşil.

------------------------------------------------------------------------

# v0.8.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Telafi Planlama eklendi (FR-009, AC-008).

### Added

-   `interventionService`: 04_ANALYSIS_ENGINE.md Bölüm 5'teki eşiklere
    göre öneri üretimi (1 → Bireysel Destek, 2-4 → Küçük Grup, 5-10 →
    Telafi Grubu, 10+ → Sınıf Tekrar Dersi). Öneri yalnızca
    rehberdir; öğretmen dört seçenekten istediğini seçip
    kaydedebilir.
-   "Telafi Planlama" ekranı (`/yazililar/:examId/telafi`): yalnızca
    başarısız öğrenci sayısı > 0 olan kazanımlar listelenir; her satır
    sistem önerisiyle önceden doldurulur, öğretmen değiştirip tarih/not
    ekleyip kaydedebilir. Telafi gerektiren kazanım yoksa bilgilendirme
    mesajı gösterilir.
-   Aynı kazanım için tekrar kayıt güncelleme yapar, kopya oluşturmaz.
-   Analiz ekranına "Telafi Planlamasına Geç" butonu eklendi.
-   Unit testler: öneri eşikleri, kayıt/güncelleme davranışı.

### Doğrulama

-   Tarayıcıda gerçek veriyle test edildi: başarısız öğrenci sayısı 0
    olan kazanımlar için "telafi gerektiren kazanım yok" mesajı doğru
    gösterildi; 3 başarısız öğrencili bir senaryoda sistem "Küçük
    Grup" önerdi, öğretmen "Telafi Grubu" olarak değiştirip not
    ekledi, kayıt sayfa yenilendikten sonra da korundu.
-   Bu test sırasında, daha önce pasifleştirilmiş bir öğrencinin
    (ASAL ERAMI) düşük puanının kazanım analizine hiç dahil
    edilmediği doğrulandı — pasif öğrenciler analiz ve telafi
    hesaplamalarının tamamen dışında tutuluyor, beklenen davranış.

------------------------------------------------------------------------

# v0.7.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Analiz Motoru eklendi (FR-008, AC-007).

### Added

-   `analysisService`: Sınıf, Öğrenci, Soru, Konu ve Kazanım analizleri
    saf (pure) fonksiyonlar olarak yazıldı; risk seviyesi bantları
    04_ANALYSIS_ENGINE.md Bölüm 4'teki eşiklerle (%85/%70/%50) birebir.
    Henüz puanlanmamış hücreler ortalamalara 0 olarak değil, hiç dahil
    edilmeden işlenir; eksiklik ayrı sayaçlarla (Konu: eksik öğrenci
    sayısı, Öğrenci: "(eksik)" etiketi) raporlanır.
-   "Analiz" ekranı (`/yazililar/:examId/analiz`): Sınıf Özeti, Riskli
    Öğrenciler, Soru Analizi tablosu, Konu ve Kazanım analizleri
    (Chart.js bar grafik + destekleyici tablo, "grafikler sayısal
    tablolarla desteklenmeli" ilkesine uygun). Risk seviyesi hem renk
    hem metin etiketiyle gösterilir (yalnızca renge dayanmama kuralı).
-   `chart.js` + `react-chartjs-2` kuruldu (05_TECHNICAL_ARCHITECTURE.md'de
    zaten kararlaştırılmıştı).
-   Puan Girişi ekranına "Analizi Görüntüle" butonu eklendi.
-   Unit testler: risk bantları, öğrenci/sınıf/soru/konu/kazanım
    hesaplamaları küçük bir örnek veri setiyle doğrulandı.

### Tasarım Notu

-   Hiç puanlanmamış (sıfır soru girilmiş) öğrenciler "riskli" olarak
    listelenmez — henüz değerlendirilmediler, bu risk değil eksik veri
    anlamına gelir. En az bir puanı girilip toplamı düşük olan
    öğrenciler "(eksik)" etiketiyle birlikte listelenir.
-   Kazanım analizinde "başarısız öğrenci" eşiği %50 olarak alındı
    (risk bantlarındaki "Kritik" sınırıyla tutarlı); dokümanda ayrı bir
    sayısal eşik verilmediği için bu proje içi bir yorumdur.

### Doğrulama

-   Tarayıcıda gerçek 27 öğrencilik sınıf verisiyle test edildi:
    farklı risk seviyelerinde (Kritik/Geliştirilmeli/İyi/Çok İyi)
    öğrenciler doğru sınıflandırıldı, hiç puanlanmamış öğrenciler
    riskli listede görünmedi, grafikler ve tablolar tutarlı sonuç
    verdi.

------------------------------------------------------------------------

# v0.6.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Puan Girişi eklendi (FR-007, AC-006).

### Added

-   `studentScoreRepository`/`scoreService`: puan kaydı. Puan negatif
    olamaz, soru puanını aşamaz; öğrenci-soru başına tek kayıt
    (upsert).
-   "Puan Girişi" ekranı (`/yazililar/:examId/puanlar`): Excel benzeri
    hücresel tablo (öğrenci × soru). Enter/Ok Aşağı-Yukarı ile satırlar
    arası gezinme, Tab ile doğal soldan sağa geçiş. Hücreden
    ayrılınca (blur) otomatik kayıt — ayrı bir "Kaydet" butonu yok.
    Geçersiz puan girildiğinde kaydedilmeden uyarı gösterilir, hücre
    düzeltilene kadar değişmeden kalır.
-   Satır bazlı otomatik toplam; tüm sorular doldurulmadan "eksik"
    etiketiyle turuncu, tamamlanınca yeşil gösterilir.
-   Soru Tanımlama ekranındaki "Puan Girişine Geç" butonu yalnızca
    toplam puan 100 olduğunda aktif olur.
-   Unit testler: puan doğrulama kuralları, aynı öğrenci-soru için
    güncelleme (kopya oluşturmama), sınava ait olmayan soruların
    puanlarının getirilmemesi.

### Doğrulama

-   Tarayıcıda uçtan uca test edildi: hücreye puan girme, Enter ile
    aşağı satıra geçme, soru puanını aşan değerin reddedilip
    kaydedilmemesi (sayfa yenilendikten sonra da doğrulandı), tüm
    sorular doldurulunca satır toplamının "eksik" etiketinden çıkıp
    yeşile dönmesi.

------------------------------------------------------------------------

# v0.5.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Yazılı Oluşturma ve Soru Tanımlama eklendi (FR-005/006, AC-004/005).

### Added

-   `examService`/`examRepository`: Yazılı oluşturma. Aynı sınıfta aynı
    isimli yazılı **engellenmez**, yalnızca onay istenir (bkz.
    02_SYSTEM_REQUIREMENTS.md Doğrulama Kuralları — Sınıf'taki sert
    engelden farklı olarak burada kural bilinçli olarak bir uyarıdır).
-   `questionService`/`questionRepository`: Soru tanımlama. Aynı
    sınavda soru numarası tekrar edemez, puan sıfır/negatif olamaz.
-   01_DATA_MODEL.md: Exam entity'sine FR-005'te belirtilip veri
    modelinde unutulmuş olan `description` (Açıklama) alanı eklendi.
-   "Yazılılar" ekranı (liste + oluştur) ve "Soru Tanımlama" ekranı
    (Konu/Kazanım seçimi müfredat verisinden, sınavın ders+sınıf
    seviyesine göre filtreli; toplam puan göstergesi 100'e ulaşana
    kadar turuncu, ulaşınca yeşil).
-   Sol menüye "Yazılılar" eklendi.
-   Unit testler: yazılı oluşturma, aynı isim uyarısının engellemediği,
    soru numarası tekilliği, puan doğrulaması, toplam puan hesaplama.

### Doğrulama

-   Tarayıcıda uçtan uca test edildi: yazılı oluştur → soru ekle →
    aynı soru numarasıyla tekrar deneme reddedildi → toplam 100
    olunca gösterge yeşile döndü → soru silindiğinde gösterge tekrar
    turuncuya döndü → aynı isimde ikinci yazılı oluşturma denemesi
    onay istedi ve onaylanınca oluşturuldu (engellenmedi).

------------------------------------------------------------------------

# v0.4.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Öğrenci Excel/CSV içe aktarımı eklendi (US-001, AC-003).

### Added

-   `xlsx` (SheetJS) bağımlılığı eklendi (.xls/.xlsx okumak için;
    yalnızca öğretmenin kendi yüklediği dosyalar işlendiği için npm
    paketindeki bilinen güvenlik uyarısı düşük risk olarak kabul edildi).
-   `studentImportService`: .xls/.xlsx/.csv dosyalarını ayrıştırır.
    Başlık satırı "Öğrenci No"/"Adı"/"Soyadı" sütun adlarına göre
    bulunur (pozisyona değil metne dayalı, farklı rapor biçimlerine
    dayanıklı). Öğrenci No sayısal olmayan ilk satırda durur (özet/
    altbilgi satırlarını otomatik atlar). "Cinsiyeti" sütunu okunur
    ama saklanmaz (veri modelinde yok).
-   Öğrenci Yönetimi ekranına "Excel / CSV İçe Aktar" butonu ve
    önizleme/onay dialogu: ayrıştırma hataları ve içe aktarım sırasında
    oluşan iş kuralı hataları (ör. tekrar eden okul no) satır satır
    raporlanır; başarılı kayıt sayısı gösterilir.
-   Gerçek okul raporu örneğiyle (`docs/classroom/IOG02005_76.XLS`)
    doğrulandı: 28 öğrencinin tamamı doğru okunup içe aktarıldı.

### Doğrulama

-   Unit testler: gerçek örnek dosyadan 28 satırın doğru okunduğu,
    özet satırının öğrenci sayılmadığı, tekrar eden okul numarasının
    ve eksik ad/soyadın hata olarak işaretlendiği doğrulandı.
-   Tarayıcıda gerçek dosyayla iki kez içe aktarım denendi: ilkinde
    28 öğrenci eklendi, ikincisinde 28 satırın tamamı "okul numarası
    bu sınıfta zaten kayıtlı" hatasıyla reddedildi (kopya oluşmadı).

### Bilinen Sorunlar

-   Yalnızca tek sınıflık dosya formatı destekleniyor; birden fazla
    sınıfı bir arada içeren "toplu" format örneği henüz yok, V1
    kapsamına dahil değil.

------------------------------------------------------------------------

# v0.3.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Müfredat verisi `docs/kazanimlar_rows.csv`'den beslenecek şekilde
uygulamaya bağlandı (bkz. 01_DATA_MODEL.md Bölüm 7).

### Added

-   `scripts/convert-curriculum-csv.mjs`: kaynak CSV'yi ders/sınıf
    bazında JSON seed dosyalarına dönüştürür (İnkılâp Tarihi hariç,
    "İlköğretim Matematik" → "Matematik" eşlemesiyle). Yeni kaynak veri
    (Din Kültürü, İngilizce 8. sınıf) geldiğinde yeniden çalıştırılabilir.
-   `src/database/seeds/curriculum/*.json`: 18 seed dosyası (5 ders ×
    ilgili sınıf seviyeleri).
-   Subject/Topic/CurriculumOutcome için Repository katmanı.
-   `curriculumSeedService`: seed dosyalarını idempotent şekilde
    veritabanına yükler; uygulama her açıldığında çalışır, kazanım
    kodu zaten varsa tekrar oluşturmaz.
-   Unit testler: seed'in veri oluşturduğu, iki kez çalıştırıldığında
    kopya oluşturmadığı, İnkılâp Tarihi'nin içe aktarılmadığı doğrulandı.

### Doğrulama

-   Tarayıcıda IndexedDB doğrudan sorgulanarak teyit edildi: 5 ders,
    163 konu, 1310 kazanım (1349 kaynak satır − 39 İnkılâp Tarihi satırı).
-   Sayfa yenilendiğinde kayıt sayılarının değişmediği (idempotency)
    doğrulandı.

### Bilinen Sorunlar

-   Din Kültürü ve Ahlak Bilgisi, İngilizce 8. sınıf verisi hâlâ
    eksik (bkz. v0.1.2).
-   Müfredatı görüntüleyen bir ekran henüz yok; veri yalnızca
    veritabanında mevcut (Müfredat modülü sonraki bir adımda
    geliştirilecek).

------------------------------------------------------------------------

# v0.2.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

İlk çalışan geliştirme dilimi tamamlandı: proje iskeleti ve manuel
Sınıf/Öğrenci Yönetimi uçtan uca çalışır durumda (Excel/CSV aktarımı
hariç, bkz. 11_ROADMAP.md sonraki adımlar).

### Added

-   Vite + React + TypeScript proje iskeleti; Dexie, Zustand,
    react-router-dom, MUI, Vitest, React Testing Library, Playwright
    bağımlılıkları kuruldu.
-   05_TECHNICAL_ARCHITECTURE.md'deki klasör yapısı uygulandı
    (app, features, components, hooks, services, repositories,
    database, types, utils).
-   Dexie şeması (`src/database/db.ts`) 01_DATA_MODEL.md'deki tüm 11
    varlık için tanımlandı (version 1).
-   Teacher/Class/Student için Repository ve Service katmanları,
    iş kurallarıyla birlikte (aynı isimde ikinci aktif sınıf
    oluşturulamaz, sınıf içinde tekil okul no, vb.).
-   Uygulama kabuğu (sol menü + üst çubuk), 03_UI_UX_GUIDELINES.md
    renk sistemi ile MUI teması.
-   Ayarlar (Öğretmen Profili), Sınıf Yönetimi, Öğrenci Yönetimi
    (manuel CRUD) özellikleri.
-   Unit testler (classService, studentService) ve altın yol için
    Playwright e2e testi.

### Changed

-   05_TECHNICAL_ARCHITECTURE.md ve 06_CODING_STANDARDS.md: Vite
    scaffold'unun getirdiği Oxlint kullanılacak şekilde güncellendi
    (önceki "ESLint" referansı yerine).

### Bilinen Sorunlar

-   Excel/CSV öğrenci aktarımı (US-001, AC-003) bu dilime dahil değil.
-   Kod bundle boyutu 500kB uyarı eşiğinin üzerinde; code-splitting
    ileride ele alınacak (05_TECHNICAL_ARCHITECTURE.md §9).

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
