import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, QUESTION_MAP, QUESTION_MAP_V2, TOPICS, LEGACY_QUESTION_MAP } from '../dist/questions.mjs';
import { createRound, answerRound, advanceRound, retreatRound, summarizeRound, levelFor, LEVELS, validRound, seededRandom, hongKongDay, integrateResult, questionForRound } from '../dist/engine.mjs';
import { COURSE_UNITS, HISTORY_QUESTIONS, HISTORY_TOPIC, cleanCourseAnswers, courseStatus } from '../dist/history-course.mjs';
import { CHALLENGE_QUESTIONS } from '../dist/challenge-data.mjs';
import { BIBLE_UNITS, BIBLE_QUESTIONS, BIBLE_TOPIC, cleanBibleAnswers, bibleStatus } from '../dist/bible-course.mjs';

function finish(round, decide = q => q.answer) {
  while (!round.finishedAt) { const q = QUESTION_MAP.get(round.items[round.index].id); round = advanceRound(answerRound(round, decide(q, round.index))); }
  return round;
}

test('General forty-question rounds favour foundational knowledge and evenly cover eight topics', () => {
  for (let seed = 0; seed < 100; seed++) {
    const r = createRound({ random: seededRandom(seed) });
    assert(validRound(r));
    assert.equal(new Set(r.items.map(i => i.id)).size, 40);
    const qs = r.items.map(i => QUESTION_MAP.get(i.id));
    assert.equal(r.distribution,'general-v5');
    for (const t of TOPICS) { const subset=qs.filter(q=>q.topic===t.id); assert.equal(subset.length,5); assert.equal(subset.filter(q=>q.difficulty===2).length,2); }
    assert.deepEqual([1, 2, 3].map(d => qs.filter(q => q.difficulty === d).length), [20, 16, 4]);
    assert(qs.every(q=>!q.id.startsWith('challenge-')));
    assert(r.items.every(i => [...i.order].sort().join('') === '0123'));
  }
  const corrupt=createRound();const index=corrupt.items.findIndex(i=>QUESTION_MAP.get(i.id).difficulty===3);
  const topic=QUESTION_MAP.get(corrupt.items[index].id).topic;
  corrupt.items[index]={id:CHALLENGE_QUESTIONS.find(q=>q.topic===topic).id,order:[0,1,2,3]};
  assert(!validRound(corrupt),'Dedicated advanced questions stay outside General');
});

test('Twenty-question General keeps ten basic, eight medium and two deeper questions with balanced topics', () => {
  const extraCounts=Object.fromEntries(TOPICS.map(t=>[t.id,0]));
  for(let seed=0;seed<200;seed++) {
    const r=createRound({count:20,random:seededRandom(seed)});
    assert(validRound(r)); assert.equal(new Set(r.items.map(i=>i.id)).size,20);
    const qs=r.items.map(i=>QUESTION_MAP.get(i.id));
    assert(qs.every(q=>!q.id.startsWith('challenge-')));
    assert.deepEqual([1,2,3].map(d=>qs.filter(q=>q.difficulty===d).length),[10,8,2]);
    let extras=0;
    for(const t of TOPICS) {
      const subset=qs.filter(q=>q.topic===t.id);
      assert([2,3].includes(subset.length));
      assert([1,2].includes(subset.filter(q=>q.difficulty===1).length));
      assert.equal(subset.filter(q=>q.difficulty===2).length,1);
      if(subset.length===3){extras++;extraCounts[t.id]++;}
    }
    assert.equal(extras,4);
  }
  for(const count of Object.values(extraCounts)) assert(count>60&&count<140);
  for(const count of [0,10,21,30,41,'bad']) assert.throws(()=>createRound({count}));
  // A valid total alone must not admit a topic/difficulty allocation that has been corrupted.
  const broken=createRound({count:20});broken.items=QUESTIONS.slice(0,20).map(q=>({id:q.id,order:[0,1,2,3]}));
  assert(!validRound(broken));
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
    assert(r.items.every(i=>i.id.startsWith('challenge-')===(difficulty===3)));
    if(difficulty===3)assert.equal(r.distribution,'trial-advanced-v5');
    for(const t of TOPICS) assert.equal(r.items.filter(i=>QUESTION_MAP.get(i.id).topic===t.id).length,2);
    assert.equal(summarizeRound(finish(r)).level,null);
  }
  for(const difficulty of ['all','0','4','bogus','01',true,[]]) assert.throws(()=>createRound({mode:'trial',difficulty}));
  assert.throws(()=>createRound({mode:'daily'}));
  const wrong=createRound({mode:'trial',difficulty:3}); wrong.difficulty='1'; assert(!validRound(wrong));
  const easyReplacement=createRound({mode:'trial',difficulty:3});const topic=QUESTION_MAP.get(easyReplacement.items[0].id).topic;
  easyReplacement.items[0]={id:QUESTIONS.find(q=>q.topic===topic&&q.difficulty===3).id,order:[0,1,2,3]};assert(!validRound(easyReplacement));
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

test('Previous and next navigation preserve answers, permit saved review cursors and keep scoring unchanged', () => {
  let r=createRound({count:20});assert.equal(retreatRound(r),r);
  for(const choice of [1,0,null])r=advanceRound(answerRound(r,choice));
  assert.equal(r.index,3);assert.equal(r.answers.length,3);
  r=retreatRound(retreatRound(retreatRound(r)));assert.equal(r.index,0);assert(validRound(r));
  assert.equal(answerRound(r,0),r);assert.equal(retreatRound(r),r);
  r=JSON.parse(JSON.stringify(r));assert(validRound(r));
  for(let i=0;i<3;i++)r=advanceRound(r);
  assert.equal(r.index,3);assert.equal(advanceRound(r),r);
  assert(!validRound({...r,index:4}));
  const done=finish(r);assert(validRound(done,true));assert.equal(retreatRound(done),done);
  const score=summarizeRound(done);assert.equal(score.correct,18);assert.equal(score.skipped,1);assert.equal(score.percent,90);
});

test('Existing advanced General and earlier high-trial progress remain readable', () => {
  const old=createRound();old.distribution='challenge-v4';
  old.items=TOPICS.flatMap(t=>[QUESTIONS.find(q=>q.topic===t.id&&q.difficulty===2),...CHALLENGE_QUESTIONS.filter(q=>q.topic===t.id).slice(0,4)].map(q=>({id:q.id,order:[0,1,2,3]})));
  assert(validRound(old));assert.equal(summarizeRound(finish(old)).percent,100);
  const trial=createRound({mode:'trial',difficulty:3});trial.distribution='balanced-v3';
  trial.items=TOPICS.flatMap(t=>QUESTIONS.filter(q=>q.topic===t.id&&q.difficulty===3).slice(0,2).map(q=>({id:q.id,order:[0,1,2,3]})));
  assert(validRound(trial));assert(validRound(finish(trial),true));
});

test('Scoring is correct across every reachable 20/40-question General score and level boundary', () => {
  for (const count of [20,40]) for (let correct = 0; correct <= count; correct++) {
    const r = finish(createRound({count}), (q, i) => i < correct ? q.answer : (q.answer + 1) % 4);
    const s = summarizeRound(r);
    assert.equal(s.correct, correct);
    assert.equal(s.percent, correct * 100 / count);
    assert.equal(s.level, levelFor(correct * 100 / count));
    assert(validRound(r, true));
    assert(!validRound(r));
  }
  for (const l of LEVELS) assert.equal(levelFor(l.min), l);
});

test('Existing balanced 40-question rounds and revision 2 answers remain valid', () => {
  const r=createRound();r.distribution='balanced-v3';
  r.items=TOPICS.flatMap(t=>[1,2,3].flatMap((difficulty,index)=>QUESTIONS.filter(q=>q.topic===t.id&&q.difficulty===difficulty).slice(0,[2,2,1][index]).map(q=>({id:q.id,order:[0,1,2,3]}))));
  assert(validRound(r));assert(validRound(finish(r),true));
  r.bankRevision=2;r.distribution='balanced-v2';
  assert(validRound(r));
  assert.deepEqual(questionForRound(r,'theology-24'),QUESTION_MAP_V2.get('theology-24'));
  assert.notDeepEqual(questionForRound(r,'theology-24').options,QUESTION_MAP.get('theology-24').options);
  assert(validRound(finish(r),true));
});

test('Reviewed stems avoid answer giveaways and the reported formal wording', () => {
  assert.equal(QUESTION_MAP.get('new-03').question,'耶穌揀選幾多位門徒作使徒？');
  const banned={ 'overview-04':/五經|五卷/, 'new-03':/十二/, 'new-06':/撒馬利亞/, 'history-25':/日內瓦/, 'people-23':/亞何利亞伯/ };
  for(const [id,pattern] of Object.entries(banned)) assert(!pattern.test(QUESTION_MAP.get(id).question),id);
  for(const q of QUESTIONS) {
    assert(!/唔宜|不宜|近文|語義範圍|職分圖像|較合宜|離體靈魂/.test([q.question,...q.options,q.explanation].join(' ')),q.id);
    if(/幾多位|幾卷/.test(q.question)) assert(!q.question.includes(q.options[q.answer]),q.id);
  }
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

test('Ten church-history lessons each expose ten questions with explanations and source checks', () => {
  const covered=new Set();
  for(const unit of COURSE_UNITS) {
    const r=createRound({mode:'church',unit:unit.id,random:seededRandom(unit.id)});
    assert(validRound(r));assert.equal(r.items.length,10);
    for(const item of r.items){const q=questionForRound(r,item.id);assert.equal(q.unit,unit.id);assert.equal(q.topic,HISTORY_TOPIC.id);assert(q.explanation.length>=35);assert(q.source.startsWith('https://'));assert(q.verification.startsWith('https://'));covered.add(q.id);}
    const result=finish(r);assert(validRound(result,true));const summary=summarizeRound(result);
    assert.equal(summary.percent,100);assert.equal(summary.level,null);
    assert.equal(summary.breakdown.find(t=>t.id===HISTORY_TOPIC.id).correct,10);
  }
  assert.equal(covered.size,100);assert.equal(HISTORY_QUESTIONS.length,100);
  assert.throws(()=>createRound({mode:'church',unit:'missing'}));
  const r=createRound({mode:'church',unit:'early'});assert(!validRound({...r,unit:'china'}));
  r.items[0]={id:'old-01',order:[0,1,2,3]};assert(!validRound(r));
});

test('History-study progress tolerates old data, tracks skipped answers, and works in mixed revision', () => {
  const answers=cleanCourseAnswers({'church-001':true,'church-002':false,'old-01':true,'missing':true,'church-003':'true'});
  assert.deepEqual(answers,{'church-001':true,'church-002':false});
  assert.deepEqual(cleanCourseAnswers(null),{});assert.deepEqual(cleanCourseAnswers([]),{});
  assert.deepEqual(courseStatus(answers,'early'),{total:10,answered:2,correct:1});
  assert.deepEqual(courseStatus(answers),{total:100,answered:2,correct:1});
  const r=createRound({mode:'review',ids:['church-001','old-01','church-001']});
  assert.equal(r.items.length,2);assert(validRound(r));
  const summary=summarizeRound(finish(r,q=>q.id==='church-001'?null:0));
  assert.equal(summary.correct,1);assert.equal(summary.skipped,1);assert.equal(summary.level,null);
});

test('Bible knowledge exposes one hundred basic questions across ten independent lessons', () => {
  const seen=new Set();
  for(const unit of BIBLE_UNITS){
    const r=createRound({mode:'bible',unit:unit.id});assert(validRound(r));assert.equal(r.items.length,10);
    for(const item of r.items){const q=questionForRound(r,item.id);assert.equal(q.unit,unit.id);assert.equal(q.topic,BIBLE_TOPIC.id);assert.equal(q.difficulty,1);assert(q.explanation.length>=35);seen.add(q.id);}
    const done=finish(r);assert(validRound(done,true));assert.equal(summarizeRound(done).level,null);assert.equal(summarizeRound(done).correct,10);
  }
  assert.equal(seen.size,100);assert.equal(BIBLE_QUESTIONS.length,100);
  assert.throws(()=>createRound({mode:'bible',unit:'missing'}));
  const malformed=createRound({mode:'bible',unit:'overview'});malformed.items[0]={id:'overview-01',order:[0,1,2,3]};assert(!validRound(malformed));
  const answers=cleanBibleAnswers({'bible-001':true,'bible-002':false,'church-001':true,'old-01':true,'bible-003':'true'});
  assert.deepEqual(answers,{'bible-001':true,'bible-002':false});assert.deepEqual(cleanBibleAnswers(null),{});
  assert.deepEqual(bibleStatus(answers),{total:100,answered:2,correct:1});
  const mixed=finish(createRound({mode:'review',ids:['bible-001','church-001','old-01']}));
  assert.equal(summarizeRound(mixed).correct,3);assert.equal(summarizeRound(mixed).breakdown.filter(t=>t.total).length,3);
});
