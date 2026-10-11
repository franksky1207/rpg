/* T1-A: detached, read-only projections of the live formal owners.
   No DOM, fixture, renderer, storage, transaction or asset-loading ownership. */
(function(global){
"use strict";
const SLOTS=["weapon","helmet","armor","shoes","accessory"];
const number=(value,fallback=0)=>value!==null&&value!==""&&Number.isFinite(Number(value))?Number(value):fallback;
const limited=(value,min,max)=>Math.max(min,Math.min(max,Math.floor(number(value,min))));
const copy=value=>JSON.parse(JSON.stringify(value));
const currentState=()=>typeof state!=="undefined"?state:global.state;
const phase=()=>limited(global.currentWorldPhase?.()||1,1,3);
const maps=()=>typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS:global.MAPS||[];
const regions=()=>typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:global.WORLD_REGIONS||[];
const unavailable=(source,reason)=>({schema:1,status:"unavailable",source,reason,readOnly:true});
function appearance(){return global.Civilization3DAppearance?.capture?.()||null;}
function galaxy(options={}){
 const s=currentState(),list=regions(),all=maps();
 if(!s||!list.length||!all.length)return unavailable("formal-galaxy","missing-galaxy-owner");
 const highest=limited(s.unlockedMap,0,all.length-1),review=options.review===true;
 const selected=options.mapIndex??(options.focus==="progress"?highest:typeof selectedMap==="number"?selectedMap:highest);
 const index=limited(selected,0,all.length-1);
 // Same rule as worldmapui.js regionCleared(): last-map Boss or progress beyond mapEnd.
 const completedRegions=list.map(r=>review||!!s.bossKilled?.[r.mapEnd]||highest>Number(r.mapEnd));
 return {schema:1,status:"available",source:"formal-galaxy",world:1,mapCount:list.length,
  selectedMap:list.reduce((n,r,i)=>index>=Number(r.mapStart)?i:n,0),
  unlockedRegions:list.map(r=>review||highest>=Number(r.mapStart)),completedRegions,review,enemyCount:5};
}
function universe(options={}){
 const bosses=global.SECOND_WORLD_BOSSES;
 if(!Array.isArray(bosses)||!bosses.length||typeof global.secondWorldBossKilled!=="function"||typeof global.secondWorldHighestUnlockedBossIndex!=="function")return unavailable("formal-universe","missing-universe-owner");
 const highest=limited(global.secondWorldHighestUnlockedBossIndex(),0,bosses.length-1);
 const defeated=bosses.slice(0,100).map(b=>global.secondWorldBossKilled(b.index)===true);
 return {schema:1,status:"available",source:"formal-universe",world:2,highestUnlockedBossIndex:highest,
  clearedBossCount:defeated.filter(Boolean).length,defeatedBosses:defeated,
  selectedMap:limited(global.getSecondWorld3DPreviewSelectedRegion?.()??Math.floor(highest/10),0,9),
  selectionSource:typeof global.getSecondWorld3DPreviewSelectedRegion==="function"?"formal-region-view":"highest-unlocked-fallback",review:options.review===true};
}
function higher(){
 const defs=global.THIRD_WORLD_BOSS_DEFINITIONS,s=currentState();
 if(!s||!Array.isArray(defs)||!defs.length||typeof global.thirdWorldBossProgressSnapshot!=="function")return unavailable("formal-higher","missing-higher-owner");
 // Resolve the current global each call: reincarnation wrappers must remain authoritative.
 const snapshots=defs.slice(0,10).map((_,i)=>global.thirdWorldBossProgressSnapshot(i,s));
 if(snapshots.some(p=>!p))return unavailable("formal-higher","missing-higher-progress");
 const presences=snapshots.map(p=>{
  return {defeated:p?.defeated===true,available:p?.challengeStatus?.allowed===true,remainingPercent:Math.max(0,Math.min(100,number(p?.remainingPercent,100)))};
 });
 return {schema:1,status:"available",source:"formal-higher",world:3,presences,selectedPresence:Math.max(0,presences.findIndex(p=>!p.defeated))};
}
function growth(kind="specialization"){
 const s=currentState();if(!s)return unavailable("formal-growth","missing-player");
 const levels=(keys,read,max)=>(Array.isArray(keys)?keys:[]).map(key=>Math.max(0,Math.min(max,number(read(key)))));
 const specializations=levels(global.SPECIALIZATION_KEYS,key=>s.specializations?.[key],60);
 const marks=levels(global.MARK_KEYS,key=>s.marks?.entries?.[key]?.level,10);
 const civilizationLevel=Math.max(0,Math.min(10,number(s.secondWorld?.civilizationLevel)));
 const coreLevel=Math.max(0,Math.min(10,number(s.thirdWorld?.coreLevel)));
 return {growthKind:kind,growthLevels:kind==="marks"?marks:specializations,marks,civilizationLevel,coreLevel,growthLevel:kind==="civilization"?civilizationLevel:coreLevel};
}
function calamities(world,options={}){
 const second=world===2;
 const definitions=second?global.getSecondWorldCalamityDefinitions:global.getCivilizationCalamityDefinitions;
 const status=second?global.getSecondWorldCalamityStatus:global.getCivilizationCalamityStatus;
 const defs=typeof definitions==="function"?definitions():null;
 return Array.from({length:10},(_,i)=>{
  const def=Array.isArray(defs)?defs[i]:null,s=def&&typeof status==="function"?status(def.id):null;
  const max=number(s?.maxHp),hp=number(s?.currentHp,NaN);
  return {status:s?"available":"unavailable",visible:!!s&&(second?global.isSecondWorldCalamityVisible?.(def.id)===true:true),
   unlocked:!!s&&(second?s.challengeable===true:global.isCivilizationCalamityUnlocked?.(def.id)===true),
   completed:!!s&&(second?s.completed===true:number(s.mark?.level)>=10),review:options.review===true,
   markLevel:limited(s?.mark?.level,0,10),progressPercent:Math.max(0,Math.min(100,number(s?.progressPercent))),
   remainingPercent:max>0&&Number.isFinite(hp)?Math.max(0,Math.min(100,100*hp/max)):100};
 });
}
function calamity(world,options={}){
 const seals=calamities(world,options);
 return {schema:1,status:seals.some(s=>s.status==="available")?"available":"unavailable",source:"formal-calamity",world,
  frontierKind:"calamity",frontierProgress:seals.filter(s=>s.completed).length,calamitySeals:seals,frontierReview:options.review===true};
}
function alternate(){
 const s=currentState(),info=global.alternateUniverseProgressionSnapshot?.(s);
 if(!info)return unavailable("formal-alternate","missing-alternate-owner");
 const max=limited(info.maxDepth,1,1000),cleared=limited(info.deepestCleared,0,max);
 const attempt=global.alternateUniverseActiveAttempt?.(s)||null;
 const validDepth=value=>Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=max?Number(value):null;
 const activeDepth=attempt?validDepth(attempt.depth):null;
 const nextDepth=info.nextDepth==null?null:validDepth(info.nextDepth);
 if(attempt&&!activeDepth)return unavailable("formal-alternate","invalid-active-attempt");
 const target=activeDepth??nextDepth??(info.completed===true&&cleared>0?cleared:null);
 const failure=target?global.alternateUniverseFailureStatus?.(target,s):null;
 return {schema:1,status:target?"available":"unavailable",source:"formal-alternate",reason:target?null:"no-challenge-focus",world:3,
  frontierKind:"alternate",frontierProgress:cleared,historicalCompletedDepth:cleared,
  activeAttemptDepth:activeDepth,nextChallengeDepth:nextDepth,focusDepth:target,
  focusKind:activeDepth?"active-attempt":nextDepth?"next-challenge":target?"historical-completion":"unavailable",
  alternateUniverse:target?Math.ceil(target/5):null,alternateDepth:target?(target-1)%5+1:null,
  alternateSegment:target?Math.ceil(target/50):null,alternateLocked:failure?.locked===true,
  alternateActive:!!attempt,alternateCompleted:target!==null&&cleared>=target};
}
function dungeon(kind="hub"){
 const world=phase(),base={schema:1,status:"available",source:"formal-dungeon",world};
 if(kind==="hub"){
  if(typeof global.dungeonModeAvailability!=="function")return unavailable("formal-dungeon","missing-dungeon-policy");
  const keys=["bounty","arena","tower","mirror"],policies=keys.map(key=>global.dungeonModeAvailability(key));
  const visible=keys.filter((key,i)=>policies[i]?.visible!==false&&!(world===3&&key==="bounty"));
  return {...base,dungeonKind:"hub",dungeonVisibleModes:visible,
   dungeonAvailableModes:keys.map(key=>{
    const p=policies[keys.indexOf(key)],enabled=p?.enabled===true||p?.available===true||p?.unlocked===true;
    const access=key==="mirror"?global.mirrorDungeonStatus?.()?.unlocked===true:global.isDungeonModeEntryUnlocked?.(key,currentState())===true;
    const remaining=["bounty","arena"].includes(key)?number(global.dailyDungeonStatus?.(key)?.remaining)>0:true;
    return visible.includes(key)&&enabled&&access&&remaining;
   }),dungeonUnlocked:true};
 }
 if(kind==="bounty"){
  if(world===3)return {...unavailable("formal-dungeon","higher-has-no-bounty"),world,dungeonKind:kind,unavailable:true,dungeonUnlocked:false};
  const b=global.getBountyTestSnapshot?.();if(!b)return unavailable("formal-dungeon","missing-bounty-owner");
  return {...base,dungeonKind:kind,dungeonTier:b.tier?.id||"normal",dungeonPhase:b.phase||"select",dungeonRemaining:Math.max(0,number(global.dailyDungeonStatus?.("bounty")?.remaining)),dungeonUnlocked:true};
 }
 if(kind==="arena"){
  const a=global.getArenaCoreState?.();if(!a)return unavailable("formal-dungeon","missing-arena-owner");
  const rt=a.runtime||{};
  return {...base,dungeonKind:kind,dungeonRank:number(a.rank,1),dungeonPosition:a.position||"normal",dungeonPhase:a.phase||"select",dungeonRemaining:Math.max(0,number(a.daily?.remaining)),dungeonUnlocked:true,
   advancedKind:"higher-arena",advancedStage:number(rt.round?.stageIndex),advancedProgress:number(rt.finishedRuns),higherArenaMode:rt.mode||rt.round?.mode||rt.selectedMode||"fixed",advancedUnlocked:true};
 }
 if(kind==="mirror"){
  const m=global.mirrorDungeonStatus?.();if(!m)return unavailable("formal-dungeon","missing-mirror-owner");
  return {...base,advancedKind:kind,advancedProgress:number(m.history?.bestWins),advancedUnlocked:m.unlocked===true};
 }
 if(kind==="void"){
  const v=global.getVoidMirageProgressSnapshot?.()||global.getVoidMirageRunSnapshot?.();if(!v)return unavailable("formal-dungeon","missing-void-owner");
  return {...base,advancedKind:kind,advancedProgress:number(v.highestCleared??v.historicalHighest),advancedUnlocked:true};
 }
 return unavailable("formal-dungeon","unknown-dungeon-kind");
}
function battle(){
 const owner=global.getCombatPresentationSnapshot?.();
 const valid=value=>(typeof value==="number"||typeof value==="string"&&value.trim()!=="")&&Number.isFinite(Number(value));
 const fields=["playerHp","playerMaxHp","enemyHp","enemyMaxHp"];
 const unsupported={encounterAvailable:false,settlementAvailable:false,encounter:unavailable("formal-combat","no-authoritative-encounter"),settlement:unavailable("formal-combat","no-authoritative-settlement")};
 const base={schema:1,source:"formal-combat",eventType:"presentation-snapshot",visualOnly:true,readOnly:true,...unsupported};
 if(!owner||!fields.every(key=>valid(owner[key]))||Number(owner.playerMaxHp)<=0||Number(owner.enemyMaxHp)<=0)return {...base,status:"unavailable",reason:"no-active-combat",battleAvailable:false,battleVisualKind:"unavailable"};
 if(["playerShield","enemyShield","playerShieldMax","enemyShieldMax"].some(key=>owner[key]!=null&&!valid(owner[key])))return {...base,status:"unavailable",reason:"invalid-combat-shield",battleAvailable:false,battleVisualKind:"unavailable"};
 const ratio=(value,max)=>Math.max(0,Math.min(1,number(value)/number(max,1)));
 const playerShield=Math.max(0,number(owner.playerShield)),enemyShield=Math.max(0,number(owner.enemyShield));
 return {...base,status:"active",battleAvailable:true,battleVisualKind:playerShield>0||enemyShield>0?"shield":"battle",
  playerHpRatio:ratio(owner.playerHp,owner.playerMaxHp),enemyHpRatio:ratio(owner.enemyHp,owner.enemyMaxHp),
  shieldRatio:ratio(playerShield,Math.max(1,number(owner.playerShieldMax,playerShield))),
  playerHp:Number(owner.playerHp),playerMaxHp:Number(owner.playerMaxHp),enemyHp:Number(owner.enemyHp),enemyMaxHp:Number(owner.enemyMaxHp),playerShield,enemyShield};
}
function equipmentCatalog(){
 const galaxy=maps(),galGroups=regions(),cosmic=global.SECOND_WORLD_REGIONS||[],high=global.THIRD_WORLD_EQUIPMENT_NAME_ROWS||[];
 const catalog={
  1:galGroups.map(region=>({name:String(region.name||""),entries:galaxy.slice(region.mapStart,region.mapEnd+1).map(map=>({name:String(map.name||""),level:number(map.max),names:SLOTS.map((_,i)=>String(map.gear?.[i]||""))}))})),
  2:cosmic.map(region=>({name:String(region.name||""),entries:Array.from({length:10},(_,i)=>{const boss=global.secondWorldBoss?.(region.firstBossIndex+i);return {name:String(boss?.name||""),level:number(boss?.level),names:SLOTS.map(type=>String(boss?.equipment?.[type]||""))};})})),
  3:[{name:"高維紀元",entries:high.map((row,i)=>({name:"第 "+(i+1)+" 階段 · "+String(row.theme||""),level:0,names:SLOTS.map(type=>String(row[type]||""))}))}]
 };
 if(catalog[1].length!==10||catalog[2].length!==10||catalog[3][0].entries.length!==10||[...catalog[1],...catalog[2],...catalog[3]].some(g=>g.entries.length!==10||g.entries.some(e=>e.names.some(n=>!n))))throw new Error("正式裝備區域或名稱資料未完整載入");
 return catalog;
}
function scenario(){
 if(!currentState())return null;
 return {battle:battle(),dungeon:Object.fromEntries(["hub","bounty","arena","mirror","void"].map(k=>[k,dungeon(k)])),
  galaxy:galaxy({focus:"progress"}),universe:universe(),higher:higher(),calamities:{1:calamities(1),2:calamities(2)},alternate:alternate()};
}
// Every public result is detached. Runtime globals are resolved on every call.
const api={appearance,galaxy,universe,higher,growth,calamities,calamity,alternate,dungeon,battle,equipmentCatalog,scenario};
global.Civilization3DFormalSnapshots=Object.freeze({version:1,...Object.fromEntries(Object.entries(api).map(([key,fn])=>[key,(...args)=>{const value=fn(...args);return value==null?value:copy(value);}]))});
})(window);
