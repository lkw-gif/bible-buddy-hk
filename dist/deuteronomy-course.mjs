import { DEUTERONOMY_HARD_DATA } from './deuteronomy-hard-data.mjs?v=20261107-1';
import { DEUTERONOMY_DATA } from './deuteronomy-data.mjs?v=20261107-1';

export const DEUTERONOMY_TOPIC = {
  id: 'deuteronomy', name: '申命記', icon: 'book', color: 'sand',
  tip: '跟摩西重溫曠野路程、立約同律法教導，準備進入應許之地。', reading: '申命記1:1'
};
const ranges = ['1–4', '5–7', '8–11', '12–16', '17–21', '22–25', '26–28', '29–30', '31–32', '33–34'];
export const DEUTERONOMY_UNITS = ranges.map((range, i) => ({
  id: `d${i + 1}`, name: `申命記第${i + 1}課`, period: `申命記 ${range} 章`,
  description: '按經文次序，認識摩西回顧往事、重申律法同祝福百姓。'
}));
export const DEUTERONOMY_QUESTIONS = DEUTERONOMY_DATA;
export const DEUTERONOMY_HARD_QUESTIONS = DEUTERONOMY_HARD_DATA;
export const DEUTERONOMY_HARD_MAP = new Map(DEUTERONOMY_HARD_QUESTIONS.map(q => [q.id, q]));
export const DEUTERONOMY_QUESTION_MAP = new Map(DEUTERONOMY_QUESTIONS.map(q => [q.id, q]));
const BASIC_IDS = new Set(DEUTERONOMY_UNITS.flatMap(unit => DEUTERONOMY_QUESTIONS.filter(q => q.unit === unit.id).slice(0, 5).map(q => q.id)));
export const DEUTERONOMY_LEVEL_POOLS = {
  1: DEUTERONOMY_QUESTIONS.filter(q => BASIC_IDS.has(q.id)),
  2: DEUTERONOMY_QUESTIONS.filter(q => !BASIC_IDS.has(q.id)),
  3: DEUTERONOMY_HARD_QUESTIONS
};
export function cleanDeuteronomyAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, correct]) => DEUTERONOMY_QUESTION_MAP.has(id) && typeof correct === 'boolean'));
}
export function deuteronomyStatus(answers, unit) {
  const questions = unit ? DEUTERONOMY_QUESTIONS.filter(q => q.unit === unit) : DEUTERONOMY_QUESTIONS;
  return { total: questions.length, answered: questions.filter(q => typeof answers[q.id] === 'boolean').length, correct: questions.filter(q => answers[q.id] === true).length };
}
