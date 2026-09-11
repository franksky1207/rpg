(function(){
 const OFFLINE_MAX_MS=12*60*60*1000;
 const OFFLINE_EXP_RATE=.70;
 const OFFLINE_GOLD_RATE=.70;
 const DEFAULT_BATTLE_MS=1800;
 const HEARTBEAT_MS=60*1000;
 let heartbeatTimer=null;
 let offlineResultPending=null;

 function now(){return Date.now();}
 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
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
  return o;
 }
 function checkpoint(ts=now(),persist=true){
  const o=ensureOfflineState();
  o.lastSettledAt=Math.max(0,Math.floor(Number(ts)||now()));
  if(persist&&typeof save==="function")save(false);
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
  const seconds=Math.max(1,Math.floor(ms/1000));
  return `${seconds} 秒`;
 }
 function farmEnemyObject(target){
  try{
   const full=monsterObj(target.map,target.enemy);
   if(full?.kind==="boss")return null;
   return full;
  }catch(e){return null;}
 }
 function grantOfflineResources(battles,enemy){
  const count=Math.max(0,Math.floor(Number(battles)||0));
  let xpCarry=0,goldCarry=0,convertedCarry=0,totalXp=0;
  const levelBefore=state.level;
  for(let i=0;i<count;i++){
   goldCarry+=Math.max(0,Number(goldReward(enemy))||0)*OFFLINE_GOLD_RATE;
   const xpValue=Math.max(0,Number(expReward(enemy))||0)*OFFLINE_EXP_RATE;
   if(state.level>=MAX_LEVEL){convertedCarry+=xpValue;continue;}
   xpCarry+=xpValue;
   const grant=Math.floor(xpCarry);
   if(grant>0){
    xpCarry-=grant;
    totalXp+=grant;
    gainExp(grant,[]);
   }
  }
  const directGold=Math.floor(goldCarry),convertedGold=Math.floor(convertedCarry),totalGold=directGold+convertedGold;
  state.gold+=totalGold;
  if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});
  else state.hp=playerCombatStats().hp;
  return {totalXp,totalGold,directGold,convertedGold,levelsGained:Math.max(0,state.level-levelBefore)};
 }
 function ensureOfflineModal(){
  if(document.getElementById("offlineRewardModal"))return;
  const style=document.createElement("style");
  style.id="offline-reward-styles";
  style.textContent=`
   #offlineRewardModal .modal-box{width:min(470px,100%)}
   .offline-reward-title{color:#f0d494;margin-top:0}
   .offline-reward-summary{line-height:1.65}
   .offline-reward-meta{margin-top:10px;color:#c9b98f;font-size:13px}
  `;
  document.head.appendChild(style);
  const modal=document.createElement("div");
  modal.className="modal";modal.id="offlineRewardModal";
  modal.innerHTML=`<div class="modal-box"><h3 class="offline-reward-title">離線收益</h3><div id="offlineRewardDetail"></div><div class="controls"><button class="btn primary" onclick="closeOfflineRewardModal()">確認</button></div></div>`;
  document.body.appendChild(modal);
 }
 function showOfflineResult(result){
  if(!result)return;
  ensureOfflineModal();
  const detail=document.getElementById("offlineRewardDetail"),modal=document.getElementById("offlineRewardModal");
  if(!detail||!modal)return;
  const enemy=result.enemyName?`<div class="offline-reward-meta">離線刷怪：${result.enemyName}</div>`:"";
  const capNote=result.elapsedRaw>OFFLINE_MAX_MS?`<div class="muted" style="margin-top:8px">本次離線超過 12 小時，僅計算前 12 小時。</div>`:"";
  const converted=result.convertedGold>0?`<div class="muted" style="margin-top:7px">其中滿等 EXP 轉換金幣 +${result.convertedGold.toLocaleString()}</div>`:"";
  detail.innerHTML=`<div class="offline-reward-summary">離線 ${formatDuration(result.elapsedUsed)}，等效完成 <b>${result.battles.toLocaleString()}</b> 場主線刷怪。</div><div class="stats" style="margin-top:12px"><div class="stat">EXP<b>+${result.totalXp.toLocaleString()}</b></div><div class="stat">金幣<b>+${result.totalGold.toLocaleString()}</b></div></div>${converted}${enemy}${capNote}`;
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
  }else{
   o.farmMap=map;o.farmEnemy=enemy;o.avgBattleMs=sample;o.sampleCount=1;
  }
  o.lastSettledAt=now();
  if(typeof save==="function")save(false);
  return true;
 };

 function settleOfflineOnLoad(){
  const o=ensureOfflineState(),t=now();
  const elapsedRaw=Math.max(0,t-o.lastSettledAt);
  const elapsedUsed=Math.min(OFFLINE_MAX_MS,elapsedRaw);
  o.lastSettledAt=t;
  const target=resolveFarmTarget();
  if(!target){save(false);return;}
  const enemy=farmEnemyObject(target);
  if(!enemy){save(false);return;}
  const avg=Math.max(600,Math.min(60000,Math.round(Number(target.avgBattleMs)||DEFAULT_BATTLE_MS)));
  const battles=Math.max(0,Math.floor(elapsedUsed/avg));
  if(battles<1){save(false);return;}
  const rewards=grantOfflineResources(battles,enemy);
  const result={elapsedRaw,elapsedUsed,battles,enemyName:enemy.name||"主線敵人",...rewards};
  offlineResultPending=result;
  save(false);
  setTimeout(()=>{if(offlineResultPending){showOfflineResult(offlineResultPending);offlineResultPending=null;}},0);
 }
 function onHidden(){checkpoint(now(),true);}
 function onVisible(){checkpoint(now(),true);}
 function installHeartbeat(){
  if(heartbeatTimer)clearInterval(heartbeatTimer);
  heartbeatTimer=setInterval(()=>{
   if(document.visibilityState!=="hidden"&&(typeof document.hasFocus!=="function"||document.hasFocus()))checkpoint(now(),true);
  },HEARTBEAT_MS);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")onHidden();else onVisible();});
  window.addEventListener("pagehide",onHidden);
  window.addEventListener("blur",()=>checkpoint(now(),true));
  window.addEventListener("focus",()=>checkpoint(now(),true));
 }

 settleOfflineOnLoad();
 installHeartbeat();
})();
