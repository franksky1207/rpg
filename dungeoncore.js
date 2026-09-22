(function(){
 // 共用副本戰鬥核心。舊版共享副本次數／activeRun 制度已退休；
 // 懸賞、競技場、虛空各自使用目前正式的每日／挑戰流程。
 window.dungeonFightCore=function(enemy,options={}){
  if(!enemy||typeof enemy!=="object")return {win:false,invalid:true,logs:[],events:[],e:enemy||null,combatEndHp:state.hp,turns:0};
  const explicitWorld=options.world==null?null:(Number(options.world)===2?2:1);
  const world=explicitWorld||(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(state)===true?2:1);
  const civilizationMultiplier=world===2&&typeof window.civilizationDamageMultiplier==="function"?window.civilizationDamageMultiplier(state):1;
  const combat=runCombatCore(playerCombatStats(),enemy,state.hp,{playerFinalDamageMultiplier:civilizationMultiplier});
  const combatEndHp=combat.hp;
  state.hp=combatEndHp;
  return {
   win:combat.win,
   logs:combat.logs,
   events:combat.events||[],
   e:enemy,
   combatEndHp,
   turns:combat.turns,
   civilizationDamageMultiplier
  };
 };
 window.DUNGEON_CIVILIZATION_DAMAGE_VERSION=1;
})();