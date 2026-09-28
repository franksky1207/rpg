(function(){
 const VERSION=6;
 const SNAPSHOT_VERSION=2;
 const REVIEW_POLICY_VERSION=1;
 const REVIEW_STATE_ISOLATION_VERSION=1;
 const RESULT_CONTRACT_VERSION=2;
 const SETTLEMENT_BASIS_VERSION=2;
 const SETTLEMENT_AUTHORITY_VERSION=1;
 const RESULT_DIAGNOSTIC_VERSION=1;
 const SETTLEMENT_AUTHORITY=Object.freeze({field:"settlementBasis",version:SETTLEMENT_AUTHORITY_VERSION,topLevelSettlementFields:"convenience-only",combat:"diagnostic-only",snapshot:"diagnostic-only",challengeStatus:"diagnostic-only"});

 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function targetState(options={}){return options?.state&&typeof options.state==="object"?options.state:currentState();}
 function resolveBossIndex(value){return typeof window.thirdWorldBossIndex==="function"?window.thirdWorldBossIndex(value):-1;}
 function maxMarkLevel(){return typeof window.markMaxLevel==="function"?Math.max(0,finiteWhole(window.markMaxLevel(),0)):0;}
 function deepFreezeClone(value,seen=new WeakMap()){
  if(value==null||typeof value!=="object")return value;
  if(seen.has(value))return seen.get(value);
  const clone=Array.isArray(value)?[]:{};
  seen.set(value,clone);
  Object.keys(value).forEach(key=>{clone[key]=deepFreezeClone(value[key],seen);});
  return Object.freeze(clone);
 }

 function abilityProfileFromStats(stats){
  const raw={
   initiativeBonusPercent:numberOr(stats?.initiativeBonusPercent,0),
   comboRate:numberOr(stats?.comboRate,0),
   penetrationRate:numberOr(stats?.penetrationRate,0),
   counterRate:numberOr(stats?.counterRate,0),
   drainRate:numberOr(stats?.drainRate,0)
  };
  const normalized=typeof window.normalizeCombatAbilityProfile==="function"?window.normalizeCombatAbilityProfile(raw):raw;
  return deepFreezeClone(normalized);
 }
 function effectProfileFromAbilities(abilities){
  const source=abilities&&typeof abilities==="object"?abilities:{};
  const level=maxMarkLevel();
  const raw={};
  Object.entries(source).forEach(([key,descriptor])=>{
   const effect=typeof window.markEffectSnapshot==="function"?window.markEffectSnapshot(key,level):{id:key,level:0,active:false};
   raw[key]={...effect,active:descriptor?.active===true&&effect?.active===true};
  });
  const normalized=typeof window.normalizeCombatEffectProfile==="function"?window.normalizeCombatEffectProfile(raw):raw;
  return deepFreezeClone(normalized);
 }
 function challengeReason(status){
  const reason=String(status?.reason||"");
  if(reason==="world-locked")return "高維紀元目前不是正式成長中的世界。";
  if(reason==="defeated")return "此高維 Boss 已被擊破，正式戰鬥不可重複產生成長。";
  if(reason==="five-point-front")return "此高維 Boss 已超前戰線 5 個百分點，請先推進其他存活 Boss。";
  if(reason==="invalid")return "找不到高維 Boss。";
  return "此高維 Boss 目前無法進行正式挑戰。";
 }
 function terminationReason(playerDied,bossDefeated,turnLimitReached,actionSafetyReached=false){
  if(playerDied&&bossDefeated)return "mutual-defeat";
  if(bossDefeated)return "boss-defeated";
  if(playerDied)return "player-defeated";
  if(actionSafetyReached)return "action-safety";
  if(turnLimitReached)return "turn-limit";
  return "incomplete";
 }
 function createSettlementBasis(input={}){
  const formalStartHp=Math.max(0,finiteWhole(input.formalStartHp,0));
  const combatEndHp=Math.max(0,Math.min(formalStartHp,finiteWhole(input.combatEndHp,formalStartHp)));
  const effectivePermanentDamage=Math.max(0,formalStartHp-combatEndHp);
  const combatCompleted=input.combatCompleted===true;
  const formalRun=input.formalRun===true;
  const challengeAllowedAtStart=input.challengeAllowedAtStart===true;
  const settlementInputReady=combatCompleted;
  const formalSettlementEligible=settlementInputReady&&formalRun&&challengeAllowedAtStart;
  return Object.freeze({
   version:SETTLEMENT_BASIS_VERSION,
   authority:"third-world-settlement-basis",
   authorityVersion:SETTLEMENT_AUTHORITY_VERSION,
   world:3,
   bossIndex:finiteWhole(input.bossIndex,-1),
   bossId:String(input.bossId||""),
   formalStartHp,
   combatEndHp,
   effectivePermanentDamage,
   bossMaxHp:Math.max(formalStartHp,finiteWhole(input.bossMaxHp,formalStartHp)),
   bossStageAtStart:Math.max(0,finiteWhole(input.bossStageAtStart,0)),
   playerStartHp:Math.max(0,finiteWhole(input.playerStartHp,0)),
   playerEndHp:Math.max(0,finiteWhole(input.playerEndHp,0)),
   playerDied:input.playerDied===true,
   bossDefeated:input.bossDefeated===true,
   turns:Math.max(0,finiteWhole(input.turns,0)),
   eventCount:Math.max(0,finiteWhole(input.eventCount,0)),
   terminationReason:String(input.terminationReason||"incomplete"),
   combatCompleted,
   challengeAllowedAtStart,
   formalRun,
   settlementInputReady,
   formalSettlementEligible
  });
 }
 function settlementBasisFromResult(value,options={}){
  const candidate=value?.authority==="third-world-settlement-basis"?value:value?.settlementBasis;
  if(!candidate||typeof candidate!=="object")return null;
  if(candidate.authority!=="third-world-settlement-basis"||Number(candidate.authorityVersion)!==SETTLEMENT_AUTHORITY_VERSION||Number(candidate.version)!==SETTLEMENT_BASIS_VERSION||Number(candidate.world)!==3)return null;
  if(options.requireEligible===true&&candidate.formalSettlementEligible!==true)return null;
  return candidate;
 }

 function createThirdWorldBossCombatSnapshot(value,options={}){
  const index=resolveBossIndex(value);
  if(index<0)return null;
  if(typeof window.thirdWorldBoss!=="function"||typeof window.thirdWorldBossStats!=="function"||typeof window.thirdWorldBossAbilities!=="function")return null;
  const boss=window.thirdWorldBoss(index);
  if(!boss)return null;
  const target=targetState(options);
  const progress=target&&typeof window.thirdWorldBossProgressSnapshot==="function"?window.thirdWorldBossProgressSnapshot(index,target):null;
  const reviewMode=options.review===true;
  const bossMaxHp=Math.max(1,finiteWhole(boss.maxHp,1));
  if(reviewMode&&progress?.defeated!==true)return null;
  const allowOverride=!reviewMode&&options.ignoreUnlock===true;
  const storedHp=progress?finiteWhole(progress.currentHp,bossMaxHp):bossMaxHp;
  const requestedHp=allowOverride&&options.formalStartHp!=null?finiteWhole(options.formalStartHp,storedHp):storedHp;
  const formalStartHp=reviewMode?0:Math.max(0,Math.min(bossMaxHp,requestedHp));
  if(!reviewMode&&formalStartHp<=0)return null;
  const stageBasisHp=reviewMode?Math.max(1,Math.floor(bossMaxHp*.1)):formalStartHp;
  const enemyStartHp=reviewMode?bossMaxHp:formalStartHp;
  const stats=window.thirdWorldBossStats(index,stageBasisHp);
  const abilities=window.thirdWorldBossAbilities(index,stageBasisHp);
  if(!stats||!abilities)return null;
  const stage=finiteWhole(stats.stage,0);
  const enemy={
   index,
   id:String(boss.id||stats.id||""),
   name:String(boss.name||stats.name||`高維 Boss ${index+1}`),
   world:3,
   kind:"boss",
   style:"higher-dimensional",
   hp:Math.max(1,finiteWhole(boss.maxHp,1)),
   atk:Math.max(1,finiteWhole(stats.atk,1)),
   def:Math.max(0,finiteWhole(stats.def,0)),
   crit:Math.max(0,numberOr(stats.crit,0)),
   dodge:Math.max(0,numberOr(stats.dodge,0)),
   stage
  };
  const challengeStatus=target&&typeof window.thirdWorldChallengeStatus==="function"?window.thirdWorldChallengeStatus(index,target):null;
  return deepFreezeClone({
   version:SNAPSHOT_VERSION,
   world:3,
   bossIndex:index,
   bossId:enemy.id,
   bossName:enemy.name,
   bossMaxHp:enemy.hp,
   formalStartHp,
   enemyStartHp,
   enemyHealCap:enemyStartHp,
   stageBasisHp,
   reviewMode,
   stage,
   stats,
   abilities,
   enemy,
   enemyAbilityProfile:abilityProfileFromStats(stats),
   enemyEffectProfile:effectProfileFromAbilities(abilities),
   challengeStatus,
   snapshotPolicy:window.THIRD_WORLD_SNAPSHOT_USAGE_POLICY||null
  });
 }
 function canRunThirdWorldBossCombat(value,target=null){
  const index=resolveBossIndex(value);
  if(index<0)return false;
  const holder=target&&typeof target==="object"?target:currentState();
  return !!holder&&typeof window.thirdWorldChallengeStatus==="function"&&window.thirdWorldChallengeStatus(index,holder).allowed===true;
 }
 function runThirdWorldBossCombat(value,options={}){
  const target=targetState(options);
  const reviewMode=options.review===true;
  const snapshot=createThirdWorldBossCombatSnapshot(value,options);
  if(!snapshot)return Object.freeze({ok:false,world:3,review:reviewMode,reason:reviewMode?"只有已擊破的高維 Boss 可以進行回顧。":"找不到可戰鬥的高維 Boss，或該 Boss 已被擊破。"});
  if(!reviewMode&&options.ignoreUnlock!==true){
   if(!target)return Object.freeze({ok:false,world:3,reason:"無法取得正式角色狀態。"});
   const status=snapshot.challengeStatus;
   if(!status||status.allowed!==true)return Object.freeze({ok:false,reason:challengeReason(status),challengeStatus:status||null,bossIndex:snapshot.bossIndex,world:3});
  }
  if(typeof window.runCombatCore!=="function")return Object.freeze({ok:false,world:3,reason:"正式共用戰鬥核心尚未載入。"});
  const player=options.player&&typeof options.player==="object"?options.player:(typeof window.playerCombatStats==="function"?window.playerCombatStats():null);
  if(!player)return Object.freeze({ok:false,world:3,reason:"無法取得玩家戰鬥能力。"});
  const playerMaxHp=Math.max(1,numberOr(player.hp,1));
  const startHp=options.startHp==null?(reviewMode?playerMaxHp:Math.max(0,numberOr(target?.hp,playerMaxHp))):Math.max(0,numberOr(options.startHp,playerMaxHp));
  const playerHealCap=options.playerHealCap==null?playerMaxHp:Math.max(1,Math.min(playerMaxHp,numberOr(options.playerHealCap,playerMaxHp)));
  const civilizationDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"
   ?window.civilizationCombatDamageMultiplier({world:3,state:target,civilizationLevel:options.civilizationLevel})
   :1;
  const requestedMaxTurns=Math.max(0,finiteWhole(options.maxTurns,0));
  const presentationRequested=options.preparePresentation===true;
  const combat=window.runCombatCore(player,snapshot.enemy,startHp,{
   logs:options.logs!==false,
   rng:typeof options.rng==="function"?options.rng:undefined,
   useTestSpecializations:options.useTestSpecializations===true,
   useTestMarks:options.useTestMarks===true,
   markLevels:options.markLevels||null,
   maxTurns:requestedMaxTurns,
   maxActions:options.maxActions,
   maxActionsPerChain:options.maxActionsPerChain,
   preparePresentation:presentationRequested,
   playerFinalDamageMultiplier:civilizationDamageMultiplier,
   playerHealCap,
   enemyStartHp:snapshot.enemyStartHp,
   enemyHealCap:snapshot.enemyHealCap,
   enemyAbilityProfile:snapshot.enemyAbilityProfile,
   enemyEffectProfile:snapshot.enemyEffectProfile
  });
  const combatEndHp=Math.max(0,Math.min(snapshot.enemyStartHp,finiteWhole(combat.enemyHp,snapshot.enemyStartHp)));
  const playerEndHp=Math.max(0,numberOr(combat.hp,0));
  const playerDied=playerEndHp<=0;
  const bossDefeated=combatEndHp<=0;
  const combatCompleted=playerDied||bossDefeated;
  const turns=Math.max(0,finiteWhole(combat.turns,0));
  const actionSafetyReached=combat.actionBudgetReached===true;
  const turnLimitReached=!combatCompleted&&!actionSafetyReached&&requestedMaxTurns>0&&turns>=requestedMaxTurns;
  const endReason=terminationReason(playerDied,bossDefeated,turnLimitReached,actionSafetyReached);
  const events=deepFreezeClone(Array.isArray(combat.events)?combat.events:[]);
  const logs=deepFreezeClone(Array.isArray(combat.logs)?combat.logs:[]);
  const formalRun=!reviewMode&&options.ignoreUnlock!==true;
  const challengeAllowedAtStart=!reviewMode&&snapshot.challengeStatus?.allowed===true;
  const settlementBasis=createSettlementBasis({
   bossIndex:snapshot.bossIndex,
   bossId:snapshot.bossId,
   formalStartHp:reviewMode?0:snapshot.formalStartHp,
   combatEndHp:reviewMode?0:combatEndHp,
   bossMaxHp:snapshot.bossMaxHp,
   bossStageAtStart:snapshot.stage,
   playerStartHp:combat.playerStartHp,
   playerEndHp,
   playerDied,
   bossDefeated,
   turns,
   eventCount:events.length,
   terminationReason:endReason,
   combatCompleted,
   challengeAllowedAtStart,
   formalRun
  });
  const diagnosticCombat=deepFreezeClone(combat);
  const diagnosticSnapshot=deepFreezeClone(snapshot);
  const diagnosticChallenge=deepFreezeClone(snapshot.challengeStatus);
  const diagnostics=Object.freeze({version:RESULT_DIAGNOSTIC_VERSION,combat:diagnosticCombat,snapshot:diagnosticSnapshot,challengeStatus:diagnosticChallenge});
  const result={
   contractVersion:RESULT_CONTRACT_VERSION,
   contractSemantics:SETTLEMENT_AUTHORITY,
   ok:true,
   world:3,
   review:reviewMode,
   headless:!presentationRequested,
   presentationRequested,
   win:combat.win===true,
   combatCompleted:settlementBasis.combatCompleted,
   actionSafetyReached,
   turnLimitReached,
   terminationReason:settlementBasis.terminationReason,
   settlementInputReady:settlementBasis.settlementInputReady,
   formalSettlementEligible:settlementBasis.formalSettlementEligible,
   bossIndex:snapshot.bossIndex,
   bossId:snapshot.bossId,
   bossName:snapshot.bossName,
   formalStartHp:settlementBasis.formalStartHp,
   enemyStartHp:snapshot.enemyStartHp,
   combatEndHp:reviewMode?combatEndHp:settlementBasis.combatEndHp,
   effectiveDamagePreview:reviewMode?0:settlementBasis.effectivePermanentDamage,
   effectivePermanentDamage:reviewMode?0:settlementBasis.effectivePermanentDamage,
   bossMaxHp:settlementBasis.bossMaxHp,
   bossStageAtStart:settlementBasis.bossStageAtStart,
   bossStatsAtStart:snapshot.stats,
   bossAbilitiesAtStart:snapshot.abilities,
   enemyAbilityProfile:snapshot.enemyAbilityProfile,
   enemyEffectProfile:snapshot.enemyEffectProfile,
   enemyHealCap:snapshot.enemyHealCap,
   civilizationDamageMultiplier,
   playerHp:settlementBasis.playerEndHp,
   playerStartHp:settlementBasis.playerStartHp,
   playerMaxHp:combat.playerMaxHp,
   playerHealCap:combat.playerHealCap,
   playerDied:settlementBasis.playerDied,
   bossDefeated:settlementBasis.bossDefeated,
   turns:settlementBasis.turns,
   logs,
   events,
   diagnostics,
   combat:diagnosticCombat,
   snapshot:diagnosticSnapshot,
   challengeStatus:diagnosticChallenge,
   settlementBasis,
   settlementReady:false,
   formalProgressChanged:false,
   xp:0,
   dimensionalStrings:0,
   items:Object.freeze([])
  };
  return Object.freeze(result);
 }
 function markProfileMatchesOwner(profile,key){
  if(typeof window.markEffectSnapshot!=="function")return false;
  const expected=window.markEffectSnapshot(key,maxMarkLevel());
  const actual=profile?.[key];
  if(!actual||!expected)return false;
  return Object.entries(expected).every(([field,value])=>field==="active"||actual[field]===value);
 }
 function validateThirdWorldCombatAdapter(){
  const errors=[];
  const fail=(code,data=null)=>errors.push({code,data});
  try{
   if(typeof window.runCombatCore!=="function")fail("COMBAT_CORE_MISSING");
   if(typeof window.thirdWorldBossStats!=="function"||typeof window.thirdWorldBossAbilities!=="function")fail("THIRD_WORLD_DATA_OWNER_MISSING");
   if(typeof window.markEffectSnapshot!=="function"||typeof window.markMaxLevel!=="function"||Number(window.MARK_MAX_LEVEL_OWNER_VERSION)!==1)fail("MARK_CORE_OWNER_MISSING");
   const max=Math.max(1,finiteWhole(window.THIRD_WORLD_BOSS_MAX_HP,1));
   const stage6=createThirdWorldBossCombatSnapshot(0,{ignoreUnlock:true,formalStartHp:Math.floor(max*.4)});
   if(!stage6||stage6.stage!==6||stage6.enemyEffectProfile?.revenge?.active!==true||!markProfileMatchesOwner(stage6.enemyEffectProfile,"revenge"))fail("REVENGE_MARK_OWNER",stage6?.enemyEffectProfile?.revenge||null);
   const stage9=createThirdWorldBossCombatSnapshot(4,{ignoreUnlock:true,formalStartHp:Math.floor(max*.1)});
   const markKeys=["composure","suppression","resilience","revenge","backlash","ignore","battleSpirit"];
   if(!stage9||stage9.stage!==9||Number(stage9.enemyAbilityProfile?.comboRate)!==40||markKeys.some(key=>stage9.enemyEffectProfile?.[key]?.active!==true||!markProfileMatchesOwner(stage9.enemyEffectProfile,key)))fail("MARK_EFFECT_OWNER",stage9?.enemyEffectProfile||null);
   const partial=createThirdWorldBossCombatSnapshot(7,{ignoreUnlock:true,formalStartHp:Math.floor(max*.55)});
   if(!partial||partial.enemyHealCap!==partial.formalStartHp||partial.enemyHealCap>=partial.bossMaxHp)fail("FORMAL_HP_HEAL_CAP",partial||null);
   const reviewState={secondWorld:{entered:true},thirdWorld:{entered:true,bosses:Array.from({length:Number(window.THIRD_WORLD_BOSS_COUNT)||10},(_,index)=>({currentHp:index===4?0:max}))}};
   const review=createThirdWorldBossCombatSnapshot(4,{state:reviewState,review:true});
   if(!review||review.reviewMode!==true||review.stage!==9||review.formalStartHp!==0||review.enemyStartHp!==max||review.enemyHealCap!==max||review.stageBasisHp!==Math.floor(max*.1)||markKeys.some(key=>review.enemyEffectProfile?.[key]?.active!==true))fail("REVIEW_FINAL_FORM_FULL_HP",review||null);
   const formalStoredHp=Math.max(1,max-12345),formalProbeState={secondWorld:{entered:true},thirdWorld:{entered:true,bosses:Array.from({length:Number(window.THIRD_WORLD_BOSS_COUNT)||10},(_,index)=>({currentHp:index===0?formalStoredHp:max}))}};
   const guarded=createThirdWorldBossCombatSnapshot(0,{state:formalProbeState,allowFormalHpOverride:true,formalStartHp:1});
   if(!guarded||guarded.formalStartHp!==formalStoredHp)fail("FORMAL_HP_OVERRIDE_GUARD",{expected:formalStoredHp,actual:guarded?.formalStartHp||null});
   const basis=createSettlementBasis({bossIndex:3,bossId:"probe",formalStartHp:1000,combatEndHp:640,bossMaxHp:1100,bossStageAtStart:4,playerStartHp:500,playerEndHp:0,playerDied:true,bossDefeated:false,turns:8,eventCount:12,terminationReason:"player-defeated",combatCompleted:true,challengeAllowedAtStart:true,formalRun:true});
   if(!Object.isFrozen(basis)||basis.version!==SETTLEMENT_BASIS_VERSION||basis.authority!=="third-world-settlement-basis"||basis.effectivePermanentDamage!==360||basis.combatCompleted!==true||basis.settlementInputReady!==true||basis.formalSettlementEligible!==true||basis.terminationReason!=="player-defeated")fail("SETTLEMENT_BASIS_CONTRACT",basis);
   if(settlementBasisFromResult({settlementBasis:basis},{requireEligible:true})!==basis)fail("SETTLEMENT_BASIS_AUTHORITY",basis);
   const incomplete=createSettlementBasis({formalStartHp:1000,combatEndHp:900,terminationReason:"turn-limit",combatCompleted:false});
   if(incomplete.effectivePermanentDamage!==100||incomplete.combatCompleted!==false||incomplete.settlementInputReady!==false||incomplete.formalSettlementEligible!==false||incomplete.terminationReason!=="turn-limit")fail("INCOMPLETE_BASIS_CONTRACT",incomplete);
  }catch(error){fail("EXCEPTION",String(error?.message||error));}
  return Object.freeze({version:6,reviewPolicyVersion:REVIEW_POLICY_VERSION,reviewStateIsolationVersion:REVIEW_STATE_ISOLATION_VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice())});
 }

 window.THIRD_WORLD_COMBAT_VERSION=VERSION;
 window.THIRD_WORLD_COMBAT_SNAPSHOT_VERSION=SNAPSHOT_VERSION;
 window.THIRD_WORLD_COMBAT_REVIEW_POLICY_VERSION=REVIEW_POLICY_VERSION;
 window.THIRD_WORLD_COMBAT_REVIEW_STATE_ISOLATION_VERSION=REVIEW_STATE_ISOLATION_VERSION;
 window.THIRD_WORLD_COMBAT_RESULT_CONTRACT_VERSION=RESULT_CONTRACT_VERSION;
 window.THIRD_WORLD_COMBAT_SETTLEMENT_BASIS_VERSION=SETTLEMENT_BASIS_VERSION;
 window.THIRD_WORLD_SETTLEMENT_AUTHORITY_VERSION=SETTLEMENT_AUTHORITY_VERSION;
 window.THIRD_WORLD_RESULT_DIAGNOSTIC_VERSION=RESULT_DIAGNOSTIC_VERSION;
 window.THIRD_WORLD_COMBAT_HEADLESS_DEFAULT_VERSION=1;
 window.THIRD_WORLD_COMBAT_NO_SETTLEMENT_VERSION=1;
 window.THIRD_WORLD_FORMAL_HP_OVERRIDE_GUARD_VERSION=1;
 window.THIRD_WORLD_MARK_EFFECT_SOURCE_VERSION=1;
 window.THIRD_WORLD_MARK_MAX_LEVEL_SOURCE_VERSION=1;
 window.THIRD_WORLD_SETTLEMENT_AUTHORITY=SETTLEMENT_AUTHORITY;
 window.thirdWorldCombatAbilityProfileFromStats=abilityProfileFromStats;
 window.thirdWorldCombatEffectProfileFromAbilities=effectProfileFromAbilities;
 window.createThirdWorldBossCombatSnapshot=createThirdWorldBossCombatSnapshot;
 window.createThirdWorldCombatSettlementBasis=createSettlementBasis;
 window.thirdWorldSettlementBasisFromResult=settlementBasisFromResult;
 window.canRunThirdWorldBossCombat=canRunThirdWorldBossCombat;
 window.runThirdWorldBossCombat=runThirdWorldBossCombat;
 window.validateThirdWorldCombatAdapter=validateThirdWorldCombatAdapter;
 window.THIRD_WORLD_COMBAT_INTEGRITY=validateThirdWorldCombatAdapter();
 if(!window.THIRD_WORLD_COMBAT_INTEGRITY.passed)console.error("[文明戰線] Third-world combat adapter integrity error",window.THIRD_WORLD_COMBAT_INTEGRITY.errors);
})();