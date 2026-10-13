# T3～T5 工程階段驗收（正式啟用／美術／真機 Gate 未批准）

基準 main：48009e8d8f87afc8bfef0c68cb4c02e854b2944f。使用者授權連續 T3-B/C → T4-A/B/C → T5-A/B；沒有啟動後續美術量產。完整命令、結果、SHA／bytes 與原失敗歷史見 [機器證據](2_5D_B_T3_T5_EXECUTION_EVIDENCE_2026-10-13.json)、[依賴盤點](2_5D_B_T4_DEPENDENCY_INVENTORY_2026-10-13.md)。本機工程與自動化驗證通過；本文件提交後仍須核對交付 exact HEAD Actions，不以舊 SHA 綠燈代替。

| 階段 | 實際完成與技術證據 | 未批准部分 |
|---|---|---|
| T3-B | 真實 Babylon 原人物 GLB／五槽／三 LOD、53 骨／9 掛點相容重定向、敵方 RGBA atlas／六動作、接地影／合法 cue；正式事件橋＋共同 presentation token/index/pacing，統一 `.combat-screen` 路由，未知逐擊 HP/盾不補造 | 尚無已批准正式敵圖清冊；缺少或未核准身份繼續文字，不把測試核准當正式素材 |
| T3-C | 畫面不 await 核心；背景／極簡／倍速／過期動作抑制、取消 signal、晚到載入／context loss／重入／dispose；音效仍原 owner；停止後 host 隱藏，故障有可見文字回退 | 真手機、實體 GPU／網路及 30 分鐘使用待驗 |
| T4 | 正式 home/dom 控制、host、劇情／首頁／地圖／服務／養成／副本注入、hook、專屬 CSS／預熱引用退場，原件逐 byte 保存 development 歷史區；三 viewport×11 路由×100 次切換零裝飾請求／Canvas／引擎；GM 共用 factory 與 31 案例保留 | 後續人工逐頁確認布局與 GM 返回位置 |
| T5-A | 依反向依賴解除純預覽發布引用；保留 shared-loader／runtime／prototype／快照／正式模型／歷史 A/B/C、Blender、授權；更新 cache-bust／manifest／源鎖驗證與 meaningful tests | 不刪 GM／B 依賴，不強制清快取／存檔 |
| T5-B | 核心 576／鏡像48、GM8／31、戰鬥／三紀元／異宇宙／回顧／轉生／存檔／音訊／背景／Fast Catch-up、角色與裝備 browser、發布 HTTP／SHA、Range／存檔隔離；實際軟體 Renderer 32 子集合＋100 次建立／釋放、三敵三 tier 六動作、三尺寸與 context loss 通過 | stage40 最終美術／發布、真機／雲端真帳號／聆聽未驗，不稱全部正式發布完成 |
| T5-C | 不需要：原舊 3D 偏好仍安全回退文字，未見需要資料／schema／歷史快取強制遷移的問題 | 不新增無必要相容遷移 |

## GM 圖集能力與來源隔離

實際程式原先沒有 atlas 檢視，不因 31 案例存在就說有。新增 `atlas-review.js`，放在原「戰場與生命顯示」案例的「動畫圖集檢視（自由測試）」折疊區，不新增第二個中心或案例。它只接受顯式核准的 `CivilizationGMApprovedAtlasCatalog`、逐項 reviewed、六動作 700ms／22 endpoint samples／1/30s、合法 path／license／SHA／bytes／PNG dimensions。手動選動作與畫格，沒有第二個戰鬥時鐘／音訊播放器。晚到載入、切案例、關閉和 hash 錯誤會釋放 bitmap 並清除過期圖像。

當前沒有正式核准清冊，GM 顯示 unavailable，不將開發素材加進正式發布。browser 使用記憶體測試核准與實際 B2 三敵 PNG，逐六動作實際畫格 pixels、SHA 故障與關閉回收通過；不代表美術已批准。後續核准素材由原身份／source-publish 規則登錄後提供清冊，不能拿 G007 冒充 G006。

## 保護、已知限制與回退

正式數值／RNG／掉落／結算／存檔／雲端／離線／音訊 owner 源檔不改；原 T2-A Fixture `5a74c2ee...` 未重製。原身體／三 LOD／G007 十五 GLB／210 套1050名稱、B2 Blender／GLB／PNG 與 r2 失敗數據保留。新增 GM extension 的前後完整源檔 SHA 也保留於 retirement ledger，原 B2 lock 不改。100 次 Renderer 測試 Math.random 呼叫零，避免 GPU 幾何 ID 消耗正式亂數。

B2 native 材質光影公平性及肩甲／護手／劍首局部接觸風險仍保留，不將距離代理稱精確穿深。原 RGBA 貼圖倒置已由實際 source PNG／WebGL crop 驗證修正；方向 RMSE 44.7519 < 倒置71.5563，只證明方向，不能作公平選型或美術封版。

`FULL_3D_AVAILABLE=false`、`formalReleased=false`；沒有全面正式啟用。交付 SHA／exact-HEAD CI 由 push 後最終回報及 GitHub 記錄確認；檔內 CI 是記錄當時的已觀察狀態。回復從最新提交往前逐一 `git revert` 本任務提交（含源鎖／清冊／cache-bust），保留玩家資料，不使用 reset／刪除存檔。基準 SHA 與各提交見執行證據及 git log。

## 人工／實機清單及後續順序

正式桌機／手機：三紀元合法模式、異宇宙／回顧／轉生、裝備養成與存檔正常；正式頁不再有獨立預覽。GM：八分類31案例、正式快照／自由測試分離、五槽／LOD、最大化／返回／故障提示；圖集缺核准素材應 unavailable。至少30分鐘手機操作，直橫向、背景／回前台、倍速／極簡、弱網／熱快取、音樂音效與發熱由真人實測。

正式 B 仍閉合，不能聲稱目前玩家已全面看到新戰鬥；具核准身份清冊與正式啟用批准後，才由真機驗收其畫面及效能。後續固定：01～27 相容性補查 → 承接28既有 G001～G020／40概念圖／五槽成果 → 29～40 B 美術與功能。未進行量產，stage40 Gate 未通過。
