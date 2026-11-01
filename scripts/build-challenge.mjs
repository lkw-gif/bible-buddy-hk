import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const rows=(await Promise.all(['scripture','concepts'].map(async group=>JSON.parse(await readFile(new URL(`../research/challenge-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.equal(rows.length,40);
assert.equal(new Set(rows.map(q=>q.id)).size,40);
assert.equal(new Set(rows.map(q=>q.question)).size,40);
for(const topic of ['overview','old','new','people','context','theology','history','language'])assert.equal(rows.filter(q=>q.topic===topic).length,5,topic);
for(const q of rows){
  assert.equal(q.difficulty,3,q.id);assert.equal(q.answer,0,q.id);assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options).size,4,q.id);
  assert(q.explanation.length>=35,q.id);
  for(const url of [q.source,q.verification])assert.equal(new URL(url).protocol,'https:',q.id);
}
await writeFile(new URL('../dist/challenge-data.mjs',import.meta.url),'// Original advanced questions for the 40-question General quiz.\n// Build with: node scripts/build-challenge.mjs\nexport const CHALLENGE_QUESTIONS = '+JSON.stringify(rows,null,2)+';\n');
console.log('Built 40 advanced questions, five per topic.');
