# 全怪物模組化靜態效果：人工檢視

本次只新增外圍靜態效果。**895 張 `body/`、39 張原型、24 張認可樣本 B 與既有調色資料全部固定**；原有 `full/` 也未覆寫。不執行舊調色建置器。

入口：[分類頁](index.html)、[元件庫／自由組合試作台](effect-library.html)、[使用分布](effect-statistics.html)、[效果總覽圖](effect-sheets/index.html)、[本體完整性證據](effects-audit/index.html)。

HTTPS 預覽使用 GitHub HTML Preview，不使用正式 Pages：

https://htmlpreview.github.io/?https://github.com/franksky1207/rpg/blob/review/monster-static-effects-20261024/development/monster-art/full-review/index.html

若服務暫時無法使用，可把完整 `full-review/` 解壓後開 `index.html`。分類頁、元件圖與總覽不依賴網路 API；部分瀏覽器限制本機檔案 Canvas 像素讀取時，自由試作台請用 HTTPS 預覽。HTML Preview 會加入 GitHub raw 的 base，本次明確保留 head 與預覽內連結，圖片與腳本不依賴正式遊戲站。

## 檢視順序

1. 分類頁選「效果獨立顯示」，先看 L0，再看同原型跨身份與 L5。
2. 對同原型切換完整／僅固定本體／效果獨立；確認效果不遮住本體，也不只剩環。
3. 看十王、兩類災厄、異宇宙每原型十版；異宇宙五階與十王投影均引用同一 canonical 配置與圖檔。
4. 元件庫依家族查看 48 個基礎造型，每個提供 L0／L2／L5 主要變體；點圖放大。試作台可變更原型、層級、位置、形態、密度、大小、方向、透明度與相容元件搭配，不會回寫候選資料。
5. 分布頁可點家族、元件、組合進入對應候選。統計以 895 有效外觀為分母，投影與五階不灌入分母。

## 元件與組合

`static-effects.js` 是唯一新增的效果繪製引擎；分類頁與總覽使用其實際匯出，試作台也用它，沒有另一套顏色或效果 renderer。

- 48 個獨立造型、8 家族：能量、科技護盾、機械構造、晶體、生物氣場、星際天體、空間維度、文明權能。
- `library` 定義 ID、家族、適用原型標籤、外型、位置、層級、變體參數、空間、互斥與粗估成本；色彩讀固定調色的 rim／主色參考，不改調色。
- 組合器依原型標籤、已量測的 alpha 外圍空間、身份強度與跨原型使用量選擇，不用亂數或身份 hash 湊效果。每套分開主要位置，只取一個大型 field、frame、outline；自動配置優先跨家族，試作台可組合同家族相容小元件。
- 不把顏色、旋轉、線寬變化另算新元件或新造型組合。實際 895 套候選使用 556 個不同元件集合；未把理論排列全數實體化。擴充元件只需加入 painter、metadata 及相容規則，不設效果總數上限。
- 目前最高家族使用率約 34.1%；生物家族只配置到適合的原型，沒有為平均分布而塞進機械怪。
- 六層級分布：L0 300、L1 300、L2 47、L3 28、L4 20、L5 200。L4 內宇宙災厄與十王以不同 strength 區分；投影沿用本尊。特殊怪高於地圖 Boss，副本依有效銀河／宇宙模式再分層，不新增高維懸賞。

## 本體與像素保護

- 施工前 `effects-audit/frozen-before.json` 記錄 960 檔 SHA256，其中 895 張本體；施工後 `frozen-after.json` 逐檔列出相同 SHA256。
- `effects/*.png` 是透明效果層，任何本體 Alpha > 0 的座標都嚴格歸零，包括半透明邊緣。512px 畫布四邊保留 8px 安全區，沒有地面底盤；所有結構都是可跟隨 sprite 的造型。
- `effects-full/*.webp` 是新的完整預覽，透過 RGBA 選取與無損編碼合成；每張完整圖在原本體任何非透明座標的 RGBA，都與解碼後固定本體完全相同。不是只比較「看起來差不多」。
- `effects-audit/render-metrics.json` 記錄每個實際元件的可見像素，沒有無效果的 L0，也沒有完全被遮掉的元件。幾何、像素檢查不能替代人工美感判斷。
- 原 12 樣本 B、原型 A、原有自然調色規格皆保留；C 只改外圍效果。

## 效能與未來正式接入

目前是 review-only，沒有更動正式 Actor、圖鑑、GM、六動作、尺寸、定位、遊戲資料或資源包。

引擎只使用 Canvas 2D 程序向量，一次準備後使用靜態影像；沒有粒子、效果專用 requestAnimationFrame 或計時器。一般效果不需要外部素材；輪廓／殘像重用已解碼本體。預設影像快取 8MiB，試作台 6MiB；LRU 淘汰會釋放 Canvas，並按需產生，不預建所有可能搭配。分類頁每頁最多 30 項，圖片 lazy loading。

本機 Chromium 實測單次效果預繪中位約 23.8ms、P95 約 39.3ms（只代表本機測量，不是手機效能驗收）。靜態匯出圖只供 review，未要求正式遊戲下載這一包圖。

日後人工接受且另行授權後：由正式 MonsterActor 的有效外觀 owner 讀已確認配置，在本體準備時預繪效果，採同一 sprite transform；把 layer 放在本體下方，再接入原本動畫，圖鑑／GM 仍引用相同 owner。快取 key 必須含本體版本／SHA、引擎版號與配置，並與既有池的生命週期整合；需另做正式工程驗收。本次沒有實作這個接入步驟。

## 重建與必要本機檢查

只使用新的效果腳本；**不要執行 `build-monster-full-review.cjs`，那是舊調色建置器。**

1. `python3 scripts/plan-monster-static-effects.py`（只讀 alpha，量測空間）
2. 倉庫根目錄啟動本機 HTTP 4173，執行 `node scripts/build-monster-static-effects.cjs`
3. `python3 scripts/compose-monster-static-effects.py`（無損合成與逐圖像素／SHA 比較）
4. `python3 scripts/sheet-monster-static-effects.py`
5. `node scripts/check-monster-static-effects.cjs`（只檢查 review 頁、篩選、相容性、快取與手機版面）

工作分支 `review/monster-static-effects-20261024`，不開 PR、不合併、不部署正式站、不執行或追蹤 Actions；提交含 `[skip ci]`，且已讀取 workflow 事件確認此分支不符合 push 觸發條件。
