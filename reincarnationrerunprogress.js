(function(){
 const VERSION=2;
 const NORMALIZATION_VERSION=1;
 const baseFightOnce=typeof window.fightOnce==="function"?window.fightOnce:null;
 const baseSecondWorldSettlement=typeof window.settleSecondWorldBossVictory==="function"?window.settleSecondWorldBossVictory:null;
 const baseMigrateSave=typeof window.migrateSave==="function"?window.migrateSave:null;

 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function targetState(target=null){return target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);}
 function rerunCount(target){return Math.max(0,whole(target?.reincarnation?.count,0));}
 function isRerun(target){return rerunCount(target)>0;}
 function w1Active(target){return typeof window.isFirstWorldReincarnationRerun==="function"&&window.isFirstWorldReincarnationRerun(target)===true;}
 function w2Active(target){return typeof window.isSecondWorldReincarnationRerun==="function"&&window.isSecondWorldReincarnationRerun(target)===true;}
 function highestTrueIndex(list){if(!Array.isArray(list))return -1;for(let i=list.length-1;i>=0;i--)if(list[i]===true)return i;return -1;}

 function fillFirstWorld(mapIndex,target,requireCurrentWorld=true){
  const s=targetState(target),maps=Array.isArray(window.MAPS)?window.MAPS:(typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS:[]),raw=whole(mapIndex,-1);
  if(!s||!maps.length||!isRerun(s)||(requireCurrentWorld&& !w1Active(s)))return {ok:false,reason:"not-rerun",changed:false};
  if(raw<0||raw>=maps.length)return {ok:false,reason:"invalid-map",changed:false};
  const end=Math.min(maps.length-1,raw);
  if(!Array.isArray(s.mapProgress))s.mapProgress=[];if(!Array.isArray(s.bossProgress))s.bossProgress=[];if(!Array.isArray(s.bossLocked))s.bossLocked=[];if(!Array.isArray(s.bossKilled))s.bossKilled=[];
  let changed=false;
  for(let i=0;i<=end;i++){
   const row=Array.isArray(s.mapProgress[i])?s.mapProgress[i]:[0,0,0,0];
   const next=[0,1,2,3].map(slot=>Math.max(10,whole(row[slot],0)));
   if(!Array.isArray(s.mapProgress[i])||next.some((value,slot)=>Number(row[slot])!==value)){s.mapProgress[i]=next;changed=true;}
   if(whole(s.bossProgress[i],0)<10){s.bossProgress[i]=10;changed=true;}
   if(s.bossLocked[i]!==false){s.bossLocked[i]=false;changed=true;}
   if(s.bossKilled[i]!==true){s.bossKilled[i]=true;changed=true;}
  }
  const unlocked=Math.min(maps.length-1,end+1),before=Math.max(0,whole(s.unlockedMap,0));
  if(before<unlocked){s.unlockedMap=unlocked;changed=true;}
  return {ok:true,world:1,endMap:end,completedMaps:end+1,changed,unlockedMap:Math.max(0,whole(s.unlockedMap,0))};
 }
 function backfillFirstWorld(mapIndex,target=null){return fillFirstWorld(mapIndex,target,true);}

 function fillSecondWorld(bossIndex,target,options={},requireCurrentWorld=true){
  const s=targetState(target),list=s?.secondWorld?.mainline?.bossKilled,count=Math.max(0,whole(window.SECOND_WORLD_BOSS_COUNT,100)),raw=whole(bossIndex,-1);
  if(!s||!isRerun(s)||!Array.isArray(list)||count<=0||(requireCurrentWorld&& !w2Active(s)))return {ok:false,reason:"not-rerun",changed:false};
  if(raw<0||raw>=count)return {ok:false,reason:"invalid-boss",changed:false};
  const end=Math.min(count-1,raw),includeTarget=options.includeTarget!==false,limit=includeTarget?end:end-1;let changed=false;
  for(let i=0;i<=limit;i++)if(list[i]!==true){list[i]=true;changed=true;}
  return {ok:true,world:2,endBoss:end,completedBosses:Math.max(0,limit+1),includeTarget,changed};
 }
 function backfillSecondWorld(bossIndex,target=null,options={}){return fillSecondWorld(bossIndex,target,options,true);}

 function normalizeExistingRerunProgress(target){
  const s=targetState(target);
  if(!s||!isRerun(s))return Object.freeze({ok:true,rerun:false,changed:false,world1:null,world2:null});
  const w1Highest=highestTrueIndex(s.bossKilled),w2Highest=highestTrueIndex(s?.secondWorld?.mainline?.bossKilled);
  const world1=w1Highest>=0?fillFirstWorld(w1Highest,s,false):{ok:true,world:1,endMap:-1,completedMaps:0,changed:false};
  const world2=w2Highest>=0?fillSecondWorld(w2Highest,s,{includeTarget:true},false):{ok:true,world:2,endBoss:-1,completedBosses:0,includeTarget:true,changed:false};
  return Object.freeze({ok:world1?.ok!==false&&world2?.ok!==false,rerun:true,changed:world1?.changed===true||world2?.changed===true,world1,world2});
 }

 window.REINCARNATION_RERUN_MAINLINE_BACKFILL_VERSION=VERSION;
 window.REINCARNATION_RERUN_PROGRESS_NORMALIZATION_VERSION=NORMALIZATION_VERSION;
 window.applyFirstWorldReincarnationRerunConquest=backfillFirstWorld;
 window.applySecondWorldReincarnationRerunConquest=backfillSecondWorld;
 window.normalizeExistingReincarnationRerunProgress=normalizeExistingRerunProgress;

 if(typeof baseMigrateSave==="function")window.migrateSave=function(...args){
  const migrated=baseMigrateSave.apply(this,args),normalization=normalizeExistingRerunProgress(migrated);
  const prior=window.LAST_SAVE_MIGRATION_REPORT&&typeof window.LAST_SAVE_MIGRATION_REPORT==="object"?window.LAST_SAVE_MIGRATION_REPORT:{};
  window.LAST_SAVE_MIGRATION_REPORT={...prior,rerunProgressNormalizationVersion:NORMALIZATION_VERSION,rerunProgressNormalized:normalization.changed===true,rerunProgressWorld1End:Number(normalization.world1?.endMap??-1),rerunProgressWorld2End:Number(normalization.world2?.endBoss??-1)};
  return migrated;
 };

 if(typeof baseFightOnce==="function")window.fightOnce=function(mapIdx,enemyIdx,...args){
  const result=baseFightOnce.call(this,mapIdx,enemyIdx,...args);
  if(result?.win===true&&result?.e?.kind==="boss"&&w1Active(state))backfillFirstWorld(mapIdx,state);
  return result;
 };

 if(typeof baseSecondWorldSettlement==="function")window.settleSecondWorldBossVictory=function(value,...args){
  const s=targetState(),index=whole(value,-1),count=Math.max(0,whole(window.SECOND_WORLD_BOSS_COUNT,100)),rerun=w2Active(s)&&index>=0&&index<count;
  if(!rerun)return baseSecondWorldSettlement.call(this,value,...args);
  const list=s?.secondWorld?.mainline?.bossKilled,previous=Array.isArray(list)?list.slice(0,index):[];
  const restore=()=>{if(Array.isArray(s?.secondWorld?.mainline?.bossKilled))for(let i=0;i<index;i++)s.secondWorld.mainline.bossKilled[i]=previous[i]===true;};
  backfillSecondWorld(index,s,{includeTarget:false});
  try{
   const result=baseSecondWorldSettlement.call(this,value,...args);
   if(result?.ok===true)return result;
   restore();return result;
  }catch(error){restore();throw error;}
 };

 window.REINCARNATION_RERUN_MAINLINE_BACKFILL_INSTALL_REPORT=Object.freeze({version:VERSION,normalizationVersion:NORMALIZATION_VERSION,migrateSaveWrapped:typeof baseMigrateSave==="function",w1FightWrapped:typeof baseFightOnce==="function",w2SettlementWrapped:typeof baseSecondWorldSettlement==="function"});
})();
