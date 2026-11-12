'use strict';

require('dotenv').config();
const { Sequelize, DataTypes, literal } = require('sequelize');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL табылмады. .env файлын толтырыңыз.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: true } }
});

const opts = (tableName) => ({ tableName, underscored: true, timestamps: false });

const Teacher = sequelize.define('Teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING(120), field: 'full_name', allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } }
}, opts('teachers'));

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING(120), field: 'full_name', allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  groupName: { type: DataTypes.STRING(30), field: 'group_name', allowNull: false }
}, opts('students'));

const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(160), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  hours: { type: DataTypes.INTEGER, allowNull: false, validate: { isInt: true, min: 1 } },
  teacherId: { type: DataTypes.INTEGER, field: 'teacher_id', allowNull: false }
}, opts('courses'));

const Enrollment = sequelize.define('Enrollment', {
  studentId: { type: DataTypes.INTEGER, field: 'student_id', primaryKey: true, allowNull: false },
  courseId: { type: DataTypes.INTEGER, field: 'course_id', primaryKey: true, allowNull: false },
  enrolledAt: { type: DataTypes.DATEONLY, field: 'enrolled_at', allowNull: false,
    defaultValue: literal('CURRENT_DATE') },
  grade: { type: DataTypes.SMALLINT, allowNull: true,
    validate: { isInt: true, min: 0, max: 100 } }
}, opts('enrollments'));

Teacher.hasMany(Course, { foreignKey: 'teacherId', as: 'courses' });
Course.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Student.belongsToMany(Course, {
  through: Enrollment, foreignKey: 'studentId', otherKey: 'courseId', as: 'courses'
});
Course.belongsToMany(Student, {
  through: Enrollment, foreignKey: 'courseId', otherKey: 'studentId', as: 'students'
});
Enrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// sequelize.sync() шақырылмайды: кестелер тек sql/schema.sql арқылы құрылады.
module.exports = { sequelize, Teacher, Student, Course, Enrollment };
