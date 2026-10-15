> **2026-10-15｜刀劍統一與戰鬥同步（現行規則，優先於下方歷史描述）**：正式210套／1,050槽維持永久ID（G001～G100、U001～U100、H01～H10）；銀河100與高維10名稱保留，宇宙70武器改名，明確對照見 `docs/WEAPON_NAME_MIGRATION_2026-10-15.json`。五槽ID、紀元、區域及數值不變；舊宇宙武器於原存檔gear正規化流程僅更新名稱及同名visualKey，保留ID／品質／強化／屬性／背包。G001～G030原60WebP及G024/G030接受證據保留，不重製。後續G031～G100、U001～U100、H01～H10概念與角色全部採刀劍／能量刃外觀；禁止槍、炮、戟、矛、鐮、斧、鎚，抽象高維名稱亦同。適合手機小尺寸2.5D，不追加骨架／大型套件；保留原五槽名稱與ID規則。三套現有角色共用蓄力→前衝突刺→命中→回位模板，GM與正式皆由原Playback／OwnerClock安排，視覺不得等待或改動權威事件／結算。其餘207套沿用模板但素材仍未製作。歷史審查、fixture、來源鏈與舊提交不作全域改名。實作、測試及真機限制以 `docs/WEAPON_THRUST_SYNC_ACCEPTANCE_2026-10-15.md` 為準；Actions須核對本次最終SHA，不引用舊成功紀錄。

> **第2批實作規則（2026-10-15，優先於下方歷史schema2說明）**：已導入schema3／`equipment-2.5d-v3.0`，機器政策為`scripts/equipment-review-policy-v3.json`並鎖定SHA。可編輯SOP文字不再充當新批准的政策指紋；歷史schema2使用逐byte保留的`docs/evidence/equipment-policy/sop-v2-2026-10-15.md`驗證原授權SHA，並保留其原有嚴格結論。新`review-2_5d.json`／`.md`是逐套補充證據，不覆寫舊`art-review.json`。schema1只允許當前main既存G006/G007原批准紀錄；不能新增偽造舊批准繞過雙階段。

- schema3綁policyVersion／policySha256、完整formalIdentity（含epoch、directory與五槽名）、兩圖SHA、ChatGPT歷史初審來源與政策遷移方式、Codex本輪複查、blockers／advisories／explicitlyAcceptedExceptions、來源SHA／日期、Markdown SHA與canonical evidenceFingerprint。初審來源與現版本兩圖須匹配，不捏造新增獨立審查者。
- blocker：正式身份錯誤、缺圖／損毀／版本SHA錯誤、錯套／偽造／嚴重造型不符、缺主體／小尺寸完全不可辨識、來源或授權不符。局部膝鞋、空背座、三視微差及裝飾細節屬advisory，不能用來要求新套裝五GLB／53骨／9掛點／三LOD。
- G024/G030例外由`docs/evidence/equipment-phase2/user-acceptance.json`固定指紋，綁定各自正式身份與兩圖SHA，scope僅concept-review-only；不能挪到別套、不能豁免真正blocker。原圖、舊fail歷史及拒絕候選保留，不修圖不補證。
- 五階段：`conceptApproved`（驗證推導）、`assetProductionEligible`（製作資格，舊`modelingEligible`相容別名）、`asset2_5dStatus`（本批全not-started）、`gm2_5dTestStatus`（本批全not-tested）、`formalReleaseAllowed`（本批全false）。G007的`modelStatus`獨立保留，不能冒認新2.5D素材完成。
- G001～G030依逐套目視與歷史證據遷移pass-with-advisory；全部60圖及8舊審查原檔保留。G031～G100／U001～U100／H01～H10維持未製／未批准。來源限制詳逐套證據：G021～G025使用附件提供者的生成聲明，沒有獨立PNG生成追蹤；僅開發用途審核，不宣稱商用發布權利。
- 先執行`python3 scripts/equipment-asset-production-gate.py --set G024`（舊`equipment-modeling-gate.py`仍可用），再進第3批素材製作。generate從真owner、實際檔案與證據推導資格，不建立審查、不讀快取true批准；validate／入口均重驗全索引。
- 發布／Pages／SW仍排除所有概念及開發source；正式JS/CSS／GM／存檔／音訊／B功能本批未改。詳[第2批成果](2_5D_EQUIPMENT_PHASE2_ACCEPTANCE_2026-10-15.md)。

> **2026-10-15｜第1批資料庫政策優先權**：以下schema2、G024強制像素修補及modelingEligible規則記錄既有實作，**尚未在本批改程式**。新政策依六批總規格：2.5D素材製作資格不等於五GLB建模資格；G024/G030原圖由使用者接受，非阻擋例外；第2批須保留原SHA、以policyVersion及雙階段可驗證證據更新審查器、索引與負例測試，不得僅將conceptApproved硬設true。正式五槽210／1050、H01～H10、來源owner、舊schema相容、G007原模型與formalReleaseAllowed=false不變。

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
- 每張 300～800 KB 以下是建議上限；小於 300 KB 可接受，超過 800,000 bytes 提示而不自動重壓。尺寸有讀取並記錄，沒有杜撰必需的固定畫布；建模辨識度仍須雙階段圖面審查。

## 狀態與批准證據

當前數量與狀態以 `_concept-index.json` 為準。`conceptApproved` 由審查證據推導，不能由圖片存在、GLB、CI 或直接寫 true 推定；generate 永遠不建立／改寫批准檔。

- 新雙階段自動審查依 [SOP v2.0](BATCH28_EQUIPMENT_CONCEPT_TWO_STAGE_SOP_2026-10-15.md)與 `scripts/equipment-art-review.py`：ChatGPT 初審、Codex 複查完整十項，綁正式身份／兩圖／SOP／審查文件 SHA，未解缺陷、缺項、fail／unverified 不得批准。
- `conceptStatus`：未製／缺圖／`images-present-awaiting-art-review`／`auto-art-reviewed`／`needs-local-correction`／`needs-art-evidence`／`rejected`；既有批准保留 `approved`。
- `artReviewMode`：`unreviewed`、`legacy-user-approval`、`autonomous-two-stage`。既有 `user`／`user-delegated-chatgpt` 原始批准與授權證據不改、不取消，仍驗證本來的正式身份與圖片版本。
- `modelingEligible` 是經驗證概念批准的建模入口資格，不是模型完成。先執行 `equipment-modeling-gate.py --set ID`；此唯讀程式重驗真實 owner、全索引與審查，拒絕未批准套装。
- `modelStatus` 仍按實際 registry／模型證據推導；`formalReleaseAllowed=false`，不因概念審查通過而允許發布。Runtime／Pages／SW 不讀概念圖，不預載210套。
- `formalSha256` 保留 Python UTF-8 indent2 加結尾換行、欄位順序 `id, sourceKey, regionOrBoss, equipmentNames`。版本變動使舊審查失效，不可沿用或忽略。
- G024已知膝盤缺陷有專項防繞過：通過前必須保留原始hash、真修補、兩個固定鞋上端區有變更，其餘解碼像素完全相同，並完成圖面複查。沒有 Pillow 不跳過此驗證；CI安裝固定 Pillow11.3.0。
- 程式驗證證據結構與版本，不能自動判斷美感或以文字替代實際目視；完整的逐套審查 Markdown 記錄可見內容、限制與工程待驗。

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
