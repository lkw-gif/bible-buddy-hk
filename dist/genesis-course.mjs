import { GENESIS_HARD_DATA } from './genesis-hard-data.mjs?v=20261107-2';
import { GENESIS_DATA } from './genesis-data.mjs?v=20261105-2';
export const GENESIS_TOPIC={id:'genesis',name:'創世記',icon:'book',color:'sage',tip:'逐段重溫創世記經文。',reading:'創世記1:1'};
const ranges=['1–3','3–9','11–16','17–21','22–24','25–28','29–33','34–39','40–42','43–50'];
export const GENESIS_UNITS=ranges.map((range,i)=>({id:`g${i+1}`,name:`創世記第${i+1}課`,period:`創世記 ${range} 章`,description:'按經文次序，重溫故事同重要細節。'}));
export const GENESIS_QUESTIONS=GENESIS_DATA.map(q=>({...q,topic:GENESIS_TOPIC.id}));
// Basic story milestones; the other course questions require more attention to details.
const BASIC_IDS = new Set([1,2,3,4,5,6,7,8,9,10,11,13,14,16,17,18,19,20,21,22,23,24,28,31,32,33,35,37,38,39,40,42,43,45,47,51,52,53,57,59,63,68,69,70,73,74,75,78,79,84,85,86,87,88,90,93,94,95,98,100].map(n=>`genesis-${String(n).padStart(3,'0')}`));
export const GENESIS_LEVEL_POOLS = {1:GENESIS_QUESTIONS.filter(q=>BASIC_IDS.has(q.id)),2:GENESIS_QUESTIONS.filter(q=>!BASIC_IDS.has(q.id)),3:GENESIS_HARD_DATA};
export const GENESIS_HARD_QUESTIONS = GENESIS_HARD_DATA;
export const GENESIS_HARD_MAP = new Map(GENESIS_HARD_QUESTIONS.map(q=>[q.id,q]));
export const GENESIS_QUESTION_MAP=new Map(GENESIS_QUESTIONS.map(q=>[q.id,q]));
export function cleanGenesisAnswers(value){if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(Object.entries(value).filter(([id,correct])=>GENESIS_QUESTION_MAP.has(id)&&typeof correct==='boolean'));}
export function genesisStatus(answers,unit){const qs=unit?GENESIS_QUESTIONS.filter(q=>q.unit===unit):GENESIS_QUESTIONS;return {total:qs.length,answered:qs.filter(q=>typeof answers[q.id]==='boolean').length,correct:qs.filter(q=>answers[q.id]===true).length};}
