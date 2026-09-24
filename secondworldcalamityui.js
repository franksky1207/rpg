(function(){
 const VERSION=2;
 const noticeQueue=[];
 const ui={selectedId:null,mode:"single",phase:"idle",running:false,message:"",lastBattle:null,finalRun:null};
 let calamityEraView="universe";
 let reviewSelectedId=null;
 let reviewBattle=null;

 const sleep=ms=>typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("calamity")?window.backgroundProgressSleep(ms,"calamity"):new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
 function continuousGapMs(){
  if(typeof window.combatOuterGapMs!=="function")throw new Error("Combat Outer Pacing 未載入。");
  return window.combatOuterGapMs("calamity","battle");
 }
 function fastCatchUp(){return typeof window.backgroundProgressFastCatchUpActive==="function"&&window.backgroundProgressFastCatchUpActive("calamity")===true;}
 function catchUpStep(){return typeof window.backgroundProgressCatchUpStep==="function"?window.backgroundProgressCatchUpStep("calamity"):null;}
 function catchUpFinal(){return typeof window.backgroundProgressCatchUpFinalPolicy==="function"?window.backgroundProgressCatchUpFinalPolicy("calamity"):null;}
 function structuredDuration(result){return typeof window.structuredCombatPresentationDurationMs==="function"?Math.max(0,Number(window.structuredCombatPresentationDurationMs(result))||0):0;}
 async function consumeCatchUpDelay(ms){
  const delay=Math.max(0,Number(ms)||0);
  if(delay<=0)return true;
  if(fastCatchUp()&&typeof window.backgroundProgressConsumeCatchUpCredit==="function"){
   const consumed=window.backgroundProgressConsumeCatchUpCredit(delay,"calamity");
   if(Number(consumed?.remaining)>0)await sleep(consumed.remaining);
   return Number(consumed?.remaining)<=0;
  }
  await sleep(delay);
  return false;
 }

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

 function progressText(st){
  const pct=Math.max(0,Math.min(100,Number(st?.progressPercent)||0));
  return pct.toFixed(2).replace(/\.00$/,"")+"%";
 }
 function civilizationRequirementText(def,st){
  if(Number(def?.previousCivilizationLevel)<=0)return "文明條件：無前置文明需求 ✓";
  const ok=st?.unlock?.previousCivilizationComplete===true;
  return `文明條件：需要文明 Lv.${def.previousCivilizationLevel} ${ok?"✓":"✕"}`;
 }
 function playerName(){
  if(typeof window.playerIdentityNameHtml==="function")return window.playerIdentityNameHtml({compact:true});
  if(typeof currentPlayerName==="function")return esc(currentPlayerName());
  return "玩家";
 }
 function actions(def,st){
  if(st?.completed)return `<button class="btn primary" onclick="startSecondWorldCalamityUI('${def.id}','single')">單場重打</button>`;
  if(st?.challengeable)return `<button class="btn primary" onclick="startSecondWorldCalamityUI('${def.id}','single')">單場挑戰</button><button class="btn danger" onclick="startSecondWorldCalamityUI('${def.id}','continuous')">連續討伐</button>`;
  return `<button class="btn" disabled>尚未符合挑戰條件</button>`;
 }
 function card(def){
  const st=status(def.id);if(!st)return "";
  const detail=st.completed
   ?`<div class="notice"><b>文明階段已完成</b><div class="muted" style="margin-top:5px">此災厄仍可單場重打；每次皆從滿 HP 開始，且不再增加文明進度。</div></div>`
   :`<div class="muted">主線條件：Lv.${def.level} 區域最終 Boss 已擊敗 ✓<br>${civilizationRequirementText(def,st)}</div>`;
  return `<article class="card calamity-card">
   <div class="calamity-card-head"><div><div class="calamity-region">${esc(def.regionName)}・Lv.${def.level}</div><h3>${esc(def.name)}</h3></div><span class="calamity-threat">文明災厄</span></div>
   <div class="notice"><b>狀態：${challengeText(st)}</b></div>
   ${detail}
   <div class="calamity-hp-row"><span>文明進度</span><strong>${progressText(st)}</strong></div>
   <div class="bar"><span class="xp" style="width:${Math.max(0,Math.min(100,Number(st.progressPercent)||0))}%"></span></div>
   <div class="calamity-hp-row"><span>災厄 HP</span><strong>${fmt(st.currentHp)} / ${fmt(st.maxHp)}</strong></div>
   <div class="bar calamity-hp-bar"><span class="hp" style="width:${Math.max(0,Math.min(100,Number(st.hpPercent)||0))}%"></span></div>
   <div class="calamity-actions">${actions(def,st)}</div>
  </article>`;
 }
 function eraTabs(){return `<div class="era-view-tabs" role="tablist" aria-label="文明災厄紀元"><button class="era-view-tab ${calamityEraView==="universe"?"active":""}" type="button" onclick="setCivilizationCalamityEraView('universe')">宇宙紀元</button><button class="era-view-tab ${calamityEraView==="galaxy-review"?"active":""}" type="button" onclick="setCivilizationCalamityEraView('galaxy-review')">銀河紀元・回顧</button></div>`;}
 function galaxyDefs(){return Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);}
 function galaxyStatus(def){return typeof window.getCivilizationCalamityStatus==="function"?window.getCivilizationCalamityStatus(def.id):null;}
 function galaxyMarkCard(def){
  const st=galaxyStatus(def),m=st?.mark||window.markFormalSnapshot?.()?.[def.markId]||{},lv=Math.max(0,Math.min(10,Math.floor(Number(m.level)||0))),acquired=m.acquired===true||lv>0;
  const stateText=!acquired?"未取得":lv>=10?"Lv.10 MAX":`Lv.${lv}　${Math.max(0,Number(m.progress)||0)} / ${Math.max(1,Number(m.requiredForNext)||window.markRequiredKillsForNextLevel?.(lv)||1)}`;
  const effect=acquired&&lv>0?window.markEffectDescription?.(def.markId,lv):window.markEffectDescription?.(def.markId,1);
  const label=acquired&&lv>0?"目前效果":"Lv.1 效果預覽";
  return `<article class="card calamity-mark-card"><div class="calamity-mark-source">${esc(def.calamityName)}</div><h3>${esc(def.markName)}</h3><div class="calamity-mark-level">${esc(stateText)}</div><div class="calamity-mark-effect"><div class="calamity-mark-effect-label">${label}</div><div>${esc(effect||"尚未生效。")}</div></div></article>`;
 }
 function galaxyReviewCard(def){
  const st=galaxyStatus(def),max=Math.max(1,Number(st?.maxHp)||((def.index+1)*500000));
  return `<article class="card calamity-card"><div class="calamity-card-head"><div><div class="calamity-region">${esc(def.regionName)}・Lv.${def.unlockLevel}</div><h3>${esc(def.calamityName)}</h3></div><span class="calamity-threat">銀河災厄</span></div><div class="calamity-hp-row"><span>回顧 HP</span><strong>${fmt(max)} / ${fmt(max)}</strong></div><div class="bar calamity-hp-bar"><span class="hp" style="width:100%"></span></div><div class="calamity-mark-summary"><span>${esc(def.markName)}</span><strong>Lv.${Math.max(0,Number(st?.mark?.level)||0)}</strong></div><div class="calamity-actions"><button class="btn primary" onclick="startGalaxyCalamityReview('${def.id}')">單場回顧</button></div></article>`;
 }
 function galaxyReviewIdle(){
  const list=galaxyDefs();
  return `<section class="calamity-shell calamity-home"><div class="back-home"><button class="btn back-btn" onclick="leaveSecondWorldCalamityUI()">← 返回主頁</button></div><div class="calamity-title card"><h2>文明災厄</h2>${eraTabs()}<div class="muted">銀河紀元已完成的 10 隻文明災厄可再次單場挑戰。每場皆使用滿 HP 的獨立回顧敵人；無收益、無損失、不影響正式進度。</div></div><div class="calamity-section-head"><h3>銀河災厄回顧</h3></div><div class="calamity-grid">${list.map(galaxyReviewCard).join("")}</div><div class="calamity-section-head"><h3>印記能力</h3></div><div class="calamity-mark-grid">${list.map(galaxyMarkCard).join("")}</div></section>`;
 }
 function galaxyReviewCombat(){
  const def=galaxyDefs().find(x=>x.id===reviewSelectedId),st=def?galaxyStatus(def):null,e=reviewBattle?.enemy,p=window.playerCombatStats?.(),ehp=reviewBattle?.enemyHp??e?.hp??1,php=reviewBattle?.playerHp??p?.hp??1;
  return `<section class="calamity-shell calamity-battle-shell"><div class="card calamity-panel"><div class="calamity-combat-head"><span>銀河紀元・災厄回顧戰</span></div><div class="muted" style="text-align:center;margin-bottom:10px">單場・滿 HP・無收益・無損失・不影響正式災厄 HP、印記、稱號或進度</div><div class="combat-screen calamity-combat"><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${playerName()} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${fmt(php)} / ${fmt(p?.hp)}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,php/(p?.hp||1)*100))}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><div class="calamity-threat-badge">銀河災厄・回顧</div><h2>${esc(e?.name||def?.calamityName||"文明災厄")}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${fmt(ehp)} / ${fmt(e?.hp)}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:${Math.max(0,Math.min(100,ehp/(e?.hp||1)*100))}%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備回顧戰</div></div></div></section>`;
 }
 function idle(){
  const list=visibleDefs();
  return `<section class="calamity-shell calamity-home">
   <div class="back-home"><button class="btn back-btn" onclick="leaveSecondWorldCalamityUI()">← 返回主頁</button></div>
   <div class="calamity-title card"><h2>文明災厄</h2>${eraTabs()}<div class="muted">擊敗各區域最終 Boss 後，對應文明災厄將會現身。災厄出現後會永久顯示於此；能否挑戰還需滿足前置文明等級。每隻災厄完成 30 次完整擊殺後，可提升 1 級文明等級。</div><div class="notice universe-civilization-summary" style="margin-top:10px"><b>目前文明 Lv.${Math.max(0,Math.floor(Number(state.secondWorld?.civilizationLevel)||0))} / 10</b><div class="muted" style="margin-top:4px">每提升 1 級，宇宙戰鬥最終傷害 +5%。</div></div></div>
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
    <div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${playerName()} Lv.${state.level}</h2><div class="muted">ATK ${fmt(p.atk)}　DEF ${fmt(p.def)}<br>暴擊 ${Number(p.crit||0).toFixed(1)}%　閃避 ${Number(p.dodge||0).toFixed(1)}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${fmt(php)} / ${fmt(p.hp)}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${Math.max(0,Math.min(100,php/p.hp*100))}%"></span></div></div></div>
    <div class="combat-vs">VS</div>
    <div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><div class="calamity-threat-badge">文明災厄</div><h2>${esc(e.name)}</h2><div class="muted">ATK ${fmt(e.atk)}　DEF ${fmt(e.def)}<br>暴擊 ${e.crit}%　閃避 ${e.dodge}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${fmt(ehp)} / ${fmt(e.hp)}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:${Math.max(0,Math.min(100,ehp/e.hp*100))}%"></span></div></div></div>
   </div><div class="combat-message" id="combatMessage">準備戰鬥</div></div>
  </div></section>`;
 }
 function result(){
  const st=status(ui.selectedId),def=st?.definition,run=ui.finalRun||window.getSecondWorldCalamityRunSnapshot?.(),last=ui.lastBattle;
  if(!def)return idle();
  const completed=st?.completed===true;
  const settlement=last?.settlement||null;
  const levelUp=settlement?.civilizationLevelUp===true
   ?`<div class="notice" style="margin-top:10px"><b>文明等級提升至 Lv.${Math.max(0,Math.floor(Number(settlement.civilizationLevel)||0))}</b><div class="muted" style="margin-top:4px">宇宙戰鬥最終傷害永久提升 5%。</div></div>`
   :"";
  return `<section class="calamity-shell calamity-result-shell"><div class="card calamity-result">
   <div class="calamity-result-kicker">宇宙紀元・文明災厄</div><h2>${completed?"文明階段已完成":ui.mode==="continuous"?"連續討伐已停止":last?.win?"討伐成功":"本次挑戰結束"}</h2>
   <div class="muted">${completed?"此災厄之文明進度已達 100%。":last?.win?`本場成功擊破 ${esc(def.name)}。`:`本場結束後，${esc(def.name)} 保留剩餘 HP。`}</div>
   ${levelUp}
   <div class="calamity-result-grid"><div><span>完成場次</span><strong>${fmt(run?.battleCount||1)}</strong></div><div><span>文明進度</span><strong>${progressText(st)}</strong></div><div><span>災厄目前 HP</span><strong>${fmt(st?.currentHp)} / ${fmt(st?.maxHp)}</strong></div><div><span>文明等級</span><strong>Lv.${Math.max(0,Math.floor(Number(state.secondWorld?.civilizationLevel)||0))}</strong></div></div>
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
   async onBattleComplete(step){
    ui.lastBattle=step.result;ui.finalRun=step.run;ui.phase="combat";
    const fast=fastCatchUp();
    const policy=fast?catchUpStep():null;
    if(fast){
     if(policy?.shouldPresentBattle){render();await animate(step.result);}
     else{
      await consumeCatchUpDelay(structuredDuration(step.result?.combat||step.result));
      if(policy?.shouldRefreshUi)render();
     }
     if((policy?.shouldRefreshUi||policy?.shouldPresentBattle)&&typeof window.backgroundProgressUiYield==="function")await window.backgroundProgressUiYield("calamity");
    }else{
     render();await animate(step.result);
     if(typeof window.backgroundProgressUiYield==="function")await window.backgroundProgressUiYield("calamity");
    }
    if(!step.ended&&window.getSecondWorldCalamityRunSnapshot?.()?.active){
     if(fast)await consumeCatchUpDelay(continuousGapMs());
     else await sleep(continuousGapMs());
     if(fast&&!fastCatchUp()){
      const finalPolicy=catchUpFinal();
      if(finalPolicy?.shouldRefreshUi)render();
      if(finalPolicy?.shouldCheckpoint&&typeof save==="function")save(false);
     }
    }
   },
   async onEnd(run){ui.finalRun=run;}
  });
  ui.running=false;ui.phase="result";if(res?.result?.result)ui.lastBattle=res.result.result;render();
 }
 function ensureNotice(){
  let modal=document.getElementById("secondWorldCalamityAppearanceModal");if(modal)return modal;
  modal=document.createElement("div");modal.id="secondWorldCalamityAppearanceModal";modal.className="modal calamity-unlock-modal";
  modal.innerHTML='<div class="modal-box"><div class="calamity-result-kicker">新內容出現</div><h3>文明災厄已現身</h3><div id="secondWorldCalamityAppearanceName" class="calamity-unlock-name"></div><div class="muted">一股足以撼動文明的威脅已在宇宙中出現。<br>可前往「文明災厄」查看挑戰條件。</div><div id="secondWorldCalamityAppearanceRequirement" class="notice" style="margin-top:10px"></div><div class="controls"><button class="btn primary" onclick="closeSecondWorldCalamityAppearanceNotice()">確認</button></div></div>';
  document.body.appendChild(modal);return modal;
 }

 window.prepareSecondWorldCivilizationCalamityEntry=function(){
  if(ui.running)return false;
  ui.selectedId=null;ui.mode="single";ui.phase="idle";ui.message="";ui.lastBattle=null;ui.finalRun=null;
  return true;
 };
 window.secondWorldCivilizationCalamityPageHtml=function(){if(calamityEraView==="galaxy-review")return reviewBattle?.phase==="combat"?galaxyReviewCombat():galaxyReviewIdle();return ui.phase==="combat"?combat():ui.phase==="result"?result():idle();};
 window.setCivilizationCalamityEraView=function(value){if(ui.running||reviewBattle?.phase==="combat")return false;calamityEraView=value==="galaxy-review"?"galaxy-review":"universe";ui.phase="idle";reviewBattle=null;render();return true;};
 window.getCivilizationCalamityEraView=function(){return calamityEraView;};
 window.startGalaxyCalamityReview=async function(id){
  if(ui.running||reviewBattle?.phase==="combat")return false;
  const def=galaxyDefs().find(x=>x.id===String(id));if(!def)return false;
  const st=galaxyStatus(def),formalEnemy=st?.enemy||window.buildCivilizationCalamityEnemy?.(def.id);if(!formalEnemy||typeof window.runCombatCore!=="function")return false;
  const enemy={...formalEnemy,hp:Math.max(1,Number(st?.maxHp)||Number(formalEnemy.hp)||1)},p=window.playerCombatStats?.();if(!p)return false;
  reviewSelectedId=def.id;reviewBattle={phase:"combat",enemy,enemyHp:enemy.hp,playerHp:p.hp};state.hp=p.hp;render();
  try{
   const combat=window.runCombatCore(p,enemy,p.hp,{mainlineLogs:true,preparePresentation:true});
   reviewBattle.enemyHp=combat.enemyHp;reviewBattle.playerHp=combat.hp;
   if(typeof window.animateStructuredCombatPresentation==="function")await window.animateStructuredCombatPresentation(combat,{mode:"calamity",clearAfter:true,clearReason:"galaxy-calamity-review-end"});
   state.hp=p.hp;reviewBattle={phase:"result",enemy,enemyHp:combat.enemyHp,playerHp:p.hp,win:combat.win};
   render();
   const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
   if(title&&detail&&modal){title.textContent=combat.win?"災厄回顧戰勝利":"災厄回顧戰戰敗";detail.innerHTML='<div class="notice"><b>銀河紀元・災厄回顧戰結束</b><div class="muted" style="margin-top:6px">本場不改變正式災厄 HP、印記、稱號、擊殺紀錄、EXP、資源或裝備。</div></div>';modal.classList.add("show")}
   return true;
  }catch(error){state.hp=p.hp;reviewBattle=null;render();throw error}
 };
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
  const modal=ensureNotice(),name=modal.querySelector("#secondWorldCalamityAppearanceName"),req=modal.querySelector("#secondWorldCalamityAppearanceRequirement");
  if(name)name.textContent=d.name;
  if(req){
   const st=status(d.id);
   req.innerHTML=st?.challengeable
    ?"<b>目前已符合挑戰條件，可立即前往挑戰。</b>"
    :`<b>目前尚不可挑戰</b><div class="muted" style="margin-top:4px">需先完成文明 Lv.${d.previousCivilizationLevel}。</div>`;
  }
  modal.classList.add("show");return true;
 };
 window.closeSecondWorldCalamityAppearanceNotice=function(){
  document.getElementById("secondWorldCalamityAppearanceModal")?.classList.remove("show");
  if(noticeQueue.length)setTimeout(()=>window.flushSecondWorldCalamityAppearanceNotice(),0);
 };
 window.SECOND_WORLD_CALAMITY_UI_VERSION=VERSION;
 window.SECOND_WORLD_CALAMITY_REVIEW_VERSION=1;
 window.SECOND_WORLD_CALAMITY_MARK_ARCHIVE_VERSION=1;
 window.SECOND_WORLD_CALAMITY_PLAYER_SEMANTICS_VERSION=1;
 window.SECOND_WORLD_CALAMITY_APPEARANCE_NOTICE_VERSION=2;
})();