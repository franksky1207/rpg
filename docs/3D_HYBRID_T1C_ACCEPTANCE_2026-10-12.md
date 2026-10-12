# 混合式轉型 T1-C：正式戰鬥事件唯讀橋接

## 施工基準與範圍

- 起始 main：`89333ee746dc856eeb0e1349a58a8bfd046793c9`；起始工作目錄乾淨，fetch 無其他新提交；起始 SHA 的十個 Actions success。
- 依序核對 PROJECT_HANDOFF、執行路線圖、T1-A／B 驗收、轉型草案、3D_IMPLEMENTATION_PLAN、19～40 批驗收、正式預覽矩陣與 GM 目錄，並反查所有 `runCombatCore`／`runWorldCombatCore`／`runMirrorCombatCore` 動態呼叫。T1-A 共用快照、T1-B Loader／FormalDOM／formal-home 及 HTML 接線仍在。
- 僅 T1-C。沒有新舞台、Renderer、2.5D 原型、音訊播放器、戰鬥公式、倍速、收益、存檔或雲端規則變更；原正式 3D／GM 31 案／模型與第27～40批規格保留。
- T1-A/B 留下的真手機、長期 GPU、真帳號／雲端寫入限制仍在；T1-A 的特殊遭遇／結算快照 API 不暗中改為支援。新 Bridge 的來源與支援程度獨立標示。
- 程式結束提交見本檔「提交與回復」；最終 main 是後續證據文件提交，exact-HEAD Actions 需依該 SHA 獨立查詢。

## 責任與實際修改檔案

| 檔案 | 修改與接點 |
|---|---|
| `combat-events.js`（新增） | `CivilizationCombatEvents` v1；兩 lane、來源白名單、標準／鏡像轉接、immutable 投影、有限佇列、取消、重訂閱快照、診斷。沒有渲染、下載、音訊或寫入 State。 |
| `combatcore.js` | 原計算完成後觀察已存在結果，原 headless 判斷通知省略呈現；銀河主線加合法 context，原 `save(false)===true` 後提供結算投影。 |
| `mirrorcombatcore.js`、`mirrordungeonrun.js` | 原獨立鏡像核心結果轉接，每局識別；原整輪 VIP／save 成功後提供 run 範圍結算。原 actor `mirror` 正規化為 enemy，保留原事件 winner。 |
| `secondworldcombat.js`、`secondworldmainline.js` | 宇宙主線／回顧 context；既有背景／Fast Catch-up 分支通知跳過；原 settle 成功後投影實際收益。 |
| `thirdworldcombat.js`、`thirdworldprogress.js` | 高維持久 Boss HP、回顧與 GM 測試身分；以 WeakMap 關聯既有凍結結果／basis 的原場次，原交易成功後才投影結算。 |
| `dungeoncore.js`、`dungeonarena.js`、`thirdworldarena.js`、`dungeonvoid.js` | 懸賞、銀河／宇宙競技場、高維定相／異相逐 stage、虛空逐 floor 的 owner context，原 core／stage／存檔運作不變。 |
| `calamitycore.js`、`secondworldcalamityrun.js`、`secondworldcalamityui.js` | 銀河／宇宙災厄與合法回顧來源；headless 災厄使用最後計算快照，沒有補造攻擊歷史。 |
| `alternateuniversecombat.js` | 真正 attempt／depth／world 的 context，凍結結果與原 core 的關聯；原 attempt settlement 成功後只投影已確定 depth，沒有杜撰掉落。 |
| `specialcore.js`、`specialencounter.js` | 正式特殊戰來源與 encounter；原已決定跳過動畫的 Fast Catch-up 分支通知省略，沒有改遭遇或獎勵規則。 |
| `gmpowerbenchmark.js`、`gmpowerbenchmarkworldphase.js`、`gmalternateuniversebenchmark.js` | 既有正式核心基準測試以 gm-fixture lane 提供快照；現有高維 wrapper 只傳遞 context，不改倍率或公式。 |
| `combatfx.js` | 原 prepare adapter 綁既有 token；原 HP／盾同步（含既有 onUpdate 呼叫鏈）投影 getter；原 animate 的 pacing 原值只讀；播放 finally／clear 通知結束，不改 sleep、播放或音訊。 |
| `battlepipeline.js`、`ui.js`、`worldmapui.js` | 原銀河 Fast Catch-up 分支、銀河回顧 context、go 跨頁與合法紀元切換的 bridge 取消；原控制與 DOM hook 保留。 |
| `index.html`、`resource-manifest.json` | Bridge 在 combatcore 前載入，修改 JS 的 cache-bust 追加同批 token；SHA 指紋重產生，Babylon／GLB 仍按需下載。 |
| `tests/runtime/combat-events-contract.cjs`、`combat-events-integration.cjs`（新增） | 契約、負向、bounded queue、核心結果／完整 State 比較。 |
| `tests/runtime/combat-events-browser.js`、`combat-events-owner-browser.js`（新增） | 原 50 案瀏覽器套件的唯讀診斷 wrapper；實際高維六 stage／特殊 owner 完整 State 比較與 1000 深度身分 fixture，桌機／手機各跑。 |
| `tests/runtime/audio-lifecycle-browser.js` | 只在 acceptance flag 啟用 hostile／slow 消費者，保留原50斷言；另外驗證事件、唯一結算及佇列界限。 |
| `tests/runtime/alternate-universe-combat-integrity.js` | 原 HTML cache-bust 精確斷言跟隨同批新 token，其餘斷言不改。 |
| 三個 workflows：Runtime Integrity、Publish Release Gate、Publish Optimized Pages | 增加兩個 Node 契約與 owner browser；原 audio browser 由 wrapper 執行仍跑原50案，上傳新增診斷報告。 |
| `.gitignore` | 排除兩份本機瀏覽器報告，避免開發資料進發布成品。 |
| 本報告、T1-C TEST_EVIDENCE、PROJECT_HANDOFF、執行路線圖 | 可查來源、支援限制、實測與台帳。 |

## v1 契約與消費者所有權

`CivilizationCombatEvents.subscribe(callback, {lane, signal})` 回傳 idempotent dispose。callback 收到深複製／遞迴凍結 event 與 `{signal, isCurrent(), dropped}`。關閉 Renderer、GM 切案例、WebGL 故障或降級必須由消費者呼叫自己的 dispose／AbortController；本批沒有建立 Renderer，也不接管 Runtime。

| 欄位 | 意義 |
|---|---|
| `schema:1` | 格式版本；`validateEvent()` 驗證身分、型別與投影非有限數字。 |
| `battleId`／`sessionId` | 每 document UUID＋Bridge 私有遞增 serial；不使用牆鐘排序，不消耗戰鬥 Math.random。外部指定 ID 拒絕。 |
| `seq`／`eventId` | 單場序號；一般 eventId=`battleId:seq`。checkpoint 的 eventId=null，不能當新的結算紀錄。 |
| `mode`／`world`／`lane`／`source` | 正式模式、紀元、formal 或 gm-fixture、明確 Owner。非法模式或未知 Owner 拒絕。Bridge 是內部同 document 觀察介面，沒有 iframe／postMessage 請求入口；不代替 GM 授權。 |
| `actors`／`actor`／`target` | Owner 提供的玩家姓名、敵人名稱／ID／kind／位置；缺欄位 null 並標 unavailable，沒有 fabricated ID。姓名僅 name-only，非帳號 UUID。 |
| `availability`／`phase` | authoritative 表示這項投影來源有效；computed 不等於已交易／已存檔，presentation 是舊呈現 getter，lifecycle 是跳過／取消。 |
| `data` | 原事件允許欄位；HP／盾 state，computed start/final 或 presentation before/after；數值只接受有限非負數。core 未紀錄逐擊 HP，action.stateAvailability=unavailable。 |
| `skippable`／`expired`／`sourceIndex` | 中間動作／快照可省略；過期事件不交付，delivery token 可判定正在處理的舊動畫是否失效。 |
| `timing`／`pacing` | 原來源 index 與 combatfx 的既有 delay／speed 原值；沒有新播放 clock 或等待，durationMs 不存在即 null。 |

實際 event types：battle-start、encounter、combat-action、snapshot、actor-defeated、outcome、settlement、presentation-skipped、presentation-ended、cancelled。combat-action.sourceType 保留 attack／dodge／combo／counter／drain／mark／berserk／firstActor／battleEnd／combatSafety 的已知正式欄位。暴擊只讀原 crit／revengeCrit；沒有 attack-preparation 或 block 權威事件就 unavailable。HP 歸零只表示原計算結果 actor-defeated，不代表已施加死亡懲罰。標準 core 的 win 原值可用，winner 欄位仍 unavailable；鏡像有明確 winner。alive／動作上限中止不能解讀成正式已結算敗北。

### 非阻塞、取消與有限歷史

- Producer 不 await consumer、不新增 delay／timer。微任務交付；throw／rejected Promise 隔離並計數，第一個錯誤警告保留；無 consumer 完全不需視覺層。
- 每訂閱最多32待交付、一個 in-flight Promise，最多16訂閱；慢／永不 resolve 消費者不會多啟動畫。滿時優先移除 skippable，delivery.dropped 告知缺口；最極端仍可移除舊項。**這不是完整戰鬥事件紀錄**，消費者須以當前 snapshot 補位，不能據其計算收益。
- 同一 lane 最新場次取代舊場次，清佇列、abort 舊 token，晚到 presentation／settlement 拒絕；同 callback 去重。原清除呈現、跨頁、合法切紀元、登出、pagehide 有明確生命週期通知。pagehide 釋放訂閱。
- 每場最多正規化256原 action；沒有消費者或 document.hidden 時略過中間歷史，不保留第二份 logs。sourceEventCount／omitted／historyAvailability 明示 partial。Fast Catch-up 的既有跳過分支清空中間待播放，保留 current-state。
- 前台恢復／重訂閱只給標為 snapshot-only 的當前 checkpoint，不補播過期攻擊、結算或聲音。同場結算唯一，舊場次結算不送到新場次；正式 owner 不受拒絕影響。持久 latest 保存小投影，WeakMap 不延長原 result 生命。
- 凍結的是外部複製投影，不能凍結 Bridge 後續結算記帳；已加入 headless／前背景快照後成功結算的負向測試。
- 本批不宣稱效能改善。32／256 是安全上限，T2 比較 fixture 若需要完整歷史，須選小場次並明示 dropped；不可把 partial 視為逐擊動畫已完备。

### 音訊邊界

Bridge 無音訊 API／播放器／音效呼叫，不發送「請播放聲音」命令。原 CivilizationAudio 與 Scenes 保持唯一 owner。事件訂閱、checkpoint、背景恢復不能觸發音效重播；未來視覺層只能經另行授權的正式音效路徑。原 createBattlePresentationScene 等工廠保留。

## 所有正式模式覆蓋矩陣

記號：**C**=原 core 的開始、已知 action、computed 最後 HP／盾、win 原值；**P**=既有 combatfx 播放時的真實 HP／盾快照；**S**=下表指定 Owner 已成功結算後的有限投影。所有 action 都受有限容量／背景略過影響，不表示完整歷史。沒有 logs／沒有呈現的 C 以快照為主；所有未列詳細獎勵一律 unavailable。

| 合法模式／子流程 | 正式 Owner 與接點 | 支援／限制 | 倍速／背景／驗收 |
|---|---|---|---|
| 銀河普通／菁英／Boss 主線 | combatcore.fightOnce → runCombatCore；battlepipeline | C/P；S 只在原 save=true，XP／gold／裝備名稱投影；死亡懲罰細項 unavailable | 既有 1×／GM速度、連戰／catch-up；原50案及核心576比較 |
| 宇宙主線 Boss | secondworldcombat → combatmath；secondworldmainline 原 settle | C/P/S：XP／暗物質／暗能量／item名稱；不是重算收益 | 原動畫／背景分支，native50；原世界 integrity |
| 高維主線／持久生命／特殊生命效果 | thirdworldcombat → core；thirdworldprogress 原交易 | C/P；原 basis 關聯後 S：XP／弦／永久傷害／item名稱；Boss累積生命／回顧不混用。逐擊完整HP歷史 unavailable | headless current-state；native50，高維 rerun stage 原回歸 |
| 銀河／宇宙合法懸賞 | dungeoncore.bountyFightCore → runWorldCombatCore | C/P；詳細懸賞收益／冷卻結算 unavailable | 原合法入口／原50案；不得新增高維懸賞 |
| 銀河／宇宙競技場三階段 | dungeonarena.arenaFightCore／既有 run | C/P；rank／points／reward settlement 未接，partial | 原50案；各 stage context，既有官方操作不變 |
| 高維定相／異相各三戰 | thirdworldarena.fightCurrentStage → core；settleStage 仍原 owner | C/P；mode variant＋stage 0/1/2 有確定來源；rank／currency settlement unavailable | 真 owner 六 stage，桌機／手機各完整 State／結果有無 Bridge 一致；原敵人縮放保留 |
| 鏡像（含可進入紀元） | mirrorcombatcore；mirrordungeonrun.executeRun／finishRun | 獨立 mirror adapter C/P，有 winner／firstActor；S為整輪 wins/losses/VIP，不冒充單局掉落 | 原50案實际銀河／宇宙；48 seeded 三紀元核心比較；高維實際完整15局真機待驗 |
| 虛空幻境（各合法紀元） | dungeonvoid.voidMirageFightCore → core | C/P，floor、enemy有來源；每日領取／最高樓 reward unavailable | 原50案實際銀河／宇宙；高維核心fixture，實際高維長爬樓待驗 |
| 銀河文明災厄 | calamitycore 原 runCombatCore，headless | C、computed快照；無原 action logs 時不發攻擊；累積討伐／分享／領獎 unavailable | 原50案與既有 terminal／fast catch-up 回歸；無虛構高維災厄 |
| 宇宙文明災厄 | secondworldcalamityrun 原 core | C＋實際有呈現時 P；災厄累積／末戰特殊獎勵 unavailable | 原50案、shared terminal 原回歸 |
| 異宇宙200宇宙×5深度，依當前正式world | alternateuniversecombat → runWorldCombatCore；原 attemptSettlement | C/P（有原 presentation 時）；attemptId、depth、traits來自原活動。S只確認 depth提交，其他獎勵 unavailable；無正式敵人姓名時保持 null | 1000 depth **身分fixture**桌機／手機各跑，不等同1000場勝利／掉落驗收；原50案與AU八套契約 |
| 銀河／宇宙特殊怪、黑市等正式特殊遭遇 | specialencounter 原合法判斷 → specialcore.specialFightCore | C/P＋encounter（合法正式戰已產生）；特殊上下文／VIP／多段bonus／drops結算未接，partial | 原 suppress分支通知跳過；真 owner兩世界 State／結果一致及正式 source encounter；強制特殊長流程真機待驗 |
| 轉生後銀河主線回顧 | ui 的正式 reviewCombatOwner → core | C/P，mode=review；無獎勵事件，不新增存檔收益 | 原50案，原轉生／回顧 contract |
| 宇宙／高維回顧 | secondworldcombat.review／thirdworldcombat.reviewMode | C/P，以原 review basis；高維生命不算正式永久傷害收益 | 原50案；headless回顧如無動作來源給 snapshot |
| 銀河／宇宙災厄回顧 | secondworldcalamityui 的兩個原 core 呼叫 | C/P，mode=review，variant=calamity；沒有重新結算 | 原50案高紀元回看，原進入／返回音訊回歸 |
| GM戰力基準／三紀元 | gmpowerbenchmark、worldphase wrapper／thirdworldcombat test | gm-fixture C／headless快照，正式 lane 不被取代；無正式獎勵 | 原GM gate不動，fixture隔離契約，原GM native／startup回歸 |
| GM異宇宙基準 | gmalternateuniversebenchmark 的原 world core | gm-fixture C／headless快照，無正式活動 settle | 原AU GM基準測試、lane隔離與source白名單 |
| GM背景、Fast Catch-up、倍速的正式玩法 | 原 battlepipeline／secondworldmainline／高維／災厄／特殊各 owner | 沿用以上 mode，不重算／不await消費者；背景不累積舊動畫 | 2000背景場／10000慢快照／原Fast回歸，原倍率池不變；真裝置背景長測待補 |
| 其他 GM 離線估算／專用模擬器及完整性 probes | calamitygm、secondworldcalamitygm、arenagm5、arenapositioncore、thirdworldarenagm、specialgmbatch、mirrordungeongm、dungeongm、combatmarkintegrity、civilizationintegrity、thirdworldcombatintegrity 等 | 沒有 visualContext 就不建立偽正式場次，事件 unavailable。這些是獨立GM數值／驗算owner，不假設與正式呈現相同 | 既有計算／GM測試保留；將來若需要視覺診斷需明確 fixture adapter／GM gate，不把其輸出混入 formal |

所有列為 partial 的模式已有可靠開始／計算結果接線；**本批未完成所有正式模式的完整細部動畫或詳細 loot schema**。安全補足方向是於現有 reward transaction 成功處增設只讀投影、於原 actor update 處紀錄真實 before/after；不得由 Renderer 重算，也不得擴大本批修改 Owner。

## 自動驗收與實際限制

完整逐指令及摘要見 [T1-C TEST_EVIDENCE](3D_HYBRID_T1C_TEST_EVIDENCE_2026-10-12.json)。主要指令：

```sh
node tests/runtime/combat-events-contract.cjs
node tests/runtime/combat-events-integration.cjs
node tests/runtime/combat-events-browser.js
node tests/runtime/combat-events-owner-browser.js
node tests/runtime/js-integrity.js
python3 scripts/generate-resource-manifest.py > resource-manifest.json
node scripts/build-publish-dry-run.cjs
node tests/runtime/publish-candidate-browser.js
```

- 26契約／負向＋4整合通過。標準核心24種mode/world×8seed×3故障消費者=576次完整結果／State一致；鏡像48次原核心一致。這是**原核心fixture比較**，並非每個真控制器各576次。
- 真瀏覽器原50玩法／音訊斷言保留，另外掛 throw、reject、永不完成與唯讀collector；隊列實測≤128（四訂閱×32），事件無無效Schema／重複settlement。Bridge無消費者正常；原單voice與播放assertions仍在。
- 高維定／異相六stage與特殊兩紀元由實際 owner 運作，完整State／結果一致，桌機1280×800與手機390×844；AU 1000深度身分fixture非完整挑戰／掉落測試，沒有寫真雲端。
- T1-A15、T1-B10、正式桌機／手機十入口與38 fixture、GM桌機／手機各31真場景、正式／自由fixture與授權錯origin拒絕、模式／啟動／延遲載入／返回捲動全部原browser通過。
- 玩家53骨／9掛點／三LOD與G007五槽原browser、GLB18份Khronos驗證、混穿／空槽／遮蔽／重開／context loss／故障回退／釋放通過；資產二進位未修改。
- source manifest490指紋；精簡成品385檔、missingRefs=0，17正式音訊資產（6音樂／11SFX）、32背景；HTTP每檔bytes／SHA與音訊解碼、cache／Range／save隔離通過。不發布Blender／概念圖／開發報告。
- 初期測試失敗：起始裝備隨機ID／數值不同，改用同一seedState；特殊傷害原本有合法亂數，隔離fixture固定RNG；快速測試切場造成合法過期丟棄，測試額外微任務flush（正式不增加等待）；AU無名字保持null；舊HTML版本精確斷言更新。未刪或放寬State／原50案斷言。
- 自我檢查修正：外部快照遞迴freeze可能凍住內部後續結算，改為複製投影再freeze；headless／background後settlement負向測試通過。
- 環境：Chromium／SwiftShader與標準TTF/OTF Fontconfig。早期T1-B發現預設WOFF2字體頭less顯示異常，沿用隔離Fontconfig；未改產品字體或UI期待值。
- 未驗：真手機iOS／Android、實際GPU／音效硬體、系統背景節流、長時間無限連戰、真玩家帳號雲端讀寫及真獎勵帳本、1000AU全勝／全traits、全部高維鏡像／虛空長流程。固定fixture不能取代這些實機驗收。
- 沒有首次下載／效能改善的前後量測，不宣稱變快；驗證新Bridge與隔離consumer不请求Babylon／GLB，原按需下載測試仍通過。

## 玩家實機驗收

桌機與手機各操作：三紀元主線（普通／菁英／Boss）、懸賞、競技場、高維定相／異相三戰、鏡像、虛空、災厄、異宇宙、特殊遭遇、轉生回顧。確認原HP／盾、文字、勝負及結算正常；連戰停止、跨頁／切紀元與返回不留舊畫面。GM1×／1.5×／2×、背景／回前台／Fast Catch-up不補播舊聲音。

開關／重開原3D預覽、角色五槽／空槽、GM八分類31案例；手機最大化／還原、橫直轉、返回捲動，正式音樂切換及存檔正常。**本批畫面應維持原樣**；新增的是底層觀察契約，不應期待畫面已換成2.5D。

## 提交與回復／T2-A Gate

- 程式施工結束 HEAD：`e74b9d3a47417b6e1d9dad74e1804b7455d328ed`；起始 HEAD 見本檔首節。最終 main 是本報告與交接證據提交（其 parent 為本程式 SHA）；最終文件 HEAD／exact-HEAD CI 由 GitHub main 及交付回報獨立查核，避免在提交內自我引用 SHA。
- exact-HEAD Actions／Pages：提交後獨立查詢；仍running或不可得時列待確認，不宣稱全通過。
- 回復：先revert本批證據／交接提交，再revert本批程式提交（新增Bridge／owner hooks／HTML版本／manifest／workflow一起）；不清存檔、快取或雲端資料。
- T2-A前置：本批exact-HEAD CI與實機Gate核對、使用者另行授權；比較fixture明示computed與committed、partial／dropped、未接reward及音訊邊界，選用足夠小且有權威事件的同場資料。
- T2～T5全未施工，本批結束停止。原第27～40批規格保持有效。
