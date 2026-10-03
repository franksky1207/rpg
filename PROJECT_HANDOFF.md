# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-03（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引、已完成現況與已定案但尚未施工的規格摘要。若本檔、舊對話、舊 Word、舊規格、其他 handoff 補充檔或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次 handoff 更新前重新檢查的 current `main` 功能 HEAD：

```text
0c17d7ea24e68dbf93ad520597f0317b11474a14
```

current main 已確認：

- 第一紀元「銀河紀元」、第二紀元「宇宙紀元」、第三紀元「高維紀元」現行正式內容完整存在；
- 第三紀元 foundation／entry／save／migration／Lv.1000～2000／10 名高維存在／永久削血／500死連戰／界弦核心／Offline／Story／Final Completion 已完成；
- Save Schema 仍為 `16`，Load／Normalization Pipeline 仍為 V2；
- W3 Story 正式 11/11、322頁完成；
- W3 Arena、Mirror、Void、稱號、GM benchmark、Guide、正式進度管理、transaction、安全／Integrity 等既有系統仍維持 current main；
- 2026-10-02 最新完成功能為「裝備自動處理／離線處理政策收斂」兩批；
- exact-head `0c17...` 的 `Runtime Integrity #1254` 與 `Pages build and deployment #5205` 已查到 `success`；Story 相關程式在該輪未修改，若之後再動 Story 仍須重新看新 HEAD 的 Story Integrity，不能沿用舊綠燈。

本次 handoff 更新只修改 `PROJECT_HANDOFF.md`，**不修改 JS／CSS／HTML／戰鬥／存檔功能**，因此不需要更新 `index.html` cache-bust。

目前正式開發狀態：

```text
三大紀元既有正式內容：完成並進入維護／實測
2026-10-02 裝備自動處理政策收斂：完成
轉生／突破／異宇宙：設計已定案，尚未寫入 main
下一階段：依本檔第 8 節的 7 大批順序正式施工
```

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先 fresh read current `main` 的 `PROJECT_HANDOFF.md` 與本次會碰到的正式 owner／consumer。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次確認。
4. 每批修改後必須 fresh read current main、compare base→head，並自我檢查 UI／邏輯／資料寫入／舊檔相容／runtime／Integrity。
5. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。** Markdown-only 文件更新不需要 cache-bust。
6. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 phase owner、第二套 migration owner、第二套 completion owner。**
7. 能共用就擴充 shared owner；不要因轉生、突破、異宇宙特殊而複製一套三紀元既有架構。
8. current main 已有 registry／policy／transaction／normalizer／integrity owner 時，優先延伸正式 owner，不疊 monkey-patch。
9. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark state 不得污染 formal save。
10. 修改前先找真正 owner／consumer；能改 owner 就不要在 UI 後處理硬蓋。
11. Integrity／Actions 沒有實際回傳成功時，不可宣稱 CI 已綠。
12. current main 若已完成某規格，承接現況，不重做。
13. 若設計文件與 main 衝突：**main 決定目前真實狀態；定案文件只決定尚未施工部分的目標行為。**
14. W3 正式 Story／Final 已完成；不可自行重寫、替換或擴增既有 11 篇正式主線。
15. 玩家正式用語固定為 **「10 名高維存在」**。
16. Arena 相關現行係數一律以 current `thirdworldarena.js`／`dungeonarena.js`／`dungeonprogress.js` 為準。
17. `offlineprogress.js` 目前仍是經 audit 允許的 save compatibility wrapper；不要為形式上的「零 wrapper」直接拔除。
18. W3 永久 HP／settlement basis 是高風險正式契約；任何 combat 共用化都不得改變 `formalStartHp → combatEndHp → permanent delta` 語意。
19. GM native section registry 維持 late binding；GM W2/W3 正式進度重建維持 progression management owner；GM 正式資源／副本修改維持 atomic transaction。
20. 轉生施工時的硬原則：**首輪 `reincarnation.count = 0` 必須 100% 維持目前三紀元正式規則；轉生規則只能以明確條件分支加入，不能直接覆蓋首輪 owner。**

---

# 2. current main：三紀元既有正式狀態

## 2.1 世界與等級

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()`：1／2／3 對應銀河／宇宙／高維。

現行正常玩家世界成長仍依 current phase；進入 W3 後 W1/W2 主要保留歷史／回顧。**這是尚未加入轉生之前的 current main 行為。**

## 2.2 第三紀元進入條件（current main）

現行正式條件：

1. Lv.1000；
2. 宇宙紀元已進入；
3. 宇宙主線最終 Boss 完成；
4. 宇宙最終 Story 完成；
5. 五部位強化 +40；
6. 文明 Lv.10；
7. VIP ≥20；
8. 8 專精全部 Lv.60；
9. 10 印記全部 Lv.10。

現行 W3 玩家速度：W1 只 1×，W2/W3 可 1×／1.5×；GM override 可 1×／1.5×／2×。轉生後「1.5×永久保留」屬第 7 節定案規格，尚未施工。

## 2.3 第三紀元主要正式機制

- 10 名高維存在、Stage／能力／5pp 戰線、永久削血；
- 500死連戰、Fast Catch-up、極簡模式 terminal 顯示；
- 界弦核心、維度之弦、W3 loot／offline；
- W3 Story 11篇／322頁與 Final Completion；
- W3 Arena 正式上線；Mirror／Void 沿 shared owner；
- W3 bounty 現行仍 hidden／disabled；這是 current main，未來首次轉生後四大副本永久解鎖會在第 6 批改變；
- W3 special encounter formal flow 維持 current fail-closed／既有規則；轉生首版不另做特殊遭遇規則改寫。

## 2.4 W2 Arena current 正式基準

```text
x = Rank - 1
HP     = 1.68 + 0.05x - 0.0027x²
Damage = 1.52 + 0.04x - 0.0019x²
DEF    = 1.11 + 0.022x - 0.00085x²
ARENA_ASSESS_RUNS = 500
ARENA_ASSESS_CLEAR_TARGET = 485 // 97%
```

未來轉生後仍保留 97% 晉階檢驗，只改區域資格與每輪 Rank 生命周期。

---

# 3. current main：Save／Migration／資料安全

正式版本：

```text
SAVE_SCHEMA_VERSION = 16
SAVE_LOAD_PIPELINE_VERSION = 2
SAVE_NORMALIZATION_PIPELINE_VERSION = 2
```

`thirdWorld` persistent 正式 root 仍以 current owner allowlist 為準；Stage、能力、5pp front、稱號 tier、run deaths、active target、run summary、Fast Catch-up state、GM benchmark result 等 derived/runtime 不應直接持久化。

Schema／migration 原則：

- additive optional field、normalization-only 可在 owner 評估後維持 Schema16；
- semantic reinterpretation、persistent field removal、incompatible structure 才需要 schema bump；
- future save fail-closed；
- GM test transient state 不進 formal save；
- 任何轉生 persistent data 的 schema 決策必須在第 1 批依 current `savemigration.js`／`saveversionguard.js` 真實 owner 決定，不能先假設一定 bump 或一定不 bump。

轉生將是目前最大型的 formal state mutation，因此正式施工時必須走「snapshot → mutation → validation → save → failure rollback」，不能分段 save。

---

# 4. 2026-10-02 已完成：裝備自動處理政策收斂

這一輪已完成，**不是待辦**。

## 4.1 六品質自動處理

`engine.js` current：

- `EQUIPMENT_AUTO_SELL_QUALITY_COUNT = 6`；
- `settings.autoSell` 正式為普通／優良／稀有／史詩／傳說／神話六格；
- 舊五格資料 normalization 會補第六格 `false`；
- `newState()` 六格全部預設 `false`。

## 4.2 shared equipment disposition owner

`equipmentlock.js` current 正式 owner：

```text
equipmentDropDisposition(item, state)
```

判定優先序：

1. locked → 一律保留；
2. `keepUpgrade` 且新裝較強 → 一律保留；
3. 對應品質勾選 auto-process → 處理；
4. 其餘保留。

因此神話不再有獨立硬編碼例外；手動神話出售額外確認已退休。W3 UI 可用「處理」語意，但資源 settlement 仍讀正式 sale owner。

current versions 包含：

```text
EQUIPMENT_AUTO_PROCESS_POLICY_VERSION = 1
EQUIPMENT_MYTHIC_AUTO_SELL_VERSION = 2
EQUIPMENT_MYTHIC_MANUAL_CONFIRM_RETIRED_VERSION = 1
EQUIPMENT_BOOT_NORMALIZATION_SAVE_VERSION = 1
```

module-load normalization 只在 signature 真正改變時 `save(false)`，不做無意義 boot rewrite。

## 4.3 Offline 收斂

`offlineprogress.js` current：

- `OFFLINE_GEAR_ACCUMULATOR_VERSION = 5`；
- W1／W2／W3 離線裝備都共用 shared `equipmentDropDisposition`；
- 不再以 Mythic 特例容器或獨立 respectDisposition 分支維護第二套判定；
- offline 只負責聚合／結算，是否保留／處理由 shared equipment policy 決定。

## 4.4 Guide／cache／驗證

- `GAME_GUIDE_VERSION = 25`；
- Guide 明確說明六品質皆可自動出售，鎖定與「較強裝備優先保留」仍優先；
- current cache-bust：`engine.js/ui.js` 使用 `20261002-autoprocess-policy-batch1`，`equipmentlock.js` 使用 `20261002-autoprocess-policy-batch2`，Guide 為 `20261002-mythic-autosell-batch2`；
- current exact-head Runtime Integrity #1254、Pages #5205 success。

---

# 5. current main：GM／測試／Integrity 現況

GM Hub 仍分「管理／測試」。管理端已存在角色、VIP、專精、強化、印記、文明、副本、資料管理、背景戰鬥、主線鎖血、戰鬥速度等；測試端已有角色能力測試、戰力基準、稱號預覽、劇情測試。

重要既有原則：

- formal management 寫正式存檔；test sandbox 不得污染正式存檔；
- W2/W3 正式進度重建由 progression management owner 負責；
- GM formal resource／dungeon 多欄位改動走 atomic transaction；
- GM W3 benchmark 直接使用正式 W3 data／combat owner，不抄第二套十王公式；
- benchmark result 與測試角色快照有 invalidation，避免「新角色＋舊結果」混用；
- GM 劇情測試是人工測試入口，未來轉生 story suppression 上線後仍必須允許手動播放。

轉生／突破／異宇宙的 GM 新增範圍已在第 7.10 節定案，尚未施工。

---

# 6. current main 重要 owner 索引

施工前仍要重新搜尋 current main，以下只做索引，**不可只看檔名猜 owner**。

## World／Progression／W3

```text
worldphase.js
worldtransitionsafety.js
levelprogression.js
thirdworldphase.js
thirdworlddata.js
thirdworldcore.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldplayerflow.js
thirdworldui.js
secondworldmainline.js
secondworldprogressmanagement.js
thirdworldprogressmanagement.js
```

## Combat／Rewards／Equipment

```text
combatcore.js
combatmath.js
battlepipeline.js
secondworldcombat.js
secondworldrewards.js
settlementtransaction.js
enhancementcore.js
enhancementrewards.js
specialization.js
markcore.js
civilizationcore.js
equipmentlock.js
equipmentrewardcore.js
engine.js
```

## Save／Migration／Offline

```text
savemigration.js
saveversionguard.js
compatibilityowners.js
offlinestatecore.js
offlineprogress.js
offlineworld3adapter.js
thirdworldcombatsaveguard.js
```

## Dungeon／Arena／Mirror／Void

```text
dungeonprogress.js
dungeonarena.js
thirdworldarena.js
thirdworldarenaui.js
dungeonbounty.js
dungeonvoid.js
dungeonvoidui.js
mirrorcombatcore.js
mirrordungeonstate.js
mirrordungeonrun.js
mirrordungeonui.js
dailycore.js
```

## Story／Guide／Title

```text
storyprogress.js
storymigration.js
storyui.js
storyrecordtabs.js
storyruntimeintegrity.js
gameguide.js
thirdworldguidecopy.js
playertitlecore.js
playertitlerenderer.js
playertitleui.js
```

## GM

```text
gmhub.js
gmhubextensions.js
gmtools.js
gmformaltransaction.js
gmdata.js
gmbackground.js
gmcombatspeed.js
gmpowerbenchmark.js
gmpowerbenchmarkstate.js
gmpowerbenchmarkworldphase.js
gmstorytest.js
```

---

# 7. 【已定案、尚未施工】轉生／突破／異宇宙正式規格

本節來自《文明戰線_轉生與異宇宙系統_完整設計統整_2026-10-03_定案版.docx》，是後續實作的正式設計基準。**current main 尚未實作本節功能。**

## 7.1 核心目的

```text
異宇宙卡關
→ 轉生
→ 自由重征服三大紀元
→ Lv.100～1000 累積永久突破
→ 隨時回異宇宙測新戰力
→ 完成第三紀元重新取得下一次轉生資格
→ 再轉生
```

轉生是手段；異宇宙才是長期目的。舊三紀元在轉生後變成「重征服／重新養成」路徑，不把玩家當第一次遊戲。

## 7.2 正式轉生：永久保留

- VIP 點數／等級；
- 已裝備與背包中的 **高維紀元 Lv.2000 裝備**；
- 已解鎖的 1.5× 戰鬥速度；
- 稱號；
- 永久突破 B；
- 玩家設定／介面偏好；
- 四大副本的永久解鎖資格；
- Mirror／Void 等永久歷史紀錄；
- 異宇宙永久解鎖與最深征服進度；
- daily 當日使用次數／領獎狀態保持，不因轉生刷新。

## 7.3 正式轉生：每輪重置

- 角色回到 `Lv.1`、`EXP = 0`，HP 依新狀態回滿；
- 強化；
- 8 專精；
- 10 印記；
- 文明等級；
- W1/W2/W3 本輪主線／攻略進度；
- W1/W2 Arena Rank／晉階進度；
- 金幣、W1 強化石、暗物質、暗能量等單輪資源；
- 維度之弦 = 0；
- 界弦核心 Lv.0、Core progress = 0；
- 本輪異宇宙失敗次數／鎖定／未完成 active attempt；
- 上一輪離線樣本、pending settlement、跨輪背景暫存。

正式轉生不刷新 daily。

## 7.4 再次轉生資格

定案：

```text
Lv.2000
+ 本輪第三紀元 10 名高維存在全滅
+ 本輪界弦核心 Lv.10
= 可再次正式轉生
```

轉生後故事完成狀態不列入再次轉生資格。

## 7.5 突破 B

首次全破、尚未轉生時為 B0。

每次轉生後的新生命：

```text
Lv.100  → B +1
Lv.200  → B +1
...
Lv.1000 → B +1
```

每輪最多 +10；Lv.1000→2000 不再給 B，但仍要完成第三紀元以重新取得轉生資格。

若單場由 Lv.73 一次升到 Lv.312，必須一次補發跨過的 100／200／300，共 B+3。不可用 `level % 100 === 0` 判斷；必須由 progression owner 比較跨過的里程碑並防讀檔／重整／GM 指定等級重複發放。

### 突破戰力公式

每 B+1：

- 裝備 HP／ATK／DEF **原始平面數值** +2.5%；
- 既有最終傷害倍率 +0.05；
- 主能力與 HP／ATK／DEF 平面詞條有效；
- crit／dodge 等百分比不增加；
- 突破與強化都從 raw equipment 計算，不彼此複利。

正式最終傷害：

```text
finalDamageMultiplier = 1 + civilizationLv*0.05 + breakthroughLv*0.05
```

**不是** `1.5 * breakthroughMultiplier`。

文明 Lv.10 時：B0×1.50、B10×2.00、B20×2.50、B30×3.00、B40×3.50、B50×4.00、B100×6.50。

### B0 正式設計基準

Lv.2000、VIP25、全套理論滿裝、+40、專精60、印記10、文明10：

```text
B0：HP 100,677｜ATK 26,590｜DEF 12,260｜Crit 36.3%｜Dodge 26.3%｜終傷×1.50
```

推算公式：

```text
HP(B)=ceil((89490 + 1033.8B)*1.125)
ATK(B)=ceil((23635 + 294.35B)*1.125)
DEF(B)=ceil((11538 + 150.225B)*1.0625)
Final Damage = 1.5 + 0.05B   // 文明10時
```

## 7.6 首輪隔離：硬規則

所有「轉生後規則」都必須先通過唯一 shared 判定，例如概念上的 `isReincarnationRun(state)`。

```text
reincarnation.count = 0 → 100% current main 首輪規則
reincarnation.count > 0 → 才啟用重征服規則
```

首輪必須維持：逐圖解鎖、原 Boss 門檻、原劇情呈現、W3 5pp、原 EXP／資源倍率、原副本解鎖、W1 只 1×等 current main 行為。

舊存檔新增轉生欄位時一律 normalize 成未轉生，不得誤判。

## 7.7 轉生後 W1/W2 自由重征服

### W1

- 全地圖、普通、菁英、Boss 直接可挑戰；
- 不要求普通／菁英各10次前置；
- 不走原 bossLocked 進度循環；
- 不用角色等級作「能否挑戰 Boss」門檻；
- 但真正 `bossKilled` 只記實際擊敗，不為了全圖顯示假填；
- Lv.50／100／…／500 為 10 個關鍵王節點；
- 擊敗高階關鍵王時，災厄與 Arena 區域資格向下涵蓋；例如直接勝 Lv.300 → Tier1～6 資格成立；勝 Lv.500 → 10階全開；
- 不偽造較低 Boss kill history。

### W2

- 100 隻 Boss 全部直接可挑戰；
- 真正 `bossKilled` 只記實際勝利；
- Lv.550／600／…／1000 為 10 個關鍵節點；
- 擊敗高階章末王，較低災厄／Arena 區域資格向下涵蓋；
- 文明災厄的文明等級仍需實際攻略；後一災厄仍受前一文明等級完成的鏈式條件約束。

### 紀元邊界仍保留

```text
W1 → W2：仍必須 Lv.500
W2 → W3：仍必須 Lv.1000
```

提前打贏 Lv.500／1000 最終王只先完成「最終王」條件；其他必要養成仍要完成。轉生後故事完成狀態不再額外阻塞紀元轉換。

## 7.8 轉生後劇情／W3

- 所有已體驗過的主線劇情、章節過場、災厄提示、紀元說明不再自動跳出；
- 不得中止連戰、不阻塞 progression；
- Story 可留在回顧／紀錄；
- 不能只是隱藏 modal，原本由 Story completion 觸發的必要 hook 必須改成靜默完成或取消該門檻；
- 首輪 W3 保留原 5pp 戰線；第一次轉生後所有 W3 rerun 取消 5pp，可集中打一王。

## 7.9 轉生後越級 EXP／核心資源

第一版正式係數先採：

```text
M = 1 + 0.03 * (enemyLevel - playerLevel)
```

只在 `enemyLevel > playerLevel` 使用；同級／低等怪維持原規則。暫不設固定倍率封頂，也不設單場升級級數上限。

範例：+10→×1.3、+50→×2.5、+100→×4、+200→×7、+300→×10、+400→×13、+500→×16。

同一 M 套在「戰鬥直接產出的核心資源」：

- W1：金幣、基礎強化石、進階強化石；
- W2：暗物質、暗能量；
- 原本怪種掉什麼資源不變：普通／菁英仍負責基礎石，Boss 仍負責進階石；
- 裝備出售產生的金幣／素材**不吃**此越級倍率，避免雙重膨脹；
- Offline 與 online 必須共用同一 overlevel multiplier owner。

0.03 是第一版實測基準；若實際重征服資源仍過慢，後續再調係數，不先做第二套複雜公式。

## 7.10 四大副本／Arena

首次轉生後：

- 懸賞、競技場、鏡像、虛空 **永久解鎖**，之後不因低等級／回 W1 再上鎖；
- daily 次數與當日領獎狀態不因轉生刷新；
- Mirror／Void 永久歷史保留；
- W1/W2 Arena Rank／晉階進度每次轉生重置；
- Arena 區域資格看本輪最高關鍵王向下涵蓋；
- 既有 97% 晉階檢驗仍保留。

## 7.11 異宇宙：定位與規模

異宇宙不是第四紀元，不新增 Lv.2001+、新裝備階級或以新貨幣刷裝為核心。

正式規模：

```text
200 個異宇宙
× 每宇宙 5 深度
= 1,000 個固定征服深度 U
```

每個宇宙固定五層：

```text
外環 → 神庭 → 聖域 → 天座 → 主宰
```

20 類文化，每類10宇宙，正式順序交錯混排：冰霜神系、太陽火焰、雷霆天穹、冥界死亡、海洋深淵、自然生命、龍族神權、機械神性、命運時間、星辰宇宙、戰爭兵器、秩序審判、混沌虛無、夢境心靈、光明聖界、黑暗血月、巨人泰坦、沙漠古文明、蟲群生體、超維法則。

完整 200 名稱依 2026-10-03 定案版 Word；施工時若需要寫入資料檔，先重新核對該定案版，不自行改名。

## 7.12 異宇宙固定敵人成長

敵人**只看深度 U，不讀玩家 B**：

```text
HP  = 320000 + 30000U + 1500U²
ATK = 26000 + 600U
DEF = 12000 + 250U
```

B 決定玩家能推多遠；U 決定敵人固定強度。禁止做 dynamic scaling 讓敵人跟著玩家 B 變強。

目前設計目標：約每 +10 B 多推 4～6 深度，約一個宇宙上下。前線 5～8 回合可接受，舊宇宙應逐漸被碾壓。

目前外部試算基準：B10約U6五五波、B20約U11、B30約U15、B40約U19～20、B50約U24。

## 7.13 異宇宙首次解鎖與永久入口

首次：

```text
第一次 W3 10 名高維存在全部擊敗
→ 永久解鎖異宇宙
```

一旦解鎖：任何轉生輪、任何紀元、任何角色等級都可隨時進入；不用本輪再次打完 W3，不用等本輪 +10 B。

主畫面：首次解鎖前不顯示入口；首次解鎖後永久顯示入口，可摘要 B 與最深進度。

## 7.14 異宇宙 Boss 特性／active attempt

既有 7 特性：強壯、兇猛、堅硬、迅捷、致命、狂暴、巨體。

每次「正式挑戰建立」：

- 隨機抽 **2 個不同特性**；
- 該 active attempt 固定這2個；
- F5／重整不得重抽；
- 正式結算後下一次挑戰才重抽；
- 主動放棄／退出尚未結算的挑戰算該深度本輪 1 次失敗；
- 不套 W3 十王專屬 specialization／marks；
- 不隨深度增加到3／4特性。

## 7.15 異宇宙 10 敗鎖定

同一深度、同一生命：

- 只計失敗，不計總挑戰；
- 第1～9敗可繼續；
- 第10敗仍未過 → 該深度本輪鎖定；
- 本輪即使後來 B 再提高，也不能解除該深度鎖；
- 下一次正式轉生才清本輪 failures／lock；
- 永久已征服進度保留。

失敗鎖應與 life identity 綁定，由 owner 自動判斷，不做成一般 GM 可拆改 flag。

## 7.16 轉生正式資料生命週期

至少需要能表達：

- 永久轉生次數；
- 當前 life identity；
- 永久突破 B；
- 本輪已取得突破 0～10；
- 異宇宙永久解鎖／最深進度；
- 本輪異宇宙 failure／lock 與 life identity 的關聯；
- active attempt 需能在 reload 後恢復相同2特性。

`lifeId`、story suppression、四副本永久資格、1.5×永久資格、highestKeyBossTier 等盡量由正式資料／owner 衍生，不讓 UI 任意拆改造成不可能狀態。

正式轉生必須被 battle busy／settlement／Minimal Mode／其他 world-transition blockers 阻擋。

## 7.17 角色 UI

角色頁新增唯讀總覽：

- 養成狀態：強化／專精／印記／文明／突破／轉生；
- 戰鬥加成：強化主能力%、突破裝備 HP/ATK/DEF%、文明終傷、突破終傷、正式總終傷倍率。

總終傷必須讀正式 shared owner，不在 UI 重抄公式。

異宇宙頁只顯示簡要：例如 `突破 B37｜本輪 +7/10｜最深 Uxxx`。

## 7.18 GM 管理／GM 測試最小必要範圍

### GM 管理新增一個「轉生管理」

真正需要操作：

- 指定轉生次數；
- 指定永久突破 B；
- 執行一次**正式轉生 transaction**；
- 指定異宇宙永久進度：未解鎖／已解鎖U0／U1～U1000。

摘要只需要：`轉生 N 次｜突破 Bxx｜本輪突破 x/10｜異宇宙永久進度`。

**不要**做按鈕：lifeId、本輪失敗次數、lock flag、highestKeyBossTier、1.5×永久旗標、四副本永久旗標、story suppression flag 等。這些由 owner／Integrity 自動維護。

### 角色能力測試

只新增「突破 B」測試值，並納入「同步正式角色到測試設定」。不需要「轉生次數」欄位；轉生次數本身不應直接改戰力。

GM 直接指定角色等級不得自動發正式突破；突破里程碑由 progression／Integrity 測。

### 戰力基準測試

新增「異宇宙」模式，可選：

- 深度 U；
- 測試場數；
- 正式隨機2特性／指定2特性／無特性基準。

輸出：勝率、平均回合、平均剩餘HP等核心結果，以及「10敗前至少成功一次機率」。21 種特性組合全掃可做 diagnostic／regression，不必佔正式 GM 主介面。

正式遊戲與 GM benchmark 必須共用同一 final-damage owner，不能 GM 只算文明漏算突破。

### Integrity 負責、不放 GM 畫面

- 首輪零污染；
- 轉生分支才生效；
- 跨多個100級里程碑突破補發且防重複；
- daily 不刷新；
- Arena Rank 重置；
- 四副本永久解鎖；
- 1.5×永久保留；
- 關鍵王向下涵蓋但不偽造 bossKilled；
- W3 5pp 首輪有／轉生後無；
- story suppression 不阻塞；
- online/offline 0.03 一致；
- active attempt F5不重抽、退出算失敗；
- 第10敗鎖定、下一輪解除；
- 正式轉生 transaction rollback。

---

# 8. 已定案正式施工順序：7 大批

異宇宙刻意提前，讓終局玩法在前期就能實際測，不必等整套舊三紀元重征服全完成。

```text
第 1 批：轉生核心資料與首輪隔離
第 2 批：突破系統＋正式轉生最小可用流程
第 3 批：異宇宙最小可玩版
第 4 批：異宇宙完整化與平衡測試
第 5 批：第一、第二、第三紀元轉生後重征服規則
第 6 批：越級 EXP／資源／離線整合＋四大副本永久解鎖
第 7 批：GM 管理／GM 測試／完整 Integrity／全系統回歸收尾
```

實作總原則：

- 第1批先建立隔離牆，**不急著大改玩法**；
- 第2批做出可建立已轉生角色＋B的最小閉環；
- 第3批結束就應能實際進異宇宙測 B/U／2特性／10敗；
- 第4批先把異宇宙本身調到可玩，再回頭做完整舊世界 rerun；
- 第5～6批完成完整生命週期；
- 第7批才收 GM／Integrity／全回歸；
- 每批結束 fresh read main、compare、自檢並更新 cache-bust（若有JS/CSS）。

---

# 9. 明確不採用／不要自行擴充的方向

1. 不把轉生做成只是更快重跑同樣內容；
2. 不讓異宇宙敵人直接讀 B 動態同步變強；
3. 不把專精／印記／文明／強化上限無限往上延伸取代突破；
4. 不把異宇宙做成 Lv.2001+ 的第四紀元；
5. 不要求轉生後重看舊劇情／教學；
6. 不要求 W1/W2 轉生後仍逐圖首輪解鎖；
7. 不取消 Lv.500／1000 紀元邊界；
8. 不設固定越級 EXP hard cap 或單場升級 hard cap；
9. 不把 W1 Boss 改成全資源包：基礎石仍由普通／菁英，進階石仍由 Boss；
10. 不把裝備出售套 0.03 越級倍率；
11. 不讓異宇宙 Boss 套 W3 十王專屬 specialization／marks；
12. 不把每場異宇宙特性升成3～4個；固定2個；
13. 不為轉生額外改特殊遭遇裝備遺失保護；進入轉生時已達 VIP20，current VIP protection 已處理；
14. 強化／專精「升至可負擔最高」屬後續 UX，可實測點擊負擔再加，不是首版前置。

---

# 10. Integrity／CI 現況

本次 handoff 更新前 exact functional HEAD：

```text
0c17d7ea24e68dbf93ad520597f0317b11474a14
```

已重新查到：

```text
Runtime Integrity #1254：success
Pages build and deployment #5205：success
```

Story Integrity 最近已知成功仍屬前一輪 Story/W3 完成鏈；2026-10-02 裝備自動處理改動未動 Story。未來只要有新提交，就只能以新 exact HEAD 的實際 Actions 回傳為準。

---

# 11. 現在真正尚未完成／下一步

## 11.1 首要新功能

**轉生／突破／異宇宙已完成設計定案，但 main 尚未實作。** 下一個正式功能批次就是第 8 節「第1批：轉生核心資料與首輪隔離」。

在使用者明確說「第1批／修改／執行」之前，只能討論／檢查，不得先動 main。

## 11.2 既有低優先技術債

- Offline save compatibility wrapper；
- World Transition single-install compatibility guards；
- SaveVersionGuard 資料保護 wrappers；
- W3 主線 Combat Adapter 更深共用化；
- 手機實機效能／載入觀察；
- GM Hub 檔案責任偏大；
- W3 500死玩家層少量 numeric fallback；
- GM W3 1000場效能只在實測卡頓時再做。

不要因開始轉生系統就順手重構這些低優先項，除非它們直接阻塞該批正式 owner。

---

# 12. 下一個對話如何接手（標準指令）

新對話若只要承接、先不修改，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源，不要只靠 handoff、舊對話或舊設計文件。請特別確認：current main 的三紀元／Save16／Offline／裝備六品質自動處理／GM／Arena／W3 Story／Integrity 現況，以及 handoff 第7節已定案但尚未施工的「轉生／突破／異宇宙」規格與第8節 7 大批正式實作順序。現在先不要修改，只回報承接狀態與重新檢查後的現況。

若之後使用者要求修改，標準施工原則：

> 修改前 fresh read current `main` 的相關正式 owner／consumer；優先修改正式來源，不新增 wrapper、fallback、第二套公式或第二套 owner。使用者說「先討論／先檢查／先不要修改」就不能改；說「做／修改／執行／第 N 批」即可直接改 main。JS／CSS 改動同步更新 `index.html` cache-bust。每批修改後 fresh read、compare base→head、自我檢查 UI／邏輯／資料寫入／舊檔相容／Runtime／Story（若相關）／Pages；只有 Actions 實際回傳成功才可宣稱綠燈。轉生施工第一優先是保護 `reincarnation.count=0` 的首輪規則不被污染。
