(function(){
 // 共用副本戰鬥核心。舊版共享副本次數／activeRun 制度已退休；
 // 懸賞、競技場、虛空各自使用目前正式的每日／挑戰流程。
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