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

# v0.16.0

## Yayın Tarihi

2026-07-08

## Durum

Draft

## Açıklama

Supabase geçişinin **Faz 2**'si tamamlandı: yalnızca `Teacher` ve
`SchoolClass` için uçtan uca offline-first senkron (POC). Kalan 9
entity'ye aynı pattern'in uygulanması Faz 3'ün konusu.

### Added

-   `src/sync/` yeni klasör: `caseConverter.ts` (camelCase↔snake_case),
    `createSyncedTable.ts` (add/update'i hem Dexie tablosuna hem
    `outbox` push kuyruğuna aynı transaction'da yazan factory),
    `networkStatus.ts` (`isReachable`, gerçek bir Supabase isteğiyle
    bağlantı testi — `navigator.onLine` güvenilmez olduğu için),
    `pushOutbox.ts` (outbox'u `localId` ekleme sırasına göre boşaltır;
    FK sırası bozulmasın diye ilk hatada durur), `pullTable.ts`
    (`syncMeta.lastPulledAt` cursor'lı delta pull; outbox'ta bekleyen
    bir yerel değişiklik varsa o satırı atlayarak ezilmesini önler),
    `syncEngine.ts` (`kickSync`: 500ms debounce + reentrancy guard;
    `startPeriodicSync`: oturum açılışında + 2 dakikada bir + `online`
    event'inde tetiklenir).
-   `src/database/db.ts`: `outbox`/`syncMeta` Dexie tabloları
    (`version(2)`). Bu sürüme özel bir `.upgrade()` adımı, Faz 1'den
    kalma (bu sürümden önce oluşturulmuş) `Teacher`/`SchoolClass`
    kayıtlarına `updatedAt` damgalar ve her biri için bir "ilk senkron"
    outbox kaydı oluşturur — aksi halde zaten var olan kullanıcı
    verisi hiçbir zaman Supabase'e gönderilmezdi.
-   `src/types/entities.ts`: `Teacher`/`SchoolClass`'a `updatedAt: string`
    eklendi.
-   `src/repositories/teacherRepository.ts` / `classRepository.ts`:
    `add`/`update` artık `createSyncedTable`'a devrediliyor; okuma
    metotları değişmedi.
-   `src/app/AuthProvider.tsx`: oturum açıldığında `startPeriodicSync()`
    çağrılıyor.
-   `src/test-utils/supabaseMock.ts` + `src/test-setup.ts`: **kritik**
    global `vi.mock('./lib/supabaseClient', ...)` — bunsuz testler
    gerçek `.env` kimlik bilgileriyle prod Supabase'e ağ isteği atmaya
    çalışırdı (mevcut `classService.test.ts` dahil, her `add`/`update`
    çağrısı `kickSync` tetiklediği için).

### Bilinçli sınırlar (Faz 2 kapsamında değil)

-   Push düz `upsert` kullanır — DB seviyesinde atomik last-write-wins
    (Postgres RPC ile koşullu upsert) garantisi yok, Faz 5'e bırakıldı.
-   `outbox`'a `delete` operasyonu eklenmedi (Teacher/SchoolClass hard
    delete kullanmıyor).
-   Kullanıcıya görünür bir senkron durumu göstergesi yok (Faz 5).
-   **Ben (Claude) gerçek bir Supabase oturumu açıp gerçek cihazlar
    arası senkronu uçtan uca test edemedim** (kimlik bilgisi girmek
    benim için yasak bir eylem) — bu doğrulama kullanıcı tarafından
    yapılacak.

### Doğrulama

-   `npx tsc -b`, `npx vitest run` (74 test — 20 yeni sync testi
    dahil, `vi.useFakeTimers`/`vi.mocked` ile debounce ve outbox
    davranışları test edildi), `npm run lint`, `npm run build`,
    `npx playwright test` (2 test, route guard regresyonu yok) tamamı
    yeşil.
-   `classService.test.ts` gibi mevcut testlerin mock sayesinde hâlâ
    hızlı (< 50ms) çalıştığı doğrulandı — gerçek ağa çıkmadıklarının
    kanıtı.

### Sonraki Adım

-   Kullanıcının gerçek cihazlar arası senkronu doğrulaması gerekiyor
    (adımlar ayrıca iletildi): var olan verinin ilk kez Supabase'e
    gönderilmesi, ikinci bir cihazda görünmesi, offline değişiklik →
    online olunca senkron.
-   Onay sonrası Faz 3 (kalan entity'ler) başka bir oturumda ele
    alınacak.

------------------------------------------------------------------------

# v0.15.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Supabase'e kademeli offline-first senkron geçişinin **Faz 0 ve Faz 1'i**
tamamlandı: referans veri id kararlılığı düzeltmesi + Supabase Auth
(e-posta+şifre). Bu, çok daha büyük bir yol haritasının (7 faz) ilk
iki adımı — sync motorunun kendisi (outbox, push/pull, çakışma
çözümü) henüz yok, sonraki oturumlarda ayrı ayrı ele alınacak (bkz.
05_TECHNICAL_ARCHITECTURE.md Bölüm 8.2).

### Added — Faz 0 (referans veri id kararlılığı)

-   `src/utils/deterministicId.ts`: RFC 4122 UUID v5 (SHA-1, Web
    Crypto `SubtleCrypto.digest`) — aynı doğal anahtar (isim/kod) her
    zaman aynı id'yi üretir.
-   `curriculumSeedService.ts`: Subject/Topic/CurriculumOutcome id'leri
    artık `crypto.randomUUID()` yerine deterministik üretiliyor.
    Önceden rastgele id ile seed edilmiş kayıtlar otomatik olarak yeni
    id'ye geçiriliyor (re-key); buna referans veren
    `Question.topicId/outcomeId` ve `Intervention.outcomeId` alanları
    da güncelleniyor. `subjectRepository`/`topicRepository`/
    `curriculumOutcomeRepository`'ye bu geçiş için `delete`/`getAll`
    metotları eklendi.
-   Neden gerekli: bu referans veri ileride (Faz 4) Supabase'e paylaşılan/
    salt-okunur bir tablo olarak taşınacak; tüm istemcilerin (ve
    sunucunun) aynı id'leri üretmesi, `Question`/`Intervention`
    kayıtlarının FK bütünlüğü için şart.

### Added — Faz 1 (Supabase Auth)

-   `@supabase/supabase-js` kuruldu; `.env`/`.env.example`
    (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); `.env` gitignore'a
    eklendi.
-   `src/lib/supabaseClient.ts`, `src/app/authContext.ts` +
    `src/app/AuthProvider.tsx` (oturum durumu), `src/app/RequireAuth.tsx`
    (route guard), `src/features/auth/pages/LoginPage.tsx` ve
    `SignupPage.tsx` (e-posta+şifre).
-   `src/App.tsx`: `/giris` ve `/kayit` genel erişime açık; kalan tüm
    ekranlar `RequireAuth` ile korunuyor.
-   `src/app/AppShell.tsx`: üst çubukta öğretmenin e-postası ve "Çıkış
    Yap" butonu.
-   `teacherService`/`teacherRepository`: `getActive()` (tek cihazda
    tek "aktif" kayıt varsayımı) yerine `getById(id)`/
    `createOrUpdate(id, input)` — `id` artık `auth.uid()` ile birebir
    aynı. **Bu fazda veri hâlâ %100 yerel (IndexedDB) kalıyor**,
    Supabase tablolarına henüz yazma yok.
-   `supabase/migrations/0001_initial_schema.sql`: 11 tablo, RLS
    politikaları (per-teacher tablolar `classes.teacher_id = auth.uid()`
    zincirine `EXISTS` alt sorgusuyla bağlı; subjects/topics/
    curriculum_outcomes paylaşılan referans verisi, herkes okuyabilir,
    istemciden kimse yazamaz). service_role erişimi olmadığı için bu
    dosya CI'dan otomatik uygulanmaz, kullanıcı tarafından Supabase
    Dashboard → SQL Editor'a yapıştırılıp elle çalıştırılması gerekir.

### Changed

-   `e2e/golden-path.spec.ts`: auth eklenmesiyle sınıf/öğrenci
    oluşturma akışı artık gerçek bir Supabase oturumu gerektiriyor
    (henüz mock altyapısı yok, bkz. Faz 6). Test, route guard'ın
    (oturumsuz erişimde `/giris`'e yönlendirme) ve giriş↔kayıt
    ekranları arası geçişin doğruluğunu doğrulayan daha dar bir
    kapsama indirgendi; tam uçtan uca akış testi Faz 6'da geri
    gelecek.

### Doğrulama

-   `npx tsc -b`, `npx vitest run` (50 test — deterministik id + re-key
    testleri dahil), `npm run lint`, `npm run build` (hem yerel `/`
    hem `GITHUB_REPOSITORY` simülasyonuyla `/yap/` base path'i
    doğrulandı), `npx playwright test` (2 test) tamamı yeşil.
-   Manuel tarayıcı testi bu oturumda self-signed sertifika/CDP
    kısıtı nedeniyle yapılamadı; unit testler ve Playwright yeterli
    kanıt olarak kabul edildi.

### Sonraki Adım

-   Kullanıcının Supabase Dashboard'da `0001_initial_schema.sql`'i
    çalıştırması gerekiyor (adımlar ayrıca iletildi).
-   Faz 2 (POC: yalnızca Teacher+SchoolClass için uçtan uca sync —
    outbox, push/pull, last-write-wins) ayrı bir oturumda, onaylandıktan
    sonra kalan fazlara geçilecek.

------------------------------------------------------------------------

# v0.14.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

GitHub Pages üzerinde yayına almak (deploy) için altyapı hazırlandı.

### Changed

-   `BrowserRouter` → `HashRouter` (`src/App.tsx`). GitHub Pages statik
    dosya sunucusu olduğu ve server-side rewrite yapamadığı için,
    BrowserRouter ile bir alt sayfa doğrudan açılırsa/yenilenirse 404
    alınır. HashRouter ile routing tamamen istemci tarafında (`#/...`)
    kalır, bu sorunu ortadan kaldırır. URL'ler artık
    `.../#/siniflar` şeklinde görünür.
-   `vite.config.ts`: `base` yolu, GitHub Actions build'inde otomatik
    sağlanan `GITHUB_REPOSITORY` değişkeninden türetiliyor
    (`/repo-adı/`); yerel geliştirmede etkisi yok (`/` kalır). PWA
    manifest'indeki `start_url`/`scope` de aynı `base` değerini
    kullanacak şekilde düzeltildi (önceden `start_url` sabit `/`
    kalıyor, `scope` ile tutarsız oluyordu).
-   `e2e/golden-path.spec.ts`: `page.goto('/ayarlar')` →
    `page.goto('/#/ayarlar')`.

### Added

-   `.github/workflows/deploy.yml`: `master` branch'e her push'ta
    otomatik `npm ci && npm run build` çalıştırıp `dist/` klasörünü
    GitHub Pages'e deploy eden workflow.

### Doğrulama

-   `GITHUB_REPOSITORY` ortam değişkeni simüle edilerek build alındı;
    `dist/index.html` ve `dist/manifest.webmanifest`'te tüm asset
    yollarının, `start_url` ve `scope`'un doğru repo-adı önekiyle
    (`/YAP/...`) üretildiği; bu değişken olmadan (yerel build) hâlâ
    `/` kaldığı doğrulandı.
-   `npx tsc -b`, `npx vitest run` (45 test), `npm run lint`,
    `npm run build`, `npx playwright test` (HashRouter ile) tamamı
    yeşil.

### Sonraki Adım

-   Depo henüz GitHub'a bağlı değil (`git remote` yok). Kullanıcı bir
    GitHub deposu oluşturup bu depoyu push ettikten ve depo
    ayarlarından "Settings → Pages → Source: GitHub Actions"
    seçtikten sonra ilk deploy otomatik tetiklenecek.

------------------------------------------------------------------------

# v0.13.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

Geliştirme sunucusuna kalıcı HTTPS + LAN erişimi eklendi; gerçek bir
telefonda PWA yükleme ve offline-first akış uçtan uca doğrulandı.

### Added

-   `@vitejs/plugin-basic-ssl` kuruldu: `npm run dev` ve
    `npm run preview` artık self-signed sertifikayla HTTPS üzerinden
    sunuluyor. Chrome'un tam PWA "Yükle" davranışı (service worker +
    install banner) yalnızca güvenli bağlamda (HTTPS/localhost)
    çalıştığı için, aynı Wi-Fi ağındaki bir telefondan gerçek PWA
    testi yapabilmek adına kalıcı olarak eklenmesine karar verildi.
-   `vite.config.ts`: `server.host` / `preview.host: true` ile
    sunucular yalnızca localhost değil, yerel ağdaki diğer cihazlardan
    (`https://<bilgisayarın LAN IP'si>:5173`) da erişilebilir hale
    getirildi.
-   `playwright.config.ts`: testler artık `https://localhost:5173`
    adresini bekliyor (`ignoreHTTPSErrors: true` ile self-signed
    sertifika hatası görmezden geliniyor).

### Doğrulama

-   Gerçek bir telefonda (aynı Wi-Fi ağı, `https://<LAN IP>:4173`)
    self-signed sertifika uyarısı geçilip "Ana Ekrana Ekle" ile
    uygulama yüklendi. Yüklenen PWA üzerinden uçtan uca gerçek bir
    kullanım senaryosu denendi: öğretmen profili → sınıf → öğrenci →
    yazılı → puan girişi → PDF rapor — tamamı telefonda sorunsuz
    çalıştı.
-   `npx tsc -b`, `npx vitest run` (45 test), `npm run lint`,
    `npm run build`, `npx playwright test` (güncellenmiş HTTPS
    baseURL ile) tamamı yeşil.

------------------------------------------------------------------------

# v0.12.0

## Yayın Tarihi

2026-07-06

## Durum

Draft

## Açıklama

PWA (offline-first) altyapısı eklendi (05_TECHNICAL_ARCHITECTURE.md
Bölüm 8). Şimdiye kadar veriler zaten IndexedDB'de (internet
gerektirmeden) tutuluyordu, ama uygulamanın kendisi (HTML/JS/CSS/font)
gerçek bir "installable", tarayıcı kapansa/sunucuya erişilemese bile
açılabilen bir PWA değildi — bu sürümde bu eksik giderildi.

### Added

-   `vite-plugin-pwa` kuruldu (Workbox `generateSW` modu,
    `registerType: 'autoUpdate'`). Build çıktısı (JS/CSS/HTML/font)
    service worker tarafından önceden önbelleğe alınıyor.
-   `public/pwa-192x192.png`, `public/pwa-512x512.png`: mevcut
    favicon.svg'den üretilen PWA ikonları (192x192 ve 512x512, biri
    `maskable` amaçlı).
-   `manifest.webmanifest`: uygulama adı, tema rengi (#1565C0, MUI
    primary ile aynı), `display: standalone`, Türkçe `lang`.

### Doğrulama

-   `npm run build` sonrası `dist/sw.js` ve `dist/manifest.webmanifest`
    oluştuğu doğrulandı (precache: 13 dosya, ~4.2 MB).
-   `npm run preview` ile başlatılan sunucuya tarayıcıdan bağlanıldı,
    service worker'ın kayıtlı olduğu (`navigator.serviceWorker.
    getRegistrations()`) doğrulandı. Ardından **sunucu süreci
    tamamen sonlandırıldı** ve sayfa yeniden yüklendi: uygulama
    (Dashboard, sol menü, "Sınıflar" client-side route'u dahil)
    sunucu hiç çalışmıyorken sorunsuz açıldı — gerçek offline çalışma
    doğrulanmış oldu.
-   `npx tsc -b`, `npx vitest run` (45 test), `npm run lint`,
    `npm run build`, `npx playwright test` tamamı yeşil.

### Not

-   PWA/service worker davranışı yalnızca production build'de
    (`npm run build` + `npm run preview`) aktiftir; `npm run dev`
    sırasında service worker kaydedilmez (Vite dev sunucusu zaten
    anlık yeniden derleme yaptığı için bu beklenen bir kısıtlamadır).

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
