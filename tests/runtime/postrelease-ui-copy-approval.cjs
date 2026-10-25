'use strict';
// Undo ONLY the authorized postrelease player/GM copy edits for historical byte locks.
// Exact one-to-one reverse mappings keep non-copy owner changes fail-closed.
const assert=require('node:assert/strict');
const changes={
 'alternateuniverseui.js':[['異宇宙戰鬥或結算發生異常，請重新整理後確認目前挑戰與失敗次數，再決定是否繼續。','異宇宙戰鬥未能完成，本次挑戰會保留；請重新整理後再試。']],
 'calamityui.js':[['文明災厄挑戰未能開始，請確認挑戰條件與目前戰鬥狀態。','目前無法開始文明災厄挑戰。']],
 'secondworldcalamityui.js':[['宇宙文明災厄挑戰未能開始，請確認文明條件與目前戰鬥狀態。','目前無法開始此文明災厄挑戰。']],
 '3d-test/test-center.js':[
 ['if(disabled){status.hidden=false;status.textContent="預覽已停用，不影響正式遊戲。";fallback.hidden=true;host.hidden=true;return;}','if(disabled){showFailure("預覽已停用，不影響正式遊戲。");return;}'],
 ['}catch(error){if(ticket===serial){console.error("[文明戰線] GM 動畫預覽載入失敗",error);showFailure("動畫預覽載入失敗，請重新啟動預覽。");}}','}catch(error){if(ticket===serial)showFailure("視覺測試無法載入："+String(error?.message||error));}']],
 '3d-test/index.html':[
 ['<h2>預覽無法顯示</h2>','<h2>已切換為安全模式</h2>'],
 ['&postrelease=20261025-5"></script>','"></script>']]
};
function historicalBytes(p,bytes){
 const edits=changes[p];if(!edits)return bytes;
 let source=Buffer.from(bytes).toString('utf8');
 for(const [approved,prior] of edits){
  assert.equal(source.split(approved).length-1,1,'authorized postrelease edit must appear once: '+p);
  source=source.replace(approved,prior);
 }
 return Buffer.from(source);
}
module.exports={historicalBytes,approvedPaths:Object.keys(changes)};
