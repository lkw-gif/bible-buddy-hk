import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const rows=JSON.parse(await readFile(new URL('../research/genesis-hard.json',import.meta.url),'utf8'));
assert(rows.length>=20);
for(const [i,q] of rows.entries()) { assert.equal(q.id,`genesis-hard-${String(i+1).padStart(3,'0')}`); assert.equal(q.topic,'genesis'); assert.equal(q.difficulty,3); assert.equal(q.answer,0); assert.equal(q.options.length,4); assert.equal(new Set(q.options).size,4); assert(q.reference&&q.explanation.length>10); for(const u of [q.source,q.verification]) assert.equal(new URL(u).protocol,'https:'); }
await writeFile(new URL('../dist/genesis-hard-data.mjs',import.meta.url),'export const GENESIS_HARD_DATA = '+JSON.stringify(rows,null,2)+';\n');
console.log('Built '+rows.length+' advanced Genesis questions.');
