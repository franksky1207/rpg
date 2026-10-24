# 文明戰線：12 身份怪物美術修正樣本

基準：最新 main `a3b3e5526e07fe3284105086ea7f73faee063347`；PR #97 已合併於 `6caa0664`。本分支不合併、不發布、不全量替換。人工美術尚未驗收，工程通過不代表好看。

## 比較入口

- 專案互動頁：`3d-test/monster-art-samples.html`。在專案根目錄執行 `python3 -m http.server 4173`，開啟 http://localhost:4173/3d-test/monster-art-samples.html 。提供 12 組並列 A/B/C、背景切換、放大及四動作定格。
- [桌面完整比較圖](monster-art-samples/abc-desktop.png)／[手機完整比較圖](monster-art-samples/abc-mobile.png)。
- [離線比較頁](monster-art-samples/abc-offline.html)：下載後以瀏覽器開啟，不需要服務或網路，內嵌全部 36 張圖片；僅 idle 靜態快照。
- A：未調色原始原型，由正式 MonsterActor 以相同大小／動作呈現。B：main 的 PR #97 有效外觀。C：同一正式 MonsterActor → resolveMonsterAppearance → paintMonsterAppearance，明確傳入 `appearanceRoute: 'art-samples-12'`。

## 固定樣本清單與挑選理由

|身份 ID|怪物|類別／原型|C 調色及挑選理由|
|---|---|---|---|
|galaxy-map-003|突擊士兵|銀河普通／hm-01|原型代表，完整保留原圖；無外圍效果，提供最低強度基準|
|galaxy-map-009|重型機甲兵|銀河菁英／mech-02|只把橙色能源轉青；驗證灰鐵裝甲與材質可保留，輕輪廓光|
|galaxy-map-025|污染母體|銀河 Boss／bio-02|紅組織轉苔綠，暖囊保留；與灰潮母巢構成同生物跨身份比較|
|universe-boss-001|彼岸守門者|宇宙主線 Boss／cmd-01|藍能源轉青；金甲與披風保留|
|universe-boss-011|蒼環執政官|宇宙主線 Boss／cmd-01|能源蒼紫、披風深靛；與守門者比較同人形自然差異|
|galaxy-calamity-01|灰潮母巢|銀河文明災厄／bio-02|灰紫組織、低彩琥珀囊體；比同型地圖 Boss 更強的外圍光|
|universe-calamity-01|彼岸黑潮|宇宙文明災厄／energy-01|深海青能量，保留原有絲線與亮核；雙薄環|
|higher-dimensional-boss-01|破界天裁|高維十王／boss-h-01-v01|金甲保留、神力冰紫；雙環、少量外圍靜態節點|
|alternate-depth-0026|星神宇宙・外環|異宇宙／core-03|青玉能源，裝甲／金邊保留|
|alternate-depth-0191|萬星宇宙・外環|異宇宙／core-03|琥珀能源，裝甲／金邊保留|
|alternate-depth-0201|星墓宇宙・外環|異宇宙／core-03|幽紫能源，裝甲／金邊保留|
|special-gold_slime|稀有資源聚合體|特殊怪／energy-01|金色能量保留原有亮暗與絲狀結構，弱薄環；與宇宙災厄比較|

共 12 身份、7 原型，包含人形、機械、生物、能量體。異宇宙三樣本來自三個不同宇宙；各宇宙五階繼承該宇宙同一規格，不另外設計其他階。本次 12 是美術設計單位；五階與投影是既有身份別名規則，不增加設計。

## 新美術規則與來源

1. 沒有雙色切割、座標遮罩、本體人工紋理、月牙或持續粒子。C 完全繞過 B 的切色／紋理繪製分支。
2. 每個樣本人工指定來源色相範圍與目標色。遮罩由原圖 hue/chroma 判斷，邊界柔和過渡；中性金屬、白色亮部、極暗細節受保護。保持每像素 HSV V 與 Alpha（8-bit 捨入容差 1）。沒有 hash／大區分色。
3. 只有突擊士兵完整保留原始外觀，同一原型最多一個樣本身份原樣保留。其他身份皆有實際本體色群改變。
4. 外圍效果一次預繪：柔和輪廓光、完整薄環、少量靜態節點。原圖任何非透明像素位置都清除特效，再以完整不透明度疊回調色本體，避免蓋住主體。只在原 512×512 的安全邊距內繪製。
5. 視覺階序：異宇宙 6 > 高維十王 5 > 宇宙災厄 4 > 銀河災厄 3 > 未來副本 > 特殊 2.5 > 地圖 Boss 2 > 菁英 1 > 普通 0。數字只是本樣本外圍效果預算，不改戰力／尺寸。宇宙主線 Boss 本次仍屬地圖級。
6. 未來副本須依銀河 < 宇宙 < 高維分級，懸賞／競技同樣遵守；本次不修改副本。高維競技直接繼承十王本尊，禁止另配色；高維懸賞沒有實際入口，不虛構新增玩法。

正式共用 owner 仍是 `monster-appearance.mjs`；樣本模組只提供白名單、人工規格與繪製分支。Actor、圖鑑、GM 皆可顯式傳入同一選項；圖鑑沒有獨立調色。沒有任何正式呼叫端自動啟用 C，未入白名單時仍回傳 B。每個異宇宙以宇宙首階 canonicalize；projection 前綴同樣 canonicalize。

## 工程驗收與限制

- 新瀏覽器測試：12 組／36 張、身體 Alpha、明度保留、外圍不污染本體、非代表實際調色、Actor／圖鑑指紋一致、白名單外不變、三個宇宙各五階一致、十王投影一致、手機無水平溢出、四動作可畫、無 pageerror。
- 既有 appearance contract 與兩張共用解碼池測試通過。池上限仍為 2,097,152 bytes，dispose 後 refs／bytes 皆 0；比較頁逐隻快照即釋放 Actor，保留 36 張 256px Canvas（約 9 MiB）。無自建常駐池或動畫 timer。
- 原始圖片、映射、戰鬥數值、動作、尺寸邏輯、玩家、鏡像、資源池及 SW owner 未改。歷史 SHA guard 僅精確更新本次呈現檔與新增檔，未刪除斷言。
- 既有 B 全量 Chromium 瀏覽器驗證通過：895 有效外觀、18,221 個同原型比較、全量 Alpha 保持；其他整合檢查以 PR／Actions 為準，不把未跑項目宣稱通過。完整手機截圖不代表 iPhone Safari 硬體耗電／記憶體驗收。
- 目前是工程自查與作者目視，使用者是否覺得自然、耐看仍待逐組人工審核；不能以唯一率或色差宣告成功。

重現：`NODE_PATH=/path/to/node_modules node tests/runtime/monster-art-samples-browser.cjs`；`node tests/runtime/monster-appearance-contract.mjs`；`node --test tests/runtime/batch20-shared-monster-pool.test.mjs`。離線頁以 `scripts/export-monster-art-samples.cjs` 從正式比較頁匯出。

## 人工確認後才進行的擴充

先逐組收集「保留／改色／降特效」意見並修正這 12 隻。確認後，以原型建立可審核色群與材質保護規則，為每個原型選唯一原始代表；按身份、地點故事與強弱挑選有限色譜，不按銀河／宇宙大區自動分色。分批擴充同原型跨模式比較，逐批人工通過後才規劃正式啟用與快取發布，另開 PR。895 有效外觀／1705 身份不在本次完成範圍。

鏡像本次僅規劃：保留裝備與玩家原始 raster，外置薄型冷色反射輪廓、偏移殘像、稀疏碎鏡邊界。不要把裂紋畫進玩家本體，不引入月牙、粒子或新的計時器；獨立小樣本審核後再施工。
