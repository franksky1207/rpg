(function(){
 // 強化頁背景由 backgrounds.css 統一管理，與其他正式背景共同進入 backgroundpreload.js 預載流程。

 // 強化確認補上目前裝備的實際主能力變化；原始確認流程仍負責最終原子檢查與扣款。
 const baseOpen=window.openEnhancementConfirm;
 window.openEnhancementConfirm=function(type){
  baseOpen(type);
  const detail=document.getElementById("enhancementConfirmDetail"),item=state.equipment?.[type];
  if(!detail||!item)return;
  const lv=enhancementLevel(state,type),stat=item.mainStat?.stat||mainStatForType(type),raw=Math.max(0,Number(item.mainStat?.value)||0),a=enhancedMainStatValue(raw,lv),b=enhancedMainStatValue(raw,Math.min(ENHANCEMENT_MAX_LEVEL,lv+1)),rate=stat==="crit"||stat==="dodge",format=v=>`${STAT_LABELS[stat]||stat} +${rate?round1(v):Math.ceil(v)}${rate?"%":""}`;
  const lines=detail.querySelector(".enhance-confirm-lines");
  if(lines){const row=document.createElement("div");row.innerHTML=`<span>實際主能力</span><b>${format(a)} → ${format(b)}</b>`;lines.insertBefore(row,lines.children[2]||null);}
 };

 // 強化專屬回歸檢查，保留在獨立報告避免干擾既有 Runtime Integrity 正式報告。
 const errors=[];
 const fail=(code,message)=>errors.push({code,message});
 if(window.ENHANCEMENT_INTEGRITY_REPORT?.passed!==true)fail("CORE_INTEGRITY","強化核心／存檔正式化檢查未通過");
 if(Number(window.ENHANCEMENT_MAX_LEVEL)!==20)fail("MAX_LEVEL","強化上限不是 20");
 if(Number(window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL)!==2.5)fail("BONUS","每級強化不是 2.5%");
 const c20=enhancementUpgradeCost(20);if(c20.basic!==2000||c20.advanced!==100)fail("COST20","+20 成本異常");
 const sum=Array.from({length:20},(_,i)=>enhancementUpgradeCost(i+1)).reduce((a,c)=>({basic:a.basic+c.basic,advanced:a.advanced+c.advanced}),{basic:0,advanced:0});if(sum.basic!==21000||sum.advanced!==1050)fail("COST_TOTAL","單欄累積成本異常");
 if(enhancementStoneEligible(115,105)!==false||enhancementStoneEligible(115,106)!==true)fail("LEVEL_GAP","10 級差邊界異常");
 const saleLegend=enhancementStoneSaleReward({q:4}),saleMythic=enhancementStoneSaleReward({q:5});if(saleLegend.basic!==5||saleMythic.advanced!==1)fail("SALE_REWARD","高品質出售石頭異常");
 if(Math.abs(enhancedMainStatValue(100,20)-150)>1e-9)fail("MAIN_STAT","+20 主能力倍率異常");
 if(typeof window.rawEquippedStats!=="function"||typeof window.equippedStatsWithEnhancementLevels!=="function")fail("COMBAT_OWNER","engine.js 正式強化能力 API 未載入");
 else{
  try{
   const raw=window.rawEquippedStats();
   const zero=window.equippedStatsWithEnhancementLevels(Object.fromEntries((window.ENHANCEMENT_SLOTS||[]).map(type=>[type,0])));
   ["hp","atk","def","crit","dodge"].forEach(stat=>{if(Math.abs((Number(raw?.[stat])||0)-(Number(zero?.[stat])||0))>1e-9)fail("COMBAT_ZERO_LEVEL",`+0 強化不應改變 ${stat}`);});
   const maxed=window.equippedStatsWithEnhancementLevels(Object.fromEntries((window.ENHANCEMENT_SLOTS||[]).map(type=>[type,20])));
   ["hp","atk","def","crit","dodge"].forEach(stat=>{if((Number(maxed?.[stat])||0)+1e-9<(Number(raw?.[stat])||0))fail("COMBAT_MAX_LEVEL",`+20 強化不應降低 ${stat}`);});
  }catch(error){fail("COMBAT_PROBE",`正式強化能力計算測試失敗：${String(error)}`);}
 }
 if(window.ENHANCEMENT_UI_SUCCESS_ALERT_DISABLED!==true)fail("SUCCESS_ALERT","強化成功後不應再跳出第二個成功提示視窗");
 if(window.ENHANCEMENT_UI_UNIFORM_GRID!==true)fail("UNIFORM_GRID","桌機版五個強化欄位應維持相同卡片寬度");
 const uiStyle=document.getElementById("enhancement-ui-styles")?.textContent||"";
 if(/\.enhance-slot-card:last-child\s*\{[^}]*grid-column\s*:\s*1\s*\/\s*-1/i.test(uiStyle))fail("LAST_CARD_SPAN","第五個強化欄位不應跨滿兩欄");

 if(typeof window.normalizeEnhancementStoneReward!=="function"||typeof window.mergeEnhancementStoneRewards!=="function"||typeof window.enhancementStoneRewardText!=="function")fail("REWARD_HELPERS","強化石共用正規化／合併／顯示 API 未完整載入");
 else{
  const normalized=window.normalizeEnhancementStoneReward({basic:5.9,advanced:-3});
  if(normalized.basic!==5||normalized.advanced!==0)fail("REWARD_NORMALIZE","強化石獎勵正規化異常");
  const merged=window.mergeEnhancementStoneRewards({basic:1,advanced:0},{basic:5,advanced:1});
  if(merged.basic!==6||merged.advanced!==1)fail("REWARD_MERGE","強化石獎勵合併異常");
  const text=window.enhancementStoneRewardText(merged);
  if(!text.includes("基礎強化石 +6")||!text.includes("進階強化石 +1"))fail("REWARD_TEXT","強化石共用顯示文字異常");
 }
 if(typeof window.blankBattleEnhancementRewards!=="function"||typeof window.addBattleEnhancementReward!=="function")fail("BATTLE_REWARD_SUMMARY","戰鬥強化石摘要 API 未載入");
 else{
  const ctx={enhancementRewards:window.blankBattleEnhancementRewards()};
  window.addBattleEnhancementReward(ctx,"battle",{basic:1,advanced:1});
  window.addBattleEnhancementReward(ctx,"autoSale",{basic:5,advanced:0});
  if(ctx.enhancementRewards.battle.basic!==1||ctx.enhancementRewards.battle.advanced!==1||ctx.enhancementRewards.autoSale.basic!==5)fail("BATTLE_REWARD_ACCUMULATE","戰鬥強化石來源累積異常");
  if(typeof window.enhancementStoneSettlementSummaryHtml!=="function")fail("SETTLEMENT_REWARD_UI","戰鬥強化石結算顯示 API 未載入");
  else{
   const html=window.enhancementStoneSettlementSummaryHtml(ctx);
   if(!html.includes("enhancement-stone-summary-row")||!html.includes("基礎強化石")||!html.includes("+6")||!html.includes("進階強化石")||!html.includes("+1"))fail("SETTLEMENT_REWARD_CONTENT","戰鬥強化石全寬摘要顯示異常");
   if(html.includes("打怪掉落")||html.includes("AUTO 出售"))fail("SETTLEMENT_REWARD_DUPLICATE_SOURCE","戰鬥強化石摘要不應再重複顯示來源說明");
   const basicOnly={enhancementRewards:window.blankBattleEnhancementRewards()};
   window.addBattleEnhancementReward(basicOnly,"battle",{basic:3,advanced:0});
   const basicHtml=window.enhancementStoneSettlementSummaryHtml(basicOnly);
   if(!basicHtml.includes("基礎強化石")||!basicHtml.includes("+3")||basicHtml.includes("進階強化石"))fail("SETTLEMENT_REWARD_SINGLE_TYPE","單一基礎強化石獎勵不應顯示空的進階欄位");
  }
 }
 window.ENHANCEMENT_FINAL_INTEGRITY={passed:errors.length===0,errors,checkedAt:new Date().toISOString()};
})();
