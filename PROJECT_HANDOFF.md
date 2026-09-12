# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 實際程式碼永遠是唯一真實來源。**
>
> 若本文、歷史對話、舊截圖或舊規格與目前 `main` 衝突，一律重新讀取 `main`。

更新日期：**2026-09-12**

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `data.js` legacy `SAVE_VERSION = 9`
- 正式 schema：`savemigration.js` 的 `SAVE_SCHEMA_VERSION = 10`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面與手機都要支援；iPhone Safari 是重要真機環境

修改規範：先讀 `main`、先搜尋引用、使用者未明確授權不得改；JS/CSS 修改後要更新 `index.html` cache-bust；修改後回讀與 compare。GitHub 寫入成功不等於 GitHub Pages／iPhone Safari runtime 已驗證。

---

## 2. 世界與主線

十大區域：
1. 地球戰爭
2. 太陽系戰爭
3. 近星戰爭
4. 星際邊疆
5. 獵戶臂戰爭
6. 銀河邊境
7. 銀河中域
8. 銀河核心外圍
9. 銀河核心戰爭
10. 銀河統合戰爭

每區10張地圖，共100張，Lv1～500。

主線正式玩家模式只有：
- 單場戰鬥
- 連續戰鬥

Boss 永遠單場。Lv500後 EXP 1:1 轉金幣；Lv500死亡不扣EXP，但裝備遺失規則照常，除非VIP20。

---

## 3. 副本

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

副本次數由主線戰鬥累積副本進度取得。

### 懸賞戰
定位：高 EXP、高金幣、多裝備。玩家UI不公開內部權重與精確掉落機率。支援單次／連續；每場真正開始前才扣次數，每場結束回滿HP。

---

# 4. 競技場：最新唯一有效制度

## 4.1 正式名稱

競技場共有10個，正式名稱永遠是「主線區域名稱＋競技場」：

1. 地球戰爭競技場
2. 太陽系戰爭競技場
3. 近星戰爭競技場
4. 星際邊疆競技場
5. 獵戶臂戰爭競技場
6. 銀河邊境競技場
7. 銀河中域競技場
8. 銀河核心外圍競技場
9. 銀河核心戰爭競技場
10. 銀河統合戰爭競技場

**不要把正式競技場命名成普通／困難／極限。** `normal / hard / extreme` 只保留作底層位置模板相容 id。

## 4.2 逐個解鎖＋最近最多3個

永久進度：

```text
state.dungeon.arena.highestArenaUnlocked
```

Lv15 剛開放時只有第1個。

顯示規則：

```text
已開1個 → 1
已開2個 → 1 2
已開3個 → 1 2 3
已開4個 → 2 3 4
已開5個 → 3 4 5
...
已開10個 → 8 9 10
```

玩家只能挑戰目前可見的最近最多3個競技場。

## 4.3 位置算法

正式玩家沒有第二層「低／中／高難」選擇。玩家直接點區域競技場進準備頁。

目前可見競技場由左至右：

```text
左 → 低位置算法（internal normal）
中 → 中位置算法（internal hard）
右 → 高位置算法（internal extreme）
```

只開1個時第1個是低；開2個時是低／中；開3個以上固定低／中／高。

同一競技場會隨新競技場解鎖而從右→中→左。例如第3個：123時高、234時中、345時低。

## 4.4 HP／ATK／DEF 與暴閃／特性分離

`arenapositioncore.js` 是正式位置模型 overlay。

HP／ATK／DEF：只看實際競技場 Rank，位置不改變三維。

共通三戰物理基準：

```text
S1: hp .60 / damage .57 / def .78
S2: hp .69 / damage .64 / def .80
S3: hp .78 / damage .73 / def .82
```

Rank倍率：

```text
RankHp     = 1 + 0.05*(R-1)
RankDamage = 1 + 0.015*(R-1)
RankDef    = 1 + 0.03*(R-1)
```

暴擊／閃避／怪物特性則只依左／中／右位置模板。最高仍為 crit23 / dodge20，特性最多2個。

## 4.5 VIP積分：整組視窗往前時一起提高

**這是目前最新正式規則，取代舊的「每個Rank各自套低中高公式」。**

初始123：

```text
左 180
中 300
右 420
```

每當整組競技場往前推一格，三個位置的全通積分全部 +130：

```text
123 → 180 / 300 / 420
234 → 310 / 430 / 550
345 → 440 / 560 / 680
456 → 570 / 690 / 810
567 → 700 / 820 / 940
678 → 830 / 950 / 1070
789 → 960 / 1080 / 1200
8910 → 1090 / 1210 / 1330
```

因此同一競技場移動位置時，積分也會更新。例如第3個競技場：
- 123時在右 → 420
- 234時在中 → 430
- 345時在左 → 440

正式積分來源在 `arenapositioncore.js`：
- `getArenaPointTotalForRankPosition(rank, positionId)`
- `getArenaPointConfig(rank, positionId)`

三戰分段積分沿原位置 template 的 stageWeights 比例拆分。

`arenapositioncore.js` 會同步接管：
- 玩家卡片全通積分
- 正式戰鬥實際 VIP 積分入帳
- 準備頁全通積分
- 單次結算
- 連續挑戰總積分
- GM測試積分

`dungeonarena.js` 內舊 `rank1Total + 130*(R-1)` 仍可存在作歷史相容底層，不是目前正式玩家積分模型。

## 4.6 解鎖下一個競技場

要解鎖第 `N+1` 個競技場，必須同時：

```text
目前最高競技場戰力評估通過
AND
主線第 N+1 區域已解鎖
```

沒有前三區免主線例外。

目的：想取得更高競技場與更高 VIP 積分，必須持續推主線，不能停在低等／低區域就一路解鎖高積分競技場。

戰力評估規則：500次完整三連戰，至少90%全通。第1個最高時用低位置、第2個最高時用中位置、第3個以上最高都在右側，用高位置。

戰力達標後 `promotionReady=true`；若主線尚未開，資格保留。解鎖下一個後清空本次評估資料，新最高競技場成為下一個評估目標。

## 4.7 單次／連續挑戰

玩家直接點可見區域競技場 → 準備頁 → 單次或連續。

- 一個完整三連戰＝一輪
- 三戰內不回血
- 新一輪重新滿血
- 下一輪真正開始前才扣次數
- 失敗、次數不足、手動停止會結束
- 手動停止完成目前整輪後才停

---

## 5. 玩家介面與遊戲說明

`arenaplayerflow2.js`：
- 卡片正式名稱只用區域競技場名稱
- 不再顯示第二層低中高選單
- 卡片顯示「穩定挑戰／進階挑戰／最高挑戰」
- 卡片直接顯示目前正確的三戰全通 VIP 積分
- 首頁簡短說明：競技場隨主線逐步解鎖，最多顯示最近3個；越右側挑戰與積分越高
- 解鎖條件簡化為「戰力評估通過＋對應主線區域已開放」

`gameguidearena5.js` 玩家說明採精簡版，不公開過多內部公式／暴閃上限／特性機率，只說明：
- 十大區域競技場
- 主線＋戰力雙門檻
- 最近最多3個
- 越右挑戰越高
- 整組往前時積分一起提高
- 三戰制與單次／連續

---

## 6. GM競技場測試

`arenagm5.js`：
- 可選第1～10個正式區域競技場
- 另選左位（低）／中位（中）／右位（高）位置算法
- 100次完整三連戰可自由測 Rank＋位置
- 500次正式評估自動使用該Rank正常作為最高競技場時的位置
- GM積分同步使用正式移動視窗積分模型
- GM測試不扣正式副本次數、不給正式VIP積分、不修改正式promotionReady

---

## 7. 存檔／遷移

`dungeonprogress.js`：
- `highestArenaUnlocked` 是正式競技場進度
- `positionModelVersion = 1`
- 舊制度第一次載入位置模型時，舊戰力評估資格清空，但已解鎖競技場進度不倒退
- `activeRank` 只是目前玩家點選的可見競技場

---

## 8. 重要檔案

- `dungeonprogress.js`：副本進度、競技場永久進度與遷移
- `dungeonarena.js`：舊底層競技場三連戰／相容 difficulty template
- `arenapositioncore.js`：**正式位置模型、物理三維正規化、積分模型、正式入帳、500次評估**
- `arenawindowcore.js`：最高競技場、最近3個、主線條件、解鎖
- `arenaplayerflow2.js/.css`：正式玩家競技場 UI
- `arenagm5.js`：正式 GM 競技場沙盒
- `gameguidearena5.js`：正式玩家說明 patch
- `arenaranklabels.js`：舊名稱相容層
- `dungeonplayerui.js` / `dungeongm.js`：較早相容層，正式呈現由後載入新版覆寫

---

## 9. 已知技術債

1. `dungeonarena.js` 仍有 `normal/hard/extreme` 與「普通／困難／極限競技場」歷史字串，非正式玩家名稱。
2. `dungeonarena.js` 原本的 HP/ATK/DEF difficulty multipliers 會在正式 runtime 被 `arenapositioncore.js` 正規化。
3. `dungeonarena.js` 原本的 Rank積分表屬舊底層；正式積分由 `arenapositioncore.js` 接管。
4. `arenawindowcore.js`、`arenaplayerflow2.js` 檔名保留歷史命名。
5. `gameguide.js`、`dungeongm.js` 可仍有舊文字／舊測試；正式呈現由新版 patch 接管。
6. `ui.js` 仍可能保留舊 battle-count 設定；正式主線由 `continuousbattle.js` override。

---

## 10. 驗證狀態

截至本次更新：
- GitHub `main` 修改後需完成靜態回讀與 commit compare。
- **尚未完成 GitHub Pages／桌面瀏覽器／iPhone Safari 的完整 runtime 驗證。**

下一個對話承接時，先讀本文件，再重新讀：
- `dungeonprogress.js`
- `dungeonarena.js`
- `arenapositioncore.js`
- `arenawindowcore.js`
- `arenaplayerflow2.js`
- `arenagm5.js`
- `gameguidearena5.js`
- 完整 `index.html`

以 `main` 為唯一真實來源。
