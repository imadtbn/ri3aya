/** Real Service Worker acceptance under the GitHub Pages /ri3aya/ prefix. */
import { createRequire } from 'node:module';
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import assert from 'node:assert/strict'; import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url), {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'); let release=1, networkAvailable=true;
const server=http.createServer((req,res)=>{
 if(!networkAvailable){req.socket.destroy();return;}
 const pathname=new URL(req.url,'http://local').pathname;
 if(pathname==='/ri3aya/bootstrap'){res.setHeader('Content-Type','text/html');res.end('<html><body>bootstrap</body></html>');return;}
 if(!pathname.startsWith('/ri3aya/')){res.writeHead(404);res.end();return;}
 const rel=decodeURIComponent(pathname.slice('/ri3aya/'.length))||'index.html',file=path.resolve(root,rel);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('missing');return;}
 res.setHeader('Content-Type',({'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json','.csv':'text/csv','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
 let data=fs.readFileSync(file);
 if(release===2&&rel==='pwa/config.js')data=Buffer.from(data.toString().replace(/"revision":"([^"]+)"/,'"revision":"$1-test2"'));
 if(release===2&&rel==='service-worker.js')data=Buffer.from(data.toString()+'\n// Test release 2\n');
 if(release===2&&rel==='index.html')data=Buffer.from(data.toString().replace('<body','<body data-test-release="2"'));
 res.end(data);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try {
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--single-process']}:{})});
 const context=await browser.newContext({serviceWorkers:'allow'}),page=await context.newPage(),base=`http://127.0.0.1:${server.address().port}/ri3aya/`;
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'bootstrap');await page.evaluate(async()=>{await caches.open('another-project-cache');await caches.open('ri3aya-v12-old');localStorage.setItem('foodRecords',JSON.stringify([{food:'تفاح',date:'2026-10-11',reaction:'like'}]));});
 await page.goto(base+'index.html');await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller),{timeout:30000});
 const info=await page.evaluate(async()=>({scope:(await navigator.serviceWorker.getRegistration()).scope,keys:await caches.keys()}));
 assert.equal(info.scope,base);assert.ok(info.keys.includes('another-project-cache'));assert.ok(!info.keys.includes('ri3aya-v12-old'));
 const snapshot=await page.evaluate(async()=>{const name=(await caches.keys()).find(k=>k.startsWith('ri3aya-pwa-'));return (await(await caches.open(name)).keys()).map(r=>r.url);});
 assert.ok(snapshot.length>100);assert.ok(snapshot.every(u=>u.startsWith(base)&&!u.includes('?')));
 await page.locator('#pwa-install').click();assert.equal(await page.locator('#pwa-help').isVisible(),true);await page.locator('#pwa-help-close').click();
 // Test both accepted and dismissed deferred install prompts without pretending to install a native app.
 for(const outcome of ['dismissed','accepted']){
  await page.evaluate(outcome=>{const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{window.promptCalls=(window.promptCalls||0)+1;};event.userChoice=Promise.resolve({outcome});window.dispatchEvent(event);},outcome);
  await page.locator('#pwa-install').click();await page.waitForFunction(()=>window.promptCalls>0);
  assert.ok((await page.locator('#pwa-status').textContent()).includes(outcome==='accepted'?'قبول':'لاحقًا'));
 }
 networkAvailable=false; await context.setOffline(true);
 const disconnected=await page.evaluate(async()=>{try{await fetch('network-probe.json',{cache:'no-store'});return false;}catch(_){return true;}});assert.equal(disconnected,true,'Uncached requests must fail when the server is disconnected');
 for(const file of ['pages/articles/safe-sleep.html','pages/search.html?q=نوم&age=0&topic=sleep','pages/growth.html','pages/nutrition.html','pages/tools/routine.html']){
  await page.goto(base+file);assert.ok((await page.locator('h1').textContent()).length>0);
  if(file.includes('search.html')){await page.locator('.search-result-card').first().waitFor();assert.ok((await page.locator('#discovery-results').textContent()).includes('النوم'));
  }else if(file==='pages/growth.html'){
   await page.locator('#track-age').fill('0');await page.locator('#track-date').fill('2026-10-11');await page.locator('#track-weight').fill('3.5');await page.locator('#add-measurement').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('ri3aya-growth-tracker')||'[]').length===1);
  }else if(file==='pages/nutrition.html')assert.ok((await page.locator('#foodHistory').textContent()).includes('تفاح'));
 }
 await page.goto(base+'pages/not-cached/deep.html');assert.equal(page.url(),base+'offline.html');assert.equal(await page.locator('a[href="pages/blog.html"]').evaluate(a=>a.href),base+'pages/blog.html');
 // A resource request is never replaced by an HTML offline page.
 const missing=await page.evaluate(async()=>{try{const r=await fetch('missing.json');return {type:r.headers.get('content-type'),body:await r.text()};}catch(_){return {failed:true};}});assert.ok(missing.failed||!missing.type?.includes('text/html'));
 networkAvailable=true; await context.setOffline(false);await page.goto(base+'pages/nutrition.html');await page.locator('#newFood').fill('مدخل غير محفوظ');
 release=2;await page.locator('#pwa-check').click();await page.locator('#pwa-update').waitFor({state:'visible',timeout:30000});
 assert.equal(await page.locator('#newFood').inputValue(),'مدخل غير محفوظ');
 page.once('dialog',d=>d.dismiss());await page.locator('#pwa-update').click();assert.equal(await page.locator('#newFood').inputValue(),'مدخل غير محفوظ');
 const reloaded=page.waitForEvent('load');page.once('dialog',d=>d.accept());await page.locator('#pwa-update').click();await reloaded;
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('foodRecords'))[0].food),'تفاح');
 const keys=await page.evaluate(()=>caches.keys());assert.ok(keys.includes('another-project-cache'));assert.equal(keys.filter(k=>k.startsWith('ri3aya-pwa-')).length,1);assert.ok(keys.some(k=>k.endsWith('-test2')));
 await page.goto(base+'index.html');assert.equal(await page.locator('body').getAttribute('data-test-release'),'2');
 networkAvailable=false; await context.setOffline(true);await page.goto(base+'index.html');assert.equal(await page.locator('body').getAttribute('data-test-release'),'2');
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${snapshot.length} cached files, scoped cache cleanup, complete offline guides/search/WHO computation/local histories, nested fallback, install help/prompt, update cancellation/activation and preserved records.`);
}finally{if(browser)await browser.close();server.close();}
