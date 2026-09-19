(function(){
 const baseSleep=window.sleep;
 if(typeof baseSleep!=="function")return;

 const COMBAT_OUTER_PACING=Object.freeze({
  main:Object.freeze({normal:140,elite:220,boss:140}),
  void:Object.freeze({floor:350}),
  calamity:Object.freeze({battle:350})
 });
 function outerGapMs(mode,kind=""){
  const group=COMBAT_OUTER_PACING[String(mode||"")];
  if(!group)throw new Error(`未知 Combat Outer Pacing mode：${mode}`);
  if(mode==="main")return Number(group[kind==="elite"?"elite":kind==="boss"?"boss":"normal"]);
  const key=mode==="void"?"floor":"battle";
  return Number(group[key]);
 }

 function mainFlowSleep(ms){
  const n=Math.max(0,Number(ms)||0);
  if(typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("main"))return window.backgroundProgressSleep(n,"main");
  return baseSleep(n);
 }

 window.COMBAT_OUTER_PACING_VERSION=1;
 window.combatOuterGapMs=function(mode,kind=""){return outerGapMs(mode,kind);};
 window.MAIN_BATTLE_PACING_VERSION=2;
 window.MAIN_BATTLE_FLOW_SLEEP_VERSION=1;
 window.mainBattleGapMs=function(kind){return outerGapMs("main",kind);};
 window.mainBattleFlowSleep=function(ms){return mainFlowSleep(ms);};
 window.mainBattlePresentationSleep=function(ms){return mainFlowSleep(ms);};
 window.MAIN_BATTLE_BACKGROUND_PRESENTATION_VERSION=1;
 window.MAIN_BATTLE_STRUCTURED_PRESENTATION_OWNER_VERSION=1;
})();