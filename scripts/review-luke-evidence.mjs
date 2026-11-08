import { readFile } from 'node:fs/promises';
const batch=process.argv[2];
if(!/^(l(?:[1-9]|10)|hard)$/.test(batch||''))throw new Error('Specify l1–l10 or hard');
const data=JSON.parse(await readFile(new URL('../research/luke-reviewed.json',import.meta.url),'utf8'));
const questions=batch==='hard'?data.hard:data.lessons.filter(q=>q.unit===batch);
const chapters=[...new Set(questions.map(q=>Number(/^路加福音(\d+):/.exec(q.reference)[1])))];
const entries=await Promise.all(chapters.map(async chapter=>{
 const response=await fetch(`https://rcuv.hkbs.org.hk/RCUV2/LUK/${chapter}/`);
 if(!response.ok)throw new Error(`Luke ${chapter}: HTTP ${response.status}`);
 const html=await response.text();
 const passage=/<textarea name="bible"[^>]*>([\s\S]*?)<\/textarea>/.exec(html)?.[1];
 if(!passage)throw new Error(`Luke ${chapter}: Bible text container missing`);
 const verses=new Map();
 for(const match of passage.matchAll(/<b>(\d+)(?:-(\d+))?<\/b>([\s\S]*?)(?=<b>\d+(?:-\d+)?<\/b>|$)/g)){
  const text=match[3].replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/g,'').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
  for(let verse=Number(match[1]);verse<=Number(match[2]||match[1]);verse++)verses.set(verse,text);
 }
 if(!verses.size)throw new Error(`Luke ${chapter}: no verses parsed`);
 return [chapter,verses];
}));
const byChapter=new Map(entries);
for(const q of questions){
 const [,chapter,first,last]=/^路加福音(\d+):(\d+)(?:[–-](\d+))?$/.exec(q.reference);
 const verses=byChapter.get(Number(chapter));
 const requested=Array.from({length:Number(last||first)-Number(first)+1},(_,i)=>Number(first)+i);
 const missing=requested.filter(v=>!verses.has(v));
 if(!verses.has(Number(first))||!verses.has(Number(last||first)))throw new Error(`${q.id}: reference endpoint is absent; missing ${missing.join(', ')}`);
 const printable=requested.filter(v=>verses.has(v)).map(v=>`${v}: ${verses.get(v)}`).join('\n');
 console.log(`\n${q.id} ${q.reference} ${q.question}\n答案：${q.options[q.answer]}\n解說：${q.explanation}${missing.length?`\n本版未列出的中間節數：${missing.join(', ')}`:''}\n${printable}`);
}
