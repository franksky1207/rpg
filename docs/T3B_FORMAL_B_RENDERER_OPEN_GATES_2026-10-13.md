# T3-B 正式 2.5D B 方案｜實際施工阻塞與驗證紀錄（2026-10-13）

> 狀態：**未完成；不得解鎖正式 B Renderer，不得進入 T3-C**。本檔只記錄已核對的缺口，並非完工驗收。

## 已核對的正式程式

- `3d-test/t3a-hybrid-policy.js`：正式唯讀戰鬥橋接存在，僅 formal lane。
- `3d-test/t3b-formal-projection.js`：正式事件投影存在；`capabilities.rendererReleased=false`、`assetManifestReady=false`，輸出的 `assetStatus=unmapped`。
- `3d-test/mode-foundation.js`：`FULL_3D_AVAILABLE=false`，尚未開放正式模式。
- `3d-test/character-assets.js`、`assets/3d/asset-registry.json`：已有正式人物基底與部分裝備 GLB／驗證清冊，但不代表全部 210 套 1,050 槽正式素材完成。
- `development/hybrid-comparison/comparison.mjs`：A／B／C 比較頁仍使用隔離 fixture 與開發 Renderer；不可作為正式戰鬥 owner。
- `index.html`：有正式舊預覽主機及政策引用，不等於正式 B 戰鬥 Canvas 已完成。

## 同一批 T3-B 尚缺的 Gate

1. 正式玩家真實五槽裝備身份對映與 SHA 驗證；無正式資產時只能明確 unavailable，不得挪用其他槽位／區域模型。
2. 正式敵人身份台帳與圖集 atlas 對映；不同紀元、模式、異宇宙及 Boss 要採真實身份，不得以開發 fixture 混充。
3. 專用正式 B Renderer/session，固定 3/4 玩家即時 3D、敵人預渲染 atlas、HUD 效果與舊正式戰鬥畫面並存，不能新增權威時計／傷害運算。
4. 從正式 `CivilizationCombatEvents` 消費唯讀事件，依法定 mode/world／battleId／seq 管理切換、取消、結果與退場。
5. 完整合法模式端到端覆蓋；缺可驗素材者應 fail-closed 回文字，不能以虛構 HP／資產宣告已過。
6. WebGL context loss、資源 SHA 錯誤、頁面背景、切換戰鬥時完整 dispose；聲音／結算／存檔仍由舊 owner 唯一管理。
7. Runtime Integrity、T2-B2／T2-B3、快取資產守衛、Pages、完整瀏覽器測試與真實桌機手機回歸，依**最後 exact-HEAD**逐項核對。

## 實際驗證限制

本次已透過 GitHub connector 查閱最新 main 為 `95e83b2d1e382286f816ebab7a64e6972d189ed4`。容器直接 git clone 無法解析 github.com，GitHub connector 的 `fetch_commit_workflow_runs` 對此 SHA 回傳空陣列，**不能據此判斷沒有 Actions 或全部成功**。未執行完整原始碼本機測試或真實 GPU／手機驗收。

不得將此阻塞清單當成 T3-B 完成證明；不得為取得綠燈跳過素材、正式身份或回歸 Gate。
