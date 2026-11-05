import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { QUESTIONS, TOPICS } from '../dist/questions.mjs';
import { HISTORY_QUESTIONS, COURSE_UNITS } from '../dist/history-course.mjs';
import { CHALLENGE_QUESTIONS } from '../dist/challenge-data.mjs';
import { BIBLE_QUESTIONS, BIBLE_UNITS } from '../dist/bible-course.mjs';
import { GENESIS_QUESTIONS, GENESIS_UNITS } from '../dist/genesis-course.mjs';
const ids = new Set(), prompts = new Set();
assert.equal(QUESTIONS.length, 240);
assert.equal(HISTORY_QUESTIONS.length,100);
assert.equal(COURSE_UNITS.length,10);
assert.equal(CHALLENGE_QUESTIONS.length,40);
assert.equal(GENESIS_QUESTIONS.length,100);assert.equal(GENESIS_UNITS.length,10);
const genesisResearch=(await Promise.all(['a','b'].map(async group=>JSON.parse(await readFile(new URL(`../research/genesis-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(GENESIS_QUESTIONS.map(({topic,...question})=>question),genesisResearch,'Rebuild genesis-data.mjs after editing Genesis research');
for(const unit of GENESIS_UNITS)assert.equal(GENESIS_QUESTIONS.filter(q=>q.unit===unit.id).length,10,unit.id);
assert.equal(BIBLE_QUESTIONS.length,100);assert.equal(BIBLE_UNITS.length,10);
const bibleResearch=(await Promise.all(['basics','ot','nt'].map(async group=>JSON.parse(await readFile(new URL(`../research/bible-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(BIBLE_QUESTIONS.map(({topic,...question})=>question),bibleResearch,'Rebuild bible-data.mjs after editing Bible research');
for(const unit of BIBLE_UNITS)assert.equal(BIBLE_QUESTIONS.filter(q=>q.unit===unit.id).length,10,unit.id);
const challengeResearch=(await Promise.all(['scripture','concepts'].map(async group=>JSON.parse(await readFile(new URL(`../research/challenge-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(CHALLENGE_QUESTIONS,challengeResearch,'Rebuild challenge-data.mjs after editing challenge research');
const research=(await Promise.all(['early','reformation','chinese'].map(async group => JSON.parse(await readFile(new URL(`../research/history-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(HISTORY_QUESTIONS.map(({topic,...question}) => question),research,'Rebuild history-data.mjs after editing research files');
for (const unit of COURSE_UNITS) assert.equal(HISTORY_QUESTIONS.filter(q => q.unit === unit.id).length,10,unit.id);
for (const t of TOPICS) {
  const items = QUESTIONS.filter(q => q.topic === t.id);
  assert.equal(items.length, 30, t.id);
  assert.equal(CHALLENGE_QUESTIONS.filter(q=>q.topic===t.id&&q.difficulty===3).length,5,t.id+' advanced');
  for (const d of [1, 2, 3]) assert.equal(items.filter(q => q.difficulty === d).length, 10, `${t.id} difficulty ${d}`);
}
for (const q of [...QUESTIONS,...HISTORY_QUESTIONS,...CHALLENGE_QUESTIONS,...BIBLE_QUESTIONS,...GENESIS_QUESTIONS]) {
  assert(!ids.has(q.id), `Duplicate id ${q.id}`); ids.add(q.id);
  assert(!prompts.has(q.question), `Duplicate question ${q.id}`); prompts.add(q.question);
  assert(q.question && q.explanation.length > 10 && q.reference, q.id);
  assert.equal(q.options.length, 4, q.id);
  assert.equal(new Set(q.options).size, 4, q.id);
  assert(q.options.every(x => typeof x === 'string' && x.length), q.id);
  assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
  assert.equal(new URL(q.source).protocol, 'https:', q.id);
  if (q.id.startsWith('challenge-')) assert.equal(new URL(q.verification).protocol,'https:',q.id+' verification');
  if (q.unit) {
    assert.equal(new URL(q.verification).protocol,'https:',q.id+' verification');
    assert(q.explanation.length >= (q.id.startsWith('genesis-') ? 15 : 35),q.id+' learning explanation');
    assert((q.id.startsWith('genesis-') ? GENESIS_UNITS : q.id.startsWith('bible-') ? BIBLE_UNITS : COURSE_UNITS).some(u => u.id === q.unit),q.id+' unit');
    assert([1,2,3].includes(q.difficulty),q.id+' difficulty');
  }
}
for (const f of ['index.html', 'app.mjs', 'styles.css', 'engine.mjs', 'choices.mjs', 'copy-edits.mjs', 'history-course.mjs', 'history-data.mjs', 'challenge-data.mjs', 'bible-course.mjs', 'bible-data.mjs', 'genesis-course.mjs', 'genesis-data.mjs', 'assets/hero.png', 'assets/favicon.svg']) await access(new URL('../dist/' + f, import.meta.url));
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert(html.includes('lang="zh-HK"'));
assert(!html.includes('codex-preview'));
console.log(`Question bank verified: ${QUESTIONS.length} base, ${CHALLENGE_QUESTIONS.length} advanced, ${HISTORY_QUESTIONS.length} church-history and ${BIBLE_QUESTIONS.length} Bible-knowledge questions; assets and sources present.`);
