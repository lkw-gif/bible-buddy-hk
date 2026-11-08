import test from 'node:test';
import assert from 'node:assert/strict';
import { MATTHEW_QUESTIONS, MATTHEW_HARD_QUESTIONS, MATTHEW_UNITS, MATTHEW_LEVEL_POOLS } from '../dist/matthew-course.mjs';
import { createRound, validRound, questionForRound } from '../dist/engine.mjs';

test('Matthew covers ten lessons and separate balanced difficulty pools with references', () => {
  assert.equal(MATTHEW_QUESTIONS.length,100);
  assert.equal(MATTHEW_HARD_QUESTIONS.length,20);
  assert.equal(MATTHEW_UNITS.length,10);
  const all=[...MATTHEW_QUESTIONS,...MATTHEW_HARD_QUESTIONS];
  assert.equal(new Set(all.map(q=>q.id)).size,120);
  assert.equal(new Set(all.map(q=>q.question)).size,120);
  for(const q of all) {
    assert.equal(q.options.length,4,q.id); assert.equal(new Set(q.options).size,4,q.id);
    assert.equal(q.answer,0,q.id); assert.match(q.reference,/^馬太福音\d+:\d+/);
    assert(q.explanation && q.source && q.verification,q.id);
  }
  for(const u of MATTHEW_UNITS) {
    const qs=MATTHEW_QUESTIONS.filter(q=>q.unit===u.id);
    assert.equal(qs.length,10,u.id);
    assert.deepEqual([1,2].map(d=>qs.filter(q=>q.difficulty===d).length),[5,5]);
    const round=createRound({mode:'matthew',unit:u.id});
    assert(validRound(round)); assert(round.items.every(i=>questionForRound(round,i.id).unit===u.id));
  }
  assert.deepEqual([1,2,3].map(d=>MATTHEW_LEVEL_POOLS[d].length),[50,50,20]);
});

test('Matthew level rounds use their own pool, prefer unseen questions and resume safely', () => {
  for(const difficulty of ['1','2','3']) {
    const first=createRound({mode:'matthew-level',difficulty});
    assert(validRound(first));
    const firstIds=first.items.map(i=>i.id);
    assert(firstIds.every(id=>MATTHEW_LEVEL_POOLS[difficulty].some(q=>q.id===id)));
    const second=createRound({mode:'matthew-level',difficulty,seenIds:firstIds});
    assert(validRound(second));
    assert(second.items.every(i=>!firstIds.includes(i.id)));
    const bogus={...first,topic:'genesis'};
    assert.equal(validRound(bogus),false);
  }
});
