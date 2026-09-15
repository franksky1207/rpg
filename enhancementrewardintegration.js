(function(){
 function mergeRewards(...rewards){return typeof mergeEnhancementStoneRewards==="function"?mergeEnhancementStoneRewards(...rewards):rewards.reduce((sum,reward)=>({basic:sum.basic+Math.max(0,Math.floor(Number(reward?.basic)||0)),advanced:sum.advanced+Math.max(0,Math.floor(Number(reward?.advanced)||0))}),{basic:0,advanced:0});}
 function hasReward(reward){return typeof hasEnhancementStoneReward==="function"?hasEnhancementStoneReward(reward):Math.max(0,Math.floor(Number(reward?.basic)||0))>0||Math.max(0,Math.floor(Number(reward?.advanced)||0))>0;}

 const baseFightOnce=fightOnce;
 fightOnce=function(...args){
  const playerLevelBefore=Math.max(1,Math.floor(Number(state.level)||1));
  const result=baseFightOnce(...args);
  if(result?.ok===true&&result?.win===true&&result?.e){
   const battleReward=mainlineEnhancementStoneReward(result.e,playerLevelBefore);
   if(hasReward(battleReward)){
    addEnhancementStones(battleReward.basic,battleReward.advanced);
    result.enhancementStones=battleReward;
   }
   const autoSaleReward=(result.items||[]).reduce((sum,row)=>row?.sold&&row.item?mergeRewards(sum,enhancementStoneSaleReward(row.item)):sum,{basic:0,advanced:0});
   if(hasReward(autoSaleReward))result.saleEnhancementStones=autoSaleReward;
  }
  return result;
 };
 window.fightOnce=fightOnce;

 // equipmentlock.js 正式負責所有出售發獎；此處只讓單件手動出售使用共用強化石顯示格式。
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
