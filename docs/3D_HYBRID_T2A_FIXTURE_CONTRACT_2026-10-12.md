# T2-A｜共用可重現 fixture 契約 v1

## 檔案與工具

- [owner-fixtures.json](../development/hybrid-comparison/t2a-v1/owner-fixtures.json)：schema `cw.t2a.owner-fixtures`、version1、正式來源SHA、三代表、五個episode、33外觀與18既有GLB audit。
- [comparison-controls.json](../development/hybrid-comparison/t2a-v1/comparison-controls.json)：schema `cw.t2a.comparison-controls`，鏡頭／尺度／同場條件與測量順序。
- [visual-only-script.json](../development/hybrid-comparison/t2a-v1/visual-only-script.json)：另schema、authority=none，僅pose/actor/duration/order；無HP、damage、crit、win、loot、eventId。
- [measurement-report-template.json](../development/hybrid-comparison/t2a-v1/measurement-report-template.json)：所有實測欄null/not-run，未作視覺或FPS驗證。
- [fixture工具](../scripts/hybrid-comparison-fixtures.cjs)：`node scripts/hybrid-comparison-fixtures.cjs --check`（預設只驗）／`--write`（只寫固定開發路徑）。
- [量測報告工具](../scripts/hybrid-comparison-measurements.cjs)：stdout只產生空白template，`frames`計算有明確synthetic/observed標記，沒有live sampler、timer或GPU估算器。

## 真實來源、隔離與重現

在全新Node VM載入未修改的data/worldmaps-earth/engine/balance/alternateuniversedata/traits/combatmath/combatcore/Bridge/Appearance/FormalSnapshots。traits的既有啟動render由隔離no-op承接（沒有Renderer）；storage讀取為空fixture，write/fetch/timer均拒絕，不暴露任何真帳號、瀏覽器、檔案API。隔離State只含必要的虛構測試身分、合法unlock與G007名冊。

enemy由正式createMonsterEncounter、正式balance／traits選取；LCG seed僅作VM的注入RNG與原core options.rng，不改正式Math.random、公式或玩家State。玩家1600HP／380ATK／100DEF／18crit／12dodge是**明示數值fixture**，不是聲稱某正式存檔／G007裝備能得到此能力；Boss敗北case另有明示弱輸入。

使用原runCombatCore的visualContext mode=main/world1/owner=combatcore.js、fixture=true，因此原CivilizationCombatEvents v1自己產生gm-fixture事件。固定VM realm namespace（test mock）供可重現序列，並非修改正式ID生成器。每episode原raw結果產出後microtask drain，再dispose collector；對整份隔離State前後比較。從未呼叫fightOnce、save、掉落或settlement，沒有第二套公式／獎勵引擎。

source fingerprints對來源改動會失敗；每case與整bundle有SHA256。再生byte一致才通過。未來正式Owner改動需另批核對／重生／版本更新，不得靜默沿用。來源SHA／fixtureSHA／controlsSHA與資產SHA是不同欄，不能混用。

## 五個episode的可用性

| episode | 事件數／原動作數 | 來源與可用內容 | 不能宣稱 |
|---|---|---|---|
| normal-baseline | 6/3 | Lv31普通、原attack／crit flags、原final與win=true | 攻擊clip已存在、逐擊HP已完整 |
| elite-baseline | 12/9 | Lv34菁英、原attack／crit flags、win=true | 菁英真模型已完成 |
| boss-baseline | 10/7 | Lv35Boss、原attack／dodge、win=true | 未知格擋／攻擊準備已發生 |
| boss-player-defeat | 5/2 | 同Boss、明示弱玩家，final.player.hp=0 | 正式死亡懲罰或存檔已提交 |
| elite-effects-owner-input | 24/22 | 同正式敵人身分＋明示敵方ability35%輸入，由原core真的產生combo/counter/drain | 該正式怪本來就有這些技能；此case actionBudgetReached，双方存活，win=false不是已結算敗北 |

五場均omitted=0、dropped=0且<32待交付界限，Bridge原sourceIndex／seq保留、不同battleId；source動作<256。`captureCoverage=complete-known-core-events`只說已知core事件全收到，**historyAvailability仍partial**，逐擊HP／shield歷史與pacing unavailable。開始shield=null不能改成已知0；final盾是原core值。沒有commit、結算或loot事件。

已知damage／actualDamage、crit/revengeCrit、dodge與效果只來自raw event；不能看傷害高推crit。core效果數值fixture與純視覺示範分離。HP／盾只顯示已知start/final；T2-B可在outcome切換bar，不得從damage累減補造真實逐擊HP。只有另行真capture的P快照才可提供更細過程，而且須另外標snapshot-only。

## 三方案同資料與重播規則

`comparisonInput(bundle, caseId, scheme, appearanceVariant)`驗證bundle後給深複製／遞迴凍結的相同輸入，A/B/C不改events、actor、computed或appearance；外層scope=development-only、lane=gm-fixture。appearance內的source=formal是原API格式，不表示真帳號資料，消費者必須以外層fixture標籤為準。scheme只決定外部渲染路徑，不進戰鬥資料；五case×33外觀×B/C對A=330次一致性比對。

33外觀是G007五槽全部32子集合（含全部空／全部穿），加G006頭盔/G007其他槽與空飾品混穿；G006頭盔真名稱「極寒封閉盔」但沒有對應GLB，明確geometry-fallback，不能稱真模型完成或依此判方案勝負。其他已登錄五槽品質由Appearance原resolver解析，錯紀元／名字不能冒用G007。

T2-B離線播放用新的playbackSessionId＋generation＋AbortSignal，把原eventId保留為來源識別；同fixture可重播但不能把舊source seq當新正式場次。切scheme／case／variant要cancel、dispose前一Renderer再開新session；晚到async結果丟棄。**不得把離線event重新餵正式Bridge，也不得重新呼叫core作播放**。本批沒有建立播放controller或Renderer。

live Bridge的每訂閱32、最多16、partial/dropped、背景略過與checkpoint規則維持。背景回前台只拿目前狀態，不補音效／舊action；純視覺腳本必須顯示「示範，非正式事件」，另一channel無任何勝負／傷害／收益。

## 音訊、發布與下批限制

A/B/C預設全靜音。聲畫對齊在T2-B先量impact cue時間，不新建audio owner；T2-C若要正式音效驗收，另經既有授權音訊路徑，checkpoint/replay不能雙播。

開發檔位於development，工具位於scripts、測試位於tests；不被index、正式manifest或asset registry引用。精簡publish實際closure必須證明全部排除，既有Bridge/3D仍保留。未提供公開開發HTML頁、GM新增案例或玩家入口；原八類31案不變。

T2-B以此資料建立隔離Renderer，T2-C才能量畫質、FPS與硬體；本批測的是Schema／真來源／資料一致性，不是原型視覺品質。
