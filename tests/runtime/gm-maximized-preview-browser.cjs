'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
const output=process.env.GM_PREVIEW_EVIDENCE||'/tmp/gm-preview-evidence';fs.mkdirSync(output,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}),reports=[];
try{for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1365,height:900}]){
 const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 // Same-origin GM bridge fixture exercises real authorization messages and shipped assets.
 // No production state/storage owner is exposed to the viewer.
 await page.goto(base);await page.evaluate(()=>{
  document.body.innerHTML='<iframe title="GM" style="position:fixed;inset:0;width:100%;height:100%;border:0" src="/3d-test/index.html?embedded=1"></iframe>';
  window.previewAuthorized=true;
  window.addEventListener('message',e=>{if(e.source!==document.querySelector('iframe').contentWindow||e.origin!==location.origin)return;if(e.data.type==='civilization3d:sprite-auth')e.source.postMessage({type:e.data.type+'-response',requestId:e.data.requestId,authorized:window.previewAuthorized,playerName:'測試角色'},location.origin);});
 });
 const frame=page.frameLocator('iframe'),ui=frame.locator('.gm-suit');await frame.locator('[data-enter]:enabled').waitFor();
 const diag=()=>ui.evaluate(el=>el.__previewTestApi.diagnostics());
 const enter=async()=>{await frame.locator('[data-enter]').click();await frame.locator('.gm-suit-preview').waitFor({state:'visible'});await ui.evaluate(el=>new Promise((resolve,reject)=>{const end=performance.now()+10000;function check(){const d=el.__previewTestApi.diagnostics();if(d.playing)return resolve();if(performance.now()>end)return reject(Error('preview not ready '+el.innerText));requestAnimationFrame(check);}check();}));};
 const leave=async()=>{await frame.locator('[data-back]').click();const d=await diag();assert.equal(d.rafs,0);assert.equal(d.canvases,0);assert.equal(d.monster.canvases,0);assert.equal(d.playing,false);assert.equal(d.refs,0);};
 const measure=async()=>frame.locator('.gm-suit-preview').evaluate(el=>{
  const stage=el.getBoundingClientRect(),paint=[];
  for(const c of el.querySelectorAll('canvas')){
   if(getComputedStyle(c).visibility==='hidden')continue;
   const n=c.width,data=c.getContext('2d').getImageData(0,0,n,n).data;let l=n,t=n,r=-1,b=-1;
   for(let i=3;i<data.length;i+=4)if(data[i]>=12){let x=((i-3)/4)%n,y=Math.floor((i-3)/4/n);l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
   if(r<0)continue;const box=c.getBoundingClientRect(),s=box.width/n;
   paint.push({role:c.dataset.suit?'player':'monster',clip:c.dataset.clip,left:box.left-stage.left+l*s,right:box.left-stage.left+r*s,top:box.top-stage.top+t*s,bottom:box.top-stage.top+b*s,height:(b-t)*s});
  }
  return {width:stage.width,height:stage.height,paint};
 });
 const assertPaint=(m)=>{assert.ok(m.width>viewport.width-5);assert.ok(m.height>viewport.height*.55);assert.ok(m.paint.length);for(const a of m.paint){assert.ok(a.left>=-1&&a.right<=m.width+1&&a.top>=-1&&a.bottom<=m.height+1,'paint clipped '+JSON.stringify(m));}};
 assert.equal((await diag()).loads,0,'selection does not download actors');
 assert.deepEqual(await frame.locator('[data-speed] option').allTextContents(),['1×','1.5×','2×']);
 const cases=await ui.evaluate(async()=>{
  const {mappings}=await import('/3d-test/monster-sprites.mjs');const rows=Object.values(mappings),out=[];
  for(const world of ['galaxy','universe','higher'])for(const mode of ['main','calamity','bounty','arena','void','alternate']){
   const row=rows.find(r=>r.world===world&&(r.mode||'main')===mode);if(row)out.push({era:'era-'+world,source:mode,id:row.id,name:row.name});
  }
  for(const kind of ['normal','elite','boss','special']){const row=rows.find(r=>r.kind===kind&&r.mode!=='alternate');if(row)out.push({era:'era-'+(row.world==='both'?'galaxy':row.world),source:row.mode||(row.world==='both'?'special':'main'),id:row.id,name:row.name});}
  const voidRow=rows.find(r=>r.mode==='void');if(voidRow)out.push({era:'era-galaxy',source:'void',id:voidRow.id,name:voidRow.name});
  for(const ratio of [1,1.5,1.75,2]){const row=rows.find(r=>r.visual.visibleRatio===ratio&&r.mode!=='alternate'&&r.world!=='both');if(row)out.push({era:'era-'+row.world,source:row.mode||'main',id:row.id,name:row.name});}
  for(const assetId of ['ship-04','beast-03','core-03']){const row=rows.find(r=>r.assetId===assetId&&r.world!=='both'&&r.mode!=='alternate');if(row)out.push({era:'era-'+row.world,source:row.mode||'main',id:row.id,name:row.name});}
  return out;
 });
 // Six actions loop, single action repeats, and live rate changes keep the same actor.
 for(const mode of ['player','monster','duel']){
  await frame.locator('[data-preview-mode]').selectOption(mode);await enter();
  assertPaint(await measure());assert.equal(await frame.locator('progress').count(),0);assert.equal(await frame.locator('.gm-suit-actions button').count(),0);
  const role=mode==='monster'?'monster':'player',seen=[];
  for(const clip of ['idle','attack','hit','dodge','return','defeat']){
   await frame.locator('[data-content]').selectOption(role+':'+clip);await page.waitForTimeout(220);const d=await diag();assert.equal(d.playing,true);assert.ok(Math.abs((d.layout.union.right-d.layout.union.left)-(d.layout.stage.width-20))<1||Math.abs((d.layout.union.bottom-d.layout.union.top)-(d.layout.stage.height-20))<1,'fit reaches the first safe dimension');assert.equal(d.monster.animation.timers,0);assertPaint(await measure());seen.push(clip);
  }
  await frame.locator('[data-content]').selectOption(role+':attack');
  const generation=await ui.evaluate(e=>{e.querySelector('canvas').__stable=true;return e.__previewTestApi.diagnostics().loads;});
  for(const speed of ['2','1.5','1']){await frame.locator('[data-speed]').selectOption(speed);assert.equal((await diag()).playing,true);assert.equal((await diag()).loads,generation);}
  await page.waitForTimeout(1400);assert.ok((await diag()).sequence>=1,'single action repeats');
  await frame.locator('[data-content]').selectOption(role+':defeat');await page.waitForTimeout(1400);assert.ok((await diag()).sequence>=1,'death resets and repeats');assertPaint(await measure());
  await frame.locator('[data-content]').selectOption(mode==='duel'?'auto':'all');
  const observed=new Set(),order=[];let prior=-1;for(let i=0;i<56;i++){const d=await diag(),clip=mode==='monster'?d.monster.animation.state:d.animation.state;observed.add(clip);if(d.sequence!==prior){order.push(clip);prior=d.sequence;}await page.waitForTimeout(165);}
  if(mode!=='duel')assert.deepEqual(order.slice(0,6),['idle','attack','hit','dodge','return','defeat']);
  if(mode!=='duel')for(const clip of seen)assert.ok(observed.has(clip),'all action loop missing '+clip);
  await frame.locator('[data-play]').click();const stopped=await diag();await page.waitForTimeout(1300);assert.equal((await diag()).sequence,stopped.sequence);assert.equal((await diag()).playing,false);assertPaint(await measure());
  await page.screenshot({path:output+'/'+viewport.width+'-'+mode+'.png'});await leave();
 }
 const samples=[];
 for(const item of cases){
  await frame.locator('[data-preview-mode]').selectOption('duel');await frame.locator('[data-era]').selectOption(item.era);await frame.locator('[data-source]').selectOption(item.source);
  if(item.source!=='alternate')await frame.locator('[data-identity]').selectOption(item.id);
  await enter();if(item.source!=='alternate')assert.ok((await frame.locator('[data-caption]').innerText()).includes(item.name));
  assert.doesNotMatch(await frame.locator('[data-caption]').innerText(),/\.webp|assets\/|monster-|boss-[a-z]-\d/);
  for(const clip of ['idle','attack','hit','dodge','return','defeat']){
   await frame.locator('[data-content]').selectOption('monster:'+clip);
   // Measure actual painted pixels over the entire owner action, not just DOM boxes.
   for(let i=0;i<5;i++){await page.waitForTimeout(130);const m=await measure();if(m.paint.length)assertPaint(m);}
  }
  await frame.locator('[data-content]').selectOption('auto');await page.waitForTimeout(50);assertPaint(await measure());
  samples.push({item,layout:(await diag()).layout,paint:await measure()});await leave();
 }
 // Alternate classification, final depth and mirror survive the redesign.
 await frame.locator('[data-source]').selectOption('alternate');assert.equal(await frame.locator('[data-culture] option').count(),20);assert.equal(await frame.locator('[data-stage] option').count(),5);
 await frame.locator('[data-culture]').selectOption({index:19});await frame.locator('[data-universe]').selectOption({index:9});await frame.locator('[data-stage]').selectOption({index:4});await enter();assertPaint(await measure());await page.screenshot({path:output+'/'+viewport.width+'-alternate-effects.png'});await leave();
 await frame.locator('[data-era]').selectOption('era-galaxy');await frame.locator('[data-source]').selectOption('mirror');await enter();assertPaint(await measure());await leave();
 const before=await diag();await enter();await leave();assert.equal((await diag()).loads,before.loads,'reentry reuses cached resources');assert.equal((await diag()).monster.loads,before.monster.loads);
 await enter();await page.setViewportSize({width:viewport.height,height:viewport.width});await page.waitForTimeout(300);const rotated=await measure();assert.ok(rotated.paint.length);for(const p of rotated.paint)assert.ok(p.left>=0&&p.right<=rotated.width+1&&p.top>=0&&p.bottom<=rotated.height+1);await page.setViewportSize(viewport);await page.waitForTimeout(100);
 // Sustain auto battle long enough to expose accumulating transforms/schedules.
 await frame.locator('[data-content]').selectOption('auto');const initial=await diag();await page.waitForTimeout(viewport.width===390?60000:3000);const final=await diag();assert.ok(final.sequence>initial.sequence);assert.equal(final.loads,initial.loads);assert.equal(final.refs,initial.refs);assertPaint(await measure());
 await ui.evaluate(el=>el.__previewTestApi.testMissing());assert.ok((await frame.locator('[data-status]').innerText()).includes('缺圖或驗證失敗'));await leave();await enter();
 await page.evaluate(()=>window.previewAuthorized=false);await frame.locator('[data-status]').filter({hasText:'需要 GM 授權'}).waitFor({state:'attached'});await page.waitForTimeout(2300);assert.equal((await diag()).rafs,0);assert.equal((await diag()).canvases,0);await frame.locator('[data-back]').click();
 assert.deepEqual(errors,[]);reports.push({viewport,samples,realIPhone:false,passed:true});await page.close();console.log('PASS maximized GM',viewport);
}fs.writeFileSync(output+'/report.json',JSON.stringify({passed:true,reports},null,2));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
