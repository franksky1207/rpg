# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-26（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要、已完成系統索引，以及「尚未實作但已確認」的設計基準。若本檔、舊對話、舊 Word、舊規格或記憶與 current `main` 衝突，**一律以 current `main` 為準**。

## 0. 本次交接重新驗證

本次不是只靠對話記憶，已重新讀取 current `main` 的實際程式碼。更新交接前的 main HEAD：

`02e19cba0a2919a43cef6d97c7ce0085eb681ce4`

已重新確認：

- `savemigration.js`：正式 `SAVE_SCHEMA_VERSION = 16`，Load Pipeline V2、Normalization Pipeline V2；`thirdWorld` 已正式進 save。
- `worldphase.js`：正式世界已擴充為銀河／宇宙／高維三階段，`WORLD_PHASE_VERSION = 6`；current world 由 `currentWorldPhase()` 決定，正式進度只允許當前世界。
- `thirdworldphase.js`：第三紀元 state、7 項入場條件、正式 `enterThirdWorld()`、entry reconciliation 已進 runtime。
- `worldphaseui.js`：第二／第三紀元共用「主畫面卡 → 條件 → 不可逆確認 → enter → reload → Welcome」框架。
- `thirdworlddungeonui.js`：第三紀元 Dungeon availability policy 已完成；懸賞隱藏、競技場暫時顯示但鎖定、虛空保留。
- `worldtransitionsafety.js`：副本／災厄／特殊遭遇 runtime blocker、World3 offline 暫時 gate、stale Welcome marker 清理已完成。
- `levelprogression.js`：**仍只有 Lv.1～1000 正式 runtime**；第三紀元 Lv.1000～2000 尚未實作，這是下一大批工作。

---

# 1. 操作規範（下一個 ChatGPT 必須遵守）

1. **`main` 是唯一真實來源。** 每次修改前先重新讀相關 actual code，不能只靠本檔或對話記憶。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問確認。
4. 每批修改完成後要：
   - 重新讀 main 實碼；
   - compare base→head；
   - 自我檢查 UI／邏輯／資料寫入／舊檔相容；
   - 回報受影響檔案與 main HEAD。
5. **JS／CSS 任何修改都要同步更新 `index.html` cache-bust。**
6. 優先修改正式 owner；**不要為了方便另做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline**。只有薄 adapter／policy layer 在正式 owner 已存在時才可接受。
7. 能共用第一／第二／第三紀元的規則，要優先做 shared owner，不要把三個世界完全切成三套。
8. GM sandbox／benchmark state 不得污染正式 save。
9. 若現有架構已有 registry／hook／policy owner，優先掛進去，不要 monkey-patch 多層。
10. 第三紀元目前只完成「foundation＋入場＋世界切換＋安全優化」，**Lv2000、十王正式戰鬥、永久削血、界弦核心、高維裝備、正式高維 offline、正式高維 UI、GM 第三紀元都尚未完成**。

---

# 2. 專案定位與世界結構

《文明戰線》是純前端、文字／數值養成、科幻星際 RPG，支援桌機與手機；iPhone Safari 是重要實機環境。

正式世界：

- **銀河紀元**：Lv.1～500，10 大區域、100 地圖，普通／菁英／Boss。
- **宇宙紀元**：Lv.501～1000，10 區、100 隻主線 Boss。
- **高維紀元**：第三紀元。**目前只做到可正式進入高維紀元，但高維正式成長／戰鬥尚未啟用。**

目前 `currentWorldPhase()`：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

正式成長只允許 current phase：

```text
worldProgressionEnabled(world) === (world === currentWorldPhase())
```

因此進入 World3 後，World1／World2 仍保留歷史與回顧，但不再產生正式成長。

---

# 3. Save／Migration／舊資料政策（current runtime）

正式 save key：`frank_text_rpg_save`。

目前：

- `SAVE_SCHEMA_VERSION = 16`
- `SAVE_LOAD_PIPELINE_VERSION = 2`
- `SAVE_NORMALIZATION_PIPELINE_VERSION = 2`
- `SAVE_LEGACY_SUPPORT_POLICY_VERSION = 1`
- future save fail-closed
- Save Write Guard 保留
- GM transient state 仍不得寫入正式 save

正式 normalization order：

```text
worldPhase.secondWorld
→ worldPhase.thirdWorld
→ worldProgress
→ level
→ gear
→ enhancement
→ vip
→ specialization
→ daily
→ dungeon
→ calamity
→ titles
→ offline
→ persistentFlags
```

## 3.1 Schema16 重要政策

- Schema1～15 若夾帶 `thirdWorld`，視為不可信舊資料，migration 會丟棄該 thirdWorld。
- 升 Schema16 前會建立一次 `.pre-schema16-backup-v1` 原始 localStorage 備份。
- 裝備 `world=3` 只在 source schema ≥16 時接受；舊 schema 的 world3 gear 不信任。
- `thirdWorld` 已正式 persistent。

## 3.2 ThirdWorld persistent allowlist

`thirdworldphase.js` 現行：

```text
thirdWorld:
- entered
- completed
- entryVersion
- dimensionalStrings
- coreLevel
- bosses[].currentHp
- story.introSeen
- story.unlockedStage
- story.finalSeen
```

第三紀元 transient 戰鬥狀態不得塞進 save root；未來 100 死、戰鬥壓制、臨時 phase context 等必須維持 runtime transient。

## 3.3 Entry reconciliation

現行：

```text
THIRD_WORLD_ENTRY_RECONCILIATION_VERSION = 1
```

正常經 `enterThirdWorld()` 進入者直接寫 `entryVersion=1`。

若載入的是早期 Schema16／GM／測試資料，發現：

```text
thirdWorld.entered = true
且 entryVersion < 1
```

會一次性 reconciliation：

- 保證 `secondWorld.entered=true`
- 暗物質=0
- 暗能量=0
- lostGear 免費歸還到 inventory
- pending black market 清除
- 舊 offline context 截止
- 寫 `entryVersion=1`

之後不重跑，避免未來 World3 offline 上線後被每次 load 清掉。

---

# 4. World Phase 共用架構（已完成）

正式 owner：`worldphase.js`。

現行共用：

```js
currentWorldPhase()
isWorldEntered()
worldProgressionEnabled()
worldPhaseSnapshot()
primaryWorldResourceSnapshot()
worldPhaseSpecializationRequirement()
worldPhaseEnhancementRequirement()
worldPhaseMarkRequirement()
summarizeWorldEntryRequirements()
runWorldTransition()
```

World metadata：

```text
1 galaxy / 銀河紀元
2 universe / 宇宙紀元 / secondWorld
3 higher-dimensional / 高維紀元 / thirdWorld
```

`worldIndex` 必須是精確整數 1～3；不得 floor 2.9→2。

## 4.1 World transition transaction

`runWorldTransition()` 現行順序：

1. requirements check
2. runtime blocker check
3. JSON backup
4. precommit mutation
5. prepareBeforeSave
6. `save(false)`
7. save 成功才算 commit point
8. postcommit finalize
9. session marker
10. reload

save／mutation 失敗時，會還原 backup，並重新跑正式 normalization owner，包括：

- `normalizeSaveState`
- `normalizeSecondWorldState`
- `normalizeThirdWorldState`
- `normalizeDungeonSaveState`
- `normalizeOfflineSaveState`

避免 JSON rollback 把 runtime accessor／compatibility property 弄丟。

## 4.2 Runtime blocker registry

現行已有：

```js
registerWorldTransitionRuntimeBlocker()
unregisterWorldTransitionRuntimeBlocker()
worldTransitionRuntimeStatus()
```

除了 `battleBusy`、第一／第二世界主線、minimal mode 外，`worldtransitionsafety.js` 會檢查：

- 懸賞
- 競技場
- 鏡像戰
- 虛空
- 銀河文明災厄
- 宇宙文明災厄
- 特殊遭遇

有正式 runtime 進行中時，不允許跨世界。

---

# 5. 第一紀元／第二紀元目前正式基準

## 5.1 銀河紀元

- Lv1～500。
- 10 大區域 × 10 地圖。
- 普通／菁英／Boss。
- 8 專精上限60。
- 10 印記上限10。
- 強化 +0～+20。
- 文明災厄10階。
- 懸賞、競技、鏡像、虛空均為成熟系統。

## 5.2 宇宙紀元

正式主線：

- 100 Boss，Lv505、510、…、1000。
- 10章 ×10 Boss。
- 無普通／菁英。
- 強化 +21～+40。
- 資源：暗物質／暗能量。
- 文明等級 0～10。
- 宇宙文明災厄10隻，550／600／…／1000 解鎖。
- 懸賞每日20，競技場每日20；鏡像／虛空承接。

現行宇宙主線 Boss 基準仍是：

```text
BASE_STAT = 2700
HP : ATK : DEF = 12 : 2 : 1
N = 0..99
M(N) = 1 + 0.015*N
HP  = ceil(2700*12*M)
ATK = ceil(2700*2*M)
DEF = ceil(2700*1*M)
```

Lv505：32,400 / 5,400 / 2,700。  
Lv1000：80,514 / 13,419 / 6,710。

進入 World3 後，宇宙正式主線 combat core 有 phase gate；一般正式挑戰會拒絕，但 `ignoreUnlock:true` 的 GM／回顧通道仍可重用原 combat core。

第二紀元冒險 UI 在 World3 已顯示「宇宙紀元・回顧」，正式挑戰按鈕不再誤導玩家。

---

# 6. 現行等級 owner（注意：第三紀元尚未擴充）

`levelprogression.js` current runtime：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
ABSOLUTE_MAX_LEVEL = 1000
```

`effectiveLevelCap()` 現在仍只有：

```text
未進宇宙 → 500
已進宇宙 → 1000
```

Universe EXP：

```text
Lv500～999：ceil((25 + 4*L) * 250)
Lv1000：need = 0
```

cap 時 EXP normalize 為0。

**重要：高維已可 entered，但 level owner 尚未認 World3，所以下一批必須先完成 Lv1000～2000 owner，不能先做正式高維 settlement。**

---

# 7. 第三紀元 Foundation／入場流程（已完成）

## 7.1 正式 state

目前 blank thirdWorld：

```js
thirdWorld: {
  entered: false,
  completed: false,
  entryVersion: 0,
  dimensionalStrings: 0,
  coreLevel: 0,
  bosses: [10 × { currentHp: 1100000000 }],
  story: {
    introSeen: false,
    unlockedStage: 0,
    finalSeen: false
  }
}
```

目前 10 王只有持久化 HP 容器；**正式十王 data／stats／能力／戰鬥尚未實作。**

## 7.2 進入高維紀元的 7 項條件

全部必須成立：

1. Lv1000
2. 宇宙紀元已 entered，且第100王已擊破
3. 宇宙最終劇情已完成
4. 五部位強化 +40
5. 文明等級 Lv10
6. VIP ≥20
7. 8 專精 Lv60
8. 10 印記 Lv10

UI 對玩家呈現為 7 項，其中「宇宙主線完成」是「第100王＋最終劇情」雙條件合併項。

正式 API：

```js
thirdWorldEntryRequirements()
canEnterThirdWorld()
enterThirdWorld()
```

VIP 以 `vipPoints` 正式 owner 推導 VIP level，不信任 stale `vipLevel`。

## 7.3 進入時保留

- 等級與 EXP
- VIP
- 已裝備與背包裝備
- +40
- 8 專精
- 10 印記
- 文明等級10
- 鏡像進度
- 虛空進度
- 舊稱號
- 銀河／宇宙主線、災厄、歷史、戰線紀錄

## 7.4 進入時清除／截止

- 暗物質 → 0
- 暗能量 → 0
- 宇宙 offline samples/context/pending settlement
- pending black market／未處理特殊遭遇
- 不可跨世界延續的 runtime battle context

### lostGear 決策（已正式實作）

進 World3 前，既有 `lostGear` **免費歸還 inventory**，再清空 `lostGear`；不直接刪除。

原因：進入 World3 後暗物質歸0，且入場要求 VIP20，未來死亡裝備已完全保護。

## 7.5 Entry 後

成功後：

```text
currentWorldPhase() = 3
World1 progression = false
World2 progression = false
World3 progression = true
```

但目前尚未有 World3 正式戰鬥可玩。

---

# 8. World Phase UI／Welcome（已完成）

`worldphaseui.js` 已由宇宙專用 UI 收斂成第二／第三紀元共用流程。

流程：

```text
主畫面新紀元卡
→ 查看突破條件
→ 進入紀元
→ 不可逆確認
→ enter
→ save
→ reload
→ Welcome
```

第二紀元舊 API 保留相容；第三紀元使用同一骨架。

## 8.1 高維確認畫面

會明確告知：

- 保留內容
- 暗物質／暗能量與舊 offline 截止
- lostGear 免費歸還
- 懸賞戰於高維關閉
- 競技場／鏡像／虛空保留
- 操作不可逆

## 8.2 Welcome

World2 marker：

`civilization_second_world_just_entered_v1`

World3 marker：

`civilization_third_world_just_entered_v1`

只允許 current world 對應 Welcome 顯示；World3 不會誤跳 World2 Welcome。

`worldtransitionsafety.js` 會清 stale marker：

- World3 清 World2 marker
- World2 清 World3 marker
- World1 清兩者

高維 Welcome 目前只承諾已完成內容；不應提前宣稱高維正式戰鬥已開放。

---

# 9. 第三紀元副本目前行為（已完成的暫態政策）

正式 policy owner：`thirdworlddungeonui.js`。

共用 API：

```js
registerDungeonModeAvailabilityPolicy()
unregisterDungeonModeAvailabilityPolicy()
dungeonModeAvailability()
```

World3 目前：

### 懸賞戰

```text
visible = false
enabled = false
```

並且正式公共入口也有 business gate，不只藏 UI。

### 競技場

**保留卡片與既有進度，但目前鎖定不可挑戰。**

顯示：

```text
高維競技場調整中
等待高維競技場開放
```

說明：

> 高維紀元競技場規則與戰力曲線尚未定案，既有競技場進度已完整保留。

底層也會攔：

```js
openArenaDungeon()
startArenaDungeon()
startArenaStageFight()
```

所以不能繞過按鈕跑 World2 Arena。

### 鏡像戰

保留、正常可玩。

### 虛空

保留、正常可玩。

### Dungeon 資源

使用 `primaryWorldResourceSnapshot()`：

```text
World1 → 金幣
World2 → 暗物質（副資源暗能量）
World3 → 維度之弦
```

---

# 10. Offline 現況與第三紀元暫時安全政策

`offlinestatecore.js` 仍是 save normalization owner；`offlineprogress.js` 仍是正式 runtime pipeline。

目前高維正式 offline **尚未實作**。

已完成 future-proof：

- World2 sample 只有 `currentWorldPhase()===2` 才可建立／完成。
- World3 時 `resolveOfflineFarmTarget()` 不再把 `secondWorld.entered=true` 誤認成 World2。
- World3 正式 offline owner 尚未存在時，load 前會截止舊 pending settlement，避免高維角色 reload 跳出「宇宙紀元 offline sample」提示。

暫時 gate 條件：

```text
current phase = 3
且 THIRD_WORLD_OFFLINE_SETTLEMENT_VERSION 尚不存在
```

未來第8批正式建立 World3 offline 後，只要建立 `THIRD_WORLD_OFFLINE_SETTLEMENT_VERSION`，此暫時 gate 應自然退出；**不要再另建第二套 thirdworldoffline pipeline**。

---

# 11. Integrity／安全檢查現況

Schema16／第三紀元 foundation 已納入 `integritycontract.js`。

第三紀元 foundation probe 會驗證：

- blank state
- normalization／allowlist
- current phase
- progression gate
- entry requirements
- 最終100王＋最終故事雙 gate
- entry mutation
- 暗物質／暗能量歸0
- lostGear歸還
- offline清除
- pending special清除
- World2正式戰鬥在 World3 被擋，但 `ignoreUnlock` 回顧／GM通道保留
- Welcome marker
- Dungeon policy

另外新增：

`thirdworldentryoptintegrity.js`

目前會驗證：

- transition subsystem safety V3
- Dungeon availability policy
- World3 Arena provisional gate
- offline current-world policy
- World3 legacy offline settlement gate
- stale Welcome marker cleanup
- World2 bounty／arena regression
- World3 bounty hidden
- World3 arena visible but disabled
- World3 void enabled

GitHub current main 沒有 required status checks；不要把「沒有 status」講成 CI 綠燈。

---

# 12. VIP／專精／文明／裝備重要現行規則

## VIP

- VIP 等級無上限。
- 門檻：`1000 × VIP等級²`。
- 每級：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25pp、閃避 +0.25pp。
- VIP20 是特權畢業，不是等級 cap。
- `vipPoints` 是 source of truth。

Loot perks：

- VIP8：15%優先最弱部位
- VIP14：5%品質+1
- VIP16：Boss 15%額外1件
- VIP18：Boss 10%品質+1
- VIP20：死亡裝備完全保護

第三紀元裝備第8批仍要沿用這些正式 owner，不可複製 VIP loot 規則。

## 專精

8種，上限60：

- 實戰訓練
- 搜刮
- 鑑價
- 先制
- 連擊
- 穿透
- 反擊
- 汲取

## 印記

10種，上限10。

## 文明等級

宇宙0～10；目前 Lv10 最終傷害倍率 ×1.50。

## 強化

- 銀河 +0～+20
- 宇宙／高維目前維持最高 +40
- 第三紀元**不開 +41～+60**

---

# 13. GM 現況

現有 GM 已有：

- 匯出／匯入 JSON
- 倍速1×／1.5×／2×
- 角色能力測試：VIP／專精／強化／印記／文明等級
- 正式角色同步到測試設定
- 戰力基準：地圖怪／懸賞／競技／虛空／鏡像／文明災厄
- 銀河／宇宙紀元切換
- 背景戰鬥與 Fast Catch-up
- 測試摘要一鍵複製

**目前 GM 第三紀元正式能力尚未做。**

不要現在誤認 `thirdWorld` foundation state 等於 GM 已支援高維戰鬥。

---

# 14. 第三紀元已確認但尚未實作的正式規則總表

以下屬**已確認設計、尚未全部進 current runtime**。實作時仍須先重新讀 main。

## 14.1 十王固定基準

10 王，每隻最大 HP：

```text
1,100,000,000
```

總 HP：

```text
11,000,000,000
```

十王：

1. 破界天裁：ATK ×1.15
2. 永劫重垣：DEF ×1.15
3. 宿因天秤：暴擊 +6pp
4. 無相彼岸：閃避 +6pp
5. 萬象迴演：連擊 30%→40%
6. 維隙之刃：穿透 30%→40%
7. 逆因輪轉：反擊 30%→40%
8. 噬界深淵：汲取 30%→40%
9. 先驗之瞳：先制 +60→+80%
10. 高維原點：ATK ×1.08、DEF ×1.08

100% HP 時共通基準：

```text
ATK 8000
DEF 8000
暴擊 10%
閃避 10%
先制 +60%
連擊 30%（追加50%傷害）
穿透 30%（忽略25% DEF）
反擊 30%（40%傷害）
汲取 30%（回復實際傷害10%）
```

## 14.2 90%～10% 每階共通強化

每下降一階：

```text
ATK +600
DEF +1200
暴擊 +2pp
閃避 +2pp
```

額外能力：

- 70% 鎮心：玩家最終暴擊 -5pp
- 60% 壓制：玩家最終閃避 -5pp
- 50% 韌性：玩家暴擊加成部分 -30%
- 40% 復仇：玩家暴擊後，Boss 下一次成功命中 50% 轉為暴擊
- 30% 反噬：Boss 存活且受到實際 HP 傷害時，15% 機率反射30%
- 20% 無視：5% 攻擊忽略 DEF
- 10% 戰意：開場75%，每回合 ATK +2%，最多+10%

第三紀元不使用 trait pool。

## 14.3 5pp 戰線規則

只看**仍存活**的 Boss。

若目標剩餘百分比比目前存活 Boss 的最高剩餘百分比低至少5pp，不能開始下一場：

```text
100 vs 95.1 → 可打
100 vs 95.0 → 鎖定
```

一場合法戰鬥可以跨過5pp門檻，先完成該場結算，再停止續戰。

死亡 Boss 退出5pp計算。

## 14.4 永久淨削血／EXP／維度之弦

正式每場：

```text
有效永久削血
= max(0, 場初正式HP - 場末正式HP)

EXP = 有效永久削血
維度之弦 = 有效永久削血
```

Boss 汲取只允許回到**本場開始正式 HP**，不能補回歷史已永久削掉的 HP。

## 14.5 界弦核心

Lv0～10。

每級：

```text
1,000,000,000 維度之弦
```

總共10B。

死亡壓制：

```text
每死一次降低 Boss 壓制百分點
= 0.50pp - coreLv × 0.04pp
```

所以：

```text
Lv0 → -0.50pp / death
Lv10 → -0.10pp / death
```

最多100死，因此理論最大死亡壓制：50%→90%。

## 14.6 正式連戰

第三紀元正式模式：

- 不提供單場正式挑戰
- 每次開始 death count=0
- 最多100死
- 停止即清零
- reload清零
- 換王必須中止
- 王死亡停止
- 跨階停止
- 稱號／劇情門檻停止
- 5pp鎖停止
- 手動停止
- pagehide／reload transient 清理

## 14.7 裝備

第三紀元裝備延伸到 Lv2000：

- 只有傳說／神話
- 95%／5%
- 每場正式高維戰鬥至少1件
- VIP8／14／16／18照常生效
- 強化仍最高+40
- 名稱池依十王**總剩餘 HP 區間**，不是依單王
- 出售不給維度之弦／其他第三紀元貨幣

## 14.8 高維稱號門檻

以十王總剩餘百分比總和：

```text
≤900  破界初臨
≤800  維外行者
≤700  超界之軀
≤600  高維真形
≤500  萬維共鳴
≤400  界律共主
≤300  維序凌駕
≤200  超維至尊
≤100  諸維唯一
0     萬維之上
```

## 14.9 回顧戰

已擊破王：

- 固定10%最終型態
- 滿HP
- 最高 stats／全部共通能力＋個體特化
- 單場
- 無 EXP
- 無維度之弦
- 無裝備
- 無正式進度

## 14.10 第三紀元 offline 最終規則

未來正式 World3 offline：

- 使用近期正式高維 sample
- 不分王
- 不削王 HP
- 不給 EXP
- 不給維度之弦
- 不推稱號
- 不推劇情
- 不推核心
- 只模擬裝備掉落機會
- 玩家速度最高1.5×；GM仍可2×測試

必須接現有 `offlinestatecore.js`／`offlineprogress.js`，不要另做第二套 pipeline。

---

# 15. 尚未完成：剩餘 8 批正式施工順序

以下是後續唯一有效的大批順序。**第 1～2 大批已完成；目前下一批是第 3 批。**

## 第 3 批：第三紀元等級 Lv1000～2000

修改核心：`levelprogression.js`。

正式規則：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
```

`effectiveLevelCap()` 必須依 world gate：

```text
未進宇宙 → 500
進宇宙未進高維 → 1000
進高維 → 2000
```

第三紀元：

```text
Lv1000 → Lv2000
每級固定 10,000,000 EXP
```

Lv2000：

- EXP固定0／封頂
- 仍可打王
- 仍可得維度之弦
- 仍可掉裝
- 仍可推十王正式進度

**這批只把 EXP／level owner 做乾淨；不要順手做高維戰鬥。**

## 第 4 批：十王資料＋5pp 戰線規則

建立／正式 owner：`thirdworlddata.js`。

內容：

- 10王名稱
- 11億固定HP
- 基礎四圍
- 個體特化
- 90～10%各階 stats／能力
- 稱號門檻
- 5pp判定
- 王是否可挑戰
- 總剩餘HP
- 當前階段
- 已死亡王退出5pp計算

建議純函式：

```js
thirdWorldBossStage()
thirdWorldBossStats()
thirdWorldBossAbilities()
thirdWorldTotalRemainingPercent()
thirdWorldChallengeAllowed()
thirdWorldTitleTier()
```

UI／combat／GM 只讀這一套 data owner。

## 第 5 批：高維正式戰鬥核心

建立：`thirdworldcombat.js`。

**不可自己重做 combat engine。** 優先接：

- `combatcore.js`
- specialization
- mark
- VIP
- 裝備能力
- `combatfx.js`

新增 Boss 端能力：

- 先制
- 連擊
- 穿透
- 反擊
- 汲取
- 鎮心
- 壓制
- 韌性
- 復仇
- 反噬
- 無視
- 戰意
- 十王個體特化

本批目標：**單次 headless 高維戰鬥能正確算完**。先不要正式 UI 連戰。

## 第 6 批：永久削血＋維度之弦＋正式結算

建立：`thirdworldprogress.js`。

核心：

```text
有效永久削血 = max(0, 場初正式HP - 場末正式HP)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

正式結算順序固定：

1. 戰鬥完成
2. 王 HP 寫回
3. 算永久淨削血
4. 發 EXP
5. 發維度之弦
6. 裝備掉落
7. 升級
8. 稱號／劇情
9. 王死亡
10. 強化跨階
11. 5pp
12. 決定是否續戰

## 第 7 批：100死連戰＋界弦核心

正式連戰：

- 無單場正式挑戰
- death count 每次run從0開始
- 最多100死
- 停止／reload／換王清零
- 王死／跨階／稱號劇情／5pp／手動／pagehide 都停止

界弦核心：Lv0～10，每級10億維度之弦。

壓制公式：

```text
0.50pp - coreLv × 0.04pp / death
```

核心本質是「連戰死亡狀態調節器」，不要當普通角色 stat 另外塞一套 combat formula。

## 第 8 批：高維裝備＋掉落＋離線

裝備：

- 延伸現有公式至Lv2000
- 傳說95%／神話5%
- 每場至少1件
- VIP8／14／16／18照常
- 強化仍+40
- 名稱依十王總剩餘HP區間
- 出售不產生維度之弦

Offline：

- 接現有 `offlinestatecore.js`／`offlineprogress.js`
- 近期正式高維 sample、不分王
- 只模擬裝備掉落機會
- 不削HP、不給EXP／維度之弦、不推稱號／劇情／核心

## 第 9 批：正式 UI／回顧／稱號／劇情框架

建立：`thirdworldui.js`。

主畫面：新增高維紀元正式入口／摘要。

冒險頁不是10區，而是「高維戰線」：桌機2×5十王卡。

頂部摘要：

- 十王總剩餘HP
- 高維稱號
- 維度之弦
- 界弦核心

王卡：

- 王名
- 個體特化
- HP／%
- 階段
- 可挑戰／5pp鎖
- 已擊破／回顧

回顧：已擊破王10%最終型態、滿HP、單場、無收益。

World review 分頁：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

session only。

稱號／劇情先做 trigger framework；具體故事正文尚未定，不得自行創作正式劇情。解鎖點先做900／800／…／0%。

## 第 10 批：GM＋Integrity＋收尾

正式系統穩定後才做 GM，避免 duplicate logic。

### GM角色能力測試

新增：

- 高維紀元
- Lv1000～2000
- 界弦核心 Lv0～10

### GM戰力基準

新增高維存在，可選：

- 王
- 100／90／80…10%
- runs
- 模擬100死連戰

輸出：

- 勝率
- 回合
- 總傷害
- 永久淨削血
- 王回血
- 玩家死亡
- 剩餘HP
- 跨階段資訊

### GM正式管理

只允許改根資料：

- `entered`
- `completed`
- level
- 維度之弦
- coreLv
- 十王 `currentHp`

不提供直接改：

- 王階段
- 王能力
- 5pp
- 稱號階
- 劇情階

這些全部由正式 data owner 推導。

---

# 16. 目前未定案／禁止自行補完

以下目前沒有正式定案：

1. 高維競技場完整規則與戰力曲線。現在只保留卡片與進度、禁止挑戰。
2. 第三紀元正式劇情逐段文字／最終事件正文。
3. 若之後實測十王平衡需要調整，必須基於 GM benchmark 實測，不得私自改既定技能語意。

不得因「缺內容」自行發明正式設定。

---

# 17. 第二大批完成後的重要 bug／架構修正紀錄

本輪已完成並需保留：

1. 第三紀元 entry requirement 由正式 owner 判定，不由 UI 自算。
2. World2／World3 共用突破 UI，不建立 nearly duplicate modal。
3. World3 transition 使用 `runWorldTransition()`，不另做 save transaction。
4. World3 entry lostGear 改為免費歸還，避免暗物質歸0後卡死。
5. World transition runtime blocker 改 registry，涵蓋副本／災厄／特殊遭遇。
6. rollback 後重新 normalization，修正 JSON clone 可能遺失 runtime accessor 的風險。
7. Schema16 既有 `thirdWorld.entered=true` 加一次性 entry reconciliation。
8. World3 後 World2 formal combat 有底層 gate，回顧／GM bypass保留。
9. World3 Dungeon bounty 不只UI隱藏，正式入口也封鎖。
10. World3 Arena 暫時顯示但 disabled，且底層 Arena entry也封鎖。
11. Offline 改 current-world future-proof；World3 未上正式 offline 前不誤吃 World2 sample。
12. World3 Welcome 不再誤跳 World2 marker；stale marker會主動清除。
13. Dungeon resource 顯示使用 `primaryWorldResourceSnapshot()`，World3顯示維度之弦。

---

# 18. 下一個對話如何接手

新對話第一句建議直接使用：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源；先不要修改。確認目前第1～2大批與兩批優化已完成，下一個正式施工項目是「第3批：第三紀元 Lv1000～2000 等級／EXP owner」。不要提前做第4～10批，也不要另建第二套公式或 pipeline。

若使用者之後直接說：

> 「第3批 修改後自我檢查」

則可直接依本檔第15節與 current main 實碼進行修改；完成後必須重新讀 main、compare、自檢並回報受影響檔案與 commit SHA。
