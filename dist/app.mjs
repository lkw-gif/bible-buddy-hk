import { TOPICS, QUESTIONS, QUESTION_MAP } from './questions.mjs?v=20261108-8';
import { questionForRound, TRIAL_LEVELS, DIFFICULTIES, createRound, answerRound, advanceRound, retreatRound, summarizeRound, validRound, integrateResult, questionPool, hongKongDay } from './engine.mjs?v=20261108-8';
import { HISTORY_TOPIC, HISTORY_QUESTIONS, HISTORY_QUESTION_MAP, COURSE_UNITS, cleanCourseAnswers, courseStatus } from './history-course.mjs?v=20261101-7';
import { CHALLENGE_QUESTIONS } from './challenge-data.mjs?v=20261101-10';
import { GENESIS_TOPIC, GENESIS_UNITS, GENESIS_LEVEL_POOLS, GENESIS_QUESTION_MAP, cleanGenesisAnswers, genesisStatus } from './genesis-course.mjs?v=20261107-2';
import { BIBLE_TOPIC, BIBLE_QUESTION_MAP, BIBLE_UNITS, cleanBibleAnswers, bibleStatus } from './bible-course.mjs?v=20261107-2';
import { EXODUS_TOPIC, EXODUS_UNITS, EXODUS_LEVEL_POOLS, EXODUS_QUESTION_MAP, cleanExodusAnswers, exodusStatus } from './exodus-course.mjs?v=20261107-3';
import { NUMBERS_TOPIC, NUMBERS_UNITS, NUMBERS_LEVEL_POOLS, NUMBERS_QUESTION_MAP, cleanNumbersAnswers, numbersStatus } from './numbers-course.mjs?v=20261107-1';
import { LEVITICUS_TOPIC, LEVITICUS_UNITS, LEVITICUS_LEVEL_POOLS, LEVITICUS_QUESTION_MAP, cleanLeviticusAnswers, leviticusStatus } from './leviticus-course.mjs?v=20261107-1';
import { DEUTERONOMY_TOPIC, DEUTERONOMY_UNITS, DEUTERONOMY_LEVEL_POOLS, DEUTERONOMY_QUESTION_MAP, cleanDeuteronomyAnswers, deuteronomyStatus } from './deuteronomy-course.mjs?v=20261107-1';
import { MATTHEW_TOPIC, MATTHEW_UNITS, MATTHEW_LEVEL_POOLS, MATTHEW_QUESTION_MAP, cleanMatthewAnswers, matthewStatus } from './matthew-course.mjs?v=20261108-1';
import { MARK_TOPIC, MARK_UNITS, MARK_LEVEL_POOLS, MARK_QUESTION_MAP, cleanMarkAnswers, markStatus } from './mark-course.mjs?v=20261108-1';
import { LUKE_TOPIC, LUKE_UNITS, LUKE_LEVEL_POOLS, LUKE_QUESTION_MAP, cleanLukeAnswers, lukeStatus } from './luke-course.mjs?v=20261108-2';

const $ = (s, root = document) => root.querySelector(s);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const number = n => new Intl.NumberFormat('zh-HK', { maximumFractionDigits: 1 }).format(n);
const topicById = id => id === LUKE_TOPIC.id ? LUKE_TOPIC : id === MARK_TOPIC.id ? MARK_TOPIC : id === MATTHEW_TOPIC.id ? MATTHEW_TOPIC : id === GENESIS_TOPIC.id ? GENESIS_TOPIC : id === EXODUS_TOPIC.id ? EXODUS_TOPIC : id === NUMBERS_TOPIC.id ? NUMBERS_TOPIC : id === LEVITICUS_TOPIC.id ? LEVITICUS_TOPIC : id === DEUTERONOMY_TOPIC.id ? DEUTERONOMY_TOPIC : id === BIBLE_TOPIC.id ? BIBLE_TOPIC : id === HISTORY_TOPIC.id ? HISTORY_TOPIC : TOPICS.find(t => t.id === id);
const external = (url, text, cls = 'link') => `<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${text}${icon('external')}</a>`;
const scriptureUrl = ref => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref.replaceAll('；', ';'))}&version=CUV`;
const shapes = {
  book: '<path d="M12 20V5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/><path d="M16 6v7m-2-4h4"/>',
  mountain: '<path d="m2 20 7-14 4 7 3-5 6 12H2Z"/><path d="m6 12 3 2 2-2m3 0 2 2 2-2"/><path d="M17 3h.01"/>',
  fish: '<path d="M4 12c4-7 10-8 16 0-6 8-12 7-16 0Z"/><path d="m4 12-2-4v8l2-4Zm10-6c-2 4-2 8 0 12m3-7h.01"/>',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5m-13-11h5m-5 3h3"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Zm7 0v4m-2-2h4"/>',
  church: '<path d="M3 21V11l9-6 9 6v10H3Zm6 0v-6h6v6M12 1v7m-3-4h6M6 13v2m12-2v2"/>',
  language: '<path d="M3 5h11M8 2v3m-2 0c0 6 3 9 7 11M12 5c0 5-4 9-9 12m11 4 4-10 4 10m-7-3h6"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  external: '<path d="M14 3h7v7m0-7-11 11m-1-9H4v15h15v-5"/>',
  bookmark: '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  cap: '<path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6M22 8v9"/>',
  repeat: '<path d="M20 8a8 8 0 0 0-14-3L3 8m0-6v6h6m-5 8a8 8 0 0 0 14 3l3-3m0 6v-6h-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  heart: '<path d="m12 21-8-8C-3 5 7-1 12 6c5-7 15-1 8 7l-8 8Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${shapes[name] || shapes.book}</svg>`; }

const STORAGE_KEY = 'bible-buddy-hk:v1';
let storageUnavailable = false;
let storageNoticeShown = false;
function readProgress() {
  const blank = { schema: 1, tone: 'cheeky', current: null, history: [], bookmarks: [], mistakes: [], courseAnswers:{}, bibleAnswers:{}, genesisAnswers:{}, exodusAnswers:{}, numbersAnswers:{}, leviticusAnswers:{}, deuteronomyAnswers:{}, matthewAnswers:{}, markAnswers:{}, lukeAnswers:{}, genesisSeen:[], exodusSeen:[], numbersSeen:[], leviticusSeen:[], deuteronomySeen:[], matthewSeen:[], markSeen:[], lukeSeen:[] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || saved.schema !== 1) return blank;
    const history = Array.isArray(saved.history) ? saved.history.filter(r => validRound(r, true)).map(r => ({ ...r, tone:'cheeky' })).slice(0, 60) : [];
    const genesisAnswers = cleanGenesisAnswers(saved.genesisAnswers);
    const exodusAnswers = cleanExodusAnswers(saved.exodusAnswers);
    const numbersAnswers = cleanNumbersAnswers(saved.numbersAnswers);
    const leviticusAnswers = cleanLeviticusAnswers(saved.leviticusAnswers);
    const deuteronomyAnswers = cleanDeuteronomyAnswers(saved.deuteronomyAnswers);
    const matthewAnswers = cleanMatthewAnswers(saved.matthewAnswers);
    const markAnswers = cleanMarkAnswers(saved.markAnswers);
    const lukeAnswers = cleanLukeAnswers(saved.lukeAnswers);
    return { ...blank, tone: 'cheeky', current: validRound(saved.current) ? { ...saved.current, tone:'cheeky' } : null,
      history, bookmarks: cleanIds(saved.bookmarks), mistakes: cleanIds(saved.mistakes), courseAnswers:cleanCourseAnswers(saved.courseAnswers), bibleAnswers:cleanBibleAnswers(saved.bibleAnswers), genesisAnswers, exodusAnswers, numbersAnswers, leviticusAnswers, deuteronomyAnswers, matthewAnswers, markAnswers, lukeAnswers,
      genesisSeen: cleanSeenIds(saved.genesisSeen, genesisAnswers, history, 'genesis'),
      exodusSeen: cleanSeenIds(saved.exodusSeen, exodusAnswers, history, 'exodus'),
      numbersSeen: cleanSeenIds(saved.numbersSeen, numbersAnswers, history, 'numbers'),
      leviticusSeen: cleanSeenIds(saved.leviticusSeen, leviticusAnswers, history, 'leviticus'),
      deuteronomySeen: cleanSeenIds(saved.deuteronomySeen, deuteronomyAnswers, history, 'deuteronomy'),
      matthewSeen: cleanSeenIds(saved.matthewSeen, matthewAnswers, history, 'matthew'),
      markSeen: cleanSeenIds(saved.markSeen, markAnswers, history, 'mark'),
      lukeSeen: cleanSeenIds(saved.lukeSeen, lukeAnswers, history, 'luke') };
  } catch { storageUnavailable = true; return blank; }
}
function cleanIds(value) { return Array.isArray(value) ? [...new Set(value.filter(id => QUESTION_MAP.has(id)))] : []; }
function cleanSeenIds(value, answers, history, topic) {
  const ids = new Set([...(Array.isArray(value) ? value : []), ...Object.keys(answers)]);
  for (const round of history) {
    if (round.topic === topic || round.mode === topic || round.mode.startsWith(`${topic}-`)) {
      for (const item of round.items || []) if (QUESTION_MAP.get(item.id)?.topic === topic) ids.add(item.id);
    }
  }
  return [...ids].filter(id => QUESTION_MAP.get(id)?.topic === topic);
}
let progress = readProgress();
let reviewTab = 'mistakes';
let reviewSearch = '';
let resultFilter = 'wrong';
let resultSearch = '';
let toastTimeout;
const main = $('#main');
const shareDialog = $('#share-dialog');

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); storageUnavailable = false; }
  catch { storageUnavailable = true; if (!storageNoticeShown) { toast('呢個瀏覽器暫時儲存唔到進度。今局仍然玩得，可以下載成績留底。'); storageNoticeShown = true; } }
  updateNavigation();
}
function toast(message) {
  clearTimeout(toastTimeout);
  const target = $('#toast'); target.textContent = message; target.hidden = false;
  toastTimeout = setTimeout(() => { target.hidden = true; }, 4200);
}
function announce(message) { $('#announcer').textContent = message; }
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  return { name: ['review', 'history', 'church', 'bible', 'old-testament', 'new-testament', 'matthew', 'mark', 'luke', 'genesis', 'exodus', 'numbers', 'leviticus', 'deuteronomy', 'quiz', 'result'].includes(parts[0]) ? parts[0] : 'home', id: parts[1] || null };
}
function go(path) { if (location.hash === '#' + path) render(); else location.hash = path; }
function updateNavigation() {
  const current = route().name;
  for (const a of document.querySelectorAll('[data-nav]')) {
    if (a.dataset.nav === current || (a.dataset.nav === 'new-testament' && ['matthew','mark','luke'].includes(current)) || (a.dataset.nav === 'home' && ['quiz', 'result'].includes(current))) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  const badge = $('#review-count'); badge.hidden = !progress.mistakes.length; badge.textContent = progress.mistakes.length;
}
function roundTitle(r) {
  if (r.mode === 'luke-level') return '路加福音 · ' + TRIAL_LEVELS[r.difficulty].name + ' · 10題';
  if (r.mode === 'luke') return `路加福音 · 第${LUKE_UNITS.findIndex(u=>u.id===r.unit)+1}課`;
  if (r.mode === 'matthew-level') return '馬太福音 · ' + TRIAL_LEVELS[r.difficulty].name + ' · 10題';
  if (r.mode === 'mark-level') return '馬可福音 · ' + TRIAL_LEVELS[r.difficulty].name + ' · 10題';
  if (r.mode === 'mark') return '馬可福音 · 第' + (MARK_UNITS.findIndex(u=>u.id===r.unit)+1) + '課';
  if (r.mode === 'matthew') return `馬太福音 · 第${MATTHEW_UNITS.findIndex(u=>u.id===r.unit)+1}課`;
  if (r.mode === 'leviticus-level') return '利未記 · ' + TRIAL_LEVELS[r.difficulty].name + ' · 10題';
  if (r.mode === 'leviticus-test') return '利未記 · 隨機10題測驗';
  if (r.mode === 'leviticus') return `利未記 · 第${LEVITICUS_UNITS.findIndex(u=>u.id===r.unit)+1}課`;
  if (r.mode === 'deuteronomy-level') return '申命記 · ' + TRIAL_LEVELS[r.difficulty].name + ' · 10題';
  if (r.mode === 'deuteronomy-test') return '申命記 · 隨機10題測驗';
  if (r.mode === 'deuteronomy') return `申命記 · 第${DEUTERONOMY_UNITS.findIndex(u=>u.id===r.unit)+1}課`;
  if (r.mode === 'numbers-level') return '民數記 · ' + TRIAL_LEVELS[r.difficulty].name + ' · 10題';
  if (r.mode === 'numbers-test') return '民數記 · 隨機10題測驗';
  if (r.mode === 'numbers') return `民數記 · 第${NUMBERS_UNITS.findIndex(u=>u.id===r.unit)+1}課`;
  if (r.mode === 'exodus-level') return '出埃及記 · ' + TRIAL_LEVELS[r.difficulty].name + ' · 10題';
  if (r.mode === 'exodus-test') return '出埃及記 · 隨機10題測驗';
  if (r.mode === 'exodus') return `出埃及記 · 第${EXODUS_UNITS.findIndex(u=>u.id===r.unit)+1}課`;
  if (r.mode === 'genesis-level') return '創世記 · ' + TRIAL_LEVELS[r.difficulty].name + ' · 10題';
  if (r.mode === 'genesis-test') return '創世記 · 隨機10題測驗';
  if (r.mode === 'genesis') return `創世記 · 第${GENESIS_UNITS.findIndex(u=>u.id===r.unit)+1}課`;
  if (r.mode === 'bible') return `聖經知識 · 第${BIBLE_UNITS.findIndex(u=>u.id===r.unit)+1}課 ${BIBLE_UNITS.find(u=>u.id===r.unit)?.name || ''}`;
  if (r.mode === 'church') return `教會歷史篇 · 第${COURSE_UNITS.findIndex(u => u.id === r.unit)+1}課 ${COURSE_UNITS.find(u => u.id === r.unit)?.name || ''}`;
  return r.mode === 'general' ? (r.items.length === 20 ? '曠野快閃 · 20題' : (r.edition ? `曠野長征 · 曠野${['一','二','三','四','五','六'][r.edition-1]} · 40題` : '曠野長征 · 40題') + (r.distribution === 'challenge-v4' ? ' · 進階挑戰' : '')) : r.mode === 'trial' ? '曠野試探場 · ' + TRIAL_LEVELS[r.difficulty].name : r.mode === 'daily' ? '往日操練（舊紀錄）' : r.mode === 'review' ? '返去溫習' : topicById(r.topic)?.name || '經文操練';
}
function render({ focus = true } = {}) {
  const page = route();
  main.innerHTML = page.name === 'home' ? homeView() : page.name === 'old-testament' ? oldTestamentView() : page.name === 'new-testament' ? newTestamentView() : ['church','bible','genesis','exodus','numbers','leviticus','deuteronomy','matthew','mark','luke'].includes(page.name) ? churchView(page.name) : page.name === 'quiz' ? quizView() : page.name === 'review' ? reviewView() : page.name === 'history' ? historyView() : resultView(page.id);
  updateNavigation();
  if (focus) { window.scrollTo({ top: 0, behavior: 'instant' }); main.focus({ preventScroll: true }); }
  document.title = `${({ home: '聖經有幾熟？', church:'教會歷史篇 · 100題操練', bible:'聖經知識 · 100題操練', 'old-testament':'舊約書卷', 'new-testament':'新約書卷', matthew:'馬太福音 · 100題操練', mark:'馬可福音 · 100題操練', luke:'路加福音 · 100題操練', genesis:'創世記 · 100題操練', exodus:'出埃及記 · 100題操練', numbers:'民數記 · 100題操練', leviticus:'利未記 · 100題操練', deuteronomy:'申命記 · 100題操練', quiz: '試探嚟到，慢慢分辨', review: '溫習角落', history: '操練紀錄', result: '今次學到幾多？' })[page.name]}｜Bible Buddy`;
}

function trialCard() {
  return `<article class="trial-card"><div class="eyebrow">唔好靠 feel，靠經文分辨</div><h2>曠野試探場</h2><p>揀個試探程度，直接入場。每場16題，八個方向各2題。</p><div class="trial-levels">${Object.entries(TRIAL_LEVELS).map(([level,t])=>`<button class="trial-level level-${level}" data-action="start" data-mode="trial" data-difficulty="${level}"><span class="trial-degree">試探程度：${t.degree}</span><strong>${t.name}</strong>${icon('arrow')}<small>${t.description}</small></button>`).join('')}</div></article>`;
}

function courseSettings(mode='church') {
  if (mode==='luke') return {mode,topic:LUKE_TOPIC,units:LUKE_UNITS,answers:progress.lukeAnswers,status:lukeStatus,eyebrow:'新約書卷操練',subject:'路加福音',teaser:'100題，分10課，認識路加記載嘅耶穌生平、教導同復活。',intro:'100題，分10課，每課答完都有解說同經文出處。另有高中低三種試探程度；重做測驗會先抽未做過嘅題目。'};
  if (mode==='mark') return {mode,topic:MARK_TOPIC,units:MARK_UNITS,answers:progress.markAnswers,status:markStatus,eyebrow:'新約書卷操練',subject:'馬可福音',teaser:'100題，分10課，跟住耶穌由加利利去到耶路撒冷，認識佢嘅教導、受苦同復活。',intro:'100題，分10課，每課答完都有解說同經文出處。另有高中低三種試探程度；重做測驗會先抽未做過嘅題目。'};
  if (mode==='matthew') return {mode,topic:MATTHEW_TOPIC,units:MATTHEW_UNITS,answers:progress.matthewAnswers,status:matthewStatus,eyebrow:'新約書卷操練',subject:'馬太福音',teaser:'100題，分10課，由耶穌降生到復活，一齊認識馬太福音。',intro:'100題，分10課，每題答完都有解說同經文出處。另有高中低三種試探程度；重做測驗會先抽未做過嘅題目。'};
  if (mode==='genesis') return {mode,topic:GENESIS_TOPIC,units:GENESIS_UNITS,answers:progress.genesisAnswers,status:genesisStatus,eyebrow:'舊約書卷操練',subject:'創世記',teaser:'100題，分10課，由創造到約瑟逐步重溫。',intro:'100題，分10課，每題答完都有解說。另有高中低三種試探程度；重做測驗會先抽未做過嘅題目。'};
  if (mode==='exodus') return {mode,topic:EXODUS_TOPIC,units:EXODUS_UNITS,answers:progress.exodusAnswers,status:exodusStatus,eyebrow:'舊約書卷操練',subject:'出埃及記',teaser:'100題，分10課，由以色列人在埃及到會幕立起，按經文次序逐步認識。',intro:'100題，分10課，每題答完都有解說。隨機同分級測驗會先抽未做過嘅題目，做晒一輪先會重複。'};
  if (mode==='numbers') return {mode,topic:NUMBERS_TOPIC,units:NUMBERS_UNITS,answers:progress.numbersAnswers,status:numbersStatus,eyebrow:'舊約書卷操練',subject:'民數記',teaser:'100題，分10課，跟住以色列人由西奈出發、行過曠野直到約旦河東。',intro:'100題，分10課，每題答完都有解說同經文出處。隨機同分級測驗會先抽未做過嘅題目，做晒一輪先會重複。'};
  if (mode==='leviticus') return {mode,topic:LEVITICUS_TOPIC,units:LEVITICUS_UNITS,answers:progress.leviticusAnswers,status:leviticusStatus,eyebrow:'舊約書卷操練',subject:'利未記',teaser:'100題，分10課，從獻祭同祭司到節期、倫理同禧年，認識利未記嘅主要內容。',intro:'100題，分10課，每題答完都有解說同經文出處。另有高中低三種試探程度；重做測驗會先抽未做過嘅題目。'};
  if (mode==='deuteronomy') return {mode,topic:DEUTERONOMY_TOPIC,units:DEUTERONOMY_UNITS,answers:progress.deuteronomyAnswers,status:deuteronomyStatus,eyebrow:'舊約書卷操練',subject:'申命記',teaser:'100題，分10課，跟摩西重溫曠野路程、十誡、律法教導同臨別祝福。',intro:'100題，分10課，每題答完都有解說同經文出處。另有高中低三種試探程度；重做測驗會先抽未做過嘅題目。'};
  const bible=mode==='bible';
  return {mode,topic:bible ? BIBLE_TOPIC : HISTORY_TOPIC,units:bible ? BIBLE_UNITS : COURSE_UNITS,answers:bible ? progress.bibleAnswers : progress.courseAnswers,status:bible ? bibleStatus : courseStatus,
    eyebrow:bible ? '認熟書卷，一齊扎根' : '認識前人，一齊扎根',subject:bible ? '聖經' : '教會歷史',
    teaser:bible ? '100題，分10課。由新舊約卷數、書卷分類，到大小先知同四福音，逐步認熟基本知識。' : '100題，分10課。由初期教會讀到中國同香港教會，答完即刻有解說，慢慢建立知識。',
    intro:bible ? '100題，分10課，每課10題。由書卷分類、卷數同次序開始，逐步認識聖經。每題答完都有解說。本篇按新教常用嘅66卷聖經目錄，同常見書卷分類編排。' : '100題，分10課，每課10題。唔使死背年份，先了解人物、事件同背後原因。揀一課就開始，每題答完都有解說，幫你了解答案背後嘅原因。'};
}
function courseHomeCard(mode='church') {
  const c=courseSettings(mode),s=c.status(c.answers);
  return `<section class="course-feature ${mode}-course-entry" aria-labelledby="course-feature-title-${mode}"><div><div class="eyebrow">${c.eyebrow}</div><h2 id="course-feature-title-${mode}">${c.topic.name}</h2><p>${c.teaser}</p><span class="course-summary">已操練 ${s.answered}／${s.total} 題 · 最近答啱 ${s.correct} 題</span></div><a class="button primary" href="#/${mode}">${s.answered ? '繼續操練' : '開始操練'} ${icon('arrow')}</a></section>`;
}
function churchView(mode='church') {
  const c=courseSettings(mode),s=c.status(c.answers);
  const current=progress.current?.mode===mode ? progress.current : null;
  return `<div class="page-head"><div class="eyebrow">${c.eyebrow}</div><h1>${c.topic.name}</h1><p>${c.intro}</p></div><section class="course-progress" aria-label="${c.topic.name}學習進度"><div><strong>已操練 ${s.answered}／${s.total} 題</strong><span>最近答啱 ${s.correct} 題 · 答過嘅題目隨時可以再做</span></div><div class="progress-track" role="progressbar" aria-label="已操練題數" aria-valuemin="0" aria-valuemax="${s.total}" aria-valuenow="${s.answered}"><span style="width:${s.total ? s.answered/s.total*100 : 0}%"></span></div><p>進度儲存喺呢個瀏覽器。跳過嘅題目會計入「已操練」，方便你之後再溫習。</p></section>${current ? `<aside class="resume-banner"><div><strong>上次嗰課未做完，可以繼續做。</strong><p>${escape(roundTitle(current))} · 已答 ${current.answers.length}／10題</p></div><a class="button primary small" href="#/quiz">繼續呢課 ${icon('arrow')}</a></aside>` : ''}${['genesis','exodus','numbers','leviticus','deuteronomy','matthew','mark','luke'].includes(mode) ? `<section class="trial-card" style="margin-bottom:24px" aria-label="${c.topic.name}分級測驗"><div class="eyebrow">${c.topic.name}分級測驗</div><h2>揀個試探程度</h2><p>每場隨機10題。高程度會考深入經文細節同前後文。</p><div class="trial-levels">${Object.entries(TRIAL_LEVELS).map(([level,t])=>{const pools={genesis:GENESIS_LEVEL_POOLS,exodus:EXODUS_LEVEL_POOLS,numbers:NUMBERS_LEVEL_POOLS,leviticus:LEVITICUS_LEVEL_POOLS,deuteronomy:DEUTERONOMY_LEVEL_POOLS,matthew:MATTHEW_LEVEL_POOLS,mark:MARK_LEVEL_POOLS,luke:LUKE_LEVEL_POOLS};const pool=pools[mode][level];const seen=new Set(progress[`${mode}Seen`]);const hardDone=pool.length>0&&pool.every(q=>seen.has(q.id));return `<button class="trial-level level-${level}${hardDone?' is-complete':''}" data-action="start" data-mode="${mode}-level" data-difficulty="${level}"${hardDone?` aria-label="${t.name}，已經完成"`:''}><span class="trial-degree">試探程度：${t.degree}</span><strong>${t.name}</strong>${icon('arrow')}<small>${hardDone?'已經完成，可以再玩一次。':level==='1'?`重溫${c.subject}基本內容。`:level==='2'?'留意人物、事件同經文細節。':'深入經文，留意前後文同細節。'}</small></button>`;}).join('')}</div></section>` : ''}<section class="course-grid" aria-label="${c.topic.name}十課">${c.units.map((u,i)=>{
    const status=c.status(c.answers,u.id);
    return `<article class="course-unit"><div class="course-unit-top"><span class="course-number">${String(i+1).padStart(2,'0')}</span><span class="pill ${status.answered===10 ? 'sage' : 'sand'}">${status.answered===10 ? '已完成操練' : status.answered ? `已操練 ${status.answered}／10` : '未開始'}</span></div><p class="course-period">${u.period}</p><h2>${u.name}</h2><p>${u.description}</p><div class="course-unit-bottom"><small>10題${status.answered ? ` · 最近答啱 ${status.correct}題` : ' · 每題有解說'}</small><button class="button secondary small" data-action="start" data-mode="${mode}" data-unit="${u.id}">${status.answered ? '再做呢課' : '開始呢課'} ${icon('arrow')}</button></div></article>`;
  }).join('')}</section>`;
}
function courseResultPanel(round) {
  const c=courseSettings(round.mode),index=c.units.findIndex(u=>u.id===round.unit),next=c.units[index+1],status=c.status(c.answers);
  return `<div class="panel growth-note"><div class="tip-symbol" aria-hidden="true">📚</div><h2>一步一步，認識${c.subject}。</h2><p>已操練 ${status.answered}／100題。睇返今課解說，試吓將學過嘅內容連埋一齊。</p>${next ? `<button class="button primary" data-action="start" data-mode="${c.mode}" data-unit="${next.id}">下一課：${next.name} ${icon('arrow')}</button>` : '<p>呢課已經係最後一課。可以返去揀課，完成未做過或者未熟嘅部分。</p>'}<a class="text-button" href="#/${c.mode}">返去揀課程 ${icon('arrow')}</a></div>`;
}

function newTestamentView() { return `<div class="page-head"><div class="eyebrow">逐卷讀，逐卷學</div><h1>新約書卷</h1><p>由四福音開始，逐卷認識新約。</p></div><div class="course-features">${courseHomeCard('matthew')}${courseHomeCard('mark')}${courseHomeCard('luke')}</div>`; }
function oldTestamentView() { return `<div class="page-head"><div class="eyebrow">逐卷讀，逐卷學</div><h1>舊約書卷</h1><p>由創世記、出埃及記、利未記、民數記同申命記開始，按經文次序逐卷認識。</p></div><div class="course-features old-testament-courses">${courseHomeCard('genesis')}${courseHomeCard('exodus')}${courseHomeCard('leviticus')}${courseHomeCard('numbers')}${courseHomeCard('deuteronomy')}</div>`; }
function homeView() {
  const current = progress.current;
  return `<section class="hero" aria-labelledby="home-title"><div class="hero-copy"><div class="hero-label"><span>✦</span> 主日學唔好走堂 · 一齊操練</div><h1 id="home-title">返咗咁耐教會，<br><em>聖經有幾熟？</em></h1><p>唔係咩都答「耶穌」就過關。<br>由基本知識慢慢學起，睇吓你本聖經有冇封塵。</p><div class="actions"><button class="button primary" data-action="start" data-mode="general" data-count="20">曠野快閃 · 20題 ${icon('arrow')}</button></div><div class="hero-stats"><div><strong>${QUESTIONS.length + CHALLENGE_QUESTIONS.length}</strong> 條問題</div><div><strong>${TOPICS.length}</strong> 個主題</div><div><strong>冇</strong> 時間限制</div></div></div><div class="hero-art"><img src="assets/hero.png" alt="戴圓眼鏡嘅小羊同白鴿坐喺舊式課桌前讀聖經，後面有淡淡嘅香港舊樓" width="1536" height="1024" fetchpriority="high"><span class="art-note">每日讀啲經文，一齊扎根。</span><div class="art-badge"><span aria-hidden="true">✧</span> 答錯唔緊要，小羊陪你慢慢學。</div></div></section>
    ${storageUnavailable ? '<p class="privacy-notice">呢個瀏覽器暫時儲存唔到進度。仍然可以測驗，完成後可下載成績。</p>' : ''}
    ${current ? `<aside class="resume-banner"><div><strong>上次未答完，今次繼續啦。</strong><p>${escape(roundTitle(current))} · 已答 ${current.answers.length} / ${current.items.length} 題</p></div><a href="#/quiz" class="button primary small">繼續操練 ${icon('arrow')}</a></aside>` : ''}
    <section class="mode-grid" aria-label="揀一種玩法"><article class="general-card"><div><div class="eyebrow">八個主題，一齊操練</div><h2><span class="general-title">全方位大試煉</span><span class="pill">同小組一齊玩</span></h2><p>想快啲答可以揀20題；想做足40題，就揀一個固定版本。</p><div class="quick-version"><button class="button light" data-action="start" data-mode="general" data-count="20"><strong>曠野快閃 · 20題</strong>${icon('arrow')}</button></div><div class="fixed-version-heading">曠野長征 · 40題</div><div class="general-editions">${[1,2,3,4,5,6].map((edition)=>`<button class="button light" data-action="start" data-mode="general" data-count="40" data-edition="${edition}"><strong>曠野${['一','二','三','四','五','六'][edition-1]}</strong>${icon('arrow')}</button>`).join('')}</div><p class="general-note">六個版本都係固定題目，八個主題各有五題；六版合起來可以操練晒240條題目。</p></div><div class="general-decoration" aria-hidden="true">${icon('cap')}</div></article>${trialCard()}</section>
    <section class="topics-section" id="topics" aria-label="八個主題"><div class="section-heading"><div><div class="eyebrow">各有恩賜，一齊學習</div><p>揀個主題嚟操練。由基本知識到深入理解，一步一步扎根。</p></div><span class="pill sand">八個主題 · 逐步扎根</span></div><div class="topic-grid">${TOPICS.map(t => `<button class="topic-card" data-action="start" data-mode="topic" data-topic="${t.id}"><span class="topic-top"><span class="topic-icon ${t.color}">${icon(t.icon)}</span><span class="topic-count">${questionPool(t.id).length} 題</span></span><h3>${t.name}</h3><p>${t.description}</p><span class="topic-bottom"><span class="eyebrow">${t.en}</span>${icon('arrow')}</span></button>`).join('')}</div></section>
    `;
}

function startQuiz(mode, topic = 'overview', ids = [], difficulty = 'all', count, unit, edition) {
  try {
    progress.tone = 'cheeky';
    const seenIds = mode.startsWith('matthew') ? progress.matthewSeen : mode.startsWith('genesis') ? progress.genesisSeen : mode.startsWith('exodus') ? progress.exodusSeen : mode.startsWith('numbers') ? progress.numbersSeen : mode.startsWith('leviticus') ? progress.leviticusSeen : mode.startsWith('deuteronomy') ? progress.deuteronomySeen : mode.startsWith('mark') ? progress.markSeen : mode.startsWith('luke') ? progress.lukeSeen : [];
    progress.current = createRound({ mode, topic, ids, count, difficulty, unit, edition, seenIds, tone:'cheeky' });
    persist(); resultFilter = 'wrong'; resultSearch = ''; go('/quiz');
  } catch (error) { toast(error.message); }
}

function quizView() {
  const r = progress.current;
  if (!r) return emptyView('仲未入場操練喎。', '揀個主題開始，小羊喺度等你。', '返去揀場操練');
  const q = questionForRound(r, r.items[r.index].id);
  const response = r.answers[r.index];
  const answered = Boolean(response);
  const correct = answered && response.selected === q.answer;
  const t = topicById(q.topic);
  const completed = r.answers.length;
  const feedback = !answered ? '' : `<section class="feedback ${correct ? '' : 'wrong'}" aria-labelledby="feedback-title"><h3 id="feedback-title" tabindex="-1">${correct ? (r.tone === 'gentle' ? '答啱啦，繼續保持！' : '有根有基，呢題企得穩！') : response.selected === null ? '呢題先溫習，下次就唔易中伏。' : r.tone === 'gentle' ? '呢題失手，下次就識。' : '中伏喇！睇埋解說，再操練。'}</h3>${!correct ? `<p><strong>對返答案：${escape(q.options[q.answer])}</strong></p>` : ''}<p>${escape(q.explanation)}</p>${q.reference ? `<p class="reference">出處：${escape(q.reference)}</p>` : ''}</section>`;
  const courseModes=['genesis','exodus','numbers','leviticus','deuteronomy','matthew','mark','luke'];
  const courseMode=courseModes.some(mode=>r.mode.startsWith(`${mode}-`)) ? r.mode.split('-')[0] : r.mode;
  const isCourse=['church','bible',...courseModes].includes(courseMode);
  const unitPool=q.topic===LUKE_TOPIC.id ? LUKE_UNITS : q.topic===MATTHEW_TOPIC.id ? MATTHEW_UNITS : q.topic===GENESIS_TOPIC.id ? GENESIS_UNITS : q.topic===EXODUS_TOPIC.id ? EXODUS_UNITS : q.topic===NUMBERS_TOPIC.id ? NUMBERS_UNITS : q.topic===LEVITICUS_TOPIC.id ? LEVITICUS_UNITS : q.topic===DEUTERONOMY_TOPIC.id ? DEUTERONOMY_UNITS : q.topic===MARK_TOPIC.id ? MARK_UNITS : q.topic===BIBLE_TOPIC.id ? BIBLE_UNITS : COURSE_UNITS;
  return `<div class="quiz-shell"><div class="quiz-top"><a href="${isCourse ? '#/'+courseMode : '#/'}" class="text-button">${icon('back')} ${isCourse ? '返去課程' : '返營先'}（保留進度）</a><div class="quiz-label">${escape(roundTitle(r))}<span class="pill sand">${['church','bible',...courseModes].includes(r.mode) ? '每課10題' : r.mode === 'general' ? '全方位操練' : '扎根操練'}</span></div></div><div class="quiz-layout"><div><div class="quiz-progress"><div class="progress-copy"><strong>第 ${r.index + 1} <span class="muted">/ ${r.items.length} 題</span></strong><span>已答 ${completed} 題 · 唔好心急</span></div><div class="progress-track" role="progressbar" aria-label="答題進度" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="${r.items.length}"><span style="width:${completed / r.items.length * 100}%"></span></div></div><article class="quiz-card"><div class="question-meta"><span class="pill ${t.color}">${q.unit ? unitPool.find(u=>u.id===q.unit)?.name : t.name}</span><span class="pill sand">${DIFFICULTIES[[...courseModes].some(mode=>r.mode===`${mode}-level`) ? r.difficulty : q.difficulty]}</span>${bookmarkButton(q.id)}</div><h1 class="question-title" id="question-title" tabindex="-1">${escape(q.question)}</h1><div class="choices" role="group" aria-label="揀一個答案">${r.items[r.index].order.map((sourceIndex, position) => {
    const state = !answered ? '' : sourceIndex === q.answer ? ' correct' : sourceIndex === response.selected ? ' wrong' : ' dim';
    return `<button class="choice${state}" data-action="answer" data-choice="${sourceIndex}" ${answered ? 'disabled' : ''}><span class="choice-key" aria-hidden="true">${String.fromCharCode(65 + position)}</span><span>${escape(q.options[sourceIndex])}</span>${answered && sourceIndex === q.answer ? icon('check','status-icon') : answered && sourceIndex === response.selected ? icon('close','status-icon') : ''}<span class="sr-only">${answered && sourceIndex === q.answer ? '正確答案' : answered && sourceIndex === response.selected ? '你揀咗呢個答案，未答啱' : ''}</span></button>`;
  }).join('')}</div>${feedback}<div class="quiz-bottom">${!answered ? '<button class="text-button" data-action="skip">唔好硬撐，睇答案</button>' : '<span class="note">答案已保留，可以睇返解說。</span>'}<div class="quiz-pager"><button class="button secondary" data-action="previous" ${r.index === 0 ? 'disabled' : ''}>${icon('back')} 上一題</button>${answered ? `<button class="button primary" data-action="next">${r.index + 1 === r.items.length ? '睇吓成績' : '下一題'} ${icon('arrow')}</button>` : '<span class="note">揀好答案，就可以去下一題。</span>'}</div></div></article><p class="keyboard-hint">電腦小貼士：按 1–4 或 A–D 揀答案；亦可以用 Tab 同 Enter 操作。</p></div><aside class="quiz-side"><div class="buddy-card"><img src="assets/hero.png" alt="小羊同白鴿陪你讀聖經" width="1536" height="1024"><h3>同行溫習，唔使硬撐。</h3><p>${r.tone === 'gentle' ? '呢度唔需要證明自己。每學識一題，都係一小步進步。' : '我都要日日食靈糧，唔係戴副眼鏡就自動滿有智慧。中伏就溫習啦。'}</p><div class="question-dots" aria-hidden="true">${r.items.map((item, i) => `<span class="question-dot${r.answers[i] ? r.answers[i].selected === questionForRound(r, item.id).answer ? ' right' : ' missed' : ''}${i === r.index ? ' current' : ''}"></span>`).join('')}</div></div><div class="quiz-note"><h3>${icon('bookmark')} 想再默想？落個書籤。</h3><p>見到仲要扎根嗰題，就落個書籤。答錯嗰幾題，操練完會幫你記低。</p></div></aside></div></div>`;
}

function bookmarkButton(id) {
  const on = progress.bookmarks.includes(id);
  return `<button class="bookmark" data-action="bookmark" data-id="${id}" aria-pressed="${on}" aria-label="${on ? '取消書籤' : '收藏呢題'}：${escape(QUESTION_MAP.get(id).question)}">${icon('bookmark')}<span>${on ? '已收低' : '溫習書籤'}</span></button>`;
}
function handleAnswer(selected) {
  if (!progress.current) return;
  const updated = answerRound(progress.current, selected);
  if (updated === progress.current) return;
  progress.current = updated;
  const q = questionForRound(updated, updated.items[updated.index].id);
  if (HISTORY_QUESTION_MAP.has(q.id)) progress.courseAnswers[q.id] = selected === q.answer;
  if (BIBLE_QUESTION_MAP.has(q.id)) progress.bibleAnswers[q.id] = selected === q.answer;
  if (q.topic === MATTHEW_TOPIC.id) progress.matthewSeen = [...new Set([...progress.matthewSeen, q.id])];
  if (q.topic === MARK_TOPIC.id) progress.markSeen = [...new Set([...progress.markSeen, q.id])];
  if (q.topic === LUKE_TOPIC.id) progress.lukeSeen = [...new Set([...progress.lukeSeen, q.id])];
  if (q.topic === GENESIS_TOPIC.id) progress.genesisSeen = [...new Set([...progress.genesisSeen, q.id])];
  if (q.topic === EXODUS_TOPIC.id) progress.exodusSeen = [...new Set([...progress.exodusSeen, q.id])];
  if (q.topic === NUMBERS_TOPIC.id) progress.numbersSeen = [...new Set([...progress.numbersSeen, q.id])];
  if (q.topic === LEVITICUS_TOPIC.id) progress.leviticusSeen = [...new Set([...progress.leviticusSeen, q.id])];
  if (q.topic === DEUTERONOMY_TOPIC.id) progress.deuteronomySeen = [...new Set([...progress.deuteronomySeen, q.id])];
  if (MATTHEW_QUESTION_MAP.has(q.id) && updated.mode !== 'matthew-level') progress.matthewAnswers[q.id] = selected === q.answer;
  if (MARK_QUESTION_MAP.has(q.id) && updated.mode !== 'mark-level') progress.markAnswers[q.id] = selected === q.answer;
  if (LUKE_QUESTION_MAP.has(q.id) && updated.mode !== 'luke-level') progress.lukeAnswers[q.id] = selected === q.answer;
  if (GENESIS_QUESTION_MAP.has(q.id) && !['genesis-test','genesis-level'].includes(updated.mode)) progress.genesisAnswers[q.id] = selected === q.answer;
  if (EXODUS_QUESTION_MAP.has(q.id) && !['exodus-test','exodus-level'].includes(updated.mode)) progress.exodusAnswers[q.id] = selected === q.answer;
  if (NUMBERS_QUESTION_MAP.has(q.id) && !['numbers-test','numbers-level'].includes(updated.mode)) progress.numbersAnswers[q.id] = selected === q.answer;
  if (LEVITICUS_QUESTION_MAP.has(q.id) && !['leviticus-test','leviticus-level'].includes(updated.mode)) progress.leviticusAnswers[q.id] = selected === q.answer;
  if (DEUTERONOMY_QUESTION_MAP.has(q.id) && !['deuteronomy-test','deuteronomy-level'].includes(updated.mode)) progress.deuteronomyAnswers[q.id] = selected === q.answer;
  persist(); main.innerHTML = quizView();
  announce(`${selected === q.answer ? '答啱啦。' : '正確答案係' + q.options[q.answer] + '。'} ${q.explanation}`);
  $('#feedback-title')?.focus({ preventScroll: true });
  const pager = $('.quiz-pager');
  if (pager) window.scrollTo({ top: Math.max(0, window.scrollY + pager.getBoundingClientRect().bottom - window.innerHeight + 100), behavior: 'instant' });
}
function handleNext() {
  if (!progress.current) return;
  const r = advanceRound(progress.current);
  if (r === progress.current) return;
  if (r.finishedAt) { progress = integrateResult(progress, r); persist(); resultFilter = 'wrong'; resultSearch = ''; go('/result/' + r.id); }
  else { progress.current = r; persist(); main.innerHTML = quizView(); $('#question-title')?.focus({ preventScroll: true }); const card = $('.quiz-card'); if (card) window.scrollTo({ top: Math.max(0, window.scrollY + card.getBoundingClientRect().top - 72), behavior: 'instant' }); }
}

function handlePrevious() {
  if (!progress.current) return;
  const r=retreatRound(progress.current);
  if (r===progress.current) return;
  progress.current=r;persist();main.innerHTML=quizView();
  $('#question-title')?.focus();window.scrollTo({top:0,behavior:'instant'});
  announce(`第${r.index+1}題，之前嘅答案已保留。`);
}

function resultView(id) {
  const r = progress.history.find(x => x.id === id);
  if (!r) return emptyView('呢份成績未喺呢個瀏覽器。', '成績只儲存喺作答嗰個瀏覽器。你可以由首頁開始新一局。', '返去揀場操練');
  const s = summarizeRound(r);
  const weak = [...s.breakdown].filter(t => t.total).sort((a,b) => a.percent - b.percent)[0];
  const recommendation = s.correct === s.total ? topicById('context') : weak;
  const trial = r.mode === 'trial' ? TRIAL_LEVELS[r.difficulty] : null;
  const title = s.level ? `${s.level.symbol} ${s.level.name}` : trial ? s.percent >= 80 ? '呢場試探，企得幾穩喎！' : s.percent >= 50 ? '有啲搖，但仲企得住。' : '呢場有啲難，睇返解說再試。' : s.percent >= 80 ? '有根有基，繼續操練！' : '操練完，記得返去溫習。';
  const remark = trial ? `今次試探程度：${trial.degree}。${s.percent >= 80 ? '冇乜畀啲似是而非嘅答案帶走，繼續用經文扎根。' : '啲答案個個扮熟客，唔係個個都可信。睇埋解說，下次識分辨。'}` : s.level ? s.level.cheeky : s.percent >= 80 ? '今次學到唔少喎！讀埋解說，返到小組就唔使靠估。' : '呢個主題仲未熟，溫返解說，下次就唔容易答錯。';
  return `<div class="page-head"><div class="eyebrow">操練完，睇吓學到幾多</div><p class="stored-result">${escape(roundTitle(r))} · ${formatDate(r.finishedAt)}${r.mode === 'topic' ? ' · ' + (DIFFICULTIES[r.difficulty] || '各種程度都有') : ''}</p></div><section class="result-hero" aria-labelledby="result-title"><div><div class="result-topline">${icon('check')} 今場操練完 · 答啱 ${s.correct} 題${s.skipped ? ` · ${s.skipped} 題先睇解說` : ''}</div><div class="eyebrow">${s.level ? '今次操練，去到邊個境界' : '一齊操練，一齊扎根'}</div><h1 id="result-title">${title}</h1><p>${remark}</p><div class="actions"><button class="button primary" data-action="retry" data-id="${r.id}">${icon('repeat')} 再入場操練</button>${["genesis-level","exodus-level","leviticus-level","numbers-level","deuteronomy-level","matthew-level","mark-level","luke-level"].includes(r.mode) ? `<a class="button secondary" href="#/${r.mode.split("-")[0]}">返回選擇程度 ${icon("arrow")}</a>` : ""}<button class="button secondary" data-action="share" data-id="${r.id}">同小組分享收穫</button></div></div><div><div class="score-ring" style="--value:${s.percent}" role="img" aria-label="${number(s.percent)}分，答啱${s.correct}題，共${s.total}題"><div><strong>${number(s.percent)}<small style="font-size:19px">分</small></strong><span>${s.correct} / ${s.total} 題答啱</span></div></div><p class="score-note">${s.total} 題等分 · 答錯／跳過不扣額外分</p></div></section>
    <section class="result-grid" aria-label="分項表現與溫習方向"><div class="panel"><h2>睇吓邊個主題仲要溫習</h2>${s.breakdown.filter(t => t.total).map(t => `<div class="breakdown-row"><span class="label">${t.name}</span><span class="bar" aria-hidden="true"><span style="width:${t.percent}%"></span></span><span class="value">${t.correct}/${t.total}</span></div>`).join('')}<p class="note" style="margin-top:17px">睇返邊個主題未熟，下次可以重點溫習。</p></div>${['church','bible','genesis','exodus','numbers','leviticus','deuteronomy','matthew','mark','luke'].includes(r.mode) ? courseResultPanel(r) : `<div class="panel growth-note"><div class="tip-symbol" aria-hidden="true">🌱</div><h2>溫返經文，繼續扎根。</h2><h3>${s.correct === s.total ? '基本功企得穩，可以再學深入啲。' : `${recommendation.name}仲有扎根空間。`}</h3><p>${recommendation.tip}</p><span class="reading">今次溫習：${recommendation.reading}</span>${recommendation.id === HISTORY_TOPIC.id ? '<a class="text-button" href="#/church">返去教會歷史篇</a>' : external(scriptureUrl(recommendation.reading),'打開聖經溫習','text-button')}<p class="note">靈糧要日日食，唔好等主日先開餐。</p></div>`}</section>
    <section aria-labelledby="result-review-title"><div class="section-heading"><div><h2 class="section-title" id="result-review-title">睇返解說，慢慢溫習。</h2><p>答錯題目已經自動加入「溫習角落」。答啱重溫題，會移出錯題簿。</p></div></div><div class="review-toolbar"><div class="tabs" aria-label="篩選今局題目"><button data-action="result-filter" data-filter="wrong" aria-pressed="${resultFilter === 'wrong'}">答錯／跳過 ${s.total-s.correct}</button><button data-action="result-filter" data-filter="all" aria-pressed="${resultFilter === 'all'}">全部 ${s.total}</button></div><label class="search-wrap">${icon('search')}<span class="sr-only">搜尋今局題目</span><input id="result-search" type="search" placeholder="搵返某一題…" value="${escape(resultSearch)}"></label></div><div id="result-rows">${resultRows(r)}</div></section>`;
}
function formatDate(date) { return new Intl.DateTimeFormat('zh-HK', { timeZone: 'Asia/Hong_Kong', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date)); }
function includesSearch(q, search) { const text = `${q.question} ${q.options.join(' ')} ${q.explanation} ${q.reference}`.toLowerCase(); return text.includes(search.trim().toLowerCase()); }
function resultRows(r) {
  const rows = summarizeRound(r).rows.filter(row => (resultFilter === 'all' || !row.correct) && includesSearch(row.question, resultSearch));
  if (!rows.length) return `<div class="empty-state"><div class="empty-symbol" aria-hidden="true">${resultSearch ? '🔎' : '✧'}</div><h2>${resultSearch ? '今局搵唔到呢個關鍵字。' : resultFilter === 'wrong' ? '今場全部答啱，繼續扎根！' : '暫時冇題目。'}</h2><p>${resultSearch ? '試吓用人物名、書卷或者另一個字搵。' : '可以切換「全部」睇解說，想再溫習嘅題目就落個書籤。'}</p></div>`;
  return rows.map(row => questionCard(row.question, row)).join('');
}

function questionCard(q, row = null) {
  const t = topicById(q.topic);
  return `<article class="review-card"><div class="review-card-top"><div><span class="pill ${t.color}">${t.name}</span> <span class="pill sand">${DIFFICULTIES[q.difficulty]}</span>${row ? ` <span class="status-text${row.correct ? '' : ' wrong'}">${row.correct ? '✓ 答啱' : row.selected === null ? '— 先睇解說' : '× 未答啱'}</span>` : ''}</div>${bookmarkButton(q.id)}</div><h3>${escape(q.question)}</h3>${row && !row.correct && row.selected !== null ? `<p class="your-answer">你嘅答案：${escape(q.options[row.selected])}</p>` : ''}<p class="answer-line">對返答案：${escape(q.options[q.answer])}</p><p class="explanation">${escape(q.explanation)}</p></article>`;
}

function reviewView() {
  return `<div class="page-head"><div class="eyebrow">溫故知新，一齊扎根</div><h1>上次中伏，今次識分辨。</h1><p>答錯嗰幾題同溫習書籤都喺度。溫習完再答啱，就會移出錯題簿。</p></div><div class="review-toolbar"><div class="tabs" aria-label="選擇溫習題目"><button data-action="review-tab" data-tab="mistakes" aria-pressed="${reviewTab === 'mistakes'}">錯題簿 ${progress.mistakes.length}</button><button data-action="review-tab" data-tab="bookmarks" aria-pressed="${reviewTab === 'bookmarks'}">溫習書籤 ${progress.bookmarks.length}</button></div><button class="button primary small practice-button" data-action="practice" ${!progress[reviewTab].length ? 'disabled' : ''}>${icon('repeat')} 再操練一次</button></div><label class="search-wrap" style="max-width:500px;margin-bottom:22px">${icon('search')}<span class="sr-only">搵返要補嘅經</span><input id="review-search" type="search" placeholder="搵人物、書卷或者歷史事件…" value="${escape(reviewSearch)}"></label><div id="review-rows">${reviewRows()}</div><p class="note" style="margin-top:20px">未完成嗰局嘅錯題，會喺交卷後一齊加入。紀錄只存在呢個瀏覽器，唔會同步到其他裝置。</p>`;
}
function reviewRows() {
  const questions = progress[reviewTab].map(id => QUESTION_MAP.get(id)).filter(q => includesSearch(q, reviewSearch));
  if (!questions.length) return `<div class="empty-state">${reviewSearch ? '<div class="empty-symbol">🔎</div>' : '<img src="assets/hero.png" alt="小羊靜靜地陪你溫習" width="1536" height="1024">'}<h2>${reviewSearch ? '未搵到呢個關鍵字。' : reviewTab === 'mistakes' ? '暫時冇錯題，繼續操練。' : '收藏題目，留返慢慢溫習。'}</h2><p>${reviewSearch ? '試吓用短啲嘅字，或者另一個書卷名。' : reviewTab === 'mistakes' ? '完成操練後，答錯同跳過嘅題目會出現喺呢度。唔識，正正就係學習嘅開始。' : '操練嗰陣落個書籤，就可以收低想再默想嘅題目。'}</p><a class="button primary" href="#/">入場操練 ${icon('arrow')}</a></div>`;
  return questions.map(q => questionCard(q)).join('');
}

function streakDays() {
  const days = new Set(progress.history.map(r => hongKongDay(new Date(r.finishedAt))));
  let day = new Date(hongKongDay() + 'T00:00:00Z');
  if (!days.has(day.toISOString().slice(0,10))) day.setUTCDate(day.getUTCDate()-1);
  let streak = 0;
  while (days.has(day.toISOString().slice(0,10))) { streak++; day.setUTCDate(day.getUTCDate()-1); }
  return streak;
}
function historyView() {
  const summaries = progress.history.map(r => ({ round: r, ...summarizeRound(r) }));
  const total = summaries.reduce((a,s) => a+s.total,0);
  const correct = summaries.reduce((a,s) => a+s.correct,0);
  const best = summaries.filter(s => s.level).sort((a,b) => b.percent-a.percent)[0];
  return `<div class="page-head"><div class="eyebrow">每日扎根少少，唔使急住開花</div><h1>一路操練，一路扎根。</h1><p>唔使同隔籬嗰位鬥屬靈。睇返自己行過嘅路，睇吓下一步溫習邊個主題。</p></div><div class="stats-grid"><div class="stat-card"><strong>${summaries.length}</strong><p class="stat-title">完成操練</p><p class="stat-sub">保留最近 60 局</p></div><div class="stat-card"><strong>${total ? number(correct / total * 100) + '%' : '—'}</strong><p class="stat-title">答題命中率</p><p class="stat-sub">${correct} / ${total} 題答啱</p></div><div class="stat-card"><strong>${best ? number(best.percent) : '—'}</strong><p class="stat-title">大試煉最佳戰績</p><p class="stat-sub">${best ? best.level.name : '大試煉等緊你入場'}</p></div><div class="stat-card"><strong>${streakDays()} <small style="font-size:15px">日</small></strong><p class="stat-title">連續操練咗幾日</p><p class="stat-sub">以香港日期計算</p></div></div>${best ? `<p class="privacy-notice">${best.level.symbol} 最佳綜合稱號：${best.level.name} · ${number(best.percent)} 分。呢個係操練成績，唔好拎嚟同弟兄姊妹鬥屬靈。</p>` : ''}<div class="section-heading"><div><h2 class="section-title">你嘅操練紀錄</h2><p>每場操練都會記低，隨時返去溫習。</p></div>${summaries.length ? '<button class="text-button" data-action="download-history" style="font-size:12px">下載操練紀錄</button>' : ''}</div>${summaries.length ? `<div class="history-list">${summaries.map(s => `<article class="history-row"><span class="topic-icon ${topicById(s.round.topic)?.color || 'sage'}">${icon(s.round.mode === 'general' ? 'cap' : s.round.mode === 'trial' ? 'spark' : s.round.mode === 'daily' ? 'clock' : s.round.mode === 'review' ? 'repeat' : topicById(s.round.topic)?.icon)}</span><div class="history-info"><h3>${escape(roundTitle(s.round))}</h3><p>${formatDate(s.round.finishedAt)} · ${s.correct}/${s.total} 題${s.level ? ' · '+s.level.name : ''}</p></div><span class="history-score">${number(s.percent)}<small style="font-size:12px">分</small></span><a class="text-button" href="#/result/${s.round.id}">睇返今場成績 ${icon('arrow')}</a></article>`).join('')}</div><p class="history-note">同一份題庫嘅重做分數，會受記憶影響。返去再做識答，記住都要明白答案背後嘅原因。</p>` : emptyView('第一步操練，等緊你行。','完成一局，呢度就會記低你嘅成績同溫習方向。','入場操練')}<div class="danger-zone"><p>進度只儲存喺呢個瀏覽器。換裝置或者清除網站資料，唔會保留。</p><button class="text-button" data-action="clear-dialog">清除呢個瀏覽器嘅學習紀錄</button></div>`;
}

function emptyView(title, body, cta) { return `<div class="empty-state"><img src="assets/hero.png" width="1536" height="1024" alt="小羊同白鴿喺度等你"><h2>${title}</h2><p>${body}</p><a class="button primary" href="#/">${cta} ${icon('arrow')}</a></div>`; }

function download(name, text, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function resultText(r) {
  const s = summarizeRound(r);
  return `聖經有幾熟？｜Bible Buddy\n${roundTitle(r)}\n${formatDate(r.finishedAt)}\n\n${number(s.percent)} 分 · 答啱 ${s.correct}/${s.total} 題\n${s.level ? '趣味知識稱號：' + s.level.name + '\n' : ''}\n${s.breakdown.filter(t => t.total).map(t => `${t.name}：${t.correct}/${t.total}`).join('\n')}\n\n${s.level ? s.level.cheeky + '\n\n' : ''}${location.hostname.endsWith('chatgpt.site') ? '\n' + location.origin : ''}`;
}
function shareResult(id) {
  const r = progress.history.find(x => x.id === id); if (!r) return;
  shareDialog.innerHTML = `<div class="dialog-top"><div><div class="eyebrow">有收穫，可以同小組分享</div><h2 id="share-title">同小組分享今次嘅收穫。</h2></div><button class="close-button" data-action="close-dialog" aria-label="關閉分享視窗">${icon('close')}</button></div><p style="font-size:13px">操練有收穫，就同弟兄姊妹講吓；想留底，亦可以下載成績。</p><label><span class="sr-only">可複製嘅成績文字</span><textarea id="share-text" class="share-text" readonly>${escape(resultText(r))}</textarea></label><div class="actions"><button class="button primary" data-action="copy-result">複製今次成績</button><button class="button secondary" data-action="download-result" data-id="${r.id}">${icon('download')} 下載戰績</button></div>`;
  shareDialog.showModal();
}

document.addEventListener('input', event => {
  if (event.target.id === 'review-search') { reviewSearch = event.target.value; $('#review-rows').innerHTML = reviewRows(); }
  if (event.target.id === 'result-search') { resultSearch = event.target.value; const r = progress.history.find(x => x.id === route().id); if (r) $('#result-rows').innerHTML = resultRows(r); }
});
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'start') startQuiz(button.dataset.mode, button.dataset.topic, [], button.dataset.difficulty || 'all', button.dataset.count, button.dataset.unit, button.dataset.edition);
  if (action === 'close-dialog') button.closest('dialog').close();
  if (action === 'answer') handleAnswer(Number(button.dataset.choice));
  if (action === 'skip') handleAnswer(null);
  if (action === 'next') handleNext();
  if (action === 'previous') handlePrevious();
  if (action === 'bookmark') {
    const id = button.dataset.id;
    if (!QUESTION_MAP.has(id)) return;
    const on = progress.bookmarks.includes(id);
    progress.bookmarks = on ? progress.bookmarks.filter(x => x !== id) : [...progress.bookmarks, id];
    persist();
    for (const b of document.querySelectorAll(`[data-action="bookmark"][data-id="${id}"]`)) { b.setAttribute('aria-pressed', String(!on)); b.setAttribute('aria-label', `${on ? '收藏呢題' : '取消書籤'}：${QUESTION_MAP.get(id).question}`); b.innerHTML = icon('bookmark') + `<span>${on ? '溫習書籤' : '已收低'}</span>`; }
    toast(on ? '已取消書籤。' : '題目收藏咗，去「溫習角落」就搵得返。');
    if (route().name === 'review' && reviewTab === 'bookmarks') { const hadFocus = document.activeElement === button; main.innerHTML = reviewView(); if (hadFocus) $('[data-tab="bookmarks"]')?.focus({ preventScroll: true }); }
  }
  if (action === 'review-tab') { reviewTab = button.dataset.tab; reviewSearch = ''; main.innerHTML = reviewView(); $(`[data-tab="${reviewTab}"]`)?.focus({ preventScroll: true }); }
  if (action === 'practice') startQuiz('review', 'overview', progress[reviewTab]);
  if (action === 'result-filter') { resultFilter = button.dataset.filter; const r = progress.history.find(x => x.id === route().id); if (r) { for (const b of document.querySelectorAll('[data-action="result-filter"]')) b.setAttribute('aria-pressed', String(b.dataset.filter === resultFilter)); $('#result-rows').innerHTML = resultRows(r); } }
  if (action === 'retry') { const r = progress.history.find(x => x.id === button.dataset.id); if (r) startQuiz(r.mode === 'daily' ? 'general' : r.mode, r.topic || 'overview', r.mode === 'review' ? r.items.map(i => i.id) : [], r.difficulty, r.mode === 'daily' ? 20 : r.items.length, r.unit, r.edition); }
  if (action === 'share') shareResult(button.dataset.id);
  if (action === 'copy-result') {
    try { await navigator.clipboard.writeText($('#share-text').value); toast('複製好啦，可以貼畀朋友。'); }
    catch { $('#share-text').focus(); $('#share-text').select(); toast('請長按或用 Ctrl+C 複製上面嘅文字。'); }
  }
  if (action === 'download-result') { const r = progress.history.find(x => x.id === button.dataset.id); if (r) download(`BibleBuddy-成績-${hongKongDay(new Date(r.finishedAt))}.txt`, resultText(r)); }
  if (action === 'download-history') download('BibleBuddy-學習紀錄.json', JSON.stringify({ exportedAt:new Date().toISOString(), history:progress.history.map(r => ({ date:r.finishedAt, mode:roundTitle(r), correct:summarizeRound(r).correct, total:r.items.length, score:summarizeRound(r).percent, title:summarizeRound(r).level?.name || null })) },null,2),'application/json;charset=utf-8');
  if (action === 'clear-dialog') {
    shareDialog.innerHTML = `<div class="dialog-top"><div><div class="eyebrow">重新起步，都要睇清楚</div><h2 id="share-title">重新起步：清除紀錄？</h2></div><button class="close-button" data-action="close-dialog" aria-label="取消清除">${icon('close')}</button></div><p style="font-size:14px;margin-bottom:24px">會清除呢個瀏覽器嘅未完成操練、成績、錯題、溫習書籤，以及各個課程同書卷嘅操練進度。清除後無法還原；你可以先取消，下載成績紀錄留底。</p><div class="actions"><button class="button secondary" data-action="close-dialog">保留紀錄</button><button class="button primary" data-action="clear-confirm">確定清除</button></div>`; shareDialog.showModal();
  }
  if (action === 'clear-confirm') { progress = { schema:1, tone:'cheeky', current:null, history:[], bookmarks:[], mistakes:[], courseAnswers:{}, bibleAnswers:{}, genesisAnswers:{}, exodusAnswers:{}, numbersAnswers:{}, leviticusAnswers:{}, deuteronomyAnswers:{}, matthewAnswers:{}, markAnswers:{}, lukeAnswers:{}, genesisSeen:[], exodusSeen:[], numbersSeen:[], leviticusSeen:[], deuteronomySeen:[], matthewSeen:[], markSeen:[], lukeSeen:[] }; persist(); shareDialog.close(); render(); toast('紀錄已清除，新一輪操練由你起步。'); }
});
document.addEventListener('keydown', event => {
  if (route().name !== 'quiz' || shareDialog.open || event.ctrlKey || event.altKey || event.metaKey || event.repeat || ['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)) return;
  const index = ['1','2','3','4'].includes(event.key) ? Number(event.key)-1 : ['a','b','c','d'].indexOf(event.key.toLowerCase());
  if (index >= 0) { const choice = document.querySelectorAll('.choice')[index]; if (choice && !choice.disabled) { event.preventDefault(); choice.click(); } }
});
for (const dialog of [shareDialog]) dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
window.addEventListener('hashchange', () => render());
render({ focus:false });
