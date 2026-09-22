(function(){
 const VERSION=1;
 const SETTLEMENT_READY=true;
 const BASE_STAT=3000;
 const STAT_RATIO=Object.freeze({hp:12,atk:2,def:1});
 const STEP_RATE=.015;

 function bossMeta(value){
  return typeof window.secondWorldBoss==="function"?window.secondWorldBoss(value):null;
 }
 function clampBossIndex(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)&&n>=0&&n<Number(window.SECOND_WORLD_BOSS_COUNT||100)?n:-1;
 }
 function secondWorldBossMultiplier(value){
  const index=clampBossIndex(value);
  return index<0?null:1+index*STEP_RATE;
 }
 function secondWorldBossBaseStats(value){
  const index=clampBossIndex(value),boss=bossMeta(index);
  if(index<0||!boss)return null;
  const multiplier=secondWorldBossMultiplier(index);
  return Object.freeze({
   index,
   id:boss.id,
   name:boss.name,
   level:boss.level,
   kind:"boss",
   style:"universe",
   hp:Math.ceil(BASE_STAT*STAT_RATIO.hp*multiplier),
   atk:Math.ceil(BASE_STAT*STAT_RATIO.atk*multiplier),
   def:Math.ceil(BASE_STAT*STAT_RATIO.def*multiplier),
   crit:0,
   dodge:0,
   multiplier
  });
 }
 function secondWorldBossEncounter(value,options={}){
  const base=secondWorldBossBaseStats(value);
  if(!base)return null;
  const rng=typeof options.rng==="function"?options.rng:Math.random;
  const traitIds=Array.isArray(options.traits)?options.traits.slice():(typeof window.rollMonsterTraits==="function"?window.rollMonsterTraits("boss",rng):[]);
  if(typeof window.applyMonsterTraits==="function")return window.applyMonsterTraits({...base},traitIds);
  return {...base,traits:traitIds};
 }
 function canRunSecondWorldBossCombat(value,target=null){
  const index=clampBossIndex(value);
  if(index<0)return false;
  if(target&&target.ignoreUnlock===true)return true;
  return typeof window.canChallengeSecondWorldBoss==="function"&&window.canChallengeSecondWorldBoss(index,target?.state||null);
 }
 function runSecondWorldBossCombat(value,options={}){
  const index=clampBossIndex(value);
  if(index<0)return {ok:false,reason:"找不到宇宙紀元 Boss。"};
  if(options.ignoreUnlock!==true&&!(typeof window.canChallengeSecondWorldBoss==="function"&&window.canChallengeSecondWorldBoss(index,options.state||null))){
   return {ok:false,reason:"此宇宙紀元 Boss 尚未解鎖。"};
  }
  if(typeof window.runCombatCore!=="function")return {ok:false,reason:"正式戰鬥核心尚未載入。"};
  const enemy=options.encounter&&typeof options.encounter==="object"?options.encounter:secondWorldBossEncounter(index,options);
  if(!enemy)return {ok:false,reason:"無法建立宇宙紀元 Boss。"};
  const player=options.player&&typeof options.player==="object"?options.player:(typeof window.playerCombatStats==="function"?window.playerCombatStats():null);
  if(!player)return {ok:false,reason:"無法取得玩家戰鬥能力。"};
  const startHp=options.startHp==null?Math.max(1,Number(player.hp)||1):Math.max(0,Number(options.startHp)||0);
  const targetState=options.state&&typeof options.state==="object"?options.state:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  const civilizationMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"
   ?window.civilizationCombatDamageMultiplier({world:2,state:targetState,civilizationLevel:options.civilizationLevel})
   :1;
  const combat=window.runCombatCore(player,enemy,startHp,{
   logs:options.logs!==false,
   rng:typeof options.rng==="function"?options.rng:undefined,
   useTestSpecializations:options.useTestSpecializations===true,
   useTestMarks:options.useTestMarks===true,
   markLevels:options.markLevels||null,
   maxTurns:options.maxTurns||0,
   preparePresentation:options.preparePresentation!==false,
   playerFinalDamageMultiplier:civilizationMultiplier
  });
  return {
   ok:true,
   win:combat.win===true,
   e:enemy,
   logs:combat.logs||[],
   events:combat.events||[],
   hp:combat.hp,
   enemyHp:combat.enemyHp,
   combatEndHp:combat.hp,
   turns:combat.turns,
   bossIndex:index,
   world:2,
   civilizationDamageMultiplier:civilizationMultiplier,
   settlementReady:SETTLEMENT_READY,
   xp:0,darkMatter:0,darkEnergy:0,items:[],
   formalProgressChanged:false
  };
 }
 function validate(){
  const errors=[];
  const first=secondWorldBossBaseStats(0),last=secondWorldBossBaseStats(99);
  if(!first||first.level!==505||first.hp!==36000||first.atk!==6000||first.def!==3000)errors.push({code:"FIRST_BOSS_BASE",first});
  if(!last||last.level!==1000||Math.abs(last.multiplier-2.485)>1e-9||last.hp!==89460||last.atk!==14910||last.def!==7455)errors.push({code:"LAST_BOSS_BASE",last});
  if(SETTLEMENT_READY!==true)errors.push({code:"SETTLEMENT_GATE"});
  return {passed:errors.length===0,version:VERSION,settlementReady:SETTLEMENT_READY,errors};
 }

 window.SECOND_WORLD_COMBAT_VERSION=VERSION;
 window.SECOND_WORLD_COMBAT_SETTLEMENT_READY=SETTLEMENT_READY;
 window.SECOND_WORLD_BOSS_BASE_STATS=Object.freeze({base:BASE_STAT,ratio:STAT_RATIO,hp:BASE_STAT*STAT_RATIO.hp,atk:BASE_STAT*STAT_RATIO.atk,def:BASE_STAT*STAT_RATIO.def,stepRate:STEP_RATE});
 window.SECOND_WORLD_BOSS_STAT_FORMULA_VERSION=1;
 window.secondWorldBossMultiplier=secondWorldBossMultiplier;
 window.secondWorldBossBaseStats=secondWorldBossBaseStats;
 window.secondWorldBossEncounter=secondWorldBossEncounter;
 window.canRunSecondWorldBossCombat=canRunSecondWorldBossCombat;
 window.runSecondWorldBossCombat=runSecondWorldBossCombat;
 window.SECOND_WORLD_CIVILIZATION_COMBAT_VERSION=2;
 window.SECOND_WORLD_COMBAT_INTEGRITY=validate();
 if(!window.SECOND_WORLD_COMBAT_INTEGRITY.passed)console.error("[文明戰線] Second World combat integrity error",window.SECOND_WORLD_COMBAT_INTEGRITY.errors);
})();
