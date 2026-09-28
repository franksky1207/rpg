from pathlib import Path
import re

TAG='20260928-thirdworld-vip20-death-protection1'

def replace(path, old, new, count=1):
    p=Path(path); s=p.read_text(encoding='utf-8'); n=s.count(old)
    if n!=count: raise SystemExit(f'{path}: expected {count} matches, got {n}: {old[:160]!r}')
    p.write_text(s.replace(old,new,count),encoding='utf-8')

def retag(path, script):
    p=Path(path); s=p.read_text(encoding='utf-8')
    pat=re.compile(rf'({re.escape(script)}\?v=)[^"\']+')
    s2,n=pat.subn(rf'\g<1>{TAG}',s,count=1)
    if n!=1: raise SystemExit(f'{path}: cache tag not found for {script}')
    p.write_text(s2,encoding='utf-8')

# 1) engine.js: extract the existing 30% equipment-loss roll + VIP20 interception into a shared owner.
old='''function applyDeathPenalty(logs=[]){let dropped=null,protectedByVip20=false;const worn=EQUIPMENT_TYPES.map(slot=>[slot,state.equipment[slot]]).filter(([,it])=>!!it),lossRoll=worn.length&&Math.random()<.30;if(lossRoll){if((state.vipLevel||0)>=20)protectedByVip20=true;else{const [slot,it]=worn[Math.floor(Math.random()*worn.length)];state.equipment[slot]=null;dropped=it;state.lostGear.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),item:it,cost:ceil(it.buy*2),lostAt:Date.now()})}}state.hp=playerCombatStats().hp;if(dropped)logs.push(`裝備遺失：${itemHtmlPlain(dropped)}。可前往背包的「遺失裝備贖回」取回。`);else logs.push(`本次沒有遺失裝備。`);return {dropped,protectedByVip20}}'''
new='''const DEATH_EQUIPMENT_LOSS_CHANCE=.30;
function resolveDeathEquipmentPenalty(logs=[],options={}){
 const rng=typeof options.rng==="function"?options.rng:Math.random,forceProtected=options.forceProtected===true;
 let dropped=null,protectedByVip20=false;
 const worn=EQUIPMENT_TYPES.map(slot=>[slot,state.equipment[slot]]).filter(([,it])=>!!it),lossRoll=!!worn.length&&rng()<DEATH_EQUIPMENT_LOSS_CHANCE;
 if(lossRoll){
  if((state.vipLevel||0)>=20||forceProtected)protectedByVip20=true;
  else{const [slot,it]=worn[Math.floor(rng()*worn.length)];state.equipment[slot]=null;dropped=it;state.lostGear.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),item:it,cost:ceil(it.buy*2),lostAt:Date.now()});}
 }
 if(dropped)logs.push(`裝備遺失：${itemHtmlPlain(dropped)}。可前往背包的「遺失裝備贖回」取回。`);
 else if(protectedByVip20)logs.push(`【VIP20】裝備受到保護，本次死亡沒有遺失裝備。`);
 else logs.push(`本次沒有遺失裝備。`);
 return {dropped,protectedByVip20,lossRoll,lossChance:DEATH_EQUIPMENT_LOSS_CHANCE};
}
function applyDeathPenalty(logs=[]){const result=resolveDeathEquipmentPenalty(logs);state.hp=playerCombatStats().hp;return result}
window.resolveDeathEquipmentPenalty=resolveDeathEquipmentPenalty;
window.DEATH_EQUIPMENT_PENALTY_VERSION=1;
window.DEATH_EQUIPMENT_LOSS_CHANCE=DEATH_EQUIPMENT_LOSS_CHANCE;'''
replace('engine.js',old,new)

# 2) thirdworldrun.js: use the exact same death-equipment roll; W3 force-protects formal gear but attributes the interception to VIP20.
replace('thirdworldrun.js',' const BACKGROUND_POLICY_VERSION=1;',' const BACKGROUND_POLICY_VERSION=1;\n const VIP20_DEATH_PROTECTION_VERSION=1;')
replace('thirdworldrun.js','vip20Protections', 'vip20Protections', 0) if False else None
replace('thirdworldrun.js',
'if(!source)return freeze({version:RUNTIME_VERSION,runId:null,active:false,paused:false,looping:false,bossIndex:-1,deaths:0,battles:0,coreLevelAtStart:null,perDeathSuppressionPointsAtStart:null,pendingEvents:freeze([]),stopReason:"",stopMeta:null,recentBattleLimit:RECENT_HISTORY_LIMIT,recentBattles:freeze([]),lastBattleSummary:null});',
'if(!source)return freeze({version:RUNTIME_VERSION,runId:null,active:false,paused:false,looping:false,bossIndex:-1,deaths:0,battles:0,vip20Protections:0,coreLevelAtStart:null,perDeathSuppressionPointsAtStart:null,pendingEvents:freeze([]),stopReason:"",stopMeta:null,recentBattleLimit:RECENT_HISTORY_LIMIT,recentBattles:freeze([]),lastBattleSummary:null});')
replace('thirdworldrun.js',
'   battles:Math.max(0,finiteWhole(source.battles,0)),\n   startedAt:',
'   battles:Math.max(0,finiteWhole(source.battles,0)),\n   vip20Protections:Math.max(0,finiteWhole(source.vip20Protections,0)),\n   startedAt:')
replace('thirdworldrun.js',
'runtime={runId,active:true,paused:false,looping:false,bossIndex:index,deaths:0,battles:0,startedAt:Date.now(),coreLevelAtStart:levelAtStart,perDeathSuppressionPointsAtStart:suppressionPerDeathPoints(levelAtStart),pauseReason:"",stopReason:"",pendingEvents:[],recentBattles:[],lastBattleSummary:null};',
'runtime={runId,active:true,paused:false,looping:false,bossIndex:index,deaths:0,battles:0,vip20Protections:0,startedAt:Date.now(),coreLevelAtStart:levelAtStart,perDeathSuppressionPointsAtStart:suppressionPerDeathPoints(levelAtStart),pauseReason:"",stopReason:"",pendingEvents:[],recentBattles:[],lastBattleSummary:null};')
replace('thirdworldrun.js',
'   countsDeath:data.countsDeath===true,\n   deathsAfter:',
'   countsDeath:data.countsDeath===true,\n   deathPenalty:data.deathPenalty&&typeof data.deathPenalty==="object"?freeze({...data.deathPenalty}):null,\n   deathsAfter:')
replace('thirdworldrun.js',
'  const countsDeath=settlement.playerDied===true&&settlement.bossDefeated!==true;\n  if(countsDeath)runtime.deaths=clamp(runtime.deaths+1,0,MAX_DEATHS);\n  const deathsAfter=runtime.deaths;',
'  const countsDeath=settlement.playerDied===true&&settlement.bossDefeated!==true;\n  let deathPenalty=null;\n  if(countsDeath){\n   if(typeof window.resolveDeathEquipmentPenalty!=="function")return freeze({ok:false,reason:"共用死亡裝備懲罰 owner 尚未載入。",combat,settlement,snapshot:clearRuntime("owner-missing")});\n   deathPenalty=window.resolveDeathEquipmentPenalty([],{rng:typeof options.rng==="function"?options.rng:undefined,forceProtected:true,source:"third-world"});\n   if(deathPenalty?.protectedByVip20===true)runtime.vip20Protections=Math.max(0,finiteWhole(runtime.vip20Protections,0))+1;\n   runtime.deaths=clamp(runtime.deaths+1,0,MAX_DEATHS);\n  }\n  const deathsAfter=runtime.deaths;')
replace('thirdworldrun.js',
'const summary=summaryFromStep(settlement,combat,{battleNumber:runtime.battles,countsDeath,deathsAfter,deathLimitReached,terminalReason,progressEvent,continuationAllowed:willContinue});',
'const summary=summaryFromStep(settlement,combat,{battleNumber:runtime.battles,countsDeath,deathPenalty,deathsAfter,deathLimitReached,terminalReason,progressEvent,continuationAllowed:willContinue});')
replace('thirdworldrun.js',
'return freeze({ok:true,world:3,combat,settlement,summary,countsDeath,deathsAfter,deathLimitReached,terminalReason,progressEventPending:progressEvent,continuationAllowed:terminalReason===""&&snapshot.active===true,snapshot});',
'return freeze({ok:true,world:3,combat,settlement,summary,countsDeath,deathPenalty,deathsAfter,deathLimitReached,terminalReason,progressEventPending:progressEvent,continuationAllowed:terminalReason===""&&snapshot.active===true,snapshot});')
replace('thirdworldrun.js',' window.THIRD_WORLD_RUN_VERSION=VERSION;',' window.THIRD_WORLD_RUN_VERSION=VERSION;\n window.THIRD_WORLD_VIP20_DEATH_PROTECTION_VERSION=VIP20_DEATH_PROTECTION_VERSION;')

# 3) thirdworldplayerflow.js: visible payoff in the W3 settlement modal.
replace('thirdworldplayerflow.js',' const TOTALS_FAIL_CLOSED_VERSION=1;',' const TOTALS_FAIL_CLOSED_VERSION=1;\n const VIP20_DEATH_PROTECTION_PRESENTATION_VERSION=1;')
old_line='''  const bossIndex=whole(final.bossIndex??result?.lastResult?.summary?.bossIndex),boss=bossDefinition(bossIndex),progress=bossProgress(bossIndex),totals=summaryTotals(result),stop=stopReasonPresentation(reason),battles=Math.max(0,whole(result?.battles??final.battles)),deaths=whole(final.deaths),remainingHp=Math.max(0,whole(progress?.currentHp)),remainingPercent=Number.isFinite(Number(progress?.remainingPercent))?Number(progress.remainingPercent):null;'''
new_line='''  const bossIndex=whole(final.bossIndex??result?.lastResult?.summary?.bossIndex),boss=bossDefinition(bossIndex),progress=bossProgress(bossIndex),totals=summaryTotals(result),stop=stopReasonPresentation(reason),battles=Math.max(0,whole(result?.battles??final.battles)),deaths=whole(final.deaths),vip20Protections=whole(final.vip20Protections),remainingHp=Math.max(0,whole(progress?.currentHp)),remainingPercent=Number.isFinite(Number(progress?.remainingPercent))?Number(progress.remainingPercent):null;'''
replace('thirdworldplayerflow.js',old_line,new_line)
replace('thirdworldplayerflow.js',
'  const remainingText=remainingPercent==null?fmt(remainingHp):`${fmt(remainingHp)}（${pct(remainingPercent)}）`,totalsNotice=totals.complete===true?"":`<div class="muted" style="margin-top:10px">本輪完整 totals 不可用，且最近戰鬥摘要已截斷；為避免顯示錯誤總量，本輪收益欄位不進行推算。</div>`;',
'  const remainingText=remainingPercent==null?fmt(remainingHp):`${fmt(remainingHp)}（${pct(remainingPercent)}）`,totalsNotice=totals.complete===true?"":`<div class="muted" style="margin-top:10px">本輪完整 totals 不可用，且最近戰鬥摘要已截斷；為避免顯示錯誤總量，本輪收益欄位不進行推算。</div>`,vip20Notice=deaths>0?`<div class="notice" style="margin-top:12px"><b>VIP20｜裝備保護</b><div class="muted" style="margin-top:6px;line-height:1.55">本輪死亡 ${fmt(deaths)} 次；原本的 30% 死亡裝備遺失判定仍照常進行。${vip20Protections>0?`其中 ${fmt(vip20Protections)} 次判定原本會遺失裝備，已由 VIP20 全部阻止。`:`本輪沒有抽中裝備遺失，但 VIP20 保護仍持續生效。`}第三紀元的死亡裝備保護來自 VIP20 特權。</div></div>`:"";')
replace('thirdworldplayerflow.js','${totalsNotice}</div><div class="controls">','${totalsNotice}${vip20Notice}</div><div class="controls">')
replace('thirdworldplayerflow.js',' window.THIRD_WORLD_PLAYER_FLOW_VERSION=VERSION;',' window.THIRD_WORLD_PLAYER_FLOW_VERSION=VERSION;\n window.THIRD_WORLD_VIP20_DEATH_PROTECTION_PRESENTATION_VERSION=VIP20_DEATH_PROTECTION_PRESENTATION_VERSION;')

# 4) VIP UI: restore VIP20 in W3 projection and make the W3 benefit explicit.
replace('vipui.js',' const VIP_UI_VERSION=3;',' const VIP_UI_VERSION=4;')
replace('vipui.js',
'  18:"高維主線 Boss 掉落裝備有 10% 機率品質 +1 階"\n });',
'  18:"高維主線 Boss 掉落裝備有 10% 機率品質 +1 階",\n  20:"第三紀元死亡仍會進行原本的 30% 裝備遺失判定，但所有裝備遺失都由 VIP20 完全阻止"\n });')
replace('vipui.js',' window.THIRD_WORLD_VIP_PRESENTATION_VERSION=1;',' window.THIRD_WORLD_VIP_PRESENTATION_VERSION=2;')

# 5) Guide: player-facing explanation must match the actual W3 behavior.
replace('gameguide.js',
'["死亡懲罰","戰鬥失敗不會損失任何既有 EXP。正式死亡流程仍有 30% 機率遺失一件已裝備的裝備；VIP20 可以完全防止死亡時遺失裝備。"],',
'["死亡懲罰","戰鬥失敗不會損失任何既有 EXP。正式死亡流程仍有 30% 機率遺失一件已裝備的裝備；VIP20 可以完全防止死亡時遺失裝備。第三紀元仍保留這個原判定，但因進入第三紀元必須達成 VIP20，所以裝備遺失會被 VIP20 全部阻止，並在高維連戰結算中顯示保護結果。"],')
replace('gameguide.js',
'["VIP 特權","VIP2～VIP20 會依指定等級解鎖裝備、特殊怪、副本與死亡保護等特權；VIP20 為最後一個特殊特權，VIP21 以上不新增特權。"],',
'["VIP 特權","VIP2～VIP20 會依指定等級解鎖裝備、特殊怪、副本與死亡保護等特權；VIP20 為最後一個特殊特權，VIP21 以上不新增特權。進入第三紀元後，VIP20 的死亡裝備保護仍會持續生效，原本 30% 的裝備遺失判定若觸發，會由 VIP20 完全攔下。"],')

# 6) Durable integrity contracts.
replace('tests/runtime/vip-unbounded-integrity.js','assert(/VIP_UI_VERSION=3/.test(vipUi),"VIP UI 應為 V3。");','assert(/VIP_UI_VERSION=4/.test(vipUi),"VIP UI 應為 V4。");')
replace('tests/runtime/vip-unbounded-integrity.js',
'assert(/filter\\(p=>Object\\.prototype\\.hasOwnProperty\\.call\\(THIRD_WORLD_PERK_TEXT,p\\.level\\)\\)/.test(vipUi),"W3 VIP 清單應只投影目前仍適用的 canonical perk 等級。");',
'assert(/filter\\(p=>Object\\.prototype\\.hasOwnProperty\\.call\\(THIRD_WORLD_PERK_TEXT,p\\.level\\)\\)/.test(vipUi),"W3 VIP 清單應只投影目前仍適用的 canonical perk 等級。");\nassert(/20:"第三紀元死亡仍會進行原本的 30% 裝備遺失判定/.test(vipUi),"W3 VIP20 必須在玩家介面明確顯示死亡裝備保護價值。");')

replace('tests/runtime/js-integrity.js','const combatCore=read("combatcore.js");','const combatCore=read("combatcore.js");\nconst engineSource=read("engine.js");\nconst thirdWorldRun=read("thirdworldrun.js");\nconst thirdWorldPlayerFlowSource=read("thirdworldplayerflow.js");\nconst gameGuideSource=read("gameguide.js");')
marker='assert(/THIRD_WORLD_VIP_PRESENTATION_VERSION=1/.test(vipUi)&&/虛空幻境 VIP 積分 \\+10%/.test(vipUi)&&/高維主線 Boss/.test(vipUi),"W3 VIP 呈現必須按現行共用 owner 投影。");'
replacement='''assert(/THIRD_WORLD_VIP_PRESENTATION_VERSION=2/.test(vipUi)&&/虛空幻境 VIP 積分 \\+10%/.test(vipUi)&&/高維主線 Boss/.test(vipUi)&&/20:"第三紀元死亡仍會進行原本的 30% 裝備遺失判定/.test(vipUi),"W3 VIP 呈現必須按現行共用 owner 投影，並保留 VIP20 死亡保護。\");
assert(/DEATH_EQUIPMENT_LOSS_CHANCE=\\.30/.test(engineSource)&&/resolveDeathEquipmentPenalty/.test(engineSource)&&/DEATH_EQUIPMENT_PENALTY_VERSION=1/.test(engineSource),"死亡裝備懲罰必須由 engine 共用 owner 持有 30% 判定與 VIP20 保護。\");
assert(/resolveDeathEquipmentPenalty\\(\\[\\],\\{rng:typeof options\\.rng/.test(thirdWorldRun)&&/forceProtected:true/.test(thirdWorldRun)&&/vip20Protections/.test(thirdWorldRun),"W3 死亡必須共用正式死亡裝備判定，並在高維 formal flow 保證裝備不實際遺失。\");
assert(/VIP20｜裝備保護/.test(thirdWorldPlayerFlowSource)&&/原本的 30% 死亡裝備遺失判定仍照常進行/.test(thirdWorldPlayerFlowSource)&&/THIRD_WORLD_VIP20_DEATH_PROTECTION_PRESENTATION_VERSION/.test(thirdWorldPlayerFlowSource),"W3 結算必須明確呈現 VIP20 阻止裝備遺失的玩家體感。\");
assert(/第三紀元仍保留這個原判定/.test(gameGuideSource)&&/VIP20 完全攔下/.test(gameGuideSource),"遊戲說明必須明確解釋 W3 的 VIP20 死亡裝備保護。\");'''
replace('tests/runtime/js-integrity.js',marker,replacement)

# cache bust touched runtime/player JS.
for script in ['engine.js','thirdworldrun.js','thirdworldplayerflow.js','vipui.js','gameguide.js']:
    retag('index.html',script)

print('W3 VIP20 death protection patch applied')
