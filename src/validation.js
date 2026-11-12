'use strict';

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function positiveId(value, label = 'ID') {
  const str = String(value);
  if (!/^[1-9]\d*$/.test(str) || !Number.isSafeInteger(Number(str))) {
    throw new HttpError(400, `${label}: оң бүтін сан керек`);
  }
  return Number(str);
}

function hasOwn(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateCourse(body, partial = false) {
  if (!plainObject(body)) throw new HttpError(400, 'JSON объектісі қажет');
  const permitted = ['title', 'description', 'hours', 'teacherId'];
  const keys = Object.keys(body);
  if (!keys.length) throw new HttpError(400, 'Кемінде бір өрісті көрсетіңіз');
  if (keys.some(k => !permitted.includes(k))) throw new HttpError(400, 'Белгісіз өріс табылды');
  if (!partial && permitted.filter(k => k !== 'description').some(k => !hasOwn(body, k))) {
    throw new HttpError(400, 'title, hours және teacherId міндетті');
  }
  const out = {};
  if (hasOwn(body, 'title')) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 160)
      throw new HttpError(400, 'title: 1–160 таңбалық бос емес мәтін қажет');
    out.title = body.title.trim();
  }
  if (hasOwn(body, 'description')) {
    if (body.description !== null && (typeof body.description !== 'string' || body.description.length > 2000))
      throw new HttpError(400, 'description: 2000 таңбаға дейінгі мәтін не null');
    out.description = body.description;
  }
  if (hasOwn(body, 'hours')) {
    if (!Number.isSafeInteger(body.hours) || body.hours <= 0)
      throw new HttpError(400, 'hours: 0-ден үлкен бүтін сан қажет');
    out.hours = body.hours;
  }
  if (hasOwn(body, 'teacherId')) out.teacherId = positiveId(body.teacherId, 'teacherId');
  return out;
}

function validateEnrollment(body) {
  if (!plainObject(body)) throw new HttpError(400, 'JSON объектісі қажет');
  if (!hasOwn(body, 'studentId') || !hasOwn(body, 'courseId'))
    throw new HttpError(400, 'studentId және courseId міндетті');
  const allowed = ['studentId', 'courseId', 'enrolledAt', 'grade'];
  if (Object.keys(body).some(k => !allowed.includes(k)))
    throw new HttpError(400, 'Белгісіз өріс табылды');
  const out = {
    studentId: positiveId(body.studentId, 'studentId'),
    courseId: positiveId(body.courseId, 'courseId')
  };
  if (hasOwn(body, 'grade')) {
    if (body.grade !== null && (!Number.isInteger(body.grade) || body.grade < 0 || body.grade > 100))
      throw new HttpError(400, 'grade: 0–100 бүтін сан немесе null');
    out.grade = body.grade;
  }
  if (hasOwn(body, 'enrolledAt')) {
    if (typeof body.enrolledAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.enrolledAt) ||
        Number.isNaN(Date.parse(body.enrolledAt)) ||
        new Date(body.enrolledAt).toISOString().slice(0, 10) !== body.enrolledAt)
      throw new HttpError(400, 'enrolledAt: YYYY-MM-DD түріндегі нақты күн');
    out.enrolledAt = body.enrolledAt;
  }
  return out;
}

module.exports = { HttpError, positiveId, validateCourse, validateEnrollment };
