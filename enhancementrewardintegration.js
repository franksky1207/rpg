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


})();
