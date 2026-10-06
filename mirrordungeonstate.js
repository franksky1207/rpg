(function(){
 const CONFIG=window.MIRROR_DUNGEON_CONFIG;if(!CONFIG)throw new Error("Mirror dungeon config missing.");
 const MIRROR_DUNGEON_STATE_VERSION=3;
 const MIRROR_DUNGEON_SETTLEMENT_OWNER_VERSION=1;
 const MIRROR_MIRACLE_DATE_DEDUP_VERSION=1;
 const RUN_BATTLES=CONFIG.runBattles;
 const MIRROR_STATUSES=new Set(["idle","running","completed","failed"]);

 function finiteInt(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:fallback;}
 function validDateKey(value){
  if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const ms=Date.parse(`${value}T00:00:00Z`);if(!Number.isFinite(ms))return null;
  return new Date(ms).toISOString().slice(0,10)===value?value:null;
 }
 function todayKey(timestamp=Date.now()){return typeof gameDailyDateKey==="function"?gameDailyDateKey(timestamp):new Date(Number(timestamp)||Date.now()).toISOString().slice(0,10);}
 function blankMirrorHistory(){return {bestWins:0,bestDate:null,miracleDates:[]};}
 function blankMirrorDaily(dateKey=todayKey()){return {dateKey,status:"idle",challengeDate:null,startedAt:0,wins:0,losses:0,completedAt:0};}
 function blankMirrorState(dateKey=todayKey()){return {version:MIRROR_DUNGEON_STATE_VERSION,history:blankMirrorHistory(),daily:blankMirrorDaily(dateKey)};}
 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function replaceObject(target,next){Object.keys(target).forEach(key=>{if(!(key in next))delete target[key];});Object.assign(target,next);return target;}

 function normalizeHistory(source){
  const history=isObject(source)?source:{};
  let bestDate=validDateKey(history.bestDate);
  let bestWins=Math.max(0,Math.min(RUN_BATTLES,finiteInt(history.bestWins,0)));
  let miracleDates=Array.isArray(history.miracleDates)?Array.from(new Set(history.miracleDates.map(validDateKey).filter(Boolean))):[];
  if(miracleDates.length){bestWins=RUN_BATTLES;bestDate=miracleDates[0];}
  else if(bestDate&&bestWins===RUN_BATTLES)miracleDates=[bestDate];
  if(!bestDate){bestWins=0;miracleDates=[];}
  return replaceObject(history,{bestWins,bestDate:bestDate||null,miracleDates});
 }
 function normalizeDaily(source,currentKey,recoverInterrupted=false){
  const daily=isObject(source)?source:{};
  const sourceDateKey=validDateKey(daily.dateKey),sourceChallengeDate=validDateKey(daily.challengeDate);
  let status=MIRROR_STATUSES.has(daily.status)?daily.status:"idle";
  if(status!=="idle"&&!sourceDateKey&&!sourceChallengeDate)return replaceObject(daily,blankMirrorDaily(currentKey));
  let dateKey=sourceDateKey||sourceChallengeDate||currentKey;
  let challengeDate=sourceChallengeDate;
  let wins=Math.max(0,Math.min(RUN_BATTLES,finiteInt(daily.wins,0)));
  let losses=Math.max(0,Math.min(RUN_BATTLES-wins,finiteInt(daily.losses,0)));
  let startedAt=finiteInt(daily.startedAt,0),completedAt=finiteInt(daily.completedAt,0);

  if(status==="running"){
   challengeDate=challengeDate||dateKey;dateKey=challengeDate;
   if(recoverInterrupted){
    if(challengeDate===currentKey){status="failed";wins=0;losses=0;completedAt=0;}
    else return replaceObject(daily,blankMirrorDaily(currentKey));
   }
  }else if(dateKey!==currentKey){
   return replaceObject(daily,blankMirrorDaily(currentKey));
  }

  if(status==="idle")return replaceObject(daily,blankMirrorDaily(currentKey));
  challengeDate=challengeDate||dateKey;
  if(status==="completed"&&wins+losses!==RUN_BATTLES){status="failed";wins=0;losses=0;completedAt=0;}
  if(status==="failed"){wins=0;losses=0;completedAt=0;}
  if(completedAt&&startedAt&&completedAt<startedAt)completedAt=startedAt;
  return replaceObject(daily,{dateKey,status,challengeDate,startedAt,wins,losses,completedAt});
 }
 function normalizeMirrorDungeonState(target,timestamp=Date.now(),options={}){
  if(!target||typeof target!=="object")return null;
  if(!isObject(target.dungeon))target.dungeon={};
  const currentKey=todayKey(timestamp);
  if(!isObject(target.dungeon.mirror))target.dungeon.mirror={};
  const mirror=target.dungeon.mirror;
  if(!isObject(mirror.history))mirror.history={};
  if(!isObject(mirror.daily))mirror.daily={};
  normalizeHistory(mirror.history);
  normalizeDaily(mirror.daily,currentKey,options?.recoverInterrupted===true);
  replaceObject(mirror,{version:MIRROR_DUNGEON_STATE_VERSION,history:mirror.history,daily:mirror.daily});
  return mirror;
 }
 function ensureMirrorDungeonState(timestamp=Date.now()){return normalizeMirrorDungeonState(state,timestamp);}
 function mirrorDungeonStatus(timestamp=Date.now()){
  const mirror=ensureMirrorDungeonState(timestamp),daily=mirror?.daily||blankMirrorDaily(todayKey(timestamp)),history=mirror?.history||blankMirrorHistory();
  const unlocked=Math.max(1,Math.floor(Number(state?.level)||1))>=CONFIG.unlockLevel;
  return {unlocked,status:daily.status,dateKey:daily.dateKey,challengeDate:daily.challengeDate,wins:daily.wins,losses:daily.losses,history,canStart:unlocked&&daily.status==="idle",ended:daily.status==="completed"||daily.status==="failed"};
 }
 function beginMirrorDungeonState(timestamp=Date.now()){
  const info=mirrorDungeonStatus(timestamp);
  if(!info.unlocked)return {ok:false,reason:"locked",...info};
  if(info.status!=="idle")return {ok:false,reason:"already_used",...info};
  const mirror=ensureMirrorDungeonState(timestamp),key=todayKey(timestamp),now=Math.max(0,Math.floor(Number(timestamp)||Date.now()));
  const previousDaily={...mirror.daily};
  replaceObject(mirror.daily,{dateKey:key,status:"running",challengeDate:key,startedAt:now,wins:0,losses:0,completedAt:0});
  let persisted=false;
  try{persisted=typeof save==="function"&&save(false)===true;}catch(error){console.error("Mirror dungeon start save failed",error);}
  if(!persisted){replaceObject(mirror.daily,previousDaily);return {ok:false,reason:"save_failed",...mirrorDungeonStatus(timestamp)};}
  return {ok:true,...mirrorDungeonStatus(timestamp)};
 }
 function failMirrorDungeonState(timestamp=Date.now()){
  const mirror=ensureMirrorDungeonState(timestamp);if(!mirror)return {ok:false,reason:"missing_state"};
  if(mirror.daily.status!=="running")return {ok:false,reason:"not_running",...mirrorDungeonStatus(timestamp)};
  const currentKey=todayKey(timestamp);
  if(mirror.daily.challengeDate!==currentKey)replaceObject(mirror.daily,blankMirrorDaily(currentKey));
  else replaceObject(mirror.daily,{...mirror.daily,status:"failed",wins:0,losses:0,completedAt:0});
  if(typeof save==="function")save(false);
  return {ok:true,...mirrorDungeonStatus(timestamp)};
 }
 function settleMirrorDungeonResult(target,wins,timestamp=Date.now(),options={}){
  if(!isObject(target))return {ok:false,reason:"state-missing"};
  const mirror=normalizeMirrorDungeonState(target,timestamp);if(!mirror?.history||!mirror?.daily)return {ok:false,reason:"missing_state"};
  const requireRunning=options?.requireRunning!==false,requireUpgrade=options?.requireUpgrade===true;
  if(requireRunning&&mirror.daily.status!=="running")return {ok:false,reason:"not_running"};
  const raw=Math.floor(Number(wins));if(!Number.isInteger(raw)||raw<0||raw>RUN_BATTLES)return {ok:false,reason:"invalid-wins"};
  const w=raw,losses=RUN_BATTLES-w,history=mirror.history,firstRecord=!history.bestDate,previousBestWins=firstRecord?0:Math.max(0,Math.floor(Number(history.bestWins)||0));
  if(requireUpgrade&&w<=previousBestWins)return {ok:false,reason:"not-an-upgrade",previousBestWins};
  const now=Math.max(0,Math.floor(Number(timestamp)||Date.now()));
  const dateKey=requireRunning?(mirror.daily.challengeDate||mirror.daily.dateKey||todayKey(timestamp)):todayKey(timestamp);
  if(firstRecord||w>previousBestWins){history.bestWins=w;history.bestDate=dateKey;}
  if(w===RUN_BATTLES&&!history.miracleDates.includes(dateKey))history.miracleDates.push(dateKey);
  normalizeHistory(history);
  const titleSettlement=typeof window.grantPlayerTitlesForMirrorWins==="function"
   ?window.grantPlayerTitlesForMirrorWins(history.bestWins,target,{previousBestWins})
   :null;
  const startedAt=requireRunning?Math.max(0,finiteInt(mirror.daily.startedAt,0)):now;
  replaceObject(mirror.daily,{dateKey,status:"completed",challengeDate:dateKey,startedAt,wins:w,losses,completedAt:now});
  return {ok:true,status:"completed",dateKey,challengeDate:dateKey,wins:w,losses,previousBestWins,titleSettlement,miracle:w===RUN_BATTLES,history:{bestWins:history.bestWins,bestDate:history.bestDate,miracleDates:history.miracleDates.slice()}};
 }
 function recordMirrorDungeonCompletion(wins,timestamp=Date.now(),options={}){
  const result=settleMirrorDungeonResult(state,wins,timestamp,{requireRunning:true});
  if(!result?.ok)return {...result,...mirrorDungeonStatus(timestamp)};
  if(options?.save!==false&&typeof save==="function")save(false);
  return result;
 }
 function resetMirrorDungeonToday(timestamp=Date.now()){
  const mirror=ensureMirrorDungeonState(timestamp);if(!mirror)return null;
  replaceObject(mirror.daily,blankMirrorDaily(todayKey(timestamp)));
  if(typeof save==="function")save(false);
  return mirrorDungeonStatus(timestamp);
 }

 window.MIRROR_DUNGEON_STATE_VERSION=MIRROR_DUNGEON_STATE_VERSION;
 window.MIRROR_DUNGEON_SETTLEMENT_OWNER_VERSION=MIRROR_DUNGEON_SETTLEMENT_OWNER_VERSION;
 window.MIRROR_MIRACLE_DATE_DEDUP_VERSION=MIRROR_MIRACLE_DATE_DEDUP_VERSION;
 window.blankMirrorDungeonState=blankMirrorState;
 window.normalizeMirrorDungeonState=normalizeMirrorDungeonState;
 window.ensureMirrorDungeonState=ensureMirrorDungeonState;
 window.mirrorDungeonStatus=mirrorDungeonStatus;
 window.beginMirrorDungeonState=beginMirrorDungeonState;
 window.failMirrorDungeonState=failMirrorDungeonState;
 window.settleMirrorDungeonResult=settleMirrorDungeonResult;
 window.recordMirrorDungeonCompletion=recordMirrorDungeonCompletion;
 window.resetMirrorDungeonToday=resetMirrorDungeonToday;
 window.isValidMirrorDateKey=value=>validDateKey(value)!==null;
})();