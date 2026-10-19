> **新版第11批最終整合（2026-10-19）**：沿用 PR #42／`batch11-audio-resource-mobile-performance-20261019`；main 基準 `79da871`。修正正式 Sprite 去重狀態漏宣告造成第一次 sample 回退，保留原背景／極簡／數值與全部測試斷言；補上 lazy audio 原生瀏覽器回歸與資源快取識別。完整結果及封箱門檻見 `docs/COMBAT_ANIMATION_RENEWAL_BATCH11_AUDIO_RESOURCES_MOBILE_PERFORMANCE_2026-10-19.md`；最新 Actions／main／Pages 尚待驗收，不得視為已封箱，iPhone 真機溫度／耗電未測。

> **第7批最新承接**：三套完整持劍透明WebP、正式Renderer／Pool六動作、轉生設定及GM已完成輕量整合施工；30項與工程證據見 `docs/BATCH7_LIGHTWEIGHT_FINAL_ACCEPTANCE_2026-10-18.md`。本檔以下舊狀態保留追溯，精準手指／握點要求不再阻擋；是否封箱以PR #38最新同SHA Actions及Pages報告為準。第8批與Issue #37未施工。

# 《文明戰線》正式交接（2.5D 舊美術清理第 5 批驗收）

> 高維新版替換：正式設計無披風、無星環、無漂浮星體；舊高維分層要求全部失效。只需完整角色、無武器身體、獨立武器；最新來源與待補見 `development/combat-animation/batch7/layer-review/review.json`。

> **GitHub `main` 的實際程式碼是唯一真實來源。** 第2～4批清理已經經由 PR #14 整合至 `main`；第5批正執行清理後的 CI、發布與文件一致性最終驗收。舊G01～G19概念入庫、G20待辦、原第28～40批每套製圖／建模及歷史 SHA 綁定紀錄已撤銷，不是施工規範。

## 最高保護範圍

- 保留三紀元銀河／宇宙／高維、所有合法戰鬥、轉生、突破、異宇宙、GM權限與測試隔離。
- 保留文字模式、極簡、背景與離線戰鬥、倍速、戰鬥owner clock、HP／盾／結算、音訊及安全回退。
- 帳號登入、雲端、Service Worker、版本快取、存檔及舊版遷移不變；清理不得更動玩家持久化格式、獎勵、數值及正式Runtime。
- 裝備**正式遊戲資料**始終有210套永久ID、1,050槽：銀河G001～G100、宇宙U001～U100、高維H01～H10。名稱、品質、強化、掉落與五槽混穿須以正式資料owner為準；這些**不等於**210套角色美術任務。
- 正式主介面仍是2D文字／按鈕；戰鬥沿現役B方案2.5D，不建全介面大型3D。
- G005／G007／G018過去概念不再是三紀元新造型的來源或前置條件；現役GM／正式B所需的WebP、GLB、Renderer、武器層及SHA資源仍保留，缺材正常回退，不因刪概念圖改實際外觀規則。

## 新版美術方向（第7批已授權施工）

未來僅有三紀元各一套完整角色外觀：銀河、宇宙、高維；高維裝備可隨轉生回銀河繼續呈現高維造型。三套設計與來源已由使用者指定，第7批依PR #38續作，**不得**沿用已刪的G001～G095概念圖、重啟G20或原40批量產。維持五槽正式玩法數值，不把三套外觀誤寫成改動210套ID。

## 清理批次與實際狀態

- 第1批：唯讀盤點。
- 第2、3批：從概念量產程式、索引、源圖與證據開始解除引用並實體刪除。分支需按PR鏈依序整合，不跳過祖先。
- 第4-1批：剩餘引用盤點；第4-2批：進一步解綁並刪除證據。
- **第4-3批歷史施工紀錄**：在 `b84094b6f6b89b5f1b63df10be2e7e9a3a30f576` 已完成六項GitHub Actions，與第4-2分支比較實刪484檔／70,598,118 bytes。確認刪除的.blend、source-lock.json、source-version.cjs、source-evolution.json及退役T4封存不存在；保留現役174項GM B資源、SHA驗證的B2保留檔、必要GLB／Sprite。該紀錄描述當時 Draft PR #13 階段，後續已透過 PR #14 合併正式 `main`。
- **第4-4批**：最後全庫零殘留掃描、移除舊美術純歷史文件、更新交接與規劃、發布／GM／正式玩法回歸；在最新HEAD Actions全部成功、無意外正式檔異動後才可結案。第4-4 已與前置清理鏈一併透過 PR #14 合併正式 `main`；目前第5批進行合併後的驗收，不可將先前 Draft 狀態當成現況。

## 現行開發與驗收入口

- 正式遊戲身份／戰鬥／存檔依據：`data.js`、`combatcore.js`、相應正式owner、`scripts/formal-equipment-identities.py`；**main實際檔案與測試是最終依據**。
- GM與B資源：`3d-test/gm-battle-simulation.js`、`development/hybrid-comparison/t2b3-v1/`、`scripts/stage-hybrid-preview.cjs`、`assets/3d/asset-registry.json`。
- 現役2.5D素材完整性：`tests/runtime/cleanup-batch4-3-current-inventory.cjs`、`tests/runtime/3d-asset-registry-integrity.cjs`、`tests/runtime/hybrid-comparison-renderer-contract.cjs`、正式GM／戰鬥／Sprite Actions。
- 第4批清理總界線：`docs/2_5D_LEGACY_ART_FULL_CLEANUP_4_BATCH_PLAN_2026-10-17.md`；未來2.5D美術方向：`docs/2_5D_BATCH28_40_REBASE_MASTER_PLAN_2026-10-16.md`（新版已取消舊量產）。
- 所有清理刪除必須有Git D與最新Git tree證據；現行能力驗證不能以移除安全斷言、跳過測試或重寫Gameplay代替。
- 沒有實際測過的iPhone真機、真帳號登入／雲端寫入或人工美術核准，不得報告為已驗收。Pages 上線及正式 `main` 驗收須以該 SHA 對應的 GitHub Actions 成功紀錄核對。

## 交付格式

每批回報四段：**修改內容、程式自我檢查、實機／Actions驗收、提交SHA與剩餘事項**。在分支未合併時明確標註施工驗收，不能混淆正式main與Pages狀態。

## 現役資料與版本安全基準

- 正式存檔基準：`SAVE_SCHEMA_VERSION = 17`；存檔、遷移與 Future schema 防護不可因清理變更。
- 三紀元 owner：`currentWorldPhase()` 與 `thirdWorld`；`1／2／3 對應銀河／宇宙／高維`（高維 `3 = 高維紀元`）。
- `reincarnation`、突破與異宇宙的正式行為只能依 `main` runtime 與回歸測試判定。
- 第5批完成條件：所有必要 GitHub Actions 全綠、完整 Git tree 零殘留與保留例外核對、最終 CI SHA 及報告寫入後才封箱。第6批不得提前開始。

## 新版戰鬥動畫／背景更新施工狀態（2026-10-17）

- 正式總規劃：`docs/COMBAT_ANIMATION_AND_BACKGROUND_RENEWAL_MASTER_PLAN_2026-10-17.md`。
- 新版第1批：固定12項稽核與動態性能量測已封箱；第2批：背景戰鬥 lifecycle、13 類整合回歸已封箱；保留先前封箱證據。
- **新版第3批（固定16項）**：PR #25 整合 `combatfx.js` 延遲浮字計時清理、舊戰鬥 async finalizer token guard、HP observer 去重／限縮監聽；新增 100-event／100場替換／50次出入壓力、異宇宙真 UI controller（注入相同合成事件）trace、舊 main vs 新版 Chromium CDP trace、音效／Renderer／資源／原第1與第2批回歸。
- 第3批完整施工驗收檔：`docs/COMBAT_ANIMATION_RENEWAL_BATCH3_16_ITEM_ACCEPTANCE_2026-10-17.md`。參見 GitHub PR #25；正式合併 main 後才完成同 SHA 發布封箱。**不得宣稱已通過 iPhone 真機溫控測試**。
- **新版第4批（19項）施工與驗收**：正式開關用語「開啟／關閉戰鬥動畫」、正常文字／極簡回退靜音（真載入錯誤仍可診斷）、三紀元懸賞及競技場手機主戰鬥區視窗定位、高維三連戰前置陣容卡跳過、虛空一次進場／不逐層搶視窗、iPhone 版面與 GM 動畫測試中心。驗收報告 `docs/COMBAT_ANIMATION_RENEWAL_BATCH4_19_ITEM_ACCEPTANCE_2026-10-18.md`。封箱以合併 main 後同 SHA 的正式 Battle／GM／Runtime／Pages 成功為準。
- 第5批才做三紀元造型技術契約（不量產美術），第6批全模式最終整合。iPhone 真機發熱驗證仍留六批完成後。
- 強制施工 SOP：每批完整施工 → 逐項自檢 → 最新 SHA Actions 驗收 → 一次封箱報告，不拆小批、不以舊 SHA 全綠冒充新 SHA、不改正式玩家數值／結算／存檔。


## 新版第7批承接（2026-10-18，本次授權範圍）

- 沿用草稿 PR #38、`batch7-era-player-sprite-20261018` 與既有 `ba17656da5e03b6db3af5a100b1cb4703408c619`；main 基準為 `29ab70fdc791dbbdce0e276a282f2e6b163f276b`，沒有重建分支或重複 PR。
- 已取得並驗證三張使用者核准母圖，原檔、mask recipe、候選 WebP 與完整 SHA 分離保存於 `development/combat-animation/batch7/`。候選未取得正式分層允收，不可當正式資源。
- 修正外觀契約讀不到正式 lexical `state`、設定頁錯用 `state.world`、跨帳號本機 owner 不一致時誤解鎖，以及登出事件早於 session 清空的短暫授權；不修改 Save Schema17／正式數值／雲端 owner。
- 外觀偏好僅本裝置登入帳號，雲端 upload/download 與合法匯入不攜帶此偏好；真頁面服務替身回歸不代表真帳號雲端驗收。
> 高維新版替換：正式設計無披風、無星環、無漂浮星體；舊高維分層要求全部失效。只需完整角色、無武器身體、獨立武器；最新來源與待補見 `development/combat-animation/batch7/layer-review/review.json`。
- 30項狀態、素材自檢及最新 SHA／Actions 證據入口：`docs/BATCH7_INTEGRATED_ENGINEERING_REPORT_2026-10-18.md` 與 PR #38 說明。第8批與 Issue #37 未施工。

高維v2本次替換詳見 `docs/BATCH7_HIGHER_V2_REPLACEMENT_REVIEW_2026-10-18.md`。來源metadata保留在source-history.json；舊高維二進位已刪除。PR #38保持Draft；18項新角色六動作尚未允收，正式main與Pages未更新。
