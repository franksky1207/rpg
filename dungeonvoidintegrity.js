(function(){
 const VERSION=6;
 window.VOID_MIRAGE_INTEGRITY_VERSION=VERSION;
 const src=fn=>{try{return typeof fn==="function"?Function.prototype.toString.call(fn):"";}catch(e){return "";}};

 function run(){
  const issues=[];
  const fail=code=>issues.push(code);
  const config=typeof window.getVoidMirageConfig==="function"?window.getVoidMirageConfig():null;

  if(!config)fail("config-api");
  else{
   if(config.name!=="虛空幻境")fail("config-name");
   if(Number(config.unlockLevel)!==25)fail("unlock-level");
   if(Number(config.startOffset)!==100)fail("start-offset");
   if(Number(config.dailyRewardPerFloor)!==2)fail("daily-reward-rate");
  }

  if(Number(window.VOID_MIRAGE_AUTO_OWNER_VERSION)!==1)fail("auto-owner-version");
  if(Number(window.VOID_MIRAGE_SNAPSHOT_ISOLATION_VERSION)!==1)fail("snapshot-isolation-version");
  if(Number(window.VOID_MIRAGE_RUN_LOCAL_NAME_VERSION)!==1)fail("run-local-name-version");
  if(Number(window.VOID_MIRAGE_CIVILIZATION_DAMAGE_VERSION)!==3)fail("civilization-damage-version");
  if(Number(window.VOID_MIRAGE_WORLD_PHASE_VERSION)!==1)fail("world-phase-version");
  if(Number(window.VOID_MIRAGE_UI_AUTO_ADAPTER_VERSION)!==1)fail("ui-auto-adapter-version");
  if(Number(window.VOID_MIRAGE_UI_STYLE_VERSION)!==1)fail("ui-style-version");
  if(Number(window.VOID_MINIMAL_MODE_HOOK_VERSION)!==1)fail("minimal-mode-hook-version");
  if(Number(window.VOID_MIRAGE_W3_INTEGRATION_VERSION)!==1)fail("w3-integration-version");
  if(Number(window.VOID_MIRAGE_W3_TITLE_PRESENTATION_VERSION)!==1)fail("w3-title-presentation-version");
  const w3Policy=window.VOID_MIRAGE_W3_RESOURCE_POLICY;
  if(w3Policy?.reward!=="vip"||w3Policy?.sharedProgress!=="void-highest-floor"||w3Policy?.exp!==false||w3Policy?.dimensionalStrings!==false||w3Policy?.thirdWorldBossHp!==false||w3Policy?.thirdWorldCore!==false)fail("w3-resource-policy");
  if(Number(window.VOID_BACKGROUND_PRESENTATION_VERSION)!==1)fail("background-presentation-version");
  if(Number(window.VOID_BACKGROUND_UI_YIELD_VERSION)!==1)fail("background-ui-yield-version");
  if(Number(window.VOID_BACKGROUND_GM_GATE_VERSION)!==1)fail("background-gm-gate-version");
  if(Number(window.VOID_OUTER_PACING_VERSION)!==1)fail("outer-pacing-version");
  if(Number(window.COMBAT_OUTER_PACING_VERSION)!==2||typeof window.combatOuterGapMs!=="function"||Number(window.combatOuterGapMs("void","floor"))!==140)fail("outer-pacing-owner");
  if(Number(window.GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION)!==1)fail("gm-background-all-combat-gate-version");
  if(Number(window.BACKGROUND_PROGRESS_UI_YIELD_VERSION)!==3||typeof window.backgroundProgressUiYield!=="function")fail("background-ui-yield-api");
  if(Number(window.VOID_MIRAGE_FAST_CATCH_UP_POLICY_VERSION)!==1||Number(window.VOID_FAST_CATCH_UP_UI_VERSION)!==1||Number(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_VERSION)!==1)fail("fast-catch-up-policy-version");
  if(Number(window.STRUCTURED_COMBAT_HEADLESS_DURATION_VERSION)!==1||typeof window.structuredCombatPresentationDurationMs!=="function"||typeof window.backgroundProgressConsumeCatchUpCredit!=="function")fail("fast-catch-up-timing-owner");

  const requiredApis=[
   "canEnterVoidMirage","getVoidMirageStartFloor","voidMirageStartFloorFromHistory",
   "isVoidMirageBossFloor","rollVoidMirageTraits","beginVoidMirageRun",
   "requestVoidMirageExit","fightNextVoidMirageFloor","runVoidMirageAuto",
   "getVoidMirageRunSnapshot","openVoidMirageMinimalMode","voidMirageCombatWorld","voidMirageIdentityHtml","playerTitleHtml"
  ];
  requiredApis.forEach(name=>{if(typeof window[name]!=="function")fail(`missing-api:${name}`);});

  if(typeof window.voidMirageCombatWorld==="function"){
   const probes=[[{secondWorld:{entered:false},thirdWorld:{entered:false}},1],[{secondWorld:{entered:true},thirdWorld:{entered:false}},2],[{secondWorld:{entered:true},thirdWorld:{entered:true}},3]];
   probes.forEach(([target,expected])=>{if(Number(window.voidMirageCombatWorld(target))!==expected)fail(`world-phase:${expected}`);});
  }

  if(typeof window.playerTitleHtml==="function"&&typeof window.voidMirageIdentityHtml==="function"){
   [["higher-dimensional-title-01",1],["higher-dimensional-title-06",6],["higher-dimensional-title-10",10]].forEach(([titleId,tier])=>{
    const title=String(window.playerTitleHtml(titleId));
    if(!title.includes("player-title--higher-dimensional")||!title.includes(`player-title--higher-dimensional-${tier}`))fail(`w3-title-renderer:${tier}`);
   });
   const wiring=src(window.voidMirageIdentityHtml);
   if(!/playerIdentityNameHtml/.test(wiring)||!/compact\s*:\s*true/.test(wiring))fail("w3-title-identity-wiring");
  }

  if(typeof window.canEnterVoidMirage==="function"){
   const expected=Number(window.state?.level||0)>=25;
   if(window.canEnterVoidMirage()!==expected)fail("unlock-gate-mismatch");
  }

  if(typeof window.voidMirageStartFloorFromHistory==="function"){
   const cases=[[0,1],[50,1],[100,1],[101,1],[150,50],[1000,900]];
   for(const [highest,expected] of cases){
    if(window.voidMirageStartFloorFromHistory(highest)!==expected){fail(`start-floor:${highest}`);break;}
   }
  }

  if(typeof window.isVoidMirageBossFloor==="function"){
   if(window.isVoidMirageBossFloor(9)!==false)fail("boss-floor-9");
   if(window.isVoidMirageBossFloor(10)!==true)fail("boss-floor-10");
   if(window.isVoidMirageBossFloor(20)!==true)fail("boss-floor-20");
   if(window.isVoidMirageBossFloor(21)!==false)fail("boss-floor-21");
  }

  if(typeof window.rollVoidMirageTraits==="function"){
   const regular=window.rollVoidMirageTraits(11);
   const boss=window.rollVoidMirageTraits(20);
   if(!Array.isArray(regular)||regular.length!==1)fail("regular-trait-count");
   if(!Array.isArray(boss)||boss.length!==2)fail("boss-trait-count");
   if(Array.isArray(boss)&&new Set(boss).size!==boss.length)fail("boss-trait-duplicate");
  }

  const fightSrc=src(window.fightNextVoidMirageFloor);
  if(!/voidMirageFightCore\s*\(\s*enemy\s*,\s*options\s*\)/.test(fightSrc)||!/options\.save!==false/.test(fightSrc))fail("fast-catch-up-floor-options");
  const defeatPos=fightSrc.indexOf("if(!result.win)");
  const recordPos=fightSrc.indexOf("recordClear(floor)");
  const advancePos=fightSrc.indexOf("currentFloor=clear.nextFloor");
  const healPos=fightSrc.indexOf("runFullHeal()");
  if(defeatPos<0||recordPos<0||recordPos<defeatPos)fail("record-clear-before-defeat-guard");
  if(recordPos<0||advancePos<recordPos)fail("floor-advance-order");
  if(healPos<0||healPos<advancePos)fail("post-clear-full-heal");

  const exitSrc=src(window.requestVoidMirageExit);
  if(!/exitRequested\s*=\s*true/.test(exitSrc))fail("exit-request-flag");
  if(!/phase\s*!==\s*["']fighting["']/.test(exitSrc))fail("exit-between-floor-finish");

  const uiStartSrc=src(window.startVoidMirageChallengeUI);
  if(!/gmBackgroundBattleEnabled/.test(uiStartSrc)||!/allowBackground/.test(uiStartSrc))fail("background-gm-gate-wiring");
  if(!/backgroundProgressStart\s*\(\s*["']void["']\s*\)/.test(uiStartSrc))fail("background-start-wiring");
  const claimSrc=src(window.claimVoidMirageRewardUI);
  if(!/claimVoidMirageDailyReward/.test(claimSrc)||!/VIP/.test(claimSrc)||/dimensionalStrings|thirdWorld/.test(claimSrc))fail("w3-vip-only-claim-wiring");
  const uiAutoSrc=src(typeof runVoidMirageUiAuto==="function"?runVoidMirageUiAuto:null);
  if(uiAutoSrc&&!/backgroundProgressUiYield\s*\(\s*["']void["']\s*\)/.test(uiAutoSrc))fail("background-ui-yield-wiring");

  const autoSrc=src(window.runVoidMirageAuto);
  if(!/catchUpPreviewPolicy/.test(autoSrc)||!/backgroundProgressCatchUpStep/.test(autoSrc)||!/shouldCheckpoint/.test(autoSrc)||!/shouldPresentBattle/.test(autoSrc)||!/preparePresentation:fast\?previewPolicy\?\.shouldPresentBattle/.test(autoSrc))fail("fast-catch-up-auto-wiring");
  if(!/while\s*\(voidMirageRun\?\.active\)/.test(autoSrc))fail("auto-loop-owner");
  if(!/fightNextVoidMirageFloor/.test(autoSrc))fail("auto-owner-floor-call");
  if(!/onFloorComplete/.test(autoSrc)||!/onEnd/.test(autoSrc))fail("auto-callback-contract");

  const snapshotSrc=src(window.getVoidMirageRunSnapshot);
  if(!/cloneVoidSnapshotValue/.test(snapshotSrc))fail("snapshot-nested-clone");
  const beginSrc=src(window.beginVoidMirageRun);
  if(!/previousRegularName\s*:\s*["']["']/.test(beginSrc))fail("run-local-name-reset");

  const snapshot=typeof window.getVoidMirageRunSnapshot==="function"?window.getVoidMirageRunSnapshot():null;
  if(snapshot&&typeof snapshot==="object"){
   const keys=["active","phase","startFloor","currentFloor","lastClearedFloor","cleared","historicalHighest"];
   keys.forEach(key=>{if(!(key in snapshot))fail(`snapshot-field:${key}`);});
  }

  const report={version:VERSION,ok:issues.length===0,issues,autoOwnerVersion:Number(window.VOID_MIRAGE_AUTO_OWNER_VERSION)||0,snapshotIsolationVersion:Number(window.VOID_MIRAGE_SNAPSHOT_ISOLATION_VERSION)||0,runLocalNameVersion:Number(window.VOID_MIRAGE_RUN_LOCAL_NAME_VERSION)||0,worldPhaseVersion:Number(window.VOID_MIRAGE_WORLD_PHASE_VERSION)||0,w3IntegrationVersion:Number(window.VOID_MIRAGE_W3_INTEGRATION_VERSION)||0,w3TitlePresentationVersion:Number(window.VOID_MIRAGE_W3_TITLE_PRESENTATION_VERSION)||0,uiAdapterVersion:Number(window.VOID_MIRAGE_UI_AUTO_ADAPTER_VERSION)||0,fastCatchUpVersion:Number(window.VOID_MIRAGE_FAST_CATCH_UP_POLICY_VERSION)||0};
  window.VOID_MIRAGE_INTEGRITY_REPORT=report;
  if(!report.ok)console.error("Void Mirage integrity check failed",report);
  return report;
 }

 window.runVoidMirageIntegrity=run;
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(run,0),{once:true});else setTimeout(run,0);
})();