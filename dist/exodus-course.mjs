import { EXODUS_HARD_DATA } from './exodus-hard-data.mjs?v=20261107-3';
import { EXODUS_DATA } from './exodus-data.mjs?v=20261107-3';

export const EXODUS_TOPIC = {
  id: 'exodus', name: '出埃及記', icon: 'mountain', color: 'sand',
  tip: '由摩西、出埃及到曠野立約，按章節慢慢認識呢卷書。', reading: '出埃及記 1:1'
};
const ranges = ['1–4', '5–8', '9–12', '13–16', '17–20', '21–24', '25–28', '29–32', '33–36', '37–40'];
export const EXODUS_UNITS = ranges.map((range, i) => ({
  id: `x${i + 1}`, name: `出埃及記第${i + 1}課`, period: `出埃及記 ${range} 章`,
  description: '按經文次序，認識人物、事件同重要細節。'
}));
export const EXODUS_QUESTIONS = EXODUS_DATA.map(q => ({ ...q, topic: EXODUS_TOPIC.id }));
export const EXODUS_HARD_QUESTIONS = EXODUS_HARD_DATA;
export const EXODUS_HARD_MAP = new Map(EXODUS_HARD_QUESTIONS.map(q => [q.id, q]));
export const EXODUS_QUESTION_MAP = new Map(EXODUS_QUESTIONS.map(q => [q.id, q]));

// Curated foundational questions; the rest of the course pool forms the medium level.
const BASIC_IDS = new Set([
  1, 2, 3, 8, 9,
  11, 13, 14, 15, 16,
  24, 25, 28, 29, 30,
  31, 32, 33, 35, 36,
  41, 43, 44, 45, 46,
  51, 56, 58, 59, 60,
  61, 62, 63, 65, 67,
  72, 73, 74, 79, 80,
  81, 82, 84, 86, 90,
  91, 94, 95, 97, 98
].map(n => `exodus-${String(n).padStart(3, '0')}`));
export const EXODUS_LEVEL_POOLS = {
  1: EXODUS_QUESTIONS.filter(q => BASIC_IDS.has(q.id)),
  2: EXODUS_QUESTIONS.filter(q => !BASIC_IDS.has(q.id)),
  3: EXODUS_HARD_QUESTIONS
};

export function cleanExodusAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, correct]) => EXODUS_QUESTION_MAP.has(id) && typeof correct === 'boolean'));
}

export function exodusStatus(answers, unit) {
  const questions = unit ? EXODUS_QUESTIONS.filter(q => q.unit === unit) : EXODUS_QUESTIONS;
  return {
    total: questions.length,
    answered: questions.filter(q => typeof answers[q.id] === 'boolean').length,
    correct: questions.filter(q => answers[q.id] === true).length
  };
}
