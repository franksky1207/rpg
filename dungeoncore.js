(function(){
 let activeDungeonRun=null;

 function dungeonState(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState();
  if(!state.dungeon||typeof state.dungeon!=="object")state.dungeon={progress:0,attempts:0};
  return state.dungeon;
 }

 function currentVipPoints(){return Math.max(0,Math.floor(Number(state.vipPoints)||0));}

 function fullHeal(){
  if(typeof restorePlayerHp==="function")return restorePlayerHp({save:false});
  state.hp=playerCombatStats().hp;
  return state.hp;
 }

 function runSnapshot(run){return run?{...run}:null;}
 function persistActiveRun(dungeon,run){
  if(!dungeon)return;
  dungeon.activeRun=run?runSnapshot(run):null;
 }

 window.canStartDungeonRun=function(cost=1){
  const dungeon=dungeonState();
  const need=Math.max(1,Math.floor(Number(cost)||1));
  return !activeDungeonRun&&!!dungeon&&dungeon.attempts>=need;
 };

 window.beginDungeonRun=function(options={}){
  const dungeon=dungeonState();
  const cost=Math.max(1,Math.floor(Number(options.cost)||1));
  if(activeDungeonRun){
   return {ok:false,reason:"run_already_active",cost,attempts:dungeon?.attempts||0,run:runSnapshot(activeDungeonRun)};
  }
  if(!dungeon||dungeon.attempts<cost){
   return {ok:false,reason:"insufficient_attempts",cost,attempts:dungeon?.attempts||0};
  }

  dungeon.attempts-=cost;
  activeDungeonRun={
   id:Date.now().toString(36)+Math.random().toString(36).slice(2),
   mode:String(options.mode||"dungeon"),
   cost,
   startedAt:Date.now()
  };
  persistActiveRun(dungeon,activeDungeonRun);
  save(false);

  return {
   ok:true,
   run:runSnapshot(activeDungeonRun),
   attempts:dungeon.attempts,
   points:currentVipPoints(),
   hp:state.hp
  };
 };

 window.getActiveDungeonRun=function(){
  return runSnapshot(activeDungeonRun);
 };

 window.finishDungeonRun=function(options={}){
  const heal=options.heal!==false;
  if(heal)fullHeal();
  const ended=runSnapshot(activeDungeonRun);
  activeDungeonRun=null;
  const dungeon=dungeonState();
  persistActiveRun(dungeon,null);
  save(false);
  return {ok:true,run:ended,hp:state.hp,attempts:dungeon?.attempts||0,points:currentVipPoints()};
 };

 window.dungeonFightCore=function(enemy){
  if(!enemy||typeof enemy!=="object")return {win:false,invalid:true,logs:[],events:[],e:enemy||null,combatEndHp:state.hp,turns:0};
  const combat=runCombatCore(playerCombatStats(),enemy,state.hp);
  const combatEndHp=combat.hp;
  state.hp=combatEndHp;
  return {
   win:combat.win,
   logs:combat.logs,
   events:combat.events||[],
   e:enemy,
   combatEndHp,
   turns:combat.turns
  };
 };
})();