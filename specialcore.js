(function(){
 const SPECIAL_TURN_LIMIT=200;

 function qualityFromTable(table){
  if(!Array.isArray(table)||!table.length)return qualityRoll("normal");
  let total=table.reduce((a,n)=>a+Math.max(0,Number(n)||0),0);
  if(total<=0)return qualityRoll("normal");
  let r=Math.random()*total;
  for(let i=0;i<table.length;i++){
   r-=Math.max(0,Number(table[i])||0);
   if(r<0)return Math.min(5,i);
  }
  return 0;
 }

 function weakEquipmentTypes(){
  const rows=EQUIPMENT_TYPES.map(type=>({type,score:equipmentScore(state.equipment[type])}));
  for(let i=rows.length-1;i>0;i--){
   let j=Math.floor(Math.random()*(i+1));
   [rows[i],rows[j]]=[rows[j],rows[i]];
  }
  rows.sort((a,b)=>a.score-b.score);
  return rows.map(x=>x.type);
 }

 function dropType(ctx){
  if(!ctx?.weakSlotDrop)return null;
  const order=weakEquipmentTypes(),p=ctx.weakSlotDrop.primary??70;
  return Math.random()*100<p?(order[0]||null):(order[1]||order[0]||null);
 }

 function rollQuality(ctx){
  let q=ctx?.qualityTable?qualityFromTable(ctx.qualityTable):qualityRoll("normal");
  return Math.max(q,ctx?.minQuality||0);
 }

 window.specialMakeDrops=function(ctx,level,mapIdx){
  const chance=ctx?.dropChance==null?0.25:ctx.dropChance;
  if(Math.random()>chance)return [];
  const count=Math.max(1,ctx?.dropCount||1),drops=[];
  for(let i=0;i<count;i++){
   const q=rollQuality(ctx),type=dropType(ctx);
   drops.push(makeItem(level,mapIdx,"normal",q,type));
  }
  return drops;
 };

 window.specialApplyShopDiscount=function(levels){
  const n=Math.max(0,Math.floor(levels||0));
  if(!n)return 0;
  const before=state.shop.refreshIndex||0;
  state.shop.refreshIndex=Math.max(0,before-n);
  return before-state.shop.refreshIndex;
 };

 window.specialFightCore=function(enemy){
  const ps=equippedStats();
  let ehp=enemy.hp,php=state.hp,logs=[],turn=0;
  while(php>0&&ehp>0&&turn<SPECIAL_TURN_LIMIT){
   turn++;
   if(Math.random()*100<(enemy.dodge||0)){
    logs.push(`${enemy.name}閃避了你的攻擊。`);
   }else{
    let pd=calcDamage(ps.atk,enemy.def),crit=Math.random()*100<ps.crit;
    if(crit)pd=ceil(pd*CRIT_DAMAGE_MULTIPLIER);
    ehp-=pd;
    logs.push(crit?`你攻擊${enemy.name}，暴擊造成 ${pd} 點傷害。`:`你攻擊${enemy.name}，造成 ${pd} 點傷害。`);
   }
   if(ehp<=0)break;
   if(Math.random()*100<ps.dodge){
    logs.push(`${enemy.name}攻擊你，你閃避了攻擊。`);
    continue;
   }
   let ed=calcDamage(enemy.atk,ps.def),enemyCrit=Math.random()*100<(enemy.crit||0);
   if(enemyCrit)ed=ceil(ed*CRIT_DAMAGE_MULTIPLIER);
   php-=ed;
   logs.push(enemyCrit?`${enemy.name}攻擊你，暴擊造成 ${ed} 點傷害。`:`${enemy.name}攻擊你，造成 ${ed} 點傷害。`);
  }
  state.hp=Math.max(0,php);
  const turnLimit=php>0&&ehp>0;
  if(turnLimit)logs.push(`戰鬥超過 ${SPECIAL_TURN_LIMIT} 回合，未能分出勝負，本次挑戰結束。`);
  return {win:ehp<=0,turnLimit,logs,e:enemy};
 };

 // GM 測試沿用同一套正式特殊怪核心，避免正式機制反向依賴 GM 模組。
 if(typeof window.gmSpecialMakeDrops==="function")window.gmSpecialMakeDrops=window.specialMakeDrops;
 if(typeof window.gmSpecialApplyShopDiscount==="function")window.gmSpecialApplyShopDiscount=window.specialApplyShopDiscount;
 if(typeof window.gmSpecialFight==="function")window.gmSpecialFight=window.specialFightCore;
})();
