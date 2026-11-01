import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { QUESTIONS, TOPICS } from '../dist/questions.mjs';
import { HISTORY_QUESTIONS, COURSE_UNITS } from '../dist/history-course.mjs';
const ids = new Set(), prompts = new Set();
assert.equal(QUESTIONS.length, 240);
assert.equal(HISTORY_QUESTIONS.length,100);
assert.equal(COURSE_UNITS.length,10);
const research=(await Promise.all(['early','reformation','chinese'].map(async group => JSON.parse(await readFile(new URL(`../research/history-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(HISTORY_QUESTIONS.map(({topic,...question}) => question),research,'Rebuild history-data.mjs after editing research files');
for (const unit of COURSE_UNITS) assert.equal(HISTORY_QUESTIONS.filter(q => q.unit === unit.id).length,10,unit.id);
for (const t of TOPICS) {
  const items = QUESTIONS.filter(q => q.topic === t.id);
  assert.equal(items.length, 30, t.id);
  for (const d of [1, 2, 3]) assert.equal(items.filter(q => q.difficulty === d).length, 10, `${t.id} difficulty ${d}`);
}
for (const q of [...QUESTIONS,...HISTORY_QUESTIONS]) {
  assert(!ids.has(q.id), `Duplicate id ${q.id}`); ids.add(q.id);
  assert(!prompts.has(q.question), `Duplicate question ${q.id}`); prompts.add(q.question);
  assert(q.question && q.explanation.length > 10 && q.reference, q.id);
  assert.equal(q.options.length, 4, q.id);
  assert.equal(new Set(q.options).size, 4, q.id);
  assert(q.options.every(x => typeof x === 'string' && x.length), q.id);
  assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
  assert.equal(new URL(q.source).protocol, 'https:', q.id);
  if (q.unit) {
    assert.equal(new URL(q.verification).protocol,'https:',q.id+' verification');
    assert(q.explanation.length >= 35,q.id+' learning explanation');
    assert(COURSE_UNITS.some(u => u.id === q.unit),q.id+' unit');
    assert([1,2,3].includes(q.difficulty),q.id+' difficulty');
  }
}
for (const f of ['index.html', 'app.mjs', 'styles.css', 'engine.mjs', 'choices.mjs', 'copy-edits.mjs', 'history-course.mjs', 'history-data.mjs', 'assets/hero.png', 'assets/favicon.svg']) await access(new URL('../dist/' + f, import.meta.url));
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert(html.includes('lang="zh-HK"'));
assert(!html.includes('codex-preview'));
console.log(`Question bank verified: ${QUESTIONS.length} General questions and ${HISTORY_QUESTIONS.length} church-history questions across ${COURSE_UNITS.length} lessons; required assets and sources present.`);
