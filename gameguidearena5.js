(function(){
 const baseGameGuidePage=window.gameGuidePage;
 if(typeof baseGameGuidePage!=="function")return;
 const oldBounty=`<div class="guide-item"><h4>懸賞戰</h4><div class="guide-item-body">懸賞戰為單場挑戰，可能遇到普通、高級或危險懸賞。難度越高，EXP、金幣與裝備數量越多；懸賞掉落的裝備最低為稀有品質。</div></div>`;
 const newBounty=`<div class="guide-item"><h4>懸賞戰</h4><div class="guide-item-body">懸賞戰是資源型副本，主打高 EXP、高金幣與多裝備。每次會隨機遇到普通、高級或危險懸賞，實際獎勵在戰後結算；掉落裝備最低為稀有品質。</div></div><div class="guide-item"><h4>懸賞連續挑戰</h4><div class="guide-item-body">懸賞可選單次或連續挑戰。連續模式會在每一場真正開始前消耗 1 次副本挑戰次數，每場結束後 HP 會回滿並自動進入下一場。玩家死亡、挑戰次數不足，或手動要求停止時會結束；手動停止會在目前這一場結束後生效，最後統一顯示總結算。</div></div>`;
 const oldArena=`<div class="guide-item"><h4>競技場</h4><div class="guide-item-body">競技場共有普通、困難、極限 3 種難度。按下開始後會自動連續進行 3 場戰鬥，三戰之間不回血；任一戰失敗即結束並進入結算。整組競技場結束後 HP 會回滿。每擊敗一名敵人都能取得部分 VIP 積分，每遇到新的敵人都會重新取得一次先制機會。</div></div>`;
 const newArena=`<div class="guide-item"><h4>十大競技場</h4><div class="guide-item-body">競技場共有 10 個，名稱直接對應主線 10 大區域：地球戰爭競技場、太陽系戰爭競技場、近星戰爭競技場、星際邊疆競技場、獵戶臂戰爭競技場、銀河邊境競技場、銀河中域競技場、銀河核心外圍競技場、銀河核心戰爭競技場、銀河統合戰爭競技場。</div></div><div class="guide-item"><h4>三競技場視窗</h4><div class="guide-item-body">Lv15 開放競技場後，首頁一次顯示連續 3 個競技場。初始為第 1～3 個；晉升後改為第 2～4 個，再晉升則為第 3～5 個，依此往後，最後顯示第 8～10 個。玩家可以挑戰目前畫面中的任一競技場；點進某個競技場後，再選低難、中難或高難。</div></div><div class="guide-item"><h4>雙評估晉升</h4><div class="guide-item-body">每一組三競技場都要通過兩道評估。第一道是戰力評估：固定評估目前畫面最右邊的競技場，以高難模擬 500 次完整三連戰，至少 450 次全通（90%）才通過。第二道是區域評估：檢查下一個要進入畫面的競技場所對應主線區域是否已解鎖。只有戰力評估與區域評估都通過，才能把三競技場視窗往後推一格。</div></div><div class="guide-item"><h4>評估例子</h4><div class="guide-item-body">初始顯示地球戰爭競技場、太陽系戰爭競技場、近星戰爭競技場。此時戰力評估目標是近星戰爭競技場；如果高難 500 次中至少 450 次全通，再檢查主線第 4 區「星際邊疆」是否已解鎖。兩者都通過後，畫面才會改成太陽系戰爭競技場、近星戰爭競技場、星際邊疆競技場。</div></div><div class="guide-item"><h4>低／中／高難</h4><div class="guide-item-body">每一個競技場都有低難、中難、高難 3 種難度。低難偏向穩定通關，中難有明顯風險，高難是最高風險，也是戰力評估唯一使用的難度。每次挑戰固定連續進行 3 戰，三戰之間不回血；任一戰失敗就結束該輪。每擊敗一名敵人即可取得該戰 VIP 積分，每遇到新的敵人都能重新觸發一次先制機會。</div></div><div class="guide-item"><h4>競技場連續挑戰</h4><div class="guide-item-body">任一競技場、任一難度都可選單次或連續挑戰。連續模式會鎖定開始時選擇的競技場與難度，一個完整三連戰算一輪；三戰內不回血，新一輪開始前才會補滿 HP 並消耗下一次副本挑戰次數。玩家死亡、挑戰次數不足，或手動要求停止時會結束；手動停止會在目前整輪三連戰結束後生效，最後統一顯示總結算。</div></div><div class="guide-item"><h4>競技場積分</h4><div class="guide-item-body">競技場 VIP 積分會隨競技場序號提高。第 1 個競技場的低難、中難、高難全通總積分分別為 180、300、420；之後每增加 1 個競技場，三種難度的全通總積分都增加 130，且三戰的積分會一起按比例提高。</div></div>`;
 window.gameGuidePage=function(){
  let html=baseGameGuidePage();
  html=html.replace(oldBounty,newBounty).replace(oldArena,newArena);
  return html;
 };
})();
