(function(){
 const VERSION=1;
 const RESOURCE_VERSION=1;
 const DUNGEON_VERSION=1;
 const DAILY_RESET_VERSION=1;

 function formalPhase(target=state){
  if(typeof window.currentWorldPhase==="function"){
   const phase=Number(window.currentWorldPhase(target));
   if(phase===1||phase===2||phase===3)return phase;
  }
  return target?.thirdWorld?.entered===true?3:target?.secondWorld?.entered===true?2:1;
 }
 function finiteInt(value,min=0,max=Number.MAX_SAFE_INTEGER){
  const number=Number(value),n=Math.floor(number);
  return Number.isFinite(number)&&Number.isInteger(number)&&n>=min&&n<=max?n:null;
 }
 function replaceRecord(target,next){
  if(!target||typeof target!=="object"||Array.isArray(target)||!next||typeof next!=="object"||Array.isArray(next))return false;
  Object.keys(target).forEach(key=>{if(!Object.prototype.hasOwnProperty.call(next,key))delete target[key];});
  Object.assign(target,next);
  return true;
 }
 function transaction(label,mutate,{renderAfter=true}={}){
  if(typeof window.runSettlementTransaction!=="function")return {ok:false,reason:"transaction-owner-missing",rolledBack:false,saved:false,label};
  const result=window.runSettlementTransaction({label,mutate});
  if(result?.ok&&renderAfter&&typeof render==="function")render();
  return result;
 }
 function transactionError(name,result){
  alert(`${name}更新失敗：${result?.reason||result?.value?.reason||"未知錯誤"}`);
  return false;
 }

 function applyResource(kind,value,target=state){
  const amount=finiteInt(value);
  if(amount==null)return {ok:false,reason:"invalid-value"};
  const phase=formalPhase(target);
  if(kind==="gold"){
   if(phase!==1)return {ok:false,reason:"wrong-world"};
   target.gold=amount;
  }else if(kind==="dark-matter"){
   if(phase!==2||!target?.secondWorld||typeof target.secondWorld!=="object")return {ok:false,reason:"wrong-world"};
   target.secondWorld.darkMatter=amount;
  }else if(kind==="dark-energy"){
   if(phase!==2||!target?.secondWorld||typeof target.secondWorld!=="object")return {ok:false,reason:"wrong-world"};
   target.secondWorld.darkEnergy=amount;
  }else if(kind==="dimensional-strings"){
   if(phase!==3||!target?.thirdWorld||typeof target.thirdWorld!=="object")return {ok:false,reason:"wrong-world"};
   target.thirdWorld.dimensionalStrings=amount;
  }else return {ok:false,reason:"unknown-resource"};
  return {ok:true,kind,value:amount,phase};
 }
 function promptResource(kind,label,current){
  const raw=prompt(`指定${label}（0 以上）`,Math.max(0,Math.floor(Number(current)||0)));
  if(raw===null)return false;
  const value=finiteInt(raw);
  if(value==null){alert("請輸入 0 以上的整數。");return false;}
  const result=transaction(`gm-resource-${kind}`,live=>applyResource(kind,value,live));
  return result?.ok?true:transactionError(label,result);
 }

 function ensureDungeonTarget(target){
  if(!target||typeof target!=="object")return null;
  const key=typeof gameDailyDateKey==="function"?gameDailyDateKey():String(target?.daily?.dateKey||"");
  if(!target.daily||typeof target.daily!=="object"||Array.isArray(target.daily))target.daily=typeof blankDailyState==="function"?blankDailyState(key):{dateKey:key,bounty:{used:0},arena:{used:0},voidMirage:{highestFloor:0,claimed:false}};
  const daily=target.daily;
  if(!daily.bounty||typeof daily.bounty!=="object")daily.bounty={used:0};
  if(!daily.arena||typeof daily.arena!=="object")daily.arena={used:0};
  if(!daily.voidMirage||typeof daily.voidMirage!=="object")daily.voidMirage={highestFloor:0,claimed:false};
  if(!target.dungeon||typeof target.dungeon!=="object"||Array.isArray(target.dungeon))target.dungeon={};
  if(!target.dungeon.voidMirage||typeof target.dungeon.voidMirage!=="object")target.dungeon.voidMirage={highestCleared:0};
  return {daily,key};
 }
 function applyDungeonValues(values,target=state,{normalizeVip=true}={}){
  const points=finiteInt(values?.points),bounty=finiteInt(values?.bounty,0,20),arena=finiteInt(values?.arena,0,20),highest=finiteInt(values?.highest),dailyHighest=finiteInt(values?.dailyHighest),claimed=values?.claimed===true;
  if([points,bounty,arena,highest,dailyHighest].some(value=>value==null))return {ok:false,reason:"invalid-value"};
  const holder=ensureDungeonTarget(target);if(!holder)return {ok:false,reason:"invalid-target"};
  target.vipPoints=points;
  if(normalizeVip&&typeof normalizeVipState==="function")normalizeVipState(target);
  holder.daily.bounty.used=bounty;
  holder.daily.arena.used=arena;
  const historical=Math.max(highest,dailyHighest);
  target.dungeon.voidMirage.highestCleared=historical;
  holder.daily.voidMirage.highestFloor=dailyHighest;
  holder.daily.voidMirage.claimed=claimed;
  return {ok:true,points,bounty,arena,historical,dailyHighest,claimed};
 }
 function resetDailyDungeonState(target=state,timestamp=Date.now()){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};
  const key=typeof gameDailyDateKey==="function"?gameDailyDateKey(timestamp):String(target?.daily?.dateKey||"");
  const currentDaily=target.daily&&typeof target.daily==="object"&&!Array.isArray(target.daily)?target.daily:(target.daily={});
  const fresh=typeof blankDailyState==="function"?blankDailyState(key):{dateKey:key,bounty:{used:0},arena:{used:0},voidMirage:{highestFloor:0,claimed:false}};
  if(!replaceRecord(currentDaily,fresh))return {ok:false,reason:"daily-reset-failed"};
  if(typeof window.normalizeMirrorDungeonState!=="function"||typeof window.blankMirrorDungeonState!=="function")return {ok:false,reason:"mirror-owner-missing"};
  const mirror=window.normalizeMirrorDungeonState(target,timestamp);
  const blank=window.blankMirrorDungeonState(key);
  if(!mirror?.daily||!blank?.daily||!replaceRecord(mirror.daily,blank.daily))return {ok:false,reason:"mirror-reset-failed"};
  return {ok:true,dateKey:key};
 }
 function voidRunActive(){try{return typeof getVoidMirageRunSnapshot==="function"&&getVoidMirageRunSnapshot()?.active===true;}catch(_){return false;}}
 function mirrorRunActive(){try{return typeof getMirrorDungeonActiveRun==="function"&&getMirrorDungeonActiveRun()?.active===true;}catch(_){return false;}}
 function thirdWorldArenaRunActive(){try{const runtime=typeof window.getThirdWorldArenaRuntimeState==="function"?window.getThirdWorldArenaRuntimeState():null;return runtime?.status==="combat"||runtime?.status==="between"||runtime?.status==="ready";}catch(_){return false;}}

 window.gmGold=function(){
  if(formalPhase(state)!==1)return alert("目前不是銀河紀元。");
  return promptResource("gold","金幣",state.gold);
 };
 window.gmDarkMatter=function(){
  if(formalPhase(state)!==2)return alert("目前不是宇宙紀元。");
  return promptResource("dark-matter","暗物質",state.secondWorld?.darkMatter||0);
 };
 window.gmDarkEnergy=function(){
  if(formalPhase(state)!==2)return alert("目前不是宇宙紀元。");
  return promptResource("dark-energy","暗能量",state.secondWorld?.darkEnergy||0);
 };
 window.gmDimensionalStrings=function(){
  if(formalPhase(state)!==3)return alert("目前不是高維紀元。");
  return promptResource("dimensional-strings","維度之弦",state.thirdWorld?.dimensionalStrings||0);
 };
 window.gmApplyDungeonValues=function(){
  if(voidRunActive()){alert("虛空幻境挑戰進行中，請先結束或強制退出後再修改副本資料。");return false;}
  if(thirdWorldArenaRunActive()){alert("高維競技場挑戰進行中，請先結束目前挑戰後再修改副本資料。");return false;}
  const values={
   points:document.getElementById("gmDungeonPoints")?.value,
   bounty:document.getElementById("gmBountyDailyUsed")?.value,
   arena:document.getElementById("gmArenaDailyUsed")?.value,
   highest:document.getElementById("gmVoidHistoricalHighest")?.value,
   dailyHighest:document.getElementById("gmVoidDailyHighest")?.value,
   claimed:document.getElementById("gmVoidDailyClaimed")?.value==="1"
  };
  if([finiteInt(values.points),finiteInt(values.bounty,0,20),finiteInt(values.arena,0,20),finiteInt(values.highest),finiteInt(values.dailyHighest)].some(value=>value==null)){alert("請輸入有效的 0 以上整數；懸賞與競技場範圍為 0～20。");return false;}
  const result=transaction("gm-dungeon-values",live=>applyDungeonValues(values,live));
  return result?.ok?true:transactionError("副本／VIP資料",result);
 };
 window.gmResetDailyDungeonState=function(){
  if(voidRunActive()){alert("虛空幻境挑戰進行中，請先結束或強制退出後再重置今日副本。");return false;}
  if(mirrorRunActive()){alert("鏡像戰正在進行中，請先結束後再重置今日副本。");return false;}
  if(thirdWorldArenaRunActive()){alert("高維競技場挑戰進行中，請先結束目前挑戰後再重置今日副本。");return false;}
  if(typeof window.normalizeMirrorDungeonState!=="function"||typeof window.blankMirrorDungeonState!=="function"){alert("鏡像戰狀態模組尚未載入，無法完整重置今日副本。");return false;}
  if(!confirm("將重置今日全部副本狀態：懸賞、競技場、虛空與鏡像戰。\n\n虛空歷史最高、鏡像歷史最高與神蹟紀錄都會保留。\n\n確定重置？"))return false;
  const result=transaction("gm-dungeon-daily-reset",live=>resetDailyDungeonState(live));
  if(!result?.ok)return transactionError("今日副本",result);
  return true;
 };

 function integrity(){
  const errors=[];
  if(typeof window.runSettlementTransaction!=="function")errors.push({code:"TRANSACTION_OWNER"});
  const w1={gold:1,secondWorld:{entered:false},thirdWorld:{entered:false}},w2={gold:1,secondWorld:{entered:true,darkMatter:2,darkEnergy:3},thirdWorld:{entered:false}},w3={gold:1,secondWorld:{entered:true,darkMatter:2,darkEnergy:3},thirdWorld:{entered:true,dimensionalStrings:4}};
  if(applyResource("gold",9,w1)?.ok!==true||w1.gold!==9)errors.push({code:"RESOURCE_W1"});
  if(applyResource("dark-matter",8,w2)?.ok!==true||applyResource("dark-energy",7,w2)?.ok!==true||w2.secondWorld.darkMatter!==8||w2.secondWorld.darkEnergy!==7)errors.push({code:"RESOURCE_W2"});
  if(applyResource("dimensional-strings",6,w3)?.ok!==true||w3.thirdWorld.dimensionalStrings!==6)errors.push({code:"RESOURCE_W3"});
  if(applyResource("gold",5,w2)?.ok!==false||applyResource("dark-matter",5,w3)?.ok!==false)errors.push({code:"RESOURCE_PHASE_GUARD"});
  const dungeon={vipPoints:1,daily:{dateKey:"2099-01-01",bounty:{used:1},arena:{used:2},voidMirage:{highestFloor:3,claimed:false}},dungeon:{voidMirage:{highestCleared:4}}};
  const applied=applyDungeonValues({points:99,bounty:20,arena:19,highest:12,dailyHighest:15,claimed:true},dungeon,{normalizeVip:false});
  if(applied?.ok!==true||dungeon.vipPoints!==99||dungeon.daily.bounty.used!==20||dungeon.daily.arena.used!==19||dungeon.dungeon.voidMirage.highestCleared!==15||dungeon.daily.voidMirage.highestFloor!==15||dungeon.daily.voidMirage.claimed!==true)errors.push({code:"DUNGEON_ATOMIC_MUTATION",applied});
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }
 window.GM_FORMAL_TRANSACTION_OWNER_VERSION=VERSION;
 window.GM_FORMAL_RESOURCE_TRANSACTION_VERSION=RESOURCE_VERSION;
 window.GM_FORMAL_DUNGEON_TRANSACTION_VERSION=DUNGEON_VERSION;
 window.GM_FORMAL_DAILY_RESET_TRANSACTION_VERSION=DAILY_RESET_VERSION;
 window.gmApplyFormalResourceMutation=applyResource;
 window.gmApplyFormalDungeonMutation=applyDungeonValues;
 window.gmResetFormalDailyDungeonMutation=resetDailyDungeonState;
 window.GM_FORMAL_TRANSACTION_INTEGRITY=integrity();
 if(!window.GM_FORMAL_TRANSACTION_INTEGRITY.passed)console.error("[文明戰線] GM formal transaction integrity error",window.GM_FORMAL_TRANSACTION_INTEGRITY.errors);
})();
