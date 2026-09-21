(function(){
 const VERSION=2;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const allowed=Array.isArray(window.COMBAT_SPEED_ALLOWED)?window.COMBAT_SPEED_ALLOWED.map(Number):[];
 const expectedAllowed=[1,1.5,2];

 if(Number(window.COMBAT_SPEED_CORE_VERSION)!==2)fail("CORE_VERSION","Combat Speed core 應為 V2",window.COMBAT_SPEED_CORE_VERSION);
 if(Number(window.COMBAT_SPEED_PLAYER_RULE_VERSION)!==2)fail("PLAYER_RULE_VERSION","玩家正式倍速規則 owner 應為 V2",window.COMBAT_SPEED_PLAYER_RULE_VERSION);
 if(Number(window.COMBAT_SPEED_GM_OVERRIDE_VERSION)!==1)fail("GM_OVERRIDE_VERSION","GM 倍速覆寫 owner 應為 V1",window.COMBAT_SPEED_GM_OVERRIDE_VERSION);
 if(JSON.stringify(allowed)!==JSON.stringify(expectedAllowed))fail("ALLOWED_SPEEDS","正式合法倍速應為 1／1.5／2",allowed);
 if(typeof window.playerCombatSpeedOptions!=="function"||typeof window.playerCombatSpeed!=="function"||typeof window.setPlayerCombatSpeed!=="function")fail("PLAYER_SPEED_API","玩家正式倍速 API 未完整載入",{options:typeof window.playerCombatSpeedOptions,get:typeof window.playerCombatSpeed,set:typeof window.setPlayerCombatSpeed});
 else{
  const entered=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered();
  const expectedOptions=entered?[1,1.5]:[1];
  const actualOptions=window.playerCombatSpeedOptions().map(Number);
  if(JSON.stringify(actualOptions)!==JSON.stringify(expectedOptions))fail("PLAYER_OPTIONS","玩家正式倍速選項與世界階段不符",{entered,expectedOptions,actualOptions});
  const formal=Number(window.playerCombatSpeed());
  if(!expectedOptions.includes(formal))fail("PLAYER_SPEED","玩家正式速度不在目前世界合法選項內",{formal,expectedOptions});
 }
 if(typeof window.effectiveCombatSpeed!=="function"||!expectedAllowed.includes(Number(window.effectiveCombatSpeed())))fail("EFFECTIVE_SPEED","目前有效倍速必須是正式合法值",typeof window.effectiveCombatSpeed==="function"?window.effectiveCombatSpeed():null);
 if(typeof window.combatSpeedScaledDelay!=="function")fail("SCALE_API","combatSpeedScaledDelay 未載入");
 else{
  const probes=[[1,[140,70,48,180]],[1.5,[93,47,32,120]],[2,[70,35,24,90]]];
  probes.forEach(([speed,expected])=>{
   const actual=[140,70,48,180].map(ms=>window.combatSpeedScaledDelay(ms,speed));
   if(JSON.stringify(actual)!==JSON.stringify(expected))fail("SCALE_PROFILE",`${speed}× delay 換算異常`,{expected,actual});
  });
 }
 if(Number(window.STRUCTURED_COMBAT_SPEED_AWARE_VERSION)!==1||typeof window.getStructuredCombatPacingForSpeed!=="function")fail("STRUCTURED_SPEED_OWNER","Structured Combat 尚未接上正式倍速 owner",{version:window.STRUCTURED_COMBAT_SPEED_AWARE_VERSION,api:typeof window.getStructuredCombatPacingForSpeed});
 else{
  const expected=new Map([[1,[140,70,48,180]],[1.5,[93,47,32,120]],[2,[70,35,24,90]]]);
  expected.forEach((values,speed)=>{
   const p=window.getStructuredCombatPacingForSpeed(10,speed);
   const actual=[p?.openingDelay,p?.impactDelay,p?.stepDelay,p?.endDelay].map(Number);
   if(JSON.stringify(actual)!==JSON.stringify(values)||Number(p?.combatSpeed)!==speed)fail("STRUCTURED_PROFILE",`${speed}× Structured Combat 節奏異常`,p);
  });
 }
 if(Number(window.SPECIAL_ENCOUNTER_COMBAT_SPEED_VERSION)!==1)fail("SPECIAL_SPEED","特殊遭遇正式開戰等待尚未接上倍速",window.SPECIAL_ENCOUNTER_COMBAT_SPEED_VERSION);
 if(Number(window.COMBAT_OUTER_PACING_VERSION)!==2||Number(window.COMBAT_OUTER_GAP_MS)!==140||typeof window.combatOuterGapMs!=="function"||["main","bounty","arena","mirror","void","calamity"].some(mode=>Number(window.combatOuterGapMs(mode))!==140))fail("OUTER_GAP","所有正式場間應固定 140ms，不受倍速影響",{version:window.COMBAT_OUTER_PACING_VERSION,gap:window.COMBAT_OUTER_GAP_MS});
 if(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)!==3||Number(window.MAIN_REAL_BATTLE_SAMPLE_VERSION)!==3||Number(window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION)!==1)fail("OFFLINE_SPEED_SAMPLE","離線收益應使用 speed-aware V3 sample",{offline:window.OFFLINE_BATTLE_SAMPLE_VERSION,main:window.MAIN_REAL_BATTLE_SAMPLE_VERSION,speed:window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION});
 if(Number(window.GM_COMBAT_SPEED_VERSION)!==2||typeof window.gmSetCombatSpeedOverride!=="function"||typeof window.gmCombatSpeedOverride!=="function"||typeof window.clearGmCombatSpeedOverrideForUser!=="function")fail("GM_SPEED_UI","GM 倍速管理 API 未完整載入",{version:window.GM_COMBAT_SPEED_VERSION,set:typeof window.gmSetCombatSpeedOverride,get:typeof window.gmCombatSpeedOverride,clear:typeof window.clearGmCombatSpeedOverrideForUser});

 const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.COMBAT_SPEED_INTEGRITY_VERSION=VERSION;
 window.COMBAT_SPEED_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Combat speed integrity error",errors);
})();