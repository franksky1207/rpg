(function(){
 const FALLBACK_BATTLE_MS=1800;
 const CHECKPOINT_KEY="frank_text_rpg_offline_checkpoint";
 const CHECKPOINT_INTERVAL_MS=60*1000;
 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function now(){return Date.now();}
 function makeCheckpointId(){
  try{if(globalThis.crypto&&typeof globalThis.crypto.randomUUID==="function")return globalThis.crypto.randomUUID();}catch(e){}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
 }
 function ensureCheckpointId(){
  if(!isObject(state.offline))state.offline={};
  const current=typeof state.offline.checkpointId==="string"?state.offline.checkpointId.trim():"";
  if(current)return current;
  const id=makeCheckpointId();state.offline.checkpointId=id;return id;
 }
 function readCheckpoint(){
  try{
   const raw=localStorage.getItem(CHECKPOINT_KEY);if(!raw)return null;
   const t=now(),id=ensureCheckpointId();
   let parsed=null;
   try{parsed=JSON.parse(raw);}catch(e){parsed=null;}
   if(isObject(parsed)){
    const value=Number(parsed.ts),storedId=typeof parsed.id==="string"?parsed.id:"";
    return storedId===id&&Number.isFinite(value)&&value>0&&value<=t?Math.floor(value):null;
   }
   const legacy=Number(raw);
   return Number.isFinite(legacy)&&legacy>0&&legacy<=t?Math.floor(legacy):null;
  }catch(e){return null;}
 }
 function writeCheckpoint(ts=now()){
  try{
   const payload={id:ensureCheckpointId(),ts:Math.max(0,Math.floor(Number(ts)||now()))};
   localStorage.setItem(CHECKPOINT_KEY,JSON.stringify(payload));
  }catch(e){}
 }
 function targetInfo(map,enemy){
  if(!Number.isInteger(map)||map<0||map>=MAPS.length||!Number.isInteger(enemy)||enemy<0||enemy>3)return null;
  try{
   const monster=monsterObj(map,enemy);
   if(!monster||monster.kind==="boss")return null;
   return {map,enemy,level:Math.max(1,Math.floor(Number(monster.level)||1))};
  }catch(e){return null;}
 }
 function validStoredTarget(o){
  if(!isObject(o))return false;
  const map=Number(o.farmMap),enemy=Number(o.farmEnemy),avg=Number(o.avgBattleMs),samples=Number(o.sampleCount);
  return !!targetInfo(map,enemy)&&Number.isFinite(avg)&&avg>=600&&avg<=60000&&Number.isFinite(samples)&&samples>=1;
 }
 function highestDefeatedTarget(){
  if(!Array.isArray(state?.mapProgress))return null;
  let best=null;
  for(let map=0;map<Math.min(MAPS.length,state.mapProgress.length);map++){
   const p=Array.isArray(state.mapProgress[map])?state.mapProgress[map]:[];
   for(let enemy=0;enemy<=3;enemy++){
    if((Number(p[enemy])||0)<=0)continue;
    const info=targetInfo(map,enemy);
    if(!info)continue;
    if(!best||info.level>best.level||(info.level===best.level&&(info.map>best.map||(info.map===best.map&&info.enemy>best.enemy))))best=info;
   }
  }
  return best;
 }
 if(!state)return;
 if(!isObject(state.offline))state.offline={};
 ensureCheckpointId();
 const persistedCheckpoint=readCheckpoint();
 if(persistedCheckpoint!=null){
  const current=Number(state.offline.lastSettledAt);
  if(!Number.isFinite(current)||current<=0||current>now()||persistedCheckpoint>current)state.offline.lastSettledAt=persistedCheckpoint;
 }
 const storedValid=validStoredTarget(state.offline);
 const highest=highestDefeatedTarget();
 if(highest){
  const current=storedValid?targetInfo(Number(state.offline.farmMap),Number(state.offline.farmEnemy)):null;
  if(!current||highest.level>current.level||(highest.level===current.level&&(highest.map!==current.map||highest.enemy!==current.enemy))){
   state.offline.farmMap=highest.map;
   state.offline.farmEnemy=highest.enemy;
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