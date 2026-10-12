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
