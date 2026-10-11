# 210 套裝備概念資料庫：維護與驗證

建立日期：2026-10-11。起始 main：`c2a92794342027b5fc68fef8abbc75612a49974b`。
本次僅開發資料、規格與工具；沒有生成圖片、修改 Blender／GLB、正式程式、數值、存檔、音訊或發布政策。

## 正式來源與身份

- 銀河：`data.js` 的 `WORLD_REGIONS`／`registerRegionMaps`，依正式十區位置執行十份 `worldmaps-*.js`，讀取 `MAPS` 共 100 張地圖。五槽次序另核對 `engine.js` 的 `EQUIPMENT_TYPES`；實際掉落名稱沿用 `makeItem` 的 `MAPS[mapIdx].gear`。
- 宇宙：執行 `secondworlddata.js` 的正式 owner 與內建完整性檢查，讀取 100 筆 `SECOND_WORLD_BOSSES`，按 `index` 與正式 Boss ID 對照；`secondworldrewards.js` 決定掉落名及裝備等級。索引的 Boss 等級是來源參考，不聲稱裝備永遠同級。
- 高維：讀取 `thirdworldloot.js` 正式 `NAME_ROWS` 的 10 階，並執行 `thirdworlddata.js` 的名稱階數函式，核對總剩餘 HP 分階與邊界。名稱階數不是固定 Boss／固定等級；裝備等級由當下玩家等級及正式上限決定。
- 共 210 套、1,050 個槽位位置，並非 1,050 個全域不重複字串。正式宇宙 `u019:helmet`／`u068:helmet` 都是「主機同步環」；工具保留原資料、列出重名，不改名湊數。
- `_concept-identities.json` 保存永久 ID → sourceKey → 目錄。Galaxy sourceKey 含 region ID 與區內零起算 index，Universe 含正式 Boss ID，Higher 含 band。英文 slug 僅為閱讀標籤，沒有新的遊戲命名權威。
- 若正式身份、排序、目錄與既有索引衝突，產生程序會失敗，先由維護者核對實際 main，再明確審查身份遷移，不能自動重編或覆蓋人工設計。

## 檔案責任分離

- `_concept-index.json`：正式資料、來源檔案／行號／symbol、狀態、實際圖片大小／尺寸／SHA、已存在模型證據；由工具維護，不直接手改。
- `docs/3D_EQUIPMENT_210_SET_MASTER_INDEX.md`：210 筆可點選的 notes 連結、完整五槽名與狀態，由工具維護。
- 每套 `concept-notes.md`：只有 `<!-- formal-equipment:start -->` 到 `<!-- formal-equipment:end -->` 是可重建的 A 節；B／C／D 與標記外人工補充保持原字元。初次接管無標記的人工 notes 會完整保留原文，另加最新正式區塊與規格。
- B 節初始建議明確標示「待確認的美術方向」；後續人工美術不得寫進生成區塊。工具不會再產生或重寫 B／C／D。
- `lastUpdated` 僅在該筆索引內容／證據變更時更新日期；單純重跑沒有時間戳差異。人工 notes 編輯本身由 Git 歷史追蹤，這個日期不冒充美術批准時間。
- 兩張標準 WebP 只在真的生成後放入；未生成不建立假的圖檔。檢查 RIFF／實際圖像串流、尺寸、容量及 SHA；若現有 Python 有 Pillow，另實際解碼。無 Pillow 時清楚區分為結構檢查；工具不安裝任何套件。
- 每張 300～800 KB 以下是建議上限；小於 300 KB 可接受，超過 800,000 bytes 提示而不自動重壓。尺寸有讀取並記錄，沒有杜撰必需的固定畫布；建模辨識度仍由使用者審查。

## 狀態與批准證據

目前：G007 兩圖已存在；其餘 209 套未生成；210 套均未批准。G007 第 28-C v1 有 15 筆五槽三 LOD 登錄，只有「既有模型存在、與概念稿對齊尚未驗證」，不能冒稱按新圖重製完成。

- `conceptStatus`：`not-generated`、`partial-images`、`images-present-awaiting-user-review` 或 `approved`。
- `conceptApproved`：預設 false，不能由有 notes、有圖、有 GLB 推定。
- `modelStatus`：`not-started` 或 `existing-model-concept-alignment-unverified`；由 registry 的 world、正式名字、區域／Boss／band 與檔案 SHA 核對，沒有美術批准含義。
- 模型技術、美術與手機驗收仍需要後續批次的獨立紀錄，本工具不代替那些 Gate。

後續只有取得明確使用者驗收紀錄，才可人工建立該套的 `art-review.json`：

```json
{
  "conceptApproved": true,
  "reviewer": "user",
  "approvedAt": "YYYY-MM-DD",
  "evidenceFile": "user-acceptance.md",
  "imageSha256": {
    "overview-front-side-back.webp": "完整 SHA-256",
    "equipment-five-slots.webp": "完整 SHA-256"
  },
  "formalSha256": "以下指定正式身份 JSON 的 SHA-256"
}
```

`evidenceFile` 必須為同目錄真實 Markdown，包含本套 ID、使用者與具體批准紀錄（至少 30 字元）；不可把工具測試治具當成真實批准。工具只能驗證證據結構與內容綁定，不能替使用者作出批准。`formalSha256` 為 Python `dumps()` 的 UTF-8 bytes 雜湊，欄位次序固定：`id, sourceKey, regionOrBoss, equipmentNames`。圖片或正式五槽身份有變化時，舊批准失效並使驗證失敗，重新取得批准後才能更新記錄。產生工具永遠不建立批准檔、不覆寫它或證據 Markdown。

## G007 原始素材保護

維持 `galaxy/g007-ancient-tech-ruins/`，來源「地球戰爭 → 古代科技遺址」，Lv.31～35。
現有人工 notes 原文完整保留；其舊「未上傳／PNG」敘述以新增最新狀態更正，不抹去歷史。

| 圖片 | 尺寸 | bytes | 原始 SHA-256 |
| --- | --- | --- | --- |
| overview-front-side-back.webp | 1491 × 1055 | 224974 | 0f9ad6179ac17fbd94f46897c433ce9003f19cb4290bc46c49ddbfd21ff67645 |
| equipment-five-slots.webp | 1491 × 1055 | 201726 | 2959fd08a50d7968ec228a4c8115f65988d018a4c57d045d876eec5c107d0ac0 |

工具驗證原圖不可變；不得覆蓋或重新壓縮。未來候選版本放 `drafts/` 並明確記錄候選狀態；要改標準圖與身份政策必須另獲使用者明確指示，不可用本次產生工具默默替換。

## 維護命令

需要既有 Python 3、Node.js（正式資料 VM）；不需啟動遊戲、Blender、Playwright、套件安裝或正式帳號。

```bash
python3 scripts/equipment-concepts.py generate
python3 scripts/equipment-concepts.py validate
python3 -m unittest discover -s tests/equipment-concepts -v
```

生成前先做全套身份、批准、圖像與 notes 標記檢查，通過才寫檔；生成不改正式 owner、模型或圖片。驗證模式完全只讀，若失敗會以非零 exit code 與原因結束。負向測試僅使用臨時副本，包含偽造批准記錄，全部不會寫回真實資料庫。

專用 `.github/workflows/equipment-concepts.yml` 在資料庫、工具及正式來源改動時驗證一致性、負向測試及再次生成零差異；沒有部署步驟，不改任何 Pages 清單。既有發布工具已排除 `development/`、`docs/`、`scripts/`、`tests/`；本次用實際 policy 核對，沒有改寫 policy 或 Service Worker。

## 本次實測與尚待工作

本機實際生成／驗證 100／100／10、210 唯一 ID／sourceKey／目錄、1,050 正式名稱位置；再生成零差異。21 項 unittest 通過，G007 原圖雜湊保持，實際 WebP 解碼成功。其餘概念圖生成、210 套使用者美術驗收、依圖建模、LOD／遊戲整合均不是本次完成項目。

## 批次狀態與中斷續跑（2026-10-11）
- **單一真實來源**仍為正式 owner + 目錄實際圖片 + `_concept-index.json`，不得人工維護另一份進度真相。
- `python3 scripts/equipment-concept-batches.py status`：只讀彙總 G01～G10、U01～U10、H01 共 21 批，顯示每批已存在／缺少的圖片張數與批准套數。
- `python3 scripts/equipment-concept-batches.py plan --batch G02`：列出 G011～G020 **僅缺少的圖片**、全部五槽正式名稱與既有圖片保護清單。Codex 須依此清單產圖，不能因重跑而覆蓋已存在圖片。
- 批次中斷後：先重新取得最新 main，跑 `python3 scripts/equipment-concepts.py validate`，再跑 `plan --batch <批號>`；若索引和圖片存在狀態不符，先停止調查，而非靜默覆蓋。產圖完成後跑 generate、validate、unittest、Docs Integrity 與 Publish Asset Audit；再執行 generate 必須零差異。
- `plan` 是**防誤操作的只讀工作清單**，不是檔案寫入鎖；執行圖片寫入的 Codex 仍須在每張寫檔前再次檢查路徑不存在，並避免在過時分支覆寫 main。工具不會擅自批准或修改圖片。
- 專用 CI `.github/workflows/equipment-concepts.yml` 含批次狀態／續跑檢查及 `tests/equipment-concepts/test_batch_planner.py`，與正式資料庫測試一起執行。
