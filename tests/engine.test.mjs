import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTION_MAP } from '../dist/questions.mjs';
import { createRound, answerRound, advanceRound, summarizeRound, levelFor, LEVELS, validRound, seededRandom, hongKongDay, integrateResult } from '../dist/engine.mjs';

function finish(round, decide = q => q.answer) {
  while (!round.finishedAt) { const q = QUESTION_MAP.get(round.items[round.index].id); round = advanceRound(answerRound(round, decide(q, round.index))); }
  return round;
}

test('General always covers eight topics, 75% Bible, and all three difficulties without repeats', () => {
  for (let seed = 0; seed < 100; seed++) {
    const r = createRound({ random: seededRandom(seed) });
    assert(validRound(r));
    assert.equal(new Set(r.items.map(i => i.id)).size, 40);
    const qs = r.items.map(i => QUESTION_MAP.get(i.id));
    assert.equal(qs.filter(q => ['overview', 'old', 'new', 'people', 'context'].includes(q.topic)).length, 30);
    assert.deepEqual([1, 2, 3].map(d => qs.filter(q => q.difficulty === d).length), [18, 13, 9]);
    assert(r.items.every(i => [...i.order].sort().join('') === '0123'));
  }
});

test('Topic selection honours difficulty and available pool size', () => {
  for (const difficulty of ['1', '2', '3']) {
    const r = createRound({ mode: 'topic', topic: 'old', count: 30, difficulty });
    assert.equal(r.items.length, 10);
    assert(r.items.every(i => QUESTION_MAP.get(i.id).difficulty === Number(difficulty)));
  }
  assert.equal(createRound({ mode: 'topic', topic: 'new', count: 20 }).items.length, 20);
  assert.throws(() => createRound({ mode: 'topic', topic: 'missing' }));
});

test('Daily questions and options are deterministic per Hong Kong day', () => {
  const a = createRound({ mode: 'daily', day: '2026-11-01' });
  const b = createRound({ mode: 'daily', day: '2026-11-01' });
  const c = createRound({ mode: 'daily', day: '2026-11-02' });
  assert.deepEqual(a.items, b.items);
  assert.notDeepEqual(a.items, c.items);
  assert.equal(new Set(a.items.map(i => QUESTION_MAP.get(i.id).topic)).size, 5);
  assert.equal(hongKongDay(new Date('2026-11-01T16:01:00Z')), '2026-11-02');
});

test('Double clicks cannot change or duplicate an answer; unanswered rounds cannot advance', () => {
  const r = createRound();
  assert.equal(advanceRound(r), r);
  const a = answerRound(r, 1);
  assert.equal(answerRound(a, 0), a);
  assert.equal(a.answers.length, 1);
  assert(validRound(a));
  assert(validRound(advanceRound(a)));
});

test('Scoring is correct across every reachable General score and level boundary', () => {
  for (let correct = 0; correct <= 40; correct++) {
    const r = finish(createRound(), (q, i) => i < correct ? q.answer : (q.answer + 1) % 4);
    const s = summarizeRound(r);
    assert.equal(s.correct, correct);
    assert.equal(s.percent, correct * 2.5);
    assert.equal(s.level, levelFor(correct * 2.5));
    assert(validRound(r, true));
    assert(!validRound(r));
  }
  for (const l of LEVELS) assert.equal(levelFor(l.min), l);
});

test('Skips count toward denominator; topic, daily and revision do not award a General title', () => {
  for (const mode of ['topic', 'daily', 'review']) {
    const r = finish(createRound({ mode, ids: ['old-01', 'new-01'] }), () => null);
    const s = summarizeRound(r);
    assert.equal(s.percent, 0);
    assert.equal(s.skipped, s.total);
    assert.equal(s.level, null);
  }
});

test('Revision deduplicates ids, ignores removed questions, and mastery removes mistakes', () => {
  const r = createRound({ mode: 'review', ids: ['old-01', 'old-01', 'new-01', 'bad-id'] });
  assert.equal(r.items.length, 2);
  const progress = { current: r, history: [], mistakes: ['old-01', 'new-01'], bookmarks: [] };
  const done = finish(r, q => q.id === 'old-01' ? q.answer : null);
  const p = integrateResult(progress, done);
  assert.deepEqual(p.mistakes, ['new-01']);
  assert.equal(p.history.length, 1);
  assert.equal(integrateResult(p, done).history.length, 1);
});

test('Malformed persisted rounds are rejected', () => {
  const r = createRound();
  assert(!validRound({ ...r, items: [{ id: 'unknown', order: [0, 1, 2, 3] }] }));
  assert(!validRound({ ...r, index: 99 }));
  assert(!validRound({ ...r, items: r.items.map((x, i) => i === 0 ? { ...x, order: [0, 0, 0, 0] } : x) }));
  assert(!validRound({ ...r, answers: [{ id: r.items[0].id, selected: 20 }] }));
  assert(!validRound({ ...r, tone: 'injected' }));
});
