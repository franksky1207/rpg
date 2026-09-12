(function(){
 const baseGameGuidePage=window.gameGuidePage;
 if(typeof baseGameGuidePage!=="function")return;
 const oldBounty=`<div class="guide-item"><h4>懸賞戰</h4><div class="guide-item-body">懸賞戰為單場挑戰，可能遇到普通、高級或危險懸賞。難度越高，EXP、金幣與裝備數量越多；懸賞掉落的裝備最低為稀有品質。</div></div>`;
 const newBounty=`<div class="guide-item"><h4>懸賞戰</h4><div class="guide-item-body">懸賞戰是資源型副本，主打高 EXP、高金幣與多裝備。每次會隨機遇到普通、高級或危險懸賞，實際獎勵在戰後結算；掉落裝備最低為稀有品質。</div></div><div class="guide-item"><h4>懸賞連續挑戰</h4><div class="guide-item-body">懸賞可選單次或連續挑戰。連續模式會在每一場真正開始前消耗 1 次副本挑戰次數，每場結束後 HP 會回滿並自動進入下一場。玩家死亡、挑戰次數不足，或手動要求停止時會結束；手動停止會在目前這一場結束後生效，最後統一顯示總結算。</div></div>`;
 const oldArena=`<div class="guide-item"><h4>競技場</h4><div class="guide-item-body">競技場共有普通、困難、極限 3 種難度。按下開始後會自動連續進行 3 場戰鬥，三戰之間不回血；任一戰失敗即結束並進入結算。整組競技場結束後 HP 會回滿。每擊敗一名敵人都能取得部分 VIP 積分，每遇到新的敵人都會重新取得一次先制機會。</div></div>`;
 const newArena=`<div class="guide-item"><h4>競技場</h4><div class="guide-item-body">競技場共有 10 個，名稱對應主線各區域。Lv15 開放時從「地球戰爭競技場」開始。</div></div><div class="guide-item"><h4>解鎖方式</h4><div class="guide-item-body">想開啟下一個競技場，必須先通過目前最高競技場的戰力評估，並解鎖下一個競技場所對應的主線區域。</div></div><div class="guide-item"><h4>競技場顯示</h4><div class="guide-item-body">最多顯示最近 3 個已解鎖競技場。解鎖新的競技場後，較舊的競技場會逐步退出列表。</div></div><div class="guide-item"><h4>挑戰強度</h4><div class="guide-item-body">畫面越右側的競技場挑戰越高；同一個競技場隨著新競技場解鎖，會逐漸移向較左側，挑戰也會相對降低。</div></div><div class="guide-item"><h4>VIP 積分</h4><div class="guide-item-body">競技場越往後推進，可獲得的 VIP 積分也會提高。當整組競技場往前移動時，畫面中的積分會一起更新；例如 1～3 為 180／300／420，推進成 2～4 後會變成 310／430／550。</div></div><div class="guide-item"><h4>戰鬥方式</h4><div class="guide-item-body">每次挑戰包含 3 場連續戰鬥，場間不回血。可選單次或連續挑戰，完成挑戰可獲得 VIP 積分。</div></div>`;
 window.gameGuidePage=function(){
  let html=baseGameGuidePage();
  html=html.replace(oldBounty,newBounty).replace(oldArena,newArena);
  return html;
 };
})();
