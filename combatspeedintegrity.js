(function(){
 const VERSION=6;
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const allowed=Array.isArray(window.COMBAT_SPEED_ALLOWED)?window.COMBAT_SPEED_ALLOWED.map(Number):[];
 const expectedAllowed=[1,1.5,2];

 if(Number(window.COMBAT_SPEED_CORE_VERSION)!==5)fail("CORE_VERSION","Combat Speed core 應為 V5",window.COMBAT_SPEED_CORE_VERSION);
 if(Number(window.COMBAT_SPEED_PLAYER_RULE_VERSION)!==4)fail("PLAYER_RULE_VERSION","玩家正式倍速規則 owner 應為 V4",window.COMBAT_SPEED_PLAYER_RULE_VERSION);
 if(Number(window.COMBAT_SPEED_PHASE_RULE_VERSION)!==1)fail("PHASE_RULE_VERSION","玩家倍速應依 current world phase 判定",window.COMBAT_SPEED_PHASE_RULE_VERSION);
 if(Number(window.COMBAT_SPEED_GM_OVERRIDE_VERSION)!==1)fail("GM_OVERRIDE_VERSION","GM 倍速覆寫 owner 應為 V1",window.COMBAT_SPEED_GM_OVERRIDE_VERSION);
 if(Number(window.COMBAT_SPEED_REINCARNATION_UNLOCK_VERSION)!==1)fail("REINCARNATION_UNLOCK_VERSION","轉生永久 1.5× 解鎖 owner 應為 V1",window.COMBAT_SPEED_REINCARNATION_UNLOCK_VERSION);
 if(Number(window.COMBAT_SPEED_BADGE_RENDERER_VERSION)!==1||typeof window.combatSpeedBadgeHtml!=="function"||typeof window.combatSpeedHeaderHtml!=="function")fail("BADGE_RENDERER","共用戰鬥速度徽章／標頭 renderer 應為 V1",{version:window.COMBAT_SPEED_BADGE_RENDERER_VERSION,badge:typeof window.combatSpeedBadgeHtml,header:typeof window.combatSpeedHeaderHtml});
 else{
  const first={secondWorld:{entered:false},thirdWorld:{entered:false},reincarnation:{count:0}},rerun={secondWorld:{entered:false},thirdWorld:{entered:false},reincarnation:{count:1}};
  const hidden=window.combatSpeedBadgeHtml({target:first,speed:1}),badge15=window.combatSpeedBadgeHtml({target:rerun,speed:1.5}),header2=window.combatSpeedHeaderHtml("單場戰鬥",{target:rerun,speed:2,force:true});
  if(hidden!=="")fail("BADGE_FIRST_RUN_HIDDEN","首輪 W1 1× 不應額外顯示速度徽章",hidden);
  if(!badge15.includes('data-combat-speed-badge="1"')||!badge15.includes('1.5×'))fail("BADGE_15_RENDER","共用速度徽章未正確渲染 1.5×",badge15);
  if(!header2.includes('data-combat-speed-header="1"')||!header2.includes('data-combat-speed-badge="1"')||!header2.includes('2×'))fail("HEADER_2_RENDER","共用速度標頭未正確渲染 2×",header2);
 }
 if(JSON.stringify(allowed)!==JSON.stringify(expectedAllowed))fail("ALLOWED_SPEEDS","正式合法倍速應為 1／1.5／2",allowed);
 if(typeof window.playerCombatSpeedOptions!=="function"||typeof window.playerCombatSpeed!=="function"||typeof window.setPlayerCombatSpeed!=="function"||typeof window.combatSpeedWorldPhase!=="function"||typeof window.reincarnationCombatSpeedUnlocked!=="function")fail("PLAYER_SPEED_API","玩家正式倍速 API 未完整載入",{options:typeof window.playerCombatSpeedOptions,get:typeof window.playerCombatSpeed,set:typeof window.setPlayerCombatSpeed,phase:typeof window.combatSpeedWorldPhase,reincarnation:typeof window.reincarnationCombatSpeedUnlocked});
 else{
  const phase=typeof window.currentWorldPhase==="function"?Number(window.currentWorldPhase()):Number(window.combatSpeedWorldPhase());
  const reincarnationUnlocked=window.reincarnationCombatSpeedUnlocked()===true;
  const expectedOptions=phase>=2||reincarnationUnlocked?[1,1.5]:[1];
  const actualOptions=window.playerCombatSpeedOptions().map(Number);
  if(JSON.stringify(actualOptions)!==JSON.stringify(expectedOptions))fail("PLAYER_OPTIONS","玩家正式倍速選項與世界階段／轉生永久解鎖不符",{phase,reincarnationUnlocked,expectedOptions,actualOptions});
  const formal=Number(window.playerCombatSpeed());
  if(!expectedOptions.includes(formal))fail("PLAYER_SPEED","玩家正式速度不在目前合法選項內",{formal,expectedOptions});
  try{
   const stored=Number(state?.settings?.combatSpeed);
   if(expectedOptions.includes(stored)&&formal!==stored)fail("PLAYER_STATE_ACCESS","玩家正式倍速沒有讀到實際 state.settings.combatSpeed",{stored,formal,expectedOptions});
  }catch(e){fail("PLAYER_STATE_ACCESS","玩家正式倍速無法讀取遊戲 state",String(e?.message||e));}
  const phaseProbes=[
   [{secondWorld:{entered:false},thirdWorld:{entered:false},reincarnation:{count:0}},1,[1]],
   [{secondWorld:{entered:false},thirdWorld:{entered:false},reincarnation:{count:1}},1,[1,1.5]],
   [{secondWorld:{entered:true},thirdWorld:{entered:false},reincarnation:{count:0}},2,[1,1.5]],
   [{secondWorld:{entered:true},thirdWorld:{entered:true},reincarnation:{count:0}},3,[1,1.5]]
  ];
  phaseProbes.forEach(([target,expectedPhase,expectedSpeeds])=>{
   const actualPhase=Number(window.combatSpeedWorldPhase(target)),actualSpeeds=window.playerCombatSpeedOptions(target).map(Number),reincarnation=window.reincarnationCombatSpeedUnlocked(target)===true;
   if(actualPhase!==expectedPhase||JSON.stringify(actualSpeeds)!==JSON.stringify(expectedSpeeds))fail("PHASE_OPTIONS_PROBE",`world ${expectedPhase} 倍速規則異常`,{actualPhase,actualSpeeds,expectedSpeeds,reincarnation});
  });
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
 if(Number(window.SPECIAL_ENCOUNTER_THIRD_WORLD_GUARD_VERSION)!==1||Number(window.SPECIAL_WORLD_FORMAL_FLOW_VERSION)!==2||Number(window.PENDING_BLACK_MARKET_CURRENT_PHASE_VERSION)!==2||typeof window.specialEncounterWorldForState!=="function"||typeof window.specialEncounterAllowed!=="function")fail("SPECIAL_WORLD3_GUARD","特殊遭遇 W3 fail-closed owner 未完整載入",{guard:window.SPECIAL_ENCOUNTER_THIRD_WORLD_GUARD_VERSION,flow:window.SPECIAL_WORLD_FORMAL_FLOW_VERSION,pending:window.PENDING_BLACK_MARKET_CURRENT_PHASE_VERSION,world:typeof window.specialEncounterWorldForState,allowed:typeof window.specialEncounterAllowed});
 else{
  const w1={secondWorld:{entered:false},thirdWorld:{entered:false}},w2={secondWorld:{entered:true},thirdWorld:{entered:false}},w3={secondWorld:{entered:true},thirdWorld:{entered:true},pendingBlackMarketEncounter:true};
  if(Number(window.specialEncounterWorldForState(w1))!==1||Number(window.specialEncounterWorldForState(w2))!==2||Number(window.specialEncounterWorldForState(w3))!==3)fail("SPECIAL_WORLD_PHASE_PROBE","特殊遭遇世界判定必須正式支援 1／2／3",{w1:window.specialEncounterWorldForState(w1),w2:window.specialEncounterWorldForState(w2),w3:window.specialEncounterWorldForState(w3)});
  if(window.specialEncounterAllowed(w3)!==false||window.pendingBlackMarketActive?.(w3)!==false)fail("SPECIAL_WORLD3_FAIL_CLOSED","W3 特殊遭遇與舊黑市 pending 必須 fail-closed",{allowed:window.specialEncounterAllowed(w3),pending:window.pendingBlackMarketActive?.(w3)});
 }
 if(Number(window.COMBAT_OUTER_PACING_VERSION)!==2||Number(window.COMBAT_OUTER_GAP_MS)!==140||typeof window.combatOuterGapMs!=="function"||["main","bounty","arena","mirror","void","calamity"].some(mode=>Number(window.combatOuterGapMs(mode))!==140))fail("OUTER_GAP","所有正式場間應固定 140ms，不受倍速影響",{version:window.COMBAT_OUTER_PACING_VERSION,gap:window.COMBAT_OUTER_GAP_MS});
 if(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)!==3||Number(window.MAIN_REAL_BATTLE_SAMPLE_VERSION)!==3||Number(window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION)!==1)fail("OFFLINE_SPEED_SAMPLE","離線收益應使用 speed-aware V3 sample",{offline:window.OFFLINE_BATTLE_SAMPLE_VERSION,main:window.MAIN_REAL_BATTLE_SAMPLE_VERSION,speed:window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION});
 if(Number(window.GM_COMBAT_SPEED_VERSION)!==2||typeof window.gmSetCombatSpeedOverride!=="function"||typeof window.gmCombatSpeedOverride!=="function"||typeof window.clearGmCombatSpeedOverrideForUser!=="function")fail("GM_SPEED_UI","GM 倍速管理 API 未完整載入",{version:window.GM_COMBAT_SPEED_VERSION,set:typeof window.gmSetCombatSpeedOverride,get:typeof window.gmCombatSpeedOverride,clear:typeof window.clearGmCombatSpeedOverrideForUser});

 const report={version:VERSION,phaseRuleVersion:Number(window.COMBAT_SPEED_PHASE_RULE_VERSION)||0,reincarnationUnlockVersion:Number(window.COMBAT_SPEED_REINCARNATION_UNLOCK_VERSION)||0,badgeRendererVersion:Number(window.COMBAT_SPEED_BADGE_RENDERER_VERSION)||0,specialThirdWorldGuardVersion:Number(window.SPECIAL_ENCOUNTER_THIRD_WORLD_GUARD_VERSION)||0,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.COMBAT_SPEED_INTEGRITY_VERSION=VERSION;
 window.COMBAT_SPEED_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Combat speed integrity error",errors);
})();