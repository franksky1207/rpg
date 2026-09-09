(function(){
 let voidUi={phase:"idle",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

 function injectStyles(){
  if(document.getElementById("void-mirage-ui-styles"))return;
  const style=document.createElement("style");
  style.id="void-mirage-ui-styles";
  style.textContent=`
  .dungeon-mode-tower{background:linear-gradient(180deg,#15232b,#11191f);border-color:#3f7787}.dungeon-mode-tower h3{color:#8fd5e3}.dungeon-mode-tower .dungeon-entry-btn{background:#245c6b;border-color:#3f8294;color:#effcff}.dungeon-mode-tower .dungeon-entry-btn:not(:disabled):hover{background:#2d7183}
  .void-shell{max-width:960px;margin:0 auto;padding-bottom:14px}.void-panel{background:linear-gradient(180deg,#13242d,#0d171d);border:1px solid #3d7788;color:#e8f8fb}.void-title{text-align:center;color:#90dce9;font-size:23px;font-weight:850;letter-spacing:.06em;margin-bottom:12px}.void-subtitle{text-align:center;color:#aac8cf;margin:-4px 0 14px}
  .void-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:0 0 14px}.void-stat{background:#0c171c;border:1px solid #2c5560;border-radius:10px;padding:10px;text-align:center;min-width:0}.void-stat span{display:block;color:#8eabb2;font-size:12px}.void-stat strong{display:block;color:#e8fbff;font-size:19px;margin-top:3px;overflow-wrap:anywhere}
  .void-combat{background:linear-gradient(180deg,#102129,#0c151a);border:1px solid #356f80;border-radius:16px;padding:16px}.void-combat .combat-head{color:#90dce9}.void-player{background:linear-gradient(180deg,#18232b,#10161b)!important;border-color:#536f80!important}.void-enemy{background:linear-gradient(180deg,#16313a,#0f2027)!important;border-color:#4a93a5!important;box-shadow:0 18px 44px rgba(26,91,108,.27)}.void-enemy h2{color:#dffaff}.void-vs{color:#80cbd8}.void-message{color:#9dd8e2}
  .void-floor-badge{display:inline-block;border:1px solid #4d91a2;border-radius:999px;padding:4px 10px;color:#9ee5f0;background:#102a32;font-weight:800;margin-bottom:7px}.void-boss-badge{border-color:#c79d58;color:#f0cb84;background:#302412}.void-enemy-meta{color:#b9d4da;font-size:13px;line-height:1.6;margin:7px 0}.void-traits{color:#d7eef2;margin:6px 0 10px}.void-reward{color:#f0cd7d;font-weight:800}
  .void-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:14px}.void-exit-btn{background:#7b3438;border-color:#a24a50;color:#fff}.void-exit-btn:hover{background:#914047}.void-exit-btn:disabled{opacity:.62;cursor:not-allowed}.void-result{max-width:680px;margin:0 auto;text-align:center;padding:22px}.void-result h2{color:#dffaff;margin:6px 0 14px}.void-result-reason{font-size:18px;font-weight:800;color:#9ddbe5;margin-bottom:12px}.void-result-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;text-align:left;margin:14px 0}.void-result-grid>div{background:#0d191f;border:1px solid #2f5965;border-radius:10px;padding:11px}.void-result-grid span{display:block;color:#8faab1;font-size:12px}.void-result-grid strong{display:block;color:#edfaff;font-size:18px;margin-top:3px}
  @media(max-width:760px){.void-shell{padding:0 4px 12px}.void-panel,.void-combat{padding:10px}.void-title{font-size:20px}.void-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.void-stat{padding:8px}.void-stat strong{font-size:17px}.void-result{padding:17px 12px}}
  @media(max-width:430px){.void-result-grid{grid-template-columns:1fr}.void-actions .btn{width:100%}}
  `;
  document.head.appendChild(style);
 }

 function dungeonSafe(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState();
  return state.dungeon||{progress:0,attempts:0,points:0};
 }
 function progressSafe(){
  if(typeof ensureVoidMirageState==="function")return ensureVoidMirageState()||{highestCleared:0};
  return state?.dungeon?.voidMirage||{highestCleared:0};
 }
 function traitNames(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>MONSTER_TRAITS?.[id]?.name||id).join("、");
 }
 function averagePoints(run){return run?.cleared?round1((Number(run.points)||0)/run.cleared):0;}
 function reasonText(reason){
  if(reason==="defeat")return "挑戰失敗";
  if(reason==="exit")return "已強制退出";
  return "本次挑戰結束";
 }
 function statsHtml(run,floorOverride=null){
  const progress=progressSafe();
  const floor=floorOverride||run?.currentFloor||Math.max(1,(progress.highestCleared||0)+1);
  return `<div class="void-stats">
   <div class="void-stat"><span>目前挑戰樓層</span><strong>第 ${floor} 層</strong></div>
   <div class="void-stat"><span>最高通過樓層</span><strong>第 ${progress.highestCleared||0} 層</strong></div>
   <div class="void-stat"><span>本次突破</span><strong>${run?.cleared||0} 層</strong></div>
   <div class="void-stat"><span>本次積分</span><strong>${run?.points||0}</strong></div>
  </div>`;
 }

 function idleHtml(){
  const d=dungeonSafe(),p=progressSafe(),next=Math.max(1,(p.highestCleared||0)+1);
  return `<section class="void-shell"><div class="card void-panel void-result">
   <div class="void-title">【虛空幻境】</div>
   <h2>第 ${next} 層</h2>
   <div class="muted">進入後會自動逐層挑戰；每層開始前完全恢復 HP，直到戰敗或強制退出。</div>
   <div class="void-result-grid">
    <div><span>最高通過樓層</span><strong>第 ${p.highestCleared||0} 層</strong></div>
    <div><span>剩餘可挑戰次數</span><strong>${d.attempts||0} 次</strong></div>
   </div>
   <div class="void-actions"><button class="btn" onclick="go('dungeon')">返回副本</button></div>
  </div></section>`;
 }

 function combatHtml(fr,run){
  const e=fr.enemy,s=equippedStats(),floor=fr.floor;
  const boss=e?.isBossFloor;
  const exitLabel=voidUi.exitAfterFloor?"本層結束後將退出":"強制退出虛空幻境";
  return `<section class="void-shell">
   <div class="card void-panel">
    <div class="void-title">【虛空幻境】</div>
    ${statsHtml(run,floor)}
    <div class="void-subtitle">平均每層積分：${averagePoints(run)}</div>
    <div class="combat-screen void-combat">
     <div class="combat-head">第 ${floor} 層・自動挑戰中</div>
     <div class="combat-arena">
      <div class="combatant player void-player" id="voidPlayerCard"><div class="combat-damage" id="voidPlayerDamage"></div><h2>玩家 Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="voidPlayerHp">${s.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="voidPlayerBar" style="width:100%"></span></div></div></div>
      <div class="combat-vs void-vs">VS</div>
      <div class="combatant enemy void-enemy" id="voidEnemyCard"><div class="combat-damage" id="voidEnemyDamage"></div><div class="void-floor-badge${boss?" void-boss-badge":""}">${boss?"雙特性關卡":"虛空幻境"}・第 ${floor} 層</div><h2>${e.name}</h2><div class="void-traits">特性：${traitNames(e)}</div><div class="void-enemy-meta">HP ${e.hp}　ATK ${e.atk}　DEF ${e.def}<br>暴擊 ${e.crit}%　閃避 ${e.dodge}%</div><div class="void-reward">首通積分 +${fr.gained||e.firstClearPoints||0}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="voidEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="voidEnemyBar" style="width:100%"></span></div></div></div>
     </div>
     <div class="combat-message void-message" id="voidCombatMessage">準備戰鬥</div>
    </div>
    <div class="void-actions"><button class="btn void-exit-btn" ${voidUi.exitAfterFloor?"disabled":""} onclick="requestVoidMirageExitUI()">${exitLabel}</button></div>
   </div>
  </section>`;
 }

 function resultHtml(run){
  const d=dungeonSafe(),p=progressSafe(),cleared=run?.cleared||0,total=run?.points||0;
  const failed=run?.failedFloor?`第 ${run.failedFloor} 層`:"—";
  const canAgain=Number(state.level)>=25&&(d.attempts||0)>0;
  return `<section class="void-shell"><div class="card void-panel void-result">
   <div class="void-title">【虛空幻境】</div>
   <div class="void-result-reason">${reasonText(run?.endedReason)}</div>
   <h2>本次挑戰完成</h2>
   <div class="void-result-grid">
    <div><span>本次成功突破</span><strong>${cleared} 層</strong></div>
    <div><span>最高通過樓層</span><strong>第 ${p.highestCleared||0} 層</strong></div>
    <div><span>本次總積分</span><strong>${total}</strong></div>
    <div><span>平均每層積分</span><strong>${averagePoints(run)}</strong></div>
    <div><span>失敗樓層</span><strong>${failed}</strong></div>
    <div><span>平均戰鬥回合</span><strong>${run?.averageTurns||0}</strong></div>
   </div>
   <div class="muted">目前副本積分：${d.points||0}　｜　剩餘可挑戰次數：${d.attempts||0} 次</div>
   <div class="void-actions"><button class="btn dungeon-entry-btn" ${canAgain?"":"disabled"} onclick="${canAgain?"enterVoidMirageDungeon()":"void(0)"}">${canAgain?"再次進入虛空幻境":"挑戰次數不足"}</button><button class="btn" onclick="returnFromVoidMirage()">返回副本</button></div>
  </div></section>`;
 }

 window.renderVoidMirageDungeon=function(){
  injectStyles();
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
  const result=fr.result,e=fr.enemy,playerMax=fr.playerMaxHp||equippedStats().hp;
  let ehp=e.hp,php=playerMax;
  const logs=result?.logs||[];
  const delay=logs.length>90?14:logs.length>50?24:45;
  setHpUi(ehp,e.hp,php,playerMax,"開始戰鬥");
  await sleep(100);
  for(const line of logs){
   let m=line.match(/^你攻擊.+，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const n=Number(m[1]);ehp=Math.max(0,ehp-n);pulse("enemy",line.includes("暴擊")?`暴擊 ${n}`:`-${n}`);setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("閃避了你的攻擊")){pulse("enemy","閃避");setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   m=line.match(/^.+攻擊你，(?:暴擊)?造成 (\d+) 點傷害。$/);
   if(m){const n=Number(m[1]);php=Math.max(0,php-n);pulse("player",line.includes("暴擊")?`暴擊 ${n}`:`-${n}`);setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   if(line.includes("你閃避了攻擊")){pulse("player","閃避");setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);continue;}
   setHpUi(ehp,e.hp,php,playerMax,line);await sleep(delay);
  }
  if(result?.win)setHpUi(0,e.hp,Math.max(0,php),playerMax,`第 ${fr.floor} 層突破，首通積分 +${fr.gained||0}`);
 }

 async function autoClimb(){
  if(voidUi.running)return;
  voidUi.running=true;
  try{
   while(true){
    const run=typeof getVoidMirageRunSnapshot==="function"?getVoidMirageRunSnapshot():null;
    if(!run?.active)break;
    if(voidUi.exitAfterFloor){
     const exited=requestVoidMirageExit();
     voidUi.finalRun=exited.run||getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;
    }
    const fr=fightNextVoidMirageFloor();
    if(!fr?.ok){voidUi.finalRun=getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;}
    voidUi.floorResult=fr;voidUi.phase="combat";render();
    await animateFloor(fr);
    if(fr.ended){voidUi.finalRun=fr.run;voidUi.phase="result";voidUi.floorResult=null;render();break;}
    if(voidUi.exitAfterFloor){
     const exited=requestVoidMirageExit();
     voidUi.finalRun=exited.run||getVoidMirageRunSnapshot();voidUi.phase="result";voidUi.floorResult=null;render();break;
    }
    await sleep(350);
   }
  }finally{voidUi.running=false;}
 }

 window.enterVoidMirageDungeon=function(){
  if(voidUi.running)return;
  const started=typeof beginVoidMirageRun==="function"?beginVoidMirageRun():{ok:false};
  if(!started.ok){view="dungeon";render();return;}
  voidUi={phase:"combat",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};
  view="dungeon-void-mirage";
  render();
  setTimeout(autoClimb,100);
 };
 window.requestVoidMirageExitUI=function(){
  if(voidUi.phase==="result")return;
  voidUi.exitAfterFloor=true;
  const btn=document.querySelector(".void-exit-btn");
  if(btn){btn.disabled=true;btn.textContent="本層結束後將退出";}
  const msg=document.getElementById("voidCombatMessage");
  if(msg)msg.textContent="已要求退出：本層結束後離開虛空幻境。";
 };
 window.returnFromVoidMirage=function(){
  voidUi={phase:"idle",running:false,exitAfterFloor:false,floorResult:null,finalRun:null,message:""};
  view="dungeon";render();
 };

 injectStyles();
})();