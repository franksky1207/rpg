(function(){
 const ALTERNATE_UNIVERSE_COMBAT_VERSION=2;
 const ALTERNATE_UNIVERSE_COMBAT_ADAPTER_VERSION=1;
 const ALTERNATE_UNIVERSE_COMBAT_SETTLEMENT_VERSION=1;
 const SETTLEMENT_AUTHORITY="alternate-universe-combat-basis";

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:(window.state&&typeof window.state==="object"?window.state:null);}catch(_){return window.state&&typeof window.state==="object"?window.state:null;}}
 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function freezeClone(value){try{return Object.freeze(JSON.parse(JSON.stringify(value)));}catch(_){return null;}}
 function fail(reason,extra={}){return Object.freeze({ok:false,reason:String(reason||"alternate-universe-combat-failed"),...extra});}
 function currentWorld(target=currentState()){if(typeof window.currentWorldPhase==="function"){const world=whole(window.currentWorldPhase(target),0);if(world>=1&&world<=3)return world;}if(target?.thirdWorld?.entered===true)return 3;if(target?.secondWorld?.entered===true)return 2;return 1;}
 function playerStats(options={}){if(options.player&&typeof options.player==="object")return options.player;return typeof window.playerCombatStats==="function"?window.playerCombatStats():null;}
 function formalAttempt(target=currentState()){return typeof window.alternateUniverseActiveAttempt==="function"?window.alternateUniverseActiveAttempt(target):null;}
 function formalEncounter(target=currentState()){return typeof window.alternateUniverseCurrentAttemptEncounter==="function"?window.alternateUniverseCurrentAttemptEncounter(target):null;}
 function termination(combat){const playerHp=Math.max(0,numberOr(combat?.hp,0)),enemyHp=Math.max(0,numberOr(combat?.enemyHp,0));if(playerHp<=0&&enemyHp<=0)return "mutual-defeat";if(enemyHp<=0)return "enemy-defeated";if(playerHp<=0)return "player-defeated";if(combat?.actionBudgetReached===true)return "action-safety";return "incomplete";}
 function createBasis(input={}){
  const combat=input.combat&&typeof input.combat==="object"?input.combat:{};
  const playerHp=Math.max(0,numberOr(combat.hp,0)),enemyHp=Math.max(0,numberOr(combat.enemyHp,0));
  const completed=playerHp<=0||enemyHp<=0,win=enemyHp<=0&&combat.win===true,outcome=completed?(win?"win":"loss"):"incomplete";
  return Object.freeze({version:ALTERNATE_UNIVERSE_COMBAT_SETTLEMENT_VERSION,authority:SETTLEMENT_AUTHORITY,world:whole(input.world,1),depth:whole(input.depth,0),attemptId:String(input.attemptId||""),traits:Object.freeze(Array.isArray(input.traits)?input.traits.slice():[]),playerStartHp:Math.max(0,numberOr(input.playerStartHp,0)),playerEndHp:playerHp,enemyStartHp:Math.max(1,numberOr(input.enemyStartHp,1)),enemyEndHp:enemyHp,turns:Math.max(0,whole(combat.turns,0)),combatCompleted:completed,win,outcome,terminationReason:termination(combat),formalSettlementEligible:completed&&!!String(input.attemptId||"")});
 }
 function runAlternateUniverseCombat(options={}){
  if(typeof window.runWorldCombatCore!=="function")return fail("world-combat-adapter-missing");
  const target=options.state&&typeof options.state==="object"?options.state:currentState();if(!target)return fail("state-missing");
  const attempt=formalAttempt(target);if(!attempt)return fail("active-attempt-missing");
  const depth=attempt.depth,attemptId=attempt.attemptId,traits=Array.isArray(attempt.traits)?attempt.traits.slice():[];
  const enemy=options.encounter&&typeof options.encounter==="object"?options.encounter:formalEncounter(target);if(!enemy)return fail("formal-encounter-missing",{depth,attemptId});
  if(whole(enemy.alternateUniverseDepth,0)!==depth||String(enemy.alternateUniverseMode||"")!=="challenge")return fail("formal-encounter-mismatch",{depth,attemptId});
  const player=playerStats(options);if(!player)return fail("player-stats-missing",{depth});
  const playerMaxHp=Math.max(1,numberOr(player.hp,1));
  const startHp=options.startHp==null?Math.max(0,numberOr(target.hp,playerMaxHp)):Math.max(0,numberOr(options.startHp,playerMaxHp));
  const world=currentWorld(target);
  const resolved=window.runWorldCombatCore(player,enemy,startHp,{world,state:target,civilizationLevel:options.civilizationLevel,breakthroughLevel:options.breakthroughLevel,logs:options.logs!==false,rng:typeof options.rng==="function"?options.rng:undefined,useTestSpecializations:options.useTestSpecializations===true,useTestMarks:options.useTestMarks===true,markLevels:options.markLevels||null,maxTurns:Math.max(0,whole(options.maxTurns,0)),maxActions:options.maxActions,maxActionsPerChain:options.maxActionsPerChain,preparePresentation:options.preparePresentation===true,playerHealCap:options.playerHealCap==null?playerMaxHp:Math.max(1,Math.min(playerMaxHp,numberOr(options.playerHealCap,playerMaxHp)))});
  const combat=resolved?.combat;if(!combat||typeof combat!=="object")return fail("combat-result-missing",{depth});
  const basis=createBasis({world,depth,attemptId,traits,playerStartHp:startHp,enemyStartHp:enemy.hp,combat});
  return Object.freeze({ok:true,version:ALTERNATE_UNIVERSE_COMBAT_VERSION,adapterVersion:ALTERNATE_UNIVERSE_COMBAT_ADAPTER_VERSION,world,depth,attemptId,traits:Object.freeze(traits.slice()),enemy:freezeClone(enemy),playerFinalDamageMultiplier:Number(resolved.playerFinalDamageMultiplier)||1,combat:freezeClone(combat),settlementBasis:basis,settlementReady:basis.formalSettlementEligible});
 }
 function basisFromResult(result){const basis=result?.authority===SETTLEMENT_AUTHORITY?result:result?.settlementBasis;if(!basis||typeof basis!=="object"||basis.authority!==SETTLEMENT_AUTHORITY||Number(basis.version)!==ALTERNATE_UNIVERSE_COMBAT_SETTLEMENT_VERSION)return null;return basis;}
 function settleAlternateUniverseCombat(result){
  const basis=basisFromResult(result);if(!basis)return fail("invalid-settlement-basis");
  if(basis.formalSettlementEligible!==true||basis.combatCompleted!==true)return fail("combat-not-complete",{depth:basis.depth,attemptId:basis.attemptId});
  if(typeof window.alternateUniverseActiveAttempt!=="function"||typeof window.settleAlternateUniverseAttempt!=="function")return fail("attempt-settlement-owner-missing",{depth:basis.depth});
  const live=window.alternateUniverseActiveAttempt(currentState());if(!live)return fail("active-attempt-missing",{depth:basis.depth,attemptId:basis.attemptId});
  if(live.attemptId!==basis.attemptId||live.depth!==basis.depth)return fail("attempt-settlement-mismatch",{depth:basis.depth,attemptId:basis.attemptId,liveAttemptId:live.attemptId,liveDepth:live.depth});
  const settled=window.settleAlternateUniverseAttempt(basis.outcome,{attemptId:basis.attemptId});if(!settled?.ok)return fail(settled?.reason||"attempt-settlement-failed",{depth:basis.depth,attemptId:basis.attemptId,attemptSettlement:settled||null});
  return Object.freeze({ok:true,depth:basis.depth,attemptId:basis.attemptId,outcome:basis.outcome,combatCompleted:true,win:basis.win===true,settlement:settled});
 }
 function runAndSettleAlternateUniverseCombat(options={}){const result=runAlternateUniverseCombat(options);if(!result.ok||result.settlementReady!==true)return Object.freeze({ok:result.ok===true,combatResult:result,settled:false,settlement:null});const settlement=settleAlternateUniverseCombat(result);return Object.freeze({ok:settlement.ok===true,combatResult:result,settled:settlement.ok===true,settlement});}

 window.ALTERNATE_UNIVERSE_COMBAT_VERSION=ALTERNATE_UNIVERSE_COMBAT_VERSION;
 window.ALTERNATE_UNIVERSE_COMBAT_ADAPTER_VERSION=ALTERNATE_UNIVERSE_COMBAT_ADAPTER_VERSION;
 window.ALTERNATE_UNIVERSE_COMBAT_SETTLEMENT_VERSION=ALTERNATE_UNIVERSE_COMBAT_SETTLEMENT_VERSION;
 window.ALTERNATE_UNIVERSE_COMBAT_SETTLEMENT_AUTHORITY=SETTLEMENT_AUTHORITY;
 window.runAlternateUniverseCombat=runAlternateUniverseCombat;
 window.alternateUniverseCombatSettlementBasis=basisFromResult;
 window.settleAlternateUniverseCombat=settleAlternateUniverseCombat;
 window.runAndSettleAlternateUniverseCombat=runAndSettleAlternateUniverseCombat;
})();
