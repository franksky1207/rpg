from pathlib import Path

TAG='20260928-thirdworld-ui-text-batch3'

def replace(path, old, new, count=1):
    p=Path(path); s=p.read_text(encoding='utf-8')
    actual=s.count(old)
    if actual!=count:
        raise SystemExit(f'{path}: expected {count} matches, got {actual}: {old[:140]!r}')
    p.write_text(s.replace(old,new,count),encoding='utf-8')

# thirdworlddungeonui.js: extend existing shared dungeon policy owner with presentation fields.
replace('thirdworlddungeonui.js',' const VERSION=1;',' const VERSION=2;')
replace('thirdworlddungeonui.js',
'  const result={mode:key,visible:true,enabled:true,buttonLabel:"",statusText:"",reason:"",phase:currentPhase(s)};\n  policies.forEach((checker,name)=>{try{const next=checker(key,s,{...result});if(!next||typeof next!=="object")return;if(next.visible===false)result.visible=false;if(next.enabled===false)result.enabled=false;if(typeof next.buttonLabel==="string"&&next.buttonLabel)result.buttonLabel=next.buttonLabel;if(typeof next.statusText==="string"&&next.statusText)result.statusText=next.statusText;if(typeof next.reason==="string"&&next.reason)result.reason=next.reason;}catch(error){console.error("Dungeon mode availability policy failed",name,error);result.enabled=false;result.reason="副本狀態檢查失敗，請重新整理後再試。";}});',
'  const result={mode:key,visible:true,enabled:true,buttonLabel:"",statusText:"",reason:"",titleText:null,rewardText:null,unlockText:null,descriptionText:null,phase:currentPhase(s)};\n  policies.forEach((checker,name)=>{try{const next=checker(key,s,{...result});if(!next||typeof next!=="object")return;if(next.visible===false)result.visible=false;if(next.enabled===false)result.enabled=false;if(typeof next.buttonLabel==="string"&&next.buttonLabel)result.buttonLabel=next.buttonLabel;if(typeof next.statusText==="string"&&next.statusText)result.statusText=next.statusText;if(typeof next.reason==="string"&&next.reason)result.reason=next.reason;["titleText","rewardText","unlockText","descriptionText"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(next,key)&&(next[key]===null||typeof next[key]==="string"))result[key]=next[key];});}catch(error){console.error("Dungeon mode availability policy failed",name,error);result.enabled=false;result.reason="副本狀態檢查失敗，請重新整理後再試。";}});')
replace('thirdworlddungeonui.js',
'  if(mode==="arena")return {visible:true,enabled:false,buttonLabel:"等待高維競技場開放",statusText:"高維競技場調整中",reason:"高維紀元競技場規則與戰力曲線尚未定案，既有競技場進度已完整保留。"};',
'  if(mode==="arena")return {visible:true,enabled:false,titleText:"高維競技場",rewardText:"尚未開放",unlockText:"",descriptionText:"高維競技場尚未開放。",buttonLabel:"等待高維競技場開放",statusText:"等待高維競技場開放",reason:"高維競技場目前尚未開放，既有競技場進度已保留。"};')
replace('thirdworlddungeonui.js',
'  const button=card.querySelector(".dungeon-entry-btn"),cost=card.querySelector(".dungeon-cost");\n  let note=card.querySelector("[data-dungeon-policy-note]");',
'  const button=card.querySelector(".dungeon-entry-btn"),cost=card.querySelector(".dungeon-cost"),title=card.querySelector(".dungeon-mode-head h3"),reward=card.querySelector(".dungeon-mode-reward"),unlock=card.querySelector(".dungeon-unlock-label"),description=card.querySelector("p");\n  if(policy.titleText!==null&&title)title.textContent=policy.titleText;\n  if(policy.rewardText!==null&&reward)reward.textContent=policy.rewardText;\n  if(policy.descriptionText!==null&&description)description.textContent=policy.descriptionText;\n  if(policy.unlockText!==null&&unlock){unlock.textContent=policy.unlockText;unlock.hidden=!policy.unlockText;}\n  let note=card.querySelector("[data-dungeon-policy-note]");')
replace('thirdworlddungeonui.js',' window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION=1;',' window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION=2;\n window.DUNGEON_MODE_PRESENTATION_POLICY_VERSION=1;')
replace('thirdworlddungeonui.js',' window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION=1;',' window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION=2;')

# vipui.js: retain canonical perks, project only actually active W3 perks/text in W3 UI.
replace('vipui.js',' const VIP_UI_VERSION=2;',' const VIP_UI_VERSION=3;')
anchor=''' const VIP_PERKS=[
  {level:2,text:"主線裝備掉落率 +5 個百分點"},
  {level:4,text:"所有可取得 VIP 積分的副本，VIP 積分 +10%"},
  {level:6,text:"特殊怪遭遇率 +2 個百分點"},
  {level:8,text:"主線與懸賞掉落裝備有 15% 機率優先目前最弱部位"},
  {level:10,text:"特殊怪特殊獎勵有 10% 機率再次發動一次"},
  {level:12,text:"所有可取得 VIP 積分的副本，VIP 積分總加成提升為 +20%"},
  {level:14,text:"主線與懸賞掉落裝備有 5% 機率品質 +1 階"},
  {level:16,text:"主線 Boss 有 15% 機率額外掉落 1 件裝備"},
  {level:18,text:"主線 Boss 掉落裝備有 10% 機率品質 +1 階"},
  {level:20,text:"死亡時不再遺失裝備"}
 ];'''
replace('vipui.js',anchor,anchor+'''
 const THIRD_WORLD_PERK_TEXT=Object.freeze({
  4:"虛空幻境 VIP 積分 +10%",
  8:"高維主線掉落裝備有 15% 機率優先目前最弱部位",
  12:"虛空幻境 VIP 積分總加成提升為 +20%",
  14:"高維主線掉落裝備有 5% 機率品質 +1 階",
  16:"高維主線 Boss 有 15% 機率額外掉落 1 件裝備",
  18:"高維主線 Boss 掉落裝備有 10% 機率品質 +1 階"
 });
 function currentPhase(){const s=typeof state!=="undefined"?state:null;return typeof window.currentWorldPhase==="function"?window.currentWorldPhase(s):(s?.thirdWorld?.entered===true?3:(s?.secondWorld?.entered===true?2:1));}
 function perksForPhase(phase=currentPhase()){
  if(Number(phase)!==3)return VIP_PERKS.slice();
  return VIP_PERKS.filter(p=>Object.prototype.hasOwnProperty.call(THIRD_WORLD_PERK_TEXT,p.level)).map(p=>({...p,text:THIRD_WORLD_PERK_TEXT[p.level]}));
 }''')
replace('vipui.js',
'  const lv=vipLevel(),points=vipPoints(),bonus=vipBonusStats(lv),nextPerk=VIP_PERKS.find(x=>x.level>lv)?.level||null;\n  const status=`VIP${lv}｜${points.toLocaleString()} / ${nextThreshold(lv).toLocaleString()}`;',
'  const lv=vipLevel(),points=vipPoints(),bonus=vipBonusStats(lv),phase=currentPhase(),perks=perksForPhase(phase),nextPerk=perks.find(x=>x.level>lv)?.level||null;\n  const status=`VIP${lv}｜${points.toLocaleString()} / ${nextThreshold(lv).toLocaleString()}`;\n  const phaseNote=phase===3?`<div class="muted" style="margin-top:10px;line-height:1.55">第三紀元僅顯示目前仍適用的特殊特權；銀河／宇宙紀元特權仍保留於原紀元規則。</div>`:"";')
replace('vipui.js','${perkComplete}</div><div class="vip-perk-list">${VIP_PERKS.map(p=>','${perkComplete}${phaseNote}</div><div class="vip-perk-list">${perks.map(p=>')
replace('vipui.js',' window.VIP_UI_VERSION=VIP_UI_VERSION;',' window.vipPerksForPhase=perksForPhase;\n window.THIRD_WORLD_VIP_PERK_TEXT=THIRD_WORLD_PERK_TEXT;\n window.THIRD_WORLD_VIP_PRESENTATION_VERSION=1;\n window.VIP_UI_VERSION=VIP_UI_VERSION;')

# vip-unbounded integrity: preserve canonical unlimited behavior and lock W3 presentation projection.
replace('tests/runtime/vip-unbounded-integrity.js','assert(/VIP_UI_VERSION=2/.test(vipUi),"VIP UI 應為 V2。");','''assert(/VIP_UI_VERSION=3/.test(vipUi),"VIP UI 應為 V3。");
assert(/THIRD_WORLD_VIP_PRESENTATION_VERSION=1/.test(vipUi),"W3 VIP 呈現 policy 應存在。");
assert(/虛空幻境 VIP 積分 \+10%/.test(vipUi)&&/虛空幻境 VIP 積分總加成提升為 \+20%/.test(vipUi),"W3 VIP4／12 僅應描述共用虛空積分。");
assert(/高維主線掉落裝備有 15% 機率優先目前最弱部位/.test(vipUi)&&/高維主線 Boss 有 15% 機率額外掉落 1 件裝備/.test(vipUi),"W3 VIP 裝備特權文案應對齊現行高維掉落 owner。");
assert(/filter\(p=>Object\.prototype\.hasOwnProperty\.call\(THIRD_WORLD_PERK_TEXT,p\.level\)\)/.test(vipUi),"W3 VIP 清單應只投影目前仍適用的 canonical perk 等級。");''')

# runtime integrity: durable W3 dungeon/VIP ownership and cache assertions.
replace('tests/runtime/js-integrity.js','const thirdWorldUi=read("thirdworldui.js");','const thirdWorldUi=read("thirdworldui.js");\nconst thirdWorldDungeonUi=read("thirdworlddungeonui.js");\nconst thirdWorldLoot=read("thirdworldloot.js");\nconst vipUi=read("vipui.js");')
marker='assert(pos("viplootcore.js")>pos("vipprogression.js")&&pos("viplootcore.js")<pos("traitdrop.js")&&pos("viplootcore.js")<pos("dungeonbounty.js")&&pos("viplootcore.js")<pos("combatcore.js"),"viplootcore.js 必須在 VIP progression 後、正式掉裝 consumer 前載入。");\n'
extra='''assert(/const VERSION=2;/.test(thirdWorldDungeonUi)&&/DUNGEON_MODE_PRESENTATION_POLICY_VERSION=1/.test(thirdWorldDungeonUi),"W3 副本 adapter 應提供 V2 共用呈現 policy。");
assert(/mode==="bounty"\)return \{visible:false,enabled:false/.test(thirdWorldDungeonUi),"W3 懸賞必須隱藏。");
assert(/titleText:"高維競技場"/.test(thirdWorldDungeonUi)&&/rewardText:"尚未開放"/.test(thirdWorldDungeonUi)&&/buttonLabel:"等待高維競技場開放"/.test(thirdWorldDungeonUi),"W3 競技場必須只顯示高維未開放 placeholder。");
assert(/wrapEntry\("enterBountyDungeon","bounty"\)/.test(thirdWorldDungeonUi)&&/wrapEntry\("enterVoidMirageDungeon","tower"\)/.test(thirdWorldDungeonUi),"W3 必須沿用共用副本入口 guard，不能另建平行 owner。");
assert(/THIRD_WORLD_VIP_PRESENTATION_VERSION=1/.test(vipUi)&&/虛空幻境 VIP 積分 \+10%/.test(vipUi)&&/高維主線 Boss/.test(vipUi),"W3 VIP 呈現必須按現行共用 owner 投影。");
assert(/resolveVipLootModifiers/.test(thirdWorldLoot)&&/vipLootBossExtraDropTriggered/.test(thirdWorldLoot),"W3 VIP8／14／16／18 必須保持共用 VIP loot owner。");
assert(index.includes('vipui.js?v=20260928-thirdworld-ui-text-batch3')&&index.includes('thirdworlddungeonui.js?v=20260928-thirdworld-ui-text-batch3'),"W3 Batch 3 touched JS 必須同步 cache-bust。");
'''
replace('tests/runtime/js-integrity.js',marker,marker+extra)

# index cache bust only touched JS.
replace('index.html','vipui.js?v=20260926-vip-unbounded-final1',f'vipui.js?v={TAG}')
replace('index.html','thirdworlddungeonui.js?v=20260926-thirdworld-entry-opt2',f'thirdworlddungeonui.js?v={TAG}')

print('batch 3 patch applied')
