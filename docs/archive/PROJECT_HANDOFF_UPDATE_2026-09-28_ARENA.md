# 《文明戰線》PROJECT HANDOFF 補充：宇宙紀元競技場高階平衡

更新日期：2026-09-28（UTC+8）
分支：`main`

> **歷史補充文件。GitHub `main` 的實際程式碼仍是唯一真實來源。**
> 本檔只補記 2026-09-28 宇宙紀元競技場 Rank 8～10 的當時高階平衡；若本檔與 current `main` 衝突，一律以 current `main` 為準。

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

## 2. 當時 Rank 曲線

`dungeonarena.js` 當時改為：

```text
x = Rank - 1
HP Rank倍率     = 1.68 + 0.05x - 0.0027x²
傷害 Rank倍率   = 1.52 + 0.04x - 0.0019x²
DEF Rank倍率    = 1.11 + 0.022x - 0.00085x²
```

正式 source 當時為：

```js
const SECOND_WORLD_ARENA_RANK_CURVE=Object.freeze({
  hp:Object.freeze({base:1.68,linear:.05,quadratic:-.0027}),
  damage:Object.freeze({base:1.52,linear:.04,quadratic:-.0019}),
  def:Object.freeze({base:1.11,linear:.022,quadratic:-.00085})
});
```

高階倍率：

| Rank | HP | 傷害 | DEF |
|---|---:|---:|---:|
| 7 | 1.8828 | 1.6916 | 1.2114 |
| 8 | 1.8977 | 1.7069 | 1.2224 |
| 9 | 1.9072 | 1.7184 | 1.2316 |
| 10 | 1.9113 | 1.7261 | 1.2392 |

## 3. 當時版本與解鎖門檻

當時 Arena compatibility：

```text
balanceVersion = 7
rankBalanceVersion = 4
ARENA_ASSESS_RUNS = 500
ARENA_ASSESS_CLEAR_TARGET = 485
```

## 4. 當時實際改動檔案

```text
dungeonarena.js
dungeonprogress.js
tests/runtime/js-integrity.js
index.html
```

主要 commit：

```text
4bf7def0d895ffc5a542a0f32ef79e94e33a8fd5
564d4330099fa9a3307f0c7daa8ec41ba041926e
f53d8de694df6ab27b2307121f2e4a45ceeb582d
b702c53da9b625ae342d920beb4b35bf3b241a1e
```

## 5. 歷史文件使用原則

本檔已移入 `docs/archive/`。後續若處理宇宙紀元競技場，先 fresh-read current `main` 的 `dungeonarena.js`、`dungeonprogress.js`、GM benchmark 與 current integrity；不要直接把本文係數當作今日 owner。
