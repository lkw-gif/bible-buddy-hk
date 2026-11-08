import { readFile, writeFile } from 'node:fs/promises';

const { lessons, hard } = JSON.parse(await readFile(new URL('../research/matthew-prepared-draft.json', import.meta.url), 'utf8'));
if (lessons.length !== 100 || hard.length !== 20) throw new Error('Matthew requires 100 lesson and 20 advanced questions');
const output = `export const MATTHEW_DATA = ${JSON.stringify(lessons,null,2)};\n\nexport const MATTHEW_HARD_DATA = ${JSON.stringify(hard,null,2)};\n`;
await writeFile(new URL('../dist/matthew-data.mjs', import.meta.url), output);
console.log('Built Matthew question bank.');
