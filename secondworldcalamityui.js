(function(){
 const VERSION=1;
 const noticeQueue=[];
 const ui={selectedId:null,mode:"single",phase:"idle",running:false,message:"",lastBattle:null,finalRun:null};

 function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));}
 function fmt(v){return Math.max(0,Math.floor(Number(v)||0)).toLocaleString();}
 function defs(){return typeof window.getSecondWorldCalamityDefinitions==="function"?window.getSecondWorldCalamityDefinitions():[];}
 function status(id){return typeof window.getSecondWorldCalamityStatus==="function"?window.getSecondWorldCalamityStatus(id):null;}
 function visibleDefs(){return defs().filter(d=>window.isSecondWorldCalamityVisible?.(d.id));}
 function challengeText(st){
  if(st?.completed)return "文明階段已完成";
  if(st?.challengeable)return "可挑戰";
  return "已現身・尚不可挑戰";
 }
 function actions(def,st){
  if(st?.completed)return `<button class="btn primary" onclick="startSecondWorldCalamityUI('${def.id}','single')">單場重打</button>`;
  if(st?.challengeable)return `<button class="btn primary" onclick="startSecondWorldCalamityUI('${def.id}','single')">單場挑戰</button><button class="btn danger" onclick="startSecondWorldCalamityUI('${def.id}','continuous')">連續討伐</button>`;
  return `<button class="btn" disabled>尚未符合挑戰條件</button>`;
 }
 function card(def){
  const st=status(def.id);if(!st)return "";
  const civOk=st.unlock?.previousCivilizationComplete===true;
  const detail=st.completed
   ?`<div class="notice"><b>文明階段已完成</b><div class="muted" style="margin-top:5px">此災厄仍可單場重打；每次皆從滿 HP 開始，且不再增加文明進度。</div></div>`
   :`<div class="muted">主線條件：Lv.${def.level} 區域最終 Boss 已擊敗 ✓<br>文明條件：需要文明 Lv.${def.previousCivilizationLevel} ${civOk?"✓":"✕"}</div>`;
  return `<article class="card calamity-card">
   <div class="calamity-card-head"><div><div class="calamity-region">${esc(def.regionName)}・Lv.${def.level}</div><h3>${esc(def.name)}</h3></div><span class="calamity-threat">文明災厄</span></div>
   <div class="notice"><b>狀態：${challengeText(st)}</b></div>
   ${detail}
   <div class="calamity-hp-row"><span>文明進度</span><strong>${Number(st.progressPercent).toFixed(2).replace(/\.00$/,"")}%</strong></div>
   <div class="bar"><span class="xp" style="width:${Math.max(0,Math.min(100,Number(st.progressPercent)||0))}%"></span></div>
   <div class="calamity-hp-row"><span>災厄 HP</span><strong>${fmt(st.currentHp)} / ${fmt(st.maxHp)}</strong></div>
   <div class="bar calamity-hp-bar"><span class="hp" style="width:${Math.max(0,Math.min(100,Number(st.hpPercent)||0))}%"></span></div>
   <div class="calamity-actions">${actions(def,st)}</div>
  </article>`;
 }
 function idle(){
  const list=visibleDefs();
  return `<section class="calamity-shell calamity-home">
   <div class="back-home"><button class="btn back-btn" onclick="leaveSecondWorldCalamityUI()">← 返回主頁</button></div>
   <div class="calamity-title card"><h2>宇宙紀元・文明災厄</h2><div class="muted">擊敗各區域最終 Boss 後，對應文明災厄將會現身。災厄出現後會永久顯示於此；是否能挑戰，需同時滿足主線進度與前置文明等級。每隻災厄完成 30 次完整擊殺後，可提升 1 級文明等級。</div></div>
   ${ui.message?`<div class="notice">${esc(ui.message)}</div>`:""}
   <div class="calamity-grid">${list.length?list.map(card).join(""):'<div class="card calamity-empty"><h3>尚無已現身的文明災厄</h3><div class="muted">擊敗每個宇宙區域的最後一隻 Boss 後，對應文明災厄會在此出現。</div></div>'}</div>
  </section>`;
 }
 function combat(){
  const st=status(ui.selectedId),def=st?.definition,run=window.getSecondWorldCalamityRunSnapshot?.(),e=window.buildSecondWorldCalamityEnemy?.(ui.selectedId),p=window.playerCombatStats?.();
  if(!def||!e||!p)return idle();
  const last=ui.lastBattle,ehp=last?.enemyEndHp??st.currentHp,php=last?.playerEndHp??p.hp;
  const continuous=ui.mode==="continuous";
  return `<section class="calamity-shell calamity-battle-shell"><div class="card calamity-panel">
   <div class="calamity-combat-head"><span>${continuous?`連續討伐・第 ${Math.max(1,(run?.battleCount||0)+1)} 場`:"單場挑戰"}</span></div>
   ${continuous?`<div class="calamity-stop-wrap"><button class="btn danger" onclick="stopSecondWorldCalamityContinuousUI()">停止連續討伐</button></div>`:""}
   <div class="combat-screen calamity-combat"><div class="combat-arena">
    <div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>玩家 Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${fmt(php)} / ${fmt(p.hp)}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,php/p.hp*100))}%"></span></div></div></div>
    <div class="combat-vs">VS</div>
    <div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><div class="calamity-threat-badge">文明災厄</div><h2>${esc(e.name)}</h2><div class="muted">ATK ${fmt(e.atk)}　DEF ${fmt(e.def)}<br>暴擊 ${e.crit}%　閃避 ${e.dodge}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${fmt(ehp)} / ${fmt(e.hp)}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:${Math.max(0,Math.min(100,ehp/e.hp*100))}%"></span></div></div></div>
   </div><div class="combat-message" id="combatMessage">準備戰鬥</div></div>
  </div></section>`;
 }
 function result(){
  const st=status(ui.selectedId),def=st?.definition,run=ui.finalRun||window.getSecondWorldCalamityRunSnapshot?.(),last=ui.lastBattle;
  if(!def)return idle();
  const completed=st?.completed===true;
  return `<section class="calamity-shell calamity-result-shell"><div class="card calamity-result">
   <div class="calamity-result-kicker">宇宙紀元・文明災厄</div><h2>${completed?"文明階段已完成":ui.mode==="continuous"?"連續討伐已停止":last?.win?"討伐成功":"本次挑戰結束"}</h2>
   <div class="muted">${completed?"此災厄之文明進度已達 100%。":last?.win?`本場成功擊破 ${esc(def.name)}。`:`本場結束後，${esc(def.name)} 保留剩餘 HP。`}</div>
   <div class="calamity-result-grid"><div><span>完成場次</span><strong>${fmt(run?.battleCount||1)}</strong></div><div><span>文明進度</span><strong>${Number(st?.progressPercent||0).toFixed(2).replace(/\.00$/,"")}%</strong></div><div><span>災厄目前 HP</span><strong>${fmt(st?.currentHp)} / ${fmt(st?.maxHp)}</strong></div><div><span>文明等級</span><strong>Lv.${Math.max(0,Math.floor(Number(state.secondWorld?.civilizationLevel)||0))}</strong></div></div>
   <div class="muted calamity-no-reward">文明災厄不提供 EXP、暗物質、暗能量、裝備或其他一般獎勵。</div>
   <div class="calamity-result-actions">${completed?`<button class="btn primary" onclick="startSecondWorldCalamityUI('${def.id}','single')">單場重打</button>`:`<button class="btn primary" onclick="startSecondWorldCalamityUI('${def.id}','single')">單場挑戰</button><button class="btn danger" onclick="startSecondWorldCalamityUI('${def.id}','continuous')">連續討伐</button>`}<button class="btn" onclick="returnToSecondWorldCalamityList()">返回文明災厄</button></div>
  </div></section>`;
 }
 async function animate(result){
  if(!result?.combat||typeof window.animateStructuredCombatPresentation!=="function")return;
  try{await window.animateStructuredCombatPresentation(result.combat,{mode:"calamity",clearAfter:true,clearReason:"second-world-calamity-end"});}catch(e){}
 }
 async function single(){
  const res=window.runSecondWorldCalamitySingle?.(ui.selectedId);
  if(!res?.ok){ui.running=false;ui.phase="idle";ui.message="目前無法開始此文明災厄挑戰。";render();return;}
  ui.lastBattle=res.result;ui.finalRun=res.run;render();await animate(res.result);ui.running=false;ui.phase="result";render();
 }
 async function continuous(){
  const res=await window.runSecondWorldCalamityContinuous?.(ui.selectedId,{
   async onBattleComplete(step){ui.lastBattle=step.result;ui.finalRun=step.run;ui.phase="combat";render();await animate(step.result);},
   async onEnd(run){ui.finalRun=run;}
  });
  ui.running=false;ui.phase="result";if(res?.result?.result)ui.lastBattle=res.result.result;render();
 }
 function ensureNotice(){
  let modal=document.getElementById("secondWorldCalamityAppearanceModal");if(modal)return modal;
  modal=document.createElement("div");modal.id="secondWorldCalamityAppearanceModal";modal.className="modal calamity-unlock-modal";
  modal.innerHTML='<div class="modal-box"><div class="calamity-result-kicker">新內容出現</div><h3>文明災厄已現身</h3><div id="secondWorldCalamityAppearanceName" class="calamity-unlock-name"></div><div class="muted">一股足以撼動文明的威脅已在宇宙中出現。<br>可前往「文明災厄」查看挑戰條件。</div><div class="controls"><button class="btn primary" onclick="closeSecondWorldCalamityAppearanceNotice()">確認</button></div></div>';
  document.body.appendChild(modal);return modal;
 }

 window.secondWorldCivilizationCalamityPageHtml=function(){return ui.phase==="combat"?combat():ui.phase==="result"?result():idle();};
 window.startSecondWorldCalamityUI=function(id,mode="single"){
  const st=status(id);if(!st?.challengeable)return false;
  ui.selectedId=id;ui.mode=mode==="continuous"&&!st.completed?"continuous":"single";ui.phase="combat";ui.running=true;ui.message="";ui.lastBattle=null;ui.finalRun=null;render();
  if(ui.mode==="continuous")continuous();else single();return true;
 };
 window.stopSecondWorldCalamityContinuousUI=function(){return window.requestSecondWorldCalamityStop?.();};
 window.returnToSecondWorldCalamityList=function(){ui.phase="idle";ui.running=false;ui.lastBattle=null;ui.finalRun=null;render();};
 window.leaveSecondWorldCalamityUI=function(){ui.phase="idle";ui.running=false;view="home";render();};
 window.queueSecondWorldCalamityAppearanceNotice=function(value){
  const d=typeof value==="object"?value:window.getSecondWorldCalamityDefinition?.(value);if(!d)return false;
  if(!noticeQueue.some(x=>x.id===d.id))noticeQueue.push(d);
  return true;
 };
 window.flushSecondWorldCalamityAppearanceNotice=function(){
  const d=noticeQueue.shift();if(!d)return false;
  const modal=ensureNotice(),name=modal.querySelector("#secondWorldCalamityAppearanceName");if(name)name.textContent=d.name;
  modal.classList.add("show");return true;
 };
 window.closeSecondWorldCalamityAppearanceNotice=function(){
  document.getElementById("secondWorldCalamityAppearanceModal")?.classList.remove("show");
  if(noticeQueue.length)setTimeout(()=>window.flushSecondWorldCalamityAppearanceNotice(),0);
 };
 window.SECOND_WORLD_CALAMITY_UI_VERSION=VERSION;
 window.SECOND_WORLD_CALAMITY_APPEARANCE_NOTICE_VERSION=1;
})();