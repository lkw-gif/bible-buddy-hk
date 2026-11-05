import test from 'node:test';
import assert from 'node:assert/strict';
import {GENESIS_QUESTIONS,GENESIS_UNITS,GENESIS_TOPIC,genesisStatus} from '../dist/genesis-course.mjs';
import {createRound,seededRandom,validRound,answerRound,advanceRound,summarizeRound} from '../dist/engine.mjs';
test('Genesis offers ten complete lessons and a random ten-question quiz',()=>{
 assert.equal(GENESIS_QUESTIONS.length,100);
 for(const unit of GENESIS_UNITS){const r=createRound({mode:'genesis',unit:unit.id});assert.equal(r.items.length,10);assert(validRound(r));assert(r.items.every(i=>GENESIS_QUESTIONS.find(q=>q.id===i.id).unit===unit.id));}
 const a=createRound({mode:'genesis-test',random:seededRandom('one')});const b=createRound({mode:'genesis-test',random:seededRandom('two')});assert.equal(a.items.length,10);assert.equal(new Set(a.items.map(i=>i.id)).size,10);assert.notDeepEqual(a.items.map(i=>i.id),b.items.map(i=>i.id));assert(validRound(a));assert.equal(a.topic,GENESIS_TOPIC.id);
 let r=a;while(!r.finishedAt)r=advanceRound(answerRound(r,0));assert.equal(summarizeRound(r).correct,10);assert.equal(summarizeRound(r).level,null);assert(validRound(r,true));assert.equal(genesisStatus({}).total,100);
});

test('Earlier Genesis rounds keep their original wording and choices after the revision', async()=>{
 const {questionForRound}=await import('../dist/engine.mjs');const {GENESIS_DATA:old}=await import('../dist/genesis-legacy-data.mjs');
 const newer=createRound({mode:'genesis',unit:'g1'});const id=newer.items[0].id;const legacy={...newer,bankRevision:3};
 assert.deepEqual(questionForRound(legacy,id).options,old.find(q=>q.id===id).options);assert.equal(newer.bankRevision,4);assert.equal(questionForRound(newer,id).question,GENESIS_QUESTIONS.find(q=>q.id===id).question);
});
