(function(){
 const VERSION=3;
 const OFFLINE_BATTLE_SAMPLE_VERSION=4;
 const LEGACY_OFFLINE_BATTLE_SAMPLE_VERSION=3;
 const OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION=1;
 const OFFLINE_SAMPLE_OWNER_VERSION=1;
 const OFFLINE_RESET_OWNER_VERSION=1;
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
 function sourceSampleVersion(row){return Math.max(0,finiteInteger(row?.sampleVersion,0));}
 function normalizeSample(row){
  if(!isObject(row))return null;
  const sourceVersion=sourceSampleVersion(row);
  if(sourceVersion!==LEGACY_OFFLINE_BATTLE_SAMPLE_VERSION&&sourceVersion!==OFFLINE_BATTLE_SAMPLE_VERSION)return null;
  const combatSpeed=Number(row.combatSpeed);
  const actualMs=Math.round(Number(row.actualMs)),cycleMs=Math.round(Number(row.cycleMs)),adjustedMs=Math.round(Number(row.adjustedMs));
  const playerLevel=Math.max(1,finiteInteger(row.playerLevel,1)),recordedAt=Math.max(0,finiteInteger(row.recordedAt,0));
  if(!OFFLINE_COMBAT_SPEEDS.includes(combatSpeed)||!Number.isFinite(actualMs)||actualMs<REAL_BATTLE_MIN_MS||actualMs>REAL_BATTLE_MAX_ACTUAL_MS||!Number.isFinite(cycleMs)||cycleMs<actualMs||cycleMs>REAL_BATTLE_MAX_CYCLE_MS||!Number.isFinite(adjustedMs)||adjustedMs<REAL_BATTLE_MIN_MS||adjustedMs>REAL_BATTLE_MAX_CYCLE_MS)return null;
  if(sourceVersion===OFFLINE_BATTLE_SAMPLE_VERSION&&(Number(row.world)===3||row.targetType==="higher-dimensional")){
   return {sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:3,targetType:"higher-dimensional",combatSpeed,actualMs,cycleMs,adjustedMs,playerLevel,kind:"higher-dimensional",multiplier:1,recordedAt};
  }
  const enemyLevel=Math.max(1,finiteInteger(row.enemyLevel,1));
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
 function migratePendingSettlement(raw,target){
  if(!isObject(raw))return null;
  const sampleVersion=sourceSampleVersion(raw),world=finiteInteger(raw.world,0),phase=target?.thirdWorld?.entered===true?3:target?.secondWorld?.entered===true?2:1;
  if(sampleVersion!==LEGACY_OFFLINE_BATTLE_SAMPLE_VERSION&&sampleVersion!==OFFLINE_BATTLE_SAMPLE_VERSION)return null;
  if(world!==phase)return null;
  if(world===3){
   if(sampleVersion!==OFFLINE_BATTLE_SAMPLE_VERSION||raw.targetType!=="higher-dimensional")return null;
   return {...raw,sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:3,targetType:"higher-dimensional"};
  }
  if(world===2&&raw.targetType!=="boss")return null;
  if(world===1&&raw.targetType!=="mapEnemy")return null;
  return {...raw,sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION};
 }
 function freshOfflineState(now){
  return {battleSampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,lastSettledAt:now,farmMap:null,farmEnemy:null,avgBattleMs:0,sampleCount:0,battleSamples:[],maxObservedWallClock:now,timeLockUntil:0,pendingSettlement:null};
 }
 function restoreOfflineObject(target,snapshot){
  if(!isObject(target)||!isObject(snapshot))return false;
  Object.keys(target).forEach(key=>{if(!Object.prototype.hasOwnProperty.call(snapshot,key))delete target[key];});
  Object.keys(snapshot).forEach(key=>{target[key]=snapshot[key];});
  return true;
 }
 function resetOfflineSaveState(target,options={}){
  if(!isObject(target))return null;
  const now=Math.max(0,finiteInteger(options.currentTime,Date.now()));
  const fresh=freshOfflineState(now);
  if(isObject(target.offline))restoreOfflineObject(target.offline,fresh);else target.offline=fresh;
  return target.offline;
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
  const migratable=storedSampleVersion===LEGACY_OFFLINE_BATTLE_SAMPLE_VERSION||storedSampleVersion===OFFLINE_BATTLE_SAMPLE_VERSION;
  if(!migratable){
   source.battleSamples=[];
   source.farmMap=null;source.farmEnemy=null;source.avgBattleMs=0;source.sampleCount=0;source.pendingSettlement=null;
  }else source.pendingSettlement=migratePendingSettlement(source.pendingSettlement,target);
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
 function appendOfflineBattleSample(target,row,options={}){
  if(!isObject(target))return Object.freeze({ok:false,reason:"target-invalid",persisted:false});
  const now=Math.max(0,finiteInteger(options.currentTime,Date.now()));
  const offline=normalizeOfflineSaveState(target,{sourceVersion:Number(target.saveVersion)||Number(window.SAVE_SCHEMA_VERSION)||1,currentTime:now});
  const normalized=normalizeSample(row);
  if(!offline||!normalized)return Object.freeze({ok:false,reason:"sample-invalid",persisted:false});
  let before=null;
  if(options.persist===true){try{before=JSON.parse(JSON.stringify(offline));}catch(_){return Object.freeze({ok:false,reason:"snapshot-failed",persisted:false});}}
  offline.battleSampleVersion=OFFLINE_BATTLE_SAMPLE_VERSION;
  offline.battleSamples=retainSamples([...(Array.isArray(offline.battleSamples)?offline.battleSamples:[]),normalized]);
  if(options.persist===true){
   const saveFn=typeof options.saveFn==="function"?options.saveFn:(typeof save==="function"?save:null);
   let saved=false;
   try{saved=typeof saveFn==="function"&&saveFn(false)===true;}catch(_){saved=false;}
   if(!saved){restoreOfflineObject(offline,before);return Object.freeze({ok:false,reason:"save-failed",persisted:false});}
  }
  return Object.freeze({ok:true,reason:"",persisted:options.persist===true,row:normalized,count:offline.battleSamples.length});
 }
 function runOfflineSampleOwnerIntegrity(){
  const errors=[],probe={saveVersion:16,thirdWorld:{entered:true},offline:freshOfflineState(1000)};
  for(let i=0;i<9;i++)appendOfflineBattleSample(probe,{sampleVersion:4,world:3,targetType:"higher-dimensional",combatSpeed:1,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:1000,recordedAt:1000+i},{currentTime:2000});
  appendOfflineBattleSample(probe,{sampleVersion:4,world:3,targetType:"higher-dimensional",combatSpeed:1.5,actualMs:800,cycleMs:940,adjustedMs:940,playerLevel:1000,recordedAt:2010},{currentTime:2000});
  if(probe.offline.battleSamples.filter(row=>row.combatSpeed===1).length!==8)errors.push({code:"RETENTION_PER_SPEED"});
  if(probe.offline.battleSamples.filter(row=>row.combatSpeed===1.5).length!==1)errors.push({code:"SPEED_POOL_ISOLATION"});
  resetOfflineSaveState(probe,{currentTime:3000});
  if(probe.offline.battleSampleVersion!==4||probe.offline.battleSamples.length!==0||probe.offline.pendingSettlement!==null||probe.offline.lastSettledAt!==3000)errors.push({code:"RESET_OWNER"});
  return Object.freeze({version:1,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.OFFLINE_STATE_NORMALIZATION_VERSION=VERSION;
 window.OFFLINE_BATTLE_SAMPLE_VERSION=OFFLINE_BATTLE_SAMPLE_VERSION;
 window.OFFLINE_LEGACY_BATTLE_SAMPLE_VERSION=LEGACY_OFFLINE_BATTLE_SAMPLE_VERSION;
 window.OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION=OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION;
 window.OFFLINE_SAMPLE_OWNER_VERSION=OFFLINE_SAMPLE_OWNER_VERSION;
 window.OFFLINE_RESET_OWNER_VERSION=OFFLINE_RESET_OWNER_VERSION;
 window.OFFLINE_STATE_SAMPLES_PER_SPEED=OFFLINE_SAMPLES_PER_SPEED;
 window.OFFLINE_STATE_COMBAT_SPEEDS=Array.from(OFFLINE_COMBAT_SPEEDS);
 window.normalizeOfflineSaveState=normalizeOfflineSaveState;
 window.normalizeOfflineBattleSamples=retainSamples;
 window.appendOfflineBattleSample=appendOfflineBattleSample;
 window.resetOfflineSaveState=resetOfflineSaveState;
 window.OFFLINE_SAMPLE_OWNER_INTEGRITY=runOfflineSampleOwnerIntegrity();
 if(!window.OFFLINE_SAMPLE_OWNER_INTEGRITY.passed)console.error("[文明戰線] Offline sample owner integrity error",window.OFFLINE_SAMPLE_OWNER_INTEGRITY.errors);
})();
