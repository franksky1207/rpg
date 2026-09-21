(function(){
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
 function recoverOfflineCheckpointTime(currentValue,persistedValue,nowValue=now()){
  const t=Math.max(0,Math.floor(Number(nowValue)||now()));
  const current=Number(currentValue),persisted=Number(persistedValue);
  if(!Number.isFinite(persisted)||persisted<=0||persisted>t)return Number.isFinite(current)?current:t;
  if(!Number.isFinite(current)||current<=0||current>t||persisted<current)return Math.floor(persisted);
  return Math.floor(current);
 }
 function prepareOfflineCheckpointForWorldTransition(){
  if(!isObject(state.offline))state.offline={};
  const t=now();
  state.offline.checkpointId=makeCheckpointId();
  state.offline.lastSettledAt=t;
  state.offline.maxObservedWallClock=t;
  return {checkpointId:state.offline.checkpointId,lastSettledAt:t};
 }
 function finalizeOfflineCheckpointForWorldTransition(){
  try{localStorage.removeItem(CHECKPOINT_KEY);}catch(e){}
  writeCheckpoint(now());
  return true;
 }
 window.OFFLINE_CHECKPOINT_RECOVERY_VERSION=2;
 window.recoverOfflineCheckpointTime=recoverOfflineCheckpointTime;
 window.prepareOfflineCheckpointForWorldTransition=prepareOfflineCheckpointForWorldTransition;
 window.finalizeOfflineCheckpointForWorldTransition=finalizeOfflineCheckpointForWorldTransition;
 if(!state)return;
 if(!isObject(state.offline))state.offline={};
 ensureCheckpointId();
 const persistedCheckpoint=readCheckpoint();
 if(persistedCheckpoint!=null)state.offline.lastSettledAt=recoverOfflineCheckpointTime(state.offline.lastSettledAt,persistedCheckpoint,now());
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