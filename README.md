# Оқу орталығы | PostgreSQL + Sequelize + REST API

**Зертханалық жұмыс (онлайн)** · 1–2 сабақ · SQL, PostgreSQL, Node.js, ORM және API

Бұл оқу жобасы оқытушылар, студенттер, курстар және курсқа тіркелулерді сақтауға арналған. Пәндік аймақтың басты ерекшелігі: **бір оқытушыда бірнеше курс болады**, ал **бір студент бірнеше курсқа тіркеле алады**; әр тіркелуде күні мен 0–100 аралығындағы (немесе бос) бағасы бар.

> Жоба GitHub Codespaces және Neon PostgreSQL үшін жасалған. Жеке Neon паролін ешқашан GitHub-қа жүктемеңіз. Бұл репозиторий үлгісі өздігінен Neon базасын құрмайды және серверді автоматты іске қоспайды.

## 1. ER-диаграмма

```mermaid
erDiagram
    TEACHERS ||--o{ COURSES : "conducts"
    STUDENTS ||--o{ ENROLLMENTS : "registers"
    COURSES ||--o{ ENROLLMENTS : "contains"

    TEACHERS {
        int id PK
        varchar full_name "NOT NULL"
        varchar email UK "NOT NULL"
    }
    STUDENTS {
        int id PK
        varchar full_name "NOT NULL"
        varchar email UK "NOT NULL"
        varchar group_name "NOT NULL"
    }
    COURSES {
        int id PK
        varchar title "NOT NULL"
        text description
        int hours "CHECK > 0"
        int teacher_id FK
    }
    ENROLLMENTS {
        int student_id PK,FK
        int course_id PK,FK
        date enrolled_at "NOT NULL"
        smallint grade "NULL or 0..100"
    }
```

**Кардиналдық:** `teachers (1) → courses (N)`, `students (1) → enrollments (N)` және `courses (1) → enrollments (N)`. Осы екі соңғы байланыс `students ↔ courses` арасындағы **көптен-көпке (M:N)** қатынасты жүзеге асырады. `enrollments` құрамдас бастапқы кілті `(student_id, course_id)` студенттің бір курсқа екі рет жазылуына жол бермейді.

## 2. Кестелер мен шектеулер

| Кесте | Бастапқы кілт (PK) | Сыртқы кілт (FK) | Маңызды шектеулер |
|---|---|---|---|
| `teachers` | `id` | — | `full_name NOT NULL`, `email NOT NULL UNIQUE` |
| `students` | `id` | — | `full_name`, `group_name NOT NULL`, `email NOT NULL UNIQUE` |
| `courses` | `id` | `teacher_id → teachers.id` | `title NOT NULL`, `hours > 0`, оқытушы міндетті |
| `enrollments` | `(student_id, course_id)` | `student_id → students.id`, `course_id → courses.id` | `enrolled_at NOT NULL`, `grade NULL` немесе `0..100` |

**3ҚФ (үшінші қалыпты форма) түсіндірмесі.** Әр кестеде бірмәнді бастапқы кілт бар, ал бағандар атомарлы мәндерді сақтайды (1ҚФ). Курсқа тіркелудің күні мен бағасы құрама `(student_id, course_id)` кілтінің толық жұбына тәуелді, яғни жартылай тәуелділік жоқ (2ҚФ). Оқытушының аты мен email-і `courses` ішінде қайталанбай, жеке `teachers` кестесінде сақталады, сол арқылы транзитивті тәуелділік жойылады (3ҚФ). Студент пен курс арасындағы көптен-көпке байланыс жеке `enrollments` кестесі арқылы ұсынылып, деректердің қайталануын азайтады.

## 3. Репозиторий құрылымы

```text
lab-db/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── sql/
│   ├── schema.sql       # Кестелер, PK/FK/UNIQUE/CHECK
│   ├── seed.sql         # Әр кестеге 5 демонстрациялық жазба
│   └── queries.sql      # SQL тапсырмалары + бонус
├── src/
│   ├── db.js            # Sequelize модельдері мен байланыстар
│   ├── validation.js    # Қабылданатын деректерді тексеру
│   ├── test.js          # ORM CRUD транзакциялық сынағы
│   └── server.js        # Express REST API
├── tests/
│   └── validation.test.js
└── docs/
    └── API-test-examples.md
```

## 4. Онлайн іске қосу (телефон немесе компьютер)

**1. PostgreSQL (Neon).** [neon.com](https://neon.com) сайтына өтіп, тегін жоба жасаңыз; атауы `labdb` болсын. SQL Editor ішінде алдымен `sql/schema.sql`, одан кейін `sql/seed.sql` мазмұнын енгізіп, әрқайсысына **Run** басыңыз. `sql/queries.sql` мазмұнын орындағанда негізгі SQL сұранымдары, транзакциялар және `EXPLAIN ANALYZE` нәтижелері көрінеді. `schema.sql`-ді екінші рет іске қоссаңыз, барлық ескі дерек жойылады.

**2. GitHub.** [github.com/new](https://github.com/new) бетінде `lab-db` атты **Public** репозиторий ашыңыз. ZIP архивіндегі файлдарды репозиторийдің түбіріне салыңыз (архивтің өзін емес), `.env` файлын жүктемеңіз. **Code → Codespaces → Create codespace on main** мәзірін ашыңыз. Телефонда Chrome/Safari браузерінің «Desktop site» режимі ыңғайлырақ.

**3. Тәуелділіктер.** Codespaces терминалында:

```bash
npm install
```

**4. Құпия қосылу жолы.** Neon → **Connect** батырмасынан толық `postgresql://...` жолын алыңыз. Codespaces түбірінде `.env` жасаңыз:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
PORT=3000
```

`USER`, `PASSWORD`, `HOST` және база атауын өз Neon деректеріңізге ауыстырыңыз. `.env` файлды GitHub-та жариялауға болмайды; `.gitignore` арқылы қорғалған. Егер платформа жеке сертификатпен SSL берсе, сол провайдердің нұсқаулығын басшылыққа алыңыз.

**5. ORM және API.** Терминалда келесі командаларды орындаңыз:

```bash
npm run check       # JS синтаксисін тексеру
npm test            # енгізу деректерін валидациялау тесттері (Neon қажет емес)
npm run db:test     # нақты Neon-ға қосылу және Sequelize CRUD сынағы
npm start           # API серверін іске қосу
```

Сервер: `http://localhost:3000/courses`. Codespaces ішінен **Ports** → `3000` → **Open in Browser**. Егер сыртқы браузерге ашылмаса, порттың URL мекенжайын Codespaces панелінен көшіріңіз; GitHub рұқсат сұрауы мүмкін.

## 5. SQL тексеру және күтілетін нәтижелер

| Тапсырма | SQL әдісі | Демо нәтижесі (seed.sql орындалғаннан кейін) |
|---|---|---|
| 30 сағаттан ұзақ курс | `WHERE + ORDER BY + LIMIT` | 48, 42 және 36 сағаттық курстар |
| Оқытушымен курс | `INNER JOIN` | 5 курс, 5 оқытушы |
| Студенті жоқ курс | `LEFT JOIN ... HAVING` | №4 және №5 курстар |
| Студент, курс, баға | `JOIN` (3 кесте) | 5 тіркелу, соның бір бағасы `NULL` |
| Орташа баға 70-тен жоғары | `GROUP BY / HAVING` | №1: 90.00, №2: 76.00 |
| Орташа бағадан жоғары студенттер | Ішкі сұраным | 95 және 85 балл алған жазбалар |
| Өзгерту / жою | `UPDATE`, `DELETE` | `ROLLBACK` — деректер сақталады |
| Қосу және баға қою | `BEGIN / COMMIT` | №5 студент №4 курсқа 88 балмен тіркеледі |
| Индекс талдауы | `CREATE INDEX`, `EXPLAIN ANALYZE` | Жоспарды өз Neon ортаңызда салыстырыңыз |

Бүкіл `sql/queries.sql` файлын орындасаңыз, №4 курсқа бір студент қосылады — демек кейінгі «студенті жоқ курс» сұранымында тек №5 курс қалады. Таза бастапқы деректерді қалпына келтіру үшін `schema.sql` және `seed.sql` файлдарын ретімен қайта орындаңыз.

> **Бонус:** кішкентай кестеде PostgreSQL индекс болғанның өзінде `Seq Scan` орындауы мүмкін; `EXPLAIN ANALYZE` нақты жоспары деректер көлеміне тәуелді, сондықтан ойдан өнімділік көрсеткіші келтірілмейді.

## 6. REST API

| Әдіс | Жол | Нәтиже | Кодтар |
|---|---|---|---|
| `GET` | `/courses` | Барлық курс және оқытушылар | `200` |
| `GET` | `/courses/:id` | Бір курс, оқытушы және бағалары бар студенттер | `200`, `400`, `404` |
| `POST` | `/courses` | Курс құру | `201`, `400`, `404` |
| `PUT` | `/courses/:id` | Курс деректерін өзгерту | `200`, `400`, `404` |
| `DELETE` | `/courses/:id` | Бос курсты жою | `200`, `400`, `404`, `409` |
| `POST` | `/enrollments` | Студентті курсқа тіркеу | `201`, `400`, `404`, `409` |
| `GET` | `/students/:id/courses` | Студент курстары мен бағалары | `200`, `400`, `404` |

Тексеру командалары:

```bash
# Барлық курс
curl -i http://localhost:3000/courses

# Бірінші курс
curl -i http://localhost:3000/courses/1

# Жаңа курс (оқытушы №1)
curl -i -X POST http://localhost:3000/courses \
  -H 'Content-Type: application/json' \
  -d '{"title":"Docker негіздері","hours":32,"teacherId":1}'

# Жаңа курс әдетте №6 (құрғаннан кейін алынған нақты id енгізіңіз)
curl -i -X PUT http://localhost:3000/courses/6 \
  -H 'Content-Type: application/json' -d '{"hours":44}'

# Студентті курсқа тіркеу
curl -i -X POST http://localhost:3000/enrollments \
  -H 'Content-Type: application/json' -d '{"studentId":5,"courseId":5,"grade":null}'

# Студенттің курстары
curl -i http://localhost:3000/students/5/courses

# Бос курсты жою
curl -i -X DELETE http://localhost:3000/courses/6
```

Жауап үлгісі (**көрнекі, нақты іске қосылған сервер жауабы емес**):

```json
{
  "id": 6,
  "title": "Docker негіздері",
  "description": null,
  "hours": 32,
  "teacherId": 1
}
```

Қате жауап үлгісі: `{"error":"Курс табылмады"}` (`404 Not Found`). Тағы тексеру командалары мен `200/201/400/404/409` сценарийлері [`docs/API-test-examples.md`](docs/API-test-examples.md) ішінде.

## 7. ORM түсіндірмесі

- `Teacher.hasMany(Course)` + `Course.belongsTo(Teacher)` — оқытушы мен курс (1:N).
- `Student.belongsToMany(Course, { through: Enrollment })` және кері байланыс — студент/курс (M:N).
- `Enrollment` ішінде `studentId` пен `courseId` екеуі де `primaryKey: true`; баға қойылмаған болса `null` сақталады.
- Барлық модельдерде `tableName`, `underscored: true`, `timestamps: false` бар. `sequelize.sync()` қолданылмайды: схема SQL арқылы жасалған.
- `npm run db:test` кезінде жаңа студент қосылып, курсқа жазылады, бағасы түзетіледі және тіркелуі жойылады. Операциялар соңында `ROLLBACK` жасалады — демонстрациялық дерекқор өзгермейді.

## 8. Тапсыру алдындағы тексеру

- [ ] Neon-да `schema.sql` және `seed.sql` сәтті орындалды.
- [ ] SQL Editor-да `queries.sql` сұранымдарын орындадым.
- [ ] `npm test`, `npm run db:test` сәтті аяқталды.
- [ ] `npm start` іске қосылып, `GET /courses` JSON берді.
- [ ] `POST`, `PUT`, `DELETE`, `409` сценарийлерін `curl` арқылы тексердім.
- [ ] GitHub репозиторийінде `.env` жоқ, тек `.env.example` бар.
- [ ] Репозиторий **Public** және сілтемесі Moodle-ға жіберілді.

**Қорытынды:** жоба реляциялық деректер схемасын, 3ҚФ қағидаларын, SQL сұранымдарын, ORM байланыстарын және қателерді тексеретін REST API-ді бір жүйеде көрсетеді.