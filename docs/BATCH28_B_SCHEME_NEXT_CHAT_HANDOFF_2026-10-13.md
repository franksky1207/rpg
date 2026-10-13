# 《文明戰線》第28批 B 方案｜新對話施工交接（2026-10-13）

## 唯一有效來源與狀態
- 儲存庫：`franksky1207/rpg`；每次施工重新取最新 `main`、確認 exact-HEAD Actions，勿使用本文件的 SHA 當永久 HEAD。
- 建立交接時 main：`ecfd2cb5b6cf9befb4f7cae532904eae31854f70`。最新 HEAD 是否全部 Actions 成功尚未獨立驗證，不得自行寫成全綠。
- 已完成 T3～T5 的 2.5D B 架構工程、本地驗收及正式裝飾預覽退場；但 `FULL_3D_AVAILABLE=false`、`formalReleased=false`，尚無全面核准敵方正式 atlas，不得把正式畫面／美術／第40批最終發布標成完成。
- 剛完成：第三紀元背景／HP／極簡畫面重綁與 Fast Catch-up 恢復（修前正式計算未停、舊DOM血條不同步；可恢復 pagehide 保留連戰）；GM「戰鬥、動畫與特效」原 C-15-BATTLE 已整合單一 B 2.5D 戰鬥模擬（八分類31案例保留、A/C 不列為GM選項）；原第01～27批 B 相容性盤點／必要修正已完成。
- 以上有 Chromium/WebKit、三紀元／虛空、GM B 真渲染、Core／存檔及資產回歸證據；**iPhone 真切App/30分鐘／GPU發熱、真帳號雲端、人工美術驗收仍待使用者**。不能以本機 WebKit 取代 iPhone。
- 先讀：`PROJECT_HANDOFF.md`、`docs/2_5D_B_SCHEME_T4_T5_BATCH01_40_MASTER_2026-10-13.md`、`docs/2_5D_GM_BACKGROUND_BATCH01_27_EXECUTION_2026-10-13.md`、`docs/3D_BATCH01_27_B_COMPATIBILITY_LEDGER_2026-10-13.md`、`docs/2_5D_B_T3_T5_ACCEPTANCE_2026-10-13.md`、`3D_IMPLEMENTATION_PLAN.md`、第28批相關實作／驗收／來源與名稱索引。新 B 總規格在與舊全3D要求衝突處優先，其他仍須按最新 main 實作。

## 第28批已有成果，禁止重做或誤報
- 第27批人物基座：53骨、9掛點、三LOD、本地 Babylon 引擎；第28批既有五槽模組化技術、G007 15件 GLB 與身份/SHA/授權成果應先核對、保留。
- 正式名稱映射 210套×5槽＝1,050位置；`1,050`並非要做 1,050 個互異 GLB。任何裝備必須嚴格對到名稱、紀元、區域、槽位、品質，不可拿 G007 冒充 G006。
- 概念索引**正確路徑**：`development/3d-source/equipment/concepts/_concept-index.json`。已入庫銀河 G001～G020 共20套、40張 WebP（每套 overview-front-side-back、equipment-five-slots），目前 `conceptApproved=false`、`modelStatus=not-started`，不是已批准的正式可穿戴模型。
- 保留圖像原件、notes、索引、SHA、來源、G001～G020 先前成果；勿為追求數量重生已完成圖，勿擅改 `conceptApproved` 或模型狀態。G021～G100、U001～U100、H001～H010 具體缺件以最新索引與實際檔案為準。
- 第28批方向：以已做好的概念／五槽技術為基礎，完善 B 玩家五槽混穿、卸裝、遮擋／接觸、LOD、嚴格身份解析、安全缺件回退、GM 可驗收流程；真正待製作且需藝術批准的 GLB／概念素材依第28批最新版施工規格逐項處理，**不跳到29～40批大量量產**。
- GM 是唯一開發／美術預覽中心；正式角色頁／背包／養成／地圖不得重新放回獨立3D預覽；正式B戰鬥與GM共用合法引擎／asset-loader而不共用測試存檔。
- 每次實作先明確檢查「有何已有、何項缺少、哪項需使用者美術審核」；使用者若說「先討論」則不得修改，明確說「做／執行／第28批」才施工。

## 新對話的執行規範
1. 一律以最新 main 程式、來源索引、T3～T5與01～27補查結果為唯一真實依據；先確認 Actions 適用工作流程完成狀態，未證實勿稱成功。
2. 第28批從既有成果銜接，不重新進行 T1～T5／01～27、A/B/C 選型、不回復原正式介面裝飾預覽。
3. 嚴格不動正式戰鬥算式／RNG／收益／存檔／雲端、背景／極簡／GM權限／音訊owner；有 JS/CSS 改動處理 cache-bust、manifest/source/publish/SHA與相關測試。
4. 每批交付四項：修改內容；實際執行的自我檢查；桌機及手機可理解的驗收清單；Git commit、exact-HEAD Actions與待補。人工美術審核不可用CI代替。
5. 第28批後才依 B 方案接續29～40；最終美術核准與Stage40全局上線另行決定。
