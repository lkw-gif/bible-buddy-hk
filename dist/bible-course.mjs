import { BIBLE_DATA } from './bible-data.mjs?v=20261101-13';
export const BIBLE_TOPIC = {
  id:'bible-knowledge',name:'聖經知識',icon:'book',color:'sage',
  tip:'先認熟新舊約目錄同各類書卷，再揀一卷慢慢讀。唔使一開始就背晒，每課學識幾樣就有進步。',
  reading:'路加福音24:27,44-49'
};
export const BIBLE_UNITS = [
  {id:'overview',name:'認識整本聖經',period:'聖經入門',description:'新舊約有幾多卷？目錄、章同節應該點睇？'},
  {id:'law',name:'律法書',period:'舊約書卷分類',description:'認識由創世記到申命記嘅五卷書，同當中嘅主要內容。'},
  {id:'ot-history',name:'舊約歷史書',period:'舊約書卷分類',description:'由約書亞記到以斯帖記，認識以色列人行過嘅路。'},
  {id:'wisdom',name:'詩歌與智慧書',period:'舊約書卷分類',description:'分清約伯記、詩篇、箴言、傳道書同雅歌。'},
  {id:'major',name:'大先知書',period:'舊約書卷分類',description:'認識以賽亞書、耶利米書、哀歌、以西結書同但以理書。'},
  {id:'minor',name:'小先知書',period:'舊約書卷分類',description:'邊啲書屬於小先知？由何西阿書到瑪拉基書，逐步認熟。'},
  {id:'gospels',name:'四福音與使徒行傳',period:'新約書卷分類',description:'四福音記耶穌，使徒行傳記教會點樣開始傳開福音。'},
  {id:'paul',name:'認識保羅書信',period:'新約書卷分類',description:'有啲寫畀教會，有啲寫畀同工，睇吓你分唔分得清。'},
  {id:'other',name:'其他書信與啟示錄',period:'新約書卷分類',description:'認識希伯來書、其他使徒書信，同聖經最後一卷。'},
  {id:'foundations',name:'基礎人物與讀經',period:'基本知識重溫',description:'重溫熟悉人物、重要事件，同讀經時要留意嘅基本方法。'}
];
export const BIBLE_QUESTIONS = BIBLE_DATA.map(q=>({...q,topic:BIBLE_TOPIC.id}));
export const BIBLE_QUESTION_MAP = new Map(BIBLE_QUESTIONS.map(q=>[q.id,q]));
export function cleanBibleAnswers(value) {
  if(!value || typeof value!=='object' || Array.isArray(value))return {};
  return Object.fromEntries(Object.entries(value).filter(([id,correct])=>BIBLE_QUESTION_MAP.has(id)&&typeof correct==='boolean'));
}
export function bibleStatus(answers,unit) {
  const questions=unit ? BIBLE_QUESTIONS.filter(q=>q.unit===unit) : BIBLE_QUESTIONS;
  return {total:questions.length,answered:questions.filter(q=>typeof answers[q.id]==='boolean').length,correct:questions.filter(q=>answers[q.id]===true).length};
}
