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
 if(Number(window.ENHANCEMENT_MAX_LEVEL)!==20)fail("MAX_LEVEL","強化上限不是 20");
 if(Number(window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL)!==2.5)fail("BONUS","每級強化不是 2.5%");
 const c20=enhancementUpgradeCost(20);if(c20.basic!==2000||c20.advanced!==100)fail("COST20","+20 成本異常");
 const sum=Array.from({length:20},(_,i)=>enhancementUpgradeCost(i+1)).reduce((a,c)=>({basic:a.basic+c.basic,advanced:a.advanced+c.advanced}),{basic:0,advanced:0});if(sum.basic!==21000||sum.advanced!==1050)fail("COST_TOTAL","單欄累積成本異常");
 if(enhancementStoneEligible(115,105)!==false||enhancementStoneEligible(115,106)!==true)fail("LEVEL_GAP","10 級差邊界異常");
 const saleLegend=enhancementStoneSaleReward({q:4}),saleMythic=enhancementStoneSaleReward({q:5});if(saleLegend.basic!==5||saleMythic.advanced!==1)fail("SALE_REWARD","高品質出售石頭異常");
 if(Math.abs(enhancedMainStatValue(100,20)-150)>1e-9)fail("MAIN_STAT","+20 主能力倍率異常");
 window.ENHANCEMENT_FINAL_INTEGRITY={passed:errors.length===0,errors,checkedAt:new Date().toISOString()};
})();
