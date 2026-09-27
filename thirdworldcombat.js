(function(){
 const VERSION=1;
 const SNAPSHOT_VERSION=1;

 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function targetState(options={}){return options?.state&&typeof options.state==="object"?options.state:currentState();}
 function resolveBossIndex(value){return typeof window.thirdWorldBossIndex==="function"?window.thirdWorldBossIndex(value):-1;}
 function freezeCopy(value){return Object.freeze({...value});}
 function maxMarkLevel(){return typeof window.markClampLevel==="function"?window.markClampLevel(Number.MAX_SAFE_INTEGER):0;}

 function abilityProfileFromStats(stats){
  const raw={
   initiativeBonusPercent:numberOr(stats?.initiativeBonusPercent,0),
   comboRate:numberOr(stats?.comboRate,0),
   penetrationRate:numberOr(stats?.penetrationRate,0),
   counterRate:numberOr(stats?.counterRate,0),
   drainRate:numberOr(stats?.drainRate,0)
  };
  return typeof window.normalizeCombatAbilityProfile==="function"?window.normalizeCombatAbilityProfile(raw):Object.freeze(raw);
 }
 function effectProfileFromAbilities(abilities){
  const source=abilities&&typeof abilities==="object"?abilities:{};
  const level=maxMarkLevel();
  const raw={};
  Object.entries(source).forEach(([key,descriptor])=>{
   const effect=typeof window.markEffectSnapshot==="function"?window.markEffectSnapshot(key,level):{id:key,level:0,active:false};
   raw[key]={...effect,active:descriptor?.active===true&&effect?.active===true};
  });
  return typeof window.normalizeCombatEffectProfile==="function"?window.normalizeCombatEffectProfile(raw):Object.freeze(raw);
 }
 function challengeReason(status){
  const reason=String(status?.reason||"");
  if(reason==="world-locked")return "高維紀元目前不是正式成長中的世界。";
  if(reason==="defeated")return "此高維 Boss 已被擊破，正式戰鬥不可重複產生成長。";
  if(reason==="five-point-front")return "此高維 Boss 已超前戰線 5 個百分點，請先推進其他存活 Boss。";
  if(reason==="invalid")return "找不到高維 Boss。";
  return "此高維 Boss 目前無法進行正式挑戰。";
 }

 function createThirdWorldBossCombatSnapshot(value,options={}){
  const index=resolveBossIndex(value);
  if(index<0)return null;
  if(typeof window.thirdWorldBoss!=="function"||typeof window.thirdWorldBossStats!=="function"||typeof window.thirdWorldBossAbilities!=="function")return null;
  const boss=window.thirdWorldBoss(index);
  if(!boss)return null;
  const target=targetState(options);
  const progress=target&&typeof window.thirdWorldBossProgressSnapshot==="function"?window.thirdWorldBossProgressSnapshot(index,target):null;
  const allowOverride=options.ignoreUnlock===true||options.allowFormalHpOverride===true;
  const storedHp=progress?finiteWhole(progress.currentHp,boss.maxHp):finiteWhole(boss.maxHp,1);
  const requestedHp=allowOverride&&options.formalStartHp!=null?finiteWhole(options.formalStartHp,storedHp):storedHp;
  const formalStartHp=Math.max(0,Math.min(finiteWhole(boss.maxHp,1),requestedHp));
  if(formalStartHp<=0)return null;
  const stats=window.thirdWorldBossStats(index,formalStartHp);
  const abilities=window.thirdWorldBossAbilities(index,formalStartHp);
  if(!stats||!abilities)return null;
  const stage=finiteWhole(stats.stage,0);
  const enemy=Object.freeze({
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
  });
  const challengeStatus=target&&typeof window.thirdWorldChallengeStatus==="function"?window.thirdWorldChallengeStatus(index,target):null;
  return Object.freeze({
   version:SNAPSHOT_VERSION,
   world:3,
   bossIndex:index,
   bossId:enemy.id,
   bossName:enemy.name,
   bossMaxHp:enemy.hp,
   formalStartHp,
   enemyHealCap:formalStartHp,
   stage,
   stats:freezeCopy(stats),
   abilities:Object.freeze(Object.fromEntries(Object.entries(abilities).map(([key,row])=>[key,freezeCopy(row)]))),
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
  const snapshot=createThirdWorldBossCombatSnapshot(value,options);
  if(!snapshot)return {ok:false,reason:"找不到可戰鬥的高維 Boss，或該 Boss 已被擊破。"};
  if(options.ignoreUnlock!==true){
   if(!target)return {ok:false,reason:"無法取得正式角色狀態。"};
   const status=snapshot.challengeStatus;
   if(!status||status.allowed!==true)return {ok:false,reason:challengeReason(status),challengeStatus:status||null,bossIndex:snapshot.bossIndex,world:3};
  }
  if(typeof window.runCombatCore!=="function")return {ok:false,reason:"正式共用戰鬥核心尚未載入。"};
  const player=options.player&&typeof options.player==="object"?options.player:(typeof window.playerCombatStats==="function"?window.playerCombatStats():null);
  if(!player)return {ok:false,reason:"無法取得玩家戰鬥能力。"};
  const playerMaxHp=Math.max(1,numberOr(player.hp,1));
  const startHp=options.startHp==null?Math.max(0,numberOr(target?.hp,playerMaxHp)):Math.max(0,numberOr(options.startHp,playerMaxHp));
  const playerHealCap=options.playerHealCap==null?playerMaxHp:Math.max(1,Math.min(playerMaxHp,numberOr(options.playerHealCap,playerMaxHp)));
  const civilizationDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"
   ?window.civilizationCombatDamageMultiplier({world:3,state:target,civilizationLevel:options.civilizationLevel})
   :1;
  const combat=window.runCombatCore(player,snapshot.enemy,startHp,{
   logs:options.logs!==false,
   rng:typeof options.rng==="function"?options.rng:undefined,
   useTestSpecializations:options.useTestSpecializations===true,
   useTestMarks:options.useTestMarks===true,
   markLevels:options.markLevels||null,
   maxTurns:options.maxTurns||0,
   preparePresentation:options.preparePresentation===true,
   playerFinalDamageMultiplier:civilizationDamageMultiplier,
   playerHealCap,
   enemyStartHp:snapshot.formalStartHp,
   enemyHealCap:snapshot.enemyHealCap,
   enemyAbilityProfile:snapshot.enemyAbilityProfile,
   enemyEffectProfile:snapshot.enemyEffectProfile
  });
  const combatEndHp=Math.max(0,Math.min(snapshot.formalStartHp,finiteWhole(combat.enemyHp,snapshot.formalStartHp)));
  const effectiveDamagePreview=Math.max(0,snapshot.formalStartHp-combatEndHp);
  return {
   ok:true,
   world:3,
   win:combat.win===true,
   bossIndex:snapshot.bossIndex,
   bossId:snapshot.bossId,
   bossName:snapshot.bossName,
   formalStartHp:snapshot.formalStartHp,
   combatEndHp,
   effectiveDamagePreview,
   bossMaxHp:snapshot.bossMaxHp,
   bossStageAtStart:snapshot.stage,
   bossStatsAtStart:snapshot.stats,
   bossAbilitiesAtStart:snapshot.abilities,
   enemyAbilityProfile:snapshot.enemyAbilityProfile,
   enemyEffectProfile:snapshot.enemyEffectProfile,
   enemyHealCap:snapshot.enemyHealCap,
   civilizationDamageMultiplier,
   playerHp:Math.max(0,numberOr(combat.hp,0)),
   playerStartHp:combat.playerStartHp,
   playerMaxHp:combat.playerMaxHp,
   playerHealCap:combat.playerHealCap,
   playerDied:Math.max(0,numberOr(combat.hp,0))<=0,
   bossDefeated:combatEndHp<=0,
   turns:Math.max(0,finiteWhole(combat.turns,0)),
   logs:Array.isArray(combat.logs)?combat.logs:[],
   events:Array.isArray(combat.events)?combat.events:[],
   combat,
   snapshot,
   challengeStatus:snapshot.challengeStatus,
   settlementReady:false,
   formalProgressChanged:false,
   xp:0,
   dimensionalStrings:0,
   items:[]
  };
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
   if(typeof window.markEffectSnapshot!=="function"||typeof window.markClampLevel!=="function")fail("MARK_CORE_OWNER_MISSING");
   const max=Math.max(1,finiteWhole(window.THIRD_WORLD_BOSS_MAX_HP,1));
   const stage6=createThirdWorldBossCombatSnapshot(0,{ignoreUnlock:true,formalStartHp:Math.floor(max*.4)});
   if(!stage6||stage6.stage!==6||stage6.enemyEffectProfile?.revenge?.active!==true||!markProfileMatchesOwner(stage6.enemyEffectProfile,"revenge"))fail("REVENGE_MARK_OWNER",stage6?.enemyEffectProfile?.revenge||null);
   const stage9=createThirdWorldBossCombatSnapshot(4,{ignoreUnlock:true,formalStartHp:Math.floor(max*.1)});
   const markKeys=["composure","suppression","resilience","revenge","backlash","ignore","battleSpirit"];
   if(!stage9||stage9.stage!==9||Number(stage9.enemyAbilityProfile?.comboRate)!==40||markKeys.some(key=>stage9.enemyEffectProfile?.[key]?.active!==true||!markProfileMatchesOwner(stage9.enemyEffectProfile,key)))fail("MARK_EFFECT_OWNER",stage9?.enemyEffectProfile||null);
   const partial=createThirdWorldBossCombatSnapshot(7,{ignoreUnlock:true,formalStartHp:Math.floor(max*.55)});
   if(!partial||partial.enemyHealCap!==partial.formalStartHp||partial.enemyHealCap>=partial.bossMaxHp)fail("FORMAL_HP_HEAL_CAP",partial||null);
  }catch(error){fail("EXCEPTION",String(error?.message||error));}
  return Object.freeze({version:1,passed:errors.length===0,errors:Object.freeze(errors.slice())});
 }

 window.THIRD_WORLD_COMBAT_VERSION=VERSION;
 window.THIRD_WORLD_COMBAT_SNAPSHOT_VERSION=SNAPSHOT_VERSION;
 window.THIRD_WORLD_COMBAT_HEADLESS_DEFAULT_VERSION=1;
 window.THIRD_WORLD_COMBAT_NO_SETTLEMENT_VERSION=1;
 window.THIRD_WORLD_MARK_EFFECT_SOURCE_VERSION=1;
 window.thirdWorldCombatAbilityProfileFromStats=abilityProfileFromStats;
 window.thirdWorldCombatEffectProfileFromAbilities=effectProfileFromAbilities;
 window.createThirdWorldBossCombatSnapshot=createThirdWorldBossCombatSnapshot;
 window.canRunThirdWorldBossCombat=canRunThirdWorldBossCombat;
 window.runThirdWorldBossCombat=runThirdWorldBossCombat;
 window.validateThirdWorldCombatAdapter=validateThirdWorldCombatAdapter;
 window.THIRD_WORLD_COMBAT_INTEGRITY=validateThirdWorldCombatAdapter();
 if(!window.THIRD_WORLD_COMBAT_INTEGRITY.passed)console.error("[文明戰線] Third-world combat adapter integrity error",window.THIRD_WORLD_COMBAT_INTEGRITY.errors);
})();