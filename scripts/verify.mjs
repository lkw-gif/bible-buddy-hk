import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { QUESTIONS, TOPICS } from '../dist/questions.mjs';
import { HISTORY_QUESTIONS, COURSE_UNITS } from '../dist/history-course.mjs';
import { CHALLENGE_QUESTIONS } from '../dist/challenge-data.mjs';
import { BIBLE_QUESTIONS, BIBLE_UNITS } from '../dist/bible-course.mjs';
import { GENESIS_QUESTIONS, GENESIS_UNITS, GENESIS_HARD_QUESTIONS, GENESIS_LEVEL_POOLS } from '../dist/genesis-course.mjs';
import { EXODUS_QUESTIONS, EXODUS_UNITS, EXODUS_HARD_QUESTIONS, EXODUS_LEVEL_POOLS } from '../dist/exodus-course.mjs';
import { NUMBERS_QUESTIONS, NUMBERS_UNITS, NUMBERS_HARD_QUESTIONS, NUMBERS_LEVEL_POOLS } from '../dist/numbers-course.mjs';
const ids = new Set(), prompts = new Set();
assert.equal(QUESTIONS.length, 240);
assert.equal(HISTORY_QUESTIONS.length,100);
assert.equal(COURSE_UNITS.length,10);
assert.equal(CHALLENGE_QUESTIONS.length,40);
assert.equal(GENESIS_QUESTIONS.length,100);assert.equal(GENESIS_UNITS.length,10);
assert(GENESIS_HARD_QUESTIONS.length >= 20);
assert.deepEqual(GENESIS_HARD_QUESTIONS,JSON.parse(await readFile(new URL('../research/genesis-hard.json',import.meta.url),'utf8')));
for(const level of [1,2,3])assert(GENESIS_LEVEL_POOLS[level].length>=10);
const genesisResearch=(await Promise.all(['a','b'].map(async group=>JSON.parse(await readFile(new URL(`../research/genesis-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(GENESIS_QUESTIONS.map(({topic,...question})=>question),genesisResearch,'Rebuild genesis-data.mjs after editing Genesis research');
for(const unit of GENESIS_UNITS)assert.equal(GENESIS_QUESTIONS.filter(q=>q.unit===unit.id).length,10,unit.id);
assert.equal(EXODUS_QUESTIONS.length,100);assert.equal(EXODUS_UNITS.length,10);
assert(EXODUS_HARD_QUESTIONS.length >= 20);
assert.deepEqual(EXODUS_HARD_QUESTIONS,JSON.parse(await readFile(new URL('../research/exodus-hard.json',import.meta.url),'utf8')));
const exodusResearch=(await Promise.all(['a','b'].map(async group=>JSON.parse(await readFile(new URL(`../research/exodus-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(EXODUS_QUESTIONS.map(({topic,...question})=>question),exodusResearch.map(({topic,...question})=>question),'Rebuild exodus-data.mjs after editing Exodus research');
for(const unit of EXODUS_UNITS)assert.equal(EXODUS_QUESTIONS.filter(q=>q.unit===unit.id).length,10,unit.id);
for(const level of [1,2,3])assert(EXODUS_LEVEL_POOLS[level].length>=10,`Exodus trial level ${level}`);
assert.equal(NUMBERS_QUESTIONS.length,100);assert.equal(NUMBERS_UNITS.length,10);assert.equal(NUMBERS_HARD_QUESTIONS.length,20);
assert.deepEqual(NUMBERS_HARD_QUESTIONS,JSON.parse(await readFile(new URL('../research/numbers-hard.json',import.meta.url),'utf8')));
const numbersResearch=JSON.parse(await readFile(new URL('../research/numbers.json',import.meta.url),'utf8')).map((q,i)=>({...q,id:`numbers-${String(i+1).padStart(3,'0')}`,topic:'numbers',source:`https://rcuv.hkbs.org.hk/RCUV2/NUM/${Number(q.reference.match(/[0-9]+/)?.[0])}/`,verification:`https://bible.usccb.org/bible/numbers/${Number(q.reference.match(/[0-9]+/)?.[0])}`}));
assert.deepEqual(NUMBERS_QUESTIONS,numbersResearch,'Rebuild numbers-data.mjs after editing research/numbers.json');
for(const unit of NUMBERS_UNITS)assert.equal(NUMBERS_QUESTIONS.filter(q=>q.unit===unit.id).length,10,unit.id);
assert.equal(NUMBERS_LEVEL_POOLS[1].length,50);assert.equal(NUMBERS_LEVEL_POOLS[2].length,50);assert.equal(NUMBERS_LEVEL_POOLS[3].length,20);
for(const unit of NUMBERS_UNITS){assert.equal(NUMBERS_LEVEL_POOLS[1].filter(q=>q.unit===unit.id).length,5,unit.id+' low balance');assert.equal(NUMBERS_LEVEL_POOLS[2].filter(q=>q.unit===unit.id).length,5,unit.id+' medium balance');}
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
for (const q of [...QUESTIONS,...HISTORY_QUESTIONS,...CHALLENGE_QUESTIONS,...BIBLE_QUESTIONS,...GENESIS_QUESTIONS,...GENESIS_HARD_QUESTIONS,...EXODUS_QUESTIONS,...EXODUS_HARD_QUESTIONS,...NUMBERS_QUESTIONS,...NUMBERS_HARD_QUESTIONS]) {
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
    assert(q.explanation.length >= (q.id.startsWith('genesis-') || q.id.startsWith('exodus-') || q.id.startsWith('numbers-') ? 15 : 35),q.id+' learning explanation');
    assert((q.id.startsWith('genesis-') ? GENESIS_UNITS : q.id.startsWith('exodus-') ? EXODUS_UNITS : q.id.startsWith('numbers-') ? NUMBERS_UNITS : q.id.startsWith('bible-') ? BIBLE_UNITS : COURSE_UNITS).some(u => u.id === q.unit),q.id+' unit');
    assert([1,2,3].includes(q.difficulty),q.id+' difficulty');
  }
}
for (const f of ['index.html', 'app.mjs', 'styles.css', 'engine.mjs', 'choices.mjs', 'copy-edits.mjs', 'history-course.mjs', 'history-data.mjs', 'challenge-data.mjs', 'bible-course.mjs', 'bible-data.mjs', 'genesis-course.mjs', 'genesis-data.mjs', 'genesis-hard-data.mjs', 'exodus-course.mjs', 'exodus-data.mjs', 'exodus-hard-data.mjs', 'numbers-course.mjs', 'numbers-data.mjs', 'numbers-hard-data.mjs', 'assets/hero.png', 'assets/favicon.svg']) await access(new URL('../dist/' + f, import.meta.url));
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert(html.includes('lang="zh-HK"'));
assert(!html.includes('codex-preview'));
console.log(`Question bank verified: ${QUESTIONS.length} base, ${CHALLENGE_QUESTIONS.length} advanced, ${HISTORY_QUESTIONS.length} church-history, ${BIBLE_QUESTIONS.length} Bible-knowledge, ${EXODUS_QUESTIONS.length} Exodus and ${NUMBERS_QUESTIONS.length}+${NUMBERS_HARD_QUESTIONS.length} Numbers questions; assets and sources present.`);
