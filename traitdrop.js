// 特質怪物掉裝獎勵：保留正式掉落率與品質表，成功掉裝後提供特質品質升階。
// VIP2：主線掉裝率 +5 個百分點（最高 100%）。
// VIP8：每件主線掉落獨立 15% 機率指定為目前最弱裝備部位；並列最弱時沿用 weakEquipmentTypes() 隨機排序。
// 1 特質：15% 機率 +1 品質；2 特質：30% 機率 +1 品質；神話維持最高階。
window.dropItem=function(enemy,mapIdx){
 let chance=enemy.kind==="boss"?1:enemy.kind==="elite"?.6:.25;
 if((state.vipLevel||0)>=2)chance=Math.min(1,chance+.05);
 if(Math.random()>chance)return null;

 let offset=enemy.kind==="boss"?[-1,0,0,1,2]:enemy.kind==="elite"?[-1,0,0,1]:[-2,-1,0,0,1];
 let lv=Math.max(1,Math.min(MAX_LEVEL,enemy.level+offset[Math.floor(Math.random()*offset.length)]));
 let q=qualityRoll(enemy.kind);

 let traitCount=Array.isArray(enemy.traits)?Math.min(2,enemy.traits.length):0;
 let promoteChance=traitCount===2?.30:traitCount===1?.15:0;
 if(q<5&&promoteChance>0&&Math.random()<promoteChance)q++;

 let forcedType=null;
 if((state.vipLevel||0)>=8&&Math.random()<.15&&typeof weakEquipmentTypes==="function"){
  const order=weakEquipmentTypes();
  forcedType=order[0]||null;
 }

 return makeItem(lv,mapIdx,enemy.kind,q,forcedType);
};
