(function(){
 // 主線「單場／連續」模式、準備頁與戰鬥頁已正式收回 ui.js。
 // 本檔暫只保留結算相容層；待 settlementui.js 原生辨識 ctx.continuous 後即可刪除。
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
