(function(){
 const CALAMITY_CORE_VERSION=1;
 const CALAMITY_COMBAT_RULE_VERSION=2;
 const ATK_MULTIPLIER=1.10;
 const DEF_MULTIPLIER=1.05;
 const FIXED_CRIT=10;
 const FIXED_DODGE=10;
 const CONFIG=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);

 function int(value,fallback=0){const n=Number(value);return Number.isFinite(n)?Math.floor(n):fallback;}
 const DEFS=Object.freeze(CONFIG.map(entry=>Object.freeze({
  id:entry.id,
  index:entry.index,
  name:entry.calamityName,
  regionId:entry.regionId,
  regionName:entry.regionName,
  unlockLevel:entry.unlockLevel,
  mapIndex:entry.mapIndex,
  markId:entry.markId,
  markName:entry.markName
 })));
 const BASE_BOSS_CACHE=new Map();
 const ENEMY_CACHE=new Map();

 function ensureState(){
  if(typeof window.ensureCivilizationCalamityState==="function")window.ensureCivilizationCalamityState();
  return state?.calamities&&state?.marks?{calamities:state.calamities,marks:state.marks}:null;
 }
 function definition(id){return DEFS.find(def=>def.id===String(id||""))||null;}
 function unlocked(id,target=state){
  const def=definition(id);if(!def)return false;
  return target?.bossKilled?.[def.mapIndex]===true;
 }
 function baseBoss(id){
  const def=definition(id);if(!def)return null;
  if(!BASE_BOSS_CACHE.has(def.id)){
   if(typeof monsterObj!=="function")throw new Error("Mainline monsterObj is required for Civilization Calamity.");
   const boss=monsterObj(def.mapIndex,4);
   if(!boss||boss.kind!=="boss")throw new Error(`Region final boss missing for calamity ${def.id}.`);
   BASE_BOSS_CACHE.set(def.id,Object.freeze({name:String(boss.name||""),level:Math.max(1,int(boss.level,def.unlockLevel)),hp:Math.max(1,int(boss.hp,1)),atk:Math.max(1,int(boss.atk,1)),def:Math.max(0,int(boss.def,0))}));
  }
  return {...BASE_BOSS_CACHE.get(def.id)};
 }
 function enemy(id){
  const def=definition(id);if(!def)return null;
  if(!ENEMY_CACHE.has(def.id)){
   const base=baseBoss(def.id);if(!base)return null;
   ENEMY_CACHE.set(def.id,Object.freeze({
    name:def.name,
    level:base.level,
    kind:"civilization-calamity",
    hp:Math.max(1,Math.floor(Number(window.CALAMITY_FIXED_HP)||1000000)),
    atk:Math.max(1,Math.ceil(base.atk*ATK_MULTIPLIER)),
    def:Math.max(0,Math.ceil(base.def*DEF_MULTIPLIER)),
    crit:FIXED_CRIT,
    dodge:FIXED_DODGE,
    calamityId:def.id,
    regionId:def.regionId
   }));
  }
  return {...ENEMY_CACHE.get(def.id)};
 }
 function maxHp(id){return enemy(id)?.hp||0;}
 function readCurrentHp(def,e,target=state){
  const raw=Number(target?.calamities?.entries?.[def.id]?.currentHp);
  return Number.isFinite(raw)&&raw>0?Math.max(1,Math.min(e.hp,Math.floor(raw))):e.hp;
 }
 function readMarkProgress(markId,target=state){
  const source=target?.marks?.entries?.[markId];if(!source)return null;
  const mark=typeof window.markProgressSnapshot==="function"?window.markProgressSnapshot(source):{acquired:source.acquired===true,level:Math.max(0,int(source.level,0)),progress:Math.max(0,int(source.progress,0))};
  return {...mark,requiredForNext:typeof window.markRequiredKillsForNextLevel==="function"?window.markRequiredKillsForNextLevel(mark.level):0};
 }
 function currentHp(id,target=state){
  const def=definition(id),e=enemy(id);if(!def||!e)return 0;
  return readCurrentHp(def,e,target);
 }
 function status(id,target=state){
  const def=definition(id);if(!def)return null;
  const e=enemy(id),hp=readCurrentHp(def,e,target),mark=readMarkProgress(def.markId,target);
  return {
   definition:def,
   unlocked:unlocked(id,target),
   enemy:e,
   currentHp:hp,
   maxHp:e.hp,
   hpPercent:e.hp>0?hp/e.hp*100:0,
   mark
  };
 }
 function applyBattleResult(id,combat,options={}){
  const def=definition(id);if(!def||!combat)return null;
  ensureState();
  const calamityEntry=state?.calamities?.entries?.[def.id];if(!calamityEntry)return null;
  let markSettlement=null;
  if(combat.win){
   markSettlement=typeof window.settleFormalMarkKill==="function"?window.settleFormalMarkKill(def.markId):null;
   calamityEntry.currentHp=null;
  }else{
   const max=maxHp(id);
   calamityEntry.currentHp=Math.max(1,Math.min(max,Math.floor(Number(combat.enemyHp)||max)));
  }
  if(typeof window.restorePlayerHp==="function")window.restorePlayerHp({save:false});
  else state.hp=playerCombatStats().hp;
  if(options.save!==false&&typeof save==="function")save(false);
  return {
   calamityId:def.id,
   win:combat.win===true,
   currentHp:combat.win?maxHp(id):calamityEntry.currentHp,
   maxHp:maxHp(id),
   markSettlement
  };
 }
 function battle(id,options={}){
  const def=definition(id);if(!def)return {ok:false,reason:"unknown-calamity"};
  if(!unlocked(id))return {ok:false,reason:"locked",calamityId:def.id};
  ensureState();
  const e=enemy(id),startEnemyHp=currentHp(id),player=playerCombatStats();
  state.hp=player.hp;
  const combat=window.runCombatCore(player,e,player.hp,{
   logs:options.logs===false?false:true,
   rng:typeof options.rng==="function"?options.rng:undefined,
   enemyStartHp:startEnemyHp,
   markLevels:options.markLevels&&typeof options.markLevels==="object"?options.markLevels:undefined
  });
  const settlement=applyBattleResult(id,combat,{save:options.save!==false});
  return {
   ok:true,
   win:combat.win===true,
   calamityId:def.id,
   definition:def,
   enemy:e,
   enemyStartHp:startEnemyHp,
   enemyEndHp:combat.enemyHp,
   playerStartHp:player.hp,
   playerEndHp:combat.hp,
   playerRestoredHp:state.hp,
   turns:combat.turns,
   logs:combat.logs,
   events:combat.events,
   combat,
   settlement,
   rewards:{exp:0,gold:0,equipment:0,vip:0,basicStones:0,advancedStones:0}
  };
 }

 window.CALAMITY_CORE_VERSION=CALAMITY_CORE_VERSION;
 window.CALAMITY_COMBAT_RULE_VERSION=CALAMITY_COMBAT_RULE_VERSION;
 window.CALAMITY_ATK_MULTIPLIER=ATK_MULTIPLIER;
 window.CALAMITY_DEF_MULTIPLIER=DEF_MULTIPLIER;
 window.CALAMITY_FIXED_CRIT=FIXED_CRIT;
 window.CALAMITY_FIXED_DODGE=FIXED_DODGE;
 window.CALAMITY_DEFS=DEFS;
 window.getCivilizationCalamityDefinition=definition;
 window.getCivilizationCalamityDefinitions=function(){return DEFS.slice();};
 window.isCivilizationCalamityUnlocked=unlocked;
 window.getCivilizationCalamityBaseBoss=baseBoss;
 window.buildCivilizationCalamityEnemy=enemy;
 window.getCivilizationCalamityMaxHp=maxHp;
 window.getCivilizationCalamityCurrentHp=currentHp;
 window.getCivilizationCalamityStatus=status;
 window.applyCivilizationCalamityBattleResult=applyBattleResult;
 window.runCivilizationCalamityBattle=battle;
})();