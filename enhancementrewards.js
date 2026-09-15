(function(){
 const LEVEL_GAP_LIMIT=10;
 const ELITE_BASIC_STONE_CHANCES=Object.freeze([{amount:1,probability:.7},{amount:2,probability:.3}]);
 function ensure(){if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);}
 function normalizeReward(reward){return {basic:Math.max(0,Math.floor(Number(reward?.basic)||0)),advanced:Math.max(0,Math.floor(Number(reward?.advanced)||0))};}
 function addRewards(...rewards){return rewards.reduce((sum,reward)=>{const r=normalizeReward(reward);sum.basic+=r.basic;sum.advanced+=r.advanced;return sum;},{basic:0,advanced:0});}
 function hasReward(reward){const r=normalizeReward(reward);return r.basic>0||r.advanced>0;}
 function addStones(basic=0,advanced=0){ensure();const reward=normalizeReward({basic,advanced});state.enhancement.basicStones+=reward.basic;state.enhancement.advancedStones+=reward.advanced;return reward;}
 function eligible(playerLevel,monsterLevel){return Math.floor(Number(playerLevel)||1)-Math.floor(Number(monsterLevel)||1)<LEVEL_GAP_LIMIT;}
 function eliteBasicExpected(){return ELITE_BASIC_STONE_CHANCES.reduce((sum,row)=>sum+row.amount*row.probability,0);}
 function expectedMainlineReward(enemy,playerLevel=null){
  if(!enemy||!eligible(playerLevel??state.level,enemy.level))return {basic:0,advanced:0};
  if(enemy.kind==="boss")return {basic:0,advanced:1};
  if(enemy.kind==="elite")return {basic:eliteBasicExpected(),advanced:0};
  if(enemy.kind==="normal")return {basic:1,advanced:0};
  return {basic:0,advanced:0};
 }
 function mainlineReward(enemy,playerLevel=null){
  if(!enemy||!eligible(playerLevel??state.level,enemy.level))return {basic:0,advanced:0};
  if(enemy.kind==="boss")return {basic:0,advanced:1};
  if(enemy.kind==="elite"){
   const roll=Math.random();let cumulative=0;
   for(const row of ELITE_BASIC_STONE_CHANCES){cumulative+=row.probability;if(roll<cumulative)return {basic:row.amount,advanced:0};}
   return {basic:ELITE_BASIC_STONE_CHANCES[ELITE_BASIC_STONE_CHANCES.length-1]?.amount||1,advanced:0};
  }
  if(enemy.kind==="normal")return {basic:1,advanced:0};
  return {basic:0,advanced:0};
 }
 function grantMainlineReward(enemy,playerLevel=null){const r=mainlineReward(enemy,playerLevel);return addStones(r.basic,r.advanced);}
 function saleReward(item){const q=Math.floor(Number(item?.q));return q===4?{basic:5,advanced:0}:q===5?{basic:0,advanced:1}:{basic:0,advanced:0};}
 function saleRewards(items){return addRewards(...(Array.isArray(items)?items:[]).map(saleReward));}
 function grantSaleRewards(items){const r=saleRewards(items);return addStones(r.basic,r.advanced);}
 function grantSaleReward(item){return grantSaleRewards(item?[item]:[]);}
 function rewardText(reward){const r=normalizeReward(reward),parts=[];if(r.basic)parts.push(`基礎強化石 +${r.basic}`);if(r.advanced)parts.push(`進階強化石 +${r.advanced}`);return parts.join("、");}
 window.ENHANCEMENT_STONE_LEVEL_GAP_LIMIT=LEVEL_GAP_LIMIT;
 window.ENHANCEMENT_ELITE_BASIC_STONE_CHANCES=ELITE_BASIC_STONE_CHANCES;
 window.normalizeEnhancementStoneReward=normalizeReward;
 window.mergeEnhancementStoneRewards=addRewards;
 window.hasEnhancementStoneReward=hasReward;
 window.addEnhancementStones=addStones;
 window.enhancementStoneEligible=eligible;
 window.expectedMainlineEnhancementStoneReward=expectedMainlineReward;
 window.mainlineEnhancementStoneReward=mainlineReward;
 window.grantMainlineEnhancementStoneReward=grantMainlineReward;
 window.enhancementStoneSaleReward=saleReward;
 window.enhancementStoneSaleRewards=saleRewards;
 window.grantEnhancementStoneSaleReward=grantSaleReward;
 window.grantEnhancementStoneSaleRewards=grantSaleRewards;
 window.enhancementStoneRewardText=rewardText;
})();
