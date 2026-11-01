import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const rows=(await Promise.all(['basics','ot','nt'].map(async group=>JSON.parse(await readFile(new URL(`../research/bible-${group}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.equal(rows.length,100);assert.equal(new Set(rows.map(q=>q.question)).size,100);
for(const [index,q]of rows.entries()){
  assert.equal(q.id,`bible-${String(index+1).padStart(3,'0')}`);assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options).size,4,q.id);assert.equal(q.answer,0,q.id);assert(q.explanation.length>=35,q.id);assert.equal(q.difficulty,1,q.id);
  for(const url of [q.source,q.verification])assert.equal(new URL(url).protocol,'https:',q.id);
}
for(const unit of ['overview','law','ot-history','wisdom','major','minor','gospels','paul','other','foundations'])assert.equal(rows.filter(q=>q.unit===unit).length,10,unit);
await writeFile(new URL('../dist/bible-data.mjs',import.meta.url),'// Original Cantonese foundational Bible learning questions.\n// Build with: node scripts/build-bible.mjs\nexport const BIBLE_DATA = '+JSON.stringify(rows,null,2)+';\n');
console.log('Built 100 Bible-knowledge questions across ten lessons.');
