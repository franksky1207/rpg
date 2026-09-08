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

 function floorNumber(value){
  return Math.max(1,Math.floor(Number(value)||1));
 }

 function finiteNonNegative(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)&&n>=0?n:fallback;
 }

 function normalizeVoidMirageState(target){
  if(!target||typeof target!=="object")return null;
  if(!target.dungeon||typeof target.dungeon!=="object")target.dungeon={progress:0,attempts:0,points:0};
  if(!target.dungeon.voidMirage||typeof target.dungeon.voidMirage!=="object")target.dungeon.voidMirage={};
  target.dungeon.voidMirage.highestCleared=Math.floor(finiteNonNegative(target.dungeon.voidMirage.highestCleared,0));
  return target.dungeon.voidMirage;
 }

 function equivalentPower(floor){
  const f=floorNumber(floor);
  return 24+f/10;
 }

 function baseStats(floor){
  const f=floorNumber(floor),e=equivalentPower(f);
  return {
   floor:f,
   equivalentPower:e,
   hp:Math.max(1,Math.ceil((62+16.2*e)*VOID_MIRAGE_HP_MULTIPLIER)),
   atk:Math.max(1,Math.ceil((10.5+2.45*e)*VOID_MIRAGE_ATK_MULTIPLIER)),
   def:Math.max(0,Math.ceil((3.2+0.92*e)*VOID_MIRAGE_DEF_MULTIPLIER)),
   crit:VOID_MIRAGE_BASE_CRIT,
   dodge:VOID_MIRAGE_BASE_DODGE
  };
 }

 function isBossFloor(floor){
  return floorNumber(floor)%10===0;
 }

 function bossNameForFloor(floor){
  const f=floorNumber(floor);
  if(!isBossFloor(f))return "";
  const withinCycle=((f-1)%100)+1;
  const index=Math.floor((withinCycle-1)/10);
  return VOID_MIRAGE_BOSS_NAMES[index];
 }

 function regularName(previousName=""){
  const blocked=String(previousName||lastRegularName||"");
  const pool=VOID_MIRAGE_REGULAR_NAMES.filter(name=>name!==blocked);
  const names=pool.length?pool:VOID_MIRAGE_REGULAR_NAMES;
  const name=names[Math.floor(Math.random()*names.length)];
  lastRegularName=name;
  return name;
 }

 function traitIds(){
  if(typeof MONSTER_TRAIT_IDS!=="undefined"&&Array.isArray(MONSTER_TRAIT_IDS))return MONSTER_TRAIT_IDS.slice();
  if(typeof MONSTER_TRAITS!=="undefined"&&MONSTER_TRAITS)return Object.keys(MONSTER_TRAITS);
  return ["strong","ferocious","hard","swift","deadly","berserk","giant"];
 }

 function rollTraits(floor){
  const pool=traitIds(),out=[];
  const count=isBossFloor(floor)?2:1;
  for(let i=0;i<count&&pool.length;i++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
 }

 function applyTraits(enemy,ids){
  const e={...enemy,traits:ids.slice(),berserk:false};
  ids.forEach(id=>{
   if(id==="strong")e.hp=Math.ceil(e.hp*1.20);
   if(id==="ferocious")e.atk=Math.ceil(e.atk*1.15);
   if(id==="hard")e.def=Math.ceil(e.def*1.20);
   if(id==="swift")e.dodge=round1((e.dodge||0)+8);
   if(id==="deadly")e.crit=round1((e.crit||0)+8);
   if(id==="berserk")e.berserk=true;
   if(id==="giant"){
    e.hp=Math.ceil(e.hp*1.30);
    e.atk=Math.ceil(e.atk*1.05);
    e.dodge=round1((e.dodge||0)-5);
   }
  });
  e.crit=round1(Math.max(0,Math.min(MAX_CRIT_RATE,Number(e.crit)||0)));
  e.dodge=round1(Math.max(0,Math.min(MAX_DODGE_RATE,Number(e.dodge)||0)));
  return e;
 }

 function firstClearPoints(floor){
  const f=floorNumber(floor);
  let points=Math.round(15+1.75*Math.sqrt(Math.max(0,f-1)));
  if(isBossFloor(f))points*=2;
  return points;
 }

 function buildEnemy(floor,options={}){
  const f=floorNumber(floor),boss=isBossFloor(f),base=baseStats(f);
  const name=boss?bossNameForFloor(f):regularName(options.previousName);
  const ids=Array.isArray(options.traits)?options.traits.slice(0,boss?2:1):rollTraits(f);
  return applyTraits({
   name,
   floor:f,
   kind:"dungeon-void-mirage",
   isBossFloor:boss,
   ...base,
   baseCrit:VOID_MIRAGE_BASE_CRIT,
   baseDodge:VOID_MIRAGE_BASE_DODGE,
   firstClearPoints:firstClearPoints(f)
  },ids);
 }

 window.VOID_MIRAGE_NAME=VOID_MIRAGE_NAME;
 window.VOID_MIRAGE_UNLOCK_LEVEL=VOID_MIRAGE_UNLOCK_LEVEL;
 window.getVoidMirageConfig=function(){
  return {
   name:VOID_MIRAGE_NAME,
   unlockLevel:VOID_MIRAGE_UNLOCK_LEVEL,
   baseCrit:VOID_MIRAGE_BASE_CRIT,
   baseDodge:VOID_MIRAGE_BASE_DODGE,
   hpMultiplier:VOID_MIRAGE_HP_MULTIPLIER,
   atkMultiplier:VOID_MIRAGE_ATK_MULTIPLIER,
   defMultiplier:VOID_MIRAGE_DEF_MULTIPLIER,
   regularNames:VOID_MIRAGE_REGULAR_NAMES.slice(),
   bossNames:VOID_MIRAGE_BOSS_NAMES.slice()
  };
 };
 window.ensureVoidMirageState=function(){return normalizeVoidMirageState(state);};
 window.canEnterVoidMirage=function(){return Number(state?.level||0)>=VOID_MIRAGE_UNLOCK_LEVEL;};
 window.voidMirageEquivalentPower=equivalentPower;
 window.voidMirageBaseStats=baseStats;
 window.isVoidMirageBossFloor=isBossFloor;
 window.voidMirageBossNameForFloor=bossNameForFloor;
 window.rollVoidMirageTraits=rollTraits;
 window.voidMirageFirstClearPoints=firstClearPoints;
 window.buildVoidMirageEnemy=buildEnemy;
 window.getVoidMirageNextFloor=function(){
  const s=normalizeVoidMirageState(state);
  return Math.max(1,(s?.highestCleared||0)+1);
 };
 window.recordVoidMirageClear=function(floor){
  const s=normalizeVoidMirageState(state),f=floorNumber(floor);
  if(!s)return {highestCleared:0,nextFloor:1,advanced:false};
  const before=s.highestCleared;
  if(f===before+1)s.highestCleared=f;
  return {highestCleared:s.highestCleared,nextFloor:s.highestCleared+1,advanced:s.highestCleared>before};
 };

 if(typeof state!=="undefined"&&state){
  normalizeVoidMirageState(state);
  if(typeof save==="function")save(false);
 }
})();
