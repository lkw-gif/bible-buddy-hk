import {KINGDOM_DATA} from './learning-data.mjs';
export const KINGDOM_TOPIC={id:'kingdoms',name:'王國與先知',icon:'book',color:'sage',tip:'先分清南北國，再對照君王同先知。',reading:'列王紀上12章'};
export const KINGDOM_UNITS=KINGDOM_DATA.lessons.map(l=>({...l,name:l.title,description:l.summary}));
export const KINGDOM_QUESTIONS=KINGDOM_DATA.questions;
export const KINGDOM_MAP=new Map(KINGDOM_QUESTIONS.map(q=>[q.id,q]));
export function cleanKingdomAnswers(value){return Object.fromEntries(Object.entries(value||{}).filter(([id,v])=>KINGDOM_MAP.has(id)&&typeof v==='boolean'));}
export function kingdomStatus(answers,unit){const qs=KINGDOM_QUESTIONS.filter(q=>!unit||q.unit===unit);return {total:qs.length,answered:qs.filter(q=>typeof answers[q.id]==='boolean').length,correct:qs.filter(q=>answers[q.id]===true).length};}
