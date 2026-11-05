import { GENESIS_DATA as GENESIS_LEGACY_DATA } from './genesis-legacy-data.mjs?v=20261105-2';
import { QUESTIONS, QUESTION_MAP, QUESTION_MAP_V2, LEGACY_QUESTION_MAP, TOPICS } from './questions.mjs?v=20261105-2';
import { HISTORY_QUESTIONS, HISTORY_QUESTION_MAP, HISTORY_TOPIC, COURSE_UNITS } from './history-course.mjs?v=20261101-7';
import { CHALLENGE_QUESTIONS } from './challenge-data.mjs?v=20261101-10';
import { GENESIS_QUESTIONS, GENESIS_QUESTION_MAP, GENESIS_TOPIC, GENESIS_UNITS } from './genesis-course.mjs?v=20261105-2';
import { BIBLE_QUESTIONS, BIBLE_QUESTION_MAP, BIBLE_TOPIC, BIBLE_UNITS } from './bible-course.mjs?v=20261105-2';
const GENESIS_LEGACY_MAP = new Map(GENESIS_LEGACY_DATA.map(q => [q.id,{...q,topic:GENESIS_TOPIC.id}]));
const CHALLENGE_MAP = new Map(CHALLENGE_QUESTIONS.map(q => [q.id,q]));
const BASE_QUESTION_IDS = new Set(QUESTIONS.map(q => q.id));

export const TRIAL_LEVELS = {
  1: { degree:'低', name:'少少試探', description:'主日學基本功，唔好輕敵就得。' },
  2: { degree:'中', name:'開始有啲 feel', description:'答案個個似啱，考你識唔識分辨。' },
  3: { degree:'高', name:'就嚟頂唔住', description:'進階題目，經文背景同細節都要識分辨。' }
};
export const DIFFICULTIES = Object.fromEntries(Object.entries(TRIAL_LEVELS).map(([key,value]) => [key,value.name]));
export const GENERAL_QUOTAS = Object.fromEntries(TOPICS.map(t => [t.id, 5]));
const LEGACY_GENERAL_QUOTAS = { overview: 6, old: 6, new: 6, people: 6, context: 6, theology: 4, history: 3, language: 3 };
export function questionForRound(round, id) {
  if (GENESIS_QUESTION_MAP.has(id)) return round.bankRevision === 4 ? GENESIS_QUESTION_MAP.get(id) : GENESIS_LEGACY_MAP.get(id);
  if (BIBLE_QUESTION_MAP.has(id)) return BIBLE_QUESTION_MAP.get(id);
  if (CHALLENGE_MAP.has(id)) return CHALLENGE_MAP.get(id);
  if (HISTORY_QUESTION_MAP.has(id)) return HISTORY_QUESTION_MAP.get(id);
  return (round.bankRevision >= 3 ? QUESTION_MAP : round.bankRevision === 2 ? QUESTION_MAP_V2 : LEGACY_QUESTION_MAP).get(id);
}
export const LEVELS = [
  { min: 0, name: '初信探索級', symbol: '🌱', gentle: '肯開始就值得鼓勵。由一章福音書開始，慢慢建立基本功。', cheeky: '基本題仲要再溫吓，唔使急住講阿們。由一章福音書讀起啦。' },
  { min: 20, name: '讀經起步級', symbol: '🌿', gentle: '你已經認到一啲路標。保持每日讀一小段，進步會慢慢累積。', cheeky: '主日學好似有聽過，答案又好似走失咗。唔好齋返崇拜，今晚開返本聖經啦。' },
  { min: 40, name: '信咗一排級', symbol: '📖', gentle: '已經有一定基礎！試吓連前後文一齊讀，熟悉嘅經文會更立體。', cheeky: '有啲基礎，但仲有幾個地方未熟。睇返解說，下次企穩啲。' },
  { min: 55, name: '神學生挑戰級', symbol: '🎒', gentle: '基本功漸漸穩固。試吓整理書卷主線，再向較弱嘅範圍探索。', cheeky: '開始熟路喎！小組查經可以開聲，不過唔好開口就斷章取義。' },
  { min: 70, name: '牧會研究級', symbol: '🕊️', gentle: '跨主題表現紮實。把知識化成關懷同分享，學習就更有意思。', cheeky: '八個主題都有認識，唔錯！記得同弟兄姊妹一齊扎根，唔好自己一個收埋晒。' },
  { min: 80, name: '牧師挑戰級', symbol: '⛪', gentle: '你對多個範圍都有好掌握。帶住謙卑繼續查考，亦陪其他人一齊學。', cheeky: '經文裝備幾齊喎！有知識之餘，愛心同謙卑都記得帶埋出門口。' },
  { min: 90, name: '神學老師挑戰級', symbol: '🎓', gentle: '表現出色！繼續比較資料、留意處境，讓學問同生命一齊成長。', cheeky: '查經筆記可以借小羊抄吓。滿有知識都要繼續受教，唔好將謙卑當選修。' },
  { min: 97, name: '神學家彩蛋級', symbol: '✨', gentle: '非常精彩嘅一局！保持好奇心，聖經仍然值得你一生細讀。', cheeky: '經文同背景都記得幾清楚喎！小羊遞上螢光筆，繼續查考，唔好以為已經得著晒。' }
];

export function seededRandom(seed) {
  let a = 2166136261;
  for (const c of String(seed)) { a ^= c.charCodeAt(0); a = Math.imul(a, 16777619); }
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function shuffle(array, random = Math.random) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

export function hongKongDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function questionPool(topic, difficulty = 'all') {
  return QUESTIONS.filter(q => q.topic === topic && (difficulty === 'all' || q.difficulty === Number(difficulty)));
}

export function createRound({ mode = 'general', topic = 'overview', count, difficulty = 'all', tone = 'cheeky', ids = [], unit, random = Math.random } = {}) {
  let selected;
  if (mode === 'general') {
    const size = count === undefined ? 40 : Number(count);
    if (![20,40].includes(size)) throw new Error('曠野快閃20題，定曠野長征40題？揀好就入場。');
    const rotated=shuffle(TOPICS,random);
    const extra = new Set(rotated.slice(0,4).map(t => t.id));
    const harder = new Set(rotated.slice(0,size === 40 ? 4 : 2).map(t => t.id));
    selected = TOPICS.flatMap(t => {
      const split = size === 40 ? [harder.has(t.id) ? 2 : 3,2,harder.has(t.id) ? 1 : 0] :
        [extra.has(t.id) && !harder.has(t.id) ? 2 : 1,1,harder.has(t.id) ? 1 : 0];
      return split.flatMap((n, i) => shuffle(questionPool(t.id, i + 1), random).slice(0, n));
    });
  } else if (mode === 'trial') {
    if (!['1','2','3'].includes(String(difficulty))) throw new Error('先揀低、中、高，先知今次試探去到邊。');
    selected = TOPICS.flatMap(t => shuffle(String(difficulty) === '3' ? CHALLENGE_QUESTIONS.filter(q => q.topic === t.id) : questionPool(t.id,difficulty),random).slice(0,2));
  } else if (mode === 'genesis' || mode === 'genesis-test') {
    if (mode === 'genesis' && !GENESIS_UNITS.some(u=>u.id===unit)) throw new Error('揀一課創世記先開始。');
    selected=mode === 'genesis' ? GENESIS_QUESTIONS.filter(q=>q.unit===unit) : shuffle(GENESIS_QUESTIONS,random).slice(0,10);
  } else if (mode === 'bible') {
    if (!BIBLE_UNITS.some(u=>u.id===unit)) throw new Error('揀一課聖經知識，慢慢開始操練。');
    selected=BIBLE_QUESTIONS.filter(q=>q.unit===unit);
  } else if (mode === 'church') {
    if (!COURSE_UNITS.some(u => u.id === unit)) throw new Error('揀一課教會歷史，慢慢開始操練。');
    selected = HISTORY_QUESTIONS.filter(q => q.unit === unit);
  } else if (mode === 'review') {
    selected = shuffle([...new Set(ids)].map(id => QUESTION_MAP.get(id)).filter(Boolean), random).slice(0, 30);
  } else if (mode === 'topic') {
    selected = shuffle(questionPool(topic, difficulty), random).slice(0, Math.max(1, Math.min(30, Number(count) || 10)));
  } else { throw new Error('未知測驗模式'); }
  if (!selected.length) throw new Error('暫時冇呢類題目，可以揀其他主題。');
  const items = (['church','bible','genesis'].includes(mode) ? selected : shuffle(selected, random)).map(q => ({ id: q.id, order: shuffle([0, 1, 2, 3], random) }));
  return { id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`, bankRevision: 4, distribution: mode === 'general' ? 'general-v5' : mode === 'trial' && String(difficulty) === '3' ? 'trial-advanced-v5' : 'balanced-v3', mode, topic: ['genesis','genesis-test'].includes(mode) ? GENESIS_TOPIC.id : mode === 'bible' ? BIBLE_TOPIC.id : mode === 'church' ? HISTORY_TOPIC.id : mode === 'topic' ? topic : null, unit:['church','bible','genesis'].includes(mode) ? unit : null, difficulty: String(difficulty), tone: tone === 'gentle' ? 'gentle' : 'cheeky', day: null, items, answers: [], index: 0, startedAt: new Date().toISOString(), finishedAt: null };
}

export function answerRound(round, selected) {
  if (round.finishedAt || round.answers.length !== round.index || !(selected === null || [0, 1, 2, 3].includes(selected))) return round;
  return { ...round, answers: [...round.answers, { id: round.items[round.index].id, selected }] };
}

export function advanceRound(round) {
  if (round.finishedAt || round.answers.length <= round.index) return round;
  if (round.index + 1 === round.items.length) return { ...round, finishedAt: new Date().toISOString() };
  return { ...round, index: round.index + 1 };
}

export function retreatRound(round) {
  if (round.finishedAt || round.index === 0) return round;
  return {...round,index:round.index-1};
}

export function levelFor(percent) {
  return [...LEVELS].reverse().find(l => percent >= l.min) || LEVELS[0];
}

export function summarizeRound(round) {
  const rows = round.items.map((item, i) => {
    const question = questionForRound(round, item.id);
    const response = round.answers[i];
    return { question, selected: response?.selected ?? null, answered: Boolean(response), correct: Boolean(response && response.selected === question.answer), order: item.order };
  });
  const correct = rows.filter(r => r.correct).length;
  const skipped = rows.filter(r => r.answered && r.selected === null).length;
  const percent = correct * 100 / rows.length;
  const breakdown = [...TOPICS,...(rows.some(r => r.question.topic === HISTORY_TOPIC.id) ? [HISTORY_TOPIC] : []),...(rows.some(r=>r.question.topic===BIBLE_TOPIC.id) ? [BIBLE_TOPIC] : []),...(rows.some(r=>r.question.topic===GENESIS_TOPIC.id) ? [GENESIS_TOPIC] : [])].map(t => {
    const entries = rows.filter(r => r.question.topic === t.id);
    return { ...t, total: entries.length, correct: entries.filter(r => r.correct).length, percent: entries.length ? entries.filter(r => r.correct).length / entries.length * 100 : null };
  });
  return { rows, correct, skipped, total: rows.length, percent, level: round.mode === 'general' ? levelFor(percent) : null, breakdown };
}

export function validRound(round, completed = false) {
  if (!round || !['general', 'topic', 'trial', 'church', 'bible', 'genesis', 'genesis-test', 'review', ...(completed ? ['daily'] : [])].includes(round.mode) || typeof round.id !== 'string' || !/^\d+-\d+$/.test(round.id)) return false;
  if (!['cheeky', 'gentle'].includes(round.tone) || !Number.isFinite(Date.parse(round.startedAt))) return false;
  if (!Array.isArray(round.items) || !round.items.length || round.items.length > 40 || new Set(round.items.map(i => i?.id)).size !== round.items.length) return false;
  if (!round.items.every(i => QUESTION_MAP.has(i?.id) && Array.isArray(i.order) && [...i.order].sort().join('') === '0123')) return false;
  if (!Array.isArray(round.answers) || round.answers.length > round.items.length || !round.answers.every((a, i) => a?.id === round.items[i].id && (a.selected === null || [0, 1, 2, 3].includes(a.selected)))) return false;
  if (!Number.isInteger(round.index) || round.index < 0 || round.index >= round.items.length || round.index > round.answers.length) return false;
  if (round.mode === 'general') {
    if (round.distribution === 'general-v5') {
      const size=round.items.length;
      if (![20,40].includes(size)) return false;
      const questions=round.items.map(i => QUESTION_MAP.get(i.id));
      if (!questions.every(q => BASE_QUESTION_IDS.has(q.id))) return false;
      if (![1,2,3].every((d,i) => questions.filter(q => q.difficulty === d).length === (size === 20 ? [10,8,2] : [20,16,4])[i])) return false;
      if (!TOPICS.every(t => {
        const group=questions.filter(q => q.topic === t.id);
        const counts=[1,2,3].map(d => group.filter(q => q.difficulty === d).length).join(',');
        return (size === 40 ? ['3,2,0','2,2,1'] : ['1,1,0','2,1,0','1,1,1']).includes(counts);
      })) return false;
    } else if (round.distribution === 'challenge-v4') {
      if (round.items.length !== 40) return false;
      const questions=round.items.map(i => QUESTION_MAP.get(i.id));
      if (!TOPICS.every(t => {
        const group=questions.filter(q => q.topic === t.id);
        return group.length === 5 && group.filter(q => q.difficulty === 2 && !CHALLENGE_MAP.has(q.id)).length === 1 &&
          group.filter(q => q.difficulty === 3 && CHALLENGE_MAP.has(q.id)).length === 4;
      })) return false;
    } else if (round.distribution === 'balanced-v3') {
      const size = round.items.length;
      if (![20,40].includes(size)) return false;
      const questions = round.items.map(i => QUESTION_MAP.get(i.id));
      if (![1,2,3].every((d,i) => questions.filter(q => q.difficulty === d).length === (size === 20 ? [8,8,4] : [16,16,8])[i])) return false;
      if (!TOPICS.every(t => {
        const topicQuestions = questions.filter(q => q.topic === t.id);
        const counts = [1,2,3].map(d => topicQuestions.filter(q => q.difficulty === d).length);
        return size === 40 ? counts.join(',') === '2,2,1' : counts[0] === 1 && counts[1] === 1 && counts[2] <= 1;
      })) return false;
    } else {
      const quotas = round.distribution === 'balanced-v2' ? GENERAL_QUOTAS : LEGACY_GENERAL_QUOTAS;
      if (round.items.length !== 40 || !TOPICS.every(t => round.items.filter(i => QUESTION_MAP.get(i.id).topic === t.id).length === quotas[t.id])) return false;
    }
  }
  if (round.mode === 'topic' && (!TOPICS.some(t => t.id === round.topic) || !round.items.every(i => QUESTION_MAP.get(i.id).topic === round.topic))) return false;
  if (round.mode === 'church' && (round.items.length !== 10 || round.topic !== HISTORY_TOPIC.id ||
    !COURSE_UNITS.some(u => u.id === round.unit) || !round.items.every(i => HISTORY_QUESTION_MAP.get(i.id)?.unit === round.unit))) return false;
  if (round.mode === 'bible' && (round.items.length !== 10 || round.topic !== BIBLE_TOPIC.id ||
    !BIBLE_UNITS.some(u=>u.id===round.unit) || !round.items.every(i=>BIBLE_QUESTION_MAP.get(i.id)?.unit===round.unit))) return false;
  if (round.mode === 'genesis' && (round.items.length !== 10 || round.topic !== GENESIS_TOPIC.id || !GENESIS_UNITS.some(u=>u.id===round.unit) || !round.items.every(i=>GENESIS_QUESTION_MAP.get(i.id)?.unit===round.unit))) return false;
  if (round.mode === 'genesis-test' && (round.items.length !== 10 || round.topic !== GENESIS_TOPIC.id || !round.items.every(i=>GENESIS_QUESTION_MAP.has(i.id)))) return false;
  if (round.mode === 'trial' && (round.items.length !== 16 || !['1','2','3'].includes(String(round.difficulty)) ||
    !round.items.every(i => QUESTION_MAP.get(i.id).difficulty === Number(round.difficulty)) ||
    !TOPICS.every(t => round.items.filter(i => QUESTION_MAP.get(i.id).topic === t.id).length === 2))) return false;
  if (round.mode === 'trial' && round.distribution === 'trial-advanced-v5' &&
    (String(round.difficulty) !== '3' || !round.items.every(i => CHALLENGE_MAP.has(i.id)))) return false;
  if (round.mode === 'daily' && (round.items.length !== 5 || !/^\d{4}-\d{2}-\d{2}$/.test(round.day))) return false;
  if (completed) return round.index === round.items.length-1 && round.answers.length === round.items.length && Number.isFinite(Date.parse(round.finishedAt));
  return round.finishedAt === null;
}

export function integrateResult(progress, round) {
  if (progress.history.some(r => r.id === round.id)) return { ...progress, current: null };
  const summary = summarizeRound(round);
  const mistakes = new Set(progress.mistakes);
  for (const row of summary.rows) { if (row.correct) mistakes.delete(row.question.id); else mistakes.add(row.question.id); }
  return { ...progress, current: null, history: [round, ...progress.history].slice(0, 60), mistakes: [...mistakes] };
}
