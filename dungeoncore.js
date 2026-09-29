(function(){
 // 共用副本戰鬥核心。舊版共享副本次數／activeRun 制度已退休；
 // 懸賞、競技場、虛空各自使用目前正式的每日／挑戰流程。
 window.dungeonFightCore=function(enemy,options={}){
  if(!enemy||typeof enemy!=="object")return {win:false,invalid:true,logs:[],events:[],e:enemy||null,combatEndHp:state.hp,turns:0};
  const explicitWorld=options.world==null?null:(Number(options.world)===2?2:1);
  const world=explicitWorld||(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(state)===true?2:1);
  if(typeof window.runWorldCombatCore!=="function")return {win:false,invalid:true,reason:"world-combat-adapter-missing",logs:[],events:[],e:enemy,combatEndHp:state.hp,turns:0};
  const resolved=window.runWorldCombatCore(playerCombatStats(),enemy,state.hp,{world,state});
  const combat=resolved.combat;
  const combatEndHp=combat.hp;
  state.hp=combatEndHp;
  return {
   win:combat.win,
   logs:combat.logs,
   events:combat.events||[],
   e:enemy,
   combatEndHp,
   turns:combat.turns,
   civilizationDamageMultiplier:resolved.playerFinalDamageMultiplier
  };
 };
 window.DUNGEON_CIVILIZATION_DAMAGE_VERSION=3;
 window.DUNGEON_WORLD_COMBAT_ADAPTER_VERSION=1;
})();
