import { HISTORY_DATA } from './history-data.mjs?v=20261101-7';

export const HISTORY_TOPIC = {
  id:'church-history', name:'教會歷史篇', icon:'church', color:'sand',
  tip:'先記住人物、地方同事件點樣連埋，再慢慢記年份。睇埋每題嘅歷史資料，認識唔同傳統點樣走過嚟。',
  reading:'每題附有歷史資料連結'
};
export const COURSE_UNITS = [
  {id:'early',name:'初期教會的起步',period:'使徒時代至第二世紀',description:'福音點樣傳開？早期信徒點樣生活，同面對壓力？'},
  {id:'creeds',name:'信經與初期教會',period:'第四至第五世紀為主',description:'教會點解開會議、寫信經，同埋整理信仰教導？'},
  {id:'medieval',name:'中世紀的教會',period:'第六至第十五世紀為主',description:'認識修道、宣教、教會分裂，同教育文化嘅發展。'},
  {id:'reformation',name:'宗教改革的開始',period:'十六世紀',description:'路德、慈運理同加爾文面對咩問題？佢哋想改啲咩？'},
  {id:'traditions',name:'改革後的教會',period:'十六至十七世紀為主',description:'認識唔同教會傳統嘅由來，學習明白同尊重彼此。'},
  {id:'mission',name:'復興與普世宣教',period:'十七至十九世紀為主',description:'由復興運動到海外宣教，睇信徒點樣回應信仰。'},
  {id:'china',name:'福音來到中國',period:'唐代至近代',description:'由早期傳入，到譯經、辦學同華人教會嘅成長。'},
  {id:'hongkong',name:'香港教會的足跡',period:'十九至二十世紀為主',description:'由本地教會、學校同醫療服務，認識身邊嘅歷史。'},
  {id:'modern',name:'二十世紀與普世教會',period:'二十世紀',description:'認識宣教、合一、教會更新同唔同地方嘅信仰見證。'},
  {id:'reading',name:'點樣讀教會歷史',period:'學習方法',description:'分清史料、傳說同解讀，唔好聽到一個故事就當全部真相。'}
];
export const HISTORY_QUESTIONS = HISTORY_DATA.map(q => ({...q,topic:HISTORY_TOPIC.id}));
export const HISTORY_QUESTION_MAP = new Map(HISTORY_QUESTIONS.map(q => [q.id,q]));
export const COURSE_REFERENCES = [
  {name:'吳國傑：《奠基立柱——初期教會縱橫談》書介',url:'https://www.logos.com.hk/bf/acms/content.asp?code=LP232-2A&op=show&site=logosbf&type=product'},
  {name:'吳國傑：《拆壁重修——宗教改革縱橫談》出版社公開試讀',url:'https://www.logos.com.hk/acms/upload/logos/images/book-preview/LP264/LP264.pdf'},
  {name:'吳國傑：從宗派研究經驗反思香港教會對史料與統計的處理（2008年院訊，第11–13頁）',url:'https://www.hkbts.edu.hk/wp-content/uploads/2023/03/200810_Newsletter.pdf#page=11'},
  {name:'香港浸信會神學院：吳國傑教授資料',url:'https://www.hkbts.edu.hk/en/faculty/division-of-christian-thought/nathan-ng/'}
];
export function cleanCourseAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id,correct]) => HISTORY_QUESTION_MAP.has(id) && typeof correct === 'boolean'));
}
export function courseStatus(answers,unit) {
  const questions = unit ? HISTORY_QUESTIONS.filter(q => q.unit === unit) : HISTORY_QUESTIONS;
  return {total:questions.length,answered:questions.filter(q => typeof answers[q.id] === 'boolean').length,correct:questions.filter(q => answers[q.id] === true).length};
}
