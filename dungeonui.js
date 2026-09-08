(function(){
 const DUNGEON_UNLOCKS={bounty:5,arena:15,tower:25};

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

 window.dungeonStatusHtml=function(id="dungeon-status"){
  const d=dungeonStateSafe();
  return `<div id="${id}" class="dungeon-status-card">
    <div><span class="muted">副本次數累積進度</span><strong>${formatDungeonProgress(d.progress)}</strong></div>
    <div><span class="muted">副本可挑戰次數</span><strong>${d.attempts} 次</strong></div>
    <div><span class="muted">副本積分</span><strong>${d.points}</strong></div>
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

  return `<div class="dungeon-page-shell">
    <section class="panel dungeon-summary-panel">
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
  if(mode==="bounty"){
   alert("懸賞戰將於下一批正式開放。");
   return;
  }
  if(mode==="arena"){
   alert("競技場尚未實作。");
   return;
  }
  if(mode==="tower"){
   alert("試煉塔尚未實作。");
  }
 };

 const baseNavs=Array.isArray(navs)?navs.slice():[];
 if(Array.isArray(navs)&&!navs.some(x=>x&&x[0]==="dungeon")){
  const adventureIndex=navs.findIndex(x=>x&&x[0]==="adventure");
  const insertAt=adventureIndex>=0?adventureIndex+1:1;
  navs.splice(insertAt,0,["dungeon","副本"]);
 }

 const baseRender=render;
 render=function(){
  if(view==="dungeon"){
   document.getElementById("main").innerHTML=dungeonHomeHtml();
   if(typeof renderNav==="function")renderNav();
   return;
  }
  baseRender();
  const main=document.getElementById("main");
  if(!main)return;
  if(view==="home"){
   const menu=main.querySelector(".menu-grid");
   if(menu&&!main.querySelector("#dungeon-home-status"))menu.insertAdjacentHTML("beforebegin",dungeonStatusHtml("dungeon-home-status"));
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

 if(typeof render==="function")render();
})();