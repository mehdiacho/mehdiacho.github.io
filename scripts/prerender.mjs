import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {pages} from '../seo/pages.mjs';
import {metadata} from '../seo/metadata.mjs';
import {writeServicePages} from '../seo/static-pages.mjs';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {render,WORKS_3D}=await server.ssrLoadModule('/entry-server.tsx');
 const template=await readFile('dist/index.html','utf8');
 if(!template.includes('<!-- seo:start -->'))throw Error('Missing metadata boundary');
 await writeFile('dist/index.html',template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,metadata(pages[0])).replace('<div id="root"></div>',`<div id="root">${render()}</div>`));
 const css=template.match(/href="([^"]+\.css)"/)[1];
 await writeServicePages('dist',css,WORKS_3D);
 // Portable content snapshot for the new portfolio; refresh deliberately when work changes.
 await writeFile('seo/work-samples.json',JSON.stringify(WORKS_3D,null,2)+'\n');
 console.log('Prerendered four public pages, robots, sitemap and 404.');
}finally{await server.close();}
