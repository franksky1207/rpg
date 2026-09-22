(function(){
 let pending=null,busy=false;
 function ensure(){normalizeEnhancementState(state);}
 function universe(){return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;}
 function cap(){return typeof window.effectiveEnhancementCap==="function"?window.effectiveEnhancementCap(state):ENHANCEMENT_MAX_LEVEL;}
 function fmt(stat,value){const rate=stat==="crit"||stat==="dodge";const n=rate?round1(value):Math.ceil(value);return `${STAT_LABELS[stat]||stat} +${n}${rate?"%":""}`;}
 function level(type){ensure();return enhancementLevel(state,type);}
 function progress(){return ENHANCEMENT_SLOTS.reduce((sum,type)=>sum+level(type),0);}
 function costFor(next){return enhancementUpgradeCost(next,state);}
 function hasCost(cost){
  if(!cost?.available)return false;
  if(cost.phase===2)return (Number(state.secondWorld?.darkMatter)||0)>=cost.darkMatter&&(Number(state.secondWorld?.darkEnergy)||0)>=cost.darkEnergy;
  return state.enhancement.basicStones>=cost.basic&&state.enhancement.advancedStones>=cost.advanced;
 }
 function costHtml(cost){
  if(cost?.phase===2)return `<span>暗物質 ×${cost.darkMatter.toLocaleString()}</span><span>暗能量 ×${cost.darkEnergy.toLocaleString()}</span>`;
  return `<span>基礎強化石 ×${cost.basic.toLocaleString()}</span><span>進階強化石 ×${cost.advanced.toLocaleString()}</span>`;
 }
 function confirmCostHtml(cost){
  if(cost?.phase===2)return `<div><span>暗物質</span><b>×${cost.darkMatter.toLocaleString()}</b></div><div><span>暗能量</span><b>×${cost.darkEnergy.toLocaleString()}</b></div>`;
  return `<div><span>基礎強化石</span><b>×${cost.basic.toLocaleString()}</b></div><div><span>進階強化石</span><b>×${cost.advanced.toLocaleString()}</b></div>`;
 }
 function insufficientText(cost){return cost?.phase===2?"暗物質或暗能量不足。":"強化石不足。";}
 function cloneState(){try{return JSON.parse(JSON.stringify(state));}catch(e){return null;}}
 function restoreSnapshot(snapshot){
  if(!snapshot||typeof snapshot!=="object")return false;
  state=snapshot;
  return true;
 }
 function applyUpgradeMutation(type,next,cost){
  if(cost.phase===2){
   if(!state.secondWorld||typeof state.secondWorld!=="object")return {ok:false,reason:"宇宙紀元資源狀態異常。"};
   state.secondWorld.darkMatter=Math.max(0,Math.floor(Number(state.secondWorld.darkMatter)||0)-cost.darkMatter);
   state.secondWorld.darkEnergy=Math.max(0,Math.floor(Number(state.secondWorld.darkEnergy)||0)-cost.darkEnergy);
  }else{
   state.enhancement.basicStones-=cost.basic;
   state.enhancement.advancedStones-=cost.advanced;
  }
  state.enhancement.levels[type]=next;
  if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else normalizeHP();
  return {ok:true};
 }
 function settleUpgrade(type,expectedLevel,next){
  ensure();
  if(!ENHANCEMENT_SLOTS.includes(type))return {ok:false,reason:"無效的強化欄位。"};
  const current=level(type),effectiveCap=cap();
  if(current!==expectedLevel||next!==current+1)return {ok:false,reason:"強化狀態已變更，請重新操作。"};
  if(next>effectiveCap)return {ok:false,reason:"目前紀元尚未開放此強化等級。"};
  const cost=costFor(next);
  if(!cost?.available)return {ok:false,reason:"目前紀元尚未開放此強化等級。"};
  if(!hasCost(cost))return {ok:false,reason:insufficientText(cost)};
  const snapshot=cloneState();
  if(!snapshot)return {ok:false,reason:"無法建立強化前存檔快照。"};
  const mutated=applyUpgradeMutation(type,next,cost);
  if(!mutated.ok)return mutated;
  const saved=typeof save==="function"?save(false):false;
  if(saved!==true){
   restoreSnapshot(snapshot);
   return {ok:false,reason:"存檔失敗，已回復強化前狀態。",rolledBack:true};
  }
  return {ok:true,type,levelBefore:current,levelAfter:next,cost,phase:cost.phase};
 }
 function slotCard(type){
  const lv=level(type),effectiveCap=cap(),max=lv>=effectiveCap,item=state.equipment?.[type]||null,next=Math.min(effectiveCap,lv+1),cost=max?null:costFor(next),pct=enhancementBonusPercent(lv),nextPct=enhancementBonusPercent(next);
  let itemHtmlBlock=`<div class="enhance-empty muted">目前未裝備；欄位仍可永久強化。</div>`;
  if(item){const stat=item.mainStat?.stat||mainStatForType(type),raw=Math.max(0,Number(item.mainStat?.value)||0),actual=enhancedMainStatValue(raw,lv),nextValue=enhancedMainStatValue(raw,next);itemHtmlBlock=`<div class="enhance-item">${itemHtml(item,true)}</div><div class="enhance-stat-row"><span>原始主能力</span><b>${fmt(stat,raw)}</b></div><div class="enhance-stat-row current"><span>目前實際主能力</span><b>${fmt(stat,actual)}</b></div>${max?"":`<div class="enhance-stat-row next"><span>強化後主能力</span><b>${fmt(stat,nextValue)}</b></div>`}`;}
  return `<section class="enhance-slot-card"><div class="enhance-slot-head"><div><h3>${EQUIPMENT_LABELS[type]}</h3><span class="muted">欄位永久強化</span></div><strong>${max?`+${lv} MAX`:`+${lv} / ${effectiveCap}`}</strong></div><div class="enhance-effect">主能力加成 <b>+${pct}%</b>${max?"":` <span>→ +${nextPct}%</span>`}</div>${itemHtmlBlock}${max?`<div class="enhance-max">已達最高強化等級</div>`:`<div class="enhance-cost"><span>下一級 +${next}</span>${costHtml(cost)}</div><button class="btn primary enhance-action" onclick="openEnhancementConfirm('${type}')" ${hasCost(cost)?"":"disabled"}>強化至 +${next}</button>`}</section>`;
 }
 function page(){
  ensure();
  const effectiveCap=cap(),isUniverse=universe();
  const resourceHtml=isUniverse?
   `<div class="enhance-resources"><div><span>暗物質</span><b>${Math.max(0,Math.floor(Number(state.secondWorld?.darkMatter)||0)).toLocaleString()}</b></div><div><span>暗能量</span><b>${Math.max(0,Math.floor(Number(state.secondWorld?.darkEnergy)||0)).toLocaleString()}</b></div></div>`:
   `<div class="enhance-resources"><div><span>基礎強化石</span><b>${state.enhancement.basicStones.toLocaleString()}</b></div><div><span>進階強化石</span><b>${state.enhancement.advancedStones.toLocaleString()}</b></div></div>`;
  const universeNote=isUniverse?`<div class="muted" style="margin-top:8px">宇宙紀元高階強化使用暗物質與暗能量；+21～+40 不設等級、區域或 Boss 進度門檻。</div>`:"";
  return `<div class="function-page enhancement-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><div class="enhance-shell"><div class="card enhance-summary"><div class="enhance-title"><div><h2>裝備欄位強化</h2><div class="muted">永久提升裝備欄位主能力；更換或遺失裝備不影響強化等級。</div></div><div class="enhance-progress">強化進度 <b>${progress()} / ${ENHANCEMENT_SLOTS.length*effectiveCap}</b></div></div>${resourceHtml}${universeNote}</div><div class="enhance-grid">${ENHANCEMENT_SLOTS.map(slotCard).join("")}</div></div></div>`;
 }
 function ensureModal(){if(document.getElementById("enhancementConfirmModal"))return;const el=document.createElement("div");el.className="modal";el.id="enhancementConfirmModal";el.innerHTML=`<div class="modal-box enhancement-confirm-box"><h3>確認強化</h3><div id="enhancementConfirmDetail"></div><div class="controls"><button class="btn" onclick="closeEnhancementConfirm()">取消</button><button id="enhancementConfirmButton" class="btn primary" onclick="confirmEnhancementUpgrade()">確認強化</button></div></div>`;document.body.appendChild(el);}
 window.openEnhancementConfirm=function(type){
  ensure();if(busy||!ENHANCEMENT_SLOTS.includes(type))return;
  const lv=level(type),effectiveCap=cap();if(lv>=effectiveCap)return;
  const next=lv+1,cost=costFor(next);if(!cost?.available)return alert("目前紀元尚未開放此強化等級。");if(!hasCost(cost))return alert(insufficientText(cost));
  pending={type,level:lv,next,cost};ensureModal();
  const item=state.equipment?.[type]||null;
  let actualRow="";
  if(item){const stat=item.mainStat?.stat||mainStatForType(type),raw=Math.max(0,Number(item.mainStat?.value)||0),a=enhancedMainStatValue(raw,lv),b=enhancedMainStatValue(raw,next);actualRow=`<div><span>實際主能力</span><b>${fmt(stat,a)} → ${fmt(stat,b)}</b></div>`;}
  document.getElementById("enhancementConfirmDetail").innerHTML=`<div class="enhance-confirm-question">確定要強化<b>${EQUIPMENT_LABELS[type]}欄位</b>嗎？</div><div class="enhance-confirm-lines"><div><span>強化等級</span><b>+${lv} → +${next}</b></div><div><span>主能力加成</span><b>+${enhancementBonusPercent(lv)}% → +${enhancementBonusPercent(next)}%</b></div>${actualRow}${confirmCostHtml(cost)}</div>`;
  document.getElementById("enhancementConfirmModal").classList.add("show");
 };
 window.closeEnhancementConfirm=function(){if(busy)return;pending=null;document.getElementById("enhancementConfirmModal")?.classList.remove("show");};
 window.confirmEnhancementUpgrade=function(){
  if(busy||!pending)return;
  busy=true;const btn=document.getElementById("enhancementConfirmButton");if(btn)btn.disabled=true;
  try{
   const p=pending,result=settleUpgrade(p.type,p.level,p.next);
   if(!result.ok){alert(result.reason||"強化失敗。");if(result.rolledBack&&typeof render==="function")render();return;}
   pending=null;document.getElementById("enhancementConfirmModal")?.classList.remove("show");render();
  }finally{if(btn)btn.disabled=false;busy=false;}
 };
 window.enhancementPage=page;
 window.performEnhancementUpgrade=settleUpgrade;
 window.ENHANCEMENT_UI_VERSION=6;
 window.SECOND_WORLD_ENHANCEMENT_PLAYER_FLOW_VERSION=1;
 window.SECOND_WORLD_ENHANCEMENT_ATOMIC_UPGRADE_VERSION=1;
 ensureModal();
})();