# 《文明戰線》第 28-B 批：正式角色五槽 GLB 接口（2026-10-11）

## 實作與界線

本批延續第 28-A 技術契約，在 `3d-test/character-assets.js` 的正式 `attach()` 掛入 `prepareEquipment()`，直接使用 `Civilization3DAppearance.resolveEquipment()`，依 asset registry 及人物 low/medium/high 選取五槽裝備；不創造第二套裝備數值與玩家存檔。

- **只在 asset registry 確實宣告裝備時啟用**；目前 registry 仍只有 decoder 加人物三 LOD，因此現有正式畫面維持第 27 批人物，不假稱已換裝。
- 資產必須 `type=equipment`、槽位、LOD、SHA 與人物 `rigContract` 相符，使用現有 `verified()` 做 bytes + SHA-256 驗證，再經本地 Babylon glTF loader 解碼。
- 已驗證的 `rigid` 裝備才能以對應人物 socket 掛接；沒有已驗證 joint-name/rest/bind-matrix 對照的 `skinned` 裝備**拒絕掛載**，避免錯誤變形。這是有意義的安全界線，不是 skinned 已完成。
- 每一槽載入失敗獨立退回，其他槽不因此中斷。空裝不下載、不掛物件。正式人物與 GM 角色場景使用同一 `createCharacterScene()`、同一 loader 路徑及唯讀 descriptor。
- `equipmentSession(scene)` 既有 generation 判斷防舊結果覆蓋新結果，本批補接載入完成後的 `commit()`、卸裝容器 `dispose()`、錯誤掛載容器清理、預覽取消後再檢查。此階段以場景重建更新外觀，**尚未新增正式遊戲即時無重建熱換裝操作**。
- `region.head/torso/legs/feet/back` 目前尚未與正式 GLB mesh/submesh 建立可靠分段身份，因此本批採 `no-hide-without-verified-region-mesh`：不任意隱藏人物的頭、軀幹或腳。真正骨架蒙皮、人物網格遮蔽分區與穿模驗收須由第 28-C 正式 Blender 資產確認後接續完成。

## 自我檢查與驗收

- 已在 `tests/runtime/3d-batch28-preflight.cjs` 補新 loader hook、SHA 驗證、rigid-only、遮蔽保守原則與場景 owner 靜態守門；沿用既有五槽 descriptor、取消競速、卸裝、關閉測試。
- 已將新 JS 的 `resource-manifest.json` SHA-256/96 指紋同步更新，沿用既有 Service Worker、精簡發布與原本三個工作流程。沒有新增裝備 GLB、預載、第二個下載器或額外原始檔進 Pages。
- 無正式裝備 GLB 可進行人物實際換裝截圖，因此**不應標示五槽實裝、skinned 蒙皮、精確遮蔽、快速熱切、正式手機 GPU 長測為完成**。
- 仍需在最終 main SHA 的 Actions 執行 `node tests/runtime/3d-batch28-preflight.cjs`、資產台帳回歸、精簡發布瀏覽器及人物模型測試；本次未獲真實執行結果，不宣稱全綠。

## 第 28-C / 後續必要輸入

1. Blender 人物 low/medium/high 骨架 53 joints、九掛點確切 local transform 對照；第一套五槽真正可穿裝正式資產。
2. rigid 裝備三 LOD 的正式 pivot 與 socket 朝向；鎧甲、鞋子等 skinned 裝備的 bone name、inverse bind matrices、權重與共用動作驗證。
3. 各人物 LOD 的頭、軀幹、腳、背部可遮蔽 mesh/submesh 身份；若尚未切分，先由 Blender 補分區，不准 runtime 任意隱藏整個頭。
4. 在真 GLB 可用後，繼續接入場景內不重建的即時換裝，五槽混搭與 GM 裝備陳列共用正式資產，並完成穿模/30 次切換/真機驗收。

正式遊戲、音樂、戰鬥、成長、背包、存檔、雲端、GM 權限、快取服務、Pages 發布來源均不應因本批更動。