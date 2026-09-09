// 主線怪物正式平衡。
// 目標：同區後段開始形成刷裝壓力；高品質裝備可多推進約一張圖，但不應跨越多張圖穩定碾壓。
// 長期設計：怪物與玩家／裝備皆採線性等級成長，避免高等級飽和或指數失控，預留 Lv200／Lv300 以上擴等。
// 只調整主線怪物基礎成長、style 與階段倍率，不改獎勵、掉落、裝備公式或特性機率。
function monsterBase(l){
 const level=Math.max(1,Math.floor(Number(l)||1));
 // 以一般「稀有＋史詩＋少量傳說」混裝玩家為主基準；全傳說視為偏強上限。
 // 基礎怪物斜率略低於玩家整套裝備成長，實際再由 stage／style／traits 形成戰鬥壓力。
 return {
  hp:ceil(55+24*level),
  atk:ceil(9+4.2*level),
  def:ceil(2.5+2.0*level)
 };
}

function monsterObj(mapIdx,eIdx){
 let d=MAPS[mapIdx].enemies[eIdx],b=monsterBase(d[1]),kind=d[2],style=d[3];
 if(style==="tank"){b.hp=ceil(b.hp*1.15);b.atk=ceil(b.atk*.95)}
 if(style==="attack"){b.hp=ceil(b.hp*.92);b.atk=ceil(b.atk*1.10)}
 const stage=[
  {hp:1.22,atk:1.17,def:1.10},
  {hp:1.31,atk:1.24,def:1.14},
  {hp:1.39,atk:1.31,def:1.17},
  {hp:1.39,atk:1.29,def:1.17},
  {hp:1.44,atk:1.27,def:1.17}
 ][eIdx]||{hp:1,atk:1,def:1};
 b.hp=ceil(b.hp*stage.hp);b.atk=ceil(b.atk*stage.atk);b.def=ceil(b.def*stage.def);
 return {name:d[0],level:d[1],kind,style,...b};
}
