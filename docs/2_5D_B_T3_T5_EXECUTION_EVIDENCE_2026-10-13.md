# T3～T5 連續施工紀錄（施工中，非結案）

本次授權涵蓋 T3-B → T3-C → T4-A/B/C → T5-A/B；不需要使用者逐小批重新授權。基準為遠端 main `48009e8d8f87afc8bfef0c68cb4c02e854b2944f`，不是交接所列 `615abc4`。開工工作目錄乾淨。該基準 SHA 的 Actions 查詢回傳空集合；最近 `1b289c2d` 的 Runtime Integrity 和 Pages 成功，但不得冒充基準或後續提交的 exact-HEAD 結果。

## 已施工

- 新增 `3d-test/t3b-formal-renderer.js`，實際使用 Babylon 引擎、固定 3/4 正交鏡頭、方向光／補光、地面／接地陰影、原玩家 GLB、五槽掛載及敵方透明 atlas。
- 原正式玩家模型保持不變；額外批准的動畫來源可重定向至原模型。載入時比對 53 骨名稱和 bind matrices，驗證多關節、60 fps、來源 1/30s 起點與 700ms 長度；不拿 idle 冒充缺少的動作。只載入動畫資料的來源容器在重定向後釋放。
- G007 剛性掛點及 skinned 裝備沿用原登錄。已有 covered-only region 規則必須符合原人物 SHA／mesh，不能用任意遮蔽來掩蓋碰撞。
- 玩家、敵人接受分別的 clip／elapsedMs；Renderer 沒有戰鬥計時器、RAF、戰鬥運算、存檔或音訊 owner。圖集使用原裁切矩形與 pivot；22 取樣包含兩端點。
- 素材必須通過正式身份、來源授權、批准、HTTP、完整 bytes/SHA 及解碼尺寸檢查。已驗證 bytes 私存於 WeakMap，呼叫者無法在驗證後改寫。晚到 GLB、取消、shader／texture timeout、context loss 均回退並釋放。
- 新增 `t3b-formal-controller.js`：正式來源、序號、場次、背景、停止、晚到載入、錯誤回退；不把 computed combat-action／outcome 當成已走過的 presentation 動畫。正式 release 常數保持 false。
- 更新 projection：優先讀取 owner 真實 presentation after／checkpoint state，保持未知逐擊 HP 為 null；保留實際 damage／healed 數值而不推算。
- 修正既存 B2/B3 來源驗證的舊 HTML query：最新 main 使用 checkpoint-guard1，來源驗證仍要求 bridge2。只更換這個精確允許值，未刪除 SHA／歷史／Fixture 斷言。同步重建 B2 清冊、B3 Manifest 與來源清冊；原 Fixture、Blender、GLB、PNG、失敗美術證據未動。
- 新增 hash/approval 契約、Controller 100 次模擬資源切換、真實 GLB／atlas browser 的 32 個不同換裝畫面與 100 次實際軟體 WebGL 引擎切換測試，加入既有 Runtime Integrity，不建立 Actions 監控。

## 必須保留的未完成範圍

**T3～T5 尚未完成。** 本提交是可重現的工程施工成果，不能以新 Renderer 可單獨渲染、契約通過或 Actions success 取代以下 Gate：

1. 正式 HTML／路由 lazy boot、正式裝備唯讀身份上下文、各合法 owner 的 presentation 時序與共用 elapsed clock 接線。Controller 的 clock／resolve 介面目前仍需實際 owner adapter。
2. 可用素材與缺素材兩種正式流程的端到端驗證，背景 Fast Catch-up、倍速、極簡、連戰、context restore／重入及完整音訊回歸。
3. T4 初次反向依賴盤點已記錄於 `docs/2_5D_B_T4_DEPENDENCY_INVENTORY_2026-10-13.md`；仍須完成逐入口反向依賴盤點、DELETE／MOVE-TO-GM／KEEP-SHARED／WAIT-T3／HISTORICAL-SOURCE 分類及正式預覽完整退場。依賴 T3 的舊戰鬥預覽目前不得先刪。
4. T5 全系統／GM 31 案例／冷熱快取／弱網／完整發布閉包與長測。目前只執行紀錄於 JSON 的測試，不能外推全系統通過。

正式 player registry 的美術狀態仍待使用者批准，尚無已批准的正式敵人 atlas catalog。browser 測試只在記憶體中建立 **test-only** 的批准／身份及 fetch 路由，讀取原模型和隔離 B2 動畫／PNG，不發布、不冒充正式敵人、不讓正式玩家下載。G006 與任何未映射素材保持 unavailable。

B2 材質／光影公平性、局部接觸風險、人工美術批准、實體手機／GPU／發熱／長時間效能仍未通過；測試使用 SwiftShader，沒有 GPU 實測結論。`FULL_3D_AVAILABLE=false` 與 B 正式全面啟用限制不解除。

## 可重現測試

測試命令和實際結果見同名機器證據 JSON。browser 使用 `T3B_BASE_URL`（預設 `http://127.0.0.1:4173/`）；有系統 Chromium 時使用它，CI 則使用 Playwright 安裝的 Chromium。原 Fixture 不重製。所有新增程式預設不啟動引擎、不訂閱正式戰鬥，不存在正式入口。

回復本階段提交使用 `git revert <包含此紀錄的提交 SHA>`；不清除或遷移玩家資料。提交 SHA 和 exact-HEAD Actions 應以 Git／GitHub 實際結果核對，不能把本文含於同一提交造成的自指 SHA 當成完整性證據。

## 提交後 CI 修正紀錄

`3f4e93142874445b6b25c3f68db937faab6cfc32` 的比較與發布 workflows 實際失敗，不能宣稱全綠。共同根因為兩個記憶體 File 的 GLB label 被發布 scanner 當作缺失的網站資源。本機先前的 policy unit regression 未在新增 tracked 清單上執行真實根目錄 dry-run，因此未捕捉。修正採用已驗證資產的 basename，沒有新增假 GLB、忽略缺件或修改發布白名單。重跑真實 dry-run：389 原始檔＋2 build markers＝391 成品檔、missingRefs=0；T2-A 17 項與原人物／32 換裝／100 次實際引擎切換 browser 再次通過。最新修正 SHA 的 Actions 必須另核對。
