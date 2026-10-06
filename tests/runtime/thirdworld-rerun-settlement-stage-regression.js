const { chromium } = require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.THIRD_WORLD_PROGRESS_VERSION===7&&window.THIRD_WORLD_REINCARNATION_STAGE_CONTINUATION_VERSION===2&&window.THIRD_WORLD_REINCARNATION_PROGRESS_EVENT_CONTINUATION_VERSION===1&&typeof window.createThirdWorldCombatSettlementBasis==='function'&&typeof window.settleThirdWorldCombatResult==='function'&&typeof window.createThirdWorldBossCombatSnapshot==='function'&&typeof window.thirdWorldBossAbilities==='function');

 const result=await page.evaluate(()=>{
  const clone=value=>JSON.parse(JSON.stringify(value));
  const originalState=state;
  const originals={
   transaction:window.runSettlementTransaction,
   gainExp:window.gainEffectiveExpForState,
   drops:window.makeThirdWorldBossEquipmentDrops,
   addItem:window.addItem,
   settleSale:window.settleEquipmentSale,
   grantTitles:window.grantPlayerTitlesForThirdWorldTier
  };

  function makeState(count){
   const s=typeof window.newState==='function'?window.newState():{};
   s.saveVersion=17;
   s.level=1000;
   s.exp=0;
   s.hp=Math.max(1,Number(s.hp)||1);
   s.secondWorld=s.secondWorld&&typeof s.secondWorld==='object'?s.secondWorld:{};
   s.secondWorld.entered=true;
   s.secondWorld.civilizationLevel=10;
   s.thirdWorld=window.createBlankThirdWorldState();
   s.thirdWorld.entered=true;
   s.thirdWorld.entryVersion=2;
   s.thirdWorld.story.unlockedStage=2;
   const max=Number(window.THIRD_WORLD_BOSS_MAX_HP);
   const start=Math.floor(max*.71);
   s.thirdWorld.bosses=s.thirdWorld.bosses.map(()=>({currentHp:start}));
   s.storyProgress={completedStories:[],pendingStory:null};
   s.titles={version:1,unlocked:[],equipped:null,pendingNotice:null};
   if(typeof window.createBlankReincarnationState==='function')s.reincarnation=window.createBlankReincarnationState();
   else s.reincarnation={count:0,breakthrough:{permanent:0,milestoneLifeId:0,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:0,failures:{}}}};
   s.reincarnation.count=count;
   if(s.reincarnation.breakthrough)s.reincarnation.breakthrough.milestoneLifeId=count;
   if(s.reincarnation.alternateUniverse?.lifeFailures)s.reincarnation.alternateUniverse.lifeFailures.lifeId=count;
   return s;
  }

  function basisFor(s){
   const max=Number(window.THIRD_WORLD_BOSS_MAX_HP);
   const from=Math.floor(max*.71),to=Math.floor(max*.69);
   const boss=window.thirdWorldBoss(0);
   s.thirdWorld.bosses[0].currentHp=from;
   return window.createThirdWorldCombatSettlementBasis({
    bossIndex:0,bossId:boss.id,formalStartHp:from,combatEndHp:to,bossMaxHp:max,
    bossStageAtStart:window.thirdWorldBossStage(from,max),
    playerStartHp:100000,playerEndHp:0,playerDied:true,bossDefeated:false,
    turns:1,eventCount:1,terminationReason:'player-defeated',
    combatCompleted:true,challengeAllowedAtStart:true,formalRun:true
   });
  }

  function runCase(count){
   state=makeState(count);
   const before=clone(state);
   const basis=basisFor(state);
   const preAbilities=window.thirdWorldBossAbilities(0,basis.formalStartHp);
   const settlement=window.settleThirdWorldCombatResult({settlementBasis:basis});
   const postSnapshot=window.createThirdWorldBossCombatSnapshot(0,{state});
   return {
    count,
    before,
    basis:{formalStartHp:basis.formalStartHp,combatEndHp:basis.combatEndHp,bossStageAtStart:basis.bossStageAtStart},
    preComposure:preAbilities?.composure?.active===true,
    settlement:{
     ok:settlement?.ok===true,
     stageChanged:settlement?.stageTransition?.changed===true,
     from:settlement?.stageTransition?.from,
     to:settlement?.stageTransition?.to,
     crossed:Array.isArray(settlement?.stageTransition?.crossedStages)?Array.from(settlement.stageTransition.crossedStages):[],
     newAbilityIds:Array.isArray(settlement?.stageTransition?.newAbilityIds)?Array.from(settlement.stageTransition.newAbilityIds):[],
     stageBypassed:settlement?.stageTransitionBypassed===true,
     terminalReason:String(settlement?.continuation?.terminalReason||''),
     continuationAllowed:settlement?.continuation?.allowed===true,
     requiresEventHandling:settlement?.continuation?.requiresEventHandling===true,
     eventTypes:Array.isArray(settlement?.eventSequence)?settlement.eventSequence.map(row=>row?.type):[]
    },
    post:{
     storedHp:state.thirdWorld.bosses[0].currentHp,
     stage:postSnapshot?.stage,
     composure:postSnapshot?.abilities?.composure?.active===true,
     snapshotStartHp:postSnapshot?.formalStartHp
    }
   };
  }

  try{
   window.runSettlementTransaction=({mutate})=>{const value=mutate(state);return {ok:value?.ok===true,value};};
   window.gainEffectiveExpForState=()=>0;
   window.makeThirdWorldBossEquipmentDrops=()=>[{item:{world:3,level:1000,q:4,type:'weapon',hp:0,atk:1,def:0,crit:0,dodge:0},vip16Extra:false,baseQuality:4,qualityResult:4,forcedType:'weapon'}];
   window.addItem=()=>({sold:0,kept:true,sale:{quote:{amount:0}}});
   window.settleEquipmentSale=()=>({ok:true});
   window.grantPlayerTitlesForThirdWorldTier=()=>({changed:false,unlockedTitles:[],noticeTitle:null});

   const first=runCase(0);
   const rerun=runCase(1);
   return {first,rerun,versions:{progress:window.THIRD_WORLD_PROGRESS_VERSION,stageContinuation:window.THIRD_WORLD_REINCARNATION_STAGE_CONTINUATION_VERSION,progressContinuation:window.THIRD_WORLD_REINCARNATION_PROGRESS_EVENT_CONTINUATION_VERSION}};
  }finally{
   state=originalState;
   window.runSettlementTransaction=originals.transaction;
   window.gainEffectiveExpForState=originals.gainExp;
   window.makeThirdWorldBossEquipmentDrops=originals.drops;
   window.addItem=originals.addItem;
   window.settleEquipmentSale=originals.settleSale;
   window.grantPlayerTitlesForThirdWorldTier=originals.grantTitles;
  }
 });

 const fail=(code,detail)=>{throw new Error(`${code}: ${JSON.stringify(detail)}`);};
 if(pageErrors.length)fail('PAGE_ERRORS',pageErrors);
 if(result.versions.progress!==7||result.versions.stageContinuation!==2||result.versions.progressContinuation!==1)fail('VERSION_DRIFT',result.versions);

 const first=result.first,rerun=result.rerun;
 if(first.settlement.ok!==true||first.settlement.stageChanged!==true||first.settlement.from!==2||first.settlement.to!==3||JSON.stringify(first.settlement.crossed)!==JSON.stringify([3])||!first.settlement.newAbilityIds.includes('composure'))fail('FIRST_STAGE_TRANSITION',first);
 if(first.preComposure!==false||first.settlement.stageBypassed!==false||first.settlement.terminalReason!=='stage-crossed'||first.settlement.continuationAllowed!==false||first.settlement.eventTypes.includes('stage-crossed')!==true)fail('FIRST_RUN_MUST_STOP',first);
 if(first.post.storedHp!==first.basis.combatEndHp||first.post.stage!==3||first.post.composure!==true||first.post.snapshotStartHp!==first.basis.combatEndHp)fail('FIRST_NEXT_SNAPSHOT_STAGE',first.post);

 if(rerun.settlement.ok!==true||rerun.settlement.stageChanged!==true||rerun.settlement.from!==2||rerun.settlement.to!==3||JSON.stringify(rerun.settlement.crossed)!==JSON.stringify([3])||!rerun.settlement.newAbilityIds.includes('composure'))fail('RERUN_STAGE_TRANSITION',rerun);
 if(rerun.preComposure!==false||rerun.settlement.stageBypassed!==true||rerun.settlement.terminalReason!==''||rerun.settlement.continuationAllowed!==true||rerun.settlement.requiresEventHandling!==false||rerun.settlement.eventTypes.includes('stage-crossed')!==false)fail('RERUN_MUST_CONTINUE',rerun);
 if(rerun.post.storedHp!==rerun.basis.combatEndHp||rerun.post.stage!==3||rerun.post.composure!==true||rerun.post.snapshotStartHp!==rerun.basis.combatEndHp)fail('RERUN_NEXT_SNAPSHOT_STAGE',rerun.post);

 console.log('Third-world rerun settlement stage regression passed:',JSON.stringify({first:first.settlement,rerun:rerun.settlement,post:rerun.post}));
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
