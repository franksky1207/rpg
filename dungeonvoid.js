(function(){
 const VOID_MIRAGE_NAME="虛空幻境";
 const VOID_MIRAGE_UNLOCK_LEVEL=25;
 const VOID_MIRAGE_BASE_CRIT=10;
 const VOID_MIRAGE_BASE_DODGE=8;
 const VOID_MIRAGE_HP_BASE=100.0;
 const VOID_MIRAGE_HP_PER_FLOOR=9.6;
 const VOID_MIRAGE_ATK_BASE=10.0;
 const VOID_MIRAGE_ATK_PER_FLOOR=1.3;
 const VOID_MIRAGE_DEF_BASE=5.0;
 const VOID_MIRAGE_DEF_PER_FLOOR=0.6;
 const VOID_MIRAGE_START_OFFSET=100;

 const VOID_MIRAGE_REGULAR_NAMES=[
  "虛影獵手","幻境遊魂","裂隙行者","異相戰影","迷界殘像",
  "虛空獵兵","幻域追獵者","失真戰體","空間殘響","幻象執行者"
 ];
 const VOID_MIRAGE_BOSS_NAMES=[
  "幻境獵王","虛影統領","裂隙霸主","異相主宰","幻域支配者",
  "虛空夢魘","裂界災厄","失真君王","虛境帝皇","虛無終焉者"
 ];

 let voidMirageRun=null;

 function floorNumber(value){return Math.max(1,Math.floor(Number(value)||1));}
 function finiteNonNegative(value,fallback=0){const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;}
 function cloneVoidSnapshotValue(value,seen=new WeakMap()){
  if(value===null||typeof value!=="object")return value;
  if(seen.has(value))return seen.get(value);
  const out=Array.isArray(value)?[]:{};
  seen.set(value,out);
  Object.keys(value).forEach(key=>{out[key]=cloneVoidSnapshotValue(value[key],seen);});
  return out;
 }
 function normalizeVoidMirageState(target){
  if(!target||typeof target!=="object")return null;
  if(!target.dungeon||typeof target.dungeon!=="object")target.dungeon={};
  if(!target.dungeon.voidMirage||typeof target.dungeon.voidMirage!=="object"||Array.isArray(target.dungeon.voidMirage))target.dungeon.voidMirage={};
  target.dungeon.voidMirage.highestCleared=Math.max(0,Math.floor(finiteNonNegative(target.dungeon.voidMirage.highestCleared,0)));
  return target.dungeon.voidMirage;
 }
 function historicalHighest(){const s=normalizeVoidMirageState(state);return Math.max(0,Math.floor(Number(s?.highestCleared)||0));}
 function startFloorFromHistory(highest=historicalHighest()){
  const h=Math.max(0,Math.floor(Number(highest)||0));
  return Math.max(1,h-VOID_MIRAGE_START_OFFSET);
 }
 function baseStats(floor){
  const f=floorNumber(floor);
  return {
   floor:f,
   hp:Math.max(1,Math.ceil(VOID_MIRAGE_HP_BASE+VOID_MIRAGE_HP_PER_FLOOR*f)),
   atk:Math.max(1,Math.ceil(VOID_MIRAGE_ATK_BASE+VOID_MIRAGE_ATK_PER_FLOOR*f)),
   def:Math.max(0,Math.ceil(VOID_MIRAGE_DEF_BASE+VOID_MIRAGE_DEF_PER_FLOOR*f)),
   crit:VOID_MIRAGE_BASE_CRIT,
   dodge:VOID_MIRAGE_BASE_DODGE
  };
 }
 function isBossFloor(floor){return floorNumber(floor)%10===0;}
 function bossNameForFloor(floor){
  const f=floorNumber(floor);if(!isBossFloor(f))return "";
  const withinCycle=((f-1)%100)+1;return VOID_MIRAGE_BOSS_NAMES[Math.floor((withinCycle-1)/10)];
 }
 function regularName(previousName=""){
  const blocked=String(previousName||"");
  const pool=VOID_MIRAGE_REGULAR_NAMES.filter(name=>name!==blocked),names=pool.length?pool:VOID_MIRAGE_REGULAR_NAMES;
  return names[Math.floor(Math.random()*names.length)];
 }
 function rollTraits(floor){
  const pool=MONSTER_TRAIT_IDS.slice(),out=[],count=isBossFloor(floor)?2:1;
  for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
 }
 function buildEnemy(floor,options={}){
  const f=floorNumber(floor),boss=isBossFloor(f),base=baseStats(f);
  const name=boss?bossNameForFloor(f):regularName(options.previousName);
  const ids=Array.isArray(options.traits)?options.traits.slice(0,boss?2:1):rollTraits(f);
  return applyMonsterTraits({name,floor:f,kind:"dungeon-void-mirage",isBossFloor:boss,...base,baseCrit:VOID_MIRAGE_BASE_CRIT,baseDodge:VOID_MIRAGE_BASE_DODGE},ids);
 }
 function fullHeal(){state.hp=playerCombatStats().hp;}
 function runPlayerStats(){return voidMirageRun?.playerSnapshot||createSpecialPlayerSnapshot(playerCombatStats());}
 function runFullHeal(){state.hp=runPlayerStats().hp;}
 function voidMirageFightCore(enemy,options={}){
  if(!enemy||typeof enemy!=="object")return {win:false,invalid:true,logs:[],e:enemy||null,combatEndHp:state.hp,turns:0};
  const civilizationMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(state)===true?2:1,state}):1;
  const combat=runCombatCore(runPlayerStats(),enemy,state.hp,{
   logs:options.logs===false?false:true,
   preparePresentation:options.preparePresentation!==false,
   playerFinalDamageMultiplier:civilizationMultiplier
  });
  state.hp=combat.hp;
  return {win:combat.win,logs:combat.logs,events:Array.isArray(combat.events)?combat.events:[],e:enemy,combatEndHp:state.hp,turns:combat.turns,civilizationDamageMultiplier};
 }
 function dailyStatus(){return typeof voidMirageDailyStatus==="function"?voidMirageDailyStatus():{highestFloor:0,claimed:false,baseReward:0,reward:0,canClaim:false};}
 function runSnapshot(){
  if(!voidMirageRun)return null;
  const daily=dailyStatus();
  return {active:!!voidMirageRun.active,phase:voidMirageRun.phase,startFloor:voidMirageRun.startFloor,currentFloor:voidMirageRun.currentFloor,lastClearedFloor:voidMirageRun.lastClearedFloor,cleared:voidMirageRun.cleared,totalTurns:voidMirageRun.totalTurns,averageTurns:voidMirageRun.cleared?round1(voidMirageRun.totalTurns/voidMirageRun.cleared):0,exitRequested:!!voidMirageRun.exitRequested,endedReason:voidMirageRun.endedReason||"",failedFloor:voidMirageRun.failedFloor||0,runStarted:!!voidMirageRun.runStarted,playerSnapshot:cloneVoidSnapshotValue(voidMirageRun.playerSnapshot),lastEnemy:cloneVoidSnapshotValue(voidMirageRun.lastEnemy),lastResult:cloneVoidSnapshotValue(voidMirageRun.lastResult),historicalHighest:historicalHighest(),dailyHighest:daily.highestFloor||0,dailyClaimed:daily.claimed===true,dailyReward:daily.reward||0};
 }
 function finishRun(reason,extra={}){
  if(!voidMirageRun)return null;
  voidMirageRun.active=false;voidMirageRun.phase="ended";voidMirageRun.endedReason=String(reason||"ended");
  if(extra.failedFloor)voidMirageRun.failedFloor=floorNumber(extra.failedFloor);
  if(voidMirageRun.runStarted)fullHeal();
  if(typeof save==="function")save(false);
  return runSnapshot();
 }
 function recordClear(floor){
  const s=normalizeVoidMirageState(state),f=floorNumber(floor);if(!s)return {advanced:false,highestCleared:0,nextFloor:1,dailyHighest:0};
  const before=s.highestCleared;
  if(f>before)s.highestCleared=f;
  const daily=typeof recordVoidMirageDailyFloor==="function"?recordVoidMirageDailyFloor(f):dailyStatus();
  return {advanced:s.highestCleared>before,highestCleared:s.highestCleared,nextFloor:f+1,dailyHighest:daily.highestFloor||0};
 }
 const yieldControl=()=>new Promise(resolve=>setTimeout(resolve,0));

 window.VOID_MIRAGE_NAME=VOID_MIRAGE_NAME;
 window.VOID_MIRAGE_UNLOCK_LEVEL=VOID_MIRAGE_UNLOCK_LEVEL;
 window.VOID_MIRAGE_START_OFFSET=VOID_MIRAGE_START_OFFSET;
 window.getVoidMirageConfig=function(){return {
  name:VOID_MIRAGE_NAME,
  unlockLevel:VOID_MIRAGE_UNLOCK_LEVEL,
  startOffset:VOID_MIRAGE_START_OFFSET,
  dailyRewardPerFloor:2,
  formulaVersion:2,
  baseCrit:VOID_MIRAGE_BASE_CRIT,
  baseDodge:VOID_MIRAGE_BASE_DODGE,
  hpBase:VOID_MIRAGE_HP_BASE,
  hpPerFloor:VOID_MIRAGE_HP_PER_FLOOR,
  atkBase:VOID_MIRAGE_ATK_BASE,
  atkPerFloor:VOID_MIRAGE_ATK_PER_FLOOR,
  defBase:VOID_MIRAGE_DEF_BASE,
  defPerFloor:VOID_MIRAGE_DEF_PER_FLOOR,
  regularNames:VOID_MIRAGE_REGULAR_NAMES.slice(),
  bossNames:VOID_MIRAGE_BOSS_NAMES.slice()
 };};
 window.ensureVoidMirageState=function(){return normalizeVoidMirageState(state);};
 window.canEnterVoidMirage=function(){return Number(state?.level||0)>=VOID_MIRAGE_UNLOCK_LEVEL;};
 window.voidMirageBaseStats=baseStats;
 window.isVoidMirageBossFloor=isBossFloor;
 window.voidMirageBossNameForFloor=bossNameForFloor;
 window.rollVoidMirageTraits=rollTraits;
 window.buildVoidMirageEnemy=buildEnemy;
 window.getVoidMirageHistoricalHighest=historicalHighest;
 window.getVoidMirageStartFloor=function(){return startFloorFromHistory();};
 window.voidMirageStartFloorFromHistory=startFloorFromHistory;
 window.recordVoidMirageClear=function(floor){const result=recordClear(floor);if(typeof save==="function")save(false);return result;};

 window.beginVoidMirageRun=function(){
  if(Number(state?.level||0)<VOID_MIRAGE_UNLOCK_LEVEL)return {ok:false,reason:"level_locked",unlockLevel:VOID_MIRAGE_UNLOCK_LEVEL};
  if(voidMirageRun?.active)return {ok:false,reason:"already_active",run:runSnapshot()};
  const startFloor=startFloorFromHistory();
  voidMirageRun={active:true,phase:"ready",startFloor,currentFloor:startFloor,lastClearedFloor:startFloor-1,cleared:0,totalTurns:0,exitRequested:false,endedReason:"",failedFloor:0,lastEnemy:null,lastResult:null,previousRegularName:"",playerSnapshot:null,runStarted:false};
  return {ok:true,run:runSnapshot()};
 };

 window.requestVoidMirageExit=function(){
  if(!voidMirageRun?.active)return {ok:false,reason:"no_active_run",run:runSnapshot()};
  voidMirageRun.exitRequested=true;
  if(voidMirageRun.phase!=="fighting")return {ok:true,ended:true,run:finishRun("exit")};
  return {ok:true,ended:false,run:runSnapshot()};
 };

 window.fightNextVoidMirageFloor=function(options={}){
  if(!voidMirageRun?.active)return {ok:false,reason:"no_active_run",run:runSnapshot()};
  if(voidMirageRun.exitRequested&&voidMirageRun.phase!=="fighting")return {ok:true,ended:true,run:finishRun("exit")};
  if(!voidMirageRun.runStarted){
   const player=createSpecialPlayerSnapshot(playerCombatStats());
   voidMirageRun.playerSnapshot=player;voidMirageRun.runStarted=true;state.hp=player.hp;
  }
  const floor=floorNumber(voidMirageRun.currentFloor),playerMaxHp=runPlayerStats().hp,enemy=buildEnemy(floor,{previousName:voidMirageRun.previousRegularName});
  if(!enemy.isBossFloor)voidMirageRun.previousRegularName=enemy.name;
  voidMirageRun.phase="fighting";voidMirageRun.lastEnemy=enemy;
  const result=voidMirageFightCore(enemy,options);
  voidMirageRun.lastResult=result;voidMirageRun.totalTurns+=Math.max(0,Math.floor(Number(result.turns)||0));
  if(!result.win){const final=finishRun("defeat",{failedFloor:floor});return {ok:true,win:false,ended:true,reason:"defeat",floor,enemy,result,playerMaxHp,run:final};}
  const clear=recordClear(floor);
  voidMirageRun.cleared++;voidMirageRun.lastClearedFloor=floor;voidMirageRun.currentFloor=clear.nextFloor;voidMirageRun.phase="between";runFullHeal();
  if(voidMirageRun.exitRequested){const final=finishRun("exit");return {ok:true,win:true,ended:true,reason:"exit",floor,enemy,result,playerMaxHp,run:final};}
  if(options.save!==false&&typeof save==="function")save(false);
  return {ok:true,win:true,ended:false,floor,enemy,result,playerMaxHp,run:runSnapshot()};
 };

 window.VOID_MIRAGE_FORMULA_VERSION=2;
 window.VOID_MIRAGE_SNAPSHOT_ISOLATION_VERSION=1;
 window.VOID_MIRAGE_RUN_LOCAL_NAME_VERSION=1;
 window.VOID_MIRAGE_CIVILIZATION_DAMAGE_VERSION=2;
 window.VOID_MIRAGE_FAST_CATCH_UP_POLICY_VERSION=1;
 window.VOID_MIRAGE_AUTO_OWNER_VERSION=1;
 function fastCatchUp(){return typeof window.backgroundProgressFastCatchUpActive==="function"&&window.backgroundProgressFastCatchUpActive("void")===true;}
 function catchUpPreviewPolicy(){
  if(!fastCatchUp()||typeof window.backgroundProgressCatchUpPolicy!=="function")return null;
  const snapshot=typeof window.backgroundProgressSnapshot==="function"?window.backgroundProgressSnapshot():null;
  const next=Math.max(0,Math.floor(Number(snapshot?.catchUpPolicyCount)||0))+1;
  return window.backgroundProgressCatchUpPolicy("void",next,false);
 }
 window.runVoidMirageAuto=async function(options={}){
  if(!voidMirageRun?.active){const started=window.beginVoidMirageRun();if(!started.ok)return started;}
  const onFloor=typeof options.onFloorComplete==="function"?options.onFloorComplete:null,onEnd=typeof options.onEnd==="function"?options.onEnd:null;
  while(voidMirageRun?.active){
   if(voidMirageRun.exitRequested&&voidMirageRun.phase!=="fighting"){const ended=finishRun("exit");if(onEnd)await onEnd(ended);return {ok:true,ended:true,run:ended};}
   const previewPolicy=catchUpPreviewPolicy();
   const fast=!!previewPolicy?.active;
   const floorResult=window.fightNextVoidMirageFloor({
    save:fast?previewPolicy?.shouldCheckpoint===true:true,
    logs:fast?previewPolicy?.shouldPresentBattle===true:true,
    preparePresentation:fast?previewPolicy?.shouldPresentBattle===true:true
   });
   if(fast&&floorResult?.ok&&typeof window.backgroundProgressCatchUpStep==="function")floorResult.catchUpPolicy=window.backgroundProgressCatchUpStep("void");
   if(!floorResult.ok){if(onEnd)await onEnd(floorResult.run);return floorResult;}
   if(onFloor)await onFloor(floorResult);
   if(floorResult.ended){if(onEnd)await onEnd(floorResult.run);return {ok:true,ended:true,result:floorResult,run:floorResult.run};}
   if(!fastCatchUp())await yieldControl();
  }
  const snapshot=runSnapshot();if(onEnd)await onEnd(snapshot);return {ok:true,ended:true,run:snapshot};
 };

 window.getVoidMirageRunSnapshot=runSnapshot;
 if(typeof state!=="undefined"&&state)normalizeVoidMirageState(state);
})();