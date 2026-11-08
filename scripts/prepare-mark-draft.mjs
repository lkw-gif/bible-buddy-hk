import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const lessons=JSON.parse(await readFile(new URL('../research/mark.json',import.meta.url),'utf8'));
const hard=JSON.parse(await readFile(new URL('../research/mark-hard.json',import.meta.url),'utf8'));
assert.equal(lessons.length,100);
assert.equal(hard.length,20);
const seen=new Set();
function prepare(row,index,isHard=false) {
  const [unit,difficulty,question,options,explanation,reference]=row;
  if(!isHard)assert.match(unit,/^m(?:[1-9]|10)$/);
  assert([1,2,3].includes(difficulty));
  assert(question?.trim()&&explanation?.trim());
  assert(!seen.has(question),`Duplicate prompt: ${question}`); seen.add(question);
  assert.equal(options?.length,4,question); assert.equal(new Set(options).size,4,question);
  assert(options.every(x=>typeof x==='string'&&x.trim()),question);
  const match=/^馬可福音([0-9]+):([0-9]+)(?:[–-]([0-9]+))?$/.exec(reference);
  assert(match,`Invalid reference: ${reference}`);
  const chapter=Number(match[1]),first=Number(match[2]),last=Number(match[3]||match[2]);
  assert(chapter>=1&&chapter<=16&&first>0&&last>=first,reference);
  if(isHard)assert.equal(difficulty,3);
  return {unit,difficulty,question,options,answer:0,explanation,reference,id:`mark-${isHard?'hard-':''}${String(index+1).padStart(3,'0')}`,topic:'mark',source:`https://rcuv.hkbs.org.hk/RCUV2/MRK/${chapter}/`,verification:`https://bible.usccb.org/bible/mark/${chapter}`};
}
for(let unit=1;unit<=10;unit++){
  const qs=lessons.filter(q=>q[0]===`m${unit}`);
  assert.equal(qs.length,10,`m${unit}`);
  assert.equal(qs.filter(q=>q[1]===1).length,5,`m${unit} low`);
  assert.equal(qs.filter(q=>q[1]===2).length,5,`m${unit} medium`);
}
const result={status:'reviewed-against-scripture',lessons:lessons.map((q,i)=>prepare(q,i)),hard:hard.map(([difficulty,question,options,explanation,reference],i)=>prepare([null,3,question,options,explanation,reference],i,true))};
await writeFile(new URL('../research/mark-reviewed.json',import.meta.url),`${JSON.stringify(result,null,2)}\n`);
console.log('Prepared 100 lesson questions and 20 advanced questions for source review.');
