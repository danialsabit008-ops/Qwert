'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { positiveId, validateCourse, validateEnrollment } = require('../src/validation');

test('ID тек оң бүтін сан болуы тиіс', () => {
  assert.equal(positiveId('12'), 12);
  for (const v of ['0', '-3', '3.4', 'a', '1e3'])
    assert.throws(() => positiveId(v), { status: 400 });
});

test('курс: міндетті өрістер және дұрыс деректер', () => {
  assert.deepEqual(validateCourse({ title: ' SQL ', hours: 40, teacherId: 1 }),
    { title: 'SQL', hours: 40, teacherId: 1 });
  assert.throws(() => validateCourse({ title: 'SQL' }), { status: 400 });
  assert.throws(() => validateCourse({ title: '', hours: 40, teacherId: 1 }), { status: 400 });
});

test('курс ұзақтығы нөл, теріс не бөлшек болмауы тиіс', () => {
  for (const hours of [0, -4, 1.5, '40', null])
    assert.throws(() => validateCourse({ title: 'SQL', hours, teacherId: 1 }), { status: 400 });
});

test('ішінара PUT өзгерістері тек рұқсат етілген өрістер', () => {
  assert.deepEqual(validateCourse({ hours: 60 }, true), { hours: 60 });
  assert.throws(() => validateCourse({ extra: 5 }, true), { status: 400 });
});

test('курсқа жазылу: grade 0–100 немесе null', () => {
  for (const grade of [0, 100, null])
    assert.equal(validateEnrollment({ studentId: 1, courseId: 2, grade }).grade, grade);
  for (const grade of [-1, 101, 7.5, '90'])
    assert.throws(() => validateEnrollment({ studentId: 1, courseId: 2, grade }), { status: 400 });
});

test('жазылу күні нақты YYYY-MM-DD болуы тиіс', () => {
  assert.equal(validateEnrollment({ studentId: 1, courseId: 2, enrolledAt: '2026-10-23' }).enrolledAt,
    '2026-10-23');
  for (const enrolledAt of ['2026-02-30', '23.10.2026', '2026-13-01'])
    assert.throws(() => validateEnrollment({ studentId: 1, courseId: 2, enrolledAt }), { status: 400 });
});
