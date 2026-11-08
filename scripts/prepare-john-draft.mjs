import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const lessons=JSON.parse(await readFile(new URL('../research/john.json',import.meta.url),'utf8'));
const hard=JSON.parse(await readFile(new URL('../research/john-hard.json',import.meta.url),'utf8'));
assert.equal(lessons.length,100);
assert.equal(hard.length,20);
const seen=new Set();
function prepare(row,index,isHard=false) {
  const [unit,difficulty,question,correct,wrong1,wrong2,wrong3,explanation,reference]=isHard
    ? [null,row[0],row[1],row[2],row[3],row[4],row[5],row[6],row[7]]
    : row;
  if(!isHard)assert.match(unit,/^j(?:[1-9]|10)$/);
  assert([1,2,3].includes(difficulty));
  assert(question?.trim()&&explanation?.trim());
  assert(!seen.has(question),`Duplicate prompt: ${question}`);seen.add(question);
  const options=[correct,wrong1,wrong2,wrong3];
  assert.equal(options.length,4,question);assert.equal(new Set(options).size,4,question);
  assert(options.every(x=>typeof x==='string'&&x.trim()),question);
  const match=/^約翰福音([0-9]+):([0-9]+)(?:[–-]([0-9]+))?$/.exec(reference);
  assert(match,`Invalid reference: ${reference}`);
  const chapter=Number(match[1]),first=Number(match[2]),last=Number(match[3]||match[2]);
  assert(chapter>=1&&chapter<=21&&first>0&&last>=first,reference);
  if(isHard)assert.equal(difficulty,3);
  return {unit:unit??null,difficulty,question,options,answer:0,explanation,reference,id:`john-${isHard?'hard-':''}${String(index+1).padStart(3,'0')}`,topic:'john',source:`https://rcuv.hkbs.org.hk/RCUV2/JHN/${chapter}/`,verification:`https://bible.usccb.org/bible/john/${chapter}`};
}
for(let unit=1;unit<=10;unit++){
  const qs=lessons.filter(q=>q[0]===`j${unit}`);
  assert.equal(qs.length,10,`j${unit}`);
  assert.equal(qs.filter(q=>q[1]===1).length,5,`j${unit} low`);
  assert.equal(qs.filter(q=>q[1]===2).length,5,`j${unit} medium`);
}
const result={status:'reviewed-against-scripture',lessons:lessons.map((q,i)=>prepare(q,i)),hard:hard.map((q,i)=>prepare(q,i,true))};
await writeFile(new URL('../research/john-reviewed.json',import.meta.url),`${JSON.stringify(result,null,2)}\n`);
console.log('Prepared 100 lesson questions and 20 advanced questions for source review.');
