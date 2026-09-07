// 商店平衡：提高實用品質，並保證 3 件商品中至少 1 件對準目前最弱裝備槽位。
function shopQualityRoll(){
 let r=Math.random()*100;
 if(r<25)return 0;      // 普通 25%
 if(r<65)return 1;      // 優良 40%
 if(r<90)return 2;      // 稀有 25%
 if(r<98)return 3;      // 史詩 8%
 return 4;              // 傳說 2%，神話 0%
}

function weakestEquipmentType(){
 let rows=EQUIPMENT_TYPES.map(type=>({type,score:equipmentScore(state.equipment[type])}));
 let min=Math.min(...rows.map(x=>x.score));
 let tied=rows.filter(x=>x.score===min);
 return tied[Math.floor(Math.random()*tied.length)].type;
}

makeShopItems=function(mapIdx=currentShopMap()){
 let m=MAPS[mapIdx],arr=[],weakest=weakestEquipmentType();
 for(let i=0;i<3;i++){
  let lv=Math.max(m.min,Math.min(m.max,state.level+Math.floor(Math.random()*3)-1));
  let q=shopQualityRoll();
  arr.push(makeItem(lv,mapIdx,"normal",q,i===0?weakest:null));
 }
 return arr;
};
