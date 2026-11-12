'use strict';

const { sequelize, Teacher, Course, Student, Enrollment } = require('./db');

async function main() {
  await sequelize.authenticate();
  console.log('✓ Neon PostgreSQL-ге байланыс орнады');

  const courses = await Course.findAll({
    include: [{ model: Teacher, as: 'teacher', attributes: ['fullName', 'email'] }],
    order: [['id', 'ASC']]
  });
  console.log('\n1) Оқытушылары бар курстар:');
  courses.forEach(c => console.log(`  #${c.id} ${c.title} — ${c.teacher.fullName}`));

  const course = await Course.findByPk(1, {
    include: [{ model: Student, as: 'students', through: { attributes: ['grade', 'enrolledAt'] } }]
  });
  if (!course) throw new Error('Алдымен schema.sql және seed.sql іске қосыңыз');
  console.log('\n2) Бірінші курстың студенттері және бағалары:');
  course.students.forEach(s => console.log(`  ${s.fullName}: ${s.Enrollment.grade ?? 'әлі қойылмаған'}`));

  // Төмендегі CREATE/UPDATE/DELETE нағыз PostgreSQL-де тексеріледі,
  // бірақ соңында ROLLBACK дерекқорды бастапқы күйінде қалдырады.
  const t = await sequelize.transaction();
  try {
    const newStudent = await Student.create({
      fullName: 'Сынақ Студенті',
      email: `orm-test-${Date.now()}@example.edu`,
      groupName: 'TEST-01'
    }, { transaction: t });
    console.log(`\n3) Студент қосылды: #${newStudent.id}`);

    const enrollment = await Enrollment.create({
      studentId: newStudent.id, courseId: course.id, grade: null
    }, { transaction: t });
    console.log(`4) Курсқа тіркелді: ${enrollment.studentId} → ${enrollment.courseId}`);

    await enrollment.update({ grade: 92 }, { transaction: t });
    console.log(`5) Бағасы өзгертілді: ${enrollment.grade}`);

    await enrollment.destroy({ transaction: t });
    console.log('6) Тіркелу жойылды');
  } finally {
    await t.rollback();
    console.log('✓ ROLLBACK: сынақ өзгерістері сақталмады');
  }
}

main().catch(err => {
  console.error('Тексеру сәтсіз:', err.message);
  process.exitCode = 1;
}).finally(async () => sequelize.close());
