import test from 'node:test';
import assert from 'node:assert/strict';
import { NUMBERS_QUESTIONS, NUMBERS_UNITS, NUMBERS_TOPIC, NUMBERS_LEVEL_POOLS, NUMBERS_HARD_QUESTIONS, numbersStatus, cleanNumbersAnswers } from '../dist/numbers-course.mjs';
import { createRound, seededRandom, validRound, answerRound, advanceRound, summarizeRound, questionForRound } from '../dist/engine.mjs';

test('Numbers lessons cover one hundred questions in ten units, with balanced low and middle pools', () => {
  assert.equal(NUMBERS_QUESTIONS.length, 100);
  assert.equal(NUMBERS_UNITS.length, 10);
  assert.equal(NUMBERS_LEVEL_POOLS[1].length, 50);
  assert.equal(NUMBERS_LEVEL_POOLS[2].length, 50);
  assert.equal(NUMBERS_LEVEL_POOLS[3].length, 20);
  for (const unit of NUMBERS_UNITS) {
    const questions = NUMBERS_QUESTIONS.filter(q => q.unit === unit.id);
    assert.equal(questions.length, 10, unit.id);
    assert.equal(NUMBERS_LEVEL_POOLS[1].filter(q => q.unit === unit.id).length, 5, `${unit.id} low balance`);
    assert.equal(NUMBERS_LEVEL_POOLS[2].filter(q => q.unit === unit.id).length, 5, `${unit.id} middle balance`);
    const round = createRound({ mode: 'numbers', unit: unit.id });
    assert.equal(round.items.length, 10);
    assert(validRound(round));
    assert(round.items.every(item => questions.some(q => q.id === item.id)));
  }
  assert.equal(numbersStatus({}).total, 100);
  assert.deepEqual(cleanNumbersAnswers({ 'numbers-001': true, 'numbers-hard-001': false, unknown: true, 'numbers-002': 1 }), { 'numbers-001': true });
});

test('Numbers random and low, middle, high quizzes use ten distinct questions from the right pools', () => {
  const a = createRound({ mode: 'numbers-test', random: seededRandom('numbers sample a') });
  const b = createRound({ mode: 'numbers-test', random: seededRandom('numbers sample b') });
  assert.equal(a.topic, NUMBERS_TOPIC.id);
  assert.equal(a.items.length, 10);
  assert.equal(new Set(a.items.map(i => i.id)).size, 10);
  assert(a.items.every(item => NUMBERS_QUESTIONS.some(q => q.id === item.id)));
  assert.notDeepEqual(a.items.map(i => i.id), b.items.map(i => i.id));
  assert(validRound(a));
  for (const level of [1, 2, 3]) {
    const round = createRound({ mode: 'numbers-level', difficulty: String(level), random: seededRandom(`numbers level ${level}`) });
    assert.equal(round.items.length, 10);
    assert(validRound(round));
    assert(round.items.every(item => NUMBERS_LEVEL_POOLS[level].some(q => q.id === item.id)));
    assert(round.items.every(item => questionForRound(round, item.id)?.reference));
  }
  assert.equal(NUMBERS_HARD_QUESTIONS.length, 20);
});

test('Numbers test and level quizzes prioritize unseen questions and repeat only after each pool is exhausted', () => {
  const first = createRound({ mode: 'numbers-test', random: seededRandom('numbers unseen first') });
  const seen = first.items.map(item => item.id);
  const second = createRound({ mode: 'numbers-test', seenIds: seen, random: seededRandom('numbers unseen second') });
  assert(second.items.every(item => !seen.includes(item.id)));
  for (const level of [1, 2, 3]) {
    const firstLevel = createRound({ mode: 'numbers-level', difficulty: String(level), random: seededRandom(`numbers level first ${level}`) });
    const firstSeen = firstLevel.items.map(item => item.id);
    const secondLevel = createRound({ mode: 'numbers-level', difficulty: String(level), seenIds: firstSeen, random: seededRandom(`numbers level second ${level}`) });
    assert(secondLevel.items.every(item => !firstSeen.includes(item.id)), `level ${level} should prefer unseen questions`);
    const exhausted = [...firstSeen, ...secondLevel.items.map(item => item.id)];
    const repeat = createRound({ mode: 'numbers-level', difficulty: String(level), seenIds: exhausted, random: seededRandom(`numbers level repeat ${level}`) });
    assert.equal(new Set(repeat.items.map(item => item.id)).size, 10);
    assert(repeat.items.every(item => NUMBERS_LEVEL_POOLS[level].some(q => q.id === item.id)));
  }
});

test('Numbers feedback and verse references work for lesson, random and advanced quiz rounds', () => {
  let round = createRound({ mode: 'numbers', unit: NUMBERS_UNITS[0].id });
  while (!round.finishedAt) round = advanceRound(answerRound(round, questionForRound(round, round.items[round.index].id).answer));
  assert.equal(summarizeRound(round).correct, 10);
  assert(validRound(round, true));
  const hard = createRound({ mode: 'numbers-level', difficulty: '3', random: seededRandom('numbers hard') });
  assert(hard.items.every(item => item.id.startsWith('numbers-hard-')));
  assert(hard.items.every(item => questionForRound(hard, item.id).reference.startsWith('民數記')));
});
