import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const rows=(await Promise.all(['a','b'].map(async x=>JSON.parse(await readFile(new URL(`../research/genesis-${x}.json`,import.meta.url),'utf8'))))).flat().sort((a,b)=>a.id.localeCompare(b.id));
assert.equal(rows.length,100);assert.equal(new Set(rows.map(q=>q.question)).size,100);
for(const [i,q] of rows.entries()){assert.equal(q.id,`genesis-${String(i+1).padStart(3,'0')}`);assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options).size,4,q.id);assert.equal(q.answer,0,q.id);assert(q.explanation.length>10,q.id);assert.equal(q.difficulty,1,q.id);assert(q.reference.includes('創世記'),q.id);for(const u of [q.source,q.verification])assert.equal(new URL(u).protocol,'https:',q.id)}
for(let i=1;i<=10;i++)assert.equal(rows.filter(q=>q.unit===`g${i}`).length,10,`g${i}`);
await writeFile(new URL('../dist/genesis-data.mjs',import.meta.url),'export const GENESIS_DATA = '+JSON.stringify(rows,null,2)+';\n');console.log('Built 100 Genesis questions.');
