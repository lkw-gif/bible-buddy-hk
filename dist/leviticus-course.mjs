import { LEVITICUS_HARD_DATA } from './leviticus-hard-data.mjs?v=20261107-1';
import { LEVITICUS_DATA } from './leviticus-data.mjs?v=20261107-1';

export const LEVITICUS_TOPIC = {
  id: 'leviticus', name: '利未記', icon: 'book', color: 'sage',
  tip: '由獻祭、祭司同節期規定，認識利未記點樣教百姓敬拜同生活。', reading: '利未記1:1'
};
const ranges = ['1–3', '4–7', '8–10', '11–13', '14–15', '16–17', '18–20', '21–22', '23–24', '25–27'];
export const LEVITICUS_UNITS = ranges.map((range, i) => ({
  id: `l${i + 1}`, name: `利未記第${i + 1}課`, period: `利未記 ${range} 章`,
  description: '按經文次序，認識獻祭、節期、律法同百姓生活。'
}));
export const LEVITICUS_QUESTIONS = LEVITICUS_DATA;
export const LEVITICUS_HARD_QUESTIONS = LEVITICUS_HARD_DATA;
export const LEVITICUS_HARD_MAP = new Map(LEVITICUS_HARD_QUESTIONS.map(q => [q.id, q]));
export const LEVITICUS_QUESTION_MAP = new Map(LEVITICUS_QUESTIONS.map(q => [q.id, q]));
const BASIC_IDS = new Set(LEVITICUS_UNITS.flatMap(unit => LEVITICUS_QUESTIONS.filter(q => q.unit === unit.id).slice(0, 5).map(q => q.id)));
export const LEVITICUS_LEVEL_POOLS = {
  1: LEVITICUS_QUESTIONS.filter(q => BASIC_IDS.has(q.id)),
  2: LEVITICUS_QUESTIONS.filter(q => !BASIC_IDS.has(q.id)),
  3: LEVITICUS_HARD_QUESTIONS
};
export function cleanLeviticusAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, correct]) => LEVITICUS_QUESTION_MAP.has(id) && typeof correct === 'boolean'));
}
export function leviticusStatus(answers, unit) {
  const questions = unit ? LEVITICUS_QUESTIONS.filter(q => q.unit === unit) : LEVITICUS_QUESTIONS;
  return { total: questions.length, answered: questions.filter(q => typeof answers[q.id] === 'boolean').length, correct: questions.filter(q => answers[q.id] === true).length };
}
