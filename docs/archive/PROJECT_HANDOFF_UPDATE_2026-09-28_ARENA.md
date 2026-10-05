# 《文明戰線》PROJECT HANDOFF 補充：宇宙紀元競技場高階平衡

> **封存註記：本檔已移入 `docs/archive/`，只供歷史追溯，不是 current runtime owner。**

更新日期：2026-09-28（UTC+8）
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼仍是唯一真實來源。**
> 本檔只補記 2026-09-28 宇宙紀元競技場 Rank 8～10 的最新高階平衡，供後續專案／新對話快速承接。若本檔與 current `main` 衝突，一律以 current `main` 為準。

---

## 1. 這次修改的原因

Lv.1000 滿裝角色在舊公式下測試：

- Rank 8｜500 次正式戰力評估：489 / 500 = 97.8%
- Rank 9｜500 次正式戰力評估：478 / 500 = 95.6%
- Rank 10｜500 次正式戰力評估：482 / 500 = 96.4%

問題在 Rank 9：宇宙紀元 Rank 10 的解鎖需要前一階正式評估達 485 / 500，也就是 97%。若 Lv.1000 滿裝角色本身都只能約 95～96%，剛過 Lv.950 的正常玩家會被競技場卡住主進程。

正式設計目標改為：

- Lv.1000 滿裝角色在 Rank 9 應穩定高於 98%；
- 讓剛跨過 Lv.950、裝備尚未完全封頂的角色仍有合理空間穩定達到 97%，順利解鎖 Rank 10；
- 不降低正式解鎖門檻 485 / 500；
- 不改三連戰機制、特性、積分、每日次數、文明傷害 owner 或其他副本；
- 只調第二紀元 Arena Rank 基礎倍率曲線。

---

## 2. 最新正式 Rank 曲線

`dungeonarena.js` 的宇宙紀元 Rank 曲線已改為：

```text
x = Rank - 1

HP Rank倍率     = 1.68 + 0.05x - 0.0027x²
傷害 Rank倍率   = 1.52 + 0.04x - 0.0019x²
DEF Rank倍率    = 1.11 + 0.022x - 0.00085x²
```

正式 source：

```js
const SECOND_WORLD_ARENA_RANK_CURVE=Object.freeze({
  hp:Object.freeze({base:1.68,linear:.05,quadratic:-.0027}),
  damage:Object.freeze({base:1.52,linear:.04,quadratic:-.0019}),
  def:Object.freeze({base:1.11,linear:.022,quadratic:-.00085})
});
```

調整原則：

- `base` 不變；
- `linear` 不變；
- 只加強負二次項；
- Rank 1 完全不變；
- 前中期差異很小；
- 主要放鬆 Rank 8～10，避免高階解鎖卡死。

---

## 3. 高階倍率校準

新公式：

| Rank | HP | 傷害 | DEF |
|---|---:|---:|---:|
| 7 | 1.8828 | 1.6916 | 1.2114 |
| 8 | 1.8977 | 1.7069 | 1.2224 |
| 9 | 1.9072 | 1.7184 | 1.2316 |
| 10 | 1.9113 | 1.7261 | 1.2392 |

關鍵比較：

```text
舊 Rank 8：HP 1.9565／傷害 1.7510／DEF 1.2444
新 Rank 9：HP 1.9072／傷害 1.7184／DEF 1.2316
```

因此新 Rank 9 的核心三圍已全面低於舊 Rank 8。舊 Rank 8 對 Lv.1000 滿裝角色的 500 場正式評估已達 97.8%，所以新 Rank 9 刻意留出安全邊際，不是只把 95.6% 微調到剛好 97%。

後續若再次實測，優先觀察：

- Lv.1000 滿裝 Rank 9 的 500 場正式評估；
- 理想落點約 98.5～99% 左右；
- 若滿裝已穩定 98%+，就先不要再降；
- 真正要驗證的是 Lv.950 附近正常裝備角色能否穩定 ≥97%。

---

## 4. 版本與舊評估失效

Arena compatibility 已同步更新：

```text
balanceVersion = 7
rankBalanceVersion = 4
```

正式 owner：`dungeonprogress.js`

用途：舊平衡版本的 500 場評估結果會失效，需要按照新公式重新評估，避免舊 95.6% 等結果繼續參與 Rank 解鎖判定。

正式解鎖門檻沒有修改：

```text
ARENA_ASSESS_RUNS = 500
ARENA_ASSESS_CLEAR_TARGET = 485
485 / 500 = 97%
```

---

## 5. 本次刻意沒有修改的項目

這次不要誤認為 Arena 全面重做。以下全部維持原正式 owner／規則：

- 第一紀元 Arena Rank 曲線；
- 三連戰結構；
- normal / hard / extreme 位置倍率；
- 各 Stage HP／damage／DEF multiplier；
- 暴擊／閃避倍率與 cap；
- monster trait 數量與機率；
- 文明等級最終傷害與 Arena HP civilization compensation；
- Arena 積分；
- 每日次數；
- 500 場正式評估；
- 485 / 500（97%）解鎖門檻。

後續若要再調 Arena，先用 current main 的正式 `dungeonarena.js` 與 `dungeonprogress.js` 重新確認，不要從舊對話抄舊係數。

---

## 6. 這次實際改動檔案

正式程式與 guard：

```text
dungeonarena.js
dungeonprogress.js
tests/runtime/js-integrity.js
index.html
```

主要 commit：

```text
4bf7def0d895ffc5a542a0f32ef79e94e33a8fd5   調整宇宙 Arena Rank 曲線
564d4330099fa9a3307f0c7daa8ec41ba041926e   同步 Runtime Arena guard／版本
f53d8de694df6ab27b2307121f2e4a45ceeb582d   更新 index cache-bust
b702c53da9b625ae342d920beb4b35bf3b241a1e   修正 Runtime guard 中既有 GM 虛空 owner 檢查來源
```

最後一個 commit 的內容不是 Arena 數值調整，而是修正同步 Runtime guard 時誤動的一條既有 GM 虛空檢查，將：

```text
voidMirageBaseStats(floor)
```

重新檢查 `dungeongm.js`，避免誤測 `dungeonvoid.js` 本身。

---

## 7. 自我檢查／CI

在 `b702c53da9b625ae342d920beb4b35bf3b241a1e`：

- Runtime Integrity #889：`success`
- full JavaScript syntax and owner integrity：`success`
- unlimited VIP integrity：`success`
- GM mainline HP lock integrity：`success`
- background asset integrity：`success`
- project documentation integrity：`success`

這代表這次 Arena 新係數、Balance V7／Rank Balance V4、Runtime guard 與既有 owner 檢查目前已一致。

---

## 8. 給下一個 ChatGPT 的承接提醒

若後續對話處理宇宙紀元競技場，至少先讀：

```text
PROJECT_HANDOFF.md
PROJECT_HANDOFF_UPDATE_2026-09-28_ARENA.md
dungeonarena.js
dungeonprogress.js
arenagm5.js
gmpowerbenchmark.js
gmpowerbenchmarkstate.js
tests/runtime/js-integrity.js
index.html
```

並遵守：

1. `main` 是唯一真實來源；
2. 目前宇宙 Arena Rank 曲線以 `-.0027 / -.0019 / -.00085` 為正式值；
3. `balanceVersion=7`、`rankBalanceVersion=4`；
4. Rank 10 解鎖仍是前一階 500 場至少 485 勝（97%）；
5. 這次調整的目的，是讓 Rank 9 不再成為 Lv.950～1000 的人物進度卡點；
6. 除非使用者重新開啟平衡討論，否則不要自行再改這三條係數。
