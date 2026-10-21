// Shared visual-height contract for both formal combat and GM inspection.
// The target is the monster's visible painted pixels / player's visible painted pixels.
// All dimensions are CSS pixels. Stage scale may differ, but the ratio does not.
export const MONSTER_KIND_SCALE=Object.freeze({
 'dr-02':.92,'hm-01':1,'hm-02':1.06,'hm-04':1.24,'cmd-01':1.24,'cmd-03':1.72,
 'mech-01':1.38,'mech-02':1.53,'mech-03':1.78,'veh-02':1.3,
 'ship-01':1.38,'ship-04':1.78,'fort-01':1.72,'fort-03':1.85,
 'beast-01':1.16,'beast-03':1.65,'bio-02':1.54,'core-01':1.25,'core-03':1.74,'energy-01':1.34
});
export function monsterVisibleSize({assetId,bounds,visual={},playerVisibleHeight,stageWidth,stageHeight}){
 const [l,t,r,b]=bounds;
 const paintedHeight=Math.min(.68,.68*(b-t)/Math.max(1,r-l));
 const paintedWidth=Math.min(.68,.68*(r-l)/Math.max(1,b-t));
 const kind=MONSTER_KIND_SCALE[assetId]||1;
 const identityScale=Number(visual.scale)||1;
 const targetRatio=Math.max(.9,Math.min(2.3,kind*identityScale));
 const required=playerVisibleHeight*targetRatio/Math.max(.01,paintedHeight);
 const fit=Math.min(stageHeight*.98/Math.max(.01,paintedHeight),stageWidth*.48/Math.max(.01,paintedWidth));
 const minimum=playerVisibleHeight*.9/Math.max(.01,paintedHeight);
 const size=Math.max(minimum,Math.min(required,fit));
 return {size,targetRatio,actualRatio:size*paintedHeight/Math.max(.01,playerVisibleHeight),paintedWidth,paintedHeight};
}
