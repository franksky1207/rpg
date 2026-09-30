const fs=require("fs");
function assert(condition,message){if(!condition)throw new Error(message);}
const src=fs.readFileSync("gmsecondworldprogress.js","utf8");
const index=fs.readFileSync("index.html","utf8");
assert(/GM_SECOND_WORLD_PROGRESS_MANAGEMENT_VERSION=VERSION/.test(src),"缺少 W2 GM progress owner version");
assert(/bossKilled=Array\.from\(\{length:BOSS_COUNT\}/.test(src),"W2 GM progress 必須以 100 Boss prefix 寫入正式 bossKilled");
assert(/completedStories=Array\.from\(new Set/.test(src),"W2 GM progress 必須同步宇宙故事 completion");
assert(/normalizeSecondWorldCalamityState/.test(src),"W2 GM progress 必須交由宇宙災厄 normalization owner 收斂");
assert(/runSettlementTransaction/.test(src),"W2 GM progress 正式套用必須使用 settlement transaction");
assert(!/civilizationLevel\s*=/.test(src),"W2 GM progress 不得擅自修改文明等級");
assert(/gmsecondworldprogress\.js\?v=20260930-gm-phase-batch2/.test(index),"index.html 尚未載入 W2 GM progress owner 或 cache-bust 不符");
console.log("GM World 2 progress static integrity passed.");
