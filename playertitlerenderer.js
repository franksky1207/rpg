(function(){
 const PLAYER_TITLE_RENDERER_VERSION=1;

 const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));

 function playerTitleHtml(id){
  const def=typeof window.getPlayerTitleDefinition==="function"?window.getPlayerTitleDefinition(id):null;
  if(!def)return "";
  const series=def.series==="mirror"?"mirror":"calamity";
  const visualClass=series==="mirror"
   ?`player-title--mirror player-title--mirror-${def.mirrorWins}`
   :`player-title--tier-${def.tier}`;
  return `<span class="player-title player-title--${series} ${visualClass}" data-player-title-id="${esc(def.id)}">${esc(def.name)}</span>`;
 }

 function playerIdentityNameHtml(options={}){
  const target=options.target&&typeof options.target==="object"?options.target:state;
  const rawName=options.name!=null?String(options.name):String(target?.playerName||"玩家");
  const name=rawName.trim()||"玩家";
  const equipped=typeof window.getEquippedPlayerTitleDefinition==="function"?window.getEquippedPlayerTitleDefinition(target):null;
  let titleId=options.titleId!==undefined?options.titleId:equipped?.id;
  if(titleId!=null&&options.allowUnownedTitle!==true){
   const unlocked=Array.isArray(target?.titles?.unlocked)?target.titles.unlocked:[];
   if(!unlocked.includes(String(titleId)))titleId=null;
  }
  const title=titleId?playerTitleHtml(titleId):"";
  const prefix=options.prefix?esc(options.prefix):"";
  const nameHtml=`<span class="player-identity-name">${prefix}${esc(name)}</span>`;
  return `<span class="player-identity${options.compact?" player-identity--compact":""}">${title}${nameHtml}</span>`;
 }

 window.PLAYER_TITLE_RENDERER_VERSION=PLAYER_TITLE_RENDERER_VERSION;
 window.playerTitleHtml=playerTitleHtml;
 window.playerIdentityNameHtml=playerIdentityNameHtml;
})();
