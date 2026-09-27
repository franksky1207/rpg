(function(){
 const VERSION=1;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const maxHp=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||0));
 const coreRef=window.runCombatCore;
 const combatRef=window.runThirdWorldBossCombat;
 const stable=(value)=>JSON.stringify(value);
 const constantRng=(value)=>()=>value;
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

 try{
  if(typeof window.runCombatCore!=="function")fail("COMBAT_CORE_MISSING","共用 runCombatCore 未載入");
  if(typeof window.runThirdWorldBossCombat!=="function")fail("THIRD_WORLD_COMBAT_MISSING","runThirdWorldBossCombat 未載入");
  if(typeof window.createThirdWorldBossCombatSnapshot!=="function")fail("THIRD_WORLD_SNAPSHOT_MISSING","高維戰鬥快照 owner 未載入");
  if(Number(window.THIRD_WORLD_COMBAT_VERSION)!==2)fail("THIRD_WORLD_COMBAT_VERSION","第三紀元戰鬥 adapter 版本應為 2",window.THIRD_WORLD_COMBAT_VERSION);
  if(Number(window.THIRD_WORLD_COMBAT_RESULT_CONTRACT_VERSION)!==1)fail("RESULT_CONTRACT_VERSION","高維戰鬥 result contract 版本應為 1",window.THIRD_WORLD_COMBAT_RESULT_CONTRACT_VERSION);
  if(Number(window.THIRD_WORLD_COMBAT_SETTLEMENT_BASIS_VERSION)!==1)fail("SETTLEMENT_BASIS_VERSION","高維 settlement basis 版本應為 1",window.THIRD_WORLD_COMBAT_SETTLEMENT_BASIS_VERSION);
  if(window.COMBAT_MARK_INTEGRITY?.passed!==true)fail("SHARED_MARK_INTEGRITY","高維戰鬥依賴的共用印記 deterministic integrity 未通過",window.COMBAT_MARK_INTEGRITY||null);

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

  [limitA,win,loss].forEach((result,index)=>{
   if(!Object.isFrozen(result)||!Object.isFrozen(result?.events)||!Object.isFrozen(result?.logs)||!Object.isFrozen(result?.items)||!Object.isFrozen(result?.settlementBasis))fail("RESULT_IMMUTABILITY","高維戰鬥輸出與 settlement basis 應為 immutable",{index});
   if(result?.settlementReady!==false||result?.formalProgressChanged!==false||Number(result?.xp)!==0||Number(result?.dimensionalStrings)!==0||(result?.items||[]).length!==0)fail("PRE_SETTLEMENT_GUARD","第 5 批戰鬥層不得偷做永久進度／EXP／維度之弦／掉落",{index,result:{settlementReady:result?.settlementReady,formalProgressChanged:result?.formalProgressChanged,xp:result?.xp,dimensionalStrings:result?.dimensionalStrings,items:result?.items}});
  });

  if(window.runCombatCore!==coreRef)fail("SHARED_CORE_REPLACED","高維 integrity 不得替換共用 runCombatCore owner");
  if(window.runThirdWorldBossCombat!==combatRef)fail("THIRD_WORLD_OWNER_REPLACED","高維 integrity 不得替換 runThirdWorldBossCombat owner");
 }catch(error){
  fail("THIRD_WORLD_COMBAT_PROBE","高維 deterministic combat integrity 執行失敗",String(error?.stack||error?.message||error));
 }

 const report=Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice()),checkedAt:Date.now()});
 window.THIRD_WORLD_COMBAT_INTEGRITY_VERSION=VERSION;
 window.THIRD_WORLD_COMBAT_DETERMINISTIC_INTEGRITY=report;
 window.runThirdWorldCombatIntegrity=function(){return report;};
 if(errors.length)console.error("[文明戰線] Third-world deterministic combat integrity error",errors);
})();
