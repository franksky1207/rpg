const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const accessSource=fs.readFileSync("alternateuniverseaccess.js","utf8");
const uiSource=fs.readFileSync("alternateuniverseui.js","utf8");
const progressionSource=fs.readFileSync("alternateuniverseprogression.js","utf8");
const index=fs.readFileSync("index.html","utf8");

const state={saveVersion:17,reincarnation:{count:0,breakthrough:{permanent:0,milestoneLifeId:0,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:0,failures:{}}}},thirdWorld:{entered:true,bosses:Array.from({length:10},()=>({currentHp:0}))}};
let saves=0;
const sandbox={console,Math,JSON,Object,Array,Set,Number,String,Boolean,state,window:{},globalThis:null};sandbox.globalThis=sandbox;sandbox.window=sandbox;
sandbox.alternateUniverseUnlocked=target=>target?.reincarnation?.alternateUniverse?.unlocked===true;
sandbox.thirdWorldBossesAllDefeated=target=>Array.isArray(target?.thirdWorld?.bosses)&&target.thirdWorld.bosses.length===10&&target.thirdWorld.bosses.every(row=>Number(row?.currentHp)===0);
sandbox.runSettlementTransaction=({label,mutate})=>{const value=mutate(state);if(value?.ok===false)return {ok:false,reason:value.reason,saved:false,label};saves++;return {ok:true,saved:true,label,value};};
vm.createContext(sandbox);vm.runInContext(accessSource,sandbox,{filename:"alternateuniverseaccess.js"});
assert(sandbox.ALTERNATE_UNIVERSE_ACCESS_VERSION===1,"AU access owner version 缺失。");
assert(sandbox.alternateUniverseHomeEntryVisible(state)===true,"首次擊敗 10 名高維存在後，主畫面入口必須立即可見。");
const unlock=sandbox.ensureAlternateUniversePermanentUnlock(state);
assert(unlock.ok&&unlock.saved&&state.reincarnation.alternateUniverse.unlocked===true,"首次進入 AU 必須透過正式 transaction 永久保存 unlocked=true。");
assert(saves===1,"AU 永久解鎖只應寫入一次。");
const again=sandbox.ensureAlternateUniversePermanentUnlock(state);
assert(again.ok&&!again.saved&&again.alreadyUnlocked===true&&saves===1,"已永久解鎖後不得重複 save。");

assert(/ALTERNATE_UNIVERSE_PLAYER_UI_VERSION=1/.test(uiSource),"AU player UI version 缺失。");
assert(/alternateUniverseHomeEntryVisible/.test(uiSource)&&/openAlternateUniversePage/.test(uiSource),"AU 主畫面獨立入口 bridge 缺失。");
assert(/secondWorldHomeEntryHtml/.test(uiSource)&&/data-alternate-universe-home-entry/.test(uiSource),"AU 主畫面入口必須掛入現有 home entry chain，而不是污染主 menu owner。");
assert(/beginAlternateUniverseAttempt/.test(uiSource)&&/runAndSettleAlternateUniverseCombat/.test(uiSource),"AU UI 必須使用既有正式 attempt／combat owners。");
assert(/abandonAlternateUniverseAttempt/.test(uiSource)&&/放棄尚未結算/.test(uiSource),"AU UI 必須提供明確放棄流程，並提示會計 1 敗。");
assert(/alternateUniverseFailureStatus/.test(uiSource)&&/完成下一次轉生後解除鎖定/.test(uiSource),"AU UI 必須顯示 10 敗鎖定與下一輪解除規則。");
assert(/alternateUniverseReviewAccess/.test(uiSource)&&/runAlternateUniverseCombat\(\{review:true/.test(uiSource),"AU UI 回顧戰必須使用 review policy 與共用 combat adapter。");
assert(/回顧戰不改 deepestCleared/.test(uiSource)&&/不計失敗/.test(uiSource)&&/沒有任何收益/.test(uiSource),"AU 回顧戰 UI 必須明示完全無進度／失敗／收益影響。");
assert(/1000 \/ 1000/.test(uiSource)&&/200 \/ 200/.test(uiSource)&&/全部異宇宙已征服/.test(uiSource),"AU UI 必須有 U1000 完成狀態。");
assert(/正式勝利只推進征服進度，不提供 EXP、資源或裝備/.test(uiSource),"AU UI 必須明示正式勝利無資源收益。");
assert(/alternateuniverseaccess\.js\?v=20261003-reincarnation-batch3-6/.test(progressionSource),"AU progression loader 必須載入 3-6 access owner。");
assert(/alternateuniverseui\.js\?v=20261003-reincarnation-batch3-6/.test(progressionSource),"AU progression loader 必須載入 3-6 player UI。");
assert(progressionSource.indexOf("ACCESS_SRC")<progressionSource.indexOf("UI_SRC"),"AU access owner 必須先於 player UI 載入。");
assert(index.includes('src="alternateuniverseprogression.js?v=20261003-reincarnation-batch3-6"'),"index.html 必須更新 AU progression cache-bust 至 3-6。");
assert(!/gold\s*\+=|darkMatter\s*\+=|darkEnergy\s*\+=|dimensionalStrings\s*\+=|inventory\.push/i.test(uiSource),"AU player UI 不得偷偷發放資源或裝備。");
console.log("Alternate Universe player UI integrity passed.");
