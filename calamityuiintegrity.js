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
  "getCivilizationMarkEffectText",
  "consumeCombatPresentationPulseManual",
  "prepareCombatPresentation",
  "getCombatPresentationEnemyHp",
  "getCombatPresentationPlayerHp",
  "clearCombatPresentation",
  "isCombatPresentationActive"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("CALAMITY_UI_API",`${name} 未載入`);});
 if(Number(window.CALAMITY_UI_VERSION)!==3)fail("CALAMITY_UI_VERSION","文明災厄 UI 應為 V3",window.CALAMITY_UI_VERSION);
 if(Number(window.CALAMITY_MINIMAL_MODE_VERSION)!==1)fail("CALAMITY_MINIMAL_VERSION","文明災厄極簡模式應為 V1",window.CALAMITY_MINIMAL_MODE_VERSION);

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
  if(expected.length>0&&(!html.includes("單場挑戰")||!html.includes("連續討伐")))fail("CALAMITY_BATTLE_ACTIONS","已解鎖災厄缺少單場／連續討伐按鈕");
  if(expected.length>0&&(!html.includes("目前效果")&&!html.includes("Lv.1 效果預覽")))fail("CALAMITY_MARK_EFFECT_RENDER","印記卡缺少能力說明");
  if(typeof window.getCivilizationMarkEffectText==="function"){
   const ward=window.getCivilizationMarkEffectText("ward",1),suppression=window.getCivilizationMarkEffectText("suppression",1);
   if(!ward.includes("30%")||!ward.includes("最大 HP 2%"))fail("CALAMITY_MARK_WARD_TEXT","護界 Lv.1 能力文字異常",ward);
   if(!suppression.includes("0.5 個百分點"))fail("CALAMITY_MARK_SUPPRESSION_TEXT","壓制 Lv.1 能力文字異常",suppression);
  }
 }catch(error){fail("CALAMITY_RENDER_PROBE","災厄可見性 renderer 檢查失敗",String(error?.message||error));}

 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.CALAMITY_UI_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Civilization Calamity UI integrity error",errors);
})();