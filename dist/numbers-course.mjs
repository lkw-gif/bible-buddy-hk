import { NUMBERS_HARD_DATA } from './numbers-hard-data.mjs?v=20261107-1';
import { NUMBERS_DATA } from './numbers-data.mjs?v=20261107-1';

export const NUMBERS_TOPIC = {
  id: 'numbers', name: '民數記', icon: 'people', color: 'lavender',
  tip: '由西奈點算到約旦河東，跟住百姓嘅曠野路程認識民數記。', reading: '民數記1:1'
};
const ranges = ['1–4', '4–6', '7–9', '9–13', '13–15', '16–19', '19–21', '21–24', '25–28', '29–36'];
export const NUMBERS_UNITS = ranges.map((range, i) => ({
  id: `n${i + 1}`, name: `民數記第${i + 1}課`, period: `民數記 ${range} 章`,
  description: '按經文次序，認識曠野旅程、人物同重要細節。'
}));
export const NUMBERS_QUESTIONS = NUMBERS_DATA;
export const NUMBERS_HARD_QUESTIONS = NUMBERS_HARD_DATA;
export const NUMBERS_HARD_MAP = new Map(NUMBERS_HARD_QUESTIONS.map(q => [q.id, q]));
export const NUMBERS_QUESTION_MAP = new Map(NUMBERS_QUESTIONS.map(q => [q.id, q]));
const BASIC_IDS = new Set(NUMBERS_UNITS.flatMap(unit => NUMBERS_QUESTIONS.filter(q => q.unit === unit.id).slice(0, 5).map(q => q.id)));
export const NUMBERS_LEVEL_POOLS = {
  1: NUMBERS_QUESTIONS.filter(q => BASIC_IDS.has(q.id)),
  2: NUMBERS_QUESTIONS.filter(q => !BASIC_IDS.has(q.id)),
  3: NUMBERS_HARD_QUESTIONS
};
export function cleanNumbersAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, correct]) => NUMBERS_QUESTION_MAP.has(id) && typeof correct === 'boolean'));
}
export function numbersStatus(answers, unit) {
  const questions = unit ? NUMBERS_QUESTIONS.filter(q => q.unit === unit) : NUMBERS_QUESTIONS;
  return { total: questions.length, answered: questions.filter(q => typeof answers[q.id] === 'boolean').length, correct: questions.filter(q => answers[q.id] === true).length };
}
