import { JOHN_DATA, JOHN_HARD_DATA } from './john-data.mjs?v=20261108-1';
export const JOHN_TOPIC={id:'john',name:'約翰福音',icon:'book',color:'sage',tip:'跟住約翰福音認識耶穌的身份、記號同教導。',reading:'約翰福音1:1'};
const ranges=['1–2','3–4','5–6','7–8','9–10','11–12','13–14','15–16','17–18','19–21'];
export const JOHN_UNITS=ranges.map((range,i)=>({id:`j${i+1}`,name:`約翰福音第${i+1}課`,period:`約翰福音 ${range} 章`,description:'按經文次序，認識耶穌所行的記號同教導。'}));
export const JOHN_QUESTIONS=JOHN_DATA;
export const JOHN_HARD_QUESTIONS=JOHN_HARD_DATA;
export const JOHN_QUESTION_MAP=new Map(JOHN_QUESTIONS.map(q=>[q.id,q]));
export const JOHN_HARD_MAP=new Map(JOHN_HARD_QUESTIONS.map(q=>[q.id,q]));
export const JOHN_LEVEL_POOLS={1:JOHN_QUESTIONS.filter(q=>q.difficulty===1),2:JOHN_QUESTIONS.filter(q=>q.difficulty===2),3:JOHN_HARD_QUESTIONS};
export function cleanJohnAnswers(value){if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(Object.entries(value).filter(([id,correct])=>JOHN_QUESTION_MAP.has(id)&&typeof correct==='boolean'));}
export function johnStatus(answers,unit){const qs=unit?JOHN_QUESTIONS.filter(q=>q.unit===unit):JOHN_QUESTIONS;return {total:qs.length,answered:qs.filter(q=>typeof answers[q.id]==='boolean').length,correct:qs.filter(q=>answers[q.id]===true).length};}
