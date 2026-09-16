(function(){
 function normalizeReturnLabels({view,main}={}){
  if(!main||!String(view||"").startsWith("dungeon"))return;
  main.querySelectorAll("button").forEach(button=>{
   const text=button.textContent.trim();
   if(text==="返回副本")button.textContent="返回副本列表";
   else if(text==="← 返回副本")button.textContent="← 返回副本列表";
  });
 }
 if(typeof window.registerDungeonPostRenderHook==="function")window.registerDungeonPostRenderHook(normalizeReturnLabels);
 window.DUNGEON_RETURN_LABELS_VERSION=1;
})();