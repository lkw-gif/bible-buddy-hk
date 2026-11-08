import { MARK_DATA, MARK_HARD_DATA } from './mark-data.mjs?v=20261108-1';
export const MARK_TOPIC={id:'mark',name:'馬可福音',icon:'book',color:'sage',tip:'跟住馬可福音認識耶穌嘅服事、受苦同復活。',reading:'馬可福音1:1'};
const ranges=['1–2','3–4','5–6','7–8','9','10–11','12','13','14','15–16'];
export const MARK_UNITS=ranges.map((range,i)=>({id:`mk${i+1}`,name:`馬可福音第${i+1}課`,period:`馬可福音 ${range} 章`,description:'按經文次序，認識耶穌所做嘅事同教導。'}));
export const MARK_QUESTIONS=MARK_DATA;
export const MARK_HARD_QUESTIONS=MARK_HARD_DATA;
export const MARK_QUESTION_MAP=new Map(MARK_QUESTIONS.map(q=>[q.id,q]));
export const MARK_HARD_MAP=new Map(MARK_HARD_QUESTIONS.map(q=>[q.id,q]));
export const MARK_LEVEL_POOLS={1:MARK_QUESTIONS.filter(q=>q.difficulty===1),2:MARK_QUESTIONS.filter(q=>q.difficulty===2),3:MARK_HARD_QUESTIONS};
export function cleanMarkAnswers(value){if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(Object.entries(value).filter(([id,correct])=>MARK_QUESTION_MAP.has(id)&&typeof correct==='boolean'));}
export function markStatus(answers,unit){const qs=unit?MARK_QUESTIONS.filter(q=>q.unit===unit):MARK_QUESTIONS;return {total:qs.length,answered:qs.filter(q=>typeof answers[q.id]==='boolean').length,correct:qs.filter(q=>answers[q.id]===true).length};}
