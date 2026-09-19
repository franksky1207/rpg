(function(){
 const CALAMITY_CORE_VERSION=1;
 const CALAMITY_COMBAT_RULE_VERSION=2;
 const ATK_MULTIPLIER=1.10;
 const DEF_MULTIPLIER=1.05;
 const FIXED_CRIT=10;
 const FIXED_DODGE=10;
 const NAMES=["灰潮母巢","日蝕王座","星骸迴廊","黑域牧者","滅世天環","寂滅方舟","萬域蝕潮","深核奇點","無聲裁決","終末之眼"];
 const REGION_IDS=Array.from(window.CIVILIZATION_CALAMITY_IDS||[]);
 const MARK_IDS=Array.from(window.CIVILIZATION_MARK_IDS||[]);

 function int(value,fallback=0){const n=Number(value);return Number.isFinite(n)?Math.floor(n):fallback;}
 function regionById(id){return (Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]).find(region=>String(region?.id||"")===String(id||""))||null;}
 function defById(id){
  const index=REGION_IDS.indexOf(String(id||""));if(index<0)return null;
  const region=regionById(REGION_IDS[index]);if(!region)return null;
  const markId=MARK_IDS[index]||null,markDef=window.MARK_DEFS?.[markId]||null;
  return Object.freeze({
   id:REGION_IDS[index],
   index,
   name:NAMES[index],
   regionId:REGION_IDS[index],
   regionName:String(region.name||""),
   unlockLevel:Math.max(1,int(region.max,(index+1)*50)),
   mapIndex:Math.max(0,int(region.mapEnd,index*10+9)),
   markId,
   markName:String(markDef?.name||markId||"")
  });
 }
 const DEFS=Object.freeze(REGION_IDS.map(defById).filter(Boolean));

 function ensureState(){
  if(typeof window.ensureCivilizationCalamityState==="function")window.ensureCivilizationCalamityState();
  return state?.calamities&&state?.marks?{calamities:state.calamities,marks:state.marks}:null;
 }
 function normalizeMarkProgressEntry(markId){
  ensureState();
  const entry=state?.marks?.entries?.[markId];if(!entry)return null;
  entry.level=typeof window.markClampLevel==="function"?window.markClampLevel(entry.level):Math.max(0,Math.min(10,int(entry.level,0)));
  entry.acquired=entry.acquired===true||entry.level>0;
  if(!entry.acquired){entry.level=0;entry.progress=0;return entry;}
  if(entry.level>=10){entry.progress=0;return entry;}
  const req=Math.max(1,int(typeof window.markRequiredKillsForNextLevel==="function"?window.markRequiredKillsForNextLevel(entry.level):1,1));
  entry.progress=Math.max(0,Math.min(req-1,int(entry.progress,0)));
  return entry;
 }
 function definition(id){return DEFS.find(def=>def.id===String(id||""))||null;}
 function unlocked(id,target=state){
  const def=definition(id);if(!def)return false;
  return target?.bossKilled?.[def.mapIndex]===true;
 }
 function baseBoss(id){
  const def=definition(id);if(!def)return null;
  if(typeof monsterObj!=="function")throw new Error("Mainline monsterObj is required for Civilization Calamity.");
  const boss=monsterObj(def.mapIndex,4);
  if(!boss||boss.kind!=="boss")throw new Error(`Region final boss missing for calamity ${def.id}.`);
  return {name:String(boss.name||""),level:Math.max(1,int(boss.level,def.unlockLevel)),hp:Math.max(1,int(boss.hp,1)),atk:Math.max(1,int(boss.atk,1)),def:Math.max(0,int(boss.def,0))};
 }
 function enemy(id){
  const def=definition(id),base=baseBoss(id);if(!def||!base)return null;
  return {
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
  };
 }
 function maxHp(id){return enemy(id)?.hp||0;}
 function readCurrentHp(def,e,target=state){
  const raw=Number(target?.calamities?.entries?.[def.id]?.currentHp);
  return Number.isFinite(raw)&&raw>0?Math.max(1,Math.min(e.hp,Math.floor(raw))):e.hp;
 }
 function readMarkProgress(markId,target=state){
  const source=target?.marks?.entries?.[markId];
  if(!source)return null;
  const level=typeof window.markClampLevel==="function"?window.markClampLevel(source.level):Math.max(0,Math.min(10,int(source.level,0)));
  const acquired=source.acquired===true||level>0;
  if(!acquired)return {acquired:false,level:0,progress:0,requiredForNext:typeof window.markRequiredKillsForNextLevel==="function"?window.markRequiredKillsForNextLevel(0):0};
  if(level>=10)return {acquired:true,level:10,progress:0,requiredForNext:0};
  const required=typeof window.markRequiredKillsForNextLevel==="function"?window.markRequiredKillsForNextLevel(level):0;
  const progress=Math.max(0,Math.min(Math.max(0,int(required,0)-1),int(source.progress,0)));
  return {acquired:true,level,progress,requiredForNext:required};
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
 function advanceMarkEntry(value){
  const source=value&&typeof value==="object"?value:{};
  const entry={acquired:source.acquired===true,level:typeof window.markClampLevel==="function"?window.markClampLevel(source.level):Math.max(0,Math.min(10,int(source.level,0))),progress:Math.max(0,int(source.progress,0))};
  if(entry.level>0)entry.acquired=true;
  if(!entry.acquired){
   return {entry:{acquired:true,level:0,progress:0},settlement:{changed:true,firstAcquisition:true,level:0,progress:0,maxed:false,levelUp:false}};
  }
  if(entry.level>=10){
   return {entry:{acquired:true,level:10,progress:0},settlement:{changed:false,firstAcquisition:false,level:10,progress:0,maxed:true,levelUp:false}};
  }
  const before=entry.level,req=Math.max(1,int(window.markRequiredKillsForNextLevel?.(before),1));
  const nextProgress=Math.min(req,entry.progress+1);
  const levelUp=nextProgress>=req,nextLevel=levelUp?Math.min(10,before+1):before,nextProgressStored=levelUp?0:nextProgress;
  return {entry:{acquired:true,level:nextLevel,progress:nextLevel>=10?0:nextProgressStored},settlement:{changed:true,firstAcquisition:false,level:nextLevel,progress:nextLevel>=10?0:nextProgressStored,maxed:nextLevel>=10,levelUp,previousLevel:before,required:req}};
 }
 function settleMarkKill(markId){
  const entry=normalizeMarkProgressEntry(markId);
  if(!entry)return {changed:false,firstAcquisition:false,level:0,progress:0,maxed:false};
  const advanced=advanceMarkEntry(entry);
  Object.assign(entry,advanced.entry);
  return advanced.settlement;
 }
 function applyBattleResult(id,combat,options={}){
  const def=definition(id);if(!def||!combat)return null;
  ensureState();
  const calamityEntry=state?.calamities?.entries?.[def.id];if(!calamityEntry)return null;
  let markSettlement=null;
  if(combat.win){
   markSettlement=settleMarkKill(def.markId);
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
 window.normalizeCivilizationMarkProgressForCore=normalizeMarkProgressEntry;
 window.advanceCivilizationCalamityMarkEntry=advanceMarkEntry;
 window.settleCivilizationCalamityMarkKill=settleMarkKill;
 window.applyCivilizationCalamityBattleResult=applyBattleResult;
 window.runCivilizationCalamityBattle=battle;
})();