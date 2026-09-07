// 第5批：整體戰鬥平衡。只調整怪物基礎數值與階段倍率，不改獎勵、掉落、裝備公式或特質機率。
function monsterBase(l){
 return {
  hp:ceil(62+16.2*l),
  atk:ceil(10.5+2.45*l),
  def:ceil(3.2+.92*l)
 };
}

function monsterObj(mapIdx,eIdx){
 let d=MAPS[mapIdx].enemies[eIdx],b=monsterBase(d[1]),kind=d[2],style=d[3];
 if(style==="tank"){b.hp=ceil(b.hp*1.25);b.atk=ceil(b.atk*.9)}
 if(style==="attack"){b.hp=ceil(b.hp*.85);b.atk=ceil(b.atk*1.2)}
 const stage=[
  {hp:1.00,atk:1.00,def:1.00},
  {hp:1.12,atk:1.10,def:1.08},
  {hp:1.30,atk:1.22,def:1.16},
  {hp:1.62,atk:1.36,def:1.24},
  {hp:2.12,atk:1.48,def:1.30}
 ][eIdx]||{hp:1,atk:1,def:1};
 b.hp=ceil(b.hp*stage.hp);b.atk=ceil(b.atk*stage.atk);b.def=ceil(b.def*stage.def);
 return {name:d[0],level:d[1],kind,style,...b};
}
