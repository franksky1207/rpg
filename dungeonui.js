(function(){
 const DUNGEON_UNLOCKS={bounty:5,arena:15,tower:25};
 const DUNGEON_IMPLEMENTED={bounty:true,arena:true,tower:true};

 function injectDungeonStyles(){
  if(document.getElementById("dungeon-ui-styles"))return;
  const style=document.createElement("style");
  style.id="dungeon-ui-styles";
  style.textContent=`
  .dungeon-status-card{max-width:760px;margin:0 auto 16px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;background:#171922;border:1px solid #4c4861;border-radius:12px;padding:10px 12px}
  .dungeon-status-card.no-points{grid-template-columns:repeat(2,1fr)}
  .dungeon-status-card>div{background:#10121a;border:1px solid #302d3d;border-radius:9px;padding:9px 10px;display:flex;flex-direction:column;gap:3px;min-width:0}.dungeon-status-card strong{font-size:16px;color:#d8d3ef;overflow-wrap:anywhere}
  .prepare-sidebar{display:grid;gap:12px;min-width:0}.prepare-sidebar .player-status-card{position:static}.prepare-sidebar .dungeon-status-card{max-width:none;width:100%;margin:0}
  @media(min-width:901px){.prepare-layout{grid-template-columns:minmax(310px,350px) minmax(0,1fr);gap:20px;align-items:start}.prepare-sidebar{position:sticky;top:88px;align-self:start}.prepare-main{min-width:0}.prepare-sidebar .dungeon-status-card.no-points{grid-template-columns:repeat(2,minmax(0,1fr))}}
  .dungeon-page-shell{max-width:900px;margin:0 auto}.dungeon-summary-panel{background:linear-gradient(180deg,#1b1724,#14111c);border:1px solid #5b4f70}.dungeon-summary-panel h2{color:#c7a6e8}
  .dungeon-summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.dungeon-summary-grid>div{background:#12101a;border:1px solid #3c334a;border-radius:10px;padding:12px}.dungeon-summary-grid strong{display:block;margin-top:4px;font-size:20px;color:#f2e9ff}
  .dungeon-mode-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px}.dungeon-mode-card{background:linear-gradient(180deg,#1d1928,#14111c);border:1px solid #5c5270;border-radius:14px;padding:16px;min-height:230px;display:flex;flex-direction:column;box-shadow:0 12px 30px rgba(0,0,0,.2)}
  .dungeon-mode-card h3{margin:0;color:#d7c1ee;font-family:Georgia,"Noto Serif TC",serif}.dungeon-mode-card p{color:#d6cce3;line-height:1.65;flex:1}.dungeon-mode-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.dungeon-mode-reward{margin-top:5px;color:#e6c979;font-size:12px;font-weight:700;line-height:1.4}.dungeon-unlock-label{font-size:12px;color:#a99db8;white-space:nowrap}.dungeon-cost{font-size:13px;color:#b8aec6;margin:10px 0 12px}.dungeon-mode-card.locked{opacity:.52}.dungeon-entry-btn{width:100%;background:#30283d;border-color:#6d5a82;color:#eadcff}.dungeon-entry-btn:not(:disabled):hover{background:#3a2f49}.dungeon-entry-btn:disabled{cursor:not-allowed;filter:none;opacity:.68}
  .dungeon-mode-bounty{background:linear-gradient(180deg,#241b2f,#1b1724);border-color:#8a5fb0}.dungeon-mode-bounty h3{color:#c7a6e8}.dungeon-mode-bounty .dungeon-entry-btn{background:#6e4a91;border-color:#8a5fb0;color:#fff}.dungeon-mode-bounty .dungeon-entry-btn:not(:disabled):hover{background:#8159a8}
  .dungeon-bounty-shell{background:#1b1724;color:#f4eff9;border-radius:16px;padding:18px}.dungeon-bounty-card{background:#241b2f;border:2px solid #8a5fb0;color:#f2e9ff}.dungeon-bounty-title{color:#c7a6e8;font-size:22px;font-weight:800;text-align:center;letter-spacing:.05em}.dungeon-bounty-reward{color:#e6c979}.dungeon-bounty-tag-normal{color:#7891a8}.dungeon-bounty-tag-high{color:#a56ac4}.dungeon-bounty-tag-danger{color:#c45f73}.dungeon-bounty-tier{text-align:center;font-weight:800;margin:12px 0 4px}.dungeon-bounty-ready-card,.dungeon-bounty-result-card{max-width:620px;margin:0 auto;text-align:center;padding:24px}.dungeon-bounty-ready-card h2,.dungeon-bounty-result-card h2{color:#f2e9ff;margin:8px 0 12px}.dungeon-bounty-traits{color:#d6cce3;margin:8px 0 14px}.dungeon-bounty-ready-actions,.dungeon-bounty-result-actions{justify-content:center}.dungeon-bounty-start-btn{background:#6e4a91;border-color:#8a5fb0;color:#fff}.dungeon-bounty-start-btn:hover{background:#8159a8}.dungeon-bounty-start-btn:disabled{opacity:.55;cursor:not-allowed}.dungeon-bounty-result-line{margin:9px 0;color:#d6cce3}
  .dungeon-bounty-reward-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:14px 0}.dungeon-bounty-reward-grid>div{background:#17121f;border:1px solid #49385d;border-radius:9px;padding:10px 8px;min-width:0}.dungeon-bounty-reward-grid span{display:block;color:#bcb1ca;font-size:12px}.dungeon-bounty-reward-grid strong{display:block;margin-top:4px;color:#f0d98f;font-size:18px}.dungeon-bounty-reward-grid small{display:block;margin-top:3px;color:#a99db8;font-size:11px}.dungeon-bounty-loot-list{display:grid;gap:6px;margin:12px 0;text-align:left}.dungeon-bounty-loot-row{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#17121f;border:1px solid #392e47;border-radius:8px;padding:8px 10px;font-size:13px}.dungeon-bounty-loot-row>span:first-child{min-width:0;overflow-wrap:anywhere}.dungeon-bounty-loot-row>span:last-child{flex:0 0 auto;white-space:nowrap}
  .dungeon-bounty-combat{background:linear-gradient(180deg,#1b1724,#14111c);border:1px solid #5b4f70;border-radius:16px;padding:16px}.dungeon-bounty-combat .combat-head{color:#c7a6e8}.dungeon-bounty-enemy{background:linear-gradient(180deg,#241b2f,#17121f)!important;border-color:#8a5fb0!important;box-shadow:0 18px 44px rgba(61,34,79,.35)}.dungeon-bounty-enemy h2{color:#f2e9ff}.dungeon-bounty-player{background:linear-gradient(180deg,#1b1a29,#11131b)!important;border-color:#5b5fa8!important}.dungeon-bounty-vs{color:#aeb7ff}.dungeon-bounty-message{color:#c7a6e8}
  @media(max-width:760px){.prepare-sidebar{gap:9px}.dungeon-status-card{grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:10px}.dungeon-status-card.no-points{grid-template-columns:1fr}.prepare-sidebar .dungeon-status-card{margin-bottom:0}.dungeon-status-card>div{flex-direction:row;justify-content:space-between;align-items:center}.dungeon-status-card>div:last-child:nth-child(odd){grid-column:1/-1}.dungeon-mode-list{grid-template-columns:1fr;gap:10px}.dungeon-mode-card{min-height:0;padding:14px}.dungeon-mode-reward{font-size:12px}.dungeon-summary-grid{grid-template-columns:1fr}.dungeon-summary-grid>div{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px}.dungeon-summary-grid strong{margin-top:0;font-size:18px;text-align:right;white-space:nowrap}.dungeon-page-shell{padding-bottom:10px}.dungeon-bounty-shell{padding:10px}.dungeon-bounty-ready-card,.dungeon-bounty-result-card{padding:18px 14px}.dungeon-bounty-title{font-size:20px}.dungeon-bounty-reward-grid{grid-template-columns:1fr;gap:6px}.dungeon-bounty-reward-grid>div{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 10px}.dungeon-bounty-reward-grid span,.dungeon-bounty-reward-grid strong,.dungeon-bounty-reward-grid small{display:block;margin:0}.dungeon-bounty-reward-grid small{margin-left:auto}.dungeon-bounty-loot-row{align-items:flex-start;flex-direction:column;gap:3px}.dungeon-bounty-loot-row>span:last-child{white-space:normal}.dungeon-bounty-combat{padding:10px}}
  @media(max-width:420px){.dungeon-mode-head{display:block}.dungeon-unlock-label{display:block;margin-top:4px}.dungeon-mode-reward{margin-top:4px}}
  `;
  document.head.appendChild(style);
 }

 function dungeonStateSafe(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState();
  if(!state.dungeon||typeof state.dungeon!=="object")state.dungeon={progress:0,attempts:0};
  if(!Number.isFinite(Number(state.dungeon.progress))||Number(state.dungeon.progress)<0)state.dungeon.progress=0;
  if(!Number.isFinite(Number(state.dungeon.attempts))||Number(state.dungeon.attempts)<0)state.dungeon.attempts=0;
  return state.dungeon;
 }
 function formatDungeonProgress(v){const n=Number(v)||0;return `${Math.round(n*100)/100}%`;}
 function dungeonExpText(){return state.level>=MAX_LEVEL?"MAX":`${Math.floor(Number(state.exp)||0).toLocaleString()} / ${expNeed(state.level).toLocaleString()}`;}

 window.dungeonStatusHtml=function(id="dungeon-status",includePoints=true){
  const d=dungeonStateSafe();
  if(!includePoints)return `<div id="${id}" class="dungeon-status-card no-points"><div><span class="muted">副本次數累積進度</span><strong>${formatDungeonProgress(d.progress)}</strong></div><div><span class="muted">副本可挑戰次數</span><strong>${d.attempts} 次</strong></div></div>`;
  return `<div id="${id}" class="dungeon-status-card"><div><span class="muted">等級</span><strong>Lv.${state.level}</strong></div><div><span class="muted">EXP</span><strong>${dungeonExpText()}</strong></div><div><span class="muted">金幣</span><strong>${Math.floor(Number(state.gold)||0).toLocaleString()}</strong></div><div><span class="muted">副本次數</span><strong>${d.attempts} 次</strong></div><div><span class="muted">VIP 狀態</span><strong>${typeof vipStatusText==="function"?vipStatusText():`VIP${state.vipLevel||0}`}</strong></div></div>`;
 };

 function dungeonHomeHtml(){
  const d=dungeonStateSafe(),lv=Math.max(1,Number(state.level)||1);
  const card=(key,title,reward,desc,need)=>{
   const unlocked=lv>=need,implemented=!!DUNGEON_IMPLEMENTED[key],canEnter=unlocked&&implemented&&d.attempts>0;
   let buttonLabel="尚未解鎖";if(unlocked&&!implemented)buttonLabel="尚未開放";else if(unlocked&&implemented&&d.attempts<=0)buttonLabel="挑戰次數不足";else if(canEnter)buttonLabel=`進入${title}`;
   return `<section class="dungeon-mode-card dungeon-mode-${key}${unlocked?"":" locked"}"><div class="dungeon-mode-head"><div><h3>${title}</h3><div class="dungeon-mode-reward">${reward}</div></div><span class="dungeon-unlock-label">${unlocked?`Lv.${need} 已解鎖`:`Lv.${need} 解鎖`}</span></div><p>${desc}</p><div class="dungeon-cost">消耗：1 次副本可挑戰次數</div><button class="btn dungeon-entry-btn" ${canEnter?"":"disabled"} onclick="${canEnter?`openDungeonMode('${key}')`:"void(0)"}">${buttonLabel}</button></section>`;
  };
  return `<div class="function-page dungeon-page-shell"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>${dungeonStatusHtml("dungeon-home-status",true)}<section class="card dungeon-summary-panel"><h2>副本</h2><div class="dungeon-summary-grid"><div><span class="muted">可挑戰次數</span><strong>${d.attempts} 次</strong></div><div><span class="muted">VIP 狀態</span><strong>${typeof vipStatusText==="function"?vipStatusText():`VIP${state.vipLevel||0}`}</strong></div></div></section><div class="dungeon-mode-list">${card("bounty","懸賞戰","高 EXP・高金幣・多裝備","隨機挑戰一名依你目前實力生成的強敵，裝備最低為稀有品質。",DUNGEON_UNLOCKS.bounty)}${card("arena","競技場","VIP 積分","連續挑戰三名敵人，考驗整體續戰能力。",DUNGEON_UNLOCKS.arena)}${card("tower","虛空幻境","VIP 積分","逐層挑戰越來越強的敵人。",DUNGEON_UNLOCKS.tower)}</div></div>`;
 }

 window.openDungeonMode=function(mode){
  if(mode==="bounty"&&DUNGEON_IMPLEMENTED.bounty&&typeof enterBountyDungeon==="function")return enterBountyDungeon();
  if(mode==="arena"&&DUNGEON_IMPLEMENTED.arena&&typeof openArenaDungeon==="function")return openArenaDungeon();
  if(mode==="tower"&&DUNGEON_IMPLEMENTED.tower&&typeof enterVoidMirageDungeon==="function")return enterVoidMirageDungeon();
 };

 function ensureHomeDungeonCard(main){
  const menu=main?.querySelector(".menu-grid");if(!menu)return;
  const existing=Array.from(menu.querySelectorAll(".menu-card")).find(el=>(el.getAttribute("onclick")||"").includes("go('dungeon')"));
  if(existing){existing.dataset.dungeonHomeCard="1";return;}
  const adventure=menu.querySelector(".menu-card"),wrap=document.createElement("div");wrap.innerHTML=`<button class="menu-card" data-dungeon-home-card="1" onclick="go('dungeon')"><b>副本</b><span>挑戰副本取得各類獎勵</span></button>`;
  const card=wrap.firstElementChild;if(adventure?.nextSibling)menu.insertBefore(card,adventure.nextSibling);else menu.appendChild(card);
 }

 const basePlayerStatusHtml=playerStatusHtml;
 playerStatusHtml=function(){const html=basePlayerStatusHtml();if(view==="adventure"&&adventureScreen==="prepare")return `<div class="prepare-sidebar">${html}${dungeonStatusHtml("dungeon-adventure-status",false)}</div>`;return html;};

 const baseRender=render;
 render=function(){
  injectDungeonStyles();
  const main=document.getElementById("main");
  if(view==="dungeon"){
   normalizeHP();main.innerHTML=dungeonHomeHtml();if(typeof renderNav==="function")renderNav();return;
  }
  if(view==="dungeon-bounty"){
   normalizeHP();main.innerHTML=typeof renderBountyDungeon==="function"?renderBountyDungeon():"";if(typeof renderNav==="function")renderNav();return;
  }
  if(view==="dungeon-arena"){
   normalizeHP();main.innerHTML=typeof renderArenaDungeon==="function"?renderArenaDungeon():"";if(typeof renderNav==="function")renderNav();return;
  }
  if(view==="dungeon-void-mirage"){
   main.innerHTML=typeof renderVoidMirageDungeon==="function"?renderVoidMirageDungeon():"";if(typeof renderNav==="function")renderNav();return;
  }
  baseRender();
  if(!main)return;
  if(view==="home"){
   ensureHomeDungeonCard(main);
   const menu=main.querySelector(".menu-grid");
   if(menu&&typeof vipHomeCardHtml==="function"&&!main.querySelector(".vip-home-card"))menu.insertAdjacentHTML("beforebegin",vipHomeCardHtml());
   if(menu&&!main.querySelector("#dungeon-home-status"))menu.insertAdjacentHTML("beforebegin",dungeonStatusHtml("dungeon-home-status",false));
  }
 };

 const baseGo=go;
 go=function(v){if(v==="dungeon"){view="dungeon";render();return;}baseGo(v);};

 injectDungeonStyles();
 if(typeof render==="function")render();
})();