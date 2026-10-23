> **新版第19-4批整合施工（2026-10-23）**：同一 [Draft PR #89](https://github.com/franksky1207/rpg/pull/89)，基準 main `b6d254c2dc9d4fb6b5d3d97ae48bd5db0263348f`。已完成全戰鬥前景取消、長 Boss 已播放 HP 與對應收益原子 checkpoint／去重、Schema18 備份保護及鏡像已完成場次恢復。保留 GM 實際開關、一次計算及既有補算。詳見[施工與驗收報告](docs/BATCH19_4_FOREGROUND_IMPLEMENTATION_2026-10-23.md)與[歷史唯讀盤點](docs/BATCH19_4_FOREGROUND_INTERRUPTION_AUDIT_2026-10-23.md)。本機 Chromium 回歸通過；最新SHA Actions待核對、iPhone實機未驗收。未合併、不可封箱。此段取代下方歷史19-4進度描述。

> **第19-2批施工與驗收入口**：[PR #79](https://github.com/franksky1207/rpg/pull/79)、[完整範圍與驗收報告](docs/BATCH19_2_GM_CENTER_2026-10-22.md)。玩家／怪物／對戰共用六動作，完整正式身份與工程API保留；本機三視窗整合已通過。是否正式封箱須核對PR最新head全Actions、合併main及同SHA Runtime／Pages最終驗收紀錄；本段不以啟動工作流代替完成。第19-3／19-4／20批未施工。

> **第20批已登記為後續規劃（2026-10-22；嚴禁提前施工）**：確認將五類玩家回顧戰規劃為安全退場；不新增GM回顧模式；保持首頁十選項、在「戰線紀錄」新增「劇情紀錄／怪物圖鑑」，分類涵蓋主線、災厄、副本、特殊怪及異宇宙。圖鑑僅展示現有靜態圖片、正式遭遇即永久解鎖、轉生保留、舊存檔依可證進度補登；高維第8格規劃由「文明災厄」改為只讀「文明傳承」，銀河／宇宙災厄正式戰不變。完整安全界線與六段規劃見 [第20批正式規劃](docs/BATCH20_MONSTER_CODEX_AND_REVIEW_RETIREMENT_PLAN_2026-10-22.md)。**優先完成19-2→19-3→19-4，然後才開第20批；PR #77暫不合併。** 本次純文件，無Runtime施工。

> **第19批後續固定施工順序（2026-10-22，僅規劃、尚未施工）**：19-1角色絕對大小已由PR #74封箱；**19-2＝GM角色與動作測試中心全面精簡整併**（保留玩家／怪物／對戰、六動作、正式身份與異宇宙選擇、診斷與自動化；移除第17批30隻並排入口、重複按鈕、長篇技術介紹、一般介面JSON/SHA）；**19-3＝全正式戰鬥智慧定位與雙方資訊框可視性**（實測動畫＋玩家／怪物框＋停止鈕，修正進場仍需滑動、載入／連戰定位與短螢幕安全退讓，不縮小19-1角色）；**19-4＝高維轉生後背景戰鬥秒殺異常調查修復**（由原19-2順延）。三批互不混批，最新main為唯一來源，完整範圍、步驟、限制與驗收見 [第19批後續施工規劃](docs/BATCH19_2_19_4_NEXT_WORK_PLAN_2026-10-22.md)。本次僅文件更新，未修改任何遊戲程式。\n\n> **第19-1批正式工程封箱（2026-10-22，PR #74已合併）**：最終PR head `c375417314e77c27b432e0bab3835051c36e7b3d` 的12項Actions、功能main `ef395a62e6039a4c1cbee45ff4f234dda6f1ebc0` 的23項Actions全部成功，Runtime／Pages成功；正式Pages 57原生入口、12故障輪廓比較及468公開檔案HTTP／SHA通過。依「動畫＋雙方名稱／血條」實測框目標26.82725483%，保留原倍率與完整六動作安全退讓；直向寬型Boss仍須寬度退讓，完整逐筆數據與限制見[第19-1批封箱報告](docs/BATCH19_1_ABSOLUTE_SPRITE_SIZING_2026-10-22.md)。每場原生驗收均先完成原新手UI，另有舞台遮罩可見性斷言。文件補記後最新main SHA、同SHA Runtime／Pages最終結果見[PR #74最終封箱紀錄](https://github.com/franksky1207/rpg/pull/74)；真實iPhone效能／溫度／耗電／記憶體與OS背景恢復仍待人工。

> **第18批功能工程封箱（2026-10-22）**：PR #73最新功能head13項、功能main `5a74031d83c172766430f5706b9560ff655b1d21` 的22項workflow全部成功，Runtime及Pages部署成功；正式Pages3000逐身份三視窗、60原生入口、15同頁連戰與94媒體快取驗收通過。20文化/200宇宙/五階段1000身份依固定文化映射，14沿用＋6新圖，原33圖/695身份及玩法owner不變。20映射、六SHA、逐筆證據、故障/壓力、Actions及發布詳見 [第18批封箱報告](docs/BATCH18_ALTERNATE_UNIVERSE_SPRITES_2026-10-22.md)；文件補記後最新main同SHA狀態以 [PR #73最終封箱紀錄](https://github.com/franksky1207/rpg/pull/73)核對。真實iPhone長時間溫度/耗電/記憶體與背景恢復仍待人工。

> **異宇宙怪物美術規劃（2026-10-22；第18批前置歷史）**：已確定20文化×每類10宇宙×每宇宙5固定稱號＝1000戰鬥深度；同一文化50層共用一圖，不同文化不可重複原型。規劃沿用14現有原型、另新增AU-01～AU-06六張；異宇宙Boss尺寸正式規劃為玩家可見高度1.5～2.0倍，與文明災厄／高維十王相同；僅定正式美術規劃代號，未產圖、未改資料或開啟異宇宙正式Sprite。開工前閱讀 [異宇宙完整規劃及SOP](docs/ALTERNATE_UNIVERSE_MONSTER_ART_PLAN_2026-10-22.md)，先核對最新main。真機驗收仍待人工。

> **第17批工程封箱（2026-10-22）**：PR #71已合併，功能main SHA `32bd7cf23eab8026a884040ced9f3789a2d0a583`；最終PR head十項、功能main二十三項Actions全部成功，Runtime及正式Pages部署通過。12張WebP、30Boss與高維競技投影整合完成；180共用版面、正式Pages真實入口90案例、120故障、279快速切換、1827舊身份、222副本／特殊怪及88媒體快取驗收通過。PNG原稿／預覽與報告未混入Pages。精確fixture同步與兩欄位守衛例外已獲使用者授權；歷史原文保留。完整SHA、倍率、發布及文件補記見 [第17批封箱報告](docs/BATCH17_BOSS_SPRITES_2026-10-21.md)及[PR #71最終紀錄](https://github.com/franksky1207/rpg/pull/71)。真實iPhone流暢度／溫度／耗電／記憶體與背景恢復仍待人工。

> **第16批副本Sprite整合（2026-10-21）**：56個副本固定身份與銀河／宇宙鏡像沿現役Actor／Renderer／Pool整合；V-01獨立登錄、共用真實Alpha版面owner。範圍、逐身份三視窗、故障恢復與最新發布狀態見 [第16批驗收報告](docs/BATCH16_DUNGEON_SPRITES_2026-10-21.md)。本機168／1827尺寸、224故障、6鏡像、8正式入口、80視覺切換與Batch6 32/32均通過；最新PR head、正式main與Pages封箱證據以PR #66最新紀錄為準，真實iPhone仍待人工。

> **怪物製圖與整合正式SOP（2026-10-21）**：後續所有怪物原型、身份配色、GM預覽、正式Sprite、資源與發布批次，開工前必讀 [docs/MONSTER_ART_PRODUCTION_SOP.md](docs/MONSTER_ART_PRODUCTION_SOP.md)。沿用第13批20圖與第15-4批609身份驗收成功方法；真實Alpha、正式／GM共用Actor尺寸、逐身份三視窗、故障恢復及同SHA Actions／main／Pages為強制門檻。最新main為唯一真實來源。

> **第15-4批施工**：正式／GM改共用既有Actor版面來源，609身份×3畫面逐筆結果及正式Sprite適用範圍見 [驗收報告](docs/BATCH15_4_FORMAL_GM_ACCEPTANCE_2026-10-21.md)。同SHA Actions、合併與Pages完成前不封箱。

> **第13批20圖整合（2026-10-20）**：14張新圖加PR #58既有六張，609正式身份對應與63筆外型修正，沿用GM／Actor／Pool；正式戰鬥維持關閉。驗收、來源核對與剩餘真機項目見 [docs/MONSTER_ART_BATCH13_TWENTY_INTEGRATION_2026-10-20.md](docs/MONSTER_ART_BATCH13_TWENTY_INTEGRATION_2026-10-20.md)；最終是否完成以本批PR與最新main同SHA Actions／Pages成功為準。

> **PR #48 接手結果與驗收索引（2026-10-19）**：修正已沿原分支合併，程式 main SHA `7b8138bff0fa414037ffe72ab864848cc7a05f79`；合併前 head `a9407dc27b7aacd3bd418ef2e137c620832422dd` 九項 Actions 全成功。停止原鈕採功能標記並保留行為；Ready 舞台中心對準 visualViewport，保留連戰空間與手動操作；Sprite 沿用六圖 pool／智慧下載。指定高維異相案例另加嚴為完整六戰全勝、兩輪全通才可通過。最新驗收、SHA、Pages 與工程封箱狀態以 `docs/COMBAT_CENTER_STOP_FIX_2026-10-19.md` 最新紀錄及 PR #48 說明為準；不得以舊 SHA 或僅啟動 workflow 代替最終成功。iPhone Safari 實際畫面、溫度、耗電與流暢度仍待真機。

> **手機戰鬥動畫定位整合（PR #46 已合併；快取補修 PR #47）**：新增共用 `combat-viewport-coordinator.js`，以正式舞台、Safari visualViewport 與停止鈕共同定位，僅手機可見動畫生效。範圍包含三紀元所有正式動畫戰鬥與連戰；不得改停止時機/數值/存檔。完整驗收與真機限制見 `docs/COMBAT_MOBILE_VIEWPORT_STOP_UNIFICATION_2026-10-19.md`；首頁 dungeonui.js 快取 token 由 PR #47 精確補修。最終發布需以最新 main 與 Pages Actions 證據為準，未經 iPhone 真機不可稱已驗收。

> **第12批最新承接**：延續 PR #43 與原分支。使用者已取消必須前向突刺，改為依素材選定正式攻擊動畫；已實際比較11個對照並整合短距離上挑斬（前臂／劍一體、原肘甲遮擋）。保留半月光環移除、GM單一介面與27個原owner逐位元保護。三viewport×三紀元×三敵人體型實際渲染、接觸、無裁切及不穿越通過；完整回歸、最新Actions、合併與Pages結果以 `docs/COMBAT_ANIMATION_RENEWAL_BATCH12_EXECUTION_2026-10-19.md` 及 `verification-summary.json` 為準，未通過不得合併。以下歷史狀態依各批當時紀錄閱讀。

> **新版第11批最終整合（2026-10-19）**：沿用 PR #42／`batch11-audio-resource-mobile-performance-20261019`；main 基準 `79da871`。修正正式 Sprite 去重狀態漏宣告造成第一次 sample 回退，保留原背景／極簡／數值與全部測試斷言；補上 lazy audio 原生瀏覽器回歸與資源快取識別。完整結果及封箱門檻見 `docs/COMBAT_ANIMATION_RENEWAL_BATCH11_AUDIO_RESOURCES_MOBILE_PERFORMANCE_2026-10-19.md`；修復提交 `9b9ede9d` 六項 PR Actions 全綠；本機 Batch 6 為 16 類、32/32、36 個不同原始測試，歷史分類使用同次完整執行證據。正式工程封箱以 PR #42 最終 head 六項 Actions、合併後最新 main 必要 Actions 及 Pages 全成功共同判定；最終 SHA 由 PR merge event 與同 SHA Actions 查核。iPhone 真機溫度／耗電與真帳號雲端寫入未測。

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

- 正式存檔基準：`SAVE_SCHEMA_VERSION = 18`；存檔、遷移與 Future schema 防護不可因清理變更。
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
