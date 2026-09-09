// 主線怪物正式平衡。
// 目標：同區後段開始形成刷裝壓力；高品質裝備可多推進約一張圖，但不應跨越多張圖穩定碾壓。
// 只調整主線怪物基礎成長、style 與階段倍率，不改獎勵、掉落、裝備公式或特性機率。
function monsterBase(l){
 const level=Math.max(1,Math.floor(Number(l)||1));
 const extra=Math.max(0,level-20);
 const hpGrowth=1+extra*.009;
 const atkGrowth=1+extra*.007;
 const defGrowth=1+extra*.004;
 return {
  hp:ceil((62+16.2*level)*hpGrowth),
  atk:ceil((10.5+2.45*level)*atkGrowth),
  def:ceil((3.2+.92*level)*defGrowth)
 };
}

function monsterObj(mapIdx,eIdx){
 let d=MAPS[mapIdx].enemies[eIdx],b=monsterBase(d[1]),kind=d[2],style=d[3];
 if(style==="tank"){b.hp=ceil(b.hp*1.15);b.atk=ceil(b.atk*.95)}
 if(style==="attack"){b.hp=ceil(b.hp*.92);b.atk=ceil(b.atk*1.10)}
 const stage=[
  {hp:1.00,atk:1.00,def:1.00},
  {hp:1.10,atk:1.08,def:1.06},
  {hp:1.20,atk:1.16,def:1.11},
  {hp:1.38,atk:1.28,def:1.17},
  {hp:1.60,atk:1.36,def:1.22}
 ][eIdx]||{hp:1,atk:1,def:1};
 b.hp=ceil(b.hp*stage.hp);b.atk=ceil(b.atk*stage.atk);b.def=ceil(b.def*stage.def);
 return {name:d[0],level:d[1],kind,style,...b};
}
