(function(){
 function safeName(){
  try{return typeof currentPlayerName==="function"?currentPlayerName():((state&&typeof state.playerName==="string"&&state.playerName.trim())?state.playerName.trim():"玩家");}
  catch(e){return "玩家";}
 }
 function installStyles(){
  if(document.getElementById("ui-fix-styles"))return;
  const s=document.createElement("style");
  s.id="ui-fix-styles";
  s.textContent=`
   .void-top-exit{margin:6px 0 10px!important}.void-top-exit .void-exit-btn{width:100%;max-width:520px}
   @media(max-width:760px){
    .void-panel{padding:7px!important}.void-title{font-size:18px!important;margin-bottom:6px!important}
    .void-stats{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:4px!important;margin-bottom:6px!important}
    .void-stat{padding:5px 3px!important;border-radius:7px!important}.void-stat span{font-size:10px!important;line-height:1.15}.void-stat strong{font-size:14px!important;margin-top:2px!important}
    .void-subtitle{margin:0 0 6px!important;font-size:12px!important}
    .void-combat{padding:7px!important;border-radius:11px!important;min-height:0!important}
    .void-combat .combat-head{margin-bottom:5px!important;font-size:13px!important}
    .void-combat .combat-arena{gap:5px!important;min-height:0!important;flex:0 0 auto!important}
    .void-combat .combatant{padding:8px!important;min-height:0!important;border-radius:10px!important}
    .void-combat .combatant h2{font-size:18px!important;margin:3px 0 6px!important}.void-vs{font-size:17px!important;margin:1px 0!important;line-height:1!important}
    .void-floor-badge{padding:2px 7px!important;margin-bottom:3px!important;font-size:11px!important}.void-traits{margin:2px 0 4px!important;font-size:12px!important}.void-enemy-meta{margin:2px 0!important;font-size:11px!important;line-height:1.35!important}.void-reward{font-size:13px!important;margin:2px 0!important}
    .void-combat .big-hp{margin-top:5px!important}.void-combat .status-label{font-size:12px!important;margin-bottom:3px!important}.void-combat .bar{height:10px!important}.void-message{font-size:12px!important;min-height:0!important;margin-top:5px!important;padding:5px!important}
    .void-top-exit{margin:4px 0 6px!important}.void-top-exit .void-exit-btn{padding:9px 10px!important;font-size:14px!important}
   }
  `;
  document.head.appendChild(s);
 }
 function applyFixes(){
  installStyles();
  const name=safeName();
  document.querySelectorAll("h2").forEach(h=>{
   const t=(h.textContent||"").trim();
   if(/^玩家\s*Lv\./.test(t))h.textContent=t.replace(/^玩家/,name);
  });
  if(typeof view!=="undefined"&&view==="dungeon-void-mirage"){
   const combat=document.querySelector(".void-combat");
   const btn=document.querySelector(".void-exit-btn");
   if(combat&&btn){
    const actions=btn.closest(".void-actions");
    if(actions&&!actions.classList.contains("void-top-exit"))actions.classList.add("void-top-exit");
    if(actions&&combat.parentNode===actions.parentNode&&actions.nextElementSibling!==combat)combat.parentNode.insertBefore(actions,combat);
   }
  }
 }
 const baseRender=window.render;
 if(typeof baseRender==="function"){
  window.render=function(){const r=baseRender.apply(this,arguments);setTimeout(applyFixes,0);return r;};
 }
 const baseSavePlayerName=window.savePlayerName;
 if(typeof baseSavePlayerName==="function"){
  window.savePlayerName=function(){const r=baseSavePlayerName.apply(this,arguments);setTimeout(applyFixes,0);return r;};
 }
 installStyles();
 setTimeout(applyFixes,0);
})();