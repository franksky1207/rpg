(function(){
 const FALLBACK_BATTLE_MS=1800;
 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function hasMainlineHistory(){
  if(Array.isArray(state?.mapProgress)&&state.mapProgress.some(row=>Array.isArray(row)&&row.some(v=>(Number(v)||0)>0)))return true;
  if(Array.isArray(state?.bossKilled)&&state.bossKilled.some(Boolean))return true;
  return false;
 }
 function validStoredTarget(o){
  if(!isObject(o))return false;
  const map=Number(o.farmMap),enemy=Number(o.farmEnemy),avg=Number(o.avgBattleMs),samples=Number(o.sampleCount);
  if(!Number.isInteger(map)||map<0||map>=MAPS.length||!Number.isInteger(enemy)||enemy<0||enemy>3)return false;
  if(!Number.isFinite(avg)||avg<600||avg>60000||!Number.isFinite(samples)||samples<1)return false;
  try{return typeof enemyUnlocked==="function"&&enemyUnlocked(map,enemy);}catch(e){return false;}
 }
 function defeatedFallback(){
  const maxMap=Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(state?.unlockedMap)||0)));
  for(let map=maxMap;map>=0;map--){
   const p=Array.isArray(state?.mapProgress?.[map])?state.mapProgress[map]:[];
   for(let enemy=3;enemy>=0;enemy--){
    if((Number(p[enemy])||0)<=0)continue;
    try{if(typeof enemyUnlocked==="function"&&enemyUnlocked(map,enemy))return {map,enemy};}catch(e){}
   }
  }
  return null;
 }
 function legalFallback(){
  const maxMap=Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(state?.unlockedMap)||0)));
  for(let map=maxMap;map>=0;map--){
   for(let enemy=3;enemy>=0;enemy--){
    try{if(typeof enemyUnlocked==="function"&&enemyUnlocked(map,enemy))return {map,enemy};}catch(e){}
   }
  }
  return null;
 }
 if(!state||!hasMainlineHistory())return;
 if(!isObject(state.offline))state.offline={};
 if(validStoredTarget(state.offline))return;
 const target=defeatedFallback()||legalFallback();
 if(!target)return;
 state.offline.farmMap=target.map;
 state.offline.farmEnemy=target.enemy;
 state.offline.avgBattleMs=FALLBACK_BATTLE_MS;
 state.offline.sampleCount=1;
 if(typeof save==="function")save(false);
})();
