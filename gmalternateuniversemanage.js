(function(){
 const VERSION=4;
 const CANONICAL_MUTATION_VERSION=3;
 const TRANSACTION_VERSION=1;
 const FORMAL_SNAPSHOT_OWNER_VERSION=2;
 const TITLE_SYNC_VERSION=2;
 const TITLE_THRESHOLD_OWNER_VERSION=1;

 function whole(value){const n=Number(value);return Number.isFinite(n)&&Number.isSafeInteger(n)?n:null;}
 function maxDepth(){return Math.max(1,Math.floor(Number(window.ALTERNATE_UNIVERSE_MAX_DEPTH)||1000));}
 function lifeId(target=state){
  if(typeof window.reincarnationCount==="function")return Math.max(0,Math.floor(Number(window.reincarnationCount(target))||0));
  return Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0));
 }
 function normalize(target){if(typeof window.normalizeReincarnationState==="function")window.normalizeReincarnationState(target);return target;}
 function alternate(target=state){return target?.reincarnation?.alternateUniverse&&typeof target.reincarnation.alternateUniverse==="object"?target.reincarnation.alternateUniverse:null;}
 function titleDefs(){return Array.from(window.ALTERNATE_UNIVERSE_PLAYER_TITLE_DEFS||[]).filter(def=>def?.series==="alternate-universe").sort((a,b)=>(Number(a?.tier)||0)-(Number(b?.tier)||0));}
 function eligibleTitleDefs(depth){const value=Math.max(0,Math.floor(Number(depth)||0));return titleDefs().filter(def=>value>=Math.max(0,Math.floor(Number(def?.depthThreshold)||0)));}
 function titleSnapshot(target=state,depth=null){
  const defs=titleDefs(),unlocked=new Set(Array.isArray(target?.titles?.unlocked)?target.titles.unlocked:[]);
  const acquired=defs.filter(def=>unlocked.has(def.id)),current=acquired[acquired.length-1]||null;
  const deepest=Math.max(0,Math.min(maxDepth(),Math.floor(Number(depth??alternate(target)?.deepestCleared)||0)));
  const eligibleTier=eligibleTitleDefs(deepest).length;
  const next=defs.find(def=>!unlocked.has(def.id))||null;
  return Object.freeze({version:TITLE_SYNC_VERSION,count:defs.length,acquiredCount:acquired.length,eligibleTier,current:current?Object.freeze({id:current.id,name:current.name,tier:current.tier,depthThreshold:current.depthThreshold}):null,next:next?Object.freeze({id:next.id,name:next.name,tier:next.tier,depthThreshold:next.depthThreshold}):null,acquired:Object.freeze(acquired.map(def=>Object.freeze({id:def.id,name:def.name,tier:def.tier,depthThreshold:def.depthThreshold})))});
 }
 function formalSnapshot(target=state){
  const lifecycle=typeof window.alternateUniverseLifecycleSnapshot==="function"?window.alternateUniverseLifecycleSnapshot(target):null;
  if(!lifecycle)return Object.freeze({version:VERSION,formalSnapshotOwnerVersion:FORMAL_SNAPSHOT_OWNER_VERSION,titleSyncVersion:TITLE_SYNC_VERSION,lifeId:lifeId(target),unlocked:false,deepestCleared:0,maxDepth:maxDepth(),completed:false,frontier:null,activeAttempt:null,failures:Object.freeze({}),title:titleSnapshot(target,0),ownerMissing:true});
  const progression=typeof window.alternateUniverseProgressionSnapshot==="function"?window.alternateUniverseProgressionSnapshot(target):null;
  const deepest=Math.max(0,Math.min(maxDepth(),Math.floor(Number(progression?.deepestCleared??lifecycle.deepestCleared)||0)));
  const unlocked=progression?.unlocked===true||lifecycle.unlocked===true;
  const active=lifecycle.activeAttempt?JSON.parse(JSON.stringify(lifecycle.activeAttempt)):null;
  const title=titleSnapshot(target,unlocked?deepest:0);
  return Object.freeze({version:VERSION,formalSnapshotOwnerVersion:FORMAL_SNAPSHOT_OWNER_VERSION,titleSyncVersion:TITLE_SYNC_VERSION,lifeId:lifecycle.lifeId,unlocked,deepestCleared:unlocked?deepest:0,maxDepth:lifecycle.maxDepth||maxDepth(),completed:unlocked&&deepest>=maxDepth(),frontier:unlocked&&deepest<maxDepth()?deepest+1:null,activeAttempt:active,failures:Object.freeze({...lifecycle.failures}),title,ownerMissing:false});
 }
 function plan(values,target=state){
  const depth=whole(values?.deepestCleared);
  if(depth==null||depth<0||depth>maxDepth())return Object.freeze({ok:false,reason:"invalid-depth"});
  const before=formalSnapshot(target);
  if(before.ownerMissing)return Object.freeze({ok:false,reason:"alternate-universe-lifecycle-owner-missing",before});
  const unlocked=depth>0?true:before.unlocked;
  return Object.freeze({
   ok:true,reason:"",before,lifeId:before.lifeId,unlocked,deepestCleared:depth,maxDepth:before.maxDepth,completed:unlocked&&depth>=before.maxDepth,frontier:unlocked&&depth<before.maxDepth?depth+1:null,
   clearsActiveAttempt:!!before.activeAttempt,resetsLifeFailures:Object.keys(before.failures).length>0,
   changed:before.unlocked!==unlocked||before.deepestCleared!==depth||!!before.activeAttempt||Object.keys(before.failures).length>0,
   forcedUnlock:depth>0&&!before.unlocked
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
  if(typeof window.grantPlayerTitlesForAlternateUniverseDepth!=="function")return {ok:false,reason:"alternate-universe-title-owner-missing"};
  const titleSync=window.grantPlayerTitlesForAlternateUniverseDepth(next.deepestCleared,target,{previousDepth:next.before.deepestCleared});
  const after=formalSnapshot(target);
  return {ok:true,reason:"",before:next.before,after,unlocked:after.unlocked,deepestCleared:after.deepestCleared,frontier:after.frontier,completed:after.completed,lifeId:after.lifeId,clearedActiveAttempt:next.clearsActiveAttempt,resetLifeFailures:next.resetsLifeFailures,forcedUnlock:next.forcedUnlock,titleSync,titleRetainedOnDecrease:next.deepestCleared<next.before.deepestCleared};
 }
 function commit(values){
  if(typeof window.runSettlementTransaction!=="function")return {ok:false,reason:"transaction-owner-missing",rolledBack:false,saved:false};
  return window.runSettlementTransaction({label:"gm-alternate-universe-progress",mutate:live=>apply(values,live)});
 }
 function esc(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");}
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
  const titleBefore=next.before?.title||titleSnapshot(state,next.before?.deepestCleared||0),eligible=eligibleTitleDefs(next.deepestCleared),targetTier=eligible.length,targetDef=eligible[eligible.length-1]||null;
  if(targetDef&&targetTier>titleBefore.acquiredCount)notes.push(`將同步補發至異宇宙第 ${targetTier} 階「${targetDef.name}」`);
  if(next.deepestCleared<next.before.deepestCleared&&titleBefore.acquiredCount>0)notes.push("降低進度不回收已取得異宇宙稱號");
  if(next.forcedUnlock)notes.push("設定正式進度後會自動解鎖異宇宙");
  if(next.clearsActiveAttempt)notes.push("清除目前進行中的異宇宙挑戰");
  if(next.resetsLifeFailures)notes.push("清空本輪失敗次數");
  const frontier=next.completed?"已完成全部層域":next.unlocked?`下一層域：第 ${next.frontier} 層域`:"異宇宙尚未解鎖";
  return `套用後：已征服 ${next.deepestCleared} / ${next.maxDepth} 層域｜${frontier}${notes.length?`｜${notes.join("；")}`:""}`;
 }
 function managementHtml(){
  const s=formalSnapshot(state),failure=failureText(s),active=activeText(s),t=s.title||titleSnapshot(state,s.deepestCleared);
  const frontier=s.completed?"全部完成":s.unlocked?`第 ${s.frontier} 層域`:"—";
  const currentTitle=t.current?`第 ${t.current.tier} 階「${esc(t.current.name)}」`:"尚未取得";
  const nextTitle=t.next?`第 ${t.next.tier} 階「${esc(t.next.name)}」｜${t.next.depthThreshold} 層域`:"10 階全部取得";
  const acquiredNames=t.acquired.length?t.acquired.map(row=>`第 ${row.tier} 階「${esc(row.name)}」`).join("、"):"尚無";
  const thresholds=titleDefs().map(def=>def.depthThreshold).join("、");
  return `<div class="muted gm-hub-note">正式資料管理：只需設定「最深已完成層域」。設定大於 0 時會自動維持解鎖；達到 ${thresholds} 層域會在同一個 shared transaction 內同步補發正式異宇宙稱號。GM 若降低正式進度，已取得稱號視為永久榮譽，不會回收。套用時仍會清除進行中的異宇宙挑戰與本輪失敗次數，避免留下不屬於新 frontier 的生命週期資料。</div><div class="item"><b>目前正式異宇宙狀態</b><div class="muted" style="margin-top:6px;line-height:1.65">生命週期：第 ${s.lifeId} 次轉生｜${s.unlocked?"已解鎖":"未解鎖"}<br>已征服：${s.deepestCleared} / ${s.maxDepth} 層域｜下一層域：${frontier}<br>異宇宙稱號：${currentTitle}｜已取得 ${t.acquiredCount} / ${t.count}<br>下一稱號：${nextTitle}<br>已取得：${acquiredNames}<br>進行中挑戰：${esc(active)}<br>本輪失敗：${esc(failure)}</div></div><div class="item" style="margin-top:10px"><b>指定正式異宇宙進度</b><div class="controls" style="align-items:end;margin-top:8px"><label>最深已完成層域<br><input id="gmAlternateUniverseDeepest" class="btn" type="number" inputmode="numeric" min="0" max="${s.maxDepth}" step="1" value="${s.deepestCleared}"></label><button class="btn" type="button" onclick="gmPreviewAlternateUniverseProgress()">預覽變更</button><button class="btn blue" type="button" onclick="gmApplyAlternateUniverseProgress()">套用正式進度</button></div><div id="gmAlternateUniversePreview" class="muted" style="margin-top:8px">只需輸入最深已完成層域；稱號達標會同步補發，降低進度不回收既有稱號。</div></div>`;
 }
 function valuesFromUi(){
  const depth=document.getElementById("gmAlternateUniverseDeepest");
  return {deepestCleared:Number(depth?.value)};
 }
 function previewFromUi(){
  const next=plan(valuesFromUi(),state),box=document.getElementById("gmAlternateUniversePreview");
  if(box)box.textContent=previewText(next);
  return next;
 }
 function applyFromUi(){
  const values=valuesFromUi(),next=plan(values,state);
  if(!next.ok){alert(next.reason==="invalid-depth"?`請輸入 0～${maxDepth()} 的整數層域。`:"異宇宙設定無效。");return false;}
  const destructive=next.before.deepestCleared>next.deepestCleared;
  if(destructive&&typeof confirm==="function"&&!confirm(`這會降低正式異宇宙進度。\n目前：${next.before.deepestCleared} 層域\n套用後：${next.deepestCleared} 層域\n確定繼續？`))return false;
  const tx=commit(values);
  if(!tx?.ok){alert(`異宇宙正式進度更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
  if(typeof render==="function")render();
  const result=tx.value?.after||formalSnapshot(state);
  const title=result.title?.current?`｜異宇宙稱號：第 ${result.title.current.tier} 階「${result.title.current.name}」`:"｜異宇宙稱號：尚未取得";
  alert(`異宇宙正式進度已更新。\n${result.unlocked?"已解鎖":"未解鎖"}｜已征服 ${result.deepestCleared} / ${result.maxDepth} 層域${result.completed?"｜全部完成":result.unlocked?`｜下一層域 ${result.frontier}`:""}${title}`);
  return true;
 }
 function validate(){
  const errors=[];
  const fixture={saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:37,activeAttempt:{lifeId:2,depth:38,attemptId:"gm-au-probe",traits:["strong","swift"]},lifeFailures:{lifeId:2,failures:{"38":4,"50":2}}}}};
  const beforeRead=JSON.stringify(fixture),readSnapshot=formalSnapshot(fixture),afterRead=JSON.stringify(fixture);if(beforeRead!==afterRead||readSnapshot.failures["38"]!==4||readSnapshot.failures["50"]!==2||readSnapshot.activeAttempt?.attemptId!=="gm-au-probe")errors.push({code:"FORMAL_SNAPSHOT_OWNER",actual:{readSnapshot,beforeRead,afterRead}});
  const p=plan({deepestCleared:150},fixture);if(!p.ok||p.deepestCleared!==150||p.frontier!==151||p.clearsActiveAttempt!==true||p.resetsLifeFailures!==true)errors.push({code:"PLAN_150",actual:p});
  const out=apply({deepestCleared:150},fixture),snap=formalSnapshot(fixture);if(!out.ok||snap.deepestCleared!==150||snap.frontier!==151||snap.activeAttempt!==null||Object.keys(snap.failures).length!==0||snap.title?.acquiredCount<1||out.titleSync?.changed!==true)errors.push({code:"CANONICAL_150",actual:{out,snap}});
  const retainedBefore=snap.title?.acquiredCount||0,down=apply({deepestCleared:50},fixture),downSnap=formalSnapshot(fixture);if(!down.ok||downSnap.deepestCleared!==50||downSnap.title?.acquiredCount!==retainedBefore||down.titleRetainedOnDecrease!==true)errors.push({code:"TITLE_RETAIN_ON_DECREASE",actual:{down,downSnap,retainedBefore}});
  const zero=apply({deepestCleared:0},fixture),zeroSnap=formalSnapshot(fixture);if(!zero.ok||zeroSnap.unlocked!==true||zeroSnap.deepestCleared!==0||zeroSnap.frontier!==1)errors.push({code:"ZERO_PRESERVES_UNLOCK",actual:{zero,zeroSnap}});
  const lockedFixture={saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}}}};
  const lockedZero=apply({deepestCleared:0},lockedFixture),lockedZeroSnap=formalSnapshot(lockedFixture);if(!lockedZero.ok||lockedZeroSnap.unlocked!==false||lockedZeroSnap.deepestCleared!==0||lockedZeroSnap.frontier!==null)errors.push({code:"LOCKED_ZERO_STAYS_LOCKED",actual:{lockedZero,lockedZeroSnap}});
  const forced=apply({deepestCleared:12},lockedFixture),forcedSnap=formalSnapshot(lockedFixture);if(!forced.ok||forcedSnap.unlocked!==true||forcedSnap.deepestCleared!==12||forcedSnap.frontier!==13)errors.push({code:"DEPTH_FORCES_UNLOCK",actual:{forced,forcedSnap}});
  if(plan({deepestCleared:maxDepth()+1},fixture).ok)errors.push({code:"DEPTH_RANGE_GUARD"});
  return Object.freeze({version:VERSION,canonicalMutationVersion:CANONICAL_MUTATION_VERSION,formalSnapshotOwnerVersion:FORMAL_SNAPSHOT_OWNER_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_VERSION=VERSION;
 window.GM_ALTERNATE_UNIVERSE_TITLE_THRESHOLD_OWNER_VERSION=TITLE_THRESHOLD_OWNER_VERSION;
 window.GM_ALTERNATE_UNIVERSE_CANONICAL_MUTATION_VERSION=CANONICAL_MUTATION_VERSION;
 window.GM_ALTERNATE_UNIVERSE_TRANSACTION_VERSION=TRANSACTION_VERSION;
 window.GM_ALTERNATE_UNIVERSE_FORMAL_SNAPSHOT_OWNER_VERSION=FORMAL_SNAPSHOT_OWNER_VERSION;
 window.GM_ALTERNATE_UNIVERSE_TITLE_SYNC_VERSION=TITLE_SYNC_VERSION;
 window.gmAlternateUniverseTitleSnapshot=titleSnapshot;
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
