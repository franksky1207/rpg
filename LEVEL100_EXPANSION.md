# Lv1～100 擴充計畫

目前正式目標：把主線從 Lv1～50 擴充到 Lv1～100。

## 六批規劃

1. 解除 Lv50 硬限制
2. 主線地圖資料擴成 20 張
3. Lv1～50 重做為「地球戰爭篇」
4. Lv51～100 新增「太陽系戰爭篇」
5. GM／管理／測試系統全面支援 Lv100
6. 數值平衡＋完整回歸

## 第1批狀態：已完成

新增 `level100.js` 作為 Lv100 相容層，避免大改既有核心。

目前已處理：
- `MAX_LEVEL` 正式改為 100。
- `clampGameLevel()` 改為 1～100。
- `levelcap.js` 既有升級、滿等 EXP 轉金幣、死亡懲罰會依動態 `MAX_LEVEL` 工作，因此 Lv50 不再被視為滿等，Lv100 才是滿等。
- 主線裝備掉落等級不再固定封頂 Lv50。
- 玩家狀態與戰鬥畫面的 EXP / MAX 顯示改讀 `MAX_LEVEL`。
- GM「指定等級」支援 Lv1～100。
- GM「產生裝備」支援 Lv1～100。
- GM Hub 裝備等級下拉支援 Lv1～100。
- 特殊怪／懸賞／競技場 Debug metadata 的等級可到 Lv100。

## 第1批刻意未處理

- 地圖仍是原本 10 張、Lv1～50。
- `MAPS`、`mapProgress`、`bossProgress`、`unlockedMap` 等地圖數量架構仍維持 10 張。
- 商店與特殊怪測試的 map index 高於 Lv50 時暫時仍落在目前最後一張地圖。
- Lv51～100 正式地圖、怪物、裝備名稱尚未加入。
- 主線 Lv51～100 數值與 EXP 節奏尚未平衡。

以上屬於第2～6批內容，不應在第1批提前混入。

## 目前 script

`index.html` 在 `gmhub.js` 後、正式後續 wrappers 前載入：

```html
<script src="level100.js?v=20260908-2355"></script>
```

後續修改仍以 GitHub `main` 為唯一真實來源。
