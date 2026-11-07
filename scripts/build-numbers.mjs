import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const rows = JSON.parse(await readFile(new URL('../research/numbers.json', import.meta.url), 'utf8'));
assert.equal(rows.length, 100, 'Numbers course must have 100 questions');
const questions = rows.map((q, index) => {
  const chapter = Number(q.reference.match(/[0-9]+/)?.[0]);
  assert(Number.isInteger(chapter) && chapter >= 1 && chapter <= 36, q.question);
  return { ...q, id: `numbers-${String(index + 1).padStart(3, '0')}`, topic: 'numbers', source: `https://rcuv.hkbs.org.hk/RCUV2/NUM/${chapter}/`, verification: `https://bible.usccb.org/bible/numbers/${chapter}` };
});
assert.equal(new Set(questions.map(q => q.question)).size, 100, 'Numbers question wording must be unique');
assert.equal(new Set(questions.map(q => q.id)).size, 100);
for (const [i, q] of questions.entries()) {
  assert.equal(q.id, `numbers-${String(i + 1).padStart(3, '0')}`);
  assert.equal(q.difficulty, 1, q.id);
  assert.equal(q.options.length, 4, q.id);
  assert.equal(new Set(q.options).size, 4, q.id);
  assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
  assert(q.explanation.length >= 20, q.id);
  assert(q.reference.startsWith('民數記'), q.id);
  for (const url of [q.source, q.verification]) assert.equal(new URL(url).protocol, 'https:', q.id);
}
for (let unit = 1; unit <= 10; unit++) assert.equal(questions.filter(q => q.unit === `n${unit}`).length, 10, `n${unit}`);
await writeFile(new URL('../dist/numbers-data.mjs', import.meta.url), `export const NUMBERS_DATA = ${JSON.stringify(questions, null, 2)};\n`);
console.log('Built 100 Numbers questions across ten lessons.');
