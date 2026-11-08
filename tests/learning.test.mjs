import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHURCH_LESSONS,KINGDOM_DATA} from '../dist/learning-data.mjs';
import {COURSE_UNITS} from '../dist/history-course.mjs';
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
