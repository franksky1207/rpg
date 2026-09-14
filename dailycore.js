(function(){
 const DAILY_OFFSET_MS=8*60*60*1000;
 const DEFAULT_DAILY_LIMITS=Object.freeze({bounty:20,arena:20});

 function finiteInt(value,fallback=0){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)&&n>=0?n:fallback;
 }
 function gameDailyDateKey(timestamp=Date.now()){
  const t=Number(timestamp);
  const safe=Number.isFinite(t)?t:Date.now();
  return new Date(safe+DAILY_OFFSET_MS).toISOString().slice(0,10);
 }
 function blankDailyState(dateKey=gameDailyDateKey()){
  return {
   dateKey,
   bounty:{used:0},
   arena:{used:0},
   voidMirage:{highestFloor:0,claimed:false}
  };
 }
 function dailyDungeonLimit(mode){
  return Math.max(0,Math.floor(Number(DEFAULT_DAILY_LIMITS[mode])||0));
 }
 function normalizeDailyState(target,timestamp=Date.now()){
  if(!target||typeof target!=="object")return null;
  const key=gameDailyDateKey(timestamp);
  if(!target.daily||typeof target.daily!=="object"||Array.isArray(target.daily))target.daily=blankDailyState(key);
  const daily=target.daily;
  if(daily.dateKey!==key){
   Object.assign(daily,blankDailyState(key));
   return daily;
  }
  daily.dateKey=key;
  if(!daily.bounty||typeof daily.bounty!=="object"||Array.isArray(daily.bounty))daily.bounty={used:0};
  if(!daily.arena||typeof daily.arena!=="object"||Array.isArray(daily.arena))daily.arena={used:0};
  if(!daily.voidMirage||typeof daily.voidMirage!=="object"||Array.isArray(daily.voidMirage))daily.voidMirage={highestFloor:0,claimed:false};
  daily.bounty.used=Math.min(dailyDungeonLimit("bounty"),finiteInt(daily.bounty.used,0));
  daily.arena.used=Math.min(dailyDungeonLimit("arena"),finiteInt(daily.arena.used,0));
  daily.voidMirage.highestFloor=finiteInt(daily.voidMirage.highestFloor,0);
  daily.voidMirage.claimed=daily.voidMirage.claimed===true;
  return daily;
 }
 function ensureDailyState(timestamp=Date.now()){
  return normalizeDailyState(state,timestamp);
 }
 function modeState(mode){
  const daily=ensureDailyState();
  if(mode==="bounty")return daily?.bounty||null;
  if(mode==="arena")return daily?.arena||null;
  return null;
 }
 function dailyDungeonStatus(mode){
  const row=modeState(mode),limit=dailyDungeonLimit(mode),used=row?Math.min(limit,finiteInt(row.used,0)):0;
  return {mode:String(mode||""),used,remaining:Math.max(0,limit-used),limit};
 }
 function dailyDungeonRemaining(mode){return dailyDungeonStatus(mode).remaining;}
 function consumeDailyDungeonUse(mode,amount=1){
  const row=modeState(mode),limit=dailyDungeonLimit(mode),need=Math.max(1,finiteInt(amount,1));
  if(!row||limit<=0)return {ok:false,reason:"unsupported_daily_mode",used:0,remaining:0,limit};
  const used=Math.min(limit,finiteInt(row.used,0));
  if(used+need>limit)return {ok:false,reason:"daily_limit",used,remaining:Math.max(0,limit-used),limit};
  row.used=used+need;
  return {ok:true,used:row.used,remaining:Math.max(0,limit-row.used),limit};
 }
 function voidMirageDailyStatus(){
  const daily=ensureDailyState(),row=daily?.voidMirage||{highestFloor:0,claimed:false};
  const highestFloor=finiteInt(row.highestFloor,0);
  const claimed=row.claimed===true;
  const baseReward=highestFloor*2;
  const multiplier=typeof vipDungeonPointMultiplier==="function"?vipDungeonPointMultiplier():1;
  const reward=typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(baseReward):Math.floor(baseReward*multiplier);
  return {highestFloor,claimed,baseReward,reward,multiplier,canClaim:highestFloor>0&&!claimed};
 }
 function recordVoidMirageDailyFloor(floor){
  const daily=ensureDailyState();
  if(!daily?.voidMirage)return voidMirageDailyStatus();
  const f=Math.max(1,finiteInt(floor,1));
  if(f>daily.voidMirage.highestFloor)daily.voidMirage.highestFloor=f;
  return voidMirageDailyStatus();
 }
 function claimVoidMirageDailyReward(){
  const status=voidMirageDailyStatus();
  if(status.claimed)return {ok:false,reason:"already_claimed",...status};
  if(status.highestFloor<=0)return {ok:false,reason:"no_daily_record",...status};
  if(typeof addDungeonPoints!=="function")return {ok:false,reason:"vip_point_system_missing",...status};
  const result=addDungeonPoints(status.baseReward);
  const daily=ensureDailyState();
  daily.voidMirage.claimed=true;
  if(typeof save==="function")save(false);
  return {ok:true,highestFloor:status.highestFloor,baseReward:status.baseReward,awarded:Math.max(0,Math.floor(Number(result?.added)||0)),points:Math.max(0,Math.floor(Number(state?.vipPoints)||0)),claimed:true,multiplier:status.multiplier,canClaim:false};
 }

 window.DAILY_TIMEZONE_OFFSET_MINUTES=480;
 window.DAILY_DUNGEON_LIMITS=DEFAULT_DAILY_LIMITS;
 window.gameDailyDateKey=gameDailyDateKey;
 window.blankDailyState=blankDailyState;
 window.normalizeDailyState=normalizeDailyState;
 window.ensureDailyState=ensureDailyState;
 window.dailyDungeonLimit=dailyDungeonLimit;
 window.dailyDungeonStatus=dailyDungeonStatus;
 window.dailyDungeonRemaining=dailyDungeonRemaining;
 window.consumeDailyDungeonUse=consumeDailyDungeonUse;
 window.voidMirageDailyStatus=voidMirageDailyStatus;
 window.recordVoidMirageDailyFloor=recordVoidMirageDailyFloor;
 window.claimVoidMirageDailyReward=claimVoidMirageDailyReward;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeDailyState);
})();