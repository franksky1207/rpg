(function(){
 const VERSION=1;
 const CANONICAL_REBUILD_VERSION=1;
 const MAX_SAFE_TOTAL=Number.MAX_SAFE_INTEGER;
 const baseManagementHtml=typeof window.gmGeneralManagementHtml==="function"?window.gmGeneralManagementHtml:null;

 function whole(value){
  const n=Number(value);
  return Number.isFinite(n)&&Number.isSafeInteger(n)?n:null;
 }
 function milestones(){
  const source=Array.isArray(window.BREAKTHROUGH_MILESTONE_LEVELS)?window.BREAKTHROUGH_MILESTONE_LEVELS:[100,200,300,400,500,600,700,800,900,1000];
  return source.map(v=>Math.floor(Number(v))).filter(v=>Number.isFinite(v)&&v>0).slice(0,10);
 }
 function isReincarnated(target=state){
  if(typeof window.isReincarnationRun==="function")return window.isReincarnationRun(target)===true;
  return Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0))>0;
 }
 function plan(total){
  const value=whole(total);
  if(value==null||value<0||value>MAX_SAFE_TOTAL)return Object.freeze({ok:false,reason:"invalid-value"});
  const count=Math.max(1,Math.ceil(value/10));
  const currentLife=value===0?0:value-(count-1)*10;
  return Object.freeze({ok:true,total:value,count,currentLife,currentLifeMax:10});
 }
 function blankMilestones(currentLife){
  const earned=Math.max(0,Math.min(10,Math.floor(Number(currentLife)||0)));
  const rows=milestones();
  return Object.fromEntries(rows.map((level,index)=>[String(level),index<earned]));
 }
 function maxHpFor(target){
  try{
   if(typeof window.playerCombatStatsForState==="function")return Math.max(1,Math.floor(Number(window.playerCombatStatsForState(target)?.hp)||1));
   if(target===state&&typeof window.playerCombatStats==="function")return Math.max(1,Math.floor(Number(window.playerCombatStats()?.hp)||1));
  }catch(_){ }
  return Math.max(1,Math.floor(Number(target?.hp)||1));
 }
 function canonicalize(total,target=state){
  if(!target||typeof target!=="object")return {ok:false,reason:"invalid-target"};
  if(!isReincarnated(target))return {ok:false,reason:"first-run-locked"};
  const next=plan(total);if(!next.ok)return next;
  if(typeof window.normalizeReincarnationState==="function")window.normalizeReincarnationState(target);
  if(!target.reincarnation||typeof target.reincarnation!=="object")return {ok:false,reason:"reincarnation-owner-missing"};
  const beforeCount=Math.max(0,Math.floor(Number(target.reincarnation.count)||0));
  const beforeMax=maxHpFor(target),beforeHp=Math.max(0,Math.min(beforeMax,Number(target.hp)||0));
  const wasFull=beforeHp>=beforeMax,ratio=beforeMax>0?beforeHp/beforeMax:1;
  const au=target.reincarnation.alternateUniverse&&typeof target.reincarnation.alternateUniverse==="object"?target.reincarnation.alternateUniverse:null;

  target.reincarnation.count=next.count;
  target.reincarnation.breakthrough={
   permanent:next.total,
   milestoneLifeId:next.count,
   milestones:blankMilestones(next.currentLife)
  };
  if(au&&beforeCount!==next.count){
   au.activeAttempt=null;
   au.lifeFailures={lifeId:next.count,failures:{}};
  }
  if(typeof window.normalizeReincarnationState==="function")window.normalizeReincarnationState(target);
  const afterMax=maxHpFor(target);
  target.hp=wasFull?afterMax:Math.max(0,Math.min(afterMax,Math.round(afterMax*ratio)));
  const snap=typeof window.breakthroughSnapshot==="function"?window.breakthroughSnapshot(target):null;
  return {ok:true,total:next.total,count:next.count,currentLife:next.currentLife,currentLifeMax:10,beforeCount,afterCount:next.count,hpBefore:beforeHp,maxHpBefore:beforeMax,hpAfter:target.hp,maxHpAfter:afterMax,equipmentBonusPercent:Number(snap?.equipmentBonusPercent)||0,finalDamageBonusPercent:(Number(snap?.finalDamageAdd)||0)*100};
 }
 function commit(total){
  if(!isReincarnated(state))return {ok:false,reason:"first-run-locked"};
  if(typeof window.runSettlementTransaction!=="function")return {ok:false,reason:"transaction-owner-missing"};
  return window.runSettlementTransaction({label:"gm-breakthrough-total",mutate:live=>canonicalize(total,live)});
 }
 function summary(target=state){
  const total=typeof window.breakthroughLevel==="function"?Math.max(0,Math.floor(Number(window.breakthroughLevel(target))||0)):Math.max(0,Math.floor(Number(target?.reincarnation?.breakthrough?.permanent)||0));
  if(!isReincarnated(target))return Object.freeze({available:false,total:0,count:0,currentLife:0,currentLifeMax:10});
  const p=plan(total);
  const snap=typeof window.breakthroughSnapshot==="function"?window.breakthroughSnapshot(target):null;
  return Object.freeze({available:true,total,count:Math.max(1,Math.floor(Number(target?.reincarnation?.count)||p.count)),currentLife:typeof window.breakthroughCurrentLifeEarned==="function"?Math.max(0,Math.floor(Number(window.breakthroughCurrentLifeEarned(target))||0)):p.currentLife,currentLifeMax:10,equipmentBonusPercent:Number(snap?.equipmentBonusPercent)||0,finalDamageBonusPercent:(Number(snap?.finalDamageAdd)||0)*100});
 }
 function pct(value){const n=Number(value)||0;return Number.isInteger(n)?String(n):String(Math.round(n*100)/100);}
 function managementBlock(){
  const s=summary(state);if(!s.available)return "";
  return `<div class="item" style="margin-top:12px"><b>突破管理</b><div class="muted" style="margin-top:5px">僅轉生後可用。直接指定正式角色的總突破次數；轉生次數與本輪 10 個突破里程碑會自動同步，並立即套用到正式角色能力與存檔。</div><div class="controls" style="align-items:end;margin-top:8px"><label>突破次數<br><input id="gmBreakthroughTotal" class="btn" type="number" inputmode="numeric" min="0" step="1" value="${s.total}"></label><button class="btn blue" type="button" onclick="gmApplyBreakthroughTotal()">套用突破次數</button></div><div class="muted" style="margin-top:8px">目前：第 ${s.count} 次轉生｜本輪突破 ${s.currentLife} / 10｜裝備 HP／ATK／DEF +${pct(s.equipmentBonusPercent)}%｜最終傷害 +${pct(s.finalDamageBonusPercent)}%</div></div>`;
 }
 function installManagementRenderer(){
  if(typeof baseManagementHtml!=="function")return false;
  const wrapped=function(){return String(baseManagementHtml()||"")+managementBlock();};
  wrapped.__gmBreakthroughManagementVersion=VERSION;
  window.gmGeneralManagementHtml=wrapped;
  return true;
 }
 function applyFromUi(){
  if(!isReincarnated(state)){alert("只有完成第一次轉生後才能使用突破管理。");return false;}
  const input=document.getElementById("gmBreakthroughTotal"),value=Number(input?.value);
  if(!Number.isSafeInteger(value)||value<0){alert("請輸入 0 以上的整數突破次數。");return false;}
  const tx=commit(value);
  if(!tx?.ok){alert(`突破次數更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
  if(typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
  if(typeof render==="function")render();
  const out=tx.value,result=out&&out.ok?out:summary(state);
  alert(`突破次數已設定為 ${value}。\n第 ${result.count} 次轉生｜本輪突破 ${result.currentLife} / 10\n裝備 HP／ATK／DEF +${pct(result.equipmentBonusPercent)}%｜最終傷害 +${pct(result.finalDamageBonusPercent)}%`);
  return true;
 }
 function validate(){
  const errors=[];
  const expected=[[0,1,0],[1,1,1],[10,1,10],[11,2,1],[20,2,10],[25,3,5],[30,3,10],[31,4,1]];
  expected.forEach(([total,count,currentLife])=>{const p=plan(total);if(!p.ok||p.count!==count||p.currentLife!==currentLife)errors.push({code:"PLAN",total,actual:p});});
  if(plan(-1).ok||plan(1.5).ok)errors.push({code:"INVALID_INPUT_GUARD"});
  const first={saveVersion:17,hp:100,reincarnation:{count:0,breakthrough:{permanent:0,milestoneLifeId:0,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:0,failures:{}}}}};
  if(canonicalize(5,first)?.reason!=="first-run-locked")errors.push({code:"FIRST_RUN_LOCK"});
  return Object.freeze({version:VERSION,canonicalRebuildVersion:CANONICAL_REBUILD_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.GM_BREAKTHROUGH_MANAGEMENT_VERSION=VERSION;
 window.GM_BREAKTHROUGH_CANONICAL_REBUILD_VERSION=CANONICAL_REBUILD_VERSION;
 window.gmBreakthroughManagementPlan=plan;
 window.gmBreakthroughManagementSnapshot=summary;
 window.gmApplyFormalBreakthroughMutation=canonicalize;
 window.gmCommitFormalBreakthroughMutation=commit;
 window.gmBreakthroughManagementHtml=managementBlock;
 window.gmApplyBreakthroughTotal=applyFromUi;
 window.GM_BREAKTHROUGH_MANAGEMENT_INTEGRITY=validate();
 installManagementRenderer();
 if(!window.GM_BREAKTHROUGH_MANAGEMENT_INTEGRITY.passed)console.error("[文明戰線] GM breakthrough management integrity error",window.GM_BREAKTHROUGH_MANAGEMENT_INTEGRITY.errors);
})();
