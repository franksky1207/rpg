(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const marker=window.CONTINUOUS_BATTLE_COUNT||"continuous";
 const src=fn=>{try{return typeof fn==="function"?Function.prototype.toString.call(fn):"";}catch(e){return "";}};
 window.BOSS_CONTINUOUS_INTEGRITY_VERSION=2;

 if(Number(window.MAIN_BOSS_CONTINUOUS_VERSION)!==1)fail("BOSS_CONTINUOUS_VERSION",`MAIN_BOSS_CONTINUOUS_VERSION 應為 1，實際 ${window.MAIN_BOSS_CONTINUOUS_VERSION}`);
 if(Number(window.HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION)!==1)fail("BOSS_HP_FLOW_FIX_VERSION",`HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION 應為 1，實際 ${window.HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION}`);
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
  if(/kind\s*===?\s*["']boss["']/.test(startBattlesSource)||/[?]\s*1\s*:\s*selectedBattleCount/.test(startBattlesSource))fail("BOSS_START_FORCE_SINGLE","正式 startBattles 不應再依 Boss 強制改成單場",startBattlesSource);
 }

 const fightSource=src(typeof fightOnce==="function"?fightOnce:null);
 if(!fightSource)fail("BOSS_FIGHT_CORE_API","fightOnce 未載入");
 else{
  if(!/bossLocked\s*\[\s*mapIdx\s*\]\s*=\s*true/.test(fightSource))fail("BOSS_DEFEAT_LOCK","Boss 戰敗仍應鎖定再挑戰");
  if(!/bossProgress\s*\[\s*mapIdx\s*\]\s*=\s*0/.test(fightSource))fail("BOSS_DEFEAT_PROGRESS_RESET","Boss 戰敗仍應把重開進度歸零");
  if(!/bossKilled\s*\[\s*mapIdx\s*\]\s*=\s*true/.test(fightSource)||!/unlockedMap\s*=\s*Math\.max\(state\.unlockedMap,mapIdx\+1\)/.test(fightSource.replace(/\s+/g,"")))fail("BOSS_FIRST_CLEAR_UNLOCK","Boss 首殺仍應只解鎖下一張地圖，不改變目前戰鬥目標");
 }
 const pipelineSource=src(typeof runBattles==="function"?runBattles:null);
 if(!pipelineSource)fail("BOSS_CONTINUOUS_PIPELINE_API","runBattles 未載入");
 else{
  if(!/if\s*\(\s*!r\.win\s*\)/.test(pipelineSource)||!/break/.test(pipelineSource))fail("BOSS_DEFEAT_STOPS_CONTINUOUS","主線連戰戰敗後應立即停止");
  if(!/currentCombatEncounter\s*=\s*createMonsterEncounter\(selectedMap,selectedEnemy\)/.test(pipelineSource))fail("BOSS_CONTINUOUS_SAME_TARGET","連戰下一場應繼續目前 selectedMap／selectedEnemy");
 }

 if(typeof window.mainlineEnhancementStoneReward!=="function")fail("BOSS_MAINLINE_STONE_API","主線強化石獎勵 API 未載入");
 else{
  const eligible=window.mainlineEnhancementStoneReward({kind:"boss",level:100},100);
  const blocked=window.mainlineEnhancementStoneReward({kind:"boss",level:100},110);
  if(Number(eligible?.basic)!==0||Number(eligible?.advanced)!==1)fail("BOSS_ADVANCED_STONE_REWARD","符合等級差規則的 Boss 每場應給 1 顆進階強化石",eligible);
  if(Number(blocked?.basic)!==0||Number(blocked?.advanced)!==0)fail("BOSS_ADVANCED_STONE_LEVEL_GAP","玩家高於 Boss 10 級（含）以上時不應掉強化石",blocked);
 }

 const specialSource=src(window.maybeHandleSpecialEncounter);
 if(!specialSource)fail("BOSS_SPECIAL_ENCOUNTER_API","maybeHandleSpecialEncounter 未載入");
 else{
  const compact=specialSource.replace(/\s+/g," ");
  const bossIndex=compact.search(/baseEnemy\?\.kind\s*===?\s*["']boss["']\)return false/);
  const blackMarketIndex=compact.indexOf("pendingBlackMarketEncounter");
  if(bossIndex<0)fail("BOSS_SPECIAL_ENCOUNTER_EXCLUDED","Boss 應在特殊遭遇抽選前直接排除");
  if(bossIndex>=0&&blackMarketIndex>=0&&bossIndex>blackMarketIndex)fail("BOSS_BLACK_MARKET_ORDER","Boss 排除必須早於黑市情報強制遭遇判斷，避免消耗情報");
 }

 if(Number(window.BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION)!==1)fail("BOSS_BACKGROUND_EXCLUSION_VERSION",`BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION 應為 1，實際 ${window.BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION}`);
 const bgSource=src(window.backgroundProgressMainBattleAllowsBackground);
 if(!bgSource||!/boss/.test(bgSource))fail("BOSS_BACKGROUND_EXCLUDED","Boss 連戰應排除主線 background catch-up");
 if(typeof window.offlineEnhancementStoneReward!=="function")fail("BOSS_OFFLINE_REWARD_API","offlineEnhancementStoneReward 未載入");
 else{
  const probe=window.offlineEnhancementStoneReward({kind:"boss",level:100},100,100);
  if(Number(probe?.basic)!==0||Number(probe?.advanced)!==0)fail("BOSS_OFFLINE_STONE_REWARD","離線戰鬥不得產生 Boss 強化石",probe);
 }

 if(typeof window.mainBattleSettlementHtml!=="function")fail("BOSS_SETTLEMENT_API","主線共用結算 API 未載入");
 else{
  const rewards=typeof window.blankBattleEnhancementRewards==="function"?window.blankBattleEnhancementRewards():{battle:{basic:0,advanced:0},autoSale:{basic:0,advanced:0}};
  if(rewards?.battle)rewards.battle.advanced=3;
  const ctx={continuous:true,wins:3,totalXp:30,totalGold:40,items:[],enhancementRewards:rewards};
  const html=window.mainBattleSettlementHtml(ctx);
  if(!html.includes("完成 3 場")||!html.includes("EXP")||!html.includes("金幣"))fail("BOSS_SHARED_SETTLEMENT","連續主線結算應共用完成場數／EXP／金幣摘要",html);
  if(!html.includes("進階強化石")||!html.includes("+3"))fail("BOSS_SHARED_STONE_SETTLEMENT","Boss 連戰進階強化石應進入同一主線結算摘要",html);
 }

 if(Number(window.GAME_GUIDE_VERSION)!==10)fail("BOSS_GUIDE_VERSION",`GAME_GUIDE_VERSION 應為 10，實際 ${window.GAME_GUIDE_VERSION}`);
 const categories=Array.isArray(window.GAME_GUIDE_CATEGORIES)?window.GAME_GUIDE_CATEGORIES:[];
 const adventure=categories.find(x=>x?.id==="adventure");
 const adventureGuideText=Array.isArray(adventure?.items)?adventure.items.map(x=>`${x?.[0]||""} ${x?.[1]||""}`).join("\n"):"";
 const allGuideText=categories.flatMap(x=>Array.isArray(x?.items)?x.items:[]).map(x=>`${x?.[0]||""} ${x?.[1]||""}`).join("\n");
 if(!adventureGuideText.includes("Boss 可選擇單場或連續戰鬥"))fail("BOSS_GUIDE_CONTINUOUS","遊戲說明應明確說明 Boss 可單場或連續戰鬥");
 if(allGuideText.includes("Boss 固定只能單場")||allGuideText.includes("Boss 每次只能單場"))fail("BOSS_GUIDE_LEGACY_SINGLE","遊戲說明不應殘留 Boss 只能單場舊規則");
 if(!allGuideText.includes("Boss 不會觸發"))fail("BOSS_GUIDE_SPECIAL_EXCLUDED","遊戲說明應保留 Boss 不觸發特殊怪");
 if(!adventureGuideText.includes("離線收益不會以 Boss 作為刷怪目標")||!adventureGuideText.includes("最近一次有效的普通怪或菁英怪戰鬥紀錄"))fail("BOSS_GUIDE_OFFLINE_NOTE","離線收益說明應包含 Boss 排除與最近有效普通／菁英紀錄備註");
 if(!adventureGuideText.includes('class="guide-note"'))fail("BOSS_GUIDE_OFFLINE_NOTE_STYLE","Boss 離線備註應保留獨立 guide-note 排版區塊");

 window.BOSS_CONTINUOUS_INTEGRITY={version:2,passed:errors.length===0,errors,checkedAt:new Date().toISOString()};
})();