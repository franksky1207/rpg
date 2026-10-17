# 《文明戰線》舊210套美術體系徹底清理總計畫（四批）
日期：2026-10-17。狀態：**第1～3批及第4-1～4-3批已在獨立鏈式施工分支處理；第4-3批 Draft PR #13 的六項 Actions 成功，第4-4批 Draft PR #14 正在進行最終清理與驗收。尚未合併正式 main，不能視為正式 main 已刪檔。** 儲存庫：`franksky1207/rpg`；正式程式以最新 main 為唯一真實來源。

## 0. 最高優先權與範圍
1. **原本所有遊戲模式、規則、資料與使用者體驗零變更，優先於刪檔數量。** 文字模式、極簡模式、背景／離線戰鬥、倍速、正式2.5D戰鬥、三紀元及各合法戰鬥、GM、音樂音效、登入、雲端、存檔、轉生、載入、Service Worker、Pages、獎勵與數值均不得藉清理改寫。
2. 正式210套／1,050槽的永久ID（G001～G100、U001～U100、H01～H10）、中文名稱、地圖、區域、怪物、Boss、裝備屬性／掉落／品質／強化／混穿及所有正式資料owner不變；不要刪正式遊戲資料、遷移玩家資料或改存檔格式。
3. 這次**只清理**廢棄的210套裝備概念圖與逐套角色量產制度。**不製作**未來三紀元新角色、不變更外觀選擇規則、不啟動G20或第29～40批舊量產工作。
4. 不需要的圖片、原始PNG、生成紀錄、審核資料、索引、歷史SHA鎖、專用工具、測試、SOP、驗收報告及證據，**必須從最新main檔案樹實際刪除**；不接受僅停止引用、註記deprecated、改名、移往archive/legacy/backup或以歷史文件保留。Git舊提交仍存在；**不重寫Git歷史**。
5. G005／G007／G018**不是**未來三紀元造型的來源或先決條件；未來三套不得依賴這三套的概念圖、SHA、審查、ID或量產資格。其舊概念與歷史制度應刪除。**但若正式B/GM目前實際使用其角色／武器WebP、登錄與必要載入契約，不得盲刪執行素材**；僅保留逐檔可證明必要的最小執行依賴，後續新角色正式替換時再退役。不能為刪舊圖而重寫正式戰鬥、改外觀選擇、改戰鬥時鐘或破壞回退。
6. 未來三紀元角色只需可重用的**通用**圖像完整性、來源／授權／SHA、透明素材、武器層、動畫、GM、發布隔離驗證能力；本次只保護／去耦這些能力，**不新增三套專用美術資料或規則**。
7. 不順便優化、重構、改版任何遊戲模式；除舊美術依賴拆除及必要的測試／發布引用外，不修改正式Runtime程式。遇到必須修改正式Runtime才可刪的檔案，先停下、列出逐檔依賴與風險，取得使用者另行授權。

## 1. 已確認的高風險實際依賴（清理時重新讀最新main）
- `scripts/equipment-concepts.py`：混合正式owner身份擷取與概念圖／審查／索引驗證；正式210套身份功能不得隨美術工具一起丟失，應先判斷是否有其他使用者，再抽離或退役。
- `development/3d-source/equipment/concepts/_concept-index.json`、`_concept-identities.json`：舊開發身份與逐套目錄；不是正式遊戲owner，卻被多支工具讀取。先拆除依賴再刪實體。
- `scripts/equipment-concept-batches.py`：42個五套十圖批次，強制notes、索引及兩圖；應退役。
- `scripts/equipment-art-review.py`：歷史雙階段/schema2/3及schema4、舊SOP/SHA證據；舊專用審查應退役。
- `scripts/equipment-modeling-gate.py`、`scripts/equipment-asset-production-gate.py`：以conceptApproved/assetProductionEligible為前置；解除舊門檻。
- `scripts/equipment-sprites.py`及其資產模組、`scripts/equipment-weapon-assets.py`：會從舊concept catalog取得身份、綁概念SHA，後者硬編碼G005/G007/G018。拆除舊審核依賴，但先保護正式正在使用的執行素材完整性／載入。
- `development/equipment-2_5d/v1/registry.json`、`development/equipment-2_5d/weapons-v1/registry.json`、正式角色／武器WebP、`3d-test`、GM、publish-assets、publish-asset-audit、資源manifest／SW：必須逐檔辨識「正式執行必要」與「僅歷史開發證據」，不能整包刪。
- `PROJECT_HANDOFF.md`、`docs/2_5D_BATCH28_40_REBASE_MASTER_PLAN_2026-10-16.md`、`docs/2_5D_EQUIPMENT_PRODUCTION_UNIFIED_SOP_2026-10-15.md`、`docs/2_5D_EQUIPMENT_210_SET_VISUAL_DIRECTION_2026-10-15.md`、`docs/2_5D_EQUIPMENT_SPRITE_PIPELINE_SPEC_2026-10-15.md`：含已廢棄的210套/420圖、歷史SHA永久保留、G20續作、以鎧甲選外觀等要求；最後要改成有效的精簡現行規格，刪除純歷史報告。
- `docs/2_5D_EQUIPMENT_G*_ACCEPTANCE_*.md`、`docs/evidence/equipment-g*/`、`docs/evidence/equipment-policy/`、`docs/evidence/batch28-*/`、`tests/equipment-concepts/`、相關GitHub workflows及其他3D/2.5D舊量產檔案：逐項盤點，確定無正式共用契約後實刪，**不以此清單表示已全庫掃描完畢**。

## 2. 四批順序與每批完成條件
### 清理第1批：全庫只讀盤點及零變更基線（不得寫入／刪除GitHub）
1. 讀最新main提交SHA、完整tracked tree（含隱藏目錄）、正式資料owner、Runtime、GM、發布清單、workflows、測試、文件。
2. 對舊美術相關檔案逐項建立：路徑、類別、bytes、引用者、正式執行必要性、處置（刪／保留／抽離後刪）、理由；列出預估刪檔數與消失目錄。
3. 掃描所有import、動態載入、URL、資產registry、JSON、manifest、Service Worker、Actions、腳本、測試及Markdown連結；不可只grep直接字串而漏掉動態路徑。
4. 比對正式210套身份與1,050槽、各紀元合法戰鬥、原文字／極簡／背景／倍速／GM／音訊／雲端／存檔等契約，記錄前置基線、已知失敗、Actions與Pages狀態。
5. 確認G005/G007/G018哪些實體檔案由正式B、GM、發布清單使用，哪些只是概念／原稿／歷史審查。保留例外必須逐檔列引用者，不能用「相容」籠統保留。
6. 分離仍有用的通用圖像驗證與舊210套專用制度；辨識必須拆除的CI阻擋條件。
7. 產出可執行的完整刪除／修改／保留清單及風險，**本批不修改repo**。盤點若不完整，不進第2批。

### 清理第2批：拆除舊制度與依賴，正式模式不可變
1. 依第1批清單拆除舊概念圖、210套角色量產、42小批次、舊兩階段/schema2/3/4歷史審查、G024/G030歷史例外、逐檔SHA鎖及G005/G007/G018概念前置條件。
2. 若舊工具混合正式裝備身份與美術驗證，僅抽離真正被共用的身份核對能力；不可複製另一份正式裝備數據做新的權威來源。
3. 刪除已無用途的專用Python/JS工具、fixture、單元測試與workflow；若測試含Runtime、文字回退、GM、發布隔離等有效斷言，先移到適當既有測試，不能因清理而降低覆蓋。
4. 去耦仍在正式使用的三套試行角色：可保留運行必需的實際WebP／最小登錄與SHA完整性，不保留概念圖／生成源／歷史審查依賴。若需要改正式Runtime才能安全拆除，停止該項並回報，勿自行改。
5. 每個提交須有完整差異、零意外正式玩法檔修改、適當本機／CI驗證；不能為了過關而關閉有效檢查。第2批後正常開發／建置／測試不得再依賴將在第3批刪除的資料。

### 清理第3批：GitHub main實體刪除
1. 依已核對清單使用真正的git delete：刪除G001～G095概念WebP（目前已知190張）、原始PNG、sources、notes、review JSON/Markdown、逐套資料夾、索引／身份ledger、舊量產配置與純歷史檔。
2. 刪除無用的舊美術SOP、視覺方向、批次驗收、證據、舊歷史SHA清單及其專用測試／工具；混合文件先將仍有效的Runtime規格納入現行文件，再刪原檔。
3. 搜尋同類內容是否散落其他development、docs、tests、workflows、scripts、assets、GM或發布目錄，逐一處理；**不只清理已知的concepts目錄**。
4. 不移到archive/legacy/backup，不留空佔位檔；Git追蹤目錄內全部檔案消失後，GitHub資料夾應消失。不得刪實際正在使用的角色／武器執行WebP。
5. 用`git diff --name-status`確認真正刪除（D）而非rename（R）；`git ls-tree -r --name-only HEAD`核對刪除檔及資料夾不存在，核對總刪檔數、bytes、類別與逐檔例外；發布stage／manifest也不得殘留無效引用。
6. 若第2批和第3批的依賴不能在中間提交保持正常，應將相互依賴的拆除與刪檔合併為同一可驗收提交，不能留下損壞的main。

### 清理第4批：全庫零殘留及正式模式回歸
1. 全庫掃描舊210套美術量產的檔案、資料夾、文字規則、CI、引用與生成入口；無用者**實刪**，不是註記歷史。掃描應有合理白名單，避免把正式210套裝備ID與資料誤判為舊美術。
2. 重整`PROJECT_HANDOFF.md`為簡潔有效的現行交接，移除G01～G19逐批歷史段落及舊G20待辦；更新第28～40批現行規劃，停止420概念圖／210角色／210武器量產義務，**但不在本次制定或執行三套新角色詳細製作流程**。只留下將來可共用的最小驗證契約與必要Runtime規格。
3. 執行正式裝備身份／數值／存檔契約差異比對、文字模式、極簡、背景、倍速、三紀元戰鬥、GM、音訊、正式2.5D及安全回退測試；不更改原規則、公式、戰鬥owner clock、UI與操作。對不能自動化的真機／真雲端項目明確標記未測，不能冒稱通過。
4. 執行建置、publish builder、asset audit、manifest／SW／cache版本核對、Pages及最終提交SHA的Actions；不引用舊SHA成功結果。清理後正常命令不得重建舊concepts目錄。
5. 最終回報：刪除檔案數及分類、實際消失目錄、Git D紀錄、main tree核對、仍保留的最小執行檔及其引用者、所有有效驗證結果、未測事項、最終SHA與Actions狀態。**清理成功＋原模式無回歸必須同時成立**。

## 3. 強制停止／回退條件
- 正式玩法／資料owner或存檔格式出現非預期差異；文字、極簡、背景、倍速、GM、音訊、登入／雲端、轉生、2.5D正式戰鬥任一回歸。
- 正式B或GM所需圖片被刪、資源404、manifest/SW失效、回退故障。
- 原有效安全斷言遭移除而無等效保護、CI失敗被掩蓋、Actions只查舊SHA。
- 未完成完整盤點卻開始大量刪除；或為達成「零殘留」需要改正式Runtime。
出現上述情況即停止該批，不強行宣稱完成；先恢復正常並報告風險。不要自行修改原模式來配合刪檔。

## 4. 驗收的精確定義
- **清理成功**：最新GitHub main確實沒有已判定無用的舊美術檔案／資料夾／專用驗證器／歷史SOP與報告；不存在移位封存；無過期引用或可自動重建舊檔的正常流程。
- **模式保護成功**：正式遊戲玩法與資料未變；必要測試、CI與發布隔離持續有效；未執行的真機項目明示。
- 兩者缺一不可。GitHub舊提交可追溯，但不作為最新main保留舊檔的理由。
- 本文件是清理施工計畫，**不授權直接執行四批**；每批須使用者另行下達指令。Chat模式優先，只有工具能力／完整測試確實不足時才說明是否需要Codex。
