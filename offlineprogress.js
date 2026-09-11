(function(){
 const OFFLINE_MAX_MS=12*60*60*1000;
 const OFFLINE_EXP_RATE=.70;
 const OFFLINE_GOLD_RATE=.70;
 const OFFLINE_GEAR_RATE=.50;
 const DEFAULT_BATTLE_MS=1800;
 const HEARTBEAT_MS=60*1000;
 const HEARTBEAT_PERSIST_MS=5*60*1000;
 const YIELD_EVERY=750;
 const baseSave=typeof save==="function"?save:null;
 let heartbeatTimer=null;
 let lastHeartbeatPersist=Date.now();
 let offlineResultPending=null;
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
  const map=o.farmMap==null?NaN:Number(o.farmMap),enemy=o.farmEnemy==null?NaN:Number(o.farmEnemy);
  o.farmMap=Number.isInteger(map)&&map>=0&&map<MAPS.length?map:null;
  o.farmEnemy=Number.isInteger(enemy)&&enemy>=0&&enemy<=3?enemy:null;
  const avg=Number(o.avgBattleMs);
  o.avgBattleMs=Number.isFinite(avg)&&avg>=600&&avg<=60000?Math.round(avg):0;
  o.sampleCount=Math.max(0,Math.min(20,Math.floor(Number(o.sampleCount)||0));
  if(o.sampleCount<=0||o.avgBattleMs<=0||o.farmMap==null||o.farmEnemy==null){o.farmMap=null;o.farmEnemy=null;o.avgBattleMs=0;o.sampleCount=0;}
  if(!isObject(o.pendingSettlement))o.pendingSettlement=null;
  return o;
 }
 function checkpoint(ts=now(),persist=false){
  const o=ensureOfflineState();
  o.lastSettledAt=Math.max(0,Math.floor(Number(ts)||now()));
  if(persist&&baseSave)baseSave(false);
 }
 function legalFarmTarget(mapIdx,enemyIdx){
  const m=Number(mapIdx),e=Number(enemyIdx);
  if(!Number.isInteger(m)||m<0||m>=MAPS.length||!Number.isInteger(e)||e<0||e>3)return false;
  try{return typeof enemyUnlocked==="function"&&enemyUnlocked(m,e);}catch(err){return false;}
 }
 function resolveFarmTarget(){
  const o=ensureOfflineState();
  if(o.sampleCount>0&&o.avgBattleMs>0&&legalFarmTarget(o.farmMap,o.farmEnemy))return {map:o.farmMap,enemy:o.farmEnemy,avgBattleMs:o.avgBattleMs};
  return null;
 }
 function formatDuration(ms){
  const total=Math.max(0,Math.floor(ms/60000));
  const h=Math.floor(total/60),m=total%60;
  if(h>0&&m>0)return `${h} 小時 ${m} 分`;
  if(h>0)return `${h} 小時`;
  if(total>0)return `${total} 分`;
  return `${Math.max(1,Math.floor(ms/1000))} 秒`;
 }
 function farmEnemyObject(target){
  try{
   const full=monsterObj(target.map,target.enemy);
   if(full?.kind==="boss")return null;
   return full;
  }catch(e){return null;}
 }
 function offlineSellValue(item){return typeof specializationSellValue==="function"?specializationSellValue(item):Math.max(0,Math.floor(Number(item?.sell)||0));}
 function normalizeOfflineDrop(item){if(item&&typeof item==="object"&&typeof item.locked!=="boolean")item.locked=false;return item;}

 function normalizePending(raw){
  if(!isObject(raw))return null;
  const map=Math.floor(Number(raw.map)),enemy=Math.floor(Number(raw.enemy));
  const avg=Math.max(600,Math.min(60000,Math.round(Number(raw.avgBattleMs)||DEFAULT_BATTLE_MS)));
  const elapsedRaw=Math.max(0,Number(raw.elapsedRaw)||0),elapsedUsed=Math.min(OFFLINE_MAX_MS,Math.max(0,Number(raw.elapsedUsed)||0));
  const maxBattles=Math.max(0,Math.floor(elapsedUsed/avg));
  const battles=Math.max(0,Math.min(maxBattles,Math.floor(Number(raw.battles)||0)));
  if(!legalFarmTarget(map,enemy)||battles<1)return null;
  return {map,enemy,avgBattleMs:avg,elapsedRaw,elapsedUsed,battles,createdAt:Math.max(0,Number(raw.createdAt)||now())};
 }
 function buildPendingSettlement(){
  const o=ensureOfflineState(),t=now();
  const existing=normalizePending(o.pendingSettlement);
  if(existing)return existing;
  o.pendingSettlement=null;
  const elapsedRaw=Math.max(0,t-o.lastSettledAt),elapsedUsed=Math.min(OFFLINE_MAX_MS,elapsedRaw);
  const target=resolveFarmTarget();
  if(!target){o.lastSettledAt=t;if(baseSave)baseSave(false);return null;}
  const avg=Math.max(600,Math.min(60000,Math.round(Number(target.avgBattleMs)||DEFAULT_BATTLE_MS)));
  const battles=Math.max(0,Math.floor(elapsedUsed/avg));
  o.lastSettledAt=t;
  if(battles<1){if(baseSave)baseSave(false);return null;}
  const pending={map:target.map,enemy:target.enemy,avgBattleMs:avg,elapsedRaw,elapsedUsed,battles,createdAt:t};
  o.pendingSettlement=pending;
  if(baseSave)baseSave(false);
  return pending;
 }

 async function grantOfflineRewards(pending,enemy){
  const count=Math.max(0,Math.floor(Number(pending.battles)||0));
  let xpCarry=0,goldCarry=0,convertedCarry=0,totalXp=0;
  const levelBefore=state.level;
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
   if(!previous||equipmentScore(item)>equipmentScore(previous)){
    if(previous)sell(previous);
    bestByType.set(type,item);
   }else sell(item);
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
    if(encounter&&encounter.kind!=="boss"){
     const item=typeof dropItem==="function"?dropItem(encounter,pending.map):null;
     if(item)consider(item);
    }
   }

   if((i+1)%YIELD_EVERY===0)await yieldThread();
  }

  const keptOrdinary=[];
  bestByType.forEach((item,type)=>{
   const current=state.equipment?.[type]||null;
   if(equipmentScore(item)>equipmentScore(current))keptOrdinary.push(item);
   else sell(item);
  });
  keptOrdinary.forEach(item=>state.inventory.push(item));
  mythics.forEach(item=>state.inventory.push(item));
  if(keptOrdinary.length)upgradeDropNoticePending=true;

  const directGold=Math.floor(goldCarry),convertedGold=Math.floor(convertedCarry);
  state.gold+=directGold+convertedGold+soldGold;
  if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else state.hp=playerCombatStats().hp;
  return {
   totalXp,
   totalGold:directGold+convertedGold+soldGold,
   directGold,
   convertedGold,
   levelsGained:Math.max(0,state.level-levelBefore),
   gear:{eligibleRolls,droppedCount,soldCount,soldGold,keptOrdinary,mythics,keptCount:keptOrdinary.length+mythics.length}
  };
 }

 function ensureOfflineModals(){
  if(!document.getElementById("offline-reward-styles")){
   const style=document.createElement("style");style.id="offline-reward-styles";
   style.textContent=`#offlineRewardModal .modal-box{width:min(520px,100%);max-height:calc(100dvh - 24px);display:flex;flex-direction:column;overflow:hidden}#offlineRewardDetail{min-height:0;overflow:auto;overscroll-behavior:contain}.offline-reward-title{color:#f0d494;margin-top:0}.offline-reward-summary{line-height:1.65}.offline-reward-meta{margin-top:10px;color:#c9b98f;font-size:13px}.offline-gear-list{margin-top:10px;border:1px solid #343a43;border-radius:10px;padding:9px;background:#10151b}.offline-gear-row{padding:7px 0;border-top:1px solid #2c323a}.offline-gear-row:first-child{border-top:0;padding-top:0}#offlineCalculatingModal .modal-box{width:min(360px,100%);text-align:center}#offlineCalculatingModal .muted{line-height:1.6}`;
   document.head.appendChild(style);
  }
  if(!document.getElementById("offlineRewardModal")){
   const modal=document.createElement("div");modal.className="modal";modal.id="offlineRewardModal";
   modal.innerHTML=`<div class="modal-box"><h3 class="offline-reward-title">離線收益</h3><div id="offlineRewardDetail"></div><div class="controls"><button class="btn primary" onclick="closeOfflineRewardModal()">確認</button></div></div>`;
   document.body.appendChild(modal);
  }
  if(!document.getElementById("offlineCalculatingModal")){
   const modal=document.createElement("div");modal.className="modal";modal.id="offlineCalculatingModal";
   modal.innerHTML=`<div class="modal-box"><h3 class="offline-reward-title">整理離線收益</h3><div class="muted">正在結算離線期間的 EXP、金幣與裝備。</div></div>`;
   document.body.appendChild(modal);
  }
 }
 function setCalculatingVisible(show){ensureOfflineModals();document.getElementById("offlineCalculatingModal")?.classList.toggle("show",!!show);}
 function offlineGearHtml(gear){
  if(!gear)return "";
  const kept=[...(gear.keptOrdinary||[]),...(gear.mythics||[])];
  const keptHtml=kept.length?`<div class="offline-gear-list">${kept.map(item=>`<div class="offline-gear-row">${itemHtml(item,true)}${typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):""}</div>`).join("")}</div>`:`<div class="muted" style="margin-top:7px">本次沒有保留裝備。</div>`;
  const sold=gear.soldCount>0?`<div class="muted" style="margin-top:7px">較弱裝備自動整理出售 ${gear.soldCount} 件，金幣 +${gear.soldGold.toLocaleString()}</div>`:"";
  return `<div class="notice" style="margin-top:12px"><b>離線裝備</b><div class="muted" style="margin-top:5px">掉落效率 50%；同部位一般裝備只保留最強且優於目前裝備者，神話裝備全部保留。</div>${keptHtml}${sold}</div>`;
 }
 function showOfflineResult(result){
  if(!result)return;
  ensureOfflineModals();
  const detail=document.getElementById("offlineRewardDetail"),modal=document.getElementById("offlineRewardModal");
  if(!detail||!modal)return;
  const enemy=result.enemyName?`<div class="offline-reward-meta">離線刷怪：${result.enemyName}</div>`:"";
  const capNote=result.elapsedRaw>OFFLINE_MAX_MS?`<div class="muted" style="margin-top:8px">本次離線超過 12 小時，僅計算前 12 小時。</div>`:"";
  const converted=result.convertedGold>0?`<div class="muted" style="margin-top:7px">其中滿等 EXP 轉換金幣 +${result.convertedGold.toLocaleString()}</div>`:"";
  detail.innerHTML=`<div class="offline-reward-summary">離線 ${formatDuration(result.elapsedUsed)}，等效完成 <b>${result.battles.toLocaleString()}</b> 場主線刷怪。</div><div class="stats" style="margin-top:12px"><div class="stat">EXP<b>+${result.totalXp.toLocaleString()}</b></div><div class="stat">金幣<b>+${result.totalGold.toLocaleString()}</b></div></div>${converted}${offlineGearHtml(result.gear)}${enemy}${capNote}`;
  modal.classList.add("show");
 }
 window.closeOfflineRewardModal=function(){document.getElementById("offlineRewardModal")?.classList.remove("show");};

 window.recordOfflineMainBattleSample=function(result,mapIdx,enemyIdx){
  if(result?.win!==true||result?.e?.kind==="boss")return false;
  const map=Math.floor(Number(mapIdx)),enemy=Math.floor(Number(enemyIdx));
  if(!legalFarmTarget(map,enemy))return false;
  const estimate=typeof window.estimateMainBattleDurationMs==="function"?Number(window.estimateMainBattleDurationMs(result)):0;
  const sample=Math.max(600,Math.min(60000,Math.round(Number.isFinite(estimate)&&estimate>0?estimate:DEFAULT_BATTLE_MS)));
  const o=ensureOfflineState();
  const same=o.farmMap===map&&o.farmEnemy===enemy&&o.avgBattleMs>0&&o.sampleCount>0;
  if(same){
   const nextCount=Math.min(20,o.sampleCount+1);
   o.avgBattleMs=Math.round(o.avgBattleMs+(sample-o.avgBattleMs)/nextCount);
   o.sampleCount=nextCount;
  }else{o.farmMap=map;o.farmEnemy=enemy;o.avgBattleMs=sample;o.sampleCount=1;}
  o.lastSettledAt=now();
  return true;
 };

 async function settleOfflineOnLoad(){
  const pending=buildPendingSettlement();
  if(!pending)return;
  const enemy=farmEnemyObject(pending);
  if(!enemy){const o=ensureOfflineState();o.pendingSettlement=null;o.lastSettledAt=now();if(baseSave)baseSave(false);return;}
  const rollbackSnapshot=JSON.stringify(state);
  offlineSettlementBusy=true;
  setCalculatingVisible(true);
  await yieldThread();
  try{
   const rewards=await grantOfflineRewards(pending,enemy);
   const result={elapsedRaw:pending.elapsedRaw,elapsedUsed:pending.elapsedUsed,battles:pending.battles,enemyName:enemy.name||"主線敵人",...rewards};
   const o=ensureOfflineState();
   o.pendingSettlement=null;
   o.lastSettledAt=now();
   if(baseSave)baseSave(false);
   offlineResultPending=result;
   setCalculatingVisible(false);
   showOfflineResult(offlineResultPending);
   offlineResultPending=null;
  }catch(err){
   console.error("Offline settlement failed",err);
   setCalculatingVisible(false);
   try{
    state=JSON.parse(rollbackSnapshot);
    if(typeof normalizeCurrentSaveState==="function")normalizeCurrentSaveState();
    if(typeof render==="function")render();
   }catch(rollbackError){console.error("Offline rollback failed",rollbackError);location.reload();return;}
   alert("離線收益整理發生錯誤；本次區段已保留，重新整理後會再次嘗試結算。");
  }finally{offlineSettlementBusy=false;}
 }

 function installSaveWrapper(){
  if(!baseSave)return;
  const wrapped=function(show=true){
   if(offlineSettlementBusy)return true;
   checkpoint(now(),false);
   return baseSave(show);
  };
  try{save=wrapped;}catch(e){}
  window.save=wrapped;
 }
 function persistForegroundCheckpoint(){
  if(offlineSettlementBusy)return;
  checkpoint(now(),false);
  if(baseSave)baseSave(false);
  lastHeartbeatPersist=now();
 }
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
