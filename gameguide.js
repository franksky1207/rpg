(function(){
 const GUIDE_CATEGORIES=[
  {id:"adventure",label:"冒險入門",items:[
   ["遊戲基本玩法","打怪、升級、取得裝備並逐步推進到更高等級地圖。"],
   ["主線地圖","目前共有 20 張主線地圖，每張地圖包含普通怪、菁英怪與 Boss。"],
   ["地圖推進","依序完成普通怪與菁英怪的擊敗條件後，即可解鎖 Boss。"],
   ["Boss","Boss 固定單場挑戰；首次擊敗後會解鎖下一張地圖。"],
   ["連戰","角色等級提升後，可逐步開放更多一次連續挑戰的場數。"],
   ["目前等級上限","目前角色等級上限為 Lv100；在下一等級階段開放前，滿等後的 EXP 會依規則轉換為金幣。"]
  ]},
  {id:"gear",label:"角色與裝備",items:[
   ["角色能力","查看 HP、攻擊、防禦、暴擊與閃避等主要能力。"],
   ["裝備部位","角色共有武器、頭盔、鎧甲、鞋子與飾品五個裝備部位。"],
   ["裝備品質","裝備共有普通、優良、稀有、史詩、傳說與神話六種品質。"],
   ["裝備詞條","高品質裝備可能附帶更多額外能力詞條。"],
   ["裝備評分","評分可用來快速比較同部位裝備的整體能力。"],
   ["裝備掉落","普通怪、菁英怪與 Boss 的掉裝機會不同。"],
   ["背包","可查看、裝備、比較與出售取得的裝備。"],
   ["自動出售","可依品質設定自動出售，神話裝備不會被自動出售。"],
   ["死亡懲罰","戰敗會有 EXP 懲罰，並可能遺失已裝備的裝備。"]
  ]},
  {id:"combat",label:"戰鬥與怪物",items:[
   ["基本戰鬥","戰鬥會自動進行，直到玩家或敵人的 HP 歸零。"],
   ["暴擊與閃避","暴擊能造成更高傷害；閃避成功可完全避開一次攻擊。"],
   ["怪物特性","部分敵人會隨機擁有強壯、兇猛、堅硬等特殊特性。"],
   ["多重特性","敵人可能沒有特性，也可能同時擁有多個特性。"],
   ["戰鬥紀錄","可展開查看雙方傷害、暴擊、閃避與戰鬥結果。"],
   ["特殊戰鬥提示","先制、連擊、穿透、反擊、汲取與狂暴等效果會以浮字顯示。"]
  ]},
  {id:"special",label:"特殊怪",items:[
   ["特殊遭遇","符合條件的主線勝利後，有機會出現可自行選擇挑戰或略過的特殊怪。"],
   ["稀有資源聚合體","戰力較低，主要提供大量金幣。"],
   ["誘餌補給艙","戰力較高，擊敗後必定取得裝備。"],
   ["終止協議單元","非常少見且較危險，成功擊敗後可取得豐厚獎勵。"],
   ["機率增幅信標","戰力較低，擊敗後必定取得裝備。"],
   ["封存警戒機","金幣較少，但能取得大量 EXP。"],
   ["裝備保全單元","必定掉裝，並偏向補足目前較弱的裝備部位。"],
   ["黑市武裝頭目","提供較多金幣，並能降低目前商店刷新費用。"],
   ["戰利品回收者","擊敗後可以一次取得兩件裝備。"],
   ["流動交易代理人","會隨機提供大量金幣、大量 EXP 或較好的裝備。"],
   ["VIP 與特殊怪","部分 VIP 特權會影響特殊怪的遭遇或獎勵。"]
  ]},
  {id:"dungeon",label:"副本與 VIP",items:[
   ["副本解鎖","Lv5 開放懸賞戰、Lv15 開放競技場、Lv25 開放虛空幻境。"],
   ["副本挑戰次數","只有主線勝利會累積副本進度，進度達標後轉換為挑戰次數。"],
   ["懸賞戰","單場挑戰，共有普通、高級與危險三種難度。"],
   ["競技場","連續三戰，中途不回復 HP，共有普通、困難與極限三種難度。"],
   ["虛空幻境","無限爬塔型副本，每 10 層會遇到 Boss。"],
   ["VIP 系統","副本可取得 VIP 積分，累積後可永久提升 VIP 等級。"],
   ["VIP 基礎能力","VIP 會提升 HP、攻擊、防禦、暴擊與閃避。"],
   ["VIP 特權","每個偶數 VIP 等級都會解鎖額外特權。"]
  ]},
  {id:"growth",label:"成長與功能",items:[
   ["專精系統","共有 8 種專精，每項最高 Lv30，使用金幣升級並永久保留。"],
   ["實戰訓練","提高擊敗怪物取得的 EXP。"],
   ["搜刮技巧","提高怪物直接掉落的金幣。"],
   ["鑑價技巧","提高出售裝備取得的金幣。"],
   ["先制技巧","提高每場戰鬥第一次玩家主動普通攻擊的傷害。"],
   ["連擊技巧","攻擊時有機會追加攻擊，且追加攻擊仍可能再次觸發連擊。"],
   ["穿透技巧","攻擊時有機會忽略敵人的部分防禦。"],
   ["反擊技巧","受到敵人有效攻擊後，有機會立即反擊。"],
   ["汲取技巧","造成傷害時有機會依實際傷害回復 HP。"],
   ["商店","可購買裝備、刷新商品與贖回戰敗時遺失的裝備。"],
   ["本機存檔","目前使用瀏覽器本機自動存檔，尚未提供跨裝置雲端同步。"]
  ]}
 ];
 let activeGuideCategory="adventure";
 function activeCategory(){return GUIDE_CATEGORIES.find(x=>x.id===activeGuideCategory)||GUIDE_CATEGORIES[0];}
 function itemHtml(item){return `<details class="guide-item"><summary>${item[0]}</summary><div class="guide-item-body">${item[1]}</div></details>`;}
 window.setGameGuideCategory=function(id){
  if(!GUIDE_CATEGORIES.some(x=>x.id===id))return;
  activeGuideCategory=id;
  if(typeof render==="function")render();
 };
 window.gameGuidePage=function(){
  const current=activeCategory();
  const tabs=GUIDE_CATEGORIES.map(x=>`<button class="guide-category ${x.id===current.id?"active":""}" onclick="setGameGuideCategory('${x.id}')">${x.label}</button>`).join("");
  return `<div class="function-page guide-page"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><div class="guide-header"><h2>遊戲說明</h2><div class="muted">查看玩法、系統、戰鬥與各項規則。此頁只說明玩家需要知道的規則，不公開內部計算公式。</div></div><div class="guide-layout"><nav class="guide-categories">${tabs}</nav><section class="guide-content card"><h3>${current.label}</h3><div class="guide-items">${current.items.map(itemHtml).join("")}</div></section></div></div>`;
 };
})();