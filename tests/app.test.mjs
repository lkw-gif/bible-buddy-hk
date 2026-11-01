import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';
import { QUESTION_MAP } from '../dist/questions.mjs';

// DOM integration tests exercise the actual application module and user events.
// jsdom does not provide visual layout; dialogs/scroll/clipboard are emulated here.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const key = 'bible-buddy-hk:v1';
let bootCount = 0;
async function boot(saved = null, hash = '#/') {
  const errors = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, { url: 'http://bible-buddy.test/' + hash, pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.scrollTo = () => {};
  w.matchMedia = () => ({ matches: true });
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
  w.HTMLDialogElement.prototype.close = function() { this.open = false; };
  const copies = [], downloads = [];
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async value => { copies.push(value); } } });
  const clickAnchor = w.HTMLAnchorElement.prototype.click;
  w.HTMLAnchorElement.prototype.click = function() { if (this.download) downloads.push({ name: this.download, href: this.href }); else clickAnchor.call(this); };
  if (saved) w.localStorage.setItem(key, saved);
  for (const [name,value] of Object.entries({ window:w, document:w.document, location:w.location, navigator:w.navigator, FormData:w.FormData, localStorage:w.localStorage })) Object.defineProperty(globalThis,name,{ value, configurable:true, writable:true });
  await import(`../dist/app.mjs?domtest=${++bootCount}`);
  const $ = selector => w.document.querySelector(selector);
  const tick = async () => { await new Promise(resolve => setTimeout(resolve, 5)); };
  const click = async selector => { const element = $(selector); assert(element, `Missing control ${selector}`); assert(!element.disabled, `Disabled control ${selector}`); element.click(); await tick(); };
  const submit = async () => { $('#setup-form').dispatchEvent(new w.Event('submit',{ bubbles:true, cancelable:true })); await tick(); };
  const savedProgress = () => JSON.parse(w.localStorage.getItem(key));
  const input = (selector,value) => { $(selector).value=value; $(selector).dispatchEvent(new w.Event('input',{bubbles:true})); };
  const select = (selector,value) => { $(selector).value=value; $(selector).dispatchEvent(new w.Event('change',{bubbles:true})); };
  const navigate = async path => { w.location.hash = path; await tick(); };
  return { dom,w,$,click,submit,savedProgress,tick,input,select,navigate,errors,copies,downloads };
}

test('Home presents eight real topics, imagery and working General setup', async () => {
  const app = await boot();
  assert.match(app.$('h1').textContent,/聖經有幾熟/);
  assert.equal(app.w.document.querySelectorAll('.topic-card').length,8);
  assert.match(app.$('.hero-art img').alt,/小羊.*白鴿/);
  assert.match(app.$('.hero-art img').src,/assets\/hero.png$/);
  assert.equal(app.$('[data-nav="home"]').getAttribute('aria-current'),'page');
  await app.click('[data-action="setup"][data-mode="general"]');
  assert(app.$('#setup-dialog').open);
  assert.match(app.$('.setup-summary').textContent,/40 題/);
  assert.equal(app.$('#difficulty'),null);
  await app.submit();
  assert.equal(app.w.location.hash,'#/quiz');
  assert.equal(app.savedProgress().current.items.length,40);
  assert.equal(app.w.document.querySelectorAll('.choice').length,4);
  assert.deepEqual(app.errors,[]);
  app.dom.window.close();
});

test('A full 40-question General round produces correct score, title, mistake list, sharing and history', async () => {
  const app = await boot();
  await app.click('[data-mode="general"]');
  app.$('input[name="tone"][value="gentle"]').checked=true;
  await app.submit();
  let bookmarked;
  for (let i=0; i<40; i++) {
    const r=app.savedProgress().current;
    const q=QUESTION_MAP.get(r.items[r.index].id);
    if (i===0) { bookmarked=q.id; await app.click('.question-meta [data-action="bookmark"]'); await app.click('[data-action="skip"]'); }
    else await app.click(`[data-action="answer"][data-choice="${i===1?1:q.answer}"]`);
    assert.equal(app.w.document.querySelectorAll('.choice:disabled').length,4);
    assert.equal(app.w.document.querySelectorAll('.choice.correct').length,1);
    assert.match(app.$('.feedback').textContent,new RegExp(q.explanation.slice(0,8).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.equal(app.savedProgress().current.answers.length,i+1);
    await app.click('[data-action="next"]');
  }
  assert.match(app.w.location.hash,/^#\/result\//);
  assert.match(app.$('#result-title').textContent,/神學老師挑戰級/);
  assert.match(app.$('.score-ring').textContent,/95/);
  assert.match(app.$('.score-ring').textContent,/38 \/ 40/);
  assert.equal(app.w.document.querySelectorAll('.breakdown-row').length,8);
  const p=app.savedProgress();
  assert.equal(p.current,null);
  assert.equal(p.history.length,1);
  assert.equal(p.mistakes.length,2);
  assert(p.bookmarks.includes(bookmarked));
  await app.click('[data-action="share"]');
  assert(app.$('#share-dialog').open);
  assert.match(app.$('#share-text').value,/95 分/);
  await app.click('[data-action="copy-result"]');
  assert.equal(app.copies.length,1);
  await app.click('[data-action="download-result"]');
  assert.match(app.downloads[0].name,/\.txt$/);
  await app.click('#share-dialog [data-action="close-dialog"]');
  await app.navigate('/history');
  assert.equal(app.w.document.querySelectorAll('.history-row').length,1);
  assert.match(app.$('.history-row').textContent,/38\/40/);
  await app.navigate('/review');
  assert.equal(app.w.document.querySelectorAll('.review-card').length,2);
  await app.click('[data-action="practice"]');
  await app.submit();
  for (let i=0;i<2;i++) { await app.click('[data-action="answer"][data-choice="0"]'); await app.click('[data-action="next"]'); }
  assert.equal(app.savedProgress().mistakes.length,0);
  assert.equal(app.savedProgress().bookmarks.length,1);
  assert(app.$('#review-count').hasAttribute('hidden'));
  assert.deepEqual(app.errors,[]);
  app.dom.window.close();
});

test('Topic difficulty caps question count; in-progress answer survives a fresh application load', async () => {
  let app=await boot();
  await app.click('[data-mode="topic"][data-topic="old"]');
  app.select('#count','30');
  app.select('#difficulty','3');
  assert.equal(app.$('#count').value,'10');
  assert(app.$('#count option[value="30"]').disabled);
  await app.submit();
  assert(app.savedProgress().current.items.every(i=>QUESTION_MAP.get(i.id).difficulty===3));
  await app.click('[data-action="answer"][data-choice="0"]');
  const saved=app.w.localStorage.getItem(key);
  const id=app.savedProgress().current.items[0].id;
  app.dom.window.close();
  app=await boot(saved,'#/quiz');
  assert.equal(app.savedProgress().current.items[0].id,id);
  assert(app.$('.feedback'));
  assert.equal(app.w.document.querySelectorAll('.choice:disabled').length,4);
  await app.click('[data-action="next"]');
  assert.equal(app.savedProgress().current.index,1);
  await app.navigate('/');
  assert.match(app.$('.resume-banner').textContent,/已答 1 \/ 10/);
  assert.deepEqual(app.errors,[]);
  app.dom.window.close();
});

test('Daily round awards no global title and today button reopens its existing result', async () => {
  const app=await boot();
  await app.click('[data-action="daily"]'); await app.submit();
  assert.equal(app.savedProgress().current.items.length,5);
  for (let i=0;i<5;i++) { await app.click('[data-action="answer"][data-choice="0"]'); await app.click('[data-action="next"]'); }
  const id=app.savedProgress().history[0].id;
  assert.match(app.$('.score-ring').textContent,/100/);
  assert(!app.$('#result-title').textContent.includes('神學家'));
  assert.match(app.$('.result-explainer').textContent,/不頒發綜合稱號/);
  await app.navigate('/');
  assert.match(app.$('.daily-card').textContent,/今日已完成/);
  await app.click('[data-action="daily"]');
  assert.equal(app.w.location.hash,'#/result/'+id);
  assert.equal(app.savedProgress().history.length,1);
  assert.deepEqual(app.errors,[]);
  app.dom.window.close();
});

test('Question library filters all 240 questions and search remains usable while results update', async () => {
  const app=await boot(null,'#/guide');
  assert.match(app.$('.bank-count').textContent,/240/);
  assert.equal(app.w.document.querySelectorAll('#bank-rows .review-card').length,16);
  app.select('#bank-topic','language');
  assert.match(app.$('.bank-count').textContent,/30 題/);
  app.select('#bank-difficulty','3');
  assert.equal(app.w.document.querySelectorAll('#bank-rows .review-card').length,10);
  app.input('#bank-search','nephesh');
  assert.equal(app.w.document.querySelectorAll('#bank-rows .review-card').length,1);
  await app.click('#bank-rows [data-action="bookmark"]');
  assert.equal(app.savedProgress().bookmarks.length,1);
  app.input('#bank-search','完全冇呢個字123');
  assert.match(app.$('.bank-count').textContent,/0 題/);
  assert.equal(app.$('#bank-search').value,'完全冇呢個字123');
  await app.click('[data-action="download-bank"]');
  assert.match(app.downloads[0].name,/240題題庫.json$/);
  await app.navigate('/review');
  await app.click('[data-tab="bookmarks"]');
  assert.equal(app.w.document.querySelectorAll('.review-card').length,1);
  await app.click('.review-card [data-action="bookmark"]');
  assert.equal(app.savedProgress().bookmarks.length,0);
  assert.match(app.$('.empty-state').textContent,/留低一題/);
  assert.deepEqual(app.errors,[]);
  app.dom.window.close();
});

test('Corrupted persisted data cannot crash a quiz or inject a fabricated history item', async () => {
  const app=await boot(JSON.stringify({schema:1,history:[{id:'bad'}],current:{mode:'general'},bookmarks:['missing'],mistakes:null}),'#/quiz');
  assert.match(app.$('#main').textContent,/未開始測驗/);
  await app.navigate('/history');
  assert.equal(app.w.document.querySelectorAll('.history-row').length,0);
  assert.deepEqual(app.errors,[]);
  app.dom.window.close();
});
