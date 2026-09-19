(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const versionChecks={
  COMBAT_PRESENTATION_VERSION:2,
  COMBAT_MARK_FX_VERSION:1,
  MAIN_COMBAT_MARK_PRESENTATION_VERSION:1,
  SPECIAL_COMBAT_MARK_PRESENTATION_VERSION:1,
  BOUNTY_COMBAT_MARK_PRESENTATION_VERSION:1,
  ARENA_COMBAT_MARK_PRESENTATION_VERSION:1,
  VOID_COMBAT_MARK_PRESENTATION_VERSION:1
 };
 Object.entries(versionChecks).forEach(([key,expected])=>{
  if(Number(window[key])!==expected)fail("MARK_PRESENTATION_VERSION",`${key} 應為 ${expected}`,window[key]);
 });
 if(typeof window.combatMarkFxDescriptor!=="function")fail("MARK_FX_DESCRIPTOR","combatMarkFxDescriptor 未載入");
 if(typeof window.consumeCombatPresentationPulse!=="function")fail("MARK_FX_CONSUMER","consumeCombatPresentationPulse 未載入");
 if(typeof window.consumeCombatPresentationPulseManual!=="function")fail("MARK_FX_MANUAL_CONSUMER","consumeCombatPresentationPulseManual 未載入");
 if(typeof window.syncCombatPresentationHp!=="function")fail("MARK_FX_HP_SYNC","syncCombatPresentationHp 未載入");
 if(typeof window.prepareCombatPresentation!=="function"||typeof window.clearCombatPresentation!=="function"||typeof window.isCombatPresentationActive!=="function"||typeof window.getCombatPresentationSnapshot!=="function")fail("COMBAT_PRESENTATION_LIFECYCLE","Combat Presentation V2 lifecycle API 未完整載入");
 if(typeof window.getCombatPresentationPlayerShield!=="function"||typeof window.getCombatPresentationPlayerShieldMax!=="function")fail("COMBAT_PRESENTATION_SHIELD","Combat Presentation shield API 未完整載入");

 if(typeof window.prepareCombatPresentation==="function"&&typeof window.clearCombatPresentation==="function"){
  try{
   window.prepareCombatPresentation({
    playerMaxHp:1000,playerStartHp:1000,enemyStartHp:500,e:{hp:500},
    events:[{type:"mark",mark:"ward",action:"activate",shield:200,maxHp:1000,percent:20}]
   },{logs:true});
   const snap=window.getCombatPresentationSnapshot?.();
   if(snap?.playerHp!==1000||snap?.enemyHp!==500||snap?.playerShield!==200||snap?.playerShieldMax!==200||window.isCombatPresentationActive?.()!==true)fail("COMBAT_PRESENTATION_PROBE","Combat Presentation prepare／shield 初始化異常",snap);
   window.clearCombatPresentation("integrity-probe");
   if(window.isCombatPresentationActive?.()!==false||window.getCombatPresentationPlayerHp?.()!==null||window.getCombatPresentationEnemyHp?.()!==null||window.getCombatPresentationPlayerShield?.()!==null)fail("COMBAT_PRESENTATION_CLEAR","Combat Presentation clear 後仍殘留狀態",window.getCombatPresentationSnapshot?.());
  }catch(error){fail("COMBAT_PRESENTATION_PROBE_ERROR","Combat Presentation lifecycle probe 執行失敗",String(error?.message||error));}
 }
 if(typeof window.combatMarkFxDescriptor==="function"){
  const cases=[
   [{type:"mark",mark:"ward",action:"activate"},{target:"player",text:"護界！"}],
   [{type:"mark",mark:"ward",action:"absorb",amount:12},{target:"player",text:"護界 -12"}],
   [{type:"mark",mark:"suppression",action:"preventDodge"},{target:"enemy",text:"壓制！"}],
   [{type:"mark",mark:"composure",action:"preventCrit"},{target:"player",text:"鎮心！"}],
   [{type:"mark",mark:"indomitable",action:"activate"},{target:"player",text:"不屈！"}],
   [{type:"mark",mark:"indomitable",action:"survive"},{target:"player",text:"不屈・存活！"}],
   [{type:"mark",mark:"resilience",action:"reduceCritDamage"},{target:"player",text:"韌性！"}],
   [{type:"mark",mark:"battleSpirit",action:"activate"},{target:"player",text:"戰意！"}],
   [{type:"mark",mark:"battleSpirit",action:"layer",layer:4},{target:"player",text:"戰意 ×4"}],
   [{type:"mark",mark:"absorption",action:"trigger",healed:25},{target:"player",text:"吸收！ +25 HP"}],
   [{type:"mark",mark:"revenge",action:"ready"},{target:"player",text:"復仇！"}],
   [{type:"mark",mark:"revenge",action:"consume"},{target:"player",text:"復仇暴擊！"}],
   [{type:"mark",mark:"backlash",action:"trigger",actualDamage:30},{target:"enemy",text:"反噬 -30"}],
   [{type:"mark",mark:"ignore",action:"trigger"},{target:"enemy",text:"無視防禦！"}]
  ];
  cases.forEach(([evt,expected])=>{
   const actual=window.combatMarkFxDescriptor(evt);
   if(actual?.target!==expected.target||actual?.text!==expected.text)fail("MARK_FX_MAPPING",`${evt.mark}/${evt.action} 顯示對應異常`,{expected,actual});
  });
  if(window.combatMarkFxDescriptor({type:"attack"})!==null)fail("MARK_FX_NON_MARK","非印記事件不應產生印記浮字");
 }

 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.COMBAT_MARK_FX_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Combat mark FX integrity error",errors);
})();