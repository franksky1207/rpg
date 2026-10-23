# 第19-4批：全戰鬥前景中斷與永久削血收益

狀態：整合施工與本機驗證完成，PR #89 維持 Draft；尚待本 PR 最新 SHA 的 Actions。未合併、未封箱、未取得 iPhone 真機驗收。

## 依據與根因

唯一施工基準為重新 fetch 的 main `b6d254c2dc9d4fb6b5d3d97ae48bd5db0263348f`（PR #88）。同分支 `fix/batch19-4-foreground-combat`、同一 [Draft PR #89](https://github.com/franksky1207/rpg/pull/89)。已讀交接、第19批正式規劃、跨戰鬥生命週期報告；[唯讀調查與原始數據](BATCH19_4_FOREGROUND_INTERRUPTION_AUDIT_2026-10-23.md) 保留當時的調查結論，以下為施工後狀態。

實際根因不是傷害公式：銀河主線、高維十王、兩種災厄、虛空在動畫前已寫正式結果；其他入口雖於動畫後寫入，清除動畫卻可使 await 成功返回，沒有當前單場失效權威。高維環境事件又會直接清動畫。播放器原有 `index++` 在命中等待之前，不能代表傷害已實際發生。銀河主線另有 levelcap、levelcapresult、reincarnationrerunprogress 包裝鏈，必須把 EXP 轉金及突破回填一起延後，僅移動底層結算不足。

保留一次計算完整戰鬥、既有 events/turns、數值、成長、失敗及入場消耗契約。沒有全面逐回合計算或存檔。19-1／19-2／19-3、既有離線收益與 Issue #86／PR #88 工作流結構保留。

## 逐模式原本與修正後行為

所有入口原本均先完整計算；詳細 App／關閉／GM／存檔／清理原貌見調查報告逐模式表。下列前景關閉規則也適用 GM 背景開關關閉。

| 模式 | 原落帳時機與風險 | 現在的提交及中斷契約 |
|---|---|---|
| 銀河地圖怪／主線 Boss | 動畫前 HP、獎勵、進度、死亡懲罰、save | 純計算 pending，動畫有效完成後一次提交；中斷不扣失敗、不獲未完成成果 |
| 宇宙主線／Boss | 動畫後，清動畫可繼續結算 | 共用單場取消使 await 拒絕，清 context、sampler、busy；已完成場保留 |
| 高維十王 | 動畫前整筆永久 HP／EXP／弦／裝備／階段 | HP 與對應收益有限頻率 checkpoint；整場死亡／裝備／擊殺及完成只在有效結束後提交 |
| 銀河／宇宙災厄 | 動畫前永久 HP／印記／真擊殺／文明／首殺 | 先呈現同一預算結果；中斷只保留已播放正 HP，原本無逐傷害收益，因此不新增收益；擊殺獎勵延後 |
| 懸賞 | core 先寫 HP、動畫後獎勵 | UI 使用 deferState；保留原入場扣次，未完成單場無獎勵，釋放 phase／audio／busy |
| 銀河／宇宙競技 | core 先寫 HP、stage 後分數、整輪後 points | 當前 stage 中止；先前合法 stage 的分數保留並按原 points owner 提交一次 |
| 高維競技 | 原有 pendingCombat，但 UI 吞動畫錯誤仍 settle | 中斷丟棄 pending，按原 owner 保存已完成 stage，停止輪次；不登記當前失敗 |
| 虛空 | recordClear／進樓／save 在動畫前 | beforeFloor 呈現後才提交同一預算結果，不重骰；先前合法樓層保留 |
| 鏡像 | 每場動畫後記憶體累計，reload 抹除當輪 | 每個合法完成單場保存比分；中斷可繼續當日同輪，使用入場時同一份緊湊 snapshot；20 場後原 VIP／紀錄／稱號僅發一次 |
| 特殊怪 | core 先寫 HP，動畫後發獎／懲罰 | HP 及正式結果延後；特殊告警、ready 延遲也檢查離頁 epoch，先前主線成果保留 |
| 異宇宙 | 動畫後 settleAttempt，但清動畫不使 attempt 失效 | 中斷不 settle、不當成放棄失敗；保留原 attempt 可再挑戰，finally 清 owner |
| 現有合法回顧入口 | 無正式獎勵，但可因清動畫直接顯示勝利 | 一樣取消當前單場，不提前執行第20批退場 |

GM 僅以 `gmBackgroundBattleEnabled()` 的實際偏好放行。開啟時沿用各模式既有背景／Fast Catch-up／時間與倍速 owner；沒有替原本不支援補算的模式新增補算。關閉時不依 GM 身分豁免。原純同步／headless API 保持既有同步結算，正式呈現 UI 才使用 defer；真實補算仍沿原 suppressed 分支。

## 共用有效性與中斷順序

`combatlifecycle.js` 只有當前 lifetime、id、取消／完成旗標、departure epoch、少量 waiter 與 WeakMap；不保存事件副本。`combatfx.js` 標準及鏡像播放器共用它，開始先要求 lifecycle owner 存在，命中等待 race 取消訊號，HP mutation 後才 acknowledge 實際進度。一般戰鬥不建立存檔索引。

1. 入場沿原扣次契約，計算純結果；ready／場間延遲保留 run epoch。
2. 正式播放器取得單場 authority；尚未播放事件沒有正式效果。
3. hidden／pagehide 立即標記失效，先以最後 applied 正 HP 嘗試 checkpoint，再喚醒等待、清自己的 presentation；舊 owner 不得清新模式。
4. 取消錯誤回到模式 owner，釋放 audio、sampler、busy／context；不呼叫整場正式結算。返回只恢復可操作 UI，不自動復活舊場或舊連戰。
5. 若動畫合法完成先取得 complete，之後離頁不回滾該合法場；若離頁先取得取消，延遲 continuation 不可提交。模式原有 stale／duplicate／交易回滾守衛保留。

`visibilitychange hidden`、`pagehide` 包括 persisted bfcache 立即中斷；`pageshow`／focus 不復活單場。blur 採 200ms 後重查 `document.hasFocus()`：仍有 focus 的同頁 blur 忽略，短對話框返回可取消排程，持續失焦視為離開。瀏覽器不能普遍分辨 OS App 切換與失焦 DevTools，因此超過此策略的 DevTools／長系統對話框可能中止，並未宣稱完全辨識。離頁 epoch 也阻止在場間切出再返回後繼續啟動下一場。

## 永久 HP 與收益一起保存

不加總攻擊傷害。直接取共用正式播放器在該事件 HP mutation 後的 enemyHp，含 actualDamage、護盾、吸收、回血、反傷／保命事件的既有順序。索引只保留最後 applied index 與正 HP；不複製 events/logs，不以預先遞增的 index 當已完成。

高維 checkpoint 在既有 `runSettlementTransaction` 內，同時寫 currentHp、原 EXP／維度弦收益及合法 HP 門檻的 aggregate 進度。每個 Boss 新增一個可選數字 `rewardFloorHp`，記錄已支付收益的最低 HP。**currentHp 仍會隨實際回血升高；rewardFloorHp 只用來避免重複領錢，不拿來替代真實 HP。** 已發收益不倒扣、不倒退等級；重新削掉已付過的回血區間不再發錢，低於已付區間才付新增差額。最終整場摘要包含本場 checkpoint 已付及最後補付，正式狀態僅加尚未付過部分。

例：11億起始，checkpoint 已付200，最終擊殺僅新增1,099,999,800；整場摘要與累計正式收益都等於1,100,000,000。中斷後重新載入沿持久 watermark 去重。既有 first-kill、裝備、玩家死亡、Boss HP=0、文明擊殺／完成等尾端成果，只在完整有效結束後結算。致命事件已播放但尾端未完成時，保留最後一次正 HP，不先提交0。

每 5 秒、且有實際 applied 正 HP 才可 checkpoint；離頁另外盡力 flush。關閉／iOS 強制終止只能恢復最後一次成功保存，不承諾最後一刻事件必定落盤。save 失敗交易整體回滾，不更新已提交 cursor；後續正式結算也保留 stale 及 duplicate 拒絕。

Schema 升18是為了讓舊 Schema17 runtime 拒絕新格式，避免舊 normalizer 抹掉收入 watermark／鏡像 resume 後重複發獎。1–17全部合法升級，升級前加 byte-exact pre-schema18 備份，原 pre16／pre17 與 future-version 保護保留；19及以上仍 fail closed。新備份不自動清除。既有測試只更新「當前版本」與 cache token，保留舊版本 fixture／安全斷言並新增 future19，沒有跳過或降低測試。

## CPU、記憶體與存檔證據

Linux Chromium、390×844，fixture 非玩家存檔，單次數據受 JIT／GC／同機負載影響，不能推論 iPhone 已通過。基準及原100組事件重播與 core 最終 HP 交叉驗證在原調查；新版額外保留576組完整 RNG／結果／正式狀態 parity。

| 回合／事件 | 原 core ms | 新 core ms | events JSON bytes（前後相同） | 新 HP 索引陣列 |
|---|---:|---:|---:|---:|
| 10／20 | 0.2 | 0.2 | 6,901 | 0 bytes |
| 1,000／2,000 | 2.3 | 2.4 | 690,001 | 0 bytes |
| 10,000／20,000 | 11.8 | 12.9 | 6,900,001 | 0 bytes |

不以這組微小差異聲稱 CPU 改善；核心公式未改。一般戰鬥只新增 O(1) lifetime，鏡像／標準呈現不再 `.slice()` events 指標陣列；高維結束後 retainedContext 不保留 currentCombat。長 Boss 十次實際 checkpoint 交易3.2–7.9ms；fixture state JSON 增307 bytes包含收益數字變化及 metadata，不是純索引大小。診斷整頁 `usedJSHeapSize` 約69.0MB／total78.8MB，包含 JSON量測與多次戰鬥，非尖峰／非iPhone、不可與原85MB極端事件壓測當作相同樣本比較。

一般單場無逐回合save；長 Boss最多每5秒一次加中斷flush；鏡像只在每個完成單場保存比分，整輪最多20次，入場 snapshot一次，不存事件。原合成極端組合可產生51萬事件的固有成本仍存在，本批未重寫核心也未聲稱消除。

## 可重現測試與尚未覆蓋項目

新增 `tests/runtime/foreground-combat-lifecycle.cjs` 七項：取消競態／applied cursor／5秒／致命保護／失敗save／GM開關／bfcache事件／跨模式owner／場間epoch／blur／只有visibility返回而無focus事件的恢復。新增三支 Browser 測試已接入現有 Runtime Integrity，同時 unit 接入 Functional CI combat，沒有新增 workflow、瀏覽器安裝或矩陣。

- `foreground-combat-modes-browser.cjs`：三紀元正式入口、特殊怪、異宇宙及現存回顧；於真實core之前讀正式狀態 fingerprint，開場動畫中斷後無獎勵／進度差異，busy／presentation／轉場owner釋放。高維懸賞維持原本不可進，不創造新入口。
- `foreground-combat-checkpoints-browser.cjs`：轉生1、滿血、回血技能、背景關、鎖血關的11億十王，實際正回血事件後離頁：保存1,054,625,537 HP、45,374,463收益；未把整場11億先發。回血重削不重發、失敗save回滾、stale／重複結果拒絕、最終11億累計完全對齊。銀河災厄250,000→244,828、宇宙災厄1,200,000→1,175,772，保存值等於已播放HP。
- `foreground-combat-recovery-browser.cjs`：5秒保存後 CDP renderer crash（沒有離頁最後save）與新頁面恢復HP／收益／等級／EXP一致；鏡像完成一場、中止第二場、reload保留原比分與入場timestamp並可續戰；Schema17→18 exact backup；銀河快勝／快敗最後impact尚未完成即離頁沒有進度／金幣／掉裝，正常完成才合法取得進度與金幣。
- 原 `thirdworld-background-browser.js` GM開三循環／HUD／極簡兩尺寸保留全部斷言；GM關舊「暫停再自動繼續」斷言改為新正式要求的「取消、不自動續戰、可明確重挑」。`cross-era-background-browser.js`、`pr48-live-combat-browser.cjs`、跨模式遲到結算、stale continuous及災厄補算全部通過。
- JavaScript／docs／Schema1–18矩陣／save-load／轉生存檔等完整結果與 Actions 於下方驗收紀錄更新。

Browser hidden／pagehide／pageshow／blur是可控制事件注入；並非所有瀏覽器原生bfcache／OS時鐘凍結。實際 iPhone Safari 切App、鎖屏、系統殺頁、功耗／溫度／記憶體尖峰、長時間玩家存檔尚未驗收。本機只有 Chromium，WebKit 由既有 Actions 背景回歸驗證；不宣稱所有新入口WebKit完整測完。既有開發診斷載入時會印歷史 schema／高維顯示等 integrity warnings；正式 production=1測試沒有 pageerror，本批未把無關歷史診斷擴成重整。

## 修改檔案與驗收紀錄

共用：combatlifecycle、combatfx／integrity、combatcore／battlepipeline、levelcap／levelcapresult／reincarnationrerunprogress；長血：thirdworldphase／progress／run／playerflow／ui／combatsaveguard／offlineworld3adapter、calamitycore／run／ui、secondworldcalamityrun／ui；模式：secondworldmainline、dungeoncore／bounty／arena／void／voidui、thirdworldarena／arenaui、specialcore／encounter、alternateuniverseui、mirrordungeonstate／run／ui／guide、reincarnationdungeonaccess、worldtransitionsafety、ui。

存檔與發布：savemigration、saveversionguard、savebackupretention、compatibilityowners、index.html、resource-manifest.json。交接／README／pending及對應current-schema、cache token測試同步。GM開發工具相容：development/hybrid-comparison/fixture-input.mjs；完整清單以 PR diff 為準。

整合 commit `ee47693921d917adbd91f50d9a7bd08049e36681`；後續同PR補上精確來源登記與測試隔離。歷史呈現守衛以 `foreground-approved-runtime.json` 的42個正式檔案 before/after SHA256驗證本批必要修改，再返回原不可變main bytes繼續全部舊斷言，非萬用例外；整段戰鬥計算核心另逐位元比對未變，停止按鈕仍比較歷史原文。回顧 Browser 在production模式執行，避免獨立開發診斷關閉modal的測試污染。特殊怪 frozen補算策略源碼斷言同步要求新epoch參數，原行為斷言保留。另同步target-context／post-optimization測試的目前Schema18及stale CAS源碼斷言；context隔離測試原本mock計算／動畫，現在配對mock提交owner並新增四場恰好四次commit，真實提交由新Browser驗證。既有GM開發fixture只新增精確combatcore新舊SHA接受分支，16項fixture／篡改拒絕測試保留，fixture事件不重新產生。最新Actions尚待核對。PR維持Draft；未滿足真機證據且待Actions時不建議直接合併。合併必須由使用者確認；之後同main SHA Runtime、Functional CI、Pages全成功才能封箱。

最終檢查以 [PR #89 Checks](https://github.com/franksky1207/rpg/pull/89/checks) 的最新head為準；提交後會在PR說明列出實際驗收SHA與各run，避免將先前綠燈誤作最新版通過。

App返回補驗：已加入「blur後切App、返回visible且document.hasFocus=true，但無window.focus」測試。修正前新挑戰會被殘留lostFocus擋住；visible handler現在只在確實有焦點時清blur旗標與timer，departure epoch仍使舊場失效。7項unit通過；另有外觀／雲端17版下載→18版輸出與隔離測試通過。Schema18一次性備份增加一份原raw save大小的儲存，非每場／每回合增加。
