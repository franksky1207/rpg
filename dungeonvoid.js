(function(){
 const VOID_MIRAGE_NAME="虛空幻境";
 const VOID_MIRAGE_UNLOCK_LEVEL=25;
 const VOID_MIRAGE_BASE_CRIT=10;
 const VOID_MIRAGE_BASE_DODGE=8;
 const VOID_MIRAGE_HP_MULTIPLIER=2.40;
 const VOID_MIRAGE_ATK_MULTIPLIER=2.15;
 const VOID_MIRAGE_DEF_MULTIPLIER=2.65;

 const VOID_MIRAGE_REGULAR_NAMES=[
  "虛影獵手","幻境遊魂","裂隙行者","異相戰影","迷界殘像",
  "虛空獵兵","幻域追獵者","失真戰體","空間殘響","幻象執行者"
 ];
 const VOID_MIRAGE_BOSS_NAMES=[
  "幻境獵王","虛影統領","裂隙霸主","異相主宰","幻域支配者",
  "虛空夢魘","裂界災厄","失真君王","虛境帝皇","虛無終焉者"
 ];

 let lastRegularName="";
 let voidMirageRun=null;

 function floorNumber(value){return Math.max(1,Math.floor(Number(value)||1));}
 function finiteNonNegative(value,fallback=0){const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;}
 function normalizeVoidMirageState(target){
  if(!target||typeof target!=="object")return null;
  if(!target.dungeon||typeof target.dungeon!=="object")target.dungeon={progress:0,attempts:0,points:0};
  if(!target.dungeon.voidMirage||typeof target.dungeon.voidMirage!=="object")target.dungeon.voidMirage={};
  target.dungeon.voidMirage.highestCleared=Math.floor(finiteNonNegative(target.dungeon.voidMirage.highestCleared,0));
  return target.dungeon.voidMirage;
 }
 function equivalentPower(floor){return 24+floorNumber(floor)/10;}
 function baseStats(floor){
  const f=floorNumber(floor),e=equivalentPower(f);
  return {floor:f,equivalentPower:e,hp:Math.max(1,Math.ceil((62+16.2*e)*VOID_MIRAGE_HP_MULTIPLIER)),atk:Math.max(1,Math.ceil((10.5+2.45*e)*VOID_MIRAGE_ATK_MULTIPLIER)),def:Math.max(0,Math.ceil((3.2+0.92*e)*VOID_MIRAGE_DEF_MULTIPLIER)),crit:VOID_MIRAGE_BASE_CRIT,dodge:VOID_MIRAGE_BASE_DODGE};
 }
 function isBossFloor(floor){return floorNumber(floor)%10===0;}
 function bossNameForFloor(floor){
  const f=floorNumber(floor);if(!isBossFloor(f))return "";
  const withinCycle=((f-1)%100)+1;return VOID_MIRAGE_BOSS_NAMES[Math.floor((withinCycle-1)/10)];
 }
 function regularName(previousName=""){
  const blocked=String(previousName||lastRegularName||"");
  const pool=VOID_MIRAGE_REGULAR_NAMES.filter(name=>name!==blocked),names=pool.length?pool:VOID_MIRAGE_REGULAR_NAMES;
  const name=names[Math.floor(Math.random()*names.length)];lastRegularName=name;return name;
 }
 function rollTraits(floor){
  const pool=MONSTER_TRAIT_IDS.slice(),out=[],count=isBossFloor(floor)?2:1;
  for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
 }
 function firstClearPoints(floor){
  const f=floorNumber(floor);let points=Math.round(15+1.75*Math.sqrt(Math.max(0,f-1)));if(isBossFloor(f))points*=2;return points;
 }
 function buildEnemy(floor,options={}){
  const f=floorNumber(floor),boss=isBossFloor(floor),base=baseStats(f);
  const name=boss?bossNameForFloor(f):regularName(options.previousName);
  const ids=Array.isArray(options.traits)?options.traits.slice(0,boss?2:1):rollTraits(f);
  return applyMonsterTraits({name,floor:f,kind:"dungeon-void-mirage",isBossFloor:boss,...base,baseCrit:VOID_MIRAGE_BASE_CRIT,baseDodge:VOID_MIRAGE_BASE_DODGE,firstClearPoints:firstClearPoints(f)},ids);
 }
 function currentDungeon(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState();
  if(!state.dungeon||typeof state.dungeon!=="object")state.dungeon={progress:0,attempts:0,points:0};
  return state.dungeon;
 }
 function fullHeal(){state.hp=equippedStats().hp;}
 function runPlayerStats(){return voidMirageRun?.playerSnapshot||createSpecialPlayerSnapshot(equippedStats());}
 function runFullHeal(){state.hp=runPlayerStats().hp;}
 function voidMirageFightCore(enemy){
  if(!enemy||typeof enemy!=="object")return {win:false,invalid:true,logs:[],e:enemy||null,combatEndHp:state.hp,turns:0};
  const combat=runCombatCore(runPlayerStats(),enemy,state.hp);
  state.hp=combat.hp;
  return {win:combat.win,logs:combat.logs,e:enemy,combatEndHp:state.hp,turns:combat.turns};
 }
 function runSnapshot(){
  if(!voidMirageRun)return null;
  return {active:!!voidMirageRun.active,phase:voidMirageRun.phase,startFloor:voidMirageRun.startFloor,currentFloor:voidMirageRun.currentFloor,lastClearedFloor:voidMirageRun.lastClearedFloor,cleared:voidMirageRun.cleared,points:voidMirageRun.points,totalTurns:voidMirageRun.totalTurns,averageTurns:voidMirageRun.cleared?round1(voidMirageRun.totalTurns/voidMirageRun.cleared):0,exitRequested:!!voidMirageRun.exitRequested,endedReason:voidMirageRun.endedReason||"",failedFloor:voidMirageRun.failedFloor||0,runStarted:!!voidMirageRun.runStarted,playerSnapshot:voidMirageRun.playerSnapshot?{...voidMirageRun.playerSnapshot}:null,lastEnemy:voidMirageRun.lastEnemy?{...voidMirageRun.lastEnemy,traits:(voidMirageRun.lastEnemy.traits||[]).slice()}:null,lastResult:voidMirageRun.lastResult?{...voidMirageRun.lastResult,logs:(voidMirageRun.lastResult.logs||[]).slice()}:null};
 }
 function finishRun(reason,extra={}){
  if(!voidMirageRun)return null;
  voidMirageRun.active=false;voidMirageRun.phase="ended";voidMirageRun.endedReason=String(reason||"ended");
  if(extra.failedFloor)voidMirageRun.failedFloor=floorNumber(extra.failedFloor);
  if(voidMirageRun.runStarted){
   if(typeof finishDungeonRun==="function")finishDungeonRun();
   else{fullHeal();if(typeof save==="function")save(false);}
  }else if(typeof save==="function")save(false);
  return runSnapshot();
 }
 function recordClearAndPoints(floor){
  const s=normalizeVoidMirageState(state),f=floorNumber(floor);if(!s)return {advanced:false,highestCleared:0,nextFloor:1,gained:0};
  const before=s.highestCleared;let gained=0;
  if(f===before+1){s.highestCleared=f;gained=firstClearPoints(f);if(typeof addDungeonPoints==="function")addDungeonPoints(gained);else currentDungeon().points=Math.floor(finiteNonNegative(currentDungeon().points,0))+gained;}
  if(typeof save==="function")save(false);
  return {advanced:s.highestCleared>before,highestCleared:s.highestCleared,nextFloor:s.highestCleared+1,gained};
 }
 const yieldControl=()=>new Promise(resolve=>setTimeout(resolve,0));

 window.VOID_MIRAGE_NAME=VOID_MIRAGE_NAME;
 window.VOID_MIRAGE_UNLOCK_LEVEL=VOID_MIRAGE_UNLOCK_LEVEL;
 window.getVoidMirageConfig=function(){return {name:VOID_MIRAGE_NAME,unlockLevel:VOID_MIRAGE_UNLOCK_LEVEL,baseCrit:VOID_MIRAGE_BASE_CRIT,baseDodge:VOID_MIRAGE_BASE_DODGE,hpMultiplier:VOID_MIRAGE_HP_MULTIPLIER,atkMultiplier:VOID_MIRAGE_ATK_MULTIPLIER,defMultiplier:VOID_MIRAGE_DEF_MULTIPLIER,regularNames:VOID_MIRAGE_REGULAR_NAMES.slice(),bossNames:VOID_MIRAGE_BOSS_NAMES.slice()};};
 window.ensureVoidMirageState=function(){return normalizeVoidMirageState(state);};
 window.canEnterVoidMirage=function(){return Number(state?.level||0)>=VOID_MIRAGE_UNLOCK_LEVEL;};
 window.voidMirageEquivalentPower=equivalentPower;
 window.voidMirageBaseStats=baseStats;
 window.isVoidMirageBossFloor=isBossFloor;
 window.voidMirageBossNameForFloor=bossNameForFloor;
 window.rollVoidMirageTraits=rollTraits;
 window.voidMirageFirstClearPoints=firstClearPoints;
 window.buildVoidMirageEnemy=buildEnemy;
 window.getVoidMirageNextFloor=function(){const s=normalizeVoidMirageState(state);return Math.max(1,(s?.highestCleared||0)+1);};
 window.recordVoidMirageClear=function(floor){const r=recordClearAndPoints(floor);return {highestCleared:r.highestCleared,nextFloor:r.nextFloor,advanced:r.advanced,gained:r.gained};};

 window.beginVoidMirageRun=function(){
  if(Number(state?.level||0)<VOID_MIRAGE_UNLOCK_LEVEL)return {ok:false,reason:"level_locked",unlockLevel:VOID_MIRAGE_UNLOCK_LEVEL};
  if(voidMirageRun?.active)return {ok:false,reason:"already_active",run:runSnapshot()};
  if(typeof beginDungeonRun!=="function"||typeof canStartDungeonRun!=="function")return {ok:false,reason:"dungeon_core_missing"};
  if(!canStartDungeonRun(1))return {ok:false,reason:"insufficient_attempts",cost:1,attempts:currentDungeon().attempts};
  const startFloor=window.getVoidMirageNextFloor();
  voidMirageRun={active:true,phase:"ready",startFloor,currentFloor:startFloor,lastClearedFloor:startFloor-1,cleared:0,points:0,totalTurns:0,exitRequested:false,endedReason:"",failedFloor:0,lastEnemy:null,lastResult:null,previousRegularName:lastRegularName||"",playerSnapshot:null,runStarted:false};
  if(typeof save==="function")save(false);
  return {ok:true,run:runSnapshot(),attempts:currentDungeon().attempts,points:currentDungeon().points};
 };

 window.requestVoidMirageExit=function(){
  if(!voidMirageRun?.active)return {ok:false,reason:"no_active_run",run:runSnapshot()};
  voidMirageRun.exitRequested=true;
  if(voidMirageRun.phase!=="fighting")return {ok:true,ended:true,run:finishRun("exit")};
  return {ok:true,ended:false,run:runSnapshot()};
 };

 window.fightNextVoidMirageFloor=function(){
  if(!voidMirageRun?.active)return {ok:false,reason:"no_active_run",run:runSnapshot()};
  if(voidMirageRun.exitRequested&&voidMirageRun.phase!=="fighting")return {ok:true,ended:true,run:finishRun("exit")};
  if(!voidMirageRun.runStarted){
   const player=createSpecialPlayerSnapshot(equippedStats());
   const started=beginDungeonRun({mode:"void-mirage",cost:1});
   if(!started.ok){voidMirageRun.active=false;voidMirageRun.phase="ended";voidMirageRun.endedReason=started.reason||"start_failed";if(typeof save==="function")save(false);return {ok:false,...started,run:runSnapshot()};}
   voidMirageRun.playerSnapshot=player;
   voidMirageRun.runStarted=true;
  }
  const floor=voidMirageRun.currentFloor;runFullHeal();
  const playerMaxHp=runPlayerStats().hp,enemy=buildEnemy(floor,{previousName:voidMirageRun.previousRegularName});
  if(!enemy.isBossFloor)voidMirageRun.previousRegularName=enemy.name;
  voidMirageRun.phase="fighting";voidMirageRun.lastEnemy=enemy;
  const result=voidMirageFightCore(enemy);
  voidMirageRun.lastResult=result;voidMirageRun.totalTurns+=Math.max(0,Math.floor(Number(result.turns)||0));
  if(!result.win){const reason="defeat",final=finishRun(reason,{failedFloor:floor});return {ok:true,win:false,ended:true,reason,floor,enemy,result,playerMaxHp,gained:0,run:final};}
  const clear=recordClearAndPoints(floor);
  voidMirageRun.cleared+=clear.advanced?1:0;voidMirageRun.points+=clear.gained;voidMirageRun.lastClearedFloor=floor;voidMirageRun.currentFloor=clear.nextFloor;voidMirageRun.phase="between";runFullHeal();
  if(typeof save==="function")save(false);
  if(voidMirageRun.exitRequested){const final=finishRun("exit");return {ok:true,win:true,ended:true,reason:"exit",floor,enemy,result,playerMaxHp,gained:clear.gained,run:final};}
  return {ok:true,win:true,ended:false,floor,enemy,result,playerMaxHp,gained:clear.gained,run:runSnapshot()};
 };

 window.runVoidMirageAuto=async function(options={}){
  if(!voidMirageRun?.active){const started=window.beginVoidMirageRun();if(!started.ok)return started;}
  const onFloor=typeof options.onFloorComplete==="function"?options.onFloorComplete:null,onEnd=typeof options.onEnd==="function"?options.onEnd:null;
  while(voidMirageRun?.active){
   if(voidMirageRun.exitRequested&&voidMirageRun.phase!=="fighting"){const ended=finishRun("exit");if(onEnd)await onEnd(ended);return {ok:true,ended:true,run:ended};}
   const floorResult=window.fightNextVoidMirageFloor();
   if(!floorResult.ok){if(onEnd)await onEnd(floorResult.run);return floorResult;}
   if(onFloor)await onFloor(floorResult);
   if(floorResult.ended){if(onEnd)await onEnd(floorResult.run);return {ok:true,ended:true,result:floorResult,run:floorResult.run};}
   await yieldControl();
  }
  const snapshot=runSnapshot();if(onEnd)await onEnd(snapshot);return {ok:true,ended:true,run:snapshot};
 };

 window.getVoidMirageRunSnapshot=runSnapshot;
 if(typeof state!=="undefined"&&state){normalizeVoidMirageState(state);if(typeof save==="function")save(false);}
})();