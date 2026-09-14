(function(){
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const warn=(code,message,data=null)=>warnings.push({code,message,data});
 const expectedMaps=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS.reduce((max,r)=>Math.max(max,(Number(r?.mapEnd)||-1)+1,0):0;

 if(!Array.isArray(MAPS)||MAPS.length!==expectedMaps)fail("WORLD_MAP_COUNT",`MAPS 應為 ${expectedMaps} 張，實際 ${Array.isArray(MAPS)?MAPS.length:"非陣列"}`);
 if(window.WORLD_MAP_REGISTRATION_REPORT?.passed!==true)fail("WORLD_MAP_REGISTRY","世界地圖固定註冊檢查未通過",window.WORLD_MAP_REGISTRATION_REPORT?.errors||null);
 if(window.WORLD_NAMING_REPORT?.errors?.length)fail("WORLD_NAMING","世界資料硬錯誤",window.WORLD_NAMING_REPORT.errors);

 const required=[
  "normalizeSaveState","migrateSave","load","finalizeDungeonLoadedState","ensureDungeonProgressState",
  "normalizeDailyState","ensureDailyState","gameDailyDateKey","dailyDungeonStatus","dailyDungeonRemaining","consumeDailyDungeonUse",
  "voidMirageDailyStatus","recordVoidMirageDailyFloor","claimVoidMirageDailyReward",
  "vipDungeonPointMultiplier","adjustVipDungeonPoints",
  "enterBountyDungeon","renderBountyDungeon",
  "getArenaProgressState","getArenaAssessmentStatus","getArenaBaseTotalPoints",
  "ensureVoidMirageState","getVoidMirageStartFloor","voidMirageStartFloorFromHistory","beginVoidMirageRun","fightNextVoidMirageFloor","renderVoidMirageDungeon",
  "registerRegionMaps"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("MISSING_FUNCTION",`必要函式 ${name} 未載入`);});

 if(Number(SAVE_VERSION)!==11)fail("SAVE_VERSION",`SAVE_VERSION 應為 11，實際 ${SAVE_VERSION}`);
 if(Number(window.SAVE_SCHEMA_VERSION)!==11)fail("SAVE_SCHEMA",`SAVE_SCHEMA_VERSION 應為 11，實際 ${window.SAVE_SCHEMA_VERSION}`);
 if(Number(window.SAVE_LOAD_PIPELINE_VERSION)!==2)fail("SAVE_PIPELINE",`SAVE_LOAD_PIPELINE_VERSION 應為 2，實際 ${window.SAVE_LOAD_PIPELINE_VERSION}`);
 if(Number(window.VIP_THRESHOLD_BASE)!==2500)fail("VIP_THRESHOLD_BASE",`VIP 門檻基數應為 2500，實際 ${window.VIP_THRESHOLD_BASE}`);
 if(Number(window.SPECIALIZATION_MAX_LEVEL)!==60)fail("SPECIALIZATION_MAX_LEVEL",`專精上限應為 60，實際 ${window.SPECIALIZATION_MAX_LEVEL}`);
 if(Number(window.DAILY_DUNGEON_LIMITS?.bounty)!==20)fail("BOUNTY_DAILY_LIMIT","懸賞每日上限應為 20");
 if(Number(window.DAILY_DUNGEON_LIMITS?.arena)!==20)fail("ARENA_DAILY_LIMIT","競技場每日上限應為 20");
 if(Number(window.VOID_MIRAGE_START_OFFSET)!==100)fail("VOID_START_OFFSET",`虛空幻境起始回退應為 100 層，實際 ${window.VOID_MIRAGE_START_OFFSET}`);
 if(typeof window.voidMirageStartFloorFromHistory==="function"){
  const checks=[[80,1],[850,750],[2500,2400],[4000,3900],[5000,4900],[10000,9900]];
  checks.forEach(([highest,expected])=>{const actual=window.voidMirageStartFloorFromHistory(highest);if(Number(actual)!==expected)fail("VOID_START_FLOOR",`歷史最高 ${highest} 時起始層應為 ${expected}，實際 ${actual}`);});
 }
 if(typeof window.getArenaBaseTotalPoints==="function"){
  const checks=[[1,"normal",50],[1,"hard",100],[1,"extreme",150],[4,"normal",110],[4,"hard",160],[4,"extreme",210],[10,"normal",470],[10,"hard",520],[10,"extreme",570]];
  checks.forEach(([rank,id,expected])=>{const actual=window.getArenaBaseTotalPoints(rank,id);if(Number(actual)!==expected)fail("ARENA_POINTS",`競技場第 ${rank} 階 ${id} 積分應為 ${expected}，實際 ${actual}`);});
 }
 if(state&&Number(state.saveVersion)!==Number(window.SAVE_SCHEMA_VERSION))fail("STATE_SCHEMA",`state.saveVersion ${state.saveVersion} 與正式 schema 不一致`);
 if(!window.LAST_SAVE_LOAD_REPORT)warn("LOAD_REPORT","尚未找到 LAST_SAVE_LOAD_REPORT");
 else if(Number(window.LAST_SAVE_LOAD_REPORT.pipelineVersion)!==Number(window.SAVE_LOAD_PIPELINE_VERSION))fail("LOAD_REPORT_PIPELINE","LAST_SAVE_LOAD_REPORT pipeline 與正式版本不一致",window.LAST_SAVE_LOAD_REPORT);

 if(state?.dungeon?.arena&&typeof window.ensureDungeonProgressState==="function"){
  const arenaRef=state.dungeon.arena;
  window.ensureDungeonProgressState();
  if(state.dungeon.arena!==arenaRef)fail("ARENA_REFERENCE","競技場 normalize 重新替換了 arena 物件參照");
 }
 if(state&&typeof window.ensureDailyState==="function"){
  const daily=window.ensureDailyState();
  if(!daily||daily.dateKey!==window.gameDailyDateKey())fail("DAILY_STATE","每日狀態日期未正確同步",daily);
  const voidDaily=typeof window.voidMirageDailyStatus==="function"?window.voidMirageDailyStatus():null;
  if(!voidDaily||!Number.isFinite(Number(voidDaily.highestFloor))||Number(voidDaily.highestFloor)<0)fail("VOID_DAILY_STATE","虛空幻境當日最高層狀態異常",voidDaily);
 }

 const report={passed:errors.length===0,clean:errors.length===0&&warnings.length===0,errors,warnings,checkedAt:Date.now()};
 window.PROJECT_RUNTIME_REPORT=report;
 if(errors.length)console.error("[文明戰線] Runtime integrity error",errors);
 else if(warnings.length)console.warn("[文明戰線] Runtime integrity warning",warnings);
})();