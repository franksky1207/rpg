# 第6批：舊3D相容與依賴整理

基準main：`987767dc3d443d6b1f1dc1b359cf2a086100456c`。先fetch並確認18項基準Actions成功，再檢查程式；基準成功不是本次HEAD驗收。

## 實際分類與保留理由

| 範圍 | 實際入口／用途 | 決定 |
| --- | --- | --- |
| 正式仍用、名稱含3D | `mode-foundation`、`appearance-snapshot`、`formal-snapshots`、`armor-selection`、`t3a-hybrid-policy`、`t3b-formal-*`及`formal-player-sprites` | 保留身份、政策、readonly事件、HP與生命週期；不是完整3D引擎 |
| 正式2.5D按需素材 | 公開`equipment-sprites-v1`四模組及`assets/gm-equipment-2_5d/v1`受控清冊 | 保留三套與武器SHA／引用池；不是全站預載 |
| GM舊場景 | `test-center`→shared-loader→prototype-engine／runtime／character-assets；atlas-review、GM battle及whole-suit | 八類31例仍引用場景工廠，不能整檔移除。正式權限GM啟動可預熱下載共享腳本，只有打開預覽才建立場景／GPU |
| G007既有3D相容 | registry內15個GLB（五槽×三LOD）、玩家rig、解碼器、character-assets、B比較PlayerActor及舊Renderer分支 | 保留53骨／9掛點、SHA／授權／穿卸／姿勢／釋放及舊相容測試；不升格為未來207套必備 |
| 未來場景與美術製作 | `development/3d-source`內Blender、build／export／refine／validate Python、原始材質與證據 | 保留GitHub來源，官方發布排除。允許未來用3D姿勢輸出2.5D，不恢復完整即時3D |
| 已退場的正式裝飾預覽 | formal-home／formal-dom／preview-expand | 原路徑已不存在、無正式引用；封存來源／原SHA與演進鏈保留，繼續停止發布 |
| B3受控GM比較依賴 | `stage-hybrid-preview.cjs`逐條manifest／SHA白名單 | 正式發布稽核後另外stage必要依賴，不能把整個development公開，也不能誤刪GM真正使用的受控子集合 |

`node scripts/equipment-phase6-audit.cjs`輸出[逐模組反向引用、SHA、bytes、factory消費者與發布數據](evidence/equipment-phase6/dependencies.json)。所有已發布3d-test JS／MJS／CSS均有引用；詞法引用僅支持「保留理由」，不證明無動態引用或真實執行情境。本批沒有能證明安全、值得再刪除的模組；新增刪除數為0，沒有大量刪除歷史素材。舊3D能力已按需隔離，不為增加修改量重構。

## 持續檢查

新增gate在原`equipment-formal.yml`執行：已退場路徑不得回流、G007 15 GLB精確SHA／bytes／license／preload=false、Blender／工具不進官方選材、全部factory有消費者、完整3D總開關保持false、wholeSuit分支在ensure(engine)前返回。原G007及來源鎖測試全部保留。

正式瀏覽器三尺寸11場另採集實際請求，要求0 Babylon／GLB／prototype-engine／舊3D runtime下載；無角色圖片提前下載的原斷言保留。這是runtime網路證據，與「發布包保留按需GM資源」分別判讀；不是要求發布包完全沒有3D。GM的正常3D請求由原GM及G007測試核對。

未改正式JS／CSS／HTML／SW或素材bytes，故不製造新的cache-bust或重寫歷史SHA；既有manifest仍須精確重生成比對。新audit只在工程／CI運行，不進遊戲包。
