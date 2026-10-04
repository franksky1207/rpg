const {chromium}=require('playwright');
const assert=require('assert');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e?.stack||e?.message||e)));
 const url=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.REINCARNATION_DUNGEON_ACCESS_VERSION===1&&window.WORLD_TRANSITION_SUBSYSTEM_SAFETY_VERSION===5&&typeof window.firstWorldRerunKeyBossCoverage==='function',{timeout:30000});
  const report=await page.evaluate(()=>{
   const originalState=state,originalView=view;
   const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(x=>[String(x),false]))},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const make=(count,phase=1,level=1)=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.level=level;s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();if(phase>=2)s.secondWorld.entered=true;if(phase>=3){s.secondWorld.entered=true;s.thirdWorld.entered=true;}return s;};
   const out={};
   try{
    state=make(0,1,1);out.first={permanent:reincarnationDungeonPermanentAccessUnlocked(state),void:canEnterVoidMirage(),mirror:mirrorDungeonStatus().unlocked,arenaCap:getArenaRankCapForWorld(1,state)};
    state=make(1,1,1);view='dungeon';render();
    const selectors=['.dungeon-mode-bounty','.dungeon-mode-arena','.dungeon-mode-tower','[data-mirror-dungeon-card]'];
    out.rerunLow={permanent:reincarnationDungeonPermanentAccessUnlocked(state),void:canEnterVoidMirage(),mirror:mirrorDungeonStatus().unlocked,cards:selectors.map(sel=>{const c=document.querySelector(sel),b=c?.querySelector('.dungeon-entry-btn');return {exists:!!c,locked:c?.classList.contains('locked')===true,hidden:c?.hidden===true,disabled:b?.disabled===true,unlock:c?.querySelector('.dungeon-unlock-label')?.textContent||''};})};
    const formalLevel=state.level;const v=beginVoidMirageRun();out.voidEntry={ok:v?.ok===true,levelStable:state.level===formalLevel};if(v?.ok)requestVoidMirageExit();
    const m=beginMirrorDungeonState(Date.now());out.mirrorEntry={ok:m?.ok===true,levelStable:state.level===formalLevel,status:mirrorDungeonStatus().status};if(m?.ok&&typeof resetMirrorDungeonToday==='function')resetMirrorDungeonToday(Date.now());
    enterBountyDungeon();out.bountyEntry={view:String(view),levelStable:state.level===formalLevel};view='dungeon';
    openArenaDungeon();out.arenaEntry={view:String(view),levelStable:state.level===formalLevel};

    state=make(1,1,1);out.w1Zero={coverage:firstWorldRerunKeyBossCoverage(state),cap:getArenaRankCapForWorld(1,state)};
    const region6=WORLD_REGIONS[5];state.bossKilled[region6.mapEnd]=true;out.w1Six={coverage:firstWorldRerunKeyBossCoverage(state),cap:getArenaRankCapForWorld(1,state),actualKills:state.bossKilled.filter(Boolean).length,lowerKeyFake:WORLD_REGIONS.slice(0,5).some(r=>state.bossKilled[r.mapEnd]===true)};
    const last=WORLD_REGIONS[9];state.bossKilled[last.mapEnd]=true;out.w1Ten={coverage:firstWorldRerunKeyBossCoverage(state),cap:getArenaRankCapForWorld(1,state),actualKills:state.bossKilled.filter(Boolean).length};

    state=make(0,3,2000);out.w3First={bountyWorld:worldPhaseBountyAvailable(state),bountyMode:dungeonModeAvailability('bounty',state)};
    state=make(1,3,1);out.w3Rerun={bountyWorld:worldPhaseBountyAvailable(state),bountyMode:dungeonModeAvailability('bounty',state)};
    out.versions={access:REINCARNATION_DUNGEON_ACCESS_VERSION,worldSafety:WORLD_TRANSITION_SUBSYSTEM_SAFETY_VERSION,bountyGate:BOUNTY_WORLD_PHASE_GATE_VERSION};
   }finally{state=originalState;view=originalView;if(typeof render==='function')render();}
   return out;
  });
  assert.deepEqual(pageErrors,[],'Browser pageerror:\n'+pageErrors.join('\n\n'));
  assert.equal(report.first.permanent,false);assert.equal(report.first.void,false);assert.equal(report.first.mirror,false);assert.equal(report.first.arenaCap,1);
  assert.equal(report.rerunLow.permanent,true);assert.equal(report.rerunLow.void,true);assert.equal(report.rerunLow.mirror,true);assert.equal(report.rerunLow.cards.length,4);report.rerunLow.cards.forEach(c=>{assert.equal(c.exists,true);assert.equal(c.locked,false);assert.equal(c.hidden,false);assert.match(c.unlock,/轉生後永久解鎖|高維紀元可挑戰/);});
  assert.deepEqual(report.voidEntry,{ok:true,levelStable:true});assert.equal(report.mirrorEntry.ok,true);assert.equal(report.mirrorEntry.levelStable,true);assert.equal(report.bountyEntry.view,'dungeon-bounty');assert.equal(report.bountyEntry.levelStable,true);assert.equal(report.arenaEntry.view,'dungeon-arena');assert.equal(report.arenaEntry.levelStable,true);
  assert.deepEqual(report.w1Zero,{coverage:0,cap:1});assert.equal(report.w1Six.coverage,6);assert.equal(report.w1Six.cap,6);assert.equal(report.w1Six.actualKills,1);assert.equal(report.w1Six.lowerKeyFake,false);assert.equal(report.w1Ten.coverage,10);assert.equal(report.w1Ten.cap,10);assert.equal(report.w1Ten.actualKills,2);
  assert.equal(report.w3First.bountyWorld,false);assert.equal(report.w3First.bountyMode.visible,false);assert.equal(report.w3Rerun.bountyWorld,true);assert.equal(report.w3Rerun.bountyMode.visible,true);assert.equal(report.w3Rerun.bountyMode.enabled,true);
  assert.deepEqual(report.versions,{access:1,worldSafety:5,bountyGate:2});
  console.log('Reincarnation Batch6-4 dungeon access integrity passed:',JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});