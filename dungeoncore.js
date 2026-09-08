(function(){
 const DUNGEON_TURN_LIMIT=200;
 let activeDungeonRun=null;

 function dungeonState(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState();
  if(!state.dungeon||typeof state.dungeon!=="object")state.dungeon={progress:0,attempts:0,points:0};
  if(!Number.isFinite(Number(state.dungeon.points))||Number(state.dungeon.points)<0)state.dungeon.points=0;
  return state.dungeon;
 }

 function fullHeal(){
  state.hp=equippedStats().hp;
 }

 window.canStartDungeonRun=function(cost=1){
  const dungeon=dungeonState();
  const need=Math.max(1,Math.floor(Number(cost)||1));
  return !!dungeon&&dungeon.attempts>=need;
 };

 window.beginDungeonRun=function(options={}){
  const dungeon=dungeonState();
  const cost=Math.max(1,Math.floor(Number(options.cost)||1));
  if(!dungeon||dungeon.attempts<cost){
   return {ok:false,reason:"insufficient_attempts",cost,attempts:dungeon?.attempts||0};
  }

  dungeon.attempts-=cost;
  fullHeal();
  activeDungeonRun={
   id:Date.now().toString(36)+Math.random().toString(36).slice(2),
   mode:String(options.mode||"dungeon"),
   cost,
   startedAt:Date.now()
  };
  save(false);

  return {
   ok:true,
   run:{...activeDungeonRun},
   attempts:dungeon.attempts,
   points:dungeon.points,
   hp:state.hp
  };
 };

 window.getActiveDungeonRun=function(){
  return activeDungeonRun?{...activeDungeonRun}:null;
 };

 window.finishDungeonRun=function(options={}){
  const heal=options.heal!==false;
  if(heal)fullHeal();
  const ended=activeDungeonRun?{...activeDungeonRun}:null;
  activeDungeonRun=null;
  save(false);
  const dungeon=dungeonState();
  return {ok:true,run:ended,hp:state.hp,attempts:dungeon?.attempts||0,points:dungeon?.points||0};
 };

 window.dungeonFightCore=function(enemy){
  if(!enemy||typeof enemy!=="object")return {win:false,turnLimit:false,invalid:true,logs:[],e:enemy||null,combatEndHp:state.hp};

  const ps=equippedStats();
  let ehp=Math.max(1,Number(enemy.hp)||1);
  let php=Math.max(0,Number(state.hp)||0);
  const logs=[];
  let turn=0;

  while(php>0&&ehp>0&&turn<DUNGEON_TURN_LIMIT){
   turn++;

   if(Math.random()*100<(Number(enemy.dodge)||0)){
    logs.push(`${enemy.name||"副本敵人"}閃避了你的攻擊。`);
   }else{
    let pd=calcDamage(ps.atk,Number(enemy.def)||0);
    const crit=Math.random()*100<ps.crit;
    if(crit)pd=ceil(pd*CRIT_DAMAGE_MULTIPLIER);
    ehp-=pd;
    logs.push(crit?`你攻擊${enemy.name||"副本敵人"}，暴擊造成 ${pd} 點傷害。`:`你攻擊${enemy.name||"副本敵人"}，造成 ${pd} 點傷害。`);
   }

   if(ehp<=0)break;

   if(Math.random()*100<ps.dodge){
    logs.push(`${enemy.name||"副本敵人"}攻擊你，你閃避了攻擊。`);
    continue;
   }

   let ed=calcDamage(Number(enemy.atk)||1,ps.def);
   const enemyCrit=Math.random()*100<(Number(enemy.crit)||0);
   if(enemyCrit)ed=ceil(ed*CRIT_DAMAGE_MULTIPLIER);
   php-=ed;
   logs.push(enemyCrit?`${enemy.name||"副本敵人"}攻擊你，暴擊造成 ${ed} 點傷害。`:`${enemy.name||"副本敵人"}攻擊你，造成 ${ed} 點傷害。`);
  }

  state.hp=Math.max(0,php);
  const turnLimit=php>0&&ehp>0;
  if(turnLimit)logs.push(`戰鬥超過 ${DUNGEON_TURN_LIMIT} 回合，未能分出勝負，本次挑戰結束。`);

  return {
   win:ehp<=0,
   turnLimit,
   logs,
   e:enemy,
   combatEndHp:state.hp,
   turns:turn
  };
 };
})();
