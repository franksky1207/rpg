// 主線掉裝正式流程：掉落率、VIP8 部位指定、traits／VIP14／VIP18 品質升階。
// 各品質升階來源彼此獨立判定；神話封頂，僅記錄實際成功提升的階數。
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
 const vip14Roll=(state.vipLevel||0)>=14&&Math.random()<.05;
 const vip18Roll=enemy.kind==="boss"&&(state.vipLevel||0)>=18&&Math.random()<.10;

 let traitPromotion=0,vip14Promotion=0,vip18Promotion=0;
 if(traitRoll&&q<5){q++;traitPromotion=1;}
 if(vip14Roll&&q<5){q++;vip14Promotion=1;}
 if(vip18Roll&&q<5){q++;vip18Promotion=1;}

 let forcedType=null,vip8WeakSlot=false;
 if((state.vipLevel||0)>=8&&Math.random()<.15&&typeof weakEquipmentTypes==="function"){
  const order=weakEquipmentTypes();
  forcedType=order[0]||null;
  vip8WeakSlot=!!forcedType;
 }

 const item=makeItem(lv,mapIdx,enemy.kind,q,forcedType);
 const meta={
  baseQuality:baseQ,
  finalQuality:q,
  actualPromotions:q-baseQ,
  traitPromotion,
  vip14Promotion,
  vip18Promotion,
  traitRoll,
  vip14Roll,
  vip18Roll,
  vip8WeakSlot
 };
 try{Object.defineProperty(item,"_vipMeta",{value:meta,writable:true,configurable:true,enumerable:false});}catch(e){item._vipMeta=meta;}
 return item;
};
