(function(){
 const baseSleep=window.sleep;
 if(typeof baseSleep!=="function")return;

 const MAIN_START_DELAY=120;
 const MAIN_WINDUP_DELAY=70;
 const MAIN_NORMAL_DELAY=115;
 const MAIN_BOSS_DELAY=160;
 const MAIN_END_DELAY=170;
 const MAIN_PRE_DELAY=60;
 const MAIN_NORMAL_GAP=140;
 const MAIN_ELITE_GAP=220;
 const SPECIAL_DELAY_MAP=new Map([
  [180,120],
  [120,70],
  [190,115],
  [220,135],
  [250,170]
 ]);
 let specialPacingActive=false;

 window.MAIN_BATTLE_PACING_VERSION=1;
 window.mainBattleGapMs=function(kind){return kind==="elite"?MAIN_ELITE_GAP:MAIN_NORMAL_GAP;};

 function mainFlowSleep(ms){
  const n=Math.max(0,Number(ms)||0);
  if(typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("main"))return window.backgroundProgressSleep(n,"main");
  return baseSleep(n);
 }

 window.estimateMainBattleDurationMs=function(result){
  const r=result&&typeof result==="object"?result:{};
  const actionDelay=r?.e?.kind==="boss"?MAIN_BOSS_DELAY:MAIN_NORMAL_DELAY;
  const events=Array.isArray(r.events)?r.events:[];
  let actions=events.filter(ev=>ev&&(ev.type==="attack"||ev.type==="dodge")).length;
  if(!actions)actions=Math.max(1,Math.floor(Number(r.turns)||1));
  const gap=window.mainBattleGapMs(r?.e?.kind);
  return MAIN_PRE_DELAY+MAIN_START_DELAY+actions*(MAIN_WINDUP_DELAY+actionDelay)+MAIN_END_DELAY+gap;
 };

 window.sleep=function(ms){
  const n=Number(ms)||0;
  const paced=specialPacingActive?(SPECIAL_DELAY_MAP.get(n)??n):n;
  return mainFlowSleep(paced);
 };
 window.mainBattlePresentationSleep=function(ms){return mainFlowSleep(ms);};
 window.MAIN_BATTLE_BACKGROUND_PRESENTATION_VERSION=1;

 window.MAIN_BATTLE_STRUCTURED_PRESENTATION_OWNER_VERSION=1;


 if(typeof window.maybeHandleSpecialEncounter==="function"){
  const baseMaybeHandleSpecialEncounter=window.maybeHandleSpecialEncounter;
  window.maybeHandleSpecialEncounter=async function(...args){
   specialPacingActive=true;
   try{return await baseMaybeHandleSpecialEncounter(...args);}
   finally{specialPacingActive=false;}
  };
 }
})();