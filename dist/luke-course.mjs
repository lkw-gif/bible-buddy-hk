import { LUKE_DATA, LUKE_HARD_DATA } from './luke-data.mjs?v=20261108-2';
export const LUKE_TOPIC={id:'luke',name:'路加福音',icon:'book',color:'sage',tip:'跟住路加福音認識耶穌嘅憐憫、教導同復活。',reading:'路加福音1:1'};
const ranges=['1–2','3–4','5–6','7–8','9–10','11–12','13–15','16–18','19–21','22–24'];
export const LUKE_UNITS=ranges.map((range,i)=>({id:`l${i+1}`,name:`路加福音第${i+1}課`,period:`路加福音 ${range} 章`,description:'跟住經文次序，認識耶穌所做嘅事同教導。'}));
export const LUKE_QUESTIONS=LUKE_DATA;
export const LUKE_HARD_QUESTIONS=LUKE_HARD_DATA;
export const LUKE_QUESTION_MAP=new Map(LUKE_QUESTIONS.map(q=>[q.id,q]));
export const LUKE_HARD_MAP=new Map(LUKE_HARD_QUESTIONS.map(q=>[q.id,q]));
export const LUKE_LEVEL_POOLS={1:LUKE_QUESTIONS.filter(q=>q.difficulty===1),2:LUKE_QUESTIONS.filter(q=>q.difficulty===2),3:LUKE_HARD_QUESTIONS};
export function cleanLukeAnswers(value){if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(Object.entries(value).filter(([id,correct])=>LUKE_QUESTION_MAP.has(id)&&typeof correct==='boolean'));}
export function lukeStatus(answers,unit){const qs=unit?LUKE_QUESTIONS.filter(q=>q.unit===unit):LUKE_QUESTIONS;return {total:qs.length,answered:qs.filter(q=>typeof answers[q.id]==='boolean').length,correct:qs.filter(q=>answers[q.id]===true).length};}
