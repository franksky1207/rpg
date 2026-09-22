(function(){
 const VERSION=3;
 window.CLOUD_SAVE_GUIDE_VERSION=VERSION;
 const base=window.gameGuidePage;
 if(typeof base!=="function")return;
 window.gameGuidePage=function(...args){
  const html=base.apply(this,args);
  const guide=`<section class="card" style="margin:0 0 14px"><h3 style="margin-top:0">帳號與雲端存檔</h3><div class="guide-items"><div class="guide-item"><b>帳號登入</b><div>使用 Email 帳號登入；這台裝置會保持登入，直到主動登出。</div></div><div class="guide-item"><b>本機與雲端存檔</b><div>每台裝置平常使用自己的本機存檔，雲端不會自動同步或覆蓋進度。</div></div><div class="guide-item"><b>換裝置</b><div>先在原裝置完成離線收益結算並上傳存檔，再於新裝置登入同一帳號並下載雲端存檔。</div></div><div class="guide-item"><b>覆蓋前確認</b><div>上傳會覆蓋雲端存檔，下載會覆蓋目前裝置的本機存檔；操作前請確認存檔時間、等級與 EXP。</div></div><div class="guide-item"><b>離線收益</b><div>下載後離線計時會重新開始，上傳到下載之間的時間不會另外補發離線收益。</div></div></div></section>`;
  const marker='<div class="guide-layout">';
  return typeof html==="string"&&html.includes(marker)?html.replace(marker,guide+marker):guide+html;
 };
})();