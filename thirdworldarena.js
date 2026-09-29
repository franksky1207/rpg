(function(){
 const CORE_VERSION=1;
 const PROJECTION_VERSION=1;
 const LINEUP_VERSION=1;
 const BALANCE_VERSION=1;
 const WORLD=3;
 const MIN_LEVEL=1000;
 const MAX_LEVEL=2000;
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
   level:clamp(whole(level??(typeof state!=="undefined"?state?.level:MIN_LEVEL),MIN_LEVEL),MIN_LEVEL,MAX_LEVEL),
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
 function combatOptions(enemy,targetState=null){
  let gameState=targetState;
  if(!gameState){try{gameState=typeof state!=="undefined"?state:null;}catch(e){gameState=null;}}
  const finalDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:WORLD,state:gameState}):1;
  return {playerFinalDamageMultiplier:Math.max(0,finite(finalDamageMultiplier,1)),enemyAbilityProfile:enemy?.enemyAbilityProfile||enemy?.arenaAbilityProfile||enemyAbilityProfile(enemy?.higherDimensionalBossIndex),enemyEffectProfile:{}};
 }
 function integrity(){
  const errors=[];const fail=(code,data=null)=>errors.push({code,data});
  try{
   const rows=bosses();if(rows.length!==10)fail("boss-count",rows.length);
   const expected=[[.99,.9405,1.287],[1.1385,1.056,1.320],[1.287,1.2045,1.353]];
   STAGE_PROFILE.forEach((row,index)=>{const e=expected[index];if(row.hpMul!==e[0]||row.damageMul!==e[1]||row.defMul!==e[2])fail("stage-profile",{index,row});});
   const fixed=lineup("fixed",{bossIndex:2});if(fixed.length!==3||new Set(fixed.map(row=>row.bossId)).size!==1||fixed[0]?.bossIndex!==2)fail("fixed-lineup",fixed);
   let seed=0;const varied=lineup("varied",{rng:()=>((seed++*.271)%1)});if(varied.length!==3||new Set(varied.map(row=>row.bossId)).size!==3)fail("varied-lineup",varied);
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
  return Object.freeze({version:1,passed:errors.length===0,errors:Object.freeze(errors.slice()),checkedAt:Date.now()});
 }
 window.THIRD_WORLD_ARENA_CORE_VERSION=CORE_VERSION;
 window.THIRD_WORLD_ARENA_PROJECTION_VERSION=PROJECTION_VERSION;
 window.THIRD_WORLD_ARENA_LINEUP_VERSION=LINEUP_VERSION;
 window.THIRD_WORLD_ARENA_BALANCE_VERSION=BALANCE_VERSION;
 window.THIRD_WORLD_ARENA_WORLD=WORLD;
 window.THIRD_WORLD_ARENA_MODES=MODE_DEFS;
 window.THIRD_WORLD_ARENA_STAGE_PROFILE=STAGE_PROFILE;
 window.getThirdWorldArenaMode=function(value){const row=mode(value);return row?{...row}:null;};
 window.getThirdWorldArenaStageProfile=stageProfile;
 window.getThirdWorldArenaProjectionName=projectionName;
 window.getThirdWorldArenaProjectionPresentation=projectionPresentation;
 window.rollThirdWorldArenaLineup=lineup;
 window.getThirdWorldArenaEnemyAbilityProfile=function(value){return {...enemyAbilityProfile(value)};};
 window.createThirdWorldArenaPlayerSnapshot=playerSnapshot;
 window.buildThirdWorldArenaEnemy=buildEnemy;
 window.getThirdWorldArenaCombatOptions=combatOptions;
 window.runThirdWorldArenaCoreIntegrity=integrity;
 window.THIRD_WORLD_ARENA_CORE_INTEGRITY_VERSION=1;
})();
