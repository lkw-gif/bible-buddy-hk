import assert from 'node:assert/strict';
import { access, readFile, writeFile } from 'node:fs/promises';

const source = new URL('../research/exodus-hard.json', import.meta.url);
try { await access(source); }
catch {
  await writeFile(new URL('../dist/exodus-hard-data.mjs', import.meta.url), 'export const EXODUS_HARD_DATA = [];\n');
  console.warn('Exodus advanced pool not built: add research/exodus-hard.json (20 questions) when ready.');
  process.exitCode = 0;
  // Allow the standard course build to work while advanced questions are being prepared.
  process.exit();
}

const rows = JSON.parse(await readFile(source, 'utf8'));
assert(rows.length >= 20, 'Exodus advanced pool needs at least 20 questions');
for (const [index, q] of rows.entries()) {
  assert.equal(q.id, `exodus-hard-${String(index + 1).padStart(3, '0')}`);
  assert.equal(q.topic, 'exodus', q.id);
  assert.equal(q.difficulty, 3, q.id);
  assert.equal(q.answer, 0, q.id);
  assert.equal(q.options.length, 4, q.id);
  assert.equal(new Set(q.options).size, 4, q.id);
  assert(q.reference?.includes('出埃及記'), q.id);
  assert(q.explanation?.length >= 15, q.id);
  for (const url of [q.source, q.verification]) assert.equal(new URL(url).protocol, 'https:', q.id);
}
await writeFile(new URL('../dist/exodus-hard-data.mjs', import.meta.url), `export const EXODUS_HARD_DATA = ${JSON.stringify(rows, null, 2)};\n`);
console.log(`Built ${rows.length} advanced Exodus questions.`);
