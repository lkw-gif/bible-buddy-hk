import { readFile, writeFile } from 'node:fs/promises';
const {lessons,hard}=JSON.parse(await readFile(new URL('../research/mark-reviewed.json',import.meta.url),'utf8'));
if(lessons.length!==100||hard.length!==20)throw new Error('Mark needs 100 lesson and 20 advanced questions');
await writeFile(new URL('../dist/mark-data.mjs',import.meta.url),`export const MARK_DATA = ${JSON.stringify(lessons,null,2)};\n\nexport const MARK_HARD_DATA = ${JSON.stringify(hard,null,2)};\n`);
console.log('Built Mark question bank.');
