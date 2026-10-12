> **2026-10-12 後續決策註記**：本文件為 T2-A 時期的三方案公平比較歷史藍圖，原驗收條件與 A/C 對照資料保留供追溯；**使用者已實際觀看 B3 的 A/B/C 展示並正式選定 B（即時 3D 玩家五槽換裝＋預渲染敵人）作為後續唯一正式施工方向**。B3 已實作隔離展示，B4 尚未施工。未來 B4 重點是 B 的首次／重播與快取／解碼、桌機與手機實際效能及釋放；T2-C 改成 B 方案正式採用 Gate 而不是三選一。舊有 C 類材質／局部穿模證據不刪，但採 B 可見與實機風險導向修復；不得因選型就宣稱正式發布／真機已驗收。詳細以 [最新路線圖](3D_HYBRID_TRANSITION_EXECUTION_ROADMAP_2026-10-12.md) 為準。

# T2-A｜交給 T2-B 的施工藍圖（尚未施工）

本文件可作後續施工指引，但不構成T2-B／T2-C授權。[比較規格](3D_HYBRID_T2A_COMPARISON_SPEC_2026-10-12.md)、[fixture契約](3D_HYBRID_T2A_FIXTURE_CONTRACT_2026-10-12.md)、[驗收矩陣](3D_HYBRID_T2A_ACCEPTANCE_MATRIX_2026-10-12.md)是共同條件，不預設方案勝負。

## 入口與所有權

建議 **獨立 development/hybrid-comparison 頁**，由開發伺服器啟動，原正式GM八類31案不加／改／刪。本批尚未建立HTML入口。若T2-B需GM可達入口，先在GM已授權管理頁加「開發同場比較」link，不把它當正式第32案／第九類，不預設加入正式Pages；必須保留同源／iframe與帳號授權檢查，僅傳session授權與只讀外觀／caseKey，禁止完整State。

開發頁可依序切A/B/C、normal/elite/boss/defeat/effects、33外觀、low/medium/high及viewport。切換要cancel舊playback、dispose消費者／scene／GPU再建新generation；相同case/controls/variant顯示其SHA。預設fixture，不能啟動正式fightOnce或保存／結算。不要因做原型改原3D工廠／formal-home／戰鬥UI。

## T2-B 建議再拆四個可獨立驗收子批

| 子批（提案，全部未施工） | 具體工作與交付 | Gate／停止點 |
|---|---|---|
| T2-B1 資料／舞台殼 | 隔離入口、fixture輸入、playback token、取消／背景快照、資料SHA、共同HUD安全區、無Renderer的診斷consumer | H01～06/08/12自動負向；可切場、不碰State／audio；不算三方案已完成 |
| T2-B2 最小共用美術 | 三敵人同源.blend／設計、動作、B圖集與C GLB、A玩家／五槽分層或影格、共同背景/影/VFX、原玩家新增獨立相容動作稿（不覆寫已接受GLB） | 名称/授權/SHA/53骨9掛點；attack/受擊/閃避/回位等確實有clip，不把idle當attack；無量產其餘裝備 |
| T2-B3 A/B/C實作 | A五槽獨立動態層；B現有玩家＋圖集敵；C同玩家＋同源即時敵；固定camera與共同state machine | 同SHA/事件／尺寸／節奏／動作覆蓋／VFXbudget；H全部通過，visual not-ready不能假完成 |
| T2-B4 觀測與故障收尾 | raw rAF/marks/HTTP、decodedAtlas/GLB/counters，冷熱／100開關、background/orientation/contextloss、JSON匯出、source/publish核對 | 真資料／方法／unavailable標示，全部勾選＋桌機基本可玩；30分鐘真手機／選型仍交T2-C |

每個子批需另外授權、最新main核對與獨立提交；可依實際容量細分美術普通／菁英／Boss，不先量產，不改原27～40責任。本次T2-A未開始B1。

## 資料注入與視覺狀態機

Node工具的comparisonInput定義並驗證immutable事件／computed／外觀契約。T2-B瀏覽器頁讀取預先驗證的開發JSON，再實作同契約的copy/freeze輸入adapter；不能直接import依賴Node fs/vm的生成工具，也不再呼叫core或修改Bridge。T2-B應新建**離線播放session**，source event保持原battleId/seq，另以playbackId/generation/AbortSignal控制播放；復播不能重複正式settlement，fixture無收益。每個consumer擁有自己的dispose，async完成前驗current；WebGL關閉、case切換、背景與scene dispose都invalidate。

狀態機：ready→idle→（visual prepare）→approach→strike cue→known hit/crit/dodge/counter/combo對應動作→return→idle→computed outcome→closed。prepare/knockback是視覺補間，不能變成新正式事件；沒有對應正式動作或素材的項標unsupported／示範。effects fixture為明示能力輸入且action-safety incomplete，不能演敗北死亡；純示範script在另一channel永久標「非正式事件」。HP／盾不從damage反推，每場start→final；不知道的盾隱藏／unknown，不歸零冒充。

控制參數oneKnownAction700ms是公平視覺benchmark，三方案一致；正式1×、GM1/1.5/2與原等待完全不改，離線示範不能寫state.settings.combatSpeed。前背景不累積動畫，恢復只顯當前checkpoint。基本聲音全部靜音；不得建立audio元素/AudioContext或在Bridge播放。授權音訊比較先做cue trace，再沿原owner。

## 資產需求、G007與美術分離

- 玩家沿用原53骨／9掛點／三LOD與G00715檔；用Civilization3DAppearance的modelDescriptors／resolveEquipment及CharacterAssets的scene/equipmentSession，scene専有取消／釋放，CPU cache按原規則。A必須同樣五槽32子集合與混穿/空槽，頭盔不露臉、兩靴獨立運動、武器右手與背飾遮擋，不以整套合成圖取代。
- 現有唯一idle不能作attack素材。待相容的attack/受擊/dodge/return/defeatclip及必要視覺combo/counter變體；另存原始動畫稿/來源，先做極端姿勢G007穿模、遮蔽/掛點驗收。不得本批或後批默默重寫原第27骨架／第28 GLB。
- 遺址守衛機／遠古戰爭機甲／遺址中樞核心各一源稿，同一輪廓／貼圖／光向／動作給A/B/C。尺寸、幾何、材質/骨架、動作個數與art status逐項登記；不得把原程序幾何叫完成怪物。
- B atlas需每動作frameCount/fps/frame尺寸/pivot/trim/UV/pages、padding/mipmap、encoded bytes／decoded dimensions，與C同鏡頭yaw/pitch/ground foot參考。敵人各動作跟同一原始動畫輸出，不讓B用更多frame或更好特寫偏袒。
- A玩家五槽素材需同動作與depth/order、透明區/pivot/左右脚、每slot layer與互遮規格；若組合爆量，實記影格／工時／bytes，不直接宣稱不適合或已完成1050槽。
- 背景2D前中後景、地面接触陰影與命中粒子共享原創/合法資產，screen-space預算按同一tier。BosssafeUV保留HUD，手機橫直尺寸按controls一同調整。

## 質量、降級與觀測

quality low/medium/high對應現有玩家三LOD，三方案使用同可見pixel budget、同特效數量／陰影強度；atlas解析度 vs敵GLB LOD以同占屏輪廓定義，初版值經T2-B畫面驗證後一起改control版本。每方案需text-only安全回退：WebGL失敗B/C關canvas、顯不可用與snapshot；A解碼失败同樣故障提示、不得假切C。context restored回idle，重新開啟後建立新session，不聲稱原scene已自行復原。

觀測入口開發頁「匯出比較報告」，欄位依[報告template](../development/hybrid-comparison/t2a-v1/measurement-report-template.json)。記時間marks／raw frames／requests與SHA、scene/container/mesh/texture count、JS heap proxy；CPU/GPU不可得時unavailable。RGBA/mip計算只estimate，不放observed欄。影像、raw traces與工作log放開發測試產物/CIartifact，禁止音訊重播、真帳號訊息或保存完整State。

冷／熱情境與六順序／三暖機十量測／100開关／30分鐘均同條件；先可重現，再進T2-C真硬體FPS／發熱／畫質比較，不能由headless選型。畫質盲評至少兩人、原因/片段可查。

## source／publish與交接

源稿／fixture／比較頁留development；scripts/tests/docs仍開發。三敵人源.blend／貼圖／動畫／atlas export settings、授權來源／修改權限、art pending/approved、prototype-vs-production標示和完整SHA保留。T2-B開發資產可以有**獨立開發清冊**，不能建立第二下載器／快取或冒充正式registry已核准。

若後續另授權把試驗頁加入測試發布成品，要先在既有asset-registry/publish-assets顯式增量配置相關GLB/atlas/licences/動態引用閉包，用原SharedLoader／SHA與按需載入路徑；不得為玩家首次進站預載或把整development目錄發布。T2-A不加registry、不改manifest/index，精簡成品原385檔應保持byte一致。

下批交付：各scheme按矩陣勾選、同場影片／截圖、測量原值、三敵人真素材與源工程、動作缺口、G007極端姿勢／回退證據、實際source/publish bytes與SHA、未驗硬體列表、回復commit。T2-C需使用者正式選型；T3～T5不能因原型就啟動。
