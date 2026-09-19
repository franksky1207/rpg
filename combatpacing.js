(function(){
 const baseSleep=window.sleep;
 if(typeof baseSleep!=="function")return;

 const MAIN_NORMAL_GAP=140;
 const MAIN_ELITE_GAP=220;

 function mainFlowSleep(ms){
  const n=Math.max(0,Number(ms)||0);
  if(typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("main"))return window.backgroundProgressSleep(n,"main");
  return baseSleep(n);
 }

 window.MAIN_BATTLE_PACING_VERSION=2;
 window.MAIN_BATTLE_FLOW_SLEEP_VERSION=1;
 window.mainBattleGapMs=function(kind){return kind==="elite"?MAIN_ELITE_GAP:MAIN_NORMAL_GAP;};
 window.mainBattleFlowSleep=function(ms){return mainFlowSleep(ms);};
 window.mainBattlePresentationSleep=function(ms){return mainFlowSleep(ms);};
 window.MAIN_BATTLE_BACKGROUND_PRESENTATION_VERSION=1;
 window.MAIN_BATTLE_STRUCTURED_PRESENTATION_OWNER_VERSION=1;
})();