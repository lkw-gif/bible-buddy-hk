import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeProgress,cleanName,accountStorageKey,publicMember} from '../dist/account-data.mjs';
import {awardXp,totalXp} from '../dist/experience.mjs';
test('Concurrent device merges retain unique XP and per-question latest results without mutating inputs',()=>{
 const make=(id)=>awardXp(null,{id,difficulty:1},{correct:true,attempt:id,at:1}).profile;
 const a={updatedAt:100,history:[],xp:make('a'),genesisAnswers:{a:true},answerTimes:{genesisAnswers:{a:90}},genesisSeen:['a'],displayName:'新名',profileUpdatedAt:50};
 const b={updatedAt:200,history:[],xp:make('b'),genesisAnswers:{a:false,b:true},answerTimes:{genesisAnswers:{a:80,b:190}},genesisSeen:['b'],displayName:'舊名',profileUpdatedAt:10};
 const merged=mergeProgress(a,b);
 assert.equal(totalXp(merged.xp),20);assert.deepEqual(merged.genesisAnswers,{a:true,b:true});
 assert.equal(merged.displayName,'新名');assert.deepEqual(new Set(merged.genesisSeen),new Set(['a','b']));
 assert.deepEqual(a.genesisSeen,['a']);assert.equal(totalXp(mergeProgress(merged,b).xp),20);
});
test('Public summaries include name and XP only, and names have a bounded Unicode length',()=>{
 assert.deepEqual(Object.keys(publicMember({displayName:'同學',email:'secret@example.com',history:[{answer:'secret'}]})),['displayName','xp']);
 assert.equal(cleanName('  阿明\n  '),'阿明');assert.equal(Array.from(cleanName('羊'.repeat(30))).length,24);
 assert.notEqual(accountStorageKey('alice'),accountStorageKey('bob'));assert.notEqual(accountStorageKey(),accountStorageKey('alice'));
});


test('Private reading changes merge per lesson, including undo, independently of public summaries',()=>{
 const a={updatedAt:100,history:[],learningReads:{'church:early':{done:true,at:90},'kingdoms:saul':{done:true,at:40}},learningPositions:{church:{lesson:'early',at:90}}};
 const b={updatedAt:200,history:[],learningReads:{'church:early':{done:false,at:95}},learningPositions:{kingdoms:{lesson:'saul',at:180}}};
 const merged=mergeProgress(a,b);assert.equal(merged.learningReads['church:early'].done,false);assert.equal(merged.learningReads['kingdoms:saul'].done,true);assert.equal(merged.learningPositions.church.lesson,'early');assert.equal(merged.learningPositions.kingdoms.lesson,'saul');assert(!Object.hasOwn(publicMember(merged),'learningReads'));
});
