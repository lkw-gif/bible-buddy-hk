import {totalXp, mergeXp} from './experience.mjs';
export const accountStorageKey=uid=>uid?'bible-buddy-hk:v1:user:'+uid:'bible-buddy-hk:v1';
export const publicMember=progress=>({displayName:cleanName(progress.displayName)||'讀經老友',xp:totalXp(progress.xp)});
export function cleanName(value) {
  return Array.from(String(value ?? '').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,'').trim()).slice(0,24).join('');
}
export function mergeProgress(a,b) {
  if(!a)return structuredClone(b);
  if(!b)return structuredClone(a);
  const [older,newer]=(a.updatedAt||0)>(b.updatedAt||0)?[b,a]:[a,b];
  const result={...older,...newer,xp:mergeXp(a.xp,b.xp)};
  for(const key of new Set([...Object.keys(a),...Object.keys(b)])) {
    if(key.endsWith('Answers')){
      result[key]={...older[key],...newer[key]};
      for(const id of Object.keys(result[key]))if((older.answerTimes?.[key]?.[id]||0)>(newer.answerTimes?.[key]?.[id]||0))result[key][id]=older[key][id];
    }
    if(key.endsWith('Seen'))result[key]=[...new Set([...(a[key]||[]),...(b[key]||[])])];
  }
  result.history=[...new Map([...(older.history||[]),...(newer.history||[])].map(r=>[r.id,r])).values()]
    .sort((x,y)=>Date.parse(y.finishedAt)-Date.parse(x.finishedAt)).slice(0,60);
  result.answerTimes={};
  for(const key of new Set([...Object.keys(a.answerTimes||{}),...Object.keys(b.answerTimes||{})])){result.answerTimes[key]={...a.answerTimes?.[key]};for(const [id,time] of Object.entries(b.answerTimes?.[key]||{}))result.answerTimes[key][id]=Math.max(time,result.answerTimes[key][id]||0);}
  for(const key of ['learningReads','learningPositions']){
    result[key]={...a[key]};for(const [id,entry] of Object.entries(b[key]||{}))if(!result[key][id]||(entry.at||0)>=(result[key][id].at||0))result[key][id]=entry;
  }
  const named=(a.profileUpdatedAt||0)>(b.profileUpdatedAt||0)?a:b;
  result.displayName=cleanName(named.displayName);result.profileUpdatedAt=named.profileUpdatedAt||0;
  return result;
}
