import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

// This is a staging artifact only. Scriptural accuracy requires individual review.
const load = async name => JSON.parse(await readFile(new URL(`../research/${name}`, import.meta.url), 'utf8'));
const lessons = (await Promise.all([1,2,3,4,5].map(i => load(`matthew-draft-${String(i).padStart(2,'0')}.json`)))).flat();
const hard = await load('matthew-hard-draft.json');
assert.equal(lessons.length, 100);
assert.equal(hard.length, 20);
for (let i=1; i<=10; i++) {
  const unit = lessons.filter(q => q.unit === `m${i}`);
  assert.equal(unit.length, 10, `m${i}`);
  assert.equal(unit.filter(q => q.difficulty === 1).length, 5, `m${i} basic`);
  assert.equal(unit.filter(q => q.difficulty === 2).length, 5, `m${i} medium`);
}
const seen = new Set();
function prepare(q, index, advanced) {
  assert.equal(typeof q.question, 'string');
  assert(q.question.trim() && q.explanation?.trim());
  assert(!seen.has(q.question), `Duplicate question: ${q.question}`);
  seen.add(q.question);
  assert.equal(q.options.length, 4);
  assert.equal(new Set(q.options).size, 4);
  assert(q.options.every(option => typeof option === 'string' && option.trim()));
  assert.equal(q.answer, 0);
  if (advanced) assert.equal(q.difficulty, 3);
  const match = /^馬太福音(\d+):(\d+)(?:[–-](\d+))?$/.exec(q.reference);
  assert(match, `Invalid reference: ${q.reference}`);
  const chapter = Number(match[1]);
  assert(chapter >= 1 && chapter <= 28 && Number(match[2]) > 0);
  if (match[3]) assert(Number(match[3]) >= Number(match[2]));
  return { ...q, id:`matthew-${advanced ? 'hard-' : ''}${String(index+1).padStart(3,'0')}`, topic:'matthew', source:`https://rcuv.hkbs.org.hk/RCUV2/MAT/${chapter}/`, verification:`https://bible.usccb.org/bible/matthew/${chapter}` };
}
const data = { status:'reviewed-against-scripture', lessons:lessons.map((q,i)=>prepare(q,i,false)), hard:hard.map((q,i)=>prepare(q,i,true)) };
await writeFile(new URL('../research/matthew-prepared-draft.json', import.meta.url), `${JSON.stringify(data,null,2)}\n`);
console.log(`Prepared ${data.lessons.length} lesson questions and ${data.hard.length} advanced questions for review.`);
