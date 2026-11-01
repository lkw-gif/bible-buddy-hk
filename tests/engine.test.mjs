import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTION_MAP, TOPICS, LEGACY_QUESTION_MAP } from '../dist/questions.mjs';
import { createRound, answerRound, advanceRound, summarizeRound, levelFor, LEVELS, validRound, seededRandom, hongKongDay, integrateResult, questionForRound } from '../dist/engine.mjs';

function finish(round, decide = q => q.answer) {
  while (!round.finishedAt) { const q = QUESTION_MAP.get(round.items[round.index].id); round = advanceRound(answerRound(round, decide(q, round.index))); }
  return round;
}

test('General always covers eight topics, equal topic quotas, and all three difficulties without repeats', () => {
  for (let seed = 0; seed < 100; seed++) {
    const r = createRound({ random: seededRandom(seed) });
    assert(validRound(r));
    assert.equal(new Set(r.items.map(i => i.id)).size, 40);
    const qs = r.items.map(i => QUESTION_MAP.get(i.id));
    for (const t of TOPICS) { const subset=qs.filter(q=>q.topic===t.id); assert.equal(subset.length,5); assert.deepEqual([1,2,3].map(d=>subset.filter(q=>q.difficulty===d).length),[2,2,1]); }
    assert.deepEqual([1, 2, 3].map(d => qs.filter(q => q.difficulty === d).length), [16, 16, 8]);
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

test('Trial levels select sixteen unique questions of one difficulty, two per topic', () => {
  for (const difficulty of [1,2,3]) for(let seed=0;seed<40;seed++) {
    const r=createRound({mode:'trial',difficulty,random:seededRandom(seed)});
    assert(validRound(r)); assert.equal(r.items.length,16);
    assert.equal(new Set(r.items.map(i=>i.id)).size,16);
    assert(r.items.every(i=>QUESTION_MAP.get(i.id).difficulty===difficulty));
    for(const t of TOPICS) assert.equal(r.items.filter(i=>QUESTION_MAP.get(i.id).topic===t.id).length,2);
    assert.equal(summarizeRound(finish(r)).level,null);
  }
  for(const difficulty of ['all','0','4','bogus','01',true,[]]) assert.throws(()=>createRound({mode:'trial',difficulty}));
  assert.throws(()=>createRound({mode:'daily'}));
  const wrong=createRound({mode:'trial',difficulty:3}); wrong.difficulty='1'; assert(!validRound(wrong));
});

test('Retired daily results stay readable but daily rounds can no longer start or resume', () => {
  const r=createRound({mode:'topic',topic:'overview',count:5}); r.mode='daily'; r.day='2026-11-01';
  assert(!validRound(r)); const done=finish(r); assert(validRound(done,true));
  assert.equal(summarizeRound(done).total,5); assert.equal(summarizeRound(done).level,null);
  assert.equal(hongKongDay(new Date('2026-11-01T16:01:00Z')),'2026-11-02');
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

test('Skips count toward denominator; topic, trial and revision do not award a General title', () => {
  for (const mode of ['topic', 'trial', 'review']) {
    const r = finish(createRound({ mode, difficulty:'2', ids: ['old-01', 'new-01'] }), () => null);
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

test('Existing General progress retains its original allocation and options', () => {
  const quotas={overview:6,old:6,new:6,people:6,context:6,theology:4,history:3,language:3};
  const r=createRound(); delete r.bankRevision; delete r.distribution;
  r.items=TOPICS.flatMap(t=>[...LEGACY_QUESTION_MAP.values()].filter(q=>q.topic===t.id).slice(0,quotas[t.id]).map(q=>({id:q.id,order:[0,1,2,3]})));
  assert(validRound(r));
  const old=questionForRound(r,'language-15');
  assert.deepEqual(old.options,LEGACY_QUESTION_MAP.get('language-15').options);
  assert.notDeepEqual(old.options,QUESTION_MAP.get('language-15').options);
  const completed=finish(r); assert(validRound(completed,true));
  assert.equal(summarizeRound(completed).percent,100);
  assert.deepEqual(summarizeRound(completed).breakdown.map(t=>t.total),Object.values(quotas));
});

test('Current vocabulary questions use related terms as distractors', () => {
  assert.deepEqual(QUESTION_MAP.get('language-15').options,['靈、風或氣息','魂、生命或個體','話語、信息或道理','心思、理解或意念']);
  assert.deepEqual(QUESTION_MAP.get('history-02').options,['325年','313年','381年','431年']);
  assert(QUESTION_MAP.get('old-05').question.includes('細小圓物'));
  assert(QUESTION_MAP.get('theology-07').question.startsWith('保羅'));
});
