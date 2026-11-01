import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { QUESTIONS, TOPICS } from '../dist/questions.mjs';
const ids = new Set(), prompts = new Set();
assert.equal(QUESTIONS.length, 240);
for (const t of TOPICS) {
  const items = QUESTIONS.filter(q => q.topic === t.id);
  assert.equal(items.length, 30, t.id);
  for (const d of [1, 2, 3]) assert.equal(items.filter(q => q.difficulty === d).length, 10, `${t.id} difficulty ${d}`);
}
for (const q of QUESTIONS) {
  assert(!ids.has(q.id), `Duplicate id ${q.id}`); ids.add(q.id);
  assert(!prompts.has(q.question), `Duplicate question ${q.id}`); prompts.add(q.question);
  assert(q.question && q.explanation.length > 10 && q.reference, q.id);
  assert.equal(q.options.length, 4, q.id);
  assert.equal(new Set(q.options).size, 4, q.id);
  assert(q.options.every(x => typeof x === 'string' && x.length), q.id);
  assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
  assert.equal(new URL(q.source).protocol, 'https:', q.id);
}
for (const f of ['index.html', 'app.mjs', 'styles.css', 'engine.mjs', 'choices.mjs', 'copy-edits.mjs', 'assets/hero.png', 'assets/favicon.svg']) await access(new URL('../dist/' + f, import.meta.url));
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert(html.includes('lang="zh-HK"'));
assert(!html.includes('codex-preview'));
console.log(`Question bank verified: ${QUESTIONS.length} unique questions, ${TOPICS.length} topics, 3 difficulties; required assets present.`);
