'use strict';
const {chromium,webkit,devices}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk}=require('../equipment-formal/helpers.cjs');
(async()=>{
 const engine=process.env.PLAYER_COPY_BROWSER||'chromium',browser=await ({chromium,webkit}[engine]).launch({headless:true});
 const dir=process.env.PLAYER_COPY_EVIDENCE_DIR||'/tmp/rpg-player-copy';fs.mkdirSync(dir,{recursive:true});const results=[];
 try{
  const page=await browser.newPage(engine==='webkit'?devices['iPhone 13']:{});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'application/javascript',body:sdk.replace("{user:{id:'t1a-snapshot-test'}}",'null')}));
  // Test-only access to private presentation functions. Production exports and state are untouched.
  await page.route('**/offlineprogress.js*',async r=>{const response=await r.fetch();const body=await response.text();const marker=' settleOfflineOnLoad().finally(()=>installHeartbeat());';assert.equal(body.split(marker).length,2);await r.fulfill({response,body:body.replace(marker,' window.__copyUI={unavailable:showOfflineSampleUnavailable,result:showOfflineResult,build:buildPendingSettlement};\n'+marker)});});
  await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4176/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__copyUI&&window.BACKGROUND_PRELOAD_READY===true,null,{timeout:120000}).catch(async e=>{console.error(errors,await page.evaluate(()=>({copy:!!window.__copyUI,ready:window.BACKGROUND_PRELOAD_READY,text:document.getElementById('backgroundPreloadStatus')?.textContent})));throw e;});
  await page.waitForFunction(()=>{const e=document.getElementById('backgroundPreloadScreen');return !e||getComputedStyle(e).pointerEvents==='none'||!e.getBoundingClientRect().height;});
  await page.evaluate(()=>{document.getElementById('civilizationAuthGate')?.remove();document.getElementById('gameIntroModal')?.classList.remove('show');document.body.classList.remove('auth-gate-open','background-preloading');});
  for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
   await page.setViewportSize(viewport);
   for(const world of [1,2,3])for(const mode of ['unavailable','migration','normal']){
    const proof=await page.evaluate(({world,mode})=>{
     state=newState();if(world>=2)state.secondWorld.entered=true;if(world===3)state.thirdWorld.entered=true;
     const before=JSON.stringify(state);
     if(mode==='normal')__copyUI.result({world,elapsedUsed:60000,elapsedRaw:60000,battles:10,enemyLevel:world===1?1:500,enemyName:'測試敵人',totalXp:100,totalGold:100,totalDarkMatter:10,totalDarkEnergy:5,gear:{keptOrdinary:[],mythics:[],droppedCount:0,soldCount:0,discardedCount:0}});
     else __copyUI.unavailable({world,elapsedUsed:60000,sampleMigration:mode==='migration'?{action:'discarded',sourceSampleVersion:1}:null});
     return {unchanged:before===JSON.stringify(state),text:document.getElementById('offlineRewardPage').textContent};
    },{world,mode});
    assert.ok(proof.unchanged,'presentation must not mutate any save field');
    assert.doesNotMatch(proof.text,/catch-up|GM 測試|runtime|owner|pending|Offline battle sample|DOM|實戰樣本|實戰基準|模擬基準|正式前景/);
    if(mode==='normal'){assert.match(proof.text,/離線收益結算/);if(world===3){assert.match(proof.text,/不獲得 EXP、維度之弦/);assert.match(proof.text,/不推進核心/);}else assert.match(proof.text,/10%/);}
    else {assert.ok(proof.text.includes('本次沒有離線收益'),JSON.stringify(proof));assert.match(proof.text,/因此沒有取得收益/);assert.match(proof.text,world===1?/獲勝.*15 級/:world===2?/Boss 戰鬥並獲勝/:/成功結算.*離線裝備收益/);if(mode==='migration')assert.match(proof.text,/角色、裝備及遊戲進度不受影響/);}
    const modal=page.locator('#offlineRewardPage');await modal.waitFor({state:'visible'});assert.ok((await modal.innerText()).includes(mode==='normal'?'離線收益結算':'本次沒有離線收益'));const layout=await modal.evaluate(el=>{const card=el.querySelector('.offline-page-card');return {noOverflow:el.scrollWidth<=el.clientWidth&&card.scrollWidth<=card.clientWidth,within:card.getBoundingClientRect().right<=innerWidth};});assert.ok(Object.values(layout).every(Boolean),JSON.stringify(layout));
    await modal.screenshot({path:`${dir}/${engine}-${viewport.width}-${world}-${mode}.png`});results.push({viewport:viewport.width,world,mode,...proof,layout});
    await page.evaluate(()=>closeOfflineRewardModal());
   }
  }
  const unavailable=await page.evaluate(()=>{
   const rows=[];
   for(const world of [1,2,3]){
    state=newState();if(world>=2)state.secondWorld.entered=true;if(world===3)state.thirdWorld.entered=true;
    const t=Date.now();state.offline={battleSampleVersion:1,lastSettledAt:t-120000,maxObservedWallClock:t-120000,timeLockUntil:0,battleSamples:[{sampleVersion:1,world}],pendingSettlement:{sampleVersion:1,world,battles:100}};
    const protectedFields=()=>JSON.stringify([state.level,state.exp,state.gold,state.inventory,state.equipment,state.secondWorld,state.thirdWorld,state.reincarnation]);
    const before=protectedFields();normalizeOfflineSaveState(state,{currentTime:t});const migrated=JSON.parse(JSON.stringify(state.offline));const result=__copyUI.build();
    rows.push({world,result,migrated,noRewards:before===protectedFields(),reset:state.offline.lastSettledAt>=t});
   }
   return rows;
  });
  for(const row of unavailable){assert.ok(row.noRewards&&row.reset);assert.equal(row.result.unavailable,true);assert.equal(row.result.world,row.world);assert.equal(row.result.sampleMigration.action,'discarded');assert.equal(row.migrated.pendingSettlement,null);assert.deepEqual(row.migrated.battleSamples,[]);}
  const rewards=await page.evaluate(async()=>{
   const originalRandom=Math.random;Math.random=()=>.999999;const out=[];
   try{
    for(const world of [1,2,3]){
     state=newState();state.level=world===1?1:world===2?500:1000;if(world>=2)state.secondWorld.entered=true;if(world===3)state.thirdWorld.entered=true;
     const pending={battles:10,bossIndex:0,playerLevel:state.level,enemyLevel:state.level,overlevelContextRecorded:true};let result,expected;
     if(world===1){const enemy=monsterObj(0,0);pending.enemyLevel=enemy.level;const preview=firstWorldMainlineRewardPreview(enemy,{target:reincarnationYieldStateSnapshot(state),playerLevel:state.level,overlevelMultiplier:1,integer:false});expected={xp:Math.floor(preview.xp+1e-9),gold:Math.floor(preview.gold+1e-9)};result=await grantFirstWorldOfflineRewards(pending,enemy);}
     else if(world===2){const boss=secondWorldBoss(0);pending.enemyLevel=boss.level;const preview=secondWorldMainlineRewardPreview(0,{state,overlevelMultiplier:1,integer:false});expected={xp:Math.floor(preview.xp+1e-9),matter:Math.floor(preview.darkMatter+1e-9),energy:Math.floor(preview.darkEnergy+1e-9)};result=await grantSecondWorldOfflineRewards(pending,boss);}
     else {const before=JSON.stringify(state);result=await grantThirdWorldOfflineRewards(pending);expected={unchanged:before===JSON.stringify(state)};}
     out.push({world,result,expected});
    }
   }finally{Math.random=originalRandom;}
   return out;
  });
  for(const r of rewards){if(r.world===3){assert.equal(r.result.totalXp,0);assert.equal(r.result.totalDimensionalStrings,0);assert.equal(r.result.totalCoreProgress,0);assert.ok(r.expected.unchanged);}else {assert.equal(r.result.totalXp,r.expected.xp);if(r.world===1)assert.equal(r.result.directGold,r.expected.gold);else {assert.equal(r.result.directDarkMatter,r.expected.matter);assert.equal(r.result.directDarkEnergy,r.expected.energy);}}}
  const failures=await page.evaluate(async()=>{
   state=newState();state.secondWorld.entered=true;state.thirdWorld.entered=true;
   const before=JSON.stringify(state),start=startThirdWorldPlayerFlow,raw={ok:false,reason:'runtime owner pending DOM'},show=window.alert,warn=console.warn;let message='',diagnostic=null;
   window.startThirdWorldPlayerFlow=async()=>raw;window.alert=text=>{message=text;};console.warn=(label,value)=>{diagnostic=value;};
   try{await startThirdWorldRunFromPlayerUi(0);}finally{window.startThirdWorldPlayerFlow=start;window.alert=show;console.warn=warn;}
   const getter=getThirdWorldArenaRuntimeState,rt={status:'error',stopReason:'runtime owner pending DOM'};window.getThirdWorldArenaRuntimeState=()=>rt;
   let arena;try{arena=renderArenaDungeon();}finally{window.getThirdWorldArenaRuntimeState=getter;}
   return {message,originalDiagnostic:diagnostic===raw,arena,rawPreserved:rt.stopReason==='runtime owner pending DOM',unchanged:before===JSON.stringify(state)};
  });
  assert.ok(failures.originalDiagnostic&&failures.rawPreserved&&failures.unchanged);assert.match(failures.message,/重新整理/);assert.match(failures.arena,/本輪結算未完成/);assert.doesNotMatch(failures.message+failures.arena,/runtime|owner|pending|DOM/);
  const other=await page.evaluate(()=>{
   const before=JSON.stringify(state),blocked=reincarnationTransitionFailureMessage({reason:'active-runtime'}),loading=reincarnationTransitionFailureMessage({reason:'transaction-owner-missing'}),done=reincarnationTransitionFailureMessage({reason:'reincarnation-committed'});
   const stops=['stage-crossed','active-runtime','battle-error'].map(reason=>thirdWorldRunStopReasonPresentation(reason));
   const ui=window.thirdWorldAdventurePageHtml;window.thirdWorldAdventurePageHtml=undefined;const fallback=adventurePage();window.thirdWorldAdventurePageHtml=ui;
   return {blocked,loading,done,stops,fallback,unchanged:before===JSON.stringify(state)};
  });
  assert.ok(other.unchanged);assert.match(other.blocked,/結束戰鬥並關閉戰鬥畫面/);assert.match(other.loading,/尚未載入完成/);assert.match(other.done,/轉生已完成/);assert.match(other.fallback,/高維戰線載入未完成/);
  assert.doesNotMatch(other.blocked+other.loading+other.fallback+other.stops.map(s=>s.label).join(''),/runtime|owner|共用玩家 UI|介面 owner/);
  const guide=await page.evaluate(()=>{state=newState();state.secondWorld.entered=true;state.thirdWorld.entered=true;return JSON.stringify(gameGuideCategoriesForState(state));});
  assert.doesNotMatch(guide,/runtime|owner|GM 測試速度|正式前景|強化 Stage/);assert.match(guide,/本輪戰鬥/);assert.match(guide,/文明傳承可查看/);
  assert.deepEqual(errors,[]);fs.writeFileSync(`${dir}/${engine}-report.json`,JSON.stringify({passed:true,results,unavailable,rewards,failures,other,errors},null,2));console.log(`${engine}: ${results.length} rendered screens, all save fields unchanged, no jargon/overflow; high-dimensional guide passed.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
