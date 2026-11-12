-- 1) WHERE, ORDER BY, LIMIT: 30 сағаттан ұзақ 3 курсты шығару.
SELECT id, title, hours
FROM courses
WHERE hours > 30
ORDER BY hours DESC
LIMIT 3;

-- 2) INNER JOIN: курс және оған бекітілген оқытушы.
SELECT c.id, c.title, t.full_name AS teacher_name, t.email AS teacher_email
FROM courses AS c
INNER JOIN teachers AS t ON t.id = c.teacher_id
ORDER BY c.id;

-- 3) LEFT JOIN: әлі бірде-бір студент тіркелмеген курстар.
SELECT c.id, c.title, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrollments AS e ON e.course_id = c.id
GROUP BY c.id, c.title
HAVING COUNT(e.student_id) = 0
ORDER BY c.id;

-- 4) Үш кестені JOIN: студент, курс және оның бағасы.
SELECT s.full_name AS student_name, c.title AS course_title,
       e.enrolled_at, e.grade
FROM enrollments AS e
INNER JOIN students AS s ON s.id = e.student_id
INNER JOIN courses AS c ON c.id = e.course_id
ORDER BY s.full_name, c.title;

-- 5) GROUP BY, HAVING: бағалары бар курстардың орташа бағасы 70-тен жоғары.
-- AVG функциясы NULL бағаларды автоматты түрде есептемейді.
SELECT c.title, ROUND(AVG(e.grade), 2) AS average_grade,
       COUNT(e.grade) AS graded_students
FROM courses AS c
INNER JOIN enrollments AS e ON e.course_id = c.id
GROUP BY c.id, c.title
HAVING AVG(e.grade) > 70
ORDER BY average_grade DESC;

-- 6) Ішкі сұраным: бүкіл тіркелулердің орташа бағасынан жоғары нәтиже алғандар.
SELECT DISTINCT s.id, s.full_name, c.title AS course_title, e.grade
FROM students AS s
INNER JOIN enrollments AS e ON e.student_id = s.id
INNER JOIN courses AS c ON c.id = e.course_id
WHERE e.grade > (SELECT AVG(grade) FROM enrollments)
ORDER BY e.grade DESC;

-- 7) UPDATE шарты: тек 4-студенттің 3-курс бағасын өзгерту.
-- Тексеру үшін ROLLBACK қолданамыз: бастапқы деректер өзгермейді.
BEGIN;
UPDATE enrollments
SET grade = 73
WHERE student_id = 4 AND course_id = 3;
SELECT student_id, course_id, grade FROM enrollments
WHERE student_id = 4 AND course_id = 3;
ROLLBACK;

-- 8) DELETE шарты: тек 4-студенттің 3-курс тіркелуін жою.
-- Деректер сақталуы үшін осы демонстрация да кері қайтарылады.
BEGIN;
DELETE FROM enrollments
WHERE student_id = 4 AND course_id = 3;
SELECT student_id, course_id FROM enrollments
WHERE student_id = 4 AND course_id = 3;
ROLLBACK;

-- 9) Транзакция: 5-студентті 4-курсқа тіркеу, одан кейін баға қою.
-- ON CONFLICT қайталап орындағанда құрама кілт қателігін болдырмайды.
BEGIN;
INSERT INTO enrollments (student_id, course_id, enrolled_at, grade)
VALUES (5, 4, CURRENT_DATE, NULL)
ON CONFLICT (student_id, course_id) DO NOTHING;
UPDATE enrollments SET grade = 88
WHERE student_id = 5 AND course_id = 4;
COMMIT;

-- 10) ROLLBACK мысалы: сынақ тіркелуі сақталмайды.
BEGIN;
INSERT INTO enrollments (student_id, course_id, enrolled_at, grade)
VALUES (5, 5, CURRENT_DATE, 92)
ON CONFLICT (student_id, course_id) DO NOTHING;
ROLLBACK;

-- 11) Бонус (+5 балл): индекстің алдында және одан кейін сұраным жоспарын салыстыру.
-- Бастапқы жоспар.
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM enrollments WHERE course_id = 2;

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id
    ON enrollments (course_id);

-- Индексті құрғаннан кейінгі жоспар.
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM enrollments WHERE course_id = 2;
-- Маңызды: 5 жолдан тұратын шағын кестеде PostgreSQL Seq Scan-ды
-- дұрыс таңдай алады; индекс қолданылатынына немесе тезірек болатынына кепіл жоқ.
