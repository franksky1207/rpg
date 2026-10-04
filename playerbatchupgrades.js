(function(){
 const VERSION=2;
 const TRANSACTION_VERSION=1;
 let busy=false;

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function phaseOf(target=null){
  const s=target&&typeof target==="object"?target:currentState();
  if(!s)return 1;
  if(typeof window.currentWorldPhase==="function"){
   try{const phase=Number(window.currentWorldPhase(s));if(Number.isInteger(phase)&&phase>=1&&phase<=3)return phase;}catch(_){}
  }
  if(s?.thirdWorld?.entered===true)return 3;
  if(s?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function executeTransaction(label,mutate){
  if(typeof window.runSettlementTransaction!=="function")return {ok:false,reason:"transaction-owner-missing",rolledBack:false,transaction:null};
  const transaction=window.runSettlementTransaction({label,mutate});
  if(transaction?.ok===true)return {ok:true,reason:"",rolledBack:false,transaction};
  const txReason=String(transaction?.reason||"transaction-failed"),reason=txReason==="save-failed"||txReason==="save-exception"?"save":txReason;
  return {ok:false,reason,rolledBack:transaction?.rolledBack===true,transaction};
 }
 function balancedPlan(keys,startLevels,cap,wallet,quote,canAfford,spend){
  const levels=Object.fromEntries(keys.map(key=>[key,Math.max(0,Math.floor(Number(startLevels[key])||0))]));
  const plan=[];
  while(true){
   let min=Infinity,target=null;
   keys.forEach(key=>{const level=levels[key];if(level<cap&&level<min){min=level;target=key;}});
   if(target==null)break;
   const next=levels[target]+1,cost=quote(target,next);
   if(!cost||canAfford(wallet,cost)!==true)break;
   spend(wallet,cost);levels[target]=next;plan.push({key:target,from:next-1,to:next,cost});
  }
  return {steps:plan.length,plan,levels,wallet};
 }

 function specializationPreview(target=null){
  const s=target&&typeof target==="object"?target:currentState(),phase=phaseOf(s),keys=Array.from(window.SPECIALIZATION_KEYS||[]),cap=Math.max(0,Math.floor(Number(window.SPECIALIZATION_MAX_LEVEL)||60));
  if(!s||phase!==1||!keys.length||typeof window.specializationUpgradeCost!=="function")return {available:false,phase,steps:0,reason:phase===1?"owner-missing":"phase-locked"};
  const levels=Object.fromEntries(keys.map(key=>[key,Math.max(0,Math.min(cap,Math.floor(Number(s.specializations?.[key])||0)))]));
  const wallet={gold:Math.max(0,Math.floor(Number(s.gold)||0))},initialGold=wallet.gold;
  const result=balancedPlan(keys,levels,cap,wallet,(_key,next)=>({gold:Math.max(0,Math.floor(Number(window.specializationUpgradeCost(next))||0))}),(w,c)=>w.gold>=c.gold,(w,c)=>{w.gold-=c.gold;});
  return {available:true,phase,steps:result.steps,plan:result.plan,levelsBefore:levels,levelsAfter:result.levels,goldBefore:initialGold,goldAfter:result.wallet.gold,goldSpent:initialGold-result.wallet.gold,allMax:keys.every(key=>result.levels[key]>=cap)};
 }

 function enhancementPreview(target=null){
  const s=target&&typeof target==="object"?target:currentState(),phase=phaseOf(s),keys=Array.from(window.ENHANCEMENT_SLOTS||[]);
  if(!s||!keys.length||!([1,2].includes(phase))||typeof window.enhancementUpgradeCost!=="function"||typeof window.effectiveEnhancementCap!=="function"||typeof window.enhancementLevel!=="function")return {available:false,phase,steps:0,reason:[1,2].includes(phase)?"owner-missing":"phase-locked"};
  const issues=typeof window.enhancementFormalStateIssues==="function"?window.enhancementFormalStateIssues(s):[];
  if(Array.isArray(issues)&&issues.length)return {available:false,phase,steps:0,reason:"formal-state",issues};
  const cap=Math.max(0,Math.floor(Number(window.effectiveEnhancementCap(s))||0));
  const levels=Object.fromEntries(keys.map(key=>[key,Math.max(0,Math.floor(Number(window.enhancementLevel(s,key))||0))]));
  const wallet=phase===2
   ?{darkMatter:Math.max(0,Math.floor(Number(s.secondWorld?.darkMatter)||0)),darkEnergy:Math.max(0,Math.floor(Number(s.secondWorld?.darkEnergy)||0))}
   :{basic:Math.max(0,Math.floor(Number(s.enhancement?.basicStones)||0)),advanced:Math.max(0,Math.floor(Number(s.enhancement?.advancedStones)||0))};
  const initial={...wallet};
  const result=balancedPlan(keys,levels,cap,wallet,(_key,next)=>window.enhancementUpgradeCost(next,s),(w,c)=>{
   if(c?.available!==true||Number(c.phase)!==phase)return false;
   return phase===2?w.darkMatter>=c.darkMatter&&w.darkEnergy>=c.darkEnergy:w.basic>=c.basic&&w.advanced>=c.advanced;
  },(w,c)=>{
   if(phase===2){w.darkMatter-=c.darkMatter;w.darkEnergy-=c.darkEnergy;}
   else{w.basic-=c.basic;w.advanced-=c.advanced;}
  });
  const spent=phase===2?{darkMatter:initial.darkMatter-result.wallet.darkMatter,darkEnergy:initial.darkEnergy-result.wallet.darkEnergy}:{basic:initial.basic-result.wallet.basic,advanced:initial.advanced-result.wallet.advanced};
  return {available:true,phase,steps:result.steps,plan:result.plan,levelsBefore:levels,levelsAfter:result.levels,resourcesBefore:initial,resourcesAfter:result.wallet,spent,cap,allMax:keys.every(key=>result.levels[key]>=cap)};
 }

 function performBalancedSpecializationUpgrade(options={}){
  if(busy)return {ok:false,reason:"busy"};
  let preview=specializationPreview();
  if(!preview.available)return {ok:false,reason:preview.reason||"unavailable"};
  if(preview.steps<=0){if(options.silent!==true)alert(preview.allMax?"8 項專精已全部滿級。":"目前金幣不足以再進行平均提升。");return {ok:false,reason:preview.allMax?"max":"insufficient"};}
  if(options.skipConfirm!==true&&!confirm(`將 8 項專精依目前最低等級優先平均提升，共提升 ${preview.steps} 級。\n消耗金幣：${preview.goldSpent.toLocaleString()}\n是否繼續？`))return {ok:false,reason:"cancelled"};
  busy=true;
  try{
   preview=specializationPreview();
   if(!preview.available||preview.steps<=0)return {ok:false,reason:"state-changed"};
   const result=executeTransaction("player-batch-specialization",root=>{
    root.gold=preview.goldAfter;
    Object.entries(preview.levelsAfter).forEach(([key,level])=>{root.specializations[key]=level;});
    return {ok:true,steps:preview.steps};
   });
   if(!result.ok){
    if(typeof render==="function")render();
    if(options.silent!==true)alert(result.reason==="save"?"存檔失敗，已回復一鍵專精提升前狀態。":"一鍵專精提升失敗，狀態已安全回復。");
    return result;
   }
   if(typeof render==="function")render();
   if(options.silent!==true)alert(`一鍵平均提升完成：共提升 ${preview.steps} 級，消耗金幣 ${preview.goldSpent.toLocaleString()}。`);
   return {ok:true,...preview,transaction:result.transaction};
  }finally{busy=false;}
 }

 function performBalancedEnhancementUpgrade(options={}){
  if(busy)return {ok:false,reason:"busy"};
  let preview=enhancementPreview();
  if(!preview.available){if(options.silent!==true&&preview.reason==="formal-state")alert("強化資料異常，請先使用 GM／存檔檢查處理。");return {ok:false,reason:preview.reason||"unavailable"};}
  if(preview.steps<=0){if(options.silent!==true)alert(preview.allMax?"五個裝備欄位已達目前紀元最高強化等級。":"目前資源不足以再進行平均強化。");return {ok:false,reason:preview.allMax?"max":"insufficient"};}
  const spentText=preview.phase===2?`暗物質 ${preview.spent.darkMatter.toLocaleString()}、暗能量 ${preview.spent.darkEnergy.toLocaleString()}`:`基礎強化石 ${preview.spent.basic.toLocaleString()}、進階強化石 ${preview.spent.advanced.toLocaleString()}`;
  if(options.skipConfirm!==true&&!confirm(`將五個裝備欄位依目前最低強化等級優先提升，共強化 ${preview.steps} 次。\n消耗：${spentText}\n是否繼續？`))return {ok:false,reason:"cancelled"};
  busy=true;
  try{
   preview=enhancementPreview();
   if(!preview.available||preview.steps<=0)return {ok:false,reason:"state-changed"};
   const result=executeTransaction("player-batch-enhancement",root=>{
    Object.entries(preview.levelsAfter).forEach(([key,level])=>{root.enhancement.levels[key]=level;});
    if(preview.phase===2){root.secondWorld.darkMatter=preview.resourcesAfter.darkMatter;root.secondWorld.darkEnergy=preview.resourcesAfter.darkEnergy;}
    else{root.enhancement.basicStones=preview.resourcesAfter.basic;root.enhancement.advancedStones=preview.resourcesAfter.advanced;}
    if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else if(typeof normalizeHP==="function")normalizeHP();
    return {ok:true,steps:preview.steps};
   });
   if(!result.ok){
    if(typeof render==="function")render();
    if(options.silent!==true)alert(result.reason==="save"?"存檔失敗，已回復平均最大強化前狀態。":"平均最大強化失敗，狀態已安全回復。");
    return result;
   }
   if(typeof render==="function")render();
   if(options.silent!==true)alert(`平均最大強化完成：共強化 ${preview.steps} 次。`);
   return {ok:true,...preview,transaction:result.transaction};
  }finally{busy=false;}
 }

 function installControls(){
  const s=currentState(),phase=phaseOf(s);
  const specRow=document.querySelector(".specialization-page .specialization-title-row");
  if(specRow&&phase===1&&!document.getElementById("balancedSpecializationUpgradeButton")){
   const preview=specializationPreview(s),button=document.createElement("button");
   button.id="balancedSpecializationUpgradeButton";button.className="btn primary";button.textContent="一鍵平均提升";button.disabled=!preview.available||preview.steps<=0;button.onclick=()=>performBalancedSpecializationUpgrade();button.style.marginLeft="auto";specRow.appendChild(button);
  }
  const enhanceSummary=document.querySelector(".enhancement-page .enhance-summary");
  if(enhanceSummary&&[1,2].includes(phase)&&!document.getElementById("balancedEnhancementUpgradeButton")){
   const preview=enhancementPreview(s),controls=document.createElement("div"),button=document.createElement("button");
   controls.className="controls";controls.style.marginTop="10px";button.id="balancedEnhancementUpgradeButton";button.className="btn primary";button.textContent="平均最大強化";button.disabled=!preview.available||preview.steps<=0;button.onclick=()=>performBalancedEnhancementUpgrade();controls.appendChild(button);
   const title=enhanceSummary.querySelector(".enhance-title");if(title)title.insertAdjacentElement("afterend",controls);else enhanceSummary.prepend(controls);
  }
 }

 const originalRender=typeof window.render==="function"?window.render:null;
 if(originalRender&&window.PLAYER_BATCH_UPGRADE_RENDER_BRIDGE_VERSION!==1){
  const wrapped=function(...args){const value=originalRender.apply(this,args);installControls();return value;};
  render=wrapped;window.render=wrapped;window.PLAYER_BATCH_UPGRADE_RENDER_BRIDGE_VERSION=1;
 }

 window.PLAYER_BATCH_UPGRADE_VERSION=VERSION;
 window.PLAYER_BATCH_UPGRADE_TRANSACTION_VERSION=TRANSACTION_VERSION;
 window.balancedUpgradePlan=balancedPlan;
 window.specializationBalancedUpgradePreview=specializationPreview;
 window.enhancementBalancedUpgradePreview=enhancementPreview;
 window.performBalancedSpecializationUpgrade=performBalancedSpecializationUpgrade;
 window.performBalancedEnhancementUpgrade=performBalancedEnhancementUpgrade;
 window.installPlayerBatchUpgradeControls=installControls;
 installControls();
})();
