// 特質怪物掉裝獎勵：保留原本掉落率與品質表，僅在成功掉裝後提供品質升階機會。
// 1 特質：15% 機率 +1 品質；2 特質：30% 機率 +1 品質；神話維持最高階。
window.dropItem=function(enemy,mapIdx){
 let chance=enemy.kind==="boss"?1:enemy.kind==="elite"?.6:.25;
 if(Math.random()>chance)return null;

 let offset=enemy.kind==="boss"?[-1,0,0,1,2]:enemy.kind==="elite"?[-1,0,0,1]:[-2,-1,0,0,1];
 let lv=Math.max(1,Math.min(50,enemy.level+offset[Math.floor(Math.random()*offset.length)]));
 let q=qualityRoll(enemy.kind);

 let traitCount=Array.isArray(enemy.traits)?Math.min(2,enemy.traits.length):0;
 let promoteChance=traitCount===2?.30:traitCount===1?.15:0;
 if(q<5&&promoteChance>0&&Math.random()<promoteChance)q++;

 return makeItem(lv,mapIdx,enemy.kind,q);
};
