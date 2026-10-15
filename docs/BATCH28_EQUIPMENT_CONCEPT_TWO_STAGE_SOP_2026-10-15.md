> **2026-10-15｜刀劍統一與戰鬥同步（現行規則，優先於下方歷史描述）**：正式210套／1,050槽維持永久ID（G001～G100、U001～U100、H01～H10）；銀河100與高維10名稱保留，宇宙70武器改名，明確對照見 `docs/WEAPON_NAME_MIGRATION_2026-10-15.json`。五槽ID、紀元、區域及數值不變；舊宇宙武器於原存檔gear正規化流程僅更新名稱及同名visualKey，保留ID／品質／強化／屬性／背包。G001～G030原60WebP及G024/G030接受證據保留，不重製。後續G031～G100、U001～U100、H01～H10概念與角色全部採刀劍／能量刃外觀；禁止槍、炮、戟、矛、鐮、斧、鎚，抽象高維名稱亦同。適合手機小尺寸2.5D，不追加骨架／大型套件；保留原五槽名稱與ID規則。三套現有角色共用蓄力→前衝突刺→命中→回位模板，GM與正式皆由原Playback／OwnerClock安排，視覺不得等待或改動權威事件／結算。其餘207套沿用模板但素材仍未製作。歷史審查、fixture、來源鏈與舊提交不作全域改名。實作、測試及真機限制以 `docs/WEAPON_THRUST_SYNC_ACCEPTANCE_2026-10-15.md` 為準；Actions須核對本次最終SHA，不引用舊成功紀錄。

> **第2批實作規則（2026-10-15，優先於下方歷史schema2說明）**：已導入schema3／`equipment-2.5d-v3.0`，機器政策為`scripts/equipment-review-policy-v3.json`並鎖定SHA。可編輯SOP文字不再充當新批准的政策指紋；歷史schema2使用逐byte保留的`docs/evidence/equipment-policy/sop-v2-2026-10-15.md`驗證原授權SHA，並保留其原有嚴格結論。新`review-2_5d.json`／`.md`是逐套補充證據，不覆寫舊`art-review.json`。schema1只允許當前main既存G006/G007原批准紀錄；不能新增偽造舊批准繞過雙階段。

- schema3綁policyVersion／policySha256、完整formalIdentity（含epoch、directory與五槽名）、兩圖SHA、ChatGPT歷史初審來源與政策遷移方式、Codex本輪複查、blockers／advisories／explicitlyAcceptedExceptions、來源SHA／日期、Markdown SHA與canonical evidenceFingerprint。初審來源與現版本兩圖須匹配，不捏造新增獨立審查者。
- blocker：正式身份錯誤、缺圖／損毀／版本SHA錯誤、錯套／偽造／嚴重造型不符、缺主體／小尺寸完全不可辨識、來源或授權不符。局部膝鞋、空背座、三視微差及裝飾細節屬advisory，不能用來要求新套裝五GLB／53骨／9掛點／三LOD。
- G024/G030例外由`docs/evidence/equipment-phase2/user-acceptance.json`固定指紋，綁定各自正式身份與兩圖SHA，scope僅concept-review-only；不能挪到別套、不能豁免真正blocker。原圖、舊fail歷史及拒絕候選保留，不修圖不補證。
- 五階段：`conceptApproved`（驗證推導）、`assetProductionEligible`（製作資格，舊`modelingEligible`相容別名）、`asset2_5dStatus`（本批全not-started）、`gm2_5dTestStatus`（本批全not-tested）、`formalReleaseAllowed`（本批全false）。G007的`modelStatus`獨立保留，不能冒認新2.5D素材完成。
- G001～G030依逐套目視與歷史證據遷移pass-with-advisory；全部60圖及8舊審查原檔保留。G031～G100／U001～U100／H01～H10維持未製／未批准。來源限制詳逐套證據：G021～G025使用附件提供者的生成聲明，沒有獨立PNG生成追蹤；僅開發用途審核，不宣稱商用發布權利。
- 先執行`python3 scripts/equipment-asset-production-gate.py --set G024`（舊`equipment-modeling-gate.py`仍可用），再進第3批素材製作。generate從真owner、實際檔案與證據推導資格，不建立審查、不讀快取true批准；validate／入口均重驗全索引。
- 發布／Pages／SW仍排除所有概念及開發source；正式JS/CSS／GM／存檔／音訊／B功能本批未改。詳[第2批成果](2_5D_EQUIPMENT_PHASE2_ACCEPTANCE_2026-10-15.md)。

> **2026-10-15｜第1批政策升版：雙階段 SOP v3.0（文件階段）**：以下v2.0原文保留作歷史schema2／Runtime相容依據；新概念審查以六批總規格第1、2節為優先。每批五套十圖，ChatGPT初審→Codex複查；blocker僅限缺損、錯身份、重大造型不符、完全不可辨識、偽造或授權問題。膝鞋交界、背座細節、微小視角差異屬advisory；不再要求五槽獨立GLB或全視角工程精度。G024、G030原圖使用者明確接受，禁止再依下文舊G024修補條款阻擋；第2批須建立policyVersion、兩圖SHA、正式身份、兩階段與explicitlyAcceptedExceptions的可驗證schema及回歸，不可直接改true。正式發布仍false，既有G007歷史審查與模型契約不變。

# 《文明戰線》第28批｜裝備概念圖雙階段 SOP v2.0

日期：2026-10-15。專案：`franksky1207/rpg`。範圍：銀河 G001～G100、宇宙 U001～U100、高維 **H01～H10**；共 210 套，每批五套、每套兩張、每批十張獨立 WebP。

**流程：ChatGPT 製圖、自檢、ZIP → Codex 審查、必要修正、入庫 → GitHub Actions exact-HEAD 驗證。**

本 SOP **新增工作分工，不覆蓋** `docs/3D_EQUIPMENT_CONCEPT_BATCH_ART_WORKFLOW_2026-10-11.md` 的美術與技術標準。正式資料以每次工作開始時 GitHub 最新 `main` 為唯一真實來源。G001～G030 已入庫；下一批以最新索引和交接為準，不在本 SOP 固定寫死批次編號。

## 第一章｜基本原則

1. 每批五套、十個**獨立影像檔**。一套為製圖基本單位：先完成同套總覽，再完成同套五槽拆件，核對一致後才進下一套。
2. 完整繼承前20套的美術品質、角色三視圖、五槽拆件、全罩頭盔、獨立部件所有權、科幻區域特色、技術尺寸與驗證規則；不得單純換色或跨套複製。
3. **不需要使用者逐套美術批准**。ChatGPT 第一輪審查、Codex 第二輪審查；通過後直接入庫，並使用「圖面審查通過／需局部修正／待重製」記錄審查結論。概念圖審查與正式建模是不同狀態。
4. **使用者已正式授權210套採自動美術審查，不再要求逐套人工批准。** `conceptApproved` 是由可驗證審查證據推導的相容旗標：保留既有人工／代理批准；新增批准必須具備 `schema=2` 的 ChatGPT 初審與 Codex 複查，兩階段逐項通過，沒有未解決缺陷，且綁定正式身份、兩圖 SHA、此 SOP SHA 與完整審查 Markdown SHA。圖片存在、Actions 成功或直接設定 true 均不能代替審查。
5. 不改正式玩法、存檔、GM、背景／極簡、音訊、2.5D 功能及發布限制。盡可能在各階段一次完成，只有真實工具／權限限制或重大阻礙才停下說明。

## 第二章｜正式資料與**雙重目錄核對**

每批 ChatGPT 先讀取最新 main：
- `PROJECT_HANDOFF.md`
- `docs/3D_EQUIPMENT_CONCEPT_BATCH_ART_WORKFLOW_2026-10-11.md`
- `docs/3D_EQUIPMENT_ART_DIRECTION.md`
- `docs/3D_EQUIPMENT_ALL_EPOCH_FIVE_SLOT_CONTRACT_2026-10-13.md`
- `development/3d-source/equipment/concepts/_concept-index.json`
- 正式 identities／來源 owner、指定五套 `concept-notes.md`、相鄰已完成套裝的圖及審查紀錄。

**第一次核對（ChatGPT 製圖前、ZIP 打包前）**：逐套確認 `id`、`epoch`、`sourceKey`、`regionOrBoss`、五槽正式中文名稱、索引內 `directory`，並核對 GitHub 上實際目錄存在。ZIP 內路徑**逐字使用索引的 `directory`**，不可自行由 ID、slug 或名稱拼湊。若目錄不存在或來源互相矛盾，先查明；不得猜路徑。

**第二次核對（Codex 解壓入庫前）**：Codex 獨立重讀最新 main，逐套比對 ZIP 清單、檔案相對路徑、`directory`、`id`、`sourceKey`、正式五槽名稱與實際目錄。任何不一致須先釐清，不得直接搬入相似名稱目錄。高維 ID 嚴格為 H01～H10，非 H001～H010。

## 第三章｜第一階段：ChatGPT 製圖、初審與 ZIP

### 3.1 兩張圖的固定規格

- `overview-front-side-back.webp`：**只屬於當前一套**的完整穿戴角色正、側、背三視圖。頭盔完整遮蔽可辨識五官；角色比例、材質、武器、裝甲與背部飾品一致。
- `equipment-five-slots.webp`：**只屬於當前一套**的武器、頭盔、鎧甲、左右成對鞋子、飾品獨立拆件。武器握柄與作用端、裝甲邊界、鞋甲分離、飾品掛點與卸裝所有權明確，並與三視圖對應。

同套三視圖可以排在**該套的一張總覽**；同套五槽可以排在**該套的一張拆件圖**。但不得將不同套裝或兩種圖片類型合成同一畫布；不得製作十宮格／contact sheet，再裁切冒充十張獨立生成圖片。

### 3.2 執行順序與美術檢查

逐套：正式資料核對 → 生成總覽 → 生成拆件 → 比對兩張一致性 → 下一套。每批連續五套，不需每張等待使用者指令。

依前20套原 SOP 檢查：正式名稱／來源、三視圖一致、五槽完整、頭盔遮臉、鞋子成對、武器可握持、部件不重複歸屬、飾品與鎧甲分離、無缺件／嚴重變形、區域輪廓／材質／能源語言獨特。明確問題在本階段優先重製或修正，不把可預見錯誤留給 Codex。

### 3.3 ZIP 交付

取得十張**真實且彼此獨立**的圖片後，轉為 WebP（參照原 SOP 尺寸與品質規則），依正式 `directory` 放入各套目錄，附交接清單（ID、epoch、sourceKey、正式目錄、兩檔名、寬高、bytes、SHA-256），打包**單一 ZIP**。可在對話顯示圖像，但不得以對話中的預覽冒稱已取得可打包原檔。

若影像工具無法連續生成、無法取得原檔、無法轉檔或無法打包 ZIP，必須逐項說明已完成與缺少的產物；不得虛構十圖、ZIP、雜湊或上傳結果。

## 第四章｜第二階段：Codex 審查、修正與入庫

1. 取得 ZIP 後獨立核對最新 main 與十圖清單，檢查 WebP 真實格式、寬高、bytes、SHA-256、獨立檔案、內容是否屬於正確套裝及正確圖種。
2. 逐張審查三視圖、五槽、造型一致性、正式名稱、獨立部件所有權與原 SOP 美術品質。
3. **授權自動技術修正**：檔名、WebP 轉檔／合理壓縮、ZIP 目錄整理、索引與 notes 衍生資訊。**授權局部美術修正**：限具備真實影像編輯能力且可保留原圖與差異證據的情況，修正明確缺件、重複部件或歸屬錯誤，修後重新驗證。
4. 不得用 SVG、程式繪圖、佔位圖、複製換色、拼貼裁切冒充合格概念圖。若重大美術問題無法修復，該套標記待重製，不得假稱通過或硬塞入庫；其他合格套裝是否可先入庫，須在回報中清楚分列。
5. 通過後直接放入索引指定 `directory`，更新索引、各套 notes 與必要交接文件；保留既有批准證據；新圖只有雙階段實際通過才由驗證器推導 `conceptApproved=true`／`conceptStatus=auto-art-reviewed`，缺陷／證據不足者維持 false，**無需使用者美術審批才能完成概念圖入庫**。
6. 不因概念圖入庫而自動建模、開放正式發布資產或改變正式戰鬥邏輯。

## 第五章｜測試、提交與 GitHub Actions

- 執行 `python3 scripts/equipment-concepts.py generate`、`python3 scripts/equipment-concepts.py validate` 及相關裝備單元測試；重跑 generate 應無意外差異。
- 驗證正式身份／五槽契約、圖片尺寸／bytes／SHA、索引與 notes、發布資產隔離；依實際修改範圍執行必要的發布稽核與回歸測試，不強制全部無關測試。
- 若涉及快取版本、來源鎖或受 inventory 追蹤的檔案，檢查並同步 SHA-256、bytes、totalBytes；不可停用 workflow、放寬契約或偽造全綠。
- 原則上整批單一 main commit；提交前審視 diff，禁止夾帶無關遊戲程式變動。
- 提交後查詢**該 commit exact HEAD** 的 GitHub Actions，分列成功／失敗／執行中／未觸發。失敗須讀 job log、查明根因並修復本次相關問題；未觸發不算通過。

## 第六章｜固定回報

1. **修改內容**：五套正式身份、十圖狀態、逐套 GitHub 真實入庫目錄、Codex 修正內容。
2. **程式自我檢查**：兩輪目錄驗證、五槽、圖檔格式／尺寸／雜湊、索引／notes、測試與發布隔離。
3. **實機驗收清單**：可查看的概念圖、可見疑點與尚待重製項目；此清單僅供資訊確認，**不作為使用者逐套批准門檻**。
4. **提交與待補**：commit SHA、exact-HEAD Actions、尚未完成項目與工具限制。

## 第七章｜省用量與交接

ChatGPT 承擔正式資料核對、美術設計、逐套兩圖生成、初審與 ZIP；Codex 承擔獨立目錄核對、技術／局部美術修正、入庫、必要測試與提交。Codex 不無故重新設計合格圖片，不將十張圖拆成十個需使用者逐一啟動的工作。

**美術、技術、命名、正式身份與五槽標準全部保留；舊文件「只能使用者批准才能建模」限制由本 v2.0 正式取代。**

## 第八章｜可驗證審查與建模入口

- `scripts/equipment-art-review.py` 驗證兩階段依序為 ChatGPT／Codex，各自完整記錄正式身份、獨立圖檔、三視圖一致、五槽所有權、全遮臉、雙鞋、握持、可拆飾品、區域設計、畫質十項。每項附具體圖面觀察並出現在同套 Markdown；缺項、未知、失敗、未解缺陷或雜湊過期不可通過。兩階段是製圖初審與入庫複查，不聲稱是兩個獨立模型服務或人工簽章。既有 G026～G030 初審紀錄可引用並補第二階段，不須重製圖。
- `art-review.json` schema2 必含日期、雙階段、`outstandingDefects`、`outcome`、`formalSha256`、兩圖 `imageSha256`、本 SOP `authorizationSha256`、同套 `evidenceSha256`。`conceptApproved` 必須與驗證結果一致，generate 不建立或修改批准紀錄。審查人對視覺判斷負責；程式只驗證證據完整與版本綁定，不能自動辨識美感或保證任意文字是真實目視。
- 狀態：`auto-art-reviewed`（通過）、`needs-local-correction`、`needs-art-evidence`、`rejected`；未審兩圖為 `images-present-awaiting-art-review`。既有批准仍為 `approved`／`legacy-user-approval`，不得抹去歷史。
- `modelingEligible` 只在已驗證概念批准時為 true；`modelStatus` 獨立由真实 registry／模型證據推導，不能由概念批准改為完成；`formalReleaseAllowed=false`，仍需既有發布 Gate／獨立發布授權。
- 新建模工作必須先執行 `python3 scripts/equipment-modeling-gate.py --set <正式ID>`；此唯讀入口重驗全索引、owner、身份、兩圖和審查證據後才交付建模資料，未批准者以非零碼拒絕。既有 G007 歷史建模來源與15GLB不改，保留其原始批准及模型證據。
- G024 原始鞋膝盤為已知阻擋。只有真影像修補、保留原圖、驗證兩個固定鞋上端區域有實際變更且其餘解碼像素差異為零，再逐項目視通過，才能標 true；無損 WebP 防止整張有損重壓造成非目標漂移。不得用 notes、修改證據或大範圍遮罩代替修圖。
- 自動審查只適用逐套實際證據，不能批量將210套批准。每次局部修補保留原始版本及失敗候選紀錄；不得擅自覆寫已批准版本。

## 2026-10-15｜攻擊素材量產補充

概念圖兩階段審查維持，G024／G030使用者已接受例外不變。後續角色素材以整體人物為主，另提供真武器透明層＋去武器補手攻擊底圖，或真實攻擊姿勢素材；附握持點、前後層、旋轉角度與武器類型模板。不得用假空圖或整張人物旋轉代替。武器動畫完成以獨立 `weaponAnimationStatus`／SHA／複查及原戰場事件測試紀錄管理，不能從概念通過、角色complete或GM預覽許可自動推導。技術規格及可重現驗證見 `2_5D_EQUIPMENT_SPRITE_PIPELINE_SPEC_2026-10-15.md`，不新增五槽GLB／53骨／9掛點／LOD量產硬門檻。
