import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const rows = JSON.parse(await readFile(new URL('../research/deuteronomy.json', import.meta.url), 'utf8'));
assert.equal(rows.length, 100, 'Deuteronomy course must have 100 questions');
// The first five questions in each unit are foundational; the next five ask for closer reading.
const unitCounts = new Map();
const questions = rows.map((q, index) => {
  const chapter = Number(q.reference.match(/[0-9]+/)?.[0]);
  assert(Number.isInteger(chapter) && chapter >= 1 && chapter <= 34, q.question);
  const inUnit = unitCounts.get(q.unit) || 0;
  unitCounts.set(q.unit, inUnit + 1);
  return { ...q, difficulty: inUnit < 5 ? 1 : 2, id: `deuteronomy-${String(index + 1).padStart(3, '0')}`, topic: 'deuteronomy', source: `https://rcuv.hkbs.org.hk/RCUV2/DEU/${chapter}/`, verification: `https://bible.usccb.org/bible/deuteronomy/${chapter}` };
});
assert.equal(new Set(questions.map(q => q.question)).size, 100, 'Deuteronomy question wording must be unique');
for (const [i, q] of questions.entries()) {
  assert.equal(q.id, `deuteronomy-${String(i + 1).padStart(3, '0')}`);
  assert.equal(q.options.length, 4, q.id);
  assert.equal(new Set(q.options).size, 4, q.id);
  assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
  assert(q.explanation.length >= 20, q.id);
  assert(q.reference.startsWith('申命記'), q.id);
  for (const url of [q.source, q.verification]) assert.equal(new URL(url).protocol, 'https:', q.id);
}
for (let unit = 1; unit <= 10; unit++) assert.equal(questions.filter(q => q.unit === `d${unit}`).length, 10, `d${unit}`);
await writeFile(new URL('../dist/deuteronomy-data.mjs', import.meta.url), `export const DEUTERONOMY_DATA = ${JSON.stringify(questions, null, 2)};\n`);
console.log('Built 100 Deuteronomy questions across ten lessons.');
