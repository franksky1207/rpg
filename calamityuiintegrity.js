(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const required=[
  "civilizationCalamityPageHtml",
  "prepareCivilizationCalamityEntry",
  "startCivilizationCalamityUI",
  "stopCivilizationCalamityContinuousUI",
  "returnToCivilizationCalamityList",
  "leaveCivilizationCalamityUI",
  "openCivilizationCalamityMinimalMode",
  "getVisibleCivilizationCalamityIds",
  "getCivilizationCalamityForStory",
  "showCivilizationCalamityUnlockNoticeForStory",
  "closeCivilizationCalamityUnlockNotice",
  "markEffectDescription",
  "animateStructuredCombatPresentation",
  "prepareCombatPresentation",
  "getCombatPresentationEnemyHp",
  "getCombatPresentationPlayerHp",
  "clearCombatPresentation",
  "isCombatPresentationActive"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("CALAMITY_UI_API",`${name} 未載入`);});
 if(Number(window.CALAMITY_UI_VERSION)!==3)fail("CALAMITY_UI_VERSION","文明災厄 UI 應為 V3",window.CALAMITY_UI_VERSION);
 if(Number(window.CALAMITY_MAXED_REPLAY_SINGLE_ONLY_UI_VERSION)!==1)fail("CALAMITY_MAXED_REPLAY_SINGLE_ONLY_UI","滿印記災厄應只保留單場重打",window.CALAMITY_MAXED_REPLAY_SINGLE_ONLY_UI_VERSION);
 if(Number(window.CALAMITY_MINIMAL_MODE_VERSION)!==1)fail("CALAMITY_MINIMAL_VERSION","文明災厄極簡模式應為 V1",window.CALAMITY_MINIMAL_MODE_VERSION);
 if(Number(window.CALAMITY_BATTLE_VIEW_VERSION)!==1)fail("CALAMITY_BATTLE_VIEW_VERSION","文明災厄戰鬥 UI 應使用單一 battleView snapshot",window.CALAMITY_BATTLE_VIEW_VERSION);
 if(Number(window.CALAMITY_OUTER_PACING_VERSION)!==1||Number(window.COMBAT_OUTER_PACING_VERSION)!==2||typeof window.combatOuterGapMs!=="function"||Number(window.combatOuterGapMs("calamity","battle"))!==140)fail("CALAMITY_OUTER_PACING","文明災厄場間應由共用 Combat Outer Pacing V2 提供固定 140ms",{calamity:window.CALAMITY_OUTER_PACING_VERSION,outer:window.COMBAT_OUTER_PACING_VERSION});
 if(typeof window.CALAMITY_CONTINUOUS_GAP_MS!=="undefined")fail("CALAMITY_LEGACY_GAP_OWNER","舊 CALAMITY_CONTINUOUS_GAP_MS 第二數字 owner 應已退休",window.CALAMITY_CONTINUOUS_GAP_MS);
 if(Number(window.CALAMITY_STRUCTURED_PRESENTATION_VERSION)!==2||Number(window.CALAMITY_BACKGROUND_PRESENTATION_VERSION)!==1||Number(window.COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION)!==1)fail("CALAMITY_BACKGROUND_PRESENTATION","文明災厄 structured animation 必須支援 background-aware sleep",{calamity:window.CALAMITY_STRUCTURED_PRESENTATION_VERSION,background:window.CALAMITY_BACKGROUND_PRESENTATION_VERSION,sleepInjection:window.COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION});
 if(Number(window.BACKGROUND_PROGRESS_UI_YIELD_VERSION)!==3||typeof window.backgroundProgressUiYield!=="function")fail("CALAMITY_BACKGROUND_UI_YIELD","文明災厄 catch-up 應使用前景快速 catch-up UI yield V3",{version:window.BACKGROUND_PROGRESS_UI_YIELD_VERSION,api:typeof window.backgroundProgressUiYield});
 if(Number(window.CALAMITY_FAST_CATCH_UP_UI_VERSION)!==1||Number(window.STRUCTURED_COMBAT_HEADLESS_DURATION_VERSION)!==1||typeof window.structuredCombatPresentationDurationMs!=="function")fail("CALAMITY_FAST_CATCH_UP_UI","文明災厄 Fast Catch-up UI／headless timing owner 未完整載入",{ui:window.CALAMITY_FAST_CATCH_UP_UI_VERSION,durationVersion:window.STRUCTURED_COMBAT_HEADLESS_DURATION_VERSION,duration:typeof window.structuredCombatPresentationDurationMs});
 const startSource=(()=>{try{return Function.prototype.toString.call(window.startCivilizationCalamityUI);}catch(e){return "";}})();
 const pageSource=typeof window.civilizationCalamityPageHtml==="function"?Function.prototype.toString.call(window.civilizationCalamityPageHtml):"";
 if(Number(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_PRESENTATION_INTERVAL)!==100)fail("CALAMITY_FAST_CATCH_UP_PRESENTATION_INTERVAL","文明災厄抽樣 presentation 應共用每 100 場 policy",window.BACKGROUND_PROGRESS_FAST_CATCH_UP_PRESENTATION_INTERVAL);

 try{
  if(typeof homePage==="function"){
   const html=String(homePage()||"");
   const dungeon=html.indexOf("<b>副本</b>"),calamity=html.indexOf("<b>文明災厄</b>"),guide=html.indexOf("<b>遊戲說明</b>");
   if(dungeon<0||calamity<0||guide<0||!(dungeon<calamity&&calamity<guide))fail("CALAMITY_HOME_ORDER","首頁文明災厄入口應位於副本後、遊戲說明前",{dungeon,calamity,guide});
  }else fail("CALAMITY_HOME_PAGE","homePage 未載入");
 }catch(error){fail("CALAMITY_HOME_PROBE","首頁入口檢查失敗",String(error?.message||error));}

 try{
  const defs=typeof window.getCivilizationCalamityDefinitions==="function"?window.getCivilizationCalamityDefinitions():[];
  const expected=defs.filter(def=>typeof window.isCivilizationCalamityUnlocked==="function"&&window.isCivilizationCalamityUnlocked(def.id)).map(def=>def.id);
  const actual=typeof window.getVisibleCivilizationCalamityIds==="function"?window.getVisibleCivilizationCalamityIds():[];
  if(JSON.stringify(actual)!==JSON.stringify(expected))fail("CALAMITY_VISIBLE_IDS","災厄 UI 可見集合未直接對齊正式解鎖判定",{expected,actual});
  const html=typeof window.civilizationCalamityPageHtml==="function"?String(window.civilizationCalamityPageHtml()||""):"";
  defs.forEach(def=>{
   const unlocked=expected.includes(def.id);
   const hasCalamity=html.includes(def.name),hasMark=html.includes(def.markName);
   if(unlocked&&(!hasCalamity||!hasMark))fail("CALAMITY_UNLOCKED_RENDER",`${def.id} 已解鎖但災厄／印記未同時顯示`,{hasCalamity,hasMark});
   if(!unlocked&&(hasCalamity||hasMark))fail("CALAMITY_LOCKED_LEAK",`${def.id} 尚未解鎖卻出現在災厄頁`,{hasCalamity,hasMark});
  });
  if(expected.length>0&&!html.includes("單場"))fail("CALAMITY_BATTLE_ACTIONS","已解鎖災厄缺少單場挑戰／重打按鈕");
  const hasIncomplete=defs.filter(def=>expected.includes(def.id)).some(def=>(window.getCivilizationCalamityStatus?.(def.id)?.mark?.level||0)<10);
  if(hasIncomplete&&!html.includes("連續討伐"))fail("CALAMITY_CONTINUOUS_ACTION","尚未滿印記的災厄應保留連續討伐按鈕");
  if(!hasIncomplete&&expected.length>0&&html.includes("連續討伐"))fail("CALAMITY_MAXED_REPLAY_ACTION","所有可見災厄皆滿印記時不應顯示連續討伐按鈕");
  if(expected.length>0&&(!html.includes("目前效果")&&!html.includes("Lv.1 效果預覽")))fail("CALAMITY_MARK_EFFECT_RENDER","印記卡缺少能力說明");
  if(typeof window.markEffectDescription==="function"){
   const ward=window.markEffectDescription("ward",1),suppression=window.markEffectDescription("suppression",1);
   if(!ward.includes("30%")||!ward.includes("最大 HP 2%"))fail("CALAMITY_MARK_WARD_TEXT","護界 Lv.1 能力文字異常",ward);
   if(!suppression.includes("0.5 個百分點"))fail("CALAMITY_MARK_SUPPRESSION_TEXT","壓制 Lv.1 能力文字異常",suppression);
  }
 }catch(error){fail("CALAMITY_RENDER_PROBE","災厄可見性 renderer 檢查失敗",String(error?.message||error));}

 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.CALAMITY_UI_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Civilization Calamity UI integrity error",errors);
})();