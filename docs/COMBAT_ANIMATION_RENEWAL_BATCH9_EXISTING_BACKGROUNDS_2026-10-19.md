# 《文明戰線》新版第9批：既有背景與左右戰場整合（2026-10-19）

## 一、修改內容
- 使用者確認不新增場景，不重畫既有32張桌機／手機頁面背景，不追求人物接地、陰影或透視。
- PR #40：<https://github.com/franksky1207/rpg/pull/40>；基於第8批正式封箱後 main `4c890e864a82fecf3ee42f439233a3262a737ab0`。
- `3d-test/formal-player-sprites.css`：僅將第8批左右戰場的額外藍黑漸層與邊框替換為透明舞台；保留尺寸、溢出保護、桌機上下版面與手機敵方資訊→動畫→玩家資訊。
- `index.html`：精確更新正式 CSS 版本指紋，以免舊舞台底色被快取。
- `tests/equipment-formal/browser.cjs`：增加正式戰鬥舞台透明、原本 battle-main 頁面背景仍有套用的斷言。
- 兩份歷史清理契約測試僅對本批核准的 CSS cache token 更新精確正規化；未關閉舊版資產或正式玩法保護。
- 沒有新增背景 WebP、Canvas、RAF、場景引擎、動態環境效果或戰鬥文字訊息框。

## 二、程式自我檢查
- PR #40 與舊 main 的差異限縮於 `3d-test/formal-player-sprites.css`、`index.html`、`tests/equipment-formal/browser.cjs`、`tests/runtime/cleanup-batch4-4-final-guard.cjs` 與 `tests/runtime/cleanup-batch2-4-integration.cjs`。
- 未修改 HP／護盾／戰意／傷害／獎勵／掉落、戰鬥 owner clock、正式 Sprite、GM 權限、登入、雲端、離線收益、Save Schema 17 或 Issue #37。
- PR 最終頭部 SHA `92f0034443acf5fc3d2d8fd8e9cd7773c92d96a8`：六項同 SHA 工作流程成功：Batch 5、Batch 6 16類、Batch 7、正式戰鬥瀏覽器、GM Integration、GM Terminology。
- CI Chrome viewport 可證明版面與回歸契約，但不等於 iPhone 真機長時間發熱驗收。

## 三、GitHub Actions／Pages／實機驗收
- PR #40 已正式合併，合併 SHA `c7813ed83ddc2238509f3e8ab2d9d3b6b055b9f4`。
- 合併後 main 的 Runtime、正式 Battle、GM、Cache Version、Publish Asset Audit、Release Gate、Publication Dry Run、Optimized Pages 等工作流程須以各自同 SHA 實際結論為準；本檔初次寫入時合併 SHA 的發布驗收尚在進行，**不宣稱已全綠**。
- 背景沿用原本 CSS 依路徑套用之桌機／手機 WebP；沒有對32張圖片逐張重新解碼或 iPhone 裝置手動驗證，這些不冒充已測。
- 不宣稱 iPhone 真機發熱、長時間連戰、所有特殊 Boss、所有缺圖情境已全部通過。

## 四、提交 SHA、封箱界線與待補
- PR #40 施工頭部：`92f0034443acf5fc3d2d8fd8e9cd7773c92d96a8`。
- 正式合併：`c7813ed83ddc2238509f3e8ab2d9d3b6b055b9f4`。
- 本封箱文件另產生新的 main SHA，**不能直接使用合併 SHA 的 Actions 綠燈證明文件提交後的 HEAD**；須另核對最新 main 與 Pages。
- 待補：真實 iPhone 發熱與長時間連戰、特殊 Boss／跨模式缺圖，以及有需要時背景圖檔的逐一視覺檢查。
- 第10～12批依既有路線圖繼續討論；第13批才討論專屬怪物美術。Issue #37 暫緩。
