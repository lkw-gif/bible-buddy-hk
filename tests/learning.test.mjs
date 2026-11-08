import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHURCH_LESSONS,KINGDOM_DATA} from '../dist/learning-data.mjs';
import {COURSE_UNITS} from '../dist/history-course.mjs';
import {HISTORY_QUESTIONS} from '../dist/history-course.mjs';
import {lessonView} from '../dist/learning-view.mjs';
import {HISTORY_LEGACY_DATA} from '../dist/history-legacy.mjs';
import {createRound,validRound,questionForRound} from '../dist/engine.mjs';
test('Reviewed learning sources match website; all lessons, events and questions are complete',async()=>{
 assert.deepEqual(CHURCH_LESSONS,JSON.parse(await readFile(new URL('../research/church-learning.json',import.meta.url),'utf8')));
 assert.deepEqual(KINGDOM_DATA,JSON.parse(await readFile(new URL('../research/kingdom-learning.json',import.meta.url),'utf8')));
 assert.deepEqual(CHURCH_LESSONS.map(l=>l.id),COURSE_UNITS.map(u=>u.id));
 assert.equal(KINGDOM_DATA.lessons.length,10);assert.equal(KINGDOM_DATA.questions.length,100);
 assert.equal(new Set(KINGDOM_DATA.questions.map(q=>q.question)).size,100);
 for(const l of [...CHURCH_LESSONS,...KINGDOM_DATA.lessons]){assert(l.summary);assert(l.paragraphs.length>=2);assert(l.deeper.length);assert(l.events.every(e=>Number.isFinite(e.year)&&e.date&&e.text));assert(l.sources.every(u=>u.startsWith('https:')));}
 for(const l of KINGDOM_DATA.lessons){const r=createRound({mode:'kingdoms',unit:l.id});assert(validRound(r));assert.equal(r.items.length,10);for(const item of r.items){const q=questionForRound(r,item.id);assert.equal(q.unit,l.id);assert.equal(new Set(q.options).size,4);assert(q.reference&&q.source&&q.explanation.length>10);}}
 assert.equal(KINGDOM_DATA.rulers.north.length,19);assert.equal(KINGDOM_DATA.rulers.south.length,20);
});
test('All teaching questions point to visible reading; optional sources and background are absent',()=>{
 let timelines=0;
 for(const q of HISTORY_QUESTIONS){
  const lesson=CHURCH_LESSONS.find(l=>l.id===q.unit);
  assert(q.learningEvidence.length,q.id);
  for(const code of q.learningEvidence){const item=code[0]==='p'?lesson.paragraphs[Number(code.slice(1))]:lesson.events[Number(code.slice(1))];assert(item,q.id+':'+code);}
  if(q.learningEvidence.every(c=>c[0]==='e'))timelines++;
 }
 assert(timelines>=40); // At least four chronological or step-order questions in each lesson.
 for(const [track,lessons] of [['church',CHURCH_LESSONS],['kingdoms',KINGDOM_DATA.lessons]]){
  for(const lesson of lessons){const html=lessonView(track,lesson.id,{},s=>String(s));assert(!html.includes('lesson-sources'));assert(!html.includes('lesson-more'));assert(!html.includes('資料出處與延伸閱讀'));for(const paragraph of lesson.paragraphs)assert(html.includes(paragraph));}
 }
});
test('Saved church rounds still resolve their original question and answer after the reading revision',()=>{
 const round=createRound({mode:'church',unit:'early'}),id=round.items[0].id;
 const old=questionForRound({...round,lessonRevision:undefined},id),original=HISTORY_LEGACY_DATA.find(q=>q.id===id);
 assert.equal(old.question,original.question);assert.deepEqual(old.options,original.options);
 assert.notEqual(questionForRound(round,id).question,old.question);
});
