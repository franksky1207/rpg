(function(){
 function injectReturn(html,label="← 返回副本列表"){
  const text=String(html||"");if(!text||text.includes("data-dungeon-prep-return"))return text;
  const button=`<div class="back-home" data-dungeon-prep-return="1"><button class="btn back-btn" onclick="go('dungeon')">${label}</button></div>`;
  if(text.includes("class=\"function-page"))return text.replace(/(<div class="function-page[^>]*>)/,`$1${button}`);
  if(text.includes("class=\"dungeon-bounty-shell"))return text.replace(/(<section class="dungeon-bounty-shell[^>]*>)/,`$1${button}`);
  return button+text;
 }
 if(typeof window.renderBountyDungeon==="function"){
  const base=window.renderBountyDungeon;
  window.renderBountyDungeon=function(){const html=base();return String(html||"").includes("單次挑戰")&&String(html||"").includes("連續挑戰")?injectReturn(html):html;};
 }
 if(typeof window.renderArenaDungeon==="function"){
  const base=window.renderArenaDungeon;
  window.renderArenaDungeon=function(){const html=base();return String(html||"").includes("單次挑戰")&&String(html||"").includes("連續挑戰")?injectReturn(html):html;};
 }
 window.DUNGEON_PREP_RETURN_UX_VERSION=1;
})();