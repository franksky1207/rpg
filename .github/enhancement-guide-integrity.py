from pathlib import Path

p=Path('gameguide.js');s=p.read_text()
marker='   ["死亡懲罰","戰鬥失敗會損失部分目前 EXP，並有機會遺失一件已裝備的裝備。遺失的裝備會進入背包的「遺失裝備贖回」，可以花費金幣取回，或選擇永久放棄。戰鬥結束後 HP 會回滿。VIP20 可以防止死亡時遺失裝備，但 EXP 懲罰仍會發生；Lv500 因為已無一般 EXP 累積，所以沒有 EXP 死亡損失。"]'
extra='   ["死亡懲罰","戰鬥失敗會損失部分目前 EXP，並有機會遺失一件已裝備的裝備。遺失的裝備會進入背包的「遺失裝備贖回」，可以花費金幣取回，或選擇永久放棄。戰鬥結束後 HP 會回滿。VIP20 可以防止死亡時遺失裝備，但 EXP 懲罰仍會發生；Lv500 因為已無一般 EXP 累積，所以沒有 EXP 死亡損失。"],\n   ["裝備欄位強化","武器、頭盔、鎧甲、鞋子、飾品五個欄位都可永久強化至 +20；每級只提高目前裝備原始主能力 2.5%，+20 共提高 50%。強化屬於欄位，更換或戰敗遺失裝備都不會失去強化等級，裝備評分也不計入強化值。"],\n   ["強化石","普通怪固定掉落基礎強化石，菁英怪掉落 1～2 顆基礎強化石，Boss 固定掉落進階強化石；玩家高於怪物 10 級（含）以上時不會掉落強化石。傳說裝備出售時另得 5 顆基礎強化石，神話裝備手動出售時另得 1 顆進階強化石。特殊怪與副本不掉落強化石。"],\n   ["離線強化石","符合等級差條件時，離線刷普通怪或菁英怪可取得理論基礎強化石的 5%，整段離線收益合計後再取整數；離線不會取得進階強化石。"]'
assert marker in s
p.write_text(s.replace(marker,extra,1))

p=Path('enhancementfinalize.js');s=p.read_text();a=s.index('\n // 在「角色與裝備」說明頁直接補入強化規則');b=s.index('\n // 強化專屬回歸檢查',a);p.write_text(s[:a]+s[b:])

p=Path('runtimeintegrity.js');s=p.read_text();needle=' if(Number(window.SPECIALIZATION_MAX_LEVEL)!==60)fail("SPECIALIZATION_MAX_LEVEL",`專精上限應為 60，實際 ${window.SPECIALIZATION_MAX_LEVEL}`);'
insert=needle+'\n if(Number(window.ENHANCEMENT_MAX_LEVEL)!==20)fail("ENHANCEMENT_MAX_LEVEL",`強化上限應為 20，實際 ${window.ENHANCEMENT_MAX_LEVEL}`);\n if(Number(window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL)!==2.5)fail("ENHANCEMENT_RATE",`強化每級主能力應為 2.5%，實際 ${window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL}`);\n if(typeof window.enhancementUpgradeCost!=="function"||window.enhancementUpgradeCost(20)?.basic!==2000||window.enhancementUpgradeCost(20)?.advanced!==100)fail("ENHANCEMENT_COST20","強化 +20 成本應為基礎 2000、進階 100");\n if(typeof window.enhancementStoneEligible!=="function"||window.enhancementStoneEligible(115,105)!==false||window.enhancementStoneEligible(115,106)!==true)fail("ENHANCEMENT_LEVEL_GAP","強化石 10 級差邊界異常");\n if(typeof window.enhancementStoneSaleReward!=="function"||window.enhancementStoneSaleReward({q:4})?.basic!==5||window.enhancementStoneSaleReward({q:5})?.advanced!==1)fail("ENHANCEMENT_SALE_REWARD","傳說／神話出售強化石規則異常");\n if(typeof window.equippedStatsWithEnhancementLevels!=="function")fail("ENHANCEMENT_STATS_API","指定強化等級能力計算 API 未載入");\n if(typeof window.gmTestEnhancedEquippedStats!=="function"||typeof window.gmUseCurrentEnhancementTestStatus!=="function")fail("ENHANCEMENT_GM_API","GM 強化測試 API 未載入");'
assert needle in s
s=s.replace(needle,insert,1).replace('"遺失裝備贖回","黑市情報"]','"遺失裝備贖回","黑市情報","裝備欄位強化","玩家高於怪物 10 級（含）以上時不會掉落強化石","離線刷普通怪或菁英怪可取得理論基礎強化石的 5%"]',1)
p.write_text(s)

p=Path('index.html');s=p.read_text().replace('gameguide.js?v=20260915-guide-v8','gameguide.js?v=20260915-enhancement-guide1').replace('enhancementfinalize.js?v=20260915-enhancement-batch5','enhancementfinalize.js?v=20260915-enhancement-integrity1').replace('runtimeintegrity.js?v=20260915-runtime-integrity','runtimeintegrity.js?v=20260915-enhancement-integrity1');p.write_text(s)

assert '裝備欄位強化' in Path('gameguide.js').read_text()
assert 'const baseGuide=window.gameGuidePage' not in Path('enhancementfinalize.js').read_text()
assert 'ENHANCEMENT_GM_API' in Path('runtimeintegrity.js').read_text()
print('verified')