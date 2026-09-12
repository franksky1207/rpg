(function(){
 const baseGameGuidePage=window.gameGuidePage;
 if(typeof baseGameGuidePage!=="function")return;
 const oldBounty=`<div class="guide-item"><h4>懸賞戰</h4><div class="guide-item-body">懸賞戰為單場挑戰，可能遇到普通、高級或危險懸賞。難度越高，EXP、金幣與裝備數量越多；懸賞掉落的裝備最低為稀有品質。</div></div>`;
 const newBounty=`<div class="guide-item"><h4>懸賞戰</h4><div class="guide-item-body">懸賞戰是資源型副本，主打高 EXP、高金幣與多裝備。每次會隨機遇到普通、高級或危險懸賞，實際獎勵在戰後結算；掉落裝備最低為稀有品質。</div></div><div class="guide-item"><h4>懸賞連續挑戰</h4><div class="guide-item-body">懸賞可選單次或連續挑戰。連續模式會在每一場真正開始前消耗 1 次副本挑戰次數，每場結束後 HP 會回滿並自動進入下一場。玩家死亡、挑戰次數不足，或手動要求停止時會結束；手動停止會在目前這一場結束後生效，最後統一顯示總結算。</div></div>`;
 const oldArena=`<div class="guide-item"><h4>競技場</h4><div class="guide-item-body">競技場共有普通、困難、極限 3 種難度。按下開始後會自動連續進行 3 場戰鬥，三戰之間不回血；任一戰失敗即結束並進入結算。整組競技場結束後 HP 會回滿。每擊敗一名敵人都能取得部分 VIP 積分，每遇到新的敵人都會重新取得一次先制機會。</div></div>`;
 const newArena=`<div class="guide-item"><h4>競技場階級</h4><div class="guide-item-body">競技場共有 10 個大階，名稱依序對應主線 10 大區域：地球戰爭階、太陽系戰爭階、近星戰爭階、星際邊疆階、獵戶臂戰爭階、銀河邊境階、銀河中域階、銀河核心外圍階、銀河核心戰爭階、銀河統合戰爭階。Lv15 開放競技場時，前三階就是競技場的基礎開放階級；角色仍需逐階完成晉升，不會直接升到第三階。</div></div><div class="guide-item"><h4>競技場與主線</h4><div class="guide-item-body">第 1～3 階不要求主線解鎖對應區域。從第 4 階開始，競技場最高可達階級才與主線區域同步：要晉升星際邊疆階，必須先解鎖主線第 4 區域；之後第 5～10 階也各自要求主線已解鎖對應區域。主線只決定最高可達上限，不會自動替角色晉升。</div></div><div class="guide-item"><h4>競技場難度</h4><div class="guide-item-body">每個競技場階級都有低難、中難、高難 3 種難度。低難偏向穩定通關，中難有明顯風險，高難是最高風險，也是晉升評估唯一使用的難度。每次挑戰固定連續進行 3 戰，三戰之間不回血；任一戰失敗就結束該輪。每擊敗一名敵人即可取得該戰 VIP 積分，每遇到新的敵人都能重新觸發一次先制機會。</div></div><div class="guide-item"><h4>競技場晉升</h4><div class="guide-item-body">在目前階級進行晉升評估時，系統會用目前戰力模擬 500 次高難完整三連戰；至少 450 次全通才取得下一階晉升資格。資格取得後會保留。第 1→2 與第 2→3 只需戰力資格；從第 3→4 開始，還必須先解鎖下一個對應主線區域，才能手動晉升。裝備、VIP 或戰鬥專精改變後，如果尚未取得資格，可以重新進行評估。</div></div><div class="guide-item"><h4>競技場連續挑戰</h4><div class="guide-item-body">競技場可選單次或連續挑戰。連續模式會鎖定開始時的競技場階級與難度，一個完整三連戰算一輪；三戰內不回血，新一輪開始前才會補滿 HP 並消耗下一次副本挑戰次數。玩家死亡、挑戰次數不足，或手動要求停止時會結束；手動停止會在目前整輪三連戰結束後生效，最後統一顯示總結算。</div></div><div class="guide-item"><h4>競技場積分</h4><div class="guide-item-body">競技場 VIP 積分會隨階級提高。Rank1 的低難、中難、高難全通總積分分別為 180、300、420；之後每升 1 個競技場階級，三種難度的全通總積分都增加 130，且三戰的積分會一起按比例提高。</div></div>`;
 window.gameGuidePage=function(){
  let html=baseGameGuidePage();
  html=html.replace(oldBounty,newBounty).replace(oldArena,newArena);
  return html;
 };
})();
