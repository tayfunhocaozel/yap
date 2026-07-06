-- YAP — Faz 1: İlk şema + Row Level Security
--
-- Bu dosya Supabase Dashboard > SQL Editor'da elle çalıştırılır
-- (service_role/CLI erişimi olmadığı için otomatik uygulanmaz).
--
-- Notlar:
-- * id'ler client tarafında (crypto.randomUUID() / deterministicUuid) üretilir,
--   bu yüzden `default gen_random_uuid()` KULLANILMAZ.
-- * created_at/updated_at/deleted_at, per-teacher tablolarda Faz 2+'de
--   kurulacak senkron motoru için hazırlıktır; bu fazda henüz kullanılmaz.
-- * teacher_id, yalnızca classes tablosunda tutulur; alt tablolarda (students,
--   exams, questions, student_scores, interventions, reports) RLS, FK
--   zincirini "classes.teacher_id = auth.uid()" koşuluna kadar EXISTS alt
--   sorgusuyla izler — denormalize teacher_id kolonu eklenmez.
-- * subjects/topics/curriculum_outcomes paylaşılan referans veridir:
--   herkes okuyabilir, İSTEMCİDEN kimse yazamaz (yalnızca bu dosyadaki
--   gibi dashboard SQL Editor / service-role ile doldurulur, bkz. Faz 4).

-- 1) teachers — id, Supabase Auth kullanıcısıyla birebir aynı (auth.uid())
create table if not exists teachers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  branch text not null,
  school_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table teachers enable row level security;

create policy teachers_select_own on teachers
  for select using (id = auth.uid());
create policy teachers_insert_own on teachers
  for insert with check (id = auth.uid());
create policy teachers_update_own on teachers
  for update using (id = auth.uid()) with check (id = auth.uid());

-- 2) classes
create table if not exists classes (
  id uuid primary key,
  teacher_id uuid not null references teachers (id) on delete cascade,
  name text not null,
  grade smallint not null,
  academic_year text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists classes_teacher_id_idx on classes (teacher_id);

alter table classes enable row level security;

create policy classes_owner on classes
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- 3) students — teacher_id yok, class_id üzerinden erişim
create table if not exists students (
  id uuid primary key,
  school_number text not null,
  full_name text not null,
  class_id uuid not null references classes (id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists students_class_id_idx on students (class_id);

alter table students enable row level security;

create policy students_owner on students
  for all
  using (exists (select 1 from classes c where c.id = students.class_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from classes c where c.id = students.class_id and c.teacher_id = auth.uid()));

-- 4) subjects — paylaşılan referans verisi
create table if not exists subjects (
  id uuid primary key,
  name text not null unique
);

alter table subjects enable row level security;

create policy subjects_read_all on subjects
  for select using (true);

-- 5) topics — paylaşılan referans verisi
create table if not exists topics (
  id uuid primary key,
  subject_id uuid not null references subjects (id) on delete cascade,
  grade smallint not null,
  name text not null,
  unit text,
  "order" integer not null
);

create index if not exists topics_subject_grade_idx on topics (subject_id, grade);

alter table topics enable row level security;

create policy topics_read_all on topics
  for select using (true);

-- 6) curriculum_outcomes — paylaşılan referans verisi
create table if not exists curriculum_outcomes (
  id uuid primary key,
  topic_id uuid not null references topics (id) on delete cascade,
  code text not null unique,
  description text not null
);

create index if not exists curriculum_outcomes_topic_id_idx on curriculum_outcomes (topic_id);

alter table curriculum_outcomes enable row level security;

create policy curriculum_outcomes_read_all on curriculum_outcomes
  for select using (true);

-- 7) exams
create table if not exists exams (
  id uuid primary key,
  class_id uuid not null references classes (id) on delete cascade,
  subject_id uuid not null references subjects (id),
  title text not null,
  exam_date date not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists exams_class_id_idx on exams (class_id);

alter table exams enable row level security;

create policy exams_owner on exams
  for all
  using (exists (select 1 from classes c where c.id = exams.class_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from classes c where c.id = exams.class_id and c.teacher_id = auth.uid()));

-- 8) questions
create table if not exists questions (
  id uuid primary key,
  exam_id uuid not null references exams (id) on delete cascade,
  question_no integer not null,
  score numeric not null,
  topic_id uuid not null references topics (id),
  outcome_id uuid not null references curriculum_outcomes (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists questions_exam_id_idx on questions (exam_id);

alter table questions enable row level security;

create policy questions_owner on questions
  for all
  using (exists (
    select 1 from exams e join classes c on c.id = e.class_id
    where e.id = questions.exam_id and c.teacher_id = auth.uid()
  ))
  with check (exists (
    select 1 from exams e join classes c on c.id = e.class_id
    where e.id = questions.exam_id and c.teacher_id = auth.uid()
  ));

-- 9) student_scores
create table if not exists student_scores (
  id uuid primary key,
  student_id uuid not null references students (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  earned_score numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists student_scores_question_id_idx on student_scores (question_id);
create index if not exists student_scores_student_id_idx on student_scores (student_id);

alter table student_scores enable row level security;

create policy student_scores_owner on student_scores
  for all
  using (exists (
    select 1 from questions q
    join exams e on e.id = q.exam_id
    join classes c on c.id = e.class_id
    where q.id = student_scores.question_id and c.teacher_id = auth.uid()
  ))
  with check (exists (
    select 1 from questions q
    join exams e on e.id = q.exam_id
    join classes c on c.id = e.class_id
    where q.id = student_scores.question_id and c.teacher_id = auth.uid()
  ));

-- 10) interventions
create table if not exists interventions (
  id uuid primary key,
  exam_id uuid not null references exams (id) on delete cascade,
  outcome_id uuid not null references curriculum_outcomes (id),
  type text not null,
  target_type text not null,
  notes text,
  intervention_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists interventions_exam_id_idx on interventions (exam_id);

alter table interventions enable row level security;

create policy interventions_owner on interventions
  for all
  using (exists (
    select 1 from exams e join classes c on c.id = e.class_id
    where e.id = interventions.exam_id and c.teacher_id = auth.uid()
  ))
  with check (exists (
    select 1 from exams e join classes c on c.id = e.class_id
    where e.id = interventions.exam_id and c.teacher_id = auth.uid()
  ));

-- 11) reports
-- Not: entity'deki `createdAt` (iş anlamı: rapor üretim zamanı) ile sync
-- amaçlı `created_at`in çakışmaması için iş alanı `generated_at` olarak
-- adlandırıldı.
create table if not exists reports (
  id uuid primary key,
  exam_id uuid not null references exams (id) on delete cascade,
  report_type text not null,
  generated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists reports_exam_id_idx on reports (exam_id);

alter table reports enable row level security;

create policy reports_owner on reports
  for all
  using (exists (
    select 1 from exams e join classes c on c.id = e.class_id
    where e.id = reports.exam_id and c.teacher_id = auth.uid()
  ))
  with check (exists (
    select 1 from exams e join classes c on c.id = e.class_id
    where e.id = reports.exam_id and c.teacher_id = auth.uid()
  ));
