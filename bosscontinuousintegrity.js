(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const marker=window.CONTINUOUS_BATTLE_COUNT;
 const src=fn=>{try{return typeof fn==="function"?Function.prototype.toString.call(fn):"";}catch(e){return "";}};
 window.BOSS_CONTINUOUS_INTEGRITY_VERSION=5;

 if(marker!=="continuous")fail("BOSS_CONTINUOUS_MARKER_OWNER",`CONTINUOUS_BATTLE_COUNT 應由 ui.js 統一提供 continuous，實際 ${marker}`);
 if(Number(window.MAIN_BOSS_CONTINUOUS_VERSION)!==1)fail("BOSS_CONTINUOUS_VERSION",`MAIN_BOSS_CONTINUOUS_VERSION 應為 1，實際 ${window.MAIN_BOSS_CONTINUOUS_VERSION}`);
 if(typeof window.HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION!=="undefined")fail("BOSS_LEGACY_HP_FLOW_MARKER","HP flow 舊 Boss continuous 修補 marker 應已退休");
 if(Number(window.MAIN_BATTLE_PACING_VERSION)!==1)fail("BOSS_PACING_VERSION",`MAIN_BATTLE_PACING_VERSION 應為 1，實際 ${window.MAIN_BATTLE_PACING_VERSION}`);
 if(typeof window.mainBattleGapMs!=="function")fail("BOSS_PACING_GAP_API","mainBattleGapMs 未載入");
 else{
  const gaps={normal:window.mainBattleGapMs("normal"),elite:window.mainBattleGapMs("elite"),boss:window.mainBattleGapMs("boss")};
  if(gaps.normal!==140||gaps.elite!==220||gaps.boss!==140)fail("BOSS_PACING_GAP_VALUES","主線場間節奏應為 normal 140ms／elite 220ms／boss 140ms",gaps);
 }

 if(typeof battleModesForEnemy!=="function")fail("BOSS_BATTLE_MODE_API","battleModesForEnemy 未載入");
 else{
  const sets={boss:battleModesForEnemy({kind:"boss"}),elite:battleModesForEnemy({kind:"elite"}),normal:battleModesForEnemy({kind:"normal"})};
  Object.entries(sets).forEach(([kind,modes])=>{
   if(!Array.isArray(modes)||modes.length!==2||new Set(modes).size!==2||!modes.includes(1)||!modes.includes(marker))fail("BOSS_BATTLE_MODE_SHARED",`${kind} 應只共用單場／連續戰鬥兩種模式`,modes);
  });
 }

 const selectEnemySource=src(typeof selectEnemy==="function"?selectEnemy:null);
 if(!selectEnemySource)fail("BOSS_SELECT_ENEMY_API","selectEnemy 未載入");
 else if(/kind\s*===?\s*["']boss["']/.test(selectEnemySource)&&/selectedBattleCount\s*=\s*1/.test(selectEnemySource))fail("BOSS_SELECT_FORCE_SINGLE","切換 Boss 不應再強制 selectedBattleCount=1");

 const startBattlesSource=src(window.startBattles);
 if(!startBattlesSource)fail("BOSS_START_BATTLES_API","正式 window.startBattles 未載入");
 else{
  if(!/selectedBattleCount/.test(startBattlesSource))fail("BOSS_START_MODE_OWNER","正式 startBattles 應直接使用 selectedBattleCount",startBattlesSource);
  if(!/healBeforeBattle\s*\(\s*\)/.test(startBattlesSource))fail("BOSS_START_HEAL_OWNER","正式 startBattles 應在 ui.js 入口先執行 healBeforeBattle",startBattlesSource);
  if(!/beginCombat\s*\(\s*count\s*\)/.test(startBattlesSource))fail("BOSS_START_BEGIN_COMBAT","正式 startBattles 應把同一個 count 傳入 beginCombat",startBattlesSource);
  if(/kind\s*===?\s*["']boss["']/.test(startBattlesSource)||/[?]\s*1\s*:\s*selectedBattleCount/.test(startBattlesSource))fail("BOSS_START_FORCE_SINGLE","正式 startBattles 不應再依 Boss 強制改成單場",startBattlesSource);
 }

 const fightSource=src(typeof fightOnce==="function"?fightOnce:null);
 if(!fightSource)fail("BOSS_FIGHT_CORE_API","fightOnce 未載入");
 else{
  if(!/bossLocked\s*\[\s*mapIdx\s*\]\s*=\s*true/.test(fightSource))fail("BOSS_DEFEAT_LOCK","Boss 戰敗仍應鎖定再挑戰");
  if(!/bossProgress\s*\[\s*mapIdx\s*\]\s*=\s*0/.test(fightSource))fail("BOSS_DEFEAT_PROGRESS_RESET","Boss 戰敗仍應把重開進度歸零");
  if(!/bossKilled\s*\[\s*mapIdx\s*\]\s*=\s*true/.test(fightSource)||!/unlockedMap\s*=\s*Math\.max\(state\.unlockedMap,mapIdx\+1\)/.test(fightSource.replace(/\s+/g,"")))fail("BOSS_FIRST_CLEAR_UNLOCK","Boss 首殺仍應只解鎖下一張地圖，不改變目前戰鬥目標");
 }

 if(typeof addProgress!=="function")fail("BOSS_REOPEN_PROGRESS_API","addProgress 未載入");
 else if(!state||!Array.isArray(state.bossLocked)||!Array.isArray(state.bossProgress)||!state.bossLocked.length)fail("BOSS_REOPEN_PROGRESS_STATE","Boss 重開進度狀態不可用");
 else{
  const mapIdx=0,oldLocked=state.bossLocked[mapIdx],oldProgress=state.bossProgress[mapIdx];
  try{
   state.bossLocked[mapIdx]=true;state.bossProgress[mapIdx]=0;
   addProgress(mapIdx,"normal");
   if(state.bossProgress[mapIdx]!==0||state.bossLocked[mapIdx]!==true)fail("BOSS_REOPEN_NON_ELITE","非菁英勝利不得增加 Boss 重開進度",{locked:state.bossLocked[mapIdx],progress:state.bossProgress[mapIdx]});
   for(let i=0;i<9;i++)addProgress(mapIdx,"elite");
   if(state.bossProgress[mapIdx]!==9||state.bossLocked[mapIdx]!==true)fail("BOSS_REOPEN_NINE_ELITES","9 隻菁英後 Boss 應仍鎖定且進度為 9/10",{locked:state.bossLocked[mapIdx],progress:state.bossProgress[mapIdx]});
   addProgress(mapIdx,"elite");
   if(state.bossProgress[mapIdx]!==10||state.bossLocked[mapIdx]!==false)fail("BOSS_REOPEN_TEN_ELITES","第 10 隻菁英後 Boss 應解鎖且進度為 10/10",{locked:state.bossLocked[mapIdx],progress:state.bossProgress[mapIdx]});
   addProgress(mapIdx,"elite");
   if(state.bossProgress[mapIdx]!==10||state.bossLocked[mapIdx]!==false)fail("BOSS_REOPEN_CAP","Boss 解鎖後重開進度不得繼續增加",{locked:state.bossLocked[mapIdx],progress:state.bossProgress[mapIdx]});
  }finally{state.bossLocked[mapIdx]=oldLocked;state.bossProgress[mapIdx]=oldProgress;}
 }

 const pipelineSource=src(typeof runBattles==="function"?runBattles:null);
 if(!pipelineSource)fail("BOSS_CONTINUOUS_PIPELINE_API","runBattles 未載入");
 else{
  if(!/if\s*\(\s*!r\.win\s*\)/.test(pipelineSource)||!/break/.test(pipelineSource))fail("BOSS_DEFEAT_STOPS_CONTINUOUS","主線連戰戰敗後應立即停止");
  if(!/currentCombatEncounter\s*=\s*createMonsterEncounter\(selectedMap,selectedEnemy\)/.test(pipelineSource))fail("BOSS_CONTINUOUS_SAME_TARGET","連戰下一場應繼續目前 selectedMap／selectedEnemy");
  if(!/battleGapMs\s*\(\s*r\.e\.kind\s*\)/.test(pipelineSource))fail("BOSS_PIPELINE_SHARED_GAP","主線 pipeline 應使用共用 battleGapMs，而不是各自維護場間常數",pipelineSource);
  const stopChecks=(pipelineSource.match(/shouldStopContinuous\s*\(\s*ctx\s*\)/g)||[]).length;
  if(stopChecks<3)fail("BOSS_CONTINUOUS_STOP_BOUNDARIES","主線 pipeline 應在下一場開始前、特殊遭遇後與一般主線後都檢查停止要求",{stopChecks});
 }

 if(typeof window.requestContinuousBattleStop!=="function")fail("BOSS_CONTINUOUS_STOP_API","requestContinuousBattleStop 未載入");
 else{
  const oldBusy=battleBusy,oldCtx=window.activeMainBattleContext;
  try{
   const ctx={continuous:true,exitRequested:false};battleBusy=true;window.activeMainBattleContext=ctx;
   const accepted=window.requestContinuousBattleStop();
   if(accepted!==true||ctx.exitRequested!==true)fail("BOSS_CONTINUOUS_STOP_REQUEST","連戰停止要求應只標記 exitRequested，交由本場結束後停止",{accepted,exitRequested:ctx.exitRequested});
   const single={continuous:false,exitRequested:false};window.activeMainBattleContext=single;
   const rejected=window.requestContinuousBattleStop();
   if(rejected!==false||single.exitRequested!==false)fail("BOSS_SINGLE_STOP_REJECTED","單場戰鬥不得接受連戰停止要求",{rejected,exitRequested:single.exitRequested});
  }finally{battleBusy=oldBusy;window.activeMainBattleContext=oldCtx;}
 }

 if(typeof window.mainlineEnhancementStoneReward!=="function")fail("BOSS_MAINLINE_STONE_API","主線強化石獎勵 API 未載入");
 else{
  const eligible=window.mainlineEnhancementStoneReward({kind:"boss",level:100},100),blocked=window.mainlineEnhancementStoneReward({kind:"boss",level:100},110);
  if(Number(eligible?.basic)!==0||Number(eligible?.advanced)!==1)fail("BOSS_ADVANCED_STONE_REWARD","符合等級差規則的 Boss 每場應給 1 顆進階強化石",eligible);
  if(Number(blocked?.basic)!==0||Number(blocked?.advanced)!==0)fail("BOSS_ADVANCED_STONE_LEVEL_GAP","玩家高於 Boss 10 級（含）以上時不應掉強化石",blocked);
 }

 const specialSource=src(window.maybeHandleSpecialEncounter);
 if(!specialSource)fail("BOSS_SPECIAL_ENCOUNTER_API","maybeHandleSpecialEncounter 未載入");
 else{
  const compact=specialSource.replace(/\s+/g," "),bossIndex=compact.search(/baseEnemy\?\.kind\s*===?\s*["']boss["']\)return false/),blackMarketIndex=compact.indexOf("pendingBlackMarketEncounter");
  if(bossIndex<0)fail("BOSS_SPECIAL_ENCOUNTER_EXCLUDED","Boss 應在特殊遭遇抽選前直接排除");
  if(bossIndex>=0&&blackMarketIndex>=0&&bossIndex>blackMarketIndex)fail("BOSS_BLACK_MARKET_ORDER","Boss 排除必須早於黑市情報強制遭遇判斷，避免消耗情報");
 }

 if(Number(window.BACKGROUND_PROGRESS_MAIN_SHARED_VERSION)!==2)fail("BOSS_BACKGROUND_SHARED_VERSION",`BACKGROUND_PROGRESS_MAIN_SHARED_VERSION 應為 2，實際 ${window.BACKGROUND_PROGRESS_MAIN_SHARED_VERSION}`);
 if(typeof window.BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION!=="undefined")fail("BOSS_BACKGROUND_LEGACY_EXCLUSION","Boss 背景戰鬥舊排除 marker 應已退休");
 if(typeof window.backgroundProgressMainBattleAllowsBackground!=="function")fail("BOSS_BACKGROUND_API","主線背景戰鬥判斷 API 未載入");
 else if(window.backgroundProgressMainBattleAllowsBackground()!==true)fail("BOSS_BACKGROUND_SHARED","普通怪、菁英怪與 Boss 的連續戰鬥都應共用背景推進");

 if(typeof window.offlineEnhancementStoneReward!=="function")fail("BOSS_OFFLINE_REWARD_API","offlineEnhancementStoneReward 未載入");
 else{
  const probe=window.offlineEnhancementStoneReward({kind:"boss",level:100},100,100);
  if(Number(probe?.basic)!==0||Number(probe?.advanced)!==0)fail("BOSS_OFFLINE_STONE_REWARD","離線戰鬥不得產生 Boss 強化石",probe);
 }

 if(typeof window.mainBattleSettlementHtml!=="function")fail("BOSS_SETTLEMENT_API","主線共用結算 API 未載入");
 else{
  const rewards=typeof window.blankBattleEnhancementRewards==="function"?window.blankBattleEnhancementRewards():{battle:{basic:0,advanced:0},autoSale:{basic:0,advanced:0}};
  if(rewards?.battle)rewards.battle.advanced=3;
  const ctx={continuous:true,wins:3,totalXp:30,totalGold:40,items:[],enhancementRewards:rewards},html=window.mainBattleSettlementHtml(ctx);
  if(!html.includes("完成 3 場")||!html.includes("EXP")||!html.includes("金幣"))fail("BOSS_SHARED_SETTLEMENT","連續主線結算應共用完成場數／EXP／金幣摘要",html);
  if(!html.includes("進階強化石")||!html.includes("+3"))fail("BOSS_SHARED_STONE_SETTLEMENT","Boss 連戰進階強化石應進入同一主線結算摘要",html);
 }

 if(Number(window.GAME_GUIDE_VERSION)!==10)fail("BOSS_GUIDE_VERSION",`GAME_GUIDE_VERSION 應為 10，實際 ${window.GAME_GUIDE_VERSION}`);
 const categories=Array.isArray(window.GAME_GUIDE_CATEGORIES)?window.GAME_GUIDE_CATEGORIES:[],adventure=categories.find(x=>x?.id==="adventure");
 const adventureGuideText=Array.isArray(adventure?.items)?adventure.items.map(x=>`${x?.[0]||""} ${x?.[1]||""}`).join("\n"):"";
 const allGuideText=categories.flatMap(x=>Array.isArray(x?.items)?x.items:[]).map(x=>`${x?.[0]||""} ${x?.[1]||""}`).join("\n");
 if(!adventureGuideText.includes("Boss 可選擇單場或連續戰鬥"))fail("BOSS_GUIDE_CONTINUOUS","遊戲說明應明確說明 Boss 可單場或連續戰鬥");
 if(allGuideText.includes("Boss 固定只能單場")||allGuideText.includes("Boss 每次只能單場"))fail("BOSS_GUIDE_LEGACY_SINGLE","遊戲說明不應殘留 Boss 只能單場舊規則");
 if(!allGuideText.includes("Boss 不會觸發"))fail("BOSS_GUIDE_SPECIAL_EXCLUDED","遊戲說明應保留 Boss 不觸發特殊怪");
 if(!adventureGuideText.includes("離線收益不會以 Boss 作為刷怪目標")||!adventureGuideText.includes("最近一次有效的普通怪或菁英怪戰鬥紀錄"))fail("BOSS_GUIDE_OFFLINE_NOTE","離線收益說明應包含 Boss 排除與最近有效普通／菁英紀錄備註");
 if(!adventureGuideText.includes('class="guide-note"'))fail("BOSS_GUIDE_OFFLINE_NOTE_STYLE","Boss 離線備註應保留獨立 guide-note 排版區塊");

 window.BOSS_CONTINUOUS_INTEGRITY={version:5,passed:errors.length===0,errors,checkedAt:new Date().toISOString()};
})();