'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 const report={passed:false,realDevice:false,views:[]};
 try{for(const viewport of [{width:390,height:844},{width:1365,height:900},{width:844,height:390}]){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/');await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready');await finishIntro(page);
  await page.addScriptTag({url:new URL('gmdata.js',page.url()).href});
  const result=await page.evaluate(async()=>{
   state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};view='storyrecord';setFrontlineRecordTab('codex');
   const check=(condition,message)=>{if(!condition)throw Error(message);};
   const progress=monsterCodexDisplayProgress();check(progress.total===905&&progress.identities===1705&&progress.encountered===0,'905 display / 1705 identities');
   const opts=[...document.querySelectorAll('select option')].map(o=>o.textContent);check(opts.join('|')==='主線|特殊遭遇|副本|文明災厄|異宇宙','five category order');
   check(!document.querySelector('canvas'),'locked list creates no images');
   recordMonsterCodexEncounter({mode:'alternate',owner:'alternateuniversecombat.js',world:3,location:'5'},{name:alternateUniverseDepthInfo(5).displayName,kind:'alternate-universe-boss'});
   check(monsterCodexDisplayProgress().encountered===1,'any domain unlocks single universe');
   selectMonsterCodexCategory('異宇宙');check(document.querySelectorAll('[data-codex-group]').length===10,'ten universe groups');
   check(document.querySelector('[data-codex-group="alternate-0"]').textContent.includes(alternateUniverseDepthInfo(1).universeName),'official universe names');
   document.querySelector('[data-codex-group="alternate-0"]').open=true;toggleMonsterCodexGroup('alternate-0',true);
   check(openMonsterCodexDetail('alternate-depth-0005'),'fifth domain opens representative');check(document.querySelector('#monsterCodexImage').dataset.codexId==='alternate-depth-0001','one official representative');closeMonsterCodexDetail();check(document.querySelector('[data-codex-group="alternate-0"]').open,'restore expanded group');
   selectMonsterCodexCategory('主線');check(monsterCodexPageHtml().includes(WORLD_REGIONS[0].name)&&monsterCodexPageHtml().includes(MAPS[0].name)&&monsterCodexPageHtml().includes(SECOND_WORLD_REGIONS[0].name),'formal region and map names');
   const originalSave=save,originalConfirm=window.confirm,originalAlert=window.alert;let calls=0;window.alert=()=>{};window.confirm=()=>true;save=()=>{calls++;return true;};
   state.gm=false;const denied=JSON.stringify(state);check(gmOpenFullMonsterCodex()===false&&JSON.stringify(state)===denied,'GM permission');
   state.gm=true;window.confirm=()=>false;const cancelled=JSON.stringify(state);check(gmOpenFullMonsterCodex()===false&&JSON.stringify(state)===cancelled,'explicit confirmation');
   window.confirm=()=>true;const before=structuredClone(state);check(gmOpenFullMonsterCodex()===true,'GM unlock succeeds');const expected=structuredClone(before);expected.monsterCodex=structuredClone(state.monsterCodex);check(JSON.stringify(state)===JSON.stringify(expected),'only codex changes');check(state.monsterCodex.encountered.length===1705&&monsterCodexDisplayProgress().encountered===905,'all official identities/display');
   const full=JSON.stringify(state);check(gmOpenFullMonsterCodex()===true&&JSON.stringify(state)===full,'GM idempotent');
   save=()=>false;check(gmOpenFullMonsterCodex()===false&&JSON.stringify(state)===full,'save failure rolls back');save=originalSave;window.confirm=originalConfirm;window.alert=originalAlert;
   check(save(false)!==false,'formal save');const persisted=JSON.parse(localStorage.getItem(SAVE_KEY));check(persisted.monsterCodex.encountered.length===1705,'formal persisted 1705');
   const target=JSON.parse(JSON.stringify(state)),reset=applyReincarnationResetState(target,{requireEligible:false,currentTime:Date.now()});check(reset.ok&&target.monsterCodex.encountered.length===1705,'permanent after reincarnation');
   // Shared images and real alpha containment for every prototype in each responsive frame.
   const {getSharedMonsterPool}=await import('./3d-test/monster-sprite-pool.mjs?v=20261024-repair2');const pool=getSharedMonsterPool();pool.clear();
   const {registry,mappings}=await import('./3d-test/monster-sprites.mjs?v=20261024-au-ten-stages1');const {drawCodexMonster}=await import('./monstercodeximage.mjs?v=20261024-repair2');
   const frame=document.createElement('div');frame.style='width:100%;max-width:512px;aspect-ratio:1;';const canvas=document.createElement('canvas');canvas.width=canvas.height=512;canvas.style='width:100%;height:100%;display:block';frame.append(canvas,document.createElement('span'));document.body.replaceChildren(frame);
   let maxWidth=0,maxHeight=0,processed=0;
   for(const asset of registry.assets){const row=Object.values(mappings).find(r=>r.assetId===asset.assetId);await drawCodexMonster(canvas,row);const data=canvas.getContext('2d').getImageData(0,0,512,512).data;let l=512,t=512,r=0,b=0;for(let i=3;i<data.length;i+=4)if(data[i]>0){const x=(i-3)/4%512,y=Math.floor((i-3)/4/512);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const w=(r-l+1)/512,h=(b-t+1)/512;maxWidth=Math.max(maxWidth,w);maxHeight=Math.max(maxHeight,h);check(w<=.8&&h<=.8,'80% alpha containment '+asset.assetId+':'+w+','+h);check(Math.abs((l+r+1)/2-256)<=2&&Math.abs((t+b+1)/2-256)<=2,'alpha center '+asset.assetId+':'+[l,t,r,b]);processed++;}
   const row=mappings['alternate-depth-0001'];pool.clear();const first=performance.now();await drawCodexMonster(canvas,row);const cold=performance.now()-first,loads=pool.stats().loads;const second=performance.now();await drawCodexMonster(canvas,row);const warm=performance.now()-second;check(pool.stats().loads===loads,'codex reuses decoded battle prototype');check(canvas.dataset.palette===row.visual.palette,'same formal appearance');
   const lease=await pool.acquire(row.assetId);check(pool.stats().loads===loads,'battle acquire reuses codex decode');lease.release();dispatchEvent(new Event('civilization-resource-cache-cleared'));check(pool.stats().entries===0,'resource clear evicts visual cache');await drawCodexMonster(canvas,row);check(pool.stats().loads===loads+1,'re-download after clear');
   pool.clear();return {progress,processed,maxWidth,maxHeight,coldMs:cold,warmMs:warm,stats:pool.stats(),gmSaveCalls:calls};
  });
  assert.deepEqual(errors,[]);report.views.push({viewport,...result});await page.close();
 }
 report.passed=true;console.log(JSON.stringify(report,null,2));
 }finally{fs.writeFileSync('/tmp/batch20-repair-browser.json',JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
