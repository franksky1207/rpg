(function(){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.civilizationMarksArchiveHtml=function(){
  const snapshot=window.markFormalSnapshot(),defs=window.CIVILIZATION_CALAMITY_CONFIG||[];
  return `<details class="card civilization-marks"><summary>銀河十種印記・目前有效能力</summary>${defs.map(d=>{const m=snapshot[d.markId],lv=m?.level||0;return `<article class="calamity-mark-card"><h3>${esc(d.markName)}</h3><b>${m?.acquired?`Lv.${lv}${lv===10?' MAX':''}`:'未取得'}</b><p>${esc(m?.acquired?window.markEffectDescription(d.markId,lv):'目前未取得，尚未生效。')}</p></article>`;}).join('')}</details>`;
 };
 window.civilizationHeritagePageHtml=function(){
  const lv=window.civilizationLevel(state),mult=window.civilizationCombatDamageMultiplier({world:3,state});
  return `<section class="calamity-shell"><div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div><div class="card"><h2>文明傳承</h2><p>宇宙文明 Lv.${lv} / 10</p><p>目前有效最終傷害倍率 ×${Number(mult).toFixed(2)}</p><p class="muted">依本輪實際狀態顯示；轉生重設的印記不視為目前有效能力。</p></div>${window.civilizationMarksArchiveHtml()}</section>`;
 };
})();
