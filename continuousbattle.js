(function(){
 const CONTINUOUS_COUNT="continuous";
 const unlocks=typeof BATTLE_COUNT_UNLOCKS!=="undefined"?BATTLE_COUNT_UNLOCKS:null;
 if(Array.isArray(unlocks)){
  unlocks.splice(0,unlocks.length,{level:1,count:1},{level:1,count:CONTINUOUS_COUNT});
 }
 window.CONTINUOUS_BATTLE_COUNT=CONTINUOUS_COUNT;
 window.continuous=CONTINUOUS_COUNT;

 function continuousActive(){
  return window.activeMainBattleContext?.continuous===true||combatTotal===0||combatTotal===CONTINUOUS_COUNT;
 }

 if(typeof adventurePreparePage==="function"){
  const baseAdventurePreparePage=adventurePreparePage;
  adventurePreparePage=function(){
   let html=baseAdventurePreparePage();
   html=html.replace(/>continuous 場<\/button>/g,">連續戰鬥</button>");
   html=html.replace("<h3 class=\"battle-count-title\">戰鬥次數</h3>","<h3 class=\"battle-count-title\">戰鬥模式</h3>");
   return html;
  };
 }

 if(typeof adventureCombatPage==="function"){
  const baseAdventureCombatPage=adventureCombatPage;
  adventureCombatPage=function(){
   let html=baseAdventureCombatPage();
   if(!continuousActive())return html;
   const round=Math.max(1,Number(combatRound)||1),requested=window.activeMainBattleContext?.exitRequested===true;
   html=html.replace(/<div class="combat-head">.*?<\/div>/,`<div class="combat-head">連續戰鬥・第 ${round} 場</div>`);
   const stop=`<div class="continuous-stop-wrap"><button id="continuousBattleStopBtn" class="btn danger" onclick="requestContinuousBattleStop()" ${requested?"disabled":""}>${requested?"本場結束後停止":"停止連續戰鬥"}</button></div>`;
   const end=html.lastIndexOf("</section>");
   return end>=0?html.slice(0,end)+stop+html.slice(end):html+stop;
  };
 }

 const baseMainSettlement=typeof window.mainBattleSettlementHtml==="function"?window.mainBattleSettlementHtml:null;
 if(baseMainSettlement){
  window.mainBattleSettlementHtml=function(ctx,options={}){
   const html=baseMainSettlement(ctx,options);
   if(ctx?.continuous!==true)return html;
   const wins=Math.max(0,Math.floor(Number(ctx?.wins)||0));
   const note=options?.interrupted===true?`已完成 ${wins} 場，連續戰鬥已結束；已取得的獎勵與副本進度均保留。`:`完成 ${wins} 場`;
   return html.replace(/<div class="notice"><b>.*?<\/b><\/div>/,`<div class="notice"><b>${note}</b></div>`);
  };
 }

 if(typeof window.showBattleResult==="function"){
  const baseShowBattleResult=window.showBattleResult;
  window.showBattleResult=function(ctx,defeat=null){
   const result=baseShowBattleResult(ctx,defeat);
   if(ctx?.continuous===true){
    const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail");
    if(title&&!defeat)title.textContent="連續戰鬥結算";
    const wins=Math.max(0,Math.floor(Number(ctx?.wins)||0));
    const notice=detail?.querySelector(".settlement-section .notice b");
    if(notice)notice.textContent=defeat?`已完成 ${wins} 場，連續戰鬥已結束；已取得的獎勵與副本進度均保留。`:`完成 ${wins} 場`;
    else if(!defeat){const row=detail?.querySelector(".item b");if(row)row.textContent=`完成 ${wins} 場`;}
   }
   return result;
  };
 }
})();
