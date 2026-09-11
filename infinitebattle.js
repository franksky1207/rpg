(function(){
 const INFINITE_COUNT="infinite";
 const unlocks=typeof BATTLE_COUNT_UNLOCKS!=="undefined"?BATTLE_COUNT_UNLOCKS:null;
 if(Array.isArray(unlocks)&&!unlocks.some(x=>x?.count===INFINITE_COUNT))unlocks.push({level:31,count:INFINITE_COUNT});
 window.INFINITE_BATTLE_COUNT=INFINITE_COUNT;
 window.infinite=INFINITE_COUNT;

 function infiniteActive(){
  return window.activeMainBattleContext?.infinite===true||combatTotal===0||combatTotal===INFINITE_COUNT;
 }

 if(typeof adventurePreparePage==="function"){
  const baseAdventurePreparePage=adventurePreparePage;
  adventurePreparePage=function(){
   let html=baseAdventurePreparePage();
   html=html.replace(/>infinite 場<\/button>/g,">∞</button>");
   html=html.replace("Lv.31 將開放 infinite 場","Lv.31 將開放無限連戰");
   html=html.replace('class="count-grid" style="--battle-count-columns:7"','class="count-grid infinite-enabled" style="--battle-count-columns:7"');
   return html;
  };
 }

 if(typeof adventureCombatPage==="function"){
  const baseAdventureCombatPage=adventureCombatPage;
  adventureCombatPage=function(){
   let html=baseAdventureCombatPage();
   if(!infiniteActive())return html;
   const round=Math.max(1,Number(combatRound)||1),requested=window.activeMainBattleContext?.exitRequested===true;
   html=html.replace(/<div class="combat-head">.*?<\/div>/,`<div class="combat-head">無限連戰・第 ${round} 場</div>`);
   const stop=`<div class="infinite-stop-wrap"><button id="infiniteBattleStopBtn" class="btn danger" onclick="requestInfiniteBattleStop()" ${requested?"disabled":""}>${requested?"本場結束後停止":"停止連戰"}</button></div>`;
   const end=html.lastIndexOf("</section>");
   return end>=0?html.slice(0,end)+stop+html.slice(end):html+stop;
  };
 }

 const baseMainSettlement=typeof window.mainBattleSettlementHtml==="function"?window.mainBattleSettlementHtml:null;
 if(baseMainSettlement){
  window.mainBattleSettlementHtml=function(ctx,options={}){
   const html=baseMainSettlement(ctx,options);
   if(ctx?.infinite!==true)return html;
   const wins=Math.max(0,Math.floor(Number(ctx?.wins)||0));
   const note=options?.interrupted===true?`已完成 ${wins} 場，無限連戰已結束；已取得的獎勵與副本進度均保留。`:`完成 ${wins} 場`;
   return html.replace(/<div class="notice"><b>.*?<\/b><\/div>/,`<div class="notice"><b>${note}</b></div>`);
  };
 }

 if(typeof window.showBattleResult==="function"){
  const baseShowBattleResult=window.showBattleResult;
  window.showBattleResult=function(ctx,defeat=null){
   const result=baseShowBattleResult(ctx,defeat);
   if(ctx?.infinite===true){
    const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail");
    if(title&&!defeat)title.textContent="無限連戰結算";
    const wins=Math.max(0,Math.floor(Number(ctx?.wins)||0));
    const notice=detail?.querySelector(".settlement-section .notice b");
    if(notice)notice.textContent=defeat?`已完成 ${wins} 場，無限連戰已結束；已取得的獎勵與副本進度均保留。`:`完成 ${wins} 場`;
    else if(!defeat){const row=detail?.querySelector(".item b");if(row)row.textContent=`完成 ${wins} 場`;}
   }
   return result;
  };
 }
})();
