(function(){
 function enhance(){
  const main=document.getElementById("main");
  if(!main)return;
 }
 const baseRender=render;
 render=function(){const out=baseRender();enhance();return out;};
 window.refreshDungeonPlayerUi=enhance;
 enhance();
})();