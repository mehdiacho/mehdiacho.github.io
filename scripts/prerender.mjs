import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'vite';
import {pages,origin} from '../seo/pages.mjs';
import {metadata} from '../seo/metadata.mjs';
import {writeServicePages} from '../seo/static-pages.mjs';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {render,WORKS_3D,CAD_STORIES}=await server.ssrLoadModule('/entry-server.tsx');
 const template=await readFile('dist/index.html','utf8');
 if(!template.includes('<!-- seo:start -->'))throw Error('Missing metadata boundary');
 await writeFile('dist/index.html',template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,metadata(pages[0])).replace('<div id="root"></div>',`<div id="root">${render()}</div>`));
 const css=template.match(/href="([^"]+\.css)"/)[1];
 await writeServicePages('dist',css,WORKS_3D);
 // Portable content snapshot for the new portfolio; refresh deliberately when work changes.
 await writeFile('seo/work-samples.json',JSON.stringify(WORKS_3D,null,2)+'\n');
 const modelPages=[{path:'/models/',title:'The Model Notebook | Mehdi Acho',description:'My CAD and 3D printing experiments: inspect the models, explore the blueprints and read what worked, what did not and what still needs testing.'},...CAD_STORIES.map(s=>({path:`/models/${s.slug}/`,title:`${s.title} — Model and Blueprint | Mehdi Acho`,description:s.description}))];
 for(const page of modelPages){
  await mkdir('dist'+page.path,{recursive:true});
  await writeFile('dist'+page.path+'index.html',template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,metadata(page)).replace('<div id="root"></div>',`<div id="root">${render(page.path)}</div>`));
 }
 await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...pages,...modelPages].map(p=>`<url><loc>${origin+p.path}</loc></url>`).join('')}</urlset>`);
 console.log('Prerendered seven public pages, robots, sitemap and 404.');
}finally{await server.close();}
