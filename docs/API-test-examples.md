# REST API тексеру сценарийлері (curl)

**Ескерту:** JSON жауаптар — күтілетін **мысалдар**, нақты Neon серверінен алынған нәтижелер емес. Алдымен schema.sql, seed.sql және npm start орындаңыз.

## GET /courses → 200

```bash
curl -i http://localhost:3000/courses
```

Күтілетіні: HTTP 200 OK және әр курста teacher нысаны бар массив.

## GET /courses/1 → 200

```bash
curl -i http://localhost:3000/courses/1
```

Күтілетін үзінді:
```json
{"id":1,"title":"PostgreSQL негіздері","hours":48,"teacherId":1,"teacher":{"id":1,"fullName":"Айдана Сәрсенова"},"students":[{"id":1,"fullName":"Арман Әділбек","Enrollment":{"grade":95,"enrolledAt":"2026-09-01"}}]}
```

## POST /courses → 201

```bash
curl -i -X POST http://localhost:3000/courses \
  -H 'Content-Type: application/json' \
  -d '{"title":"Docker негіздері","description":"Контейнерлермен жұмыс","hours":32,"teacherId":1}'
```

## PUT /courses/6 → 200

```bash
curl -i -X PUT http://localhost:3000/courses/6 \
  -H 'Content-Type: application/json' -d '{"hours":44}'
```

## POST /enrollments → 201

```bash
curl -i -X POST http://localhost:3000/enrollments \
  -H 'Content-Type: application/json' \
  -d '{"studentId":5,"courseId":5,"grade":null}'
```

Қайталау → 409 Conflict.

## GET /students/1/courses → 200

```bash
curl -i http://localhost:3000/students/1/courses
```

## DELETE /courses/6 → 200

```bash
curl -i -X DELETE http://localhost:3000/courses/6
```

Күтілетіні: `{"message":"Курс жойылды","id":6}`, егер студент тіркелмеген болса.

## Қате кодтары

```bash
# 400 — дұрыс емес сағат саны
curl -i -X POST http://localhost:3000/courses -H 'Content-Type: application/json' \
  -d '{"title":"Қате курс","hours":-10,"teacherId":1}'

# 404 — курс табылмады
curl -i http://localhost:3000/courses/99999

# 409 — студенттері бар курс
curl -i -X DELETE http://localhost:3000/courses/1
```
