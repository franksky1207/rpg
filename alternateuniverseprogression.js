(function(){
 const ALTERNATE_UNIVERSE_PROGRESSION_VERSION=1;
 const ALTERNATE_UNIVERSE_COMPLETION_VERSION=1;

 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function maxDepth(){return Math.max(1,whole(window.ALTERNATE_UNIVERSE_DATA_MAX_DEPTH||window.ALTERNATE_UNIVERSE_MAX_DEPTH,1000));}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:(window.state&&typeof window.state==="object"?window.state:null);}catch(_){return window.state&&typeof window.state==="object"?window.state:null;}}
 function unlocked(target=currentState()){return typeof window.alternateUniverseUnlocked==="function"?window.alternateUniverseUnlocked(target)===true:target?.reincarnation?.alternateUniverse?.unlocked===true;}
 function deepest(target=currentState()){const raw=typeof window.alternateUniverseDeepestCleared==="function"?window.alternateUniverseDeepestCleared(target):target?.reincarnation?.alternateUniverse?.deepestCleared;return clamp(whole(raw,0),0,maxDepth());}
 function depthInfo(depth){return typeof window.alternateUniverseDepthInfo==="function"?window.alternateUniverseDepthInfo(depth):null;}
 function snapshot(target=currentState()){
  const limit=maxDepth(),isUnlocked=!!target&&unlocked(target),cleared=isUnlocked?deepest(target):0,completed=isUnlocked&&cleared>=limit;
  const nextDepth=isUnlocked&&!completed?cleared+1:null;
  const nextInfo=nextDepth?depthInfo(nextDepth):null;
  const deepestInfo=cleared>0?depthInfo(cleared):null;
  return Object.freeze({
   version:ALTERNATE_UNIVERSE_PROGRESSION_VERSION,
   completionVersion:ALTERNATE_UNIVERSE_COMPLETION_VERSION,
   unlocked:isUnlocked,
   deepestCleared:cleared,
   maxDepth:limit,
   completed,
   completionRatio:limit>0?cleared/limit:0,
   remainingDepths:Math.max(0,limit-cleared),
   nextDepth,
   nextDepthInfo:nextInfo,
   deepestInfo,
   completedUniverses:Math.floor(cleared/5),
   totalUniverses:Math.floor(limit/5),
   completionText:completed?`${limit} / ${limit}`:`${cleared} / ${limit}`
  });
 }
 function challengeAccess(depth,target=currentState()){
  const status=snapshot(target),u=whole(depth,0);
  let reason="";
  if(!status.unlocked)reason="alternate-universe-locked";
  else if(u<1||u>status.maxDepth)reason="invalid-depth";
  else if(status.completed)reason="alternate-universe-completed";
  else if(u<=status.deepestCleared)reason="depth-already-cleared";
  else if(u!==status.nextDepth)reason="depth-not-reached";
  return Object.freeze({ok:!reason,reason,depth:u,status,formal:!reason,review:false});
 }
 function reviewAccess(depth,target=currentState()){
  const status=snapshot(target),u=whole(depth,0);
  let reason="";
  if(!status.unlocked)reason="alternate-universe-locked";
  else if(u<1||u>status.maxDepth)reason="invalid-depth";
  else if(u>status.deepestCleared)reason="depth-not-cleared";
  return Object.freeze({ok:!reason,reason,depth:u,status,formal:false,review:!reason});
 }
 function canAdvance(fromDepth,toDepth){
  const limit=maxDepth(),from=clamp(whole(fromDepth,0),0,limit),to=whole(toDepth,0);
  return from<limit&&to===from+1&&to>=1&&to<=limit;
 }

 window.ALTERNATE_UNIVERSE_PROGRESSION_VERSION=ALTERNATE_UNIVERSE_PROGRESSION_VERSION;
 window.ALTERNATE_UNIVERSE_COMPLETION_VERSION=ALTERNATE_UNIVERSE_COMPLETION_VERSION;
 window.alternateUniverseProgressionSnapshot=snapshot;
 window.alternateUniverseChallengeAccess=challengeAccess;
 window.alternateUniverseReviewAccess=reviewAccess;
 window.alternateUniverseCanAdvance=canAdvance;
})();
