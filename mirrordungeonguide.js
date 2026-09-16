(function(){
 const category=Array.isArray(window.GAME_GUIDE_CATEGORIES)?window.GAME_GUIDE_CATEGORIES.find(x=>x?.id==="dungeon"):null;
 if(!category||!Array.isArray(category.items))return;
 const unlock=category.items.find(item=>Array.isArray(item)&&item[0]==="副本解鎖");
 if(unlock)unlock[1]="目前共有 4 種副本：Lv5 開放懸賞戰、Lv15 開放競技場、Lv25 開放虛空幻境、Lv50 開放鏡像戰。懸賞戰以 EXP、金幣與裝備為主要獎勵；競技場、虛空幻境與鏡像戰則以 VIP 積分為主要獎勵。";
 const reset=category.items.find(item=>Array.isArray(item)&&item[0]==="每日重置");
 if(reset)reset[1]="懸賞戰、競技場、虛空幻境與鏡像戰都依每日凌晨 0 點重置。主線與離線收益不提供任何副本額度，各副本依自己的規則獨立運作。";
 if(!category.items.some(item=>Array.isArray(item)&&item[0]==="鏡像戰"))category.items.push(["鏡像戰","Lv.50 解鎖，每日僅可挑戰 1 次，固定連戰 20 場。對手「鏡像・玩家名」會完整複製你開始挑戰時的裝備、VIP、專精、強化與戰鬥能力。雙方能力完全相同，每場隨機決定先攻，勝負取決於戰鬥中的各種隨機結果。開始後無法停止；若途中重整、關閉頁面或中斷，本日挑戰直接結束。完成 20 場後自動依最終勝場發放 VIP 積分，並記錄歷史最高成績。20 勝將留下「神蹟」紀錄。"]);
 window.MIRROR_DUNGEON_GUIDE_VERSION=1;
})();