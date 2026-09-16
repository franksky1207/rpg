(function(){
 const category=Array.isArray(window.GAME_GUIDE_CATEGORIES)?window.GAME_GUIDE_CATEGORIES.find(x=>x?.id==="dungeon"):null;
 if(!category||!Array.isArray(category.items))return;
 if(category.items.some(item=>Array.isArray(item)&&item[0]==="鏡像戰"))return;
 const mirrorItem=["鏡像戰","Lv.50 解鎖，每日僅可挑戰 1 次，固定連戰 20 場。對手「鏡像・玩家名」會完整複製你開始挑戰時的裝備、VIP、專精、強化與戰鬥能力。雙方能力完全相同，每場隨機決定先攻，勝負取決於戰鬥中的各種隨機結果。開始後無法停止；若途中重整、關閉頁面或中斷，本日挑戰直接結束。完成 20 場後自動依最終勝場發放 VIP 積分，並記錄歷史最高成績。20 勝將留下「神蹟」紀錄。"];
 category.items.push(mirrorItem);
 window.MIRROR_DUNGEON_GUIDE_VERSION=1;
})();