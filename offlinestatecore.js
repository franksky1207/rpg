(function(){
 const VERSION=1;
 const OFFLINE_BATTLE_SAMPLE_VERSION=3;
 const OFFLINE_SAMPLES_PER_SPEED=8;
 const OFFLINE_COMBAT_SPEEDS=Object.freeze([1,1.5,2]);
 const REAL_BATTLE_MIN_MS=100;
 const REAL_BATTLE_MAX_ACTUAL_MS=300000;
 const REAL_BATTLE_MAX_CYCLE_MS=601000;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteInteger(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function sampleMultiplier(playerLevel,enemyLevel){
  const gap=Math.max(0,finiteInteger(playerLevel,1)-finiteInteger(enemyLevel,1));
  if(gap<=3)return 1;
  if(gap<=6)return 1.30;
  if(gap<=10)return 1.60;
  if(gap<=15)return 2;
  return null;
 }
 function normalizeSample(row){
  if(!isObject(row)||Number(row.sampleVersion)!==OFFLINE_BATTLE_SAMPLE_VERSION)return null;
  const combatSpeed=Number(row.combatSpeed);
  const actualMs=Math.round(Number(row.actualMs)),cycleMs=Math.round(Number(row.cycleMs)),adjustedMs=Math.round(Number(row.adjustedMs));
  const playerLevel=Math.max(1,finiteInteger(row.playerLevel,1)),enemyLevel=Math.max(1,finiteInteger(row.enemyLevel,1)),recordedAt=Math.max(0,finiteInteger(row.recordedAt,0));
  if(!OFFLINE_COMBAT_SPEEDS.includes(combatSpeed)||!Number.isFinite(actualMs)||actualMs<REAL_BATTLE_MIN_MS||actualMs>REAL_BATTLE_MAX_ACTUAL_MS||!Number.isFinite(cycleMs)||cycleMs<actualMs||cycleMs>REAL_BATTLE_MAX_CYCLE_MS||!Number.isFinite(adjustedMs)||adjustedMs<REAL_BATTLE_MIN_MS||adjustedMs>REAL_BATTLE_MAX_CYCLE_MS)return null;
  if(Number(row.world)===2||row.targetType==="boss"){
   const bossIndex=finiteInteger(row.bossIndex,-1),bossId=typeof row.bossId==="string"?row.bossId.trim():"";
   if(bossIndex<0||bossIndex>=100||!bossId)return null;
   return {sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:2,targetType:"boss",bossIndex,bossId,combatSpeed,actualMs,cycleMs,adjustedMs,playerLevel,enemyLevel,kind:"boss",multiplier:1,recordedAt};
  }
  const map=finiteInteger(row.map,-1),enemy=finiteInteger(row.enemy,-1),mapCount=Array.isArray(window.MAPS)?window.MAPS.length:(typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS.length:0);
  if(map<0||(mapCount>0&&map>=mapCount)||enemy<0||enemy>3)return null;
  const multiplier=sampleMultiplier(playerLevel,enemyLevel);
  if(multiplier==null)return null;
  return {sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:1,targetType:"mapEnemy",combatSpeed,actualMs,cycleMs,adjustedMs,playerLevel,enemyLevel,kind:row.kind==="elite"?"elite":"normal",map,enemy,multiplier,recordedAt};
 }
 function retainSamples(rows){
  const normalized=(Array.isArray(rows)?rows:[]).map(normalizeSample).filter(Boolean);
  const kept=[];
  OFFLINE_COMBAT_SPEEDS.forEach(speed=>{
   const matches=normalized.map((row,index)=>({row,index})).filter(entry=>Number(entry.row.combatSpeed)===speed).slice(-OFFLINE_SAMPLES_PER_SPEED);
   kept.push(...matches);
  });
  kept.sort((a,b)=>a.index-b.index);
  return kept.map(entry=>entry.row);
 }
 function freshOfflineState(now){
  return {battleSampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,lastSettledAt:now,farmMap:null,farmEnemy:null,avgBattleMs:0,sampleCount:0,battleSamples:[],maxObservedWallClock:now,timeLockUntil:0,pendingSettlement:null};
 }
 function normalizeOfflineSaveState(target,options={}){
  if(!isObject(target))return null;
  const sourceVersion=Math.max(1,finiteInteger(options.sourceVersion??target.saveVersion,1));
  const now=Math.max(0,finiteInteger(options.currentTime,Date.now()));
  if(sourceVersion<9||!isObject(target.offline)){
   target.offline=freshOfflineState(now);
   return target.offline;
  }
  const source=target.offline;
  const storedSampleVersion=Math.max(0,finiteInteger(source.battleSampleVersion,0));
  if(storedSampleVersion!==OFFLINE_BATTLE_SAMPLE_VERSION){
   source.battleSamples=[];
   source.farmMap=null;source.farmEnemy=null;source.avgBattleMs=0;source.sampleCount=0;source.pendingSettlement=null;
  }
  source.battleSampleVersion=OFFLINE_BATTLE_SAMPLE_VERSION;
  const rawTime=source.lastSettledAt==null?NaN:Number(source.lastSettledAt);
  source.lastSettledAt=Number.isFinite(rawTime)&&rawTime>=0&&rawTime<=now?Math.floor(rawTime):now;
  const priorMax=Number(source.maxObservedWallClock),observed=[now];
  if(Number.isFinite(priorMax)&&priorMax>=0)observed.push(priorMax);
  if(Number.isFinite(rawTime)&&rawTime>=0)observed.push(rawTime);
  source.maxObservedWallClock=Math.floor(Math.max(...observed));
  const lockUntil=Number(source.timeLockUntil);
  source.timeLockUntil=Number.isFinite(lockUntil)&&lockUntil>0?Math.floor(lockUntil):0;
  const map=source.farmMap==null?NaN:Number(source.farmMap),enemy=source.farmEnemy==null?NaN:Number(source.farmEnemy),mapCount=Array.isArray(window.MAPS)?window.MAPS.length:(typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS.length:0);
  source.farmMap=Number.isInteger(map)&&map>=0&&(mapCount<=0||map<mapCount)?map:null;
  source.farmEnemy=Number.isInteger(enemy)&&enemy>=0&&enemy<=3?enemy:null;
  const avg=Number(source.avgBattleMs);
  source.avgBattleMs=Number.isFinite(avg)&&avg>=600&&avg<=60000?Math.round(avg):0;
  source.sampleCount=Math.max(0,Math.min(20,finiteInteger(source.sampleCount,0)));
  if(source.sampleCount<=0||source.avgBattleMs<=0||source.farmMap==null||source.farmEnemy==null){source.farmMap=null;source.farmEnemy=null;source.avgBattleMs=0;source.sampleCount=0;}
  source.battleSamples=retainSamples(source.battleSamples);
  if(!isObject(source.pendingSettlement))source.pendingSettlement=null;
  return source;
 }

 window.OFFLINE_STATE_NORMALIZATION_VERSION=VERSION;
 window.OFFLINE_BATTLE_SAMPLE_VERSION=OFFLINE_BATTLE_SAMPLE_VERSION;
 window.OFFLINE_STATE_SAMPLES_PER_SPEED=OFFLINE_SAMPLES_PER_SPEED;
 window.OFFLINE_STATE_COMBAT_SPEEDS=Array.from(OFFLINE_COMBAT_SPEEDS);
 window.normalizeOfflineSaveState=normalizeOfflineSaveState;
 window.normalizeOfflineBattleSamples=retainSamples;
})();
