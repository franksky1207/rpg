/* T3-A: non-authoritative B presentation policy; no storage, settlement or renderer side effects. */
(function(global){
"use strict";
const VERSION=1;
const VALID_QUALITY=Object.freeze(["high","standard","minimal"]);
const QUALITY=Object.freeze({high:"high",standard:"medium",minimal:"low"});
function resolve(options={}){
 const legacy=options.legacyMode==="3d"?"3d":"text";
 const quality=VALID_QUALITY.includes(options.quality)?options.quality:"standard";
 const requested=options.requestedMode==="hybrid-b"?"hybrid-b":"text";
 const ready=options.rendererReady===true&&options.webglAvailable===true&&options.assetsVerified===true;
 const blocked=options.background===true||options.contextLost===true||options.activeOwnerUnsafe===true;
 const safe=requested==="hybrid-b"&&ready&&!blocked&&quality!=="minimal";
 return Object.freeze({version:VERSION,legacyPreference:legacy,quality,assetTier:QUALITY[quality],
  requestedMode:requested,effectiveMode:safe?"hybrid-b":"text",
  reason:safe?"ready":requested==="text"?"text-selected":quality==="minimal"?"minimal-fallback":blocked?"unsafe-or-background":"renderer-unavailable",
  authoritativeOwner:"formal-combat",canCommit:false,canCreateCombatEvents:false});
}
function fromCurrent(options={}){
 const mode=global.CivilizationPresentationMode;
 const legacy=mode?.accountPreference?.()??mode?.currentMode?.()??"text";
 return resolve({...options,legacyMode:legacy});
}
// Never enable unreleased 3D or persist a migrated preference in T3-A.
global.CivilizationHybridBattlePolicy=Object.freeze({version:VERSION,qualityIds:VALID_QUALITY,resolve,fromCurrent});
})(window);

/* T3-B formal read-only event relay. No renderer, DOM, storage or combat owner writes.
   A future renderer may attach only after a separately released formal asset gate. */
(function(global){
"use strict";
if(global.CivilizationFormalHybridBridge)return;
const VERSION=1,MODES=Object.freeze(["main","bounty","arena","mirror","void","calamity","alternate","special","review"]);
const legal=Object.freeze({main:[1,2,3],bounty:[1,2],arena:[1,2,3],mirror:[1,2,3],void:[1,2,3],calamity:[1,2],alternate:[1,2,3],special:[1,2],review:[1,2,3]});
let dispose=null,sink=null,lastBattle=null,lastSeq=-1,observed=0,rejected=0;
function detach(){if(dispose){try{dispose();}catch(_){}dispose=null;}sink=null;lastBattle=null;lastSeq=-1;}
function allowed(e){
 return !!e&&e.lane==="formal"&&e.schema===1&&typeof e.battleId==="string"&&Number.isSafeInteger(e.seq)&&
  legal[e.mode]?.includes(e.world)===true&&e.availability==="authoritative"&&e.expired===false&&
  global.CivilizationCombatEvents?.validateEvent?.(e)===true&&global.CivilizationCombatEvents?.isCurrent?.(e)===true;
}
function receive(e){
 if(!allowed(e)){rejected++;return;}
 if(e.checkpoint){lastBattle=e.battleId;lastSeq=e.seq;}
 else{if(lastBattle!==e.battleId){lastBattle=e.battleId;lastSeq=-1;}
  if(e.seq<=lastSeq){rejected++;return;}lastSeq=e.seq;}
 observed++;
 if(!sink)return;
 // Observe only. Even hostile/throwing visual sinks cannot change event owners.
 try{sink(e);}catch(_){rejected++;}
}
function attach(consumer){
 if(typeof consumer!=="function"||sink)return false;
 if(dispose){sink=consumer;return true;}
 const events=global.CivilizationCombatEvents;
 if(!events||typeof events.subscribe!=="function")return false;
 sink=consumer;
 try{dispose=events.subscribe(receive,{lane:"formal"});return true;}
 catch(_){sink=null;dispose=null;return false;}
}
function monitor(){
 if(dispose)return true;
 const events=global.CivilizationCombatEvents;
 if(!events||typeof events.subscribe!=="function")return false;
 try{dispose=events.subscribe(receive,{lane:"formal"});return true;}
 catch(_){dispose=null;return false;}
}
global.addEventListener?.("pagehide",detach);
global.addEventListener?.("civilization-auth-signed-out",detach);
// No eager subscription: keep formal consumer count zero until visual mode attaches.
global.CivilizationFormalHybridBridge=Object.freeze({version:VERSION,supportedModes:MODES,legalWorlds:legal,
 attach,monitor,detach,diagnostics:()=>Object.freeze({version:VERSION,observed,rejected,subscribed:!!dispose,consumerAttached:!!sink,
 lastBattle,lastSeq,rendererReleased:false,canCommit:false,canCreateEvents:false})});
})(window);
