(function(){
 const FALLBACK_BATTLE_MS=1800;
 const CHECKPOINT_KEY="frank_text_rpg_offline_checkpoint";
 const CHECKPOINT_INTERVAL_MS=60*1000;
 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function now(){return Date.now();}
 function readCheckpoint(){
  try{
   const value=Number(localStorage.getItem(CHECKPOINT_KEY));
   const t=now();
   return Number.isFinite(value)&&value>0&&value<=t?Math.floor(value):null;
  }catch(e){return null;}
 }
 function writeCheckpoint(ts=now()){
  try{localStorage.setItem(CHECKPOINT_KEY,String(Math.max(0,Math.floor(Number(ts)||now()))));}catch(e){}
 }
 function hasMainlineHistory(){
  if(Array.isArray(state?.mapProgress)&&state.mapProgress.some(row=>Array.isArray(row)&&row.some(v=>(Number(v)||0)>0)))return true;
  if(Array.isArray(state?.bossKilled)&&state.bossKilled.some(Boolean))return true;
  return false;
 }
 function targetExists(map,enemy){
  if(!Number.isInteger(map)||map<0||map>=MAPS.length||!Number.isInteger(enemy)||enemy<0||enemy>3)return false;
  try{const monster=monsterObj(map,enemy);return !!monster&&monster.kind!=="boss";}catch(e){return false;}
 }
 function validStoredTarget(o){
  if(!isObject(o))return false;
  const map=Number(o.farmMap),enemy=Number(o.farmEnemy),avg=Number(o.avgBattleMs),samples=Number(o.sampleCount);
  return targetExists(map,enemy)&&Number.isFinite(avg)&&avg>=600&&avg<=60000&&Number.isFinite(samples)&&samples>=1;
 }
 function defeatedFallback(){
  const maxMap=Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(state?.unlockedMap)||0)));
  for(let map=maxMap;map>=0;map--){
   const p=Array.isArray(state?.mapProgress?.[map])?state.mapProgress[map]:[];
   for(let enemy=3;enemy>=0;enemy--){
    if((Number(p[enemy])||0)<=0)continue;
    if(targetExists(map,enemy))return {map,enemy};
   }
  }
  return null;
 }
 function legalFallback(){
  if(!hasMainlineHistory())return null;
  const maxMap=Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(state?.unlockedMap)||0)));
  for(let map=maxMap;map>=0;map--){
   for(let enemy=3;enemy>=0;enemy--){
    try{if(typeof enemyUnlocked==="function"&&enemyUnlocked(map,enemy)&&targetExists(map,enemy))return {map,enemy};}catch(e){}
   }
  }
  return null;
 }
 if(!state)return;
 if(!isObject(state.offline))state.offline={};
 const persistedCheckpoint=readCheckpoint();
 if(persistedCheckpoint!=null){
  const current=Number(state.offline.lastSettledAt);
  if(!Number.isFinite(current)||current<=0||current>now()||persistedCheckpoint<current)state.offline.lastSettledAt=persistedCheckpoint;
 }
 if(!validStoredTarget(state.offline)&&hasMainlineHistory()){
  const target=defeatedFallback()||legalFallback();
  if(target){
   state.offline.farmMap=target.map;
   state.offline.farmEnemy=target.enemy;
   state.offline.avgBattleMs=FALLBACK_BATTLE_MS;
   state.offline.sampleCount=1;
  }
 }
 if(typeof save==="function")save(false);
 writeCheckpoint();
 const timer=setInterval(()=>{
  const hidden=document.visibilityState==="hidden";
  if(!hidden)writeCheckpoint();
 },CHECKPOINT_INTERVAL_MS);
 window.addEventListener("pagehide",()=>writeCheckpoint(),{capture:true});
 window.addEventListener("beforeunload",()=>writeCheckpoint(),{capture:true});
 window.addEventListener("pageshow",()=>{if(document.visibilityState!=="hidden")writeCheckpoint();});
 window.addEventListener("unload",()=>{clearInterval(timer);writeCheckpoint();},{capture:true});
})();