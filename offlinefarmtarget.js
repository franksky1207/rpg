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
 if(!state)return;
 if(!isObject(state.offline))state.offline={};
 ensureCheckpointId();
 const persistedCheckpoint=readCheckpoint();
 if(persistedCheckpoint!=null){
  const current=Number(state.offline.lastSettledAt);
  if(!Number.isFinite(current)||current<=0||current>now()||persistedCheckpoint>current)state.offline.lastSettledAt=persistedCheckpoint;
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