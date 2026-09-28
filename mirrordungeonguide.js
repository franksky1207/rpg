(function(){
 const VERSION=4;
 const config=window.MIRROR_DUNGEON_CONFIG;
 window.MIRROR_DUNGEON_GUIDE_VERSION=VERSION;
 if(!config||typeof window.registerGameGuideExtension!=="function")return;
 window.registerGameGuideExtension({
  id:"mirror-dungeon",
  order:100,
  extendCategories(categories){
   const dungeon=Array.isArray(categories)?categories.find(category=>category?.id==="dungeon"):null;
   if(!dungeon||!Array.isArray(dungeon.items))return categories;
   if(!dungeon.items.some(item=>Array.isArray(item)&&item[0]==="鏡像戰"))dungeon.items.push(["鏡像戰",`每日可挑戰 1 次，固定連戰 ${config.runBattles} 場。對手會複製開始挑戰時的角色戰力，每場隨機決定先攻；完成後依勝場取得 VIP 積分並記錄最高成績。`]);
   return categories;
  }
 });
})();