import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const rows = (await Promise.all(['a', 'b'].map(async group => {
  const file = new URL(`../research/exodus-${group}.json`, import.meta.url);
  return JSON.parse(await readFile(file, 'utf8'));
}))).flat().sort((a, b) => a.id.localeCompare(b.id));

assert.equal(rows.length, 100, 'Exodus must have exactly 100 questions');
assert.equal(new Set(rows.map(q => q.question)).size, 100, 'Exodus question wording must be unique');
for (const [index, q] of rows.entries()) {
  assert.equal(q.id, `exodus-${String(index + 1).padStart(3, '0')}`);
  if (q.topic !== undefined) assert.equal(q.topic, 'exodus', q.id);
  assert.equal(q.options.length, 4, q.id);
  assert.equal(new Set(q.options).size, 4, q.id);
  assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
  assert(q.explanation.length >= 15, q.id);
  assert(q.reference.includes('出埃及記'), q.id);
  assert.equal(q.difficulty, 1, q.id);
  for (const url of [q.source, q.verification]) assert.equal(new URL(url).protocol, 'https:', q.id);
}
for (let i = 1; i <= 10; i++) assert.equal(rows.filter(q => q.unit === `x${i}`).length, 10, `x${i}`);

const compiled = rows.map(({ topic, ...question }) => question);
await writeFile(new URL('../dist/exodus-data.mjs', import.meta.url), `export const EXODUS_DATA = ${JSON.stringify(compiled, null, 2)};\n`);
console.log('Built 100 Exodus questions across 10 lessons.');
