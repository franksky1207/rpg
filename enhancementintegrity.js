(function(){
 const errors=[];
 const fail=(code,message)=>errors.push({code,message});
 if(window.ENHANCEMENT_INTEGRITY_REPORT?.passed!==true)fail("SAVE_INTEGRITY","強化存檔相容檢查未通過");
 if(Number(window.ENHANCEMENT_MAX_LEVEL)!==20)fail("MAX_LEVEL","目前正式強化上限不是 +20");
 if(Number(window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL)!==2.5)fail("BONUS","每級強化不是 2.5%");
 const c20=typeof enhancementUpgradeCost==="function"?enhancementUpgradeCost(20):null;
 if(c20?.basic!==1000||c20?.advanced!==100)fail("COST20","+20 成本異常");
 const sum=typeof enhancementUpgradeCost==="function"?Array.from({length:20},(_,i)=>enhancementUpgradeCost(i+1)).reduce((a,c)=>({basic:a.basic+c.basic,advanced:a.advanced+c.advanced}),{basic:0,advanced:0}):null;
 if(sum?.basic!==10500||sum?.advanced!==1050)fail("COST_TOTAL","單欄累積成本異常");
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
 if(Number(window.EQUIPMENT_ENHANCEMENT_PIPELINE_VERSION)!==2)fail("EQUIPMENT_OWNER","出售／換裝強化石 owner 異常");
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
   const maxed=equippedStatsWithEnhancementLevels(Object.fromEntries((window.ENHANCEMENT_SLOTS||[]).map(type=>[type,20])));
   ["hp","atk","def","crit","dodge"].forEach(stat=>{if((Number(maxed?.[stat])||0)+1e-9<(Number(raw?.[stat])||0))fail("COMBAT_MAX_LEVEL",`+20 強化不應降低 ${stat}`);});
  }catch(error){fail("COMBAT_PROBE",`正式強化能力計算測試失敗：${String(error)}`);}
 }
 if(Number(window.ENHANCEMENT_UI_VERSION)!==4||typeof enhancementPage!=="function"||typeof openEnhancementConfirm!=="function")fail("UI_OWNER","強化正式 UI 未完整載入");
 if(document.getElementById("enhancement-ui-styles"))fail("LEGACY_UI_STYLE","強化 UI 不應再由 JS 注入樣式");
 if(document.getElementById("enhancementGmStyles"))fail("LEGACY_GM_STYLE","GM 強化不應再由 JS 注入樣式");
 if(typeof homePage==="function"&&!homePage().includes("go('enhancement')"))fail("HOME_ROUTE","首頁未正式提供強化入口");
 if(Number(window.GM_ENHANCEMENT_TEST_PIPELINE_VERSION)!==4||Number(window.GM_ENHANCEMENT_HUB_VERSION)!==4)fail("GM_OWNER","GM 強化正式整合未完成");
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
 window.ENHANCEMENT_FINAL_INTEGRITY={passed:errors.length===0,errors,checkedAt:new Date().toISOString()};
 if(errors.length)console.error("[強化整合完整性檢查失敗]",errors);
})();
