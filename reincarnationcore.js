(function(){
 const REINCARNATION_CORE_VERSION=1;
 const REINCARNATION_ELIGIBILITY_VERSION=1;
 const REINCARNATION_RESET_MUTATION_VERSION=1;
 const REINCARNATION_TRANSACTION_VERSION=1;
 const REINCARNATION_RUNTIME_GUARD_VERSION=1;
 const REINCARNATION_SESSION_MARKER="civilization_reincarnation_just_committed_v1";
 const REQUIRED_LEVEL=2000;
 const REQUIRED_CORE_LEVEL=10;
 const EQUIPMENT_SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
 let reincarnationCommitted=false;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function nonNegative(value){return Math.max(0,whole(value,0));}
 function cloneJson(value){try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}}
 function blankMilestones(){const levels=Array.isArray(window.BREAKTHROUGH_MILESTONE_LEVELS)?window.BREAKTHROUGH_MILESTONE_LEVELS:(Array.isArray(window.BREAKTHROUGH_MILESTONES)?window.BREAKTHROUGH_MILESTONES:[100,200,300,400,500,600,700,800,900,1000]);return Object.fromEntries(levels.map(level=>[String(level),false]));}
 function qualifyingPermanentGear(item){return isObject(item)&&whole(item.world,0)===3&&whole(item.level,0)===2000;}
 function thirdWorldBossesDefeated(target){
  if(typeof window.thirdWorldBossesAllDefeated==="function")return window.thirdWorldBossesAllDefeated(target)===true;
  const rows=target?.thirdWorld?.bosses;
  return Array.isArray(rows)&&rows.length===10&&rows.every(row=>whole(row?.currentHp,-1)===0);
 }
 function reincarnationEligibilitySnapshot(target=null){
  const s=isObject(target)?target:(typeof state!=="undefined"&&isObject(state)?state:null);
  const levelCurrent=Math.max(1,whole(s?.level,1));
  const coreCurrent=Math.max(0,whole(s?.thirdWorld?.coreLevel,0));
  const bossesDefeated=!!s&&thirdWorldBossesDefeated(s);
  const level={ok:levelCurrent>=REQUIRED_LEVEL,current:levelCurrent,required:REQUIRED_LEVEL};
  const bosses={ok:bossesDefeated,current:bossesDefeated?10:Math.max(0,Math.min(10,Array.isArray(s?.thirdWorld?.bosses)?s.thirdWorld.bosses.filter(row=>whole(row?.currentHp,-1)===0).length:0)),required:10};
  const core={ok:coreCurrent>=REQUIRED_CORE_LEVEL,current:coreCurrent,required:REQUIRED_CORE_LEVEL};
  const rows=[level,bosses,core],completed=rows.filter(row=>row.ok===true).length;
  return Object.freeze({version:REINCARNATION_ELIGIBILITY_VERSION,eligible:completed===rows.length,completed,total:rows.length,level,bosses,core,storyRequired:false});
 }
 function canReincarnate(target=null){return reincarnationEligibilitySnapshot(target).eligible===true;}
 function starterItem(type){
  if(typeof makeItem!=="function")throw new Error("Starter equipment owner unavailable.");
  return makeItem(1,0,"normal",0,type);
 }
 function resetEquipmentForReincarnation(target){
  const source=isObject(target.equipment)?target.equipment:{};
  const equipment={};
  EQUIPMENT_SLOTS.forEach(type=>{equipment[type]=qualifyingPermanentGear(source[type])?source[type]:starterItem(type);});
  target.equipment=equipment;
  target.inventory=(Array.isArray(target.inventory)?target.inventory:[]).filter(qualifyingPermanentGear);
  target.lostGear=[];
  return {equippedRetained:EQUIPMENT_SLOTS.filter(type=>qualifyingPermanentGear(source[type])).length,inventoryRetained:target.inventory.length};
 }
 function resetEnhancementForReincarnation(target){
  const slots=Array.isArray(window.ENHANCEMENT_SLOTS)&&window.ENHANCEMENT_SLOTS.length?Array.from(window.ENHANCEMENT_SLOTS):Array.from(EQUIPMENT_SLOTS);
  target.enhancement={basicStones:0,advancedStones:0,levels:Object.fromEntries(slots.map(slot=>[slot,0]))};
 }
 function resetFirstWorldForReincarnation(target){
  const mapCount=Array.isArray(typeof MAPS!=="undefined"?MAPS:null)?MAPS.length:0;
  target.unlockedMap=0;
  target.mapProgress=typeof blankMapProgress==="function"?blankMapProgress():Array.from({length:mapCount},()=>[0,0,0,0]);
  target.bossProgress=Array(mapCount).fill(0);
  target.bossLocked=Array(mapCount).fill(false);
  target.bossKilled=Array(mapCount).fill(false);
  target.gold=0;
  target.pendingBlackMarketEncounter=false;
  target.calamities=typeof window.createBlankCalamityState==="function"?window.createBlankCalamityState():{entries:{}};
  target.marks=typeof window.createBlankMarkState==="function"?window.createBlankMarkState():{entries:{}};
 }
 function resetSecondAndThirdWorldForReincarnation(target){
  if(typeof window.createBlankSecondWorldState!=="function")throw new Error("Second-world reset owner unavailable.");
  if(typeof window.createBlankThirdWorldState!=="function")throw new Error("Third-world reset owner unavailable.");
  target.secondWorld=window.createBlankSecondWorldState();
  target.thirdWorld=window.createBlankThirdWorldState();
 }
 function resetDungeonCurrentLifeProgress(target){
  if(!isObject(target.dungeon))target.dungeon={};
  target.dungeon.arenaByWorld={1:{},2:{}};
  try{delete target.dungeon.arena;}catch(_){}
  delete target.dungeon.thirdWorldArenaTransaction;
 }
 function resetOfflineForReincarnation(target,now){
  if(typeof window.resetOfflineSaveState!=="function")throw new Error("Offline reset owner unavailable.");
  window.resetOfflineSaveState(target,{currentTime:now});
 }
 function resetSpecializationsForReincarnation(target){
  if(typeof window.createBlankSpecializations!=="function")throw new Error("Specialization reset owner unavailable.");
  target.specializations=window.createBlankSpecializations();
 }
 function reincarnationHpAfterReset(target){
  if(typeof baseHP!=="function")throw new Error("Base HP owner unavailable.");
  const gearHp=EQUIPMENT_SLOTS.reduce((sum,type)=>sum+Math.max(0,Number(target?.equipment?.[type]?.hp)||0),0);
  const raw={hp:gearHp,atk:0,def:0};
  const breakthrough=typeof window.breakthroughRawEquipmentBonuses==="function"?window.breakthroughRawEquipmentBonuses(raw,target):{hp:0};
  const beforeVip=Math.max(1,Number(baseHP(1))||1)+Math.max(0,Number(gearHp)||0)+Math.max(0,Number(breakthrough?.hp)||0);
  const vip=typeof window.vipBonusStats==="function"?window.vipBonusStats(target?.vipLevel):{hp:0};
  return Math.max(1,Math.ceil(beforeVip*(1+Math.max(0,Number(vip?.hp)||0)/100)));
 }
 function applyReincarnationResetState(target,options={}){
  if(!isObject(target))throw new Error("Reincarnation target state is invalid.");
  const requirements=reincarnationEligibilitySnapshot(target);
  if(options.requireEligible!==false&&requirements.eligible!==true)return Object.freeze({ok:false,reason:"requirements-incomplete",requirements});
  if(typeof window.normalizeReincarnationState==="function")window.normalizeReincarnationState(target);
  const before=cloneJson(target.reincarnation)||{};
  const bossesDefeatedBefore=thirdWorldBossesDefeated(target);
  const oldCount=nonNegative(target?.reincarnation?.count),newCount=oldCount+1;
  const permanent=nonNegative(target?.reincarnation?.breakthrough?.permanent);
  const alternate=target?.reincarnation?.alternateUniverse||{};
  const auUnlocked=alternate.unlocked===true||bossesDefeatedBefore;
  const deepestCleared=auUnlocked?Math.max(0,whole(alternate.deepestCleared,0)):0;
  const equipmentReport=resetEquipmentForReincarnation(target);
  resetEnhancementForReincarnation(target);
  resetSpecializationsForReincarnation(target);
  resetFirstWorldForReincarnation(target);
  resetSecondAndThirdWorldForReincarnation(target);
  resetDungeonCurrentLifeProgress(target);
  resetOfflineForReincarnation(target,Math.max(0,whole(options.currentTime,Date.now())));
  target.level=1;
  target.exp=0;
  target.reincarnation={
   count:newCount,
   breakthrough:{permanent,milestoneLifeId:newCount,milestones:blankMilestones()},
   alternateUniverse:{unlocked:auUnlocked,deepestCleared,activeAttempt:null,lifeFailures:{lifeId:newCount,failures:{}}}
  };
  target.hp=reincarnationHpAfterReset(target);
  return Object.freeze({
   ok:true,reason:"",version:REINCARNATION_RESET_MUTATION_VERSION,requirements,
   countBefore:oldCount,countAfter:newCount,permanentBreakthrough:permanent,
   alternateUniverseUnlocked:auUnlocked,alternateUniverseDeepestCleared:deepestCleared,
   equipment:Object.freeze({...equipmentReport}),hp:target.hp,
   preserved:Object.freeze({vip:true,titles:true,settings:true,daily:true,storyHistory:true,mirrorVoidHistory:true}),
   reset:Object.freeze({level:true,exp:true,enhancement:true,specializations:true,marks:true,civilization:true,worldProgress:true,arenaRank:true,resources:true,offline:true,activeAlternateUniverseAttempt:true}),
   previousReincarnation:before
  });
 }
 function reincarnationRuntimeStatus(){
  const blockers=[];
  if(reincarnationCommitted)blockers.push("reincarnation-committed");
  if(typeof window.worldTransitionRuntimeStatus!=="function")blockers.push("world-transition-runtime-owner-missing");
  else{
   try{
    const status=window.worldTransitionRuntimeStatus();
    (Array.isArray(status?.blockers)?status.blockers:[]).forEach(reason=>{const text=String(reason||"");if(text&&!blockers.includes(text))blockers.push(text);});
   }catch(error){blockers.push("world-transition-runtime-check-error");}
  }
  try{
   if(typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive()===true){
    const kind=typeof window.backgroundProgressActiveKind==="function"?String(window.backgroundProgressActiveKind()||""):"";
    const reason=`background-flow:${kind||"active"}`;if(!blockers.includes(reason))blockers.push(reason);
   }
  }catch(error){blockers.push("background-flow-check-error");}
  return Object.freeze({version:REINCARNATION_RUNTIME_GUARD_VERSION,blocked:blockers.length>0,blockers:Object.freeze(blockers.slice()),committed:reincarnationCommitted});
 }
 function executeFormalReincarnation(options={}){
  const requirements=reincarnationEligibilitySnapshot();
  if(reincarnationCommitted)return Object.freeze({ok:false,reason:"reincarnation-committed",requirements,runtime:Object.freeze({version:REINCARNATION_RUNTIME_GUARD_VERSION,blocked:true,blockers:Object.freeze(["reincarnation-committed"]),committed:true}),saved:true,reloading:true});
  if(requirements.eligible!==true)return Object.freeze({ok:false,reason:"requirements-incomplete",requirements,saved:false,reloading:false});
  if(typeof window.runSettlementTransaction!=="function")return Object.freeze({ok:false,reason:"transaction-owner-missing",requirements,saved:false,reloading:false});
  const currentTime=Math.max(0,whole(options.currentTime,Date.now()));
  const txOptions={
   label:"formal-reincarnation",
   mutate:target=>{
    const runtime=reincarnationRuntimeStatus();
    if(runtime.blocked)return {ok:false,reason:"active-runtime",runtime};
    const reset=applyReincarnationResetState(target,{currentTime,requireEligible:true});
    if(reset?.ok!==true)return reset;
    return {ok:true,runtime,reset};
   }
  };
  if(typeof options.saveFn==="function")txOptions.saveFn=options.saveFn;
  const transaction=window.runSettlementTransaction(txOptions);
  const runtime=transaction?.value?.runtime||null;
  if(transaction?.ok!==true)return Object.freeze({ok:false,reason:String(transaction?.reason||"transaction-failed"),requirements,runtime,transaction,saved:false,reloading:false});
  reincarnationCommitted=true;
  try{sessionStorage.setItem(REINCARNATION_SESSION_MARKER,"1");}catch(_){}
  let postCommitError="";
  const shouldReload=options.reload!==false;
  if(shouldReload){
   const reloadFn=typeof options.reloadFn==="function"?options.reloadFn:()=>location.reload();
   try{setTimeout(()=>{try{reloadFn();}catch(error){console.error("[文明戰線] Reincarnation committed, but reload failed.",error);}},0);}catch(error){postCommitError=String(error?.message||error);}
  }
  return Object.freeze({ok:true,reason:"",version:REINCARNATION_TRANSACTION_VERSION,requirements,runtime,transaction,reset:transaction.value?.reset||null,saved:true,reloading:shouldReload,postCommitError});
 }

 window.REINCARNATION_CORE_VERSION=REINCARNATION_CORE_VERSION;
 window.REINCARNATION_ELIGIBILITY_VERSION=REINCARNATION_ELIGIBILITY_VERSION;
 window.REINCARNATION_RESET_MUTATION_VERSION=REINCARNATION_RESET_MUTATION_VERSION;
 window.REINCARNATION_TRANSACTION_VERSION=REINCARNATION_TRANSACTION_VERSION;
 window.REINCARNATION_RUNTIME_GUARD_VERSION=REINCARNATION_RUNTIME_GUARD_VERSION;
 window.REINCARNATION_SESSION_MARKER=REINCARNATION_SESSION_MARKER;
 window.REINCARNATION_REQUIRED_LEVEL=REQUIRED_LEVEL;
 window.REINCARNATION_REQUIRED_CORE_LEVEL=REQUIRED_CORE_LEVEL;
 window.isReincarnationPermanentGear=qualifyingPermanentGear;
 window.reincarnationEligibilitySnapshot=reincarnationEligibilitySnapshot;
 window.canReincarnate=canReincarnate;
 window.applyReincarnationResetState=applyReincarnationResetState;
 window.reincarnationRuntimeStatus=reincarnationRuntimeStatus;
 window.executeFormalReincarnation=executeFormalReincarnation;
 window.reincarnationCommitPending=function(){return reincarnationCommitted;};
})();
