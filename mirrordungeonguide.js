(function(){
 const config=window.MIRROR_DUNGEON_CONFIG;if(!config)return;
 const category=Array.isArray(window.GAME_GUIDE_CATEGORIES)?window.GAME_GUIDE_CATEGORIES.find(x=>x?.id==="dungeon"):null;
 if(!category||!Array.isArray(category.items))return;
 if(!category.items.some(item=>Array.isArray(item)&&item[0]==="鏡像戰"))category.items.push(["鏡像戰",`每日可挑戰 1 次，固定連戰 ${config.runBattles} 場。對手會複製開始挑戰時的角色戰力，每場隨機決定先攻；完成後依勝場取得 VIP 積分並記錄最高成績。`]);
 window.MIRROR_DUNGEON_GUIDE_VERSION=3;
})();