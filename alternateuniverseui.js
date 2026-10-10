(function(){
 const ALTERNATE_UNIVERSE_PLAYER_UI_VERSION=6;
 const ALTERNATE_UNIVERSE_COMBAT_PRESENTATION_VERSION=1;
 let lastBattleReport=null;
 let battleContext=null;
 function esc(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
 function whole(v,fallback=0){const n=Math.floor(Number(v));return Number.isFinite(n)?n:fallback;}
 function fmt(v){return Math.max(0,whole(v,0)).toLocaleString();}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:(window.state&&typeof window.state==="object"?window.state:null);}catch(_){return window.state&&typeof window.state==="object"?window.state:null;}}
 function progress(){return typeof window.alternateUniverseProgressionSnapshot==="function"?window.alternateUniverseProgressionSnapshot(currentState()):null;}
 function depthInfo(depth){return typeof window.alternateUniverseDepthInfo==="function"?window.alternateUniverseDepthInfo(depth):null;}
 function baseStats(depth){return typeof window.alternateUniverseEnemyStats==="function"?window.alternateUniverseEnemyStats(depth):null;}
 function activeAttempt(){return typeof window.alternateUniverseActiveAttempt==="function"?window.alternateUniverseActiveAttempt(currentState()):null;}
 function failureStatus(depth){return typeof window.alternateUniverseFailureStatus==="function"?window.alternateUniverseFailureStatus(depth,currentState()):null;}
 function traitMeta(id){return window.MONSTER_TRAITS?.[id]||{name:id,desc:""};}
 function traitBadges(ids){const rows=(Array.isArray(ids)?ids:[]).map(id=>{const t=traitMeta(id);return `<span class="trait-detail-name" style="border-color:${esc(t.border||"#667")};color:${esc(t.color||"#d9e8ff")};font-size:inherit;font-weight:700;padding:3px 10px;line-height:1.25">${esc(t.name)}</span>`;}).join("");return rows?`<div class="combat-trait-badges" style="display:flex;align-self:stretch;width:100%;justify-content:flex-start;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 12px;text-align:left;font-size:1.2em;font-weight:700">${rows}</div>`:"";}
 function traitDetails(ids){const rows=(Array.isArray(ids)?ids:[]).map(id=>{const t=traitMeta(id);return `<div class="au-trait"><b>${esc(t.name)}</b><span>${esc(t.desc)}</span></div>`;}).join("");return rows?`<div class="au-traits">${rows}</div>`:"";}
 function infoTitle(info){return info?`第 ${fmt(info.depth)} 層域｜${esc(info.universeName)}・${esc(info.stageName||info.stageLabel||"")}`:"異宇宙";}
 function homeEntryHtml(){if(typeof window.alternateUniverseHomeEntryVisible!=="function"||window.alternateUniverseHomeEntryVisible(currentState())!==true)return "";const snap=progress();const text=snap?.unlocked?`已征服 ${whole(snap.deepestCleared,0)} / ${whole(snap.maxDepth,1000)} 層域`:"已擊敗 10 名高維存在，異宇宙已開放。";return `<section class="world-phase-home-card au-home-entry" data-alternate-universe-home-entry="1"><div class="world-phase-home-copy"><div class="world-phase-kicker">終局挑戰</div><h3>異宇宙</h3><div class="world-phase-home-desc">跨越既有紀元，挑戰 200 個異宇宙、1000 個層域。無資源收益，只記錄征服進度。</div><div class="world-phase-progress">${esc(text)}</div></div><div class="world-phase-home-actions"><button class="btn primary" onclick="openAlternateUniversePage()">進入異宇宙</button></div></section>`;}
 function unlockForEntry(){if(typeof window.ensureAlternateUniversePermanentUnlock!=="function")return {ok:false,reason:"access-owner-missing"};return window.ensureAlternateUniversePermanentUnlock(currentState());}
 function openPage(){const access=unlockForEntry();if(!access?.ok){alert(access?.reason==="third-world-bosses-incomplete"?"擊敗 10 名高維存在後才會解鎖異宇宙。":"異宇宙入口尚未完成解鎖，請重新整理後再試。");return false;}try{view="alternateuniverse";}catch(_){}lastBattleReport=null;battleContext=null;renderPage();return true;}
 function progressHtml(snap){return `<div class="au-progress-grid"><div><span>征服層域</span><b>${fmt(snap?.deepestCleared)} / ${fmt(snap?.maxDepth||1000)}</b></div><div><span>已征服宇宙</span><b>${fmt(snap?.completedUniverses)} / ${fmt(snap?.totalUniverses||200)}</b></div><div><span>下一層域</span><b>${snap?.nextDepth?`第 ${fmt(snap.nextDepth)} 層域`:"完成"}</b></div><div><span>剩餘層域</span><b>${fmt(snap?.remainingDepths)}</b></div></div>`;}
 function statsHtml(stats){if(!stats)return "";return `<div class="au-stat-grid"><div><span>HP</span><b>${fmt(stats.hp)}</b></div><div><span>ATK</span><b>${fmt(stats.atk)}</b></div><div><span>DEF</span><b>${fmt(stats.def)}</b></div><div><span>暴擊</span><b>${Number(stats.crit||0)}%</b></div><div><span>閃避</span><b>${Number(stats.dodge||0)}%</b></div></div>`;}
 function resultHtml(){const row=lastBattleReport;if(!row)return "";const result=row.result,basis=result?.settlementBasis,combat=result?.combat,win=basis?.outcome==="win",incomplete=basis?.outcome==="incomplete",title=incomplete?"戰鬥未完成":win?"勝利":"敗北";return `<section class="au-result ${win?"win":"loss"}"><div class="au-kicker">正式攻略</div><h3>${title}｜第 ${fmt(row.depth)} 層域</h3><div class="au-result-meta"><div><span>回合</span><b>${fmt(basis?.turns||combat?.turns)}</b></div><div><span>玩家剩餘 HP</span><b>${fmt(basis?.playerEndHp??combat?.hp)}</b></div><div><span>敵方剩餘 HP</span><b>${fmt(basis?.enemyEndHp??combat?.enemyHp)}</b></div></div>${traitDetails(row.traits)}<div class="au-note">${incomplete?"此戰未形成正式勝敗，本次挑戰會保留，可直接再次挑戰。":win?"正式勝利已推進異宇宙征服進度。":"正式敗北已計入本輪此層域的失敗次數。"}</div></section>`;}
 function frontierHtml(snap){
  if(snap?.completed)return `<section class="au-card au-complete"><div class="au-kicker">異宇宙征服完成</div><h3>全部異宇宙已征服</h3><div class="muted">1000 / 1000 層域・200 / 200 宇宙</div><div class="au-note">所有異宇宙正式攻略皆已完成。</div></section>`;
  const depth=whole(snap?.nextDepth,0),info=depthInfo(depth),base=baseStats(depth),failure=failureStatus(depth),attempt=activeAttempt();if(!depth||!info)return `<section class="au-card"><h3>異宇宙前線資料尚未載入</h3></section>`;
  const locked=failure?.locked===true;const remaining=whole(failure?.failuresRemainingBeforeLock,10);const failures=whole(failure?.failures,0);const limit=whole(failure?.limit,10);const failureText=locked?`本輪已達 ${failures} / ${limit} 敗，此層域已鎖定；完成下一次轉生後即可再次挑戰。`:failures===limit-1?`本輪失敗 ${failures} / ${limit}；下一次失敗將鎖定此層域，直到完成下一次轉生。`:`本輪失敗 ${failures} / ${limit}；再失敗 ${remaining} 次將鎖定此層域。`;
  const buttonLabel=attempt&&attempt.depth===depth?"繼續挑戰":"挑戰";
  return `<section class="au-card ${locked?"au-warning":""}"><div class="au-card-head"><div><div class="au-kicker">目前正式前線</div><h3>${infoTitle(info)}</h3><div class="muted">第 ${fmt(info.universeNumber)} 宇宙・${esc(info.culture||"")}</div></div><span class="au-stage">${esc(info.stageName||info.stageLabel||"")}</span></div>${statsHtml(base)}<div class="au-note">${esc(failureText)}</div>${locked?"":`<div class="au-actions"><button class="btn primary" onclick="challengeAlternateUniverseFormal()">${buttonLabel}第 ${fmt(depth)} 層域</button>${attempt&&attempt.depth===depth?'<button class="btn danger" onclick="abandonAlternateUniverseFormal()">放棄本次挑戰</button>':""}</div>`}</section>`;
 }
 function pageHtml(){const snap=progress();if(!snap?.unlocked)return `<div class="function-page alternate-universe-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><section class="au-card"><h3>異宇宙尚未解鎖</h3></section></div>`;return `<div class="function-page alternate-universe-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><section class="au-shell"><section class="au-hero"><h2>異宇宙</h2><div class="muted">200 個異宇宙，每個宇宙分為 5 個層域，共 1000 個層域。正式勝利只推進征服進度，不提供 EXP、資源或裝備。</div>${progressHtml(snap)}</section>${resultHtml()}${frontierHtml(snap)}</section></div>`;}
 function combatPageHtml(){const ctx=battleContext;if(!ctx)return pageHtml();const pMax=Math.max(1,whole(ctx.playerMaxHp,1)),eMax=Math.max(1,whole(ctx.enemy?.hp,1)),info=ctx.info||depthInfo(ctx.depth);return `<section class="combat-screen au-combat-screen"><div class="combat-head">異宇宙・正式攻略</div><div class="au-combat-subtitle">${infoTitle(info)}</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${typeof window.playerIdentityNameHtml==="function"?window.playerIdentityNameHtml({compact:true}):esc(currentState()?.playerName||"玩家")} Lv.${fmt(currentState()?.level||1)}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${fmt(pMax)} / ${fmt(pMax)}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:100%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${infoTitle(info)}</h2>${traitBadges(ctx.attempt?.traits)}<div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${fmt(eMax)} / ${fmt(eMax)}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">異宇宙特性已揭示，準備戰鬥</div></section>`;}
 function renderPage(){const main=document.getElementById("main");if(main){main.innerHTML=battleContext?combatPageHtml():pageHtml();if(!battleContext)window.CivilizationAudioScenes?.setContext?.("higher","alternateSelect");window.civilization3dHomeRouteRendered?.("alternateuniverse");}return !!main;}
 function presentationSleep(){return typeof window.mainBattlePresentationSleep==="function"?window.mainBattlePresentationSleep:undefined;}
 async function presentCombat(combat){if(typeof window.animateStructuredCombatPresentation!=="function")throw new Error("Structured Combat Presentation 未載入。");await window.animateStructuredCombatPresentation(combat,{mode:"main",sleep:presentationSleep(),clearAfter:true,clearReason:"alternate-universe-battle-end"});}
 async function challengeFormal(){
  if(battleContext)return false;const snap=progress();if(!snap?.nextDepth)return false;
  let attempt=activeAttempt();if(!attempt){const begun=typeof window.beginAlternateUniverseAttempt==="function"?window.beginAlternateUniverseAttempt(snap.nextDepth):{ok:false,reason:"attempt-owner-missing"};if(!begun?.ok){alert(begun?.reason==="depth-locked-for-life"?"本輪此層域已鎖定，完成下一次轉生後可再次挑戰。":"無法建立異宇宙挑戰，請重新整理後再試。");return false;}attempt=activeAttempt();}
  if(!attempt||attempt.depth!==snap.nextDepth)return false;
  const enemy=typeof window.alternateUniverseCurrentAttemptEncounter==="function"?window.alternateUniverseCurrentAttemptEncounter(currentState()):null;const player=typeof window.playerCombatStats==="function"?window.playerCombatStats():null;if(!enemy||!player){alert("異宇宙戰鬥資料尚未完整載入。");return false;}
  window.CivilizationAudioScenes?.notify?.("combat-start",{era:"higher",mode:"alternateBattle"});lastBattleReport=null;battleContext={depth:attempt.depth,attempt,enemy,info:depthInfo(attempt.depth),playerMaxHp:Math.max(1,whole(player.hp,1))};renderPage();
  try{
   const result=typeof window.runAlternateUniverseCombat==="function"?window.runAlternateUniverseCombat({logs:true,preparePresentation:true,startHp:player.hp,playerHealCap:player.hp}):{ok:false};
   if(!result?.ok)throw new Error(result?.reason||"combat-failed");
   await presentCombat(result.combat);
   let settlement=null;if(result.settlementReady===true){settlement=typeof window.settleAlternateUniverseCombat==="function"?window.settleAlternateUniverseCombat(result):{ok:false};if(!settlement?.ok)throw new Error(settlement?.reason||"settlement-failed");}
   lastBattleReport={depth:attempt.depth,traits:Array.from(attempt.traits||[]),result,settlement};if(settlement?.ok===true&&result?.combat?.win===true)window.CivilizationAudio?.settlementVictory?.("alternate:"+String(attempt.attemptId||attempt.depth),{success:true});return true;
  }catch(error){console.error("[文明戰線] 異宇宙戰鬥失敗",error);alert("異宇宙戰鬥未能完成，本次挑戰會保留；請重新整理後再試。");return false;}
  finally{battleContext=null;window.CivilizationAudioScenes?.notify?.("combat-exit",{era:"higher",mode:"alternateBattle"});renderPage();}
 }
 function abandonFormal(){const attempt=activeAttempt();if(!attempt||battleContext)return false;if(!confirm("放棄尚未結算的異宇宙挑戰會記 1 次失敗。確定放棄？"))return false;const result=typeof window.abandonAlternateUniverseAttempt==="function"?window.abandonAlternateUniverseAttempt({attemptId:attempt.attemptId}):{ok:false};if(!result?.ok){alert("無法放棄本次挑戰，請重新整理後再試。");return false;}lastBattleReport=null;renderPage();return true;}
 window.ALTERNATE_UNIVERSE_PLAYER_UI_VERSION=ALTERNATE_UNIVERSE_PLAYER_UI_VERSION;
 window.ALTERNATE_UNIVERSE_COMBAT_PRESENTATION_VERSION=ALTERNATE_UNIVERSE_COMBAT_PRESENTATION_VERSION;
 window.alternateUniverseHomeEntryHtml=homeEntryHtml;
 window.alternateUniversePageHtml=pageHtml;
 window.renderAlternateUniversePage=renderPage;
 window.openAlternateUniversePage=openPage;
 window.challengeAlternateUniverseFormal=challengeFormal;
 window.abandonAlternateUniverseFormal=abandonFormal;
 // ui.js performs its first render before this module is registered. Refresh only
 // the home screen after all synchronous scripts have registered their entry owners.
 // Never touch the save, unlock state, current route or active combat.
 // The authoritative ui.js home-entry reconciler now owns all late route entries.
 // Do not render the home independently when this module finishes registering.
 const requestHomeReconcile=()=>window.civilizationRequestHomeEntryReconcile?.();
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",requestHomeReconcile,{once:true});
 else queueMicrotask(requestHomeReconcile);
})();