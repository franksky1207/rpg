(function(){
 function enhanceDungeonHome(main){
  const bounty=main.querySelector(".dungeon-mode-bounty p");
  if(bounty)bounty.textContent="隨機挑戰依目前實力生成的強敵，可選單次或連續挑戰，主打高 EXP、高金幣與多裝備。";
  const arena=main.querySelector(".dungeon-mode-arena p");
  if(arena)arena.textContent="Lv15 開放競技場後從地球戰爭競技場開始；後續需戰力評估達 97% 並解鎖對應主線區域，最多顯示最近 3 個已解鎖競技場。";
 }
 function enhance(){
  const main=document.getElementById("main");
  if(!main)return;
  if(view==="dungeon")enhanceDungeonHome(main);
 }
 const baseRender=render;
 render=function(){const out=baseRender();enhance();return out;};
 window.refreshDungeonPlayerUi=enhance;
 enhance();
})();