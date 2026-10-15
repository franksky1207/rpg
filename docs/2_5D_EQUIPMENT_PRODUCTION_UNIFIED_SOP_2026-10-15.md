# 《文明戰線》2.5D 裝備量產｜現行統一 SOP（Codex單流程）
日期：2026-10-15。
> **最新決策（覆蓋本文所有舊雙階段敘述）**：使用者多次實測認定ChatGPT初審＋Codex複審不可行。後續新概念圖只使用**Codex單一批次作業**，每次5套／10張；Codex負責正式身份核對、真實圖片產製或取得、單次品質檢查、入庫、驗證、提交與自我檢查。禁止要求ChatGPT先審、Codex再審、人工逐套簽核或多次交接。歷史schema3與SHA證據只讀保存；現行驗證器若仍強制雙階段，需在首批Codex任務中以相容方式移除對**新批次**的阻擋，不得偽造舊stage或降低身份、圖檔、SHA及來源安全檢查。若Codex無法實際產出圖檔，必須如實報告，不能用空白或假圖充數。
適用：G001～G100、U001～U100、H01～H10（210套／1,050槽）。本文件是未來新製概念圖與角色素材的**單一閱讀入口**，不取代已上線Runtime契約、審查原始證據或舊G007相容要求。

## 1. 優先權與邊界
1. 正式名稱、五槽、區域、ID、存檔、戰鬥與發布：以最新main的正式owner及實際程式為準；不由概念圖片內小字或本文件猜測。
2. 新2.5D概念美術／審查：Codex單次審查為現行流程；`scripts/equipment-review-policy-v3.json`與schema3雙階段紀錄僅供歷史相容。現行工具若仍強制新圖雙階段，首批Codex需修正新批次驗證路徑；不得竄改舊policy SHA、舊證據或原圖。
3. 角色／武器製作：依`docs/2_5D_EQUIPMENT_SPRITE_PIPELINE_SPEC_2026-10-15.md`的現行補強段；正式戰鬥與GM依既有owner clock、selection、發布gate。不得因本SOP重寫Runtime。
4. 不再要求新套裝五GLB、53骨、9掛點、三LOD、五槽獨立換裝模型或工程級零件精度。G007舊3D資產及原相容測試照舊保留。
5. G024／G030兩圖原SHA及使用者接受的非阻擋例外永久沿用既有可驗證紀錄；不得要求重畫或補背座。G001～G030的60張原概念圖不重製。

## 2. 從已完成三套反推的可重用鏈
G005／G007／G018已有：概念兩圖→真透明整套角色512×512→共用idle／attack／hit／dodge／defeat→GM展示→鎧甲套ID正式選材→正式B受控發布；另有真武器透明層＋去武器／補手攻擊底圖、SHA／grip／depth／動畫狀態及文字回退。
這是**已有的實作模板**，不是證明其餘207套已製作，也不代表概念板可直接裁切當角色。後續需真實生成透明角色原稿、真實武器分層／攻擊底圖或實際攻擊姿勢；不得用空白、整圖旋轉或換色佔位。來源PNG／授權／審查SHA保留在development，正式只發布核准WebP。
目前三套攻擊仍有平移感與半月形光波，使用者已接受作為非阻擋現況；不得為概念量產強迫改動畫或引入完整3D。

## 3. 新概念圖每批5套／10張
- 開始前讀最新main正式owner、`development/3d-source/equipment/concepts/_concept-index.json`、逐套`concept-notes.md`、相鄰已批准套。逐字核對ID、epoch、sourceKey、regionOrBoss、directory、五槽正式中文名稱。高維僅H01～H10。
- 每套兩張獨立WebP：`overview-front-side-back.webp`（同套正側背整體造型）；`equipment-five-slots.webp`（同套五槽造型參考）。不可用一張拼圖裁切假冒十張獨立作品；圖片小字不是正式名稱owner。
- 畫面以手機小尺寸角色可辨識為主：完整角色輪廓、頭盔、鎧甲、鞋子、背飾、刀劍／能量刃的主要造型及區域特色。相鄰套不可只換色；不要求毫米級拆件、360度一致、膝鞋／背座細部完美。
- 全210套武器外觀皆刀劍／能量刃；銀河100、高維10原正式名稱不改，宇宙70舊名已透過遷移對照處理。不要為圖片改正式裝備資料。
- blocker僅限缺圖／損毀、錯身份／錯套／錯正式名稱、來源授權問題、嚴重缺失主體、主要造型明顯不符或在正式小尺寸完全不可辨識；局部裝飾、膝鞋接縫、背座細節、三視微差是advisory。

## 4. Codex單一批次製作／入庫（現行）
由ChatGPT提供一次5套的完整Codex指令。Codex在同一任務內讀main、核對正式owner、產出或取得10張真WebP、單次品質檢查、保留來源／SHA／尺寸／授權證據、寫入正確directory、執行現行有效驗證器及必要相容修正、提交main、檢查exact-HEAD Actions。禁止以兩階段review或逐套人工核准作新批次門檻。若Codex環境不具備真實生圖能力，明確回報限制，不得假造圖片、審查或成功提交。歷史證據保留只讀。

## 5. 概念圖→角色素材的最小交接資料
逐套保留正式identity、兩概念圖路徑／SHA、主輪廓與配色、武器刀劍類型／握持方向、頭盔／肩甲／背飾辨識點、透明角色所需的右向3/4鏡位提示；這些可寫進notes或製作計畫，不新增概念圖片張數。
素材產線固定512×512透明、共用腳底／pivot、真生成來源及小尺寸128～180px目視；真武器層＋去武器補手攻擊底圖或真攻擊姿勢；來源／審查／SHA／獨立狀態驗證。概念批准、素材complete、weaponAnimationStatus、GM通過、formalReleaseAllowed互不自動推導。缺材回退文字，不能冒用別套圖。
**不在概念圖階段批量產出207套角色、改GM或發布素材。**

## 6. 一次5套批次驗收
1. 正式owner／目錄雙重核對、五槽中文名稱、H01～H10與武器外觀正確。
2. 10張獨立真WebP，尺寸／bytes／SHA／來源與內容可目視；blocker=0，advisory可留。
3. Codex單次真實檢查證據與圖片SHA相符；新批次不得強制兩階段簽核，也不能靠手改`conceptApproved=true`。既有驗證器若不相容，Codex需先修正新批次路徑並保留歷史檢查。
4. `python3 scripts/equipment-concepts.py generate`及`validate`、相關Python unittest、必要的發布隔離稽核；重跑generate零意外差異。
5. 不修改戰鬥、存檔、正式JS/CSS、GM、音訊及舊3D；提交main並核對該SHA實際觸發的Actions，未觸發不冒稱通過。
6. 回報修改內容／自我檢查／使用者可查看項目／commit與待補；不強制逐套使用者批准。

## 7. 歷史文件對照（僅當相容證據）
- `docs/BATCH28_EQUIPMENT_CONCEPT_TWO_STAGE_SOP_2026-10-15.md`：下半部v2要求十項無缺陷、G024必修及五槽GLB等為歷史文字；現行schema3、accepted exceptions與本文件優先。
- `docs/3D_EQUIPMENT_CONCEPT_BATCH_ART_WORKFLOW_2026-10-11.md`、`docs/3D_EQUIPMENT_ART_DIRECTION.md`、`docs/3D_EQUIPMENT_ALL_EPOCH_FIVE_SLOT_CONTRACT_2026-10-13.md`：保留正式身份／歷史3D資料契約，不作新2.5D量產硬性美術門檻。
- `docs/2_5D_EQUIPMENT_210_SET_SIX_PHASE_TRANSFORMATION_MASTER_PLAN_2026-10-15.md`：六批工程已完成，真機仍待驗；本前置整合不重新開第7批。
- `docs/2_5D_EQUIPMENT_PHASE6_ACCEPTANCE_2026-10-15.md`：工程證據、G007／GM／發布回歸基線。

## 8. 下一步
本文件只完成「概念圖前置整合第1批」的規範與鏈路盤點。第2批視覺差異規劃已完成；下一步直接由Codex處理G031～G035，每次5套10圖。
