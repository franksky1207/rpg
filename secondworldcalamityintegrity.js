(function(){
 const VERSION=2;
 function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(_){return null;}}
 function restoreObject(target,snapshot){if(!target||!snapshot)return false;Object.keys(target).forEach(k=>delete target[k]);Object.assign(target,clone(snapshot));return true;}
 function run(){
  const errors=[];
  const fail=(code,message,detail=null)=>errors.push({code,message,detail});
  try{
   const defs=typeof window.getSecondWorldCalamityDefinitions==="function"?window.getSecondWorldCalamityDefinitions():[];
   const names=["彼岸黑潮","群星焚爐","邊星獵皇","萬軍葬艦","超域蝕核","無盡兵災","星脈噬巢","巨牆戰堡","深域吞星","終戰天穹"];
   if(Number(window.SECOND_WORLD_CALAMITY_DATA_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_STATE_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_UNLOCK_VERSION)!==2||Number(window.SECOND_WORLD_CALAMITY_DISCOVERY_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_REPLAY_POLICY_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_NORMALIZATION_OWNER_VERSION)!==3||Number(window.SECOND_WORLD_CALAMITY_ROW_IDENTITY_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_COMPLETION_SEMANTICS_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_STRUCTURE_OWNER_VERSION)!==1)fail("OWNER_VERSION","第二世界文明災厄 Data／State／Unlock／Normalization／Row Identity／Completion owner 版本異常");
   if(defs.length!==10||Number(window.SECOND_WORLD_CALAMITY_COUNT)!==10||Number(window.SECOND_WORLD_CALAMITY_TRUE_KILLS_REQUIRED)!==30)fail("COUNT_RULE","第二世界文明災厄應為 10 隻、每隻 30 true kills",{count:defs.length,kills:window.SECOND_WORLD_CALAMITY_TRUE_KILLS_REQUIRED});
   defs.forEach((d,i)=>{
    if(d.name!==names[i])fail("NAME","災厄名稱異常",{i,actual:d.name,expected:names[i]});
    if(d.level!==550+i*50||d.bossIndex!==9+i*10)fail("BOSS_LINK","章末 Boss 等級／index 對應異常",{i,level:d.level,bossIndex:d.bossIndex});
    if(d.maxHp!==1000000+i*200000)fail("HP_CURVE","災厄 HP 曲線異常",{i,actual:d.maxHp});
    if(d.atkMultiplier!==1.1||d.defMultiplier!==1.05||d.crit!==10||d.dodge!==10)fail("COMBAT_META","災厄攻防倍率／暴閃異常",{i,d});
    if(d.targetCivilizationLevel!==i+1||d.previousCivilizationLevel!==i)fail("CIV_LINK","災厄文明等級鏈異常",{i,d});
    const boss=window.SECOND_WORLD_BOSSES?.[d.bossIndex];
    if(!boss||boss.level!==d.level||boss.id!==d.bossId)fail("FORMAL_BOSS_LINK","災厄未對齊正式章末 Boss",{i,d,boss});
   });
   const blank=()=>({entered:true,civilizationLevel:0,mainline:{bossKilled:Array(100).fill(false)},calamities:Array.from({length:10},()=>({currentHp:null,trueKills:0}))});
   if(typeof window.normalizeSecondWorldCalamityState==="function"){
    const probe={secondWorld:blank()};probe.secondWorld.calamities[0]={currentHp:99999999,trueKills:-5,futureTag:"keep"};probe.secondWorld.calamities[1]={currentHp:123456,trueKills:99};window.normalizeSecondWorldCalamityState(probe);
    if(probe.secondWorld.calamities.length!==10||probe.secondWorld.calamities[0].trueKills!==0||probe.secondWorld.calamities[0].currentHp!==1000000)fail("STATE_NORMALIZE","未完成災厄 state 正規化異常",probe.secondWorld.calamities.slice(0,2));
    if(probe.secondWorld.calamities[0].futureTag!=="keep")fail("STATE_UNKNOWN_PRESERVE","災厄 normalization 不得刪除未知欄位",probe.secondWorld.calamities[0]);
    if(probe.secondWorld.calamities[1].trueKills!==30||probe.secondWorld.calamities[1].currentHp!==null)fail("STATE_COMPLETED_CLEAR","完成災厄應 trueKills=30 且 currentHp 清除",probe.secondWorld.calamities[1]);
    if(probe.secondWorld.calamities.some((row,i)=>row.calamityId!==defs[i]?.id))fail("ROW_ID_STAMP","災厄 state 每列都應帶穩定 calamityId",probe.secondWorld.calamities);
   }else fail("STATE_API","normalizeSecondWorldCalamityState 未載入");
   const unlockState={secondWorld:blank()};unlockState.secondWorld.mainline.bossKilled[9]=true;
   const first=window.getSecondWorldCalamityUnlockStatus?.(0,unlockState);unlockState.secondWorld.mainline.bossKilled[19]=true;const secondLocked=window.getSecondWorldCalamityUnlockStatus?.(1,unlockState);unlockState.secondWorld.civilizationLevel=1;const secondOpen=window.getSecondWorldCalamityUnlockStatus?.(1,unlockState);
   if(first?.visible!==true||first?.challengeable!==true)fail("FIRST_UNLOCK","第一隻災厄章末 Boss 完成後應現身且可挑戰",first);
   if(secondLocked?.visible!==true||secondLocked?.challengeable!==false||secondLocked?.reason!=="previous-civilization")fail("DOUBLE_GATE_LOCK","第二隻災厄文明不足時應已現身但不可挑戰",secondLocked);
   if(secondOpen?.challengeable!==true)fail("DOUBLE_GATE_OPEN","前置文明完成後第二隻災厄應可挑戰",secondOpen);
   const progressState={secondWorld:blank()};progressState.secondWorld.calamities[0].trueKills=1;if(window.getSecondWorldCalamityProgressPercent?.(0,progressState)!==3.33)fail("PROGRESS_1","1 true kill 應為 3.33%");progressState.secondWorld.calamities[0].trueKills=30;if(window.getSecondWorldCalamityProgressPercent?.(0,progressState)!==100)fail("PROGRESS_30","30 true kills 應為 100%");
   if(Number(window.SECOND_WORLD_CALAMITY_COMBAT_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_SETTLEMENT_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_CONTINUOUS_VERSION)!==2||Number(window.SECOND_WORLD_CALAMITY_TITLE_FIRST_KILL_VERSION)!==2)fail("COMBAT_OWNER","災厄 Combat／Settlement／Continuous／First Kill owner 版本異常",{combat:window.SECOND_WORLD_CALAMITY_COMBAT_VERSION,settlement:window.SECOND_WORLD_CALAMITY_SETTLEMENT_VERSION,continuous:window.SECOND_WORLD_CALAMITY_CONTINUOUS_VERSION,title:window.SECOND_WORLD_CALAMITY_TITLE_FIRST_KILL_VERSION});
   if(Number(window.SECOND_WORLD_CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION)!==1||Number(window.CONTINUOUS_RUN_INFRA_VERSION)!==1||window.CONTINUOUS_RUN_INFRA_INTEGRITY?.passed!==true)fail("SHARED_CONTINUOUS_INFRA","第二世界文明災厄未正確接入共用連戰 infrastructure",{world:window.SECOND_WORLD_CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION,shared:window.CONTINUOUS_RUN_INFRA_VERSION,integrity:window.CONTINUOUS_RUN_INFRA_INTEGRITY||null});
   const runSource=(()=>{try{return Function.prototype.toString.call(window.runSecondWorldCalamityContinuous);}catch(_){return "";}})();
   const fightSource=(()=>{try{return Function.prototype.toString.call(window.fightNextSecondWorldCalamityBattle);}catch(_){return "";}})();
   if(!/catchUpPreviewPolicy/.test(runSource)||!/fastCatchUp/.test(runSource))fail("SHARED_FAST_CATCH_UP_WIRING","宇宙文明災厄應沿用共用 Fast Catch-up",runSource);
   if(!/civilization-complete/.test(fightSource)||!/title-first-kill/.test(fightSource))fail("CONTINUOUS_STOP","文明完成／首殺稱號停止 wiring 遺失",fightSource);
   if(typeof state!=="undefined"&&state&&typeof state==="object"&&typeof window.settleSecondWorldCalamityBattle==="function"){
    const backup=clone(state);
    if(!backup)fail("STATE_BACKUP","無法建立正式 state probe 備份");
    else try{
     state.secondWorld=blank();state.secondWorld.mainline.bossKilled[9]=true;state.secondWorld.calamities[0]={currentHp:400000,trueKills:29};
     const loss=window.settleSecondWorldCalamityBattle(0,{win:false,enemyHp:123456,hp:1},{save:false});
     if(!loss?.ok||loss.trueKill!==false||state.secondWorld.calamities[0].trueKills!==29||state.secondWorld.calamities[0].currentHp!==123456)fail("PERSISTENT_HP","未擊殺時應保存災厄殘血且不增加 true kill",{loss,row:state.secondWorld.calamities[0]});
     const kill=window.settleSecondWorldCalamityBattle(0,{win:true,enemyHp:0,hp:1},{save:false});
     if(!kill?.ok||kill.trueKill!==true||kill.trueKills!==30||kill.civilizationLevelUp!==true||state.secondWorld.civilizationLevel!==1||state.secondWorld.calamities[0].currentHp!==null)fail("THIRTIETH_KILL","第 30 次 true kill 應完成文明 Lv1 並清除 persistent HP",{kill,secondWorld:state.secondWorld});
    }finally{restoreObject(state,backup);}
   }else fail("SETTLEMENT_API","正式 settlement／state 未載入");
   if(Number(window.SECOND_WORLD_CALAMITY_UI_VERSION)!==5||Number(window.SECOND_WORLD_CALAMITY_PLAYER_SEMANTICS_VERSION)!==2||Number(window.SECOND_WORLD_CALAMITY_APPEARANCE_NOTICE_VERSION)!==2||Number(window.SECOND_WORLD_CALAMITY_LIVE_PRESENTATION_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_MINIMAL_MODE_VERSION)!==3||Number(window.SECOND_WORLD_CALAMITY_MINIMAL_MODE_LIVE_HP_SYNC_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_UI_INTEGRITY_VERSION)!==4||window.SECOND_WORLD_CALAMITY_UI_INTEGRITY?.passed!==true)fail("PLAYER_UI","第二世界災厄玩家 UI 完整性異常",window.SECOND_WORLD_CALAMITY_UI_INTEGRITY);
   if(Number(window.GM_SECOND_WORLD_CALAMITY_VERSION)!==1||Number(window.GM_SECOND_WORLD_CALAMITY_FORMAL_VERSION)!==1||Number(window.GM_SECOND_WORLD_CALAMITY_TEST_VERSION)!==1||Number(window.GM_SECOND_WORLD_CALAMITY_ATOMIC_MUTATION_VERSION)!==1||Number(window.GM_SECOND_WORLD_CALAMITY_INTEGRITY_VERSION)!==1||window.GM_SECOND_WORLD_CALAMITY_INTEGRITY?.passed!==true)fail("GM_CHAIN","第二世界災厄 GM 完整性／atomic mutation 異常",window.GM_SECOND_WORLD_CALAMITY_INTEGRITY);
   if(Number(window.GAME_GUIDE_CALAMITY_WORLD_VERSION)!==1||typeof window.gameGuideCategoriesForState!=="function")fail("GUIDE_OWNER","文明災厄 world-aware Guide owner 異常");
  }catch(error){fail("EXCEPTION","第二世界文明災厄完整 Integrity 執行失敗",String(error?.message||error));}
  return {version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 }
 window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION=VERSION;
 window.runSecondWorldCalamityFullIntegrity=run;
 window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT=run();
 if(!window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT.passed)console.error("[文明戰線] Second World Calamity full integrity error",window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT.errors);
})();
