export const XP_LEVELS = [
  [0,'經文新手'],[100,'開卷有益'],[300,'經文熟客'],[700,'書卷行家'],
  [1300,'讀經達人'],[2200,'經卷老友'],[3500,'聖經老手'],[5200,'Bible Buddy 行家']
].map(([xp,title],i)=>({level:i+1,xp,title}));
const dayOf = date => {
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(date)).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};
export const firstReward = difficulty => 10 + ({2:2,3:4}[difficulty] || 0);
export function cleanXp(value) {
  const result={version:1,first:{},repeats:{}};
  for(const [id,entry] of Object.entries(value?.first || {})) {
    if(!/^[\w-]+$/.test(id)||!entry||!Number.isFinite(entry.at)||typeof entry.attempt!=='string')continue;
    result.first[id]={difficulty:[1,2,3].includes(entry.difficulty)?entry.difficulty:1,at:entry.at,attempt:entry.attempt};
  }
  for(const [day,entries] of Object.entries(value?.repeats || {})) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!entries||typeof entries!=='object')continue;
    result.repeats[day]=Object.fromEntries(Object.entries(entries).filter(([id,event])=>result.first[id]&&typeof event==='string'));
  }
  return result;
}
export function totalXp(value) {
  const p=cleanXp(value);
  return Object.values(p.first).reduce((sum,e)=>sum+firstReward(e.difficulty),0)+Object.values(p.repeats).reduce((sum,entries)=>sum+Math.min(20,Object.keys(entries).length*2),0);
}
export function xpStatus(value) {
  const xp=totalXp(value), current=XP_LEVELS.findLast(l=>xp>=l.xp),next=XP_LEVELS[current.level];
  return {...current,total:xp,next,percent:next?Math.min(100,(xp-current.xp)/(next.xp-current.xp)*100):100,correct:Object.keys(cleanXp(value).first).length};
}
export function awardXp(value,q,{attempt,correct,at=Date.now()}={}) {
  const profile=cleanXp(value),before=xpStatus(profile);
  if(!correct)return {profile,gained:0,levelUp:false};
  const first=profile.first[q.id];
  if(!first)profile.first[q.id]={difficulty:q.difficulty||1,at,attempt};
  else if(first.attempt!==attempt) {
    const day=dayOf(at),entries=profile.repeats[day]||{};
    if(!entries[q.id]&&Object.keys(entries).length<10)profile.repeats[day]={...entries,[q.id]:attempt};
  }
  const after=xpStatus(profile);
  return {profile,gained:after.total-before.total,levelUp:after.level>before.level,title:after.title,level:after.level};
}
export function prepareXp(progress,questionMap,questionForRound) {
  if(progress.xp?.version===1)return cleanXp(progress.xp);
  const profile=cleanXp(null);
  const credit=q=>{if(q&&!profile.first[q.id])profile.first[q.id]={difficulty:q.difficulty||1,at:0,attempt:'legacy:'+q.id};};
  for(const [key,answers] of Object.entries(progress))if(key.endsWith('Answers')) {
    for(const [id,correct] of Object.entries(answers||{}))if(correct===true)credit(questionMap.get(id));
  }
  for(const round of [...(progress.history||[]),...(progress.current?[progress.current]:[])]) {
    round.items?.forEach((item,i)=>{const q=questionForRound(round,item.id);if(q&&round.answers?.[i]?.selected===q.answer)credit(q);});
  }
  return profile;
}
export function mergeXp(a,b) {
  a=cleanXp(a);b=cleanXp(b);
  for(const [id,entry] of Object.entries(b.first))if(!a.first[id]||entry.at<a.first[id].at)a.first[id]=entry;
  for(const [day,entries] of Object.entries(b.repeats))a.repeats[day]={...a.repeats[day],...entries};
  return cleanXp(a);
}
