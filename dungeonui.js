(function(){
 const DUNGEON_UNLOCKS={bounty:5,arena:15,tower:25};

 function injectDungeonStyles(){
  if(document.getElementById("dungeon-ui-styles"))return;
  const style=document.createElement("style");
  style.id="dungeon-ui-styles";
  style.textContent=`
  .dungeon-status-card{max-width:680px;margin:0 auto 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:#171922;border:1px solid #4c4861;border-radius:12px;padding:10px 12px}
  .dungeon-status-card>div{background:#10121a;border:1px solid #302d3d;border-radius:9px;padding:9px 10px;display:flex;flex-direction:column;gap:3px}.dungeon-status-card strong{font-size:16px;color:#d8d3ef}
  .dungeon-page-shell{max-width:900px;margin:0 auto}.dungeon-summary-panel{background:linear-gradient(180deg,#1b1724,#14111c);border:1px solid #5b4f70}.dungeon-summary-panel h2{color:#c7a6e8}
  .dungeon-summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.dungeon-summary-grid>div{background:#12101a;border:1px solid #3c334a;border-radius:10px;padding:12px}.dungeon-summary-grid strong{display:block;margin-top:4px;font-size:20px;color:#f2e9ff}
  .dungeon-mode-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px}.dungeon-mode-card{background:linear-gradient(180deg,#1d1928,#14111c);border:1px solid #5c5270;border-radius:14px;padding:16px;min-height:230px;display:flex;flex-direction:column;box-shadow:0 12px 30px rgba(0,0,0,.2)}
  .dungeon-mode-card h3{margin:0;color:#d7c1ee;font-family:Georgia,"Noto Serif TC",serif}.dungeon-mode-card p{color:#d6cce3;line-height:1.65;flex:1}.dungeon-mode-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.dungeon-unlock-label{font-size:12px;color:#a99db8;white-space:nowrap}.dungeon-cost{font-size:13px;color:#b8aec6;margin:10px 0 12px}.dungeon-mode-card.locked{opacity:.52}.dungeon-entry-btn{width:100%;background:#30283d;border-color:#6d5a82;color:#eadcff}.dungeon-entry-btn:not(:disabled):hover{background:#3a2f49}.dungeon-entry-btn:disabled{cursor:not-allowed;filter:none;opacity:.68}
  .dungeon-mode-bounty{background:linear-gradient(180deg,#241b2f,#1b1724);border-color:#8a5fb0}.dungeon-mode-bounty h3{color:#c7a6e8}.dungeon-mode-bounty .dungeon-entry-btn{background:#6e4a91;border-color:#8a5fb0;color:#fff}.dungeon-mode-bounty .dungeon-entry-btn:not(:disabled):hover{background:#8159a8}
  .dungeon-bounty-shell{background:#1b1724;color:#f4eff9}.dungeon-bounty-card{background:#241b2f;border:2px solid #8a5fb0;color:#f2e9ff}.dungeon-bounty-title{color:#c7a6e8}.dungeon-bounty-reward{color:#e6c979}.dungeon-bounty-tag-normal{color:#7891a8}.dungeon-bounty-tag-high{color:#a56ac4}.dungeon-bounty-tag-danger{color:#c45f73}
  @media(max-width:760px){.dungeon-status-card{grid-template-columns:1fr;margin-bottom:10px}.dungeon-status-card>div{flex-direction:row;justify-content:space-between;align-items:center}.dungeon-mode-list{grid-template-columns:1fr;gap:10px}.dungeon-mode-card{min-height:0;padding:14px}.dungeon-summary-grid{grid-template-columns:1fr 1fr}.dungeon-page-shell{padding-bottom:10px}}
  @media(max-width:420px){.dungeon-summary-grid{grid-template-columns:1fr}.dungeon-mode-head{display:block}.dungeon-unlock-label{display:block;margin-top:4px}}
  `;
  document.head.appendChild(style);
 }

 function dungeonStateSafe(){
  if(typeof ensureDungeonProgressState==="function")return ensureDungeonProgressState();
  if(!state.dungeon||typeof state.dungeon!=="object")state.dungeon={progress:0,attempts:0,points:0};
  if(!Number.isFinite(Number(state.dungeon.progress))||Number(state.dungeon.progress)<0)state.dungeon.progress=0;
  if(!Number.isFinite(Number(state.dungeon.attempts))||Number(state.dungeon.attempts)<0)state.dungeon.attempts=0;
  if(!Number.isFinite(Number(state.dungeon.points))||Number(state.dungeon.points)<0)state.dungeon.points=0;
  return state.dungeon;
 }

 function formatDungeonProgress(v){
  const n=Number(v)||0;
  return `${Math.round(n*100)/100}%`;
 }

 window.dungeonStatusHtml=function(id="dungeon-status",includePoints=true){
  const d=dungeonStateSafe();
  return `<div id="${id}" class="dungeon-status-card">
    <div><span class="muted">副本次數累積進度</span><strong>${formatDungeonProgress(d.progress)}</strong></div>
    <div><span class="muted">副本可挑戰次數</span><strong>${d.attempts} 次</strong></div>
    ${includePoints?`<div><span class="muted">副本積分</span><strong>${d.points}</strong></div>`:""}
  </div>`;
 };

 function dungeonHomeHtml(){
  const d=dungeonStateSafe();
  const lv=Math.max(1,Number(state.level)||1);
  const unlocked=(need)=>lv>=need;
  const card=(key,title,desc,need,buttonText)=>{
   const ok=unlocked(need);
   return `<section class="dungeon-mode-card dungeon-mode-${key}${ok?"":" locked"}">
     <div class="dungeon-mode-head">
       <h3>${title}</h3>
       <span class="dungeon-unlock-label">${ok?`Lv.${need} 已解鎖`:`Lv.${need} 解鎖`}</span>
     </div>
     <p>${desc}</p>
     <div class="dungeon-cost">消耗：1 次副本可挑戰次數</div>
     <button class="btn dungeon-entry-btn" ${ok&&d.attempts>0?"":"disabled"} onclick="${ok&&d.attempts>0?`openDungeonMode('${key}')`:"void(0)"}">${ok?(d.attempts>0?buttonText:"挑戰次數不足"):"尚未解鎖"}</button>
   </section>`;
  };

  return `<div class="function-page dungeon-page-shell">
    <div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>
    <section class="card dungeon-summary-panel">
      <h2>副本</h2>
      <div class="dungeon-summary-grid">
        <div><span class="muted">可挑戰次數</span><strong>${d.attempts} 次</strong></div>
        <div><span class="muted">副本積分</span><strong>${d.points}</strong></div>
      </div>
    </section>
    <div class="dungeon-mode-list">
      ${card("bounty","懸賞戰","隨機挑戰一名依你目前實力生成的強敵。",DUNGEON_UNLOCKS.bounty,"進入懸賞戰")}
      ${card("arena","競技場","連續挑戰三名敵人，考驗整體續戰能力。",DUNGEON_UNLOCKS.arena,"進入競技場")}
      ${card("tower","試煉塔","逐層挑戰越來越強的敵人。",DUNGEON_UNLOCKS.tower,"進入試煉塔")}
    </div>
  </div>`;
 }

 window.openDungeonMode=function(mode){
  if(mode==="bounty")return alert("懸賞戰將於下一批正式開放。");
  if(mode==="arena")return alert("競技場尚未實作。");
  if(mode==="tower")return alert("試煉塔尚未實作。");
 };

 function ensureHomeDungeonCard(main){
  const menu=main?.querySelector(".menu-grid");
  if(!menu)return;
  if(!menu.querySelector('[data-dungeon-home-card="1"]')){
   const adventure=menu.querySelector(".menu-card");
   const wrap=document.createElement("div");
   wrap.innerHTML=`<button class="menu-card" data-dungeon-home-card="1" onclick="go('dungeon')"><b>副本</b><span>挑戰特殊副本並獲得副本積分</span></button>`;
   const card=wrap.firstElementChild;
   if(adventure?.nextSibling)menu.insertBefore(card,adventure.nextSibling);else menu.appendChild(card);
  }
 }

 const baseRender=render;
 render=function(){
  injectDungeonStyles();
  if(view==="dungeon"){
   normalizeHP();
   document.getElementById("main").innerHTML=dungeonHomeHtml();
   if(typeof renderNav==="function")renderNav();
   return;
  }
  baseRender();
  const main=document.getElementById("main");
  if(!main)return;
  if(view==="home"){
   ensureHomeDungeonCard(main);
   const menu=main.querySelector(".menu-grid");
   if(menu&&!main.querySelector("#dungeon-home-status"))menu.insertAdjacentHTML("beforebegin",dungeonStatusHtml("dungeon-home-status",true));
  }
 };

 const baseGo=go;
 go=function(v){
  if(v==="dungeon"){
   view="dungeon";
   render();
   return;
  }
  baseGo(v);
 };

 injectDungeonStyles();
 if(typeof render==="function")render();
})();