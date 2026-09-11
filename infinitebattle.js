(function(){
 const INFINITE_COUNT="infinite";
 const unlocks=typeof BATTLE_COUNT_UNLOCKS!=="undefined"?BATTLE_COUNT_UNLOCKS:null;
 if(Array.isArray(unlocks)&&!unlocks.some(x=>x?.count===INFINITE_COUNT))unlocks.push({level:31,count:INFINITE_COUNT});
 window.INFINITE_BATTLE_COUNT=INFINITE_COUNT;

 function injectStyles(){
  if(document.getElementById("infinite-battle-styles"))return;
  const style=document.createElement("style");
  style.id="infinite-battle-styles";
  style.textContent=`
   .infinite-stop-wrap{display:flex;justify-content:center;margin-top:12px}
   .infinite-stop-wrap .btn{min-width:180px}
   .count-grid.infinite-enabled{gap:6px}
   @media(max-width:760px){
    .count-grid.infinite-enabled{gap:3px}
    .count-grid.infinite-enabled .count-card{padding-left:1px;padding-right:1px;font-size:12px}
    .infinite-stop-wrap{margin-top:8px;padding-bottom:8px}
    .infinite-stop-wrap .btn{min-width:160px;padding:9px 12px}
   }
  `;
  document.head.appendChild(style);
 }
 function battleCountLabel(count){
  if(count===INFINITE_COUNT)return "∞";
  const n=Math.max(1,Math.floor(Number(count)||1));
  return `${n}場`;
 }
 function infiniteActive(){
  return window.activeMainBattleContext?.infinite===true||combatTotal===0||combatTotal===INFINITE_COUNT;
 }
 function enhancePrepare(){
  if(view!=="adventure"||adventureScreen!=="prepare")return;
  const grid=document.querySelector(".count-grid");if(!grid)return;
  const e=monsterObj(selectedMap,selectedEnemy);
  const counts=e.kind==="boss"?[1]:battleCountsForLevel(state.level);
  const buttons=Array.from(grid.querySelectorAll(".count-card"));
  buttons.forEach((btn,index)=>{
   const count=counts[index];if(count==null)return;
   btn.textContent=battleCountLabel(count);
   btn.onclick=()=>setBattleCount(count,btn);
  });
  if(counts.includes(INFINITE_COUNT))grid.classList.add("infinite-enabled");
  const next=document.querySelector(".battle-count-next");
  const unlock=e.kind==="boss"?null:nextBattleCountUnlock(state.level);
  if(next&&unlock?.count===INFINITE_COUNT)next.textContent=`Lv.${unlock.level} 將開放無限連戰`;
 }
 function enhanceCombat(){
  if(view!=="adventure"||adventureScreen!=="combat"||!infiniteActive())return;
  const screen=document.querySelector(".combat-screen");if(!screen)return;
  const head=screen.querySelector(".combat-head");
  if(head)head.textContent=`無限連戰・第 ${Math.max(1,Number(combatRound)||1)} 場`;
  if(screen.querySelector("#infiniteBattleStopBtn"))return;
  const requested=window.activeMainBattleContext?.exitRequested===true;
  const wrap=document.createElement("div");wrap.className="infinite-stop-wrap";
  wrap.innerHTML=`<button id="infiniteBattleStopBtn" class="btn danger" ${requested?"disabled":""}>${requested?"本場結束後停止":"停止連戰"}</button>`;
  const btn=wrap.querySelector("button");
  if(btn)btn.onclick=()=>{if(typeof window.requestInfiniteBattleStop==="function"&&window.requestInfiniteBattleStop()){btn.disabled=true;btn.textContent="本場結束後停止";}};
  screen.appendChild(wrap);
 }
 function enhance(){injectStyles();enhancePrepare();enhanceCombat();}

 const baseMainSettlement=typeof window.mainBattleSettlementHtml==="function"?window.mainBattleSettlementHtml:null;
 if(baseMainSettlement){
  window.mainBattleSettlementHtml=function(ctx,options={}){
   const html=baseMainSettlement(ctx,options);
   if(ctx?.infinite!==true)return html;
   const wins=Math.max(0,Math.floor(Number(ctx?.wins)||0));
   const note=options?.interrupted===true?`已完成 ${wins} 場，無限連戰已結束；已取得的獎勵與副本進度均保留。`:`完成 ${wins} 場`;
   return html.replace(/<div class="notice"><b>.*?<\/b><\/div>/,`<div class="notice"><b>${note}</b></div>`);
  };
 }

 if(typeof window.showBattleResult==="function"){
  const baseShowBattleResult=window.showBattleResult;
  window.showBattleResult=function(ctx,defeat=null){
   const result=baseShowBattleResult(ctx,defeat);
   if(ctx?.infinite===true){
    const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail");
    if(title&&!defeat)title.textContent="無限連戰結算";
    const wins=Math.max(0,Math.floor(Number(ctx?.wins)||0));
    const notice=detail?.querySelector(".settlement-section .notice b");
    if(notice)notice.textContent=defeat?`已完成 ${wins} 場，無限連戰已結束；已取得的獎勵與副本進度均保留。`:`完成 ${wins} 場`;
    else if(!defeat){
     const row=detail?.querySelector(".item b");
     if(row)row.textContent=`完成 ${wins} 場`;
    }
   }
   return result;
  };
 }

 const main=document.getElementById("main");
 if(main&&typeof MutationObserver!=="undefined")new MutationObserver(()=>queueMicrotask(enhance)).observe(main,{childList:true,subtree:true});
 injectStyles();
 setTimeout(enhance,0);
})();