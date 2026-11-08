import {readFile,writeFile} from 'node:fs/promises';
const church=JSON.parse(await readFile(new URL('../research/church-learning.json',import.meta.url),'utf8'));
const kingdom=JSON.parse(await readFile(new URL('../research/kingdom-learning.json',import.meta.url),'utf8'));
await writeFile(new URL('../dist/learning-data.mjs',import.meta.url),'export const CHURCH_LESSONS='+JSON.stringify(church)+';\nexport const KINGDOM_DATA='+JSON.stringify(kingdom)+';\n');
