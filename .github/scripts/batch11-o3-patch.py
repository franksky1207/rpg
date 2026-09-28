from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding='utf-8')

def write(path, text):
    Path(path).write_text(text, encoding='utf-8')

def replace_once(path, old, new):
    text=read(path)
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'{path}: expected 1 match, found {count}: {old[:120]!r}')
    write(path,text.replace(old,new,1))

def regex_once(path, pattern, repl):
    text=read(path)
    new,count=re.subn(pattern,repl,text,count=1,flags=re.S)
    if count!=1:
        raise SystemExit(f'{path}: regex expected 1 match, found {count}: {pattern[:120]!r}')
    write(path,new)

# worldphase.js — targeted retired transient cleanup; preserve every other unknown field.
replace_once('worldphase.js',
''' const worldTransitionRuntimeBlockers=new Map();\n''',
''' const worldTransitionRuntimeBlockers=new Map();\n const SECOND_WORLD_RETIRED_TRANSIENT_KEYS=Object.freeze(["activeRun","run","runId","pendingEvents","recentSummaries","runTotals","battleContext","continuousRun"]);\n const SECOND_WORLD_MAINLINE_RETIRED_TRANSIENT_KEYS=Object.freeze(["activeRun","run","runId","pendingEvents","recentSummaries","runTotals","battleContext","continuousRun","selectedBossIndex","currentBossIndex"]);\n const SECOND_WORLD_RETIRED_TRANSIENT_CLEANUP_VERSION=1;\n const SECOND_WORLD_LEGACY_CLEANUP_REGRESSION_VERSION=1;\n''')
replace_once('worldphase.js',
''' function normalizeSecondWorldState(target){\n''',
''' function cleanupRetiredSecondWorldTransientState(target){\n  if(!isObject(target)||!isObject(target.secondWorld))return {removed:[],removedMainline:[]};\n  const removed=[],removedMainline=[],second=target.secondWorld;\n  SECOND_WORLD_RETIRED_TRANSIENT_KEYS.forEach(key=>{if(Object.prototype.hasOwnProperty.call(second,key)){delete second[key];removed.push(key);}});\n  if(isObject(second.mainline))SECOND_WORLD_MAINLINE_RETIRED_TRANSIENT_KEYS.forEach(key=>{if(Object.prototype.hasOwnProperty.call(second.mainline,key)){delete second.mainline[key];removedMainline.push(key);}});\n  return {removed,removedMainline};\n }\n function normalizeSecondWorldState(target){\n''')
replace_once('worldphase.js',
'''  target.secondWorld={...source,entered:source.entered===true,mainline:{...mainline,bossKilled:normalizeBossKilled(mainline.bossKilled)},darkMatter:finiteCount(source.darkMatter),darkEnergy:finiteCount(source.darkEnergy),civilizationLevel:Math.max(storedCivilizationLevel,inferredCivilizationLevel),calamities};\n  return target;\n }\n''',
'''  target.secondWorld={...source,entered:source.entered===true,mainline:{...mainline,bossKilled:normalizeBossKilled(mainline.bossKilled)},darkMatter:finiteCount(source.darkMatter),darkEnergy:finiteCount(source.darkEnergy),civilizationLevel:Math.max(storedCivilizationLevel,inferredCivilizationLevel),calamities};\n  cleanupRetiredSecondWorldTransientState(target);\n  return target;\n }\n''')
replace_once('worldphase.js',
''' window.WORLD_PHASE_VERSION=WORLD_PHASE_VERSION;\n''',
''' function runSecondWorldRetiredTransientCleanupRegression(){\n  const sample={secondWorld:{entered:true,darkMatter:12345,darkEnergy:67,civilizationLevel:4,unknownFutureField:{keep:true},activeRun:{legacy:true},runId:"legacy-top",pendingEvents:["legacy"],runTotals:{battles:9},mainline:{bossKilled:Array.from({length:SECOND_WORLD_MAIN_BOSS_COUNT},(_,index)=>index===3),run:{legacy:true},runId:"legacy-main",pendingEvents:["legacy"],selectedBossIndex:42,unknownMainlineField:9},calamities:[{currentHp:777,trueKills:30,unknownCalamityField:"keep"}]}};\n  normalizeSecondWorldState(sample);\n  const second=sample.secondWorld,mainline=second.mainline,firstCalamity=second.calamities[0];\n  const topRetiredGone=SECOND_WORLD_RETIRED_TRANSIENT_KEYS.every(key=>!Object.prototype.hasOwnProperty.call(second,key));\n  const mainlineRetiredGone=SECOND_WORLD_MAINLINE_RETIRED_TRANSIENT_KEYS.every(key=>!Object.prototype.hasOwnProperty.call(mainline,key));\n  const formalPreserved=second.entered===true&&second.darkMatter===12345&&second.darkEnergy===67&&second.civilizationLevel===4&&mainline.bossKilled[3]===true&&firstCalamity.currentHp===777&&firstCalamity.trueKills===30;\n  const unknownPreserved=second.unknownFutureField?.keep===true&&mainline.unknownMainlineField===9&&firstCalamity.unknownCalamityField==="keep";\n  const errors=[];if(!topRetiredGone)errors.push("top-retired-remains");if(!mainlineRetiredGone)errors.push("mainline-retired-remains");if(!formalPreserved)errors.push("formal-field-loss");if(!unknownPreserved)errors.push("unknown-field-loss");\n  return {version:SECOND_WORLD_LEGACY_CLEANUP_REGRESSION_VERSION,passed:errors.length===0,errors,formalPreserved,unknownPreserved,topRetiredGone,mainlineRetiredGone};\n }\n\n window.WORLD_PHASE_VERSION=WORLD_PHASE_VERSION;\n''')
replace_once('worldphase.js',
''' window.SECOND_WORLD_STATE_PRESERVE_UNKNOWN_VERSION=1;\n''',
''' window.SECOND_WORLD_STATE_PRESERVE_UNKNOWN_VERSION=2;\n window.SECOND_WORLD_RETIRED_TRANSIENT_CLEANUP_VERSION=SECOND_WORLD_RETIRED_TRANSIENT_CLEANUP_VERSION;\n window.SECOND_WORLD_LEGACY_CLEANUP_REGRESSION_VERSION=SECOND_WORLD_LEGACY_CLEANUP_REGRESSION_VERSION;\n window.SECOND_WORLD_RETIRED_TRANSIENT_KEYS=Array.from(SECOND_WORLD_RETIRED_TRANSIENT_KEYS);\n window.SECOND_WORLD_MAINLINE_RETIRED_TRANSIENT_KEYS=Array.from(SECOND_WORLD_MAINLINE_RETIRED_TRANSIENT_KEYS);\n window.cleanupRetiredSecondWorldTransientState=cleanupRetiredSecondWorldTransientState;\n window.runSecondWorldRetiredTransientCleanupRegression=runSecondWorldRetiredTransientCleanupRegression;\n window.SECOND_WORLD_LEGACY_CLEANUP_REGRESSION=runSecondWorldRetiredTransientCleanupRegression();\n''')

# ui.js — a thin shared review-result notice helper used by Galaxy and Universe review flows.
replace_once('ui.js',
'''window.startGalaxyReviewBattle=async function(){\n''',
'''function reviewResultPresentationHtml(options={}){\n const heading=String(options.heading||"回顧挑戰結束"),extra=String(options.extra||"");\n return `<div class="notice review-result-notice"><b>${heading}</b><div class="muted" style="margin-top:6px">本場為單場純回顧挑戰，不影響目前正式進度。${extra?`<br>${extra}`:""}</div></div>`;\n}\nwindow.REVIEW_RESULT_PRESENTATION_VERSION=1;\nwindow.reviewResultPresentationHtml=reviewResultPresentationHtml;\nwindow.startGalaxyReviewBattle=async function(){\n''')
regex_once('ui.js',
 r'''detail\.innerHTML=`<div class="notice"><b>銀河紀元・回顧戰結束</b><div class="muted" style="margin-top:6px">本場不獲得 EXP、資源、裝備或任何正式進度；戰敗也不產生任何損失。</div></div>`;''',
 '''detail.innerHTML=reviewResultPresentationHtml({heading:"銀河紀元・回顧戰結束",extra:"不獲得 EXP、資源、裝備或任何正式進度；戰敗也不產生任何損失。"});''')

# secondworldmainline.js — use the shared semantic helper without moving W2-specific details out of its owner.
replace_once('secondworldmainline.js',' const VERSION=11;\n',' const VERSION=12;\n')
replace_once('secondworldmainline.js',
''' const REVIEW_RESULT_LOCK_VERSION=1;\n''',
''' const REVIEW_RESULT_LOCK_VERSION=1;\n const REVIEW_PRESENTATION_VERSION=1;\n''')
regex_once('secondworldmainline.js',
 r'''detail\.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">\$\{boss\?\.name\|\|"宇宙紀元 Boss"\} Lv\.\$\{boss\?\.level\|\|"—"\}</div><div class="notice"><b>\$\{combat\?\.win===true\?"回顧勝利":"回顧挑戰結束"\}</b><div class="muted" style="margin-top:6px">本場為單場純回顧挑戰，不產生 EXP、暗物質、暗能量、裝備、主線進度、文明災厄、特殊遭遇、離線樣本或死亡懲罰；正式角色 HP 與所有正式 state 皆不變。</div></div><div class="muted" style="margin-top:10px">戰鬥回合：\$\{Math\.max\(0,Number\(combat\?\.turns\)\|\|0\)\}</div></div>`;''',
 '''const reviewNotice=typeof window.reviewResultPresentationHtml==="function"?window.reviewResultPresentationHtml({heading:combat?.win===true?"回顧勝利":"回顧挑戰結束",extra:"不產生 EXP、暗物質、暗能量、裝備、主線進度、文明災厄、特殊遭遇、離線樣本或死亡懲罰；正式角色 HP 與所有正式 state 皆不變。"}):`<div class="notice"><b>${combat?.win===true?"回顧勝利":"回顧挑戰結束"}</b></div>`;\n  detail.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">${boss?.name||"宇宙紀元 Boss"} Lv.${boss?.level||"—"}</div>${reviewNotice}<div class="muted" style="margin-top:10px">戰鬥回合：${Math.max(0,Number(combat?.turns)||0)}</div></div>`;''')
replace_once('secondworldmainline.js',
''' window.SECOND_WORLD_MAINLINE_REVIEW_RESULT_LOCK_VERSION=REVIEW_RESULT_LOCK_VERSION;\n''',
''' window.SECOND_WORLD_MAINLINE_REVIEW_RESULT_LOCK_VERSION=REVIEW_RESULT_LOCK_VERSION;\n window.SECOND_WORLD_MAINLINE_REVIEW_PRESENTATION_VERSION=REVIEW_PRESENTATION_VERSION;\n''')

# Third-world integrity contract: require cleanup regression + shared review presentation helper.
replace_once('thirdworldintegritycontract.js',' const VERSION=32;\n',' const VERSION=33;\n')
replace_once('thirdworldintegritycontract.js',
'''  SECOND_WORLD_COMBAT_VERSION:3,SECOND_WORLD_COMBAT_REVIEW_POLICY_VERSION:1,SECOND_WORLD_COMBAT_REVIEW_STATE_ISOLATION_VERSION:2,SECOND_WORLD_MAINLINE_VERSION:11,SECOND_WORLD_MAINLINE_REVIEW_FLOW_VERSION:1,SECOND_WORLD_MAINLINE_REVIEW_STATE_ISOLATION_VERSION:2,SECOND_WORLD_MAINLINE_REVIEW_RESULT_LOCK_VERSION:1,SECOND_WORLD_ADVENTURE_REVIEW_VIEW_VERSION:5,SECOND_WORLD_UNIVERSE_REVIEW_CARD_MODE_VERSION:1,\n''',
'''  SECOND_WORLD_COMBAT_VERSION:3,SECOND_WORLD_COMBAT_REVIEW_POLICY_VERSION:1,SECOND_WORLD_COMBAT_REVIEW_STATE_ISOLATION_VERSION:2,SECOND_WORLD_MAINLINE_VERSION:12,SECOND_WORLD_MAINLINE_REVIEW_FLOW_VERSION:1,SECOND_WORLD_MAINLINE_REVIEW_STATE_ISOLATION_VERSION:2,SECOND_WORLD_MAINLINE_REVIEW_RESULT_LOCK_VERSION:1,SECOND_WORLD_MAINLINE_REVIEW_PRESENTATION_VERSION:1,SECOND_WORLD_ADVENTURE_REVIEW_VIEW_VERSION:5,SECOND_WORLD_UNIVERSE_REVIEW_CARD_MODE_VERSION:1,\n  SECOND_WORLD_STATE_PRESERVE_UNKNOWN_VERSION:2,SECOND_WORLD_RETIRED_TRANSIENT_CLEANUP_VERSION:1,SECOND_WORLD_LEGACY_CLEANUP_REGRESSION_VERSION:1,REVIEW_RESULT_PRESENTATION_VERSION:1,\n''')
replace_once('thirdworldintegritycontract.js',
'''"getAdventureEraView","setAdventureEraView","adventureEraTabsHtml","adventureEraViewLocked","setAdventureReviewBattleActive","isAdventureReviewBattleActive","getAdventureReviewBattleSource","isGalaxyReviewBattleActive","getGalaxyReviewFormalStateGuardReport","canRunSecondWorldBossReview","startSecondWorldBossReview",''',
'''"getAdventureEraView","setAdventureEraView","adventureEraTabsHtml","adventureEraViewLocked","setAdventureReviewBattleActive","isAdventureReviewBattleActive","getAdventureReviewBattleSource","isGalaxyReviewBattleActive","getGalaxyReviewFormalStateGuardReport","cleanupRetiredSecondWorldTransientState","runSecondWorldRetiredTransientCleanupRegression","reviewResultPresentationHtml","canRunSecondWorldBossReview","startSecondWorldBossReview",''')
replace_once('thirdworldintegritycontract.js',
'''  const eras=Array.from(window.PLAYER_TITLE_POST_FLOW_ERAS||[]);\n''',
'''  const secondWorldCleanup=window.SECOND_WORLD_LEGACY_CLEANUP_REGRESSION;\n  if(secondWorldCleanup?.passed!==true||secondWorldCleanup?.formalPreserved!==true||secondWorldCleanup?.unknownPreserved!==true)errors.push({code:"SECOND_WORLD_LEGACY_CLEANUP_REGRESSION",report:secondWorldCleanup||null});\n  const eras=Array.from(window.PLAYER_TITLE_POST_FLOW_ERAS||[]);\n''')

# Runtime/static integrity assertions.
replace_once('tests/runtime/js-integrity.js',
'''assert(/const VERSION=11;/.test(secondWorldMainline)&&/const REVIEW_STATE_ISOLATION_VERSION=2;/.test(secondWorldMainline)&&/SECOND_WORLD_MAINLINE_REVIEW_FLOW_VERSION=REVIEW_FLOW_VERSION/.test(secondWorldMainline)&&/SECOND_WORLD_MAINLINE_REVIEW_RESULT_LOCK_VERSION=REVIEW_RESULT_LOCK_VERSION/.test(secondWorldMainline)&&/SECOND_WORLD_COMBAT_REVIEW_STATE_ISOLATION_VERSION\\)<2/.test(secondWorldMainline)&&/startSecondWorldBossReview=function/.test(secondWorldMainline)&&/runSecondWorldBossCombat\\(index,\\{review:true/.test(secondWorldMainline)&&/setAdventureReviewBattleActive\\(true,"universe"\\)/.test(secondWorldMainline)&&/!reviewResultQueued/.test(secondWorldMainline)&&!/JSON\\.stringify\\(targetState\\)!==before/.test(secondWorldMainline),"宇宙回顧 V11 必須把 state-isolation 交給同步 Combat owner，async presentation 不得再做整份 state equality。");\n''',
'''assert(/const VERSION=12;/.test(secondWorldMainline)&&/const REVIEW_STATE_ISOLATION_VERSION=2;/.test(secondWorldMainline)&&/SECOND_WORLD_MAINLINE_REVIEW_FLOW_VERSION=REVIEW_FLOW_VERSION/.test(secondWorldMainline)&&/SECOND_WORLD_MAINLINE_REVIEW_RESULT_LOCK_VERSION=REVIEW_RESULT_LOCK_VERSION/.test(secondWorldMainline)&&/SECOND_WORLD_MAINLINE_REVIEW_PRESENTATION_VERSION=REVIEW_PRESENTATION_VERSION/.test(secondWorldMainline)&&/SECOND_WORLD_COMBAT_REVIEW_STATE_ISOLATION_VERSION\\)<2/.test(secondWorldMainline)&&/startSecondWorldBossReview=function/.test(secondWorldMainline)&&/runSecondWorldBossCombat\\(index,\\{review:true/.test(secondWorldMainline)&&/setAdventureReviewBattleActive\\(true,"universe"\\)/.test(secondWorldMainline)&&/reviewResultPresentationHtml/.test(secondWorldMainline)&&/!reviewResultQueued/.test(secondWorldMainline)&&!/JSON\\.stringify\\(targetState\\)!==before/.test(secondWorldMainline),"宇宙回顧 V12 必須維持同步 state-isolation，並共用薄層 review result presentation helper。");\n''')
replace_once('tests/runtime/js-integrity.js',
'''assert(/ADVENTURE_ERA_VIEW_OWNER_VERSION=1/.test(worldmap)&&/ADVENTURE_ERA_SESSION_POLICY_VERSION=1/.test(worldmap)&&/ADVENTURE_ERA_RUNTIME_LOCK_VERSION=4/.test(worldmap)&&/ADVENTURE_REVIEW_RUNTIME_SOURCE_VERSION=2/.test(worldmap),"三紀元冒險切換必須由單一 session-only owner 持有，並具備可辨識來源的 shared review runtime lock。");\n''',
'''assert(/ADVENTURE_ERA_VIEW_OWNER_VERSION=1/.test(worldmap)&&/ADVENTURE_ERA_SESSION_POLICY_VERSION=1/.test(worldmap)&&/ADVENTURE_ERA_RUNTIME_LOCK_VERSION=4/.test(worldmap)&&/ADVENTURE_REVIEW_RUNTIME_SOURCE_VERSION=2/.test(worldmap),"三紀元冒險切換必須由單一 session-only owner 持有，並具備可辨識來源的 shared review runtime lock。");\nassert(/SECOND_WORLD_STATE_PRESERVE_UNKNOWN_VERSION=2/.test(worldPhase)&&/SECOND_WORLD_RETIRED_TRANSIENT_CLEANUP_VERSION=SECOND_WORLD_RETIRED_TRANSIENT_CLEANUP_VERSION/.test(worldPhase)&&/SECOND_WORLD_LEGACY_CLEANUP_REGRESSION_VERSION=SECOND_WORLD_LEGACY_CLEANUP_REGRESSION_VERSION/.test(worldPhase)&&/cleanupRetiredSecondWorldTransientState/.test(worldPhase)&&/unknownFutureField/.test(worldPhase)&&/unknownMainlineField/.test(worldPhase),"第二紀元舊資料 cleanup 必須只刪明確 retired transient，並以 regression 保護正式／未知未退休欄位。");\nassert(/target\\.secondWorld=\\{\\.\\.\\.source/.test(worldPhase)&&/mainline:\\{\\.\\.\\.mainline/.test(worldPhase),"第二紀元 normalization 仍必須保留未知欄位，不得在 O3 偷改 strict allowlist。");\nassert(/REVIEW_RESULT_PRESENTATION_VERSION=1/.test(ui)&&/function reviewResultPresentationHtml/.test(ui)&&/銀河紀元・回顧戰結束/.test(ui)&&/reviewResultPresentationHtml/.test(secondWorldMainline),"銀河／宇宙回顧結果應共用薄層 presentation 語意 helper；高維特有 Stage 資訊仍由高維 owner 持有。");\n''')
replace_once('tests/runtime/js-integrity.js','src="worldphase.js?v=20260927-offline-owner-batch8-o1"','src="worldphase.js?v=20260928-thirdworld-batch11-o3"')
replace_once('tests/runtime/js-integrity.js','src="ui.js?v=20260928-thirdworld-batch11-o1"','src="ui.js?v=20260928-thirdworld-batch11-o3"')
replace_once('tests/runtime/js-integrity.js','src="secondworldmainline.js?v=20260928-thirdworld-batch11-o1"','src="secondworldmainline.js?v=20260928-thirdworld-batch11-o3"')
replace_once('tests/runtime/js-integrity.js','src="thirdworldintegritycontract.js?v=20260928-thirdworld-batch11-o2"','src="thirdworldintegritycontract.js?v=20260928-thirdworld-batch11-o3"')

# index cache-bust for changed JS only.
for old,new in [
 ('worldphase.js?v=20260927-offline-owner-batch8-o1','worldphase.js?v=20260928-thirdworld-batch11-o3'),
 ('ui.js?v=20260928-thirdworld-batch11-o1','ui.js?v=20260928-thirdworld-batch11-o3'),
 ('secondworldmainline.js?v=20260928-thirdworld-batch11-o1','secondworldmainline.js?v=20260928-thirdworld-batch11-o3'),
 ('thirdworldintegritycontract.js?v=20260928-thirdworld-batch11-o2','thirdworldintegritycontract.js?v=20260928-thirdworld-batch11-o3')]:
    text=read('index.html')
    needle=f'src="{old}"'
    replacement=f'src="{new}"'
    if text.count(needle)!=1:
        raise SystemExit(f'index.html expected one exact cache match: {needle}')
    write('index.html',text.replace(needle,replacement,1))
