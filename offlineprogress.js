(function(){
 const OFFLINE_MAX_MS=12*60*60*1000;
 const OFFLINE_MIN_MS=60*1000;
 const OFFLINE_EXP_RATE=.10;
 const OFFLINE_GOLD_RATE=.10;
 const OFFLINE_GEAR_RATE=.10;
 const OFFLINE_ENHANCEMENT_STONE_RATE=.05;
 const DEFAULT_BATTLE_MS=1800;
 const REAL_BATTLE_MIN_MS=100;
 const REAL_BATTLE_MAX_MS=601000;
 const OFFLINE_SAMPLES_PER_SPEED=8;
 const OFFLINE_SAMPLE_SELECTION_VERSION=2;
 const OFFLINE_COMBAT_SPEEDS=Object.freeze([1,1.5,2]);
 const OFFLINE_BATTLE_SAMPLE_VERSION=Math.max(1,Math.floor(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)||1));
 const CLOCK_ROLLBACK_TOLERANCE_MS=5*60*1000;
 const HEARTBEAT_MS=60*1000;
 const HEARTBEAT_PERSIST_MS=5*60*1000;
 const YIELD_EVERY=750;
 const baseSave=typeof save==="function"?save:null;
 let heartbeatTimer=null;
 let lastHeartbeatPersist=Date.now();
 let offlineSettlementBusy=false;

 function now(){return Date.now();}
 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function currentCombatSpeed(){
  const speed=typeof window.effectiveCombatSpeed==="function"?Number(window.effectiveCombatSpeed()):1;
  return [1,1.5,2].includes(speed)?speed:1;
 }
 function yieldThread(){return new Promise(resolve=>setTimeout(resolve,0));}
 function ensureOfflineState(){
  const t=now();
  if(!isObject(state.offline))state.offline={};
  const o=state.offline;
  const rawTime=o.lastSettledAt==null?NaN:Number(o.lastSettledAt);
  o.lastSettledAt=Number.isFinite(rawTime)&&rawTime>=0&&rawTime<=t?Math.floor(rawTime):t;
  const maxObserved=Number(o.maxObservedWallClock);
  o.maxObservedWallClock=Number.isFinite(maxObserved)&&maxObserved>=0?Math.floor(maxObserved):Math.max(o.lastSettledAt,t);
  const lockUntil=Number(o.timeLockUntil);
  o.timeLockUntil=Number.isFinite(lockUntil)&&lockUntil>0?Math.floor(lockUntil):0;
  const storedSampleVersion=Math.max(0,Math.floor(Number(o.battleSampleVersion)||0));
  if(storedSampleVersion!==OFFLINE_BATTLE_SAMPLE_VERSION){
   o.battleSamples=[];
   o.farmMap=null;o.farmEnemy=null;o.avgBattleMs=0;o.sampleCount=0;o.pendingSettlement=null;
  }
  o.battleSampleVersion=OFFLINE_BATTLE_SAMPLE_VERSION;
  const map=o.farmMap==null?NaN:Number(o.farmMap),enemy=o.farmEnemy==null?NaN:Number(o.farmEnemy);
  o.farmMap=Number.isInteger(map)&&map>=0&&map<MAPS.length?map:null;
  o.farmEnemy=Number.isInteger(enemy)&&enemy>=0&&enemy<=3?enemy:null;
  const avg=Number(o.avgBattleMs);
  o.avgBattleMs=Number.isFinite(avg)&&avg>=600&&avg<=60000?Math.round(avg):0;
  o.sampleCount=Math.max(0,Math.min(20,Math.floor(Number(o.sampleCount)||0)));
  if(o.sampleCount<=0||o.avgBattleMs<=0||o.farmMap==null||o.farmEnemy==null){o.farmMap=null;o.farmEnemy=null;o.avgBattleMs=0;o.sampleCount=0;}
  const validSamples=(Array.isArray(o.battleSamples)?o.battleSamples:[]).filter(row=>isObject(row)&&Number(row.sampleVersion)===OFFLINE_BATTLE_SAMPLE_VERSION&&OFFLINE_COMBAT_SPEEDS.includes(Number(row.combatSpeed))&&Number.isFinite(Number(row.actualMs))&&Number(row.actualMs)>=REAL_BATTLE_MIN_MS&&Number(row.actualMs)<=300000&&Number.isFinite(Number(row.cycleMs))&&Number(row.cycleMs)>=Number(row.actualMs)&&Number(row.cycleMs)<=REAL_BATTLE_MAX_MS&&Number.isFinite(Number(row.adjustedMs))&&Number(row.adjustedMs)>=REAL_BATTLE_MIN_MS&&Number(row.adjustedMs)<=REAL_BATTLE_MAX_MS);
  const keptSamples=[];
  OFFLINE_COMBAT_SPEEDS.forEach(speed=>{
   const matches=validSamples.map((row,index)=>({row,index})).filter(entry=>Number(entry.row.combatSpeed)===speed).slice(-OFFLINE_SAMPLES_PER_SPEED);
   keptSamples.push(...matches);
  });
  keptSamples.sort((a,b)=>a.index-b.index);
  o.battleSamples=keptSamples.map(entry=>entry.row);
  if(!isObject(o.pendingSettlement))o.pendingSettlement=null;
  return o;
 }
 function wallClockGuard(o,t=now()){
  const maxObserved=Math.max(0,Math.floor(Number(o.maxObservedWallClock)||0));
  const lockUntil=Math.max(0,Math.floor(Number(o.timeLockUntil)||0));
  if(t+CLOCK_ROLLBACK_TOLERANCE_MS<maxObserved){
   o.timeLockUntil=Math.max(lockUntil,maxObserved);
   o.pendingSettlement=null;
   o.lastSettledAt=t;
   return {blocked:true,released:false,until:o.timeLockUntil};
  }
  if(lockUntil>0){
   if(t<lockUntil){
    o.pendingSettlement=null;
    o.lastSettledAt=t;
    return {blocked:true,released:false,until:lockUntil};
   }
   o.timeLockUntil=0;
   o.pendingSettlement=null;
   o.lastSettledAt=t;
   o.maxObservedWallClock=Math.max(maxObserved,t);
   return {blocked:false,released:true,until:0};
  }
  if(t<maxObserved){
   o.pendingSettlement=null;
   o.lastSettledAt=t;
   return {blocked:true,released:false,until:maxObserved};
  }
  o.maxObservedWallClock=Math.max(maxObserved,t);
  return {blocked:false,released:false,until:0};
 }
 function checkpoint(ts=now(),persist=false){
  const t=Math.max(0,Math.floor(Number(ts)||now())),o=ensureOfflineState();
  wallClockGuard(o,t);
  o.lastSettledAt=t;
  if(persist&&baseSave)baseSave(false);
 }
 function legalFarmTarget(mapIdx,enemyIdx){
  const m=Number(mapIdx),e=Number(enemyIdx);
  if(!Number.isInteger(m)||m<0||m>=MAPS.length||!Number.isInteger(e)||e<0||e>3)return false;
  try{const monster=monsterObj(m,e);return !!monster&&monster.kind!=="boss";}catch(err){return false;}
 }
 function sampleAdjustedMsForSpeed(row,targetSpeed){
  const sourceSpeed=Number(row?.combatSpeed),speed=Number(targetSpeed);
  const actualMs=Number(row?.actualMs),cycleMs=Number(row?.cycleMs),multiplier=Math.max(0.01,Number(row?.multiplier)||1);
  if(!OFFLINE_COMBAT_SPEEDS.includes(sourceSpeed)||!OFFLINE_COMBAT_SPEEDS.includes(speed)||!Number.isFinite(actualMs)||actualMs<REAL_BATTLE_MIN_MS||!Number.isFinite(cycleMs)||cycleMs<actualMs)return 0;
  const fixedGap=Math.max(0,cycleMs-actualMs);
  const convertedActual=actualMs*(sourceSpeed/speed);
  const converted=(convertedActual+fixedGap)*multiplier;
  return Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(converted)));
 }
 function averageTargetMs(rows,targetSpeed){
  const values=(Array.isArray(rows)?rows:[]).map(row=>sampleAdjustedMsForSpeed(row,targetSpeed)).filter(ms=>ms>0);
  if(!values.length)return 0;
  return Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(values.reduce((sum,ms)=>sum+ms,0)/values.length)));
 }
 function retainSamplesBySpeed(rows){
  const kept=[];
  OFFLINE_COMBAT_SPEEDS.forEach(speed=>{
   const matches=(Array.isArray(rows)?rows:[]).map((row,index)=>({row,index})).filter(entry=>Number(entry.row?.sampleVersion)===OFFLINE_BATTLE_SAMPLE_VERSION&&Number(entry.row?.combatSpeed)===speed).slice(-OFFLINE_SAMPLES_PER_SPEED);
   kept.push(...matches);
  });
  kept.sort((a,b)=>a.index-b.index);
  return kept.map(entry=>entry.row);
 }
 function beginSecondWorldOfflineBattleSample(bossIndex,boss=null){
  const index=Math.floor(Number(bossIndex));
  const meta=boss&&typeof boss==="object"?boss:(typeof window.secondWorldBoss==="function"?window.secondWorldBoss(index):null);
  if(!meta||index<0||state?.secondWorld?.entered!==true)return null;
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return null;
  if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main"))return null;
  const combatSpeed=currentCombatSpeed();
  if(!OFFLINE_COMBAT_SPEEDS.includes(combatSpeed))return null;
  const token={startedAt:now(),interrupted:false,bossIndex:index,bossId:String(meta.id||""),playerLevel:Math.max(500,Math.floor(Number(state.level)||500)),enemyLevel:Math.max(505,Math.floor(Number(meta.level)||505)),combatSpeed,unsubscribe:null};
  if(typeof window.backgroundProgressOnEnvironmentChange==="function")token.unsubscribe=window.backgroundProgressOnEnvironmentChange(isBackground=>{if(isBackground)token.interrupted=true;});
  return token;
 }
 function finishSecondWorldOfflineBattleSample(token,result,gapMs=140){
  if(!token)return false;
  if(typeof token.unsubscribe==="function")token.unsubscribe();
  if(token.interrupted||result?.win!==true)return false;
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return false;
  if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main"))return false;
  const actualMs=Math.round(now()-Number(token.startedAt));
  if(!Number.isFinite(actualMs)||actualMs<REAL_BATTLE_MIN_MS||actualMs>300000)return false;
  const gap=Math.max(0,Math.round(Number(gapMs)||0)),cycleMs=actualMs+gap,adjustedMs=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,cycleMs));
  const o=ensureOfflineState();
  const rows=retainSamplesBySpeed(o.battleSamples);
  rows.push({sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:2,targetType:"boss",bossIndex:token.bossIndex,bossId:token.bossId,combatSpeed:token.combatSpeed,actualMs,cycleMs,adjustedMs,playerLevel:token.playerLevel,enemyLevel:token.enemyLevel,kind:"boss",multiplier:1,recordedAt:now()});
  o.battleSampleVersion=OFFLINE_BATTLE_SAMPLE_VERSION;
  o.battleSamples=retainSamplesBySpeed(rows);
  return true;
 }
 function resolveFarmTarget(){
  const o=ensureOfflineState(),speed=currentCombatSpeed();
  const rows=(Array.isArray(o.battleSamples)?o.battleSamples:[]).filter(row=>Number(row?.sampleVersion)===OFFLINE_BATTLE_SAMPLE_VERSION&&legalFarmTarget(Math.floor(Number(row?.map)),Math.floor(Number(row?.enemy))));
  if(!rows.length)return null;
  const exactRows=rows.filter(row=>Number(row?.combatSpeed)===speed);
  const latest=(exactRows.length?exactRows:rows)[(exactRows.length?exactRows:rows).length-1];
  const map=Math.floor(Number(latest?.map)),enemy=Math.floor(Number(latest?.enemy));
  const sameTarget=rows.filter(row=>Math.floor(Number(row?.map))===map&&Math.floor(Number(row?.enemy))===enemy);
  const exactTarget=sameTarget.filter(row=>Number(row?.combatSpeed)===speed);
  const avg=averageTargetMs(exactTarget.length?exactTarget:sameTarget,speed);
  if(avg<=0)return null;
  return {map,enemy,avgBattleMs:avg,combatSpeed:speed,fallbackSpeed:exactTarget.length?null:Number(latest?.combatSpeed)||null};
 }
 function formatDuration(ms){
  const total=Math.max(0,Math.floor(ms/60000)),h=Math.floor(total/60),m=total%60;
  if(h>0&&m>0)return `${h} 小時 ${m} 分`;
  if(h>0)return `${h} 小時`;
  if(total>0)return `${total} 分`;
  return `${Math.max(1,Math.floor(ms/1000))} 秒`;
 }
 function farmEnemyObject(target){
  try{const full=monsterObj(target.map,target.enemy);return full?.kind==="boss"?null:full;}catch(e){return null;}
 }
 function offlineSellValue(item){return typeof specializationSellValue==="function"?specializationSellValue(item):Math.max(0,Math.floor(Number(item?.sell)||0));}
 function normalizeOfflineDrop(item){if(item&&typeof item==="object"&&typeof item.locked!=="boolean")item.locked=false;return item;}
 function expSnapshot(){
  const level=clampGameLevel(state.level),exp=Math.max(0,Math.floor(Number(state.exp)||0));
  return {level,exp,need:Math.max(1,Math.floor(Number(expNeed(level))||1))};
 }
 function offlineEnhancementStoneReward(enemy,battleCount,playerLevel){
  const count=Math.max(0,Math.floor(Number(battleCount)||0));
  if(!enemy||count<1||typeof expectedMainlineEnhancementStoneReward!=="function")return {basic:0,advanced:0};
  const expected=expectedMainlineEnhancementStoneReward(enemy,playerLevel);
  return {basic:Math.floor(Math.max(0,Number(expected?.basic)||0)*count*OFFLINE_ENHANCEMENT_STONE_RATE),advanced:0};
 }
 function normalizePending(raw){
  const speed=currentCombatSpeed();
  if(!isObject(raw)||Number(raw.sampleVersion)!==OFFLINE_BATTLE_SAMPLE_VERSION||Number(raw.combatSpeed)!==speed)return null;
  const map=Math.floor(Number(raw.map)),enemy=Math.floor(Number(raw.enemy));
  const avg=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(Number(raw.avgBattleMs)||DEFAULT_BATTLE_MS)));
  const elapsedRaw=Math.max(0,Number(raw.elapsedRaw)||0),elapsedUsed=Math.min(OFFLINE_MAX_MS,Math.max(0,Number(raw.elapsedUsed)||0));
  const battles=Math.max(0,Math.min(Math.floor(elapsedUsed/avg),Math.floor(Number(raw.battles)||0)));
  if(elapsedRaw<OFFLINE_MIN_MS||!legalFarmTarget(map,enemy)||battles<1)return null;
  return {sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,combatSpeed:speed,map,enemy,avgBattleMs:avg,elapsedRaw,elapsedUsed,battles,createdAt:Math.max(0,Number(raw.createdAt)||now())};
 }
 function buildPendingSettlement(){
  const o=ensureOfflineState(),t=now(),clock=wallClockGuard(o,t);
  if(clock.blocked||clock.released){if(baseSave)baseSave(false);return null;}
  const existing=normalizePending(o.pendingSettlement);
  if(existing)return existing;
  o.pendingSettlement=null;
  const elapsedRaw=Math.max(0,t-o.lastSettledAt);
  if(elapsedRaw<OFFLINE_MIN_MS){o.lastSettledAt=t;if(baseSave)baseSave(false);return null;}
  const target=resolveFarmTarget();
  if(!target){
   o.lastSettledAt=t;
   o.maxObservedWallClock=Math.max(Number(o.maxObservedWallClock)||0,t);
   if(baseSave)baseSave(false);
   return {unavailable:true,elapsedRaw,elapsedUsed:Math.min(OFFLINE_MAX_MS,elapsedRaw),createdAt:t};
  }
  const elapsedUsed=Math.min(OFFLINE_MAX_MS,elapsedRaw);
  const avg=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(Number(target.avgBattleMs)||DEFAULT_BATTLE_MS)));
  const battles=Math.max(0,Math.floor(elapsedUsed/avg));
  if(battles<1)return null;
  const pending={sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,combatSpeed:target.combatSpeed,map:target.map,enemy:target.enemy,avgBattleMs:avg,elapsedRaw,elapsedUsed,battles,createdAt:t};
  o.pendingSettlement=pending;
  if(baseSave)baseSave(false);
  return pending;
 }
 async function grantOfflineRewards(pending,enemy){
  const count=Math.max(0,Math.floor(Number(pending.battles)||0));
  const settlementPlayerLevel=Math.max(1,Math.floor(Number(state.level)||1));
  let xpCarry=0,goldCarry=0,convertedCarry=0,totalXp=0;
  const expBefore=expSnapshot();
  const bestByType=new Map(),mythics=[];
  let eligibleRolls=0,droppedCount=0,soldCount=0,soldGold=0,saleStones=normalizeEnhancementStoneReward(null);
  function sell(item){if(!item)return;soldCount++;soldGold+=offlineSellValue(item);saleStones=mergeEnhancementStoneRewards(saleStones,enhancementStoneSaleReward(item));}
  function consider(item){
   item=normalizeOfflineDrop(item);if(!item)return;
   droppedCount++;
   if(Number(item.q)===5){mythics.push(item);return;}
   const type=item.type;
   if(!EQUIPMENT_TYPES.includes(type)){sell(item);return;}
   const previous=bestByType.get(type);
   if(!previous||equipmentScore(item)>equipmentScore(previous)){if(previous)sell(previous);bestByType.set(type,item);}else sell(item);
  }
  for(let i=0;i<count;i++){
   goldCarry+=Math.max(0,Number(goldReward(enemy))||0)*OFFLINE_GOLD_RATE;
   const xpValue=Math.max(0,Number(expReward(enemy))||0)*OFFLINE_EXP_RATE;
   if(state.level>=MAX_LEVEL)convertedCarry+=xpValue;
   else{
    xpCarry+=xpValue;
    const grant=Math.floor(xpCarry);
    if(grant>0){xpCarry-=grant;totalXp+=grant;gainExp(grant,[]);}
   }
   if(Math.random()<OFFLINE_GEAR_RATE){
    eligibleRolls++;
    let encounter=null;
    try{encounter=typeof createMonsterEncounter==="function"?createMonsterEncounter(pending.map,pending.enemy):monsterObj(pending.map,pending.enemy);}catch(e){encounter=null;}
    if(encounter&&encounter.kind!=="boss"){const item=typeof dropItem==="function"?dropItem(encounter,pending.map):null;if(item)consider(item);}
   }
   if((i+1)%YIELD_EVERY===0)await yieldThread();
  }
  const keptOrdinary=[];
  bestByType.forEach((item,type)=>{const current=state.equipment?.[type]||null;if(equipmentScore(item)>equipmentScore(current))keptOrdinary.push(item);else sell(item);});
  keptOrdinary.forEach(item=>state.inventory.push(item));
  mythics.forEach(item=>state.inventory.push(item));
  if(keptOrdinary.length)upgradeDropNoticePending=true;
  const directGold=Math.floor(goldCarry),convertedGold=Math.floor(convertedCarry);
  state.gold+=directGold+convertedGold+soldGold;
  const battleStones=offlineEnhancementStoneReward(enemy,count,settlementPlayerLevel);
  const totalStones=mergeEnhancementStoneRewards(battleStones,saleStones);
  if(totalStones.basic||totalStones.advanced)addEnhancementStones(totalStones.basic,totalStones.advanced);
  if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else state.hp=playerCombatStats().hp;
  return {totalXp,totalGold:directGold+convertedGold+soldGold,directGold,convertedGold,expProgress:{before:expBefore,after:expSnapshot()},enhancement:{battleBasic:battleStones.basic,saleBasic:saleStones.basic,saleAdvanced:saleStones.advanced,totalBasic:totalStones.basic,totalAdvanced:totalStones.advanced},gear:{eligibleRolls,droppedCount,soldCount,soldGold,keptOrdinary,mythics,keptCount:keptOrdinary.length+mythics.length}};
 }
 function ensureOfflineModals(){
  if(!document.getElementById("offline-reward-styles")){
   const style=document.createElement("style");style.id="offline-reward-styles";
   style.textContent=`body.offline-result-open{overflow:hidden}#offlineRewardPage{position:fixed;inset:0;z-index:10000;display:none;overflow:auto;background:linear-gradient(180deg,#090d12 0%,#111820 100%);padding:max(20px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));box-sizing:border-box}#offlineRewardPage.show{display:block}.offline-page-shell{width:min(760px,100%);min-height:100%;margin:0 auto;display:flex;flex-direction:column;justify-content:center}.offline-page-card{border:1px solid #38424e;border-radius:18px;background:#121920;box-shadow:0 18px 60px rgba(0,0,0,.38);padding:24px}.offline-page-title{text-align:center;color:#f0d494;font-size:clamp(25px,5vw,36px);margin:0}.offline-page-welcome{text-align:center;color:#aeb9c5;margin-top:7px}.offline-duration{text-align:center;font-size:clamp(24px,6vw,40px);font-weight:800;margin:14px 0 22px;color:#fff}.offline-section{border:1px solid #303a45;border-radius:14px;background:#0e141a;padding:16px;margin-top:12px}.offline-section-title{font-weight:800;color:#d9e0e8;font-size:15px}.offline-battle-count{font-size:30px;font-weight:850;margin-top:6px}.offline-enemy-line{color:#c4ced8;margin-top:5px;line-height:1.5}.offline-reward-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.offline-reward-card{border:1px solid #3a4551;border-radius:14px;background:#0d1319;padding:18px;text-align:center;min-width:0}.offline-reward-label{font-size:14px;color:#aeb9c5;font-weight:700}.offline-reward-value{font-size:clamp(27px,5vw,38px);font-weight:900;margin-top:5px;overflow-wrap:anywhere}.offline-exp-progress{margin-top:10px;color:#c8d1da;font-size:14px;line-height:1.45}.offline-exp-progress .arrow{display:block;color:#8f9aa6;line-height:1.15}.offline-gear-summary{margin-top:8px;font-weight:700;line-height:1.6}.offline-gear-list{margin-top:10px;border-top:1px solid #303841;padding-top:4px}.offline-gear-row{padding:10px 0;border-bottom:1px solid #2c333b}.offline-gear-row:last-child{border-bottom:0;padding-bottom:2px}.offline-limit-note{text-align:center;color:#8f9aa6;font-size:13px;line-height:1.5;margin-top:14px}.offline-enter-controls{margin-top:18px}.offline-enter-controls .btn{width:100%;min-height:48px;font-size:16px;font-weight:800}#offlineCalculatingModal{z-index:10001}#offlineCalculatingModal .modal-box{width:min(360px,100%);text-align:center}#offlineCalculatingModal .muted{line-height:1.6}@media(max-width:560px){.offline-page-shell{justify-content:flex-start}.offline-page-card{padding:18px 14px;border-radius:14px}.offline-reward-grid{grid-template-columns:1fr}.offline-duration{margin-bottom:16px}.offline-section{padding:14px}.offline-battle-count{font-size:27px}}`;
   document.head.appendChild(style);
  }
  if(!document.getElementById("offlineRewardPage")){
   const page=document.createElement("div");page.id="offlineRewardPage";
   page.innerHTML=`<div class="offline-page-shell"><div class="offline-page-card"><h2 class="offline-page-title">離線收益結算</h2><div class="offline-page-welcome">歡迎回來</div><div id="offlineRewardDetail"></div><div class="offline-enter-controls"><button class="btn primary" onclick="closeOfflineRewardModal()">進入遊戲</button></div></div></div>`;
   document.body.appendChild(page);
  }
  if(!document.getElementById("offlineCalculatingModal")){
   const modal=document.createElement("div");modal.className="modal";modal.id="offlineCalculatingModal";
   modal.innerHTML=`<div class="modal-box"><h3 style="color:#f0d494;margin-top:0">整理離線收益</h3><div class="muted">正在結算離線期間的 EXP、金幣與裝備。</div></div>`;
   document.body.appendChild(modal);
  }
 }
 function setCalculatingVisible(show){ensureOfflineModals();document.getElementById("offlineCalculatingModal")?.classList.toggle("show",!!show);}
 function offlineGearHtml(gear){
  if(!gear)return "";
  const kept=[...(gear.keptOrdinary||[]),...(gear.mythics||[])];
  const keptHtml=kept.length?`<div class="offline-gear-list">${kept.map(item=>`<div class="offline-gear-row">${itemHtml(item,true)}${typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):""}</div>`).join("")}</div>`:`<div class="muted" style="margin-top:8px">本次沒有留下裝備。</div>`;
  return `<div class="offline-section"><div class="offline-section-title">裝備</div><div class="offline-gear-summary">共取得 ${gear.droppedCount.toLocaleString()} 件　自動出售 ${gear.soldCount.toLocaleString()} 件</div>${keptHtml}</div>`;
 }
 function expProgressHtml(progress){
  if(!progress?.before||!progress?.after)return "";
  const before=progress.before,after=progress.after;
  return `<div class="offline-exp-progress"><div>Lv.${before.level}　${before.exp.toLocaleString()} / ${before.need.toLocaleString()}</div><span class="arrow">↓</span><div>Lv.${after.level}　${after.exp.toLocaleString()} / ${after.need.toLocaleString()}</div></div>`;
 }
 function showOfflineSampleUnavailable(info){
  ensureOfflineModals();
  const detail=document.getElementById("offlineRewardDetail"),page=document.getElementById("offlineRewardPage");
  if(!detail||!page)return;
  detail.innerHTML=`<div class="offline-duration">離線 ${formatDuration(info?.elapsedUsed||info?.elapsedRaw||0)}</div><div class="offline-section"><div class="offline-section-title">尚無可用的主線實戰樣本</div><div class="offline-enemy-line" style="margin-top:10px">完成一場符合條件的主線普通／菁英戰鬥後，即可建立離線收益基準。Boss、副本與背景 catch-up 不會建立此樣本。</div><div class="muted" style="margin-top:10px;line-height:1.6">本次離線區段因沒有可計算的實戰基準而不發放收益，已建立新的離線起點；之後只要有有效樣本，離線結算就會正常出現。</div></div>`;
  document.body.classList.add("offline-result-open");
  page.classList.add("show");
 }
 function showOfflineResult(result){
  if(!result)return;
  ensureOfflineModals();
  const detail=document.getElementById("offlineRewardDetail"),page=document.getElementById("offlineRewardPage");
  if(!detail||!page)return;
  const enemyLevel=Math.max(1,Math.floor(Number(result.enemyLevel)||1));
  const capNote=result.elapsedRaw>OFFLINE_MAX_MS?`<div class="offline-limit-note">本次離線超過 12 小時，僅計算前 12 小時。</div>`:`<div class="offline-limit-note">離線收益最多計算 12 小時</div>`;
  const enhancement=result.enhancement||{battleBasic:0,saleBasic:0,saleAdvanced:0,totalBasic:0,totalAdvanced:0};
  const stoneSaleParts=[enhancement.saleBasic?`基礎強化石 +${enhancement.saleBasic.toLocaleString()}`:"",enhancement.saleAdvanced?`進階強化石 +${enhancement.saleAdvanced.toLocaleString()}`:""].filter(Boolean);
  const stoneSaleNote=stoneSaleParts.length?`<div class="muted" style="margin-top:8px">離線出售裝備另獲得 ${stoneSaleParts.join("、")}</div>`:"";
  detail.innerHTML=`<div class="offline-duration">離線 ${formatDuration(result.elapsedUsed)}</div><div class="offline-section"><div class="offline-section-title">戰鬥場次</div><div class="offline-battle-count">${result.battles.toLocaleString()} 場</div><div class="offline-enemy-line">Lv.${enemyLevel} ${result.enemyName||"主線敵人"} × ${result.battles.toLocaleString()}</div></div><div class="offline-reward-grid"><div class="offline-reward-card"><div class="offline-reward-label">EXP</div><div class="offline-reward-value">+${result.totalXp.toLocaleString()}</div>${expProgressHtml(result.expProgress)}</div><div class="offline-reward-card"><div class="offline-reward-label">金幣</div><div class="offline-reward-value">+${result.totalGold.toLocaleString()}</div></div><div class="offline-reward-card"><div class="offline-reward-label">基礎強化石</div><div class="offline-reward-value">+${Math.max(0,Number(enhancement.battleBasic)||0).toLocaleString()}</div><div class="muted" style="margin-top:6px">離線戰鬥收益 5%</div></div></div>${offlineGearHtml(result.gear)}${stoneSaleNote}${capNote}`;
  document.body.classList.add("offline-result-open");
  page.classList.add("show");
 }
 window.closeOfflineRewardModal=function(){document.getElementById("offlineRewardPage")?.classList.remove("show");document.body.classList.remove("offline-result-open");if(typeof render==="function")render();};
 async function settleOfflineOnLoad(){
  if(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()){
   const o=ensureOfflineState(),t=now();
   o.farmMap=null;o.farmEnemy=null;o.avgBattleMs=0;o.sampleCount=0;o.battleSamples=[];o.pendingSettlement=null;o.lastSettledAt=t;o.maxObservedWallClock=Math.max(Number(o.maxObservedWallClock)||0,t);
   if(baseSave)baseSave(false);
   return;
  }
  const pending=buildPendingSettlement();
  if(!pending)return;
  if(pending.unavailable){showOfflineSampleUnavailable(pending);return;}
  const enemy=farmEnemyObject(pending);
  if(!enemy)return;
  const rollbackSnapshot=JSON.stringify(state);
  offlineSettlementBusy=true;
  setCalculatingVisible(true);
  await yieldThread();
  try{
   const rewards=await grantOfflineRewards(pending,enemy);
   const result={elapsedRaw:pending.elapsedRaw,elapsedUsed:pending.elapsedUsed,battles:pending.battles,enemyName:enemy.name||"主線敵人",enemyLevel:enemy.level,...rewards};
   const o=ensureOfflineState(),t=now();o.pendingSettlement=null;o.lastSettledAt=t;o.maxObservedWallClock=Math.max(Number(o.maxObservedWallClock)||0,t);
   if(baseSave)baseSave(false);
   setCalculatingVisible(false);showOfflineResult(result);
  }catch(err){
   console.error("Offline settlement failed",err);setCalculatingVisible(false);
   try{state=JSON.parse(rollbackSnapshot);if(typeof normalizeCurrentSaveState==="function")normalizeCurrentSaveState();if(typeof render==="function")render();}catch(rollbackError){console.error("Offline rollback failed",rollbackError);location.reload();return;}
   alert("離線收益整理發生錯誤；本次區段已保留，重新整理後會再次嘗試結算。");
  }finally{offlineSettlementBusy=false;}
 }
 function installSaveWrapper(){
  if(!baseSave)return;
  const wrapped=function(show=true){if(offlineSettlementBusy)return true;checkpoint(now(),false);return baseSave(show);};
  try{save=wrapped;}catch(e){}
  window.save=wrapped;
 }
 function persistForegroundCheckpoint(){if(offlineSettlementBusy)return;checkpoint(now(),false);if(baseSave)baseSave(false);lastHeartbeatPersist=now();}
 function installHeartbeat(){
  if(heartbeatTimer)clearInterval(heartbeatTimer);
  heartbeatTimer=setInterval(()=>{
   if(offlineSettlementBusy)return;
   const background=typeof window.backgroundProgressEnvironmentIsBackground==="function"?window.backgroundProgressEnvironmentIsBackground():document.visibilityState==="hidden";
   if(background)return;
   checkpoint(now(),false);
   if(now()-lastHeartbeatPersist>=HEARTBEAT_PERSIST_MS&&baseSave){baseSave(false);lastHeartbeatPersist=now();}
  },HEARTBEAT_MS);
  if(typeof window.backgroundProgressOnEnvironmentChange==="function")window.backgroundProgressOnEnvironmentChange(()=>persistForegroundCheckpoint());
  if(typeof window.backgroundProgressOnPageHide==="function")window.backgroundProgressOnPageHide(()=>persistForegroundCheckpoint());
 }
 window.OFFLINE_SAMPLE_SELECTION_VERSION=OFFLINE_SAMPLE_SELECTION_VERSION;
 window.OFFLINE_SAMPLES_PER_SPEED=OFFLINE_SAMPLES_PER_SPEED;
 window.convertOfflineSampleMsForSpeed=sampleAdjustedMsForSpeed;
 window.beginSecondWorldOfflineBattleSample=beginSecondWorldOfflineBattleSample;
 window.finishSecondWorldOfflineBattleSample=finishSecondWorldOfflineBattleSample;
 window.SECOND_WORLD_OFFLINE_SAMPLE_VERSION=1;
 window.resolveOfflineFarmTarget=resolveFarmTarget;
 window.OFFLINE_ENHANCEMENT_STONE_RATE=OFFLINE_ENHANCEMENT_STONE_RATE;
 window.offlineEnhancementStoneReward=offlineEnhancementStoneReward;
 window.OFFLINE_ENHANCEMENT_PIPELINE_VERSION=3;
 window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION=1;
 installSaveWrapper();
 settleOfflineOnLoad().finally(()=>installHeartbeat());
})();
