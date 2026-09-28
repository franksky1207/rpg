from pathlib import Path

def one(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1 match, got {c}')
    return s.replace(old,new,1)

p=Path('gameguide.js'); s=p.read_text(encoding='utf-8')
# Restore W1/W2 base guide text accidentally touched by first-pass replacement.
s=one(s,'["離線收益","離線超過 1 分鐘後可依最近有效戰鬥紀錄取得部分收益，最多計算 ${rules.offlineMaxHours.toLocaleString()} 小時。"]','["離線收益","離線超過 1 分鐘後可依最近有效戰鬥紀錄取得部分收益，最多計算 12 小時。"]','base offline text')
# W3 must consume canonical offline owner.
s=one(s,'離線只模擬裝備掉落機會，不取得 EXP、維度之弦，也不推進界弦核心、稱號、劇情或 Boss 永久 HP。最多計算 12 小時。','離線只模擬裝備掉落機會，不取得 EXP、維度之弦，也不推進界弦核心、稱號、劇情或 Boss 永久 HP。最多計算 ${rules.offlineMaxHours.toLocaleString()} 小時。','w3 offline text')
# Formal player terminology.
s=s.replace('"十名高維存在各自具有不同個體特化，詳細數值以冒險頁當前顯示為準。"','"10 名高維存在各自具有不同個體特化，詳細數值以冒險頁當前顯示為準。"')
s=s.replace('`十名高維存在各有 ${bossHp.toLocaleString()} 最大 HP','`10 名高維存在各有 ${bossHp.toLocaleString()} 最大 HP')
s=s.replace('隨10 名高維存在的整體永久 HP','隨 10 名高維存在的整體永久 HP')
# Derive equipment name-band count from the canonical name rows.
old='bossCount:Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||1)),bossMaxHp:Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1)),fivePointHpGap:Math.max(1,Math.floor(Number(window.THIRD_WORLD_FIVE_POINT_HP_GAP)||1)),maxDeaths:Math.max(1,Math.floor(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)||1)),maxStage:Math.max(0,Math.floor(Number(stage.maxStage)||0))'
new='bossCount:Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||1)),bossMaxHp:Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1)),fivePointHpGap:Math.max(1,Math.floor(Number(window.THIRD_WORLD_FIVE_POINT_HP_GAP)||1)),maxDeaths:Math.max(1,Math.floor(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)||1)),maxStage:Math.max(0,Math.floor(Number(stage.maxStage)||0)),equipmentNameBandCount:Math.max(1,Array.isArray(window.THIRD_WORLD_EQUIPMENT_NAME_ROWS)?window.THIRD_WORLD_EQUIPMENT_NAME_ROWS.length:1)'
s=one(s,old,new,'rule snapshot name bands')
s=one(s,'分成 10 個階段變化','分成 ${rules.equipmentNameBandCount} 個階段變化','name band text')
# VIP requirement comes from THIRD_WORLD_ENTRY_CONFIG.
s=one(s,'["VIP20 裝備保護",`第三紀元死亡仍會執行原本 ${rules.deathLossPercent.toLocaleString()}% 的裝備遺失判定，但進入第三紀元本來就要求 VIP${rules.vipRequired}，因此所有實際裝備遺失都會被 VIP20 阻止。高維連戰結算會顯示本輪成功阻止的次數。`]','[`VIP${rules.vipRequired} 裝備保護`,`第三紀元死亡仍會執行原本 ${rules.deathLossPercent.toLocaleString()}% 的裝備遺失判定，但進入第三紀元本來就要求 VIP${rules.vipRequired}，因此所有實際裝備遺失都會被 VIP${rules.vipRequired} 阻止。高維連戰結算會顯示本輪成功阻止的次數。`]','vip gear protection text')
p.write_text(s,encoding='utf-8')

p=Path('index.html'); s=p.read_text(encoding='utf-8')
s=one(s,'gameguide.js?v=20260928-thirdworld-guide-opt1','gameguide.js?v=20260928-thirdworld-guide-opt1fix1','gameguide cache follow-up')
p.write_text(s,encoding='utf-8')

p=Path('tests/runtime/js-integrity.js'); s=p.read_text(encoding='utf-8')
s=s.replace("gameguide.js?v=20260928-thirdworld-guide-opt1","gameguide.js?v=20260928-thirdworld-guide-opt1fix1")
anchor='assert(!/十王/.test(thirdWorldGuideSource),"玩家可見的 W3 Guide 不得使用對話簡稱『十王』，正式用語統一為 10 名高維存在。\");'
if anchor not in s: raise SystemExit('terminology assertion missing')
extra='''\nassert(!/十名高維存在/.test(thirdWorldGuideSource)&&/10 名高維存在/.test(thirdWorldGuideSource),"W3 Guide 正式玩家文字必須統一使用數字形式『10 名高維存在』。\");
assert(/rules\.offlineMaxHours\.toLocaleString\(\)/.test(thirdWorldGuideSource)&&/rules\.equipmentNameBandCount/.test(thirdWorldGuideSource),"W3 Guide 的離線上限與裝備命名階段數必須由 canonical owner 投影。\");'''
s=s.replace(anchor,anchor+extra,1)
p.write_text(s,encoding='utf-8')
print('guide optimization batch1 follow-up applied')
