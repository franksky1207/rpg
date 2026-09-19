(function(){
 const baseSleep=window.sleep;
 if(typeof baseSleep!=="function")return;

 const COMBAT_OUTER_GAP_MS=140;
 const COMBAT_OUTER_MODES=Object.freeze(["main","bounty","arena","mirror","void","calamity"]);
 function outerGapMs(mode){
  const key=String(mode||"");
  if(!COMBAT_OUTER_MODES.includes(key))throw new Error(`未知 Combat Outer Pacing mode：${mode}`);
  return COMBAT_OUTER_GAP_MS;
 }

 function mainFlowSleep(ms){
  const n=Math.max(0,Number(ms)||0);
  if(typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("main"))return window.backgroundProgressSleep(n,"main");
  return baseSleep(n);
 }

 window.COMBAT_OUTER_PACING_VERSION=2;
 window.COMBAT_OUTER_GAP_MS=COMBAT_OUTER_GAP_MS;
 window.COMBAT_OUTER_MODES=COMBAT_OUTER_MODES.slice();
 window.combatOuterGapMs=function(mode){return outerGapMs(mode);};
 window.MAIN_BATTLE_PACING_VERSION=2;
 window.MAIN_BATTLE_FLOW_SLEEP_VERSION=1;
 window.mainBattleGapMs=function(){return outerGapMs("main");};
 window.mainBattleFlowSleep=function(ms){return mainFlowSleep(ms);};
 window.mainBattlePresentationSleep=function(ms){return mainFlowSleep(ms);};
 window.MAIN_BATTLE_BACKGROUND_PRESENTATION_VERSION=1;
 window.MAIN_BATTLE_STRUCTURED_PRESENTATION_OWNER_VERSION=1;
})();