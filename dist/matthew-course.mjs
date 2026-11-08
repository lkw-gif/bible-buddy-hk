import { MATTHEW_DATA, MATTHEW_HARD_DATA } from './matthew-data.mjs?v=20261108-1';

export const MATTHEW_TOPIC = { id:'matthew', name:'馬太福音', icon:'book', color:'sage', tip:'跟住馬太福音認識耶穌的生平、教導和復活。', reading:'馬太福音1:1' };
const ranges = ['1–4','5–7','8–10','11–13','14–16','17–19','20–22','23–25','26','27–28'];
export const MATTHEW_UNITS = ranges.map((range,i)=>({ id:`m${i+1}`, name:`馬太福音第${i+1}課`, period:`馬太福音 ${range} 章`, description:'跟住經文，認識耶穌的生平同教導。' }));
export const MATTHEW_QUESTIONS = MATTHEW_DATA;
export const MATTHEW_HARD_QUESTIONS = MATTHEW_HARD_DATA;
export const MATTHEW_QUESTION_MAP = new Map(MATTHEW_QUESTIONS.map(q=>[q.id,q]));
export const MATTHEW_HARD_MAP = new Map(MATTHEW_HARD_QUESTIONS.map(q=>[q.id,q]));
export const MATTHEW_LEVEL_POOLS = { 1:MATTHEW_QUESTIONS.filter(q=>q.difficulty===1), 2:MATTHEW_QUESTIONS.filter(q=>q.difficulty===2), 3:MATTHEW_HARD_QUESTIONS };
export function cleanMatthewAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id,correct])=>MATTHEW_QUESTION_MAP.has(id) && typeof correct==='boolean'));
}
export function matthewStatus(answers,unit) {
  const questions=unit ? MATTHEW_QUESTIONS.filter(q=>q.unit===unit) : MATTHEW_QUESTIONS;
  return {total:questions.length,answered:questions.filter(q=>typeof answers[q.id]==='boolean').length,correct:questions.filter(q=>answers[q.id]===true).length};
}
