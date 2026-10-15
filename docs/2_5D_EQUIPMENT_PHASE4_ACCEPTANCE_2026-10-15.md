# 第4批：GM整套角色與五動作整合

基準 main：`b4dc54c0d6a28cc033a20d8a51812c1081f674e2`。該基準12個觸發Actions均已確認success。本批只整合GM；正式B選材及`FORMAL_B_RELEASED=false`不變。

## 實際入口與成果

正式遊戲 → 已授權GM → GM測試頁 → **進入3D測試中心** →「玩家、裝備與養成／角色全身展示」→ **2.5D角色與動畫**。亦可從「戰鬥、動畫與特效／2.5D戰鬥模擬」切換同一個角色展示；原B模擬及原3D角色按鈕保留。八分類、31案例沒有新增或刪除。

- 自由展示：銀河紀元／地球戰爭可選G005防化服、G007遺址護衛；太陽系戰爭可選G018環帶防護甲。三套使用第3批原WebP bytes，沒有重新製圖、修改來源或建模。其餘207套可查詢正式身份，明示待製作、沒有假人物。
- 正式角色：每次從實際遊戲主頁取得授權、同源同iframe及requestId對應的唯讀快照。五槽名稱與各槽紀元皆須對應同一套正式身份；混穿不借用整套角色，明示回退。這是GM保守展示規則，第5批以鎧甲套選材須另行實作。
- 待機／攻擊／受擊／閃避／死亡、重播、重置、切換／重新同步。正常短動作回待機，死亡保持淡出；切換案例、關閉、重進均釋放舊actor、取消載入／RAF／監聽與bitmap。背景暫停展示RAF，回前景重新核對授權；持續展示約每2秒重新確認GM。
- 正式與自由選擇皆不寫入裝備、能力、背包、金幣、存檔、雲端及音訊。未取得GM授權的獨立測試頁不載入角色圖。

## 共用與發布

`gm-whole-suit.mjs`以既有`WholeSuitActor.draw(plan)`與B五動作控制器呈現手動視覺預覽；沒有新增權威傷害、戰鬥時鐘或重寫renderer。角色預覽有一個可取消RAF，只負責視覺取樣。

`scripts/equipment-gm-publication.py`驗證來源後可重複匯出：三張WebP（合計272,992 bytes）、210套必要正式名稱的精簡catalog，以及四個既有Runtime模組。匯出只改動畫契約的相對import、受控資產路徑／相對根目錄與GM發布許可檢查，其他共用邏輯原樣；`--check`比較確切輸出bytes。

正式路徑為`assets/gm-equipment-2_5d/v1/`及`3d-test/equipment-sprites-v1/`，沒有新GM對development URL的依賴。`gm-publication.json`逐檔SHA／bytes及固定8檔允許清單由發布稽核強制驗證；另加展示模組與樣式，合計10個新正式資源。拒絕多餘檔案、損毀bytes、缺鎖及錯誤發布旗標。原始PNG、概念板、審查證據、開發頁都不隨新素材公開。既有B比較頁仍沿用原本獨立、SHA受控發布步驟，並未放寬整個development。

| 層級 | 三套現況 | 其他207套 |
|---|---|---|
| 概念通過與製作資格 | 已通過 | 依原資料，不自動改動 |
| 真實角色美術完成 | complete | not-started |
| GM預覽資源發布 | gmPreviewAllowed=true，僅三套 | 無資源，不准冒用 |
| GM自動化驗收 | 依下列實跑結果及證據 | 沒有聲稱通過 |
| 使用者手機／桌機實機驗收 | 待使用者操作 | 不適用 |
| 正式戰鬥外觀啟用／正式發布 | false | false |

第3批來源registry的`gmTestStatus=not-tested`／`publish=false`保留為原始階段紀錄；本批不將其硬改成正式批准。現行GM預覽發布由獨立受控manifest與本批驗收證據負責，不能由概念批准推導。正式戰鬥仍未啟用，僅三套素材完成。

## 已執行檢查

- 原裝備資料庫68項、素材Python17項、原素材Node9項、新GM Runtime11項通過。新測試含正式五槽／錯紀元／混穿／fixture拒絕、獨立GM發布許可、404／SHA／解碼錯誤、快取／中斷／取消／重複／釋放／記憶體上限。
- 原正式快照15項、共用loader10項、B播放16項、B renderer12項、combat events4項；G007五槽／15LOD、registry、batch28 preflight、批01～27相容稽核、玩家快照、發布回歸、SW cache／prefetch、音訊20項及9正式owner回歸通過。相關實跑輸出在`docs/evidence/equipment-phase4/`。
- 原GM瀏覽器回歸：八分類／31案例、手機最大化還原通過。新GM發布包瀏覽器115項斷言通過：1365×900、390×844、844×390，三套真圖像素、五動作與死亡淡出、快取、正式／自由及存檔不變、撤權、關閉重進、案例切換、最大化捲動原位還原、404／SHA／解碼失敗安全回退。最終輸出及三張完整面板截圖已收錄證據，測試對象為`.publish-stage3`實際發布包，非development預覽頁。
- `equipment-concepts.py generate`連跑兩次changedFiles=0；`equipment-gm-publication.py --check`通過。210／1,050身份、60概念圖、G024/G030例外、G006/G007歷史資料未改；G007原GLB與原3D入口完整保留。
- 本機執行曾發現：舊B發布數量鎖未計入10個GM資源；舊T4／批01～27只認歷史query變更；發布fixture缺新允許清單。已以**固定新範圍、舊main原始SHA及確切新SHA**擴充驗證，保留原歷史鎖；fixture改為帶入真允許清單並要求development引用被拒絕，沒有停用檢查。GLTF回歸首次缺環境套件，使用已安裝gltf-validator後重跑通過。手機scroll測試改為量測實際點擊前位置及等待還原完成，沒有移除位置檢查。

## 實機及第5批交接

手機直向／橫向與桌機：選三套、五動作、死亡後重置、快速點擊、切換正式／自由、最大化還原、返回與重進。預期角色完整且按鈕可點；正式資料不變。真機觸控、實際Safari／iOS記憶體與作業系統切換仍待使用者確認；Chromium viewport結果不冒稱實體手機驗收。

第5批才把鎧甲正式身份選材接入正式B時鐘／事件、HP／護盾／背景／極簡／倍速與音訊同步。沿用本批共用actor、pool與受控來源；不得直接用GM自由資料或打開正式發布旗標。其餘207套美術仍缺，G024/G030不需修圖。回退可revert本批提交，原戰鬥／3D資產未改。

提交後須另查exact-HEAD Actions及Pages部署；本報告不預先宣稱尚未完成的CI或真機通過。


## 首次提交Actions後續修正

首次提交`0de05e07f51bbda252141dd0941870b4e37fdfbd`的新增GM整合、Sprite Pipeline、Equipment Concept Database、快取版本及發布稽核Actions均已success。B2 run38665264122與B3 run38665264130在Python `tools/inventory.py`失敗，實際訊息為`Protected non-B1 source changed: gm3dprototype.js`：該入口沒有轉交本批精確歷史來源驗證。已將列於phase4來源鎖的路徑交給同一Node驗證器，原始B2 source-lock完全保留。B2盤點（1,102檔）與B3盤點（135檔）及B3 manifest／常數指紋同步；所有GLB、圖集、原始美術與失敗證據bytes未改。B既有import鏈與GM入口只更新查詢版本，避免舊快取帶入過期manifest。兩個Python --check、原B GLB／來源契約及12項renderer契約已重跑通過。最終Actions仍須對修正後HEAD重新確認。
