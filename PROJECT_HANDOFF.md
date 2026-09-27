# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-27（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只負責交接、索引 current main 已完成內容，以及保存使用者已確認但尚未實作的後續規格。若本檔、舊對話、舊 Word、舊規格或記憶與 current `main` 衝突，**一律以 current `main` 為準**。

---

# 0. 本次交接重新驗證

本次更新前已重新讀取 current `main` 實際程式碼，不依賴舊對話記憶。

更新交接檔前的 main HEAD：

```text
18a816f35e3c20c1c1db492269ac71a9c6e069fd
```

本次只更新 `PROJECT_HANDOFF.md`，**不修改任何其他功能檔案**。

本次最重要的交接變更：

- 原先「只剩第9、10批」的規劃正式廢止；
- 改採 **第9～15批** 七大批收尾；
- 已在 current main 完成的項目不得重新列入未完成；
- 第三紀元競技場仍未定案，不可自行補規則；
- 高維序章／10段主劇情／最終通關事件仍未定案，不可自行撰寫；
- 第9～15批詳細規劃見本文第13節。

current main 主要第三紀元版本／owner：

```text
SAVE_SCHEMA_VERSION = 16
WORLD_PHASE_VERSION = 6
THIRD_WORLD_PHASE_VERSION = 4
THIRD_WORLD_DATA_VERSION = 5
THIRD_WORLD_COMBAT_VERSION = 5
THIRD_WORLD_PROGRESS_VERSION = 4
THIRD_WORLD_SETTLEMENT_VERSION = 4
THIRD_WORLD_RUN_VERSION = 5
THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION = 4
THIRD_WORLD_CORE_PROGRESSION_VERSION = 2
THIRD_WORLD_EQUIPMENT_REWARD_VERSION = 3
SHARED_EQUIPMENT_REWARD_FACTORY_VERSION = 3
SHARED_SETTLEMENT_TRANSACTION_VERSION = 2
LEVEL_PROGRESSION_VERSION = 2
CIVILIZATION_THIRD_WORLD_DATA_CONTRACT_EXTENSION_VERSION = 19
OFFLINE_BATTLE_SAMPLE_VERSION = 4
OFFLINE_STATE_NORMALIZATION_VERSION = 4
THIRD_WORLD_DUNGEON_UI_VERSION = 1
GM_POWER_BENCHMARK_WORLD_PHASE_ADAPTER_VERSION = 1
```

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先重新讀 actual code，不得只依本檔、記憶或舊規格。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次。
4. 每批修改前先重新讀 current main 的相關 owner，確認沒有較新 commit 已改同一區。
5. 每批修改後重新讀 current main、compare base→head、自我檢查 UI／邏輯／資料寫入／舊檔相容，並檢查可用 Integrity／CI。
6. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。**
7. 優先修改正式來源；**不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline**。
8. 只有跨模組銜接確有必要時才允許薄 adapter／policy layer；正式 owner 能直接擴充就直接擴充。
9. 第一／第二／第三紀元能共用的邏輯，優先 shared owner，不做三套平行系統。
10. GM sandbox／benchmark state 不得污染正式 save。
11. 若已有 registry／hook／policy owner，優先掛入既有 owner，不要疊多層 monkey-patch。
12. 第三紀元未定案故事文本、最終結局、競技場正式規則、背景／動畫，不可自行補成正式內容。
13. **不要修改鏡像戰本體來實作第三紀元**，除非使用者明示。
14. `thirdWorld` persistent state 只存根資料；Boss stage、能力、5pp、稱號階、story tier 等全部由正式 owner 推導。
15. current main 若已經完成某批規格的一部分或全部，**施工時承接，不重做。**

---

# 2. 專案定位與世界結構

《文明戰線》是純前端文字／數值養成科幻 RPG，桌機＋手機，iPhone Safari 為重要實機環境。

正式世界：

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()`：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

正式成長只允許 current phase：

```text
worldProgressionEnabled(world) === (world === currentWorldPhase())
```

進入高維紀元後：

- 銀河／宇宙紀元保留為歷史與回顧；
- 第一／第二紀元不再產生正式成長；
- 高維紀元為唯一正式成長世界；
- 鏡像戰與虛空沿用跨紀元系統；
- 懸賞戰在高維紀元關閉；
- 第三紀元競技場正式規則仍未定案。

---

# 3. 第一紀元／第二紀元既有正式基準

## 3.1 銀河紀元

- Lv1～500；
- 10 大區域 × 10 小區域；
- 8 專精 Lv60；
- 10 印記 Lv10；
- 強化 +20；
- 文明災厄 10 階；
- 懸賞／競技場／鏡像／虛空；
- 主線／災厄可回顧；
- Fast Catch-up／Offline sample／continuous run 已有正式 shared infrastructure。

## 3.2 宇宙紀元

- Lv501～1000；
- 100 主線 Boss，Lv505～1000；
- 10 章 × 10 Boss；
- 暗物質／暗能量；
- 強化 +40；
- 文明等級 Lv0～10；
- 宇宙文明災厄 10 階；
- 玩家戰鬥速度最高 1.5×，GM 可 2×；
- 主線／災厄／戰線紀錄已有回顧；
- shared title post-flow lifecycle 已完成。

第三紀元施工不得破壞以上 owner。

---

# 4. Save／Migration／第三紀元 persistent state（已完成）

正式 save key：`frank_text_rpg_save`。

```text
SAVE_SCHEMA_VERSION = 16
```

Schema16 政策：

- Schema1～15 若夾帶 `thirdWorld`，視為不可信開發期資料並丟棄；
- 升 Schema16 前建立 `.pre-schema16-backup-v1`；
- `world=3` 裝備只接受 source schema ≥16；
- GM transient test state 不得寫正式 save；
- future save fail-closed。

`thirdWorld` persistent allowlist：

```text
entered
completed
entryVersion
dimensionalStrings
coreLevel
bosses[].currentHp
story.introSeen
story.unlockedStage
story.finalSeen
```

不得 persist：

- 本輪死亡數／高維壓制；
- active run target；
- pending run events；
- recent battle summaries；
- Boss stage／ability；
- 5pp；
- title tier；
- 其他可推導狀態。

第三紀元入場條件：

1. Lv1000；
2. 宇宙主線完成；
3. 五部位 +40；
4. 文明 Lv10；
5. VIP ≥20，以 `vipPoints` 推導；
6. 8 專精 Lv60；
7. 10 印記 Lv10。

進入後保留：level/exp、VIP、裝備／背包、+40、專精、印記、文明 Lv10、鏡像／虛空、歷史與稱號。

進入後：

- 暗物質／暗能量清零；
- lost gear 先免費歸還；
- pending black market 清除；
- 舊 Offline context／pending settlement 截止；
- 不應跨世界的 runtime/transient 清除。

---

# 5. 第三紀元核心規則 current main（已完成）

## 5.1 等級／EXP

```text
Lv1000～1999：每級固定 10,000,000 EXP
Lv2000：EXP 封頂，state.exp = 0
```

Lv2000 後 Boss HP／維度之弦／loot／稱號／story 仍可繼續推進。

## 5.2 十王固定資料

每王最大 HP：`1,100,000,000`；十王總 HP：`11,000,000,000`。

current main 100% 基準：

```text
ATK 15,000
DEF 10,000
暴擊 10%
閃避 10%
先制 +60%
連擊 30%
穿透 30%
反擊 30%
汲取 30%
```

十王 persisted order：

```text
01 破界天裁：ATK ×1.15
02 永劫重垣：DEF ×1.15
03 宿因天秤：暴擊 +6pp
04 無相彼岸：閃避 +6pp
05 萬象迴演：連擊 +10pp
06 維隙之刃：穿透 +10pp
07 逆因輪轉：反擊 +10pp
08 噬界深淵：汲取 +10pp
09 先驗之瞳：先制 +20pp
10 高維原點：ATK ×1.08、DEF ×1.08
```

Stage：

```text
>90% stage0
≤90% stage1
≤80% stage2
≤70% stage3
≤60% stage4
≤50% stage5
≤40% stage6
≤30% stage7
≤20% stage8
≤10% stage9
```

每階：ATK +600、DEF +1200、暴擊 +2pp、閃避 +2pp。

能力門檻：70% 鎮心、60% 壓制、50% 韌性、40% 復仇、30% 反噬、20% 無視、10% 戰意。

## 5.3 5pp 戰線

5pp = `55,000,000 HP`。

- 只比較存活王；
- 目標王比最高存活王少 ≥55,000,000 HP 時，下一場不可開始；
- 已死亡王退出比較；
- 只剩最後一王時免 5pp；
- battle start resolve 一次；
- 合法開始後即使本場跨線，仍完整結算，下一場才鎖。

## 5.4 Aggregate／稱號

`thirdWorldBossAggregateSnapshot()` 提供總 HP、alive/defeated、overallRemainingPercent、remainingPercentSum。

高維稱號：

```text
≤900% 破界初臨
≤800% 維外行者
≤700% 超界之軀
≤600% 高維真形
≤500% 萬維共鳴
≤400% 界律共主
≤300% 維序凌駕
≤200% 超維至尊
≤100% 諸維唯一
0%    萬維之上
```

高維稱號已併入 shared `playertitlecore.js`；`tier=0` 只是「尚未取得高維稱號」。

---

# 6. 正式 combat／settlement（已完成）

主要 owner：

```text
thirdworldcombat.js
thirdworldprogress.js
settlementtransaction.js
thirdworldcombatintegrity.js
thirdworldcombatsaveguard.js
thirdworldcombatfinalize.js
```

正式永久削血：

```text
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

Boss 汲取回血不能超過該場 `formalStartHp`，所以不能回補前幾場已永久削掉的歷史 HP。

玩家死亡仍可正式落帳該場已造成的淨削血。

settlement stale guard：persisted boss currentHp 必須等於 settlement basis 的 formalStartHp，不一致即拒絕 stale／duplicate result。

正式順序：

```text
1. validate basis / stale guard
2. aggregateBefore
3. 寫 Boss currentHp
4. EXP + 維度之弦並立即處理升級
5. 依 post-EXP level 建立 loot
6. aggregate progression：title / story stage / death / stage crossing / 5pp
7. shared transaction save
```

transaction/save 失敗完整 rollback。

目前十王全滅會得到 `completionReady = true`，但 `thirdWorld.completed` 與正式 final completion flow 尚未完成。

---

# 7. 第7批：100死連戰＋界弦核心（已完成）

`thirdworldrun.js` V5。

```text
最大死亡：100
每死壓制：0.50pp - coreLv × 0.04pp
Core Lv0：100死後約剩50% MaxHP
Core Lv10：100死後約剩90% MaxHP
```

正式 run：

- 新 run deaths=0；
- 玩家死亡且 Boss 未死才 +1 death；
- 成功 combat＋settlement 才 +1 battle；
- run start snapshot coreLevel 與 suppression；
- run active 時禁止升 core；
- Boss death／stage crossed／5pp front／progress-event／death-limit 皆結束整輪；
- manual stop／pagehide／reload 清 transient runtime；
- 換王前先停止目前 run；
- recent summaries 最多20筆；
- `thirdWorldLastFinishedRunSnapshot()` 只在 module memory，不 persist。

W1／W2／W3 continuous run 已共用 `backgroundprogress.js` infrastructure：Fast Catch-up、bounded history、runtime conflict、pagehide、global mutex、stop semantics。

界弦核心：

```text
Lv0～10
每級 1,000,000,000 維度之弦
總成本 10,000,000,000
```

正式 owner `thirdworldcore.js` V2；只改 live formal state，sandbox 與正式 run lock 隔離，升級使用 shared settlement transaction。

---

# 8. 第8批＋O1～O3：裝備／Offline（已完成）

## 8.1 W3 loot

```text
品質：傳說95%／神話5%
正式每場：至少1件
VIP8/14/16/18 沿用 shared VIP loot
VIP16 可額外掉1件
item level = post-EXP current level，最高2000
world=3
sell=0
buy=0
強化上限仍 +40
```

stat／affix 共用既有 equipment owner。

## 8.2 十階裝備名稱

名稱 band 只看十王 aggregate total remaining HP，不看單王。

```text
1 >90%      異象初覺
2 >80～90%  界外觸痕
3 >70～80%  重影視界
4 >60～70%  表象穿透
5 >50～60%  尺度失序
6 >40～50%  認知重構
7 >30～40%  界律超越
8 >20～30%  高位俯視
9 >10～20%  萬象同觀
10 0～10%   超越觀測
```

current main 50 個正式名稱已定，不再列為 pending。

## 8.3 Offline sample

```text
OFFLINE_BATTLE_SAMPLE_VERSION = 4
每速度最近8筆
速度池 1 / 1.5 / 2
World1 = mapEnemy
World2 = boss
World3 = higher-dimensional（不記 boss identity）
```

W3 sample：current W3、正式前景、非 Fast Catch-up、combat 完成、settlement 成功才記；死亡戰若正式 settlement 成功仍可成 sample。

World3 無 sample 時不得 fallback W2 sample。

舊資料：

```text
V1/V2：safe discard sample/pending，不動正式角色資料
V3：migration → V4
V4：直接使用
未知非零：fail-safe discard
```

## 8.4 W3 Offline settlement

只給 gear opportunities：

- gear chance 10% / estimated battle；
- 不指定 Boss；
- 不削 Boss HP；
- 不給 EXP；
- 不給維度之弦；
- 不推核心／稱號／story／completion；
- 命中後直接呼叫正式 W3 loot owner；
- 普通傳說每部位只留最佳件；神話全部保留；其餘 W3 gear 直接捨棄，無資源收益。

W3 Offline allowlist：

```text
inventory
offline
```

其他 root 若被改動即視為污染並 rollback。

## 8.5 Offline 效能

12h 最壞 100ms sample 理論 432,000 battles；W3 gear-only 使用 geometric-skip Bernoulli sampling，保留逐 battle 10% Bernoulli 分布，不是固定發10%。

每250個成功 gear roll yield；離線結果頁最多 render 120 件，但 reward/inventory 無 cap。

## 8.6 Known mismatch（尚未修）

current main：

```text
offlinestatecore.js
  OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2

offlineworld3adapter.js validate()
  仍期待 OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION === 1
```

這是已確認收尾項；第15批 Integrity closure 優先修正，且要納入正式 contract/CI，避免「CI 綠但 runtime integrity false」。

---

# 9. 已完成、後續不得重做的 UI／副本／GM 基礎

這一節很重要：第9～15批只補 current main 真正缺的部分。

## 9.1 世界突破 UI 已完成

`worldphaseui.js` 已支援高維紀元：

- 新紀元卡；
- 七項突破條件；
- 不可逆確認；
- 會保留／會清除說明；
- 高維 welcome marker；
- `enterThirdWorld()` 正式入口。

**第9批不要重做一套第三紀元突破 UI。**

## 9.2 高維副本 policy 已有正式基礎

`thirdworlddungeonui.js` V1 已存在：

- 高維紀元隱藏懸賞；
- Arena 顯示但 disabled，文案為等待高維競技場開放；
- 鏡像／虛空保持可用；
- dungeon resource snapshot 可顯示維度之弦；
- navigation guard／post-render hook 已接既有 dungeon owner。

第14批是「整合驗收＋競技場決策」，不是重新做一套副本首頁。

## 9.3 GM 測試角色／World Phase adapter 已有 foundation

current main 已有：

- GM 測試紀元可選高維；
- 高維測試等級 Lv1000～2000；
- 高維預測裝備使用正式 stat/affix owner；
- `gmpowerbenchmarkworldphase.js` 已能讓 benchmark snapshot/文字辨識 World3；
- GM sandbox 不應寫 formal save。

第15批是在這些 owner 上補完整高維核心／高維存在 benchmark／正式管理，不重做測試中心。

## 9.4 稱號底層已完成

高維10稱號已進 shared title catalog；grant／backfill／post-flow lifecycle 都已有 owner。

第10／12批只處理玩家 presentation／milestone flow，不建立第三套 title system。

---

# 10. 目前真正尚未完成的玩家層／內容層

current main **沒有 `thirdworldui.js`**。

真正尚未完成：

- 高維正式戰線玩家 UI；
- 2×5 十王卡與頂部 aggregate 摘要；
- 界弦核心正式玩家養成頁；
- continuous run 的完整玩家操作／狀態呈現；
- stage crossing／5pp／Boss death 的正式事件 presentation；
- 已擊破高維王的正式 review battle；
- 三紀元 session-only 歷史切換；
- 高維序章／10 milestone／final 的 trigger/presentation framework；
- 高維序章／10段劇情／最終事件的正式內容；
- `thirdWorld.completed` 的 final completion owner；
- 第三紀元競技場正式規則與實作；
- 第三紀元下 Mirror/Void/導航/速度/特殊遭遇等最終整合驗收；
- 完整高維 GM benchmark／100死模擬／正式管理；
- 全第三紀元 UI/review/story/completion/dungeon/GM Integrity closure；
- legacy cleanup。

---

# 11. 尚未定案、不可自行決定

除非使用者後續明確定案：

1. 高維序章具體故事文本。
2. 10 個高維 milestone 的完整故事／事件內容。
3. 十王全滅後的最終通關故事／畫面內容。
4. 是否銜接低維輪迴／轉生。
5. 第三紀元競技場正式形式與數值曲線。
6. 高維專屬背景／動畫／特效細節。
7. 十王大規模實測後的最終平衡微調。

注意：高維50個裝備名稱已完成，不再屬於未定。

---

# 12. 近期重要修正／優化歷程

- progress-event 由 pause/resume 改為整輪 terminal stop；
- 100 death 只計玩家死亡且 Boss 未死；
- formal battle count 只計成功 combat＋settlement；
- core run 使用 start snapshot；
- core sandbox 與正式 run lock 隔離；
- W1/W2/W3 continuous run 共用 infra；
- global formal run mutex；
- W3 last-finished run snapshot 改 transient memory；
- W3 50 名稱由 aggregate HP band owner；
- generic W3 gear factory 與 Boss adapter 分離，formal/offline 共用；
- Offline sample V4 支援三紀元；
- W3 resolver 不再錯用 W2 sample；
- W3 Offline 加入 gear-only allowlist＋append-only inventory guard；
- gear accumulator target 化，避免 sandbox 誤寫 live state；
- V1/V2 Offline sample safe discard，V3→V4 migration；
- W3 12h worst-case 使用 geometric skip；
- Offline 結果 DOM 只 render 120 件，非 reward cap；
- Offline UI 文案不再暗示 W3 有 EXP／貨幣收益。

---

# 13. 後續正式施工順序：第9～15批

> **這一節取代舊 handoff 的「第9批／第10批」兩批規劃。舊兩批規劃不再使用。**

## 第9批：高維正式玩家 UI 骨架

正式建立 `thirdworldui.js`。

主要工作：

- 冒險直接進「高維戰線」，不做10區；
- 桌機 2×5 十王卡，手機響應式重排；
- 頂部摘要：十王總剩餘 HP、目前高維稱號、維度之弦、界弦核心；
- 王卡：名稱、個體特化、current/max HP、%、Stage、5pp 狀態、死亡狀態；
- 補「界弦核心」正式玩家養成頁與快捷入口；
- UI 全部讀 `thirdworlddata.js`／`thirdworldcore.js` 等正式 owner，不在 UI 重算 stage／5pp／title tier；
- 不重做突破 UI，`worldphaseui.js` 已完成。

## 第10批：正式連戰玩家流程與事件呈現

把已完成的 `thirdworldrun.js` runtime 真正接到玩家 UI。

主要工作：

- 開始／停止 continuous run；
- 100 death counter；
- 當前 HP cap／高維壓制；
- background／Fast Catch-up／回頁呈現；
- stage 90→10% 跨階合併 modal；
- 新能力解鎖提示；
- 5pp lock presentation；
- Boss death presentation；
- 接 shared title post-flow，不建立第三套 title modal；
- 保持 progress-event 會結束整輪的 current runtime 語意。

## 第11批：高維回顧＋三紀元歷史切換

高維已擊破王：

```text
10%最終型態（stage9）
滿HP
單場
無收益
```

回顧不得改：Boss currentHp、EXP、維度之弦、裝備、core、title、story、completion。

原則：共用正式 combat engine，以 sandbox/review policy 阻止 progression，不建立第二套 Boss 戰鬥公式。

建立 session-only tabs：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

- 同 session 玩家手動切換後，普通 render 不要跳回 current-world；
- reload／重開才回 current-world 預設；
- 不 persist 到正式 save；
- 銀河既有 review guard 不重做。

## 第12批：高維劇情 Trigger Framework＋Completion Framework

只做架構，不自行寫故事。

接既有：

```text
thirdWorld.story.introSeen
thirdWorld.story.unlockedStage
thirdWorld.story.finalSeen
```

建立：

- 高維序章 trigger；
- 900／800／700／600／500／400／300／200／100／0% milestone trigger；
- settlement 的 `story.unlockedStage` → presentation queue；
- event id／slot／已解鎖狀態／presentation hook；
- 「十王全滅 → final flow」completion framework；
- 與 shared title post-flow 排序整合。

具體台詞／劇情內容保持 placeholder semantics，不自行創作。

## 第13批：正式劇情內容＋最終通關流程

**必須先與使用者另外討論並定案故事內容，不能直接施工。**

定案後才做：

- 高維序章正式文本；
- 10 段主劇情；
- 十王全滅最終事件；
- 正式故事資料檔；
- final presentation；
- `finalSeen`；
- `thirdWorld.completed` 的正式原子寫入；
- 最終畫面／後續概念（若使用者定案）。

`completed` 不得由普通 UI 自行寫；必須由正式 completion owner 在十王全滅＋final flow 完成後落帳。

## 第14批：副本／舊系統整合＋競技場決策

不是重新做一套 W3 副本。

current main 已有 `thirdworlddungeonui.js`：懸賞隱藏、Arena 暫鎖、Mirror/Void 保留。

本批主要：

- 實際驗證第三紀元下鏡像／虛空完整可玩；
- 驗證資源／返回／導航／速度語意；
- 確認 W3 不會觸發特殊怪／特殊遭遇；
- 確認沒有 W3 災厄入口；
- 確認 Mirror/Void 不產 W3 主線維度之弦／十王永久削血；
- 懸賞維持關閉。

第三紀元競技場：

- 若屆時使用者已定案規則，就在第14批實作；
- 若仍未定案，維持 current main「等待高維競技場開放」disabled 狀態；
- 不擅自沿用 W2 強度曲線當正式 W3 Arena。

## 第15批：GM 完整化＋Integrity＋最終封口

### GM 角色能力測試

補完整：

```text
高維紀元
Lv1000～2000
界弦核心 Lv0～10
```

core 只進 W3 run HP lifecycle，不加入一般 HP/ATK/DEF stat 公式。

### GM 戰力基準

新增正式「高維存在」模式：

- 十王選擇；
- 100／90／80／70／60／50／40／30／20／10% Stage；
- runs；
- 模擬100死連戰。

輸出至少：

- 勝率；
- 平均回合；
- 總傷害；
- 永久淨削血；
- Boss 回血；
- 玩家死亡；
- Boss 剩餘 HP；
- 跨 Stage 資訊；
- 100 death 累積淨削血；
- Core Lv0～10 差異。

高維平衡不能只看單場勝率。

### GM 正式管理

只調根資料：

```text
thirdWorld.entered
thirdWorld.completed
state.level
thirdWorld.dimensionalStrings
thirdWorld.coreLevel
thirdWorld.bosses[].currentHp
```

Boss preset 最終也只能寫 currentHp。

不得直接改：Boss stage／ability／5pp／title tier／story tier／派生戰力。

### Integrity closure

至少涵蓋：

- thirdworldui 只讀正式 derive owner；
- review 無 progression；
- session tab 不 persist；
- core UI 不繞過 upgrade owner；
- W3 Offline sample V4；
- V1/V2 safe discard、V3→V4；
- gear-only allowlist；
- geometric skip 不改分布；
- 120件只為 render cap；
- 50名稱唯一、band owner 唯一；
- formal/offline 共用 W3 gear factory；
- GM sandbox 不污染 save；
- GM stage preset 只寫 currentHp；
- story/final/completion owner 不重複寫入；
- dungeon policy 與 current phase 一致。

優先修正 known mismatch：

```text
offlinestatecore.js = OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION 2
offlineworld3adapter.js validate() 仍期待 1
```

並將這類 runtime contract 納入正式 CI。

### Legacy cleanup

最後才評估退休：

- `farmMap`／`farmEnemy`／`avgBattleMs`／`sampleCount`；
- 無正式用途 compatibility/no-op API；
- 已被 shared owner 完全取代的舊 wrapper。

退休前必須先全 repo 搜尋 call sites 與 migration 依賴。

---

# 14. Integrity／CI current 狀態

第三紀元主要 Integrity owner：

```text
thirdworldcombatintegrity.js
thirdworldcombatsaveguard.js
thirdworldcombatfinalize.js
thirdworldsubsystemintegrity.js
thirdworldintegritycontract.js
thirdworldmigrationregression.js
```

`thirdworldintegritycontract.js` extension version：19。

已涵蓋：Schema16、5pp authority、combat snapshot policy、shared mark/specialization source、settlement basis、rollback identity、deterministic equipment、zero-sale、W3 title/backfill、100death、suppression、Fast Catch-up、pagehide、core upgrade、continuous-run cross-era integrity 等。

第8-O3 之後仍有 Offline migration-version expectation coverage gap，留第15批封口。

---

# 15. 下一個對話的正式施工順序

目前正式順序：

```text
第9批 → 第10批 → 第11批 → 第12批 → 第13批 → 第14批 → 第15批
```

下一個對話從第9批開始，不要回頭重做第5～8批或已存在的 World3 突破／Dungeon policy／GM foundation。

第9批開始前至少重新讀：

```text
PROJECT_HANDOFF.md
index.html
worldphase.js
worldphaseui.js
thirdworldphase.js
thirdworlddata.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldcore.js
thirdworldloot.js
playertitlecore.js
playertitleui.js
settlementui.js
worldmapui.js
mainminimalmode.js
thirdworlddungeonui.js
銀河／宇宙 review owners
offline owners
thirdworldsubsystemintegrity.js
thirdworldintegritycontract.js
```

正式 UI 直接讀現有 data/run/core/title owners；不得在 UI 再算 Boss stage、5pp、title tier、equipment band。

---

# 16. 「下一個對話如何接手」標準指令

請在新對話直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。  
> `main` 是唯一真實來源；handoff、舊對話、舊 Word 與 current main 衝突時，一律以 current main 為準。  
> 第5～第8批與第7／8批後續優化都已完成，原本只剩第9／10批的舊規劃已廢止；目前正式施工順序為 **第9～15批**。  
> 第9批做高維正式玩家 UI 骨架；第10批做 continuous run 玩家流程與事件呈現；第11批做高維回顧＋三紀元 session-only 歷史切換；第12批只做劇情 Trigger／Completion Framework，不自行寫故事；第13批必須先與使用者定案高維序章、10段劇情與最終事件後才實作；第14批做副本／舊系統整合與競技場決策；第15批做高維 GM 完整化、Integrity、legacy cleanup 與最終封口。  
> `worldphaseui.js` 已有第三紀元突破 UI，不要重做；`thirdworlddungeonui.js` 已有懸賞關閉、Arena 暫鎖、Mirror/Void 保留 policy，不要重做副本首頁；GM 測試角色已可選高維 Lv1000～2000，`gmpowerbenchmarkworldphase.js` 也已有 World3 adapter，後續只補正式高維能力。  
> 第9批正式建立 `thirdworldui.js`，冒險直接做「高維戰線」，桌機 2×5 十王卡；頂部顯示總剩餘 HP、高維稱號、維度之弦、界弦核心；王卡顯示個體特化、HP%、stage、5pp、死亡狀態；補界弦核心正式玩家養成頁。  
> 使用者說「先討論／先檢查」就不能改；說「做／修改／執行／第N批」即可直接修改 GitHub main。優先修改正式 owner，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline。JS/CSS 修改要同步更新 `index.html` cache-bust；每批完成後重新讀 main、compare base→head、自我檢查並回報 exact HEAD SHA。