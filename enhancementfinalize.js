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

 // 在「角色與裝備」說明頁直接補入強化規則，不建立第二套導覽狀態。
 const baseGuide=window.gameGuidePage;
 window.gameGuidePage=function(){
  let html=baseGuide();
  if(!html.includes("<h3>角色與裝備</h3>"))return html;
  const extra=`<div class="guide-item"><h4>裝備欄位強化</h4><div>武器、頭盔、鎧甲、鞋子、飾品五個欄位都可永久強化至 +20；每級只提高目前裝備原始主能力 2.5%，+20 共提高 50%。強化屬於欄位，更換或戰敗遺失裝備都不會失去強化等級，裝備評分也不計入強化值。</div></div><div class="guide-item"><h4>強化石</h4><div>普通怪固定掉落基礎強化石，菁英怪掉落 1～2 顆基礎強化石，Boss 固定掉落進階強化石；玩家高於怪物 10 級（含）以上時不會掉落強化石。傳說裝備出售時另得 5 顆基礎強化石，神話裝備手動出售時另得 1 顆進階強化石。特殊怪與副本不掉落強化石。</div></div><div class="guide-item"><h4>離線強化石</h4><div>符合等級差條件時，離線刷普通怪或菁英怪可取得理論基礎強化石的 5%，整段離線收益合計後再取整數；離線不會取得進階強化石。</div></div>`;
  return html.replace('</div></section></div></div>',`${extra}</div></section></div></div>`);
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
