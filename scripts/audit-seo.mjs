import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {pages} from '../seo/pages.mjs';
const exec=promisify(execFile);
const sites=[['portfolio','http://127.0.0.1:4173',pages],['desk-twin','http://127.0.0.1:5190',pages],['greenforest','http://127.0.0.1:4190',[{path:'/'}]]];
const results=[];
await mkdir('reports/seo',{recursive:true});
for(const [site,origin,routes] of sites){
 for(const mode of ['mobile','desktop'])for(const page of routes){
  const slug=page.path==='/'?'home':page.path.replaceAll('/','');
  const output=`reports/seo/${site}-${slug}-${mode}`;
  const args=['node_modules/lighthouse/cli/index.js',origin+page.path,'--only-categories=performance,seo','--chrome-flags=--headless --no-sandbox','--output=json','--output=html',`--output-path=${output}`,'--quiet'];
  if(mode==='desktop')args.push('--preset=desktop');
  await exec(process.execPath,args,{env:{...process.env,CHROME_PATH:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'},timeout:180000});
  const report=JSON.parse(await readFile(output+'.report.json','utf8'));
  const row={site,path:page.path,mode,performance:Math.round(report.categories.performance.score*100),seo:Math.round(report.categories.seo.score*100),report:output+'.report.html',error:report.runtimeError??null};
  results.push(row);console.log(JSON.stringify(row));
  await writeFile('reports/seo/results.json',JSON.stringify(results,null,2)+'\n');
 }
}
if(results.some(r=>r.error||r.performance<90||r.seo<90))process.exitCode=1;
