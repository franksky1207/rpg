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

 function weakEquipmentTypes(equipment=null){
  const source=equipment&&typeof equipment==="object"?equipment:state.equipment;
  const rows=EQUIPMENT_TYPES.map(type=>({type,score:equipmentScore(source?.[type]||null)}));
  for(let i=rows.length-1;i>0;i--){
   let j=Math.floor(Math.random()*(i+1));
   [rows[i],rows[j]]=[rows[j],rows[i]];
  }
  rows.sort((a,b)=>a.score-b.score);
  return rows.map(x=>x.type);
 }
 window.weakEquipmentTypes=weakEquipmentTypes;

 function dropType(ctx,equipment=null){
  if(!ctx?.weakSlotDrop)return null;
  const order=weakEquipmentTypes(equipment),p=ctx.weakSlotDrop.primary??70;
  return Math.random()*100<p?(order[0]||null):(order[1]||order[0]||null);
 }

 function rollQuality(ctx,world=1){
  let q;
  if(ctx?.qualityTable)q=qualityFromTable(ctx.qualityTable);
  else if(Number(world)===2&&typeof window.secondWorldEquipmentQualityRoll==="function")q=window.secondWorldEquipmentQualityRoll();
  else q=qualityRoll("normal");
  return Math.max(q,ctx?.minQuality||0);
 }

 window.specialMakeDrops=function(ctx,level,mapIdx,options={}){
  const world=Number(options.world??ctx?.world)===2?2:1;
  const chance=ctx?.dropChance==null?0.25:ctx.dropChance;
  if(Math.random()>chance)return [];
  const count=Math.max(1,ctx?.dropCount||1),drops=[];
  for(let i=0;i<count;i++){
   const q=rollQuality(ctx,world),type=dropType(ctx,options.equipment||null);
   if(world===2){
    const bossIndex=Number.isInteger(options.bossIndex)?options.bossIndex:(typeof window.secondWorldBossIndexForPlayerLevel==="function"?window.secondWorldBossIndexForPlayerLevel(level):-1);
    const item=typeof window.makeSecondWorldEquipmentForBoss==="function"&&bossIndex>=0
     ?window.makeSecondWorldEquipmentForBoss(bossIndex,{state:options.state,level,forcedQ:q,forcedType:type})
     :null;
    if(item)drops.push(item);
   }else{
    drops.push(makeItem(level,mapIdx,"normal",q,type));
   }
  }
  return drops;
 };

 window.specialFightCore=function(enemy,options={}){
  const combat=runCombatCore(playerCombatStats(),enemy,state.hp,{
   playerFinalDamageMultiplier:Number(options.world)===2&&typeof window.civilizationDamageMultiplier==="function"?window.civilizationDamageMultiplier():1
  });
  state.hp=combat.hp;
  return {
   win:combat.win,
   logs:combat.logs,
   events:combat.events||[],
   e:enemy,
   combatEndHp:state.hp,
   turns:combat.turns
  };
 };
 window.SPECIAL_WORLD_DROP_OWNER_VERSION=2;
 window.SPECIAL_WEAK_SLOT_CONTEXT_VERSION=1;
})();