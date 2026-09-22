(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 if(Number(window.SECOND_WORLD_CALAMITY_UI_VERSION)!==2)fail("UI_VERSION","第二世界文明災厄玩家 UI 應為 V2",window.SECOND_WORLD_CALAMITY_UI_VERSION);
 if(Number(window.SECOND_WORLD_CALAMITY_PLAYER_SEMANTICS_VERSION)!==1)fail("PLAYER_SEMANTICS","第二世界文明災厄玩家語意 owner 未載入",window.SECOND_WORLD_CALAMITY_PLAYER_SEMANTICS_VERSION);
 if(Number(window.SECOND_WORLD_CALAMITY_APPEARANCE_NOTICE_VERSION)!==2)fail("APPEARANCE_NOTICE","第二世界文明災厄現身通知應為 V2",window.SECOND_WORLD_CALAMITY_APPEARANCE_NOTICE_VERSION);
 const required=[
  "prepareSecondWorldCivilizationCalamityEntry",
  "secondWorldCivilizationCalamityPageHtml",
  "startSecondWorldCalamityUI",
  "stopSecondWorldCalamityContinuousUI",
  "returnToSecondWorldCalamityList",
  "leaveSecondWorldCalamityUI",
  "queueSecondWorldCalamityAppearanceNotice",
  "flushSecondWorldCalamityAppearanceNotice",
  "closeSecondWorldCalamityAppearanceNotice"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("UI_API",name+" 未載入");});
 try{
  const pageSource=Function.prototype.toString.call(window.secondWorldCivilizationCalamityPageHtml);
  const startSource=Function.prototype.toString.call(window.startSecondWorldCalamityUI);
  const flushSource=Function.prototype.toString.call(window.flushSecondWorldCalamityAppearanceNotice);
  if(!/completed/.test(startSource)||!/continuous/.test(startSource)||!/single/.test(startSource))fail("COMPLETED_SINGLE_ONLY_WIRING","完成災厄必須強制單場重打",startSource);
  if(!/challengeable/.test(startSource))fail("CHALLENGE_GATE_WIRING","玩家入口必須使用正式 challengeable 判定",startSource);
  if(!/AppearanceRequirement/.test(flushSource)||!/challengeable/.test(flushSource))fail("NOTICE_REQUIREMENT_WIRING","現身通知必須顯示當下是否可挑戰",flushSource);
  if(!pageSource)fail("PAGE_RENDERER","第二世界文明災厄頁 renderer 不可為空");
 }catch(error){fail("SOURCE_PROBE","第二世界文明災厄 UI source probe 失敗",String(error?.message||error));}
 try{
  const defs=typeof window.getSecondWorldCalamityDefinitions==="function"?window.getSecondWorldCalamityDefinitions():[];
  if(defs.length!==10)fail("DEFINITION_COUNT","玩家 UI 應對齊 10 隻第二世界文明災厄",defs.length);
  const first=defs[0];
  if(first&&Number(first.previousCivilizationLevel)!==0)fail("FIRST_CIV_REQUIREMENT","第一隻災厄不應有前置文明等級",first);
 }catch(error){fail("DATA_LINK","第二世界文明災厄 UI data probe 失敗",String(error?.message||error));}
 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.SECOND_WORLD_CALAMITY_UI_INTEGRITY_VERSION=1;
 window.SECOND_WORLD_CALAMITY_UI_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Second World Calamity UI integrity error",errors);
})();