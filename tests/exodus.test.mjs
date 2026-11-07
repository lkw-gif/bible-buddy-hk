import test from 'node:test';
import assert from 'node:assert/strict';
import { EXODUS_QUESTIONS, EXODUS_UNITS, EXODUS_TOPIC, EXODUS_LEVEL_POOLS, EXODUS_HARD_QUESTIONS, exodusStatus, cleanExodusAnswers } from '../dist/exodus-course.mjs';
import { createRound, seededRandom, validRound, answerRound, advanceRound, summarizeRound, questionForRound } from '../dist/engine.mjs';

test('Exodus lessons cover one hundred questions in ten distinct chapters ranges', () => {
  assert.equal(EXODUS_QUESTIONS.length, 100);
  assert.equal(EXODUS_UNITS.length, 10);
  assert.equal(EXODUS_LEVEL_POOLS[1].length, 50);
  assert.equal(EXODUS_LEVEL_POOLS[2].length, 50);
  for (const unit of EXODUS_UNITS) {
    assert.equal(EXODUS_LEVEL_POOLS[1].filter(q => q.unit === unit.id).length, 5, `${unit.id} low-level balance`);
    assert.equal(EXODUS_LEVEL_POOLS[2].filter(q => q.unit === unit.id).length, 5, `${unit.id} medium-level balance`);
  }
  for (const unit of EXODUS_UNITS) {
    const course = EXODUS_QUESTIONS.filter(q => q.unit === unit.id);
    const round = createRound({ mode: 'exodus', unit: unit.id });
    assert.equal(course.length, 10);
    assert.equal(round.items.length, 10);
    assert(validRound(round));
    assert(round.items.every(item => EXODUS_QUESTIONS.find(q => q.id === item.id).unit === unit.id));
  }
  assert.equal(exodusStatus({}).total, 100);
  assert.deepEqual(cleanExodusAnswers({ 'exodus-001': true, missing: false, 'exodus-002': 1 }), { 'exodus-001': true });
});

test('Exodus random and trial quizzes use unique ten-question samples from the right pools', () => {
  const a = createRound({ mode: 'exodus-test', random: seededRandom('sample a') });
  const b = createRound({ mode: 'exodus-test', random: seededRandom('sample b') });
  assert.equal(a.topic, EXODUS_TOPIC.id);
  assert.equal(a.items.length, 10);
  assert(new Set(a.items.map(i => i.id)).size === 10);
  assert(a.items.every(i => EXODUS_QUESTIONS.some(q => q.id === i.id)));
  assert.notDeepEqual(a.items.map(i => i.id), b.items.map(i => i.id));
  assert(validRound(a));
  for (const level of [1, 2, 3]) {
    assert(EXODUS_LEVEL_POOLS[level].length >= 10);
    const round = createRound({ mode: 'exodus-level', difficulty: String(level), random: seededRandom(`level ${level}`) });
    assert.equal(round.items.length, 10);
    assert(validRound(round));
    assert(round.items.every(item => EXODUS_LEVEL_POOLS[level].some(q => q.id === item.id)));
    assert(round.items.every(item => questionForRound(round, item.id)?.reference));
  }
  assert(EXODUS_HARD_QUESTIONS.length >= 20);
  assert(EXODUS_HARD_QUESTIONS.every(q => q.difficulty === 3));
});

test('Exodus lesson feedback and progress remain separate from random and trial results', () => {
  const lesson = createRound({ mode: 'exodus', unit: 'x1' });
  let completed = lesson;
  while (!completed.finishedAt) {
    completed = advanceRound(answerRound(completed, questionForRound(completed, completed.items[completed.index].id).answer));
  }
  assert.equal(summarizeRound(completed).correct, 10);
  assert(validRound(completed, true));
  const random = createRound({ mode: 'exodus-test', random: seededRandom('random') });
  assert.equal(random.mode, 'exodus-test');
  const advanced = createRound({ mode: 'exodus-level', difficulty: '3', random: seededRandom('hard') });
  assert.equal(advanced.difficulty, '3');
  assert(advanced.items.every(item => item.id.startsWith('exodus-hard-')));
});
