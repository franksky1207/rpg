# 第19-1批｜全戰鬥角色絕對可見大小統一（候選施工，未封箱）

基準 main：`9f9f1668445850e1c73b72a79a5e20ccbd25d1b9`；分支：`batch19-1-absolute-sprite-sizing-20261022`。

## 目標
以特殊怪物戰鬥手機直向的舒適顯示大小為視覺參照，手機直向、橫向、桌機保持接近的螢幕高度占比；怪物相對玩家既有政策全數不變。玩家左、怪物右；不得裁切、重疊、遮擋血條，保持原停止按鈕及視窗中心定位。不修改戰鬥數值、存檔、獎勵、資產與身份映射。

## 已知原始碼因素
- `3d-test/monster-actor.mjs` 先量測待機 Alpha，再以包含整張 Canvas 的 pair envelope `Math.min(width/(right-left),height/(bottom-top))` 等比縮放。
- `3d-test/formal-player-sprites.css` 原舞台高度桌機 `clamp(230px,38dvh,390px)`、直向 `clamp(205px,34dvh,300px)`、低高度 `clamp(135px,38dvh,210px)`。
- `3d-test/t3b-formal-renderer.js` 既有 silhouette 與 verified MonsterActor 走不同佈局路徑。
- `combat-viewport-coordinator.js` 既有 visualViewport 置中保留，不重製。

## 候選修改（需實測決定是否保留）
- 共用 Actor 設定玩家 painted-height 候選目標 `0.34 × stageHeight`，仍使用完整 Canvas envelope 作安全上界；此值**未經特殊怪物真實基準校準**，不能宣稱已符合使用者要求。
- CSS 舞台增高為桌機 `clamp(270px,48dvh,470px)`、直向 `clamp(265px,43dvh,370px)`、低高度 `clamp(170px,52dvh,250px)`。須檢查 CSS cascade，包含 mobile pending 高度、max-height 條件與血條/停止鈕。
- fallback silhouette 高度上限統一為 `0.82 × stageHeight`，但 silhouette 本身實際 Alpha 比例不同，仍需實測視覺一致性。

## 強制待辦：提交前量測及回歸
1. 在 1365×900、390×844、844×390 及真實 iPhone 直橫方向量測 stage.getBoundingClientRect、visualViewport、玩家及怪物六動作 Alpha footprint。
2. 量測特殊怪物舒適基準（至少三種原型）、一般地圖、懸賞、競技、文明災厄、高維十王、異宇宙、虛空、鏡像；記錄 `playerPaintedHeight/stageHeight`、`playerPaintedHeight/visualViewport.height`、相對比值、左右安全距離。
3. 驗證大型 Boss 無法容納時的縮放與明確失敗紀錄，不許僅以不裁切取代絕對尺寸驗收。
4. 39 張原型、1695 身份全面回歸；三視窗、六動作、資源載入/失敗回退、跨模式切換、載入前後無跳位、快取、GM/正式一致。
5. 須實際執行對應 Browser/Runtime/Actions，不得用靜態推算冒充真瀏覽器實測。
6. PR head 各必要 Actions 全成功後方可合併 main，再驗證同 SHA Runtime/Pages；正式 iPhone 長時間效能留人工驗收。

## 目前狀態
**僅為候選程式與調查紀錄。尚無瀏覽器實測、CI 或 Pages 驗收證據；不得宣告第19-1批已完成。**
