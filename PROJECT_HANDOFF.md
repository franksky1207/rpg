# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 本文件只是跨對話承接層。若本文、歷史對話、記憶、舊規格、舊截圖或先前回答與目前 `main` 衝突，一律以重新讀取到的 `main` 實際程式碼為準。

更新日期：**2026-09-12**。

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 技術：純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `data.js` legacy `SAVE_VERSION = 9`
- 正式存檔 schema：**v10**，由 `savemigration.js` 的 `SAVE_SCHEMA_VERSION = 10` 提供
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 正式世界：**10 大區域、100 張主線地圖、Lv1～500**
- 每張地圖固定 5 級、5 隻敵人：普通×3、菁英×1、Boss×1
- 桌機與手機都要支援；iPhone Safari 是重要真機環境

遊戲定位：**簡單、傳統、文字型 RPG**。核心循環是打怪、升級、拿裝備、推地圖；不要主動加入職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者明確要求。

---

## 2. 下一個 ChatGPT 的硬性操作規範

1. **任何修改前，一定先重新讀目前 GitHub `main` 的相關正式檔案，並重新讀完整 `index.html`。**
2. 涉及公式、狀態、UI 共用函式、load/save、戰鬥流程或跨檔案行為時，先搜尋引用點，確認真正正式來源。
3. 使用者說「先不要改／先討論／先分析／先檢查」時，只分析，不得寫 GitHub。
4. 使用者明確說「做／修改／修正／執行／開始」且需求已明確時，可以直接修改 `main`，不用二次確認。
5. 優先修改正式來源；避免再用 wrapper／fallback／第二套公式／第二套 UI 去覆蓋舊邏輯。
6. 每個 `.js` / `.css` 修改後，都必須同步更新 `index.html` 對應 cache-bust。
7. 修改後重新讀回所有改動檔；有 JS/CSS 變更時再重讀完整 `index.html`。
8. 多檔修改後使用 compare 檢查差異。
9. GitHub API 成功只代表 `main` 已寫入；除非實際測試，不可宣稱 GitHub Pages、桌機或 iPhone Safari 已驗證。
10. 本 handoff 若與 `main` 衝突，以 `main` 為準，之後再更新 handoff。

---

## 3. 世界區域與地圖架構

`data.js` 的 `WORLD_REGIONS` 是 10 大區域唯一正式來源；GM、玩家地圖 UI 等應共用它，不要另外複製區域名稱與範圍。

正式區域：

1. Lv1–50 `地球戰爭`，Map 1–10
2. Lv51–100 `太陽系戰爭`，Map 11–20
3. Lv101–150 `近星戰爭`，Map 21–30
4. Lv151–200 `星際邊疆`，Map 31–40
5. Lv201–250 `獵戶臂戰爭`，Map 41–50
6. Lv251–300 `銀河邊境`，Map 51–60
7. Lv301–350 `銀河中域`，Map 61–70
8. Lv351–400 `銀河核心外圍`，Map 71–80
9. Lv401–450 `銀河核心戰爭`，Map 81–90
10. Lv451–500 `銀河統合戰爭`，Map 91–100

地圖資料依 50 級區域拆成：
- `worldmaps-earth.js`
- `worldmaps-solar.js`
- `worldmaps-nearstar.js`
- `worldmaps-frontier.js`
- `worldmaps-orion.js`
- `worldmaps-galactic-frontier.js`
- `worldmaps-galactic-mid.js`
- `worldmaps-core-outer.js`
- `worldmaps-core-war.js`
- `worldmaps-galactic-unification.js`

`MAPS` 最終共有 100 張。

---

## 4. 玩家地圖 UI：探索與收合

`worldmapui.js` 為正式區域式地圖 UI。

規則：
- 尚未到達的**大區域完全不顯示**。
- 已顯示大區域中，尚未解鎖的**未來地圖完全不顯示**；玩家不會提前看到地圖名稱。
- 目前最高已解鎖區域預設展開。
- 進入下一個 50 級區域後，之前區域預設收合。
- 舊區域仍可手動展開。
- 已解鎖舊地圖永久保留，可以回去刷怪與重打 Boss。
- 每區標示探索進度 `已探索 n / 10`；完整通過則顯示 `10 / 10・已完成`。
- 區域展開／收合狀態目前是暫存 UI 狀態，不寫進存檔。

---

## 5. 主線推進與 Boss

每張地圖固定流程：

```text
普通1 ×10 → 普通2 ×10 → 普通3 ×10 → 菁英 ×10 → 達本圖最高等級 → Boss
```

Boss：
- 固定單場。
- 首次擊敗會解鎖下一張地圖。
- 首勝同時免費刷新一次新地圖商店。
- 已擊敗 Boss 可重打。
- Boss 戰敗後進入鎖定；需重新擊敗本圖菁英 10 次才可再挑戰。

世界進度陣列均依 `MAPS.length` 動態正規化，所以舊 20 圖存檔會自動補成 100 圖陣列；若舊存檔已擊敗 Map20 Boss，正規化後可自然解鎖 Map21。

---

## 6. 主線戰鬥模式：正式只有兩種

目前正式選項：

```text
單場戰鬥
連續戰鬥
```

兩者都從 Lv1 開放。

連續戰鬥：
- 一直挑戰目前選擇的敵人。
- 玩家可以要求停止。
- 停止是在目前這一場結束後生效。
- 戰敗立即結束。
- Boss 永遠只允許單場。
- 背景持續戰鬥最多計算 12 小時。

已刪除舊 `infinitebattle.js`；目前使用：
- `battlepipeline.js`
- `continuousbattle.js`
- `backgroundprogress.js`

注意：`specialencounter.js` 內仍可能保留舊 `infinite` 相容命名；`battlepipeline.js` 也保留暫時 alias 供舊內部流程相容。不要把這些內部相容名稱誤認成玩家仍有「無限連戰」選項。

---

## 7. 玩家、EXP、金幣與滿等

玩家基礎：

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

正式 EXP 曲線唯一來源是 `engine.js`：

```js
const EXP_CURVE = { killMin:5, killRange:495, scale:142 };
sameExp(l) = ceil(25 + 4*l);
expNeed(l) = ceil(sameExp(l) * (5 + 495*(1-exp(-(l-1)/142))));
```

同級普通怪約需擊敗數會由 Lv1 約 5 隻逐步趨近 500 隻；目前抽查：
- Lv100 約 254
- Lv150 約 327
- Lv250 約 414
- Lv350 約 458
- Lv500 前約 485

`level100balance.js` 檔名是歷史遺留，目前**不再代表 Lv100 上限**；它只保留相容 alias 與任意等級成長查詢工具：
- `levelExpFactor`
- legacy `level100ExpFactor`
- `sameLevelNormalKillsToLevel()`
- `levelProgressionAudit()`

怪物 EXP 倍率：普通×1、菁英×2、Boss×5。

金幣：

```js
goldBase(l) = ceil(6 + 4*l)
```

普通×1、菁英×2.5、Boss×6。

傷害：

```js
max(1, ceil((atk - def*0.55) * random(0.95~1.05)))
```

暴擊倍率 1.5。

### Lv500 滿等
- Lv1～499 正常累積 EXP 與升級。
- Lv500 不再累積 EXP。
- `levelcap.js` 與 `specialExpPayout()` 都依 `MAX_LEVEL` 判斷，所以只有 Lv500 才啟動滿等轉換。
- Lv500 原本可取得的 EXP 以 **1:1 轉為金幣**。
- Lv500 死亡不會有 EXP 損失，但裝備遺失規則仍照常，除非 VIP20 保護。

---

## 8. 怪物、裝備與高等級延伸

`balance.js` 主線怪物採線性等級成長，原始設計就預留 Lv200／Lv300 以上擴等，目前延伸到 Lv500 不需另設 101+ 倍率。

裝備：
- 部位：武器、頭盔、鎧甲、鞋子、飾品。
- 品質：普通、優良、稀有、史詩、傳說、神話。
- 裝備等級最高跟隨 `MAX_LEVEL`，目前 Lv500。
- 掉落等級通常接近敵人等級。
- 商店依角色等級與目前世界進度動態選地圖；不綁 20 圖／Lv100。

主線掉落品質：
- Boss 正式表 `[0,45,35,15,4.5,0.5]`。
- Trait 與 VIP 可再提升品質。

怪物特性共 7 種；特性會影響怪物能力，並可能影響掉落品質提升機率。

---

## 9. 副本與 VIP

副本：
- Lv5 懸賞戰
- Lv15 競技場
- Lv25 虛空幻境

### 懸賞戰
定位：**資源副本，高 EXP、高金幣、多裝備**。

Tier：
- 普通懸賞：45%，EXP×5、金幣×5、2 件裝備
- 高級懸賞：35%，EXP×8、金幣×8、3 件裝備
- 危險懸賞：20%，EXP×12、金幣×12、5 件裝備

玩家正式 UI / guide **不要公開 Tier 出現權重與裝備品質百分比**。

懸賞裝備基礎品質表：
- 普通 0%
- 優良 0%
- 稀有 60%
- 史詩 35%
- 傳說 4.5%
- 神話 0.5%

可再受到怪物特性品質提升、VIP14 品質提升、VIP8 弱部位優先影響；VIP18 是主線 Boss 專屬，不套懸賞。

目前 `dungeonbounty.js` ready 畫面仍會顯示精確 EXP／金幣／裝備件數預覽；使用者先前偏好「不用詳細預覽，反正都要打」，若之後整理此 UI，應改成質性文字如「高 EXP・高金幣・多裝備」。

### 競技場
- 普通／困難／極限。
- 三連戰，中間不回血。
- 主要獎勵 VIP 積分。

### 虛空幻境
- 無限樓層型。
- 每層戰後回血。
- 每 10 層 Boss。
- 主要獎勵 VIP 積分。
- 敵人採獨立樓層公式，不綁角色上限。

VIP：0～20。

---

## 10. 專精

共 8 項，全部最高 Lv30：
- 實戰訓練：每級 EXP +5%
- 搜刮技巧：每級直接戰鬥金幣 +5%
- 鑑價技巧：提高出售裝備金幣
- 先制技巧
- 連擊技巧
- 穿透技巧
- 反擊技巧
- 汲取技巧

專精為永久成長；用金幣升級，無失敗、不需材料、不可重置。

---

## 11. 離線與背景進度

### 背景持續戰鬥
`backgroundprogress.js`：
- 連續主線可在背景推進。
- 最多 12 小時。

### 離線收益
`offlineprogress.js`：
- 離線至少 1 分鐘才結算。
- 最多 12 小時。
- 依最近有效主線非 Boss 刷怪目標計算。
- 給少量 EXP、金幣、裝備與副本進度。
- 到 Lv500 才把離線 EXP 轉成金幣。

`offlinefarmtarget.js` 管理合法離線刷怪目標與 checkpoint。

---

## 12. GM 管理與測試

GM 管理值都應走動態：
- 指定角色等級：1～`MAX_LEVEL`，目前 1～500
- 指定主線進度：1～500
- 產生裝備：Lv1～500
- 世界資訊：10 大區域、100 張地圖

### 主線怪大量測試
正式介面現在是三級：

```text
區域 → 地圖 → 怪物
```

- 區域直接讀 `WORLD_REGIONS`。
- GM 永遠可以看全部已實作區域、地圖與怪物，不受正式角色探索進度限制。
- 區域下拉 10 個選項。
- 選區後，地圖下拉只顯示該區 10 張地圖。
- 選地圖後，怪物下拉只顯示該圖 5 隻怪。
- 換地圖時盡量保留原怪物索引。
- 每次正式測試為 `GM_TEST_RUNS = 100` 次沙盒模擬，不改角色正式資料。

相關正式檔：
- `gmtools.js`
- `gmhub.js`
- `dungeongm.js`
- `specialgmbatch.js`
- `vipgm.js`
- `dungeonvoidgmmanage.js`
- `dungeonvoidgmui.js`

注意：函式名 `gmSimulateBounty100()` / `gmSimulateArena100()` 中的 `100` 指 **100 次模擬**，不是 Lv100。

---

## 13. 遊戲說明

`gameguide.js` 已更新到目前正式世界：
- 100 張主線地圖
- 10 大區域
- 未探索地圖不提前顯示
- 每 50 級區域式收合
- Lv500 等級上限
- Lv500 才啟動滿等 EXP→金幣
- 裝備最高 Lv500

不要再寫「20 張地圖」「Lv100 上限」或舊 1/5/10/15/20/25/∞ 戰鬥模式。

---

## 14. 重要載入順序

完整 `index.html` 每次修改前後都要重讀。核心順序概念：

1. `data.js`
2. 10 個 `worldmaps-*.js`
3. `worldnamingrules.js`
4. `engine.js`
5. specialization / combat / dungeon / migration
6. `gameguide.js`
7. `ui.js`
8. `worldmapui.js`
9. HP / VIP / settlement / balance / traits
10. GM 與副本系統
11. `levelcap.js` / `specialcore.js`
12. GM batch / hub
13. `level100balance.js`（歷史檔名，相容與 audit 工具）
14. battle pipeline / continuous battle / background / offline
15. guide/result/dungeon/adventure/combat presentation layers

重要依賴：
- 10 個 world map 檔必須在 `engine.js` 前把 `MAPS` 填滿。
- `savemigration.js` 必須在真正 `load()` 執行前接上。
- `worldmapui.js` 在 `ui.js` 後覆寫 adventure map page。
- `traits.js` 必須早於直接使用 traits 的副本。
- `dungeongm.js` 在 `gmhub.js` 前，讓 hub 可以取得區域／地圖／怪物 selection helper。
- `backgroundprogress.js`、`offlinefarmtarget.js`、`offlineprogress.js` 在後段接背景與離線流程。

---

## 15. 目前正式世界內容完成度

已完成：
- Lv1～500 全部主線地圖資料
- 100 張地圖
- 500 個主線敵人名稱／等級／類型資料（每圖 5 隻）
- 每圖 5 個裝備基礎名稱（武器／頭盔／鎧甲／鞋／飾品）
- 10 大區域
- 玩家區域收合與探索式隱藏
- Lv500 核心上限
- 高等級戰鬥／裝備／商店／副本／離線動態延伸
- GM 區域→地圖→怪物三級測試
- Lv500 遊戲說明

Lv500 最終地圖為 Map100 `銀河統合決戰區`，Boss 為 `銀河征服中樞`。

---

## 16. 目前已知但不一定要立即處理的技術債

- `data.js` 仍保留 legacy `SAVE_VERSION = 9`；正式 schema 是 v10，這是相容層，不要誤改。
- `level100balance.js` 檔名仍有 `100`，但內容已泛化；若未來要改名，必須同步處理 `index.html` 與所有引用。
- `specialencounter.js` 可能仍有 `infinite` 相容命名；正式玩家模式已是 continuous。
- `dungeonbounty.js` ready 畫面仍有精確獎勵預覽，與使用者偏好的「不需要詳細預覽」略有落差。
- `PROJECT_HANDOFF.md` 本身不是正式邏輯來源；未來仍要重新檢查 `main`。

---

## 17. 最近四批 Lv500 世界擴充

### 第一批：世界資料
- 建立 10 大區域。
- 補齊 Lv101～500 共 80 張新地圖。
- 完成怪物與裝備命名。
- `MAPS` 總數變成 100。

### 第二批：玩家地圖 UI
- 區域 accordion。
- 目前區域預設展開。
- 舊區域預設收合。
- 未解鎖區域與未來地圖完全隱藏。

### 第三批：Lv500 系統上限
- `MAX_LEVEL` 100 → 500。
- Lv100 恢復正常 EXP 成長。
- Lv500 才是滿等與 EXP→金幣。
- 驗證怪物、裝備、掉落、商店、副本、離線可動態延伸。
- EXP 曲線維持既有公式，不重做 Lv1～100。

### 第四批：GM／說明／交接清理
- GM 主線大量測試改為 `區域 → 地圖 → 怪物`。
- 區域共用 `WORLD_REGIONS`。
- 遊戲說明更新成 100 圖／10 區／Lv500。
- 本 `PROJECT_HANDOFF.md` 全面重寫為目前正式基準。

---

## 18. 新對話建議承接方式

新對話第一句可直接使用：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 `main` 實際程式碼與完整 `index.html`，完整承接《文明戰線》專案。現在先不要修改。

這樣可以同時得到歷史承接與目前 `main` 的真實狀態。
