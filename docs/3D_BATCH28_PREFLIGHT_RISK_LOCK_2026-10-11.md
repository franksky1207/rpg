# 《文明戰線》第 28 批開工前風險封鎖與五槽契約（2026-10-11）

> 本文件是第 28 批 **施工前置限制與驗收門檻**，不代表五槽 GLB、蒙皮、穿模或長測已完成。檢查基準：main `7e143c378975e7ab0cca783afa3eb6a226b4da01`。後續一律重新讀取當下 main。本文件不改正式遊戲行為。

## 0. 現況與嚴禁誤判

- 正式人物基底已經使用者實機檢視並同意作第 28 批基底；不重做人物造型或隨意改骨架。
- 既有 `assets/3d/asset-registry.json` 僅有 decoder 與人物 low/medium/high 共四筆；**沒有**正式五槽裝備 GLB 資產身份。
- `3d-test/appearance-snapshot.js` 已有五槽 `type/present/world/name/visualKey/quality/level/enhancement`，仍回傳 `assetKind:geometry-fallback`、`assetId:null`。
- `3d-test/prototype-engine.js` 的 `createEquipmentScene` 仍為程序式幾何陳列。正式角色 `createCharacterScene` 會載入實際人物 GLB，尚未將裝備模型掛至人物。
- `scripts/asset-registry.cjs` 的 GLB 必備 skin/material/animation、五掛點檢查目前適合人物；**新增裝備 GLB 之前必須依資產 type 分流檢查**：硬質武器/飾品不必自帶 53 骨骼/動畫，柔性鎧甲/鞋具則必須證明 rig 兼容；不能降低人物原有嚴格檢查。
- `tests/runtime/3d-asset-registry-integrity.cjs` 現在斷言 `entries.length === 4`，新增裝備正式身份時須改成「人物既有四資產仍正確＋所需裝備完整」而非以固定總數阻擋擴充。
- 第 27 批 35,325,524 bytes／366 檔是已記錄的精簡產物基準，不等於最新 deploy 驗收或首次下載容量。

## 1. 固定人物與裝備契約（P0）

**不可更動**：人物 `cw.humanoid.rig.v1`、53 骨骼名稱/父子/靜止姿勢/rest matrices、人物低中高 LOD 同一 bone/socket identity，已驗證的九個掛點 local transform 與其父骨，以及人物原本的 idle animation 相容性。若真的需要改契約，另立版號並經使用者明確同意；第 28 批預設絕不做。

- 座標：Blender 公尺、+Z up／-Y forward；glTF 公尺、+Y up／+Z forward，scale=[1,1,1]，pivot 對齊 socket local origin，旋轉依 socket local quaternion。
- 五槽：`weapon → socket.weapon.R`、`helmet → socket.helmet`、`armor → socket.armor`、`shoes → socket.shoes.L`、`accessory → socket.accessory.back`。左手武器、右鞋、胸口受擊、root 特效為其餘四個已存在的輔助掛點；不可只驗五槽而遺失輔助掛點。
- 硬質裝備（武器、硬質飾品、部分頭盔）：可附著掛點，但需驗證 pivot、朝向、縮放、動作中不漂浮。
- 身體貼合裝備（鎧甲、鞋具、貼頭頭盔）：不能只把一大塊物件 parent 到單一掛點，應使用與人物骨架相容的 skin/weights 或經姿勢測試證明不穿模的分件掛載。
- 左右鞋同一槽共同受控；卸下 shoes 時左右兩腳一起回到基底。完整五槽任一 LOD 不可缺失關鍵左右件。
- 第 28 批的第一套五槽必須是**五件實際獨立造型、可組合上身的人物裝備**；色塊與 primitive 幾何不得算完成。

## 2. 唯讀外觀／狀態一致性（P0）

資料來源唯一：正式 `state.equipment`／`state.enhancement.levels`，透過既有 `Civilization3DAppearance.capture()` 與 `modelDescriptors()` 輸出。正式與 GM「正式角色外觀快照」使用相同 descriptor 與正式資產 ID；GM「自由展示模式」只能以 isolated fixture 產生同形狀 descriptor，**不可反寫** state、inventory、save、雲端、戰鬥或鍛造。

- 五槽固定順序 `weapon,helmet,armor,shoes,accessory`；每槽 `present=false` 必須完全移除該槽模型，不以空槽佔位物冒充穿著。
- `name`、`visualKey` 保留現有 1,050 正式名稱位置映射與跨紀元混搭；第 28 批採「先可用的共用五槽資產，再由 29～30 擴充家族映射」，不得偽稱五槽共用模型等於 1,050 個獨立模型完成。
- 3D 可選材質/視覺品質/強化階段，但不重算正式數值，不向玩家 save 加入第二份物品權威，不利用 GM 測試資料污染正式快照。
- 必須測：全空、五個單件、五件同穿、卸任意槽、跨紀元與品質混搭、快速切換、新舊快照交錯、正式/GM 來回以及背包/鍛造/戰鬥顯示一致。

## 3. 遮蔽與穿模規則（P0）

目前 `region.head/torso/legs/feet/back` 僅為來源遮蔽語意；**尚未是正式 runtime 動態遮蔽**。先將「區域 ID → 原人物網格/子網格 → 裝備啟用條件」定義成可稽核資料與可回復的場景實例狀態，不修改共用 GLB CPU 資料；不要以直接刪除人物 mesh 的方式遮蔽。

- 頭盔：只隱藏真正被包覆的髮／頭部相應面，不意外消失臉、眼睛及頸部。
- 鎧甲：遮蔽內層軀幹並測肩、肘、脊椎、腰髖的彎曲；穿著時不得露出雙層衝突的身體。
- 鞋子：左右鞋獨立對齊腳骨，但共用 shoes 槽；驗證踝、膝的動作。
- 背飾：基本背部避讓；第 29～30 批才處理各家族精細布料和極端形狀變體。
- **回復性**：卸裝、換 LOD、切展示模式、預覽失敗、關閉／重開都必須回復基底區域可見狀態，不能留下殘留 mesh 或永久遮蔽。
- 第 28 批必備 idle＋頭轉＋肩肘＋髖膝＋左右手握持姿勢證據；更完整武器攻擊動作交第 30～31 批。不能僅憑靜止截圖宣稱解決全部穿模。

## 4. 非同步競速、回退與資源生命週期（P1，開工前定義）

- 每次裝備展示更新需有 generation/abort/isCurrent 檢查：後返回的舊 GLB 不可覆蓋更新的裝備；失敗只降級該裝備，不殃及其他已成功槽位或人物。
- 每個場景持有自己的 Babylon meshes/materials/containers；關閉與切場景時應 dispose GPU 資源；共用 CPU bytes 依既有 bounded LRU 重用，嚴禁把同一可變 GPU container 同時安裝在兩個場景。
- 資產唯一身份須包含穩定 `assetId + SHA-256`，不得只靠名稱或品質推估 URL；檔案錯誤 SHA、404、WebGL context loss、版本競速皆應保留既有幾何/文字回退。
- `resource-cache-sw.js` 與 `resource-cache-client.js` 沿用原單一服務與逐檔版本指紋，**不新增平行 SW 或清除有效媒體快取**；未用到的紀元裝備不進全站 49 媒體背景預載。
- LOD 基準沿用正式人物 low/medium/high 選擇；裝備低中高版本應和人物 LOD 同步，不可在手機 low 預設時偷偷下載全套 high 資產。需測首次/熱開 bytes、弱網、切裝次數與 GPU 釋放。

## 5. 發布／CI 必須先調整的相容性（P0）

施工資產進倉前，先調整 `scripts/asset-registry.cjs`、相關完整性測試及發布依賴驗證，令新 `type:equipment` 資產可走合法路徑、授權/原始來源/sha/bytes/LOD/preload=false 強校驗。人物 type=character 必須繼續驗 53 bones、完整 weights、動畫、人物九掛點與貼圖；裝備按 rigid/skinned 類型驗所需骨架或附著點、遮蔽規則，不可放寬至所有 GLB 只要 JSON 存在即可。

- `scripts/publish-assets.cjs`／`scripts/build-publish-dry-run.cjs` 必須將新增動態路徑明確列入 registry closure；成品不能混入 `.blend`、母材質、測試圖、未採用素材。
- 新增裝備完整成功後，測試 release-artifact 每一筆 hash/bytes、404/錯 SHA fail、首次與熱開網路請求、兩種 viewport 真正 Babylon 解碼及退場釋放。
- JS/CSS 修改須維護直接 HTML 的 cache-bust 與新版 `resource-manifest.json`；不得更動音訊 owner、正式戰鬥、離線、背包與存檔規則。
- 以**最終 main SHA** 的 Actions／Pages 執行結果為準，不能以較舊的成功 run 代替；Chromium mobile viewport 不是實際 iPhone GPU、30 分鐘發熱與記憶體證據。

## 6. 開工前風險關卡

| 風險 | 現況 | 關卡／可進入下一階段的條件 |
| --- | --- | --- |
| P0 骨架/掛點不相容 | 人物 rig/socket 已存在；裝備尚無 | 鎖定 rig v1 + 九掛點，Codex 匯出前可機器比對 |
| P0 正式快照不同步 | 五槽 readonly descriptor 已存在；assetId=null | 裝備只能從既有 descriptor 解析，GM 自由 fixture 隔離 |
| P0 遮蔽/穿模 | mask 語意存在，尚無 runtime 遮蔽 | 完成區域對照、可回復機制與至少基本姿勢測試 |
| P0 發布拒絕裝備 GLB | validator 假設 GLB 有動畫/骨架/人物掛點；測試固定四資產 | 第 28 批在登錄第一件裝備前修改並通過新舊分類測試 |
| P1 快速切裝殘留 | 人物場景有 dispose；尚無裝備生命週期 | generation 競速、卸裝與 GPU 回收自動驗證 |
| P1 手機資產負擔 | 人物 LOD/LRU 已具備；裝備未納入 | 五槽 low 初載、重複穿裝、切 LOD 與弱網量測 |
| P1 混搭缺模型 | 1050 名稱 metadata 已有；asset 解析未建 | 缺件逐槽退回共用五槽／安全幾何，不偽造正式模型 |
| P1 GM 污染 | 已有 readonly 正式/fixture 隔離 | 回歸測試確認正式 state/save/戰力不因預覽變動 |

**第 28-A/B 先做**：裝備 schema/validator 分流與 readonly resolver／換裝生命週期，再集中 Codex 製作一套真正完整五槽 Blender/LOD GLB；之後回到 ChatGPT 整合正式場景、GM、發布與實機驗收。第 29～30 批再擴充三紀元裝備家族及 1,050 名稱位置的美術差異；不得把此規格文件視為已完成五槽。
