(function(){
 const LEVEL_GAP_LIMIT=10;
 function ensure(){if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(state);}
 function normalizeReward(reward){return {basic:Math.max(0,Math.floor(Number(reward?.basic)||0)),advanced:Math.max(0,Math.floor(Number(reward?.advanced)||0))};}
 function addRewards(...rewards){return rewards.reduce((sum,reward)=>{const r=normalizeReward(reward);sum.basic+=r.basic;sum.advanced+=r.advanced;return sum;},{basic:0,advanced:0});}
 function hasReward(reward){const r=normalizeReward(reward);return r.basic>0||r.advanced>0;}
 function addStones(basic=0,advanced=0){ensure();const reward=normalizeReward({basic,advanced});state.enhancement.basicStones+=reward.basic;state.enhancement.advancedStones+=reward.advanced;return reward;}
 function eligible(playerLevel,monsterLevel){return Math.floor(Number(playerLevel)||1)-Math.floor(Number(monsterLevel)||1)<LEVEL_GAP_LIMIT;}
 function mainlineReward(enemy,playerLevel=null){
  if(!enemy||!eligible(playerLevel??state.level,enemy.level))return {basic:0,advanced:0};
  if(enemy.kind==="boss")return {basic:0,advanced:1};
  if(enemy.kind==="elite")return {basic:Math.random()<.7?1:2,advanced:0};
  if(enemy.kind==="normal")return {basic:1,advanced:0};
  return {basic:0,advanced:0};
 }
 function saleReward(item){const q=Math.floor(Number(item?.q));return q===4?{basic:5,advanced:0}:q===5?{basic:0,advanced:1}:{basic:0,advanced:0};}
 function grantSaleReward(item){const r=saleReward(item);return addStones(r.basic,r.advanced);}
 function rewardText(reward){const r=normalizeReward(reward),parts=[];if(r.basic)parts.push(`基礎強化石 +${r.basic}`);if(r.advanced)parts.push(`進階強化石 +${r.advanced}`);return parts.join("、");}
 window.ENHANCEMENT_STONE_LEVEL_GAP_LIMIT=LEVEL_GAP_LIMIT;
 window.normalizeEnhancementStoneReward=normalizeReward;
 window.mergeEnhancementStoneRewards=addRewards;
 window.hasEnhancementStoneReward=hasReward;
 window.addEnhancementStones=addStones;
 window.enhancementStoneEligible=eligible;
 window.mainlineEnhancementStoneReward=mainlineReward;
 window.enhancementStoneSaleReward=saleReward;
 window.grantEnhancementStoneSaleReward=grantSaleReward;
 window.enhancementStoneRewardText=rewardText;
})();
