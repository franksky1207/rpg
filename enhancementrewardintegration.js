(function(){
 // 主線勝利：只在正式主線 fightOnce 成功結算後給石，特殊怪與副本不會經過此入口。
 const baseFightOnce=fightOnce;
 fightOnce=function(...args){
  const playerLevelBefore=Math.max(1,Math.floor(Number(state.level)||1));
  const result=baseFightOnce(...args);
  if(result?.ok===true&&result?.win===true&&result?.e){
   const reward=mainlineEnhancementStoneReward(result.e,playerLevelBefore);
   if(reward.basic||reward.advanced){addEnhancementStones(reward.basic,reward.advanced);result.enhancementStones=reward;const text=enhancementStoneRewardText(reward);if(text)result.logs?.push(`獲得 ${text}。`);}
  }
  return result;
 };
 window.fightOnce=fightOnce;

 // AUTO-sell：包裝統一的出售價函式，僅在明確標記的自動出售呼叫中由下方入口處理，避免預覽重複給石。
 function saleStone(item){return typeof grantEnhancementStoneSaleReward==="function"?grantEnhancementStoneSaleReward(item):{basic:0,advanced:0};}

 if(typeof window.handleUnequippedItem==="function"){
  const base=window.handleUnequippedItem;
  window.handleUnequippedItem=function(item,options={}){const before=state.inventory?.length||0,r=base(item,options);if(r?.sold>0&&r?.kept===false)r.enhancementStones=saleStone(item);return r;};
  handleUnequippedItem=window.handleUnequippedItem;
 }
 if(typeof window.addItem==="function"){
  const base=window.addItem;
  window.addItem=function(item,options={}){const r=base(item,options);if(item&&r?.sold>0&&r?.kept===false)r.enhancementStones=saleStone(item);return r;};
  addItem=window.addItem;
 }
 if(typeof window.equipmentSellSelected==="function"){
  const base=window.equipmentSellSelected;
  window.equipmentSellSelected=function(options={}){const r=base(options);if(r?.ok&&r.item)r.enhancementStones=saleStone(r.item);return r;};
 }
 if(typeof window.equipmentSellLowerAll==="function"){
  const base=window.equipmentSellLowerAll;
  window.equipmentSellLowerAll=function(preview=null){const data=preview?.targets?preview:(typeof equipmentLowerSalePreview==="function"?equipmentLowerSalePreview():null);const targets=Array.isArray(data?.targets)?data.targets.slice():[];const r=base(preview);let basic=0,advanced=0;targets.forEach(item=>{const x=saleStone(item);basic+=x.basic;advanced+=x.advanced;});r.enhancementStones={basic,advanced};return r;};
 }
})();
