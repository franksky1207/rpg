(function(){
 const OFFLINE_MAX_MS=12*60*60*1000;
 const OFFLINE_MIN_MS=60*1000;
 const OFFLINE_EXP_RATE=.10;
 const OFFLINE_GOLD_RATE=.10;
 const OFFLINE_GEAR_RATE=.10;
 const OFFLINE_DUNGEON_RATE=.10;
 const DEFAULT_BATTLE_MS=1800;
 const REAL_BATTLE_MIN_MS=100;
 const REAL_BATTLE_MAX_MS=600000;
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
  const map=o.farmMap==null?NaN:Number(o.farmMap),enemy=o.farmEnemy==null?NaN:Number(o.farmEnemy);
  o.farmMap=Number.isInteger(map)&&map>=0&&map<MAPS.length?map:null;
  o.farmEnemy=Number.isInteger(enemy)&&enemy>=0&&enemy<=3?enemy:null;
  const avg=Number(o.avgBattleMs);
  o.avgBattleMs=Number.isFinite(avg)&&avg>=600&&avg<=60000?Math.round(avg):0;
  o.sampleCount=Math.max(0,Math.min(20,Math.floor(Number(o.sampleCount)||0)));
  if(o.sampleCount<=0||o.avgBattleMs<=0||o.farmMap==null||o.farmEnemy==null){o.farmMap=null;o.farmEnemy=null;o.avgBattleMs=0;o.sampleCount=0;}
  o.battleSamples=(Array.isArray(o.battleSamples)?o.battleSamples:[]).filter(row=>isObject(row)&&Number.isFinite(Number(row.adjustedMs))&&Number(row.adjustedMs)>=REAL_BATTLE_MIN_MS&&Number(row.adjustedMs)<=REAL_BATTLE_MAX_MS).slice(-20);
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
 function realBattleAverageMs(o){
  const rows=Array.isArray(o?.battleSamples)?o.battleSamples:[];
  if(!rows.length)return 0;
  let total=0,count=0;
  rows.forEach(row=>{const ms=Number(row?.adjustedMs);if(Number.isFinite(ms)&&ms>=REAL_BATTLE_MIN_MS&&ms<=REAL_BATTLE_MAX_MS){total+=ms;count++;}});
  return count?Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(total/count))):0;
 }
 function resolveFarmTarget(){
  const o=ensureOfflineState();
  const rows=Array.isArray(o.battleSamples)?o.battleSamples:[];
  const latest=rows.length?rows[rows.length-1]:null;
  const map=Math.floor(Number(latest?.map)),enemy=Math.floor(Number(latest?.enemy));
  const realAvg=realBattleAverageMs(o);
  if(realAvg>0&&legalFarmTarget(map,enemy))return {map,enemy,avgBattleMs:realAvg};
  if(o.sampleCount>0&&o.avgBattleMs>0&&legalFarmTarget(o.farmMap,o.farmEnemy))return {map:o.farmMap,enemy:o.farmEnemy,avgBattleMs:o.avgBattleMs};
  return null;
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
 function offlineDungeonProgressForBattle(enemy){
  if(typeof calculateDungeonBattleProgress!=="function")return 0;
  const playerLevel=clampGameLevel(state.level),playerMaxHp=Math.max(1,baseHP(playerLevel));
  const normal=calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:Math.max(0,Number(enemy?.hp)||0),playerLevel,playerMaxHp,startHp:playerMaxHp,endHp:playerMaxHp});
  return Math.max(0,Number(normal)||0)*OFFLINE_DUNGEON_RATE;
 }
 function normalizePending(raw){
  if(!isObject(raw))return null;
  const map=Math.floor(Number(raw.map)),enemy=Math.floor(Number(raw.enemy));
  const avg=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(Number(raw.avgBattleMs)||DEFAULT_BATTLE_MS)));
  const elapsedRaw=Math.max(0,Number(raw.elapsedRaw)||0),elapsedUsed=Math.min(OFFLINE_MAX_MS,Math.max(0,Number(raw.elapsedUsed)||0));
  const battles=Math.max(0,Math.min(Math.floor(elapsedUsed/avg),Math.floor(Number(raw.battles)||0)));
  if(elapsedRaw<OFFLINE_MIN_MS||!legalFarmTarget(map,enemy)||battles<1)return null;
  return {map,enemy,avgBattleMs:avg,elapsedRaw,elapsedUsed,battles,createdAt:Math.max(0,Number(raw.createdAt)||now())};
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
  if(!target)return null;
  const elapsedUsed=Math.min(OFFLINE_MAX_MS,elapsedRaw);
  const avg=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(Number(target.avgBattleMs)||DEFAULT_BATTLE_MS)));
  const battles=Math.max(0,Math.floor(elapsedUsed/avg));
  if(battles<1)return null;
  const pending={map:target.map,enemy:target.enemy,avgBattleMs:avg,elapsedRaw,elapsedUsed,battles,createdAt:t};
  o.pendingSettlement=pending;
  if(baseSave)baseSave(false);
  return pending;
 }
 async function grantOfflineRewards(pending,enemy){
  const count=Math.max(0,Math.floor(Number(pending.battles)||0));
  let xpCarry=0,goldCarry=0,convertedCarry=0,totalXp=0,totalDungeonProgress=0;
  const expBefore=expSnapshot();
  const bestByType=new Map(),mythics=[];
  let eligibleRolls=0,droppedCount=0,soldCount=0,soldGold=0;
  function sell(item){if(!item)return;soldCount++;soldGold+=offlineSellValue(item);}
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
   totalDungeonProgress+=offlineDungeonProgressForBattle(enemy);
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
  const dungeonResult=typeof addDungeonProgress==="function"?addDungeonProgress(totalDungeonProgress):{added:0,gainedAttempts:0};
  const directGold=Math.floor(goldCarry),convertedGold=Math.floor(convertedCarry);
  state.gold+=directGold+convertedGold+soldGold;
  if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else state.hp=playerCombatStats().hp;
  return {totalXp,totalGold:directGold+convertedGold+soldGold,directGold,convertedGold,expProgress:{before:expBefore,after:expSnapshot()},dungeonProgress:{added:Math.max(0,Number(dungeonResult?.added)||0),gainedAttempts:Math.max(0,Math.floor(Number(dungeonResult?.gainedAttempts)||0))},gear:{eligibleRolls,droppedCount,soldCount,soldGold,keptOrdinary,mythics,keptCount:keptOrdinary.length+mythics.length}};
 }
 function ensureOfflineModals(){
  if(!document.getElementById("offline-reward-styles")){
   const style=document.createElement("style");style.id="offline-reward-styles";
   style.textContent=`body.offline-result-open{overflow:hidden}#offlineRewardPage{position:fixed;inset:0;z-index:10000;display:none;overflow:auto;background:linear-gradient(180deg,#090d12 0%,#111820 100%);padding:max(20px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));box-sizing:border-box}#offlineRewardPage.show{display:block}.offline-page-shell{width:min(760px,100%);min-height:100%;margin:0 auto;display:flex;flex-direction:column;justify-content:center}.offline-page-card{border:1px solid #38424e;border-radius:18px;background:#121920;box-shadow:0 18px 60px rgba(0,0,0,.38);padding:24px}.offline-page-title{text-align:center;color:#f0d494;font-size:clamp(25px,5vw,36px);margin:0}.offline-page-welcome{text-align:center;color:#aeb9c5;margin-top:7px}.offline-duration{text-align:center;font-size:clamp(24px,6vw,40px);font-weight:800;margin:14px 0 22px;color:#fff}.offline-section{border:1px solid #303a45;border-radius:14px;background:#0e141a;padding:16px;margin-top:12px}.offline-section-title{font-weight:800;color:#d9e0e8;font-size:15px}.offline-battle-count{font-size:30px;font-weight:850;margin-top:6px}.offline-enemy-line{color:#c4ced8;margin-top:5px;line-height:1.5}.offline-reward-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.offline-reward-card{border:1px solid #3a4551;border-radius:14px;background:#0d1319;padding:18px;text-align:center;min-width:0}.offline-reward-label{font-size:14px;color:#aeb9c5;font-weight:700}.offline-reward-value{font-size:clamp(27px,5vw,38px);font-weight:900;margin-top:5px;overflow-wrap:anywhere}.offline-exp-progress{margin-top:10px;color:#c8d1da;font-size:14px;line-height:1.45}.offline-exp-progress .arrow{display:block;color:#8f9aa6;line-height:1.15}.offline-gear-summary{margin-top:8px;font-weight:700;line-height:1.6}.offline-gear-list{margin-top:10px;border-top:1px solid #303841;padding-top:4px}.offline-gear-row{padding:10px 0;border-bottom:1px solid #2c333b}.offline-gear-row:last-child{border-bottom:0;padding-bottom:2px}.offline-limit-note{text-align:center;color:#8f9aa6;font-size:13px;line-height:1.5;margin-top:14px}.offline-enter-controls{margin-top:18px}.offline-enter-controls .btn{width:100%;min-height:48px;font-size:16px;font-weight:800}#offlineCalculatingModal{z-index:10001}#offlineCalculatingModal .modal-box{width:min(360px,100%);text-align:center}#offlineCalculatingModal .muted{line-height:1.6}@media(max-width:560px){.offline-page-shell{justify-content:flex-start}.offline-page-card{padding:18px 14px;border-radius:14px}.offline-reward-grid{grid-template-columns:1fr}.offline-duration{margin-bottom:16px}.offline-section{padding:14px}.offline-battle-count{font-size:27px}}`;
   document.head.appendChild(style);
  }
  if(!document.getElementById("offlineRewardPage")){
   const page=document.createElement("div");page.id="offlineRewardPage";
   page.innerHTML=`<div class="offline-page-shell"><div class="offline-page-card"><h2 class="offline-page-title">離線收益結算</h2><div class="offline-page-welcome">歡迎回來</div><div id="offlineRewardDetail"></div><div class="offline-enter-controls"><button class="btn primary" onclick="closeOfflineRewardModal()">領取並進入遊戲</button></div></div></div>`;
   document.body.appendChild(page);
  }
  if(!document.getElementById("offlineCalculatingModal")){
   const modal=document.createElement("div");modal.className="modal";modal.id="offlineCalculatingModal";
   modal.innerHTML=`<div class="modal-box"><h3 style="color:#f0d494;margin-top:0">整理離線收益</h3><div class="muted">正在結算離線期間的 EXP、金幣、裝備與副本進度。</div></div>`;
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
 function formatProgress(value){const n=Math.max(0,Number(value)||0);return Number(n.toFixed(2)).toLocaleString();}
 function offlineDungeonHtml(progress){
  if(!progress)return "";
  const gained=Math.max(0,Math.floor(Number(progress.gainedAttempts)||0));
  return `<div class="offline-section"><div class="offline-section-title">副本進度</div><div class="offline-gear-summary">+${formatProgress(progress.added)}${gained>0?`　獲得 ${gained} 次挑戰`:""}</div></div>`;
 }
 function showOfflineResult(result){
  if(!result)return;
  ensureOfflineModals();
  const detail=document.getElementById("offlineRewardDetail"),page=document.getElementById("offlineRewardPage");
  if(!detail||!page)return;
  const enemyLevel=Math.max(1,Math.floor(Number(result.enemyLevel)||1));
  const capNote=result.elapsedRaw>OFFLINE_MAX_MS?`<div class="offline-limit-note">本次離線超過 12 小時，僅計算前 12 小時。</div>`:`<div class="offline-limit-note">離線收益最多計算 12 小時</div>`;
  detail.innerHTML=`<div class="offline-duration">離線 ${formatDuration(result.elapsedUsed)}</div><div class="offline-section"><div class="offline-section-title">戰鬥場次</div><div class="offline-battle-count">${result.battles.toLocaleString()} 場</div><div class="offline-enemy-line">Lv.${enemyLevel} ${result.enemyName||"主線敵人"} × ${result.battles.toLocaleString()}</div></div><div class="offline-reward-grid"><div class="offline-reward-card"><div class="offline-reward-label">EXP</div><div class="offline-reward-value">+${result.totalXp.toLocaleString()}</div>${expProgressHtml(result.expProgress)}</div><div class="offline-reward-card"><div class="offline-reward-label">金幣</div><div class="offline-reward-value">+${result.totalGold.toLocaleString()}</div></div></div>${offlineDungeonHtml(result.dungeonProgress)}${offlineGearHtml(result.gear)}${capNote}`;
  document.body.classList.add("offline-result-open");
  page.classList.add("show");
 }
 window.closeOfflineRewardModal=function(){document.getElementById("offlineRewardPage")?.classList.remove("show");document.body.classList.remove("offline-result-open");if(typeof render==="function")render();};
 async function settleOfflineOnLoad(){
  const pending=buildPendingSettlement();
  if(!pending)return;
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
 installSaveWrapper();
 settleOfflineOnLoad().finally(()=>installHeartbeat());
})();