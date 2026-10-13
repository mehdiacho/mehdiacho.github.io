import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const exec = promisify(execFile);
const directory = process.env.AUDIT_DIR || 'reports/personal-2026-10-12';
try { const response = await fetch('http://127.0.0.1:4173/'); if (!response.ok) throw Error(String(response.status)); } catch { throw Error('Start the production preview first: npm run preview -- --host 127.0.0.1 --port 4173'); }
await mkdir(directory, {recursive:true});
const results = [];
const routes = process.argv.slice(2);
for (const mode of ['mobile','desktop']) for (const path of routes.length ? routes : ['/', '/models/', '/models/charger-brace/', '/models/mazda-flip-key/']) {
 const output = `${directory}/${path === '/' ? 'home' : path.split('/').filter(Boolean).join('-')}-${mode}`;
 const args = ['node_modules/lighthouse/cli/index.js', 'http://127.0.0.1:4173'+path, '--only-categories=performance,seo', '--chrome-flags=--headless --no-sandbox', '--output=json','--output=html',`--output-path=${output}`,'--quiet'];
 if (mode === 'desktop') args.push('--preset=desktop');
 await exec(process.execPath,args,{env:{...process.env,CHROME_PATH:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'},timeout:180000});
 const r = JSON.parse(await readFile(output+'.report.json','utf8'));
 const row = {path,mode,performance:Math.round(r.categories.performance.score*100),seo:Math.round(r.categories.seo.score*100),lcp:r.audits['largest-contentful-paint'].displayValue,tbt:r.audits['total-blocking-time'].displayValue,error:r.runtimeError??null};
 results.push(row); console.log(JSON.stringify(row));
 await writeFile(directory+'/results.json',JSON.stringify(results,null,2)+'\n');
}
if (results.some(r => r.error || r.performance < 90 || r.seo < 90)) process.exitCode = 1;
