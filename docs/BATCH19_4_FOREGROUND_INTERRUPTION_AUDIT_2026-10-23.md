# 第19-4批：前景中斷調查與施工安全閘門

歷史狀態：本文件記錄首次唯讀盤點與施工前安全閘門。使用者確認已保存削血必須同步給收益後，後續整合沿用同一分支／PR；目前施工與驗收以[第19-4批工程報告](BATCH19_4_FOREGROUND_IMPLEMENTATION_2026-10-23.md)為準。以下原始數據不覆寫為修復後數據。

## 基準與證據界線

- 執行時重新查詢 GitHub main、fetch 後建立分支，基準 `b6d254c2dc9d4fb6b5d3d97ae48bd5db0263348f`（PR #88）。本機原 checkout 為 PR #87，遠端 compare 證實僅 Runtime workflow 不同；所有本報告正式驗證最後皆在 fetch 後 main 執行。
- 已讀 `PROJECT_HANDOFF.md`、第19批後續規劃、兩份跨戰鬥生命週期報告，並沿下表 owner 的計算→呈現→結算路徑追查。舊文件中「19-3未施工」等歷史文字不作為正式狀態判定。
- 無正式 JS、數值、存檔 schema、workflow 或既有安全斷言變更。19-1／19-2／19-3與 Issue #86／PR #88 的 Actions 整理保留。
- 瀏覽器證據是 Linux Chromium、390×844、隔離 SDK 身分；透過正式新手按鈕完成導入，再呼叫正式高維 player flow，使用數值 fixture。**不是使用玩家存檔、不是完整全模式 UI 矩陣，也不是 iPhone 真機。** hidden／blur 是 DOM 事件注入；不代表真實 OS 背景／計時器暫停驗收。
- 可重現腳本及逐筆數據：[probe.cjs](evidence/batch19-4/probe.cjs)、[probe.json](evidence/batch19-4/probe.json)。腳本驗證的是現有漏洞存在，通過不代表修復通過。

重現：在repo root執行 `mkdir -p work/19-4`、以 `python3 -m http.server 4173 --bind 127.0.0.1` 啟動本機伺服器，另執行 `node docs/evidence/batch19-4/probe.cjs`。需已安裝Playwright與Chromium；可指定 `NODE_PATH` 使用既有套件、`CHROMIUM_EXECUTABLE` 指定既有browser、`RUNTIME_SMOKE_URL` 指定本機網址，無須重裝瀏覽器。結果預設寫 `work/19-4/probe.json`（可用 `PROBE_OUTPUT` 改址）；執行時間／heap每次不同。請僅在隔離測試環境執行，不對真帳號使用SDK fixture。

## 已證實的根因

1. `combatcore.js::fightOnce` 先寫 HP、死亡懲罰或 EXP／金幣／掉落／主線進度，並 `save(false)`；`battlepipeline.js::runBattles` 之後才 `await animateFight`。停止動畫無法撤回已持久化的單場結果。
2. `thirdworldrun.js::runOneBattle` 在 `onBattle` 呈現前呼叫 `settleThirdWorldCombatResult`。`thirdworldprogress.js` 同一交易寫永久 HP、EXP、維度弦、裝備、稱號與劇情進度。GM 背景開關只保護後續連戰等待，未延後這筆交易。
3. `thirdworldplayerflow.js::registerEnvironmentSync` 收到背景事件就清除正在呈現的動畫，沒有檢查 GM 背景開關；註解明言該 step 已結算。返回後看到死亡是已提交資料，不是傷害公式突然放大。
4. `combatfx.js` 的清除會讓 `p.active=false`；標準播放離開迴圈後正常 resolve，不回傳具權威性的 completed/cancelled 結果。依賴 `await` 正常返回的後置結算也沒有「這場真的完整播放」保證。高維競技甚至在播放例外後明確繼續結算。
5. 播放器先 `p.index++` 再等命中延遲，`index` 是已取出的事件，不是完成游標。實測 `index=1`、Boss HP 仍為100、正在等待70ms命中；清除後 Promise 仍正常完成。直接依此 index 提交會把未命中的傷害算入。

## 各模式現況盤點

下列除高維／共用播放的具體數據外，為**正式 source 路徑判讀，尚未逐模式瀏覽器確認**。全部核心皆同步一次算出單場；連戰則逐場呼叫，不是逐回合即時計算。

| 模式／正式 owner | 正式落帳時點 | 切頁／App 的程式路徑（GM關） | 關閉／重載的既有契約 | GM開／存檔／殘留風險 |
|---|---|---|---|---|
| 銀河地圖／主線：combatcore、battlepipeline | 動畫前完整發獎、進度、死亡懲罰及save | 共用環境事件未使本場結果失效；後續等待不等於取消本場 | 已save的整場結果保留，包括尚未播放部分 | 連戰沿main背景owner補算；activeMainBattleContext在finally釋放，舊結算UI有跨模式保護，但不是單場取消保護 |
| 宇宙主線：secondworldcombat、secondworldmainline、secondworldrewards | 正常呈現後發獎／死亡懲罰；補算另有原時長扣抵 | waitForForeground僅連戰進場前；本場await返回後未驗取消權威 | 已提交勝場保留；未提交場本身無持久結果，但入場／其他存檔另計 | GM開沿main credit；finally清呈現／context。必須避免舊await返回後污染下一場 |
| 高維十王：thirdworldcombat、run、progress、playerflow | 呈現前整筆永久HP與收益交易 | 任一背景環境事件直接清呈現；連戰下一場才等待 | 整場結果已存檔；非persisted pagehide清run，persisted則保留run | GM開沿third-world補算；GM關也已提前結算；終場run可能在動畫前就被清除 |
| 銀河災厄：calamitycore、calamityrun、calamityui | battle內先applyBattleResult及save，再UI動畫 | pagehide停止run；visibility/blur不提供本場取消結算 | 永久HP／印記／首殺稱號可能已提交；已max的HP設null按原契約重置 | continuous且GM開免pagehide停止；單場run可能已先finish，不再有active可取消 |
| 宇宙災厄：secondworldcalamity、run、ui | runCombat後立即settle，原子save，再動畫 | pagehide停止run；不是當前結果失效 | currentHp／trueKills／文明等級／首殺稱號已可能提交；失敗save回滾 | continuous且GM開免停止；同樣有動畫前run先結束問題 |
| 懸賞：dungeoncore、dungeonbounty | core先寫玩家HP；獎勵在動畫後，healAfterRound存檔 | continuous掛bounty背景sleep；無單場取消提交契約 | 開場consumeDailyDungeonUse及save已扣次，須保留；提前寫HP可能被其他save帶入 | GM設定不等同身分；取消需清phase／busy／audio／flow，保留合法已完成場 |
| 銀河／宇宙競技：dungeonarena | core寫HP；stage分數動畫後、round points在結束時入帳 | 共用動畫await無取消驗證；continuous後續sleep非單場中止 | 入場先扣次save；中間stage有save；不能把整round回滾抹掉合法stage | arenaState連戰與phase保留；既有跨模式blocker已防舊continuous誤阻擋，不得回退 |
| 高維競技：thirdworldarena、thirdworldarenaui | deferSettlement先存pendingCombat；動畫後settleStage | UI catch動畫錯誤仍繼續結算，沒有cancelled路徑 | 入場transaction持久化；重載recoverInterruptedRun保留扣次、補血清交易 | stage已有過期守衛，但無單場foreground generation；reset不可誤清已入帳stage |
| 虛空：dungeonvoid、dungeonvoidui | fightNextFloor先recordClear／currentFloor／save，再onFloorComplete動畫 | 背景sleep／GM gate屬連戰；沒有本場未完成保護 | 已save的樓層與每日最高保留，含現在提前提交的樓層 | Fast Catch-up沿void原owner；取消須釋放void run及UI，不可動離線收益 |
| 鏡像：mirrorcombatcore、mirrordungeonrun／state | 每戰動畫後累積wins/losses，整run完才發VIP及紀錄 | 獨立mirror播放器；沒有統一foreground取消，命中等待後部分分支也未重查active | begin先記running；重載running→failed、wins/losses清0是原存檔恢復契約；歷史已完成run保留 | 未掛既有GM Fast Catch-up flow，不能聲稱所有模式原本皆有補算；目前20戰中間勝負是記憶體資料 |
| 特殊怪：specialcore、specialencounter | core先寫玩家HP；動畫後正式獎勵／懲罰／save | 位於主線ctx中，動畫await無cancel權威；ready delay也須隔離 | 原主線已完成場不可回滾；特殊怪當前場必須獨立token | 沿main補算，world3正式特殊怪禁止；仍保留現有門檻及掉落owner |
| 異宇宙：alternateuniversecombat、attempt、ui | 純計算→動畫→settleAttempt；attemptId防不同場 | 沒有foreground失效，清動畫正常返回仍可settle | attempt持久，未結算可再進；明確放棄目前記一次失敗，不應拿來實作新中斷規則 | finally清battleContext；須防已取消舊callback結算同一持久attempt，且不能算放棄失敗 |
| 回顧：ui銀河review、secondworldmainline review、高維review | 純挑戰；正式收益隔離 | 無收益不代表可在離頁後顯示完整勝利；仍需單場取消 | 已有state隔離斷言需保留；不新增正式成長 | 高維review入口／UI路徑尚待瀏覽器覆核；不得提前做第20批退場 |

共用 App 偵測依 `backgroundprogress.js` 的 visibilitychange／blur／focus／pagehide／pageshow；`environmentBackground = pageHidden || windowBlurred`。blur會包含開發工具、對話框等，不能直接拿現有背景布林當成取消判定。鏡像等未訂閱完整共用生命週期的模式須明確接入。實際 iOS 鎖屏／OS殺頁未測。

## 三項高風險驗證

### 一、單場提前結算：已重現

正式高維 boss 0、原始及目前HP均11億、轉生次數1、汲取60級、滿血、背景關、鎖血關。只替換數值輸入與固定RNG，正式core/run/settlement/render不替換。

最新長序列測試：動畫仍在opening，`index=0 / 516517`、畫面Boss HP仍為11億，永久HP已0；hidden後動畫為null，永久HP仍0。早先短序列測試也曾得到 `index=1 / 25`、畫面1,013,466,153 HP、永久0（早先探索紀錄不作最終逐筆檔）。此證據顯示不必離頁就已提前落帳，離頁清動畫使差異立刻可見。

### 二、HP事件重建：終場初驗通過，提交契約不通過

- 依enemyStartHp開始，扣 `attack.actualDamage`（只針對enemy）、扣反噬的target enemy actualDamage，加enemy drain.healed及enemy absorption.healed；不是相加玩家damage。actualDamage已扣盾與不屈的實際結果。回血以正式enemyHealCap處理。
- 100組固定seed，含ward／absorption／backlash／indomitable與enemy drain／combo／counter，重建**終場**HP與正式核心100/100一致。這不等於已逐事件比對內部權威HP，也沒有證明所有高維stage組合通過。
- 原播放器index提前遞增，無獨立applied/completed游標；終場重建正確不能證明中斷時刻正確。
- **實測阻擋**：正式runThirdWorldBossCombat產出合法完整結果後，只將永久HP由1,100,000,000寫為1,099,999,900，再交原settleThirdWorldCombatResult，得到 `stale-settlement`。不得放寬該斷言。
- 高維save guard僅允許boss持久欄位currentHp，會清除未列入白名單的戰鬥欄位；不能偷偷把pending結果／完整events放進state。
- 高維交易同時以起始／終止HP計算EXP、維度弦、stage、aggregate稱號／劇情與每場裝備。只存HP再用新HP作下一場起點，可能失去這段傷害的收益或aggregate跨級事件；改回舊起點又涉及重複結算。**目前尚無已驗證能同時保證永久HP、獎勵與存檔一致性的方案，依本次指示停止高風險Runtime施工。不是已證明必須全面重寫核心。**

### 三、資源與存檔：僅Linux基準，不是iPhone驗收

| 單場回合 | events | 核心ms | events UTF-8 bytes | logs bytes | 候選Float64索引bytes | 建索引ms |
|---:|---:|---:|---:|---:|---:|---:|
|10|20|0.20|6,901|1,001|160|0.20|
|1,000|2,000|2.30|690,001|100,001|16,000|0.30|
|10,000|20,000|11.80|6,900,001|1,000,001|160,000|0.20|

時間為一次執行的wall time，低於計時解析度或JIT差異不具排序意義。bytes為序列化資料量，不是JS heap。候選索引僅探測，未整合Runtime，不能稱修改後負擔。

正式高維長戰鬥fixture：85回合、516,517 events、adapter約894.2ms、events 86,261,025 bytes、logs 8,778,392 bytes，candidate dense索引4,132,136 bytes。83次玩家實際回血、172,032次敵方回血；固定RNG .29會反覆觸發連擊／反擊／汲取，屬刻意壓力輸入，不代表一般玩家事件分布。沒有觸發action safety，也沒有提高或取消安全上限。正式adapter已deepFreezeClone events及diagnosticCombat，本批若再複製完整events會放大負擔。

頁面整體Chrome performance.memory快照used約342.66MB／total約407.66MB，**含測試序列化與診斷，非單場記憶體差額、更非峰值或iPhone記憶體**。10次隔離新狀態正式save(false)皆成功，2.4～4.8ms；沒有真帳號雲端寫入、老帳號大型背包或iOS儲存壓力測試。**檢查點頻率尚未實作／量測；沒有修改前後CPU／記憶體改善可宣稱。**

## 供確認的有限範圍替代方案

保留一次算完整單場，不改公式、不加入每回合JSON、不建立一般場次逐回合存檔。以下是待驗證設計，非已完成實作：

1. 共用單場生命週期：每場id、mode、world、generation、cancelled、presentationCompleted、commitStarted／committed；新模式不得接收舊generation回呼。visibility hidden／pagehide（含bfcache）立即失效；focus/pageshow只恢復UI，不恢復已取消場。blur延後至下一可執行檢查點，以document.hasFocus重查並排除同頁焦點／對話框假訊號；需真瀏覽器策略測試，不能假定一個delay涵蓋OS暫停。GM gate每次依實際gmBackgroundBattleEnabled判定，GM開沿既有credit與pacing。
2. 一般場：把已提前落帳的銀河fightOnce拆成純計算與原settlement兩步；宇宙、懸賞、競技、特殊、異宇宙等後置settlement增加完整播放＋token檢查；虛空recordClear移到合法完成後。鏡像獨立播放器也要相同完成結果。取消清run／phase／busy／audio／presentation／背景flow，保留既有入場扣次與已完成場，不走死亡或異宇宙abandon懲罰。
3. 長血場：播放端新增真正「已套用命中／回血／反噬事件」ack，與提前取出的index分開。優先使用O(1) HP reducer及scalar游標，不複製events；如事件語意無法覆蓋某分支，僅在正式mutation附數值afterHp／事件邊界，不複製logs或動畫。
4. 三類Boss新增受控partial-checkpoint入口，與完整勝敗入口明確分離。保留startHp／lastCommittedHp／applied cursor及狀態版本的CAS；HP可以因合法回血上升，不能只取minimum；只提交已ack的HP。固定牆鐘間隔（候選5秒，待實測）且HP有變時才交易存檔，正常完成或可執行離頁事件可flush，絕不依賴最後flush成功。直接關閉只承諾最後成功checkpoint。
5. 高維原stale及duplicate保護保留；complete-result必須驗證該場最後成功checkpoint基線，而非略過原起始HP比對。對已提交段與終場段採明確差額，save失敗不得更新commit cursor或發獎。取消後永不讓舊full result復活；load不還原events，僅回復最後持久結果。
6. **需要先固定的正式收益契約**：中止場的永久削血是否同時領取等量EXP／維度弦？兩個方案都不能直接套用目前整場交易。若只存HP，必須明確承認中止這段沒有EXP／弦，並處理aggregate稱號／劇情不能因checkpoint改寫基線而永久漏發；若給等量收益，要另證明回血導致HP反彈時如何不重複發獎。每場裝備、首殺及死亡懲罰仍只在合法完整場結算。不能自行決定為了保留HP就發全場獎勵。
7. 若要持久化待處理aggregate通知或reward anchor，只能新增很小且有版本／load恢復契約的資料，並同步save guard白名單與遷移測試；先確認方案，不能把完整basis／runtime塞進存檔。災厄則沿既有currentHp及kill/reset契約，HP為0的合法終擊與trueKill／首殺必須同一受保護交易，不能先存0之後再發獎。

依賴順序：固定partial reward契約→ack／CAS／save failure原型→三類Boss逐事件與重載驗證→一般owner整合→同一Draft PR完整16項矩陣。此方案不要求更換combatcore的單場計算模型，但目前尚未達到「安全方案已證明可行」施工門檻。

## 測試與交付狀態

- 已執行：上列真Chromium探測；100組終場HP還原；三種長度事件／索引測量；10次隔離正式save；游標提前／clear正常resolve；正式stale保護反例。
- 既有保護回歸通過：`cross-combat-stale-continuous-regression.cjs`、`cross-mode-late-settlement-regression.cjs`、`unified-combat-runtime-contract.cjs`；`scripts/ci-impact.cjs --self-test` 14案例通過、22個永久workflow無Batch命名。
- **未完成**：修復前後完整16項Browser回歸、一般／GM關／GM開全模式native入口、快勝／快敗／競態／連戰隔離／重複提交／跨模式恢復、實際關閉重載及bfcache、自動化WebKit及真機iPhone、iOS鎖屏與系統終止、老存檔／完整裝備背包checkpoint成本。高維重現為轉生數值fixture，不是玩家真實存檔還原。
- 此次只提交調查文件及探測證據，正式修改檔案：**無**。共用／專用修正皆為上述待驗證方案，沒有已交付的永久HP保護或新中斷順序。
- PR最新SHA與Actions以PR檢查頁為準；docs-only Functional CI只驗分類，不能冒充Runtime或修復驗收。沒有手動啟動不受影響的大型workflow、沒有新增workflow或重複安裝瀏覽器。
- 合併判定：**不符合最終修復交付；不可安全合併，維持Draft；未改／未推main。** 待安全契約確認與實作後，必須重新取得PR最新head必要Actions全綠；使用者批准合併後再查同main SHA Runtime／Functional CI／Pages，方能封箱。
