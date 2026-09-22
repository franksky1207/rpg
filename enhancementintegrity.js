(function(){
 const errors=[];
 const fail=(code,message)=>errors.push({code,message});
 if(window.ENHANCEMENT_INTEGRITY_REPORT?.passed!==true)fail("SAVE_INTEGRITY","強化存檔相容檢查未通過");
 if(Number(window.ENHANCEMENT_MIGRATION_WORLD_AWARE_VERSION)!==2)fail("MIGRATION_WORLD_AWARE","強化 migration 世界感知版本不是 V2");
 if(Number(window.ENHANCEMENT_MAX_LEVEL)!==20||Number(window.ENHANCEMENT_ABSOLUTE_MAX_LEVEL)!==40)fail("MAX_LEVEL","強化 legacy／絕對上限異常");
 if(Number(window.FIRST_WORLD_ENHANCEMENT_CAP)!==20||Number(window.SECOND_WORLD_ENHANCEMENT_MIN)!==20||Number(window.SECOND_WORLD_ENHANCEMENT_CAP)!==40)fail("WORLD_RANGE","銀河／宇宙強化正式範圍異常");
 if(Number(window.ENHANCEMENT_WORLD_AWARE_CORE_VERSION)!==2||Number(window.ENHANCEMENT_FORMAL_RANGE_VERSION)!==2)fail("CORE_OWNER","世界感知強化 core／正式範圍 owner 版本異常");
 if(Number(window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL)!==2.5)fail("BONUS","每級強化不是 2.5%");
 if(typeof window.effectiveEnhancementMin!=="function"||typeof window.effectiveEnhancementCap!=="function"||typeof window.formalEnhancementLevelValid!=="function"||typeof window.enhancementFormalStateIssues!=="function"||typeof window.enhancementUpgradeCost!=="function")fail("WORLD_RANGE_API","世界感知強化範圍／成本 API 未完整載入");
 else{
  const galaxy={secondWorld:{entered:false},enhancement:{levels:{weapon:0,helmet:0,armor:0,shoes:0,accessory:0}}};
  const universe={secondWorld:{entered:true},enhancement:{levels:{weapon:20,helmet:21,armor:30,shoes:40,accessory:20}}};
  if(window.effectiveEnhancementMin(galaxy)!==0||window.effectiveEnhancementCap(galaxy)!==20)fail("GALAXY_RANGE","銀河正式強化範圍不是 +0～+20");
  if(window.effectiveEnhancementMin(universe)!==20||window.effectiveEnhancementCap(universe)!==40)fail("UNIVERSE_RANGE","宇宙正式強化範圍不是 +20～+40");
  if(window.formalEnhancementLevelValid(19,universe)!==false||window.formalEnhancementLevelValid(20,universe)!==true||window.formalEnhancementLevelValid(40,universe)!==true||window.formalEnhancementLevelValid(41,universe)!==false)fail("UNIVERSE_RANGE_VALIDITY","宇宙正式強化邊界判定異常");
  const invalid={secondWorld:{entered:true},enhancement:{levels:{weapon:19,helmet:20,armor:21,shoes:40,accessory:20}}};
  const issues=window.enhancementFormalStateIssues(invalid);
  if(!issues.some(row=>row?.code==="LEVEL_BELOW_FORMAL_MIN"&&row?.type==="weapon"))fail("UNIVERSE_LOW_LEVEL_DETECT","宇宙低於 +20 的異常狀態未被偵測");
  const c20=window.enhancementUpgradeCost(20,galaxy),c21=window.enhancementUpgradeCost(21,universe),c30=window.enhancementUpgradeCost(30,universe),c40=window.enhancementUpgradeCost(40,universe);
  if(c20?.basic!==1000||c20?.advanced!==100)fail("COST20","+20 成本異常");
  if(!c21?.available||c21.darkMatter!==30000||c21.darkEnergy!==300)fail("COST21","+21 成本異常");
  if(!c30?.available||c30.darkMatter!==138000||c30.darkEnergy!==390)fail("COST30","+30 成本異常");
  if(!c40?.available||c40.darkMatter!==258000||c40.darkEnergy!==490)fail("COST40","+40 成本異常");
  if(window.enhancementUpgradeCost(21,galaxy)?.available!==false||window.enhancementUpgradeCost(20,universe)?.available!==false)fail("WORLD_COST_GATE","銀河 +21／宇宙 +20 成本 gate 異常");
  const firstTotal=Array.from({length:20},(_,i)=>window.enhancementUpgradeCost(i+1,galaxy)).reduce((a,row)=>({basic:a.basic+row.basic,advanced:a.advanced+row.advanced}),{basic:0,advanced:0});
  if(firstTotal.basic!==10500||firstTotal.advanced!==1050)fail("COST_TOTAL_FIRST","單欄 +0→+20 累積成本異常");
  const secondTotal=Array.from({length:20},(_,i)=>window.enhancementUpgradeCost(21+i,universe)).reduce((a,row)=>({darkMatter:a.darkMatter+row.darkMatter,darkEnergy:a.darkEnergy+row.darkEnergy}),{darkMatter:0,darkEnergy:0});
  if(secondTotal.darkMatter!==2880000||secondTotal.darkEnergy!==7900)fail("COST_TOTAL_SECOND","單欄 +20→+40 累積成本異常");
  if(window.enhancementBonusPercent(20)!==50||window.enhancementBonusPercent(30)!==75||window.enhancementBonusPercent(40)!==100)fail("BONUS_LEVELS","+20/+30/+40 主能力倍率異常");
 }
 if(typeof state!=="undefined"&&state&&typeof window.enhancementFormalStateIssues==="function"){
  const currentIssues=window.enhancementFormalStateIssues(state);
  if(currentIssues.length)fail("FORMAL_STATE_RANGE","目前正式角色強化資料不符合所在紀元範圍");
 }
 if(typeof enhancementStoneEligible!=="function"||enhancementStoneEligible(115,105)!==false||enhancementStoneEligible(115,106)!==true)fail("LEVEL_GAP","10 級差邊界異常");
 const saleLegend=typeof enhancementStoneSaleReward==="function"?enhancementStoneSaleReward({q:4}):null,saleMythic=typeof enhancementStoneSaleReward==="function"?enhancementStoneSaleReward({q:5}):null;
 if(saleLegend?.basic!==5||saleMythic?.advanced!==1)fail("SALE_REWARD","高品質出售石頭異常");
 if(typeof enhancementStoneSaleRewards!=="function"||typeof grantEnhancementStoneSaleRewards!=="function"||typeof grantMainlineEnhancementStoneReward!=="function")fail("REWARD_GRANT_API","正式強化石發放 API 未完整載入");
 else{const saleBatch=enhancementStoneSaleRewards([{q:4},{q:4},{q:5},{q:3}]);if(saleBatch.basic!==10||saleBatch.advanced!==1)fail("SALE_BATCH_REWARD","批次出售強化石合併異常");}
 if(typeof expectedMainlineEnhancementStoneReward!=="function")fail("EXPECTED_REWARD_API","主線理論強化石產量 API 未載入");
 else{
  const normalExpected=expectedMainlineEnhancementStoneReward({kind:"normal",level:100},100);
  const eliteExpected=expectedMainlineEnhancementStoneReward({kind:"elite",level:100},100);
  const bossExpected=expectedMainlineEnhancementStoneReward({kind:"boss",level:100},100);
  const blockedExpected=expectedMainlineEnhancementStoneReward({kind:"elite",level:100},110);
  if(normalExpected.basic!==1||normalExpected.advanced!==0)fail("EXPECTED_NORMAL","普通怪理論強化石產量異常");
  if(Math.abs(eliteExpected.basic-1.3)>1e-9||eliteExpected.advanced!==0)fail("EXPECTED_ELITE","菁英怪理論強化石產量異常");
  if(bossExpected.basic!==0||bossExpected.advanced!==1)fail("EXPECTED_BOSS","Boss 理論強化石產量異常");
  if(blockedExpected.basic!==0||blockedExpected.advanced!==0)fail("EXPECTED_LEVEL_GAP","理論強化石產量未遵守 10 級差規則");
 }
 if(Number(window.MAINLINE_ENHANCEMENT_PIPELINE_VERSION)!==2)fail("MAINLINE_OWNER","主線強化石 owner 異常");
 if(Number(window.EQUIPMENT_ENHANCEMENT_PIPELINE_VERSION)!==4)fail("EQUIPMENT_OWNER","出售／換裝強化石 owner 異常");
 if(Number(window.OFFLINE_ENHANCEMENT_PIPELINE_VERSION)!==3||typeof offlineEnhancementStoneReward!=="function")fail("OFFLINE_OWNER","離線強化石 owner 異常");
 else{
  const normalOffline=offlineEnhancementStoneReward({kind:"normal",level:100},20,100);
  const eliteOffline=offlineEnhancementStoneReward({kind:"elite",level:100},100,100);
  const blockedOffline=offlineEnhancementStoneReward({kind:"elite",level:100},100,110);
  const bossOffline=offlineEnhancementStoneReward({kind:"boss",level:100},100,100);
  if(normalOffline.basic!==1||normalOffline.advanced!==0)fail("OFFLINE_NORMAL","普通怪離線強化石結算異常");
  if(eliteOffline.basic!==6||eliteOffline.advanced!==0)fail("OFFLINE_ELITE","菁英怪離線強化石結算異常");
  if(blockedOffline.basic!==0||blockedOffline.advanced!==0)fail("OFFLINE_LEVEL_GAP","離線強化石未遵守 10 級差規則");
  if(bossOffline.advanced!==0)fail("OFFLINE_ADVANCED","離線不得取得進階強化石");
 }
 if(typeof rawEquippedStats!=="function"||typeof equippedStatsWithEnhancementLevels!=="function")fail("COMBAT_OWNER","正式強化能力 API 未載入");
 else{
  try{
   const raw=rawEquippedStats();
   const zero=equippedStatsWithEnhancementLevels(Object.fromEntries((window.ENHANCEMENT_SLOTS||[]).map(type=>[type,0])));
   ["hp","atk","def","crit","dodge"].forEach(stat=>{if(Math.abs((Number(raw?.[stat])||0)-(Number(zero?.[stat])||0))>1e-9)fail("COMBAT_ZERO_LEVEL",`+0 強化不應改變 ${stat}`);});
   const maxed20=equippedStatsWithEnhancementLevels(Object.fromEntries((window.ENHANCEMENT_SLOTS||[]).map(type=>[type,20])));
   const maxed40=equippedStatsWithEnhancementLevels(Object.fromEntries((window.ENHANCEMENT_SLOTS||[]).map(type=>[type,40])));
   ["hp","atk","def","crit","dodge"].forEach(stat=>{
    if((Number(maxed20?.[stat])||0)+1e-9<(Number(raw?.[stat])||0))fail("COMBAT_LEVEL20",`+20 強化不應降低 ${stat}`);
    if((Number(maxed40?.[stat])||0)+1e-9<(Number(maxed20?.[stat])||0))fail("COMBAT_LEVEL40",`+40 強化不應低於 +20 的 ${stat}`);
   });
  }catch(error){fail("COMBAT_PROBE",`正式強化能力計算測試失敗：${String(error)}`);}
 }
 if(Number(window.ENHANCEMENT_UI_VERSION)!==6||typeof enhancementPage!=="function"||typeof openEnhancementConfirm!=="function"||typeof window.performEnhancementUpgrade!=="function")fail("UI_OWNER","強化正式 UI 未完整載入");
 if(document.getElementById("enhancement-ui-styles"))fail("LEGACY_UI_STYLE","強化 UI 不應再由 JS 注入樣式");
 if(document.getElementById("enhancementGmStyles"))fail("LEGACY_GM_STYLE","GM 強化不應再由 JS 注入樣式");
 if(typeof homePage==="function"&&!homePage().includes("go('enhancement')"))fail("HOME_ROUTE","首頁未正式提供強化入口");
 if(Number(window.GM_ENHANCEMENT_TEST_PIPELINE_VERSION)!==6||Number(window.GM_ENHANCEMENT_TEST_RANGE_VERSION)!==1||Number(window.GM_ENHANCEMENT_HUB_VERSION)!==5||Number(window.GM_ENHANCEMENT_FORMAL_RANGE_VERSION)!==1)fail("GM_OWNER","GM 強化正式／沙盒範圍整合未完成");
 if(Number(window.ENHANCEMENT_EXPLICIT_LEVEL_CAP_VERSION)!==1)fail("EXPLICIT_LEVEL_CAP","GM／戰力測試指定強化等級尚未正式支援 +40");
 if(typeof gmTestEnhancedEquippedStats!=="function"||typeof gmUseCurrentEnhancementTestStatus!=="function"||typeof gmEnhancementManagementHtml!=="function"||typeof gmEnhancementTestHtml!=="function")fail("GM_API","GM 強化 API 未完整載入");
 if(Number(window.GAME_GUIDE_VERSION)<9)fail("GUIDE_VERSION","遊戲指南尚未更新強化說明");
 else{
  const gear=(window.GAME_GUIDE_CATEGORIES||[]).find(x=>x?.id==="gear");
  const titles=(gear?.items||[]).map(x=>x?.[0]);
  if(!titles.includes("裝備欄位強化")||!titles.includes("強化石"))fail("GUIDE_CONTENT","強化指南項目缺失");
  if(titles.includes("離線強化石"))fail("GUIDE_LEGACY_OFFLINE","離線強化石應併入強化石說明");
 }
 if(typeof normalizeEnhancementStoneReward!=="function"||typeof mergeEnhancementStoneRewards!=="function"||typeof enhancementStoneRewardText!=="function")fail("REWARD_HELPERS","強化石共用 API 未完整載入");
 else{
  const normalized=normalizeEnhancementStoneReward({basic:5.9,advanced:-3});
  if(normalized.basic!==5||normalized.advanced!==0)fail("REWARD_NORMALIZE","強化石正規化異常");
  const merged=mergeEnhancementStoneRewards({basic:1,advanced:0},{basic:5,advanced:1});
  if(merged.basic!==6||merged.advanced!==1)fail("REWARD_MERGE","強化石合併異常");
  const text=enhancementStoneRewardText(merged);
  if(!text.includes("基礎強化石 +6")||!text.includes("進階強化石 +1"))fail("REWARD_TEXT","強化石文字格式異常");
 }
 if(typeof blankBattleEnhancementRewards!=="function"||typeof addBattleEnhancementReward!=="function"||typeof enhancementStoneSettlementSummaryHtml!=="function")fail("BATTLE_REWARD_SUMMARY","戰鬥強化石摘要 API 未載入");
 else{
  const ctx={enhancementRewards:blankBattleEnhancementRewards()};
  addBattleEnhancementReward(ctx,"battle",{basic:1,advanced:1});
  addBattleEnhancementReward(ctx,"autoSale",{basic:5,advanced:0});
  const html=enhancementStoneSettlementSummaryHtml(ctx);
  if(!html.includes("+6")||!html.includes("+1"))fail("SETTLEMENT_REWARD_CONTENT","戰鬥強化石摘要內容異常");
  if(html.includes("打怪掉落")||html.includes("AUTO 出售"))fail("SETTLEMENT_REWARD_DUPLICATE_SOURCE","戰鬥強化石摘要仍有重複來源文字");
 }
 window.ENHANCEMENT_FINAL_INTEGRITY_VERSION=2;
 window.ENHANCEMENT_FINAL_INTEGRITY={version:2,passed:errors.length===0,errors,checkedAt:new Date().toISOString()};
 if(errors.length)console.error("[強化整合完整性檢查失敗]",errors);
})();
