# 01_DATA_MODEL.md

# YAP - Yazılı Analiz Programı

## Data Model Document (v1.0)

------------------------------------------------------------------------

# 1. Amaç

Bu doküman YAP uygulamasında kullanılacak veri modelini tanımlar. Amaç;
uygulamanın uzun yıllar geliştirilebilecek sağlam bir veri altyapısına
sahip olmasıdır.

------------------------------------------------------------------------

# 2. Tasarım İlkeleri

-   Her veri yalnızca bir kez tutulur.
-   Tekrarlı veri oluşturulmaz.
-   Tüm ilişkiler benzersiz kimlik (UUID) ile kurulur.
-   Silme yerine pasif duruma alma tercih edilir.
-   Veri modeli gelecekte yeni özellikleri destekleyecek şekilde
    genişleyebilir.

------------------------------------------------------------------------

# 3. Ana Varlıklar

1.  Teacher (Öğretmen)
2.  Class (Sınıf)
3.  Student (Öğrenci)
4.  Subject (Ders)
5.  Topic (Konu)
6.  CurriculumOutcome (Kazanım)
7.  Exam (Yazılı)
8.  Question (Soru)
9.  StudentScore (Öğrenci Puanı)
10. Intervention (Telafi Çalışması)
11. Report (Rapor)

------------------------------------------------------------------------

# 4. Entity Açıklamaları

## Teacher

  Alan          Tip       Açıklama
  ------------- --------- ------------------------------
  id            UUID      Birincil anahtar
  fullName      Text      Öğretmen adı soyadı
  branch        Text      Branş (örn. Matematik)
  schoolName    Text      Opsiyonel
  active        Boolean   Kullanım durumu

V1'de cihaz üzerinde tek bir Teacher kaydı bulunur ve Ayarlar
ekranından oluşturulur/düzenlenir; oturum açma (login) gerektirmez.
Bu kayıt PDF raporlarının üst bilgisinde (öğretmen adı, branş, okul)
kullanılır.

Teacher entity'sinin şimdiden eklenmesinin nedeni, V3'te planlanan
çoklu öğretmen desteğine geçişte veri göçü (migration) ihtiyacını
azaltmaktır (bkz. 11_ROADMAP.md V3.0).

------------------------------------------------------------------------

## Class

  Alan           Tip       Açıklama
  -------------- --------- ------------------
  id             UUID      Birincil anahtar
  teacherId      UUID      Sahibi olan öğretmen
  name           Text      Örn. 7/A
  grade          Integer   5-8
  academicYear   Text      2026-2027
  active         Boolean   Kullanım durumu

V1'de tüm sınıflar cihazdaki tek Teacher kaydına bağlıdır.

------------------------------------------------------------------------

## Student

  Alan           Tip
  -------------- ---------
  id             UUID
  schoolNumber   Text
  fullName       Text
  classId        UUID
  active         Boolean

Her öğrenci yalnızca bir sınıfa bağlıdır.

------------------------------------------------------------------------

## Subject

  Alan   Tip
  ------ ------
  id     UUID
  name   Text

Örnek: - Matematik - Türkçe - Fen Bilimleri - Sosyal Bilgiler -
İngilizce - Din Kültürü

------------------------------------------------------------------------

## Topic

  Alan        Tip       Açıklama
  ----------- --------- --------------------------------
  id          UUID
  subjectId   UUID
  grade       Integer
  name        Text      Konu (örn. "Çarpanlar ve Katlar")
  unit        Text      Opsiyonel; ünite adı (örn. "Sayılar ve İşlemler")

Bir konu yalnızca bir derse bağlıdır.

`unit` alanı yalnızca görsel gruplama amaçlıdır (örn. müfredat
listesinde konuları ünite başlıkları altında göstermek için); analiz
motoru ve iş kuralları hâlâ Topic seviyesinde çalışır. Bazı derslerde
(örn. İngilizce) ünite ve konu aynı olduğu için bu alan boş
bırakılabilir.

------------------------------------------------------------------------

## CurriculumOutcome

  Alan          Tip
  ------------- ------
  id            UUID
  topicId       UUID
  code          Text
  description   Text

Örnek: M.7.2.1.1

------------------------------------------------------------------------

## Exam

  Alan          Tip     Açıklama
  ------------- ------- ----------
  id            UUID
  classId       UUID
  subjectId     UUID
  title         Text
  examDate      Date
  description   Text    Opsiyonel (FR-005)

`totalScore` ayrı bir alan olarak **saklanmaz**. Toplam puan her zaman
o yazılıya ait Question kayıtlarının `score` toplamından hesaplanır.
Bunun nedeni, sorular eklendiğinde/değiştiğinde saklanan bir alanın
senkron dışı kalma riskini ortadan kaldırmaktır. "Toplam puan = 100"
kuralı bir doğrulama kuralı olarak kalır (bkz. Bölüm 6).

------------------------------------------------------------------------

## Question

  Alan         Tip
  ------------ ---------
  id           UUID
  examId       UUID
  questionNo   Integer
  score        Number
  topicId      UUID
  outcomeId    UUID

Kurallar: - Her soru yalnızca bir konuya bağlıdır. - Her soru yalnızca
bir kazanıma bağlıdır. - Toplam soru puanı 100 olmalıdır.

------------------------------------------------------------------------

## StudentScore

  Alan          Tip
  ------------- --------
  id            UUID
  studentId     UUID
  questionId    UUID
  earnedScore   Number

Kurallar: - Öğrenci aynı soruya yalnızca bir puan alabilir. -
earnedScore soru puanını geçemez.

------------------------------------------------------------------------

## Intervention

  Alan               Tip
  ------------------ ----------------------------
  id                 UUID
  examId             UUID
  outcomeId          UUID
  type               Text
  targetType         Individual / Group / Class
  notes              Text
  interventionDate   Date

------------------------------------------------------------------------

## Report

  Alan         Tip
  ------------ ----------
  id           UUID
  examId       UUID
  reportType   Text
  createdAt    DateTime

------------------------------------------------------------------------

# 5. İlişkiler

Teacher └── Class └── Student

Subject └── Topic └── CurriculumOutcome

Exam └── Question └── StudentScore

Exam └── Intervention

Exam └── Report

------------------------------------------------------------------------

# 6. İş Kuralları

-   Her sınıf bir öğretmene aittir.
-   Her yazılı yalnızca bir sınıfa aittir.
-   Her yazılı yalnızca bir derse aittir.
-   Her yazılının sorularının puan toplamı 100 olmalıdır (doğrulama
    kuralı; ayrı bir alanda saklanmaz, bkz. Bölüm 4 - Exam).
-   Her sorunun puanı vardır.
-   Öğrenci puanları negatif olamaz.
-   Aynı öğrenci aynı sınav için tek kayıt oluşturur.

------------------------------------------------------------------------

# 7. Müfredat Verisinin Kaynağı ve İçe Aktarımı

Topic ve CurriculumOutcome kayıtları öğretmen tarafından uygulama
içinde **oluşturulmaz**. Bu veri, proje sahibi tarafından ders/sınıf
bazında JSON dosyaları olarak sağlanır ve derleme zamanında (build
time) statik seed verisi olarak uygulamaya dahil edilir.

## Dosya Konumu (öneri)

    src/database/seeds/curriculum/<ders>-<sinif>.json

Örnek: `src/database/seeds/curriculum/matematik-7.json`

## Beklenen JSON Şeması

``` json
{
  "subject": "Matematik",
  "grade": 7,
  "topics": [
    {
      "unit": "Sayılar ve İşlemler",
      "name": "Tam Sayılarla İşlemler",
      "outcomes": [
        { "code": "M.7.1.1.1", "description": "..." },
        { "code": "M.7.1.1.2", "description": "..." }
      ]
    }
  ]
}
```

`unit` alanı opsiyoneldir; ünite ile konu aynıysa (örn. İngilizce)
boş bırakılır.

## Kaynak Veri Durumu

Kaynak müfredat verisi olarak `docs/kazanimlar_rows.csv` (1349 satır,
gerçek MEB kazanım metinleri) kullanılacaktır. Bu dosyanın kapsamı ve
V1'e aktarımıyla ilgili kararlar:

-   **Din Kültürü ve Ahlak Bilgisi**: kaynak veride yok, ayrıca
    sağlanacak. Veri gelene kadar bu ders için müfredat boş kalır.
-   **İngilizce 8. sınıf**: kaynak veride yok, ayrıca sağlanacak.
-   **T.C. İnkılâp Tarihi ve Atatürkçülük** (8. sınıf): kaynak veride
    ayrı bir ders olarak mevcut ancak **V1 kapsamına dahil
    edilmeyecektir**; bu derse ait satırlar içe aktarım sırasında göz
    ardı edilir. 8. sınıf Sosyal Bilgiler analizleri bu nedenle V1'de
    desteklenmez.
-   **Ders adı eşlemesi**: kaynak veride "İlköğretim Matematik" olarak
    geçen ders, içe aktarım sırasında Subject.name = "Matematik"
    olarak eşlenir.
-   Kaynak veride `unite` ve `konu` sütunları eşitse (İngilizce,
    Türkçe, Sosyal Bilgiler) yalnızca `konu` → Topic.name olarak
    aktarılır, `unit` alanı boş bırakılır. Farklıysa (Matematik, kısmen
    Fen Bilimleri) `unite` → Topic.unit, `konu` → Topic.name olarak
    aktarılır.

## Yükleme Kuralları

-   Uygulama ilk açılışta veya yeni bir müfredat seed dosyası
    eklendiğinde bu dosyaları okuyup Topic ve CurriculumOutcome
    tablolarına yazar.
-   Aynı `code` değerine sahip bir CurriculumOutcome zaten varsa
    tekrar oluşturulmaz (idempotent yükleme).
-   Müfredat verisi kullanıcı arayüzünden düzenlenemez (V1). Güncelleme
    yalnızca yeni bir seed dosyası ile, yeni bir uygulama sürümü
    üzerinden yapılır.
-   Bu mekanizma, öğrenci/sınıf içe aktarımı için kullanılan
    öğretmen-tetiklemeli Excel/CSV aktarımından (bkz. FR-003) farklıdır;
    müfredat aktarımı geliştirici/derleme sürecine aittir, çalışma
    zamanında öğretmen tarafından tetiklenmez.

------------------------------------------------------------------------

# 8. Gelecekte Desteklenecek Yapılar

-   Aynı öğrencinin yıllık gelişimi
-   Müfredat sürümleri (MEB müfredat değişikliklerinin zaman içinde
    izlenmesi)
-   Ortak yazılılar
-   Çoklu şube analizi
-   Çoklu öğretmen (bkz. Teacher entity, Bölüm 4)
-   Bulut senkronizasyonu

------------------------------------------------------------------------

# 9. Sonraki Doküman

02_SYSTEM_REQUIREMENTS.md

Bu belgede ekranlar, kullanıcı akışları ve tüm fonksiyonel gereksinimler
ayrıntılı olarak tanımlanacaktır.
