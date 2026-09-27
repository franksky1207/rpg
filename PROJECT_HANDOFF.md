# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-27（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只負責交接、索引 current main 已完成內容，以及保存使用者已確認但尚未實作的後續規格。若本檔、舊對話、舊 Word、舊規格或記憶與 current `main` 衝突，**一律以 current `main` 為準**。

---

# 0. 本次交接重新驗證

本次更新前已重新讀取 current `main` 實碼，不依賴舊對話記憶。

更新交接檔前的 main HEAD：

```text
2dc553071452f9f8b671da01a00dead59e999bcc
```

本次只更新 `PROJECT_HANDOFF.md`，**不修改其他功能檔案**。

目前第三紀元不是 foundation 狀態；第 5～第 8 批與第 7／8 批後續優化已完成。後續正式施工**只剩兩大批**：

```text
第 9 批：正式 UI／回顧／稱號／劇情框架
第10批：GM＋Integrity＋收尾
```

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
8. 只有跨模組銜接確有必要時才允許薄 adapter／policy layer；現有正式 owner 能直接擴充就直接擴充。
9. 第一／第二／第三紀元能共用的邏輯，優先 shared owner，不做三套平行系統。
10. GM sandbox／benchmark state 不得污染正式 save。
11. 若已有 registry／hook／policy owner，優先掛入既有 owner，不要疊多層 monkey-patch。
12. 第三紀元未定案故事文本、最終結局、競技場正式規則、背景／動畫，不可自行補成正式內容。
13. **不要修改鏡像戰本體來實作第三紀元**，除非使用者明示。
14. `thirdWorld` persistent state 只存根資料；Boss stage、能力、5pp、稱號階、story tier 等都由正式 owner 推導。
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
- 高維紀元為 current progression phase；
- 鏡像戰與虛空仍沿用跨紀元系統；
- 懸賞戰在高維紀元關閉；
- 競技場第三紀元正式規則仍未定案。

---

# 3. 第一紀元／第二紀元既有正式基準

## 3.1 銀河紀元

- 10 大區域 × 10 小區域 × 每區普通／菁英／Boss 結構；
- Lv1～500；
- 8 專精，上限 Lv60；
- 10 印記，上限 Lv10；
- 強化上限 +20；
- 文明災厄 10 階；
- 懸賞、競技場、鏡像戰、虛空；
- 主線／災厄可做回顧，回顧無收益；
- 戰鬥、連戰、Fast Catch-up、離線 sample 已有正式共用架構。

## 3.2 宇宙紀元

- Lv501～1000；
- 主線只有 Boss，共 100 王，Lv505～1000，每 5 級一王；
- 10 章 × 10 Boss；
- EXP 基準固定 250 隻／級，實戰訓練 2.5 倍後約 100 場／級；
- 暗物質／暗能量取代第一紀元經濟資源；
- 強化延伸到 +40；
- 文明等級 0～10；
- 宇宙文明災厄 10 階；
- 戰鬥速度正式解鎖 1.5×，GM 可 2×；
- 主線／災厄／戰線紀錄已有回顧架構；
- 離線收益與第一紀元共用正式 pipeline；
- 稱號通知已統一 shared post-flow lifecycle。

第三紀元施工不得破壞上述正式 owner。

---

# 4. Save／Migration／第三紀元 persistent state

正式 save key：

```text
frank_text_rpg_save
```

目前：

```text
SAVE_SCHEMA_VERSION = 16
```

Schema16 政策：

- Schema1～15 若夾帶 `thirdWorld`，視為不可信開發期資料並丟棄；
- 升 Schema16 前建立 `.pre-schema16-backup-v1` 原始 localStorage 備份；
- `world=3` 裝備只有 source schema ≥16 才接受；
- GM transient test state 不得寫正式 save；
- future save fail-closed。

## 4.1 ThirdWorld persistent allowlist

`thirdworldphase.js` current main 正式只允許：

```text
thirdWorld.entered
thirdWorld.completed
thirdWorld.entryVersion
thirdWorld.dimensionalStrings
thirdWorld.coreLevel
thirdWorld.bosses[].currentHp
thirdWorld.story.introSeen
thirdWorld.story.unlockedStage
thirdWorld.story.finalSeen
```

不得 persist：

- 本輪死亡數；
- 死亡壓制；
- active run target；
- pending run events；
- recent battle summaries；
- combat runtime；
- Boss stage／ability；
- 5pp；
- title tier；
- story tier 衍生值。

## 4.2 第三紀元進入條件

全部成立：

1. Lv1000
2. 宇宙紀元已 entered＋第100王擊破＋宇宙最終故事完成
3. 五部位強化 +40
4. 文明等級 Lv10
5. VIP ≥20，以 `vipPoints` owner 推導
6. 8 專精全部 Lv60
7. 10 印記全部 Lv10

進入後保留：

- 等級／EXP；
- VIP；
- 已裝備與背包；
- +40 強化；
- 8 專精；
- 10 印記；
- 文明 Lv10；
- 鏡像／虛空進度；
- 稱號與歷史紀錄。

進入後清除／截止：

- 暗物質；
- 暗能量；
- pending black market；
- 舊 Offline context／pending settlement；
- lost gear 先免費歸還 inventory。

目前 entry reconciliation：

```text
THIRD_WORLD_ENTRY_RESOURCE_RECONCILIATION_VERSION = 1
THIRD_WORLD_ENTRY_RECONCILIATION_VERSION = 2
THIRD_WORLD_CORE_RECONCILIATION_VERSION = 1
```

舊 entered 但未付費的開發期 core 會一次性重置為 Lv0；維度之弦保留。

---

# 5. 第三紀元等級／EXP（已完成）

正式 owner：`levelprogression.js`。

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

```text
Lv1000～1999：每級固定 10,000,000 EXP
Lv2000：EXP need = 0，state.exp = 0
```

Lv2000 後：

- 不再升級；
- 維度之弦仍可增加；
- Boss HP、loot、稱號、story progression 仍可照正式規則結算。

---

# 6. 第三紀元十王／stage／5pp／aggregate（已完成）

正式 owner：`thirdworlddata.js` V5。

## 6.1 十王固定資料

每王：

```text
HP 1,100,000,000
ATK 15,000
DEF 10,000
暴擊 10%
閃避 10%
先制 bonus 60%
連擊 30%
穿透 30%
反擊 30%
汲取 30%
```

十王總 HP：

```text
11,000,000,000
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

## 6.2 Stage

```text
>90%  stage0
≤90%  stage1
≤80%  stage2
≤70%  stage3
≤60%  stage4
≤50%  stage5
≤40%  stage6
≤30%  stage7
≤20%  stage8
≤10%  stage9
0%    defeated（stage 顯示仍為9）
```

每跨一階：

```text
ATK +600
DEF +1,200
暴擊 +2pp
閃避 +2pp
```

能力門檻：

```text
70% 鎮心
60% 壓制
50% 韌性
40% 復仇
30% 反噬
20% 無視
10% 戰意
```

能力數值直接共用 max-level mark effect semantics，不建立第二套效果公式。

## 6.3 5pp 戰線

每王 5pp 對應：

```text
55,000,000 HP
```

規則：若目標王比最高存活王少 55,000,000 HP 以上，下一場不可挑戰。

- 只算存活 Boss；
- 已死亡 Boss 退出判定；
- 只剩最後一王時免 5pp；
- battle start resolve 一次；
- 合法開打後即使本場跨鎖仍完整結算，下一場再判定。

## 6.4 Aggregate 與高維稱號

`thirdWorldBossAggregateSnapshot()` 同時提供：

```text
overallRemainingPercent：十王總 HP 正規化 100→0%
remainingPercentSum：十王各自百分比加總，滿血 1000%
```

高維正式稱號：

```text
≤900%  破界初臨
≤800%  維外行者
≤700%  超界之軀
≤600%  高維真形
≤500%  萬維共鳴
≤400%  界律共主
≤300%  維序凌駕
≤200%  超維至尊
≤100%  諸維唯一
0%     萬維之上
```

程式內 `tier=0` 代表尚未取得高維稱號，因此程式狀態共有 11 個，但正式稱號只有 10 個。

---

# 7. 第 5／6 批：正式 combat＋永久削血 settlement（已完成）

正式主要 owner：

```text
thirdworldcombat.js
thirdworldcombatintegrity.js
thirdworldcombatsaveguard.js
thirdworldcombatfinalize.js
thirdworldprogress.js
settlementtransaction.js
```

shared combat owner：

```text
combatcore.js
combatmath.js
specialization.js
markcore.js
civilizationcore.js
```

Boss 本場汲取可回血，但：

```text
enemyHealCap = formalStartHp
```

所以不能補回前幾場已永久削掉的 HP。

正式永久削血：

```text
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

玩家死亡仍會結算當場已造成的有效永久削血；0 淨削血則 EXP／維度之弦皆 0。

Settlement stale guard：

```text
persisted boss currentHp === settlementBasis.formalStartHp
```

不一致即拒絕 stale／duplicate result。

正式結算順序：

```text
1. settlementBasis / stale guard
2. aggregateBefore
3. Boss persistent currentHp
4. EXP + 維度之弦；此步直接升級
5. 裝備掉落，以 post-EXP current level 建立 item
6. aggregate progression：稱號／story stage／Boss death／stage crossing／post-settlement 5pp
7. shared transaction save
```

任何 mutate／save 失敗皆原子 rollback，保持 root object identity 與 nested reference semantics。

十王全滅目前會得到 `completionReady = true`，但 **`thirdWorld.completed`／final event owner 尚未正式完成**；留待第 9／10 批 presentation／closure 處理，不可自行補結局文本。

---

# 8. 第 7 批：100死連戰＋界弦核心（已完成）

## 8.1 100死連戰

正式 runtime：`thirdworldrun.js` V5。

```text
最大死亡數：100
死亡壓制基準：0.50pp / death
核心每級減少：0.04pp / death
recent battle summaries：最多20筆
```

公式：

```text
每死壓制 = 0.50pp - coreLv × 0.04pp
```

端點：

```text
Core Lv0  → 0.50pp / death → 100死時約剩50% MaxHP
Core Lv10 → 0.10pp / death → 100死時約剩90% MaxHP
```

正式行為：

- 每次開始新 run：deaths = 0；
- 玩家死亡且 Boss 未死才記 1 death；
- formal battle 成功結算後才記 battle count；
- 最多 100 death；
- coreLevel 與 per-death suppression 在 run start 做 snapshot，本輪不會因中途外部資料變化漂移；
- run active 時禁止升級 core；
- Boss death 停止整輪；
- stage crossed 停止整輪；
- 5pp front 停止整輪；
- 稱號／story aggregate milestone 直接停止整輪；
- death-limit 停止整輪；
- manual stop 清 runtime；
- pagehide 清 transient runtime；
- reload 因 runtime 不 persist 而自然清零；
- 換王前必須先停現有 run；
- 舊 `acknowledgeThirdWorldContinuousRunEvents()` 保留 compatibility shell，但正式回傳 event-run-ended，不再 resume 同一輪。

`thirdWorldLastFinishedRunSnapshot()` 只保留 module memory 的最後結束摘要，不 persist。

## 8.2 Shared continuous infrastructure 已收斂

共用 `backgroundprogress.js` / continuous-run infra 現在同時供：

```text
銀河災厄
宇宙災厄
高維連戰
```

已完成：

- shared background / Fast Catch-up；
- bounded history；
- active runtime conflict；
- pagehide owner；
- global formal run mutex；
- stop-reason semantics；
- 高維 fail-closed：shared infra 不存在時不得 fallback 自己跑第二套。

## 8.3 界弦核心

正式 owner：`thirdworldcore.js` V2。

```text
Lv0～10
每級成本：1,000,000,000 維度之弦
總成本：10,000,000,000
```

升級：

- 只作用正式 live state；
- sandbox snapshot 不會被正式 run lock 誤判；
- run active 時拒絕升級；
- 使用 shared settlement transaction；
- save 失敗完整 rollback。

核心不是一般角色 stat，只是第三紀元連戰死亡後 HP cap 調節器。

---

# 9. 第 8 批：高維裝備＋掉落＋Offline（已完成）

## 9.1 裝備公式與掉落

正式 factory：

```text
equipmentrewardcore.js
thirdworldloot.js
viplootcore.js
```

規則：

```text
品質：傳說95% / 神話5%
正式每場：100% 至少1件
VIP8 / 14 / 16 / 18：沿用 shared VIP loot
VIP16：可額外掉1件
item level：post-EXP current level，可到 Lv2000
world = 3
sell = 0
buy = 0
強化上限仍 +40，不開 +41～+60
```

stat／affix 全部共用既有 owner：

```text
mainStatForType()
mainStatValue()
rollAffixes()
addItemStat()
```

## 9.2 高維 10 階名稱池已完成

名稱階段的唯一進度來源為**十王總剩餘 HP**，不是單王。

Band：

```text
Band1  >90%
Band2  >80%～90%
Band3  >70%～80%
Band4  >60%～70%
Band5  >50%～60%
Band6  >40%～50%
Band7  >30%～40%
Band8  >20%～30%
Band9  >10%～20%
Band10 0%～10%
```

10 套 × 5 部位，共 50 個 current main 正式名稱：

```text
1 異象初覺
  武器 裂隙殘鋒｜頭部 偏光視域｜身體 錯影披層｜足部 回聲殘步｜飾品 異痕餘響
2 界外觸痕
  武器 越界初裁｜頭部 界外感門｜身體 界膜包絡｜足部 彼端越跡｜飾品 外側界標
3 重影視界
  武器 疊相複芒｜頭部 重映觀窗｜身體 錯位疊幕｜足部 迴映雙途｜飾品 雙視折點
4 表象穿透
  武器 透界斷痕｜頭部 深視知膜｜身體 內層脈絡｜足部 穿層透徑｜飾品 裏相鑰式
5 尺度失序
  武器 折距逆芒｜頭部 離軸思框｜身體 失序外相｜足部 偏序離軸｜飾品 失衡座標
6 認知重構
  武器 再編斷式｜頭部 重構識場｜身體 思界織域｜足部 解限移式｜飾品 覺構母式
7 界律超越
  武器 破序律裁｜頭部 凌界法眼｜身體 越律束界｜足部 越則逾線｜飾品 界律公理
8 高位俯視
  武器 俯界截線｜頭部 上視天衡｜身體 投影覆軀｜足部 映界俯行｜飾品 截面映源
9 萬象同觀
  武器 諸相共斷｜頭部 萬象共覺｜身體 眾相並身｜足部 全映並途｜飾品 同觀匯點
10 超越觀測
  武器 無相原裁｜頭部 至界無觀｜身體 彼岸真軀｜足部 超觀無步｜飾品 唯一原式
```

名稱不使用「第幾維」數字化語彙，且五個部位都採語意多樣化，不是單純「前綴＋劍／盔／甲／鞋／戒」。

## 9.3 三紀元 Offline sample owner 已完成

正式 owner：

```text
offlinestatecore.js
offlineprogress.js
offlineworld3adapter.js（薄 adapter）
worldtransitionsafety.js
```

current sample：

```text
OFFLINE_BATTLE_SAMPLE_VERSION = 4
每速度最多保留最近8筆
速度池：1 / 1.5 / 2
```

三紀元：

```text
World1：mapEnemy
World2：boss
World3：higher-dimensional，不記 boss identity
```

World3 取樣只接受：

- 正式 current World3；
- 前景；
- 非 Fast Catch-up；
- 正式 combat 完成；
- settlement 成功。

玩家死亡但正式 settlement 成功的高維戰鬥仍可成為 sample，因第三紀元死亡戰也可能合法造成永久削血並取得 loot。

World phase resolver 為：

```text
World3 > World2 > World1
```

進入 W3 後沒有 W3 sample 時**不可 fallback 使用 W2 sample**。

## 9.4 舊 Offline sample 政策

```text
V1：安全捨棄 sample／pending；角色正式資料不動
V2：安全捨棄 sample／pending；角色正式資料不動
V3：正式相容遷移為 V4
V4：直接使用
未知非零版本：fail-safe 捨棄
```

`offline.sampleMigration` 只做 Offline bookkeeping；新合法 V4 sample 寫入後清除此 migration report。

不需要升 Save Schema 16。

## 9.5 World3 Offline settlement

第三紀元離線規則已完成：

- 依最近正式 W3 sample 估算 battle opportunities；
- 不指定 Boss；
- 不削 Boss HP；
- 不給 EXP；
- 不給維度之弦；
- 不推核心；
- 不推稱號；
- 不推 story；
- 只模擬裝備掉落機會；
- gear chance = 10% / estimated battle；
- 命中 gear opportunity 後直接呼叫正式 W3 loot owner，所以 95/5、VIP8/14/16/18、VIP16 extra 全部沿用正式規則。

W3 settlement state allowlist：

```text
inventory
offline
```

任何其他 state root 被改動都視為錯誤並 rollback。

裝備保留：

- 普通傳說：每部位只保留相較目前裝備更好的最佳件；
- 神話：全部保留；
- 其餘 W3 裝備為「捨棄」，不是出售，沒有任何資源收益。

## 9.6 Offline 效能收尾

離線最多 12 小時。

100ms 理論最壞值：

```text
432,000 estimated battles
10% gear opportunity 期望值約 43,200
```

W3 gear-only settlement 已使用 geometric-skip Bernoulli sampling，直接跳過 90%「沒有裝備機會」的空迴圈；**機率仍然是逐 battle 10% Bernoulli 分布，不是固定發 10% 件數。**

每 250 個成功 gear roll 主動 yield；W1／W2 因仍有 EXP／資源逐場語意，沒有套這個捷徑。

離線結果 UI 最多逐件 render 120 件；超出的已保留裝備仍正常存入 inventory，只是不展開全部 DOM。

## 9.7 Batch 8 後的 known integrity mismatch

current main 有一個已確認但本次**不修改**的細節：

```text
offlinestatecore.js
  OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2

offlineworld3adapter.js validate()
  仍檢查 OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION === 1
```

因此 `THIRD_WORLD_OFFLINE_SAMPLE_INTEGRITY` 在瀏覽器 runtime 可能回報 V3→V4 migration owner mismatch。這是 O3 升 migration contract 後 adapter 靜態期望值沒有同步的**已知收尾項**。

目前 GitHub Runtime Integrity／Story Integrity／Pages 在 `2dc553...` 仍為成功，表示現有 CI 尚未完整覆蓋這個 adapter runtime contract。**第10批 Integrity closure 要優先校正並納入正式檢查；本次 handoff 更新不得偷修功能。**

---

# 10. 稱號與 story progression current main

高維稱號已併入 shared `playertitlecore.js`，不是 `thirdWorld.titles`。

正式 title catalog：

```text
銀河10 + 宇宙10 + 鏡像6 + 高維10 = 36
```

高維 title grant：

- 可一次跨多階；
- 會補齊低階缺漏；
- pending notice 只指向本次最高新稱號；
- 舊存檔 normalize 可依十王總 HP 靜默 backfill。

`thirdWorld.story.unlockedStage` 使用同一 aggregate tier，不另外算第二套 threshold。

目前 settlement 會建立 milestone event data，但**第 9 批還沒做正式玩家 presentation framework**。

shared title notification lifecycle 已完成：

```text
galaxy
universe
higher-dimensional
```

第三紀元 UI 第 9 批必須沿用 `flushPendingPlayerTitleNoticeAfterFlow()` 等既有 post-flow owner，不做新的 title modal 系統。

具體高維故事文本目前仍未定；不可自行撰寫。

---

# 11. GM current main 現況

目前已有 foundation：

- `vipgm.js` 可建立三紀元測試角色；
- 高維測試等級可到 Lv2000；
- 測試裝備共用正式 stat／affix owner；
- 文明最終傷害 owner 在 W3 仍沿用保留下來的文明等級；
- `gmpowerbenchmarkworldphase.js` 已有 World Phase 薄 adapter；
- GM sandbox 不應寫正式 save。

但完整第三紀元 GM 尚未完成；留到第10批。

---

# 12. 目前 UI 狀態

current main **沒有 `thirdworldui.js`**。

第三紀元底層 combat／progression／run／loot／offline 已完整到足以支撐正式 UI，但目前玩家還缺：

- 高維主畫面正式入口與摘要；
- 高維戰線 10 王卡；
- 連戰正式操作介面；
- 界弦核心升級介面；
- 5pp lock／stage／個體特化完整 presentation；
- 已擊破王的正式回顧入口；
- 三紀元 session-only 回顧分頁；
- milestone event presentation；
- 十王全滅 final completion presentation。

這些由第9批完成。

---

# 13. 剩餘第 9 批：正式 UI／回顧／稱號／劇情框架

> 這是下一批正式施工基準。先讀 current main，能共用現有 UI／review／title owner 的地方一律共用。

建立／正式化：

```text
thirdworldui.js
```

必要 CSS 可新增專屬檔，但優先承接既有 UI 語言；任何 JS／CSS 變更都要更新 `index.html` cache-bust。

## 13.1 主畫面

新增：

```text
新紀元｜高維紀元
```

進入後的 current world 主入口要能導向高維正式內容。

## 13.2 冒險／高維戰線

不做 10 區。

直接：

```text
高維戰線
```

桌機排列：

```text
2 × 5 十王卡
```

手機需響應式重排，不可依桌機固定寬度硬塞。

## 13.3 頂部摘要

顯示：

- 十王總剩餘 HP／比例；
- 高維稱號；
- 維度之弦；
- 界弦核心 Lv0～10。

全部讀正式 owner，不自行重算。

## 13.4 王卡

每張至少呈現：

- 王名；
- 個體特化；
- current HP / max HP；
- 剩餘 %；
- stage；
- 可挑戰／5pp lock；
- 已擊破／回顧。

正式挑戰入口以 continuous run 為玩家模式；`runThirdWorldBossCombat()` 保留 headless API，不要在正式玩家 UI 額外開第二個單場 progression 入口。

## 13.5 回顧

已擊破王可回顧：

```text
Boss 使用 10% 最終型態（stage9）
滿 HP
單場
無收益
```

回顧不得修改：

- 正式 Boss currentHp；
- EXP；
- 維度之弦；
- 裝備；
- 核心；
- 稱號；
- story；
- completion。

回顧應盡量共用正式 combat engine，以 sandbox／review policy 阻止 progression，不建立第二套 Boss 戰鬥公式。

## 13.6 三紀元分頁

session-only：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

規則：

- 進入高維紀元後預設高維紀元；
- 同一 session 中玩家主動切換回顧後，不要因普通 render 自動跳回高維；
- reload／重開才回 current world 預設；
- 不 persist 到正式 save。

## 13.7 稱號／劇情 trigger framework

只做正式 trigger／presentation framework：

```text
900%
800%
700%
600%
500%
400%
300%
200%
100%
0%
```

這些門檻必須讀 current aggregate/title owner。

具體故事文字未定：

- 不自行寫故事；
- 可以建立 event id／slot／已解鎖狀態／presentation hook；
- 事件完成後接 shared title post-flow；
- 0% 可建立 final-completion hook，但真正結局文本仍留空／placeholder semantics，不自行創作。

第9批需同時確認 `thirdWorld.completed` 最終寫入應由哪個正式 completion owner 負責；若實作 completion，應由「十王全滅＋正式 final presentation／acknowledgement」的單一 owner 落帳，不得 UI 自己隨意寫。

---

# 14. 剩餘第10批：GM＋Integrity＋收尾

正式玩家系統穩定後才做完整 GM，避免先做一套 duplicate logic。

## 14.1 GM 角色能力測試

新增／補完整：

```text
高維紀元
Lv1000～2000
界弦核心 Lv0～10
```

測試角色仍必須使用正式角色能力／裝備／combat owner；core 只進高維 run HP lifecycle，不加入一般 stat 面板公式。

## 14.2 GM 戰力基準

新增「高維存在」模式，可選：

- 王；
- 100／90／80／70／60／50／40／30／20／10% 狀態；
- runs；
- 模擬 100 death continuous run。

輸出：

- 勝率；
- 回合；
- 總傷害；
- 永久淨削血；
- Boss 回血；
- 玩家死亡；
- Boss 剩餘 HP；
- 跨 stage 資訊。

高維平衡評估重點：

- 每 death 平均存活回合；
- 每條命平均永久削血；
- 100 death 總永久削血；
- 100 death 約可提供多少 EXP／等級進度；
- Core Lv0～10 對 run 的實際差異。

不要只看單場勝率。

## 14.3 GM 正式管理

只允許直接調根資料：

```text
thirdWorld.entered
thirdWorld.completed
state.level
thirdWorld.dimensionalStrings
thirdWorld.coreLevel
thirdWorld.bosses[].currentHp
```

Boss HP preset 最終也只能寫 `currentHp`。

不得直接修改：

- Boss stage；
- Boss ability；
- 5pp；
- 高維 title tier；
- story tier。

全部由正式 owner 推導。

## 14.4 Integrity closure

第10批必須把第7／8／9批新增正式 contract 全部納入 Integrity，至少檢查：

- thirdworldui 只讀正式 derive owner；
- review 不產生任何 progression；
- session tab 不 persist；
- core UI 不可繞過 upgrade owner；
- W3 offline sample V4；
- V1/V2 safe discard、V3→V4 migration；
- gear-only allowlist；
- geometric skip 不改機率；
- 120 件只是 render cap，不是 reward cap；
- 50 名稱唯一且 band owner 唯一；
- formal／offline 共用同一 W3 gear factory；
- high-dimensional GM sandbox 不污染 save；
- GM stage preset 最終只落 Boss currentHp；
- completion owner 與 final trigger 不重複寫入。

**優先修正 current known mismatch：** `offlineworld3adapter.js` 對 `OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION` 的舊 V1 期望值必須與 current `offlinestatecore.js` V2 contract 對齊，並把該 adapter runtime integrity 納入正式 CI／contract，避免再次出現「CI 綠但瀏覽器 runtime integrity false」。

## 14.5 收尾／legacy cleanup

第10批完成後才考慮退休以下 legacy compatibility：

- 舊 Offline scalar：`farmMap`／`farmEnemy`／`avgBattleMs`／`sampleCount`；
- 已無正式用途的 compatibility/no-op API；
- 已由 shared owner 完全取代的舊 wrapper。

退休前必須先 grep／search current main 所有 call sites，確定沒有舊存檔／UI／migration 仍依賴。

---

# 15. 尚未定案、不可自行決定

除非使用者後續明確定案：

1. 高維序章具體故事文本。
2. 10 個高維 milestone 的完整故事／事件內容。
3. 十王全滅後的最終通關故事／畫面內容。
4. 是否銜接低維輪迴／轉生。
5. 第三紀元競技場正式形式與數值曲線。
6. 高維專屬背景／動畫／特效細節。
7. 十王大規模實測後的最終平衡微調。

注意：**高維 50 個裝備名稱目前已存在於 current main，已不屬於「尚未完成」。** 若使用者日後要再改名，才重新調整。

---

# 16. 近期重要 bug 修正／優化歷程

本輪第7／8批完成過的關鍵修正與收斂：

- 高維 progress-event 已由 pause/resume 改為 terminal whole-run stop；
- 100 death 只計「玩家死亡且 Boss 未死」；
- formal battle count 只計成功 combat＋settlement；
- core run 使用 start snapshot，避免中途資料漂移；
- core sandbox 與正式 run lock 隔離；
- W1／W2／W3 continuous run 共用 infra，移除直接 background fallback；
- global formal run mutex；
- W3 last-finished run snapshot 改為 transient module memory；
- W3 50 名稱改由十王 aggregate HP band owner；
- W3 generic equipment factory 與 Boss adapter 分離，formal／offline 共用；
- Offline sample V4 支援三紀元；
- W3 current-world resolver 不再錯用 W2 sample；
- W3 offline gear-only settlement 加入 state allowlist 與 append-only inventory guard；
- shared gear accumulator 改為可指定 target，避免 sandbox 誤寫 live state；
- O3 對舊 sample V1/V2 採 safe discard，V3 正式 migration；
- W3 12h worst-case offline 改 geometric-skip，避免 432k 空迴圈；
- 離線結果 DOM 展開上限 120 件，避免大量神話裝備卡頁面；
- Offline UI 文案改為不暗示 W3 有 EXP／貨幣收益；
- JS cache-bust 已隨各批更新。

---

# 17. Integrity／CI 現況

第三紀元主要集中 Integrity：

```text
thirdworldcombatintegrity.js
thirdworldcombatsaveguard.js
thirdworldcombatfinalize.js
thirdworldsubsystemintegrity.js
thirdworldintegritycontract.js
thirdworldmigrationregression.js
```

`thirdworldintegritycontract.js` current extension version：

```text
19
```

目前主要 contract 已涵蓋：

- Schema16／thirdWorld migration；
- 5pp authority；
- combat snapshot policy；
- shared mark／specialization effect source；
- action safety；
- settlement basis；
- shared settlement rollback identity；
- deterministic equipment pipeline；
- zero-sale policy；
- high-dimensional title catalog／backfill；
- 100 death run／suppression／Fast Catch-up／pagehide／active-flow guard；
- core upgrade owner；
- shared continuous-run cross-era integrity。

在功能更新前的 main HEAD `2dc553071452f9f8b671da01a00dead59e999bcc`：

```text
Runtime Integrity：success
Story Integrity：success
GitHub Pages deployment：success
```

但第8-O3 已暴露 `offlineworld3adapter.js` migration-version expectation 未納入現有 contract 的 coverage gap；第10批要補齊。

---

# 18. 下一個對話的正式施工順序

目前只剩：

```text
第9批 → 第10批
```

下一個對話先做第9批，不要再從第7／8批重做。

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
第二紀元 review 相關 owner
galaxy review 相關 owner
offline 相關 owner
thirdworldsubsystemintegrity.js
thirdworldintegritycontract.js
```

先確認 current main 沒有新變更，再決定第9批要分幾個子批。正式 UI 必須直接讀現有 data/run/core/title owners，不可在 UI 再算 Boss stage、5pp、名稱 band 或 title tier。

---

# 19. 「下一個對話如何接手」標準指令

請在新對話直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。  
> `main` 是唯一真實來源；若 handoff 與 current main 衝突，以 current main 為準。  
> 第5～第8批與第7／8批後續優化都已完成，目前只剩 **第9批：正式 UI／回顧／稱號／劇情框架** 與 **第10批：GM＋Integrity＋收尾**。  
> 先重新讀 World Phase、`thirdworldphase.js`、`thirdworlddata.js`、`thirdworldcombat.js`、`thirdworldprogress.js`、`thirdworldrun.js`、`thirdworldcore.js`、`thirdworldloot.js`、shared title owners、既有銀河／宇宙 review UI、offline owners、第三紀元 Integrity owners 與 `index.html`。  
> 第9批建立／正式化 `thirdworldui.js`：主畫面新增「新紀元｜高維紀元」；冒險直接做「高維戰線」，桌機 2×5 十王卡；頂部顯示總剩餘 HP、高維稱號、維度之弦、界弦核心；王卡顯示個體特化、HP%、stage、可挑戰／5pp鎖、已擊破／回顧；正式玩家挑戰只走 continuous run。  
> 已擊破王回顧採 10% 最終型態、滿 HP、單場、無收益；三紀元頁籤為 session-only：「高維紀元／宇宙紀元・回顧／銀河紀元・回顧」，同 session 玩家切換後不要自行跳回，reload 才回 current world 預設。  
> 稱號／劇情先只做 900／800／…／100／0% milestone trigger framework；具體高維故事文本尚未定，不可自行撰寫。稱號通知沿用 shared post-flow owner。  
> 第10批最後做完整高維 GM：角色能力測試 Lv1000～2000＋核心 Lv0～10；戰力基準可選十王、100／90／…／10%、runs、100死連戰，輸出勝率／回合／總傷害／永久淨削血／王回血／玩家死亡／剩餘HP／跨stage資訊；GM 正式管理只寫 entered、completed、level、維度之弦、coreLevel、十王 currentHp，stage／ability／5pp／title tier／story tier 全部由正式 owner 推導。  
> 第10批 Integrity closure 要優先修正 current known mismatch：`offlinestatecore.js` 已是 `OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION=2`，但 `offlineworld3adapter.js` validate 仍期待 1；並把這類 W3 Offline runtime contract 納入正式 CI。  
> 使用者說「先討論／先檢查」就不能改；說「做／修改／執行／第9批」即可直接改 GitHub `main`。  
> 優先修改正式 owner，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline。JS／CSS 修改要同步更新 `index.html` cache-bust；每批完成後重新讀 main、compare base→head、自我檢查並回報 exact HEAD SHA。
