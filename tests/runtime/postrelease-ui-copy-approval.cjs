'use strict';
// Undo ONLY the authorized postrelease player/GM copy edits for historical byte locks.
// Exact one-to-one reverse mappings keep non-copy owner changes fail-closed.
const assert=require('node:assert/strict');
const changes={
 'alternateuniverseui.js':[['異宇宙戰鬥或結算發生異常，請重新整理後確認目前挑戰與失敗次數，再決定是否繼續。','異宇宙戰鬥未能完成，本次挑戰會保留；請重新整理後再試。']],
 'calamityui.js':[['文明災厄挑戰未能開始，請確認挑戰條件與目前戰鬥狀態。','目前無法開始文明災厄挑戰。']],
 'dungeonvoidui.js':[['虛空挑戰未能開始，請確認目前挑戰狀態後再試。','目前無法開始虛空幻境。']],
 'mirrordungeonui.js':[['目前無法開始鏡像戰，請確認今日次數與本輪挑戰狀態。','目前無法進入鏡像戰，請確認解鎖條件及本輪進度。']],
 'gameguide.js':[['戰鬥會自動進行，玩家與敵人輪流攻擊，直到其中一方 HP 歸零。戰鬥結果依雙方能力、暴擊、閃避與特殊效果決定。HP 回復與跨場延續方式因模式而異，請以各模式的正式規則為準。','戰鬥會自動進行，玩家與敵人輪流攻擊，直到其中一方 HP 歸零。每次戰鬥的結果會依雙方能力、暴擊、閃避與各種特殊效果決定。除競技場三連戰的場間之外，戰鬥結束後 HP 會回滿。']],
 'thirdworldui.js':[['else {console.warn("[文明戰線] 界弦核心注入失敗",result?.reason);coreFeedback="界弦核心注入未完成，請確認目前資源及連戰狀態後再試。";}','else coreFeedback=String(result?.reason||"界弦核心注入失敗，請稍後再試。");']],
 'thirdworldarenaui.js':[['function buttonLabel(count){return `${count} 輪`;}','function buttonLabel(count){return count===1?"單場":`${count}場`;}']],
 'secondworldmainline.js':[
 ["console.error('[文明戰線] 宇宙戰鬥啟動失敗',combat?.reason);alert('宇宙戰鬥無法啟動，請確認目前戰鬥狀態後再試。');",'alert(combat?.reason||"戰鬥啟動失敗。");'],
 ["console.error('[文明戰線] 宇宙戰鬥結算失敗',settled.reason);alert('宇宙戰鬥結算未完成，請確認目前進度再試。');",'alert(settled.reason||"戰鬥結算失敗。");'],
 ["console.error('[文明戰線] 宇宙死亡結算失敗',penalty.reason);alert('戰鬥死亡結算未完成，請確認存檔狀態後再試。');",'alert(penalty.reason||"死亡懲罰結算失敗。");']
 ],
 'secondworldcalamityui.js':[['宇宙文明災厄挑戰未能開始，請確認文明條件與目前戰鬥狀態。','目前無法開始此文明災厄挑戰。']],
 '3d-test/test-center.js':[
 ['if(disabled){status.hidden=false;status.textContent="預覽已停用，不影響正式遊戲。";fallback.hidden=true;host.hidden=true;return;}','if(disabled){showFailure("預覽已停用，不影響正式遊戲。");return;}'],
 ['}catch(error){if(ticket===serial){console.error("[文明戰線] GM 動畫預覽載入失敗",error);showFailure("動畫預覽載入失敗，請重新啟動預覽。");}}','}catch(error){if(ticket===serial)showFailure("視覺測試無法載入："+String(error?.message||error));}']],
 '3d-test/index.html':[
 ['<h2>預覽無法顯示</h2>','<h2>已切換為安全模式</h2>'],
 ['&postrelease=20261025-5"></script>','"></script>']]
};
function historicalBytes(p,bytes){
 let source=Buffer.from(bytes).toString('utf8');
 if(p==='index.html'){
  const marker='&postrelease=20261025-5';
  assert.equal(source.split(marker).length-1,16,'exact batch 5 index asset URL tokens');
  return Buffer.from(source.split(marker).join(''));
 }
 const edits=changes[p];if(!edits)return bytes;
 for(const [approved,prior] of edits){
  assert.equal(source.split(approved).length-1,1,'authorized postrelease edit must appear once: '+p);
  source=source.replace(approved,prior);
 }
 return Buffer.from(source);
}
module.exports={historicalBytes,approvedPaths:Object.keys(changes)};
