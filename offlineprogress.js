(function(){
 const OFFLINE_MAX_MS=12*60*60*1000;
 const OFFLINE_MIN_MS=60*1000;
 const OFFLINE_EXP_RATE=.10;
 const OFFLINE_GOLD_RATE=.10;
 const OFFLINE_GEAR_RATE=.10;
 const OFFLINE_ENHANCEMENT_STONE_RATE=.05;
 const OFFLINE_SECOND_WORLD_DARK_ENERGY_RATE=.05;
 const DEFAULT_BATTLE_MS=1800;
 const REAL_BATTLE_MIN_MS=100;
 const REAL_BATTLE_MAX_MS=601000;
 const OFFLINE_SAMPLES_PER_SPEED=Math.max(1,Math.floor(Number(window.OFFLINE_STATE_SAMPLES_PER_SPEED)||8));
 const OFFLINE_SAMPLE_SELECTION_VERSION=3;
 const OFFLINE_COMBAT_SPEEDS=Object.freeze(Array.isArray(window.OFFLINE_STATE_COMBAT_SPEEDS)?window.OFFLINE_STATE_COMBAT_SPEEDS.slice():[1,1.5,2]);
 const OFFLINE_BATTLE_SAMPLE_VERSION=Math.max(1,Math.floor(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)||1));
 const CLOCK_ROLLBACK_TOLERANCE_MS=5*60*1000;
 const HEARTBEAT_MS=60*1000;
 const HEARTBEAT_PERSIST_MS=5*60*1000;
 const YIELD_EVERY=750;
 const THIRD_WORLD_GEAR_ROLL_YIELD_EVERY=250;
 const OFFLINE_GEAR_RENDER_LIMIT=120;
 const THIRD_WORLD_TARGET_TYPE="higher-dimensional";
 const OFFLINE_GEAR_ACCUMULATOR_VERSION=4;
 const OFFLINE_GEAR_ACCUMULATOR_TARGET_VERSION=1;
 const THIRD_WORLD_OFFLINE_ALLOWLIST_VERSION=1;
 const THIRD_WORLD_OFFLINE_PERFORMANCE_VERSION=1;
 const THIRD_WORLD_OFFLINE_STATE_ALLOWLIST=Object.freeze(["inventory","offline"]);
 const baseSave=typeof save==="function"?save:null;
 let heartbeatTimer=null;
 let lastHeartbeatPersist=Date.now();
 let offlineSettlementBusy=false;

 function now(){return Date.now();}
 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function currentPhase(){
  if(typeof window.currentWorldPhase==="function")return Number(window.currentWorldPhase(state))||1;
  return state?.thirdWorld?.entered===true?3:state?.secondWorld?.entered===true?2:1;
 }
 function currentCombatSpeed(){
  const speed=typeof window.effectiveCombatSpeed==="function"?Number(window.effectiveCombatSpeed()):1;
  return OFFLINE_COMBAT_SPEEDS.includes(speed)?speed:1;
 }
 function yieldThread(){return new Promise(resolve=>setTimeout(resolve,0));}
 function ensureOfflineState(){
  if(typeof window.normalizeOfflineSaveState!=="function")throw new Error("Offline save normalization owner unavailable");
  return window.normalizeOfflineSaveState(state,{sourceVersion:Number(state?.saveVersion)||Number(window.SAVE_SCHEMA_VERSION)||1,currentTime:now()});
 }
 function wallClockGuard(o,t=now()){
  const maxObserved=Math.max(0,Math.floor(Number(o.maxObservedWallClock)||0));
  const lockUntil=Math.max(0,Math.floor(Number(o.timeLockUntil)||0));
  if(t+CLOCK_ROLLBACK_TOLERANCE_MS<maxObserved){o.timeLockUntil=Math.max(lockUntil,maxObserved);o.pendingSettlement=null;o.lastSettledAt=t;return {blocked:true,released:false,until:o.timeLockUntil};}
  if(lockUntil>0){
   if(t<lockUntil){o.pendingSettlement=null;o.lastSettledAt=t;return {blocked:true,released:false,until:lockUntil};}
   o.timeLockUntil=0;o.pendingSettlement=null;o.lastSettledAt=t;o.maxObservedWallClock=Math.max(maxObserved,t);return {blocked:false,released:true,until:0};
  }
  if(t<maxObserved){o.pendingSettlement=null;o.lastSettledAt=t;return {blocked:true,released:false,until:maxObserved};}
  o.maxObservedWallClock=Math.max(maxObserved,t);return {blocked:false,released:false,until:0};
 }
 function checkpoint(ts=now(),persist=false){const t=Math.max(0,Math.floor(Number(ts)||now())),o=ensureOfflineState();wallClockGuard(o,t);o.lastSettledAt=t;if(persist&&baseSave)baseSave(false);}
 function legalFarmTarget(mapIdx,enemyIdx){
  const m=Number(mapIdx),e=Number(enemyIdx);
  if(!Number.isInteger(m)||m<0||m>=MAPS.length||!Number.isInteger(e)||e<0||e>3)return false;
  try{const monster=monsterObj(m,e);return !!monster&&monster.kind!=="boss";}catch(_){return false;}
 }
 function sampleAdjustedMsForSpeed(row,targetSpeed){
  const sourceSpeed=Number(row?.combatSpeed),speed=Number(targetSpeed),actualMs=Number(row?.actualMs),cycleMs=Number(row?.cycleMs),multiplier=Math.max(.01,Number(row?.multiplier)||1);
  if(!OFFLINE_COMBAT_SPEEDS.includes(sourceSpeed)||!OFFLINE_COMBAT_SPEEDS.includes(speed)||!Number.isFinite(actualMs)||actualMs<REAL_BATTLE_MIN_MS||!Number.isFinite(cycleMs)||cycleMs<actualMs)return 0;
  const fixedGap=Math.max(0,cycleMs-actualMs),convertedActual=actualMs*(sourceSpeed/speed),converted=(convertedActual+fixedGap)*multiplier;
  return Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(converted)));
 }
 function averageTargetMs(rows,targetSpeed){const values=(Array.isArray(rows)?rows:[]).map(row=>sampleAdjustedMsForSpeed(row,targetSpeed)).filter(ms=>ms>0);return values.length?Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(values.reduce((sum,ms)=>sum+ms,0)/values.length))):0;}
 function beginSecondWorldOfflineBattleSample(bossIndex,boss=null){
  const index=Math.floor(Number(bossIndex)),meta=boss&&typeof boss==="object"?boss:(typeof window.secondWorldBoss==="function"?window.secondWorldBoss(index):null);
  if(!meta||index<0||currentPhase()!==2)return null;
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return null;
  if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main"))return null;
  const combatSpeed=currentCombatSpeed();if(!OFFLINE_COMBAT_SPEEDS.includes(combatSpeed))return null;
  const token={startedAt:now(),interrupted:false,bossIndex:index,bossId:String(meta.id||""),playerLevel:Math.max(500,Math.floor(Number(state.level)||500)),enemyLevel:Math.max(505,Math.floor(Number(meta.level)||505)),combatSpeed,unsubscribe:null};
  if(typeof window.backgroundProgressOnEnvironmentChange==="function")token.unsubscribe=window.backgroundProgressOnEnvironmentChange(isBackground=>{if(isBackground)token.interrupted=true;});
  return token;
 }
 function finishSecondWorldOfflineBattleSample(token,result,gapMs=140){
  if(!token)return false;if(typeof token.unsubscribe==="function")token.unsubscribe();
  if(token.interrupted||result?.win!==true||currentPhase()!==2)return false;
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return false;
  if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main"))return false;
  if(typeof window.appendOfflineBattleSample!=="function")return false;
  const actualMs=Math.round(now()-Number(token.startedAt));if(!Number.isFinite(actualMs)||actualMs<REAL_BATTLE_MIN_MS||actualMs>300000)return false;
  const gap=Math.max(0,Math.round(Number(gapMs)||0)),cycleMs=actualMs+gap,adjustedMs=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,cycleMs));
  const appended=window.appendOfflineBattleSample(state,{sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:2,targetType:"boss",bossIndex:token.bossIndex,bossId:token.bossId,combatSpeed:token.combatSpeed,actualMs,cycleMs,adjustedMs,playerLevel:token.playerLevel,enemyLevel:token.enemyLevel,kind:"boss",multiplier:1,recordedAt:now()},{currentTime:now()});
  return appended?.ok===true;
 }
 function legalSecondWorldBossSample(row){if(Number(row?.sampleVersion)!==OFFLINE_BATTLE_SAMPLE_VERSION||Number(row?.world)!==2||row?.targetType!=="boss")return false;const index=Math.floor(Number(row?.bossIndex)),boss=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(index):null;return !!boss&&String(row?.bossId||"")===String(boss.id||"");}
 function legalThirdWorldSample(row){return Number(row?.sampleVersion)===OFFLINE_BATTLE_SAMPLE_VERSION&&Number(row?.world)===3&&row?.targetType===THIRD_WORLD_TARGET_TYPE&&OFFLINE_COMBAT_SPEEDS.includes(Number(row?.combatSpeed));}
 function resolveRowsAverage(rows,speed){
  if(!rows.length)return null;const exact=rows.filter(row=>Number(row?.combatSpeed)===speed),selected=exact.length?exact:rows,avg=averageTargetMs(selected,speed);if(avg<=0)return null;const latest=selected[selected.length-1];return {avgBattleMs:avg,combatSpeed:speed,fallbackSpeed:exact.length?null:Number(latest?.combatSpeed)||null,sampleCount:selected.length,latest};
 }
 function resolveFarmTarget(){
  const o=ensureOfflineState(),speed=currentCombatSpeed(),phase=currentPhase(),all=Array.isArray(o.battleSamples)?o.battleSamples:[];
  if(phase===3){const resolved=resolveRowsAverage(all.filter(legalThirdWorldSample),speed);return resolved?{world:3,targetType:THIRD_WORLD_TARGET_TYPE,avgBattleMs:resolved.avgBattleMs,combatSpeed:speed,fallbackSpeed:resolved.fallbackSpeed,sampleCount:resolved.sampleCount}:null;}
  if(phase===2){
   const rows=all.filter(legalSecondWorldBossSample);if(!rows.length)return null;const exactRows=rows.filter(row=>Number(row?.combatSpeed)===speed),latest=(exactRows.length?exactRows:rows)[(exactRows.length?exactRows:rows).length-1],bossIndex=Math.floor(Number(latest.bossIndex)),boss=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(bossIndex):null;if(!boss)return null;
   const sameTarget=rows.filter(row=>Math.floor(Number(row?.bossIndex))===bossIndex&&String(row?.bossId||"")===String(boss.id||"")),resolved=resolveRowsAverage(sameTarget,speed);return resolved?{world:2,targetType:"boss",bossIndex,bossId:boss.id,boss,avgBattleMs:resolved.avgBattleMs,combatSpeed:speed,fallbackSpeed:resolved.fallbackSpeed}:null;
  }
  const rows=all.filter(row=>Number(row?.sampleVersion)===OFFLINE_BATTLE_SAMPLE_VERSION&&Number(row?.world)===1&&legalFarmTarget(Math.floor(Number(row?.map)),Math.floor(Number(row?.enemy))));if(!rows.length)return null;
  const exactRows=rows.filter(row=>Number(row?.combatSpeed)===speed),latest=(exactRows.length?exactRows:rows)[(exactRows.length?exactRows:rows).length-1],map=Math.floor(Number(latest?.map)),enemy=Math.floor(Number(latest?.enemy)),sameTarget=rows.filter(row=>Math.floor(Number(row?.map))===map&&Math.floor(Number(row?.enemy))===enemy),resolved=resolveRowsAverage(sameTarget,speed);
  return resolved?{world:1,targetType:"mapEnemy",map,enemy,avgBattleMs:resolved.avgBattleMs,combatSpeed:speed,fallbackSpeed:resolved.fallbackSpeed}:null;
 }
 function formatDuration(ms){const total=Math.max(0,Math.floor(ms/60000)),h=Math.floor(total/60),m=total%60;if(h>0&&m>0)return `${h} 小時 ${m} 分`;if(h>0)return `${h} 小時`;if(total>0)return `${total} 分`;return `${Math.max(1,Math.floor(ms/1000))} 秒`;}
 function farmEnemyObject(target){try{const full=monsterObj(target.map,target.enemy);return full?.kind==="boss"?null:full;}catch(_){return null;}}
 function offlineSellValue(item){return typeof specializationSellValue==="function"?specializationSellValue(item):Math.max(0,Math.floor(Number(item?.sell)||0));}
 function normalizeOfflineDrop(item){if(item&&typeof item==="object"&&typeof item.locked!=="boolean")item.locked=false;return item;}
 function expSnapshot(){if(typeof window.levelProgressSnapshot==="function"){const p=window.levelProgressSnapshot(state);return {level:Math.max(1,Math.floor(Number(p.level)||1)),exp:Math.max(0,Math.floor(Number(p.exp)||0)),need:Math.max(0,Math.floor(Number(p.need)||0)),atCap:p.atCap===true};}const level=clampGameLevel(state.level),exp=Math.max(0,Math.floor(Number(state.exp)||0));return {level,exp,need:Math.max(1,Math.floor(Number(expNeed(level))||1)),atCap:false};}
 function expProgressDelta(before,after){if(!before||!after)return 0;const bl=Math.max(1,Math.floor(Number(before.level)||1)),al=Math.max(bl,Math.floor(Number(after.level)||bl));if(al===bl)return Math.max(0,Math.floor(Number(after.exp)||0)-Math.floor(Number(before.exp)||0));let total=Math.max(0,Math.floor(Number(before.need)||0)-Math.floor(Number(before.exp)||0));for(let level=bl+1;level<al;level++){const need=typeof window.effectiveExpNeed==="function"?window.effectiveExpNeed(level,state):typeof expNeed==="function"?expNeed(level):0;total+=Math.max(0,Math.floor(Number(need)||0));}if(after.atCap!==true)total+=Math.max(0,Math.floor(Number(after.exp)||0));return Math.max(0,total);}
 function offlineEnhancementStoneReward(enemy,battleCount,playerLevel){const count=Math.max(0,Math.floor(Number(battleCount)||0));if(!enemy||count<1||typeof expectedMainlineEnhancementStoneReward!=="function")return {basic:0,advanced:0};const expected=expectedMainlineEnhancementStoneReward(enemy,playerLevel);return {basic:Math.floor(Math.max(0,Number(expected?.basic)||0)*count*OFFLINE_ENHANCEMENT_STONE_RATE),advanced:0};}
 function normalizePending(raw){
  const speed=currentCombatSpeed(),phase=currentPhase();if(!isObject(raw)||Number(raw.sampleVersion)!==OFFLINE_BATTLE_SAMPLE_VERSION||Number(raw.combatSpeed)!==speed)return null;
  const avg=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(Number(raw.avgBattleMs)||DEFAULT_BATTLE_MS))),elapsedRaw=Math.max(0,Number(raw.elapsedRaw)||0),elapsedUsed=Math.min(OFFLINE_MAX_MS,Math.max(0,Number(raw.elapsedUsed)||0)),battles=Math.max(0,Math.min(Math.floor(elapsedUsed/avg),Math.floor(Number(raw.battles)||0)));if(elapsedRaw<OFFLINE_MIN_MS||battles<1)return null;
  const common={sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,combatSpeed:speed,avgBattleMs:avg,elapsedRaw,elapsedUsed,battles,createdAt:Math.max(0,Number(raw.createdAt)||now())};
  if(phase===3){if(Number(raw.world)!==3||raw.targetType!==THIRD_WORLD_TARGET_TYPE)return null;return {...common,world:3,targetType:THIRD_WORLD_TARGET_TYPE};}
  if(phase===2){const bossIndex=Math.floor(Number(raw.bossIndex)),boss=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(bossIndex):null;if(Number(raw.world)!==2||raw.targetType!=="boss"||!boss||String(raw.bossId||"")!==String(boss.id||""))return null;return {...common,world:2,targetType:"boss",bossIndex,bossId:boss.id};}
  const map=Math.floor(Number(raw.map)),enemy=Math.floor(Number(raw.enemy));if(Number(raw.world)!==1||raw.targetType!=="mapEnemy"||!legalFarmTarget(map,enemy))return null;return {...common,world:1,targetType:"mapEnemy",map,enemy};
 }
 function pendingFromTarget(target,avg,elapsedRaw,elapsedUsed,battles,t){const common={sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:target.world,targetType:target.targetType,combatSpeed:target.combatSpeed,avgBattleMs:avg,elapsedRaw,elapsedUsed,battles,createdAt:t};if(target.world===3)return common;if(target.world===2)return {...common,bossIndex:target.bossIndex,bossId:target.bossId};return {...common,map:target.map,enemy:target.enemy};}
 function buildPendingSettlement(){
  const o=ensureOfflineState(),t=now(),clock=wallClockGuard(o,t);if(clock.blocked||clock.released){if(baseSave)baseSave(false);return null;}const existing=normalizePending(o.pendingSettlement);if(existing)return existing;o.pendingSettlement=null;
  const elapsedRaw=Math.max(0,t-o.lastSettledAt);if(elapsedRaw<OFFLINE_MIN_MS){o.lastSettledAt=t;if(baseSave)baseSave(false);return null;}const target=resolveFarmTarget();if(!target){o.lastSettledAt=t;o.maxObservedWallClock=Math.max(Number(o.maxObservedWallClock)||0,t);if(baseSave)baseSave(false);return {unavailable:true,world:currentPhase(),elapsedRaw,elapsedUsed:Math.min(OFFLINE_MAX_MS,elapsedRaw),createdAt:t,sampleMigration:isObject(o.sampleMigration)?{...o.sampleMigration}:null};}
  const elapsedUsed=Math.min(OFFLINE_MAX_MS,elapsedRaw),avg=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(Number(target.avgBattleMs)||DEFAULT_BATTLE_MS))),battles=Math.max(0,Math.floor(elapsedUsed/avg));if(battles<1)return null;const pending=pendingFromTarget(target,avg,elapsedRaw,elapsedUsed,battles,t);o.pendingSettlement=pending;if(baseSave)baseSave(false);return pending;
 }
 function equipmentTypes(){return typeof window.sharedEquipmentTypes==="function"?window.sharedEquipmentTypes():(typeof EQUIPMENT_TYPES!=="undefined"&&Array.isArray(EQUIPMENT_TYPES)?EQUIPMENT_TYPES.slice():[]);}
 function isFormalStateTarget(target){try{return target===state;}catch(_){return false;}}
 function createGearAccumulator({target=null,reject,score,notifyUpgrade=true,respectDisposition=false}={}){
  const s=isObject(target)?target:state,scoreItem=typeof score==="function"?score:(item=>equipmentScore(item)),types=equipmentTypes(),bestByType=new Map(),mythics=[],keptByPolicy=[],rejected=[];let droppedCount=0;
  function rejectItem(item){if(!item)return;rejected.push(item);if(typeof reject==="function")reject(item);}
  function policyDecision(item){if(typeof window.equipmentDropDisposition!=="function")throw new Error("Equipment auto-process policy owner unavailable");return window.equipmentDropDisposition(item,s,{score:scoreItem});}
  function consider(raw){const item=normalizeOfflineDrop(raw);if(!item)return;droppedCount++;const type=item.type;if(!types.includes(type)){rejectItem(item);return;}if(respectDisposition===true){const disposition=policyDecision(item);if(disposition?.process===true)rejectItem(item);else keptByPolicy.push(item);return;}if(Number(item.q)===5){mythics.push(item);return;}const previous=bestByType.get(type);if(!previous||scoreItem(item)>scoreItem(previous)){if(previous)rejectItem(previous);bestByType.set(type,item);}else rejectItem(item);}
  function finalize(){
   if(!Array.isArray(s.inventory))s.inventory=[];
   if(respectDisposition===true){const keptOrdinary=keptByPolicy.filter(item=>Number(item.q)!==5),keptMythics=keptByPolicy.filter(item=>Number(item.q)===5),keptUpgrade=keptByPolicy.some(item=>scoreItem(item)>scoreItem(s.equipment?.[item.type]||null));keptOrdinary.forEach(item=>s.inventory.push(item));keptMythics.forEach(item=>s.inventory.push(item));if(keptUpgrade&&notifyUpgrade!==false&&isFormalStateTarget(s)){try{upgradeDropNoticePending=true;}catch(_){}}return {droppedCount,rejected,keptOrdinary,mythics:keptMythics,keptCount:keptByPolicy.length};}
   const keptOrdinary=[];bestByType.forEach((item,type)=>{const current=s.equipment?.[type]||null;if(scoreItem(item)>scoreItem(current))keptOrdinary.push(item);else rejectItem(item);});keptOrdinary.forEach(item=>s.inventory.push(item));mythics.forEach(item=>s.inventory.push(item));if(keptOrdinary.length&&notifyUpgrade!==false&&isFormalStateTarget(s)){try{upgradeDropNoticePending=true;}catch(_){}}return {droppedCount,rejected,keptOrdinary,mythics,keptCount:keptOrdinary.length+mythics.length};
  }
  return {consider,finalize};
 }
 function cloneJson(value){try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}}
 function snapshotStateOutsideAllowedRoots(target,allowedRoots=THIRD_WORLD_OFFLINE_STATE_ALLOWLIST){
  const copy=cloneJson(target);if(!isObject(copy))return null;for(const key of allowedRoots)delete copy[key];return JSON.stringify(copy);
 }
 function inventoryPrefixSnapshot(target,count=null){const inventory=Array.isArray(target?.inventory)?target.inventory:[],limit=count==null?inventory.length:Math.max(0,Math.min(inventory.length,Math.floor(Number(count)||0)));return JSON.stringify(inventory.slice(0,limit));}
 function countBernoulliHitsGeometric(trials,rate,rng=Math.random){
  const total=Math.max(0,Math.floor(Number(trials)||0)),p=Math.max(0,Math.min(1,Number(rate)||0)),random=typeof rng==="function"?rng:Math.random;if(total<=0||p<=0)return 0;if(p>=1)return total;
  const logFailure=Math.log1p(-p);let cursor=0,hits=0;
  while(cursor<total){const u=Math.max(0,Math.min(1-Number.EPSILON,Number(random())||0)),failures=Math.floor(Math.log1p(-u)/logFailure);cursor+=Math.max(0,failures);if(cursor>=total)break;hits++;cursor++;}
  return hits;
 }
 async function grantOfflineRewards(pending,enemy){
  const count=Math.max(0,Math.floor(Number(pending.battles)||0)),settlementPlayerLevel=Math.max(1,Math.floor(Number(state.level)||1));let xpCarry=0,goldCarry=0,convertedCarry=0,totalXp=0,eligibleRolls=0,soldCount=0,soldGold=0,saleStones=normalizeEnhancementStoneReward(null);const expBefore=expSnapshot();
  const gear=createGearAccumulator({target:state,reject:item=>{soldCount++;soldGold+=offlineSellValue(item);saleStones=mergeEnhancementStoneRewards(saleStones,enhancementStoneSaleReward(item));}});
  for(let i=0;i<count;i++){
   goldCarry+=Math.max(0,Number(goldReward(enemy))||0)*OFFLINE_GOLD_RATE;const xpValue=Math.max(0,Number(expReward(enemy))||0)*OFFLINE_EXP_RATE;if(state.level>=MAX_LEVEL)convertedCarry+=xpValue;else{xpCarry+=xpValue;const grant=Math.floor(xpCarry);if(grant>0){xpCarry-=grant;totalXp+=grant;gainExp(grant,[]);}}
   if(Math.random()<OFFLINE_GEAR_RATE){eligibleRolls++;let encounter=null;try{encounter=typeof createMonsterEncounter==="function"?createMonsterEncounter(pending.map,pending.enemy):monsterObj(pending.map,pending.enemy);}catch(_){encounter=null;}if(encounter&&encounter.kind!=="boss"){const item=typeof dropItem==="function"?dropItem(encounter,pending.map):null;if(item)gear.consider(item);}}
   if((i+1)%YIELD_EVERY===0)await yieldThread();
  }
  const finalized=gear.finalize(),directGold=Math.floor(goldCarry),convertedGold=Math.floor(convertedCarry);state.gold+=directGold+convertedGold+soldGold;const battleStones=offlineEnhancementStoneReward(enemy,count,settlementPlayerLevel),totalStones=mergeEnhancementStoneRewards(battleStones,saleStones);if(totalStones.basic||totalStones.advanced)addEnhancementStones(totalStones.basic,totalStones.advanced);if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else state.hp=playerCombatStats().hp;
  return {world:1,totalXp,totalGold:directGold+convertedGold+soldGold,directGold,convertedGold,expProgress:{before:expBefore,after:expSnapshot()},enhancement:{battleBasic:battleStones.basic,saleBasic:saleStones.basic,saleAdvanced:saleStones.advanced,totalBasic:totalStones.basic,totalAdvanced:totalStones.advanced},gear:{eligibleRolls,droppedCount:finalized.droppedCount,soldCount,soldGold,keptOrdinary:finalized.keptOrdinary,mythics:finalized.mythics,keptCount:finalized.keptCount}};
 }
 async function grantSecondWorldOfflineRewards(pending,boss){
  const count=Math.max(0,Math.floor(Number(pending.battles)||0)),bossIndex=Math.floor(Number(pending.bossIndex));if(!boss||bossIndex<0||typeof window.secondWorldBossExpReward!=="function"||typeof window.secondWorldBossDarkMatterReward!=="function"||typeof window.makeSecondWorldEquipmentForBoss!=="function")throw new Error("Second-world offline reward owner unavailable");
  const expBefore=expSnapshot(),soldItems=[];let xpCarry=0,darkMatterCarry=0,eligibleRolls=0;const gear=createGearAccumulator({target:state,reject:item=>soldItems.push(item)});
  for(let i=0;i<count;i++){
   const xpValue=Math.max(0,Number(window.secondWorldBossExpReward(bossIndex,false,state))||0)*OFFLINE_EXP_RATE;xpCarry+=xpValue;const grant=Math.floor(xpCarry);if(grant>0){xpCarry-=grant;if(typeof window.gainEffectiveExp==="function")window.gainEffectiveExp(grant,[]);else gainExp(grant,[]);}darkMatterCarry+=Math.max(0,Number(window.secondWorldBossDarkMatterReward(bossIndex,false))||0)*OFFLINE_GOLD_RATE;
   if(Math.random()<OFFLINE_GEAR_RATE){eligibleRolls++;const item=window.makeSecondWorldEquipmentForBoss(bossIndex,{state});if(item)gear.consider(item);}if((i+1)%YIELD_EVERY===0)await yieldThread();
  }
  const finalized=gear.finalize(),directDarkMatter=Math.floor(darkMatterCarry),directDarkEnergy=Math.floor(count*OFFLINE_SECOND_WORLD_DARK_ENERGY_RATE);state.secondWorld.darkMatter=Math.max(0,Math.floor(Number(state.secondWorld.darkMatter)||0))+directDarkMatter;state.secondWorld.darkEnergy=Math.max(0,Math.floor(Number(state.secondWorld.darkEnergy)||0))+directDarkEnergy;
  let sale={ok:true,quote:{darkMatter:0,darkEnergy:0,gold:0,amount:0},count:0};if(soldItems.length){if(typeof window.settleEquipmentSaleBatch!=="function")throw new Error("Second-world offline sale owner unavailable");sale=window.settleEquipmentSaleBatch(soldItems,{state});if(!sale?.ok)throw new Error("Second-world offline equipment sale failed");}if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else state.hp=playerCombatStats().hp;
  const saleDarkMatter=Math.max(0,Math.floor(Number(sale?.quote?.darkMatter)||0)),saleDarkEnergy=Math.max(0,Math.floor(Number(sale?.quote?.darkEnergy)||0)),expAfter=expSnapshot(),totalXp=expProgressDelta(expBefore,expAfter);
  return {world:2,totalXp,totalDarkMatter:directDarkMatter+saleDarkMatter,directDarkMatter,saleDarkMatter,totalDarkEnergy:directDarkEnergy+saleDarkEnergy,directDarkEnergy,saleDarkEnergy,expProgress:{before:expBefore,after:expAfter},enhancement:{darkEnergy:directDarkEnergy,rate:OFFLINE_SECOND_WORLD_DARK_ENERGY_RATE},gear:{eligibleRolls,droppedCount:finalized.droppedCount,soldCount:soldItems.length,soldDarkMatter:saleDarkMatter,soldDarkEnergy:saleDarkEnergy,keptOrdinary:finalized.keptOrdinary,mythics:finalized.mythics,keptCount:finalized.keptCount}};
 }
 async function grantThirdWorldOfflineRewards(pending){
  const count=Math.max(0,Math.floor(Number(pending.battles)||0));if(typeof window.makeThirdWorldEquipmentDrops!=="function")throw new Error("Third-world offline equipment owner unavailable");
  const protectedBefore=snapshotStateOutsideAllowedRoots(state),inventoryCountBefore=Array.isArray(state.inventory)?state.inventory.length:0,inventoryBefore=inventoryPrefixSnapshot(state,inventoryCountBefore);if(protectedBefore==null)throw new Error("Third-world offline allow-list snapshot failed");
  const eligibleRolls=countBernoulliHitsGeometric(count,OFFLINE_GEAR_RATE,Math.random),gear=createGearAccumulator({target:state,respectDisposition:true});
  for(let i=0;i<eligibleRolls;i++){
   const drops=window.makeThirdWorldEquipmentDrops({state,level:Math.max(1000,Math.floor(Number(state.level)||1000)),sourceTag:"third-world-offline"});for(const row of drops||[])if(row?.item)gear.consider(row.item);if((i+1)%THIRD_WORLD_GEAR_ROLL_YIELD_EVERY===0)await yieldThread();
  }
  const finalized=gear.finalize(),protectedAfter=snapshotStateOutsideAllowedRoots(state),inventoryPrefixAfter=inventoryPrefixSnapshot(state,inventoryCountBefore),addedInventory=(Array.isArray(state.inventory)?state.inventory:[]).slice(inventoryCountBefore),expectedAdded=[...finalized.keptOrdinary,...finalized.mythics];
  if(protectedAfter!==protectedBefore)throw new Error("Third-world offline settlement mutated a state root outside the allow-list");
  if(inventoryPrefixAfter!==inventoryBefore||JSON.stringify(addedInventory)!==JSON.stringify(expectedAdded))throw new Error("Third-world offline settlement mutated existing inventory instead of append-only rewards");
  return {world:3,totalXp:0,totalDimensionalStrings:0,totalCoreProgress:0,gear:{eligibleRolls,droppedCount:finalized.droppedCount,discardedCount:finalized.rejected.length,soldCount:0,keptOrdinary:finalized.keptOrdinary,mythics:finalized.mythics,keptCount:finalized.keptCount}};
 }
 function ensureOfflineModals(){
  if(!document.getElementById("offline-reward-styles")){const style=document.createElement("style");style.id="offline-reward-styles";style.textContent=`body.offline-result-open{overflow:hidden}#offlineRewardPage{position:fixed;inset:0;z-index:10000;display:none;overflow:auto;background:linear-gradient(180deg,#090d12 0%,#111820 100%);padding:max(20px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));box-sizing:border-box}#offlineRewardPage.show{display:block}.offline-page-shell{width:min(760px,100%);min-height:100%;margin:0 auto;display:flex;flex-direction:column;justify-content:center}.offline-page-card{border:1px solid #38424e;border-radius:18px;background:#121920;box-shadow:0 18px 60px rgba(0,0,0,.38);padding:24px}.offline-page-title{text-align:center;color:#f0d494;font-size:clamp(25px,5vw,36px);margin:0}.offline-page-welcome{text-align:center;color:#aeb9c5;margin-top:7px}.offline-duration{text-align:center;font-size:clamp(24px,6vw,40px);font-weight:800;margin:14px 0 22px;color:#fff}.offline-section{border:1px solid #303a45;border-radius:14px;background:#0e141a;padding:16px;margin-top:12px}.offline-section-title{font-weight:800;color:#d9e0e8;font-size:15px}.offline-battle-count{font-size:30px;font-weight:850;margin-top:6px}.offline-enemy-line{color:#c4ced8;margin-top:5px;line-height:1.5}.offline-reward-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.offline-reward-card{border:1px solid #3a4551;border-radius:14px;background:#0d1319;padding:18px;text-align:center;min-width:0}.offline-reward-label{font-size:14px;color:#aeb9c5;font-weight:700}.offline-reward-value{font-size:clamp(27px,5vw,38px);font-weight:900;margin-top:5px;overflow-wrap:anywhere}.offline-exp-progress{margin-top:10px;color:#c8d1da;font-size:14px;line-height:1.45}.offline-exp-progress .arrow{display:block;color:#8f9aa6;line-height:1.15}.offline-gear-summary{margin-top:8px;font-weight:700;line-height:1.6}.offline-gear-list{margin-top:10px;border-top:1px solid #303841;padding-top:4px}.offline-gear-row{padding:10px 0;border-bottom:1px solid #2c333b}.offline-gear-row:last-child{border-bottom:0;padding-bottom:2px}.offline-limit-note{text-align:center;color:#8f9aa6;font-size:13px;line-height:1.5;margin-top:14px}.offline-enter-controls{margin-top:18px}.offline-enter-controls .btn{width:100%;min-height:48px;font-size:16px;font-weight:800}#offlineCalculatingModal{z-index:10001}#offlineCalculatingModal .modal-box{width:min(360px,100%);text-align:center}#offlineCalculatingModal .muted{line-height:1.6}@media(max-width:560px){.offline-page-shell{justify-content:flex-start}.offline-page-card{padding:18px 14px;border-radius:14px}.offline-reward-grid{grid-template-columns:1fr}.offline-duration{margin-bottom:16px}.offline-section{padding:14px}.offline-battle-count{font-size:27px}}`;document.head.appendChild(style);}
  if(!document.getElementById("offlineRewardPage")){const page=document.createElement("div");page.id="offlineRewardPage";page.innerHTML=`<div class="offline-page-shell"><div class="offline-page-card"><h2 class="offline-page-title">離線收益結算</h2><div class="offline-page-welcome">歡迎回來</div><div id="offlineRewardDetail"></div><div class="offline-enter-controls"><button class="btn primary" onclick="closeOfflineRewardModal()">進入遊戲</button></div></div></div>`;document.body.appendChild(page);}
  if(!document.getElementById("offlineCalculatingModal")){const modal=document.createElement("div");modal.className="modal";modal.id="offlineCalculatingModal";modal.innerHTML=`<div class="modal-box"><h3 style="color:#f0d494;margin-top:0">整理離線收益</h3><div class="muted">正在整理離線戰鬥紀錄與可獲得收益。</div></div>`;document.body.appendChild(modal);}
 }
 function setCalculatingVisible(show){ensureOfflineModals();document.getElementById("offlineCalculatingModal")?.classList.toggle("show",!!show);}
 function offlineGearHtml(gear,{discardLabel=false}={}){if(!gear)return "";const kept=[...(gear.keptOrdinary||[]),...(gear.mythics||[])],visible=kept.slice(0,OFFLINE_GEAR_RENDER_LIMIT),hiddenCount=Math.max(0,kept.length-visible.length),keptHtml=visible.length?`<div class="offline-gear-list">${visible.map(item=>`<div class="offline-gear-row">${itemHtml(item,true)}${typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):""}</div>`).join("")}${hiddenCount?`<div class="muted" style="padding:10px 0">另有 ${hiddenCount.toLocaleString()} 件已存入背包，為避免大量 DOM 造成卡頓不在此逐件展開。</div>`:""}</div>`:`<div class="muted" style="margin-top:8px">本次沒有留下裝備。</div>`;const rejected=discardLabel?Math.max(0,Number(gear.discardedCount)||0):Math.max(0,Number(gear.soldCount)||0),label=discardLabel?"捨棄":"自動出售";return `<div class="offline-section"><div class="offline-section-title">裝備</div><div class="offline-gear-summary">共取得 ${Math.max(0,Number(gear.droppedCount)||0).toLocaleString()} 件　${label} ${rejected.toLocaleString()} 件</div>${keptHtml}</div>`;}
 function expProgressHtml(progress){if(!progress?.before||!progress?.after)return "";const line=p=>p.atCap===true?`Lv.${p.level}　MAX`:`Lv.${p.level}　${p.exp.toLocaleString()} / ${p.need.toLocaleString()}`;return `<div class="offline-exp-progress"><div>${line(progress.before)}</div><span class="arrow">↓</span><div>${line(progress.after)}</div></div>`;}
 function showOfflineSampleUnavailable(info){
  ensureOfflineModals();const detail=document.getElementById("offlineRewardDetail"),page=document.getElementById("offlineRewardPage");if(!detail||!page)return;const phase=Number(info?.world)||currentPhase(),migration=isObject(info?.sampleMigration)?info.sampleMigration:null;let guidance="完成一場符合條件的主線普通／菁英戰鬥後，即可建立離線收益基準。Boss、副本與背景 catch-up 不會建立此樣本。";if(phase===2)guidance="完成一場宇宙紀元主線 Boss 正式前景勝利後，即可建立離線收益基準。背景戰鬥、回頁 catch-up 與副本不會建立此樣本。";if(phase===3)guidance="完成一場高維紀元正式前景戰鬥並成功結算後，即可建立高維離線裝備樣本。背景戰鬥、回頁 catch-up、GM 測試與回顧不會建立此樣本。";const migrationNote=migration?.action==="discarded"?`<div class="muted" style="margin-top:10px;line-height:1.6">偵測到舊版 Offline battle sample V${Math.max(0,Number(migration.sourceSampleVersion)||0)}。因舊格式無法安全對應目前三紀元實戰樣本，僅淘汰該離線樣本與 pending，不會修改角色、裝備或正式進度。</div>`:"";
  detail.innerHTML=`<div class="offline-duration">離線 ${formatDuration(info?.elapsedUsed||info?.elapsedRaw||0)}</div><div class="offline-section"><div class="offline-section-title">尚無可用的主線實戰樣本</div><div class="offline-enemy-line" style="margin-top:10px">${guidance}</div>${migrationNote}<div class="muted" style="margin-top:10px;line-height:1.6">本次離線區段因沒有可計算的實戰基準而不發放收益，已建立新的離線起點；之後只要有有效樣本，離線結算就會正常出現。</div></div>`;document.body.classList.add("offline-result-open");page.classList.add("show");
 }
 function showOfflineResult(result){
  if(!result)return;ensureOfflineModals();const detail=document.getElementById("offlineRewardDetail"),page=document.getElementById("offlineRewardPage");if(!detail||!page)return;const enemyLevel=Math.max(1,Math.floor(Number(result.enemyLevel)||1)),capNote=result.elapsedRaw>OFFLINE_MAX_MS?`<div class="offline-limit-note">本次離線超過 12 小時，僅計算前 12 小時。</div>`:`<div class="offline-limit-note">離線收益最多計算 12 小時</div>`;
  if(Number(result.world)===3){detail.innerHTML=`<div class="offline-duration">離線 ${formatDuration(result.elapsedUsed)}</div><div class="offline-section"><div class="offline-section-title">高維紀元</div><div class="offline-battle-count">${result.battles.toLocaleString()} 次裝備模擬基準</div><div class="offline-enemy-line">依最近正式高維戰鬥樣本估算；不指定 Boss，也不造成任何 Boss HP 傷害。</div></div>${offlineGearHtml(result.gear,{discardLabel:true})}<div class="offline-section"><div class="muted" style="line-height:1.7">高維離線只模擬裝備掉落機會：不獲得 EXP、維度之弦，不推進核心、稱號、劇情或任何 Boss 進度。</div></div>${capNote}`;}
  else if(Number(result.world)===2){const saleParts=[result.saleDarkMatter?`暗物質 +${result.saleDarkMatter.toLocaleString()}`:"",result.saleDarkEnergy?`暗能量 +${result.saleDarkEnergy.toLocaleString()}`:""].filter(Boolean),saleNote=saleParts.length?`<div class="muted" style="margin-top:8px">離線出售裝備另獲得 ${saleParts.join("、")}</div>`:"";detail.innerHTML=`<div class="offline-duration">離線 ${formatDuration(result.elapsedUsed)}</div><div class="offline-section"><div class="offline-section-title">宇宙紀元主線</div><div class="offline-battle-count">${result.battles.toLocaleString()} 場</div><div class="offline-enemy-line">Lv.${enemyLevel} ${result.enemyName||"主線 Boss"} × ${result.battles.toLocaleString()}</div></div><div class="offline-reward-grid"><div class="offline-reward-card"><div class="offline-reward-label">EXP</div><div class="offline-reward-value">+${result.totalXp.toLocaleString()}</div><div class="muted" style="margin-top:6px">正式主線收益 10%</div>${expProgressHtml(result.expProgress)}</div><div class="offline-reward-card"><div class="offline-reward-label">暗物質</div><div class="offline-reward-value">+${result.totalDarkMatter.toLocaleString()}</div><div class="muted" style="margin-top:6px">正式主線收益 10%</div></div><div class="offline-reward-card"><div class="offline-reward-label">暗能量</div><div class="offline-reward-value">+${result.totalDarkEnergy.toLocaleString()}</div><div class="muted" style="margin-top:6px">直接強化資源 5%</div></div></div>${offlineGearHtml(result.gear)}${saleNote}${capNote}`;}
  else{const enhancement=result.enhancement||{battleBasic:0,saleBasic:0,saleAdvanced:0,totalBasic:0,totalAdvanced:0},stoneSaleParts=[enhancement.saleBasic?`基礎強化石 +${enhancement.saleBasic.toLocaleString()}`:"",enhancement.saleAdvanced?`進階強化石 +${enhancement.saleAdvanced.toLocaleString()}`:""].filter(Boolean),stoneSaleNote=stoneSaleParts.length?`<div class="muted" style="margin-top:8px">離線出售裝備另獲得 ${stoneSaleParts.join("、")}</div>`:"";detail.innerHTML=`<div class="offline-duration">離線 ${formatDuration(result.elapsedUsed)}</div><div class="offline-section"><div class="offline-section-title">戰鬥場次</div><div class="offline-battle-count">${result.battles.toLocaleString()} 場</div><div class="offline-enemy-line">Lv.${enemyLevel} ${result.enemyName||"主線敵人"} × ${result.battles.toLocaleString()}</div></div><div class="offline-reward-grid"><div class="offline-reward-card"><div class="offline-reward-label">EXP</div><div class="offline-reward-value">+${result.totalXp.toLocaleString()}</div>${expProgressHtml(result.expProgress)}</div><div class="offline-reward-card"><div class="offline-reward-label">金幣</div><div class="offline-reward-value">+${result.totalGold.toLocaleString()}</div></div><div class="offline-reward-card"><div class="offline-reward-label">基礎強化石</div><div class="offline-reward-value">+${Math.max(0,Number(enhancement.battleBasic)||0).toLocaleString()}</div><div class="muted" style="margin-top:6px">離線戰鬥收益 5%</div></div></div>${offlineGearHtml(result.gear)}${stoneSaleNote}${capNote}`;}
  document.body.classList.add("offline-result-open");page.classList.add("show");
 }
 window.closeOfflineRewardModal=function(){document.getElementById("offlineRewardPage")?.classList.remove("show");document.body.classList.remove("offline-result-open");if(typeof render==="function")render();};
 async function settleOfflineOnLoad(){
  const pending=buildPendingSettlement();if(!pending)return;if(pending.unavailable){showOfflineSampleUnavailable(pending);return;}const world=Number(pending.world),target=world===2?(typeof window.secondWorldBoss==="function"?window.secondWorldBoss(pending.bossIndex):null):world===1?farmEnemyObject(pending):{name:"高維紀元",level:Math.max(1000,Math.floor(Number(state.level)||1000))};if(!target)return;
  const rollbackSnapshot=JSON.stringify(state);offlineSettlementBusy=true;setCalculatingVisible(true);await yieldThread();
  try{const rewards=world===3?await grantThirdWorldOfflineRewards(pending):world===2?await grantSecondWorldOfflineRewards(pending,target):await grantOfflineRewards(pending,target),result={world,elapsedRaw:pending.elapsedRaw,elapsedUsed:pending.elapsedUsed,battles:pending.battles,enemyName:target.name,enemyLevel:target.level,...rewards},o=ensureOfflineState(),t=now();o.pendingSettlement=null;o.lastSettledAt=t;o.maxObservedWallClock=Math.max(Number(o.maxObservedWallClock)||0,t);if(baseSave)baseSave(false);setCalculatingVisible(false);showOfflineResult(result);}catch(err){console.error("Offline settlement failed",err);setCalculatingVisible(false);try{state=JSON.parse(rollbackSnapshot);if(typeof normalizeCurrentSaveState==="function")normalizeCurrentSaveState();if(typeof render==="function")render();}catch(rollbackError){console.error("Offline rollback failed",rollbackError);location.reload();return;}alert("離線收益整理發生錯誤；本次區段已保留，重新整理後會再次嘗試結算。");}finally{offlineSettlementBusy=false;}
 }
 function installSaveWrapper(){if(!baseSave)return;const wrapped=function(show=true){if(offlineSettlementBusy)return true;checkpoint(now(),false);return baseSave(show);};try{save=wrapped;}catch(_){}window.save=wrapped;}
 function persistForegroundCheckpoint(){if(offlineSettlementBusy)return;checkpoint(now(),false);if(baseSave)baseSave(false);lastHeartbeatPersist=now();}
 function installHeartbeat(){if(heartbeatTimer)clearInterval(heartbeatTimer);heartbeatTimer=setInterval(()=>{if(offlineSettlementBusy)return;const background=typeof window.backgroundProgressEnvironmentIsBackground==="function"?window.backgroundProgressEnvironmentIsBackground():document.visibilityState==="hidden";if(background)return;checkpoint(now(),false);if(now()-lastHeartbeatPersist>=HEARTBEAT_PERSIST_MS&&baseSave){baseSave(false);lastHeartbeatPersist=now();}},HEARTBEAT_MS);if(typeof window.backgroundProgressOnEnvironmentChange==="function")window.backgroundProgressOnEnvironmentChange(()=>persistForegroundCheckpoint());if(typeof window.backgroundProgressOnPageHide==="function")window.backgroundProgressOnPageHide(()=>persistForegroundCheckpoint());}
 function runGearAccumulatorRegression(){
  const errors=[];
  function probe(){const target={equipment:{weapon:{score:50},armor:{score:80},helmet:{score:100},shoes:{score:1},accessory:{score:10}},inventory:[{id:"existing",score:1}],settings:{autoSell:[false,false,false,false,true,true],keepUpgrade:true}},rejected=[],gear=createGearAccumulator({target,reject:item=>rejected.push(item.id),score:item=>Number(item?.score)||0,notifyUpgrade:false,respectDisposition:true});gear.consider({id:"legendary-upgrade",type:"weapon",q:4,score:60});gear.consider({id:"legendary-equal",type:"armor",q:4,score:80});gear.consider({id:"epic-kept",type:"helmet",q:3,score:1});gear.consider({id:"mythic-equal",type:"shoes",q:5,score:1});gear.consider({id:"mythic-upgrade",type:"accessory",q:5,score:20});const result=gear.finalize();return {target,rejected,result};}
  const a=probe(),b=probe();
  if(JSON.stringify(a)!==JSON.stringify(b))errors.push({code:"ACCUMULATOR_NOT_DETERMINISTIC"});
  if(a.target.inventory.map(item=>item.id).join("|")!=="existing|legendary-upgrade|epic-kept|mythic-upgrade")errors.push({code:"TARGET_INVENTORY_RESULT",inventory:a.target.inventory});
  if(a.rejected.join("|")!=="legendary-equal|mythic-equal"||a.result.keptCount!==3||a.result.droppedCount!==5)errors.push({code:"TARGET_SELECTION_RESULT",rejected:a.rejected,result:a.result});
  const strictTarget={equipment:{weapon:{score:50}},inventory:[],settings:{autoSell:[false,false,false,false,false,true],keepUpgrade:false}},strictRejected=[],strict=createGearAccumulator({target:strictTarget,reject:item=>strictRejected.push(item.id),score:item=>Number(item?.score)||0,notifyUpgrade:false,respectDisposition:true});strict.consider({id:"mythic-upgrade-no-keep",type:"weapon",q:5,score:99});const strictResult=strict.finalize();if(strictTarget.inventory.length!==0||strictRejected.join("|")!=="mythic-upgrade-no-keep"||strictResult.keptCount!==0)errors.push({code:"KEEP_UPGRADE_DISABLED",strictRejected,strictResult});
  if(a.target.equipment.weapon.score!==50||a.target.equipment.armor.score!==80||a.target.equipment.helmet.score!==100||a.target.equipment.shoes.score!==1||a.target.equipment.accessory.score!==10)errors.push({code:"TARGET_EQUIPMENT_MUTATED"});
  return Object.freeze({version:3,passed:errors.length===0,targetIsolation:true,deterministic:true,sharedDispositionOwner:true,allQualitySettings:true,errors:Object.freeze(errors)});
 }
 function runThirdWorldOfflinePerformanceIntegrity(){
  const errors=[],maxBattles=Math.floor(OFFLINE_MAX_MS/REAL_BATTLE_MIN_MS),expectedOpportunities=Math.round(maxBattles*OFFLINE_GEAR_RATE),all=countBernoulliHitsGeometric(10,.10,()=>0),none=countBernoulliHitsGeometric(100,.10,()=>.999999);
  if(maxBattles!==432000||expectedOpportunities!==43200)errors.push({code:"STRESS_PROFILE",maxBattles,expectedOpportunities});
  if(all!==10||none!==0||countBernoulliHitsGeometric(10,0,()=>0)!==0||countBernoulliHitsGeometric(10,1,()=>.5)!==10)errors.push({code:"GEOMETRIC_SAMPLER_BOUNDARY",all,none});
  return Object.freeze({version:1,passed:errors.length===0,algorithm:"geometric-skip",maxOfflineMs:OFFLINE_MAX_MS,minBattleMs:REAL_BATTLE_MIN_MS,maxTheoreticalBattles:maxBattles,gearRate:OFFLINE_GEAR_RATE,expectedGearOpportunitiesAtTheoreticalMax:expectedOpportunities,renderLimit:OFFLINE_GEAR_RENDER_LIMIT,errors:Object.freeze(errors)});
 }
 function validateThirdWorldOfflineSettlement(){
  const errors=[];if(Number(window.EQUIPMENT_AUTO_PROCESS_POLICY_VERSION)!==1||typeof window.equipmentDropDisposition!=="function")errors.push({code:"EQUIPMENT_AUTO_PROCESS_POLICY"});if(OFFLINE_GEAR_RATE!==.10)errors.push({code:"GEAR_RATE",rate:OFFLINE_GEAR_RATE});if(typeof window.makeThirdWorldEquipmentDrops!=="function"||window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY?.passed!==true)errors.push({code:"THIRD_WORLD_LOOT_OWNER"});if(THIRD_WORLD_TARGET_TYPE!=="higher-dimensional")errors.push({code:"TARGET_TYPE"});if(Number(window.OFFLINE_SAMPLE_OWNER_VERSION)!==1||typeof window.appendOfflineBattleSample!=="function")errors.push({code:"SAMPLE_OWNER"});if(Number(window.OFFLINE_RESET_OWNER_VERSION)!==1||typeof window.resetOfflineSaveState!=="function")errors.push({code:"RESET_OWNER"});if(Number(window.OFFLINE_LEGACY_SAMPLE_POLICY_VERSION)!==1||window.OFFLINE_SAMPLE_OWNER_INTEGRITY?.passed!==true)errors.push({code:"LEGACY_SAMPLE_POLICY"});if(window.OFFLINE_GEAR_ACCUMULATOR_INTEGRITY?.passed!==true)errors.push({code:"GEAR_ACCUMULATOR_TARGETING"});if(window.THIRD_WORLD_OFFLINE_PERFORMANCE_INTEGRITY?.passed!==true)errors.push({code:"PERFORMANCE_STRESS"});if(THIRD_WORLD_OFFLINE_STATE_ALLOWLIST.join("|")!=="inventory|offline")errors.push({code:"STATE_ALLOWLIST",allowlist:THIRD_WORLD_OFFLINE_STATE_ALLOWLIST});const source=Function.prototype.toString.call(grantThirdWorldOfflineRewards);if(/gainExp\(|gainEffectiveExp\(|dimensionalStrings\s*[+\-=]|coreLevel\s*[+\-=]|bosses\s*[+\-=]/.test(source))errors.push({code:"PROTECTED_PROGRESS_MUTATION_SOURCE"});if(!/snapshotStateOutsideAllowedRoots/.test(source)||!/inventoryPrefixSnapshot/.test(source))errors.push({code:"ALLOWLIST_GUARD_MISSING"});if(!/countBernoulliHitsGeometric/.test(source))errors.push({code:"W3_GEAR_SKIP_SAMPLER_MISSING"});return Object.freeze({version:6,passed:errors.length===0,gearRate:OFFLINE_GEAR_RATE,gearOnly:true,bossDamage:false,exp:false,dimensionalStrings:false,title:false,story:false,core:false,stateAllowlist:THIRD_WORLD_OFFLINE_STATE_ALLOWLIST,performanceVersion:THIRD_WORLD_OFFLINE_PERFORMANCE_VERSION,errors:Object.freeze(errors)});
 }
 window.OFFLINE_SAMPLE_SELECTION_VERSION=OFFLINE_SAMPLE_SELECTION_VERSION;
 window.OFFLINE_SAMPLES_PER_SPEED=OFFLINE_SAMPLES_PER_SPEED;
 window.convertOfflineSampleMsForSpeed=sampleAdjustedMsForSpeed;
 window.beginSecondWorldOfflineBattleSample=beginSecondWorldOfflineBattleSample;
 window.finishSecondWorldOfflineBattleSample=finishSecondWorldOfflineBattleSample;
 window.SECOND_WORLD_OFFLINE_SAMPLE_VERSION=1;
 window.SECOND_WORLD_OFFLINE_SETTLEMENT_VERSION=1;
 window.THIRD_WORLD_OFFLINE_SETTLEMENT_VERSION=1;
 window.OFFLINE_THREE_ERA_SETTLEMENT_VERSION=1;
 window.OFFLINE_GEAR_ACCUMULATOR_VERSION=OFFLINE_GEAR_ACCUMULATOR_VERSION;
 window.OFFLINE_GEAR_ACCUMULATOR_TARGET_VERSION=OFFLINE_GEAR_ACCUMULATOR_TARGET_VERSION;
 window.THIRD_WORLD_OFFLINE_ALLOWLIST_VERSION=THIRD_WORLD_OFFLINE_ALLOWLIST_VERSION;
 window.THIRD_WORLD_OFFLINE_STATE_ALLOWLIST=THIRD_WORLD_OFFLINE_STATE_ALLOWLIST;
 window.THIRD_WORLD_OFFLINE_PERFORMANCE_VERSION=THIRD_WORLD_OFFLINE_PERFORMANCE_VERSION;
 window.OFFLINE_GEAR_RENDER_LIMIT=OFFLINE_GEAR_RENDER_LIMIT;
 window.countOfflineBernoulliHitsGeometric=countBernoulliHitsGeometric;
 window.createOfflineGearAccumulator=createGearAccumulator;
 window.OFFLINE_GEAR_ACCUMULATOR_INTEGRITY=runGearAccumulatorRegression();
 window.THIRD_WORLD_OFFLINE_PERFORMANCE_INTEGRITY=runThirdWorldOfflinePerformanceIntegrity();
 window.OFFLINE_SECOND_WORLD_DARK_ENERGY_RATE=OFFLINE_SECOND_WORLD_DARK_ENERGY_RATE;
 window.OFFLINE_THIRD_WORLD_GEAR_RATE=OFFLINE_GEAR_RATE;
 window.grantSecondWorldOfflineRewards=grantSecondWorldOfflineRewards;
 window.grantThirdWorldOfflineRewards=grantThirdWorldOfflineRewards;
 window.resolveOfflineFarmTarget=resolveFarmTarget;
 window.OFFLINE_ENHANCEMENT_STONE_RATE=OFFLINE_ENHANCEMENT_STONE_RATE;
 window.offlineEnhancementStoneReward=offlineEnhancementStoneReward;
 window.OFFLINE_ENHANCEMENT_PIPELINE_VERSION=3;
 window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION=1;
 window.THIRD_WORLD_OFFLINE_SETTLEMENT_INTEGRITY=validateThirdWorldOfflineSettlement();
 if(!window.OFFLINE_GEAR_ACCUMULATOR_INTEGRITY.passed)console.error("[文明戰線] Offline gear accumulator integrity error",window.OFFLINE_GEAR_ACCUMULATOR_INTEGRITY.errors);
 if(!window.THIRD_WORLD_OFFLINE_PERFORMANCE_INTEGRITY.passed)console.error("[文明戰線] Third-world offline performance integrity error",window.THIRD_WORLD_OFFLINE_PERFORMANCE_INTEGRITY.errors);
 if(!window.THIRD_WORLD_OFFLINE_SETTLEMENT_INTEGRITY.passed)console.error("[文明戰線] Third-world offline settlement integrity error",window.THIRD_WORLD_OFFLINE_SETTLEMENT_INTEGRITY.errors);
 installSaveWrapper();
 settleOfflineOnLoad().finally(()=>installHeartbeat());
window.OFFLINE_PROGRESS_MAX_MS=OFFLINE_MAX_MS;
window.OFFLINE_PROGRESS_MAX_HOURS=OFFLINE_MAX_MS/(60*60*1000);
window.OFFLINE_DURATION_POLICY_VERSION=1;
})();
