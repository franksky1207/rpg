# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 本文件只是跨對話承接層。若本文、歷史對話、記憶、舊規格、舊截圖或先前回答與 `main` 衝突，一律以目前 `main` 為準。

更新日期：**2026-09-11**。

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 技術：純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `SAVE_VERSION = 8`
- `MAX_LEVEL = 100`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 正式世界：20 張地圖、Lv1～100
- 桌機、手機皆支援；iPhone Safari 是重要真機環境，但 GitHub 寫入成功不能視為已完成 Safari 真機驗證。

定位：**簡單、傳統、文字型 RPG**。

正式主要系統：
- 主線冒險
- 裝備／品質／主能力／詞條／評分
- 裝備鎖定、自動出售、一鍵換裝、一鍵出售
- 7 種怪物特性
- 9 種特殊怪
- 懸賞戰／競技場／虛空幻境
- VIP0～20
- 8 項專精 Lv0～30
- 商店／遺失裝備贖回
- 遊戲說明
- 本機自動存檔、匯出／匯入
- Save Schema migration
- GM 管理與大量模擬測試

目前不要主動加入職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者明確要求。

---

## 2. 下一個 ChatGPT 的修改規範

1. **修改前一定重新讀目前 `main` 的相關正式檔案與 `index.html`。** 不可只靠這份 handoff 或聊天記憶。
2. 使用者說「做／修改／修正／執行／做吧／好」且需求已明確時，可以直接修改 GitHub `main`。
3. 使用者說「先不要改／先討論／先建議／你覺得／先想想」時，只能分析，**不得寫 GitHub**。
4. 優先修改真正的正式來源；**不要再額外建立 wrapper、fallback、第二套公式、第二套 UI 或 alias 來蓋舊程式**，除非現有架構真的無法安全直接改。
5. 每個 `.js` / `.css` 修改後，都必須同步更新 `index.html` 對應 cache-bust。
6. 修改完成後重新讀回**每個修改檔**；若有 JS/CSS 變更，再重新讀完整 `index.html` 確認載入順序與 cache-bust。
7. 涉及公式、狀態或跨模組流程時，修改前先搜尋引用點，避免只改其中一份。
8. GitHub API 回報成功只代表 `main` 已寫入；除非使用者實際回報，不可宣稱 GitHub Pages、桌機瀏覽器或 iPhone Safari 已真機驗證。
9. 新需求若與本 handoff 衝突，以重新讀到的 `main` 為準，並在下一次更新 handoff 時修正本文件。

---

## 3. 目前 `index.html` 正式載入順序

```text
data.js
worldmaps-earth.js
worldmaps-solar.js
engine.js
specialization.js
combatcore.js
dungeonprogress.js
savemigration.js
dungeoncore.js
gameguide.js
ui.js
hpflow.js
vipui.js
settlementui.js
balance.js
traits.js
traitlock.js
traitdrop.js
gmtools.js
shopbalance.js
gearupgrade.js
equipmentlock.js
specialmonsters.js
dungeonbounty.js
dungeonarena.js
dungeonvoid.js
dungeonvoidui.js
levelcap.js
specialcore.js
vipgm.js
specialgmbatch.js
dungeongm.js
gmhub.js
dungeonvoidgmmanage.js
dungeonvoidgmui.js
level100balance.js
specialencounter.js
combatpacing.js
battlepipeline.js
specialguide.js
levelcapresult.js
dungeonui.js
adventureprogressui.js
combatfx.js
```

目前 cache-bust（以 `index.html` 為準）：

```text
data.js?v=20260911-2335-savev8
worldmaps-earth.js?v=20260908-2247b2
worldmaps-solar.js?v=20260908-2247b2
engine.js?v=20260911-1905-introgear
specialization.js?v=20260911-1745-stability12
combatcore.js?v=20260911-1045-speccleanup
dungeonprogress.js?v=20260911-2335-savev8
savemigration.js?v=20260911-2335-savev8
dungeoncore.js?v=20260911-2055-postheal2
gameguide.js?v=20260911-2115-postheal3
ui.js?v=20260911-1605-uipolish1
hpflow.js?v=20260911-2335-savev8
vipui.js?v=20260910-2245-vipcleanup
settlementui.js?v=20260911-2145-specialflow3
balance.js?v=20260910-0850
traits.js?v=20260909-2245
traitlock.js?v=20260907-2033
traitdrop.js?v=20260910-1910-vip3
gmtools.js?v=20260911-1045-speccleanup
shopbalance.js?v=20260911-1620-shopcooldown
gearupgrade.js?v=20260911-2355-refactor3
equipmentlock.js?v=20260911-2355-refactor3
specialmonsters.js?v=20260911-1045-speccleanup
dungeonbounty.js?v=20260911-1605-uipolish1
dungeonarena.js?v=20260911-1605-uipolish1
dungeonvoid.js?v=20260911-2055-postheal2
dungeonvoidui.js?v=20260911-2115-postheal3
levelcap.js?v=20260909-2305
specialcore.js?v=20260911-0818-spec3
vipgm.js?v=20260910-2245-vipcleanup
specialgmbatch.js?v=20260911-2055-postheal2
dungeongm.js?v=20260911-1045-speccleanup
gmhub.js?v=20260911-1045-speccleanup
dungeonvoidgmmanage.js?v=20260909-0915
dungeonvoidgmui.js?v=20260911-1645-voiduipolish
level100balance.js?v=20260908-2325
specialencounter.js?v=20260911-2055-postheal2
combatpacing.js?v=20260911-1945-combatspeed1
battlepipeline.js?v=20260911-2055-postheal2
specialguide.js?v=20260911-2115-postheal3
levelcapresult.js?v=20260908-0803
dungeonui.js?v=20260911-1045-speccleanup
adventureprogressui.js?v=20260909-2245
combatfx.js?v=20260911-1415-nobattlelog
```

重要依賴：
- `gameguide.js` 在 `ui.js` 前。
- `savemigration.js` 在 `ui.js` 真正執行 `load()` 前安裝 load migration。
- `hpflow.js` 在 `ui.js` 後，現階段仍負責部分正式 UI／回血 override 與匯入 migration 接線。
- `gearupgrade.js` 在 `equipmentlock.js` 前；目前 `gearupgrade.js` 只保留評分／升級判斷工具，正式裝備異動由 `equipmentlock.js` 最終負責。
- `combatpacing.js` 在特殊遭遇後、主線 pipeline 前調整動畫節奏。
- `combatfx.js` 最後載入，只做 presentation，不應改戰鬥數值。

---

## 4. 世界、主線與推進

每張地圖 5 級，固定：
- 普通怪 1
- 普通怪 2
- 普通怪 3
- 菁英
- Boss

正式推進：

```text
普通1 ×10 → 普通2 ×10 → 普通3 ×10 → 菁英 ×10 → 達該圖最高等級 → Boss
```

Boss：
- 固定單場。
- 第一次勝利解鎖下一張地圖。
- 第一次勝利同時對新地圖做一次免費商店刷新。
- 已擊敗 Boss 可再次挑戰。
- Boss 戰敗會鎖定，`bossProgress=0`；需重新擊敗本圖菁英 10 次才能再次挑戰。

連戰解鎖：

```text
Lv1   → 1 場
Lv6   → 5 場
Lv11  → 10 場
Lv16  → 15 場
Lv21  → 20 場
Lv26+ → 25 場
Boss  → 永遠 1 場
```

主線連戰中途死亡：前面已拿到的 EXP、金幣、掉落與副本進度全部保留；剩餘連戰取消。

---

## 5. 玩家基礎公式、EXP、金幣與傷害

玩家基礎：

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

EXP／金幣：

```js
sameExp(l) = ceil(25 + 4*l)
expNeed(l) = ceil(sameExp(l) * (4.5 + 0.35*l + 0.023*l*l))
goldBase(l)= ceil(6 + 4*l)
sellBase(l)= ceil(12 + 8*l)
```

怪物等級差 EXP 倍率 `expLevelFactor(monsterLevel, playerLevel)`：

```text
差 >= +5 → 1.30
差 >= +3 → 1.20
差 >= +1 → 1.10
差 =   0 → 1.00
差 >= -2 → 0.90
差 >= -5 → 0.60
差 >=-10 → 0.25
更低     → 0.05
```

傷害：

```js
calcDamage(atk, def)
= max(1, ceil((atk - def*0.55) * random(0.95~1.05)))
```

暴擊傷害倍率：`1.5`。

Lv100：
- 不再累積 EXP。
- 若一場一般／菁英／Boss 戰鬥**開始時已經 Lv100**，該場原 EXP 以 1:1 轉成金幣。
- 特殊怪使用 `specialExpPayout()`，滿等同樣 1:1 轉金幣。
- 玩家說明用語是「在下一等級階段開放前」。

---

## 6. 主線怪物正式平衡公式

正式來源：`balance.js`。

基礎：

```js
monsterBase(level) = {
  hp:  ceil(55 + 24*level),
  atk: ceil(9 + 4.2*level),
  def: ceil(2.5 + 2.0*level)
}
```

style：

```text
tank   → HP ×1.15，ATK ×0.95
attack → HP ×0.92，ATK ×1.10
```

同圖 5 階段倍率：

```text
第1怪：HP 1.22 / ATK 1.17 / DEF 1.10
第2怪：HP 1.31 / ATK 1.24 / DEF 1.14
第3怪：HP 1.34 / ATK 1.28 / DEF 1.15
菁英 ：HP 1.39 / ATK 1.29 / DEF 1.17
Boss ：HP 1.44 / ATK 1.27 / DEF 1.17
```

平衡哲學保持：主線是成長／刷資源／刷裝備，不因 VIP／專精自動再次膨脹怪物。

---

## 7. 裝備系統

部位：

```text
weapon / helmet / armor / shoes / accessory
```

主要能力：
- 武器：ATK
- 頭盔：HP
- 鎧甲：DEF
- 鞋子：HP
- 飾品：Crit

品質：普通／優良／稀有／史詩／傳說／神話。

品質能力倍率 `m`：

```text
普通 1.00
優良 1.15
稀有 1.35
史詩 1.60
傳說 1.95
神話 2.40
```

售價倍率 `sm`：

```text
普通 1
優良 1.4
稀有 2
史詩 3.2
傳說 5
神話 8
```

基礎售價／購買價：

```js
sell = ceil(sellBase(level) * QUALITY[q].sm)
buy  = ceil(sell * 3.5)
```

主要能力公式：

```text
武器 ATK：ceil((3 + 1.55*level) * qualityMultiplier)
頭盔 HP ：ceil((8 + 2.5*level) * qualityMultiplier)
鎧甲 DEF：ceil((1 + 0.65*level) * qualityMultiplier)
鞋子 HP ：ceil((8 + 2.5*level) * qualityMultiplier)
飾品 Crit：依品質固定區間隨機
```

飾品 Crit 區間：

```text
普通 1~2
優良 2~3
稀有 3~5
史詩 5~7
傳說 7~9
神話 9~10
```

詞條數：

```text
普通 0
優良 1
稀有 1~2
史詩 2
傳說 2~3
神話 3
```

裝備評分：

```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP + Crit*rateWeight + Dodge*rateWeight
```

---

## 8. 裝備取得、鎖定、出售與近期重構

目前正式責任分工：

### `gearupgrade.js`
只保留：
- `gearActualDelta()`
- `isActualGearUpgrade()`
- `actualEquipmentContribution()`
- `weakestEquipmentTypes()`

**不再重寫 `addItem / equipBestAll / sellLowerAll`。**

### `equipmentlock.js`
目前是裝備資料異動的最終正式層，負責：
- `locked` 正規化
- `isGearLocked()`
- `shouldAutoSellItem()`
- `handleUnequippedItem()`
- 正式 `addItem()`
- 手動換裝
- 一鍵裝備最佳裝備
- 手動出售
- 一鍵出售較低／同能力裝備
- 遺失裝備放棄保護
- 鎖定 UI
- 換裝後滿血

規則：
- 神話裝備**永不自動出售**。
- `locked=true` 的裝備不會被自動出售、一鍵出售、手動出售。
- 神話仍可手動出售，但必須二次確認。
- 開啟「若新裝備比目前裝備強，自動保留」時，評分更高掉落會優先保留。
- 換下來的舊裝備會走 `handleUnequippedItem()`；若符合自動出售品質且未鎖定，直接轉金幣。
- 一鍵裝備最佳裝備也使用同一套換下裝備處理。
- 所有非戰鬥換裝後，會依新最大 HP 回滿，避免換了 HP 裝後出現 `500/550` 再低血開戰。
- 結算頁「立即裝備」也會在換裝後回滿；目前這部分仍由 `equipmentlock.js` 對 `settlementui.js` 的入口做一層後處理，屬尚待收斂的技術債。

鑑價專精實際售價一律走：

```js
specializationSellValue(item, useTestSpecializations=false)
```

---

## 9. 新角色與開場

`newState()` 現在會直接給新角色一整套 **Lv1 普通裝備**，五個部位都有。

新角色：`introSeen=false`；由 `settlementui.js` 建立開場 modal。

舊存檔若不存在 `introSeen`，Save v8 migration 會視為 `true`，避免老玩家升版後重新看到第一次開場。

---

## 10. 主線掉裝與品質升階

基礎掉裝率：

```text
普通 25%
菁英 60%
Boss 100%
```

VIP2：在上述掉落率上 +5 個百分點，最高 100%。

基礎品質表 `qualityRoll()`：

```text
普通怪：普通50 / 優良30 / 稀有15 / 史詩4 / 傳說0.9 / 神話0.1
菁英  ：普通35 / 優良35 / 稀有20 / 史詩8 / 傳說1.8 / 神話0.2
Boss  ：普通0  / 優良45 / 稀有35 / 史詩15 / 傳說4.5 / 神話0.5
```

主線品質升階來源彼此獨立：
- 1 trait：15% 機率 +1 品質
- 2 traits：30% 機率 +1 品質
- VIP14：5% 機率 +1 品質
- Boss + VIP18：10% 機率 +1 品質
- 神話封頂；只記錄實際成功提升的階數。

VIP8：15% 機率把掉落部位指定為目前最弱裝備部位。

VIP16：Boss 有 15% 機率額外再掉 1 件裝備。

---

## 11. 怪物特性

7 種：

```text
強壯 strong     → HP +20%
兇猛 ferocious  → ATK +15%
堅硬 hard       → DEF +20%
迅捷 swift      → Dodge +8 個百分點
致命 deadly     → Crit +8 個百分點
狂暴 berserk    → HP <50% 時 ATK +20%
巨體 giant      → HP +30%、ATK +5%、Dodge -5 個百分點
```

怪物 Crit / Dodge 最終上限皆為 30%。

主線 trait 數量機率：

```text
普通：0 trait 70%、1 trait 25%、2 traits 5%
菁英：0 trait 35%、1 trait 50%、2 traits 15%
Boss：0 trait 15%、1 trait 55%、2 traits 30%
```

`traitlock.js`／預覽 cache 用來避免 re-render 洗主線 traits。

---

## 12. VIP 系統

VIP0～20。

門檻：

```js
vipThreshold(level) = 1000 * level^2
```

每 VIP1：

```text
HP +0.5%
ATK +0.5%
DEF +0.25%
Crit +0.25 個百分點
Dodge +0.25 個百分點
```

偶數 VIP 特權：

```text
VIP2  主線裝備掉落率 +5 個百分點
VIP4  副本進度 +10%
VIP6  特殊怪遭遇率 +2 個百分點
VIP8  主線掉落 15% 優先最弱部位
VIP10 特殊怪特殊獎勵 10% 再發動一套全新獎勵
VIP12 副本進度總加成提高為 +20%
VIP14 主線掉落 5% 品質 +1
VIP16 Boss 15% 額外掉 1 件裝備
VIP18 Boss 掉落 10% 品質 +1
VIP20 死亡不遺失裝備；EXP 懲罰仍存在
```

VIP 等級只會往上解鎖；降低目前積分不會自動降已解鎖 VIP 等級。GM 有獨立「重置 VIP」功能。

---

## 13. 專精系統

8 項、Lv0～30，金幣永久升級，沒有材料、失敗或重置機制。

升級到目標等級 `n` 的成本：

```js
1000 * n^2
```

玩家說明不公開成本公式。

8 項：

```text
實戰訓練 training     → 每級 EXP +5%
搜刮技巧 scavenge     → 每級怪物直接金幣 +5%
鑑價技巧 appraisal    → 每級裝備售價 +5%
先制技巧 initiative   → 每級第一擊傷害 +2%
連擊技巧 combo        → 每級連擊率 +1%；追加攻擊 50%，可再次連擊
穿透技巧 penetration  → 每級穿透率 +1%；觸發時忽略敵人 25% DEF
反擊技巧 counter      → 每級反擊率 +1%；反擊傷害 40%
汲取技巧 drain        → 每級汲取率 +1%；回復本次實際傷害 10%
```

戰鬥細節：
- 先制是「每名敵人的第一次玩家主動正常攻擊」。
- 連擊可連鎖。
- 穿透可作用於 normal／combo／counter。
- 反擊只在敵人真的造成有效傷害且玩家仍存活時判定。
- counter 本身可暴擊／穿透／汲取／再觸發 combo；不會遞迴觸發 counter。
- 汲取以 `actualDamage` 計算，且不能超過最大 HP。

穩定性：專精升級有短暫 action lock，且確認後再次檢查升級前等級與金幣，避免快速連點重複升級／扣款。

---

## 14. 共用戰鬥核心與 structured events

正式核心：

```js
runCombatCore(player, enemy, startHp, options)
```

回傳至少包含：
- `win`
- `hp`（真實戰鬥結束 HP）
- `enemyHp`
- `turns`
- `logs`
- `events`
- `e`

structured events 已有：
- `attack`
- `dodge`
- `combo`
- `counter`
- `drain`
- `berserk`

**玩家可見的持久戰鬥紀錄已取消。**

但主線、特殊怪、懸賞、競技場、虛空的多個動畫流程仍解析 `logs` regex，所以底層 `logs` 暫時不能直接刪除。

`combatfx.js` 只負責浮字 presentation：先制、連擊、穿透、反擊、汲取、狂暴、回血等，不應改核心數值。

---

## 15. 戰鬥動畫節奏

`combatpacing.js` 是 presentation-only。

主線目前：

```text
開始 120ms
出手 windup 70ms
普通動作 115ms
Boss 動作 160ms
結束 170ms
```

特殊戰鬥在 `maybeHandleSpecialEncounter()` 期間把原動畫 sleep 做映射：

```text
180 → 120
120 → 70
190 → 115
220 → 135
250 → 170
```

特殊遭遇警報本身 `850 + 140ms` 不受這個映射影響。

---

## 16. 統一回血規則（2026-09-11 最新）

正式玩家體感規則：

**除了競技場三連戰場間之外，戰鬥完成後角色會恢復到滿 HP。**

目前實作：
- 主線／Boss：每一場主線打完、先保存真實 `combatEndHp` 與副本進度資料，再 `restorePlayerHp()`；下一場自然滿血。
- 特殊怪：特殊戰鬥勝敗後回滿。
- 懸賞：整個單場 run 結束由 `finishDungeonRun()` 回滿。
- 競技場：第1→第2→第3場**場間不回血**；整組全通或失敗後才 `finishDungeonRun()` 回滿。
- 虛空：每層勝利後 `runFullHeal()`，再進下一層；整趟失敗／退出最後也透過副本結束流程保證滿血。
- 舊存檔載入時，`hpflow.js` 會把非戰鬥狀態校正成目前最大 HP。
- 非戰鬥換裝後會回滿新的最大 HP。

已刪除的舊規則：
- 特殊遭遇「主線戰後 HP 低於 30% 不觸發」已完全取消。
- 玩家按鈕正式顯示「開始戰鬥／挑戰 Boss」，不是「回血並開始戰鬥」。
- 虛空玩家規則是「每層**戰後**回血」，不是「每層開始前回血」。

重要安全原則：
- 需要統計真實戰後血量時，必須使用 `combatEndHp` 或 `runCombatCore().hp`，**不能在回血後讀 `state.hp`**。
- GM 平均剩餘 HP、主線副本進度等都必須遵守這條。

---

## 17. 死亡懲罰

死亡 EXP 懲罰：

```js
loss = ceil(expNeed(state.level) * 0.10)
actual = min(state.exp, loss)
```

非 VIP20：
- 每次死亡對目前穿戴裝備有 30% 機率遺失 1 件。
- 遺失後進入 `state.lostGear`。
- 贖回價格：`ceil(item.buy * 2)`。

VIP20：若原本抽中掉裝，改為 `protectedByVip20=true`，不掉裝。

目前 `applyDeathPenalty()` 自己仍會補滿 HP，外層主線／特殊流程也有統一戰後回血，因此這裡存在**重複但目前安全**的回血責任，列入待整理技術債。

`gainExp()` 升級時目前也會補滿 HP；在戰後回血規則下同樣屬重複但安全。

---

## 18. 特殊遭遇最新流程

基礎遭遇率：`8%`；VIP6 後 `10%`。

每次符合條件的主線勝利後都可獨立檢查，所以一次 25 連戰理論上可以觸發**多次**特殊遭遇；不可偷加「每次指令最多一次」限制。

資格：
- 主線該場必須勝利。
- Boss 不觸發。
- 若 `玩家等級 - 主線怪等級 >= 10`，不觸發。
- **沒有 HP 30% 條件。**

流程：

```text
主線戰鬥勝利
→ 記錄主線戰後真實 HP / 副本進度 / 主線獎勵
→ 主線戰後回滿 HP
→ 判斷特殊遭遇
→ 若觸發：顯示明顯警報
→ 自動進特殊戰鬥（沒有略過、沒有手動確認挑戰）
→ 特殊勝利：戰後回滿 → 繼續剩餘主線連戰
→ 特殊失敗：死亡懲罰 → 戰後回滿 → 本次整段連戰立即結束
```

警報：
- `⚠ 特殊遭遇！`
- `偵測到異常敵影`
- `「特殊怪名稱」出現！`

---

## 19. 9 種特殊怪正式資料

基礎權重：

```text
稀有資源聚合體 18
誘餌補給艙     14
終止協議單元    4
機率增幅信標   16
封存警戒機     12
裝備保全單元   12
黑市武裝頭目    9
戰利品回收者    9
流動交易代理人  6
```

主要獎勵：

```text
稀有資源聚合體：EXP ×0.5、金幣 ×6、不掉裝
誘餌補給艙：必掉裝；品質表 [0,0,65,27,7,1]
終止協議單元：EXP ×4、金幣 ×4、必掉裝；品質表 [0,0,0,65,30,5]
機率增幅信標：EXP ×0.8、金幣 ×0.8、必掉裝、一般怪品質表
封存警戒機：EXP ×4、金幣 ×0.5
裝備保全單元：必掉裝、弱部位優先 70/30、品質表 [10,35,35,16,4,0]
黑市武裝頭目：金幣 ×2.5、商店刷新價格降低 1 級
戰利品回收者：必掉 2 件、一般怪品質表
流動交易代理人：財富（金幣 ×5）／知識（EXP ×5）／裝備（必掉且至少稀有）三選一
```

特殊怪基礎敵人由玩家**不含 VIP 的裝備基準**建立，再依 tier 加倍率；VIP／專精不拿來反向膨脹敵人。

基礎：

```js
baseDef       = ceil(playerAtk * 0.45)
playerHit     = max(1, playerAtk - baseDef*0.55)
baseHP        = ceil(playerHit * 6)
baseDamage    = playerHP / 8
```

Tier：

```text
low ：HP .55 / Damage .45 / DEF .55；低 Crit/Dodge
mid ：HP 1.00 / Damage 1.15 / DEF .86；較高 Crit/Dodge
high：HP 1.05 / Damage 1.22 / DEF .90；最高 Crit/Dodge
```

特殊怪獎勵 EXP／金幣仍會套用測試或正式 training／scavenge 專精。

VIP10 每次特殊怪勝利有 10% 機率取得**另一套重新 roll 的完整特殊獎勵**，不是把第一份單純乘二。

---

## 20. 主線＋特殊遭遇結算 UI

`settlementui.js`：
- 戰鬥結算 modal 可捲動，適配手機高度。
- 主線掉落放在可捲動裝備清單。
- 若掉落比目前同槽裝備強，可直接「立即裝備」。
- 換下裝備若符合自動出售條件，結算頁會顯示「換下裝備已自動出售 +X 金幣」。

當一次主線指令內有特殊遭遇時，最後正式結算拆成：

```text
主線戰鬥
特殊遭遇
```

`ctx.specialEncounters` 會逐筆列出，所以同一個 25 連戰發生多次特殊怪時，每一隻都會個別顯示。

特殊怪失敗時立即顯示結算；畫面會同時保留前面主線收益與此前已成功的特殊遭遇資料。

目前刻意沒有「總收益」聚合卡，避免自動出售、即時換裝等情況讓總額語意混亂。

---

## 21. 商店最新規則

刷新成本：

```text
100 → 200 → 400 → 800 → 1600 → 3200 → 6400 → 12800
```

- 最高 12,800。
- 到最高階可手動重置回 100；冷卻 1 小時。
- 冷卻依裝置 `Date.now()`，商店頁每秒更新倒數，到點自動解鎖重置按鈕。
- 買 1 件商品後刷新成本降低 1 級。
- 首次解鎖新地圖會免費刷新新地圖商品。
- 每次刷新 3 件。
- 商店不出神話。
- 第 1 件對準最弱裝備槽、第 2 件對準次弱槽、第 3 件隨機。

商店品質：

```text
普通 25%
優良 40%
稀有 25%
史詩 8%
傳說 2%
神話 0%
```

重要修正：
- 商店只在第一次建立／舊版 migration 時自動產生初始商品。
- 正常買光 3 件後保持空商店，**不免費補貨**。
- reload 也不會因商品為 0 件免費補貨。
- 付費刷新／購買／贖回／刷新價格重置共用短暫 mutation lock，防快速雙擊重複交易。
- 永久放棄遺失裝備前會 confirm；已鎖定的遺失裝備不能直接放棄。

---

## 22. 副本進度正式公式

解鎖：

```text
懸賞 Lv5
競技場 Lv15
虛空 Lv25
```

只有**主線勝利**增加副本進度。

每 100 progress 自動轉 1 次挑戰次數。

單場主線進度：

```js
damageRate = clamp((startHp - combatEndHp) / playerMaxHp, 0, 1)
progress = (enemyMaxHp/playerBaseHp * 1.5 + damageRate * 4) * vipMultiplier
```

其中 `playerBaseHp = baseHP(playerLevel)`。

VIP multiplier：

```text
VIP0~3   → 1.00
VIP4~11  → 1.10
VIP12+   → 1.20
```

注意：進度必須吃真實 `combatEndHp`，不能吃戰後已回滿的 `state.hp`。

---

## 23. 副本 lifecycle 與中斷安全

正式共用核心：`dungeoncore.js`。

```js
canStartDungeonRun(cost)
beginDungeonRun({mode,cost})
getActiveDungeonRun()
finishDungeonRun({heal})
dungeonFightCore(enemy)
```

真正開始 run 時才扣次數並寫入：

```js
state.dungeon.activeRun = {
  id,
  mode,
  cost,
  startedAt
}
```

同一 runtime 已存在 active run 時不能再次開始，防快速連點重複扣次數。

正常結束：清 runtime + persisted marker；預設 `finishDungeonRun()` 會回滿 HP。

若頁面 reload／瀏覽器中斷後仍有 persisted `activeRun`：
- 視為上次副本已放棄。
- 已扣挑戰次數不退。
- HP 回滿。
- marker 清除。

---

## 24. 懸賞戰

單場；進 ready 不扣次數，按「開始挑戰」後才 `beginDungeonRun(cost=1)`。

Tier 抽取權重／積分：

```text
普通 45% → 80 VIP 積分
高級 35% → 120 VIP 積分
危險 20% → 180 VIP 積分
```

正式 scaling（相對特殊戰共用 player-base enemy）：

```text
普通：HP 1.00 / Damage 1.00 / DEF .88
高級：HP 1.03 / Damage 1.03 / DEF .90
危險：HP 1.08 / Damage 1.06 / DEF .92
```

一般為 1 trait；危險懸賞 50% 一特性、50% 兩特性。

懸賞不給一般主線 EXP／金幣；勝利只給對應 VIP 積分。

戰鬥結束後 `finishDungeonRun()` 回滿 HP。

---

## 25. 競技場

流程：

```text
選難度 → 確認頁 → 開始三戰 → 第一戰 → 自動第二戰 → 自動第三戰 → 一次結算
```

任一戰失敗立即結束。

積分：

```text
普通 [25,35,120] = 180
困難 [35,45,200] = 280
極限 [40,60,320] = 420
```

核心特色：
- 三戰之間**不回血**。
- 三戰結束／中途失敗後才回滿 HP。
- 真正開始時才扣 1 次。
- 開始時鎖定玩家 combat snapshot、VIP 等級 snapshot、敵人 scaling snapshot。
- 第一戰沿用 ready 預覽 traits；第2／3戰重新 roll traits。
- 每個新敵人都重新取得一次先制。
- 每擊敗一戰就立即取得該 stage VIP 積分；後續失敗不追回前面積分。

---

## 26. 虛空幻境

正式檔：`dungeonvoid.js` + `dungeonvoidui.js`。

解鎖 Lv25。

規則：
- 從 `highestCleared + 1` 開始。
- 進入 ready 不扣次數；第一層真正開戰才扣 1 次。
- 整趟鎖玩家 snapshot。
- 一般層 1 trait。
- 每 10 層 Boss，2 traits。
- 每層勝利後回滿 HP，再進下一層。
- 可要求「本層結束後退出」。
- 戰敗／退出後整趟結束並回滿 HP。

固定基礎：

```text
Base Crit  = 10%
Base Dodge = 8%
HP multiplier  = 2.40
ATK multiplier = 2.15
DEF multiplier = 2.65
```

樓層等效 power：

```js
e = 24 + floor/10
```

基礎敵人：

```js
HP  = ceil((62 + 16.2*e) * 2.40)
ATK = ceil((10.5 + 2.45*e) * 2.15)
DEF = ceil((3.2 + 0.92*e) * 2.65)
```

每層 VIP 積分：

```js
points = round(15 + 1.75*sqrt(floor-1))
Boss floor ×2
```

玩家端目前只強調：目前樓層、本次突破、本次 VIP 積分；不展示 GM 分析型平均數據。

玩家可見文案不使用「首通」；內部 `firstClearPoints / highestCleared` 等變數名稱保留。

---

## 27. 遊戲說明與 UI 資訊瘦身

首頁功能順序：

```text
冒險｜角色｜專精｜副本｜背包｜商店｜遊戲說明｜設定
```

`gameguide.js` 6 類：
- 冒險入門
- 角色與裝備
- 戰鬥與怪物
- 特殊怪
- 副本與 VIP
- 成長與功能

桌機：左側分類／右側內容。
手機：分類按鈕橫向捲動。

近期已完成的文字／資訊精簡：
- 玩家端持久戰鬥 logs 全部移除，只保留動畫／浮字。
- 冒險按鈕正式顯示「開始戰鬥／挑戰 Boss」。
- 冒險頁不再顯示「⚠ 低血量」作為正式 runtime UI（目前舊字串仍存在於 `ui.js` 原始函式，但會被 `hpflow.js` 後載入版本取代，見技術債）。
- 特殊遭遇不再說明 HP30% 限制。
- 競技場 ready 不顯示無意義的目前 HP；「三戰不回血」只在開始前明確提醒。
- 懸賞移除重複難度標籤。
- 背包品質圖例避免同頁重複。
- 商店常駐說明縮成必要規則，其餘放遊戲說明。
- 虛空移除玩家端平均回合、平均積分等 GM 性質資訊。
- 虛空文字改為「每層戰鬥結束後完全恢復 HP，再進入下一層」。

---

## 28. Save Schema v8 與舊存檔 migration

目前 `SAVE_VERSION = 8`。

新增正式 migration 檔：`savemigration.js`。

核心入口：

```js
migrateSave(rawState, fromVersion, normalizer, sourceRaw)
```

目的：保留**原始存檔版本**與原始欄位狀態，再正規化，避免先把舊存檔寫成最新版後失去 migration 判斷依據。

目前集中處理：
- world map progress
- VIP／舊 `dungeon.points → vipPoints`
- specializations
- dungeon progress／attempts／activeRun
- void `highestCleared`
- shop legacy 初始化
- `introSeen`
- 裝備 `locked`
- legacy gear metadata

商店舊檔：
- `< v4`：舊商品清掉、`initialized=false`，由新版商店重新產生合法商品。
- `v4+` 但沒有 `shop.initialized`：有商品 → initialized；無商品 → 未初始化，重新建立。
- 原本已有 boolean `initialized` 則保留。

舊裝備 migration：
- 沒有 `locked` → `false`。
- 沒有 `mainStat` 時依裝備部位補主要能力。
- 沒有／空 `affixes` 時，用裝備實際總能力減掉主要能力，盡量還原其他舊能力為詞條。
- 套用於已裝備、背包、遺失裝備、商店商品。

`introSeen`：舊存檔缺欄位 → `true`；新角色仍由 `newState()` 建立 `false`。

本機 load 與匯入 JSON 都已接到同一 migration 核心。

---

## 29. 本機存檔安全

正式仍是純前端 `localStorage`；沒有帳號、後端或跨裝置自動同步。

`ui.js` 仍有：
- `normalizeSaveItem()`
- `normalizeSaveState()`
- `normalizeCurrentSaveState()`
- `isImportableSave()`

`hpflow.js` 目前把 `normalizeSaveState()` 接到 `migrateSave()`。

匯入至少要求：
- JSON 是物件。
- level 有效且 >=1。
- 存在正式存檔識別欄位之一。
- 覆蓋前 confirm。
- migration／normalize → save → reload。

`save()` 已 catch `localStorage.setItem()` 例外；失敗時頁首顯示「存檔失敗」，不讓例外直接中斷遊戲流程。

純前端無法真正防止：
- 玩家自行修改 localStorage／匯出 JSON。
- 玩家修改裝置時間影響商店 1 小時冷卻。

---

## 30. GM 管理中心

入口：設定頁標題連點 3 次 → 管理密碼。

GM Hub 有管理／測試兩大分頁。

一般管理包含：
- 指定角色等級
- 指定金幣
- 指定主線解鎖到某等級關卡
- 補滿 HP
- 清空背包（需 confirm）
- 刷新商店
- 重置商店刷新價格
- 指定品質／等級／部位產生裝備
- 正式專精等級管理
- 副本 progress／挑戰次數／VIP 積分管理
- VIP 重置
- 虛空進度管理

GM 測試 VIP：
- `VIP0~20` 可選。
- 只保留在本次頁面 runtime；reload 後回 VIP0。
- 敵人生成原則仍是不含測試 VIP；玩家戰鬥才套測試 VIP。

GM 測試專精：
- 8 項可獨立設 Lv0~30。
- 僅 runtime，不污染正式 state。
- reload 後回 Lv0。

---

## 31. GM 戰鬥模擬

`GM_TEST_RUNS = 100`。

正式模擬：
- 指定主線地圖怪 ×100
- 指定特殊怪 ×100
- 普通／高級／危險懸賞各 ×100
- 普通／困難／極限競技場各 ×100 完整三連戰
- 虛空指定樓層預覽
- 虛空從指定樓層連續爬塔模擬；安全上限 10,000 層

沙盒：
- `gmCreateSandboxSnapshot()` 備份正式 `state`。
- 每輪可 reset sandbox。
- 測試後 `gmRestoreSandbox()` 恢復正式資料並 save。
- 測試 VIP／專精不應污染正式角色。

GM 平均剩餘 HP 的正式安全原則：
- 主線怪、懸賞、競技場、虛空直接使用 `runCombatCore()` 該場回傳 HP。
- 特殊怪批次明確先保存 `combatEndHp`，再做死亡懲罰／回血。
- **不可用戰後已被補滿的 `state.hp` 統計平均剩餘血量。**

特殊怪 GM 結果：勝率、勝利平均剩餘 HP、死亡掉裝、VIP10 第二次獎勵次數、VIP20 保護次數、EXP／金幣／滿等轉金幣、掉裝品質、測試鑑價售價、隨機獎勵分布等。

主線怪 GM：勝率、勝利平均剩餘 HP、死亡掉裝、VIP20 保護、模擬 EXP／金幣／裝備。

懸賞 GM：勝率、勝利平均剩餘 HP、平均回合。

競技場 GM：各戰到達率／條件通過率、全通率、平均積分、全通平均剩餘 HP、平均總回合。

虛空 GM：指定樓層能力／traits／積分預覽；爬塔可看可突破樓層、停止樓層、總積分、平均積分、平均回合、最後勝利剩餘 HP 等。

---

## 32. 近期重要 bug 修正與穩定性修正

### 戰鬥／回血
- 開戰前回血改成戰後回血。
- 刪除特殊遭遇 HP<30% 條件。
- 虛空改成層後回血。
- 競技場維持唯一主要場間不回血玩法。
- 主線副本 progress 與 GM 平均 HP 均保留真實 `combatEndHp`。

### 特殊遭遇
- 取消「略過／手動挑戰」。
- 改成明顯警報後自動戰鬥。
- 特殊勝利後回主線剩餘連戰。
- 特殊失敗立即中止連戰。
- 同一連戰可有多次特殊遭遇。
- 主線＋特殊結算分區顯示。

### 裝備／出售
- 新增裝備鎖定。
- 鎖定裝備不受自動出售、一鍵出售、手動出售影響。
- 換下裝備統一走自動出售規則。
- 一鍵最佳裝備也使用相同規則。
- 修正 `gearupgrade.js` 後載入覆蓋 `equipmentlock.js` 邏輯的衝突；現在 `gearupgrade.js` 不再寫裝備狀態。
- 修正換上更高 HP 裝備後只 `normalizeHP()` 導致非滿血開下一戰；現在非戰鬥換裝後回滿。

### 商店
- 買光不免費補貨。
- reload 不免費補貨。
- 快速連點交易鎖。
- 1 小時冷卻即時倒數。
- 舊匯入缺 `shop.initialized` 的 migration 洞已補。

### 存檔
- Save Schema 升 v8。
- 新增集中 `savemigration.js`。
- 舊裝備 metadata 補齊。
- `locked / introSeen / VIP / 專精 / 副本 / 虛空 / shop` 進 migration 管線。
- `localStorage` 寫入失敗安全處理。

### 專精／副本快速操作
- 專精升級防雙擊重複扣款。
- 副本 active run guard 防重複扣次數。
- 商店 transaction lock 防第二筆交易。

### 玩家介面
- 玩家端戰鬥 logs 移除。
- 戰鬥動畫加快。
- 結算 UI 手機可捲動。
- 主線／特殊收益分區。
- 新角色完整 Lv1 普通裝＋第一次開場。

---

## 33. 目前仍未完成／技術債（重要）

以下不是目前已知致命 bug，但下一個對話接手時要知道：

### A. `ui.js` 與 `hpflow.js` 尚未真正合併
`ui.js` 原始內容仍存在：
- `⚠ 低血量`
- 「回血並開始戰鬥」
- 「回血並挑戰 Boss」
- `healBeforeBattle()`
- 舊 `startBattles()` 開戰前回血

目前真正 runtime 行為是被後載入 `hpflow.js` 取代：
- 不顯示低血量警告
- 按鈕顯示「開始戰鬥／挑戰 Boss」
- `startBattles()` 不先回血

**下一次若整理這塊，應直接把正式新版寫回 `ui.js`，再刪除 `hpflow.js` 對 UI 的 override；不要再加第三層 wrapper。**

### B. 回血責任仍有重複
目前：
- `applyDeathPenalty()` 自己回滿 HP
- `gainExp()` 升級時自己回滿 HP
- 主線 pipeline／特殊／副本外層又有統一戰後回血

目前因 `combatEndHp` 先保存，所以功能安全；但責任不夠單一。

下一次若整理，建議讓獎勵／死亡懲罰只改獎勵與懲罰，**戰鬥流程的正式結束點統一負責回血**。修改前必須先檢查所有呼叫點。

### C. 裝備系統仍有少量後載入 override
雖然 `gearupgrade.js` 已去狀態修改，`equipmentlock.js` 仍會：
- 覆寫公開 `compareHtml / equipSelected / equipBestAll / sellSelected / sellLowerAll / discardLostGear`
- 對 `settlementui.js` 的 `equipSettlementDrop()` 再包一層換裝後回血
- 對 `itemHtml()` 包鎖頭顯示

這已比之前乾淨很多，但若要進一步整理，應把正式資料核心與正式 UI 直接合入來源，而不是新增更多 wrapper。

### D. 戰鬥動畫仍依賴 logs regex
structured `events` 已有，但懸賞／競技場／虛空／部分特殊動畫仍解析文字 logs。未來可逐步改成 events，但目前不可直接刪 core logs。

### E. 部分 CSS 仍由 JS 動態注入
例如 VIP、專精、裝備鎖定、特殊警報、結算、虛空等。沒有 UI bug 時不要為了漂亮一次大搬家；若要整理應分批。

### F. 沒有自動化瀏覽器／iPhone Safari 真機回歸
目前多數驗證是 GitHub main 靜態回讀與程式邏輯檢查。若使用者回報裝置問題，再針對真機現象處理。

---

## 34. 平衡哲學（不要自行破壞）

```text
主線 = 成長、刷資源、刷裝備
特殊怪 = 額外驚喜／禮物
副本 = 挑戰
```

原則：
- 不因 VIP／專精變強就自動補強主線。
- 不因 VIP／專精變強就自動補強特殊怪。
- 懸賞／競技場若未來過度被玩家碾壓，優先考慮新增更高難度，不要回頭把舊三檔全部膨脹。
- 虛空本身無限爬高，可自然承接角色變強。

---

## 35. 建議回歸檢查清單

### 主線
- 推進 10/10/10/10
- Boss 等級門檻
- Boss 首勝解圖＋免費刷新
- Boss 失敗鎖定／10 菁英解鎖
- 1／5／10／15／20／25 連戰
- 主線每場戰後回滿
- 主線 progress 使用戰後 HP 快照
- 中途死亡前面收益保留

### 特殊遭遇
- 普通／菁英勝利後機率判定
- Boss 不觸發
- 高怪 10 級以上不觸發
- **沒有 HP30% 條件**
- 警報 → 自動開打
- 特殊勝利 → 回滿 → 繼續主線
- 特殊失敗 → 結算 → 中止主線
- 同一連戰多次特殊遭遇
- VIP10 第二套獎勵

### 裝備／出售
- 鎖定不會被手動／自動／一鍵出售
- 神話不自動出售
- 神話手動出售 confirm
- 一鍵最佳換下舊裝走自動出售
- 結算立即裝備
- 換 HP 裝後維持滿血
- 鑑價專精套用所有真正出售

### 商店
- 初始 3 件
- 買光後保持 0 件
- reload 不補免費商品
- 刷新回 3 件
- 刷新價格階梯
- 購買降 1 級
- 12,800 → 1 小時重置
- 交易快速雙擊只做一次

### 副本
- ready 不誤扣
- 真正開始只扣一次
- 中斷 marker reload 後清掉、不退款、回滿
- 懸賞單場戰後回滿
- 競技場三戰場間不回血、整組後回滿
- 虛空每層戰後回滿
- 虛空退出／失敗後回滿

### 存檔 v8
- 新角色
- v7 正常升 v8
- `<v4` 商店 migration
- 缺 `shop.initialized`
- 缺 `locked`
- 缺 `introSeen`
- 缺專精／VIP／dungeon／void 欄位
- 舊裝備無 `mainStat / affixes`
- 無效 JSON／取消覆蓋
- localStorage 寫入失敗

### GM
- 正式資料不被測試污染
- 測試 VIP／專精只在 runtime
- 主線／特殊／懸賞／競技場／虛空平均剩餘 HP 都讀真實戰鬥結果，不讀回血後 `state.hp`

---

## 36. 下一個對話如何接手（標準指令）

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新讀取目前 GitHub `main` 的 `index.html` 與本次需求相關正式程式碼；**`main` 是唯一真實來源**，不要只依賴交接檔或舊聊天。先比對交接檔是否仍與程式一致，再開始處理需求。使用者若說「先討論／先不要改」，只能分析，不得寫入；若明確說「做／修改／執行」，可直接修改 `main`。修改前先搜尋引用點，優先改正式來源，不新增不必要 wrapper／fallback／第二套公式；JS/CSS 修改必須同步 bump `index.html` cache-bust。修改後重新讀回所有修改檔與 `index.html`，並清楚區分「GitHub main 靜態確認」與「實際瀏覽器／iPhone Safari 真機驗證」。