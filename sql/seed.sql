-- Дәл 5 оқытушы, 5 студент, 5 курс және 5 тіркелу жазбасы.
-- schema.sql файлын орындағаннан кейін іске қосыңыз.
-- Бағалардың біреуі NULL, ал 4 және 5-курстарда бастапқыда студент жоқ.
BEGIN;

INSERT INTO teachers (id, full_name, email) VALUES
    (1, 'Айдана Сәрсенова', 'aidana.sarsenova@example.edu'),
    (2, 'Нұрлан Төлегенов', 'nurlan.tolegenov@example.edu'),
    (3, 'Мадина Қасымова', 'madina.kasymova@example.edu'),
    (4, 'Ержан Нұрбеков', 'erzhan.nurbekov@example.edu'),
    (5, 'Әсел Омарова', 'assel.omarova@example.edu');

INSERT INTO students (id, full_name, email, group_name) VALUES
    (1, 'Арман Әділбек', 'arman.adilbek@example.edu', 'ПИ-23-1'),
    (2, 'Дана Ермек', 'dana.ermek@example.edu', 'ПИ-23-1'),
    (3, 'Мирас Сейіт', 'miras.seyit@example.edu', 'ПИ-23-2'),
    (4, 'Аружан Кәрім', 'aruzhan.karim@example.edu', 'ПИ-23-2'),
    (5, 'Әлихан Берік', 'alikhan.berik@example.edu', 'ПИ-23-3');

INSERT INTO courses (id, title, description, hours, teacher_id) VALUES
    (1, 'PostgreSQL негіздері', 'Кестелер, кілттер және SQL сұранымдары', 48, 1),
    (2, 'Node.js және REST API', 'Express көмегімен сервер жазу', 42, 2),
    (3, 'UI/UX прототиптеу', 'Интерфейстерді Figma арқылы жобалау', 24, 3),
    (4, 'Ақпараттық қауіпсіздік', 'Қорғау шаралары мен қауіптерді талдау', 36, 4),
    (5, 'Деректерді визуалдау', 'Диаграмма және аналитикалық есептер', 28, 5);

INSERT INTO enrollments (student_id, course_id, enrolled_at, grade) VALUES
    (1, 1, '2026-09-01', 95),
    (2, 1, '2026-09-02', 85),
    (3, 2, '2026-09-03', 76),
    (1, 2, '2026-09-04', NULL),
    (4, 3, '2026-09-05', 68);

-- GENERATED ... AS IDENTITY тізбектерін қолмен көрсетілген ID-ларға сәйкестендіру.
SELECT setval(pg_get_serial_sequence('teachers', 'id'), (SELECT MAX(id) FROM teachers));
SELECT setval(pg_get_serial_sequence('students', 'id'), (SELECT MAX(id) FROM students));
SELECT setval(pg_get_serial_sequence('courses', 'id'), (SELECT MAX(id) FROM courses));
COMMIT;
