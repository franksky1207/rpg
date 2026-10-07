(function(){
 const VERSION=3;
 const RESOURCE_VERSION=1;
 const DUNGEON_VERSION=1;
 const DAILY_RESET_VERSION=1;
 const ENHANCEMENT_VERSION=2;
 const CHARACTER_VERSION=1;
 const MAINLINE_VERSION=1;
 const GEAR_VERSION=1;
 const VIP_RESET_VERSION=1;
 const MARK_VERSION=1;
 const UI_CONVERGENCE_VERSION=1;

 function formalPhase(target=state){
  if(typeof window.currentWorldPhase==="function"){
   const phase=Number(window.currentWorldPhase(target));
   if(phase===1||phase===2||phase===3)return phase;
  }
  return target?.thirdWorld?.entered===true?3:target?.secondWorld?.entered===true?2:1;
 }
 function finiteInt(value,min=0,max=Number.MAX_SAFE_INTEGER){const number=Number(value);return Number.isFinite(number)&&Number.isInteger(number)&&number>=min&&number<=max?number:null;}
 function firstWorldMaxLevel(){return Math.max(1,Math.floor(Number(typeof MAX_LEVEL!=="undefined"?MAX_LEVEL:500)||500));}
 function absoluteMaxLevel(){return Math.max(firstWorldMaxLevel(),Math.floor(Number(typeof ABSOLUTE_MAX_LEVEL!=="undefined"?ABSOLUTE_MAX_LEVEL:2000)||2000));}
 function firstWorldMaps(){return Array.isArray(typeof MAPS!=="undefined"?MAPS:null)?MAPS:[];}
 function equipmentTypes(){return Array.isArray(typeof EQUIPMENT_TYPES!=="undefined"?EQUIPMENT_TYPES:null)?EQUIPMENT_TYPES:[];}
 function replaceRecord(target,next){if(!target||typeof target!=="object"||Array.isArray(target)||!next||typeof next!=="object"||Array.isArray(next))return false;Object.keys(target).forEach(key=>{if(!Object.prototype.hasOwnProperty.call(next,key))delete target[key];});Object.assign(target,next);return true;}
 function run(label,mutate){if(typeof window.runSettlementTransaction!=="function")return Object.freeze({ok:false,reason:"transaction-owner-missing",rolledBack:false,saved:false,label:String(label||"")});return window.runSettlementTransaction({label,mutate});}
 function txReason(tx){return tx?.reason||tx?.value?.reason||"未知錯誤";}
 function statsFor(target){
  if(typeof window.playerCombatStatsForState==="function")return window.playerCombatStatsForState(target);
  if(typeof window.playerCombatStats==="function"&&target===state)return window.playerCombatStats();
  return null;
 }

 function applyCharacterLevel(value,target=state){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};
  const cap=typeof window.effectiveLevelCap==="function"?Math.max(1,Math.floor(Number(window.effectiveLevelCap(target))||1)):absoluteMaxLevel();
  const level=finiteInt(value,1,cap);if(level==null)return {ok:false,reason:"invalid-level",min:1,max:cap};
  target.level=typeof window.clampEffectiveGameLevel==="function"?window.clampEffectiveGameLevel(level,target):level;target.exp=0;
  const stats=statsFor(target);if(stats)target.hp=Math.max(1,Math.floor(Number(stats.hp)||1));
  return {ok:true,level:target.level,exp:target.exp,hp:target.hp,cap,phase:formalPhase(target)};
 }
 function commitCharacterLevel(value){return run("gm-character-level",live=>applyCharacterLevel(value,live));}

 function firstWorldProgressPlan(value){
  const max=firstWorldMaxLevel(),target=finiteInt(value,1,max);if(target==null)return {ok:false,reason:"invalid-progress",min:1,max};
  const maps=firstWorldMaps();if(!maps.length)return {ok:false,reason:"first-world-map-owner-missing"};
  const count=maps.length,currentMap=Math.max(0,Math.min(count-1,Math.floor((target-1)/5))),currentEnemy=(target-1)%5;
  const mapProgress=Array.from({length:count},()=>[0,0,0,0]),bossProgress=Array(count).fill(0),bossLocked=Array(count).fill(false),bossKilled=Array(count).fill(false);
  for(let i=0;i<currentMap;i++){mapProgress[i]=[10,10,10,10];bossKilled[i]=true;}
  const p=mapProgress[currentMap];if(currentEnemy>=1)p[0]=10;if(currentEnemy>=2)p[1]=10;if(currentEnemy>=3)p[2]=10;if(currentEnemy>=4)p[3]=10;
  return {ok:true,target,currentMap,currentEnemy,mapProgress,bossProgress,bossLocked,bossKilled};
 }
 function applyFirstWorldProgress(value,target=state){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};if(formalPhase(target)!==1)return {ok:false,reason:"wrong-world"};
  const plan=firstWorldProgressPlan(value);if(!plan.ok)return plan;
  target.unlockedMap=plan.currentMap;target.mapProgress=plan.mapProgress;target.bossProgress=plan.bossProgress;target.bossLocked=plan.bossLocked;target.bossKilled=plan.bossKilled;
  return {ok:true,target:plan.target,currentMap:plan.currentMap,currentEnemy:plan.currentEnemy};
 }
 function commitFirstWorldProgress(value){return run("gm-first-world-progress",live=>applyFirstWorldProgress(value,live));}

 function applyResource(kind,value,target=state){
  const amount=finiteInt(value);if(amount==null)return {ok:false,reason:"invalid-value"};const phase=formalPhase(target);
  if(kind==="gold"){if(phase!==1)return {ok:false,reason:"wrong-world"};target.gold=amount;}
  else if(kind==="dark-matter"){if(phase!==2||!target?.secondWorld||typeof target.secondWorld!=="object")return {ok:false,reason:"wrong-world"};target.secondWorld.darkMatter=amount;}
  else if(kind==="dark-energy"){if(phase!==2||!target?.secondWorld||typeof target.secondWorld!=="object")return {ok:false,reason:"wrong-world"};target.secondWorld.darkEnergy=amount;}
  else if(kind==="dimensional-strings"){if(phase!==3||!target?.thirdWorld||typeof target.thirdWorld!=="object")return {ok:false,reason:"wrong-world"};target.thirdWorld.dimensionalStrings=amount;}
  else return {ok:false,reason:"unknown-resource"};
  return {ok:true,kind,value:amount,phase};
 }
 function commitResource(kind,value){return run(`gm-resource-${kind}`,live=>applyResource(kind,value,live));}

 function enhancementSlots(){const source=Array.isArray(typeof ENHANCEMENT_SLOTS!=="undefined"?ENHANCEMENT_SLOTS:null)?ENHANCEMENT_SLOTS:[];return source.map(String).filter(Boolean);}
 function enhancementRange(target=state){
  const min=typeof window.effectiveEnhancementMin==="function"?Math.max(0,Math.floor(Number(window.effectiveEnhancementMin(target))||0)):0;
  const fallbackMax=Math.max(min,Math.floor(Number(typeof ENHANCEMENT_MAX_LEVEL!=="undefined"?ENHANCEMENT_MAX_LEVEL:20)||20));
  const max=typeof window.effectiveEnhancementCap==="function"?Math.max(min,Math.floor(Number(window.effectiveEnhancementCap(target))||min)):fallbackMax;
  return Object.freeze({min,max});
 }
 function applyEnhancementLevels(values,target=state){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};const slots=enhancementSlots();if(!slots.length)return {ok:false,reason:"enhancement-slots-missing"};
  if(typeof window.normalizeEnhancementState!=="function")return {ok:false,reason:"enhancement-owner-missing"};window.normalizeEnhancementState(target);const range=enhancementRange(target),next={};
  for(const type of slots){const raw=Number(values?.[type]);if(!Number.isFinite(raw)||!Number.isInteger(raw)||raw<range.min||raw>range.max)return {ok:false,reason:"invalid-enhancement-level",type,value:values?.[type],min:range.min,max:range.max};next[type]=raw;}
  if(!target.enhancement||typeof target.enhancement!=="object"||!target.enhancement.levels||typeof target.enhancement.levels!=="object")return {ok:false,reason:"enhancement-state-missing"};
  slots.forEach(type=>{target.enhancement.levels[type]=next[type];});window.normalizeEnhancementState(target);return {ok:true,levels:Object.freeze({...next}),min:range.min,max:range.max,phase:formalPhase(target)};
 }
 function commitEnhancementLevels(values){return run("gm-enhancement-levels",live=>applyEnhancementLevels(values,live));}
 function enhancementValuesFromUi(target=state){const values={};enhancementSlots().forEach(type=>{const current=Math.floor(Number(target?.enhancement?.levels?.[type])||0),el=document.getElementById(`gmEnhance-manage-${type}`);values[type]=Number(el?el.value:current);});return values;}

 function markKeys(){return Array.from(window.MARK_KEYS||[]).map(String).filter(Boolean);}
 function formalMarkMinimum(target=state){return formalPhase(target)>=2?10:0;}
 function applyMarkLevels(values,target=state){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};
  if(typeof window.normalizeCivilizationCalamityState!=="function")return {ok:false,reason:"mark-state-owner-missing"};
  window.normalizeCivilizationCalamityState(target);
  const keys=markKeys();if(!keys.length||!target?.marks?.entries)return {ok:false,reason:"mark-config-missing"};
  const minimum=formalMarkMinimum(target),applied={};
  for(const key of keys){
   const entry=target.marks.entries[key]||(target.marks.entries[key]={acquired:false,level:0,progress:0});
   if(minimum>=10){entry.acquired=true;entry.level=10;entry.progress=0;applied[key]=10;continue;}
   const raw=values?.[key];
   if(raw==null||raw==="none"){entry.acquired=false;entry.level=0;entry.progress=0;applied[key]=null;continue;}
   const level=finiteInt(raw,0,10);if(level==null)return {ok:false,reason:"invalid-mark-level",key,value:raw};
   entry.acquired=true;entry.level=level;entry.progress=0;applied[key]=level;
  }
  window.normalizeCivilizationCalamityState(target);
  return {ok:true,phase:formalPhase(target),minimum,levels:Object.freeze({...applied})};
 }
 function commitMarkLevels(values){return run("gm-mark-levels",live=>applyMarkLevels(values,live));}

 function ensureInventory(target){if(!Array.isArray(target?.inventory))target.inventory=[];return target.inventory;}
 function applyGeneratedEquipment(request,target=state){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};
  const validTypes=equipmentTypes(),world=finiteInt(request?.world,1,3),q=finiteInt(request?.q,0,5),types=Array.isArray(request?.types)?request.types.filter(type=>validTypes.includes(type)):[];
  if(world==null||q==null||!types.length)return {ok:false,reason:"invalid-gear-request"};const inventory=ensureInventory(target),created=[];
  if(world===1){
   const level=finiteInt(request?.level,1,firstWorldMaxLevel());if(level==null||typeof makeItem!=="function")return {ok:false,reason:level==null?"invalid-level":"gear-owner-missing"};
   const mapCount=firstWorldMaps().length;if(!mapCount)return {ok:false,reason:"first-world-map-owner-missing"};const mapIdx=Math.max(0,Math.min(mapCount-1,Math.floor((level-1)/5)));
   for(const type of types){const item=makeItem(level,mapIdx,"normal",q,type);if(item){inventory.push(item);created.push(item);}}
  }else if(world===2){
   if(formalPhase(target)<2)return {ok:false,reason:"wrong-world"};if(typeof window.makeSecondWorldEquipmentForBoss!=="function")return {ok:false,reason:"gear-owner-missing"};
   const bossIndex=finiteInt(request?.bossIndex,0,99);if(bossIndex==null)return {ok:false,reason:"invalid-boss"};for(const type of types){const item=window.makeSecondWorldEquipmentForBoss(bossIndex,{forcedQ:q,forcedType:type,state:target});if(item){inventory.push(item);created.push(item);}}
  }else{
   if(formalPhase(target)!==3)return {ok:false,reason:"wrong-world"};if(q!==4&&q!==5)return {ok:false,reason:"invalid-quality"};if(typeof window.makeThirdWorldEquipmentForBoss!=="function")return {ok:false,reason:"gear-owner-missing"};
   const bossIndex=finiteInt(request?.bossIndex,0,9);if(bossIndex==null)return {ok:false,reason:"invalid-boss"};for(const type of types){const item=window.makeThirdWorldEquipmentForBoss(bossIndex,{state:target,forcedQ:q,forcedType:type,sourceTag:"gm-third-world"});if(item){inventory.push(item);created.push(item);}}
  }
  if(!created.length)return {ok:false,reason:"gear-generation-failed"};return {ok:true,world,q,created:created.length,levels:Object.freeze(created.map(item=>Math.floor(Number(item?.level)||0)))};
 }
 function commitGeneratedEquipment(request){return run(`gm-generate-world${request?.world||0}-equipment`,live=>applyGeneratedEquipment(request,live));}

 function applyVipReset(target=state){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};const beforeStats=statsFor(target),beforeMax=beforeStats?Math.max(1,Number(beforeStats.hp)||1):null;
  const beforeHp=Math.max(0,beforeMax==null?Number(target.hp)||0:Math.min(beforeMax,Number(target.hp)||0)),ratio=beforeMax?beforeHp/beforeMax:1,wasFull=beforeMax==null?true:beforeHp>=beforeMax;
  target.vipLevel=0;target.vipPoints=0;const afterStats=statsFor(target),afterMax=afterStats?Math.max(1,Number(afterStats.hp)||1):beforeMax;
  if(afterMax!=null)target.hp=wasFull?afterMax:Math.max(0,Math.min(afterMax,Math.round(afterMax*ratio)));return {ok:true,vipLevel:0,vipPoints:0,hp:target.hp};
 }
 function commitVipReset(){return run("gm-vip-reset",live=>applyVipReset(live));}

 function ensureDungeonTarget(target){
  if(!target||typeof target!=="object")return null;const key=typeof gameDailyDateKey==="function"?gameDailyDateKey():String(target?.daily?.dateKey||"");
  if(!target.daily||typeof target.daily!=="object"||Array.isArray(target.daily))target.daily=typeof blankDailyState==="function"?blankDailyState(key):{dateKey:key,bounty:{used:0},arena:{used:0},voidMirage:{highestFloor:0,claimed:false}};
  const daily=target.daily;if(!daily.bounty||typeof daily.bounty!=="object")daily.bounty={used:0};if(!daily.arena||typeof daily.arena!=="object")daily.arena={used:0};if(!daily.voidMirage||typeof daily.voidMirage!=="object")daily.voidMirage={highestFloor:0,claimed:false};
  if(!target.dungeon||typeof target.dungeon!=="object"||Array.isArray(target.dungeon))target.dungeon={};if(!target.dungeon.voidMirage||typeof target.dungeon.voidMirage!=="object")target.dungeon.voidMirage={highestCleared:0};return {daily,key};
 }
 function applyDungeonValues(values,target=state,{normalizeVip=true}={}){
  const points=finiteInt(values?.points),bounty=finiteInt(values?.bounty,0,20),arena=finiteInt(values?.arena,0,20),highest=finiteInt(values?.highest),dailyHighest=finiteInt(values?.dailyHighest),claimed=values?.claimed===true;
  if([points,bounty,arena,highest,dailyHighest].some(value=>value==null))return {ok:false,reason:"invalid-value"};const holder=ensureDungeonTarget(target);if(!holder)return {ok:false,reason:"invalid-target"};
  target.vipPoints=points;if(normalizeVip&&typeof normalizeVipState==="function")normalizeVipState(target);holder.daily.bounty.used=bounty;holder.daily.arena.used=arena;const historical=Math.max(highest,dailyHighest);target.dungeon.voidMirage.highestCleared=historical;holder.daily.voidMirage.highestFloor=dailyHighest;holder.daily.voidMirage.claimed=claimed;return {ok:true,points,bounty,arena,historical,dailyHighest,claimed};
 }
 function commitDungeonValues(values){return run("gm-dungeon-values",live=>applyDungeonValues(values,live));}
 function resetDailyDungeonState(target=state,timestamp=Date.now()){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};const key=typeof gameDailyDateKey==="function"?gameDailyDateKey(timestamp):String(target?.daily?.dateKey||"");
  const currentDaily=target.daily&&typeof target.daily==="object"&&!Array.isArray(target.daily)?target.daily:(target.daily={}),fresh=typeof blankDailyState==="function"?blankDailyState(key):{dateKey:key,bounty:{used:0},arena:{used:0},voidMirage:{highestFloor:0,claimed:false}};
  if(!replaceRecord(currentDaily,fresh))return {ok:false,reason:"daily-reset-failed"};if(typeof window.normalizeMirrorDungeonState!=="function"||typeof window.blankMirrorDungeonState!=="function")return {ok:false,reason:"mirror-owner-missing"};
  const mirror=window.normalizeMirrorDungeonState(target,timestamp),blank=window.blankMirrorDungeonState(key);if(!mirror?.daily||!blank?.daily||!replaceRecord(mirror.daily,blank.daily))return {ok:false,reason:"mirror-reset-failed"};return {ok:true,dateKey:key};
 }
 function commitDailyDungeonReset(){return run("gm-dungeon-daily-reset",live=>resetDailyDungeonState(live));}

 function uiTypes(value){const types=equipmentTypes();return value==="all"?types.slice():types.includes(value)?[value]:[];}
 function installFormalUiWriters(){
  const levelHandler=function(){const cap=typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(state):absoluteMaxLevel(),raw=prompt(`指定等級（1～${cap}）`,state.level);if(raw===null)return false;const n=Number(raw),tx=Number.isInteger(n)?commitCharacterLevel(n):{ok:false,reason:"invalid-level"};if(!tx?.ok){alert(`等級更新失敗：${txReason(tx)}`);return false;}if(typeof render==="function")render();return true;};
  const progressHandler=function(){const max=firstWorldMaxLevel(),raw=prompt(`指定目前攻略到哪個等級關卡（1～${max}）`,state.level);if(raw===null)return false;const n=Number(raw),plan=Number.isInteger(n)?firstWorldProgressPlan(n):{ok:false,reason:"invalid-progress"};if(!plan.ok){alert(`請輸入 1～${max} 的整數。`);return false;}const tx=commitFirstWorldProgress(n);if(!tx?.ok){alert(`銀河紀元進度更新失敗：${txReason(tx)}`);return false;}window.selectedMap=plan.currentMap;window.selectedEnemy=plan.currentEnemy;window.selectedBattleCount=1;if(typeof render==="function")render();if(plan.currentEnemy===4&&state.level<n)alert(`主線進度已指定到 Lv.${n} Boss。依原本規則，角色需達 Lv.${n} 後 Boss 才會顯示。`);return true;};
  const w1GearHandler=function(){const q=Number(document.getElementById("gmGearQuality")?.value),level=Number(document.getElementById("gmGearLevel")?.value),types=uiTypes(document.getElementById("gmGearType")?.value);if(!Number.isInteger(q)||q<0||q>5||!Number.isInteger(level)||level<1||level>firstWorldMaxLevel()||!types.length)return false;const tx=commitGeneratedEquipment({world:1,q,level,types});if(!tx?.ok){alert(`銀河紀元裝備產生失敗：${txReason(tx)}`);return false;}if(typeof render==="function")render();return true;};
  const w2GearHandler=function(){if(typeof window.gmSecondWorldGearChangeBoss==="function")window.gmSecondWorldGearChangeBoss();const q=Math.floor(Number(document.getElementById("gmSecondWorldGearQuality")?.value)),bossIndex=Math.floor(Number(document.getElementById("gmSecondWorldGearBoss")?.value)),types=uiTypes(document.getElementById("gmSecondWorldGearType")?.value);if(!Number.isInteger(q)||q<1||q>5||!Number.isInteger(bossIndex)||!types.length)return false;const tx=commitGeneratedEquipment({world:2,q,bossIndex,types});if(!tx?.ok){alert(`宇宙紀元裝備產生失敗：${txReason(tx)}`);return false;}if(typeof render==="function")render();alert(`已產生 ${tx?.value?.created||types.length} 件宇宙紀元裝備。`);return true;};
  const w3GearHandler=function(){if(typeof window.gmThirdWorldGearChangeBoss==="function")window.gmThirdWorldGearChangeBoss();const q=Math.floor(Number(document.getElementById("gmThirdWorldGearQuality")?.value)),bossIndex=Math.floor(Number(document.getElementById("gmThirdWorldGearBoss")?.value)),types=uiTypes(document.getElementById("gmThirdWorldGearType")?.value);if((q!==4&&q!==5)||!Number.isInteger(bossIndex)||!types.length)return false;const tx=commitGeneratedEquipment({world:3,q,bossIndex,types});if(!tx?.ok){alert(`高維紀元裝備產生失敗：${txReason(tx)}`);return false;}if(typeof render==="function")render();alert(`已產生 ${tx?.value?.created||types.length} 件高維紀元裝備。`);return true;};
  const enhancementHandler=function(){const tx=commitEnhancementLevels(enhancementValuesFromUi(state));if(!tx?.ok){alert(`強化等級更新失敗：${txReason(tx)}`);return false;}if(typeof render==="function")render();alert("強化等級已更新。");return true;};
  const vipResetHandler=function(){if(!confirm("確定要將 VIP 等級與 VIP 積分全部重置為 0 嗎？"))return false;const tx=commitVipReset();if(!tx?.ok){alert(`VIP 重置失敗：${txReason(tx)}`);return false;}if(typeof render==="function")render();return true;};
  for(const [name,handler] of Object.entries({gmLevel:levelHandler,gmSetWorldProgress:progressHandler,gmCreateGear:w1GearHandler,gmCreateSecondWorldGear:w2GearHandler,gmCreateThirdWorldGear:w3GearHandler,gmApplyEnhancementLevels:enhancementHandler,gmResetVip:vipResetHandler})){handler.__gmFormalTransactionVersion=UI_CONVERGENCE_VERSION;window[name]=handler;}return true;
 }

 function integrity(){
  const errors=[];if(typeof window.runSettlementTransaction!=="function")errors.push({code:"TRANSACTION_OWNER"});
  const w1={level:100,exp:20,hp:1,gold:1,secondWorld:{entered:false},thirdWorld:{entered:false}},w2={gold:1,secondWorld:{entered:true,darkMatter:2,darkEnergy:3},thirdWorld:{entered:false}},w3={gold:1,secondWorld:{entered:true,darkMatter:2,darkEnergy:3},thirdWorld:{entered:true,dimensionalStrings:4}};
  if(applyResource("gold",9,w1)?.ok!==true||w1.gold!==9)errors.push({code:"RESOURCE_W1"});if(applyResource("dark-matter",8,w2)?.ok!==true||applyResource("dark-energy",7,w2)?.ok!==true||w2.secondWorld.darkMatter!==8||w2.secondWorld.darkEnergy!==7)errors.push({code:"RESOURCE_W2"});if(applyResource("dimensional-strings",6,w3)?.ok!==true||w3.thirdWorld.dimensionalStrings!==6)errors.push({code:"RESOURCE_W3"});if(applyResource("gold",5,w2)?.ok!==false||applyResource("dark-matter",5,w3)?.ok!==false)errors.push({code:"RESOURCE_PHASE_GUARD"});
  const makeEnhancement=phase=>({secondWorld:{entered:phase>=2},thirdWorld:{entered:phase>=3},enhancement:{basicStones:0,advancedStones:0,levels:{weapon:phase>=3?40:phase===2?20:0,helmet:phase>=3?40:phase===2?20:0,armor:phase>=3?40:phase===2?20:0,shoes:phase>=3?40:phase===2?20:0,accessory:phase>=3?40:phase===2?20:0}}}),e1=makeEnhancement(1),e2=makeEnhancement(2),e3=makeEnhancement(3),slots=enhancementSlots(),values1=Object.fromEntries(slots.map(type=>[type,20])),values2=Object.fromEntries(slots.map(type=>[type,30])),values3=Object.fromEntries(slots.map(type=>[type,40]));
  if(applyEnhancementLevels(values1,e1)?.ok!==true||slots.some(type=>e1.enhancement.levels[type]!==20))errors.push({code:"ENHANCEMENT_W1"});if(applyEnhancementLevels(values2,e2)?.ok!==true||slots.some(type=>e2.enhancement.levels[type]!==30))errors.push({code:"ENHANCEMENT_W2"});if(applyEnhancementLevels(values3,e3)?.ok!==true||slots.some(type=>e3.enhancement.levels[type]!==40))errors.push({code:"ENHANCEMENT_W3"});const invalidW2=Object.fromEntries(slots.map(type=>[type,19]));if(applyEnhancementLevels(invalidW2,e2)?.ok!==false)errors.push({code:"ENHANCEMENT_MIN_GUARD"});
  const dungeon={vipPoints:1,daily:{dateKey:"2099-01-01",bounty:{used:1},arena:{used:2},voidMirage:{highestFloor:3,claimed:false}},dungeon:{voidMirage:{highestCleared:4}}},applied=applyDungeonValues({points:99,bounty:20,arena:19,highest:12,dailyHighest:15,claimed:true},dungeon,{normalizeVip:false});if(applied?.ok!==true||dungeon.vipPoints!==99||dungeon.daily.bounty.used!==20||dungeon.daily.arena.used!==19||dungeon.dungeon.voidMirage.highestCleared!==15||dungeon.daily.voidMirage.highestFloor!==15||dungeon.daily.voidMirage.claimed!==true)errors.push({code:"DUNGEON_ATOMIC_MUTATION",applied});
  const progressFixture={secondWorld:{entered:false},thirdWorld:{entered:false}},progress=applyFirstWorldProgress(17,progressFixture);if(progress?.ok!==true||progressFixture.unlockedMap!==3||progress.currentEnemy!==1||progressFixture.mapProgress[0][0]!==10||progressFixture.bossKilled[0]!==true)errors.push({code:"FIRST_WORLD_PROGRESS",progress});
  const vipFixture={vipLevel:8,vipPoints:123,hp:50,secondWorld:{entered:false},thirdWorld:{entered:false}},vip=applyVipReset(vipFixture);if(vip?.ok!==true||vipFixture.vipLevel!==0||vipFixture.vipPoints!==0)errors.push({code:"VIP_RESET"});
  return Object.freeze({version:VERSION,characterVersion:CHARACTER_VERSION,mainlineVersion:MAINLINE_VERSION,gearVersion:GEAR_VERSION,enhancementVersion:ENHANCEMENT_VERSION,vipResetVersion:VIP_RESET_VERSION,uiConvergenceVersion:UI_CONVERGENCE_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.GM_FORMAL_TRANSACTION_OWNER_VERSION=VERSION;window.GM_FORMAL_RESOURCE_TRANSACTION_VERSION=RESOURCE_VERSION;window.GM_FORMAL_DUNGEON_TRANSACTION_VERSION=DUNGEON_VERSION;window.GM_FORMAL_DAILY_RESET_TRANSACTION_VERSION=DAILY_RESET_VERSION;window.GM_FORMAL_ENHANCEMENT_TRANSACTION_VERSION=ENHANCEMENT_VERSION;window.GM_FORMAL_CHARACTER_TRANSACTION_VERSION=CHARACTER_VERSION;window.GM_FORMAL_MAINLINE_TRANSACTION_VERSION=MAINLINE_VERSION;window.GM_FORMAL_GEAR_TRANSACTION_VERSION=GEAR_VERSION;window.GM_FORMAL_VIP_RESET_TRANSACTION_VERSION=VIP_RESET_VERSION;window.GM_FORMAL_MARK_TRANSACTION_VERSION=MARK_VERSION;window.GM_FORMAL_UI_WRITER_CONVERGENCE_VERSION=UI_CONVERGENCE_VERSION;
 window.gmApplyFormalCharacterLevelMutation=applyCharacterLevel;window.gmCommitFormalCharacterLevelMutation=commitCharacterLevel;window.gmFirstWorldProgressPlan=firstWorldProgressPlan;window.gmApplyFormalFirstWorldProgressMutation=applyFirstWorldProgress;window.gmCommitFormalFirstWorldProgressMutation=commitFirstWorldProgress;window.gmApplyFormalResourceMutation=applyResource;window.gmCommitFormalResourceMutation=commitResource;window.gmApplyFormalEnhancementMutation=applyEnhancementLevels;window.gmCommitFormalEnhancementMutation=commitEnhancementLevels;window.gmApplyFormalMarkMutation=applyMarkLevels;window.gmCommitFormalMarkMutation=commitMarkLevels;window.gmApplyFormalGeneratedEquipmentMutation=applyGeneratedEquipment;window.gmCommitFormalGeneratedEquipmentMutation=commitGeneratedEquipment;window.gmApplyFormalVipResetMutation=applyVipReset;window.gmCommitFormalVipResetMutation=commitVipReset;window.gmApplyFormalDungeonMutation=applyDungeonValues;window.gmCommitFormalDungeonMutation=commitDungeonValues;window.gmResetFormalDailyDungeonMutation=resetDailyDungeonState;window.gmCommitFormalDailyDungeonReset=commitDailyDungeonReset;
 installFormalUiWriters();window.GM_FORMAL_TRANSACTION_INTEGRITY=integrity();if(!window.GM_FORMAL_TRANSACTION_INTEGRITY.passed)console.error("[文明戰線] GM formal transaction integrity error",window.GM_FORMAL_TRANSACTION_INTEGRITY.errors);
})();