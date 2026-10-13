/* T3-B: formal-only visual session controller. Does not render, tick combat, save or emit events. */
(function(global){
"use strict";
if(global.CivilizationFormalBSession)return;
const endings=new Set(["cancelled","presentation-ended","presentation-skipped"]);
const copy=x=>JSON.parse(JSON.stringify(x));
const deepFreeze=x=>{if(x&&typeof x==="object"){Object.values(x).forEach(deepFreeze);Object.freeze(x);}return x;};
function create(options={}){
 const projection=options.projection||global.CivilizationFormalBProjection;
 const bridge=options.bridge||global.CivilizationFormalHybridBridge;
 const onFrame=typeof options.onFrame==="function"?options.onFrame:null;
 let battleId=null,lastSeq=-1,ended=false,disposed=false,frames=0,dropped=0;
 const visualReady=()=>options.assetsVerified===true&&options.rendererReady===true&&options.webglAvailable===true&&!options.contextLost&&!options.background;
 function accept(event){
  if(disposed||!projection?.convert)return false;
  const frame=projection.convert(event);
  if(!frame||frame.nonAuthoritative!==true||frame.canCommit!==false||frame.canEmitCombatEvents!==false){dropped++;return false;}
  if(battleId!==frame.battleId){battleId=frame.battleId;lastSeq=-1;ended=false;}
  if(ended||frame.seq<=lastSeq){dropped++;return false;}
  lastSeq=frame.seq;
  if(endings.has(frame.type))ended=true;
  // Never display an unverified, unmapped or background visual as a finished B stage.
  if(!visualReady()||frame.assetStatus!=="verified"){dropped++;return false;}
  if(!onFrame)return false;
  try{onFrame(frame);frames++;return true;}catch(_){dropped++;return false;}
 }
 function attach(){
  if(disposed||!bridge?.attach)return false;
  return bridge.attach(accept);
 }
 function detach(){if(disposed)return;disposed=true;bridge?.detach?.();battleId=null;lastSeq=-1;ended=true;}
 function snapshot(){return deepFreeze(copy({battleId,lastSeq,ended,disposed,frames,dropped,ready:visualReady(),canCommit:false,canEmitCombatEvents:false}));}
 return Object.freeze({accept,attach,detach,snapshot});
}
global.CivilizationFormalBSession=Object.freeze({version:1,create,fixtureAllowed:false,canCommit:false});
})(window);
