(function(){
 function enhanceBounty(main){
  const snap=typeof getBountyTestSnapshot==="function"?getBountyTestSnapshot():null;
  const ready=main.querySelector(".dungeon-bounty-ready-card");
  if(ready&&ready.dataset.playerUi!=="1"){
   ready.dataset.playerUi="1";
   ready.querySelector(".dungeon-bounty-reward-grid")?.remove();
   const traits=ready.querySelector(".dungeon-bounty-traits");
   traits?.insertAdjacentHTML("afterend",`<div class="dungeon-bounty-positioning"><strong>高 EXP・高金幣・多裝備</strong><span>每次懸賞隨機產生強敵與獎勵等級，實際獎勵於戰後結算。</span></div>`);
   const actions=ready.querySelector(".dungeon-bounty-ready-actions");
   actions?.insertAdjacentHTML("beforebegin",`<div class="dungeon-mode-help"><div><b>單次挑戰</b><span>完成本場後結算</span></div><div><b>連續挑戰</b><span>每場開始前消耗 1 次；死亡、次數不足或手動停止時總結算</span></div></div>`);
  }
  const combat=main.querySelector(".dungeon-bounty-combat");
  if(combat&&snap?.continuous&&!combat.querySelector(".dungeon-continuous-status")){
   const runs=Number(snap.summary?.runs)||0,wins=Number(snap.summary?.wins)||0;
   combat.querySelector(".combat-head")?.insertAdjacentHTML("afterend",`<div class="dungeon-continuous-status">連續挑戰中・已完成 ${runs} 場・勝利 ${wins} 場${snap.stopRequested?"・本場結束後停止":""}</div>`);
  }
  const result=main.querySelector(".dungeon-bounty-result-card");
  if(result&&result.querySelector(".dungeon-bounty-title")?.textContent.includes("連續挑戰"))result.classList.add("dungeon-continuous-result");
 }
 function enhanceDungeonHome(main){
  const bounty=main.querySelector(".dungeon-mode-bounty p");
  if(bounty)bounty.textContent="隨機挑戰依目前實力生成的強敵，可選單次或連續挑戰，主打高 EXP、高金幣與多裝備。";
  const arena=main.querySelector(".dungeon-mode-arena p");
  if(arena)arena.textContent="Lv15 開放競技場後從地球戰爭競技場開始；後續需戰力評估達 97% 並解鎖對應主線區域，最多顯示最近 3 個已解鎖競技場。";
 }
 function enhance(){
  const main=document.getElementById("main");if(!main)return;
  if(view==="dungeon")enhanceDungeonHome(main);
  else if(view==="dungeon-bounty")enhanceBounty(main);
 }
 const baseRender=render;
 render=function(){const out=baseRender();enhance();return out;};
 window.refreshDungeonPlayerUi=enhance;
 enhance();
})();