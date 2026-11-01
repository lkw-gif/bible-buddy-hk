import { TOPICS, QUESTIONS, QUESTION_MAP } from './questions.mjs?v=20261101-2';
import { questionForRound, DIFFICULTIES, createRound, answerRound, advanceRound, summarizeRound, validRound, integrateResult, questionPool, hongKongDay } from './engine.mjs?v=20261101-2';

const $ = (s, root = document) => root.querySelector(s);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const number = n => new Intl.NumberFormat('zh-HK', { maximumFractionDigits: 1 }).format(n);
const topicById = id => TOPICS.find(t => t.id === id);
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
  const blank = { schema: 1, tone: 'cheeky', current: null, history: [], bookmarks: [], mistakes: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || saved.schema !== 1) return blank;
    return { ...blank, tone: saved.tone === 'gentle' ? 'gentle' : 'cheeky', current: validRound(saved.current) ? saved.current : null,
      history: Array.isArray(saved.history) ? saved.history.filter(r => validRound(r, true)).slice(0, 60) : [],
      bookmarks: cleanIds(saved.bookmarks), mistakes: cleanIds(saved.mistakes) };
  } catch { storageUnavailable = true; return blank; }
}
function cleanIds(value) { return Array.isArray(value) ? [...new Set(value.filter(id => QUESTION_MAP.has(id)))] : []; }
let progress = readProgress();
let setup = null;
let reviewTab = 'mistakes';
let reviewSearch = '';
let resultFilter = 'wrong';
let resultSearch = '';
let toastTimeout;
const main = $('#main');
const setupDialog = $('#setup-dialog');
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
  return { name: ['review', 'history', 'quiz', 'result'].includes(parts[0]) ? parts[0] : 'home', id: parts[1] || null };
}
function go(path) { if (location.hash === '#' + path) render(); else location.hash = path; }
function updateNavigation() {
  const current = route().name;
  for (const a of document.querySelectorAll('[data-nav]')) {
    if (a.dataset.nav === current || (a.dataset.nav === 'home' && ['quiz', 'result'].includes(current))) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  const badge = $('#review-count'); badge.hidden = !progress.mistakes.length; badge.textContent = progress.mistakes.length;
}
function roundTitle(r) {
  return r.mode === 'general' ? 'General 綜合實力測試' : r.mode === 'daily' ? '每日五題' : r.mode === 'review' ? '錯題／收藏重溫' : topicById(r.topic)?.name || '主題練習';
}
function render({ focus = true } = {}) {
  const page = route();
  main.innerHTML = page.name === 'home' ? homeView() : page.name === 'quiz' ? quizView() : page.name === 'review' ? reviewView() : page.name === 'history' ? historyView() : resultView(page.id);
  updateNavigation();
  if (focus) { window.scrollTo({ top: 0, behavior: 'instant' }); main.focus({ preventScroll: true }); }
  document.title = `${({ home: '聖經有幾熟？', quiz: '慢慢諗，唔使急', review: '我的溫習', history: '成長紀錄', result: '今次學到幾多？' })[page.name]}｜Bible Buddy`;
}

function homeView() {
  const current = progress.current;
  const day = hongKongDay();
  const daily = progress.history.find(r => r.mode === 'daily' && r.day === day);
  return `<section class="hero" aria-labelledby="home-title"><div class="hero-copy"><div class="hero-label"><span>✦</span> 港式聖經小測 · 邊玩邊學</div><h1 id="home-title">返咗咁耐教會，<br><em>聖經有幾熟？</em></h1><p>挪亞定摩西起方舟？唔使舉手，呢度冇人望住你。<br>由聖經常識到神學冷知識，同小羊一齊測吓、學吓。</p><div class="actions"><button class="button primary" data-action="setup" data-mode="general">開始綜合測試 ${icon('arrow')}</button><button class="button secondary" data-action="topics">自己揀主題</button></div><div class="hero-stats"><div><strong>${QUESTIONS.length}</strong> 原創題目</div><div><strong>${TOPICS.length}</strong> 探索方向</div><div><strong>0</strong> 壓力，慢慢學</div></div></div><div class="hero-art"><img src="assets/hero.png" alt="戴圓眼鏡嘅小羊同白鴿坐喺舊式課桌前讀聖經，後面有淡淡嘅香港舊樓" width="1536" height="1024" fetchpriority="high"><span class="art-note">每日讀一啲，記得多一啲。</span><div class="art-badge"><span aria-hidden="true">✧</span> 答錯都唔怕，小羊陪你溫。</div></div></section>
    ${storageUnavailable ? '<p class="privacy-notice">呢個瀏覽器暫時儲存唔到進度。仍然可以測驗，完成後可下載成績。</p>' : ''}
    ${current ? `<aside class="resume-banner"><div><strong>上次嗰局，等緊你返嚟。</strong><p>${escape(roundTitle(current))} · 已答 ${current.answers.length} / ${current.items.length} 題</p></div><a href="#/quiz" class="button primary small">繼續測驗 ${icon('arrow')}</a></aside>` : ''}
    <section class="mode-grid" aria-label="揀一種玩法"><article class="general-card"><div><div class="eyebrow">THE GENERAL CHALLENGE</div><h2>你嘅聖經實力報告<span class="pill">人氣之選</span></h2><p>40 題跨主題挑戰，八個方向各佔 5 題。<br>由初信探索級到神學家彩蛋級，你去到邊？</p><button class="button light" data-action="setup" data-mode="general">測吓我嘅 Level ${icon('arrow')}</button></div><div class="general-decoration" aria-hidden="true">${icon('cap')}</div></article><article class="daily-card"><div class="eyebrow">A LITTLE EVERY DAY</div>${icon('sun','daily-stamp')}<h2>每日五題，小步進前。</h2><p>${daily ? `今日已完成！答啱 ${summarizeRound(daily).correct} / 5 題。返去睇吓解說，鞏固記憶。` : '搭車、等人、飲杯茶，夠時間溫返幾個聖經小知識。'}</p><button class="text-button" data-action="daily">${daily ? '睇返今日成績' : '今日都學少少'} ${icon('arrow')}</button><span class="daily-date">${day.replaceAll('-', '.')}</span></article></section>
    <section class="topics-section" id="topics" aria-labelledby="topics-title"><div class="section-heading"><div><div class="eyebrow">PICK YOUR NEXT ADVENTURE</div><h2 class="section-title" id="topics-title">今日想挑戰咩？</h2><p>先揀最有興趣嗰瓣。每個方向都有暖身、進階同挑戰題。</p></div><span class="pill sand">八大主題 · 任你探索</span></div><div class="topic-grid">${TOPICS.map(t => `<button class="topic-card" data-action="setup" data-mode="topic" data-topic="${t.id}"><span class="topic-top"><span class="topic-icon ${t.color}">${icon(t.icon)}</span><span class="topic-count">${questionPool(t.id).length} 題</span></span><h3>${t.name}</h3><p>${t.description}</p><span class="topic-bottom"><span class="eyebrow">${t.en}</span>${icon('arrow')}</span></button>`).join('')}</div></section>
    `;
}

function openSetup(mode, topic = 'overview', ids = []) {
  setup = { mode, topic, ids };
  const title = mode === 'general' ? '綜合實力測試' : mode === 'daily' ? '今日嘅五題小挑戰' : mode === 'review' ? '讀完，再試一次。' : topicById(topic).name;
  const summary = mode === 'general' ? '40 題 · 八大方向 · 約 12–18 分鐘<br>每個方向 5 題：2 題暖身、2 題進階、1 題挑戰' : mode === 'daily' ? '5 題 · 聖經基本功 · 約 2–3 分鐘<br>以香港日期更新，同日題目固定。' : mode === 'review' ? `${Math.min(ids.length, 30)} 題 · 從你嘅${reviewTab === 'bookmarks' ? '收藏' : '錯題'}抽取 · 不設綜合評級` : `${topicById(topic).description}<br>題序同答案位置每局重新洗牌。`;
  setupDialog.innerHTML = `<form id="setup-form"><div class="dialog-top"><div><div class="eyebrow">READY WHEN YOU ARE</div><h2 id="setup-title">${title}</h2></div><button class="close-button" type="button" data-action="close-dialog" aria-label="關閉設定">${icon('close')}</button></div><div class="setup-summary">${summary}</div>
    ${mode === 'topic' ? '<div class="setup-fields"><label for="difficulty">題目難度<select id="difficulty" name="difficulty"><option value="all">混合難度</option><option value="1">暖身 · 基本功</option><option value="2">進階 · 深入少少</option><option value="3">挑戰 · 認真考你</option></select></label><label for="count">今次答幾題？<select id="count" name="count"><option value="10">10 題 · 約 3–5 分鐘</option><option value="20">20 題 · 約 6–10 分鐘</option><option value="30">30 題 · 約 10–15 分鐘</option></select></label></div><p id="pool-info" class="note" style="margin-bottom:20px">本主題有 30 題可抽取。</p>' : ''}
    <fieldset style="border:0;padding:0;margin:0"><legend style="font-size:14px;font-weight:700">結果評語</legend><div class="tone-options"><label class="tone-option"><input type="radio" name="tone" value="cheeky" ${progress.tone === 'cheeky' ? 'checked' : ''}>幽默啲</label><label class="tone-option"><input type="radio" name="tone" value="gentle" ${progress.tone === 'gentle' ? 'checked' : ''}>認真啲</label></div></fieldset><p class="setup-explain">每題答完有解說同出處，亦可以收藏。冇限時；離開頁面之後，可用同一個瀏覽器繼續。</p>${progress.current ? '<p class="existing-notice">你仲有一局未完成。開始新一局會取代嗰局嘅未完成進度。</p>' : ''}<div class="setup-footer"><button type="submit" class="button primary">${progress.current ? '開始新一局' : '準備好，開始啦！'} ${icon('arrow')}</button><p class="note">唔使填姓名或教會資料，準備好就開始。</p></div></form>`;
  setupDialog.showModal();
}

function startRound(form) {
  const values = new FormData(form);
  try {
    progress.tone = values.get('tone') === 'gentle' ? 'gentle' : 'cheeky';
    progress.current = createRound({ ...setup, count: Number(values.get('count') || 10), difficulty: values.get('difficulty') || 'all', tone: progress.tone });
    persist(); setupDialog.close(); resultFilter = 'wrong'; resultSearch = ''; go('/quiz');
  } catch (error) { toast(error.message); }
}

function quizView() {
  const r = progress.current;
  if (!r) return emptyView('未開始測驗喎。', '揀一個有興趣嘅主題，小羊喺度等你。', '返去揀測驗');
  const q = questionForRound(r, r.items[r.index].id);
  const response = r.answers[r.index];
  const answered = Boolean(response);
  const correct = answered && response.selected === q.answer;
  const t = topicById(q.topic);
  const completed = r.answers.length;
  const feedback = !answered ? '' : `<section class="feedback ${correct ? '' : 'wrong'}" aria-labelledby="feedback-title"><h3 id="feedback-title" tabindex="-1">${correct ? (r.tone === 'gentle' ? '答啱啦，繼續保持！' : '叻喎，呢題難你唔到。') : response.selected === null ? '唔識唔緊要，依家學識佢。' : r.tone === 'gentle' ? '呢題失手，下次就識。' : '差少少！唔好靠估，睇埋解說。'}</h3>${!correct ? `<p><strong>正確答案：${escape(q.options[q.answer])}</strong></p>` : ''}<p>${escape(q.explanation)}</p><p class="reference">出處：${escape(q.reference)}</p>${external(q.source,q.sourceLabel,'')}</section>`;
  return `<div class="quiz-shell"><div class="quiz-top"><a href="#/" class="text-button">${icon('back')} 返回探索（保留進度）</a><div class="quiz-label">${escape(roundTitle(r))}<span class="pill sand">${r.mode === 'general' ? '綜合評級' : '輕鬆練習'}</span></div></div><div class="quiz-layout"><div><div class="quiz-progress"><div class="progress-copy"><strong>第 ${r.index + 1} <span class="muted">/ ${r.items.length} 題</span></strong><span>已完成 ${completed} 題 · 唔使急</span></div><div class="progress-track" role="progressbar" aria-label="答題進度" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="${r.items.length}"><span style="width:${completed / r.items.length * 100}%"></span></div></div><article class="quiz-card"><div class="question-meta"><span class="pill ${t.color}">${t.name}</span><span class="pill sand">${DIFFICULTIES[q.difficulty]}</span>${bookmarkButton(q.id)}</div><h1 class="question-title" id="question-title" tabindex="-1">${escape(q.question)}</h1><div class="choices" role="group" aria-label="揀一個答案">${r.items[r.index].order.map((sourceIndex, position) => {
    const state = !answered ? '' : sourceIndex === q.answer ? ' correct' : sourceIndex === response.selected ? ' wrong' : ' dim';
    return `<button class="choice${state}" data-action="answer" data-choice="${sourceIndex}" ${answered ? 'disabled' : ''}><span class="choice-key" aria-hidden="true">${String.fromCharCode(65 + position)}</span><span>${escape(q.options[sourceIndex])}</span>${answered && sourceIndex === q.answer ? icon('check','status-icon') : answered && sourceIndex === response.selected ? icon('close','status-icon') : ''}<span class="sr-only">${answered && sourceIndex === q.answer ? '正確答案' : answered && sourceIndex === response.selected ? '你揀咗呢個答案，未答啱' : ''}</span></button>`;
  }).join('')}</div>${feedback}<div class="quiz-bottom">${!answered ? '<button class="text-button" data-action="skip">呢題唔識，學答案</button>' : '<span class="note">慢慢讀完解說，再去下一題。</span>'}${answered ? `<button class="button primary" data-action="next">${r.index + 1 === r.items.length ? '睇我嘅成績' : '下一題'} ${icon('arrow')}</button>` : '<span class="note">揀答案，即刻有解說。</span>'}</div></article><p class="keyboard-hint">電腦小貼士：按 1–4 或 A–D 揀答案；亦可以用 Tab 同 Enter 操作。</p></div><aside class="quiz-side"><div class="buddy-card"><img src="assets/hero.png" alt="小羊同白鴿陪你讀聖經" width="1536" height="1024"><h3>小羊陪你，逐題嚟。</h3><p>${r.tone === 'gentle' ? '呢度唔需要證明自己。每學識一題，都係一小步進步。' : '我戴住眼鏡都唔代表識晒。答錯就學返，唔好同本聖經鬥氣。'}</p><div class="question-dots" aria-hidden="true">${r.items.map((item, i) => `<span class="question-dot${r.answers[i] ? r.answers[i].selected === questionForRound(r, item.id).answer ? ' right' : ' missed' : ''}${i === r.index ? ' current' : ''}"></span>`).join('')}</div></div><div class="quiz-note"><h3>${icon('bookmark')} 想再讀？先收藏。</h3><p>右上角嘅書籤，幫你留低想溫習嘅題目。答錯題目亦會喺完成後自動加入錯題集。</p></div></aside></div></div>`;
}

function bookmarkButton(id) {
  const on = progress.bookmarks.includes(id);
  return `<button class="bookmark" data-action="bookmark" data-id="${id}" aria-pressed="${on}" aria-label="${on ? '取消收藏' : '收藏題目'}：${escape(QUESTION_MAP.get(id).question)}">${icon('bookmark')}<span>${on ? '已收藏' : '收藏'}</span></button>`;
}
function handleAnswer(selected) {
  if (!progress.current) return;
  const updated = answerRound(progress.current, selected);
  if (updated === progress.current) return;
  progress.current = updated; persist(); main.innerHTML = quizView();
  const q = questionForRound(updated, updated.items[updated.index].id);
  announce(`${selected === q.answer ? '答啱啦。' : '正確答案係' + q.options[q.answer] + '。'} ${q.explanation}`);
  $('#feedback-title')?.focus();
}
function handleNext() {
  if (!progress.current) return;
  const r = advanceRound(progress.current);
  if (r === progress.current) return;
  if (r.finishedAt) { progress = integrateResult(progress, r); persist(); resultFilter = 'wrong'; resultSearch = ''; go('/result/' + r.id); }
  else { progress.current = r; persist(); main.innerHTML = quizView(); $('#question-title')?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }
}

function resultView(id) {
  const r = progress.history.find(x => x.id === id);
  if (!r) return emptyView('呢份成績未喺呢個瀏覽器。', '成績只儲存喺作答嗰個瀏覽器。你可以由首頁開始新一局。', '返去揀測驗');
  const s = summarizeRound(r);
  const weak = [...s.breakdown].filter(t => t.total).sort((a,b) => a.percent - b.percent)[0];
  const recommendation = s.correct === s.total ? topicById('context') : weak;
  const title = s.level ? `${s.level.symbol} ${s.level.name}` : s.percent >= 80 ? '做得好，繼續探索！' : '完成啦，又學多一啲。';
  const remark = s.level ? s.level[r.tone] : r.tone === 'gentle' ? '每次練習都會多認識一啲。溫返今次唔熟嗰幾題，就係好好嘅下一步。' : s.percent >= 80 ? '呢瓣幾熟手喎！記住讀埋出處，下次同小組分享唔使淨係靠記憶。' : '啲答案好似個個都識你，你又未必認得晒佢哋。溫返錯題，下次就唔使靠撞！';
  return `<div class="page-head"><div class="eyebrow">A LITTLE WISER THAN BEFORE</div><p class="stored-result">${escape(roundTitle(r))} · ${formatDate(r.finishedAt)}${r.mode === 'topic' ? ' · ' + (DIFFICULTIES[r.difficulty] || '混合難度') : ''}</p></div><section class="result-hero" aria-labelledby="result-title"><div><div class="result-topline">${icon('check')} 今局完成 · 答啱 ${s.correct} 題${s.skipped ? ` · ${s.skipped} 題先學答案` : ''}</div><div class="eyebrow">${s.level ? 'YOUR GENERAL KNOWLEDGE LEVEL' : 'PRACTICE MAKES PROGRESS'}</div><h1 id="result-title">${title}</h1><p>${remark}</p><div class="actions"><button class="button primary" data-action="retry" data-id="${r.id}">${icon('repeat')} 再挑戰一局</button><button class="button secondary" data-action="share" data-id="${r.id}">分享／下載成績</button></div><p class="result-explainer"><button class="text-button" data-action="result-tone" data-id="${r.id}" style="font-size:11px;min-height:30px">${r.tone === 'cheeky' ? '轉做認真版' : '轉做幽默版'}</button></p></div><div><div class="score-ring" style="--value:${s.percent}" role="img" aria-label="${number(s.percent)}分，答啱${s.correct}題，共${s.total}題"><div><strong>${number(s.percent)}<small style="font-size:19px">分</small></strong><span>${s.correct} / ${s.total} 題答啱</span></div></div><p class="score-note">${s.total} 題等分 · 答錯／跳過不扣額外分</p></div></section>
    <section class="result-grid" aria-label="分項表現與溫習方向"><div class="panel"><h2>今局嘅知識地圖</h2>${s.breakdown.filter(t => t.total).map(t => `<div class="breakdown-row"><span class="label">${t.name}</span><span class="bar" aria-hidden="true"><span style="width:${t.percent}%"></span></span><span class="value">${t.correct}/${t.total}</span></div>`).join('')}<p class="note" style="margin-top:17px">分項只反映今局抽到嘅題目，供揀溫習方向用。</p></div><div class="panel growth-note"><div class="tip-symbol" aria-hidden="true">🌱</div><h2>下一步，讀返一小段。</h2><h3>${s.correct === s.total ? '識得答，更值得讀深啲。' : `${recommendation.name}可以再熟啲。`}</h3><p>${recommendation.tip}</p><span class="reading">建議閱讀：${recommendation.reading}</span>${external(scriptureUrl(recommendation.reading),'打開經文讀吓','text-button')}<p class="note">唔使一晚追晒。每日少少，都比停喺原地好。</p></div></section>
    <section aria-labelledby="result-review-title"><div class="section-heading"><div><h2 class="section-title" id="result-review-title">睇返啲題，學返啲嘢。</h2><p>答錯題目已經自動加入「我的溫習」。答啱重溫題，會移出錯題集。</p></div></div><div class="review-toolbar"><div class="tabs" aria-label="篩選今局題目"><button data-action="result-filter" data-filter="wrong" aria-pressed="${resultFilter === 'wrong'}">答錯／跳過 ${s.total-s.correct}</button><button data-action="result-filter" data-filter="all" aria-pressed="${resultFilter === 'all'}">全部 ${s.total}</button></div><label class="search-wrap">${icon('search')}<span class="sr-only">搜尋今局題目</span><input id="result-search" type="search" placeholder="搵返某一題…" value="${escape(resultSearch)}"></label></div><div id="result-rows">${resultRows(r)}</div></section>`;
}
function formatDate(date) { return new Intl.DateTimeFormat('zh-HK', { timeZone: 'Asia/Hong_Kong', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date)); }
function includesSearch(q, search) { const text = `${q.question} ${q.options.join(' ')} ${q.explanation} ${q.reference}`.toLowerCase(); return text.includes(search.trim().toLowerCase()); }
function resultRows(r) {
  const rows = summarizeRound(r).rows.filter(row => (resultFilter === 'all' || !row.correct) && includesSearch(row.question, resultSearch));
  if (!rows.length) return `<div class="empty-state"><div class="empty-symbol" aria-hidden="true">${resultSearch ? '🔎' : '✧'}</div><h2>${resultSearch ? '今局搵唔到呢個關鍵字。' : resultFilter === 'wrong' ? '今局全部答啱，好嘢！' : '暫時冇題目。'}</h2><p>${resultSearch ? '試吓用人物名、書卷或者另一個字搵。' : '可以切換「全部」，重讀解說同收藏想深入嘅題目。'}</p></div>`;
  return rows.map(row => questionCard(row.question, row)).join('');
}

function questionCard(q, row = null) {
  const t = topicById(q.topic);
  return `<article class="review-card"><div class="review-card-top"><div><span class="pill ${t.color}">${t.name}</span> <span class="pill sand">${DIFFICULTIES[q.difficulty]}</span>${row ? ` <span class="status-text${row.correct ? '' : ' wrong'}">${row.correct ? '✓ 答啱' : row.selected === null ? '— 先學答案' : '× 未答啱'}</span>` : ''}</div>${bookmarkButton(q.id)}</div><h3>${escape(q.question)}</h3>${row && !row.correct && row.selected !== null ? `<p class="your-answer">你嘅答案：${escape(q.options[row.selected])}</p>` : ''}<p class="answer-line">正確答案：${escape(q.options[q.answer])}</p><p class="explanation">${escape(q.explanation)}</p><p class="reference">${escape(q.reference)} · <a href="${escape(q.source)}" target="_blank" rel="noopener noreferrer">${q.sourceLabel} ↗</a></p></article>`;
}

function reviewView() {
  return `<div class="page-head"><div class="eyebrow">YOUR LITTLE STUDY CORNER</div><h1>上次唔識，今次學識。</h1><p>錯題同收藏都留喺呢度。重溫時答啱嘅題目，會自動移出錯題集。</p></div><div class="review-toolbar"><div class="tabs" aria-label="選擇溫習題目"><button data-action="review-tab" data-tab="mistakes" aria-pressed="${reviewTab === 'mistakes'}">錯題集 ${progress.mistakes.length}</button><button data-action="review-tab" data-tab="bookmarks" aria-pressed="${reviewTab === 'bookmarks'}">我的收藏 ${progress.bookmarks.length}</button></div><button class="button primary small practice-button" data-action="practice" ${!progress[reviewTab].length ? 'disabled' : ''}>${icon('repeat')} 抽題再試</button></div><label class="search-wrap" style="max-width:500px;margin-bottom:22px">${icon('search')}<span class="sr-only">搜尋溫習題目</span><input id="review-search" type="search" placeholder="搵人物、書卷或者經文…" value="${escape(reviewSearch)}"></label><div id="review-rows">${reviewRows()}</div><p class="note" style="margin-top:20px">未完成嗰局嘅錯題，會喺交卷後一齊加入。紀錄只存在呢個瀏覽器，唔會同步到其他裝置。</p>`;
}
function reviewRows() {
  const questions = progress[reviewTab].map(id => QUESTION_MAP.get(id)).filter(q => includesSearch(q, reviewSearch));
  if (!questions.length) return `<div class="empty-state">${reviewSearch ? '<div class="empty-symbol">🔎</div>' : '<img src="assets/hero.png" alt="小羊靜靜地陪你溫習" width="1536" height="1024">'}<h2>${reviewSearch ? '未搵到呢個關鍵字。' : reviewTab === 'mistakes' ? '錯題集暫時清清哋。' : '留低一題，下次再讀。'}</h2><p>${reviewSearch ? '試吓用短啲嘅字，或者另一個書卷名。' : reviewTab === 'mistakes' ? '完成測驗後，答錯同跳過嘅題目會出現喺呢度。唔識，正正就係學習嘅開始。' : '喺測驗或者題庫按「收藏」，就可以砌出自己嘅溫習清單。'}</p><a class="button primary" href="#/">開始一個測驗 ${icon('arrow')}</a></div>`;
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
  return `<div class="page-head"><div class="eyebrow">GROW AT YOUR OWN PACE</div><h1>一步一步，都有記低。</h1><p>唔使同人鬥分。睇返自己學過啲咩，就知下一步可以去邊。</p></div><div class="stats-grid"><div class="stat-card"><strong>${summaries.length}</strong><p class="stat-title">完成測驗</p><p class="stat-sub">保留最近 60 局</p></div><div class="stat-card"><strong>${total ? number(correct / total * 100) + '%' : '—'}</strong><p class="stat-title">已記錄題目正確率</p><p class="stat-sub">${correct} / ${total} 題答啱</p></div><div class="stat-card"><strong>${best ? number(best.percent) : '—'}</strong><p class="stat-title">最佳 General 分數</p><p class="stat-sub">${best ? best.level.name : '綜合稱號等緊你'}</p></div><div class="stat-card"><strong>${streakDays()} <small style="font-size:15px">日</small></strong><p class="stat-title">連續完成測驗</p><p class="stat-sub">以香港日期計算</p></div></div>${best ? `<p class="privacy-notice">${best.level.symbol} 最佳綜合稱號：${best.level.name} · ${number(best.percent)} 分。稱號係知識遊戲記號，唔係信仰或牧職評核。</p>` : ''}<div class="section-heading"><div><h2 class="section-title">你嘅學習足跡</h2><p>每一局都可以返去睇解說。</p></div>${summaries.length ? '<button class="text-button" data-action="download-history" style="font-size:12px">下載紀錄</button>' : ''}</div>${summaries.length ? `<div class="history-list">${summaries.map(s => `<article class="history-row"><span class="topic-icon ${topicById(s.round.topic)?.color || 'sage'}">${icon(s.round.mode === 'general' ? 'cap' : s.round.mode === 'daily' ? 'sun' : s.round.mode === 'review' ? 'repeat' : topicById(s.round.topic)?.icon)}</span><div class="history-info"><h3>${escape(roundTitle(s.round))}</h3><p>${formatDate(s.round.finishedAt)} · ${s.correct}/${s.total} 題${s.level ? ' · '+s.level.name : ''}</p></div><span class="history-score">${number(s.percent)}<small style="font-size:12px">分</small></span><a class="text-button" href="#/result/${s.round.id}">睇返成績 ${icon('arrow')}</a></article>`).join('')}</div><p class="history-note">同一份題庫嘅重做分數，會受記憶影響。分數適合做溫習提示，唔係正式能力認證。</p>` : emptyView('第一個腳印，等緊你。','完成一局，呢度就會記低你嘅成績同溫習方向。','開始探索')}<div class="danger-zone"><p>進度只儲存喺呢個瀏覽器。換裝置或者清除網站資料，唔會保留。</p><button class="text-button" data-action="clear-dialog">清除呢個瀏覽器嘅學習紀錄</button></div>`;
}

function emptyView(title, body, cta) { return `<div class="empty-state"><img src="assets/hero.png" width="1536" height="1024" alt="小羊同白鴿喺度等你"><h2>${title}</h2><p>${body}</p><a class="button primary" href="#/">${cta} ${icon('arrow')}</a></div>`; }

function download(name, text, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function resultText(r) {
  const s = summarizeRound(r);
  return `聖經有幾熟？｜Bible Buddy\n${roundTitle(r)}\n${formatDate(r.finishedAt)}\n\n${number(s.percent)} 分 · 答啱 ${s.correct}/${s.total} 題\n${s.level ? '趣味知識稱號：' + s.level.name + '\n' : ''}\n${s.breakdown.filter(t => t.total).map(t => `${t.name}：${t.correct}/${t.total}`).join('\n')}\n\n${s.level ? s.level[r.tone] + '\n\n' : ''}${location.hostname.endsWith('chatgpt.site') ? '\n' + location.origin : ''}`;
}
function shareResult(id) {
  const r = progress.history.find(x => x.id === id); if (!r) return;
  shareDialog.innerHTML = `<div class="dialog-top"><div><div class="eyebrow">TAKE A LITTLE ENCOURAGEMENT</div><h2 id="share-title">帶走今次嘅進步。</h2></div><button class="close-button" data-action="close-dialog" aria-label="關閉分享視窗">${icon('close')}</button></div><p style="font-size:13px">可以複製文字畀小組朋友，或者下載成績留底。</p><label><span class="sr-only">可複製嘅成績文字</span><textarea id="share-text" class="share-text" readonly>${escape(resultText(r))}</textarea></label><div class="actions"><button class="button primary" data-action="copy-result">複製文字</button><button class="button secondary" data-action="download-result" data-id="${r.id}">${icon('download')} 下載 TXT</button></div>`;
  shareDialog.showModal();
}

document.addEventListener('submit', event => { if (event.target.id === 'setup-form') { event.preventDefault(); startRound(event.target); } });
document.addEventListener('change', event => {
  if (event.target.id === 'difficulty') {
    const available = questionPool(setup.topic, event.target.value).length;
    for (const option of $('#count').options) option.disabled = Number(option.value) > available;
    if (Number($('#count').value) > available) $('#count').value = '10';
    $('#pool-info').textContent = `呢個難度有 ${available} 題可抽取。`;
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'review-search') { reviewSearch = event.target.value; $('#review-rows').innerHTML = reviewRows(); }
  if (event.target.id === 'result-search') { resultSearch = event.target.value; const r = progress.history.find(x => x.id === route().id); if (r) $('#result-rows').innerHTML = resultRows(r); }
});
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'setup') openSetup(button.dataset.mode, button.dataset.topic);
  if (action === 'close-dialog') button.closest('dialog').close();
  if (action === 'topics') $('#topics').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  if (action === 'daily') {
    const saved = progress.history.find(r => r.mode === 'daily' && r.day === hongKongDay());
    if (saved) go('/result/' + saved.id);
    else if (progress.current?.mode === 'daily' && progress.current.day === hongKongDay()) go('/quiz');
    else openSetup('daily');
  }
  if (action === 'answer') handleAnswer(Number(button.dataset.choice));
  if (action === 'skip') handleAnswer(null);
  if (action === 'next') handleNext();
  if (action === 'bookmark') {
    const id = button.dataset.id;
    if (!QUESTION_MAP.has(id)) return;
    const on = progress.bookmarks.includes(id);
    progress.bookmarks = on ? progress.bookmarks.filter(x => x !== id) : [...progress.bookmarks, id];
    persist();
    for (const b of document.querySelectorAll(`[data-action="bookmark"][data-id="${id}"]`)) { b.setAttribute('aria-pressed', String(!on)); b.setAttribute('aria-label', `${on ? '收藏題目' : '取消收藏'}：${QUESTION_MAP.get(id).question}`); b.innerHTML = icon('bookmark') + `<span>${on ? '收藏' : '已收藏'}</span>`; }
    toast(on ? '已取消收藏。' : '收藏咗，去「我的溫習」就搵得返。');
    if (route().name === 'review' && reviewTab === 'bookmarks') { const hadFocus = document.activeElement === button; main.innerHTML = reviewView(); if (hadFocus) $('[data-tab="bookmarks"]')?.focus({ preventScroll: true }); }
  }
  if (action === 'review-tab') { reviewTab = button.dataset.tab; reviewSearch = ''; main.innerHTML = reviewView(); $(`[data-tab="${reviewTab}"]`)?.focus({ preventScroll: true }); }
  if (action === 'practice') openSetup('review', 'overview', progress[reviewTab]);
  if (action === 'result-filter') { resultFilter = button.dataset.filter; const r = progress.history.find(x => x.id === route().id); if (r) { for (const b of document.querySelectorAll('[data-action="result-filter"]')) b.setAttribute('aria-pressed', String(b.dataset.filter === resultFilter)); $('#result-rows').innerHTML = resultRows(r); } }
  if (action === 'retry') { const r = progress.history.find(x => x.id === button.dataset.id); if (r) { if (r.mode === 'daily') toast('每日挑戰同日題目固定；想再玩，可以揀主題練習。'); else openSetup(r.mode, r.topic || 'overview', r.mode === 'review' ? r.items.map(i => i.id) : []); } }
  if (action === 'result-tone') { const r = progress.history.find(x => x.id === button.dataset.id); if (r) { r.tone = r.tone === 'gentle' ? 'cheeky' : 'gentle'; progress.tone = r.tone; persist(); const y = window.scrollY; main.innerHTML = resultView(r.id); window.scrollTo({ top:y, behavior:'instant' }); $('[data-action="result-tone"]')?.focus({ preventScroll: true }); } }
  if (action === 'share') shareResult(button.dataset.id);
  if (action === 'copy-result') {
    try { await navigator.clipboard.writeText($('#share-text').value); toast('複製好啦，可以貼畀朋友。'); }
    catch { $('#share-text').focus(); $('#share-text').select(); toast('請長按或用 Ctrl+C 複製上面嘅文字。'); }
  }
  if (action === 'download-result') { const r = progress.history.find(x => x.id === button.dataset.id); if (r) download(`BibleBuddy-成績-${hongKongDay(new Date(r.finishedAt))}.txt`, resultText(r)); }
  if (action === 'download-history') download('BibleBuddy-學習紀錄.json', JSON.stringify({ exportedAt:new Date().toISOString(), history:progress.history.map(r => ({ date:r.finishedAt, mode:roundTitle(r), correct:summarizeRound(r).correct, total:r.items.length, score:summarizeRound(r).percent, title:summarizeRound(r).level?.name || null })) },null,2),'application/json;charset=utf-8');
  if (action === 'clear-dialog') {
    shareDialog.innerHTML = `<div class="dialog-top"><div><div class="eyebrow">A FRESH PAGE</div><h2 id="share-title">清除學習紀錄？</h2></div><button class="close-button" data-action="close-dialog" aria-label="取消清除">${icon('close')}</button></div><p style="font-size:14px;margin-bottom:24px">會清除呢個瀏覽器嘅未完成測驗、成績、錯題同收藏。清除後無法還原；你可以先取消，下載成績紀錄留底。</p><div class="actions"><button class="button secondary" data-action="close-dialog">保留紀錄</button><button class="button primary" data-action="clear-confirm">確定清除</button></div>`; shareDialog.showModal();
  }
  if (action === 'clear-confirm') { progress = { schema:1, tone:'cheeky', current:null, history:[], bookmarks:[], mistakes:[] }; persist(); shareDialog.close(); render(); toast('紀錄已清除，新一頁由你開始。'); }
});
document.addEventListener('keydown', event => {
  if (route().name !== 'quiz' || setupDialog.open || shareDialog.open || event.ctrlKey || event.altKey || event.metaKey || event.repeat || ['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)) return;
  const index = ['1','2','3','4'].includes(event.key) ? Number(event.key)-1 : ['a','b','c','d'].indexOf(event.key.toLowerCase());
  if (index >= 0) { const choice = document.querySelectorAll('.choice')[index]; if (choice && !choice.disabled) { event.preventDefault(); choice.click(); } }
});
for (const dialog of [setupDialog,shareDialog]) dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
window.addEventListener('hashchange', () => render());
render({ focus:false });
