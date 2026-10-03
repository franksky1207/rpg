const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.SAVE_SCHEMA_VERSION===17&&window.SAVE_LOAD_PIPELINE_VERSION===3&&window.SAVE_VERSION_BACKUP_DELEGATION_VERSION===1&&typeof newState==="function"&&typeof window.makeThirdWorldEquipment==="function"&&typeof window.createBlankSecondWorldState==="function"&&typeof window.createBlankThirdWorldState==="function"&&typeof window.normalizeOfflineSaveState==="function"&&typeof window.normalizePlayerTitleState==="function"&&typeof window.load==="function",{timeout:30000});

  const first=await page.evaluate(()=>{
   const SAVE_KEY_VALUE=typeof SAVE_KEY==="string"?SAVE_KEY:"frank_text_rpg_save";
   const clone=value=>JSON.parse(JSON.stringify(value));
   const today=typeof window.gameDailyDateKey==="function"?window.gameDailyDateKey():new Date(Date.now()+8*60*60*1000).toISOString().slice(0,10);
   const now=Date.now();
   const slots=Array.isArray(window.ENHANCEMENT_SLOTS)?Array.from(window.ENHANCEMENT_SLOTS):["weapon","helmet","armor","shoes","accessory"];
   const specKeys=Array.isArray(window.SPECIALIZATION_KEYS)?Array.from(window.SPECIALIZATION_KEYS):["training","scavenge","appraisal","initiative","combo","penetration","counter","drain"];
   const markIds=Array.from(window.CIVILIZATION_MARK_IDS||[]);
   const statKeys=["hp","atk","def","crit","dodge"];

   function buildFixture(){
    const s=newState();
    s.playerName="Schema16 W3 Lv2000 Realistic Fixture";
    s.level=2000;s.exp=0;s.gold=24681357;s.unlockedMap=99;s.vipPoints=625000;
    s.settings={...s.settings,autoSell:[false,true,false,true,false,true],keepUpgrade:true,dark:true,combatSpeed:1.5};
    s.mapProgress=Array.from({length:100},()=>[10,10,10,10]);
    s.bossProgress=Array(100).fill(10);s.bossLocked=Array(100).fill(false);s.bossKilled=Array(100).fill(true);
    s.enhancement={basicStones:43210,advancedStones:3210,levels:Object.fromEntries(slots.map(slot=>[slot,40]))};
    s.specializations=Object.fromEntries(specKeys.map(key=>[key,60]));

    s.secondWorld=window.createBlankSecondWorldState();
    s.secondWorld.entered=true;s.secondWorld.darkMatter=987654321;s.secondWorld.darkEnergy=765432;s.secondWorld.civilizationLevel=10;
    s.secondWorld.mainline.bossKilled=Array(100).fill(true);
    s.secondWorld.calamities=Array.from({length:10},(_,i)=>({currentHp:null,trueKills:30,calamityId:Array.from(window.SECOND_WORLD_CALAMITY_DEFINITIONS||[])[i]?.id||undefined}));

    s.thirdWorld=window.createBlankThirdWorldState();
    s.thirdWorld.entered=true;s.thirdWorld.completed=true;s.thirdWorld.entryVersion=2;s.thirdWorld.dimensionalStrings=1357913579;s.thirdWorld.coreLevel=10;s.thirdWorld.coreProgress=0;
    s.thirdWorld.bosses=Array.from({length:10},()=>({currentHp:0}));
    s.thirdWorld.story={introSeen:true,unlockedStage:10,finalSeen:true};

    if(typeof window.createBlankMarkState==="function")s.marks=window.createBlankMarkState();
    if(!s.marks||typeof s.marks!=="object")s.marks={version:1,entries:{}};
    if(!s.marks.entries||typeof s.marks.entries!=="object")s.marks.entries={};
    markIds.forEach(id=>{s.marks.entries[id]={acquired:true,level:10,progress:0};});
    if(typeof window.createBlankCalamityState==="function")s.calamities=window.createBlankCalamityState();

    const gearState={...s,level:2000},gear={};
    slots.forEach((slot,index)=>{gear[slot]=window.makeThirdWorldEquipment({state:gearState,level:2000,forcedQ:5,forcedType:slot,nameBand:10,rng:()=>0.42,sourceTag:"schema16-realistic-equipped",sourceOrdinal:index});gear[slot].locked=index===0||index===4;});
    s.equipment=gear;
    s.inventory=[
     window.makeThirdWorldEquipment({state:gearState,level:2000,forcedQ:5,forcedType:"weapon",nameBand:10,rng:()=>0.31,sourceTag:"schema16-realistic-bag",sourceOrdinal:10}),
     window.makeThirdWorldEquipment({state:gearState,level:1995,forcedQ:4,forcedType:"armor",nameBand:10,rng:()=>0.63,sourceTag:"schema16-realistic-bag",sourceOrdinal:11})
    ];
    s.inventory[0].locked=true;s.inventory[1].locked=false;
    const lostItem=window.makeThirdWorldEquipment({state:gearState,level:1980,forcedQ:5,forcedType:"accessory",nameBand:10,rng:()=>0.27,sourceTag:"schema16-realistic-lost",sourceOrdinal:12});
    // Formal W3 equipment is created with buy=0, so the existing death-loss owner produces cost=ceil(buy*2)=0.
    s.lostGear=[{id:"schema16-lost-gear-1",item:lostItem,cost:0,lostAt:now-10000}];

    s.daily={dateKey:today,bounty:{used:17},arena:{used:12},voidMirage:{highestFloor:321,claimed:true}};
    if(!s.dungeon||typeof s.dungeon!=="object")s.dungeon={};
    const arenaProfile={positionModelVersion:1,assessmentRuleVersion:4,balanceVersion:7,highestArenaUnlocked:10,activeRank:10,rank:10,promotionReady:false,lastCheckSignature:null,lastCheckRuns:0,lastCheckClearCount:0};
    s.dungeon.arenaByWorld={1:{...arenaProfile},2:{...arenaProfile}};
    s.dungeon.mirror={version:2,history:{bestWins:20,bestDate:today,miracleDates:[today]},daily:{dateKey:today,status:"completed",challengeDate:today,startedAt:now-5000,wins:20,losses:0,completedAt:now-1000}};
    s.dungeon.voidMirage={highestCleared:777};
    s.offline={battleSampleVersion:4,lastSettledAt:now-5000,farmMap:null,farmEnemy:null,avgBattleMs:0,sampleCount:0,battleSamples:[{sampleVersion:4,world:3,targetType:"higher-dimensional",combatSpeed:1.5,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:2000,kind:"higher-dimensional",multiplier:1,recordedAt:now-6000}],maxObservedWallClock:now-5000,timeLockUntil:0,pendingSettlement:{sampleVersion:4,world:3,targetType:"higher-dimensional",combatSpeed:1.5,playerLevel:2000},sampleMigration:null};

    if(typeof window.normalizeSecondWorldState==="function")window.normalizeSecondWorldState(s);
    if(typeof window.normalizeThirdWorldState==="function")window.normalizeThirdWorldState(s);
    if(typeof window.normalizeWorldSaveState==="function")window.normalizeWorldSaveState(s);
    if(typeof window.normalizeEnhancementState==="function")window.normalizeEnhancementState(s);
    if(typeof window.normalizeVipState==="function")window.normalizeVipState(s);
    if(typeof window.normalizeSpecializationState==="function")window.normalizeSpecializationState(s);
    if(typeof window.normalizeDailyState==="function")window.normalizeDailyState(s,now);
    if(typeof window.normalizeDungeonSaveState==="function")window.normalizeDungeonSaveState(s,{timestamp:now});
    if(typeof window.normalizeCivilizationCalamityState==="function")window.normalizeCivilizationCalamityState(s);
    if(typeof window.normalizeOfflineSaveState==="function")window.normalizeOfflineSaveState(s,{sourceVersion:16,currentTime:now});
    if(typeof window.normalizePlayerTitleState==="function")window.normalizePlayerTitleState(s);
    if(Array.isArray(s.titles?.unlocked)&&s.titles.unlocked.length)s.titles.equipped=s.titles.unlocked[s.titles.unlocked.length-1];
    delete s.reincarnation;s.saveVersion=16;return s;
   }

   function itemView(item){
    if(!item||typeof item!=="object")return null;
    const out={id:item.id,name:item.name,type:item.type,level:item.level,world:item.world,q:item.q,locked:item.locked===true,mainStat:clone(item.mainStat),affixes:clone(item.affixes)};
    statKeys.forEach(key=>{out[key]=Number(item[key])||0;});
    return out;
   }
   function stableSnapshot(s){return {
    playerName:s.playerName,level:s.level,exp:s.exp,gold:s.gold,unlockedMap:s.unlockedMap,vipPoints:s.vipPoints,vipLevel:s.vipLevel,
    settings:clone(s.settings),mapProgress:clone(s.mapProgress),bossProgress:clone(s.bossProgress),bossLocked:clone(s.bossLocked),bossKilled:clone(s.bossKilled),
    equipment:Object.fromEntries(slots.map(slot=>[slot,itemView(s.equipment?.[slot])])),inventory:(s.inventory||[]).map(itemView),lostGear:(s.lostGear||[]).map(row=>({id:row?.id,item:itemView(row?.item),cost:row?.cost,lostAt:row?.lostAt})),
    enhancement:clone(s.enhancement),specializations:clone(s.specializations),marks:clone(s.marks),calamities:clone(s.calamities),
    secondWorld:{entered:s.secondWorld?.entered===true,darkMatter:s.secondWorld?.darkMatter,darkEnergy:s.secondWorld?.darkEnergy,civilizationLevel:s.secondWorld?.civilizationLevel,bossKilled:clone(s.secondWorld?.mainline?.bossKilled),calamities:clone(s.secondWorld?.calamities)},
    thirdWorld:clone(s.thirdWorld),daily:clone(s.daily),dungeon:{arenaByWorld:clone(s.dungeon?.arenaByWorld),mirror:clone(s.dungeon?.mirror),voidMirage:clone(s.dungeon?.voidMirage)},titles:clone(s.titles),offline:{battleSampleVersion:s.offline?.battleSampleVersion,battleSamples:clone(s.offline?.battleSamples),pendingSettlement:clone(s.offline?.pendingSettlement)}
   };}

   localStorage.clear();
   const fixture=buildFixture(),expected=stableSnapshot(fixture),raw=JSON.stringify(fixture);localStorage.setItem(SAVE_KEY_VALUE,raw);
   const loaded=window.load(),currentRaw=localStorage.getItem(SAVE_KEY_VALUE)||"",current=JSON.parse(currentRaw),backupKey=`${SAVE_KEY_VALUE}.pre-schema17-backup-v1`,backupRaw=localStorage.getItem(backupKey)||"";
   const report=clone(window.LAST_SAVE_LOAD_REPORT||{}),backupReport=clone(window.LAST_PRE_SCHEMA17_SAVE_SAFETY_REPORT||{}),actual=stableSnapshot(current),changedKeys=Object.keys(expected).filter(key=>JSON.stringify(expected[key])!==JSON.stringify(actual[key])),differences=Object.fromEntries(changedKeys.map(key=>[key,{expected:expected[key],actual:actual[key]}]));
   return {loaded,raw,currentRaw,backupRaw,backupKey,expected,actual,changedKeys,differences,currentVersion:current.saveVersion,currentReincarnation:clone(current.reincarnation),report,backupReport};
  });

  assert.equal(first.loaded,true,"Schema16 realistic fixture failed canonical load.");
  assert.equal(first.backupRaw,first.raw,"Pre-Schema17 backup must be byte-for-byte identical to the original save.");
  assert.equal(first.currentVersion,17,"Canonical load did not persist Schema17.");
  assert.equal(first.currentReincarnation?.count,0,"Legacy Schema16 load must initialize first-run reincarnation state.");
  assert.deepEqual(first.changedKeys,[],"Realistic Schema16 W3 gameplay fields changed during migration/load: "+JSON.stringify(first.differences));
  assert.equal(first.report?.failed,false,"Canonical load report unexpectedly failed.");
  assert.equal(first.report?.sourceVersion,16,"Canonical load report lost Schema16 source version.");
  assert.equal(first.report?.versionBackupOwner,"saveversionguard","Version backup owner must remain saveversionguard.");
  assert.equal(first.backupReport?.verified,true,"Pre-Schema17 backup was not verified.");

  await page.reload({waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.SAVE_SCHEMA_VERSION===17&&window.LAST_SAVE_LOAD_REPORT?.targetVersion===17,{timeout:30000});
  const reloaded=await page.evaluate((backupKey)=>{const SAVE_KEY_VALUE=typeof SAVE_KEY==="string"?SAVE_KEY:"frank_text_rpg_save";const current=JSON.parse(localStorage.getItem(SAVE_KEY_VALUE)||"null");return {saveVersion:current?.saveVersion,reincarnationCount:current?.reincarnation?.count,backupRaw:localStorage.getItem(backupKey)||"",report:JSON.parse(JSON.stringify(window.LAST_SAVE_LOAD_REPORT||{}))};},first.backupKey);
  assert.equal(reloaded.saveVersion,17,"Second page load did not remain on Schema17.");
  assert.equal(reloaded.reincarnationCount,0,"Second page load changed first-run reincarnation state.");
  assert.equal(reloaded.backupRaw,first.raw,"Second page load must not overwrite the original Schema16 backup.");
  assert.equal(reloaded.report?.sourceVersion,17,"Second page load should read the already migrated Schema17 save.");

  const failClosed=await page.evaluate(()=>{
   const SAVE_KEY_VALUE=typeof SAVE_KEY==="string"?SAVE_KEY:"frank_text_rpg_save",fixture=newState();fixture.saveVersion=16;fixture.playerName="Schema16 Backup Failure Probe";fixture.level=1000;fixture.exp=0;delete fixture.reincarnation;
   const raw=JSON.stringify(fixture),backupKey=`${SAVE_KEY_VALUE}.pre-schema17-backup-v1`,safetyKey=`${SAVE_KEY_VALUE}.safety-backup-v1`;localStorage.removeItem(backupKey);localStorage.removeItem(safetyKey);localStorage.setItem(SAVE_KEY_VALUE,raw);
   const originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(String(key)===backupKey)throw new DOMException("intentional integrity quota failure","QuotaExceededError");return originalSetItem.call(this,key,value);};
   let result,error="";try{result=window.load();}catch(e){error=String(e?.message||e);}finally{Storage.prototype.setItem=originalSetItem;}
   return {result,error,raw,rawAfter:localStorage.getItem(SAVE_KEY_VALUE)||"",backupAfter:localStorage.getItem(backupKey),report:JSON.parse(JSON.stringify(window.LAST_SAVE_LOAD_REPORT||{})),safetyReport:JSON.parse(JSON.stringify(window.LAST_PRE_SCHEMA17_SAVE_SAFETY_REPORT||{}))};
  });
  assert.equal(failClosed.error,"","Backup failure path must be handled without throwing to the page.");
  assert.equal(failClosed.result,false,"Backup verification failure must fail closed.");
  assert.equal(failClosed.rawAfter,failClosed.raw,"Fail-closed path overwrote the original localStorage save.");
  assert.equal(failClosed.backupAfter,null,"Failed version backup must not leave a false verified backup.");
  assert.equal(failClosed.report?.failed,true,"Fail-closed load report must be marked failed.");
  assert.equal(failClosed.report?.reason,"pre-schema17-backup-failed","Fail-closed reason must identify pre-Schema17 backup failure.");
  assert.equal(failClosed.safetyReport?.ok,false,"Strict backup report must expose the failed verification.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Save load pipeline integrity passed:",JSON.stringify({realisticSchema16:{backupExact:first.backupRaw===first.raw,gameplayPreserved:true,sourceVersion:first.report.sourceVersion,targetVersion:first.currentVersion},reload:{sourceVersion:reloaded.report.sourceVersion,targetVersion:reloaded.saveVersion,backupPreserved:reloaded.backupRaw===first.raw},failClosed:{reason:failClosed.report.reason,originalPreserved:failClosed.rawAfter===failClosed.raw}}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});