import test from 'node:test';
import assert from 'node:assert/strict';
import {awardXp,cleanXp,totalXp,xpStatus,prepareXp,XP_LEVELS} from '../dist/experience.mjs';
const date=Date.parse('2026-11-08T12:00:00+08:00');
const q=(id,difficulty=1)=>({id,difficulty,answer:0});
test('XP rewards correctness at each difficulty, including first correct after wrong and skips',()=>{
  let profile=cleanXp();
  for(const difficulty of [1,2,3]){
    const question=q('question-'+difficulty,difficulty);
    const wrong=awardXp(profile,question,{attempt:'wrong',correct:false,at:date});
    assert.equal(wrong.gained,0);
    const right=awardXp(wrong.profile,question,{attempt:'right',correct:true,at:date});
    assert.equal(right.gained,10+(difficulty-1)*2);profile=right.profile;
    assert.equal(awardXp(profile,question,{attempt:'right',correct:true,at:date}).gained,0);
  }
  assert.equal(totalXp(profile),36);
});
test('Repeated correct answers have per-question and global daily caps, resetting at Hong Kong midnight',()=>{
  let profile=cleanXp();
  for(let i=0;i<11;i++)profile=awardXp(profile,q('q-'+i),{attempt:'first-'+i,correct:true,at:date}).profile;
  for(let i=0;i<11;i++){
    const a=awardXp(profile,q('q-'+i),{attempt:'repeat-'+i,correct:true,at:date});
    assert.equal(a.gained,i<10?2:0);profile=a.profile;
    assert.equal(awardXp(profile,q('q-'+i),{attempt:'again-'+i,correct:true,at:date}).gained,0);
  }
  const beforeMidnight=Date.parse('2026-11-08T15:59:59Z');
  assert.equal(awardXp(profile,q('q-0'),{attempt:'before',correct:true,at:beforeMidnight}).gained,0);
  const next=awardXp(profile,q('q-0'),{attempt:'next-day',correct:true,at:beforeMidnight+1000});
  assert.equal(next.gained,2);assert.equal(totalXp(next.profile),132);
});
test('Migration credits recoverable correct questions once across maps, history and unfinished rounds',()=>{
  const map=new Map([['a',q('a',2)],['b',q('b',3)],['c',q('c')]]);
  const round={items:[{id:'a'},{id:'b'},{id:'c'}],answers:[{selected:0},{selected:0},{selected:null}]};
  const progress={courseAnswers:{a:true,c:false},history:[round],current:round};
  const xp=prepareXp(progress,map,(_,id)=>map.get(id));
  assert.equal(totalXp(xp),26);assert.equal(Object.keys(xp.first).length,2);
  assert.deepEqual(prepareXp({...progress,xp},map,()=>{throw Error('Must not re-migrate');}),xp);
  assert.equal(totalXp(prepareXp({history:[],xp},new Map(),()=>{})),26);
});
test('Every cumulative threshold unlocks its title and progress stays bounded',()=>{
  for(const rank of XP_LEVELS){
    const first=Object.fromEntries(Array.from({length:rank.xp/10},(_,i)=>['q-'+i,{difficulty:1,at:0,attempt:'a'}]));
    const status=xpStatus({first});assert.equal(status.title,rank.title);assert.equal(status.level,rank.level);
    assert(status.percent>=0&&status.percent<=100);
  }
  assert.equal(xpStatus({first:{broken:null}}).total,0);
});
