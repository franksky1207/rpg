(function(){
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const warn=(code,message,data=null)=>warnings.push({code,message,data});
 const expectedMaps=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS.reduce((max,r)=>Math.max(max,(Number(r?.mapEnd)||-1)+1),0):0;

 if(!Array.isArray(MAPS)||MAPS.length!==expectedMaps)fail("WORLD_MAP_COUNT",`MAPS 應為 ${expectedMaps} 張，實際 ${Array.isArray(MAPS)?MAPS.length:"非陣列"}`);
 if(window.WORLD_MAP_REGISTRATION_REPORT?.passed!==true)fail("WORLD_MAP_REGISTRY","世界地圖固定註冊檢查未通過",window.WORLD_MAP_REGISTRATION_REPORT?.errors||null);
 if(window.WORLD_NAMING_REPORT?.errors?.length)fail("WORLD_NAMING","世界資料硬錯誤",window.WORLD_NAMING_REPORT.errors);

 const required=[
  "normalizeSaveState","migrateSave","load","finalizeDungeonLoadedState","ensureDungeonState","dungeonFightCore","cleanupLegacyDungeonFields",
  "registerNewStateNormalizer","getNewStateNormalizerCount",
  "normalizeDailyState","ensureDailyState","gameDailyDateKey","dailyDungeonStatus","dailyDungeonRemaining","consumeDailyDungeonUse",
  "voidMirageDailyStatus","recordVoidMirageDailyFloor","claimVoidMirageDailyReward",
  "vipDungeonPointMultiplier","adjustVipDungeonPoints",
  "enterBountyDungeon","renderBountyDungeon",
  "getArenaProgressState","getArenaAssessmentStatus","getArenaBaseTotalPoints",
  "ensureVoidMirageState","getVoidMirageStartFloor","voidMirageStartFloorFromHistory","beginVoidMirageRun","fightNextVoidMirageFloor","renderVoidMirageDungeon",
  "gmSetVoidMirageState","gmDungeonManagementHtml","gmApplyDungeonValues","gmResetDailyDungeonState","gmPreviewVoidMirageFloor","gmSimulateVoidMirageClimb","gmSimulateArena100",
  "registerRegionMaps"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("MISSING_FUNCTION",`必要函式 ${name} 未載入`);});

 const retiredDungeonRunApis=["canStartDungeonRun","beginDungeonRun","getActiveDungeonRun","finishDungeonRun"];
 retiredDungeonRunApis.forEach(name=>{if(typeof window[name]!=="undefined")fail("LEGACY_DUNGEON_RUN_API",`舊共享副本流程 ${name} 不應再存在`);});
 const retiredVoidApis=["getVoidMirageNextFloor","voidMirageFirstClearPoints"];
 retiredVoidApis.forEach(name=>{if(typeof window[name]!=="undefined")fail("LEGACY_VOID_API",`舊虛空相容函式 ${name} 不應再存在`);});
 if(typeof window.VOID_MIRAGE_GM_UI_V2!=="undefined")fail("LEGACY_VOID_GM_MARKER","已退休的虛空 GM UI 標記不應再載入");

 if(Number(SAVE_VERSION)!==11)fail("SAVE_VERSION",`SAVE_VERSION 應為 11，實際 ${SAVE_VERSION}`);
 if(Number(window.SAVE_SCHEMA_VERSION)!==11)fail("SAVE_SCHEMA",`SAVE_SCHEMA_VERSION 應為 11，實際 ${window.SAVE_SCHEMA_VERSION}`);
 if(Number(window.SAVE_LOAD_PIPELINE_VERSION)!==2)fail("SAVE_PIPELINE",`SAVE_LOAD_PIPELINE_VERSION 應為 2，實際 ${window.SAVE_LOAD_PIPELINE_VERSION}`);
 if(Number(window.VIP_PROGRESSION_VERSION)!==12)fail("VIP_PROGRESSION_VERSION",`VIP 正式核心版本應為 12，實際 ${window.VIP_PROGRESSION_VERSION}`);
 if(Number(window.VIP_THRESHOLD_BASE)!==2500)fail("VIP_THRESHOLD_BASE",`VIP 門檻基數應為 2500，實際 ${window.VIP_THRESHOLD_BASE}`);
 if(typeof window.vipThreshold==="function"&&Number(window.vipThreshold(20))!==1000000)fail("VIP20_THRESHOLD",`VIP20 門檻應為 1,000,000，實際 ${window.vipThreshold(20)}`);
 if(typeof window.vipThreshold==="function"&&Number(window.vipThreshold(1))!==2500)fail("VIP1_THRESHOLD",`VIP1 門檻應為 2,500，實際 ${window.vipThreshold(1)}`);
 if(typeof window.adjustVipDungeonPoints==="function"&&Number(window.adjustVipDungeonPoints(570,12))!==684)fail("VIP_DUNGEON_MULTIPLIER",`VIP12 對 570 基礎積分應為 684，實際 ${window.adjustVipDungeonPoints(570,12)}`);
 if(Number(window.SPECIALIZATION_MAX_LEVEL)!==60)fail("SPECIALIZATION_MAX_LEVEL",`專精上限應為 60，實際 ${window.SPECIALIZATION_MAX_LEVEL}`);
 if(Number(window.DAILY_DUNGEON_LIMITS?.bounty)!==20)fail("BOUNTY_DAILY_LIMIT","懸賞每日上限應為 20");
 if(Number(window.DAILY_DUNGEON_LIMITS?.arena)!==20)fail("ARENA_DAILY_LIMIT","競技場每日上限應為 20");
 if("VOID_MIRAGE_MAX_FLOOR" in window)fail("VOID_MAX_FLOOR_RESIDUE","虛空幻境不應存在最高層限制");
 if(Number(window.VOID_MIRAGE_START_OFFSET)!==100)fail("VOID_START_OFFSET",`虛空幻境起始回退應為 100 層，實際 ${window.VOID_MIRAGE_START_OFFSET}`);
 if(typeof window.voidMirageStartFloorFromHistory==="function"){
  const checks=[[80,1],[850,750],[2500,2400],[4000,3900],[5000,4900],[10000,9900]];
  checks.forEach(([highest,expected])=>{const actual=window.voidMirageStartFloorFromHistory(highest);if(Number(actual)!==expected)fail("VOID_START_FLOOR",`歷史最高 ${highest} 時起始層應為 ${expected}，實際 ${actual}`);});
 }
 if(typeof window.getArenaBaseTotalPoints==="function"){
  const checks=[[1,"normal",50],[1,"hard",100],[1,"extreme",150],[4,"normal",110],[4,"hard",160],[4,"extreme",210],[10,"normal",470],[10,"hard",520],[10,"extreme",570]];
  checks.forEach(([rank,id,expected])=>{const actual=window.getArenaBaseTotalPoints(rank,id);if(Number(actual)!==expected)fail("ARENA_POINTS",`競技場第 ${rank} 階 ${id} 積分應為 ${expected}，實際 ${actual}`);});
 }
 if(typeof window.getNewStateNormalizerCount==="function"&&Number(window.getNewStateNormalizerCount())!==3)fail("NEW_STATE_NORMALIZERS",`新存檔應只有 3 個正式 normalizer，實際 ${window.getNewStateNormalizerCount()}`);
 if(typeof newState==="function"){
  const fresh=newState();
  if(!fresh?.daily||fresh.daily.bounty?.used!==0||fresh.daily.arena?.used!==0)fail("NEW_STATE_DAILY","newState 未正確建立每日副本狀態",fresh?.daily);
  if(!fresh?.dungeon?.arena)fail("NEW_STATE_DUNGEON","newState 未正確建立競技場持久狀態",fresh?.dungeon);
  if(fresh?.vipPoints!==0||fresh?.vipLevel!==0)fail("NEW_STATE_VIP","newState VIP 初始狀態異常",{vipPoints:fresh?.vipPoints,vipLevel:fresh?.vipLevel});
  ["progress","attempts","activeRun","points"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(fresh?.dungeon||{},key))fail("NEW_STATE_LEGACY_DUNGEON",`newState 不應含舊副本欄位 ${key}`);});
 }
 if(typeof window.normalizeDailyState==="function"){
  const key=typeof window.gameDailyDateKey==="function"?window.gameDailyDateKey():"";
  const probe={daily:{dateKey:key,bounty:{used:999},arena:{used:999},voidMirage:{highestFloor:0,claimed:false}}};
  window.normalizeDailyState(probe);
  if(probe.daily.bounty.used!==20||probe.daily.arena.used!==20)fail("DAILY_NORMALIZE_CLAMP","每日次數 normalizer 應直接限制在 20",probe.daily);
 }
 if(window.BATCH5_UI_READY!==true)fail("BATCH5_UI","第五批共用 UI 未完成載入");
 const clock=document.getElementById("gameDailyClock"),clockTime=document.getElementById("gameDailyClockTime");
 if(!clock||!clockTime)fail("DAILY_CLOCK","主介面每日時鐘未建立");
 else if(!/^\d{2}:\d{2}:\d{2}$/.test(clockTime.textContent||""))fail("DAILY_CLOCK_FORMAT",`時鐘格式異常：${clockTime.textContent||""}`);
 if(clock?.textContent?.includes("臺灣時間"))fail("DAILY_CLOCK_LABEL","時鐘不應顯示「臺灣時間」文字");
 if(!clock?.textContent?.includes("每日凌晨 0 點重置"))fail("DAILY_RESET_LABEL","缺少固定的每日凌晨 0 點重置文字");

 if(Number(window.GAME_GUIDE_VERSION)!==7)fail("GUIDE_VERSION",`遊戲說明版本應為 7，實際 ${window.GAME_GUIDE_VERSION}`);
 if(window.GAME_GUIDE_ARENA_V6!==true)fail("GUIDE_LATE_OVERRIDE","舊競技場說明覆蓋檔未停用");
 const guideText=Array.isArray(window.GAME_GUIDE_CATEGORIES)?window.GAME_GUIDE_CATEGORIES.flatMap(c=>c.items||[]).flat().join(" "):"";
 const guideRequired=["每天最多挑戰 20 次","每天最多開始 20 輪","沒有最高層數","當日最高層 × 2","最高 Lv60","查看特權","主線由多個區域與地圖組成"];
 guideRequired.forEach(text=>{if(!guideText.includes(text))fail("GUIDE_REQUIRED_TEXT",`遊戲說明缺少新版規則：${text}`);});
 const guideLegacy=["EXP、金幣、裝備與副本進度","副本需要消耗挑戰次數","下一個尚未通過的樓層","每突破一層即可取得該層的 VIP 積分","每一種最高 Lv30","VIP4：提升副本進度取得速度","VIP12：進一步提升副本進度取得速度","第1～3階為 50／100／150","2500 × VIP 等級²","每級 EXP +2.5%","最高為 12,800","重置回 100"];
 guideLegacy.forEach(text=>{if(guideText.includes(text))fail("GUIDE_LEGACY_TEXT",`遊戲說明仍含過度詳細或舊規則：${text}`);});
 if(typeof gmHtml==="function"){
  const gmText=String(gmHtml());
  ["副本次數累積進度","副本可挑戰次數","GM 測試不扣副本次數","推進並取得積分","首通積分","平均每層積分"].forEach(text=>{if(gmText.includes(text))fail("GM_LEGACY_TEXT",`GM 介面仍含舊規則：${text}`);});
  ["今日懸賞","今日競技場","虛空歷史最高","虛空當日最高"].forEach(text=>{if(!gmText.includes(text))fail("GM_CURRENT_TEXT",`GM 介面缺少新版副本資料：${text}`);});
 }

 if(state&&Number(state.saveVersion)!==Number(window.SAVE_SCHEMA_VERSION))fail("STATE_SCHEMA",`state.saveVersion ${state.saveVersion} 與正式 schema 不一致`);
 if(state?.dungeon){
  ["progress","attempts","activeRun","points"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(state.dungeon,key))fail("LEGACY_DUNGEON_STATE",`state.dungeon 不應再含舊欄位 ${key}`);});
 }
 if(!window.LAST_SAVE_LOAD_REPORT)warn("LOAD_REPORT","尚未找到 LAST_SAVE_LOAD_REPORT");
 else if(Number(window.LAST_SAVE_LOAD_REPORT.pipelineVersion)!==Number(window.SAVE_LOAD_PIPELINE_VERSION))fail("LOAD_REPORT_PIPELINE","LAST_SAVE_LOAD_REPORT pipeline 與正式版本不一致",window.LAST_SAVE_LOAD_REPORT);

 if(state?.dungeon?.arena&&typeof window.ensureDungeonState==="function"){
  const arenaRef=state.dungeon.arena;
  window.ensureDungeonState();
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