import { readFile } from 'node:fs/promises';

// Read the official Hong Kong Bible Society text for human review without
// storing or publishing the copyrighted Bible text in the repository.
const batch = process.argv[2];
if (!/^(m(?:[1-9]|10)|hard)$/.test(batch || '')) throw new Error('Specify m1–m10 or hard');
const data = JSON.parse(await readFile(new URL('../research/matthew-prepared-draft.json', import.meta.url), 'utf8'));
const questions = batch === 'hard' ? data.hard : data.lessons.filter(q => q.unit === batch);
const chapters = [...new Set(questions.map(q => Number(/^馬太福音(\d+):/.exec(q.reference)[1])))];
const entries = await Promise.all(chapters.map(async chapter => {
  const response = await fetch(`https://rcuv.hkbs.org.hk/RCUV2/MAT/${chapter}/`);
  if (!response.ok) throw new Error(`Matthew ${chapter}: HTTP ${response.status}`);
  const html = await response.text();
  const passage = /<textarea name="bible"[^>]*>([\s\S]*?)<\/textarea>/.exec(html)?.[1];
  if (!passage) throw new Error(`Matthew ${chapter}: Bible text container missing`);
  const verses = new Map();
  for (const match of passage.matchAll(/<b>(\d+)<\/b>([\s\S]*?)(?=<b>\d+<\/b>|$)/g)) {
    const text = match[2].replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/g, '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    verses.set(Number(match[1]), text);
  }
  if (!verses.size) throw new Error(`Matthew ${chapter}: no verses parsed`);
  return [chapter, verses];
}));
const byChapter = new Map(entries);
for (const q of questions) {
  const [, chapter, first, last] = /^馬太福音(\d+):(\d+)(?:[–-](\d+))?$/.exec(q.reference);
  const verses = byChapter.get(Number(chapter));
  const requested = Array.from({length:Number(last || first)-Number(first)+1}, (_,i)=>Number(first)+i);
  const missing = requested.filter(v => !verses.has(v));
  if (missing.length) throw new Error(`${q.id}: missing verses ${missing.join(', ')}`);
  console.log(`\n${q.id} ${q.reference} ${q.question}\n選項：${q.options.join(' / ')}\n解說：${q.explanation}`);
  console.log(requested.map(v => `${v}: ${verses.get(v)}`).join('\n'));
}
