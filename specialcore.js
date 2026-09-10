(function(){
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
 window.weakEquipmentTypes=weakEquipmentTypes;

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
  const combat=runCombatCore(playerCombatStats(),enemy,state.hp);
  state.hp=combat.hp;
  return {
   win:combat.win,
   logs:combat.logs,
   e:enemy,
   combatEndHp:state.hp,
   turns:combat.turns
  };
 };
})();
