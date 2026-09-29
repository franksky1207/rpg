(function(){
 const PLAYER_TITLE_RENDERER_VERSION=4;
 const UNIVERSE_RENDERER_VERSION=1;
 const MIRROR_RENDERER_VERSION=3;
 const MIRROR_VISUAL_CLASS_VERSION=3;
 const MIRROR_PRESENTATION_VERSION=4;
 const THIRD_WORLD_RENDERER_VERSION=2;
 const THIRD_WORLD_PRESENTATION_VERSION=4;

 const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));

 function playerTitleHtml(id){
  const def=typeof window.getPlayerTitleDefinition==="function"?window.getPlayerTitleDefinition(id):null;
  if(!def)return "";
  let series="calamity",visualClass=`player-title--tier-${def.tier}`;
  if(def.series==="mirror"){
   series="mirror";
   // mirror-v3 is the stable CSS class ABI; presentation styling is versioned separately.
   visualClass=`player-title--mirror-v3 player-title--mirror-v3-${def.mirrorWins}`;
  }else if(def.series==="universe-calamity"){
   series="universe-calamity";
   visualClass=`player-title--universe-calamity player-title--universe-calamity-${def.tier}`;
  }else if(def.series==="higher-dimensional"){
   series="higher-dimensional";
   visualClass=`player-title--higher-dimensional player-title--higher-dimensional-${def.tier}`;
  }
  return `<span class="player-title player-title--${series} ${visualClass}" data-player-title-id="${esc(def.id)}" data-title-text="${esc(def.name)}">${esc(def.name)}</span>`;
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
 window.PLAYER_TITLE_UNIVERSE_RENDERER_VERSION=UNIVERSE_RENDERER_VERSION;
 window.PLAYER_TITLE_MIRROR_RENDERER_VERSION=MIRROR_RENDERER_VERSION;
 window.PLAYER_TITLE_MIRROR_VISUAL_CLASS_VERSION=MIRROR_VISUAL_CLASS_VERSION;
 window.PLAYER_TITLE_MIRROR_PRESENTATION_VERSION=MIRROR_PRESENTATION_VERSION;
 window.PLAYER_TITLE_THIRD_WORLD_RENDERER_VERSION=THIRD_WORLD_RENDERER_VERSION;
 window.PLAYER_TITLE_THIRD_WORLD_PRESENTATION_VERSION=THIRD_WORLD_PRESENTATION_VERSION;
 window.playerTitleHtml=playerTitleHtml;
 window.playerIdentityNameHtml=playerIdentityNameHtml;
})();
