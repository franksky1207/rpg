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

 function saleStone(item){return typeof grantEnhancementStoneSaleReward==="function"?grantEnhancementStoneSaleReward(item):{basic:0,advanced:0};}
 if(typeof window.handleUnequippedItem==="function"){
  const base=window.handleUnequippedItem;
  window.handleUnequippedItem=function(item,options={}){const r=base(item,options);if(r?.sold>0&&r?.kept===false)r.enhancementStones=saleStone(item);return r;};
  try{handleUnequippedItem=window.handleUnequippedItem;}catch(e){}
 }
 if(typeof window.addItem==="function"){
  const base=window.addItem;
  window.addItem=function(item,options={}){const r=base(item,options);if(item&&r?.sold>0&&r?.kept===false)r.enhancementStones=saleStone(item);return r;};
  try{addItem=window.addItem;}catch(e){}
 }
 if(typeof window.equipmentSellSelected==="function"){
  const base=window.equipmentSellSelected;
  window.equipmentSellSelected=function(options={}){const r=base(options);if(r?.ok&&r.item)r.enhancementStones=saleStone(r.item);return r;};
  try{equipmentSellSelected=window.equipmentSellSelected;}catch(e){}
 }
 if(typeof window.equipmentSellLowerAll==="function"){
  const base=window.equipmentSellLowerAll;
  window.equipmentSellLowerAll=function(preview=null){const data=preview?.targets?preview:(typeof equipmentLowerSalePreview==="function"?equipmentLowerSalePreview():null);const targets=Array.isArray(data?.targets)?data.targets.slice():[];const r=base(preview);let basic=0,advanced=0;targets.forEach(item=>{const x=saleStone(item);basic+=x.basic;advanced+=x.advanced;});r.enhancementStones={basic,advanced};return r;};
  try{equipmentSellLowerAll=window.equipmentSellLowerAll;}catch(e){}
 }
})();
