# 第 27 批第三階段：人物美術快速精修（等待使用者外觀確認）

日期 2026-10-11（Asia/Taipei）。起始 main：`894babdbc484176c6a71aaf2d689283db9445f00`。只修人物，沿用上一版工程、拓樸、蒙皮、單一 idle 動畫與發布架構；不開始第 28～40 批，不修改音訊、公式、帳號、存檔或雲端。技術通過不等於美術封版。

## 六項精修

1. **頭頸**：以原有冠頂 1.9 m 為錨點，頭部高度約增 20%、寬度增 12%、深度增 10%；下顎下移，原頸部段壓縮到約 60%，低領與短段皮膚分開，保留原網格與骨架 rest pose。補鼻樑／下顎的小幅曲面體積，沒有浮空新頭或新增頭盔。
2. **站姿**：直接更新 `CW_Idle_Breathing_Compatibility` 同一 clip；上臂朝身體收 17°、前臂 3°、掌部回正及各段手指輕微彎曲。脊椎呼吸由 0.028 降至 0.008 rad，不製造重複動畫系統，不改 bind pose。自然展示姿勢與原 A-pose 綁定分開。
3. **五官**：原 1024 atlas 加強眉、眼白／虹膜、唇與髮際對比，不增加尺寸。縮頸後新皮膚 UV 下界限制避免 REPEAT 取到髮色黑圈。Blender 混合材質共享 COLOR_0，而 glTF 固定把它乘在臉部 atlas 上；匯出工具只將獨立臉部 colour accessor 中性化為 1，服裝顏色保留。與 Blender 原本不讀頂點色的臉部 shader 一致；新增逐值測試，不停用驗證。
4. **戰鬥服**：利用現有頂點色做連續胸背／四肢剪裁與窄接縫，柔性關節較暗，布料及保護布片分別 roughness 0.67／0.49；青色 emission 0.18→0.07、metallic 0.42→0.24。五材質、512 織物／1024 臉圖不變，不新增大型零件或發光系統。
5. **手腳**：掌部稍收窄，沿既有三段指骨自然微彎；鞋頭略收、鞋底輪廓小幅塑形。腰髖／腿維持已完成連續網格，沒有全身重拓樸或重算權重。
6. **手機展示**：角色專用柔和暖主光、中性側光及背面補光；初始半徑 3.4→2.9、視角較平視，正常手機距離可分辨臉部。人物平台降低 specular 避免背光大白斑。人物場景由正式角色及 GM 共用，不改其他 3D 場景。另只在正式手機角色預覽把既有放大／關閉按鈕排成左側直列，避免遮住臉；保留按鈕與事件，實際頭骨投影位置加入覆蓋檢查，GM 介面不改。

## 實際前後圖片

[新版全部圖片](../development/3d-source/characters/player-v1/review-fast/)。全部來自實際 Cycles CPU 或原生 Babylon；不是 AI 概念圖。前一版 Blender 圖保留於原 `review/`，手機比較使用同一 Chromium、390×844 viewport、正式 GM 測試中心、同一 low 品質；舊模型／registry／角色燈光由起始 SHA 原檔提供，照原 SHA 驗證。

| 視圖 | 前一版 | 精修後 |
|---|---|---|
| 正面 | [前](../development/3d-source/characters/player-v1/review/01-front.png) | [後](../development/3d-source/characters/player-v1/review-fast/01-front.png) |
| 側面 | [前](../development/3d-source/characters/player-v1/review/03-left.png) | [後](../development/3d-source/characters/player-v1/review-fast/03-left.png) |
| 背面 | [前](../development/3d-source/characters/player-v1/review/02-back.png) | [後](../development/3d-source/characters/player-v1/review-fast/02-back.png) |
| 頭／肩頸 | [前](../development/3d-source/characters/player-v1/review/05-head-chest.png) | [後](../development/3d-source/characters/player-v1/review-fast/05-head-chest.png) |

四面及三近景為同工具、同鏡頭、24 samples 的實際新渲染；舊基準 48 samples，噪點差異不是模型品質改善。LOD 三人圖刻意以 bind geometry 比較簡化；正式三種 LOD 均讀同一自然 idle clip。另保留關節／遊戲光照及正式角色／GM／手機正側背圖。圖片、原 `.blend`、atlas、工具與報告只留 GitHub，不發布。

## 技術契約及驗收

來源 84,812 頂點／相同 edges、faces：原 `.blend` 與新 `.blend` 實際比對，53 骨骼名稱／父子／head／tail／rest matrix 和每個頂點所有權重完全一致。九掛點父骨不變，兩個手部掛點的 evaluated local matrix 最大浮點差 1.1920929e-7（容許 1e-6）；不是刻意修改掛點。完整舊新值與權重 SHA 留 `socket-diff.json`。

原始工程重新開啟、封閉單一 manifold、法線、四權重總和 1、呼吸及肘／膝／肩／髖／指原有五項變形保留，另加頭 25°、頸 15°。所有七項有限座標、邊拉伸 <6、嚴重壓縮邊 0；low 重新匯出完整 SHA 一致，且完整建置程式從空場景生成三個 GLB 全部 SHA 一致，包含臉部中性化，不用只比較面數冒充重製。

low／medium／high 面數仍 8,480／27,140／108,566。三 GLB Khronos 零 error／warning；源格式／缺檔／錯 SHA／預載誤列負向檢查保留，臉部 COLOR_0 每值為 1，atlas 實際尺寸不變。原來源 mask／五槽 owner／decoder／LRU／fallback／media SW 不重建。

本機 14 個 owner／cache／發布／registry／音訊回歸腳本全通過；原生人物瀏覽器、GM 31 案例與精簡包 Stage 4 瀏覽器全通過。七種原生骨架變形、桌機／手機正側背、臉部控制遮擋、旋轉縮放／最大化還原、10 次重開、context loss、503 fallback、零 engine／container 及熱開零新增 GLB 請求均實際驗證。Stage 4 全包 366 檔 HTTP bytes／SHA、17 音訊解碼、49 media Cache、206 Range 與清除／存檔隔離通過。HTML cache guard 檢查五個變動檔通過。

本機及 CI 瀏覽器使用原生 Babylon，正式帳號為隔離 SDK session fixture；沒有讀寫玩家正式雲端存檔。測試完成結果與容量／效能數字見 [測量 JSON](3D_BATCH27_FAST_POLISH_MEASUREMENTS_2026-10-11.json)，exact final SHA 的 Actions／部署由交付回報附連結。手機 viewport／SwiftShader 不等於 iPhone GPU。

## 容量及成本

MB = 1,000,000 bytes。舊 low／medium／high 為 809,780／1,746,540／5,068,184 bytes；新為 741,596／1,694,776／5,006,948，合計 7,443,320（原 7,624,504），減少 181,184 bytes，面數不增加。較清楚且較易壓縮的原 atlas 和 clip keys／材質切分共同影響實際 binary；atlas 移除不影響像素的 EXIF DPI 差異，以保持重新開啟與全建置的指紋一致，不能把 PNG 變小當成 GPU 記憶體減少。

材質仍 5、貼圖仍 512＋1024；1024 RGBA 原始 GPU 代理仍約 4 MiB（含 mips 約 5.33 MiB），沒有升解析度。只增加一盞人物常量方向補光，增加少量 PBR lighting 計算；不啟用動態陰影／新的 render target。站姿仍同一 clip，CPU 只多既有骨骼的 idle tracks。受控手機 viewport low 單次比較，首次 552→645 ms、再次 451→439 ms，熱開新增 GLB 下載零。首次增加 93 ms，不宣稱性能改善；兩種資產均為同頁 CPU bytes 重用、關閉後 engine/container=0。首次與熱開使用同一 Chromium 的真 low 資產、官方本地 decoder 與同源測試中心重開；逐次結果保留，不能宣稱單次時間差等同手機 FPS 改善。

成品容量由 `build-publish-dry-run.cjs` 實際產物逐檔量測：35,325,524 bytes（原 35,506,198），減少 180,674 bytes。仍 366 玩家檔、32 背景、17 音訊、49 preload；新增開發影像不進發布包，resource-manifest 和單一 HTML／engine fallback token `20261011-b27-fast-r3` 同步更新。

## 發布、回退與使用者待驗

完成模型／瀏覽器／快取 gate 後才一次推 main；沿用現有 Optimized Pages，不改發布來源，最終提交必須實際 all-green 且部署。回退用 `git revert <本批最終 SHA>` 新提交，保留其他人的歷史，再同步 registry／manifest、通過相同 gate；不 reset／force push。

使用者只需驗：iPhone 正常預覽距離的頭身／短頸／五官、正側背與布料層次是否接受；觸控旋轉／縮放／最大化還原及背景返回；桌機與 iPhone 的持續使用 FPS／發熱；實際登入後角色與 GM 正式展示。自動化無法代替真人審美或實機 GPU。**仍待使用者決定是否正式美術封版，第 28～40 批未施工。**
