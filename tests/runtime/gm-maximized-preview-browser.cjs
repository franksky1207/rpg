'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {performance}=require('node:perf_hooks');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
const output=process.env.GM_PREVIEW_EVIDENCE||'/tmp/gm-preview-evidence';fs.mkdirSync(output,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}),reports=[];
const testStarted=performance.now();
try{for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1365,height:900}]){
 const viewportStarted=performance.now(),full=viewport.width===390,timings={loadingMs:0,pixelMs:0,releaseMs:0,modesMs:0,samplesMs:0,stabilityMs:0};
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
 const enter=async()=>{const started=performance.now();await frame.locator('[data-enter]').click();await frame.locator('.gm-suit-preview').waitFor({state:'visible'});await ui.evaluate(el=>new Promise((resolve,reject)=>{const end=performance.now()+10000;function check(){const d=el.__previewTestApi.diagnostics();if(d.playing)return resolve();if(performance.now()>end)return reject(Error('preview not ready '+el.innerText));requestAnimationFrame(check);}check();}));timings.loadingMs+=performance.now()-started;};
 const leave=async()=>{const started=performance.now();await frame.locator('[data-back]').click();const d=await diag();assert.equal(d.rafs,0);assert.equal(d.canvases,0);assert.equal(d.monster.canvases,0);assert.equal(d.playing,false);assert.equal(d.refs,0);assert.equal(d.monster.refs,0);assert.equal(await frame.locator('[data-enter]').isVisible(),true,'return restores selection');timings.releaseMs+=performance.now()-started;};
 const measure=async()=>{const started=performance.now();const result=await frame.locator('.gm-suit-preview').evaluate(el=>{
  const stage=el.getBoundingClientRect(),paint=[];
  for(const c of el.querySelectorAll('canvas')){
   if(getComputedStyle(c).visibility==='hidden')continue;
   const n=c.width,data=c.getContext('2d').getImageData(0,0,n,n).data;let l=n,t=n,r=-1,b=-1;
   for(let i=3;i<data.length;i+=4)if(data[i]>=12){let x=((i-3)/4)%n,y=Math.floor((i-3)/4/n);l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
   if(r<0)continue;const box=c.getBoundingClientRect(),s=box.width/n;
   paint.push({role:c.dataset.suit?'player':'monster',clip:c.dataset.clip,left:box.left-stage.left+l*s,right:box.left-stage.left+r*s,top:box.top-stage.top+t*s,bottom:box.top-stage.top+b*s,height:(b-t)*s});
  }
  return {width:stage.width,height:stage.height,paint};
 });timings.pixelMs+=performance.now()-started;return result;};
 const assertPaint=(m)=>{assert.ok(m.width>viewport.width-5);assert.ok(m.height>viewport.height*.55);assert.ok(m.paint.length);for(const a of m.paint){assert.ok(a.left>=-1&&a.right<=m.width+1&&a.top>=-1&&a.bottom<=m.height+1,'paint clipped '+JSON.stringify(m));}};

 const waitState=async(condition,arg)=>ui.evaluate((el,{condition,arg})=>new Promise((resolve,reject)=>{
  const checks={
   sequence:d=>d.playing&&d.sequence>=1,
   drawn:()=>[...el.querySelectorAll('canvas')].every((canvas,i)=>canvas.__gmAcceptanceDraws>arg.draws[i]),
   action:d=>d.playing&&(arg.role==='monster'?d.monster.animation:d.animation).state===arg.clip&&el.querySelector('canvas[data-suit]').dataset.clip===d.animation.state&&[...el.querySelectorAll('canvas')].every((canvas,i)=>canvas.__gmAcceptanceDraws>arg.draws[i]),
   auto:d=>d.playing&&d.animation.state==='attack'&&el.querySelector('canvas[data-suit]').dataset.clip==='attack',
   layout:d=>{const stage=el.querySelector('.gm-suit-preview');return Math.abs(d.layout.stage.width-stage.clientWidth)<1&&Math.abs(d.layout.stage.height-stage.clientHeight)<1&&innerWidth===arg.width&&innerHeight===arg.height;},
   disposed:d=>d.rafs===0&&d.canvases===0&&d.monster.canvases===0&&d.refs===0&&d.monster.refs===0
  };
  const checkState=checks[condition],end=performance.now()+15000;
  if(!checkState)return reject(Error('unknown GM condition '+condition));
  function check(){const d=el.__previewTestApi.diagnostics();if(checkState(d))return resolve(d);if(performance.now()>end)return reject(Error('GM condition timeout '+condition+' '+JSON.stringify(d)));requestAnimationFrame(check);}check();
 }),{condition,arg});
 const watchDraws=()=>ui.evaluate(el=>[...el.querySelectorAll('canvas')].map(canvas=>{
  if(canvas.__gmAcceptanceDraws===undefined){
   canvas.__gmAcceptanceDraws=0;const context=canvas.getContext('2d'),clear=context.clearRect;
   context.clearRect=function(...args){const result=clear.apply(this,args);canvas.__gmAcceptanceDraws++;return result;};
  }
  return canvas.__gmAcceptanceDraws;
 }));
 const nextDraw=async()=>{const draws=await watchDraws();await waitState('drawn',{draws});};
 const repeated=async()=>{await waitState('sequence');await nextDraw();};
 const action=async(role,clip)=>{
  await frame.locator('[data-content]').selectOption(role+':'+clip);
  // Capture after the synchronous stop/drawIdle; require a new requested draw.
  const draws=await watchDraws();await waitState('action',{role,clip,draws});
 };
 const controls=async()=>{
  const boxes=await ui.evaluate(el=>['[data-back]','[data-content]','[data-speed]','[data-play]'].map(s=>{const b=el.querySelector(s).getBoundingClientRect();return {s,x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height,w:innerWidth,h:innerHeight};}));
  for(const b of boxes)assert.ok(b.width>0&&b.height>0&&b.x>=0&&b.y>=0&&b.right<=b.w+1&&b.bottom<=b.h+1,'control outside viewport '+JSON.stringify(b));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.right<=b.x+1||b.right<=a.x+1||a.bottom<=b.y+1||b.bottom<=a.y+1,'overlapping controls '+a.s+' '+b.s);}
 };
 const visibleRoles=async(mode)=>{
  const m=await measure();assertPaint(m);
  assert.deepEqual(m.paint.map(p=>p.role).sort(),mode==='duel'?['monster','player']:[mode],'both actors must actually paint');
  if(mode==='duel'){const player=m.paint.find(p=>p.role==='player'),monster=m.paint.find(p=>p.role==='monster');assert.ok(player.left<monster.left,'player faces monster from left');}
 };
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
  return out.map(item=>{const row=mappings[item.id];return {...item,kind:row.kind,ratio:row.visual.visibleRatio,assetId:row.assetId};});
 });
 const representativeCases=[];
 const take=predicate=>{const row=cases.find(predicate);assert.ok(row,'missing cross-viewport representative '+predicate);if(!representativeCases.includes(row))representativeCases.push(row);};
 for(const kind of ['normal','elite','boss','special'])take(r=>r.kind===kind);
 // 1 and 1.5 are absent in the current registry (the original sampler skipped them).
 // Keep both existing explicit size extremes and all four kind representatives.
 for(const ratio of [1.75,2])take(r=>r.ratio===ratio);
 for(const assetId of ['ship-04','beast-03','core-03'])take(r=>r.assetId===assetId);
 // Exact duplicate identity/era/source rows carry no additional acceptance.
 const uniqueCases=[...new Map(cases.map(row=>[JSON.stringify([row.era,row.source,row.id]),row])).values()];
 const selectedCases=full?uniqueCases:representativeCases;
 console.log('GM coverage',viewport,{full,samples:selectedCases.length,originalSamples:cases.length});
 const modesStarted=performance.now();
 // Six actions loop, single action repeats, and live rate changes keep the same actor.
 for(const mode of ['player','monster','duel']){
  await frame.locator('[data-preview-mode]').selectOption(mode);await enter();
  await visibleRoles(mode);await controls();assert.equal(await frame.locator('progress').count(),0);assert.equal(await frame.locator('.gm-suit-actions button').count(),0);
  const role=mode==='monster'?'monster':'player',seen=[];
  for(const clip of ['idle','attack','hit','dodge','return','defeat']){
   await action(role,clip);const d=await diag();assert.equal(d.playing,true);
   if(full)for(const speed of ['2','1.5','1']){await frame.locator('[data-speed]').selectOption(speed);const changed=await diag();assert.equal(changed.speed,Number(speed));assert.equal(changed.playing,true);assert.equal(changed.loads,d.loads);assert.equal(changed.monster.loads,d.monster.loads);}
   assert.ok(Math.abs((d.layout.union.right-d.layout.union.left)-(d.layout.stage.width-20))<1||Math.abs((d.layout.union.bottom-d.layout.union.top)-(d.layout.stage.height-20))<1,'fit reaches the first safe dimension');assert.equal(d.monster.animation.timers,0);assertPaint(await measure());seen.push(clip);
  }
  if(full){
   await action(role,'attack');
   const generation=await ui.evaluate(e=>{e.querySelector('canvas').__stable=true;return e.__previewTestApi.diagnostics().loads;});
   for(const speed of ['2','1.5','1']){await frame.locator('[data-speed]').selectOption(speed);assert.equal((await diag()).playing,true);assert.equal((await diag()).loads,generation);}
   await repeated();assert.ok((await diag()).sequence>=1,'single action repeats');
   await action(role,'defeat');await repeated();assert.ok((await diag()).sequence>=1,'death resets and repeats');assertPaint(await measure());
   await frame.locator('[data-content]').selectOption(mode==='duel'?'auto':'all');
   const order=await ui.evaluate((el)=>new Promise((resolve,reject)=>{
    const order=[],end=performance.now()+20000;let prior=-1;
    const mode=el.querySelector('[data-preview-mode]').value;
    function check(){const d=el.__previewTestApi.diagnostics(),clip=mode==='monster'?d.monster.animation.state:d.animation.state;
     if(d.sequence!==prior){order.push(clip);prior=d.sequence;}
     if(d.sequence>=6)return resolve(order);
     if(performance.now()>end)return reject(Error('incomplete real-time action loop '+JSON.stringify(order)));
     requestAnimationFrame(check);
    }check();
   }));
   if(mode!=='duel')assert.deepEqual(order.slice(0,6),['idle','attack','hit','dodge','return','defeat']);
   if(mode!=='duel')for(const clip of seen)assert.ok(order.includes(clip),'all action loop missing '+clip);
  }
  await frame.locator('[data-play]').click();const stopped=await diag();await page.waitForTimeout(1300);assert.equal((await diag()).sequence,stopped.sequence);assert.equal((await diag()).playing,false);assertPaint(await measure());
  await page.screenshot({path:output+'/'+viewport.width+'-'+mode+'.png'});
  await frame.locator('[data-play]').click();await repeated();await leave();
 }
 timings.modesMs=performance.now()-modesStarted;
 const samples=[],samplesStarted=performance.now();
 for(const item of selectedCases){
  await frame.locator('[data-preview-mode]').selectOption('duel');await frame.locator('[data-era]').selectOption(item.era);await frame.locator('[data-source]').selectOption(item.source);
  if(item.source!=='alternate')await frame.locator('[data-identity]').selectOption(item.id);
  await enter();if(item.source!=='alternate')assert.ok((await frame.locator('[data-caption]').innerText()).includes(item.name));
  assert.doesNotMatch(await frame.locator('[data-caption]').innerText(),/\.webp|assets\/|monster-|boss-[a-z]-\d/);
  for(const clip of full?['idle','attack','hit','dodge','return','defeat']:['attack','dodge','defeat']){
   await action('monster',clip);
   // Measure actual painted pixels over the entire owner action, not just DOM boxes.
   const actionStart=await ui.evaluate(()=>performance.now());
   for(const offset of [0,175,350,525,700]){await ui.evaluate((el,target)=>new Promise(resolve=>{function check(){if(performance.now()>=target)return resolve();requestAnimationFrame(check);}check();}),actionStart+offset);
    // Death intentionally fades the monster to alpha=0 at its 700ms endpoint.
    // Still require a painted player and validate every remaining painted pixel.
    if(clip==='defeat'&&offset===700){const m=await measure();assertPaint(m);assert.ok(m.paint.some(p=>p.role==='player'),'player remains visible through monster death');}
    else await visibleRoles('duel');
   }
  }
  await frame.locator('[data-content]').selectOption('auto');await waitState('auto');assertPaint(await measure());
  samples.push({item,layout:(await diag()).layout,paint:await measure()});await leave();
 }
 timings.samplesMs=performance.now()-samplesStarted;
 // Alternate classification, final depth and mirror survive the redesign.
 await frame.locator('[data-source]').selectOption('alternate');assert.equal(await frame.locator('[data-culture] option').count(),20);assert.equal(await frame.locator('[data-stage] option').count(),5);
 await frame.locator('[data-culture]').selectOption({index:19});await frame.locator('[data-universe]').selectOption({index:9});await frame.locator('[data-stage]').selectOption({index:4});await enter();assertPaint(await measure());await page.screenshot({path:output+'/'+viewport.width+'-alternate-effects.png'});await leave();
 await frame.locator('[data-era]').selectOption('era-galaxy');await frame.locator('[data-source]').selectOption('mirror');await enter();assertPaint(await measure());await leave();
 const before=await diag();await enter();await leave();assert.equal((await diag()).loads,before.loads,'reentry reuses cached resources');assert.equal((await diag()).monster.loads,before.monster.loads);
 await enter();await page.setViewportSize({width:viewport.height,height:viewport.width});await waitState('layout',{width:viewport.height,height:viewport.width});const rotated=await measure();assert.ok(rotated.paint.length);for(const p of rotated.paint)assert.ok(p.left>=0&&p.right<=rotated.width+1&&p.top>=0&&p.bottom<=rotated.height+1);await page.setViewportSize(viewport);await waitState('layout',viewport);await controls();await visibleRoles('duel');
 // Sustain auto battle long enough to expose accumulating transforms/schedules.
 await frame.locator('[data-content]').selectOption('auto');const stabilityStarted=performance.now(),initial=await diag();await page.waitForTimeout(viewport.width===390?60000:3000);const final=await diag();timings.stabilityMs=performance.now()-stabilityStarted;assert.ok(final.sequence>initial.sequence);assert.equal(final.loads,initial.loads);assert.equal(final.refs,initial.refs);for(const key of ['loads','refs','bytes','entries','pending'])assert.equal(final.monster[key],initial.monster[key],'stable monster '+key);for(const key of ['bytes','entries','pending','rafs'])assert.equal(final[key],initial[key],'stable player/scheduler '+key);assertPaint(await measure());
 await ui.evaluate(el=>el.__previewTestApi.testMissing());assert.ok((await frame.locator('[data-status]').innerText()).includes('缺圖或驗證失敗'));await leave();await enter();
 await page.evaluate(()=>window.previewAuthorized=false);await frame.locator('[data-status]').filter({hasText:'需要 GM 授權'}).waitFor({state:'attached'});await waitState('disposed');assert.equal((await diag()).rafs,0);assert.equal((await diag()).canvases,0);await frame.locator('[data-back]').click();
 assert.deepEqual(errors,[]);timings.totalMs=performance.now()-viewportStarted;reports.push({viewport,samples,realIPhone:false,passed:true,coverage:full?'full':'display',timings});await page.close();console.log('PASS maximized GM',viewport,timings);
}fs.writeFileSync(output+'/report.json',JSON.stringify({passed:true,reports,totalMs:performance.now()-testStarted},null,2));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
