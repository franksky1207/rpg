(function(){
 let pending=null,busy=false;
 function ensure(){normalizeEnhancementState(state);}
 function fmt(stat,value){const rate=stat==="crit"||stat==="dodge";const n=rate?round1(value):Math.ceil(value);return `${STAT_LABELS[stat]||stat} +${n}${rate?"%":""}`;}
 function level(type){ensure();return enhancementLevel(state,type);}
 function progress(){return ENHANCEMENT_SLOTS.reduce((sum,type)=>sum+level(type),0);}
 function slotCard(type){
  const lv=level(type),max=lv>=ENHANCEMENT_MAX_LEVEL,item=state.equipment?.[type]||null,next=Math.min(ENHANCEMENT_MAX_LEVEL,lv+1),cost=max?null:enhancementUpgradeCost(next),pct=enhancementBonusPercent(lv),nextPct=enhancementBonusPercent(next);
  let itemHtmlBlock=`<div class="enhance-empty muted">目前未裝備；欄位仍可永久強化。</div>`;
  if(item){const stat=item.mainStat?.stat||mainStatForType(type),raw=Math.max(0,Number(item.mainStat?.value)||0),actual=enhancedMainStatValue(raw,lv),nextValue=enhancedMainStatValue(raw,next);itemHtmlBlock=`<div class="enhance-item">${itemHtml(item,true)}</div><div class="enhance-stat-row"><span>原始主能力</span><b>${fmt(stat,raw)}</b></div><div class="enhance-stat-row current"><span>目前實際主能力</span><b>${fmt(stat,actual)}</b></div>${max?"":`<div class="enhance-stat-row next"><span>強化後主能力</span><b>${fmt(stat,nextValue)}</b></div>`}`;}
  return `<section class="enhance-slot-card"><div class="enhance-slot-head"><div><h3>${EQUIPMENT_LABELS[type]}</h3><span class="muted">欄位永久強化</span></div><strong>${max?`+${lv} MAX`:`+${lv} / ${ENHANCEMENT_MAX_LEVEL}`}</strong></div><div class="enhance-effect">主能力加成 <b>+${pct}%</b>${max?"":` <span>→ +${nextPct}%</span>`}</div>${itemHtmlBlock}${max?`<div class="enhance-max">已達最高強化等級</div>`:`<div class="enhance-cost"><span>下一級 +${next}</span><span>基礎強化石 ×${cost.basic.toLocaleString()}</span><span>進階強化石 ×${cost.advanced.toLocaleString()}</span></div><button class="btn primary enhance-action" onclick="openEnhancementConfirm('${type}')" ${state.enhancement.basicStones<cost.basic||state.enhancement.advancedStones<cost.advanced?"disabled":""}>強化至 +${next}</button>`}</section>`;
 }
 function page(){ensure();return `<div class="function-page enhancement-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><div class="enhance-shell"><div class="card enhance-summary"><div class="enhance-title"><div><h2>裝備欄位強化</h2><div class="muted">永久提升裝備欄位主能力；更換或遺失裝備不影響強化等級。</div></div><div class="enhance-progress">強化進度 <b>${progress()} / ${ENHANCEMENT_SLOTS.length*ENHANCEMENT_MAX_LEVEL}</b></div></div><div class="enhance-resources"><div><span>基礎強化石</span><b>${state.enhancement.basicStones.toLocaleString()}</b></div><div><span>進階強化石</span><b>${state.enhancement.advancedStones.toLocaleString()}</b></div></div></div><div class="enhance-grid">${ENHANCEMENT_SLOTS.map(slotCard).join("")}</div></div></div>`;}
 function ensureModal(){if(document.getElementById("enhancementConfirmModal"))return;const el=document.createElement("div");el.className="modal";el.id="enhancementConfirmModal";el.innerHTML=`<div class="modal-box enhancement-confirm-box"><h3>確認強化</h3><div id="enhancementConfirmDetail"></div><div class="controls"><button class="btn" onclick="closeEnhancementConfirm()">取消</button><button id="enhancementConfirmButton" class="btn primary" onclick="confirmEnhancementUpgrade()">確認強化</button></div></div>`;document.body.appendChild(el);}
 window.openEnhancementConfirm=function(type){
  ensure();if(busy||!ENHANCEMENT_SLOTS.includes(type))return;
  const lv=level(type);if(lv>=ENHANCEMENT_MAX_LEVEL)return;
  const next=lv+1,cost=enhancementUpgradeCost(next);if(state.enhancement.basicStones<cost.basic||state.enhancement.advancedStones<cost.advanced)return alert("強化石不足。");
  pending={type,level:lv,next,cost};ensureModal();
  const item=state.equipment?.[type]||null;
  let actualRow="";
  if(item){const stat=item.mainStat?.stat||mainStatForType(type),raw=Math.max(0,Number(item.mainStat?.value)||0),a=enhancedMainStatValue(raw,lv),b=enhancedMainStatValue(raw,next);actualRow=`<div><span>實際主能力</span><b>${fmt(stat,a)} → ${fmt(stat,b)}</b></div>`;}
  document.getElementById("enhancementConfirmDetail").innerHTML=`<div class="enhance-confirm-question">確定要強化<b>${EQUIPMENT_LABELS[type]}欄位</b>嗎？</div><div class="enhance-confirm-lines"><div><span>強化等級</span><b>+${lv} → +${next}</b></div><div><span>主能力加成</span><b>+${enhancementBonusPercent(lv)}% → +${enhancementBonusPercent(next)}%</b></div>${actualRow}<div><span>基礎強化石</span><b>×${cost.basic.toLocaleString()}</b></div><div><span>進階強化石</span><b>×${cost.advanced.toLocaleString()}</b></div></div>`;
  document.getElementById("enhancementConfirmModal").classList.add("show");
 };
 window.closeEnhancementConfirm=function(){if(busy)return;pending=null;document.getElementById("enhancementConfirmModal")?.classList.remove("show");};
 window.confirmEnhancementUpgrade=function(){if(busy||!pending)return;busy=true;const btn=document.getElementById("enhancementConfirmButton");if(btn)btn.disabled=true;try{ensure();const p=pending,current=level(p.type),cost=enhancementUpgradeCost(p.next);if(current!==p.level||p.next!==current+1){alert("強化狀態已變更，請重新操作。");return;}if(state.enhancement.basicStones<cost.basic||state.enhancement.advancedStones<cost.advanced){alert("強化石不足。");return;}state.enhancement.basicStones-=cost.basic;state.enhancement.advancedStones-=cost.advanced;state.enhancement.levels[p.type]=p.next;if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else normalizeHP();save(false);pending=null;document.getElementById("enhancementConfirmModal")?.classList.remove("show");render();}finally{if(btn)btn.disabled=false;busy=false;}};
 window.enhancementPage=page;
 window.ENHANCEMENT_UI_VERSION=4;
 ensureModal();
})();
