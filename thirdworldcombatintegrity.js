(function(){
 const VERSION=2;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const maxHp=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||0));
 const coreRef=window.runCombatCore;
 const combatRef=window.runThirdWorldBossCombat;
 const priorTestSpecs=window.gmTestSpecializations&&typeof window.gmTestSpecializations==="object"?{...window.gmTestSpecializations}:null;
 const stable=(value)=>JSON.stringify(value);
 const constantRng=(value)=>()=>value;
 const sequenceRng=(values,fallback=.99)=>{const queue=Array.from(values||[]);let index=0;return ()=>index<queue.length?queue[index++]:fallback;};
 const zeroMarks=()=>Object.fromEntries(Array.from(window.MARK_KEYS||[]).map(key=>[key,0]));
 const summary=(result)=>({
  ok:result?.ok===true,
  combatCompleted:result?.combatCompleted===true,
  turnLimitReached:result?.turnLimitReached===true,
  terminationReason:result?.terminationReason||null,
  playerDied:result?.playerDied===true,
  bossDefeated:result?.bossDefeated===true,
  turns:Number(result?.turns)||0,
  formalStartHp:Number(result?.formalStartHp)||0,
  combatEndHp:Number(result?.combatEndHp)||0,
  effectivePermanentDamage:Number(result?.effectivePermanentDamage)||0,
  events:result?.events||[]
 });
 function fakeState(){
  return {
   level:1000,
   hp:1000000,
   secondWorld:{entered:true,civilizationLevel:0},
   thirdWorld:{entered:true,dimensionalStrings:0,coreLevel:0,bosses:Array.from({length:10},()=>({currentHp:maxHp})),story:{introSeen:false,unlockedStage:0,finalSeen:false}}
  };
 }
 function resetTestSpecs(){
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
  window.gmTestSpecializations=Object.fromEntries(keys.map(key=>[key,0]));
 }
 function run(index,player,options={}){
  const holder=options.state||fakeState();
  return window.runThirdWorldBossCombat(index,{
   ignoreUnlock:true,
   state:holder,
   player,
   startHp:options.startHp==null?player.hp:options.startHp,
   playerHealCap:options.playerHealCap==null?player.hp:options.playerHealCap,
   formalStartHp:options.formalStartHp==null?maxHp:options.formalStartHp,
   civilizationLevel:0,
   maxTurns:options.maxTurns||0,
   logs:false,
   useTestSpecializations:true,
   markLevels:zeroMarks(),
   rng:options.rng||constantRng(.99)
  });
 }
 function expectBoss(index,expected){
  const snapshot=window.createThirdWorldBossCombatSnapshot(index,{ignoreUnlock:true,formalStartHp:maxHp,state:fakeState()});
  if(!snapshot){fail("BOSS_SNAPSHOT_MISSING","無法建立高維 Boss 戰鬥快照",{index});return;}
  Object.entries(expected).forEach(([field,value])=>{
   const actual=Number(snapshot.stats?.[field]);
   if(actual!==value)fail("BOSS_SPECIALIZATION_MISMATCH","高維 Boss 個體特化數值不符",{index,field,expected:value,actual});
  });
 }
 function isolatedEnemyCore(index,field,player,options={}){
  const snapshot=window.createThirdWorldBossCombatSnapshot(index,{ignoreUnlock:true,formalStartHp:options.formalStartHp||maxHp,state:fakeState()});
  if(!snapshot)return null;
  const source=snapshot.enemyAbilityProfile||{};
  const profile={initiativeBonusPercent:0,comboRate:0,penetrationRate:0,counterRate:0,drainRate:0};
  if(field&&Object.prototype.hasOwnProperty.call(profile,field))profile[field]=Number(source[field])||0;
  return window.runCombatCore(player,snapshot.enemy,options.startHp==null?player.hp:options.startHp,{
   logs:false,
   useTestSpecializations:true,
   markLevels:zeroMarks(),
   maxTurns:options.maxTurns==null?1:options.maxTurns,
   skipPlayerAction:options.skipPlayerAction===true,
   skipEnemyAction:options.skipEnemyAction===true,
   rng:options.rng||constantRng(.99),
   enemyStartHp:options.enemyStartHp==null?snapshot.formalStartHp:options.enemyStartHp,
   enemyHealCap:options.enemyHealCap==null?snapshot.formalStartHp:options.enemyHealCap,
   enemyAbilityProfile:profile,
   enemyEffectProfile:typeof window.normalizeCombatEffectProfile==="function"?window.normalizeCombatEffectProfile({}):{}
  });
 }

 try{
  if(typeof window.runCombatCore!=="function")fail("COMBAT_CORE_MISSING","共用 runCombatCore 未載入");
  if(typeof window.runThirdWorldBossCombat!=="function")fail("THIRD_WORLD_COMBAT_MISSING","runThirdWorldBossCombat 未載入");
  if(typeof window.createThirdWorldBossCombatSnapshot!=="function")fail("THIRD_WORLD_SNAPSHOT_MISSING","高維戰鬥快照 owner 未載入");
  if(Number(window.THIRD_WORLD_COMBAT_VERSION)!==3)fail("THIRD_WORLD_COMBAT_VERSION","第三紀元戰鬥 adapter 版本應為 3",window.THIRD_WORLD_COMBAT_VERSION);
  if(Number(window.THIRD_WORLD_FORMAL_HP_OVERRIDE_GUARD_VERSION)!==1)fail("FORMAL_HP_OVERRIDE_GUARD_VERSION","正式 Boss HP override guard 應為版本 1",window.THIRD_WORLD_FORMAL_HP_OVERRIDE_GUARD_VERSION);
  if(Number(window.THIRD_WORLD_COMBAT_RESULT_CONTRACT_VERSION)!==1)fail("RESULT_CONTRACT_VERSION","高維戰鬥 result contract 版本應為 1",window.THIRD_WORLD_COMBAT_RESULT_CONTRACT_VERSION);
  if(Number(window.THIRD_WORLD_COMBAT_SETTLEMENT_BASIS_VERSION)!==1)fail("SETTLEMENT_BASIS_VERSION","高維 settlement basis 版本應為 1",window.THIRD_WORLD_COMBAT_SETTLEMENT_BASIS_VERSION);
  if(window.COMBAT_MARK_INTEGRITY?.passed!==true)fail("SHARED_MARK_INTEGRITY","高維戰鬥依賴的共用印記 deterministic integrity 未通過",window.COMBAT_MARK_INTEGRITY||null);
  resetTestSpecs();

  const base={atk:15000,def:10000,crit:10,dodge:10,initiativeBonusPercent:60,comboRate:30,penetrationRate:30,counterRate:30,drainRate:30};
  expectBoss(0,{atk:17250});
  expectBoss(1,{def:11500});
  expectBoss(2,{crit:16});
  expectBoss(3,{dodge:16});
  expectBoss(4,{comboRate:40});
  expectBoss(5,{penetrationRate:40});
  expectBoss(6,{counterRate:40});
  expectBoss(7,{drainRate:40});
  expectBoss(8,{initiativeBonusPercent:80});
  expectBoss(9,{atk:16200,def:10800});
  const ordinary=window.createThirdWorldBossCombatSnapshot(4,{ignoreUnlock:true,formalStartHp:maxHp,state:fakeState()});
  ["def","crit","dodge","initiativeBonusPercent","penetrationRate","counterRate","drainRate"].forEach(field=>{
   if(Number(ordinary?.stats?.[field])!==base[field])fail("BASE_PROFILE_DRIFT","未特化欄位不應偏離高維基準",{field,expected:base[field],actual:ordinary?.stats?.[field]});
  });

  const abilityOrder=["composure","suppression","resilience","revenge","backlash","ignore","battleSpirit"];
  const thresholds=[70,60,50,40,30,20,10];
  const full=window.createThirdWorldBossCombatSnapshot(0,{ignoreUnlock:true,formalStartHp:maxHp,state:fakeState()});
  if(abilityOrder.some(key=>full?.enemyEffectProfile?.[key]?.active===true))fail("FULL_HP_ABILITY_LEAK","100% HP 時七種階段能力都不應啟動",full?.enemyEffectProfile||null);
  thresholds.forEach((percent,index)=>{
   const hp=Math.floor(maxHp*percent/100);
   const snap=window.createThirdWorldBossCombatSnapshot(0,{ignoreUnlock:true,formalStartHp:hp,state:fakeState()});
   if(Number(snap?.stage)!==index+3)fail("ABILITY_STAGE_THRESHOLD","高維能力階段門檻錯誤",{percent,expectedStage:index+3,actual:snap?.stage});
   abilityOrder.forEach((key,keyIndex)=>{
    const expected=keyIndex<=index;
    const actual=snap?.enemyEffectProfile?.[key]?.active===true;
    if(actual!==expected)fail("ABILITY_UNLOCK_MATRIX","高維七能力累進啟動矩陣錯誤",{percent,key,expected,actual});
   });
  });

  const profile=window.createThirdWorldBossCombatSnapshot(7,{ignoreUnlock:true,formalStartHp:maxHp,state:fakeState()})?.enemyAbilityProfile;
  const expectedProfile={initiativeBonusPercent:60,comboRate:30,penetrationRate:30,counterRate:30,drainRate:40};
  Object.entries(expectedProfile).forEach(([field,value])=>{
   if(Number(profile?.[field])!==value)fail("ABILITY_PROFILE_MAPPING","高維五種基本能力 profile 映射錯誤",{field,expected:value,actual:profile?.[field]});
  });

  const abilityTank={hp:1000000000,atk:20000,def:10000,crit:0,dodge:0};
  const initiative=isolatedEnemyCore(8,"initiativeBonusPercent",abilityTank,{skipPlayerAction:true,maxTurns:2,rng:constantRng(.99)});
  const initiativeHits=(initiative?.events||[]).filter(event=>event?.type==="attack"&&event.actor==="enemy"&&event.source==="normal");
  if(initiativeHits.length!==2||initiativeHits[0]?.initiative!==true||initiativeHits[1]?.initiative!==false)fail("ENEMY_INITIATIVE_EXECUTION","高維先制應只套用敵方第一次正常主動攻擊",initiativeHits);

  const combo=isolatedEnemyCore(4,"comboRate",abilityTank,{skipPlayerAction:true,maxTurns:1,rng:sequenceRng([.99,.5,.99,.1,.99,.5,.99,.99])});
  const comboHits=(combo?.events||[]).filter(event=>event?.type==="attack"&&event.actor==="enemy"),comboEvents=(combo?.events||[]).filter(event=>event?.type==="combo"&&event.actor==="enemy");
  if(comboEvents.length!==1||comboHits.length!==2||comboHits[0]?.source!=="normal"||comboHits[1]?.source!=="combo"||comboHits[1]?.damage!==Math.ceil(comboHits[0].damage*.5))fail("ENEMY_COMBO_EXECUTION","高維連擊應實際追加一次 50% 傷害攻擊",{comboEvents,comboHits});

  const penetration=isolatedEnemyCore(5,"penetrationRate",abilityTank,{skipPlayerAction:true,maxTurns:1,rng:constantRng(.1)});
  const noPenetration=isolatedEnemyCore(5,null,abilityTank,{skipPlayerAction:true,maxTurns:1,rng:constantRng(.1)});
  const penetrationHit=(penetration?.events||[]).find(event=>event?.type==="attack"&&event.actor==="enemy"),plainHit=(noPenetration?.events||[]).find(event=>event?.type==="attack"&&event.actor==="enemy");
  if(penetrationHit?.penetration!==true||!(Number(penetrationHit?.damage)>Number(plainHit?.damage)))fail("ENEMY_PENETRATION_EXECUTION","高維穿透觸發時應實際降低玩家有效 DEF 並提高該擊傷害",{penetrationHit,plainHit});

  const counter=isolatedEnemyCore(6,"counterRate",abilityTank,{skipEnemyAction:true,maxTurns:1,rng:constantRng(.1)});
  const counterEvents=(counter?.events||[]).filter(event=>event?.type==="counter"&&event.actor==="enemy"),counterHits=(counter?.events||[]).filter(event=>event?.type==="attack"&&event.actor==="enemy"&&event.source==="counter");
  if(counterEvents.length!==1||counterHits.length!==1)fail("ENEMY_COUNTER_EXECUTION","高維反擊應在玩家造成有效傷害後實際執行一次 counter strike",{counterEvents,counterHits,events:counter?.events});

  const historicalHp=Math.floor(maxHp*.55),drainPlayer={hp:1000000000,atk:1,def:0,crit:0,dodge:0};
  const drain=run(7,drainPlayer,{formalStartHp:historicalHp,maxTurns:1,rng:sequenceRng([.99,.5,.99,.99,.99,.99,.5,.99,.1,.99])});
  const drainEvent=(drain?.events||[]).find(event=>event?.type==="drain"&&event.actor==="enemy");
  if(!drain?.ok||!drainEvent||drainEvent.healCap!==historicalHp||drainEvent.healed!==1||drain.combatEndHp!==historicalHp||drain.enemyHealCap!==historicalHp||drain.formalStartHp>=drain.bossMaxHp)fail("ENEMY_DRAIN_HISTORICAL_CAP","高維汲取必須實際受本場 formalStartHp 上限約束，不能補回歷史永久削血",{drainEvent,result:summary(drain),enemyHealCap:drain?.enemyHealCap,bossMaxHp:drain?.bossMaxHp});

  const overrideState=fakeState(),storedHp=Math.max(1,maxHp-54321);overrideState.thirdWorld.bosses[0].currentHp=storedHp;
  const guarded=window.createThirdWorldBossCombatSnapshot(0,{state:overrideState,allowFormalHpOverride:true,formalStartHp:1});
  if(!guarded||guarded.formalStartHp!==storedHp)fail("FORMAL_HP_OVERRIDE_GUARD","正式模式不得透過 allowFormalHpOverride／formalStartHp 偽造 Boss 起始正式 HP",{expected:storedHp,actual:guarded?.formalStartHp||null});

  const durable={hp:1000000,atk:1000,def:1000000,crit:0,dodge:0};
  const limitState=fakeState(),beforeLimit=stable(limitState);
  const limitA=run(0,durable,{state:limitState,maxTurns:1,rng:constantRng(.99)});
  const limitB=run(0,durable,{state:fakeState(),maxTurns:1,rng:constantRng(.99)});
  if(!limitA?.ok||limitA.combatCompleted!==false||limitA.turnLimitReached!==true||limitA.terminationReason!=="turn-limit"||limitA.settlementInputReady!==false||limitA.formalSettlementEligible!==false)fail("TURN_LIMIT_CONTRACT","maxTurns 截斷不得被視為可結算完整戰鬥",summary(limitA));
  if(stable(summary(limitA))!==stable(summary(limitB)))fail("DETERMINISTIC_REPEAT","相同 deterministic RNG 與輸入應得到相同高維戰鬥摘要",{a:summary(limitA),b:summary(limitB)});
  if(stable(limitState)!==beforeLimit)fail("HEADLESS_STATE_MUTATION","headless 高維戰鬥不得直接污染傳入 state",{before:beforeLimit,after:stable(limitState)});

  const killer={hp:1000000,atk:1000000000000,def:1000000,crit:0,dodge:0};
  const win=run(0,killer,{formalStartHp:1000,maxTurns:5,rng:constantRng(.99)});
  if(!win?.ok||win.combatCompleted!==true||win.bossDefeated!==true||win.playerDied===true||win.terminationReason!=="boss-defeated"||win.combatEndHp!==0||win.effectivePermanentDamage!==1000||win.settlementBasis?.effectivePermanentDamage!==1000)fail("NATURAL_WIN_CONTRACT","自然擊破 Boss 的 result／settlement basis 錯誤",summary(win));

  const fragile={hp:10,atk:1,def:0,crit:0,dodge:0};
  const loss=run(0,fragile,{formalStartHp:maxHp,maxTurns:5,rng:constantRng(.99)});
  if(!loss?.ok||loss.combatCompleted!==true||loss.playerDied!==true||loss.bossDefeated===true||loss.terminationReason!=="player-defeated"||loss.settlementInputReady!==true)fail("NATURAL_LOSS_CONTRACT","自然死亡的高維 result contract 錯誤",summary(loss));

  const formalState=fakeState(),formalBefore=stable(formalState);
  const formal=window.runThirdWorldBossCombat(0,{state:formalState,player:killer,startHp:killer.hp,playerHealCap:killer.hp,civilizationLevel:0,maxTurns:5,logs:false,useTestSpecializations:true,markLevels:zeroMarks(),rng:constantRng(.99)});
  if(!formal?.ok||formal.combatCompleted!==true||formal.bossDefeated!==true||formal.formalSettlementEligible!==true||formal.settlementInputReady!==true||formal.settlementBasis?.formalRun!==true||formal.settlementBasis?.challengeAllowedAtStart!==true||formal.formalStartHp!==maxHp)fail("FORMAL_SETTLEMENT_ELIGIBLE","合法 World3 正式戰鬥自然結束後必須產生 formalSettlementEligible=true",{result:summary(formal),eligible:formal?.formalSettlementEligible,basis:formal?.settlementBasis,challenge:formal?.challengeStatus});
  if(stable(formalState)!==formalBefore)fail("FORMAL_HEADLESS_STATE_MUTATION","第 5 批正式 headless 戰鬥仍不得直接寫入 Boss 永久 HP 或其他正式 state",{before:formalBefore,after:stable(formalState)});

  [limitA,win,loss,formal,drain].forEach((result,index)=>{
   if(!Object.isFrozen(result)||!Object.isFrozen(result?.events)||!Object.isFrozen(result?.logs)||!Object.isFrozen(result?.items)||!Object.isFrozen(result?.settlementBasis))fail("RESULT_IMMUTABILITY","高維戰鬥輸出與 settlement basis 應為 immutable",{index});
   if(result?.settlementReady!==false||result?.formalProgressChanged!==false||Number(result?.xp)!==0||Number(result?.dimensionalStrings)!==0||(result?.items||[]).length!==0)fail("PRE_SETTLEMENT_GUARD","第 5 批戰鬥層不得偷做永久進度／EXP／維度之弦／掉落",{index,result:{settlementReady:result?.settlementReady,formalProgressChanged:result?.formalProgressChanged,xp:result?.xp,dimensionalStrings:result?.dimensionalStrings,items:result?.items}});
  });

  if(window.runCombatCore!==coreRef)fail("SHARED_CORE_REPLACED","高維 integrity 不得替換共用 runCombatCore owner");
  if(window.runThirdWorldBossCombat!==combatRef)fail("THIRD_WORLD_OWNER_REPLACED","高維 integrity 不得替換 runThirdWorldBossCombat owner");
 }catch(error){
  fail("THIRD_WORLD_COMBAT_PROBE","高維 deterministic combat integrity 執行失敗",String(error?.stack||error?.message||error));
 }finally{
  if(priorTestSpecs)window.gmTestSpecializations=priorTestSpecs;
  else delete window.gmTestSpecializations;
 }

 const report=Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice()),checkedAt:Date.now()});
 window.THIRD_WORLD_COMBAT_INTEGRITY_VERSION=VERSION;
 window.THIRD_WORLD_COMBAT_DETERMINISTIC_INTEGRITY=report;
 window.runThirdWorldCombatIntegrity=function(){return report;};
 if(errors.length)console.error("[文明戰線] Third-world deterministic combat integrity error",errors);
})();
