import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';

const groups=['early','reformation','chinese'];
const rows=(await Promise.all(groups.map(async group => JSON.parse(await readFile(new URL(`../research/history-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.equal(rows.length,100);
assert.equal(new Set(rows.map(q=>q.id)).size,100);
assert.equal(new Set(rows.map(q=>q.question)).size,100);
for(const [index,q] of rows.entries()) {
  assert.equal(q.id,`church-${String(index+1).padStart(3,'0')}`);
  assert.equal(q.options.length,4,q.id);
  assert.equal(new Set(q.options).size,4,q.id);
  assert.equal(q.answer,0,q.id);
  assert(q.explanation.length>=35,q.id);
  for(const url of [q.source,q.verification]) assert.equal(new URL(url).protocol,'https:',q.id);
}
await writeFile(new URL('../dist/history-data.mjs',import.meta.url),'// Original Cantonese learning questions. Sources and cross-checks are retained per question.\n// Rebuild with: node scripts/build-history.mjs\nexport const HISTORY_DATA = '+JSON.stringify(rows,null,2)+';\n');
console.log('Built 100 church-history learning questions.');
