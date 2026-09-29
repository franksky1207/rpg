(function(){
 const CORE_VERSION=2;
 const PROJECTION_VERSION=1;
 const LINEUP_VERSION=1;
 const BALANCE_VERSION=1;
 const FLOW_VERSION=2;
 const REWARD_VERSION=1;
 const DAILY_VERSION=1;
 const WORLD=3;
 const MIN_LEVEL=1000;
 const MAX_LEVEL=2000;
 const RUN_CHOICES=Object.freeze([1,5,10,20]);
 const STAGE_BASE_POINTS=Object.freeze([300,400,800]);
 const LEVEL_STEP=100;
 const LEVEL_STEP_BONUS=.05;
 const MODE_DEFS=Object.freeze({
  fixed:Object.freeze({id:"fixed",name:"定相競技場",description:"三戰挑戰同一名高維存在。"}),
  varied:Object.freeze({id:"varied",name:"異相競技場",description:"三戰分別挑戰三名不同的高維存在。"})
 });
 const STAGE_PROFILE=Object.freeze([
  Object.freeze({hpMul:.99,damageMul:.9405,defMul:1.287}),
  Object.freeze({hpMul:1.1385,damageMul:1.056,defMul:1.320}),
  Object.freeze({hpMul:1.287,damageMul:1.2045,defMul:1.353})
 ]);
 function finite(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function round1(value){return Math.round(finite(value,0)*10)/10;}
 function targetState(target=null){if(target&&typeof target==="object")return target;try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}}
 function bosses(){return Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS.slice():[];}
 function bossByValue(value){
  if(typeof window.thirdWorldBoss==="function")return window.thirdWorldBoss(value);
  const rows=bosses();
  if(value&&typeof value==="object"){
   if(typeof value.id==="string"){const byId=rows.find(row=>row?.id===value.id);if(byId)return byId;}
   const index=whole(value.index,-1);if(index>=0&&index<rows.length)return rows[index];
  }
  if(typeof value==="string"){const byId=rows.find(row=>row?.id===value);if(byId)return byId;}
  const index=whole(value,-1);return index>=0&&index<rows.length?rows[index]:null;
 }
 function mode(value){const id=String(value||"").toLowerCase();return MODE_DEFS[id]||null;}
 function stageProfile(stageIndex){const index=clamp(whole(stageIndex,0),0,2),row=STAGE_PROFILE[index];return {stageIndex:index,hpMul:row.hpMul,damageMul:row.damageMul,defMul:row.defMul};}
 function projectionName(value){const boss=bossByValue(value);return boss?`高維投影·${boss.name}`:"高維投影";}
 function projectionPresentation(value){
  const boss=bossByValue(value);if(!boss)return null;
  const spec=typeof window.thirdWorldBossSpecializationPresentation==="function"?window.thirdWorldBossSpecializationPresentation(boss):null;
  return Object.freeze({bossIndex:boss.index,bossId:boss.id,bossName:boss.name,name:projectionName(boss),typeLabel:spec?.label||"高維存在",specializationId:String(boss.specialization?.id||"")});
 }
 function rngIndex(length,rng){const total=Math.max(0,whole(length,0));if(total<=0)return -1;const roll=clamp(finite((typeof rng==="function"?rng:Math.random)(),0),0,.9999999999999999);return Math.floor(roll*total);}
 function lineupBosses(value,options={}){
  const selectedMode=mode(value);if(!selectedMode)return [];
  const rows=bosses();if(rows.length<3)return [];
  const rng=typeof options.rng==="function"?options.rng:Math.random;
  if(selectedMode.id==="fixed"){
   const forced=bossByValue(options.bossIndex??options.bossId);
   const chosen=forced||rows[rngIndex(rows.length,rng)]||null;
   return chosen?[chosen,chosen,chosen]:[];
  }
  const pool=rows.slice(),out=[];
  while(out.length<3&&pool.length){const index=rngIndex(pool.length,rng);out.push(pool.splice(index,1)[0]);}
  return out;
 }
 function lineup(value,options={}){return lineupBosses(value,options).map((boss,stageIndex)=>Object.freeze({stageIndex,bossIndex:boss.index,bossId:boss.id,bossName:boss.name,name:projectionName(boss),typeLabel:projectionPresentation(boss)?.typeLabel||"高維存在"}));}
 function playerSnapshot(stats=null){
  const source=stats&&typeof stats==="object"?stats:(typeof window.playerCombatStats==="function"?window.playerCombatStats():null);
  if(typeof window.createSpecialPlayerSnapshot!=="function")throw new Error("World 3 Arena requires createSpecialPlayerSnapshot owner.");
  return window.createSpecialPlayerSnapshot(source||{});
 }
 function enemyAbilityProfile(value){
  const boss=bossByValue(value),spec=boss?.specialization||{},id=String(spec.id||"");
  return Object.freeze({
   initiativeBonusPercent:id==="initiative"?Math.max(0,finite(spec.initiativeBonusPoints,0)):0,
   comboRate:id==="combo"?Math.max(0,finite(spec.comboRatePoints,0)):0,
   penetrationRate:id==="penetration"?Math.max(0,finite(spec.penetrationRatePoints,0)):0,
   counterRate:id==="counter"?Math.max(0,finite(spec.counterRatePoints,0)):0,
   drainRate:id==="drain"?Math.max(0,finite(spec.drainRatePoints,0)):0
  });
 }
 function buildEnemy(value,stageIndex,stats=null,level=null){
  const boss=bossByValue(value);if(!boss)return null;
  if(typeof window.specialBaseEnemyFromPlayer!=="function")throw new Error("World 3 Arena requires specialBaseEnemyFromPlayer owner.");
  const player=playerSnapshot(stats),base=window.specialBaseEnemyFromPlayer(player),profile=stageProfile(stageIndex),spec=boss.specialization||{},id=String(spec.id||"");
  let atk=Math.max(1,Math.ceil(base.damage*profile.damageMul+player.def*.55));
  let def=Math.max(0,Math.ceil(base.def*profile.defMul));
  let crit=round1(Math.max(0,player.crit));
  let dodge=round1(Math.max(0,player.dodge));
  if(Number.isFinite(Number(spec.atkMultiplier)))atk=Math.max(1,Math.ceil(atk*Number(spec.atkMultiplier)));
  if(Number.isFinite(Number(spec.defMultiplier)))def=Math.max(0,Math.ceil(def*Number(spec.defMultiplier)));
  if(id==="critical")crit=round1(crit+Math.max(0,finite(spec.critPoints,0)));
  if(id==="dodge")dodge=round1(dodge+Math.max(0,finite(spec.dodgePoints,0)));
  const ability=enemyAbilityProfile(boss);
  return {
   name:projectionName(boss),
   level:clamp(whole(level??targetState()?.level,MIN_LEVEL),MIN_LEVEL,MAX_LEVEL),
   kind:"dungeon-arena-third-world",
   style:"higher-dimensional-projection",
   world:WORLD,
   arenaStage:profile.stageIndex,
   higherDimensionalBossIndex:boss.index,
   higherDimensionalBossId:boss.id,
   specializationId:id,
   typeLabel:projectionPresentation(boss)?.typeLabel||"高維存在",
   hp:Math.max(1,Math.ceil(base.hp*profile.hpMul)),
   atk,
   def,
   crit,
   dodge,
   enemyAbilityProfile:ability,
   arenaAbilityProfile:ability,
   playerSnapshot:player
  };
 }
 function combatOptions(enemy,target=null){
  const gameState=targetState(target);
  const finalDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:WORLD,state:gameState}):1;
  return {playerFinalDamageMultiplier:Math.max(0,finite(finalDamageMultiplier,1)),enemyAbilityProfile:enemy?.enemyAbilityProfile||enemy?.arenaAbilityProfile||enemyAbilityProfile(enemy?.higherDimensionalBossIndex),enemyEffectProfile:{}};
 }
 function rewardLevel(level){return clamp(whole(level,MIN_LEVEL),MIN_LEVEL,MAX_LEVEL);}
 function rewardMultiplier(level){const safe=rewardLevel(level),steps=Math.floor((safe-MIN_LEVEL)/LEVEL_STEP);return Math.round((1+steps*LEVEL_STEP_BONUS)*100)/100;}
 function stageReward(stageIndex,level){const index=clamp(whole(stageIndex,0),0,2),base=STAGE_BASE_POINTS[index],multiplier=rewardMultiplier(level);return Object.freeze({stageIndex:index,basePoints:base,level:rewardLevel(level),levelSteps:Math.floor((rewardLevel(level)-MIN_LEVEL)/LEVEL_STEP),levelMultiplier:multiplier,scaledPoints:Math.round(base*multiplier)});}
 function roundReward(level){const stages=STAGE_BASE_POINTS.map((_,index)=>stageReward(index,level)),basePoints=stages.reduce((sum,row)=>sum+row.basePoints,0),scaledPoints=stages.reduce((sum,row)=>sum+row.scaledPoints,0);return Object.freeze({level:rewardLevel(level),levelMultiplier:rewardMultiplier(level),basePoints,scaledPoints,stages:Object.freeze(stages)});}
 function projectedVipPoints(points){const base=Math.max(0,whole(points,0));return typeof window.adjustVipDungeonPoints==="function"?Math.max(0,whole(window.adjustVipDungeonPoints(base),0)):base;}
 function rewardPreview(level=null){const gameState=targetState(),reward=roundReward(level??gameState?.level??MIN_LEVEL);return Object.freeze({...reward,actualPoints:projectedVipPoints(reward.scaledPoints)});}
 function dailyStatus(){return typeof window.dailyDungeonStatus==="function"?window.dailyDungeonStatus("arena"):{mode:"arena",used:0,remaining:0,limit:20};}
 function runChoice(value){const count=whole(value,0);return RUN_CHOICES.includes(count)?count:0;}
 function runChoiceStatus(value){const count=runChoice(value),daily=dailyStatus();return Object.freeze({count,valid:count>0,enabled:count>0&&daily.remaining>=count,used:daily.used,remaining:daily.remaining,limit:daily.limit});}
 function freshRuntime(){return {status:"idle",mode:null,requestedRuns:0,startedRuns:0,finishedRuns:0,fullClears:0,failedRuns:0,totalBasePoints:0,totalScaledPoints:0,totalAwardedPoints:0,stopRequested:false,stopReason:null,round:null,lastResult:null};}
 let arenaRuntime=freshRuntime();
 function cloneLineup(rows){return Array.isArray(rows)?rows.map(row=>({...row})):[];}
 function runtimeSnapshot(){const round=arenaRuntime.round;return {status:arenaRuntime.status,mode:arenaRuntime.mode,requestedRuns:arenaRuntime.requestedRuns,startedRuns:arenaRuntime.startedRuns,finishedRuns:arenaRuntime.finishedRuns,remainingSelectedRuns:Math.max(0,arenaRuntime.requestedRuns-arenaRuntime.startedRuns),fullClears:arenaRuntime.fullClears,failedRuns:arenaRuntime.failedRuns,totalBasePoints:arenaRuntime.totalBasePoints,totalScaledPoints:arenaRuntime.totalScaledPoints,totalAwardedPoints:arenaRuntime.totalAwardedPoints,stopRequested:arenaRuntime.stopRequested,stopReason:arenaRuntime.stopReason,daily:{...dailyStatus()},round:round?{index:round.index,stageIndex:round.stageIndex,level:round.level,startHp:round.startHp,currentHp:round.currentHp,roundBasePoints:round.roundBasePoints,roundScaledPoints:round.roundScaledPoints,lineup:cloneLineup(round.lineup),enemy:round.enemy?{...round.enemy}:null,history:round.history.map(row=>({...row,enemy:row.enemy?{...row.enemy}:null}))}:null,lastResult:arenaRuntime.lastResult?{...arenaRuntime.lastResult}:null};}
 function world3Active(gameState){return !!gameState?.thirdWorld?.entered&&(typeof window.arenaWorldForState!=="function"||window.arenaWorldForState(gameState)===WORLD);}
 function startSession(modeValue,runCount){
  const gameState=targetState(),selectedMode=mode(modeValue),choice=runChoiceStatus(runCount);
  if(!world3Active(gameState))return {ok:false,reason:"wrong-world",runtime:runtimeSnapshot()};
  if(!selectedMode)return {ok:false,reason:"invalid-mode",runtime:runtimeSnapshot()};
  if(!choice.valid)return {ok:false,reason:"invalid-run-count",runtime:runtimeSnapshot()};
  if(!choice.enabled)return {ok:false,reason:"insufficient-daily",runtime:runtimeSnapshot()};
  arenaRuntime={...freshRuntime(),status:"ready",mode:selectedMode.id,requestedRuns:choice.count};
  return {ok:true,runtime:runtimeSnapshot()};
 }
 function saveState(){if(typeof window.save==="function")window.save(false);}
 function fullHeal(gameState=targetState()){if(!gameState)return 0;if(typeof window.restorePlayerHp==="function")window.restorePlayerHp({save:false});else if(typeof window.playerCombatStats==="function")gameState.hp=Math.max(1,whole(window.playerCombatStats().hp,1));return Math.max(0,whole(gameState.hp,0));}
 function beginRound(options={}){
  const gameState=targetState();
  if(!world3Active(gameState))return {ok:false,reason:"wrong-world",runtime:runtimeSnapshot()};
  if(arenaRuntime.status!=="ready"&&arenaRuntime.status!=="between")return {ok:false,reason:"session-not-ready",runtime:runtimeSnapshot()};
  if(arenaRuntime.startedRuns>=arenaRuntime.requestedRuns)return {ok:false,reason:"selection-complete",runtime:runtimeSnapshot()};
  if(dailyStatus().remaining<=0)return {ok:false,reason:"daily-limit",runtime:runtimeSnapshot()};
  const rows=lineup(arenaRuntime.mode,{rng:options.rng,bossIndex:options.bossIndex,bossId:options.bossId});
  if(rows.length!==3)return {ok:false,reason:"lineup-unavailable",runtime:runtimeSnapshot()};
  const use=typeof window.consumeDailyDungeonUse==="function"?window.consumeDailyDungeonUse("arena",1):{ok:false,reason:"daily-core-missing"};
  if(!use.ok)return {ok:false,reason:use.reason||"daily-limit",runtime:runtimeSnapshot()};
  const level=rewardLevel(gameState.level),formalStats=typeof window.playerCombatStats==="function"?window.playerCombatStats():{},player=playerSnapshot(formalStats),runIndex=arenaRuntime.startedRuns;
  gameState.hp=Math.max(1,whole(player.hp,1));
  const firstEnemy=buildEnemy(rows[0].bossIndex,0,formalStats,level);
  arenaRuntime.startedRuns++;
  arenaRuntime.status="combat";
  arenaRuntime.round={index:runIndex,stageIndex:0,level,startHp:gameState.hp,currentHp:gameState.hp,formalStats:{...formalStats},player:{...player},lineup:cloneLineup(rows),enemy:firstEnemy,roundBasePoints:0,roundScaledPoints:0,history:[]};
  saveState();
  return {ok:true,enemy:firstEnemy?{...firstEnemy}:null,runtime:runtimeSnapshot()};
 }
 function currentEnemy(){return arenaRuntime.round?.enemy?{...arenaRuntime.round.enemy}:null;}
 function creditRound(round){
  const scaled=Math.max(0,whole(round?.roundScaledPoints,0));
  if(scaled<=0)return {baseAdded:0,added:0,points:Math.max(0,whole(targetState()?.vipPoints,0))};
  if(typeof window.addDungeonPoints==="function")return window.addDungeonPoints(scaled);
  return {baseAdded:scaled,added:scaled,points:Math.max(0,whole(targetState()?.vipPoints,0))+scaled};
 }
 function finishRound(result){
  const gameState=targetState(),round=arenaRuntime.round;if(!round)return {ok:false,reason:"no-active-round",runtime:runtimeSnapshot()};
  const clear=result?.type==="clear",awarded=creditRound(round),actual=Math.max(0,whole(awarded?.added,0));
  arenaRuntime.finishedRuns++;
  if(clear)arenaRuntime.fullClears++;else arenaRuntime.failedRuns++;
  arenaRuntime.totalBasePoints+=Math.max(0,whole(round.roundBasePoints,0));
  arenaRuntime.totalScaledPoints+=Math.max(0,whole(round.roundScaledPoints,0));
  arenaRuntime.totalAwardedPoints+=actual;
  arenaRuntime.lastResult={type:clear?"clear":"defeat",stageIndex:round.stageIndex,roundIndex:round.index,basePoints:round.roundBasePoints,scaledPoints:round.roundScaledPoints,awardedPoints:actual,history:round.history.map(row=>({...row})),daily:{...dailyStatus()}};
  fullHeal(gameState);
  arenaRuntime.round=null;
  if(arenaRuntime.stopRequested){arenaRuntime.status="stopped";arenaRuntime.stopReason="manual";}
  else if(arenaRuntime.startedRuns>=arenaRuntime.requestedRuns){arenaRuntime.status="complete";arenaRuntime.stopReason="selection-complete";}
  else if(dailyStatus().remaining<=0){arenaRuntime.status="complete";arenaRuntime.stopReason="daily-limit";}
  else{arenaRuntime.status="between";arenaRuntime.stopReason=null;}
  saveState();
  return {ok:true,result:{...arenaRuntime.lastResult},runtime:runtimeSnapshot()};
 }
 function settleStage(combat){
  const round=arenaRuntime.round,gameState=targetState();if(arenaRuntime.status!=="combat"||!round)return {ok:false,reason:"no-active-round",runtime:runtimeSnapshot()};
  const stageIndex=round.stageIndex,win=combat?.win===true,endHp=Math.max(0,whole(combat?.combatEndHp??combat?.hp??gameState?.hp,gameState?.hp||0));
  if(gameState)gameState.hp=endHp;round.currentHp=endHp;
  const reward=win?stageReward(stageIndex,round.level):null;
  if(reward){round.roundBasePoints+=reward.basePoints;round.roundScaledPoints+=reward.scaledPoints;}
  round.history.push({stageIndex,win,startHp:Math.max(0,whole(combat?.startHp,0)),endHp,turns:Math.max(0,whole(combat?.turns,0)),basePoints:reward?.basePoints||0,scaledPoints:reward?.scaledPoints||0,enemy:round.enemy?{...round.enemy}:null});
  if(!win)return finishRound({type:"defeat"});
  if(stageIndex>=2)return finishRound({type:"clear"});
  round.stageIndex=stageIndex+1;
  const next=round.lineup[round.stageIndex],enemy=buildEnemy(next?.bossIndex,round.stageIndex,round.formalStats,round.level);
  round.enemy=enemy;
  saveState();
  return {ok:true,advanced:true,enemy:enemy?{...enemy}:null,runtime:runtimeSnapshot()};
 }
 function fightCurrentStage(options={}){
  const round=arenaRuntime.round,gameState=targetState();if(arenaRuntime.status!=="combat"||!round||!round.enemy)return {ok:false,reason:"no-active-round",runtime:runtimeSnapshot()};
  if(typeof window.runCombatCore!=="function")return {ok:false,reason:"combat-core-missing",runtime:runtimeSnapshot()};
  const startHp=Math.max(0,whole(gameState?.hp,round.currentHp)),enemy=round.enemy,baseOptions=combatOptions(enemy,gameState),combat=window.runCombatCore(round.player,enemy,startHp,{...baseOptions,rng:options.rng,maxTurns:options.maxTurns,maxActions:options.maxActions,maxActionsPerChain:options.maxActionsPerChain});
  if(gameState)gameState.hp=combat.hp;
  return settleStage({win:combat.win,combatEndHp:combat.hp,startHp,turns:combat.turns,logs:combat.logs,events:combat.events});
 }
 function requestStop(){if(arenaRuntime.status==="combat"){arenaRuntime.stopRequested=true;return {ok:true,pending:true,runtime:runtimeSnapshot()};}if(arenaRuntime.status==="between"||arenaRuntime.status==="ready"){arenaRuntime.status="stopped";arenaRuntime.stopRequested=true;arenaRuntime.stopReason="manual";return {ok:true,pending:false,runtime:runtimeSnapshot()};}return {ok:false,reason:"not-running",runtime:runtimeSnapshot()};}
 function resetRuntime(){arenaRuntime=freshRuntime();return runtimeSnapshot();}
 function integrity(){
  const errors=[];const fail=(code,data=null)=>errors.push({code,data});
  try{
   const rows=bosses();if(rows.length!==10)fail("boss-count",rows.length);
   const expected=[[.99,.9405,1.287],[1.1385,1.056,1.320],[1.287,1.2045,1.353]];
   STAGE_PROFILE.forEach((row,index)=>{const e=expected[index];if(row.hpMul!==e[0]||row.damageMul!==e[1]||row.defMul!==e[2])fail("stage-profile",{index,row});});
   const fixed=lineup("fixed",{bossIndex:2});if(fixed.length!==3||new Set(fixed.map(row=>row.bossId)).size!==1||fixed[0]?.bossIndex!==2)fail("fixed-lineup",fixed);
   let seed=0;const varied=lineup("varied",{rng:()=>((seed++*.271)%1)});if(varied.length!==3||new Set(varied.map(row=>row.bossId)).size!==3)fail("varied-lineup",varied);
   const r1000=roundReward(1000),r1100=roundReward(1100),r2000=roundReward(2000);
   if(r1000.scaledPoints!==1500||r1000.stages.map(row=>row.scaledPoints).join(",")!=="300,400,800")fail("reward-1000",r1000);
   if(r1100.scaledPoints!==1575||r1100.stages.map(row=>row.scaledPoints).join(",")!=="315,420,840")fail("reward-1100",r1100);
   if(r2000.scaledPoints!==2250||r2000.stages.map(row=>row.scaledPoints).join(",")!=="450,600,1200")fail("reward-2000",r2000);
   if(RUN_CHOICES.join(",")!=="1,5,10,20")fail("run-choices",RUN_CHOICES);
   const sample={hp:49560,atk:13066,def:6082,crit:35.3,dodge:25.3};
   if(rows.length===10&&typeof window.specialBaseEnemyFromPlayer==="function"&&typeof window.createSpecialPlayerSnapshot==="function"){
    const attack=buildEnemy(0,2,sample,1000),defense=buildEnemy(1,2,sample,1000),critical=buildEnemy(2,2,sample,1000),dodger=buildEnemy(3,2,sample,1000),combo=buildEnemy(4,2,sample,1000),penetration=buildEnemy(5,2,sample,1000),counter=buildEnemy(6,2,sample,1000),drain=buildEnemy(7,2,sample,1000),initiative=buildEnemy(8,2,sample,1000),origin=buildEnemy(9,2,sample,1000);
    const plainPlayer=playerSnapshot(sample),base=window.specialBaseEnemyFromPlayer(plainPlayer),plainAtk=Math.ceil(base.damage*STAGE_PROFILE[2].damageMul+plainPlayer.def*.55),plainDef=Math.ceil(base.def*STAGE_PROFILE[2].defMul);
    if(attack?.atk!==Math.ceil(plainAtk*1.15))fail("attack-specialization",{actual:attack?.atk,expected:Math.ceil(plainAtk*1.15)});
    if(defense?.def!==Math.ceil(plainDef*1.15))fail("defense-specialization",{actual:defense?.def,expected:Math.ceil(plainDef*1.15)});
    if(critical?.crit!==41.3)fail("crit-no-cap",critical?.crit);
    if(dodger?.dodge!==31.3)fail("dodge-no-cap",dodger?.dodge);
    if(combo?.enemyAbilityProfile?.comboRate!==10||Object.values(combo?.enemyAbilityProfile||{}).filter(Boolean).length!==1)fail("combo-profile",combo?.enemyAbilityProfile);
    if(penetration?.enemyAbilityProfile?.penetrationRate!==10)fail("penetration-profile",penetration?.enemyAbilityProfile);
    if(counter?.enemyAbilityProfile?.counterRate!==10)fail("counter-profile",counter?.enemyAbilityProfile);
    if(drain?.enemyAbilityProfile?.drainRate!==10)fail("drain-profile",drain?.enemyAbilityProfile);
    if(initiative?.enemyAbilityProfile?.initiativeBonusPercent!==20)fail("initiative-profile",initiative?.enemyAbilityProfile);
    if(origin?.atk!==Math.ceil(plainAtk*1.08)||origin?.def!==Math.ceil(plainDef*1.08))fail("origin-specialization",{atk:origin?.atk,def:origin?.def});
    [attack,defense,critical,dodger,combo,penetration,counter,drain,initiative,origin].forEach((enemy,index)=>{if(!enemy?.name?.startsWith("高維投影·"))fail("projection-name",{index,name:enemy?.name});if(Array.isArray(enemy?.traits)&&enemy.traits.length)fail("generic-traits",{index,traits:enemy.traits});if(enemy?.enemyEffects||enemy?.abilities)fail("forbidden-mainline-effects",{index});});
   }
   if(typeof window.arenaWorldForState==="function"&&window.arenaWorldForState({secondWorld:{entered:true},thirdWorld:{entered:true}})!==3)fail("world-owner",window.arenaWorldForState({secondWorld:{entered:true},thirdWorld:{entered:true}}));
   if(typeof window.getArenaProgressForWorld==="function"){
    const sampleState={secondWorld:{entered:true},thirdWorld:{entered:true},dungeon:{}};
    if(window.getArenaProgressForWorld(3,sampleState)!==null)fail("world3-rank-state",window.getArenaProgressForWorld(3,sampleState));
   }
  }catch(error){fail("exception",String(error?.message||error));}
  return Object.freeze({version:2,passed:errors.length===0,errors:Object.freeze(errors.slice()),checkedAt:Date.now()});
 }
 window.THIRD_WORLD_ARENA_CORE_VERSION=CORE_VERSION;
 window.THIRD_WORLD_ARENA_PROJECTION_VERSION=PROJECTION_VERSION;
 window.THIRD_WORLD_ARENA_LINEUP_VERSION=LINEUP_VERSION;
 window.THIRD_WORLD_ARENA_BALANCE_VERSION=BALANCE_VERSION;
 window.THIRD_WORLD_ARENA_FLOW_VERSION=FLOW_VERSION;
 window.THIRD_WORLD_ARENA_REWARD_VERSION=REWARD_VERSION;
 window.THIRD_WORLD_ARENA_DAILY_VERSION=DAILY_VERSION;
 window.THIRD_WORLD_ARENA_WORLD=WORLD;
 window.THIRD_WORLD_ARENA_MODES=MODE_DEFS;
 window.THIRD_WORLD_ARENA_STAGE_PROFILE=STAGE_PROFILE;
 window.THIRD_WORLD_ARENA_RUN_CHOICES=RUN_CHOICES;
 window.THIRD_WORLD_ARENA_STAGE_BASE_POINTS=STAGE_BASE_POINTS;
 window.getThirdWorldArenaMode=function(value){const row=mode(value);return row?{...row}:null;};
 window.getThirdWorldArenaStageProfile=stageProfile;
 window.getThirdWorldArenaProjectionName=projectionName;
 window.getThirdWorldArenaProjectionPresentation=projectionPresentation;
 window.rollThirdWorldArenaLineup=lineup;
 window.getThirdWorldArenaEnemyAbilityProfile=function(value){return {...enemyAbilityProfile(value)};};
 window.createThirdWorldArenaPlayerSnapshot=playerSnapshot;
 window.buildThirdWorldArenaEnemy=buildEnemy;
 window.getThirdWorldArenaCombatOptions=combatOptions;
 window.getThirdWorldArenaRewardMultiplier=rewardMultiplier;
 window.getThirdWorldArenaStageReward=stageReward;
 window.getThirdWorldArenaRoundReward=roundReward;
 window.getThirdWorldArenaRewardPreview=rewardPreview;
 window.getThirdWorldArenaDailyStatus=dailyStatus;
 window.getThirdWorldArenaRunChoiceStatus=runChoiceStatus;
 window.startThirdWorldArenaSession=startSession;
 window.beginThirdWorldArenaRound=beginRound;
 window.getThirdWorldArenaCurrentEnemy=currentEnemy;
 window.fightThirdWorldArenaCurrentStage=fightCurrentStage;
 window.settleThirdWorldArenaStage=settleStage;
 window.requestThirdWorldArenaStop=requestStop;
 window.getThirdWorldArenaRuntimeState=runtimeSnapshot;
 window.resetThirdWorldArenaRuntime=resetRuntime;
 window.runThirdWorldArenaCoreIntegrity=integrity;
 window.THIRD_WORLD_ARENA_CORE_INTEGRITY_VERSION=2;
})();