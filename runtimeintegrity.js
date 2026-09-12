(function(){
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const warn=(code,message,data=null)=>warnings.push({code,message,data});
 const expectedMaps=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS.reduce((max,r)=>Math.max(max,(Number(r?.mapEnd)||-1)+1),0):0;

 if(!Array.isArray(MAPS)||MAPS.length!==expectedMaps)fail("WORLD_MAP_COUNT",`MAPS 應為 ${expectedMaps} 張，實際 ${Array.isArray(MAPS)?MAPS.length:"非陣列"}`);
 if(window.WORLD_MAP_REGISTRATION_REPORT?.passed!==true)fail("WORLD_MAP_REGISTRY","世界地圖固定註冊檢查未通過",window.WORLD_MAP_REGISTRATION_REPORT?.errors||null);
 if(window.WORLD_NAMING_REPORT?.errors?.length)fail("WORLD_NAMING","世界資料硬錯誤",window.WORLD_NAMING_REPORT.errors);

 const required=[
  "migrateSave","finalizeDungeonLoadedState","ensureDungeonProgressState",
  "enterBountyDungeon","renderBountyDungeon",
  "getArenaProgressState","getArenaAssessmentStatus","registerRegionMaps"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("MISSING_FUNCTION",`必要函式 ${name} 未載入`);});

 if(Number(window.SAVE_SCHEMA_VERSION)!==10)fail("SAVE_SCHEMA",`SAVE_SCHEMA_VERSION 應為 10，實際 ${window.SAVE_SCHEMA_VERSION}`);
 if(Number(window.SAVE_LOAD_PIPELINE_VERSION)!==1)fail("SAVE_PIPELINE",`SAVE_LOAD_PIPELINE_VERSION 應為 1，實際 ${window.SAVE_LOAD_PIPELINE_VERSION}`);
 if(state&&Number(state.saveVersion)!==Number(window.SAVE_SCHEMA_VERSION))fail("STATE_SCHEMA",`state.saveVersion ${state.saveVersion} 與正式 schema 不一致`);
 if(!window.LAST_SAVE_LOAD_REPORT)warn("LOAD_REPORT","尚未找到 LAST_SAVE_LOAD_REPORT");

 if(state?.dungeon?.arena&&typeof window.ensureDungeonProgressState==="function"){
  const arenaRef=state.dungeon.arena;
  window.ensureDungeonProgressState();
  if(state.dungeon.arena!==arenaRef)fail("ARENA_REFERENCE","競技場 normalize 重新替換了 arena 物件參照");
 }

 const report={passed:errors.length===0,clean:errors.length===0&&warnings.length===0,errors,warnings,checkedAt:Date.now()};
 window.PROJECT_RUNTIME_REPORT=report;
 if(errors.length)console.error("[文明戰線] Runtime integrity error",errors);
 else if(warnings.length)console.warn("[文明戰線] Runtime integrity warning",warnings);
})();