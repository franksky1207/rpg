(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const expectedRegions=(Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]).map(region=>String(region?.id||"")).filter(Boolean);
 const expectedMarks=["ward","suppression","composure","indomitable","resilience","battleSpirit","absorption","revenge","backlash","ignore"];
 const expectedCalamityNames=["灰潮母巢","日蝕王座","星骸迴廊","黑域牧者","滅世天環","寂滅方舟","萬域蝕潮","深核奇點","無聲裁決","終末之眼"];
 const expectedMarkNames=["護界印記","壓制印記","鎮心印記","不屈印記","韌性印記","戰意印記","吸收印記","復仇印記","反噬印記","無視印記"];
 const config=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
 if(Number(window.CIVILIZATION_CALAMITY_CONFIG_VERSION)!==2)fail("CALAMITY_CONFIG_VERSION","文明災厄統一設定版本應為 2",window.CIVILIZATION_CALAMITY_CONFIG_VERSION);
 if(config.length!==10)fail("CALAMITY_CONFIG_COUNT","文明災厄統一設定應正好 10 組",config);
 config.forEach((entry,index)=>{
  const region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[index]:null;
  if(!region||entry?.index!==index||entry?.id!==region.id||entry?.regionId!==region.id||entry?.regionName!==region.name||Number(entry?.unlockLevel)!==Number(region.max)||Number(entry?.mapIndex)!==Number(region.mapEnd)||entry?.calamityName!==expectedCalamityNames[index]||entry?.markId!==expectedMarks[index]||entry?.markName!==expectedMarkNames[index])fail("CALAMITY_CONFIG_ENTRY",`第 ${index+1} 組災厄／印記統一設定異常`,{entry,region});
 });

 if(Number(window.CALAMITY_STATE_VERSION)!==1)fail("CALAMITY_STATE_VERSION","文明災厄 state version 應為 1",window.CALAMITY_STATE_VERSION);
 if(Number(window.CALAMITY_BALANCE_VERSION)!==3)fail("CALAMITY_BALANCE_VERSION","文明災厄 balance version 應為 3",window.CALAMITY_BALANCE_VERSION);
 if(Number(window.CALAMITY_HP_PER_LEVEL)!==500000||typeof window.getCivilizationCalamityConfiguredMaxHp!=="function")fail("CALAMITY_HP_CURVE","文明災厄 HP 應為 500,000 × 災厄等級",{perLevel:window.CALAMITY_HP_PER_LEVEL,api:typeof window.getCivilizationCalamityConfiguredMaxHp});
 if(Number(window.MARK_STATE_VERSION)!==1)fail("MARK_STATE_VERSION","印記 state version 應為 1",window.MARK_STATE_VERSION);
 if(Number(window.MARK_MAX_LEVEL)!==10)fail("MARK_MAX_LEVEL","印記最高等級應為 10",window.MARK_MAX_LEVEL);

 const calamityIds=Array.from(window.CIVILIZATION_CALAMITY_IDS||[]);
 const markIds=Array.from(window.CIVILIZATION_MARK_IDS||[]);
 if(JSON.stringify(calamityIds)!==JSON.stringify(expectedRegions))fail("CALAMITY_IDS","災厄持久 ID 必須直接對應 WORLD_REGIONS",calamityIds);
 if(JSON.stringify(markIds)!==JSON.stringify(expectedMarks))fail("MARK_IDS","印記持久 ID 順序異常",markIds);
 if(new Set(calamityIds).size!==10||calamityIds.length!==10)fail("CALAMITY_ID_COUNT","文明災厄應正好 10 組持久 state",calamityIds);
 if(new Set(markIds).size!==10||markIds.length!==10)fail("MARK_ID_COUNT","印記應正好 10 組持久 state",markIds);

 if(typeof window.createBlankCalamityState!=="function"||typeof window.createBlankMarkState!=="function"||typeof window.normalizeCivilizationCalamityState!=="function"){
  fail("CALAMITY_STATE_API","文明災厄／印記持久 state API 未完整載入");
 }else{
  const blank={calamities:window.createBlankCalamityState(),marks:window.createBlankMarkState()};
  if(Object.keys(blank.calamities.entries||{}).length!==10)fail("BLANK_CALAMITIES","空白災厄 state 數量異常",blank.calamities);
  if(Object.keys(blank.marks.entries||{}).length!==10)fail("BLANK_MARKS","空白印記 state 數量異常",blank.marks);
  for(const id of calamityIds)if(blank.calamities.entries?.[id]?.currentHp!==null)fail("BLANK_CALAMITY_HP",`${id} 初始 currentHp 應為 null`,blank.calamities.entries?.[id]);
  for(const id of markIds){
   const mark=blank.marks.entries?.[id];
   if(mark?.acquired!==false||mark?.level!==0||mark?.progress!==0)fail("BLANK_MARK",`${id} 初始印記狀態異常`,mark);
  }

  const malformed={
   calamities:{version:999,balanceVersion:0,entries:{[calamityIds[0]]:{currentHp:-50},[calamityIds[1]]:{currentHp:2500000},extra:{currentHp:100}}},
   marks:{version:999,entries:{[markIds[0]]:{acquired:false,level:99,progress:7},[markIds[1]]:{acquired:false,level:0,progress:5},extra:{acquired:true,level:10,progress:9}}}
  };
  window.normalizeCivilizationCalamityState(malformed);
  if(malformed.calamities.version!==1||malformed.calamities.balanceVersion!==3||Object.keys(malformed.calamities.entries).length!==10||malformed.calamities.entries[calamityIds[0]].currentHp!==null||malformed.calamities.entries[calamityIds[1]].currentHp!==1000000)fail("CALAMITY_NORMALIZE","災厄 state normalizer／分級 HP clamp 異常",malformed.calamities);
  if(window.getCivilizationCalamityConfiguredMaxHp?.(calamityIds[0])!==500000||window.getCivilizationCalamityConfiguredMaxHp?.(calamityIds[9])!==5000000)fail("CALAMITY_HP_CURVE_VALUES","災厄 HP 曲線端點異常",{first:window.getCivilizationCalamityConfiguredMaxHp?.(calamityIds[0]),last:window.getCivilizationCalamityConfiguredMaxHp?.(calamityIds[9])});
  const m0=malformed.marks.entries[markIds[0]],m1=malformed.marks.entries[markIds[1]];
  if(malformed.marks.version!==1||Object.keys(malformed.marks.entries).length!==10||m0.acquired!==true||m0.level!==10||m0.progress!==0||m1.acquired!==false||m1.level!==0||m1.progress!==0)fail("MARK_NORMALIZE","印記 state normalizer 異常",malformed.marks);
 }

 if(typeof newState==="function"){
  const fresh=newState();
  if(Number(fresh.saveVersion)!==13)fail("NEW_STATE_SCHEMA","新存檔應直接建立為 Schema 13",fresh.saveVersion);
  if(Number(fresh.calamities?.version)!==1||Number(fresh.calamities?.balanceVersion)!==3||Object.keys(fresh.calamities?.entries||{}).length!==10)fail("NEW_STATE_CALAMITIES","newState 未建立正式災厄 state",fresh.calamities);
  if(Number(fresh.marks?.version)!==1||Object.keys(fresh.marks?.entries||{}).length!==10)fail("NEW_STATE_MARKS","newState 未建立正式印記 state",fresh.marks);
 }

 if(typeof window.migrateSave==="function"&&typeof newState==="function"&&typeof window.normalizeSaveState==="function"){
  const prior=window.LAST_SAVE_MIGRATION_REPORT;
  try{
   const probe=newState();
   delete probe.calamities;
   delete probe.marks;
   probe.saveVersion=12;
   const raw=JSON.parse(JSON.stringify(probe));
   const migrated=window.migrateSave(probe,12,window.normalizeSaveState,raw);
   if(Number(migrated.saveVersion)!==13)fail("MIGRATION_SCHEMA","v12 存檔未升到 Schema 13",migrated.saveVersion);
   if(Object.keys(migrated.calamities?.entries||{}).length!==10)fail("MIGRATION_CALAMITIES","v12 → v13 未建立 10 組災厄 state",migrated.calamities);
   if(Object.keys(migrated.marks?.entries||{}).length!==10)fail("MIGRATION_MARKS","v12 → v13 未建立 10 組印記 state",migrated.marks);
   if(window.LAST_SAVE_MIGRATION_REPORT?.calamityStateInitialized!==true||window.LAST_SAVE_MIGRATION_REPORT?.markStateInitialized!==true)fail("MIGRATION_REPORT","v12 → v13 migration report 未記錄災厄／印記初始化",window.LAST_SAVE_MIGRATION_REPORT);
  }catch(error){fail("MIGRATION_PROBE","v12 → v13 災厄／印記 migration probe 執行失敗",String(error));}
  window.LAST_SAVE_MIGRATION_REPORT=prior;
 }

 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.CALAMITY_STATE_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Calamity state integrity error",errors);
})();

