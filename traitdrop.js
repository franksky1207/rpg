// 主線掉裝正式流程：掉落率、VIP 裝備特權、traits 品質升階。
// VIP8／14／18 委派 viplootcore.js；各品質升階來源彼此獨立判定，神話封頂。
window.dropItem=function(enemy,mapIdx){
 let chance=enemy.kind==="boss"?1:enemy.kind==="elite"?.6:.25;
 if((state.vipLevel||0)>=2)chance=Math.min(1,chance+.05);
 if(Math.random()>chance)return null;

 let offset=enemy.kind==="boss"?[-1,0,0,1,2]:enemy.kind==="elite"?[-1,0,0,1]:[-2,-1,0,0,1];
 let lv=Math.max(1,Math.min(MAX_LEVEL,enemy.level+offset[Math.floor(Math.random()*offset.length)]));
 const baseQ=qualityRoll(enemy.kind);
 let q=baseQ;

 const traitCount=Array.isArray(enemy.traits)?Math.min(2,enemy.traits.length):0;
 const traitChance=traitCount===2?.30:traitCount===1?.15:0;
 const traitRoll=traitChance>0&&Math.random()<traitChance;
 let traitPromotion=0;
 if(traitRoll&&q<5){q++;traitPromotion=1;}

 if(typeof window.applyVipLootQualityPromotions!=="function")throw new Error("VIP Loot Core 未載入。");
 const vipQuality=window.applyVipLootQualityPromotions(q,{boss:enemy.kind==="boss"});
 q=vipQuality.quality;

 if(typeof window.vipLootForcedType!=="function")throw new Error("VIP Loot Core 未載入。");
 const forcedType=window.vipLootForcedType();
 const vip8WeakSlot=!!forcedType;

 const item=makeItem(lv,mapIdx,enemy.kind,q,forcedType);
 const meta={
  baseQuality:baseQ,
  finalQuality:q,
  actualPromotions:q-baseQ,
  traitPromotion,
  vip14Promotion:vipQuality.vip14Promotion,
  vip18Promotion:vipQuality.vip18Promotion,
  traitRoll,
  vip14Roll:vipQuality.vip14Roll,
  vip18Roll:vipQuality.vip18Roll,
  vip8WeakSlot
 };
 try{Object.defineProperty(item,"_vipMeta",{value:meta,writable:true,configurable:true,enumerable:false});}catch(e){item._vipMeta=meta;}
 return item;
};
