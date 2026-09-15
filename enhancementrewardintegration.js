(function(){
 const baseFightOnce=fightOnce;
 fightOnce=function(...args){
  const playerLevelBefore=Math.max(1,Math.floor(Number(state.level)||1));
  const result=baseFightOnce(...args);
  if(result?.ok===true&&result?.win===true&&result?.e){
   const reward=mainlineEnhancementStoneReward(result.e,playerLevelBefore);
   if(reward.basic||reward.advanced){addEnhancementStones(reward.basic,reward.advanced);result.enhancementStones=reward;const text=enhancementStoneRewardText(reward);if(text)result.logs?.push(`獲得 ${text}。`);}
   (result.items||[]).forEach(row=>{if(!row?.sold||!row.item)return;const sr=enhancementStoneSaleReward(row.item);const text=enhancementStoneRewardText(sr);if(text)result.logs?.push(`出售裝備另獲得 ${text}。`);});
  }
  return result;
 };
 window.fightOnce=fightOnce;

 // equipmentlock.js 已正式負責所有出售發獎；此處只補單件手動出售的玩家可見訊息。
 if(typeof window.sellSelected==="function"){
  window.sellSelected=function(){
   let r=equipmentSellSelected();
   if(r.reason==="locked")return alert("這件裝備已鎖定，請先解鎖後再出售。");
   if(r.reason==="mythic"){
    if(!confirm("這是神話裝備，確定要出售嗎？"))return;
    r=equipmentSellSelected({confirmMythic:true});
   }
   if(!r.ok)return;
   const stoneText=typeof enhancementStoneRewardText==="function"?enhancementStoneRewardText(r.enhancementStones):"";
   save();render();
   alert(`已出售裝備，獲得 ${r.sold.toLocaleString()} 金幣${stoneText?`，另獲得 ${stoneText}`:""}。`);
  };
  try{sellSelected=window.sellSelected;}catch(e){}
 }
})();
