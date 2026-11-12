'use strict';

const express = require('express');
const { UniqueConstraintError, ForeignKeyConstraintError, ValidationError, DatabaseError } = require('sequelize');
const { sequelize, Teacher, Course, Student, Enrollment } = require('./db');
const { HttpError, positiveId, validateCourse, validateEnrollment } = require('./validation');

const app = express();
app.use(express.json({ limit: '32kb' }));

const asyncRoute = fn => (req, res, next) => Promise.resolve().then(() => fn(req, res)).catch(next);

app.get('/health', asyncRoute(async (req, res) => {
  await sequelize.authenticate();
  res.status(200).json({ status: 'ok', database: 'connected' });
}));

// Барлық курстарды оқытушымен бірге көру.
app.get('/courses', asyncRoute(async (req, res) => {
  const courses = await Course.findAll({ include: [{ model: Teacher, as: 'teacher' }], order: [['id', 'ASC']] });
  res.status(200).json(courses);
}));

// Курс, оның оқытушысы және студенттер бағалары.
app.get('/courses/:id', asyncRoute(async (req, res) => {
  const id = positiveId(req.params.id);
  const course = await Course.findByPk(id, {
    include: [
      { model: Teacher, as: 'teacher' },
      { model: Student, as: 'students', through: { attributes: ['enrolledAt', 'grade'] } }
    ]
  });
  if (!course) throw new HttpError(404, 'Курс табылмады');
  res.status(200).json(course);
}));

// Жаңа курс ашу.
app.post('/courses', asyncRoute(async (req, res) => {
  const input = validateCourse(req.body);
  if (!await Teacher.findByPk(input.teacherId)) throw new HttpError(404, 'Оқытушы табылмады');
  const created = await Course.create(input);
  res.status(201).json(created);
}));

// Курс деректерін ішінара немесе толық жаңарту.
app.put('/courses/:id', asyncRoute(async (req, res) => {
  const id = positiveId(req.params.id);
  const input = validateCourse(req.body, true);
  const course = await Course.findByPk(id);
  if (!course) throw new HttpError(404, 'Курс табылмады');
  if (input.teacherId && !await Teacher.findByPk(input.teacherId))
    throw new HttpError(404, 'Оқытушы табылмады');
  await course.update(input);
  res.status(200).json(course);
}));

// Оқушылар тіркелген курсты кездейсоқ жоймау үшін 409 қайтарамыз.
app.delete('/courses/:id', asyncRoute(async (req, res) => {
  const id = positiveId(req.params.id);
  const course = await Course.findByPk(id);
  if (!course) throw new HttpError(404, 'Курс табылмады');
  if (await Enrollment.count({ where: { courseId: id } }) > 0)
    throw new HttpError(409, 'Курсқа студенттер тіркелген, алдымен тіркелулерді тазалаңыз');
  await course.destroy();
  res.status(200).json({ message: 'Курс жойылды', id });
}));

// Студентті курсқа жазу; қайталанатын тіркелу — 409.
app.post('/enrollments', asyncRoute(async (req, res) => {
  const input = validateEnrollment(req.body);
  if (!await Student.findByPk(input.studentId)) throw new HttpError(404, 'Студент табылмады');
  if (!await Course.findByPk(input.courseId)) throw new HttpError(404, 'Курс табылмады');
  const created = await Enrollment.create(input);
  res.status(201).json(created);
}));

// Студенттің барлық курстарын және бағаларын қайтару.
app.get('/students/:id/courses', asyncRoute(async (req, res) => {
  const id = positiveId(req.params.id);
  const student = await Student.findByPk(id, {
    include: [{ model: Course, as: 'courses', through: { attributes: ['enrolledAt', 'grade'] } }]
  });
  if (!student) throw new HttpError(404, 'Студент табылмады');
  res.status(200).json(student);
}));

app.use((req, res) => res.status(404).json({ error: 'Маршрут табылмады' }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
    return res.status(400).json({ error: 'JSON пішімі қате' });
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof UniqueConstraintError) return res.status(409).json({ error: 'Бұл дерек бұрыннан тіркелген' });
  if (err instanceof ForeignKeyConstraintError) return res.status(409).json({ error: 'Байланыс шектеуі бұзылды' });
  if (err instanceof ValidationError || err instanceof DatabaseError && err.parent?.code === '23514')
    return res.status(400).json({ error: 'Енгізілген деректер қате' });
  console.error('Сервер қатесі:', err.message);
  return res.status(500).json({ error: 'Ішкі сервер қатесі' });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  sequelize.authenticate().then(() => {
    app.listen(port, '0.0.0.0', () => console.log(`API дайын: http://localhost:${port}/courses`));
  }).catch((err) => {
    console.error('PostgreSQL-ге қосылу сәтсіз:', err.message);
    process.exitCode = 1;
  });
}

module.exports = app;
