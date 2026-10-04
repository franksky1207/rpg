(function(){
 const VERSION=1;
 const CANONICAL_MUTATION_VERSION=1;
 const TRANSACTION_VERSION=1;

 function whole(value){const n=Number(value);return Number.isFinite(n)&&Number.isSafeInteger(n)?n:null;}
 function maxDepth(){return Math.max(1,Math.floor(Number(window.ALTERNATE_UNIVERSE_MAX_DEPTH)||1000));}
 function lifeId(target=state){
  if(typeof window.reincarnationCount==="function")return Math.max(0,Math.floor(Number(window.reincarnationCount(target))||0));
  return Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0));
 }
 function normalize(target){if(typeof window.normalizeReincarnationState==="function")window.normalizeReincarnationState(target);return target;}
 function alternate(target=state){return target?.reincarnation?.alternateUniverse&&typeof target.reincarnation.alternateUniverse==="object"?target.reincarnation.alternateUniverse:null;}
 function formalSnapshot(target=state){
  const progression=typeof window.alternateUniverseProgressionSnapshot==="function"?window.alternateUniverseProgressionSnapshot(target):null;
  const au=alternate(target),currentLife=lifeId(target);
  const active=typeof window.alternateUniverseActiveAttempt==="function"?window.alternateUniverseActiveAttempt(target):au?.activeAttempt||null;
  const failureOwner=au?.lifeFailures&&Number(au.lifeFailures.lifeId)===currentLife&&au.lifeFailures.failures&&typeof au.lifeFailures.failures==="object"?au.lifeFailures.failures:{};
  const failures=Object.fromEntries(Object.entries(failureOwner).map(([depth,count])=>[String(Math.max(1,Math.floor(Number(depth)||1))),Math.max(0,Math.min(10,Math.floor(Number(count)||0)))]).filter(([,count])=>count>0).sort((a,b)=>Number(a[0])-Number(b[0])));
  const deepest=Math.max(0,Math.min(maxDepth(),Math.floor(Number(progression?.deepestCleared??au?.deepestCleared)||0)));
  const unlocked=progression?.unlocked===true||au?.unlocked===true;
  return Object.freeze({version:VERSION,lifeId:currentLife,unlocked,deepestCleared:unlocked?deepest:0,maxDepth:maxDepth(),completed:unlocked&&deepest>=maxDepth(),frontier:unlocked&&deepest<maxDepth()?deepest+1:null,activeAttempt:active?JSON.parse(JSON.stringify(active)):null,failures:Object.freeze({...failures})});
 }
 function plan(values,target=state){
  const depth=whole(values?.deepestCleared);
  if(depth==null||depth<0||depth>maxDepth())return Object.freeze({ok:false,reason:"invalid-depth"});
  if(values?.unlocked!==true&&values?.unlocked!==false)return Object.freeze({ok:false,reason:"invalid-unlock"});
  const before=formalSnapshot(target),unlocked=depth>0?true:values.unlocked===true;
  const nextDepth=unlocked?depth:0;
  return Object.freeze({
   ok:true,reason:"",before,lifeId:before.lifeId,unlocked,deepestCleared:nextDepth,maxDepth:before.maxDepth,completed:unlocked&&nextDepth>=before.maxDepth,frontier:unlocked&&nextDepth<before.maxDepth?nextDepth+1:null,
   clearsActiveAttempt:!!before.activeAttempt,resetsLifeFailures:Object.keys(before.failures).length>0,
   changed:before.unlocked!==unlocked||before.deepestCleared!==nextDepth||!!before.activeAttempt||Object.keys(before.failures).length>0,
   forcedUnlock:depth>0&&values.unlocked!==true
  });
 }
 function apply(values,target=state){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};
  const next=plan(values,target);if(!next.ok)return next;
  normalize(target);
  const au=alternate(target);if(!au)return {ok:false,reason:"alternate-universe-state-missing"};
  const currentLife=lifeId(target);
  au.unlocked=next.unlocked;
  au.deepestCleared=next.deepestCleared;
  au.activeAttempt=null;
  au.lifeFailures={lifeId:currentLife,failures:{}};
  normalize(target);
  const after=formalSnapshot(target);
  return {ok:true,reason:"",before:next.before,after,unlocked:after.unlocked,deepestCleared:after.deepestCleared,frontier:after.frontier,completed:after.completed,lifeId:after.lifeId,clearedActiveAttempt:next.clearsActiveAttempt,resetLifeFailures:next.resetsLifeFailures,forcedUnlock:next.forcedUnlock};
 }
 function commit(values){
  if(typeof window.runSettlementTransaction!=="function")return {ok:false,reason:"transaction-owner-missing",rolledBack:false,saved:false};
  return window.runSettlementTransaction({label:"gm-alternate-universe-progress",mutate:live=>apply(values,live)});
 }
 function esc(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
 function failureText(snapshot){
  const rows=Object.entries(snapshot.failures||{});
  return rows.length?rows.map(([depth,count])=>`第 ${depth} 層域：${count} / 10 敗`).join("｜"):"本輪沒有失敗紀錄";
 }
 function activeText(snapshot){
  const a=snapshot.activeAttempt;if(!a)return "無進行中的挑戰";
  const traits=Array.isArray(a.traits)?a.traits.join("＋"):"";
  return `第 ${a.depth} 層域｜${traits||"特性未記錄"}`;
 }
 function previewText(next){
  if(!next?.ok)return `預覽失敗：${next?.reason||"未知錯誤"}`;
  const notes=[];
  if(next.forcedUnlock)notes.push("最深進度大於 0，因此會自動維持異宇宙解鎖");
  if(next.clearsActiveAttempt)notes.push("清除目前進行中的異宇宙挑戰");
  if(next.resetsLifeFailures)notes.push("清空本輪失敗次數");
  const frontier=next.completed?"已完成全部層域":next.unlocked?`下一層域：第 ${next.frontier} 層域`:"異宇宙未解鎖";
  return `套用後：${next.unlocked?"已解鎖":"未解鎖"}｜已征服 ${next.deepestCleared} / ${next.maxDepth} 層域｜${frontier}${notes.length?`｜${notes.join("；")}`:""}`;
 }
 function managementHtml(){
  const s=formalSnapshot(state),failure=failureText(s),active=activeText(s);
  const frontier=s.completed?"全部完成":s.unlocked?`第 ${s.frontier} 層域`:"—";
  return `<div class="muted gm-hub-note">正式資料管理：可設定異宇宙是否解鎖與「最深已完成層域」。操作會走 shared transaction 與既有轉生／異宇宙 normalization；套用正式進度時會清除進行中的異宇宙挑戰與本輪失敗次數，避免留下不屬於新 frontier 的生命週期資料。</div><div class="item"><b>目前正式異宇宙狀態</b><div class="muted" style="margin-top:6px;line-height:1.65">生命週期：第 ${s.lifeId} 次轉生｜${s.unlocked?"已解鎖":"未解鎖"}<br>已征服：${s.deepestCleared} / ${s.maxDepth} 層域｜下一層域：${frontier}<br>進行中挑戰：${esc(active)}<br>本輪失敗：${esc(failure)}</div></div><div class="item" style="margin-top:10px"><b>指定正式異宇宙進度</b><div class="controls" style="align-items:end;margin-top:8px"><label>解鎖狀態<br><select id="gmAlternateUniverseUnlocked" class="btn"><option value="1" ${s.unlocked?"selected":""}>已解鎖</option><option value="0" ${!s.unlocked?"selected":""}>未解鎖</option></select></label><label>最深已完成層域<br><input id="gmAlternateUniverseDeepest" class="btn" type="number" inputmode="numeric" min="0" max="${s.maxDepth}" step="1" value="${s.deepestCleared}"></label><button class="btn" type="button" onclick="gmPreviewAlternateUniverseProgress()">預覽變更</button><button class="btn blue" type="button" onclick="gmApplyAlternateUniverseProgress()">套用正式進度</button></div><div id="gmAlternateUniversePreview" class="muted" style="margin-top:8px">最深進度大於 0 時，解鎖狀態會自動維持為「已解鎖」。</div></div>`;
 }
 function valuesFromUi(){
  const unlock=document.getElementById("gmAlternateUniverseUnlocked"),depth=document.getElementById("gmAlternateUniverseDeepest");
  return {unlocked:String(unlock?.value)==="1",deepestCleared:Number(depth?.value)};
 }
 function previewFromUi(){
  const next=plan(valuesFromUi(),state),box=document.getElementById("gmAlternateUniversePreview");
  if(box)box.textContent=previewText(next);
  return next;
 }
 function applyFromUi(){
  const values=valuesFromUi(),next=plan(values,state);
  if(!next.ok){alert(next.reason==="invalid-depth"?`請輸入 0～${maxDepth()} 的整數層域。`:"異宇宙設定無效。");return false;}
  const destructive=next.before.deepestCleared>next.deepestCleared||(next.before.unlocked&&!next.unlocked);
  if(destructive&&typeof confirm==="function"&&!confirm(`這會降低或清除正式異宇宙進度。\n目前：${next.before.deepestCleared} 層域\n套用後：${next.deepestCleared} 層域\n確定繼續？`))return false;
  const tx=commit(values);
  if(!tx?.ok){alert(`異宇宙正式進度更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
  if(typeof render==="function")render();
  const result=tx.value?.after||formalSnapshot(state);
  alert(`異宇宙正式進度已更新。\n${result.unlocked?"已解鎖":"未解鎖"}｜已征服 ${result.deepestCleared} / ${result.maxDepth} 層域${result.completed?"｜全部完成":result.unlocked?`｜下一層域 ${result.frontier}`:""}`);
  return true;
 }
 function validate(){
  const errors=[];
  const fixture={saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:37,activeAttempt:{lifeId:2,depth:38,attemptId:"gm-au-probe",traits:["strong","swift"]},lifeFailures:{lifeId:2,failures:{"38":4,"50":2}}}}};
  const p=plan({unlocked:true,deepestCleared:150},fixture);if(!p.ok||p.deepestCleared!==150||p.frontier!==151||p.clearsActiveAttempt!==true||p.resetsLifeFailures!==true)errors.push({code:"PLAN_150",actual:p});
  const out=apply({unlocked:true,deepestCleared:150},fixture),snap=formalSnapshot(fixture);if(!out.ok||snap.deepestCleared!==150||snap.frontier!==151||snap.activeAttempt!==null||Object.keys(snap.failures).length!==0)errors.push({code:"CANONICAL_150",actual:{out,snap}});
  const lock=apply({unlocked:false,deepestCleared:0},fixture),locked=formalSnapshot(fixture);if(!lock.ok||locked.unlocked!==false||locked.deepestCleared!==0||locked.frontier!==null)errors.push({code:"LOCK_RESET",actual:{lock,locked}});
  const forced=apply({unlocked:false,deepestCleared:12},fixture),forcedSnap=formalSnapshot(fixture);if(!forced.ok||forcedSnap.unlocked!==true||forcedSnap.deepestCleared!==12||forcedSnap.frontier!==13)errors.push({code:"DEPTH_FORCES_UNLOCK",actual:{forced,forcedSnap}});
  if(plan({unlocked:true,deepestCleared:maxDepth()+1},fixture).ok)errors.push({code:"DEPTH_RANGE_GUARD"});
  return Object.freeze({version:VERSION,canonicalMutationVersion:CANONICAL_MUTATION_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_VERSION=VERSION;
 window.GM_ALTERNATE_UNIVERSE_CANONICAL_MUTATION_VERSION=CANONICAL_MUTATION_VERSION;
 window.GM_ALTERNATE_UNIVERSE_TRANSACTION_VERSION=TRANSACTION_VERSION;
 window.gmAlternateUniverseFormalSnapshot=formalSnapshot;
 window.gmAlternateUniverseProgressPlan=plan;
 window.gmApplyFormalAlternateUniverseProgress=apply;
 window.gmCommitFormalAlternateUniverseProgress=commit;
 window.gmAlternateUniverseManagementHtml=managementHtml;
 window.gmPreviewAlternateUniverseProgress=previewFromUi;
 window.gmApplyAlternateUniverseProgress=applyFromUi;
 window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_INTEGRITY=validate();
 if(typeof window.registerGmHubSection==="function")window.registerGmHubSection("manage","異宇宙管理",managementHtml,{id:"alternate-universe-manage"});
 if(!window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_INTEGRITY.passed)console.error("[文明戰線] GM alternate universe management integrity error",window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_INTEGRITY.errors);
})();
