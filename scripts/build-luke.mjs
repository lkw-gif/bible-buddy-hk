import { readFile, writeFile } from 'node:fs/promises';
const {lessons,hard}=JSON.parse(await readFile(new URL('../research/luke-reviewed.json',import.meta.url),'utf8'));
if(lessons.length!==100||hard.length!==20)throw new Error('Luke needs 100 lesson and 20 advanced questions');
await writeFile(new URL('../dist/luke-data.mjs',import.meta.url),`export const LUKE_DATA = ${JSON.stringify(lessons,null,2)};\n\nexport const LUKE_HARD_DATA = ${JSON.stringify(hard,null,2)};\n`);
console.log('Built Luke question bank.');
