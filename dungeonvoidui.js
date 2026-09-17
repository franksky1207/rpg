(function(){
 let voidUi={phase:"idle",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};
 const sleep=ms=>typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("void")?window.backgroundProgressSleep(ms,"void"):new Promise(resolve=>setTimeout(resolve,ms));

 function progressSafe(){
  if(typeof ensureVoidMirageState==="function")return ensureVoidMirageState()||{highestCleared:0};
  return state?.dungeon?.voidMirage||{highestCleared:0};
 }
 function dailySafe(){return typeof voidMirageDailyStatus==="function"?voidMirageDailyStatus():{highestFloor:0,claimed:false,baseReward:0,reward:0,canClaim:false};}
 function startFloor(){return typeof getVoidMirageStartFloor==="function"?getVoidMirageStartFloor():Math.max(1,(progressSafe().highestCleared||0)-100);}
 function reasonText(reason){if(reason==="defeat")return "挑戰失敗";if(reason==="exit")return "已強制退出";return "本次挑戰結束";}
 function rewardLabel(daily){
  if(daily.claimed)return "今日已領取";
  if(daily.highestFloor<=0)return "尚無可領獎勵";
  return `${Number(daily.reward||0).toLocaleString()} VIP`;
 }
 function claimButtonHtml(daily){
  const disabled=!daily.canClaim;
  const label=daily.claimed?"今日獎勵已領取":daily.highestFloor<=0?"今日尚無獎勵":"領取今日 VIP 獎勵";
  return `<button class="btn primary" ${disabled?"disabled":""} onclick="${disabled?"void(0)":"claimVoidMirageRewardUI()"}">${label}</button>`;
 }
 function claimLineHtml(daily){
  const bonus=daily.baseReward>0&&daily.reward!==daily.baseReward?`（基礎 ${daily.baseReward.toLocaleString()}）`:"";
  const stateText=daily.claimed?"已領取":daily.highestFloor>0?"尚未領取":"突破至少 1 層後可領";
  return `<div class="void-claim-line">今日獎勵：<strong>${rewardLabel(daily)}</strong>${bonus}　・　${stateText}</div>`;
 }
 function statsHtml(run,floorOverride=null){
  const progress=progressSafe(),daily=dailySafe(),floor=floorOverride||run?.currentFloor||startFloor();
  return `<div class="void-stats"><div class="void-stat"><span>目前樓層</span><strong>第 ${Number(floor).toLocaleString()} 層</strong></div><div class="void-stat"><span>本次突破</span><strong>${Number(run?.cleared||0).toLocaleString()} 層</strong></div><div class="void-stat"><span>歷史最高</span><strong>第 ${Number(progress.highestCleared||0).toLocaleString()} 層</strong></div><div class="void-stat"><span>當日最高</span><strong>第 ${Number(daily.highestFloor||0).toLocaleString()} 層</strong></div></div>`;
 }

 function idleHtml(){
  const p=progressSafe(),daily=dailySafe(),start=startFloor();
  return `<section class="void-shell"><div class="card void-panel void-result"><div class="void-title">【虛空幻境】</div><div class="void-stats"><div class="void-stat"><span>歷史最高</span><strong>第 ${Number(p.highestCleared||0).toLocaleString()} 層</strong></div><div class="void-stat"><span>挑戰起點</span><strong>第 ${Number(start).toLocaleString()} 層</strong></div><div class="void-stat"><span>當日最高</span><strong>第 ${Number(daily.highestFloor||0).toLocaleString()} 層</strong></div><div class="void-stat"><span>今日可領 VIP</span><strong>${daily.claimed?"已領取":Number(daily.reward||0).toLocaleString()}</strong></div></div><div class="muted">每次挑戰從歷史最高紀錄前 100 層開始，最低第 1 層。每層戰後完全恢復 HP，可重複挑戰。</div>${claimLineHtml(daily)}${voidUi.message?`<div class="notice" style="margin-top:10px">${voidUi.message}</div>`:""}<div class="void-actions"><button class="btn dungeon-entry-btn" onclick="startVoidMirageChallengeUI()">開始挑戰</button>${claimButtonHtml(daily)}<button class="btn" onclick="returnFromVoidMirage()">返回副本</button></div></div></section>`;
 }

 function combatHtml(fr,run){
  const e=fr.enemy,s=run?.playerSnapshot||playerCombatStats(),floor=fr.floor,boss=e?.isBossFloor,daily=dailySafe();
  const traits=typeof combatTraitBadgesHtml==="function"?combatTraitBadgesHtml(e?.traits):"";
  const exitLabel=voidUi.exitAfterFloor?"本層結束後將退出":"強制退出虛空幻境";
  return `<section class="void-shell"><div class="card void-panel"><div class="void-title main-minimal-mode-head"><span class="main-minimal-mode-head-label">【虛空幻境】</span>${run?.active?`<button type="button" class="main-minimal-mode-enter" onclick="openVoidMirageMinimalMode()">極簡模式</button>`:""}</div>${statsHtml(run,floor)}${claimLineHtml(daily)}<div class="void-actions void-top-exit"><button class="btn void-exit-btn" ${voidUi.exitAfterFloor?"disabled":""} onclick="requestVoidMirageExitUI()">${exitLabel}</button></div><div class="combat-screen void-combat"><div class="combat-head">自動挑戰中</div><div class="combat-arena"><div class="combatant player void-player" id="voidPlayerCard"><div class="combat-damage" id="voidPlayerDamage"></div><h2>${escapePlayerName(currentPlayerName())} Lv.${state.level}</h2><div class="void-player-meta">ATK ${s.atk}　DEF ${s.def}<br>暴擊 ${s.crit}%　閃避 ${s.dodge}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="voidPlayerHp">${s.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="voidPlayerBar" style="width:100%"></span></div></div></div><div class="combat-vs void-vs">VS</div><div class="combatant enemy void-enemy" id="voidEnemyCard"><div class="combat-damage" id="voidEnemyDamage"></div><div class="void-floor-badge${boss?" void-boss-badge":""}">${boss?"雙特性關卡":"一般關卡"}</div><h2>${e.name}</h2>${traits}<div class="void-enemy-meta">ATK ${e.atk}　DEF ${e.def}<br>暴擊 ${e.crit}%　閃避 ${e.dodge}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="voidEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="voidEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message void-message" id="voidCombatMessage">準備戰鬥</div></div></div></section>`;
 }

 function resultHtml(run){
  const progress=progressSafe(),daily=dailySafe(),cleared=run?.cleared||0,isExit=run?.endedReason==="exit",endFloor=isExit?(run?.lastClearedFloor||run?.startFloor||0):(run?.failedFloor||0),endLabel=isExit?"退出樓層":"失敗樓層",endText=endFloor?`第 ${Number(endFloor).toLocaleString()} 層`:"—",nextStart=startFloor();
  return `<section class="void-shell"><div class="card void-panel void-result"><div class="void-title">【虛空幻境】</div><div class="void-result-reason">${reasonText(run?.endedReason)}</div><h2>本次挑戰完成</h2><div class="void-result-grid"><div><span>本次突破</span><strong>${Number(cleared).toLocaleString()} 層</strong></div><div><span>${endLabel}</span><strong>${endText}</strong></div><div><span>歷史最高</span><strong>第 ${Number(progress.highestCleared||0).toLocaleString()} 層</strong></div><div><span>當日最高</span><strong>第 ${Number(daily.highestFloor||0).toLocaleString()} 層</strong></div><div><span>下次挑戰起點</span><strong>第 ${Number(nextStart).toLocaleString()} 層</strong></div><div><span>今日可領 VIP</span><strong>${daily.claimed?"已領取":Number(daily.reward||0).toLocaleString()}</strong></div></div>${claimLineHtml(daily)}${voidUi.message?`<div class="notice" style="margin-top:10px">${voidUi.message}</div>`:""}<div class="muted" style="margin-top:10px">目前 VIP 積分：${Math.floor(Number(state.vipPoints)||0).toLocaleString()}</div><div class="void-actions"><button class="btn dungeon-entry-btn" onclick="startVoidMirageChallengeUI()">再次挑戰</button>${claimButtonHtml(daily)}<button class="btn" onclick="returnFromVoidMirage()">返回副本</button></div></div></section>`;
 }

 window.renderVoidMirageDungeon=function(){
  if(voidUi.phase==="result"&&voidUi.finalRun)return resultHtml(voidUi.finalRun);
  const run=typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;
  if(voidUi.floorResult&&run)return combatHtml(voidUi.floorResult,run);
  return idleHtml();
 };

 function setHpUi(ehp,enemyMax,php,playerMax,message){
  const eb=document.getElementById("voidEnemyBar"),eh=document.getElementById("voidEnemyHp"),pb=document.getElementById("voidPlayerBar"),ph=document.getElementById("voidPlayerHp"),msg=document.getElementById("voidCombatMessage");
  if(eb)eb.style.width=`${Math.max(0,Math.min(100,ehp/enemyMax*100))}%`;
  if(eh)eh.textContent=`${Math.max(0,ehp)} / ${enemyMax}`;
  if(pb)pb.style.width=`${Math.max(0,Math.min(100,php/playerMax*100))}%`;
  if(ph)ph.textContent=`${Math.max(0,php)} / ${playerMax}`;
  if(msg)msg.textContent=message||"";
 }
 function pulse(target,text){
  const card=document.getElementById(target==="enemy"?"voidEnemyCard":"voidPlayerCard"),dmg=document.getElementById(target==="enemy"?"voidEnemyDamage":"voidPlayerDamage");
  if(card&&text!=="閃避"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),250);}
  if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show");}
 }
 async function animateFloor(fr){
  const result=fr.result,e=fr.enemy,playerMax=fr.playerMaxHp||playerCombatStats().hp;let ehp=e.hp,php=playerMax;
  const logs=result?.logs||[],delay=logs.length>90?14:logs.length>50?24:45;
  setHpUi(ehp,e.hp,php,playerMax,"開始戰鬥");await sleep(100);
  for(const line of logs){
   let m=line.match(/^你攻擊.+，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const n=Number(m[1]);ehp=Math.max(0,ehp-n);pulse("enemy",line.includes("暴擊")?`暴擊 ${n}`:`-${n}`);setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("閃避了你的攻擊")){pulse("enemy","閃避");setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   m=line.match(/^.+攻擊你，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const n=Number(m[1]);php=Math.max(0,php-n);pulse("player",line.includes("暴擊")?`暴擊 ${n}`:`-${n}`);setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("你閃避了攻擊")){pulse("player","閃避");setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);
  }
  if(result?.win)setHpUi(0,e.hp,Math.max(0,php),playerMax,`第 ${fr.floor} 層突破`);
 }

 async function runVoidMirageUiAuto(){
  if(voidUi.running)return false;
  if(typeof window.runVoidMirageAuto!=="function"){
   voidUi.message="虛空幻境自動挑戰核心未載入。";
   render();
   return false;
  }
  voidUi.running=true;
  try{
   await window.runVoidMirageAuto({
    async onFloorComplete(fr){
     if(!fr?.ok)return;
     voidUi.floorResult=fr;
     voidUi.phase="combat";
     render();
     if(window.getMinimalModeAdapterId?.()==="void-mirage"){
      if(fr.ended)stopVoidMinimalModeIfOpen();
      else if(typeof window.syncMainMinimalMode==="function")window.syncMainMinimalMode();
     }
     await animateFloor(fr);
     if(!fr.ended)await sleep(350);
    },
    async onEnd(run){
     stopVoidMinimalModeIfOpen();
     voidUi.finalRun=run||(typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null);
     voidUi.phase="result";
     voidUi.floorResult=null;
     render();
    }
   });
   return true;
  }finally{
   voidUi.running=false;
   if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("void");
  }
 }

 window.enterVoidMirageDungeon=function(){
  if(Number(state?.level||0)<25)return;
  if(voidUi.running)return;
  voidUi={phase:"idle",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};
  view="dungeon-void-mirage";render();
 };
 window.startVoidMirageChallengeUI=function(){
  if(voidUi.running)return;
  const started=typeof beginVoidMirageRun==="function"?beginVoidMirageRun():{ok:false};
  if(!started.ok){voidUi.message="目前無法開始虛空幻境。";render();return;}
  if(typeof window.backgroundProgressStart==="function")window.backgroundProgressStart("void");
  voidUi={phase:"combat",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};render();
  if(typeof window.backgroundProgressSleep==="function")window.backgroundProgressSleep(100,"void").then(runVoidMirageUiAuto);else setTimeout(runVoidMirageUiAuto,100);
 };
 window.claimVoidMirageRewardUI=function(){
  if(voidUi.running)return;
  const daily=dailySafe();
  if(!daily.canClaim){
   voidUi.message=daily.claimed?"今日虛空獎勵已領取。":"今天尚未突破任何樓層，暫無可領獎勵。";
   render();
   return;
  }
  const reward=Math.max(0,Math.floor(Number(daily.reward)||0));
  const confirmed=confirm(`確定要領取今日虛空 VIP 獎勵嗎？\n\n今日獎勵：${reward.toLocaleString()} VIP\n領取後今日不可再次領取。`);
  if(!confirmed)return;
  const result=typeof claimVoidMirageDailyReward==="function"?claimVoidMirageDailyReward():{ok:false,reason:"reward_system_missing"};
  if(result.ok)voidUi.message=`已領取今日虛空獎勵：+${Number(result.awarded||0).toLocaleString()} VIP 積分。`;
  else if(result.reason==="already_claimed")voidUi.message="今日虛空獎勵已領取。";
  else if(result.reason==="no_daily_record")voidUi.message="今天尚未突破任何樓層，暫無可領獎勵。";
  else voidUi.message="目前無法領取虛空獎勵。";
  render();
 };
 window.requestVoidMirageExitUI=function(){
  if(voidUi.phase==="result")return;
  voidUi.exitAfterFloor=true;
  if(typeof window.requestVoidMirageExit==="function")window.requestVoidMirageExit();
  const btn=document.querySelector(".void-exit-btn");if(btn){btn.disabled=true;btn.textContent="本層結束後將退出";}
  const msg=document.getElementById("voidCombatMessage");if(msg)msg.textContent="已要求退出：本層結束後離開虛空幻境。";
 };
 window.returnFromVoidMirage=function(){voidUi={phase:"idle",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};view="dungeon";render();};

 function stopVoidMinimalModeIfOpen(){
  if(window.getMinimalModeAdapterId?.()!=="void-mirage")return false;
  if(typeof window.setMainMinimalModeState!=="function")return false;
  window.setMainMinimalModeState("stopped");
  return true;
 }
 function voidMinimalModeIsActive(){
  const run=typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;
  return voidUi.phase==="combat"&&!!voidUi.floorResult&&run?.active===true;
 }
 function registerVoidMinimalModeAdapter(){
  if(typeof window.registerMinimalModeAdapter!=="function")return false;
  return window.registerMinimalModeAdapter("void-mirage",{
   isActive:voidMinimalModeIsActive,
   runningStatus:"虛空幻境持續挑戰中",
   centerClass:"main-minimal-mode-center--stacked",
   contentHtml(){return `<div class="main-minimal-mode-block"><div class="main-minimal-mode-label">目前敵人</div><div class="main-minimal-mode-value" data-void-minimal-mode-enemy>戰鬥中</div></div>
      <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">本次突破</div><div class="main-minimal-mode-value" data-void-minimal-mode-cleared>0 層</div></div>
      <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">已過樓層</div><div class="main-minimal-mode-value" data-void-minimal-mode-last-cleared>第 0 層</div></div>
      <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">歷史最高</div><div class="main-minimal-mode-value" data-void-minimal-mode-highest>第 0 層</div></div>`;},
   sync(root,mode){
    const run=typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;
    const enemy=root.querySelector("[data-void-minimal-mode-enemy]");
    const cleared=root.querySelector("[data-void-minimal-mode-cleared]");
    const lastCleared=root.querySelector("[data-void-minimal-mode-last-cleared]");
    const highest=root.querySelector("[data-void-minimal-mode-highest]");
    if(enemy)enemy.textContent=voidUi.floorResult?.enemy?.name||run?.lastEnemy?.name||"戰鬥中";
    if(cleared)cleared.textContent=`${Math.max(0,Math.floor(Number(run?.cleared)||0)).toLocaleString()} 層`;
    if(lastCleared)lastCleared.textContent=`第 ${Math.max(0,Math.floor(Number(run?.lastClearedFloor)||0)).toLocaleString()} 層`;
    if(highest)highest.textContent=`第 ${Math.max(0,Math.floor(Number(run?.historicalHighest)||0)).toLocaleString()} 層`;
   }
  });
 }
 window.openVoidMirageMinimalMode=function(){
  registerVoidMinimalModeAdapter();
  return typeof window.openMinimalMode==="function"&&window.openMinimalMode("void-mirage")===true;
 };
 window.VOID_MIRAGE_UI_STYLE_VERSION=1;
 window.VOID_MIRAGE_UI_AUTO_ADAPTER_VERSION=1;
 window.VOID_MINIMAL_MODE_HOOK_VERSION=1;
 registerVoidMinimalModeAdapter();
})();