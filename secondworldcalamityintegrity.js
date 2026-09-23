(function(){
 const VERSION=2;
 function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return null;}}
 function restoreObject(target,snapshot){
  if(!target||!snapshot)return false;
  Object.keys(target).forEach(k=>delete target[k]);
  Object.assign(target,clone(snapshot));
  return true;
 }
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
    const base=typeof window.secondWorldBossBaseStats==="function"?window.secondWorldBossBaseStats(d.bossIndex):null;
    const enemy=typeof window.buildSecondWorldCalamityEnemy==="function"?window.buildSecondWorldCalamityEnemy(d.id):null;
    if(base&&enemy){
     if(enemy.hp!==d.maxHp||enemy.atk!==Math.ceil(base.atk*1.1)||enemy.def!==Math.ceil(base.def*1.05)||enemy.crit!==10||enemy.dodge!==10)fail("ENEMY_FORMULA","正式災厄敵人公式異常",{i,base,enemy});
    }else fail("ENEMY_API","無法建立正式宇宙文明災厄敵人",{i});
   });

   const blank=()=>({entered:true,civilizationLevel:0,mainline:{bossKilled:Array(100).fill(false)},calamities:Array.from({length:10},()=>({currentHp:null,trueKills:0}))});
   if(typeof window.normalizeSecondWorldCalamityState==="function"){
    const probe={secondWorld:blank()};
    probe.secondWorld.calamities[0]={currentHp:99999999,trueKills:-5,futureTag:"keep"};
    probe.secondWorld.calamities[1]={currentHp:123456,trueKills:99};
    window.normalizeSecondWorldCalamityState(probe);
    if(probe.secondWorld.calamities.length!==10||probe.secondWorld.calamities[0].trueKills!==0||probe.secondWorld.calamities[0].currentHp!==1000000)fail("STATE_NORMALIZE","未完成災厄 state 正規化異常",probe.secondWorld.calamities.slice(0,2));
    if(probe.secondWorld.calamities[0].futureTag!=="keep")fail("STATE_UNKNOWN_PRESERVE","災厄專屬 normalization 不得刪除未知欄位",probe.secondWorld.calamities[0]);
    if(probe.secondWorld.calamities[1].trueKills!==30||probe.secondWorld.calamities[1].currentHp!==null)fail("STATE_COMPLETED_CLEAR","完成災厄應 trueKills=30 且 currentHp 清除",probe.secondWorld.calamities[1]);
    if(probe.secondWorld.calamities.some((row,i)=>row.calamityId!==defs[i]?.id))fail("ROW_ID_STAMP","災厄 state 每列都應帶穩定 calamityId",probe.secondWorld.calamities);

    const reordered={secondWorld:blank()};
    reordered.secondWorld.calamities=defs.map((d,i)=>({calamityId:d.id,trueKills:i,currentHp:null,tag:`row-${i}`}));
    [reordered.secondWorld.calamities[0],reordered.secondWorld.calamities[4]]=[reordered.secondWorld.calamities[4],reordered.secondWorld.calamities[0]];
    window.normalizeSecondWorldCalamityState(reordered);
    if(reordered.secondWorld.calamities[0].tag!=="row-0"||reordered.secondWorld.calamities[4].tag!=="row-4"||reordered.secondWorld.calamities[4].trueKills!==4)fail("ROW_ID_REORDER","有 calamityId 的資料應依 ID 回到正確災厄，不得因陣列順序串位",reordered.secondWorld.calamities.slice(0,5));
   }else fail("STATE_API","normalizeSecondWorldCalamityState 未載入");

   const unlockState={secondWorld:blank()};
   unlockState.secondWorld.mainline.bossKilled[9]=true;
   const first=window.getSecondWorldCalamityUnlockStatus?.(0,unlockState);
   unlockState.secondWorld.mainline.bossKilled[19]=true;
   const secondLocked=window.getSecondWorldCalamityUnlockStatus?.(1,unlockState);
   unlockState.secondWorld.civilizationLevel=1;
   const secondOpen=window.getSecondWorldCalamityUnlockStatus?.(1,unlockState);
   if(first?.visible!==true||first?.challengeable!==true)fail("FIRST_UNLOCK","第一隻災厄章末 Boss 完成後應現身且可挑戰",first);
   if(secondLocked?.visible!==true||secondLocked?.challengeable!==false||secondLocked?.reason!=="previous-civilization")fail("DOUBLE_GATE_LOCK","第二隻災厄文明不足時應已現身但不可挑戰",secondLocked);
   if(secondOpen?.challengeable!==true)fail("DOUBLE_GATE_OPEN","前置文明完成後第二隻災厄應可挑戰",secondOpen);
   const hidden={secondWorld:blank()};hidden.secondWorld.civilizationLevel=10;
   if(window.getSecondWorldCalamityUnlockStatus?.(1,hidden)?.visible!==false)fail("DISCOVERY_GATE","未擊敗章末 Boss 不得提前現身");

   const progressState={secondWorld:blank()};
   progressState.secondWorld.calamities[0].trueKills=1;
   if(window.getSecondWorldCalamityProgressPercent?.(0,progressState)!==3.33)fail("PROGRESS_1","1 true kill 應為 3.33%");
   progressState.secondWorld.calamities[0].trueKills=2;
   if(window.getSecondWorldCalamityProgressPercent?.(0,progressState)!==6.67)fail("PROGRESS_2","2 true kills 應為 6.67%");
   progressState.secondWorld.calamities[0].trueKills=30;
   if(window.getSecondWorldCalamityProgressPercent?.(0,progressState)!==100)fail("PROGRESS_30","30 true kills 應為 100%");
   const civCompleteState={secondWorld:blank()};civCompleteState.secondWorld.civilizationLevel=1;civCompleteState.secondWorld.calamities[0].trueKills=7;
   const civCompleteStatus=window.getSecondWorldCalamityStatus?.(0,civCompleteState);
   if(civCompleteStatus?.completed!==true||civCompleteStatus?.progressPercent!==100||civCompleteStatus?.recordedTrueKills!==7||civCompleteStatus?.completionSource!=="civilization")fail("CIVILIZATION_COMPLETION_SEMANTICS","文明已達成時正式完成進度應為 100%，但保留歷史 trueKills 紀錄",civCompleteStatus);

   if(Number(window.SECOND_WORLD_CALAMITY_COMBAT_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_SETTLEMENT_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_CONTINUOUS_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_TITLE_FIRST_KILL_VERSION)!==2)fail("COMBAT_OWNER","災厄 Combat／Settlement／Continuous／First Kill owner 版本異常");
   if(typeof state!=="undefined"&&state&&typeof state==="object"&&typeof window.settleSecondWorldCalamityBattle==="function"){
    const backup=clone(state);
    if(!backup)fail("STATE_BACKUP","無法建立正式 state probe 備份");
    else{
     try{
      state.secondWorld=blank();
      state.secondWorld.mainline.bossKilled[9]=true;
      state.secondWorld.calamities[0]={currentHp:400000,trueKills:29};
      const loss=window.settleSecondWorldCalamityBattle(0,{win:false,enemyHp:123456,hp:1},{save:false});
      if(!loss?.ok||loss.trueKill!==false||state.secondWorld.calamities[0].trueKills!==29||state.secondWorld.calamities[0].currentHp!==123456)fail("PERSISTENT_HP","未擊殺時應保存災厄殘血且不增加 true kill",{loss,row:state.secondWorld.calamities[0]});
      const kill=window.settleSecondWorldCalamityBattle(0,{win:true,enemyHp:0,hp:1},{save:false});
      if(!kill?.ok||kill.trueKill!==true||kill.trueKills!==30||kill.civilizationLevelUp!==true||state.secondWorld.civilizationLevel!==1||state.secondWorld.calamities[0].currentHp!==null)fail("THIRTIETH_KILL","第 30 次 true kill 應完成文明 Lv1 並清除 persistent HP",{kill,secondWorld:state.secondWorld});
      state.secondWorld.calamities[0].currentHp=222222;
      const replayStart=window.getSecondWorldCalamityCurrentHp?.(0,state);
      const replayLoss=window.settleSecondWorldCalamityBattle(0,{win:false,enemyHp:111111,hp:1},{save:false});
      if(replayStart!==1000000||replayLoss?.trueKill!==false||replayLoss?.trueKills!==30||state.secondWorld.calamities[0].currentHp!==null)fail("COMPLETED_REPLAY","完成後重打必須滿 HP 開始、敗北不留殘血、不再增加進度",{replayStart,replayLoss,row:state.secondWorld.calamities[0]});
      if(replayLoss?.rewards?.exp!==0||replayLoss?.rewards?.darkMatter!==0||replayLoss?.rewards?.darkEnergy!==0||replayLoss?.rewards?.equipment!==0)fail("NO_REWARDS","文明災厄不得提供一般獎勵",replayLoss?.rewards);

      state.secondWorld=blank();
      state.secondWorld.civilizationLevel=1;
      state.secondWorld.mainline.bossKilled[9]=true;
      state.titles={version:1,unlocked:[],equipped:null,pendingNotice:null};
      const gmAdvancedKill=window.settleSecondWorldCalamityBattle(0,{win:true,enemyHp:0,hp:1},{save:false});
      const titleId=defs[0]?.titleId;
      if(!gmAdvancedKill?.ok||gmAdvancedKill.completedBefore!==true||gmAdvancedKill.trueKill!==true||gmAdvancedKill.trueKills!==1||gmAdvancedKill.civilizationLevel!==1||gmAdvancedKill.civilizationLevelUp!==false||gmAdvancedKill.titleSettlement?.firstAcquisition!==true||!state.titles?.unlocked?.includes(titleId))fail("GM_ADVANCED_FIRST_KILL","GM 已先提高文明等級時，下一次真正首殺應只記 1 true kill 並正常補首殺稱號，不偽造 30 擊殺",{gmAdvancedKill,titles:state.titles,row:state.secondWorld.calamities[0]});
     }finally{restoreObject(state,backup);}
    }
   }else fail("SETTLEMENT_API","正式 settlement／state 未載入");

   try{
    const runSource=Function.prototype.toString.call(window.fightNextSecondWorldCalamityBattle);
    const settleSource=Function.prototype.toString.call(window.settleSecondWorldCalamityBattle);
    if(!/civilization-complete/.test(runSource)||!/completed/.test(runSource)||!/title-first-kill/.test(runSource))fail("CONTINUOUS_STOP","文明完成／首殺稱號的連續討伐停止 wiring 遺失",runSource);
    if(!/saveAtomic/.test(settleSource)||!/restorePlayerHp/.test(settleSource)||!/firstRecordedKill/.test(settleSource))fail("SETTLEMENT_ATOMIC_HP","settlement 應保留 atomic save、玩家滿 HP restore 與真實首殺 wiring",settleSource);
   }catch(error){fail("SOURCE_WIRING","戰鬥 source probe 失敗",String(error?.message||error));}

   if(Number(window.SECOND_WORLD_CALAMITY_UI_VERSION)!==2||Number(window.SECOND_WORLD_CALAMITY_PLAYER_SEMANTICS_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_APPEARANCE_NOTICE_VERSION)!==2||Number(window.SECOND_WORLD_CALAMITY_UI_INTEGRITY_VERSION)!==1||window.SECOND_WORLD_CALAMITY_UI_INTEGRITY?.passed!==true)fail("PLAYER_UI","第二世界災厄玩家 UI 完整性異常",window.SECOND_WORLD_CALAMITY_UI_INTEGRITY);
   if(Number(window.GM_SECOND_WORLD_CALAMITY_VERSION)!==1||Number(window.GM_SECOND_WORLD_CALAMITY_FORMAL_VERSION)!==1||Number(window.GM_SECOND_WORLD_CALAMITY_TEST_VERSION)!==1||Number(window.GM_SECOND_WORLD_CALAMITY_ATOMIC_MUTATION_VERSION)!==1||Number(window.GM_SECOND_WORLD_CALAMITY_INTEGRITY_VERSION)!==1||window.GM_SECOND_WORLD_CALAMITY_INTEGRITY?.passed!==true)fail("GM_CHAIN","第二世界災厄 GM 完整性／atomic mutation 異常",window.GM_SECOND_WORLD_CALAMITY_INTEGRITY);
   if(Number(window.GM_POWER_BENCHMARK_VERSION)!==18||Number(window.GM_POWER_BENCHMARK_CALAMITY_VERSION)!==1||Number(window.GM_POWER_BENCHMARK_CALAMITY_INTEGRATION_VERSION)!==1)fail("BENCHMARK_CHAIN","第二世界災厄 Benchmark 版本鏈異常",{benchmark:window.GM_POWER_BENCHMARK_VERSION,calamity:window.GM_POWER_BENCHMARK_CALAMITY_VERSION,integration:window.GM_POWER_BENCHMARK_CALAMITY_INTEGRATION_VERSION});

   if(Number(window.GAME_GUIDE_VERSION)!==17||Number(window.GAME_GUIDE_CALAMITY_WORLD_VERSION)!==1||typeof window.gameGuideCategoriesForState!=="function")fail("GUIDE_OWNER","文明災厄 world-aware Guide owner 異常");
   else{
    const galaxy=window.gameGuideCategoriesForState({secondWorld:{entered:false}});
    const universe=window.gameGuideCategoriesForState({secondWorld:{entered:true}});
    const findText=(cats)=>cats.find(c=>c.id==="dungeon")?.items?.find(i=>i?.[0]==="文明災厄")?.[1]||"";
    const g=findText(galaxy),u=findText(universe);
    ["印記最高 Lv.10","金幣","單場重打"].forEach(t=>{if(!g.includes(t))fail("GUIDE_GALAXY","銀河文明災厄說明缺少："+t,g);});
    ["10 隻","30 次 true kill","前一文明等級","暗物質","單場重打","不再增加進度"].forEach(t=>{if(!u.includes(t))fail("GUIDE_UNIVERSE","宇宙文明災厄說明缺少："+t,u);});
    if(u.includes("印記最高 Lv.10"))fail("GUIDE_WORLD_LEAK","宇宙文明災厄說明不應沿用第一世界印記語意",u);
   }
  }catch(error){fail("EXCEPTION","第二世界文明災厄完整 Integrity 執行失敗",String(error?.message||error));}
  const report={version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
  window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT=report;
  return report;
 }
 window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION=VERSION;
 window.runSecondWorldCalamityFullIntegrity=run;
 setTimeout(run,0);
})();