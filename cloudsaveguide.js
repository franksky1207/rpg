(function(){
 const VERSION=1;
 window.CLOUD_SAVE_GUIDE_VERSION=VERSION;
 const base=window.gameGuidePage;
 if(typeof base!=="function")return;
 window.gameGuidePage=function(...args){
  const html=base.apply(this,args);
  const guide=`<section class="card" style="margin:0 0 14px"><h3 style="margin-top:0">帳號與雲端存檔</h3><div class="guide-items"><div class="guide-item"><b>帳號登入</b><div>遊戲使用 Email 帳號登入。這台裝置登入成功後會保持登入；只有主動登出後，才需要再次登入。</div></div><div class="guide-item"><b>本機與雲端是分開的</b><div>每台裝置平常仍使用自己的本機存檔，雲端不會自動同步，也不會在登入時自動覆蓋本機進度。</div></div><div class="guide-item"><b>換裝置方式</b><div>要把進度搬到另一台裝置時，先在原本裝置的「設定 → 雲端存檔」按「上傳本機存檔」，再到新裝置登入同一個帳號，確認時間、等級與 EXP 後按「下載雲端存檔」。</div></div><div class="guide-item"><b>覆蓋前先確認</b><div>上傳會覆蓋目前雲端存檔；下載會覆蓋目前這台裝置的本機存檔。操作前系統都會再次顯示本機與雲端的存檔時間、等級與 EXP 供玩家確認。</div></div><div class="guide-item"><b>離線收益</b><div>下載雲端存檔後，離線計時會從下載完成時重新起算，避免把跨裝置搬移期間誤算成額外離線收益。</div></div></div></section>`;
  const marker='<div class="guide-layout">';
  return typeof html==="string"&&html.includes(marker)?html.replace(marker,guide+marker):guide+html;
 };
})();