(function(){
 function injectAdventureProgressStyles(){
  if(document.getElementById("adventure-progress-ui-styles"))return;
  const style=document.createElement("style");
  style.id="adventure-progress-ui-styles";
  style.textContent=`
   .enemy-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0}
   .enemy-card-title{min-width:0;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
   .enemy-card-progress{flex:0 0 auto;min-width:58px;text-align:right;font-weight:850;font-size:16px;color:#d8c49a;line-height:1.25}
   .enemy-card-progress.in-progress{color:#f0d494}.enemy-card-progress.complete{color:#7fd18c}
   .enemy-card-progress.boss-ready{font-size:13px;color:#f0cb84;max-width:150px;white-space:normal}
   .enemy-card-note{margin-top:8px;padding-top:7px;border-top:1px solid #343942;color:#c9c4b9;font-size:12px;line-height:1.45;text-align:left}
   .enemy-card-note.boss-note{color:#e7d7ad;border-top-color:#5b4a31}
   .enemy-card-note.level-note{color:#9fb9d8;border-top-color:#334459}
   @media(max-width:760px){
    .enemy-card-top{gap:7px}.enemy-card-progress{font-size:14px;min-width:52px}.enemy-card-progress.boss-ready{font-size:12px;max-width:128px}
    .enemy-card-note{font-size:11px;line-height:1.35;margin-top:6px;padding-top:6px}
   }
  `;
  document.head.appendChild(style);
 }

 function progressForEnemy(mapIdx,enemyIdx){
  const p=state.mapProgress?.[mapIdx]||[0,0,0,0];
  if(enemyIdx<3)return Math.min(10,Math.max(0,Math.floor(Number(p[enemyIdx])||0)));
  if(enemyIdx===3){
   if(state.bossLocked?.[mapIdx])return Math.min(10,Math.max(0,Math.floor(Number(state.bossProgress?.[mapIdx])||0)));
   return Math.min(10,Math.max(0,Math.floor(Number(p[3])||0)));
  }
  return 0;
 }

 function decorateEnemyCard(card,mapIdx){
  const onclick=card.getAttribute("onclick")||"";
  const match=onclick.match(/selectEnemy\((\d+)\)/);
  if(!match)return;
  const enemyIdx=Number(match[1]);
  const title=card.querySelector(":scope > b");
  if(!title)return;
  const badge=card.querySelector(":scope > .badge");
  const top=document.createElement("div");
  top.className="enemy-card-top";
  const left=document.createElement("div");
  left.className="enemy-card-title";
  left.appendChild(title);
  if(badge)left.appendChild(badge);
  top.appendChild(left);

  const progress=document.createElement("div");
  if(enemyIdx<4){
   const n=progressForEnemy(mapIdx,enemyIdx);
   progress.className=`enemy-card-progress ${n>=10?"complete":"in-progress"}`;
   progress.textContent=`${n}/10`;
  }else{
   const killed=!!state.bossKilled?.[mapIdx];
   progress.className="enemy-card-progress boss-ready";
   progress.textContent=killed?"已擊敗・可再次挑戰":"可挑戰首領";
  }
  top.appendChild(progress);
  card.insertBefore(top,card.firstChild);

  if(enemyIdx===3){
   const map=MAPS[mapIdx];
   const p=state.mapProgress?.[mapIdx]||[0,0,0,0];
   const firstEliteDone=(Number(p[3])||0)>=10;
   const levelNeeded=Number(map?.max)||Number(map?.enemies?.[4]?.[1])||1;
   const bossVisible=typeof enemyUnlocked==="function"?enemyUnlocked(mapIdx,4):false;
   if(firstEliteDone&&!state.bossLocked?.[mapIdx]&&!state.bossKilled?.[mapIdx]&&!bossVisible&&Number(state.level)<levelNeeded){
    const note=document.createElement("div");
    note.className="enemy-card-note level-note";
    note.textContent=`菁英進度完成・角色達 Lv.${levelNeeded} 後首領出現。`;
    card.appendChild(note);
   }
  }

  if(enemyIdx===4){
   const note=document.createElement("div");
   note.className="enemy-card-note boss-note";
   note.textContent=state.bossKilled?.[mapIdx]
    ?"可再次挑戰首領；若戰敗，需重新擊敗菁英 10 次後才能再次挑戰。"
    :"勝利後可繼續挑戰首領；若戰敗，需重新擊敗菁英 10 次後才能再次挑戰。";
   card.appendChild(note);
  }
 }

 const baseAdventurePreparePage=adventurePreparePage;
 adventurePreparePage=function(){
  injectAdventureProgressStyles();
  const html=baseAdventurePreparePage();
  const template=document.createElement("template");
  template.innerHTML=html.trim();
  const root=template.content;
  root.querySelectorAll(".map-progress-fold").forEach(el=>el.remove());
  root.querySelectorAll(".enemy-grid .enemy-card").forEach(card=>decorateEnemyCard(card,selectedMap));
  return template.innerHTML;
 };

 injectAdventureProgressStyles();
})();
