(function(){
 const baseRenderBountyDungeon=window.renderBountyDungeon;
 if(typeof baseRenderBountyDungeon!=="function")return;
 let lastCombatHtml="";
 window.renderBountyDungeon=function(){
  const html=baseRenderBountyDungeon();
  const snapshot=typeof window.getBountyTestSnapshot==="function"?window.getBountyTestSnapshot():null;
  const continuous=snapshot?.continuous===true;
  if(continuous&&typeof html==="string"&&html.includes("dungeon-bounty-combat")){
   lastCombatHtml=html;
   return html;
  }
  if(continuous&&typeof html==="string"&&html.includes("dungeon-bounty-ready-actions")){
   return lastCombatHtml||`<section class="dungeon-bounty-shell dungeon-page-shell"><div class="dungeon-bounty-card card"><div class="dungeon-bounty-title">【懸賞戰・連續挑戰】</div><div class="muted">準備下一場…</div></div></section>`;
  }
  if(!continuous)lastCombatHtml="";
  return html;
 };
})();
