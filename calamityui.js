(function(){
 const UI_VERSION=3;
 const MINIMAL_VERSION=1;
 let ui={phase:"idle",running:false,selectedId:null,mode:"single",lastBattle:null,finalRun:null,message:"",displayBattleNumber:1,displayEnemyHp:null,displayEnemyMax:null,displayPlayerHp:null,displayPlayerMax:null};

 const sleep=ms=>typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("calamity")?window.backgroundProgressSleep(ms,"calamity"):new Promise(resolve=>setTimeout(resolve,ms));
 const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
 const fmt=value=>Math.max(0,Math.floor(Number(value)||0)).toLocaleString();

 function defs(){return typeof window.getCivilizationCalamityDefinitions==="function"?window.getCivilizationCalamityDefinitions():[];}
 function unlockedDefs(){return defs().filter(def=>typeof window.isCivilizationCalamityUnlocked==="function"&&window.isCivilizationCalamityUnlocked(def.id));}
 function status(id){return typeof window.getCivilizationCalamityStatus==="function"?window.getCivilizationCalamityStatus(id):null;}
 function playerStats(){return typeof playerCombatStats==="function"?playerCombatStats():{hp:1,atk:0,def:0,crit:0,dodge:0};}
 function modeLabel(mode){return mode==="continuous"?"連續討伐":"單場挑戰";}
 function markLine(st){
  const m=st?.mark;if(!m)return "—";
  if(!m.acquired)return "未取得";
  if(m.level>=10)return "Lv.10 MAX";
  const req=Math.max(1,Number(m.requiredForNext)||1);
  return `Lv.${m.level}　進度 ${Math.max(0,Number(m.progress)||0)} / ${req}`;
 }
 function hpPercent(current,max){return max>0?Math.max(0,Math.min(100,current/max*100)):0;}
 function pct(value){
  const n=Number(value)||0;
  return Number.isInteger(n)?String(n):String(Math.round(n*10)/10);
 }
 function markEffectText(key,level){
  const lv=Math.max(0,Math.min(10,Math.floor(Number(level)||0)));
  const effect=typeof window.markEffectSnapshot==="function"?window.markEffectSnapshot(key,lv):null;
  if(!effect||lv<=0)return "尚未生效。";
  if(key==="ward")return `${pct(effect.activationChance)}% 機率於戰鬥開始時啟動，獲得最大 HP ${pct(effect.shieldMaxHpPercent)}% 的護盾。`;
  if(key==="suppression")return `敵人最終閃避率降低 ${pct(effect.enemyDodgeReductionPoints)} 個百分點。`;
  if(key==="composure")return `敵人最終暴擊率降低 ${pct(effect.enemyCritReductionPoints)} 個百分點。`;
  if(key==="indomitable")return `${pct(effect.activationChance)}% 機率於戰鬥開始時啟動；本場第一次受到致死傷害時保留 ${Math.max(1,Number(effect.surviveHp)||1)} HP。`;
  if(key==="resilience")return `敵人暴擊的額外傷害部分降低 ${pct(effect.enemyCritBonusDamageReductionPercent)}%。`;
  if(key==="battleSpirit")return `${pct(effect.activationChance)}% 機率於戰鬥開始時啟動；每層提高 ATK ${pct(effect.atkPercentPerLayer)}%，每回合增加 1 層，最多 ${Math.max(1,Number(effect.maxLayers)||10)} 層。`;
  if(key==="absorption")return `受到原本會命中的敵方攻擊時，有 ${pct(effect.triggerChance)}% 機率完全吸收傷害，並回復原始傷害 ${pct(effect.healOriginalDamagePercent)}% 的 HP。`;
  if(key==="revenge")return `敵人成功暴擊後，有 ${pct(effect.triggerChance)}% 機率進入復仇；下一次成功命中的攻擊必定暴擊。`;
  if(key==="backlash")return `實際受到 HP 傷害且存活後，有 ${pct(effect.triggerChance)}% 機率反噬敵人，反射本次實際 HP 損失的 ${pct(effect.reflectActualHpLossPercent)}% 傷害。`;
  if(key==="ignore")return `每次玩家攻擊有 ${pct(effect.triggerChance)}% 機率無視敵人 DEF。`;
  return "永久戰鬥被動。";
 }
 function markEffectBlock(def,m){
  const acquired=m?.acquired===true,level=Math.max(0,Math.min(10,Math.floor(Number(m?.level)||0)));
  if(!acquired){
   return `<div class="calamity-mark-effect"><div class="calamity-mark-effect-label">Lv.1 效果預覽</div><div>${esc(markEffectText(def.markId,1))}</div></div><div class="muted calamity-mark-note">首次擊敗對應文明災厄後取得 Lv.0。</div>`;
  }
  if(level===0){
   return `<div class="calamity-mark-effect"><div class="calamity-mark-effect-label">目前效果</div><div>Lv.0 尚未生效。</div></div><div class="calamity-mark-next"><div class="calamity-mark-effect-label">Lv.1 效果</div><div>${esc(markEffectText(def.markId,1))}</div></div>`;
  }
  const current=`<div class="calamity-mark-effect"><div class="calamity-mark-effect-label">目前效果</div><div>${esc(markEffectText(def.markId,level))}</div></div>`;
  if(level>=10)return current+`<div class="calamity-mark-max">已達最高等級 MAX</div>`;
  return current+`<div class="calamity-mark-next"><div class="calamity-mark-effect-label">下一級 Lv.${level+1}</div><div>${esc(markEffectText(def.markId,level+1))}</div></div>`;
 }

 function calamityCardsHtml(){
  const list=unlockedDefs();
  if(!list.length)return '<div class="card calamity-empty"><h3>尚無已解鎖的文明災厄</h3><div class="muted">擊敗各區域最終 Boss 後，對應文明災厄才會出現。</div></div>';
  return list.map(def=>{
   const st=status(def.id),m=st?.mark||{},pct=hpPercent(st?.currentHp||0,st?.maxHp||1);
   return `<article class="card calamity-card">
    <div class="calamity-card-head"><div><div class="calamity-region">${esc(def.regionName)}・Lv.${def.unlockLevel}</div><h3>${esc(def.name)}</h3></div><span class="calamity-threat">文明災厄</span></div>
    <div class="calamity-hp-row"><span>HP</span><strong>${fmt(st?.currentHp)} / ${fmt(st?.maxHp)}</strong></div>
    <div class="bar calamity-hp-bar"><span class="hp" style="width:${pct}%"></span></div>
    <div class="calamity-mark-summary"><span>${esc(def.markName)}</span><strong>${markLine(st)}</strong></div>
    <div class="calamity-actions"><button class="btn primary" onclick="startCivilizationCalamityUI('${def.id}','single')">單場挑戰</button><button class="btn danger" onclick="startCivilizationCalamityUI('${def.id}','continuous')">連續討伐</button></div>
   </article>`;
  }).join("");
 }

 function markCardsHtml(){
  const list=unlockedDefs();
  if(!list.length)return '<div class="muted">尚無可顯示的印記。</div>';
  return list.map(def=>{
   const st=status(def.id),m=st?.mark||{};
   const stateText=!m.acquired?"未取得":m.level>=10?"Lv.10 MAX":`Lv.${m.level}　${m.progress||0} / ${Math.max(1,m.requiredForNext||1)}`;
   return `<article class="card calamity-mark-card"><div class="calamity-mark-source">${esc(def.name)}</div><h3>${esc(def.markName)}</h3><div class="calamity-mark-level">${stateText}</div>${markEffectBlock(def,m)}</article>`;
  }).join("");
 }

 function idleHtml(){
  return `<section class="calamity-shell calamity-home">
   <div class="back-home"><button class="btn back-btn" onclick="leaveCivilizationCalamityUI()">← 返回主頁</button></div>
   <div class="calamity-title card"><h2>文明災厄</h2><div class="muted">擊敗各區域最終 Boss 後逐步解鎖。災厄剩餘 HP 會跨挑戰保留，擊敗後可取得並提升對應印記。</div></div>
   ${ui.message?`<div class="notice calamity-notice">${esc(ui.message)}</div>`:""}
   <div class="calamity-section-head"><h3>災厄討伐</h3></div><div class="calamity-grid">${calamityCardsHtml()}</div>
   <div class="calamity-section-head"><h3>印記</h3></div><div class="calamity-mark-grid">${markCardsHtml()}</div>
  </section>`;
 }

 function combatHtml(){
  const def=window.getCivilizationCalamityDefinition?.(ui.selectedId),st=status(ui.selectedId),run=window.getCivilizationCalamityRunSnapshot?.(),p=playerStats();
  const enemy=st?.enemy||window.buildCivilizationCalamityEnemy?.(ui.selectedId)||{name:def?.name||"文明災厄",atk:0,def:0,crit:10,dodge:10};
  const ehp=ui.displayEnemyHp==null?(st?.currentHp||enemy.hp):ui.displayEnemyHp,emax=ui.displayEnemyMax||st?.maxHp||enemy.hp;
  const php=ui.displayPlayerHp==null?p.hp:ui.displayPlayerHp,pmax=ui.displayPlayerMax||p.hp;
  const continuous=ui.mode==="continuous",stopping=run?.stopRequested===true||run?.active===false;
  return `<section class="calamity-shell calamity-battle-shell"><div class="card calamity-panel">
   <div class="calamity-combat-head main-minimal-mode-head"><span class="main-minimal-mode-head-label">${continuous?`連續討伐・第 ${Math.max(1,Number(ui.displayBattleNumber)||1)} 場`:"單場挑戰"}</span>${continuous&&run?.active?`<button type="button" class="main-minimal-mode-enter" onclick="openCivilizationCalamityMinimalMode()">極簡模式</button>`:""}</div>
   <div class="calamity-run-stats"><div><span>災厄</span><strong>${esc(def?.name||enemy.name)}</strong></div><div><span>已完成場次</span><strong>${fmt(run?.battleCount||0)}</strong></div><div><span>完整擊殺</span><strong>${fmt(run?.kills||0)}</strong></div></div>
   ${continuous?`<div class="calamity-stop-wrap"><button id="calamityStopBtn" class="btn danger" onclick="stopCivilizationCalamityContinuousUI()" ${stopping?"disabled":""}>${stopping?"停止中":"停止連續討伐"}</button></div>`:""}
   <div class="combat-screen calamity-combat"><div class="combat-head">${modeLabel(ui.mode)}</div><div class="combat-arena">
    <div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${esc(typeof currentPlayerName==="function"?currentPlayerName():"玩家")} Lv.${state.level}</h2><div class="muted">ATK ${p.atk}　DEF ${p.def}<br>暴擊 ${p.crit}%　閃避 ${p.dodge}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${fmt(php)} / ${fmt(pmax)}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPercent(php,pmax)}%"></span></div></div></div>
    <div class="combat-vs">VS</div>
    <div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><div class="calamity-threat-badge">文明災厄</div><h2>${esc(enemy.name)}</h2><div class="muted">ATK ${fmt(enemy.atk)}　DEF ${fmt(enemy.def)}<br>暴擊 ${enemy.crit}%　閃避 ${enemy.dodge}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${fmt(ehp)} / ${fmt(emax)}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:${hpPercent(ehp,emax)}%"></span></div></div></div>
   </div><div class="combat-message" id="combatMessage">準備戰鬥</div></div>
  </div></section>`;
 }

 function resultHtml(){
  const run=ui.finalRun||window.getCivilizationCalamityRunSnapshot?.(),def=window.getCivilizationCalamityDefinition?.(ui.selectedId),st=status(ui.selectedId),last=ui.lastBattle;
  const title=ui.mode==="continuous"?"連續討伐已停止":last?.win?"討伐成功":"本次挑戰結束";
  const resultLine=last?last.win?`本場成功擊破 ${esc(def?.name||"文明災厄")}。`:`本場造成傷害後，${esc(def?.name||"文明災厄")}仍保留剩餘 HP。`:"挑戰已結束。";
  return `<section class="calamity-shell calamity-result-shell"><div class="card calamity-result">
   <div class="calamity-result-kicker">文明災厄</div><h2>${title}</h2><div class="muted">${resultLine}</div>
   <div class="calamity-result-grid"><div><span>完成場次</span><strong>${fmt(run?.battleCount||0)}</strong></div><div><span>勝 / 敗</span><strong>${fmt(run?.wins||0)} / ${fmt(run?.losses||0)}</strong></div><div><span>完整擊殺</span><strong>${fmt(run?.kills||0)}</strong></div><div><span>災厄目前 HP</span><strong>${fmt(st?.currentHp)} / ${fmt(st?.maxHp)}</strong></div><div><span>目前印記</span><strong>${esc(def?.markName||"—")}</strong></div><div><span>印記狀態</span><strong>${markLine(st)}</strong></div></div>
   <div class="muted calamity-no-reward">文明災厄不提供 EXP、金幣、裝備或其他一般獎勵。</div>
   <div class="calamity-result-actions"><button class="btn primary" onclick="startCivilizationCalamityUI('${ui.selectedId}','single')">單場挑戰</button><button class="btn danger" onclick="startCivilizationCalamityUI('${ui.selectedId}','continuous')">連續討伐</button><button class="btn" onclick="returnToCivilizationCalamityList()">返回文明災厄</button></div>
  </div></section>`;
 }

 window.civilizationCalamityPageHtml=function(){
  if(ui.phase==="combat")return combatHtml();
  if(ui.phase==="result")return resultHtml();
  return idleHtml();
 };

 function syncCalamityPresentation(snapshot){
  if(!snapshot)return;
  ui.displayEnemyHp=Math.max(0,Number(snapshot.enemyHp)||0);
  ui.displayEnemyMax=Math.max(1,Number(snapshot.enemyMaxHp)||1);
  ui.displayPlayerHp=Math.max(0,Number(snapshot.playerHp)||0);
  ui.displayPlayerMax=Math.max(1,Number(snapshot.playerMaxHp)||1);
  if(window.getMinimalModeAdapterId?.()==="civilization-calamity"&&typeof window.syncMinimalMode==="function")window.syncMinimalMode();
 }

 async function animateBattle(battle){
  const full=battle?.result;
  if(!full){if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("calamity-empty");return;}
  const combat=full.combat||full;
  if(typeof window.prepareCombatPresentation!=="function"||typeof window.animateStructuredCombatPresentation!=="function")throw new Error("Structured Combat Presentation 未載入。");
  window.prepareCombatPresentation(combat,{logs:true});
  syncCalamityPresentation(window.getCombatPresentationSnapshot?.());
  const eventCount=Array.isArray(combat?.events)?combat.events.length:0;
  const stepDelay=eventCount>140?12:eventCount>90?20:eventCount>55?32:48;
  await window.animateStructuredCombatPresentation(combat,{
   mode:"calamity",
   openingDelay:90,
   impactDelay:45,
   stepDelay,
   endDelay:150,
   onUpdate:syncCalamityPresentation,
   clearAfter:true,
   clearReason:"calamity-battle-end"
  });
  ui.displayEnemyHp=Math.max(0,Number(full.enemyEndHp)||0);
  ui.displayEnemyMax=Math.max(1,Number(full.enemy?.hp)||Number(combat.enemyMaxHp)||1);
  ui.displayPlayerHp=Math.max(0,Number(full.playerEndHp)||0);
  ui.displayPlayerMax=Math.max(1,Number(combat.playerMaxHp)||Number(full.playerStartHp)||1);
  if(window.getMinimalModeAdapterId?.()==="civilization-calamity"&&typeof window.syncMinimalMode==="function")window.syncMinimalMode();
 }

 function resetDisplay(){if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation();ui.displayEnemyHp=null;ui.displayEnemyMax=null;ui.displayPlayerHp=null;ui.displayPlayerMax=null;}
 function primeDisplay(full){
  if(!full)return resetDisplay();
  ui.displayEnemyHp=Math.max(0,Number(full.enemyStartHp)||0);
  ui.displayEnemyMax=Math.max(1,Number(full.enemy?.hp)||Number(full.combat?.enemyMaxHp)||1);
  ui.displayPlayerHp=Math.max(0,Number(full.playerStartHp)||0);
  ui.displayPlayerMax=Math.max(1,Number(full.playerStartHp)||Number(full.combat?.playerMaxHp)||1);
 }
 function stopMinimalIfOpen(){
  if(window.getMinimalModeAdapterId?.()!=="civilization-calamity")return;
  if(typeof window.setMinimalModeState==="function")window.setMinimalModeState("stopped");
 }

 async function runSingleUi(){
  const result=window.runCivilizationCalamitySingle?.(ui.selectedId);
  if(!result?.ok){ui.running=false;ui.phase="idle";ui.message="目前無法開始文明災厄挑戰。";render();return;}
  ui.lastBattle=result.result;ui.finalRun=result.run;ui.displayBattleNumber=1;
  primeDisplay(result.result);render();
  await animateBattle(result);
  ui.running=false;ui.phase="result";resetDisplay();render();
 }

 async function runContinuousUi(){
  try{
   await window.runCivilizationCalamityContinuous(ui.selectedId,{
    async onBattleComplete(battle){
     ui.lastBattle=battle.result;
     ui.finalRun=battle.run;
     ui.displayBattleNumber=Math.max(1,Number(battle.battleNumber)||1);
     ui.phase="combat";
     primeDisplay(battle.result);render();
     await animateBattle(battle);
     if(!battle.ended&&window.getCivilizationCalamityRunSnapshot?.()?.active)await sleep(Number(window.CALAMITY_CONTINUOUS_GAP_MS)||350);
    },
    async onEnd(run){
     stopMinimalIfOpen();
     ui.finalRun=run;
     ui.running=false;
     ui.phase="result";
     resetDisplay();
     render();
    }
   });
  }catch(error){
   stopMinimalIfOpen();ui.running=false;ui.phase="result";ui.message=String(error?.message||error);render();
  }
 }

 window.startCivilizationCalamityUI=function(id,mode="single"){
  if(ui.running)return false;
  const def=window.getCivilizationCalamityDefinition?.(id);
  if(!def||!window.isCivilizationCalamityUnlocked?.(id))return false;
  ui={phase:"combat",running:true,selectedId:id,mode:mode==="continuous"?"continuous":"single",lastBattle:null,finalRun:null,message:"",displayBattleNumber:1,displayEnemyHp:null,displayEnemyMax:null,displayPlayerHp:null,displayPlayerMax:null};
  view="calamity";render();
  if(ui.mode==="continuous"){setTimeout(runContinuousUi,80);return true;}
  setTimeout(runSingleUi,80);return true;
 };
 window.stopCivilizationCalamityContinuousUI=function(){
  const result=window.requestCivilizationCalamityContinuousStop?.();
  const btn=document.getElementById("calamityStopBtn");if(btn){btn.disabled=true;btn.textContent="停止中";}
  const msg=document.getElementById("combatMessage");if(msg)msg.textContent="已停止連續討伐；不會再開始下一場。";
  return !!result?.ok;
 };
 window.returnToCivilizationCalamityList=function(){stopMinimalIfOpen();if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("calamity-list");ui={phase:"idle",running:false,selectedId:null,mode:"single",lastBattle:null,finalRun:null,message:"",displayBattleNumber:1,displayEnemyHp:null,displayEnemyMax:null,displayPlayerHp:null,displayPlayerMax:null};view="calamity";render();};
 window.leaveCivilizationCalamityUI=function(){if(ui.running)return false;window.returnToCivilizationCalamityList();view="home";render();return true;};
 window.prepareCivilizationCalamityEntry=function(){if(ui.running)return false;if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation();if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("calamity-entry");ui={phase:"idle",running:false,selectedId:null,mode:"single",lastBattle:null,finalRun:null,message:"",displayBattleNumber:1,displayEnemyHp:null,displayEnemyMax:null,displayPlayerHp:null,displayPlayerMax:null};return true;};

 function calamityMinimalActive(){const run=window.getCivilizationCalamityRunSnapshot?.();return ui.phase==="combat"&&ui.mode==="continuous"&&ui.running&&run?.active===true;}
 function registerMinimal(){
  if(typeof window.registerMinimalModeAdapter!=="function")return false;
  return window.registerMinimalModeAdapter("civilization-calamity",{
   isActive:calamityMinimalActive,
   runningStatus:"文明災厄連續討伐中",
   centerClass:"main-minimal-mode-center--stacked",
   contentHtml(){return '<div class="main-minimal-mode-block"><div class="main-minimal-mode-label">目前敵人</div><div class="main-minimal-mode-value" data-calamity-minimal-enemy>文明災厄</div></div><div class="main-minimal-mode-block"><div class="main-minimal-mode-label">連續戰鬥</div><div class="main-minimal-mode-value" data-calamity-minimal-round>第 1 場</div></div><div class="main-minimal-mode-block"><div class="main-minimal-mode-label">災厄 HP</div><div class="main-minimal-mode-value" data-calamity-minimal-enemy-hp>—</div></div><div class="main-minimal-mode-block"><div class="main-minimal-mode-label">玩家 HP</div><div class="main-minimal-mode-value" data-calamity-minimal-player-hp>—</div></div>';},
   sync(root){
    const run=window.getCivilizationCalamityRunSnapshot?.(),def=window.getCivilizationCalamityDefinition?.(ui.selectedId);
    const e=root.querySelector("[data-calamity-minimal-enemy]"),round=root.querySelector("[data-calamity-minimal-round]"),ehp=root.querySelector("[data-calamity-minimal-enemy-hp]"),php=root.querySelector("[data-calamity-minimal-player-hp]");
    if(e)e.textContent=def?.name||run?.calamityName||"文明災厄";
    if(round)round.textContent=`第 ${Math.max(1,Number(ui.displayBattleNumber)||1)} 場`;
    const enemyCurrent=ui.displayEnemyHp==null?Number(run?.currentHp)||0:ui.displayEnemyHp,enemyMax=ui.displayEnemyMax||Number(run?.maxHp)||0;
    const playerCurrent=ui.displayPlayerHp==null?Number(run?.playerHp)||0:ui.displayPlayerHp,playerMax=ui.displayPlayerMax||Number(run?.playerMaxHp)||0;
    if(ehp)ehp.textContent=`${fmt(enemyCurrent)} / ${fmt(enemyMax)}`;
    if(php)php.textContent=`${fmt(playerCurrent)} / ${fmt(playerMax)}`;
   }
  });
 }
 window.openCivilizationCalamityMinimalMode=function(){registerMinimal();return typeof window.openMinimalMode==="function"&&window.openMinimalMode("civilization-calamity")===true;};

 function ensureUnlockModal(){
  let modal=document.getElementById("calamityUnlockModal");if(modal)return modal;
  modal=document.createElement("div");modal.id="calamityUnlockModal";modal.className="modal calamity-unlock-modal";
  modal.innerHTML='<div class="modal-box"><div class="calamity-result-kicker">新內容解鎖</div><h3>文明災厄已解鎖</h3><div id="calamityUnlockName" class="calamity-unlock-name"></div><div class="muted">可前往「文明災厄」進行挑戰。</div><div class="controls"><button class="btn primary" onclick="closeCivilizationCalamityUnlockNotice()">確認</button></div></div>';
  document.body.appendChild(modal);return modal;
 }
 function calamityForStory(storyId){
  const progress=window.civilizationStoryProgress;if(!progress?.bossStoryId)return null;
  return defs().find(item=>progress.bossStoryId(item.mapIndex)===storyId&&window.isCivilizationCalamityUnlocked?.(item.id))||null;
 }
 window.getCivilizationCalamityForStory=calamityForStory;
 window.getVisibleCivilizationCalamityIds=function(){return unlockedDefs().map(def=>def.id);};
 window.showCivilizationCalamityUnlockNoticeForStory=function(storyId){
  const def=calamityForStory(storyId);
  if(!def)return false;
  const modal=ensureUnlockModal(),name=modal.querySelector("#calamityUnlockName");if(name)name.textContent=def.name;
  modal.classList.add("show");return true;
 };
 window.closeCivilizationCalamityUnlockNotice=function(){document.getElementById("calamityUnlockModal")?.classList.remove("show");};

 window.getCivilizationMarkEffectText=markEffectText;
 window.CALAMITY_UI_VERSION=UI_VERSION;
 window.CALAMITY_STRUCTURED_PRESENTATION_VERSION=1;
 window.CALAMITY_MINIMAL_MODE_VERSION=MINIMAL_VERSION;
 registerMinimal();
})();