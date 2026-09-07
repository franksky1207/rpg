// 商店平衡：提高實用品質；第 1 件對準最弱槽位、第 2 件對準次弱槽位、第 3 件隨機。
function shopQualityRoll(){
 let r=Math.random()*100;
 if(r<25)return 0;      // 普通 25%
 if(r<65)return 1;      // 優良 40%
 if(r<90)return 2;      // 稀有 25%
 if(r<98)return 3;      // 史詩 8%
 return 4;              // 傳說 2%，神話 0%
}

function weakestEquipmentTypes(){
 return EQUIPMENT_TYPES
  .map(type=>({type,score:equipmentScore(state.equipment[type]),tie:Math.random()}))
  .sort((a,b)=>a.score-b.score||a.tie-b.tie)
  .map(x=>x.type);
}

makeShopItems=function(mapIdx=currentShopMap()){
 let m=MAPS[mapIdx],arr=[],ranked=weakestEquipmentTypes();
 for(let i=0;i<3;i++){
  let lv=Math.max(m.min,Math.min(m.max,state.level+Math.floor(Math.random()*3)-1));
  let q=shopQualityRoll();
  let forcedType=i===0?ranked[0]:i===1?ranked[1]:null;
  arr.push(makeItem(lv,mapIdx,"normal",q,forcedType));
 }
 return arr;
};
