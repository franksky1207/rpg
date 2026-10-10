## 2026-10-10｜第 19～26 批後整合優化第 2／6 批：3D 載入與快取一致性
- 保留正式首頁按需載入、GM 獨立 iframe、現有 31 場景與正式角色快照授權界線；未動玩家戰鬥、裝備或存檔。
- 修正 GM `3d-test/test-center.js` 原本只要任一 manifest 指紋缺失就讓整組 3D 資源回退的問題：現在檢查 schema 與各路徑的 24 位 digest，只針對缺失項使用各自的安全備援；與正式 `3d-test/formal-home.js` 的逐檔 fallback 契約對齊。GM 外觀模組 fallback 改與正式介面一致。
- 正式及 GM 的動態 script loader 清理 load/error callback，失敗時移除 script 元素，避免失敗節點積累；仍於使用者開啟需要的 3D 預覽時載入。
- HTML 入口 `index.html`、`3d-test/index.html` 的變更檔快取參數更新至 `20261010-opt2-loader`；`tests/runtime/3d-b18-coverage-guard.js` 更新 manifest 部分缺值守門及 cache 斷言，保留 Runtime 第 1 批 4 版防護。
- 本批**未拆出共同載入器模組**，因為正式首頁與 GM iframe 載入時機和環境不同；改以相同逐檔驗證契約和靜態守門減少分歧。後續若要完全抽成一個 shared JS 模組，須先確保文字模式零阻塞與 GM iframe 同源／授權隔離。
- 完成程度：GitHub main 已更新；本批尚未獲得實際 Chromium、Pages 部署與手機 WebGL 測試結果，不可宣稱通過。下一批為額外整合優化第 3／6 批（外觀模型映射與舊幾何降級），正式第 27 批不重編。

## 2026-10-10｜第 19～26 批後整合優化第 1／6 批：資源生命週期（項目 1、2、9）
- 正式第 26 批多數實機測試已由使用者確認；尚有依賴後續正式 GLB 模型的 GPU/LOD 實測，不可提早標通過。
- `3d-test/runtime.js` 升為 VERSION 4，保留原 `assets Map` 相容 API，新增 `acquireAsset(key,factory)`／`releaseAsset(key)` 參照計數契約與 `leasedAssetCount` 唯讀檢查資訊；清理、停止、故障時統一處理暫存資產，防止下一次 Engine 啟動沿用已釋放的 GPU 物件。未來 GLB loader 必須配合非同步 abort、執行期資產與場景實例的所有權規範；**此批沒有實際導入 GLB，也不能宣稱已全面驗證 GPU refcount**。
- 非同步場景失敗且 epoch/AbortSignal 已失效時直接以 stale-scene 返回；WebGL context restored 回覆 idle 狀態而非冒充已恢復先前 scene，仍須使用者/主介面重新啟動預覽，文字模式不受干擾。
- 正式與 GM fallback runtime URL 及兩側 HTML cache-bust 均改為 `20261010-opt1-lifecycle`；更新 `tests/runtime/3d-b18-coverage-guard.js` 的版號和靜態守門。
- 已提交並回讀 GitHub main；實際 Chromium、授權 GM iframe、手機 WebGL 故障注入／長時 GPU profiler 尚待執行，不得與程式自我檢查混為一談。下一批整合優化為第 2／6 批（載入器及快取統一），原正式第 27 批編號不變。

## 2026-10-10｜正式 3D 第 26 批：A2 Runtime 效能與場景生命週期施工
- 使用者已確認正式第 25 批實機測試完成。第 26 批本次採保守 Runtime 調整，不改正式遊戲 owner、文字版戰鬥／存檔、GM 授權或 GLB 施工計畫。
- `3d-test/runtime.js` 升級 VERSION=3：以 ResizeObserver 監聽預覽容器尺寸，處理手機最大化／還原和非視窗尺寸改變；頁面隱藏、pagehide 暫停 WebGL render loop 中的 scene.render，pageshow/visibilitychange 恢復及 resize；場景 async show() 加入 AbortSignal stale check；dispose 時移除新增事件監聽與 ResizeObserver。
- 正式 `3d-test/formal-home.js` 和 GM `3d-test/test-center.js` 共用新版 Runtime fallback；`index.html` 和 `3d-test/index.html` 更新快取，靜態 guard 新增 Runtime 生命週期及版本守門。31 GM 場景不變；資產映射、模型 LOD 與 GPU 預算的正式模型複測仍留在 27～34 批。
- 本批僅已完成程式施工與 GitHub main 檔案回讀/靜態守門內容核對，未提供實際 Chromium、手機 GPU 30 分鐘、記憶體 profiler 或 WebGL context loss/restore 通過紀錄；**不可視為 A2 全場景 L2、GPU 無洩漏或第 26 批實機驗收完成**。舊 asset cache `Map` 尚無 GLB refcount，不能冒稱已解決正式模型 GPU cache。
- 實機驗收請依序測：正式與 GM 切換不同 3D 場景、桌機縮放與頁面捲動、手機直橫轉及最大化還原、分頁背景→恢復、WebGL context loss 回退、連續關開 30 分鐘觀察 GPU/記憶體與畫質、切文字模式且存檔不變。下一個正式施工批次為第 27 批，但應如實保留本批 GPU 長測結果。

## 2026-10-10｜正式 3D 第 25 批：全息紀錄、劇情與轉生非阻塞預覽
- 使用者確認第 24 批實機測試完成；正式第 25 批依原 40 批編號施工，不影響補修批次。
- `3d-test/prototype-engine.js` 的 `createChronicleTransitionScene()` 共用正式及 GM 已有的三個唯讀場景（戰線紀錄／劇情閱讀／文明轉生），加入檔案庫全息索引、資料碎片、書頁視覺線條，以及轉生用環形紀元門與輕量動畫；不新增 GM 重複選單，也不虛構正式劇情文字。metadata 明確標記 `skippable/nonBlocking`；視覺預覽仍由既有 HTML 開關及轉生 owner 控制，動畫不阻擋使用者操作、真正轉生、劇情閱讀、回顧或警示。
- 快取版本：正式 `formal-home.js`、GM `test-center.js` 入口與 `prototype-engine.js` 備援路徑更新為 `20261010-b25-chronicle`；工廠版號 `0.25.0`。靜態 coverage guard 保留前批邊界檢查並新增本批視覺標記斷言。
- 自我檢查：GitHub main 回讀與版本/來源標記靜態檢查；未在本批執行 exact-HEAD Node、Chromium、手機 WebGL 長測或正式登入帳號實機操作，不能宣稱已通過。
- 使用者實機驗收：戰線紀錄回顧仍能操作與閱讀；劇情文字、換頁、警示及 3D 預覽並存；轉生必須保留原確認流程且可立即關閉預覽；GM 三場景可切換；桌機／手機反覆開關、最大化還原、context loss 後安全回退；正式角色與存檔不變。
- 第 25 批程式施工完成，下一批原訂第 26 批效能／鏡頭／質感驗收；不可提前開放正式完整 3D 模式。

## 2026-10-10｜正式 3D 第 24 批：災厄與異宇宙維度環境（程式施工）
- `3d-test/prototype-engine.js` 的共用 `createFrontierScene()` 新增固定上限 12 個維度裂片、外圈維度邊界；雙紀元十災厄依正式 `calamitySeals` 的 visible／unlocked／completed 呈現不同高度封印碑、解鎖環冠與旋轉核心環。此為純視覺幾何，不產生解鎖、永久 HP 或戰鬥狀態。
- 異宇宙沿用正式 200 宇宙／五深度及文化映射，按目前選中宇宙與深度呈現破裂核心與不超過 8 個裂片；未用 `U` 編號推測文化階級。兩個入口共用場景工廠，不增加重複 GM 場景。
- 已更新正式與 GM 備援場景版本，以及 `index.html`／`3d-test/index.html` 快取參數；原文模式、GM 授權、戰鬥及存檔程式未變更。正式完整 3D 模式仍未開放。
- 驗收邊界：已回讀 main 主要變動與靜態關鍵字，尚未取得本 commit 的 Chromium／手機 WebGL／長時間效能與正式帳號 iframe 實機結果；不得標記實機通過。請測 W1／W2 十災厄鎖定、可挑戰、完成；W3 異宇宙 U001～U200、深度 1～5、文化焦點；開關/重開預覽、手機全螢幕還原、context loss、31 GM 場景及文字模式進度不變。
- 原 40 批不重編；第 24 批程式施工完成後接第 25 批，正式 GLB 資產映射仍於第 27～34 批施工。

## 2026-10-10｜第 24～40 批正式施工強制繼承規則（五批補修定案）

> **規範層級：後續施工準則，不表示以下功能已獲實機驗收。** 當前 `main` 及其正式遊戲 owner 才是唯一真實資料來源；本節統整五批補修後適用於第 24～40 批的長期契約。原批次編號不變。

1. **3D 僅負責呈現。** 文字版與現有正式戰鬥公式、隨機、掉落、結算、帳號、GM、雲端、轉生、離線收益、速度與存檔繼續由原 owner 管理；3D／GM 視覺層絕不直接寫回正式 state、storage 或更動權限。正式 3D 模式要沿用同一角色及事件來源，文字模式永久保留。
2. **GM 預覽雙來源、缺資料不造假。** 有動態內容的場景提供「同步正式資料／自由測試設定」：前者僅透過授權、同源、限定 iframe 的唯讀快照，後者產生彼此隔離的視覺 fixture。正式快照不可用、載入失敗或欄位缺失時，必須明確顯示等待／錯誤，不得靜默改用自由模式數據；需要時按需載入，不將全部 3D 資源加入一般首屏。純裝飾、紀錄及服務場景不強制增設無意義的雙模式。
3. **GM「看圖優先」，控制項最少。** 不重建第二套完整 GM 數值工具；只選會改變可見模型／場景身份的狀況。文明災厄自由模式保留「第 N 隻＋模擬狀況」，視覺上前 N−1 隻完成、後面未解鎖，正式模式則逐隻忠實讀取銀河印記／宇宙文明條件，不套用這個便捷推算。專精、印記、文明等級、界弦核心及鍛造自由測試優先初始／成長中／已滿級；必要時才另增具體外觀差異的選項。
4. **三紀元裝備名稱和套組是權威映射，不是手動造表。** 銀河由 `WORLD_REGIONS`＋`MAPS` 提供 10 大區×10 小區×5 槽（100 套／500 名）；宇宙由 `SECOND_WORLD_REGIONS`＋`secondWorldBoss(index).equipment` 提供 10 大區×10 Boss×5 槽（100 套／500 名）；高維由 `THIRD_WORLD_EQUIPMENT_NAME_ROWS` 提供 10 個命名階段×5 槽（10 套／50 名）。共 **210 套／1,050 個名稱位置**；這些是名稱位置數，不意味要逐件建立 1,050 個不共用的 GLB。角色全身、五槽陳列共用紀元→大區→小區／Boss（高維直接階段）選取，選完下方唯讀列出五件正式名稱。正式模式讀實際穿戴，允許混穿、空槽，不能強制替換成完整套裝。
5. **第 27～34 批正式美術資產映射契約。** 模型／換裝／材質依原始 `type`、`world`、`name`／`visualKey`、品質、裝備等級、五槽穿戴與強化等快照建立**可追溯、可共用、明確標記缺件降級**的映射；外觀不以小區名稱臆測。裝備與來源不匹配是驗收失敗；幾何佔位不等於正式 GLB 完成。資產與授權、本地化、LOD、版本指紋、手機 GPU 預算在第 34 批集中檢查，且不能用第 26 批早期幾何效能代表最終模型效能。
6. **第 24～25 批及第 35～39 批場景／戰鬥契約。** 銀河、宇宙災厄與高維十存在、異宇宙 200×5、宇宙選定／回顧焦點，都由正式 owner 決定。高維無懸賞戰，不可冒用宇宙懸賞。正式戰鬥 HP／護盾以 `getCombatPresentationSnapshot()` 等已存在的 owner 為基礎；補齊特殊遭遇、結算、死亡、回顧、定相／異相三戰與高速補播等正式事件後才可宣稱完整同步，禁止讀 DOM 寬度或自由 fixture 假冒權威數值。
7. **第 26／34／40 批驗收與 cache 規則。** 每次改 JS／CSS 同步更新相關 HTML cache-bust，優先採內容指紋與按需載入、避免無限疊加過時參數；不清除或移轉玩家存檔來解決視覺問題。每次變更重讀 `main`、跑語法／靜態守門、實際可執行的 Chromium／GM iframe／桌機及手機測試，檢查 31 GM 場景、210 套名稱、正常／已全破角色、跨紀元、關閉重開、WebGL context loss、模式切換／回退、舊資源更新與正式存檔隔離。**未執行的測試不得標「通過」。** 第 40 批才作正式 3D 全面啟用決策。
8. **批次回報、風險與版本。** 施工前讀 `main` 及本規範；施工後回報「修改內容／程式自我檢查／實機驗收清單／提交與待補」，以當次真實 commit SHA 為準。五批一致性補修屬第 23 與第 24 批之間的插入作業，不重編原 40 批；目前已完成程式施工，**正式授權 GM iframe、手機 WebGL、Chromium exact-HEAD 與特殊遭遇／結算權威事件仍有待驗證缺口**。在驗收前不得稱五批已正式封版。

## 2026-10-10｜五批一致性補修：第 5 批總回歸與舊快取整理

**狀態：程式施工與遠端 main 靜態自我檢查完成；Chromium／真實授權 GM iframe／手機 WebGL／Pages 最新部署仍需實機確認，不能標為完整實測通過。**

- **整體**：沿用補修第 2 批的「同步正式資料／自由測試設定」隔離。只在地圖、災厄、異宇宙、五副本、四戰鬥、七個角色／裝備／養成可觀察場景提供有意義的切換。紀錄與管理維持純唯讀幾何展示。原 GM 八分類、31 項唯一視覺場景不變；禁止 GM 自由測試參數寫回正式 state、存檔或改變戰鬥／轉生／權限。
- **正式角色外觀**：原遊戲按需載入 `Civilization3DAppearance.capture()`，經已授權同源 iframe 回傳；不存在來源或資料不完整時顯示錯誤，不以 free fixture 冒充正式資料。正式裝備五槽顯示實穿名稱，允許混穿不同紀元及空槽。
- **裝備名錄回歸**：銀河 10 × 10 小區域 × 5 名、宇宙 10 × 10 Boss × 5 名、高維 10 階 × 5 名，完整 210 套／1,050 個名稱位置，來自既有 `WORLD_REGIONS/MAPS`、`SECOND_WORLD_REGIONS/secondWorldBoss`、`THIRD_WORLD_EQUIPMENT_NAME_ROWS`。新增 `tests/runtime/3d-b18-coverage-guard.js` 靜態 100/100/10 命名回歸守門；`tests/runtime/gm-3d-test-center-browser.js` 新增受控 postMessage 假快照的三紀元分層選單、來源切換、錯誤回覆與不寫 storage 斷言。**受控假快照測試不等於正式 iframe 已通過實測**。
- **使用者可見 GM 控制**：災厄自由設定僅「第 N 隻＋模擬狀況」，前 N−1 隻自動完成、後面未解鎖；角色和五槽裝備選紀元／大區／小區或 Boss（高維十階）並顯示五件名稱；鍛造與四養成以少量三階外觀選項為主；五副本及四戰鬥視覺只調整有意義的場景條件，正式 HP／盾優先讀 `getCombatPresentationSnapshot()`。各正式場景仍依原 owner 狀態，不得把自由模式的推算當作正式通關。
- **舊快取整理**：僅合併 `index.html` 的 `gm3dprototype.js`、`3d-test/formal-home.js` 與 `3d-test/index.html` 的 `test-center.js/.css` 長年疊加的舊查詢參數，改為單一 `v=20261010-repair5-final`；內容指紋仍須由既有 `resource-manifest.json` 產生流程管理。未清除任何玩家舊存檔、裝備或紀元進度，也不變更戰鬥、計算公式與正式遊戲 schema。
- **待驗重點**：需實際執行兩個 runtime 測試與 31 場景，確認真實授權 GM iframe 中的正式快照不再等待、高維全破角色 W1/W2 回顧焦點、三紀元 210 套裝名稱、異宇宙中斷、W3 懸賞排除、正式戰鬥盾／HP、手機最大化／還原、WebGL context loss 與新資源版本載入。特殊遭遇和正式結算 owner 尚未完整涵蓋，不應宣稱完成全部正式結果快照。
- 原訂第 24 批之前的五批一致性補修已完成**程式施工**，但正式恢復第 24 批前應先把以上實機 gate 核對；未取得通過證據不可標註正式封版。

## 2026-10-10｜補修第 4 批再次補修：正式角色外觀等待與 210 套裝完整對應

- **正式角色同步**：`gm3dprototype.js` 收到具 GM 授權與 iframe 同源來源的外觀請求時，先按需載入 `3d-test/appearance-snapshot.js`（優先使用 `resource-manifest.json` 內容指紋），等 `capture()` 完成才回覆。任何模組載入、角色或名稱資料問題回 `civilization3d:appearance-error`，GM 顯示具體錯誤，不再把 null 快照無限顯示為等待。此流程未新增普通玩家進站時的阻塞式 3D 載入。
- **不複製正式名稱**：同一回覆另附 `catalog`，來源皆為正式 runtime owner：銀河全域 `WORLD_REGIONS` + `MAPS` 中的 `map.name/gear[5]`；宇宙 `SECOND_WORLD_REGIONS` + `secondWorldBoss(index).equipment`；高維 `THIRD_WORLD_EQUIPMENT_NAME_ROWS`。只有 **銀河 10 區×10 小區域＝100 套（500 名）／宇宙 10 區×10 Boss＝100 套（500 名）／高維 10 命名階段＝10 套（50 名）** 的完整資料才接受；資料不完整會報錯，不用自編名稱來填補。無新增存檔欄位。
- **GM 自由模式**：角色全身展示／五槽裝備陳列共同採用「展示紀元 → 大區域 → 小區域／Boss」，高維則為「展示紀元 → 命名階段」；下一層選單各自不超過十項。選後下方**唯讀列出正式對應的武器、頭盔、鎧甲、鞋子、飾品五個名稱**，並帶入測試外觀的 `name/visualKey`。變更紀元／大區域自動重置不相容的子選項。
- **GM 正式模式**：下方五件裝備名稱直接讀取目前真正穿戴的個別裝備，而非強制套用某一套；允許不同紀元混穿與空槽。**目前角色與裝備場景仍是共用幾何佔位模型，名稱與 visualKey 已對應不代表正式裝備模型都已製作**。
- **強化鍛造台**：自由模式只保留展示紀元與「初始／成長中／滿級」強化外觀階段；正式模式維持五槽實際強化快照。去除舊的展示等級／品質／單一強化值／個別穿戴勾選等繁雜控制，不影響正式遊戲養成或戰鬥。
- **程式驗證**：逐檔核對十份銀河地圖 100 個五槽 gear 名稱、宇宙 100 個五槽 Boss equipment 名稱、高維十階五槽名稱，共 210 套 1050 個位置；原定義均齊全且銀河 500 名互不重複。GM iframe 真實瀏覽器、手機及最新 CI 實跑仍需驗收；不要將靜態檢查表述為實機通過。

## 2026-10-10｜3D 一致性補修第 4 批：角色、五槽裝備、養成、紀錄與設定

- 繼續採用第 2 批原則：「同步正式資料／自由測試設定」只用於有真實資料來源且可辨識外觀差異的場景，GM 以看 3D 圖為主，不是完整數值測試工具。
- 原本七項角色／裝備／養成場景的正式角色快照仍由 `3d-test/appearance-snapshot.js` 經已授權 GM 同源 iframe 提供；其五槽 `world/quality/visualKey/level/present`、五件強化、八專精、十印記、文明／界弦等級來源不應改寫。正式數值以真實資料為準。
- GM 自由測試：角色／五槽／強化沿用必要的世界、品質、穿戴與強化視覺控制；**八專精、十印記、文明等級、界弦核心**四項改為單一「初始／成長中／已滿級」視覺階段，移除 8+10 個別數值微調欄位，保留不同場景各自的階段記憶；自由設定僅在本次 iframe 預覽有效，絕不可同步寫入正式資料。對應瀏覽器測試更新至三階選取。
- `3d-test/prototype-engine.js` 五槽裝備場景的唯讀 metadata 增加各槽 `present/world/quality/visualKey`，鍛造場景 metadata 增加五槽強化等級／cap，專精與印記 metadata 保留各等級；**目前仍是程式式幾何佔位模型**，真實裝備 visualKey 的模型/貼圖映射尚未完成，不能宣稱已做出不同名稱裝備的正式高階模型。等到原正式第 27～34 批處理精緻外觀時必須沿用這些 owner 欄位。
- 戰線紀錄、劇情、轉生、設定、說明、帳號、雲端、GM 控制台：現有八項 GM 測試僅為唯讀幾何視覺，不是可操作的正式介面。它們本身不需要模擬登入／雲端衝突／實際轉生或再新增冗餘的同步/自由切換；正式 UI 負責操作、權限與確認。此批不更動正式文字戰鬥、轉生條件、帳號、雲端或存檔。
- 本批完成 GitHub `main` 程式提交與 JS 語法/靜態檢查、快取版本更新及 GM 測試斷言改寫；**尚未實跑 exact-HEAD Chromium、手機、授權 GM iframe 與 WebGL 實機驗收**。不應將「程式施工完成」寫成「已驗收通過」。

## 2026-10-10｜補修第 3 批加強：正式戰鬥呈現 owner 接入（本輪最新）

- 不沿用過去從 DOM 寬度猜 HP/護盾的 3D 正式預覽：現在 `3d-test/formal-home.js` 優先讀取 `combatfx.js` 的 `getCombatPresentationSnapshot()`（active 時包含玩家／敵人 HP、maxHP、護盾），無進行中快照時不建立虛構的戰鬥場景。**注意**：這個 owner 提供進行中的戰鬥呈現資料，並不等於所有副本結果／特殊遭遇都已有完整正式結算 schema。
- GM 四個戰鬥視覺預覽（戰場／護盾／特殊遭遇／結算）沿用第 2 批「同步正式／自由測試」資料來源。正式模式只用原本 GM 同源授權 iframe 回傳的活躍戰鬥快照，若缺快照只提示、不得把自由測試的預設戰鬥值當成同步；自由模式繼續以選擇四個場景作為視覺切換，**不新增 HP 等細節調整**。
- 五副本正式資料取 `dungeonModeAvailability()` 統一政策決定可見及可用性，**W3 懸賞戰不可用且不以 W2 快照頂替**。高維競技場優先讀正式 runtime 的 `mode`（定相／異相）、stage；GM 自由模式仍可直接看兩類三戰。歷史最高鏡像勝數、虛空樓層及競技場/懸賞基本狀態以各自 owner 同步。
- 本輪已更新 JavaScript、GM 瀏覽器測試源碼、相關 HTML 快取參數及交接矩陣。**自我檢查僅是最新 main 的 JS 靜態語法、引用與程式碼審查；尚未實際執行 Chromium/授權 GM iframe/手機/長期 GPU 或 exact-HEAD Actions**。剩餘事項：逐項驗證各戰鬥模式的 owner 是否會保留結果/特殊遭遇快照，補上必要的 result/encounter 實際 schema，而非使用 DOM 假值。

## 2026-10-10｜3D 五批一致性補修第 3 批・副本與戰鬥資料（施工紀錄）

- **沿用第 2 批概念**：GM 預覽以看圖為主。原 31 案例與八分類維持不變；副本中心、懸賞、競技場、鏡像、虛空五個 GM 視覺場景納入「同步正式資料／自由測試設定」。從正式遊戲 GM iframe 開啟預設同步；未拿到正式唯讀快照不得用 GM 模擬資料冒充同步成功。自由模式仍使用既有「類型、階級/難度、定相/異相/三戰、勝場、樓層」等與畫面身份直接有關的選項，**不增加 HP、倍率、獎勵等數值測試操作**。
- **唯讀正式資料**：在 `gm3dprototype.js` 原有同源／iframe source／GM 授權 gate 下回傳正式 `getArenaCoreState`、`getBountyTestSnapshot`、`mirrorDungeonStatus`、`getVoidMirageProgressSnapshot/getVoidMirageRunSnapshot` 與 `dungeonModeAvailability` 的摘要。高維正式角色不能以宇宙懸賞冒充可用；懸賞的高維下拉選項仍完全移除。原正式數值、戰鬥與存檔 schema 未修改。
- **正式 3D 補修**：`3d-test/formal-home.js` 的高維競技場 advanced 快照補入 `higherArenaMode`（從 runtime round/selectedMode 讀取，無來源時 fallback fixed）；沒有戰鬥／結算／特殊遭遇畫面時，戰鬥快照回傳 `battleAvailable:false`、`battleVisualKind:unavailable`，不再憑空展示「滿 HP 正常戰鬥」。既有戰鬥 HP 等其他頁面元素仍屬過渡 DOM 推斷，**不是已完成正式戰鬥 owner 的完整 read-only schema**。
- **自我檢查與後續**：`tests/runtime/gm-3d-test-center-browser.js` 新增五個副本模式來源切換相關斷言，相關入口 JS 快取版本同步更新；未執行真實 Chromium、正式授權 iframe 及手機 WebGL，不能宣稱通過完整第 3 批實機 gate。後續仍須逐種模式比對正式狀態與戰鬥 owner HUD/護盾/結算可靠快照；特別是高維定相/異相模式欄位應以真實 runtime 證據驗收，未知資料不能猜。

## 2026-10-10｜補修第 2 批 GM 災厄控制最終精簡

已將銀河與宇宙的 GM 自由視覺預覽改為二欄：選第 N 隻災厄＋模擬狀況。第 N 隻之前全部視覺完成，之後全部鎖定；不再出現 HP%、成長等級、全封印情境。銀河／宇宙各自維持獨立選取與適用狀況。正式同步仍忠實呈現原遊戲每隻狀態、絕不強制套用這個 GM 模型。修改 `3d-test/test-center.js`、相關測試與 cache-bust，詳細交接見 `PROJECT_HANDOFF.md`。瀏覽器實跑及手機尚待驗收。

## 2026-10-10｜3D 五批一致性補修第 2 批・再次補修（正式／自由雙資料來源）

**狀態：程式施工完成、靜態回讀通過；真實 GM iframe / Chromium / 手機與最新 Actions 尚待驗收。** 不得把靜態檢查當成實機通過。

本次執行：
1. GM `3d-test/test-center.js` 六類進度型預覽（銀河地圖／宇宙地圖／高維戰線／銀河災厄／宇宙災厄／異宇宙）新增與角色外觀同方向的「同步正式資料／自由測試設定」雙模式。從遊戲內 GM 開啟時預設正式資料；獨立測試中心因沒有正式權威資料預設自由；未取得正式快照顯示等待而不拿 mock 冒充。
2. `gm3dprototype.js` 在既有 GM allowed + 同源 + 正確 iframe source 閘門下新增 `civilization3d:scenario-request/response`；僅傳最小化的地圖、逐隻災厄、高維十存在與異宇宙唯讀數據，沒有寫入 state/save 或登入資料；提供明確「重新同步正式資料」。
3. 銀河與宇宙災厄 GM 可自訂第 1～10 隻各自的未解鎖/可挑戰/進行中/完成/回顧，宇宙另可已現身但雙條件未達；各自 HP% 與印記／文明進度，以及全部未解鎖／前期／中期／接近全破／全部完成情境。移除不適用的十大區欄位，正式同步由 `getCivilizationCalamityStatus`、`getSecondWorldCalamityStatus` 等正式 owner 取得。
4. 異宇宙沿用正式 200 宇宙×5 深度、20 體系；同步最深通關、進行中及失敗鎖定；自由模式可選可挑戰／挑戰中／鎖定／已通關，3D 工廠依狀態顯示。正式選取焦點以進行中的深度優先，否則下一待挑戰深度。
5. `worldmapui.js` 新增唯讀 `getSecondWorld3DPreviewSelectedRegion()`，在正式玩家展開宇宙區域後讓正式 3D 與 GM 正式同步聚焦該區，無展開紀錄時才回退最高可解鎖進度。銀河回顧維持已存在的選定地圖 getter，高維十存在同步正式持續 HP／可挑戰／完成。
6. 懸賞戰仍沒有高維 option。GM 八大分類、31 唯一場景不變。正式 3D 場景只展示，不建立新的戰鬥 target、挑戰／結算／存檔程序。相關 JS/CSS 的 cache-bust、對照矩陣與 GM 瀏覽器測試新增雙模式、個別封印、異宇宙狀態斷言。

**殘留驗收**：需實際在已授權 GM iframe 內驗證正式同步與自由模式切換；銀河、宇宙部分進度與全破兩種存檔、宇宙回顧聚焦、W3 持續 HP、異宇宙失敗與進行中、手機輸入面板；檢查 `resource-manifest.json` GitHub Actions 自動內容指紋更新及 Pages 部署。獨立 `/3d-test/` 並無玩家資料，不得顯示虛構的「正式同步已成功」。

## 2026-10-10｜第 23 批後五批一致性補修：正式施工規格

五批是額外補修，**不更改原訂正式 3D 第 1～40 批編號**；本批第 1 批已開始執行。唯一真實來源為每次 fresh-read 的 main 正式 owner。各批必須改後回讀 GitHub、更新 JS/CSS cache-bust、核對測試、列出實測項與剩餘限制。

| 補修批次 | 施工範圍 | 可驗收完成條件 | 狀態 |
|---|---|---|---|
| 1：GM 分類與規格 | GM 分為八類，31 項不增加重複場景；懸賞紀元下拉完全不出現高維；建立 `docs/3D_PREVIEW_CONSISTENCY_MATRIX.md`，更新交接/GM 目錄/第 19～40 批驗收規範。 | 8 類+全部合計 31；懸賞 2 紀元，高維只在適用預覽顯示；瀏覽器測試更新，手機不遮擋選單。 | 程式與文件施工完成；實機待驗收 |
| 2：三紀元地圖、災厄、回顧 | 回顧選定目標以正式 owner；銀河及宇宙十災厄按逐隻定義、雙條件、出現/鎖定/完成/回顧，含 W3 高維持續 HP 與異宇宙狀態。 | 各時點 read-only snapshot 可核對；不修改正式挑戰/收益/存檔。 | 再次補修：GM 正式/自由雙模式、十災厄獨立測試、異宇宙挑戰/限制、宇宙展開區域焦點已施工；真實瀏覽器/手機/CI 待驗收 |
| 3：副本與戰鬥 | 競技場 W1/W2 階級難度、W3 定相/異相與三戰；懸賞、鏡像連勝與每日狀態、無限虛空真實樓層；HP、護盾、戰鬥與結算正式快照。 | 不再共用冒險進度或以 DOM 猜官方值；各 mode 來源獨立且真實。 | 程式已接入正式活躍戰鬥 owner HP／護盾；結算／特殊遭遇完整正式快照、真實瀏覽器與手機驗收待補 |
| 4：角色、裝備、養成、其餘介面 | 五槽來源紀元/visualKey、專精、印記、文明、核心、劇情/記錄/轉生/設定/帳號/雲端/GM 的可見條件和資料欄位。 | 對應正式 owner，區分未完美術和實際資料錯誤；不提前做 B 階段模型。 | 程式施工已完成；正式外觀模型映射及實機/CI 待驗收 |
| 5：全面回歸與清理 | 31 GM 案例／全部正式 3D 路由/子視圖/彈窗、資料舊 fixture、瀏覽器/手機、跨紀元、故障回退、整合 CI，修訂完整矩陣。 | exact-HEAD 測試結果如實回報、保留正式舊模式和存檔、移除過時展示分支，確認可繼續第 24 批。 | 待開始 |

補修第 1 批以八類及 31 項作準，分類：主畫面 1、冒險地圖 3、玩家裝備養成 7、戰鬥動畫特效 4、副本競技場 5、文明災厄異宇宙 3、文明紀錄轉生 3、設定管理 5。懸賞高維 option 必須不存在於 DOM（不只是 disabled），切換其他預覽時需恢復高維。矩陣收錄正式 owner、GM 參數、有效紀元、已知不一致、所屬補修批次及驗收。

## 2026-10-10｜Word 原始規格、現行計畫與正式程式交叉核對（補查）

### 檔案身分與核對範圍
- 使用者上傳 `《文明戰線》3D 全面升級・完整規劃與施工規格書.docx`（53,209 bytes）與 GitHub main 根目錄同名 Word 的 Git blob SHA 均為 `33cd9a2c3792e909a88f16fabff0874f52c60987`，**確定逐位元組相同**。Word 2026-10-09 編製，標示「原始規劃／尚未執行」，不是 2026-10-10 最新狀態。GitHub code search 對其他 Word 檔未取得清單，**不可宣稱已盤點倉庫全部 Word 或其他文件不存在**。
- 本次重新核對當前 `main`：`3d-test/formal-home.js`、`3d-test/test-center.js`、`3d-test/prototype-engine.js`、`3d-test/appearance-snapshot.js`、`3d-test/index.html`、`dungeonarena.js`、`thirdworldarenaui.js`、`thirdworlddungeonui.js`、`dungeonbounty.js`、`mirrordungeonui.js`、`dungeonvoidui.js`、`calamityui.js`、`secondworldcalamityui.js`、`alternateuniverseui.js` 及現行 40 批規劃/交接。
- 驗證方法：Word 文件位元組一致性、文件條款對照與靜態源碼核對；**未進行所有視圖 DOM 實機逐頁及 exact-HEAD CI 驗收**。

### Word 中仍有效的原則（留用）
1. 三紀元「當前視圖／回顧視圖」決定 3D 場景，不能只取玩家所在紀元（Word 第 3 頁）。
2. 3D 只負責唯讀視覺，正式文字/UI、傷害、戰鬥結果、進度、交易、存檔、離線收益/快速補播都保持原權威（第 3、8、9、11 頁）。
3. 副本應涵蓋銀河／宇宙競技場、高維競技場、鏡像、虛空、懸賞，各自狀態不同（第 5 頁）；鎖定／可挑戰／完成／回顧／空資料需驗收（第 5、11 頁）。
4. 正式裝備五槽、裝備外觀依裝備自己來源紀元及名稱，不只依玩家目前世界（第 7、11 頁）。
5. 各介面 L1/L2/L3 視覺完成度分別註記；每批新舊模式、觸控、回退和來源一致性測試不可省略（第 3、11、12 頁）。

### 被現行 main 取代／不應直接照抄的舊規劃
1. Word 第 10 頁 A1-01～A1-10 是歷史階段規劃，現在採 `3D_IMPLEMENTATION_PLAN.md` 的 1～40 批，19～23 已施工，24 起待做。不能把 Word 批次直接套用現行號碼。
2. Word 第 6 頁提議 Canvas 常駐 `#main` 之外／單引擎；目前實作按需 opt-in Preview Runtime、獨立 GM，共用 factory 並安全釋放，這是後續已確認的性能策略，不應為追 Word 硬改引擎。
3. Word 第 9 頁 Prototype 1.0 的初始「五畫面、假資料」是起點，不代表現在正式預覽和 GM 的完整清單；現在 GM 是 31 項唯讀場景，預覽資料可選正式外觀同步或 GM session fixture。
4. Word 提議的原型素材預算、Blender 工程、24 怪物家族屬未來資產要求，不代表目前低模 3D 已交付正式 GLB、高品質人物與怪物。
5. Word 的快照日期為 2026-10-09。正式副本如今有高維紀元、定相/異相競技場及高維無懸賞等後續規則，必須取當前 owner，不能引用 Word 舊簡表推定完整可玩模式。

### 已證實需修正，須納入第 24 批前一致性補修
- GM 懸賞紀元選單目前高維 option **disabled 但仍存在**，不合「高維沒有懸賞」語義：必須在懸賞項目完全移除，而不是只禁用；其他 GM 項目可以切換高維，不應受連帶影響。
- GM「副本、災厄與特殊演出」16 項內容過雜，依功能拆四類，總 8 類/31 項，且更新搜索/瀏覽器測試與快取。
- 正式 `formal-home.js` 的銀河災厄、宇宙災厄 snapshot 分別用滿級印記數及文明等級，無法代表逐隻災厄狀態與宇宙雙條件；需從 `calamityui.js`／`secondworldcalamityui.js` 的正式 status/definition 讀取。
- 宇宙回顧 3D 的 selectedMap 依 highest unlocked Boss 推算，可能不同於使用者正在看的回顧子視圖；修正前須找到正式 selected owner，不能猜。
- 高維競技場正式 3D `advancedSnapshot` 缺固定/變動模式（fixed/varied），GM 有同一控制；正式 owner 為 `thirdworldarenaui.js` 等。
- 正式戰鬥預覽的 shield/HP/結果採 DOM presence/inline width 猜測，必要時落入護盾預設，不等同正式事件快照；先查每種戰鬥模式 actual owner，再動視覺 adapter。
- 虛空無限樓層不應被 3D 畫成有上限階數；鏡像歷史最高連勝和當日挑戰／結果需分離。GM 目前有限的樓層代表值只是取樣點，不是最高層限制。
- 異宇宙 3D 已使用 200 宇宙×5 深度、20 文化的區段視覺，**不可再誤判為仍顯示固定十大區**；但尚需核對失敗/冷卻/鎖定/挑戰中狀態。
- 裝備 3D 目前依現紀元著色低模，正式裝備跨紀元外觀仍須回歸裝備來源 world/name/visualKey，這是尚待 B 階段正式模型的明確差距，而非已完成。
- 目前是靜態證據清單，無法由此認定所有 31 GM 場景及所有正式子路由已通過真機驗收。

### 執行順序
A. 下一輪先補 GM 八大分類與懸賞 option 移除，保護原 31 場景和回歸測試。
B. 然後處理災厄逐隻正式快照與三紀元回顧、戰鬥快照、競技場模式／虛空／鏡像；依正式 owner 加入針對性測試。
C. 再開始第 24 批的災厄與異宇宙 3D 美術精修。所有修改必須明示完成層級、GitHub SHA、程式檢查、可實測項及剩餘風險。

## 2026-10-10｜第 23 批後全面一致性審核：後續強制施工規範

本節為規劃與驗收更新；本次不更動正式 3D 場景、遊戲公式、存檔與 GM UI。每一批以當時 main 原文字遊戲 owner 為唯一真實來源，從正式介面與 GM 測試中心兩端逐項核對。3D fixture 不得共用不相干的「十大區進度」，不得將玩家所在紀元誤作回顧來源紀元，也不得以通用 DOM 猜測代替可讀正式快照。GM 用戶選項須僅列真正存在的模式；不存在的紀元選項要移除，不可僅 disabled。

### 待修事項：依優先順序
1. **GM 懸賞紀元**：下拉僅顯示銀河、宇宙；高維完全不生成 option。確認選項動態更新、切回副本與嵌入式 GM 畫面、網址/快取。
2. **災厄逐隻資料**：銀河十災厄以正式 definition/status/mark 來源，宇宙十災厄以 definition/status/文明等級/雙解鎖條件來源；分離出現、可挑戰、鎖定、完成、回顧與選定目標；不可把印記滿級數或文明等級當成全部災厄的唯一進度。
3. **戰鬥／護盾／結算快照**：按實際各戰鬥 owner 設計唯讀 adapter；不能依 DOM 存在就預設護盾及 HP=100%。確認 W3 持續 HP、護盾、結果與 Fast Catch-up 不受 3D 影響。
4. **紀元／回顧場景**：銀河、宇宙、高維分開紀元來源、選定節點、已通關、可挑戰、回顧；宇宙回顧不能單憑最高開放 Boss 決定選定區域；銀河回顧 target-context 不允許錯誤 fallback。
5. **競技場完整模式**：銀河與宇宙使用各自正式階級上限、普通/困難/極限及三階戰鬥快照；高維使用定相/異相、三場連戰、剩餘次數及正式 runtime mode。GM 模擬不聲稱同步正式人物挑戰狀態。
6. **鏡像／虛空**：鏡像首通/最高連勝、當日挑戰/結算與可能解鎖狀態分離；虛空採真實最高樓層、正在挑戰樓層、當日樓層、獎勵已領及紀元共用進度，不能將無限樓層誤表示成最多八/十階。GM 選項須標示「示意」或依正式規則。
7. **副本總覽／懸賞**：正式紀元可見模式、進入條件、每日次數、階級、候選敵人、空資料，GM 需獨立模擬。高維沒有懸賞；不存在的懸賞紀元 option 必須移除。
8. **異宇宙**：必須按正式 200 宇宙×5 深度、20 宇宙體系及當前文化命名；另核對前線鎖定、挑戰中、完成、失敗冷卻/限制；十節點只允許明確表示「目前體系的十個宇宙」，不能標成整體十大區。
9. **外觀／裝備**：確認五裝備槽、裝備各自的來源紀元、正式 visualKey、背包/穿戴/強化資料一致；美術低模與正式 GLB 完成度分開記錄。跨紀元同裝備不能只用玩家現紀元配色替代。
10. **專精、印記、文明、核心**：分別使用八專精等級、十印記等級、文明等級、界弦核心正式資料；依正式進入紀元／回顧情境驗證各頁存在與否，並核對基礎等級/進度百分比與進度條。
11. **劇情、戰線紀錄、轉生、服務、GM、戰鬥特效**：不以通用幾何聲稱完成完整子狀態；正式操作權限、確認/交易/存檔、回顧與錯誤狀態都保持正式 owner；僅在確有獨立視覺內容時擴充 GM。
12. **自動化保護**：為不同紀元/子模式/鎖定/已完成/回顧/空資料建立表驅動 3D 契約測試；每批檢查 scene factory、正式 adapter、GM fixture、控制項 option、手機顯示、路由及 cache-bust，回報未經實機/CI 驗證項。

### GM 測試中心分類改版規劃
建議取代原「副本、災厄與特殊演出」混合分類，保留玩家看得懂的名稱：
- 「副本與競技場」：副本中心、懸賞、單一競技場（紀元切換）、鏡像、虛空；原 5 項。
- 「文明災厄與異宇宙」：銀河災厄、宇宙災厄、異宇宙；3 項。
- 「文明紀錄與轉生」：戰線紀錄、劇情、轉生；3 項。
- 「設定與管理」：設定、說明、帳號、雲端、GM；5 項。
其餘既有主畫面、冒險地圖、角色養成、戰鬥四分類保留。六大分類預計改為八大分類，**GM 31 個唯一場景暫不變**，直到真的新增獨立畫面才改數量。分類改動與回歸測試宜先於第 24 批，完成後再施工災厄場景；不要在一次修改同時變更正式進度計算。

## 2026-10-10｜第 23 批 GM 副本預覽真實規則補修

- 高維競技場／鏡像／虛空錯用通用 1～10 大區的問題已修正：GM 競技場合併成單項，依紀元顯示銀河/宇宙階級與難度、高維定相/異相與三戰；鏡像改勝場 0～20，虛空改實際歷史最高樓層；懸賞改三種懸賞等級並禁止高維選項。GM 總場景 31 項、六分類保持。
- 這些是 session-only 唯讀測試快照，不能用 GM 選項改寫正式副本進度。正式副本和戰鬥核心不變；需依最新 main 及真實瀏覽器/手機回歸驗收。

## 2026-10-10｜第 1～18 批後整合優化第 6／6 批：真實瀏覽器回歸、B19～40 施工規範

- **新實作**：`.github/workflows/runtime-integrity.yml` 的 Chromium smoke 新增 `tests/runtime/gm-3d-test-center-browser.js` 與 `tests/runtime/3d-mode-browser-regression.js`，不再僅跑 3D 靜態覆蓋檢查。GM 測試中心實際巡覽 32 個場景、主要控制/手機最大化及還原；GM 測試報告舊的 27 項字樣同步更正為 32 項。
- **模式實測**：新的 Playwright 瀏覽器測試在隔離測試用帳號資料中驗證 legacy `3d` 偏好暫回文字、結構化 `text` 讀取、換帳號、工作 blocker、未開放 3D 禁止切換，以及新帳號模式視窗重複 auth-ready 仍唯一、選文字後關閉且本機偏好正確；不對真實玩家帳號做存檔寫入。
- **後續規範**：新增 `docs/3D_BATCH19_40_ACCEPTANCE_RULES.md`，定義正式 owner/存檔安全、3D factory/GM 共享快照、cache-bust、手機畫面、WebGL fallback、測試及每批交接要求。原正式第 19～40 批編號不變，GM 3D 測試中心永久保留。
- **驗收界限**：本次將瀏覽器測試**接入 CI**並核對語法/引用，不代表工具本身已在這個對話中完成最新 exact-HEAD 的 GitHub Actions 執行或實機全綠。第 18 批缺少的實際真實帳號／特定紀元進度、手機裝置與完整 WebGL 故障注入仍需另行實測。六批整合優化的**程式施工**結束，不能等同完整版 3D 已上線。

## 2026-10-10｜第 1～18 批後整合優化第 5／6 批：雙模式安全與舊資料相容

- **模式安全修補**：`3d-test/mode-foundation.js` v3 統一以帳號 ID 為選模式視窗生命週期邊界；新帳號登入時移除前帳號殘留 selector；舊視窗點擊事件須確認現在登入 ID 與建構時一致，否則不儲存偏好。正式 3D release gate 依然為 `false`，`canPreview3D` 仍開放 opt-in 視覺預覽。
- **舊模式資料相容**：保留原 `civilization-war-presentation-mode-v1:<accountId>` key 與純文字 `text`／`3d` 資料；額外唯讀辨識有限大小的 JSON 物件 `{mode:"text"|"3d"}`，錯誤／未知格式不執行指令、不進入 3D。當記錄為尚未開放的 `3d`，本次直接安全運行文字模式，不反覆要求選擇、亦**不覆寫或刪除**原偏好。禁止未登入帳號及無本機儲存權限的持久化切換；偏好無法寫入時選擇頁可暫時進入文字版。登出清理的是執行期 selector，不刪其他帳號偏好。
- **安全切換**：沿用現有戰鬥／視窗與啟動就緒 gate，新增 `registerSwitchBlocker(id,probe)`／`unregisterSwitchBlocker(id)`，供未來正式雲端交易、背景戰鬥、轉生、離線結算等各 owner 主動註冊尚未完成的操作；目前這些 owner **尚未接入 blocker**，不可宣稱所有操作已完整禁止切換。因完整 3D 尚未上線，此輪仍實際無法選擇 3D。此介面不更動正式 save schema 或雲端流程。
- **第 14、16 項舊程式／快取盤點**：`index.html` 仍正式引用 `3d-test/mode-foundation.js` 與 `3d-test/formal-home.js`；正式預覽使用 `3d-test/runtime.js`、`appearance-snapshot.js`、`prototype-engine.js` 按需載入；GM 測試中心透過 `3d-test/test-center.js` 及 `3d-test/index.html` 載入同一場景工廠。歷史 cache-bust、GM `civilization-war-gm-resource-digests-v1`、帳號舊偏好都仍有讀取者／相容用途，本批**不刪任何檔案或 localStorage key**，避免誤傷舊瀏覽器或文字模式。正式第三紀元與異宇宙舊存檔處理仍交由既有 normalize／migration owner，3D 層不得修改。
- **玩家可見資訊**：第 17-B 服務預覽沿用「僅供視覺預覽」友善文字，GM 視覺測試中心繼續不展示內部案例 ID／批號／WebGL 診斷；測試及 Commit 保留工程內容。此輪不加任何新 GM 診斷選單。
- **已自我檢查**：mode foundation 與 B18 靜態 guard 的 JS 語法與 GitHub main 回讀；執行不連接真實帳號的隔離測試，確認舊 `3d` 偏好安全回退、JSON `text` 可讀、正式 3D gate 禁止、註冊的工作 blocker 生效、無存檔寫入；`index.html` cache-bust 已更新。尚無 exact-HEAD CI、手機／桌機真實換帳號及雲端進行中操作測試證據，應留到第 6 批實機回歸。
- **進度**：額外整合優化第 5 批已施工，下一批第 6 批；原正式 3D 第 19～40 批維持，正式 3D 不提前開放。

## 2026-10-10｜1～18 批後整合優化第 4／6 批：首頁啟動、GM 正式外觀快照及場景工具

- **首頁首次渲染**：`ui.js` 建立唯一 `window.civilizationRequestHomeEntryReconcile()`，採微任務合併觸發，仍只在當前為首頁且實際應有入口缺失時執行正式 `render()`。`alternateuniverseui.js` 移除獨立 `reconcileInitialHome()` 再次呼叫 `render()` 的分支，改交由統一協調入口。可減少 DOMContentLoaded 時重覆渲染，不更動異宇宙解鎖、路由、戰鬥與存檔。尚須實測銀河／宇宙／高維入口與轉生後首次刷新。
- **GM 正式外觀來源**：`3d-test/test-center.js` 在「正式角色資料」且快照 `source==="formal"` 時使用正式 `Civilization3DAppearance.scene(kind,a)` 轉成角色／背包／鍛造場景資料，不再與正式介面各有一份相似轉換；GM 自訂測試角色的既有 `visualScene` 後備仍保留。GM 測試中心透過版號 manifest 延遲載入 `appearance-snapshot.js`，不建立另一份假場景、也不存正式遊戲資料。
- **共用場景工具**：`3d-test/prototype-engine.js` 新增小型 `visualMaterial` helper，並用於第 17-B 共用服務控制台場景，保留原漫反射／自發光顏色，不修改 Babylon 品質預設或遊戲數值。這是保守的第一步共用重構，不宣稱所有多類場景已全數拆模組；大型 `formal-home.js` 路由仍保留單一入口以避免 19～40 批前期依賴斷裂。
- **cache-bust 與 guard**：`index.html` 更新 `ui.js` 和 `alternateuniverseui.js` 的快取版本；`3d-test/index.html` 更新 GM 測試中心版號；`tests/runtime/3d-b18-coverage-guard.js` 新增單一首頁協調、正式 GM 外觀來源與共用場景工具防回歸斷言。場景 factory 正式版本由 `resource-manifest.json` 自動取最新內容雜湊。
- **驗收界線**：已進行修改 JS 語法解析及 Github main 回讀；沒有完成 exact-HEAD GitHub Actions、真實 GM iframe、實際跨紀元重整、手機/WebGL 長時間測試。本批完成指定的保守重構，不表示所有獨立 3D 模式已完成。整合優化第 5 批為雙模式／舊資料安全清理，6 批仍須瀏覽器回歸；正式 3D 第 19～40 批不變。

## 2026-10-10｜1～18 批後整合優化第 3／6 批：3D 資源版本、GM 載入進度與預熱

- **實作**：`3d-test/formal-home.js` 正式 3D opt-in 預覽統一由 `resource-manifest.json` 取得 Babylon.js、`prototype-engine.js`、`runtime.js`、`appearance-snapshot.js` 四種版本 URL；清單缺值才個別用安全 fallback 版本。移除場景備援 URL 的過長歷史查詢參數；載入失敗清除 `resourceVersionPromise`，允許下一次重新查詢版本（舊成功載入腳本不重複執行）。3D 正式 Runtime/外觀/引擎仍只在玩家點預覽後按需載入，文字版不新增加載。
- **GM 資源政策**：共用 `Civilization3DSharedAssetWarm` 仍只預熱 Babylon 與場景資源，runtime／appearance 仍依原流程按需載入。GM 啟動校驗既有資源雜湊及腳本載入不改正式授權／帳號 owner；`scriptgrouploader.js` 為進行中共用 group 增加進度監聽訂閱與目前已載入比例，使另一個呼叫者加入已在進行的 GM 載入時也可收到中間進度，不必等待末尾跳至完成。失敗時清理進度追蹤，下次可重新開始。
- **進度條**：沿用 `backgroundpreload.js` 的 VERSION=5 真實子工作完成比例與單調顯示；本次未聲稱可推算下載位元組或剩餘時間，亦不修改已有效的啟動就緒契約。
- **防回歸**：`tests/runtime/3d-b18-coverage-guard.js` 加入資源清單四模組、GM 共用進度、失敗重查與預熱限定斷言，已經 Runtime Integrity workflow 引用；`index.html` 兩支 JS cache-bust 更新。此次未修改角色存檔、雲端、正式遊戲戰鬥、GM 權限或模式 release gate。
- **舊資料**：歷史查詢參數僅在正式場景備援 URL 精簡，保留原腳本存在與 asset 雜湊回退；既有本機 GM 檔案摘要 key、模式偏好及玩家存檔均不清除。跨版本 manifest 部署時序及既有 GM HTTP 雙階段快取仍需第 6 批真實瀏覽器／效能驗收。
- **驗收界線**：GitHub main 回讀及 JS 靜態語法／斷言核對，不代表本次已執行全套 exact-head CI、Chromium、手機與 WebGL 故障注入；後者待第 6 批。整合優化第 4 批下一步為首次渲染、外觀快照與場景結構；第 19～40 正式 3D 批次不變。

## 2026-10-10｜第 1～18 批後整合優化第 2／6 批：正式 3D 預覽生命週期與防重複

- **施工內容**：`3d-test/formal-home.js` 新增正式預覽控制項共用唯一性掃描 `uniqueControls()`，以 ID、文明紀錄的 kind 或服務控制台的 kind 辨識同頁重複控制組並保留第一個；新 `syncAllPreviewButtons()` 將可見預覽按鈕的初始文字、aria-pressed 與開關狀態同步，不再把其他未選取按鈕一起改為「關閉 3D 預覽」。
- **生命週期**：加入 `activeControl`／`activeHost` 追蹤，關閉時 `dispose()` scene、移除 Canvas，清空宿主／控制狀態；開啟途中使用 `epoch` 加 `host.isConnected` 防止非同步 3D 資源完成後掛載到已切頁 DOM；相同路由重新產生 DOM 而使原控制項離線時關閉舊預覽；保持 Babylon.js/runtime 按需載入與 GM 中心分離。服務控制台的延遲掛載仍由現有 scoped 監聽處理，新增共用去重。
- **自我檢查**：`tests/runtime/3d-b18-coverage-guard.js` 增加上述防回歸條件，`index.html` 已 cache-bust；程式語法與 main 回讀另行核對。本批不動正式角色存檔、GM 授權、戰鬥、雲端或世界突破。
- **界限**：此次為狀態及 DOM 生命周期強化，沒有本次 exact-HEAD CI／真實手機、桌機與 WebGL context lost 故障注入之通過證據。需於整合優化第 6 批追加實際瀏覽器壓力測試；第 3 批下一步為資源載入、快取與進度。原正式 3D 19～40 批尚未開始。

## 2026-10-10｜1～18 批後整合優化第 1 批：GM 視覺中心補齊 17-B 五種場景

- 補回第 17-B 批漏登記的五個**真正共用正式場景工廠**的唯讀 GM 預覽：設定中心（service-settings）、遊戲說明（service-guide）、帳號中心（service-account）、雲端存檔中心（service-cloud）、GM 管理中心（service-gm）；沿用 `createServiceConsoleScene`，不複製或生成獨立假場景。
- GM 3D 測試中心從 **27 → 32 項**，原 **六大分類不變**；五項列入「副本、災厄與特殊演出」，該分類 **12 → 17 項**。UI 不露出內部 ID／批號，僅顯示友善場景名稱及用途。此處即使選擇「GM 管理中心」，也只是一個幾何預覽，**絕不執行 GM 指令或帳號／雲端操作**。
- 程式調整：`3d-test/test-center.js` 新增案例和 service-kind factory、唯讀參數；`3d-test/index.html` 更新 cache-bust；`tests/runtime/gm-3d-test-center-browser.js` 更新 32/17 預期及五項場景檢查。
- 靜態自我檢查：修改 JS 語法解析、GitHub main 回讀、factory/fixture/key 與索引版本可驗證；**沒有取得本次 exact-HEAD CI 或真實 Chromium/WebGL/手機的通過結果**，必須等 Actions 與實機檢查。其餘 5 批整合優化尚未施工，這次不動正式 save、戰鬥、資源清理或帳號／GM 權限。
- 後續順序：整合優化第 2 批預覽生命週期、第 3 批資源快取、第 4 批場景/快照架構、第 5 批雙模式與舊資料、第 6 批全面回歸。原正式 3D 第 19～40 批數量不變。

## 2026-10-10｜第 17-B 服務預覽無限重複：桌機實測回歸修正

- **使用者實機證據**：設定、說明、GM、帳號及雲端存檔的「預覽 3D」按鈕各自反覆增加。根因確認：`3d-test/formal-home.js` 實際以 `control.dataset.service3dPreview=kind` 建立 `data-service3d-preview`，但 `ensureServiceControl` 查詢的是不同的 `data-service-3d-preview`；DOM 更新與 MutationObserver 重入時防重複失效。
- **修正**：統一明確設置 `data-service3d-preview`，查詢兼容兩種既有屬性，若找到多個只保留第一個；五種子頁均共用此唯一性邏輯。保留正式文字設定、雲端傳輸、GM 權限及原 3D 視覺場景，不改 save、戰鬥、雲端與授權 owner。修正 `index.html` cache-bust。
- **防回歸**：`tests/runtime/3d-b18-coverage-guard.js` 新增 DOM attribute 與查詢屬性一致性斷言，已接入 Runtime Integrity CI。已進行 GitHub main 靜態語法、斷言及版本核對；**最新 exact-HEAD CI 與桌機／手機實機重整後結果仍待確認**。修正後應在設定、遊戲說明、帳號、雲端、GM 各只剩一個對應預覽，重繪也不增加。
- **進度**：此為第 17-B／18 批暴露的回歸補修，不另增加批次；第 18 批完整實機驗收仍未結案。

## 2026-10-10｜正式第 18 批 A1 全介面覆蓋檢查（程式施工完成，實機總驗收未結案）

- 新增 `tests/runtime/3d-b18-coverage-guard.js`，由 `.github/workflows/runtime-integrity.yml` 在 main 的 Runtime Integrity 執行；靜態核對正式核心路由、既有各 3D 預覽接點、GM 授權、劇情操作列、角色唯一按鈕、虛空通用結算入口去重、文字版 3D runtime 懶載入與模式 gate。驗收測試檔曾發現一處 regex 語法錯誤，本次已修正並通過 JS 語法解析。
- 詳細全頁面覆蓋矩陣與未完成的實機清單已另存 `docs/3D_BATCH18_COVERAGE_2026-10-10.md`。本次檢查是正式程式和測試用 guard，不新增 GM 測試中心工程診斷項目，不修改存檔、交易、帳號權限、戰鬥規則。
- **實際驗收界限**：沒有本次 exact HEAD Runtime Integrity 全綠證據，也沒有已登入桌機／手機各頁、各紀元已解鎖／空／完成與 modal 的全覆蓋操作證據，因此「全部正式介面達 L1、常用介面 L2」**不得標記通過**。本批為驗收基礎施工與靜態檢查完成，實機總驗收仍未結案；不得將下一批第 19 批稱為已無條件可開工。
- 第 17-A/B 程式施工已完成但實機驗收待補；第 18 批需實際執行 CI 並補齊真實瀏覽器與手機操作證據，通過後才能正式關閉 A1 驗收。第 19～40 批 3D 開發及最終獨立模式仍未完成，文字版永久保留。

## 2026-10-10｜正式第 17-B 批：原定設定、說明、帳號、雲端與 GM 子頁視覺施工

- **原第 17 批與追加雙模式拆分**：17-A 為後來追加的帳號模式偏好／文字模式首次選擇；17-B 才是原本 `設定、說明、帳號、雲端與 GM 全子頁` 施工。原第 17 批不是雙模式批次，不能再混稱。
- **已實作視覺**：`3d-test/prototype-engine.js` 的 `createServiceConsoleScene({kind})` 為 `settings / guide / account / cloud / gm` 五類建置共用、各自不同的唯讀 3D 控制台幾何。它只產生 Babylon scene 與 metadata，不取用正式帳號憑證、雲端文件、GM 指令或角色存檔。
- **正式介面入口**：`3d-test/formal-home.js` 於設定／說明頁加入 opt-in 預覽；同一設定頁的帳號、雲端與 GM 現有子區塊可顯示相應預覽；GM 預覽只對經過既有 GM runtime 授權者顯示。帳號、雲端與 GM 可能由既有模組延後掛載，使用 scoped MutationObserver／事件作一次性防重複補掛載；不建立隱藏工程測試選單。預覽一律不代替正式設定、說明、自動出售／處理、手動雲端上傳／下載、登入登出、GM 權限與 Sandbox 執行。
- **生命週期**：沿用前置第三批 Babylon/runtime/外觀按需載入，以及現有 `Civilization3DRuntime` 開／關、切頁釋放、失敗回退機制。現有 GM 3D 視覺測試中心永久保留原本場景，原規劃第 17 批為非獨立視覺測試項目，不另添 GM 假工程診斷項目。正式 `index.html` 更新 `formal-home.js` cache-bust。
- **驗證與限制**：GitHub main 讀取 `gameguide.js`、`supabaseauth.js`、`cloudsave.js`、`ui.js`、兩支 3D JS 與 index；改動 JS 語法解析成功，五種視覺 factory、頁面 selector、GM 授權條件、唯一掛載及 JS cache-bust 已做靜態核對。尚無本批 browser/mobile 真實操作及 exact-HEAD CI 通過證據；第 18 批應逐一驗證設定、說明、帳號登入、雲端安全、GM 子頁及原 01～17 預覽。第 17-B 是**正式文字子頁的唯讀 3D 視覺入口／外觀施工**，不是已完成可獨立操作的完整 3D 設定／帳號／雲端／GM 模式；後者須依 19～40 批建置。
- **批次判定**：17-A、17-B 均完成程式施工（實機驗收待第 18 批），但不得把整個 3D 全模式提前宣布上線。下一正式批次第 18 批；文字模式完整保留，帳號與存檔 owner 完全不改。

## 2026-10-10｜正式 3D 第 17 批：帳號模式選擇基礎與設定接點（已施工，完整雙模式待後續驗收）

- **新增可見功能**：`3d-test/mode-foundation.js` v2 在 Supabase 工作階段確認後識別真實帳號 `user.id`，以 `civilization-war-presentation-mode-v1:<帳號ID>` 的本機瀏覽器 key 記住選擇；同帳號同裝置下次自動進入，不同帳號偏好互相隔離；未有偏好時顯示首次選模式畫面。正式 3D 尚未完成，選擇畫面只能選「文字模式」，3D 以「開發中」禁用並說明；既有 opt-in 3D 預覽保持可用。登出清除執行期模式顯示，**不刪除原帳號的本機選擇紀錄**。
- **設定頁**：`ui.js` 的正式設定增加「遊戲模式」與目前文字版／3D 開發中資訊，不侵入正式 `state.settings`、角色存檔或 GM 管理。提供模式 manager 的 `selectMode`、`canSwitch`、`settingsHtml`、`accountPreference` 基礎；將來開放 3D 時切換需檢查未結束戰鬥與彈窗，成功寫入帳號本機偏好後重新載入。**目前完整 3D release gate = false，因此對一般玩家不可切至 3D**。
- **資源與雙模式狀態**：沿用前置第 3 批的純文字啟動、正式預覽按需載入；仍未建成獨立正式 3D 遊戲 router／介面、完整按模式拆開原本同步核心腳本、3D 首屏及相關 L3 素材，因此不宣稱第 17 批已完成完整雙模式分流。遊戲說明、帳號／雲端／GM 的所有既有 UI 流程未改造；第 18 批需對其功能、雙模式入口、權限與所有頁面做正式回歸驗收。
- **已驗證**：GitHub main 回讀 `mode-foundation.js`、`ui.js`、`index.html`，兩支 JS 語法解析通過，驗證帳號 scope、登入／登出事件、模式 release gate、設定插入與 index cache-bust。**尚未取得最新 exact-HEAD Actions、實機冷／熱登入、跨帳號／跨裝置及手機操作證據**，不得宣稱全部功能通過。
- **施工接續**：第 18 批全介面／雙模式隔離驗收，補齊 account login restore、移動瀏覽器儲存不可用、劇情 modal、異宇宙首次首頁、GM 測試中心及第 01～17 批預覽回歸；第 19～39 批建立獨立可完整遊玩的 3D 模式，第 40 批實際開放與全程驗收後才允許啟用 3D 切換。文字版永久保留。
- **進度**：第 01～17 批已施工（非最終 3D 完工），下一個正式批次為**第 18 批**；後續每批持續同步更新本檔及 `PROJECT_HANDOFF.md`。

## 2026-10-10｜啟動進度停留約 75% 補修（已提交，實機待複驗）

- **根因**：`backgroundpreload.js` 先前以 `2＋關鍵背景數＋啟動任務數` 等權重計算進度；`scriptgrouploader.js` 的帳號與 GM（最多 32 支）資源檢查、預熱、腳本注入被視為一項，因此等待時數字常停在約 75%。
- **實作**：啟動協調器 `VERSION=5`，允許每個 startup task 接收單調的實際子項完成比率回呼；`account-resources` 採多步工作權重，仍保留 DOM、初始化與關鍵背景每項實際完成才推進。GM 資源版本驗證依已檢查檔案數逐步回報，GM 延後腳本依真實 `onload` 完成數逐步回報；已確認帳號後更新進度。顯示只隨已完成的事件增加，不使用假時間動畫，100% 仍須原正式 ready 條件成立。
- **限制**：此為「依實際完成里程碑計數的加權進度」，**不是網路位元組下載率或剩餘時間預測**，不同快取及 GM 狀態仍可能有階段跳動；未新增耗時資源請求，正式文字版、GM 授權、失敗重試、資源清單、WebGL/GPU 啟動與存檔邏輯保持原規則。
- **已檢查**：`backgroundpreload.js`、`scriptgrouploader.js` JavaScript 語法解析成功；`index.html` 兩支引用均已 cache-bust；重新讀取 main 確認。最新 GitHub Actions 與手機、桌機冷／熱啟動仍待實際測試，不能宣稱保證不再停格。若仍有長時間固定百分比，應實測是哪一項 IO 工作耗時，不可用假進度掩飾。
- 本次獨立啟動 UX 補修不佔 3D 40 批，正式下一批仍為第 17 批。

## 2026-10-10｜角色／虛空 3D 預覽重複入口補修

- 使用者手機實測發現角色介面有兩個同效果「預覽 3D 角色」，虛空幻境同時有「預覽 3D 虛空樓層」與「預覽 3D 戰鬥與結算」；後者為共用戰鬥預覽，不是虛空專屬功能，GM 3D 視覺中心保留共用戰鬥／結算預覽即可。
- 根因：`3d-test/formal-home.js` 的 `ensureCharacterControl` 在 `.character-layout` 裡查按鈕，實際卻以 `screen.before(controls)` 插在其外面，頁面更新後會反覆注入；`ensureBattlePreviewControl` 對 `.void-combat/.void-result` 的通用 DOM 判定，使虛空正式頁出現第二個不必要的預覽。
- 已改 `ensureCharacterControl` 使用全域唯一 ID 判定，避免重複；`ensureBattlePreviewControl` 遇 `view==="dungeon-void-mirage"` 直接不加第二顆按鈕，保留虛空樓層專屬預覽及 GM 戰鬥／結算專項。修正不改戰鬥、結算、進度、獎勵、存檔、場景 factory 或 GM 測試中心。
- `index.html` 已更新 `formal-home.js` cache-bust；靜態語法、GitHub main 回讀已核對。手機／桌機真實重新整理與切頁回歸仍需實測。這是第 16 批後的介面補修，不新增正式批號；下一批第 17 批。

## 2026-10-10｜重整後異宇宙／新紀元／轉生入口首次漏顯示修復

- **根因（main 確認）**：`ui.js` 載入末端執行 `load() → render()`，但 `worldphaseui.js`、`reincarnationui.js` 與 `alternateuniverseui.js` 在 `index.html` 中排在其後。初次 `homePage()` 無法呼叫稍後才註冊的入口函式，導致第三紀元已解鎖異宇宙入口首次消失；任意切頁回主畫面會重繪，所以入口又出現。同一時序也可能影響符合條件的新紀元突破與文明轉生入口。
- **修正**：`ui.js` 在 `DOMContentLoaded` 進行一次延後入口比對：以當下正式 `homePage()` 產生的權威內容檢查新紀元、轉生、異宇宙三個入口，**只有理應顯示且目前主畫面 DOM 缺少入口**時才呼叫原有 `render()`；若玩家已導航離開首頁不觸發。`alternateuniverseui.js` 自己亦在模組註冊後、DOM 就緒時，僅在正式異宇宙首頁入口應存在而缺少時做一次補繪，防止入口程式延後註冊。兩處皆不修改解鎖判定、戰鬥、存檔或帳號。
- **變更檔案／版本**：`ui.js`、`alternateuniverseui.js`、`index.html`（兩份 JS cache-bust）；是第 16 批之後的介面 bug 補修，不另增加 3D 正式批號。已回讀 GitHub main 並執行兩支 JS 語法解析，核對補繪條件與版本引用；沒有在本次取得完整 CI 或桌機／手機實機重整結果，待使用者測試。
- **必測**：第三紀元已解鎖異宇宙帳號直接刷新首頁、刷新後不切頁就應顯示入口；未解鎖帳號不應提前出現；第二紀元跨高維條件、第一紀元跨宇宙條件、符合文明轉生入口的高維角色首次刷新都應正常；點進其他頁再回首頁、不同帳號登入後重繪、GM 與原 3D 預覽不得退化。下一原定 3D 第 17 批仍未施工。

## 2026-10-10｜第 16 批劇情閱讀視窗排版回歸修復（已施工，實機待複驗）

- **使用者實際回報（桌機及手機）**：原劇情彈窗可看到「1/12、下一頁」，加入「預覽 3D 文明史書」後，點擊前後的操作區會被推出視窗，畫面下方變成空白。根因為 `story.css` 的 `.story-card` 固定三列 grid（標題／正文／頁碼按鈕），但第 16 批 `storyui.js` 將 `.story-3d-preview` 插入作為第四個直屬 grid 子元素，`story-actions` 自動落到溢出的第四列，遭 `overflow:hidden` 截掉。
- **本次修改**：`storyui.js` 將 `#storyBody` 與 `.story-3d-preview` 合併包在 `.story-content`，保持 `.story-card` 固定三個直屬 grid 子元素；`story.css` 在內容列內使用可縮放 flex 與獨立文字捲動，3D 預覽提供受容器高度約束的顯示舞台（含矮螢幕規則），保留原 `#storyActions` 頁碼／下一頁／上一頁／結束。正式劇情 owner 與回呼、轉生交易、回顧進度、存檔不變。
- **驗證**：已 GitHub main 回讀 `storyui.js`／`story.css`／`index.html`，JavaScript 語法解析成功，確認 wrapper／CSS 規則及 CSS/JS cache-bust 均存在；瀏覽器桌機、手機實際操作尚未取得本次修正後結果，不能宣稱已通過實機。驗收路徑：任一正式劇情 → 先確認頁碼和下一頁可見 → 點「預覽 3D 文明史書」→ 3D 在中間、文字可捲動、底部按鈕仍可用 → 切頁、關閉、重開 → 桌機和手機重測。
- **最新狀態**：第 16 批視覺預覽施工完成並已補修上述實際回報，仍待實機驗收；第 17 批尚未開始。每批雙文件同步規範維持。

## 2026-10-10｜正式 3D 第 16 批施工紀錄（目前最新）

- **施工完成範圍**：在 `3d-test/prototype-engine.js` 新增純幾何／唯讀 `createChronicleTransitionScene`，可區分「文明戰線紀錄」「文明劇情閱讀」「文明轉生」三種立體構圖；不消費或更改正式劇情、回顧、轉生交易資料。
- **正式文字介面兼容**：`3d-test/formal-home.js` 在戰線紀錄頁、主畫面文明轉生卡增加可關閉的 opt-in 3D 預覽；`storyui.js` 原劇情彈窗內增加可選的「3D 文明史書」與獨立 host，並在劇情關閉時釋放 Canvas。原本每頁文字、上一頁／下一頁、完成回呼與不可逆警示／確認行為不變，轉生條件／確認／結果由既有 `reincarnationui.js`／正式交易 owner 負責，不轉成 3D 操作。
- **GM 永久視覺測試中心**：`3d-test/test-center.js` 六大分類之「副本、災厄與特殊演出」增加上述三個實際共用場景（總數 24→27）；`tests/runtime/gm-3d-test-center-browser.js` 同步更新總數、此分類與點擊場景回歸。GM 視覺目錄 `3D_GM_TEST_CENTER_CATALOG.md` 已同步。
- **資源／安全界線**：前置第 3 批的文字優先、3D 模組按需載入維持；正式 `index.html` 的 `storyui.js`／`formal-home.js` 及 `3d-test/index.html` 的 GM 腳本皆更新 cache-bust；共用 `prototype-engine.js` 備用版號同步更新，正式劇情／回顧／轉生與存檔 JS 未變動。正式 3D 模式仍未開放，兩模式共存架構按第 17～40 批接續。
- **自我檢查**：已重新讀取相關 main 程式及正式 owner；新增／修改 JS 的語法解析通過，檢查預覽 scene/host、GM case ID、快取入口及文件同步。**未取得本次 exact-HEAD GitHub Actions 完整成功與手機／桌機真實 3D 點擊證據，不得宣稱已實機驗收**。第 18 批仍需逐路由／modal、Galaxy review 開戰／結算、轉生不可逆確認流程及手機 WebGL 回歸。
- **本批明確未交付**：完整 3D 劇情動畫、永久 GLB 模型、獨立正式 3D 劇情路由、由 3D 介面操作轉生、跨模式設定選擇；這些不得冒稱本批完成，文字版持續完整。**下一正式批次為第 17 批**。

## 2026-10-10｜雙模式前置第 3 批：程式接點與 3D 資源按需載入（已施工，待瀏覽器／手機驗收）

- **實際修改**：`index.html` 移除啟動時同步引入 `3d-test/runtime.js`、`3d-test/appearance-snapshot.js`；新增輕量 `3d-test/mode-foundation.js`（不存偏好、不改正式 save，現階段唯一有效文字正式模式）；保留 `3d-test/formal-home.js` 的既有文字 DOM 可選預覽入口。點選預覽後才平行載入 runtime、appearance、Babylon 與共用 3D scene，並以原 `Civilization3DRuntime.create/show/dispose` 管理畫面；暫時不改 `onRendered` 全路由 DOM 掛載方式。
- **資源政策**：現有一般文字入口不再於 DOMContentLoaded 無條件 prefetch Babylon／scene；`CivilizationPresentationMode.shouldWarm3DAtStartup()` 現為 false。正式 3D 預覽點擊時仍走 manifest digest URL 與原失敗重試；GM 已授權 ready 中原有的 3D bytes 預熱邏輯可獨立保留，這不等於無 GM 帳號啟動載入 3D。今後第 17 批需要依玩家選定模式與實際首屏政策重新啟用適量預抓。
- **基礎模式管理者已建立，但未啟用正式雙模式**：`CivilizationPresentationMode` 暴露 `modeIds`、`currentMode()`（目前永遠為 text）、`isFull3DAvailable()`（false）、`canPreview3D()`（true）、`shouldWarm3DAtStartup()`（false）。這是**刻意不持久化**的展示政策接點，非真正的帳號模式選擇／切換實作。模式偏好不進正式角色存檔。
- **三個原問題的處理狀態**：① 3D 的 Canvas/外觀與既有文字 DOM 預覽入口已有載入生命週期解耦，但正式 3D 路由不再依文字 DOM 的最後階段**未完成**；② runtime 與 appearance 已由同步改按需，formal-home 維持輕量入口且一般啟動不預抓大量 3D bytes；③ 有統一模式政策雛形但尚沒有帳號綁定／首次選擇／模式切換或交易中斷保護。**不得宣稱三個問題都已全面解決**。
- **第 17 批後續硬性施工**：完成帳號登入後「文字模式／3D 模式」首次選擇、帳號 ID＋裝置瀏覽器偏好隔離、同帳號同裝置直接恢復、設定頁安全保存與重新載入、進行中戰鬥／離線／交易阻斷策略、模式專用 boot/loader；完整 3D 尚未完成前不得對一般玩家開放空殼模式。將本批靜態策略接點升級為真實模式 manager 時，必須有測試且不得讓瀏覽器偏好變成正式 Save 規則。
- **第 18 批後續硬性驗收**：所有正式頁、三紀元、故事／轉生／回顧、子頁、modal、帳號／GM 權限、戰鬥與結算、離線、手機、3D 原型入口、錯誤回退、切換後記住偏好；驗證完整文字玩法不受 3D 影響、L0/L1/L2 模式資源隔離及前 01～15 批舊預覽功能回歸，缺瀏覽器／手機證據標記待驗。
- **第 19～40 批後續硬性規劃**：第 19～26 批建立真正可獨立操作的正式 3D 各路由／場景與按頁載入，第 27～34 批 GLB 人物／裝備／怪物／動畫／材質映射與資源指紋分層，第 35～39 批只讀正式戰鬥事件驅動 3D 全模式戰鬥演出（不複製戰鬥或獎勵 owner），第 40 批全功能雙模式與同存檔、跨模式切換、網路下載量、手機 GPU 長測、錯誤回退與上線驗收。**文字模式永久完整保留**，不得刪掉舊玩法或以 3D 取代。
- **檢查界線**：提交後 GitHub main 回讀、兩支改動 JS 語法解析、入口引入和延遲模組文字檢核可做；未取得真實瀏覽器／手機點擊與 exact HEAD CI 證據前，不得聲稱 3D 預覽全部正常。若發生 3D 舊入口未載入或 GM 共用衝突，先按本批修改重新查實際依賴，修正並加回歸測試；不得先回復所有 3D 同步下載。
- **交接規則**：本前置批不佔原 40 批，正式仍第 01～15 批已施工、**下一批第 16 批**；往後每完成正式一批，同步改本檔與 `PROJECT_HANDOFF.md`、更新 JS/CSS 的 index cache-bust、核對最新 main 與 CI／實機結果。

## 2026-10-10｜雙模式前置第 2 批完成：啟動依賴與模式別資源分層準備

- 新增 [`docs/DUAL_MODE_RESOURCE_LAYERING_PREP_2026-10-10.md`](docs/DUAL_MODE_RESOURCE_LAYERING_PREP_2026-10-10.md)，重新核對 `main` 的 `index.html`：161 個一般同步 script、97 個 deferred 宣告（其中 32 GM），及 `scriptgrouploader.js`、`backgroundpreload.js`、`3d-test/formal-home.js`、GM 測試中心與 Manifest 生成器。
- **已完成：資源依賴盤點／模式別 L0～L4 安全分層與遷移順序／正式文字版、3D 預覽、登入 GM、銀河回顧、異宇宙、離線、冷熱載入測試矩陣。** 目前正式 `index.html` 直接引用三支 3D bridge JS；Babylon 與場景按需執行且可預抓 bytes，故尚未做到「文字模式完全不載 3D JS」。
- **未實作／待證明**：全部 161 檔的逐符號依賴圖、登入模式選擇 boot gate、模式專用下載隔離、獨立正式 3D router、GLB 模型依路由分包、實際冷熱／手機效能測量；不能將規劃文件冒稱 runtime 功能或實機通過。
- **安全禁止事項**：在完成腳本副作用／依賴分析及對應測試前，不能直接搬動 161 個 sync JS 或移除正式 3D bridge。第 17 批先做 L0 決策／帳號本機偏好與受控載入遷移，第 18 批驗收文字完整性；第 19～40 批承接 3D 模型與場景資源。前置第 1～2 批皆為 40 批以外的施工準備；**正式下一批仍為第 16 批**。
- 本批只更新文件，正式遊戲、JS/CSS/HTML、GM 授權、戰鬥、存檔及進度無變動；沒有觸發 cache-bust 的程式變更。遵守每批同步更新本檔與 `PROJECT_HANDOFF.md` 的規範。

## 2026-10-10｜雙模式前置第 1 批已完成：第 01～15 批架構盤點與邊界契約

- 新增 [`docs/DUAL_MODE_ARCHITECTURE_BOUNDARY_2026-10-10.md`](docs/DUAL_MODE_ARCHITECTURE_BOUNDARY_2026-10-10.md)，逐類核對第 01～15 批 opt-in 3D 預覽與正式文字介面、`Civilization3DAppearance` 唯讀資料來源、`Civilization3DRuntime` Canvas 生命週期、GM fixture 及啟動依賴。
- **結論**：目前 3D 是依賴文字畫面 render／DOM 的可選預覽，不能直接視為獨立完整 3D 模式；現有引擎、快照與場景可沿用，不需要重做第 01～15 批。正式雙模式 router／模式選擇、偏好保存與按模式資源分流**尚未實作**。
- 確立「同一正式核心、兩套完整呈現」契約：登入及模式偏好、角色／裝備、地圖／進度、戰鬥事件、交易 action、場景生命週期的單一 owner 和唯讀／命令邊界；禁止額外 state/save/戰鬥或交易公式；文字模式永久完整保留，3D 不以掃描文字 DOM 作未來正式路由。
- **施工性質與驗收**：本批是 GitHub main 程式稽核＋文件約束，未修改 JS/CSS/HTML、正式 save 或 runtime；無可宣稱的瀏覽器／手機 3D 完整模式驗收。下一步**前置第 2 批：資源依賴與載入分層準備**；40 批正式主線仍停在**第 16 批尚未施工**。往後每批雙文件同步更新依既有強制規範。

## 2026-10-10｜近期修復、40 批資源分層與未來雙模式契約（現行有效）

### A. 已施工、可從 main 程式核對（不計入 3D 第 16 批）

1. **銀河回顧戰**：近期修正回顧挑戰點擊、進入戰鬥準備／戰鬥畫面遭高維冒險路由覆蓋、`monsterObj` 查找與失效 target context 導致無戰鬥、結算解鎖與重打等問題。正式 owner 包含 `ui.js`、`playersemanticsui.js`、`firstworldtargetcontextbatch5.js`；`tests/runtime/galaxy-review-combat-browser.js` 提供實際點擊、runCombatCore、動畫、結算與重試回歸案例。**已有程式及測試案例，不等於最新 HEAD CI／使用者實機全部驗收通過**；第 16、18、37、40 批必須持續回歸，確保回顧不給正式收益、不改進度或存檔。
2. **異宇宙 3D**：以 `alternateuniversedata.js` 正式資料為唯一來源：20 種文明體系，各 10 個宇宙，總 U001～U200，每宇宙 5 深度（外環、神庭、聖域、天座、主宰），1000 層；正式宇宙編號在不同體系間交錯，體系內名單順序才是第 1～10 階，不得用 U 編號直接假設階級。現有 `3d-test/prototype-engine.js` 場景與 `3d-test/test-center.js` 的 20 體系視覺、真名、快捷切換、深度選擇，及 `3d-test/formal-home.js` 下一層唯讀預覽已施工；這是**3D 預覽修正**，並非正式異宇宙規則改寫或第 16 批完成。第 18、20、24、33、39、40 批持續驗證資料一致性。
3. **進入遊戲與資源版本**：啟動資源優化獨立 1～5 批已施工：`backgroundpreload.js` 的就緒協調器／中性百分比與重試；`scriptgrouploader.js` 已授權 GM 啟動 ready、按帳號隔離授權、32 個 GM JS 條件驗證／內容差異快取；`scripts/generate-resource-manifest.py`、`resource-manifest.json`、`.github/workflows/asset-version-manifest.yml` 逐檔指紋；正式與 GM 3D 預覽以版本 URL 預抓共用 Babylon/場景 bytes，**未開預覽不建立 WebGL/GPU**，GM 中心另預熱自身必要 JS。不能把預抓 bytes 當成已執行場景，也不能將所有同步腳本誤報為已按模式延後。GitHub Pages manifest/資源可能有部署切換窗口，不能宣稱跨檔原子性；最新部署、CI、手機冷／熱啟動須另驗。

### B. 原 40 批 3D 資源分層判斷（施工指引，尚非雙模式已實作）

- **L0｜登入與模式決定前最小啟動層**：帳號工作階段恢復、模式偏好讀取、首次模式選擇、錯誤／重試畫面；不必先下載文字模式所有遊戲功能，也不初始化 Babylon/WebGL。此為**未來目標**，現有大量同步腳本尚須經依賴審核才能拆分。
- **L1｜模式共用核心**：正式帳號、資料讀寫／同步、角色與裝備正式狀態、紀元／解鎖、戰鬥公式、收益／交易、離線及存檔；**單一 owner、相同結果**，按依賴安全排序載入，不能為 3D 複製第二套規則。
- **L2-T｜文字模式介面層**：完整保留既有文字／數值 UI、所有頁面與戰鬥呈現，文字模式只載入其必要 CSS/JS/背景；不可因新增 3D 而刪掉文字模式或強制其下載 Babylon、GLB、貼圖、動畫。
- **L2-3D｜3D 首屏必需層**：僅所選紀元的正式首畫面、必要 UI bridge、Babylon 本地引擎與首屏最低必要模型／材質；進入 3D 前等其 ready，但不得讓非首屏的地圖、怪物、戰鬥資產阻塞啟動。GPU／WebGL 只在真實需要場景時初始化。
- **L3｜3D 按頁／按紀元延遲層**：星圖、角色、裝備、鍛造、養成、副本、災厄、異宇宙、劇情、戰鬥場景及其 GLB／貼圖／動畫按路由預取／載入；相同 URL 內容指紋重用網路快取，切頁取消過期載入、必要時釋放 GPU，保留故障回退與重試。
- **L4｜GM 專用層**：僅已登入且取得既有 GM 授權才預熱／執行 GM 模組；永久保留 GM 3D 視覺測試中心，與正式角色存檔隔離。GM 的預先就緒不阻塞一般帳號。
- **第 01～15 批**：已施工之 opt-in 幾何預覽保留作為開發過渡；目前 3D 並非正式完整模式，不追溯宣稱達成 L0/L2 雙模式啟動。
- **第 16 批**：劇情、戰線紀錄、轉生與銀河回顧 UI 回歸；介面只讀，保留文字操作與資料契約。
- **第 17～18 批**：規劃雙模式選擇／切換與登入後決策基礎，審核全路由／資源與回退；**未完成全套 3D 前，不能向一般玩家開放不完整的 3D 模式**。需逐檔證明 L0/L1 不依賴兩種模式介面，並測試首次選擇、重登、換帳號、不同裝置。
- **第 19～26 批**：3D 場景、鏡頭、場景別模組及效能；第 26 批做早期資產的 GPU／記憶體長測，不代表最終 GLB 通過。
- **第 27～34 批**：正式人物、模組化五槽、裝甲、武器、動畫與怪物資產；模型、動畫、材質版本化並按需載入，第 34 批完整資產清冊／手機再驗。
- **第 35～39 批**：正式事件唯讀橋接與全模式 3D 戰鬥，特效／快補播不能成為戰鬥計算或結算時序依賴；第 39 批包含異宇宙／高維與快速補播。
- **第 40 批**：同一存檔雙模式功能與數值一致性、完整文字版保留、首屏資源下載與冷／熱載入、斷網／GPU 失敗／切頁、GM、手機長測、模式切換及權限隔離的正式上線決策。

### C. 玩家「文字模式／3D 模式」共存決策（已確定方向，**目前僅規劃、尚未開發**）

- **不是 3D 取代文字**：文字模式永久完整保留目前完善的文字／數值玩法；3D 模式是新增一套完整的場景與操作呈現。兩者共享同一帳號、同一正式角色存檔、遊戲進度、所有貨幣與物品、戰鬥核心、養成規則與結算；模式是**呈現／載入偏好**，不是分開兩份遊戲資料。
- **進入流程**：先完成註冊／登入或恢復現有帳號工作階段；再依「帳號 ID＋當前裝置瀏覽器」讀取上次選擇。已有有效偏好直接按該模式啟動；第一次沒有紀錄時顯示「文字模式／3D 模式」選擇畫面，確定後才載入該模式必要資源；不得等整套文字與 3D 都下載完才詢問。
- **偏好儲存**：同帳號＋同裝置瀏覽器記住上一次模式；不同帳號互不沿用，同帳號不同裝置可選不同模式；清除本機資料或換裝置可重新選擇。不得使用未登入的跨帳號共用 key；模式偏好與正式 Save Schema／角色資料分離。未來實作時考慮私人瀏覽、儲存不可用、跨分頁並行與資料遷移。
- **設定切換**：在遊戲設定選另一模式，先完成既有正式保存／必要交易安全檢查，再更新該帳號本機偏好並**重新載入**，進入新模式，不能重建角色或清空進度；戰鬥、連戰、離線結算等進行中狀態必須有明確中止／確認策略，不可造成重複收益。
- **相容與故障**：不支援 WebGL／素材故障時，以可理解提示及可選「切回文字模式」的明確動作處理，避免黑屏、存檔損壞或重載迴圈；正式 3D 未完成前保留開發／GM 限定預覽，首次登入的一般玩家預設不能誤進尚未完成的完整 3D 模式。
- **施工與驗收**：第 17 批實作 L0 模式閘門、偏好與設定轉換的安全基礎；第 18 批驗收其入口與完整文字版相容；第 19～39 批分階段建 3D 呈現且不得侵蝕文字版；第 40 批才作雙模式全面上線驗收。**原 40 批數量不增加**。每批交付同步更新本檔與 `PROJECT_HANDOFF.md`、重讀 main、記錄已施工／待施工／CI／實機界限。


## 施工進度單一有效摘要（2026-10-10 更新）

- **總批次固定 40 批；第 01～17 批已提交 3D 幾何預覽／基礎施工，但不等於正式 L1/L2 覆蓋或實機完整驗收。** 第 18～40 批尚未施工；**下一批為第 18 批**。第 18／26／34／40 批依原規劃負責階段驗收。
- 正式可選 3D 預覽目前共用 Babylon.js 場景；GM 3D 視覺測試中心已有 24 個場景項目，永久保留。正式介面的過渡預覽入口待全面 3D 完成後移除，並保留 GM 測試中心。
- 2026-10-10 已另完成啟動與資源載入優化 1～5 批及異宇宙 3D 專項修正；**不計入上述 40 批編號，也不可視為第 16 批完成**。
- **強制文件同步規範**：今後每完成 40 批工程中的任一批（含補修、驗收結案），必須在**同一次工作交付**同步修改本檔該批「狀態／日期／commit／已驗證與待驗」及進度摘要，並更新 `PROJECT_HANDOFF.md` 的最新交接與下一批位置。兩份文件缺一不可；文件更新須與程式同批提交或緊接提交，完成後重新讀取 main 確認，未同步不得宣告該批交付完成。
- 既有歷史記錄與現在進度不符時，以最新 main 程式及較新且已驗證的批次紀錄為準；歷史描述需明確標記而非當成當前狀態。僅文書修改不觸發 JS/CSS cache-bust。

## 手機 GPU／記憶體分階段驗收安排（2026-10-09 定案）

> 本安排只補充原有第 26、34、40 批的驗收責任，**不新增批次，也不要求第 12 批現在執行長時間壓力測試**。

- **第 12～25 批｜基本手機回歸**：每批實際新增或修改的 3D 預覽，確認手機直向／橫向可進入、切換、放大／還原、關閉與返回原正式頁；操作鈕不被遮蓋、無明顯持續卡頓；沒有實機證據則標記待驗，不假稱 GPU 長測通過。
- **第 26 批｜第一次長時間 GPU 壓力測試**：以當批已完成的場景、材質與特效進行持續運作（原則上 30 分鐘）與多次場景轉換／關閉重開；記錄 FPS／流暢度、記憶體及 WebGL 資源變化、裝置發熱、瀏覽器重載與失敗回退。觀測方式依裝置可取得資料決定，不虛報無法量測的 GPU 數值。
- **第 34 批｜正式 GLB 模型引入後再次實測**：針對最終當批玩家／裝備／怪物模型、LOD、貼圖、動畫與資產重載，檢查長時間運作、手機下載量、記憶體負載及切換回退；**第 26 批的幾何／早期素材數據不能代替這批的正式模型效能**。
- **第 40 批｜完整遊戲最終壓力與穩定性驗收**：對三紀元、回顧、各戰鬥模式、全路由及 Modal，進行長時間連續使用、反覆切換、前後台恢復及 WebGL 失敗／原 HTML 回退，並確認不影響正式戰鬥速度、離線樣本、存檔與權限。
- **驗收證據**：逐次記錄實際測試裝置／OS／瀏覽器、當批場景與模型版本、測試時間、操作路徑、觀察到的效能與發熱、失敗情況、修正與重測結果；不得以 CI 靜態通過取代手機 GPU 實測。任何批次有實際故障仍應立即修復，不延至長測批才處理。

- **2026-10-09 原始 3D 規格書已入庫**：已確認 `main` 根目錄存在 `《文明戰線》3D 全面升級・完整規劃與施工規格書.docx`（53,209 bytes）。此 Word 為設計歷史參考，不是強制施工清單；現行 `main` 程式與 40 批施工計畫優先。往後應直接讀取根目錄原檔，不再使用 `docs/reference/` 作為有效路徑。

## 原始 Word 與 1～11 批補修工作包（2026-10-09）

- 原始設計稿：《文明戰線》3D 全面升級・完整規劃與施工規格書.docx，僅為**歷史設計參考**，**不是強制施工清單**。遇到衝突時以最新 `main` 程式與本檔有效決策為準；可以刪減、替代或調整，不增加固定 40 批的數量。原檔進 GitHub 後預定放 `《文明戰線》3D 全面升級・完整規劃與施工規格書.docx`，必須保留二進位內容原樣，不可冒充文字版 Word。
- **補修 A（已實作待 CI／實機）**：GM 3D Browser Smoke 依新版 API v3、11 個視覺場景更新，涵蓋八專精／十印記／文明／核心的自訂欄位、來源切換、無正式快照不套用自訂資料及角色頁無效能力控制項消失。
- **補修 B（核對與補驗中）**：保留目前手動啟用／關閉即 dispose 的引擎策略；關閉釋放比永久保留 GPU 更適合現況，不為了舊規格強制重寫。場景快速切換以 runtime epoch、AbortController、場景釋放；WebGL 失敗時維持 HTML 操作，後續用 CI/真機確認。
- **補修 C（納入第 18 批覆蓋驗收）**：前 1～11 批屬 opt-in 真 WebGL 幾何預覽，不等於已完成全部 L1/L2。第 18 批按玩家真實操作路徑逐項檢查漏掉的狀態／Modal，避免無價值的獨立 GM 工程頁、假戰鬥與強制 24 種怪物模型。
- **共用資料**：正式角色快照唯讀；GM 自訂值只留本次 iframe，正式模式不得由 mock 取代；控制項只在真的影響場景時顯示。後續 12～40 批繼續遵守。
- 未獲明確驗收前不得聲稱 GM Browser、GPU 長時、手機真機或正式資料同步已通過。

- **2026-10-09 第 11 批 GM 展示控制精簡補修**：角色全身幾何場景僅受紀元影響，移除不會改變外觀的 HP／ATK／DEF／暴擊／閃避／VIP／突破七個 GM 自訂輸入欄位，但唯讀正式快照仍保留這些資料；未來各批次只有視覺效果確實依賴數值才可顯示對應控制。專精／印記改用獨立四欄緊湊數值區（手機亦四欄，完整數字可見），文明／界弦改單列；印記名稱由正式 owner 快照提供。GM 設定仍按場景呈現，不得將新控制複製到無關的 12～40 批場景。實機待驗。

**第12～40批共用資料來源強制規範（2026-10-09 第11批補修）**：所有角色外觀、HP／ATK／DEF／暴擊／閃避、VIP、突破、八專精、十印記、文明等級、界弦核心、裝備與強化之 GM/正式 3D 視覺讀數，統一透過 `Civilization3DAppearance.capture()` 的 version 2 唯讀快照或其後續向下相容介面。GM 測試中心統一顯示「展示資料來源／正式角色資料／自訂測試資料」；正式同步不使用場景 fixture 假資料，自訂測試只維持 iframe session 且不觸碰正式 state／Save。僅依場景顯示相關控制：專精各 Lv.0～60、印記各 Lv.0～10、文明／核心 Lv.0～10、角色屬性獨立欄位；地圖／主畫面禁止無關資料來源表單。未來批次不得複製新讀取器，不得把測試 fixture 混作正式能力來源，展示不定義戰鬥結算。每批逐一驗證同步、切換、跨紀元、行動裝置與隔離性，無實機證據不能宣告完成。

- **2026-10-09 第 11 批位置補修**：依正式 owner 分流四種養成預覽，專精頁只顯示八專精並移除跨系統下拉選單；印記、文明、界弦核心分別定位於相關災厄／高維核心區塊，戰鬥與結果畫面不顯示；GM 四案例保留。正式資料唯讀，L1、手機與回顧互動仍待驗。

## 每批修改完成的固定回報格式（強制）

往後每一批《文明戰線》修改完成，都必須固定回報以下四個部分，不得省略：

1. **修改內容**：說明實際改了哪些功能、畫面與檔案，區分已完成及仍未完成範圍。
2. **程式自我檢查**：列出實際執行的靜態檢查、自動化／瀏覽器測試、結果與未驗證項目；不得把程式碼回讀當成實機通過。
3. **實機驗收清單**：提供使用者可直接在手機或電腦操作的逐項測試，**每項必須寫清楚進入路徑、操作步驟、預期畫面或行為**，必要時含不同紀元、回顧、GM、最大化／還原與原功能回歸；讓使用者可用編號回報問題。此為每批必填，不能只寫「請實測」。
4. **GitHub 提交與待補事項**：列出分支、commit SHA、文件／cache-bust 更新、CI 狀態，以及尚待修正或人工驗收的項目。

即使當批是純工程變更、沒有新視覺入口，也須列出可操作的正式流程回歸測試；若實際無法在手機觀察技術內部結果，應明確說明可觀察的行為與需由 CI 驗證的部分。不得虛稱實機已通過。

# 《文明戰線》3D 全面升級｜40 批正式施工總計畫

- **2026-10-09 GM 3D 外觀設定排版修正**：外觀設定面板僅用於角色、五槽裝備、鍛造台三個相關展示，三紀元主畫面與星圖不顯示；移到場景介紹下方改為預設收合的「展示設定」，展開後可切正式／自由模式與調整參數。把先前分散的行內 CSS 統整進 `3d-test/test-center.css`，以固定高度／自適應兩欄網格解決手機巨大輸入框及五槽 checkbox 直向堆疊。正式快照、iframe 權限與七場景 factory 均保留；手機、桌機 WebGL 及 CI 尚待驗收。



- **2026-10-09 外觀快照前置整合（獨立施工，不另增批號）**：`3d-test/appearance-snapshot.js` 是正式角色的唯讀外觀資料單一入口；第 08 批角色、第 09 批裝備、第 10 批鍛造台三處預覽已改接。GM iframe 採受權且同源的 postMessage 傳遞外觀資料，預設「正式角色外觀」，可切「自由展示模式」，後者僅保存在本次 iframe 工作階段；可重新同步。尚無最終裝甲／武器 GLB 或新視覺效果；不得宣稱已做到模型外觀完全一致。

## 外觀快照接口：第 11～40 批跨批約束（2026-10-09）
1. **11～18**：養成、子頁、戰鬥 HUD 僅在展示需要時消費正式／自由外觀資料；地圖進度、關卡、鏡頭等 scene fixture 保持獨立。第 18 批將兩模式與既有路由一併驗收。
2. **19～26**：場景精修與角色展示使用共用 appearance 接口，禁止各場景自行重複寫一套裝備／強化讀取邏輯；第 21、22 批集中處理模型切換、外觀效果和材質，第 26 批驗收效能及版本切換。
3. **27～34**：正式骨架／裝備／武器／動畫／資產映射以快照中的 stable equipment identity、紀元、品質、裝備等級、強化等資訊驅動，不反向寫入正式角色；第 28～30 批補正式外觀映射，未有資產時維持明確佔位。第 34 批驗收資產映射及裝備一致性。
4. **35～39**：正式戰鬥以 combat owner 的唯讀事件為唯一結果依據；外觀接口僅驅動 actor 模型、武器、材質和可視特效，不做攻防或血量計算。
5. **40**：驗證正式角色／自由展示切換、手動刷新、五部位換裝與跨紀元模型、關閉釋放 GPU、手機及資料／權限隔離。
6. 每批只新增當前真正有視覺作用的展示控制，**不得因同步而引入 HP、ATK、DEF、勝率或 GM 戰力模擬結果**。原 40 批施工順序與總數保持不變，這是第 10 批後的前置整合。


- **2026-10-09 GM 3D 測試中心全頁視覺整理**：比照正式遊戲 `style.css`／`gmhub.js` 的黑灰、鐵灰、暖金視覺語言，重整測試中心頁首、側欄、分類與細項差異、類別場景數、場景資訊、參數面板、WebGL 舞台、操作列與手機響應式樣式。保留六個真實展示、分類篩選／搜尋、場景切換、畫質、放大還原、iframe 返回及測試邏輯；`test-center.js` 僅增加分類數字／細項文字 DOM，未改正式遊戲或存檔。真機視覺、縮放與 E2E 待驗。

- **2026-10-09 3D 載入效能優化**：正式 3D 橋接於網頁完成後的閒置時段僅預先快取 Babylon.js 7.54.3 與共用 scene factory，不提前建立 WebGL／Canvas／GPU 場景；正式首次點擊改平行載入獨立 JS（並保留失敗重試），GM iframe 測試中心 Babylon.js／runtime／scene factory 改平行載入，GM 與正式頁使用同一共用場景資源 URL 以提高 HTTP 快取重用。保留使用者手動啟動、關閉釋放 GPU、場景與存檔不變。實際首開速度／網路與手機測試尚待量測。

> 規劃日期：2026-10-09（台灣）｜儲存庫：`franksky1207/rpg`｜分支：`main`
> **本檔兼具施工規劃與進度紀錄；已提交實作不等於通過全部功能、瀏覽器與實機驗收。最新進度以文件最上方摘要與 main 實碼為準。**
> **唯一程式真實來源：每次執行前重新讀取當下的 GitHub `main`。** 與舊 Word、對話或本計畫衝突時，以 main 實碼為準，先釐清再修改。

## 0. 讀取順序與其他對話接手

1. 先讀 `PROJECT_HANDOFF.md`、本檔 `3D_IMPLEMENTATION_PLAN.md`，必要時讀 `PROJECT_PENDING_STATUS.md`。
2. 每次使用者指定「第 N 批，修改後自我檢查」，先 fresh-read 該批正式 owner／consumer 及 current main；只執行指定批次，不自動進入下一批。
3. 完成後回報：影響檔案、修改摘要、測試及限制、commit SHA、待續批次；更新本檔該批狀態／成果與交接索引。
4. 本計畫為新增大型專案；既有遊戲正式狀態由 handoff／main 決定。不得把尚未開工的 40 批寫成已完成。

## 1. 總體目標與優先度

- **A1 第 01～18 批（18 批）**：玩家進入遊戲可看見的**全部正式頁面、子頁、動態 Modal、空／未解鎖／完成／回顧／連戰狀態**先覆蓋 3D 介面。全部 L1、主要高頻介面 L2；戰鬥畫面 HUD 已改造但先不改正式戰鬥動畫。
- **A2 第 19～26 批（8 批）**：各場景真正的 3D 立體物件、鏡頭、觸控與材質精修；非換背景圖。
- **B 第 27～34 批（8 批）**：單一人形骨架、三紀元裝甲、五裝備槽、武器、動畫、怪物家族及 GLB 資產驗收。
- **C 第 35～40 批（6 批）**：正式各模式 3D 自動戰鬥、事件同步、倍速／快補播、全遊戲最終驗收。
- **合計 40 個工程工作包；屬初始估計而非成本或批次上限。** 模型／怪物量可能需要在已核准範圍下再細分小提交。

### 視覺驗收分級

- **L1 視覺覆蓋**：真正 WebGL 3D 場景底座、原頁面功能完整、手機與回退正常。
- **L2 功能整合**：該頁獨有的 3D 互動／預覽，例如星圖、工坊、傳送門、文明核心。
- **L3 正式美術**：高品質專屬模型／動畫／特效，全部裝置與長時間效能驗收。

## 2. 不可更動的安全邊界

1. 既有三紀元數值公式、VIP、突破、裝備能力、稱號、印記、文明等級、交易與存檔必須保留；3D 是唯讀 presentation，不建立第二套戰鬥／養成／存檔規則。
2. 銀河紀元 **Target Context 才是正式 battle execution authority**；`selectedMap/selectedEnemy` 僅作 UI 選取，3D 地圖不能取代 fail-closed 驗證。
3. 第三紀元高維 Boss 持續 HP、stage、重征服、轉生永久裝備、異宇宙進度等使用當下正式 owner，不得自行模擬或重算。
4. 正式事件由 `combatcore.js`、`combatfx.js` 及各模式 owner 提供；3D 動作可壓縮、跳過，不能阻塞背景連戰／Fast Catch-up 或污染離線取樣。
5. 不動 Save Schema（規劃時 Schema 17）除非另有明示核准；不將相機／模型／粒子／暫態 GM 權限寫入正式 save。
6. 全部**必需的正式網頁 3D 資源／程式**原則放在唯一 GitHub 儲存庫 `franksky1207/rpg`。不要預設另開 CDN、外部硬碟或第二儲存庫；素材過大再經討論決定。第三方素材須允許公開部署並記錄來源及授權。
7. 預設保留原有 2D/CSS 背景及功能作安全回退。3D 不得阻塞登入、GM、雲端／本機存檔、主導航及正式交易。
8. 只要修改 production JS/CSS，就同步更新 `index.html` cache-bust。更新 `PROJECT_HANDOFF.md`、對應測試及本檔狀態；每批重新讀取 main 與檢查變更，不得憑空宣稱 Actions 綠燈。

## 3. 既有程式入口（僅作定位，每批仍需 fresh-read）

| 功能 | 主要來源 |
|---|---|
| 首頁／共用渲染 | `index.html`, `ui.js`, `backgroundpreload.js` |
| 冒險／紀元回顧 | `worldmapui.js`, `playersemanticsui.js`, `secondworldmainline.js`, `thirdworldui.js` |
| 副本及子視圖 | `dungeonui.js`, `dungeonvoidui.js`, `mirrordungeonui.js`, `thirdworldarenaui.js` |
| 災厄、異宇宙 | `calamityui.js`, `secondworldcalamityui.js`, `alternateuniverseui.js` |
| 養成與人物 | `enhancementui.js`, `specialization.js`, `playertitleui.js`, `breakthroughui.js` |
| 劇情及轉生 | `storyui.js`, `storyrecordtabs.js`, `worldphaseui.js`, `reincarnationui.js` |
| GM／雲端 | `gmhub.js`, `gmhubextensions.js`, `supabaseauth.js`, `cloudsave.js` |
| 正式戰鬥呈現 | `combatfx.js`, `battlepipeline.js`, `settlementui.js` 及各模式 owner |

## 4. 全 40 批逐批施工與驗收

## A1｜全遊戲 3D 介面（18 批）

全遊戲正式頁面與所有可見子狀態先達 L1，主要常用頁面達 L2；原本規則與資料完全不變。

### 第 01 批｜3D 引擎底座與獨立測試入口
- **非視覺批次驗收責任**：本批不須在 GM 3D 測試中心建立獨立測試項目；透過自動化、正式流程與實機驗收交付。若涉及既有 3D 外觀，僅更新原有預覽，不新增工程診斷選單。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：建立共用 WebGL/Babylon.js 引擎、獨立測試入口、固定版本載入；不碰正式 save/combat。
- **實作（2026-10-09）**：新增 `3d-test/index.html`、`3d-test/prototype-engine.js`、`3d-test/prototype.css`；測試頁版本固定 Babylon.js 7.54.3，純展示幾何場景可旋轉／縮放，提供手動停用／重啟、WebGL 不可用／引擎載入失敗時安全提示、離頁 dispose。正式 `index.html`、`#main`、save/combat 均不觸及。
- **驗證範圍**：已由 GitHub 回讀檔案確認存在與入口相互引用，核對程式碼隔離、dispose 與安全回退分支；**尚無真實瀏覽器、手機實機或 exact HEAD Actions 成功證據**，故功能執行與效能仍待實測；引擎現為固定版本外部 jsDelivr，正式整合前需將所需 engine 資產移回單一儲存庫。
- **施工 commits**：`b5e664268a9fc11bc83679f22d451398f77bec6a`、`23a229628dca1f91fcdf6f15442d7b7c259f35f2`、`a70438a14f8e7c2a7d3b0e122839d635e052c231`。
- **狀態**：程式已提交，靜態檢查完成；實機驗收待補。

### 第 02 批｜共用 Canvas、路由、效能與回退
- **非視覺批次驗收責任**：本批不須在 GM 3D 測試中心建立獨立測試項目；透過自動化、正式流程與實機驗收交付。若涉及既有 3D 外觀，僅更新原有預覽，不新增工程診斷選單。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：Canvas 脫離 #main.innerHTML；場景 epoch/取消、dispose、資產快取、畫質、手機 safe-area。
- **實作（2026-10-09）**：新增 `3d-test/runtime.js` 共用 presentation runtime；root/canvas 由 host 獨立持有，不放在正式 `#main.innerHTML`；`show(sceneId,factory)` 具 epoch 取消過期結果、場景 dispose、同一引擎重用，`stop/dispose` 釋放 GPU 與 event listener，提供本階段簡易資產 Map、low/medium/high 硬體縮放及 fallback callback。測試頁已改採 runtime，保留 GM iframe 返回前一畫面，提供畫質切換和手機 Safe Area。
- **驗證與限制**：GitHub 回讀／靜態檢查及 base→head compare；未取得實際瀏覽器／手機 GPU profiler 與 exact HEAD Actions success，故不可宣稱無 GPU 洩漏或所有手機已通過。正式頁面批次接入及正式路由 owner 對接屬第 03 批起；目前 scene factory 與場景管理先在 3D 測試頁驗證，不插入正式主流程。Babylon.js 仍由固定版 CDN 測試載入，正式部署前須本地化。
- **程式提交**：`5002c766a08cda7fd01bbc9d2e7c3dddffba08c9`、`7788cd41dce369886728812e476d0ebcaa7a8f25`、`c1c0dbdd38a8dae96456f63479ae707dacc09e5b`、`5bf7b093b7117d300be88ef0e8d563c16798ce59`。
- **狀態**：程式已提交、靜態核對完成；瀏覽器實測與效能驗收待補。

### 第 03 批｜啟動、登入、主畫面 3D 基礎
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：背景預載、帳號介面、主畫面艦橋、全域導覽、狀態列；保留原本 HTML 與登入安全。
- **已施工（2026-10-09）**：正式 `ui.js` 的主畫面增加預設關閉的「預覽 3D 艦橋」按鈕，正式 render 在 DOM 更新後僅通知 `civilization3dHomeRouteRendered(view)`；新 `3d-test/formal-home.js` 是唯讀展示橋接，透過第 02 批 runtime 將獨立 WebGL 場景 mount 到 `#civilization3dFormalHost`（`#main` 外），只在玩家點擊按鈕後延遲載入；切離 home 釋放引擎並恢復原頁，異常時立即關閉預覽。正式 `index.html` 更新相關 JS cache-bust 與預覽容器安全區位置。正式 HTML 登入、狀態列、導航及存檔仍使用原版。
- **限制與前批缺口**：本批是 **Opt-in 3D 主畫面小型預覽**，非全畫面正式 3D 艦橋，不代表啟動畫面、帳號頁或所有導航視覺已 3D 化；Babylon.js 仍從固定版 CDN 載入、未入 GitHub，故 **B01-G1 尚未關閉，不可正式全面啟用**。WebGL context loss／場景恢復、手機實機、導覽及登入 E2E、GPU 長時負載仍待驗。不得把此批直接視為 L1 全頁通過。
- **靜態檢查**：已讀取 `ui.js` render/home、`index.html`、runtime、GM bridge 的正式來源；回讀提交後核對無存檔／戰鬥邏輯修改，測試限制如實留檔。未取得 exact HEAD 成功 CI/實機瀏覽器證據。
- **狀態**：安全接入／預覽程式已提交；**正式主畫面全面 L1、引擎本地化與實機驗收尚未完成，須在後續同範圍補齊**。

### 第 04 批｜三紀元入口與共用導航／彈窗
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：銀河→宇宙→高維入口、條件／確認／歡迎；全域返回與共用 Modal 視覺。
- **本次已提交（2026-10-09）**：`3d-test/worldphase-b04.css` 對正式新紀元首頁入口及條件／確認／解鎖通知 Overlay 提供宇宙與高維的不同光環、深度與背景視覺；`worldphaseui.js` 僅在 3 個既有 overlay open 路徑附加 read-only `data-world-phase-target`，正式 eligibility、entry transaction 與 alert 都不更動。原本返回、要求清單、取消、不可逆提醒及手機 safe-area 保留。共用首頁 3D 預覽由正式 `currentWorldPhase()` 選擇銀河／宇宙／高維三種 portal 色彩與真 3D torus 場景，不另算世界狀態；`index.html` 引用 CSS 並更新修改 JS 的 cache-bust。
- **限制**：本次是新紀元入口與彈窗的可見視覺強化，加上既有首頁預覽的立體紀元門；**沒有全面將導覽列、所有全域 Modal 或歡迎頁改造成 WebGL 3D 全畫面**。因此第 04 批全面 L1 驗收仍待後續同範圍補驗。未取得實際瀏覽器／手機紀元切換、轉生輪及無障礙焦點 E2E 成功證據；不得稱為完全驗收。
- **自我檢查契約**：核對目標世界 data-attribute 只作視覺資料，正式 `requirements/eligible/enter` 判定未修改；3D 圖形源於主畫面正式世界 owner，切離仍由第 03 批路由 bridge 釋放；確認視窗文字依然在 HTML/CSS 而非 WebGL 貼圖。
- **狀態**：已提交第一階段介面視覺與 3D 紀元門，瀏覽器及全面 L1 尚待驗收。

### 第 05 批｜銀河紀元冒險與選怪
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：銀河區域、五怪選取、進度、鎖定、準備、背包返回、回顧入口。
- **2026-10-09 本次程式施工**：正式 `worldmapui.js`（覆寫地圖頁 owner）和 `ui.js`「選擇怪物／準備」新增「預覽 3D 銀河星圖」開關，保持原版區域卡、怪物卡、HP／ATK／DEF、進度與鎖定、開始戰鬥／背包／回地圖按鈕。3D 顯示由 `3d-test/formal-home.js` 沿用隔離的 Canvas runtime，採按鈕 opt-in、本地 Babylon.js、離開冒險或進正式戰鬥自動釋放。新 `createGalaxyScene` 僅描繪十個主線大區節點（依正式 `WORLD_REGIONS` 的 `mapStart` 門檻）、依 `state.unlockedMap` 判斷各大區鎖定，以及五個怪物象徵幾何；只讀選取資訊，沒有新戰鬥輸入通道。新 `3d-test/galaxy-b05.css` 強化銀河區域與怪物卡的立體視覺及手機排版，`index.html` 更新 CSS/JS cache-bust。最後對照正式地圖 owner 及進入戰鬥時的清理 hook 補修。
- **正式規則不變**：`enterMap`、`selectEnemy`、`enemyUnlocked`、`monsterObj`、`startBattles`、正式 Target Context 與既有背包返回 owner 維持原運作；3D 幾何不可點選來改變正式 selectedMap 或 selectedEnemy。已在 `render()` 的戰鬥畫面分支關閉 3D。
- **可由玩家測試**：主畫面 →「冒險」→「預覽 3D 銀河星圖」，可見可轉動、縮放的十區節點與象徵怪物，其他原版地圖卡正常；任選已解鎖地圖後在準備頁仍可看到 3D 預覽，選五怪之一、回地圖、背包返回應維持原規則；關閉預覽或正式開戰時畫面自動清除。未解鎖地圖不得可進入。進入宇宙／高維正式冒險本批不改，由第 06～07 批處理。
- **驗收限制**：第 05 批目前為**可開關的真正 WebGL 3D 銀河星圖 + 原版 HTML 完整功能共存**，而非全部地圖／怪物卡改為 3D 直接操作；未實測真機、長時間手機 GPU、回顧入口及不同存檔實際視覺，因此 L1 全覆蓋 **未完全驗收**。不應將程式靜態檢查當作實機成功證據。
- **狀態**：第 05 批功能已提交並靜態檢查；正式全頁 3D L1 與實機回歸待補。

- **第 05 批 CI 補充（2026-10-09）**：GitHub exact-HEAD Runtime Integrity 在 `tests/runtime/js-integrity.js` 的既有 GM script-group loader cache 契約失敗（production `index.html` 已累積 v5～v8 cache token，但舊測試只允許到 v4）；暫時核對完整字串後下一項既有 GM 授權 owner 契約仍失敗。此為跨模組舊測試／正式程式不一致，非第 05 批新 JavaScript 語法失敗；已撤回臨時修改該舊測試的提交內容，未在本批放寬其他 GM 驗收。**Runtime Integrity 未通過；Playwright 瀏覽器 smoke 因前段失敗未執行**。詳見 [CI run 37894390745](https://github.com/franksky1207/rpg/actions/runs/37894390745)、[後續 CI run 37894599615](https://github.com/franksky1207/rpg/actions/runs/37894599615)。

- **2026-10-09 第 05 批實機入口修正：使用者確認是在正式銀河紀元冒險十區列表，不是回顧戰；`worldmapui.js` 的正式 `adventureMapPage()` 原本以 `typeof galaxy3dPreviewControl` 的條件式輸出按鈕，會在跨 script 作用域不可見時靜默省略。現已改為正式地圖 owner 直接輸出按鈕，`index.html` 更新 worldmapui cache-bust；另新增 `tests/runtime/galaxy-3d-button-browser.js` 和獨立 CI `.github/workflows/galaxy-3d-button-smoke.yml`，以 Chromium 真正 render `go('adventure')` 驗證按鈕與正式區域列表。非轉生回顧頁問題，未修改戰鬥或存檔。**

- **2026-10-09 轉生銀河預覽入口補修**：使用者實測確認首輪銀河有入口、轉生重返正式銀河卻無。針對不同 world1 rerun HTML owner，新增正式 `render()` 後的 `civilization3dHomeRouteRendered()` 容錯補入口：只在 `currentWorldPhase()===1` 且正式 `getAdventureEraView()==='galaxy'` 的冒險區域列表補上按鈕，已存在則不重複；回顧世界不補。未更動世界判定與正式戰鬥 owner。 `tests/runtime/galaxy-3d-button-browser.js` 新增首輪銀河／轉生銀河／銀河回顧三情境（測試虛擬紀元路由與 DOM，不冒充真實轉生完整 E2E）。

### 第 06 批｜宇宙紀元冒險與回顧

- **2026-10-09 銀河回顧 3D 預覽補齊**：宇宙紀元與高維紀元的「銀河紀元・回顧」正式區域列表，現在共用既有 `createGalaxyScene` 及可開關預覽入口。預覽解鎖呈現依已完成銀河的純回顧狀態、聚焦正式回顧選取地圖；切換紀元視圖會關閉舊預覽。正式回顧戰、存檔與進度規則不變。靜態回讀可核對，真機及 E2E 待驗。

- **2026-10-09 施工**：共用 3D engine 新增十區與 100 名 Boss 象徵節點的宇宙星圖場景；正式宇宙紀元冒險與高維紀元的宇宙回顧清單新增 opt-in 預覽按鈕，僅讀取正式 Boss 已擊敗與解鎖 owner，GM 視覺中心新增同工廠「宇宙紀元星圖」。原本 HTML 挑戰、連戰、回顧及紀元鎖定不變。此階段是隔離 Canvas 預覽，不是宇宙全頁 3D 操作或模型 L3；手機、真實回顧 E2E 與效能驗收待補。
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：十區百 Boss、準備、宇宙主線、銀河／宇宙回顧與紀元視圖。
- **完成與自我檢查**：切換與返回保持正式回顧視圖；進度/鎖定不變。
- **狀態**：已提交視覺預覽程式；完整正式 L1 與實機驗收待補。

### 第 07 批｜高維主線與高維回顧
- **2026-10-09 階段施工**：新增十名高維存在 3D 幾何象徵場景（非最終怪物模型），正式高維冒險十王清單提供手動預覽入口；視覺讀取正式第三紀元 Boss snapshot 的已擊破、剩餘生命比例，GM 視覺中心共用相同 scene factory。已擊破王回顧入口與持續 HP 計算仍由正式 owner 控制；完整 L1、真機及 GPU 長時驗收待補。
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：十名高維存在、挑戰準備、持續 HP/限制、核心區、回顧。
- **完成與自我檢查**：高維永久 HP 與挑戰規則只讀、正確顯示。
- **狀態**：已提交 3D 預覽，全面 L1／實機驗收待補。

### 第 08 批｜角色、能力、稱號及突破介面
- **2026-10-09 階段施工**：共用 3D 引擎新增角色全身立體展示佔位場景；正式角色頁 opt-in 預覽、GM 玩家／裝備／養成分類新增共用預覽。正式角色能力、裝備、稱號選擇與突破仍保留 HTML owner、無寫檔操作。真正裝備映射、稱號特效、突破演出與全頁 L1 未完成，需按後續美術與整合批次補做。
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：全身展示佔位、能力與穿戴、稱號挑選／取得、突破通知。
- **完成與自我檢查**：角色身份、數值、稱號狀態與原版一致。
- **狀態**：立體角色展示佔位已提交；全頁 L1、稱號特效與突破動畫未完成。

### 第 09 批｜背包、換裝、鎖定、出售及贖回
- **2026-10-09 階段施工**：增加五槽裝備立體陳列及背包前五件展示樣本；正式背包頁增加可開關預覽，使用正式穿戴及背包只讀資料，不改換裝／鎖定／出售／贖回 owner；GM 新增五槽裝備陳列預覽。此為佔位幾何物件，非最終 GLB／真正裝備外觀、也未完成全頁 L1 改造，實機驗收待辦。
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：裝備陳列、篩選比較、穿戴、回收、返回焦點與跨紀元裝備。
- **完成與自我檢查**：背包與穿戴來源一致；正式裝備與交易流程不變。
- **狀態**：已提交只讀 3D 陳列階段成果；完整 L1、裝備外觀及手機驗收未完成。

### 第 10 批｜裝備強化與確認
- **2026-10-09 階段施工**：五欄位 3D 鍛造台場景及正式強化頁 opt-in 預覽，依正式強化等級、上下限只讀呈現；GM 測試中心加入「強化鍛造台」共用展示。正式 `enhancementui.js` 仍負責消耗估算、確認、強化交易、rollback、存檔及重繪。未建置交易完成後的 3D 成功／失敗動畫或整頁 L1，需後續完成及實機驗證。
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：五欄位鍛造台、消耗預覽、強化確認、成功/失敗視覺。
- **完成與自我檢查**：先正式 transaction 後動畫；資源及強化結果不變。
- **狀態**：五槽 3D 預覽已提交，完整 L1／成功失敗動畫及實機尚待完成。

### 第 11 批｜專精、印記、文明與高維核心
- **2026-10-09 階段施工**：共用 `createGrowthScene` 新增八專精、十印記、文明等級、界弦核心四種立體能量陳列；正式專精頁提供可關閉的唯讀「養成星環」與四種項目切換，資料從既有 `state.specializations`、`state.marks.entries`、`secondWorld.civilizationLevel`、`thirdWorld.coreLevel` 取得，不執行交易。GM 3D 視覺測試中心新增四項視覺情境，僅以 session fixture 調整進度，不顯示工程診斷。正式頁預覽入口同時涵蓋專精頁、銀河／宇宙災厄頁的印記／文明展示，以及高維冒險頁界弦核心；均保持唯讀，原交易按鈕與對話框不變。強化／印記／文明／高維核心正式 owner 未變。
- **限制**：是共用幾何佔位預覽，並非正式各養成子頁完整 L1，更沒有注入／升級效果動畫；跨紀元、完整路由、手機和 GPU 實機驗收尚待補，依第 18、22、26 批規範追蹤。
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：八專精、十印記、宇宙文明等級、界弦核心、注入確認。
- **完成與自我檢查**：狀態與正式養成 owner 一致；無視覺寫入。
- **狀態**：唯讀立體展示階段已施工，正式全頁 L1／真機驗收未完成。

### 第 12 批｜副本首頁、懸賞與一般競技場
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：副本總覽、懸賞選擇、銀河／宇宙競技場選擇及狀態。
- **完成與自我檢查**：次數、獎勵、等級與鎖定條件不變。
- **已施工（2026-10-09）**：共用 `3d-test/prototype-engine.js` 新增 `createDungeonScene`：三種可旋轉、縮放的立體副本視覺場景（副本作戰中心、懸賞戰準備區、一般競技場），依銀河／宇宙紀元切換視覺語彙。正式 `dungeon`、`dungeon-bounty`（僅 ready）及 `dungeon-arena`（select/ready）由 `3d-test/formal-home.js` 在既有 HTML 頁插入可關閉的唯讀 3D 預覽；由 `registerDungeonPostRenderHook` 對接正式副本渲染，每次副本頁重新渲染與跨頁時會釋放舊預覽。GM 原六分類「副本、災厄與特殊演出」新增三個真 3D 視覺項目，測試資料僅用於 GM 預覽。
- **安全界線**：沒有改 `dungeonui.js`、`dungeonbounty.js`、`dungeonarena.js` 或任何正式戰鬥／每日次數／收益／解鎖條件；狀態數值僅用於唯讀視覺。懸賞與競技場進入 combat/result 後不加入第 12 批預覽；完整戰鬥視覺屬第 15 批，高維競技場、鏡像與虛空屬第 13 批。
- **驗收限制**：目前是可開關的真 WebGL 幾何預覽，尚非正式全介面 L1 或最終模型；桌機／手機真機 GPU 長測及正式帳號各階段回歸未驗。依第 18／26／34／40 批分階段驗收。
- **狀態**：已提交第 12 批 3D 預覽與 GM 視覺場景；CI／真機回歸依最新 Actions 與實際證據判定。

- **2026-10-09 高維副本首頁三入口補修**：正式 `thirdworlddungeonui.js` 已明確隱藏高維懸賞戰；共用 `createDungeonScene` 不再固定畫四節點後僅變暗，而是根據正式 `dungeonModeAvailability` 與實際副本 DOM 的可見狀態，僅生成現有模式並自動置中。高維副本 3D 首頁為高維競技場、虛空幻境、鏡像戰三入口；銀河／宇宙保留各自正式可見模式。GM 同一副本作戰中心增加三紀元選擇供驗證，不增加新 GM 場景。此修改僅影響展示，不改解鎖與戰鬥。
### 第 13 批｜高維競技場、鏡像戰及虛空選擇
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：高維競技場陣容／階段、鏡像紀錄、虛空樓層與入口。
- **完成與自我檢查**：各模式多子視圖完整覆蓋；規則不重算。
- **實作（2026-10-09）**：沿用同一 Babylon runtime／共用場景 factory，加入高維競技場三階戰術節點、鏡像戰紀錄映照、虛空樓層進度三種可操作幾何預覽。正式 `dungeon-arena` 高維選擇、`dungeon-mirror` 鏡像頁及 `dungeon-void-mirage` 非戰鬥頁依原有 dungeon post-render hook 出現 opt-in 按鈕；切離頁面、rerender 與進入戰鬥時釋放預覽。GM 「副本、災厄與特殊演出」原分類增加 3 個共用場景（總數 17），不新增分類或內部工程標籤。
- **規則與驗收界線**：三種畫面僅讀正式既有 snapshot（競技場狀態／鏡像歷史最佳勝場／虛空歷史最高），不修改次數、陣容生成、樓層、VIP 積分、HP、戰鬥或存檔；特殊模式戰鬥與結算的整體 3D 化留第 15／35～40 批。現階段僅 opt-in Babylon 幾何預覽，未達最終模型 L1/L2，手機真機 GPU 實測另行依階段驗收。
- **狀態**：第 13 批程式與文件已提交；CI、實機驗收依真實執行證據記錄，不可視為自動完成。

### 第 14 批｜雙紀元文明災厄、異宇宙前線
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：銀河／宇宙災厄封印與現身通知、異宇宙進度/層域。
- **完成與自我檢查**：災厄雙條件、永久 HP 及異宇宙門檻維持。
- **已施工（2026-10-09）**：共用 `3d-test/prototype-engine.js` 新增 `createFrontierScene`，提供銀河文明災厄、宇宙文明災厄及異宇宙前線三種可旋轉、縮放的 Babylon 幾何場景；GM 原六大分類增加 3 個可見場景（累計 20）。正式 `calamity` 的非戰鬥封印首頁與 `alternateuniverse` 的非戰鬥頁增加 opt-in 3D 預覽；異宇宙內部 render 另通知共用橋接以便離開頁面或進戰鬥時關閉與 dispose。
- **界線**：本批為唯讀的進度／層域外觀，不重算災厄雙條件、永久 HP、異宇宙解鎖與失敗門檻，不修改正式戰鬥及存檔；災厄現身通知仍由正式流程呈現，3D 畫面不代替原有提示、門檻或可用性資訊。第 15 批再處理戰鬥 HUD／結果。幾何預覽不代表完成最終模型或手機 GPU 長測。
- **狀態**：第 14 批程式已提交；CI 與真機結果另依實際測試記錄。

### 第 15 批｜所有戰鬥 HUD、特殊遭遇與結算外觀
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：主線／副本／災厄／高維／異宇宙戰場底座、HP盾、結算、掉落、死亡、連戰。
- **完成與自我檢查**：只更換介面；保留 combatfx、Fast Catch-up 與正式 settlement。
- **2026-10-10 實作**：共享 `createBattlePresentationScene` 建立「戰場與生命顯示」「護盾防護演出」「特殊遭遇演出」「結算與戰利品」四個 opt-in Babylon 立體外觀場景；GM 原有「戰鬥、動畫與特效」分類增加 4 個同源可視案例，總數由 20 增至 24。正式頁面在可辨識的戰鬥、特殊遭遇與結果容器附近提供選用的 3D 外觀預覽；不攔截戰鬥流程。
- **安全與交付界線**：此批保留原本 HUD、HP/護盾即時更新、戰鬥結算、死亡贖回、掉落清單、連戰與 Fast Catch-up；3D 場景是獨立只讀幾何視覺原型，並未替換所有模式的正式 2D HUD 或導入最終 GLB。第 18 批需逐模式檢查所有正式路由（含無標準容器的特殊結算），後續 A2/B 批精修模型、動畫與材質；手機 GPU 長測另依第 26/34/40 批執行。
- **狀態**：第 15 批視覺原型與正式可選入口已施工；CI／手機實機結果依最新 Actions 及實際測試判定。

### 第 16 批｜正式劇情、戰線紀錄與轉生介面
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：劇情閱讀、各紀元紀錄／回顧、轉生條件／確認／結果。
- **完成與自我檢查**：文字完整、不可逆警示清楚；正式轉生交易不變。
- **狀態**：已完成視覺幾何預覽與正式文字頁接點施工；完整 L1／L2、不可逆交易與實機驗收仍須第 18／40 批核驗，不能視為完成最終 3D 模式。

### 第 17 批｜設定、說明、帳號、雲端與 GM 全子頁
- **非視覺批次驗收責任**：本批不須在 GM 3D 測試中心建立獨立測試項目；透過自動化、正式流程與實機驗收交付。若涉及既有 3D 外觀，僅更新原有預覽，不新增工程診斷選單。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：設定、說明、自動處理、雲端／帳號、GM 管理／sandbox／診斷。
- **完成與自我檢查**：GM 授權與延遲載入不變；所有資料工具可用。
- **狀態**：17-A 後加的雙模式基礎已施工；17-B 原定設定／說明／帳號／雲端／GM 全子頁之唯讀 3D 場景與入口已施工。瀏覽器實機驗收待第 18 批，完整可獨立操作的 3D 模式仍需第 19～40 批。

### 第 18 批｜A1 全介面覆蓋總驗收
- **非視覺批次驗收責任**：本批不須在 GM 3D 測試中心建立獨立測試項目；透過自動化、正式流程與實機驗收交付。若涉及既有 3D 外觀，僅更新原有預覽，不新增工程診斷選單。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：所有可見路由、子視圖、空/鎖定/完成狀態、Modal 與手機逐項巡檢。
- **完成與自我檢查**：全部正式介面達 L1，常用介面 L2；交付覆蓋報告。
- **狀態**：已新增 Runtime Integrity 靜態覆蓋守衛與逐頁矩陣，但真實瀏覽器／手機各路由驗收及 exact-HEAD CI 尚未完成，A1 總驗收未結案。

## A2｜各功能 3D 場景與互動精修（8 批）

在 A1 路由與 Canvas 底座上完成差異化的真 3D 場景、互動與視覺品質，不只換靜態圖。

### 第 19 批｜三紀元指揮中心與紀元場景精修
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：銀河軍事、宇宙暗能量、高維幾何、艦隊與紀元門。
- **完成與自我檢查**：不同紀元一眼可辨；手機不卡頓。
- **狀態**：共用場景工廠已完成第 19 批三紀元差異化施工：銀河軍事平台、艦隊與軌道塔；宇宙暗能量核心、三層環與錨點；高維多層幾何門、核心與碎片。正式首頁與 GM『三紀元主畫面』共用 `createEpochScene`，沒有新增重複 GM 案例；維持唯讀、低物件數與既有 3D 按需載入。程式已提交，真實手機 GPU／跨紀元操作驗收待補。

### 第 20 批｜全宇宙星圖及回顧導航精修
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：三紀元星圖、區域節點、鎖定／完成、動態相機。
- **完成與自我檢查**：觸控節點清楚、不可解鎖不誤觸。
- **狀態**：已施工：銀河區域的聚焦環、完成/未解鎖材質；宇宙十區百王依正式擊敗資料呈現完成狀態與目前區域聚焦；高維十存在聚焦環，三紀元相機增補桌機/觸控縮放及慣性設定。正式頁與 GM 仍共用 3D 場景工廠，僅唯讀呈現，不將幾何點擊作為正式導航或解鎖條件；正式回顧仍由原頁面操作。程式施工已完成，手機真機互動、CPU/GPU 與跨紀元全覆蓋驗收仍待實測。

### 第 21 批｜角色展示室、武器陳列及背包預覽精修
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：轉台、聚焦、旋轉與縮放、共用模型預覽。
- **完成與自我檢查**：同一外觀跨頁一致；長武器不裁切。
- **狀態**：已完成共用預覽場景階段施工：角色及五槽裝備共用受限旋轉、縮放與鏡頭慣性設定；裝備陳列的武器欄位改為長形幾何展示並增加護手、刀尖及跨紀元色彩點綴；保留正式外觀快照作為正式頁及 GM 預覽的共同來源。正式交易、換裝、鎖定、出售與存檔均未更動。此為 L2 幾何展示優化，正式高品質人物與武器模型留待第 27～34 批；真實手機 GPU、旋轉及長武器裁切仍須實機驗收。

### 第 22 批｜強化工坊、八專精與印記能量陣列
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：真 3D 裝置、節點聚焦、鍛造效果、封印與文明核心。
- **完成與自我檢查**：動效不等待正式 transaction；觸控舒適。
- **狀態**：已完成共用幾何視覺精修：五槽鍛造台依唯讀強化快照呈現進度柱與能源轉動，八專精與十印記依各自等級呈現節點比例、能量柱與封印環，文明等級／高維核心沿用十階視覺並新增分層能量效果。鏡頭調整為共用觸控旋轉與縮放設定，GM 沿用原有場景不加重複項目。未改動正式養成交易與存檔，並未建立真正的成功／失敗 transaction 動畫；手機與 WebGL 真實驗收待補。

### 第 23 批｜副本中心、鏡像、虛空及競技場
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：不同傳送門、鏡面、競技場與虛空空間。
- **完成與自我檢查**：各入口景深、狀態與解鎖正確。
- **狀態**：已施工：共用副本場景依懸賞、競技場、虛空、鏡像生成各自不同的傳送門裝置；進階副本場景增加鏡面與對手象徵、虛空深度階梯、高維競技場階段標誌。共用觸控相機縮放與角度限制。正式原有解鎖、挑戰、結算及回顧操作仍由既有 owner 控制，3D 只讀視覺並不提供未授權入口。GM 沿用既有場景，不增加重複案例。尚須桌機/手機實機、各紀元狀態和 WebGL 效能驗收。

### 第 24 批｜雙紀元災厄與異宇宙／高維環境
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：巨型災厄封印、異宇宙層域、維度破裂與核心。
- **完成與自我檢查**：永久 HP／解鎖與來源紀元視覺相符。
- **狀態**：未開始。

### 第 25 批｜劇情、戰線紀錄、轉生及特殊演出
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：全息資料庫、重要劇情、紀元切換／轉生非阻塞短演出。
- **完成與自我檢查**：可跳過、警示不遮蓋、回顧可讀。
- **狀態**：未開始。

### 第 26 批｜A2 場景效能、鏡頭與質感驗收
- **手機 GPU 長測責任**：依「手機 GPU／記憶體分階段驗收安排」執行當批場景的第一次 30 分鐘長測、切換、記憶體／WebGL 資源及回退觀察，留下裝置、版本和結果紀錄。
- **非視覺批次驗收責任**：本批不須在 GM 3D 測試中心建立獨立測試項目；透過自動化、正式流程與實機驗收交付。若涉及既有 3D 外觀，僅更新原有預覽，不新增工程診斷選單。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：材質、光影、LOD、場景 cache、手機比例與轉場。
- **完成與自我檢查**：全場景 L2，無大規模 GPU/DOM 泄漏。
- **狀態**：未開始。

## B｜高品質人物／裝備／怪物素材（8 批）

單一共用人形骨架、正式五裝備槽、素材來源可追溯；同庫保留可重製的來源與最佳化 GLB。

### 第 27 批｜第一名玩家正式人形與骨架
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：Blender 共用人形 1.9m、rig、頭／武器／背部掛點、基礎姿勢。
- **完成與自我檢查**：角色頁與指揮中心共用；骨架與比例符合契約。
- **狀態**：未開始。

### 第 28 批｜五裝備欄位模組化換裝
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：weapon/helmet/armor/shoes/accessory；鎧甲子部件隨同一正式 armor 變化。
- **完成與自我檢查**：換裝、卸下、跨紀元穿戴都與正式 state 相符。
- **狀態**：未開始。

### 第 29 批｜銀河／宇宙／高維三套裝甲資產族
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：每紀元基礎款式與材質／品質變體，先保證同骨架。
- **完成與自我檢查**：裝甲不穿模、來源紀元判定不依目前所在地。
- **狀態**：未開始。

### 第 30 批｜近戰／遠程武器家族與名稱映射
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：短刃、長戟、炮槍等起步；擴充三紀元武器家族，正式名稱登錄表。
- **完成與自我檢查**：不以含「槍」字盲判遠程；握持與尺寸正確。
- **狀態**：未開始。

### 第 31 批｜玩家動畫庫與持武器姿勢
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：Idle、Move、Attack、Counter、Dodge、Hit、Death；依武器家族動作。
- **完成與自我檢查**：動畫標記、握持錨點及中斷可用。
- **狀態**：未開始。

### 第 32 批｜怪物基礎模型前五家族
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：人形、巨型機甲、四足機械獸、無人機、裝甲載具。
- **完成與自我檢查**：模型錨點、攻擊與受擊演出可用。
- **狀態**：未開始。

### 第 33 批｜怪物其餘家族、特殊與高維 Boss
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：戰艦、機械核心、異星／能量／高維存在及特殊變體。
- **完成與自我檢查**：可覆蓋正式怪物 ID；高維專屬差異存在。
- **狀態**：未開始。

### 第 34 批｜B 資產完整性、授權與手機模型驗收
- **正式模型手機複測責任**：GLB／LOD／貼圖／動畫引入後重新做手機資源與長時間穩定度測試，不沿用第 26 批佔位場景數據代表最終模型。
- **非視覺批次驗收責任**：本批不須在 GM 3D 測試中心建立獨立測試項目；透過自動化、正式流程與實機驗收交付。若涉及既有 3D 外觀，僅更新原有預覽，不新增工程診斷選單。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：GLB manifest、license、來源工程、LOD、貼圖、性能與展示一致性。
- **完成與自我檢查**：檔案可驗、授權允許公開部署、手機資源安全。
- **狀態**：未開始。

## C｜全部正式模式動態 3D 戰鬥（6 批）

只消費正式戰鬥事件及 HP／護盾快照，不重新結算、改獎勵或更改目標權威。

### 第 35 批｜正式戰鬥事件唯讀橋接
- **非視覺批次驗收責任**：本批不須在 GM 3D 測試中心建立獨立測試項目；透過自動化、正式流程與實機驗收交付。若涉及既有 3D 外觀，僅更新原有預覽，不新增工程診斷選單。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：combatcore/combatfx/各模式事件契約、actor/target、HP/盾/mark/crit/combo/counter。
- **完成與自我檢查**：固定事件與原版結果一致；禁第二套數值推導。
- **狀態**：未開始。

### 第 36 批｜玩家與怪物攻防動畫、鏡頭與特效
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：近／遠程、反擊、閃避、暴擊、命中標記、戰艦遠景。
- **完成與自我檢查**：畫面命中與正式事件同步，不卡動畫。
- **狀態**：未開始。

### 第 37 批｜銀河／宇宙主線、回顧與特殊遭遇
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：一般、菁英、Boss、回顧、特殊怪、主線連戰。
- **完成與自我檢查**：Target Context 保持正式權威；全路徑回退。
- **狀態**：未開始。

### 第 38 批｜所有副本與雙紀元災厄戰鬥整合
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：懸賞、銀河／宇宙／高維競技場、鏡像、虛空、文明災厄。
- **完成與自我檢查**：模式差異與 settlement 不變；死亡／中止正常。
- **狀態**：未開始。

### 第 39 批｜高維持續戰、異宇宙與高速補播
- **GM 視覺預覽責任**：若本批新增可獨立觀察的 3D 場景、模型、動作或特效，需同步更新既有 GM 3D 視覺預覽；無新視覺時不加重複選單。場景只顯示使用者可理解的名稱及畫面參數，內部 ID／批號／技術診斷留在測試與文件。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：高維永久 HP、異宇宙、背景連戰、倍速、Fast Catch-up。
- **完成與自我檢查**：3D 不拖慢連戰、不污染離線樣本，能跳幀同步。
- **狀態**：未開始。

### 第 40 批｜全遊戲最終驗收與正式啟用決策
- **手機最終壓測責任**：將所有正式 3D 頁面、戰鬥模式、回顧、前後台恢復、長時間使用及 HTML 回退一併驗收並記錄證據。
- **非視覺批次驗收責任**：本批不須在 GM 3D 測試中心建立獨立測試項目；透過自動化、正式流程與實機驗收交付。若涉及既有 3D 外觀，僅更新原有預覽，不新增工程診斷選單。詳見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。
- **施工範圍**：三紀元、轉生/舊檔、手機 30min、所有路由/Modal、雲端、GM、回退、Integrity。
- **完成與自我檢查**：全部必驗案例通過；分級啟用與回退可操作。
- **狀態**：未開始。

## 5. 共通實作架構與素材契約

- 共用 Babylon.js 引擎／Canvas；Canvas 與 `#main.innerHTML` 分離；場景 epoch、載入取消、GPU dispose、資產快取、手機 safe-area、可停用 3D。
- 六個場景系統：指揮中心、宇宙探索、角色裝備、副本挑戰、戰鬥、超維特殊演出。可配置多場景變體，不是六張靜態背景圖。
- 人形玩家骨架一套、身高約 1.9 場景單位；裝備 `weapon/helmet/armor/shoes/accessory` 完全沿用正式五欄位；角色／背包／工坊／戰鬥共用外觀映射。
- GLB/glTF 2.0、PBR、明確 asset manifest、來源授權與可重製 Blender 工程／生成腳本；展示 LOD 與手機 LOD 同骨架。
- 怪物模型規劃十家族、基礎 24 模型：人形3、機甲2、機械獸2、無人機2、載具2、戰艦3、核心2、異星3、能量2、高維3。這是素材規模目標，非現成資產。
- 每個戰鬥模型具 `root/target_center/hit_primary/attack_origin/fx_center` 等視覺錨點；命中／受擊定位不可變成新傷害系統。
- Prototype 可先在 `/3d-test/` 使用假資料驗證場景，但它是開發手段，不取代 A1 全正式介面優先；正式畫面分批接入且保留原版。

## 6. 每批必跑的自我檢查

1. 靜態語法、載入順序、資產 manifest 引用與缺檔檢查；production 變更更新 cache-bust。
2. 受影響正式頁面／子頁／Modal 的**實際可操作驗證**：返回、切換紀元、未解鎖／空／已完成、快速切頁；不能只看截圖。
3. 3D 關閉、WebGL 失敗、GLB 載入失敗的原版回退；不得黑屏或卡住導航。
4. 正式 state snapshot / save diff；無規劃外的存檔寫入、資源消耗或戰鬥結果差異。
5. 手機直向／橫向、桌機、Safe Area、字體、觸控、長武器裁切、控制鈕遮擋及頁面捲動。
6. 連戰、背景切換、快補播及資源釋放；正式整合批次需驗證戰鬥速度與結算一致。
7. 跑相關 Integrity／runtime tests；查看 exact HEAD 的 CI 證據，沒有結果就如實回報未驗證。
8. 每批完成後在本檔該批留下「完成日期、commit、測試、限制」，**切勿只憑口頭說已完成**。


## 6A. 追加正式功能覆蓋與逐批驗收契約（2026-10-09，強制適用未完工批次）

> 這是既有 40 批的 **must-pass 驗收補充**，不是第 41 批。每批施工前依下表相關編號 fresh-read 正式 owner，產出「原版功能 → 新 3D 呈現 → 狀態 → 結果 → 測試證據」清單；若未通過不得標記完整驗收。

| 編號 | 原版功能／補強項目 | 對應批次 | 必須驗收的內容 |
|---|---|---|---|
| R01 | 名稱、稱號與怪物身分 | 08/15/35-39 | 玩家名稱及 46 種既有正式稱號、怪物名稱依正式 owner；戰鬥用 playerIdentityNameHtml({compact:true}) 或其正式演進 owner，保留 CSS 光暈/殘影；所有戰鬥模式同源，長名稱不蓋 HP。 |
| R02 | 全部玩家能力 | 08/15/35 | HP/ATK/DEF/暴擊/閃避/VIP/突破/文明及裝備、印記等顯示只讀正式快照，對照 2D。 |
| R03 | 觸發技能浮字 | 15/35-39 | 先制/連擊/穿透/反擊/汲取/閃避/暴擊/護盾等事件文字、顏色與 actor/target 來源一致，不以動畫猜測。 |
| R04 | HP、護盾、永久 HP | 07/15/35-39 | 雙方 HP、白色護盾覆蓋、數值同步；高維 Boss 永久血量 formalStartHp → combatEndHp → delta，含回顧。 |
| R05 | 結算、掉落、死亡 | 15/37-40 | 單場/連戰勝敗、經驗/貨幣/VIP/掉落、死亡裝備遺失/保護/贖回、結算確認及中止情境。 |
| R06 | 三紀元貨幣材料 | 08-17/40 | 金幣/暗物質/各強化石/暗能量/其他高維資源的名稱、數量、價格與不足提示對上當前正式 owner。 |
| R07 | 全域通知及 Modal | 03/04/18/40 | 解鎖/完成/紀元進入/災厄出現/交易確認/登入錯誤/戰鬥結果/死亡等動態視窗、焦點與返回路徑。 |
| R08 | 完整頁面、子頁、狀態清單 | 03-18/40 | 逐頁紀錄 route、子頁、Modal、動態狀態與 owner；空/鎖定/進行中/完成/回顧/出錯逐項驗收，不得只點主入口。 |
| R09 | GM sandbox 與正式授權 | 17/40 | GM 管理與測試沙盒分隔，授權與 lazy-loading 正常，測試不寫正式 save，不繞過既有 transaction。 |
| R10 | 2D/3D 故障回退 | 02/18/26/40 | 無 WebGL/素材載入失敗/context lost/低記憶體/快速切頁/掛機等均可恢復原版導航與操作，並有故障演練。 |
| R11 | 裝備品質、評分及詞條 | 09/21/28-30 | 六種品質、詞條/數值、裝備評分、強化階與比較標示都須與正式 UI 一致。 |
| R12 | 裝備鎖定及自動處理 | 09/17/40 | 鎖定、自動出售、強裝備自動保留、篩選及批次操作不能被 3D 預覽干擾。 |
| R13 | 死亡遺失、贖回、放棄 | 09/15/40 | 免費贖回、各紀元贖回價格、放棄永久刪除的警告與交易結果都維持原規則。 |
| R14 | 離線收益 | 03/17/39/40 | 有效樣本/無樣本、離線時間/收益/12 小時上限、紀元/倍速差異；3D 裝載與頁面切換不得造成二次結算或重寫樣本。 |
| R15 | 每日次數與重置 | 12/13/18/40 | 懸賞/競技場/鏡像/虛空的每日次數、重置、已領取及用完狀態；依正式 daily owner，勿以視覺倒數重算。 |
| R16 | 競技場三連戰 | 13/38 | 三連戰順序、場間不回血、結算及提前中止，3D 動畫不拖住 core。 |
| R17 | 鏡像戰特殊顯示 | 13/15/38 | 鏡像對手/連勝/稱號、每日進度及正式 settlement 的事件和特殊結果，對照原版。 |
| R18 | 虛空無限樓層 | 13/23/38 | 高層數、無限爬塔、每日 VIP 獎勵、連續挑戰、死亡與返回顯示。 |
| R19 | 特殊怪完整事件 | 14/15/33/37 | 9 種特殊遭遇不只換模型；觸發來源、事件選項、能力與特殊收益、提示全部覆蓋。 |
| R20 | 三紀元與轉生輪差異 | 04-07/16/40 | 首輪/重征服/向下回填/紀元切換/不可回顧的異宇宙/永久入口等依正式 owner 顯示。 |
| R21 | 玩家改名規則 | 08/17 | 修改名字、長字串、非法字元、稱號組合與手機換行；規則取 playernamerules.js 正式 owner。 |
| R22 | VIP 等級與特權 | 08/11/17 | VIP 積分、等級、VIP2～20特權、VIP20以上僅基本能力延伸，不能新增假特權。 |
| R23 | 桌機、手機交互 | 02/18/26/40 | 滑鼠/觸控/返回/快速切頁/捲動、鏡頭手勢衝突、焦點恢復及旋轉螢幕。 |
| R24 | UI 遮擋與安全區 | 03-18/40 | 名稱/稱號/血條/底部導航/Modal/虛擬安全區均不遮擋；直橫向與極短手機比例驗收。 |
| R25 | 三紀元視覺辨識 | 04-07/19/24/29 | 銀河/宇宙/高維及異宇宙的資源、敵人、光效、場景差異與名稱一致。 |
| R26 | 模型與正式裝備同步 | 09/21/28-31 | 穿戴/卸除/強化/轉生/跨紀元/背包/角色/戰鬥使用單一正式裝備映射；無已卸下殘影。 |
| R27 | 倍速與快速補播 | 15/35-39 | 1×/1.5×/GM2×、背景、自動連戰、Fast Catch-up 可跳過特效，戰鬥結果與離線樣本不變。 |
| R28 | 完整說明與教學 | 17/18 | 既有遊戲指南、三紀元規則、副本條件、回顧說明均可由原位置或新入口完整閱讀。 |
| R29 | 本機/雲端/資料匯出入 | 17/40 | 備份/讀寫/匯入匯出/錯誤/登入/切帳號的確認提示完整；3D 不觸發額外存檔。 |
| R30 | 素材及長期效能 | 26/34/40 | GLB/貼圖/授權/可重製工程、LOD、GPU context/資產釋放、手機 30 分鐘以上與故障回退記錄。 |

### 五項全域硬性驗收規範

1. **唯一正式 owner**：名稱/稱號/怪物/裝備/戰鬥/資源/進度/離線/轉生/GM 一律唯讀正式資料，不新增 3D 公式、Save Schema root 或交易入口。
2. **2D ↔ 3D 一致性**：同一正式存檔的所有文字、數值、條件、名稱、獎勵、進度、結果有可核查逐項對照；顯示可變、事實不可變。
3. **頁面 × 狀態覆蓋矩陣**：每批 03～18 必須列出該批正式 route、子頁、modal、入口、返回、鎖定、空值、有值、進行中、完成、回顧、轉生輪等適用狀態；新頁面同步納入清單。
4. **動畫不得成為規則**：卡頓、GPU失效、跳動畫、倍速、連戰與背景戰鬥不可改寫/等待正式結算。所有視覺 callback 不得執行 save/交易/傷害計算。
5. **實測才能完驗**：靜態檢查和 GitHub diff ≠ 瀏覽器可用；至少執行手動或自動瀏覽器互動、手機模擬與實機抽測、WebGL 失敗、保存 state diff、exact HEAD CI 證據；無證據一律記待驗。

### 三個階段的強制結案門檻

- **第 18 批**：須提供第 03～18 批的「route/子頁/Modal/狀態」完整清單，R01～R29 涉及 UI 的每一項均有可用證據；不能只憑畫面圖片。
- **第 34 批**：須提供所有正式怪物 ID → 模型族、正式裝備 ID → 可見部件、授權/LOD/缺件降級映射的完整 manifest；R11/R19/R25/R26/R30 有證據。
- **第 40 批**：須逐模式檢查名稱/稱號/能力/HP盾/技能浮字/結算/死亡/離線/GM/雲端/轉生/速度；R01～R30 及五項硬性規範全部簽核；任一未達只能標「待驗」，不得宣稱 40 批全面完成。

### 第 01～02 批現況差距與待補義務（不追溯宣稱已通過）

- **已提交**：獨立 `3d-test/` Babylon 基礎、GM 同頁 iframe 測試入口、runtime root/canvas、scene epoch、畫質調整、dispose callback、fallback UI；這些是原型程式建置，不是正式全介面覆蓋。
- **B01-G1：引擎存放**：Babylon.js 7.54.3 目前仍使用外部 jsDelivr，未符合「所有必要正式資源存 GitHub」的正式部署門檻；在正式頁面使用之前必須本地化、固定 hash 與授權。
- **B01-G2：真實操作**：GM 入口/退出原畫面（含捲動/焦點/表單）、首次/重新進入、WebGL 無法使用、網路中斷、手機直橫向尚無瀏覽器與真機通過證據。
- **B02-G1：正式 host / scene router**：目前共用 Canvas 僅存在測試頁/iframe 的 host；**尚未**嵌入正式頁面、沒有和正式 `go/render` route owner 對接。應在第 03 批接入，且須保持 `#main.innerHTML` 之外、可開關與 2D fallback。
- **B02-G2：取消與 GPU cache**：現有 epoch 只否決過期 scene 採用，無 AbortController 取消實際 GLB/貼圖載入；現有 `assets` Map 只 clear reference，沒有正式 asset refcount/texture disposal、context loss/recovery 壓力測試。隨第 03 批正式整合/第 26 批效能驗收補齊，在 B02 測試回歸亦須加測。
- **B02-G3：引擎及場景回退**：程式具 startup/render fallback，但 WebGL context lost、重入/切頁 race、draw loop/DOM/GPU 釋放與復原尚未作實際故障注入/長時測試；第 03、18、26、40 批追蹤。
- **R01～R30 的其他功能**：例如稱號、全部怪物名稱、背包、離線收益、正式戰鬥 UI 等，原本就屬後續批次，不能反向判作前兩批完成或漏實作。前兩批的「已施工」不等於這些功能「已驗收」。
- **追蹤規則**：後續在正式主畫面啟用 3D 之前先通過 B01-G1、B02-G1 的最小可用門檻；所有尚未完成的 B01/B02 缺口須在相應指定批次補測並記錄，不准在第 40 批才首次發現。

### 2026-10-09｜第 01～02 批缺口提前補修（實作／驗收狀態）

- **B01-G1 部分未完成**：原型仍載入外部 jsDelivr 固定版 Babylon.js 7.54.3，尚未真正將引擎 JS 及公開部署所需 license 檔以 bytes 提交至同一 GitHub repo。**不得宣稱完成本地化或封閉外部依賴**；正式開放 3D 前為阻擋條件。
- **B01-G2 部分補修／實測仍待**：`gm3dprototype.js` 新增退出還原 scrollX/Y、iframe 內 Esc 關閉；`3d-test/index.html` 新增「測試 WebGL 中斷」故障注入控制。尚無真實瀏覽器／手機測試結果，不能宣稱已通過。
- **B02-G1 部分補修**：正式 `index.html` 新增 `#civilization3dFormalHost`，設在 `#main` 外、預設 `hidden`/`aria-hidden`，並載入唯讀共用 `3d-test/runtime.js`；但**尚未接上正式路由、scene factory 或開關**，預設完全不渲染 3D。正式頁面導入仍屬第 03 批。
- **B02-G2 部分補修**：`3d-test/runtime.js` 新增 AbortController 給非同步 scene factory 的 `signal`、切場景／停用時中止並失效 epoch、asset Map 清空時呼叫可用 `dispose()`。這提供 cancellation contract，**不保證未來 GLB loader 會遵守 signal**；仍缺 per-asset refcount 與實測 GPU profiler 驗證。
- **B02-G3 部分補修**：runtime 加入 `webglcontextlost` 停止及 fallback 通知、`webglcontextrestored` callback，測試頁有故障注入按鈕；但自動還原場景、手機長時間掛機及高頻重入壓測仍未驗收。
- 以上改動未修改正式戰鬥、存檔或進度，亦未宣稱通過無法執行的實機驗收；使用者要求的五類缺口均已處理可安全完成的程式基礎，**尚餘本地化、正式路由整合、真實測試三大阻擋事項**。
- 程式 commits：`3522f287bc6243cd32a039fd8b84fd7acffee8f8`、`b80da7bf5f1a92dfeddb9734da95b363c6be0502`、`ecf8f4e2df34dfc030655c2565055b0fcd3d3010`、`2fda9c306eab8e519a93f98a2b099ef26113a7d3`。僅程式碼及 GitHub 檔案回讀驗證；exact HEAD CI/瀏覽器實測待查。


### 2026-10-09｜第 01～03 批基礎架構收尾（使用者指定四項）

- **本次已施工**：runtime 防重入、engine stop/dispose 次序及 WebGL context-lost fail-closed；原型測試頁中斷後可按「重新啟動」重新建立獨立 runtime，並清除舊 host children；GM iframe 與主遊戲原畫面之間採同源／source 驗證的 close 訊息，返回時還原 window 與 #main scroll、焦點；正式首頁 3D 預覽關閉／切頁／錯誤的 runtime 清理及新版本 cache bust。
- **B01-G1 尚未完成，阻擋正式啟用**：無法取得可信的 Babylon.js 7.54.3 完整發行檔 bytes，故尚未提交引擎與其授權文件到 repo。未製造空白/仿冒 vendor 檔，不得宣稱本地化或外部 CDN 已移除。下一次可取得資產後，應先驗證來源、hash、授權，再將獨立測試頁和正式 home loader 同時改指本地資產。
- **B01-G2 部分完成**：GM return、再進入、Esc 處理有程式保護；尚無真實操作及手機實測證據，未完全結案。
- **B02-G1 部分完成**：正式首頁 opt-in 3D 預覽已接入獨立 Canvas，其他 route、登入與完整首頁 L1 仍屬後續正式介面批次；不是全面接入。
- **B02-G2 部分完成**：現有 lifecycle / AbortSignal 具安全入口，未實際測試 GLB 取消；refcount 與 GPU profiler 隨 26/34 批資產建成後驗證。
- **B02-G3 部分完成**：context loss 轉安全模式、測試頁可手動重建 engine；但 WebGL restoration 在實機及長時間壓力測試尚待驗證。
- **驗收限制**：本次僅 GitHub 原始檔回讀、靜態檢查與差異核對；無可信的瀏覽器/手機操作、GPU instrumentation 或 current HEAD CI 通過證據，不應標示「四項均完整驗收」。正式戰鬥、state、Save Schema 17、GM 結算未更動。
- **主要程式 commits**：`7bf64ac4c61a5d5ec801c055bbe46808952a74d2`、`a73bf889bcbe6938e0466365de2c343a019edcf1`、`c447f83351043a0ce6b29319f3e47f8a31bc92bf`、`e46165b6b5bd313fbe35117042137fb7ebd2a0de`、`9faa1c3b1ecd1787491ea8e63e0c370593a2f0bb`。


### 2026-10-09｜Babylon.js 7.54.3 官方發行檔本地化：完成

- GitHub Actions `Vendor Babylon.js 7.54.3` 由官方 npm registry 下載 `babylonjs@7.54.3`，先與 npm `dist.integrity`（SHA-512）逐 byte 核對，後確認 package name/version/license。
- 已存入 `vendor/babylonjs/7.54.3/babylon.js`（6,794,120 bytes）、`LICENSE`、`SOURCE.md`。SHA-256（babylon.js）：`420088fc4c31c22591703ce207c7736f15419faa556b0678d28f71dbf7ea523a`；license hash 與來源載於 SOURCE.md。
- 正式主畫面預覽 `3d-test/formal-home.js` 和 GM 測試 `3d-test/index.html` 已改本地相對路徑；`index.html` 已刷新 formal-home cache-bust。GitHub Action 的 acquire/verify, switch, commit 步驟均成功，資產與入口已從 current main 回讀。
- **B01-G1 本地化程式與資產已完成**；保留手動進出、WebGL 中斷、手機／瀏覽器 E2E 和完整 40 批正式 UI 接入之獨立驗收義務。不能把 workflow 及靜態 GitHub 驗證等同裝置測試。
- 執行證據：[GitHub Actions run 37892987459](https://github.com/franksky1207/rpg/actions/runs/37892987459)；自動 vendor+改路徑 commit `51492689189566b053b3dd3e637d345aa22c34e7`，SOURCE.md 排版修正 `97fd23894de22b077579441716fb8fd15c75b9c0`。

## 6B. GM 3D 測試中心（2026-10-09 使用者重新定案）

**GM 是 3D 視覺成果展示／驗收中心，不是引擎診斷工具。** 使用者只需看到可觀看的場景、角色、裝備、怪物、動作、特效。保留六個視覺分類（主畫面與紀元場景／冒險與宇宙地圖／玩家裝備養成／怪物與 Boss 模型／戰鬥動畫特效／副本災厄特殊演出），當前 B01～B05 僅有「三紀元主畫面」與「銀河紀元星圖」兩個共用真實工廠的視覺入口；未來沒有可預覽的分類保持空清單，不做假場景。

**不顯示**：Bxx 編號、場景內部 ID、引擎／Canvas／WebGL 版本、開發進度標籤、無必要技術敘述。僅讓 GM 選場景、調整影響畫面的參數、旋轉／縮放／最大化。需要載入失敗時顯示易懂提示即可。技術檢查保留在程式／GitHub Actions，不給使用者診斷目錄。

**各批分工**：B03～B16、B19～B25、B27～B33、B36～B39 須交付或更新可見的 3D 視覺預覽（B15／B16 僅視覺部分）；B01、B02、B17、B18、B26、B34、B35、B40 不需建立 GM 獨立場景，由測試與正式遊戲驗收。若不同批次精修同一場景，更新原預覽而不是增加重複清單。

**手機**：最大化切回標準時必須定位回當前預覽畫面，不得跳到上方分類，亦不得重建 Canvas／重置鏡頭；測試手機直式、橫式和實際 safe-area。

**原有 40 批的 GM 強制逐批新增案例規範已被此 6B 新版取代**，任何舊版文字與本節衝突以本節為準。完整分類、40 批一對一歸屬見 [3D_GM_TEST_CENTER_CATALOG.md](3D_GM_TEST_CENTER_CATALOG.md)。

## 7. 新對話可直接複製的指令

```text
請讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md 和 3D_IMPLEMENTATION_PLAN.md，
並重新檢查 GitHub main 中與《文明戰線》3D 工程第 N 批有關的正式程式碼。
只執行第 N 批，直接修改 main，完成後自我檢查。
不得變更正式戰鬥、養成、交易、進度與存檔規則；JS/CSS 要更新 index.html cache-bust。
執行時必須符合第 6A 節 R01～R30 覆蓋矩陣及前批待補義務；驗收完成後，更新 3D_IMPLEMENTATION_PLAN.md 的該批狀態與 PROJECT_HANDOFF.md 交接，回報 commit 與測試結果。
```

## 7A. 第 01 批追加：GM 同頁 3D 測試入口（2026-10-09）

- 正式入口：GM 模式 → 測試 → 「3D 場景測試」 → 「進入 3D 測試」。
- `gmhubextensions.js` 使用既有 GM section registry，新增 `gm-3d-prototype-test`；`gm3dprototype.js` 隨既有授權 GM lazy group 載入。
- 使用全螢幕覆蓋層與同源 iframe `3d-test/?embedded=1`，保留底下原有 DOM、GM tab／section 狀態、捲動位置、輸入及玩家 runtime，不呼叫 `render()`、`go()` 或 `location.reload()`。
- 「返回原本畫面」及 Esc 會移除 iframe；原型 `pagehide` 清理 Babylon 引擎。GM 權限以既有 `state.gm===true` 檢查。嵌入模式隱藏獨立頁面返回正式遊戲連結。
- 更新正式 `index.html` 的 GM lazy script 引用及 `gmhubextensions.js` cache-bust；未更動正式存檔、戰鬥 owner。
- 施工 commits：`fe1fb8105e6de99994719ccd67e072b50c43dd2a`、`a10949acbd5e21cc1c95297e1bdeaa03f577a02e`、`f53317f4f0376cf312cec42a5e735c4ac7549210`、`a7f058b5f9f73c41920c7e8f55405f38f75fdc15`。
- GitHub 檔案回讀及靜態核對完成；瀏覽器互動／手機與 exact HEAD CI 仍未取得驗證證據。

## 8. 版本與計畫狀態

- 2026-10-09：首次建立 40 批規劃。
- 2026-10-09：第 01 批獨立 3D prototype 程式已提交；瀏覽器／手機與 CI 驗證待補。第 02 批共用 runtime 已施工（實機待驗）；第 03 批預覽接入程式已提交（尚未全驗收），第 04～15 批後續已提交預覽施工，第 16～40 批未開始（此行歷史紀錄已依 2026-10-10 現況更正）。
- 若後續 main 的正式功能新增／刪除，先更新介面覆蓋表與依賴，再調整未開始批次；不要讓這份計畫凌駕實碼。

- **2026-10-09 共用 3D 大小模式**：`3d-test/runtime.js` 新增「放大視窗／還原視窗／關閉」操作（原 ＋／－／視角重置保留），直接切換 host class，不建立新場景／相機，並呼叫 engine.resize；`3d-test/preview-expand.css` 桌機中央寬約 85vw、高 80dvh、手機直式寬 95vw／高 88dvh、橫式矮螢幕 94vw／92dvh，沒有強制旋轉。`3d-test/formal-home.js` 關閉走正式 bridge；`index.html` 已更新快取。Chromium 專屬測試增加 class 與 Canvas/Camera identity 驗證；真機手機、桌機視覺布局仍須人工確認。
