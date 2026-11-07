import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const rows = JSON.parse(await readFile(new URL('../research/leviticus-hard.json', import.meta.url), 'utf8'));
assert.equal(rows.length, 20, 'Leviticus advanced pool must have 20 questions');
for (const [i, q] of rows.entries()) {
  assert.equal(q.id, `leviticus-hard-${String(i + 1).padStart(3, '0')}`);
  assert.equal(q.topic, 'leviticus');
  assert.equal(q.difficulty, 3);
  assert.equal(q.answer, 0, q.id);
  assert.equal(q.options.length, 4, q.id);
  assert.equal(new Set(q.options).size, 4, q.id);
  assert(q.reference.startsWith('利未記'), q.id);
  assert(q.explanation.length >= 20, q.id);
  for (const url of [q.source, q.verification]) assert.equal(new URL(url).protocol, 'https:', q.id);
}
await writeFile(new URL('../dist/leviticus-hard-data.mjs', import.meta.url), `export const LEVITICUS_HARD_DATA = ${JSON.stringify(rows, null, 2)};\n`);
console.log('Built 20 advanced Leviticus questions.');
