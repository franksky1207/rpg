## 2026-10-11｜音訊優化第 3 批：音效優先權、音量與 GM 統計
- audio/audio-core.js 保留六類 SFX 的正式 50% 音量統一倍率，085 仍為唯一 UI 點擊檔案。正式聲源不足時，先保護既有勝利及重大打擊聲源，避免普通攻擊搶占關鍵聲音；保留原播放限額與 GM 試聽隔離。
- 新增 SFX 的請求、完成 play()、playing 事件、失敗、節流／聲源略過次數與最近 100 次 play Promise 啟動延遲中位數、P95；該數值是播放請求到 play Promise 解決的時間，並非精確聲波出聲時間。
- audio/gm-audio-test.js 顯示預熱數量、請求／開始／失敗／略過及 P50/P95；統計以畫面渲染當下快照為準。index.html 對上述兩個 JS 更新 cache-bust；GitHub main 回讀兩個 JS 語法 PASS。
- 未調整戰鬥公式、勝利條件、背景音樂、音效素材與玩家設定。後續需桌機、手機和實際戰鬥第一聲／多重暴擊／關鍵重擊／勝利號角與 GM 試聽驗收；舊音效程式與 manifest 清理留待第 4–5 批。

## 2026-10-11 音訊六批優化：第 2 批
已依 main 實際音效核心完成：正式與 GM 音效播放器分池，GM 停止／關閉只清除 GM 試聽；GM 調整音量只影響 GM 目前聲源。正式音效優先重用各類預熱播放器；快速重疊有獨立短聲源，限制最多一般 6 聲、勝利預留空間，GM 最多 3 聲；回收後清除舊監聽器，避免播放器再利用時遭舊事件打斷。預熱音檔失敗可在後續進入戰鬥時重建；頁面重新顯示會嘗試預熱；pagehide 釋放預熱資源。085 仍是唯一介面點擊音，六類音效輸出倍率仍維持 50%，背景音樂單一聲源不變。已更新 index.html 的核心／GM 快取參數，程式回讀語法 PASS。待玩家桌機手機實測音效第一聲、長時間連戰、GM 開關、切換前後景與結算聲。

## 2026-10-11 音訊六批優化・第 1 批
- main 唯一真實來源；本批處理全戰鬥音訊結算識別、一般／鏡像重大打擊音效判定及延遲退場保護。
- audio-core.js 新增 settlementKey(prefix,object)，使用 WeakMap 對當次結算物件配置穩定識別，不再用 Date.now() 作為主線、銀河回顧、懸賞、競技場與鏡像的結算去重備援。
- ui.js 主線結算使用 ctx、銀河回顧使用當次 reviewAudioSettlement；懸賞／競技場使用當次 summary；鏡像使用 run 實例。持續挑戰的既有成功規則不變：單場成功或連戰正常完成至額度終點才可能播放勝利聲，手動停止／戰敗不新增勝利聲。
- combatfx.js 一般與鏡像演出共用 isMajorCombatAudioImpact 判定，仍由既有 combatEvent 分類普通／暴擊／閃避／重大打擊，不改戰鬥計算。
- audio-scenes.js 長時間動畫逾時時不強制切掉戰鬥音樂，避免預設 15 秒後錯誤退場；保留後續正式退場事件及過期退出通知代次保護。
- index.html 七個異動 JS 增加 audiofix1=20261011 cache bust；GitHub main 回讀七份 JavaScript 語法 PASS，仍需桌機與手機實機驗收所有模式、連戰停止、結算、聲音不重播與不疊播。

## 2026-10-11｜全戰鬥模式背景音樂統一整合（按使用者要求，不限副本）
- 範圍包括銀河／宇宙／高維主線、銀河回顧、懸賞、競技場（含高維固定／變化）、鏡像、虛空、銀河／宇宙災厄、異宇宙與高維 Boss 持續連戰。僅音樂場景的生命週期接線，不更動戰鬥數值、獎勵、存檔、音效或已選 6 首配樂。
- `audio/audio-scenes.js` 的 `setContext()` 現在將 combatLocked 作為所有來源的共用權威防線：已正式進入戰鬥時，任何非戰鬥 `setContext`（包括自行 renderPage、renderW3 等）以及重複戰鬥 context 都只恢復目前正式戰鬥音樂，不重建／重播、不降回紀元曲。保持 combat-start → battle ownership → 正式 combat-exit 的生命週期，連戰中途 `combat-end` 不切回音樂。
- `ui.js` 銀河主線正式開戰入口與回顧戰入口明確發出 combat-start；回顧戰正常與異常結束均發出 combat-exit，避免舊 owner 停留。
- `mirrordungeonrun.js` 的 20 場挑戰啟動時正式發出 combat-start，原結算 combat-exit 保留，失敗 catch 增加退場。20 場中途不重播。
- `dungeonvoidui.js` 在正式虛空挑戰啟動後就發出 combat-start，不必等非同步 runVoidMirageUiAuto 啟動；原 runner 重複 combat-start 不會重新切曲，最終原 combat-exit 保留。
- `thirdworldarenaui.js` 的 renderW3 不在戰鬥／場間待續時強制寫入一般 context，整組挑戰 playSelected finally 補上 combat-exit；高維競技場正式入口既有 combat-start 保留。
- `alternateuniverseui.js` 的 renderPage 不再於戰鬥中直接覆蓋音樂場景，保留挑戰入口 combat-start 及 finally combat-exit。
- 懸賞、銀河宇宙競技場、兩代災厄、高維主線等已有的正式 combat-start／combat-exit 保留，改由共用 director 防線保障頁面重繪不切曲。既有 `combatfx.js` 每擊不發 combat-start 的規則不變。
- `index.html` 已對上述六個修改 JS 更新 cache-bust；GitHub main 遠端回讀與六檔 JS 語法均 PASS。用 JS stub 模擬高維競技場明確開始→render setContext→syncView→combat-exit，結果高等戰鬥曲保持至正式退出才恢復高維主題，PASS。其餘多模式真人裝置音效、首次音檔網路載入、手機背景切換仍未實機驗收，不能宣稱聲音全程確定已播放。

## 2026-10-10｜連續戰鬥停止音樂提早恢復／結算後攻擊音效殘留修正
- 使用者回報：按下「停止連續戰鬥」應等本場動畫播完並出現結算，卻已提前切回紀元主題；結算後退出仍聽到攻擊類音效。
- `audio/audio-core.js` 新增 `stopBattleSfx()`：只釋放短音效的 normal-attack／critical／dodge／heavy-hit 與舊 combatVoices；**不停止 notice 類勝利號角、不停止 UI 點擊與背景音樂**。正式 `combat-exit` 才清理，防止勝利音效被一併切斷。
- `audio/audio-scenes.js` 的 `combat-exit` 增加 `isCombatPresentationActive()` 判定：若最後戰鬥動畫仍在播放，延後至呈現層 inactive 才退出音樂（50ms 檢查一次，最多約 15 秒後停止等待，避免無窮輪詢）；以 `exitSequence` 代次取消已過期的退出任務，防止新一場戰鬥開始後舊的延遲退出錯切音樂。音樂與攻擊聲同時清理的時機設為真正退場。動畫正常完成、正式結算才切回所屬紀元主題。
- `index.html` 已更新 audio-core/audio-scenes 的 cache bust；本輪遠端回讀 JS 語法 PASS，**尚未取得玩家真實裝置操作測試**。應針對主線、懸賞、競技場連戰：按停止後最後一場維持戰鬥曲、結算才恢復；攻擊殘音不跨結算；勝利號角能獨立播完；連續快速按停止與立即重新開始不互相錯切。無損傷害／資源／存檔與原音檔。

## 2026-10-10｜音樂音效第 0 批緊急修正：戰鬥有音效、配樂消失
- 根因：`audio/audio-scenes.js` 的 `syncView()` 僅識別部分戰鬥畫面，正式副本在 `combat-start` 後重新 `render()` 會以非戰鬥 view 呼叫 `setContext()`，把已選戰鬥音樂切回紀元主題。更嚴重的是 `combatfx.js` 一般／鏡像每筆事件皆 `notify("combat-start")`，可能反覆覆蓋原本選定的戰鬥 tier。音效由其他播放器播放，與音樂被切曲不是同一件事。
- 第 0 批修正：`audio/audio-scenes.js` 加 `combatLocked` owner。正式 combat-start 或已知戰鬥畫面選定戰鬥曲後，畫面重繪／子頁同步只能保留並恢復同一音樂；重複 combat-start 在 owner 持有期間不會降級／重播；只有正式 `combat-exit`／明確離開戰鬥的主場景事件才解除。`combat-end`（單場動畫結束）不解除，以支援連續戰鬥。刪除不可達的舊 `lastCombatView` 判斷。
- `combatfx.js` 刪除一般／鏡像逐攻擊事件上重送 combat-start 的兩處呼叫，保留唯讀 `combatEvent` 的普通攻擊／暴擊／閃避／重大打擊觸發。
- `audio/audio-core.js` 正式配樂播放遭瀏覽器拒絕時發出 `civilization-audio-music-failed` 可觀察事件；在玩家下一次手勢時，僅對目前已存在、暫停且允許播放的同一首 music 進行 `resumeMusic()`，不建立第二個播放器。既有 musicVoices 單一正式音源互斥、GM audition 與極簡靜音仍保留。
- `index.html` 對三個更動 JS 添加 cache-bust。本輪 GitHub main 遠端回讀、三個 JS 語法 PASS，並在 stub 場景驗證懸賞 combat-start → dungeon-bounty render → combat-exit 分別是戰鬥 normal → 同首 normal → 銀河主題（PASS）。
- **尚未做實機聲音驗收**，特別需驗證銀河與宇宙主線、懸賞／競技場／災厄、鏡像／虛空／高維／異宇宙、GM 試聽返回，以及連戰／手機鎖屏返回；觀察同時最多一首正式音樂。這批沒有修改戰鬥公式、存檔、結算、音效音檔或 GM 權限。

## 2026-10-10｜全戰鬥模式勝利音效：改為最終結算一次（依正式 owner）
**優先適用於《文明戰線》全部模式。** 在 `combatfx.js` 刪除一般／鏡像 structured presentation 的兩處 `win===true` 每場勝利音效，單場動畫只負責普通攻擊／暴擊／閃避／致命重擊；不得以每怪擊殺播放勝利音效，不能以 1.4s 防抖假裝解決中途連播問題。
`audio/audio-core.js` 新增 `settlementVictory(key,{success:true})`，僅接受明確成功判定與非空結算 key，已記錄 key 最多 128 組，重繪／重複進入同一結算不能再次播放；播放器保留極簡、背景及 Fast Catch-up 靜音，音樂與聲效設定獨立。失敗、無成功條件、單場中途動畫不播。
依 main 實際程式碼盤點與接入：
- 銀河主線／一般戰鬥：`ui.js showBattleResult` 的無 defeat 最終視窗，連續刷怪中途不播；銀河回顧單場成功視窗另接一次。
- 銀河／宇宙懸賞：`dungeonbounty.js` 只在單場結果或整輪連戰的「daily-limit」成功退出時播；手動停、死亡不播；用本輪 audioRunId 去重。
- 銀河／宇宙競技場：`dungeonarena.js` 只在三戰全通之後的單場結果，或連戰最後成功到每日額度終點時播；單場每關不播；手動停／死亡不播。
- 鏡像：`mirrordungeonrun.js` 的全 20 場正式記錄與 VIP 結算成功後，且該輪勝利 >=15 場才播一次；20 場中每場勝利不播。
- 銀河災厄：`calamityrun.js finish` 在單次成功或首次稱號／印記滿級成功完成整輪時播。宇宙災厄：`secondworldcalamityrun.js finish` 在單次成功／首次稱號／文明完成時播。一般累積戰鬥與手動停止不播。
- 高維競技場：`thirdworldarenaui.js playSelected finally`，整組正式狀態 complete 且有 fullClears 後播一次；每階段不播。
- 異宇宙：`alternateuniverseui.js challengeFormal` 的正式 settlement.ok 且 combat.win 才播，不在未結算成功前播。
- 虛空無限層：`dungeonvoidui.js` 只有突破樓層、死亡或手動退出，沒有全輪勝利判定，因此故意不播 06 勝利音效，保留重大打擊等戰鬥內短音。
- 高維主線 Boss 無限／持續進度：`thirdworldrun.js` 結束原因包括進度事件／死亡／手動停止，沒有通用全輪勝利判定，所以故意不播 06 勝利音效；待未來明確成功事件時才接。
- 其他若由正式 owner 另行結算、跳過這些入口的戰鬥（例如無呈現背景快進）仍要依各模式 owner 驗證，不能以靜態檢查宣稱全部實機覆蓋已驗收。
**代碼防護**：修改 `audio/audio-core.js`、`combatfx.js`、`ui.js`、`dungeonbounty.js`、`dungeonarena.js`、`mirrordungeonrun.js`、`calamityrun.js`、`secondworldcalamityrun.js`、`thirdworldarenaui.js`、`alternateuniverseui.js`；`dungeonvoidui.js`、`thirdworldrun.js` 補充無勝利邊界註解；`index.html` 更新全部涉及 JS 的 cache-bust。原始傷害、模式成功判定、VIP、獎勵、save 與 GM 權限不變。
**驗收未結**：實際桌機／手機，連續主線 10+ 戰、單場、連續懸賞與競技場（自然結束／手停／死亡）、鏡像 20 場、災厄自動連戰、虛空、高維競技場／高維連戰、異宇宙、同一結果頁反覆開關；檢查只有最後成功結算一次且配樂不重啟。僅完成 JS 靜態語法及來源回讀，不能冒充人耳驗收。

## 2026-10-10｜重大打擊／勝利音效：正式戰鬥視覺事件接入
- 依使用者指定新增兩類音效時機，不變更任何正式傷害、Boss 能力、掉落與存檔：`combatfx.js` 在普通及鏡像的共用 structured playback 裡，以**已產生的正式 attack.actualDamage 與目前呈現 HP**識別玩家／敵人致命最後一擊；另敵方 `e.kind === "boss"` 的暴擊作強 Boss 重擊演出。偵測僅為唯讀聲音分流，與計算／結算無關。鏡像敵方標識 mirror 亦計入。
- `CivilizationAudio.combatEvent(evt,{major:true})` 為重大打擊，覆蓋普通／暴擊的同一聲音而不重疊；`attack.crit` 本身仍為暴擊。重大打擊池只抽先前核定的爆炸類候選 04／05／29，來源與實際聽感需再驗證。
- 普通與鏡像 **structured presentation 已確認 win===true 且播演出完畢** 後觸發 `victory`，不在單純 render／結果頁重繪時觸發。播放最短間距 1.4 秒，長期連戰／極簡／背景頁／Fast Catch-up 遵守核心現有靜音限制。**注意：沒有使用 structured presentation 的 headless 或其他獨立結算 owner 尚未逐一完成勝利映射，不得宣稱全部模式 100% 覆蓋。**
- JS `audio/audio-core.js`、`combatfx.js` 更新並刷新 `index.html` 的 cache-bust；GitHub latest main 回讀、JS syntax、兩處 bridge 與兩處勝利觸發靜態核對通過。未做授權真機桌機／手機／完整跨模式連戰驗收。
- 未來改良：正式模式逐個 owner 交叉驗證遊戲勝利事件；遇到沒有動畫或背景回補的正確不播策略；真人比對 Boss 重擊音量、勝利短音效及連勝時音樂不中斷。

## 2026-10-10｜六種短音效第 3 批：正式呈現橋接與 GM 試聽（部分正式事件待補）
- 第一批本地化 manifest 位於 `audio/assets/common-sfx/manifest.json`，共 199 個轉換後 OGG：ui-click 100、normal-attack 10、critical 37、dodge 1、heavy-hit 50、victory 1。重大打擊實際播放池只選爆炸類 04／05／29，不將提示音／環境音視作打擊。
- 第二批既有 `playSfx`／`pickSfx` 音效池。本批 `audio/audio-core.js` 讓 `combatEvent(evt)` 由正式 `combatfx.js` 唯讀呈現事件接入：attack.crit 擇一選暴擊或普通攻擊，dodge 選閃避；不修改 `combatcore.js` 的傷害／判定／存檔。重大打擊只承認獨立 `specialHeavyImpact`／`majorImpact` 呈現事件，不推定 Boss／傷害門檻；victory 類型已有聲音池但所有模式統一的正式勝利結果事件**尚未全面接線**。UI 點擊由單一 document click 代理播放，禁用與 GM 試聽控制不觸發。
- `audio/gm-audio-test.js` 在六首正式配樂下新增六種短音效的單次 GM 試聽按鈕，共用既有試聽音量；停止或離開試聽中心清掉短音效播放。尚未建立單一檔案選取或真人評價流程。音效試聽＝聲音池可觸發，不能等同真人聽感／正式事件覆蓋率全通過。
- JS 修改同步更新 `index.html` 的 audio-core／gm-audio-test cache-bust。本輪三檔遠端回讀及 JS 語法檢查 PASS；**未跑真實桌機／手機聲音聆聽、exact-HEAD Chromium／完整跨模式勝利事件／WebGL 空間音效回歸**。新版主規格仍優先，文字模式與 3D 共用音訊 owner，極簡／背景快速補播靜音、GM 權限及正式戰鬥資料不變。
- 後續：核對所有正式模式的「勝利」權威結算結果、特殊強力攻擊是否真有獨立呈現事件；避免 UI 與普通攻擊過度頻繁；對 199 個素材做聽感篩選與 LUFS 音量平衡；補充裝置長測、播放器排他與舊歷史音訊文件一致性。此批是**程式接線施工**，並非全部驗收封版。

## 2026-10-10｜緊急修復：戰鬥退場兩首音樂疊播（嚴格單聲道管理）
- 使用者回報戰鬥結算恢復主題時「兩個音樂混在一起」。根因確認在 `audio/audio-core.js` 先前 `fadeMusic()` 的交叉淡化機制：開始第二次切曲時 `musicFadeSeq` 取消前一次 requestAnimationFrame，但舊 fade 的 `old` Audio 不再由 `music` 追蹤，也沒有被 pause/load，造成孤兒播放器持續出聲。快速轉場、正式結算及恢復尤其容易觸發。
- 已改為 **正式音樂播放器排他式管理**：`musicVoices` Set 記錄所有由正式播放端建立的 HTMLAudioElement；跨曲切換先退役所有舊實體，確保同時僅有一首正式音樂播放，再讓新曲自 0 漸強（約 850ms）。不再採用會重疊兩首的 crossfade；舊 fade 非同步回呼會依序號檢查並停止已過期實體。音樂關閉及 stopMusic 也清理全部追蹤中的音源。GM 試聽仍只暫停正式音樂，回來原 currentTime 續播。
- JS 語法 PASS，模擬 `銀河主題→中等戰鬥→銀河主題` 快速連續切換，實際 mock Audio 播放中數量 1，追蹤數 1；GM 試聽→返回保持原時間 61s，播放中 1；音樂關閉後播放中 0、追蹤數 0。新增 `runtimeStats().formalMusicVoices` 供內部測試；`index.html` 已更新 `audio/audio-core.js` cache-bust。
- 尚須使用者真實桌機／手機音效驗收；如果要重新加入兩曲交叉淡化，必須改用互斥的單一 transition owner，且任何取消均釋放全部舊聲源，不能回到孤兒播放器設計。此批**優先防止同時兩曲疊播**，故轉場目前是舊曲立即停、新曲漸強，而不是交叉淡化。

## 2026-10-10｜修復戰鬥結束不恢復紀元主題
- 使用者實機回報：正式戰鬥結束仍停留於戰鬥配樂，未回到當前紀元主題。
- 根因：`audio/audio-scenes.js` 為防同畫面連戰重播，曾對 `selected.tier`、`lastCombatView` 一律保留戰鬥曲，即使已到結果頁也阻止恢復；另外多數主線／競技場／懸賞／鏡像的正式最終結算沒有送出 `combat-exit`。
- 修改：移除非戰鬥畫面錯誤的保留條件；`ui.js` `showBattleResult()`、`dungeonarena.js`、`dungeonbounty.js` 進入結果狀態、`mirrordungeonrun.js` 鏡像完成時通知 `CivilizationAudioScenes.notify('combat-exit')`，並更新五支腳本在 `index.html` 的 cache-bust。連續戰鬥中途單場結算仍不主動發出 `combat-exit`。
- 驗證：五支 JS 語法 PASS；狀態模擬中等戰鬥曲 `battle-medium-preview` → `combat-exit` → `era-galaxy-theme` PASS。未實機覆蓋所有模式，需用戶驗收主線 Boss、連戰、懸賞／競技場、鏡像、災厄等。

## 2026-10-10｜正式六首配樂整合施工（3 紀元＋3 共用戰鬥）
- 使用者實聽認可 03 普通 `JRPG Battle Theme`、05 中等 `Boss Battle`、09 高等 `I'm Boss Here!`，要求正式整合。
- `audio/audio-core.js` 新增 `fadeMusic()`：跨音樂曲目短時間交叉淡入淡出、同曲 `resumeMusic()` 續播（沿用既有播放器），不因 GM 測試中心或一般頁面切換重建。戰鬥音源仍為 GitHub 本地 `audio/assets/battle-themes/*-battle-loop.ogg`；GM 試聽六首維持。
- `audio/audio-scenes.js` 依據既定音樂分級：普通 `battle-normal-preview`、中等 `battle-medium-preview`、高等 `battle-high-preview`（ID 有 preview 字樣但現在也正式播放）。主線銀河普通與菁英＝普通、銀河／宇宙 Boss＝中等；普通懸賞／中等競技場／高等災厄；鏡像與虛空＝中等；高維十名存在、高維競技場、異宇宙＝高等。普通 UI 保留所在紀元主題。未有充分個別怪分類的特殊遭遇**尚未細分**，不得捏造。回顧主線由實際 encounter.Kind 類型與 render context 選曲。
- 正式狀態接入：`dungeonarena.js`、`dungeonbounty.js`、`calamityrun.js`、`secondworldcalamityrun.js`、`thirdworldrun.js`、`thirdworldarenaui.js`、`alternateuniverseui.js`、`dungeonvoidui.js`，在通過進入條件並真正開始挑戰時呼叫共用 `CivilizationAudioScenes.notify('combat-start',{...})`；若有明確終止 owner，於終止呼叫 `combat-exit`。鏡像戰與銀河主線戰鬥以正式 combat view 作為配樂進入條件。只播音樂，不寫戰鬥、掉落、任務或存檔。此種額外 UI 音訊通知不改原始戰鬥決策。
- 多場連戰中 `combat-end` 單場結算事件不換曲；同一模式畫面重繪不重播，同 track 不重建播放器；真正退出或導航至非戰鬥頁面返回當前紀元主題。已更新 `index.html` 10 支受影響 JS 版本。
- 靜態 JS 語法 10/10 PASS；映射的模擬核對普通懸賞、高等災厄、退出回到紀元主題。**桌機／手機／3D 實機驗收、細部事件是否覆蓋所有次要戰鬥 owner 尚待驗證**；無法宣稱全部驗收已通過。後續應重點實測高維定相異相、異宇宙不同深度、回顧、宇宙 Boss、競技場連打、GM 試聽、背景/極簡。未選定的六種短音效仍維持靜音。

## 2026-10-10｜三首共用戰鬥配樂已本地化＋GM 六首試聽，正式戰鬥仍未接線
- 使用者選定普通03 `JRPG Battle Theme`（North Fantasy Music，CC BY 4.0）、中等05 `Boss Battle`（tcarisland，CC BY 4.0）、高等09 `I'm Boss Here!`（Fato Shadow，CC BY 4.0）。
- 工作流程 `.github/workflows/battle-theme-localize.yml` 已執行成功：`audio/assets/battle-themes/` 保存各原檔、本地 OGG `normal-battle-loop.ogg`／`medium-battle-loop.ogg`／`high-battle-loop.ogg`、SHA256／來源／授權 manifest。經 FFmpeg 解碼確認：普通 48.000 秒、中等 144.039 秒、高等 71.720 秒。原曲轉檔不擅自截剪交叉淡化，循環銜接仍待人耳驗收，不可宣稱完美無縫。
- `audio/audio-core.js` 新增 `battle-normal-preview`、`battle-medium-preview`、`battle-high-preview` 三筆**僅 GM 試聽**的資源；`audio/gm-audio-test.js` 由三首擴充六首，保留完整循環／曲尾→曲頭接縫／單音量功能；`index.html` 更新兩個 JS cache-bust。
- 正式 `audio/audio-scenes.js` 完全沒有引用三首戰鬥預覽 ID；**正式戰鬥仍維持當前紀元主題，不要在驗收前連接**。三首來源皆 CC BY 4.0，Credits 必須列作者／作品頁／授權／轉檔與後續調整；高等曲來源作品頁另有請使用者聯絡作者的請求。
- 靜態自檢：三支 JS 語法 PASS、manifest 三筆齊、GM 三筆對應完整、正式場景未引用戰鬥候選。待桌機／手機實機播放、三首接縫聽感、響度比較與來源署名 UI 補入。

## 2026-10-10｜全介面同紀元音樂防重播：GM 測試→管理位置續播修正
- **使用者實機回報**：在 GM 試聽中心切回 GM 管理頁，主題音樂仍從頭播放，顯示上一批「主頁、設定、冒險不中斷」防護不足。
- 核心根因：`audio/audio-core.js` `begin(id,{preview:true})` 把正式 `music` 物件執行 `pause → removeAttribute('src') → load → null`，導致 GM 退出時即使同紀元，正式曲目播放器與 currentTime 已消失；`audio/audio-scenes.js` `apply()` 僅檢查 currentMusicId，無法對「同曲但暫停」進行續播。
- 修正：GM 開始試聽時**只暫停正式 music，不移除 src／不銷毀物件**；新增 `resumeMusic()` 在音樂允許且 GM 試聽頁已關閉時對同一物件恢復 `play()`，保留 currentTime；`playMusic(id)` 同曲走 `resumeMusic()`，不同紀元才建立新音源；`audio-scenes.js apply()` 對同曲呼叫 `resumeMusic()`。因此 GM「測試→管理」、一般「主頁↔設定↔冒險↔角色／背包」、合法非隱藏頁 restore、相同紀元的場景事件皆不應重建同曲播放器。
- `index.html` 音訊核心及場景版本 cache-bust 已更新。JS 語法 PASS；模擬同紀元 7 個基本頁切換 + GM paused→restore：僅啟動新曲 1 次、stop 0 次，透過續播方法恢復。仍須實機核對 currentTime 沒有歸零、GM 試聽結束後不與正式音樂重疊。無修改正式戰鬥與三首曲目。

## 2026-10-10｜正式音訊舊播放路徑清退，僅三紀元主題（已施工）
- 使用者實機發現「主頁→設定→主頁」主題重新從頭播、進入冒險時原本主題中斷，原因是 `audio/audio-scenes.js` 的舊情境表及 `restore()` 無條件重啟同曲，且冒險會切換至 `dark-sector` 等舊曲。**已替換 audio-scenes.js 為只認三首紀元主題的共用 owner**。主頁、設定、背包、冒險及返回同紀元均使用同一音源，不因場景名稱變化重建播放器；只有真的進入不同紀元才換曲。
- `audio/audio-core.js` 只註冊本地三首 `era-galaxy-theme`、`era-universe-theme`、`era-higher-theme`。**刪除舊 dark-*/galaxy-battle/boss-orchestra/laser-preview 等正式可播放清單**。舊戰鬥及 UI 音效事件暫無已選新素材，現在不播放；新版三首共用戰鬥配樂及六音效仍待下一輪選材，**切勿假裝戰鬥配樂已上線**。程式舊播放接口只保留安全相容外殼，不再有舊音源可供播放。
- 核心 `playMusic()` 對已在播放的相同 track 不再重開；場景 `restore()` 不再強制清空 activeMusicId。GM 測試中心只剩三首主題，明確呼叫 `localStorage.removeItem("civilization.gm.audio.review.v1")` 清掉既往 GM 73 項聆聽紀錄，不會再顯示那些舊分類。舊音效二進位資產可留存於 repo 歷史但已無播放引用，不得當作正式音源。
- 不改任何戰鬥公式、目標判定、獎勵、存檔與速度；正式玩家音樂／音效開關和音量維持。`index.html` cache-bust 已更新。
- **驗證**：三個 JS 語法 PASS；模擬 `home→settings→home→adventure→home→inventory→home` 同紀元只啟動一次播放器、停止零次；三紀元 resolve 均落到正確的本地主題；舊音源 key 在 core 中不存在，舊 GM 分類不可見且舊 review key 刪除。桌機／手機使用者實際聆聽尚待驗收。

## 2026-10-10｜正式設定加入音樂／音效小分區＋GM 循環接縫核查（已施工）
- 正式 `ui.js`「設定 → 遊戲設定」新增小分區「音樂與音效」：**開啟音樂／開啟音效兩個獨立勾選開關**，以及**音樂音量／音效音量兩個滑桿**（0–100%，調整即生效）。一般玩家設定仍由 `audio/audio-core.js` 原本的獨立 localStorage key `civilization.audio.preferences.v1` 保存，不寫正式 RPG save schema；音樂滑桿同步 music/ambient，音效滑桿同步 battle/ui/notice，保留 GM 獨立試聽滑桿。
- core 正式音樂與戰鬥／介面短音效分別依 `musicEnabled`、`effectsEnabled` 控制；關閉音樂立刻停止正式配樂並停止環境聲，重新開啟後場景 owner 恢復當前合法配樂；關閉音效停止現有戰鬥短音效並阻擋新的事件。不繞過原先極簡模式及瀏覽器背景靜音。
- **修正原本 GM 聽到正式背景音樂重疊的根因**：進入 GM 試聽時，audio-core 的 `begin(preview:true)` 先停止正式配樂，不與 GM 試聽疊播；離開 GM 測試中心由 scene owner 恢復。
- **循環接縫並非僅有文字**：core 現有 `previewSeam` 真正從同一個循環 OGG 播放器跳到曲尾 8 秒，timeupdate 或 ended 實際跳回 0 秒，曲頭 8 秒後停止；本批新增事件 `seam-tail`、`seam`、`seam-done` 供 GM 顯示「已跳至曲尾」「已接回曲頭」「接縫試聽完成」，避免原本只有「載入中」無法判斷。**注意這是播放程式靜態檢查與事件級驗證，並非已用真人耳朵驗收無縫聽感；若 seek 有緩衝延遲仍可能聽出間隙，不能保證毫無聲音落差**。
- 已更新 `index.html` 的 `ui.js`／3 支音訊 JS cache-bust。四支 JS 語法靜態檢查 PASS。尚待使用者桌機及手機確認開關真實阻擋、即時音量、GM 無背景重疊、曲尾接曲頭訊息與聽感。不改正式戰鬥公式或掉落。

## 2026-10-10｜三紀元主題啟動優先預載／GM 三首精簡／循環接縫試聽（已施工）
- 使用者要求音效測試中心**暫時只留三首已選紀元主題**，先全部移除其他舊類別可見 UI，並增加「循環接縫試聽」與啟動優先載入。
- `audio/gm-audio-test.js` 重整 GM 測試中心，僅三個主題選項：銀河 The Fall of Arcana、宇宙 Epic Orchestral Fantasy Theme、高維 Exploration Theme；提供「完整循環試聽／循環接縫試聽／停止」及單一試聽音量滑桿。舊 73 項試聽評價的 localStorage 資料未刪除，但不再在 GM 畫面顯示舊分類。
- `audio/audio-core.js` 增加 `previewSeam(trackId,8)`：播放原音檔尾端約 8 秒→回到頭端約 8 秒→停止，仍受 GM 權限／極簡靜音／音量設定限制。以播放器 loadedmetadata／timeupdate／ended 驅動，並非臆造聲波處理。若瀏覽器 seek 時出錯需實機回報。
- 三首已在 GitHub 本地化：`audio/assets/era-themes/*-theme-loop.ogg`。`audio/audio-core.js` 於 DOMContentLoaded 優先加載當前紀元主題的 rel=preload，首次玩家手勢再次核對紀元；僅預先請求，不能繞過瀏覽器自動播放政策。其他兩首不在初次載入時全部同時搶資源。
- `audio/audio-scenes.js` 正式一般介面改用該紀元唯一主題曲，常見角色／強化／背包等不同頁面不換曲、同曲不重新開始；高維核心、紀錄等可映射一般頁面亦用主題。**戰鬥原有音樂分類仍維持目前程式，三層共用新戰鬥曲尚未施工**；本次不動正式戰鬥 owner 或公式。
- `index.html` 已更新音訊三 JS cache-bust，三檔 JS 語法及選曲映射的模擬 PASS。尚無桌機手機真實聆聽、接縫聽感及網路節流下啟動速度驗收。舊素材保留供追溯，不等於在 GM 介面顯示。
- 注意：現階段跨模式漸入漸出尚未完整施工；`previewSeam` 只是快速檢驗曲尾銜接，不取代真正無縫循環的人耳驗收。主題曲各頁播放必須遵守正常使用者互動解鎖條件。

## 2026-10-10｜三大紀元指定主題音樂：本地化與循環候選已完成，正式介面尚未切換
- 使用者選定「03 銀河 The Fall of Arcana（Matthew Pablo, CC BY 3.0）」「09 宇宙 Epic Orchestral Fantasy Theme（Markus Lindner, CC BY 4.0）」「06 高維 Exploration Theme（Cleyton Kauffman, CC0）」。
- **GitHub Actions 已成功**下載來源、用 ffmpeg 製作 OGG 循環候選、解碼與長度檢查、保留原始音檔與 SHA256，路徑 `audio/assets/era-themes/`，機讀資料 `audio/assets/era-themes/manifest.json`。原始長度銀河 152.059s／宇宙 107.050s／高維 134.400s，循環候選長度銀河 148.059s／宇宙 103.050s／高維 130.400s。工作流程：`.github/workflows/era-theme-localize.yml`（初次長度判斷失敗，修正後第二次成功）。
- `audio/audio-core.js` 註冊三首本地 OGG 試聽音軌；GM `audio/gm-audio-test.js` 新增分類「三大紀元・已選主題試聽」，選「單一音檔」就可播放三首本地循環候選。已更新 `index.html` cache-bust，JS 語法／三首 manifest SHA／GM 對應靜態檢查 PASS。
- **重要限制**：這一批只本地化並提供試聽入口，沒有改正式玩家所有介面音樂場景映射；仍然是舊版音訊場景邏輯。跨紀元／進戰鬥時的播放器淡入淡出、音樂不重頭播放等**尚未施工**。作者只明說高維原音可無縫循環；本批另外兩首製作頭尾 2 秒 crossfade 的 OGG 候選，**人耳接縫與樂句仍待驗收**。不得把技術解碼通過誤稱自然無縫。
- **署名**：兩首 CC BY 必須保留作者、曲目、連結、授權與修改（製作循環混音候選）標示，CC0 高維保留來源。細節見 `audio/ERA_THEME_LOCALIZATION.md`。
- 目前正式戰鬥配樂及其他音效仍按舊版運作，待後續照 `docs/AUDIO_SIMPLIFIED_FINAL_SPEC_2026-10-10.md` 實際整理；本批未碰戰鬥公式、掉落、紀元進度與玩家存檔。

## 2026-10-10｜音訊產品規格最終精簡定案（**尚未施工**；優先覆蓋舊音訊需求）
- **最新權威規劃**：`docs/AUDIO_SIMPLIFIED_FINAL_SPEC_2026-10-10.md`。使用者確定僅 **3 首三紀元各自主題 + 3 首全紀元共用的普通／中等／高等戰鬥配樂 + 6 種共用短音效 = 12 種**。普通介面維持目前紀元主題，不再每一頁面換音樂；正式進入戰鬥模式才按模式分級，離開才恢復主題。同曲不因畫面刷新而重新從頭播。
- **戰鬥分級特別更正**：銀河普通與**菁英都用普通**；銀河／宇宙主線 Boss、前兩紀元競技場、**鏡像全部階段、虛空全部深度**用中等；銀河／宇宙災厄、高維十存在、高維定相／異相競技場、異宇宙全部深度用高等；前兩紀元懸賞用普通；特殊遭遇普通或中等如何分尚待依 main 正式身份確認。宇宙主線只 Boss；高維沒有虛構普通／菁英／Boss 三層主線、高維災厄與懸賞。
- **六種短音效**：共用按鈕、普通攻擊、暴擊、閃避、重大打擊、勝利。**不做**強化成功專屬聲、重大解鎖專屬聲、每技能／每頁各自一聲。主畫面舊 Title 音樂經真人聆聽為噪音感，需汰換；其他素材技術可播≠適合／已驗收。GM 改以 12 種真正素材＋精簡映射驗收，留存歷史 73 項評價；GM 單一音量滑桿 100% 實際代表 HTMLAudioElement.volume=1。
- **重要錯誤防止**：不得再虛構「普通怪接菁英怪」「普通戰接 Boss」為同一段連續流程。先核對 main 實際戰鬥 owner、選怪、回顧及各模式；根據真正事件而非一般 RPG 想像建立音樂切換。不得修改正式戰鬥公式、場間等待、收益與 save。
- **本次只更新規劃／交接文件，沒有修改遊戲程式**。舊 A01～A04 與 3D 音效巨量素材要求中衝突的**未來產品需求**均以新定案取代；歷史已施工事項、現有程式和真實 GitHub main 不因此自動改變。後續施工先重核 main。

## 2026-10-10｜GM 單滑桿顯示 100% 但初播 27%／拖動後 85%：根因修正
- 使用者實機反饋：新 GM 單滑桿顯示 100%，但剛開始試聽時診斷仍 27%；拖曳後最高只有 85%，音樂才較可聽。
- 經 main 程式核查：`begin(id,{preview:true})` 仍使用舊 `normalizeVolume(... previewLevels.master, previewLevels.music)`，所以首次播放以 .7×.45×.85≈27%；後續滑桿 `setPreviewVolume()` 則走 `previewGain()`，其內部又有 music 的 0.85 固定係數造成最高僅 85%。
- 已統一：**GM 試聽新播放器首次建立、拖曳滑桿更新、切換試聽後，`HTMLAudioElement.volume` 皆直接等於 GM 試聽滑桿的 0～1 值**。環境聲和戰鬥 GM 模擬試聽也採同一數值；正式遊戲音訊分類增益及用戶偏好完全保留不動。100% 即瀏覽器播放器 volume=1，0% 即 volume=0；此百分比是播放器倍率，非喇叭物理聲壓或 LUFS 響度值。
- 已更新 `index.html` core JS cache-bust。實際 `main` 來源經語法檢查通過，mock Audio 針對 Sector/Pulse/Airy/Hover/Laser 在 100%→40%→100% + resetPreview/切音後共 15 例均精確相符，正式玩家偏好未更動。桌機手機真人聲音須由使用者重新驗收。

## 2026-10-10｜GM 試聽音量簡化為單一滑桿
- 使用者確認六種 GM 音量滑桿過於繁瑣，正式 GM 音樂音效測試中心改為僅一個「試聽音量」（預設 100%），選單切換、單音檔／場景混音及停止重播保留此百分比。
- `audio/audio-core.js` 新增獨立 `gmPreviewVolume`、`setPreviewVolume()`、`previewGain()`，試聽時以一個整體百分比控制音樂、環境層、戰鬥、通知與介面音效。保留不同類型音效的內部相對音量，音樂 0.85、環境聲 0.45 等；不再讓使用者操作多聲道技術參數，且完全不更動正式玩家 `prefs` / localStorage。
- `audio/audio-scenes.js` GM 混音環境聲同步使用獨立試聽倍率，移動滑桿即時生效。`audio/gm-audio-test.js` 介面六滑桿合一。保留既有試聽模式、播放診斷與聆聽評價。
- `index.html` 已更新三檔 JS cache-bust；語法測試三檔 PASS。模擬確認 100% 音樂輸出乘分類增益為 85%，正式玩家主音量仍為預設 70%；桌機與手機實際音量、混音仍須真人驗收。
- Title 主畫面音樂已由使用者評定不合適（噪音感），列為需換素材；本批依使用者「修改」所承接的討論範圍僅改 GM 試聽音量介面，不擅自挑替代音檔。

## 2026-10-10｜GM 單一音檔／場景混音對應補修
- 已查核正式 `audio/audio-scenes.js` 的 A03 catalog：銀河探索 Sector+Airy、宇宙選擇 Pulse+Airy、銀河 Boss orchestra+Airy、宇宙 Boss orchestra+Pulse、高維前線 Urgent+Airy 等情境有雙音源；單聲源場景不應假裝混音。
- 原 `audio/gm-audio-test.js` 的 `mix`「情境混音測試」沒有 `a03Context()` 正式對應，選混音會落回播放 `row.asset`，故等同單一音檔。已明確對應：mix-calm→銀河探索、mix-fight→銀河普通戰、mix-tense→高維前線、mix-boss→銀河 Boss、mix-victory→共用勝利；不更動正式音訊場景映射。
- GM 場景混音不再在映射缺失時回退單音檔，無音源／無映射均有明確文字；只有一軌時顯示「此場景只有單一音源，沒有環境聲」。`audio/audio-scenes.js` 為第二層環境聲加入 playing / error / play() rejection / volume 事件，GM 畫面獨立回報環境聲播放狀態及音量。注意：仍須真人聆聽才能驗證雙聲道聽感；非正式素材品質驗收。
- `index.html` 更新 GM/scene 腳本 cache-bust；保留角色戰鬥數值、正式玩家音量設定、73 項 GM 聆聽紀錄與四評價按鈕。

## 2026-10-10｜GM 試聽 100% 卻固定 27% 音量修正
- 根因：`gmSoundPlaySelected()` 每次呼叫 `gmSoundStopPreview()`→`CivilizationAudio.resetPreview()`，舊版 resetPreview 不僅停聲還將 GM master/music/battle 重設預設 .7/.45/.65，故使用者拉滿仍再回到 0.7×0.45×0.85≈27%。此外 GM 只有三滑桿，缺少 ambient/ui/notice 獨立試聽音量，且試聽資料顯示的是舊播放快照。
- `audio/audio-core.js`：`resetPreview({resetLevels=false})` 預設只停止音源、不重置 GM 音量；GM 試聽音量增加 ambient/ui/notice；`previewLevel` 即時調整現有音源，發布即時音量診斷及 `civilization-audio-preview-volume-changed`；不寫入正式玩家偏好。
- `audio/audio-scenes.js`：GM 環境聲依試聽專用 master/ambient 設定，滑桿移動立即更新，原正式音量設定不受影響。
- `audio/gm-audio-test.js`：六個滑桿主／音樂／環境／戰鬥／介面／通知，可見百分比即時更新，診斷不再固定在舊音量。保留單一／混音試聽、四評價、舊 GM 聆聽紀錄。
- `index.html` JS cache-bust 已更新；mock 執行檢查：GM master=100%、music=100%，經 resetPreview 後音樂仍以 85% 係數播放，而非 27%；三支 JS 語法 PASS。此 85% 包含分類設計 gain .85，不等於聲音實測響度；手機桌機真人驗收仍待。

## 2026-10-10｜跨手機桌機 GM 音訊差異補修
- 使用者驗證：11 個音檔直接網址於桌機全部可播放；在正式 GM 情境試聽內手機 1～4 可聽、桌機 1～4 無聲，5 未找到對應情境，6/8/9/10 可聽、7 Hover 與 11 Laser 太小。
- `audio/gm-audio-test.js` 新增「單一音檔／場景混音」兩種分明試聽模式，預設單一音檔，避免 GM 選單顯示 Sector 而實際試聽 Pulse 等錯位。保留八大情境分類、四評價按鈕、73 筆新分類／8 舊分類本機紀錄，不自動重寫玩家評價。
- `audio/audio-core.js` 單一 GM preview 現會透過媒體 `playing` / `error` / `play().catch` 回報實際播放或失敗，列出原因、音檔、聲道、實際音量；播放要求與真正有聲音不再混稱。
- `.github/workflows/audio-localize.yml` 已成功將原始 laserpew.ogg 本地化，量測平均電平 -34.1 dB；另產出 `laserpew-balanced2.mp3` 及 `hover_0-balanced2.mp3` 兩個提高響度且限制 true peak -2 dB 的新版音檔，保存 SHA-256 與 CC0 來源。正式 `audio/audio-core.js` 已切換兩項本地化音檔，`index.html` cache-bust 同步。
- 程式／FFmpeg 可解碼不等於桌機與手機真人實機聆聽通過；請分別測單一 Sector／Airy／Pulse／Urgent、切換場景混音、Hover/Laser 音量，再回報實際播放狀態及音量感受。暫不增補無可靠來源的新音檔。

## 2026-10-10｜正式音訊素材補完第 1 批（音檔已本地化並平衡；真人重聽未完成）
- 使用者《音樂音效001》回報：73/73 GM 新分類都有紀錄，舊分類 8 筆。僅 4 個唯一音檔實際有聲音：dark-hover、galaxy-battle、boss-orchestra、laser-preview；dark-hover 和 laser-preview 太小聲，另外七個 SRG774 素材先前無聲。
- GitHub Actions `.github/workflows/audio-localize.yml` 已實際成功：從 OpenGameArt `Dark Sci-Fi Audio Pack` CC0 官方來源取得 sector、airy、pulse、urgent、transmission、victory、hover、title 共 8 筆 MP3 原始檔，使用 ffprobe + ffmpeg 確認可解碼、測量均值與 SHA256；原始檔保留於 `audio/assets/*_*.mp3`，結果保存 `audio/assets/manifest.json`。
- 原始音訊均值音量普遍低（例如 urgent -44.6 dB、title -44.3 dB、airy -40.0 dB）。已使用 ffmpeg loudnorm（背景配樂目標 -23 LUFS、airy 環境 -30 LUFS、UI/勝利 -16 LUFS，true peak -2 dB）產生 8 筆 `*-balanced.mp3`，保留各來源 SHA256／處理後 SHA256／來源授權／資料長度；**音量平衡≠使用者已確認聽感或場景適配**。
- `audio/audio-core.js` 八筆 SRG774 MP3 全面改使用同源 `audio/assets/*-balanced.mp3`，另外三個 OGG（galaxy-battle、boss-orchestra、laser-preview）仍暫時遠端，尚待本地化與雷射短聲響度處理。更新 `index.html` cache-bust。
- `audio/gm-audio-test.js` 使用者舊紀錄保留不刪；當音檔網址更動時提示「素材已更新・請重新試聽」，摘要亦分出「素材更新待重新試聽」，避免拿舊版無聲紀錄說新版已通過。四個評分按鈕照舊，不自動切換。
- 待辦：手機／桌機真人試聽；三個 OGG 本地化；雷射音效修正；所有缺少實體聲音的情境挑選新高品質合法音樂／音效；完整正式事件接線／響度和記憶體壓測。本次不能宣稱 73 個情境已全部有正式聲音。

## 2026-10-10｜音訊素材全面補完第 1 批：聆聽實測與 CC0 本地化 Gate
- 使用者《音樂音效001》GM 摘要：73/73 正式情境已填，另 8 筆舊分類；實際「有聲音」的獨立音檔僅 `dark-hover`（太小）、`galaxy-battle`（正常）、`boss-orchestra`（正常）、`laser-preview`（太小）。不得把多個情境共用音檔算成多種聲音，其他七個 SRG774 遠端候選現階段不可視為可聽。沒有設定資產的情境仍是待素材，不要把「沒有聲音」誤視為編碼失效。
- 源網站 OpenGameArt `https://opengameart.org/content/dark-sci-fi-audio-pack` 明確登載八個 CC0 檔案；已新增 `.github/workflows/audio-localize.yml`，GitHub Actions 自動抓取官方原始連結，使用 ffprobe/ffmpeg 檢查可解碼時間、平均電平、SHA256、長度及來源，成功後才提交 `audio/assets` 與 `manifest.json`。流程不得把播放能力驗證冒充真人聆聽。
- 本地化成功之前不更改 `audio-core.js` 的現有 URL、不冒充已完成。核對腳本第一次因 runner 缺 `ffprobe` 而失敗，已加入 apt 安裝並重新觸發。若原始站下載／授權／格式驗證仍失敗，必須明確回報，不提交假檔案。
- 兩個「太小聲」要以本地化後音檔實測原訊號，再做合法的數位增益／限制器處理；單靠 HTML audio.volume 增大無法超過 1.0，禁止宣稱調倍率就解決。
- 待素材成功入庫後，再逐項改音檔引用、cache bust、QA；GM 原聆聽紀錄保留，更新版本需重新試聽。

## 2026-10-10｜音訊 A04 跨模式與空間音訊整合（程式施工，實機 Gate 未結案）
- `audio/audio-core.js` 升級共用聲音 owner：獨立 GM preview 音源完全釋放、播放代次失效防止切換後舊回報、`pagehide` 停止所有聲道並關閉 Web Audio Context。增加 `runtimeStats()` 可讀音樂／GM 試聽／戰鬥音效使用情況，`setListenerPosition({x,y,z})`、`spatialMetadata(position)`、`playSpatial(id,{position,volume,simulation})` 供 3D 模型後續接線。標準文字使用普通立體聲，3D 標準且同源／可安全處理音源才啟用 StereoPanner；第三方候選不強接 WebAudio 以防 CORS 無聲。最大戰鬥音效聲數沿用 3。正式公式與存檔完全不動。
- `audio/audio-scenes.js` 環境層改尊重主音量／環境音設定，設定更動即生效；隱藏頁與極簡模式停止聲音，回到頁面依目前情境恢復、不重播歷史戰鬥事件；GM 試聽期間不額外重疊正式情境音源。此層目前仍為雙 HTMLAudioElement，不能宣稱已完成真正多軌 Web Audio 混音或交叉淡入淡出。
- `audio/gm-audio-test.js` 「停止」按鈕現在真正停止 GM 背景配樂與環境聲雙層；既有四評價按鈕、本機紀錄、舊分類紀錄與完整複製摘要均保留。
- `index.html` 更新音訊程式 cache-bust。**待完成／無法從 GitHub 靜態檢查代替的事項**：桌機／iOS／Android 的實際聆聽、Safari AudioContext 解鎖差異、3D WebGL context loss 實機降級、所有實際 3D 模型聲源與 listener 綁定、長時間 memory/聲道壓測、正式音檔授權／本地化／LUFS 測量與音量標準化、多軌 crossfade／ducking／區域完整場景事件覆蓋。A04 只能標為「程式基礎施工」，**不得標為全面完成或實機通過**。
- 後續應依已定順序執行「正式音訊素材全面補完／本地化／響度／聆聽驗收」，不得把 11 個遠端候選宣稱為可靠的正式配樂。

## 2026-10-10｜A03 正式 UI／音訊情境對齊補修
- 正式核對文件：`docs/A03_FORMAL_AUDIO_SCENE_AUDIT_2026-10-10.md`。已修復由一般「探索／戰鬥／Boss／災厄」套版三紀元造成的虛構分類：高維改高維戰線、階段變化、回顧、界弦核心、定相／異相競技場、異宇宙選擇／戰鬥，移除高維主線 Boss 雙分類及高維文明災厄；宇宙主線只有 Boss，沒有銀河式普通／菁英類型。
- `audio/audio-scenes.js` 正式 A03 scene catalog 與 `audio/gm-audio-test.js` 八分類細項同步；`ui.js` 正式 render 導航、`alternateuniverseui.js` 異宇宙、`thirdworldarenaui.js` 高維競技場的音訊只讀接線。通用戰鬥事件不得覆蓋異宇宙、高維競技場及合法副本情境。
- GM 四評價按鈕、`civilization.gm.audio.review.v1` 本機紀錄及摘要複製保留。舊分類已填紀錄單獨列在摘要，不亂映射或刪掉；新分類各項後仍顯示尚未填寫／已填評價。GM 試聽離開時恢復正式背景音樂。
- `index.html` JS cache bust 已同步；此次沒有改正式戰鬥公式、獎勵、存檔 schema。重要區分：**主要 UI／模式分類已對齊**，不代表所有按鈕／Boss 階段事件百分百 hook，也不代表遠端音檔可聽或響度驗收完成。待辦清單及正式依據見 audit 文件。

## 2026-10-10｜音訊 A03 GM 多層情境試聽補充
- 現有 GM 八分類不變：高維／宇宙／銀河等場景播放按鈕已透過 `CivilizationAudioScenes.previewContext` 試聽配樂＋獨立環境層（目前遠端候選，可能載入失敗），離開、切換場景或頁面時停止試聽音樂與環境。四評價按鈕／本機紀錄／摘要均保留。
- A03 `combatfx.js` 兩個 eligible event 分支均以大括號包裹場景通知＋A02 戰鬥音效；`firstActor`/`battleEnd` 不觸發。
- 仍未達完整 A03 Gate：正式 UI 全事件、三紀元專屬素材、實機聆聽、專業混音均尚待後續 A04 與素材補完，禁止誤列全數完成。

## 2026-10-10｜音訊 A03 情境管理第一階段（程式已施工；素材與全場景映射未結案）
- 新增 `audio/audio-scenes.js`：唯一三紀元音訊情境表（銀河／宇宙／高維／共用），涵蓋主畫面、探索、戰鬥、Boss、災厄、異宇宙、競技場、懸賞（只在前兩紀元）、鏡像、虛空、轉生、勝利、背包、強化、專精、雲端等情境的音訊映射或待素材空位；不寫正式存檔。
- 提供 `CivilizationAudioScenes.setContext(era,scene)`、`notify(type,detail)`、`current()`、`restore()`、`stop()`、`catalog` 與文件事件 `civilization-audio-scene`。三紀元僅用同一 `CivilizationAudio` 正式播放 owner。
- `combatfx.js` 兩條結構化事件播放路徑橋接戰鬥情境，戰鬥結束後延遲 3.5 秒恢復探索，連戰防止每場重播曲頭；不更動傷害、數值、掉落。音效仍由 A02 共用事件 owner。
- 第一互動解鎖音訊時通知音訊情境管理員；背景／極簡停止後預留回來按目前情境恢復。環境層已可與配樂同時播放，但只是臨時雙 HTMLAudioElement，非完成 Web Audio 混音系統。
- A03 **尚未完工**：大多數正式 UI／劇情／轉生／特殊模式缺獨立可信事件橋接；高維正式事件 identity 不等於推測狀態；11 筆遠端候選音檔尚未本地化或品質驗收；無正式響度統一、淡入淡出、多軌交叉混音、三維定位。A04 亦不得宣稱完成；先做 A03/A04 程式，再集中補素材並由使用者回報聆聽摘要。
- GM 音樂音效測試中心仍依場景分類、四個評分按鈕、本機儲存與摘要複製。使用者未貼回評價前，不根據未取得的評價修改正式素材。

## 2026-10-10｜GM 音訊評價操作修正
- 聆聽評價由單選下拉改四個直接按鈕：正常／太小聲／沒聲音／不適合；點擊即本機保存，不自動跳下一首。場景選單每項名稱後顯示「尚未填寫」，填寫後顯示對應評價。音檔載入診斷另行顯示，不能混淆驗收結果。
- 複製回報摘要包含全部場景與事件數、已填寫及尚未填寫數量，並分別列出已填寫詳細紀錄與尚未填寫清單。繼續保留先收到使用者貼回回報再修改 GitHub 音訊素材的規則。

## 2026-10-10｜GM 音樂音效私人聆聽紀錄（使用者定案）
- 音樂／音效場景選單每個項目後方**不顯示驗收與否、核可與否字樣**，只列場景名稱。可保留播放診斷於獨立狀態文字，不代表使用者驗收。
- GM 試聽新增聆聽結果：正常、太小聲、沒聲音、不適合；選擇即存本機 localStorage，**不會自動跳下一首、不會只篩未驗收、不會寫入 GitHub**。
- 增加「複製驗收摘要」供使用者手動貼回 ChatGPT；**收到使用者貼回的回報後，才針對素材和狀態於 GitHub 提交修正**。舊的上一項／下一項仍切換即試播。
- 跨瀏覽器／裝置不自動同步這些本機聆聽結果；不得把技術載入檢查當成聽覺核可。

## 2026-10-10｜音訊 A01～A02 場景式 GM 測試中心補修（最新）
- 使用者明確要求：GM 音樂音效測試中心依場景、紀元、狀況與事件分類，不得再按 A01/A02/A03 批次分類；與 GM 3D 測試中心分離，文字／3D 標準同一聲音映射，所有極簡模式完全靜音。
- 已更新 audio/gm-audio-test.js 八分類（主畫面與系統、銀河、宇宙、高維、戰鬥技能、怪物特殊遭遇、副本特殊戰鬥、情境混音），跨紀元試聽不更動正式角色。實際可選項未涵蓋完整地域／宇宙深度／怪物正式身份，不得宣稱已完成全名映射。
- audio/audio-core.js 增加 8 筆 SRG774 / Dark Sci-Fi Audio Pack CC0 遠端候選（共 11 筆）；A02 勝利事件可指向新的勝利聲。來源與實際欠缺項詳見 audio/A01_AUDIO_LEDGER.md。
- 專業素材本地化、真正多軌混音、所有 Boss／武器／怪物專屬音效、全部正式場景與播放情境的完整映射及瀏覽器手機實機聆聽，**仍待完成**。遠端候選素材不等於正式遊戲音訊資產。A01/A02 音質與資產 Gate 不能標記完全完成。

## 2026-10-10｜音訊 A02 事件橋接初步提交（尚未完整驗收）
已修改 audio/audio-core.js、audio/gm-audio-test.js、combatfx.js、index.html：正式標準／鏡像結構化事件接同一音訊入口，GM 獨立測試中心新增事件模擬與素材缺口顯示；240ms 節流與最多三個聲道，極簡模式完全靜音，背景停止。A01 遠端雷射素材仍只是候選，暴擊／閃避／連擊／反擊／護盾／Boss 等缺少專業授權素材；其它戰鬥模式尚未逐一接線／實機驗證。A02 不能標示完整完成。完整清單：audio/A01_AUDIO_LEDGER.md。保持文字／3D 標準音訊共用、任何極簡模式皆完全靜音、GM 試聽音量離開後重置。

## 2026-10-10｜音訊 A01 初步施工，尚未結案
已新增 audio/audio-core.js 與獨立 GM 音樂音效測試 audio/gm-audio-test.js，正式 index.html 已接入。素材狀態詳見 audio/A01_AUDIO_LEDGER.md。使用者定案：史詩交響加科幻電子、免費合法高品質素材優先、所有極簡模式完全靜音、文字和 3D 標準同情境同音樂音效、背景暫停與回來恢復、首次互動後預設開啟音樂。此規則優先於舊文。現階段僅三筆 CC0 遠端候選試聽，尚無本地正式素材、Web Audio 完整混音、正式情境自動播放與實機驗收；不得宣稱 A01 已完成。

## 2026-10-10｜後續音樂音效與正式第 27～40 批新版定案規劃（**僅文件，未施工**）
- **後續施工唯一優先規格：[`docs/3D_AUDIO_AND_BATCH27_40_MASTER_PLAN_2026-10-10.md`](docs/3D_AUDIO_AND_BATCH27_40_MASTER_PLAN_2026-10-10.md)**。本次使用者確定：先新增不占正式編號的共用音訊 A01～A04 四批，再執行正式 27～40 批（不新增第 41 批）。文字／3D 共用音樂、戰鬥、環境及介面音效；真正的立體場景與攻防、文字操作並存。
- 全部裝備 210 套／1,050 名稱位置與**所有正式怪物／Boss／特殊／副本／災厄／異宇宙及區域場景名稱**必須建立穩定唯讀映射；**原 24 怪物基模／前五家族絕非上限**，正式怪物家族依 main 全量盤點決定，映射完整和美術品質分別驗收。
- 正式 3D 必須完整具備文字模式全部合法功能，特別是 GM 背景戰鬥、1×／1.5×／GM2×、連戰、離線及 Fast Catch-up；3D 標準／極簡切換不另起正式戰鬥、不因動畫音效減速。所有功能介面保留可讀 HTML 名稱、數值、快捷控制。
- **目前只記錄計畫**：音訊 A01～A04、正式第 27～40 批均未因本次提交而實作；舊文件中的原第 27～40 批短篇列表只具歷史參考性，衝突時以新版總規格為準；正式程式真實來源仍是 fresh-read main。原 Word 仍保留歷史背景。

## 2026-10-10｜第 19～26 批後整合優化第 6／6 批：舊入口盤點、測試守門與交接收尾
- 本批以「保留正式舊模式與玩家存檔」為原則，核對 `3d-test/prototype-engine.js` 的早期 `mount()`、`createScene()`、`createEpochScene()` 及對外 export；因相容性與後續降級用途不直接刪除。既有幾何備援仍供正式 GLB 缺件時使用，正式第 27～34 批導入模型後再逐項盤點可淘汰分支。
- `tests/runtime/3d-b18-coverage-guard.js` 清理多處重複的 HTML 固定版本字串比對，改為驗證正式 `index.html` 和 GM `3d-test/index.html` 各有且僅有一個帶 `v` 的正確入口，兩者版本一致；同時增加舊 API 保留斷言。避免每批微調入口版本時重複手動更新測試，保留原先資料名稱、31 場景、GM 隔離、生命周期、畫面覆蓋等守門。
- 自我檢查：遠端 main 重新讀取、回歸測試 JS 語法解析通過、兩入口確實同為 `20261010-opt5-snapshot`、三個舊函式及 export 保留；未更動正式遊戲、任何資源 loader、玩家 save 或 GM 31 場景，故本批無須改正式 HTML cache-bust。
- **驗收界限**：這是程式及靜態守門整理，不代表已在 exact-HEAD 執行 Node test suite、Chromium、授權 GM iframe、手機 WebGL 或 GPU 30 分鐘驗收。第 26 批僅部分 GPU/LOD 驗收待高品質素材完成後復測。
- **下一階段唯一有效狀態**：原正式 40 批中的第 1～26 批已具施工成果（但不得一律聲稱全部實機封版）；第 23～24 批間五批一致性補修已施工，使用者已確認第五批實機驗收；本輪六批整合優化皆已有程式/測試/文件提交。下一批是正式第 27 批，正式 GLB／LOD／貼圖／授權／GPU 模型驗收不可借用前期佔位素材數據。
- **後續不可違反**：main 是唯一程式真實來源；正式戰鬥/結算/離線收益/存檔 owner 不由 3D 接管；GM 31 可視場景、210 套命名／1,050 名稱位置、同步正式與自由 fixture 隔離；完整 3D 模式僅第 40 批決策開放；改 JS/CSS 更新 HTML cache；修改後回讀且嚴格區分靜態／自動／實機證據。

## 2026-10-10｜第 19～26 批後整合優化第 5／6 批：正式戰鬥呈現與 GM 快照契約
- 僅調整正式戰鬥的唯讀 3D 呈現快照及 GM iframe 橋接，未修改原戰鬥運算、事件結算、角色存檔、自由測試資料或 GM 授權。
- `gm3dprototype.js` 與 `3d-test/formal-home.js` 的戰鬥呈現快照統一 `schema:1`、`status:active/unavailable`、`source:formal-combat`、`eventType:presentation-snapshot`；正式 owner 的 HP/護盾資料通過有效性檢查才可呈現，無進行中戰鬥時明確宣告 unavailable。這不是完整的戰鬥事件日誌、傷害觸發器或結算 owner，正式第 35～39 批仍需按主程式補齊事件。
- `3d-test/test-center.js` 對正式場景回應新增格式/狀態/有限數值檢查，不允許格式錯誤的資料取代正式快照；自由測試 fixture 仍在獨立流程，不寫回正式遊戲。
- 更新正式與 GM HTML 快取版本到 `20261010-opt5-snapshot`，並新增 regression guard 檢查兩端呈現契約與 GM 驗證流程。維持 31 個 GM 場景及先前三紀元裝備映射。
- 本批程式施工與遠端 main 靜態回讀已完成；真實授權 GM iframe、Chromium、手機 WebGL 與實際戰鬥執行流程仍需實機驗收。第 6／6 批將進行舊程式盤點與總回歸，正式第 27～40 批不重編。

## 2026-10-10｜第 19～26 批後整合優化第 4／6 批：場景共用工具保守重構
- 依原優化清單 6、7、8、19：`3d-test/prototype-engine.js` 新增共用 `sceneMaterial`、`sceneFillLight`、`applyCameraLimits`，既有 `visualMaterial` 與 `configureDisplayCamera` 保持相容轉接；角色、裝備、養成、副本與服務場景部分共用光源工廠，維持既有光照強度及鏡頭操作數值，不更動正式遊戲 owner、戰鬥公式或存檔。
- 共用 factory 版本更新到 0.26.1；正式與 GM 場景 fallback 及兩份 HTML cache 版本更新為 `20261010-opt4-scene-common`；靜態守門新增共用 helper 存在檢查。GM 31 場景與正式三紀元資料映射不變。
- **未全面拆分成多個 JS 模組**：本批先建立安全共用抽象，避免下一批在正式模型導入前遭遇同步載入順序與場景行為回歸；實體模組切分視第 27～34 批模型資產分群逐步進行。
- 自我檢查包括 GitHub 最新 main 回讀、JS 語法/靜態檢查；真實桌機與手機視覺、相機行為、長時間 GPU 量測仍需使用者實機驗收。施工期間曾出現 GitHub 409 版本衝突，已重新讀取 main 後補齊變更，未強制覆蓋新版本。

## 2026-10-10｜第 19～26 批後整合優化第 3／6 批：外觀映射與幾何降級契約
- 本次進入 main 時已存在同一批部分前置施工：`appearance-snapshot.js` 的五槽 `modelDescriptor/modelDescriptors`、`prototype-engine.js` 的幾何備援 metadata、三紀元 210 套外觀名稱選取；因此保留既有邏輯，只補跨場景的一致性，不重新製造第二套映射。
- 共用 `Civilization3DAppearance.scene()` 對 character／equipment／forge 同步提供 `modelDescriptors` 和 `appearanceSource`。正式 capture 為 `formal`，GM 自由展示維持 `fixture`；模型描述含槽位／實穿狀態／紀元／名稱／visualKey／品質／等級／強化與明確 `geometry-fallback`，尚無正式 GLB assetId。
- 角色場景及五槽裝備場景優先使用上游共用 descriptors；沒有時才走原有 appearance adapter，並在視覺 metadata 標記來源，保持不寫回正式存檔。共用外觀資料的五槽順序維持 weapon／helmet／armor／shoes／accessory，實穿混搭紀元與空槽不強制改裝。
- 正式與 GM fallback JS 和入口 HTML 版本同步至 `20261010-opt3-sharedmap`；更新 `tests/runtime/3d-b18-coverage-guard.js` 的相關欄位守門與快取斷言。期間遇到 main 併發修改而產生 409 衝突，已重新讀取最新 main 再補缺，不強制覆蓋他人內容。
- **實際 GLB manifest、角色全身與五槽部件、LOD/貼圖/授權及模型缺件顯示效果**留在正式第 27～34 批；不能將 geometry fallback 或 1,050 名稱位置說成 1,050 個完成模型。須實機驗收正式與 GM 切換、三紀元命名、五槽來源、空裝、手機及 fallback。

## 2026-10-10｜第 19～26 批後整合優化第 3／6 批：三紀元裝備模型映射契約
- 原正式 40 批編號不變；此批只施工第 5、14、15 項的資料映射前置，不提前聲稱第 27～34 批 GLB 美術已完成。
- `3d-test/appearance-snapshot.js` 新增純唯讀 `modelDescriptor(type,item,defaultWorld,enhancement)` 與 `modelDescriptors(appearance)`：保留五槽 `type/present/world/name/visualKey/quality/level/enhancement`，空槽明確處理；目前所有物件標明 `assetKind:geometry-fallback`、`assetId:null`、`fallback:procedural-geometry`，直到正式合法 GLB manifest 有權威映射後才可升級，不能從名稱推測不存在的模型 ID。
- `3d-test/prototype-engine.js` 角色、裝備場景 metadata 接入同一模型映射契約，保留目前幾何模型、原五槽呈現和 GM 自由模式；正式與 GM 使用同一外觀 adapter（若 adapter 不在場則保留安全唯讀 metadata 備援）。210 套、1050 名稱位置沿用舊有正式 owner 與補修規則，不建立 1050 個獨立 GLB。
- 正式／GM 場景資源 fallback 版號更新、兩處 HTML cache-bust 升至 `20261010-opt3-modelmap`；回歸守門補充映射與降級規則。
- 只做資料契約和 metadata：未更動角色強度、正式換裝/背包/強化、存檔 schema、GM 授權或美術模型。舊佔位模型保留為 WebGL/GLB 未來載入失敗的安全備援，待第 27～34 批逐步判斷哪些可淘汰。
- 自我檢查限本次 main 回讀及可執行的 JS 語法解析、靜態守門核對；未取得 Chromium、手機、授權 GM iframe、完整 210 套實機循覽的執行證據。

## 2026-10-10｜第 19～26 批後整合優化第 2／6 批：3D 載入與快取一致性
- 保留正式首頁按需載入、GM 獨立 iframe、現有 31 場景與正式角色快照授權界線；未動玩家戰鬥、裝備或存檔。
- 修正 GM `3d-test/test-center.js` 原本只要任一 manifest 指紋缺失就讓整組 3D 資源回退的問題：現在檢查 schema 與各路徑的 24 位 digest，只針對缺失項使用各自的安全備援；與正式 `3d-test/formal-home.js` 的逐檔 fallback 契約對齊。GM 外觀模組 fallback 改與正式介面一致。
- 正式及 GM 的動態 script loader 清理 load/error callback，失敗時移除 script 元素，避免失敗節點積累；仍於使用者開啟需要的 3D 預覽時載入。
- HTML 入口 `index.html`、`3d-test/index.html` 的變更檔快取參數更新至 `20261010-opt2-loader`；`tests/runtime/3d-b18-coverage-guard.js` 更新 manifest 部分缺值守門及 cache 斷言，保留 Runtime 第 1 批 4 版防護。
- 本批**未拆出共同載入器模組**，因為正式首頁與 GM iframe 載入時機和環境不同；改以相同逐檔驗證契約和靜態守門減少分歧。後續若要完全抽成一個 shared JS 模組，須先確保文字模式零阻塞與 GM iframe 同源／授權隔離。
- 完成程度：GitHub main 已更新；本批尚未獲得實際 Chromium、Pages 部署與手機 WebGL 測試結果，不可宣稱通過。下一批為額外整合優化第 3／6 批（外觀模型映射與舊幾何降級），正式第 27 批不重編。

## 2026-10-10｜第 19～26 批後整合優化第 1／6 批：資源生命週期（項目 1、2、9）
- 正式第 26 批多數實機測試已由使用者確認；尚有依賴後續正式 GLB 模型的 GPU/LOD 實測，不可提早標通過。
- `3d-test/runtime.js` 升為 VERSION 4，保留原 `assets Map` 相容 API，新增 `acquireAsset(key,factory)`／`releaseAsset(key)` 參照計數契約與 `leasedAssetCount` 唯讀檢查資訊；清理、停止、故障時統一處理暫存資產，防止下一次 Engine 啟動沿用已釋放的 GPU 物件。未來 GLB loader 必須配合非同步 abort、執行期資產與場景實例的所有權規範；**此批沒有實際導入 GLB，也不能宣稱已全面驗證 GPU refcount**。
- 非同步場景失敗且 epoch/AbortSignal 已失效時直接以 stale-scene 返回；WebGL context restored 回覆 idle 狀態而非冒充已恢復先前 scene，仍須使用者/主介面重新啟動預覽，文字模式不受干擾。
- 正式與 GM fallback runtime URL 及兩側 HTML cache-bust 均改為 `20261010-opt1-lifecycle`；更新 `tests/runtime/3d-b18-coverage-guard.js` 的版號和靜態守門。
- 已提交並回讀 GitHub main；實際 Chromium、授權 GM iframe、手機 WebGL 故障注入／長時 GPU profiler 尚待執行，不得與程式自我檢查混為一談。下一批整合優化為第 2／6 批（載入器及快取統一），原正式第 27 批編號不變。

## 2026-10-10｜正式 3D 第 26 批：A2 Runtime 效能與場景生命週期施工
- 使用者已確認正式第 25 批實機測試完成。第 26 批本次採保守 Runtime 調整，不改正式遊戲 owner、文字版戰鬥／存檔、GM 授權或 GLB 施工計畫。
- `3d-test/runtime.js` 升級 VERSION=3：以 ResizeObserver 監聽預覽容器尺寸，處理手機最大化／還原和非視窗尺寸改變；頁面隱藏、pagehide 暫停 WebGL render loop 中的 scene.render，pageshow/visibilitychange 恢復及 resize；場景 async show() 加入 AbortSignal stale check；dispose 時移除新增事件監聽與 ResizeObserver。
- 正式 `3d-test/formal-home.js` 和 GM `3d-test/test-center.js` 共用新版 Runtime fallback；`index.html` 和 `3d-test/index.html` 更新快取，靜態 guard 新增 Runtime 生命週期及版本守門。31 GM 場景不變；資產映射、模型 LOD 與 GPU 預算的正式模型複測仍留在 27～34 批。
- 本批僅已完成程式施工與 GitHub main 檔案回讀/靜態守門內容核對，未提供實際 Chromium、手機 GPU 30 分鐘、記憶體 profiler 或 WebGL context loss/restore 通過紀錄；**不可視為 A2 全場景 L2、GPU 無洩漏或第 26 批實機驗收完成**。舊 asset cache `Map` 尚無 GLB refcount，不能冒稱已解決正式模型 GPU cache。
- 實機驗收請依序測：正式與 GM 切換不同 3D 場景、桌機縮放與頁面捲動、手機直橫轉及最大化還原、分頁背景→恢復、WebGL context loss 回退、連續關開 30 分鐘觀察 GPU/記憶體與畫質、切文字模式且存檔不變。下一個正式施工批次為第 27 批，但應如實保留本批 GPU 長測結果。

## 2026-10-10｜正式 3D 第 25 批：全息紀錄、劇情與轉生非阻塞預覽
- 使用者確認第 24 批實機測試完成；正式第 25 批依原 40 批編號施工，不影響補修批次。
- `3d-test/prototype-engine.js` 的 `createChronicleTransitionScene()` 共用正式及 GM 已有的三個唯讀場景（戰線紀錄／劇情閱讀／文明轉生），加入檔案庫全息索引、資料碎片、書頁視覺線條，以及轉生用環形紀元門與輕量動畫；不新增 GM 重複選單，也不虛構正式劇情文字。metadata 明確標記 `skippable/nonBlocking`；視覺預覽仍由既有 HTML 開關及轉生 owner 控制，動畫不阻擋使用者操作、真正轉生、劇情閱讀、回顧或警示。
- 快取版本：正式 `formal-home.js`、GM `test-center.js` 入口與 `prototype-engine.js` 備援路徑更新為 `20261010-b25-chronicle`；工廠版號 `0.25.0`。靜態 coverage guard 保留前批邊界檢查並新增本批視覺標記斷言。
- 自我檢查：GitHub main 回讀與版本/來源標記靜態檢查；未在本批執行 exact-HEAD Node、Chromium、手機 WebGL 長測或正式登入帳號實機操作，不能宣稱已通過。
- 使用者實機驗收：戰線紀錄回顧仍能操作與閱讀；劇情文字、換頁、警示及 3D 預覽並存；轉生必須保留原確認流程且可立即關閉預覽；GM 三場景可切換；桌機／手機反覆開關、最大化還原、context loss 後安全回退；正式角色與存檔不變。
- 第 25 批程式施工完成，下一批原訂第 26 批效能／鏡頭／質感驗收；不可提前開放正式完整 3D 模式。

## 2026-10-10｜正式 3D 第 24 批：災厄與異宇宙維度環境（程式施工）
- `3d-test/prototype-engine.js` 的共用 `createFrontierScene()` 新增固定上限 12 個維度裂片、外圈維度邊界；雙紀元十災厄依正式 `calamitySeals` 的 visible／unlocked／completed 呈現不同高度封印碑、解鎖環冠與旋轉核心環。此為純視覺幾何，不產生解鎖、永久 HP 或戰鬥狀態。
- 異宇宙沿用正式 200 宇宙／五深度及文化映射，按目前選中宇宙與深度呈現破裂核心與不超過 8 個裂片；未用 `U` 編號推測文化階級。兩個入口共用場景工廠，不增加重複 GM 場景。
- 已更新正式與 GM 備援場景版本，以及 `index.html`／`3d-test/index.html` 快取參數；原文模式、GM 授權、戰鬥及存檔程式未變更。正式完整 3D 模式仍未開放。
- 驗收邊界：已回讀 main 主要變動與靜態關鍵字，尚未取得本 commit 的 Chromium／手機 WebGL／長時間效能與正式帳號 iframe 實機結果；不得標記實機通過。請測 W1／W2 十災厄鎖定、可挑戰、完成；W3 異宇宙 U001～U200、深度 1～5、文化焦點；開關/重開預覽、手機全螢幕還原、context loss、31 GM 場景及文字模式進度不變。
- 原 40 批不重編；第 24 批程式施工完成後接第 25 批，正式 GLB 資產映射仍於第 27～34 批施工。

## 2026-10-10｜第 24～40 批正式施工強制繼承規則（五批補修定案）

> **規範層級：後續施工準則，不表示以下功能已獲實機驗收。** 當前 `main` 及其正式遊戲 owner 才是唯一真實資料來源；本節統整五批補修後適用於第 24～40 批的長期契約。原批次編號不變。

1. **3D 僅負責呈現。** 文字版與現有正式戰鬥公式、隨機、掉落、結算、帳號、GM、雲端、轉生、離線收益、速度與存檔繼續由原 owner 管理；3D／GM 視覺層絕不直接寫回正式 state、storage 或更動權限。正式 3D 模式要沿用同一角色及事件來源，文字模式永久保留。
2. **GM 預覽雙來源、缺資料不造假。** 有動態內容的場景提供「同步正式資料／自由測試設定」：前者僅透過授權、同源、限定 iframe 的唯讀快照，後者產生彼此隔離的視覺 fixture。正式快照不可用、載入失敗或欄位缺失時，必須明確顯示等待／錯誤，不得靜默改用自由模式數據；需要時按需載入，不將全部 3D 資源加入一般首屏。純裝飾、紀錄及服務場景不強制增設無意義的雙模式。
3. **GM「看圖優先」，控制項最少。** 不重建第二套完整 GM 數值工具；只選會改變可見模型／場景身份的狀況。文明災厄自由模式保留「第 N 隻＋模擬狀況」，視覺上前 N−1 隻完成、後面未解鎖，正式模式則逐隻忠實讀取銀河印記／宇宙文明條件，不套用這個便捷推算。專精、印記、文明等級、界弦核心及鍛造自由測試優先初始／成長中／已滿級；必要時才另增具體外觀差異的選項。
4. **三紀元裝備名稱和套組是權威映射，不是手動造表。** 銀河由 `WORLD_REGIONS`＋`MAPS` 提供 10 大區×10 小區×5 槽（100 套／500 名）；宇宙由 `SECOND_WORLD_REGIONS`＋`secondWorldBoss(index).equipment` 提供 10 大區×10 Boss×5 槽（100 套／500 名）；高維由 `THIRD_WORLD_EQUIPMENT_NAME_ROWS` 提供 10 個命名階段×5 槽（10 套／50 名）。共 **210 套／1,050 個名稱位置**；這些是名稱位置數，不意味要逐件建立 1,050 個不共用的 GLB。角色全身、五槽陳列共用紀元→大區→小區／Boss（高維直接階段）選取，選完下方唯讀列出五件正式名稱。正式模式讀實際穿戴，允許混穿、空槽，不能強制替換成完整套裝。
5. **第 27～34 批正式美術資產映射契約。** 模型／換裝／材質依原始 `type`、`world`、`name`／`visualKey`、品質、裝備等級、五槽穿戴與強化等快照建立**可追溯、可共用、明確標記缺件降級**的映射；外觀不以小區名稱臆測。裝備與來源不匹配是驗收失敗；幾何佔位不等於正式 GLB 完成。資產與授權、本地化、LOD、版本指紋、手機 GPU 預算在第 34 批集中檢查，且不能用第 26 批早期幾何效能代表最終模型效能。
6. **第 24～25 批及第 35～39 批場景／戰鬥契約。** 銀河、宇宙災厄與高維十存在、異宇宙 200×5、宇宙選定／回顧焦點，都由正式 owner 決定。高維無懸賞戰，不可冒用宇宙懸賞。正式戰鬥 HP／護盾以 `getCombatPresentationSnapshot()` 等已存在的 owner 為基礎；補齊特殊遭遇、結算、死亡、回顧、定相／異相三戰與高速補播等正式事件後才可宣稱完整同步，禁止讀 DOM 寬度或自由 fixture 假冒權威數值。
7. **第 26／34／40 批驗收與 cache 規則。** 每次改 JS／CSS 同步更新相關 HTML cache-bust，優先採內容指紋與按需載入、避免無限疊加過時參數；不清除或移轉玩家存檔來解決視覺問題。每次變更重讀 `main`、跑語法／靜態守門、實際可執行的 Chromium／GM iframe／桌機及手機測試，檢查 31 GM 場景、210 套名稱、正常／已全破角色、跨紀元、關閉重開、WebGL context loss、模式切換／回退、舊資源更新與正式存檔隔離。**未執行的測試不得標「通過」。** 第 40 批才作正式 3D 全面啟用決策。
8. **批次回報、風險與版本。** 施工前讀 `main` 及本規範；施工後回報「修改內容／程式自我檢查／實機驗收清單／提交與待補」，以當次真實 commit SHA 為準。五批一致性補修屬第 23 與第 24 批之間的插入作業，不重編原 40 批；目前已完成程式施工，**正式授權 GM iframe、手機 WebGL、Chromium exact-HEAD 與特殊遭遇／結算權威事件仍有待驗證缺口**。在驗收前不得稱五批已正式封版。

## 2026-10-10｜五批一致性補修：第 5 批總回歸與舊快取整理

**狀態：程式施工與遠端 main 靜態自我檢查完成；Chromium／真實授權 GM iframe／手機 WebGL／Pages 最新部署仍需實機確認，不能標為完整實測通過。**

- **整體**：沿用補修第 2 批的「同步正式資料／自由測試設定」隔離。只在地圖、災厄、異宇宙、五副本、四戰鬥、七個角色／裝備／養成可觀察場景提供有意義的切換。紀錄與管理維持純唯讀幾何展示。原 GM 八分類、31 項唯一視覺場景不變；禁止 GM 自由測試參數寫回正式 state、存檔或改變戰鬥／轉生／權限。
- **正式角色外觀**：原遊戲按需載入 `Civilization3DAppearance.capture()`，經已授權同源 iframe 回傳；不存在來源或資料不完整時顯示錯誤，不以 free fixture 冒充正式資料。正式裝備五槽顯示實穿名稱，允許混穿不同紀元及空槽。
- **裝備名錄回歸**：銀河 10 × 10 小區域 × 5 名、宇宙 10 × 10 Boss × 5 名、高維 10 階 × 5 名，完整 210 套／1,050 個名稱位置，來自既有 `WORLD_REGIONS/MAPS`、`SECOND_WORLD_REGIONS/secondWorldBoss`、`THIRD_WORLD_EQUIPMENT_NAME_ROWS`。新增 `tests/runtime/3d-b18-coverage-guard.js` 靜態 100/100/10 命名回歸守門；`tests/runtime/gm-3d-test-center-browser.js` 新增受控 postMessage 假快照的三紀元分層選單、來源切換、錯誤回覆與不寫 storage 斷言。**受控假快照測試不等於正式 iframe 已通過實測**。
- **使用者可見 GM 控制**：災厄自由設定僅「第 N 隻＋模擬狀況」，前 N−1 隻自動完成、後面未解鎖；角色和五槽裝備選紀元／大區／小區或 Boss（高維十階）並顯示五件名稱；鍛造與四養成以少量三階外觀選項為主；五副本及四戰鬥視覺只調整有意義的場景條件，正式 HP／盾優先讀 `getCombatPresentationSnapshot()`。各正式場景仍依原 owner 狀態，不得把自由模式的推算當作正式通關。
- **舊快取整理**：僅合併 `index.html` 的 `gm3dprototype.js`、`3d-test/formal-home.js` 與 `3d-test/index.html` 的 `test-center.js/.css` 長年疊加的舊查詢參數，改為單一 `v=20261010-repair5-final`；內容指紋仍須由既有 `resource-manifest.json` 產生流程管理。未清除任何玩家舊存檔、裝備或紀元進度，也不變更戰鬥、計算公式與正式遊戲 schema。
- **待驗重點**：需實際執行兩個 runtime 測試與 31 場景，確認真實授權 GM iframe 中的正式快照不再等待、高維全破角色 W1/W2 回顧焦點、三紀元 210 套裝名稱、異宇宙中斷、W3 懸賞排除、正式戰鬥盾／HP、手機最大化／還原、WebGL context loss 與新資源版本載入。特殊遭遇和正式結算 owner 尚未完整涵蓋，不應宣稱完成全部正式結果快照。
- 原訂第 24 批之前的五批一致性補修已完成**程式施工**，但正式恢復第 24 批前應先把以上實機 gate 核對；未取得通過證據不可標註正式封版。

## 2026-10-10｜補修第 4 批再次補修：正式角色外觀等待與 210 套裝完整對應

- **正式角色同步**：`gm3dprototype.js` 收到具 GM 授權與 iframe 同源來源的外觀請求時，先按需載入 `3d-test/appearance-snapshot.js`（優先使用 `resource-manifest.json` 內容指紋），等 `capture()` 完成才回覆。任何模組載入、角色或名稱資料問題回 `civilization3d:appearance-error`，GM 顯示具體錯誤，不再把 null 快照無限顯示為等待。此流程未新增普通玩家進站時的阻塞式 3D 載入。
- **不複製正式名稱**：同一回覆另附 `catalog`，來源皆為正式 runtime owner：銀河全域 `WORLD_REGIONS` + `MAPS` 中的 `map.name/gear[5]`；宇宙 `SECOND_WORLD_REGIONS` + `secondWorldBoss(index).equipment`；高維 `THIRD_WORLD_EQUIPMENT_NAME_ROWS`。只有 **銀河 10 區×10 小區域＝100 套（500 名）／宇宙 10 區×10 Boss＝100 套（500 名）／高維 10 命名階段＝10 套（50 名）** 的完整資料才接受；資料不完整會報錯，不用自編名稱來填補。無新增存檔欄位。
- **GM 自由模式**：角色全身展示／五槽裝備陳列共同採用「展示紀元 → 大區域 → 小區域／Boss」，高維則為「展示紀元 → 命名階段」；下一層選單各自不超過十項。選後下方**唯讀列出正式對應的武器、頭盔、鎧甲、鞋子、飾品五個名稱**，並帶入測試外觀的 `name/visualKey`。變更紀元／大區域自動重置不相容的子選項。
- **GM 正式模式**：下方五件裝備名稱直接讀取目前真正穿戴的個別裝備，而非強制套用某一套；允許不同紀元混穿與空槽。**目前角色與裝備場景仍是共用幾何佔位模型，名稱與 visualKey 已對應不代表正式裝備模型都已製作**。
- **強化鍛造台**：自由模式只保留展示紀元與「初始／成長中／滿級」強化外觀階段；正式模式維持五槽實際強化快照。去除舊的展示等級／品質／單一強化值／個別穿戴勾選等繁雜控制，不影響正式遊戲養成或戰鬥。
- **程式驗證**：逐檔核對十份銀河地圖 100 個五槽 gear 名稱、宇宙 100 個五槽 Boss equipment 名稱、高維十階五槽名稱，共 210 套 1050 個位置；原定義均齊全且銀河 500 名互不重複。GM iframe 真實瀏覽器、手機及最新 CI 實跑仍需驗收；不要將靜態檢查表述為實機通過。

## 2026-10-10｜3D 一致性補修第 4 批：角色、五槽裝備、養成、紀錄與設定

- 繼續採用第 2 批原則：「同步正式資料／自由測試設定」只用於有真實資料來源且可辨識外觀差異的場景，GM 以看 3D 圖為主，不是完整數值測試工具。
- 原本七項角色／裝備／養成場景的正式角色快照仍由 `3d-test/appearance-snapshot.js` 經已授權 GM 同源 iframe 提供；其五槽 `world/quality/visualKey/level/present`、五件強化、八專精、十印記、文明／界弦等級來源不應改寫。正式數值以真實資料為準。
- GM 自由測試：角色／五槽／強化沿用必要的世界、品質、穿戴與強化視覺控制；**八專精、十印記、文明等級、界弦核心**四項改為單一「初始／成長中／已滿級」視覺階段，移除 8+10 個別數值微調欄位，保留不同場景各自的階段記憶；自由設定僅在本次 iframe 預覽有效，絕不可同步寫入正式資料。對應瀏覽器測試更新至三階選取。
- `3d-test/prototype-engine.js` 五槽裝備場景的唯讀 metadata 增加各槽 `present/world/quality/visualKey`，鍛造場景 metadata 增加五槽強化等級／cap，專精與印記 metadata 保留各等級；**目前仍是程式式幾何佔位模型**，真實裝備 visualKey 的模型/貼圖映射尚未完成，不能宣稱已做出不同名稱裝備的正式高階模型。等到原正式第 27～34 批處理精緻外觀時必須沿用這些 owner 欄位。
- 戰線紀錄、劇情、轉生、設定、說明、帳號、雲端、GM 控制台：現有八項 GM 測試僅為唯讀幾何視覺，不是可操作的正式介面。它們本身不需要模擬登入／雲端衝突／實際轉生或再新增冗餘的同步/自由切換；正式 UI 負責操作、權限與確認。此批不更動正式文字戰鬥、轉生條件、帳號、雲端或存檔。
- 本批完成 GitHub `main` 程式提交與 JS 語法/靜態檢查、快取版本更新及 GM 測試斷言改寫；**尚未實跑 exact-HEAD Chromium、手機、授權 GM iframe 與 WebGL 實機驗收**。不應將「程式施工完成」寫成「已驗收通過」。

## 2026-10-10｜補修第 3 批加強：正式戰鬥呈現 owner 接入（本輪最新）

- 不沿用過去從 DOM 寬度猜 HP/護盾的 3D 正式預覽：現在 `3d-test/formal-home.js` 優先讀取 `combatfx.js` 的 `getCombatPresentationSnapshot()`（active 時包含玩家／敵人 HP、maxHP、護盾），無進行中快照時不建立虛構的戰鬥場景。**注意**：這個 owner 提供進行中的戰鬥呈現資料，並不等於所有副本結果／特殊遭遇都已有完整正式結算 schema。
- GM 四個戰鬥視覺預覽（戰場／護盾／特殊遭遇／結算）沿用第 2 批「同步正式／自由測試」資料來源。正式模式只用原本 GM 同源授權 iframe 回傳的活躍戰鬥快照，若缺快照只提示、不得把自由測試的預設戰鬥值當成同步；自由模式繼續以選擇四個場景作為視覺切換，**不新增 HP 等細節調整**。
- 五副本正式資料取 `dungeonModeAvailability()` 統一政策決定可見及可用性，**W3 懸賞戰不可用且不以 W2 快照頂替**。高維競技場優先讀正式 runtime 的 `mode`（定相／異相）、stage；GM 自由模式仍可直接看兩類三戰。歷史最高鏡像勝數、虛空樓層及競技場/懸賞基本狀態以各自 owner 同步。
- 本輪已更新 JavaScript、GM 瀏覽器測試源碼、相關 HTML 快取參數及交接矩陣。**自我檢查僅是最新 main 的 JS 靜態語法、引用與程式碼審查；尚未實際執行 Chromium/授權 GM iframe/手機/長期 GPU 或 exact-HEAD Actions**。剩餘事項：逐項驗證各戰鬥模式的 owner 是否會保留結果/特殊遭遇快照，補上必要的 result/encounter 實際 schema，而非使用 DOM 假值。

## 2026-10-10｜3D 五批一致性補修第 3 批・副本與戰鬥資料（施工紀錄）

- **沿用第 2 批概念**：GM 預覽以看圖為主。原 31 案例與八分類維持不變；副本中心、懸賞、競技場、鏡像、虛空五個 GM 視覺場景納入「同步正式資料／自由測試設定」。從正式遊戲 GM iframe 開啟預設同步；未拿到正式唯讀快照不得用 GM 模擬資料冒充同步成功。自由模式仍使用既有「類型、階級/難度、定相/異相/三戰、勝場、樓層」等與畫面身份直接有關的選項，**不增加 HP、倍率、獎勵等數值測試操作**。
- **唯讀正式資料**：在 `gm3dprototype.js` 原有同源／iframe source／GM 授權 gate 下回傳正式 `getArenaCoreState`、`getBountyTestSnapshot`、`mirrorDungeonStatus`、`getVoidMirageProgressSnapshot/getVoidMirageRunSnapshot` 與 `dungeonModeAvailability` 的摘要。高維正式角色不能以宇宙懸賞冒充可用；懸賞的高維下拉選項仍完全移除。原正式數值、戰鬥與存檔 schema 未修改。
- **正式 3D 補修**：`3d-test/formal-home.js` 的高維競技場 advanced 快照補入 `higherArenaMode`（從 runtime round/selectedMode 讀取，無來源時 fallback fixed）；沒有戰鬥／結算／特殊遭遇畫面時，戰鬥快照回傳 `battleAvailable:false`、`battleVisualKind:unavailable`，不再憑空展示「滿 HP 正常戰鬥」。既有戰鬥 HP 等其他頁面元素仍屬過渡 DOM 推斷，**不是已完成正式戰鬥 owner 的完整 read-only schema**。
- **自我檢查與後續**：`tests/runtime/gm-3d-test-center-browser.js` 新增五個副本模式來源切換相關斷言，相關入口 JS 快取版本同步更新；未執行真實 Chromium、正式授權 iframe 及手機 WebGL，不能宣稱通過完整第 3 批實機 gate。後續仍須逐種模式比對正式狀態與戰鬥 owner HUD/護盾/結算可靠快照；特別是高維定相/異相模式欄位應以真實 runtime 證據驗收，未知資料不能猜。

## 2026-10-10｜補修第 2 批 GM 災厄視覺控制精簡（最新有效）

- 銀河／宇宙災厄 GM **自由測試**只保留「選擇第 N 隻文明災厄（1～10）」及「模擬狀況」兩個操作欄位；已移除 HP%、成長等級、全部封印預設情境。
- 選第 N 隻自動推算：**1～N-1 視覺已完成、第 N 隻使用模擬狀況、N+1～10 尚未解鎖／未現身**。不保存逐隻任意狀態以免違反循序推進；銀河和宇宙各自保留目前選定 N 與模擬狀況。宇宙多「已現身但不可挑戰」狀態。
- 「同步正式資料」仍使用遊戲原正式狀態，**不套用 GM 自由模式的前後自動完成假設**；GM fixture 不寫入正式角色、存檔或戰鬥。
- 已更新 `3d-test/test-center.js`、`3d-test/index.html` cache-bust 及 `tests/runtime/gm-3d-test-center-browser.js` 的十封印序列和舊欄位消失斷言。靜態語法及 main 回讀可驗；真實 Chromium/手機/WebGL 仍待驗收。

## 2026-10-10｜3D 五批一致性補修第 2 批・再次補修（正式／自由雙資料來源）

**狀態：程式施工完成、靜態回讀通過；真實 GM iframe / Chromium / 手機與最新 Actions 尚待驗收。** 不得把靜態檢查當成實機通過。

本次執行：
1. GM `3d-test/test-center.js` 六類進度型預覽（銀河地圖／宇宙地圖／高維戰線／銀河災厄／宇宙災厄／異宇宙）新增與角色外觀同方向的「同步正式資料／自由測試設定」雙模式。從遊戲內 GM 開啟時預設正式資料；獨立測試中心因沒有正式權威資料預設自由；未取得正式快照顯示等待而不拿 mock 冒充。
2. `gm3dprototype.js` 在既有 GM allowed + 同源 + 正確 iframe source 閘門下新增 `civilization3d:scenario-request/response`；僅傳最小化的地圖、逐隻災厄、高維十存在與異宇宙唯讀數據，沒有寫入 state/save 或登入資料；提供明確「重新同步正式資料」。
3. 銀河與宇宙災厄 GM 可自訂第 1～10 隻各自的未解鎖/可挑戰/進行中/完成/回顧，宇宙另可已現身但雙條件未達；各自 HP% 與印記／文明進度，以及全部未解鎖／前期／中期／接近全破／全部完成情境。移除不適用的十大區欄位，正式同步由 `getCivilizationCalamityStatus`、`getSecondWorldCalamityStatus` 等正式 owner 取得。
4. 異宇宙沿用正式 200 宇宙×5 深度、20 體系；同步最深通關、進行中及失敗鎖定；自由模式可選可挑戰／挑戰中／鎖定／已通關，3D 工廠依狀態顯示。正式選取焦點以進行中的深度優先，否則下一待挑戰深度。
5. `worldmapui.js` 新增唯讀 `getSecondWorld3DPreviewSelectedRegion()`，在正式玩家展開宇宙區域後讓正式 3D 與 GM 正式同步聚焦該區，無展開紀錄時才回退最高可解鎖進度。銀河回顧維持已存在的選定地圖 getter，高維十存在同步正式持續 HP／可挑戰／完成。
6. 懸賞戰仍沒有高維 option。GM 八大分類、31 唯一場景不變。正式 3D 場景只展示，不建立新的戰鬥 target、挑戰／結算／存檔程序。相關 JS/CSS 的 cache-bust、對照矩陣與 GM 瀏覽器測試新增雙模式、個別封印、異宇宙狀態斷言。

**殘留驗收**：需實際在已授權 GM iframe 內驗證正式同步與自由模式切換；銀河、宇宙部分進度與全破兩種存檔、宇宙回顧聚焦、W3 持續 HP、異宇宙失敗與進行中、手機輸入面板；檢查 `resource-manifest.json` GitHub Actions 自動內容指紋更新及 Pages 部署。獨立 `/3d-test/` 並無玩家資料，不得顯示虛構的「正式同步已成功」。

## 2026-10-10｜3D 五批一致性補修第 2 批：已完成部分施工，殘留風險必須後續處理

- `3d-test/formal-home.js` 的文明災厄 3D 正式資料改讀 `getCivilizationCalamityDefinitions/getCivilizationCalamityStatus` 與 `getSecondWorldCalamityDefinitions/getSecondWorldCalamityStatus`，每個災厄各給 `visible/unlocked/completed/review/remainingPercent`，宇宙可挑戰使用正式 `challengeable`；不再僅靠滿級印記總數或文明等級總數直接決定 10 個節點。`3d-test/prototype-engine.js` 按逐隻資料著色，GM 測試中心使用隔離的十封印 mock fixture。
- 宇宙星圖目前仍由最高解鎖 Boss 推算畫面聚焦，本批增加 `selectionSource:highest-unlocked-fallback` 明確記錄此為 fallback **不是已修正回顧選取**；正式 `worldmapui.js` 所見紀元與展開狀態 owner 需進一步核對，不能謊稱已解決。異宇宙 200×5/20 文化既有程序式地圖保留，進行中及失敗鎖定狀態待正式 owner adapter。
- 這一批未改文字遊戲戰鬥或存檔。已執行程式 JS syntax 與 GitHub main 回讀；未有 exact-HEAD CI、手機真機、實際不同玩家進度逐項驗收。未完成項保留於一致性矩陣及後續補修/第24批前 gate，**不得標示補修第2批已完整驗收**。

## 2026-10-10｜3D 五批一致性補修・第 1 批已施工

- 這是原正式 40 批之外的補修 1～5；完成五批再進行原第 24 批。完整 5 批規格寫入 `3D_IMPLEMENTATION_PLAN.md`，逐場景矩陣放 `docs/3D_PREVIEW_CONSISTENCY_MATRIX.md`。
- 第 1 批：`3d-test/test-center.js` 的 GM 分類由 6 個變為 8 個（主畫面 1、冒險地圖 3、玩家裝備養成 7、戰鬥 4、副本 5、災厄異宇宙 3、記錄轉生 3、設定管理 5）；全中心仍 31 唯一場景。原「副本、災厄與特殊演出」已不再使用。GM 懸賞場景「紀元」下拉完全移除 `option[value="3"]`，切換到其他場景後恢復；不得僅 disabled。正式遊戲的高維懸賞仍按原 `thirdworlddungeonui.js` 政策隱藏。
- 同步更新 `tests/runtime/gm-3d-test-center-browser.js` 的分類數、分類導航及 option DOM 存在性斷言；兩端快取版本須更新。未變動正式玩法、save、權限、交易或戰鬥數值。
- 後續補修第 2 批應先回讀災厄/地圖/異宇宙正式 owner，再修唯讀來源；第 3 批副本戰鬥；第 4 批裝備養成/其餘介面；第 5 批完整回歸。各批須回填 matrix 實際結果並報玩家實測清單。未跑過的 CI 和手機不能報通過。

## 2026-10-10｜Word 原始規格、現行計畫與正式程式交叉核對（補查）

### 檔案身分與核對範圍
- 使用者上傳 `《文明戰線》3D 全面升級・完整規劃與施工規格書.docx`（53,209 bytes）與 GitHub main 根目錄同名 Word 的 Git blob SHA 均為 `33cd9a2c3792e909a88f16fabff0874f52c60987`，**確定逐位元組相同**。Word 2026-10-09 編製，標示「原始規劃／尚未執行」，不是 2026-10-10 最新狀態。GitHub code search 對其他 Word 檔未取得清單，**不可宣稱已盤點倉庫全部 Word 或其他文件不存在**。
- 本次重新核對當前 `main`：`3d-test/formal-home.js`、`3d-test/test-center.js`、`3d-test/prototype-engine.js`、`3d-test/appearance-snapshot.js`、`3d-test/index.html`、`dungeonarena.js`、`thirdworldarenaui.js`、`thirdworlddungeonui.js`、`dungeonbounty.js`、`mirrordungeonui.js`、`dungeonvoidui.js`、`calamityui.js`、`secondworldcalamityui.js`、`alternateuniverseui.js` 及現行 40 批規劃/交接。
- 驗證方法：Word 文件位元組一致性、文件條款對照與靜態源碼核對；**未進行所有視圖 DOM 實機逐頁及 exact-HEAD CI 驗收**。

### Word 中仍有效的原則（留用）
1. 三紀元「當前視圖／回顧視圖」決定 3D 場景，不能只取玩家所在紀元（Word 第 3 頁）。
2. 3D 只負責唯讀視覺，正式文字/UI、傷害、戰鬥結果、進度、交易、存檔、離線收益/快速補播都保持原權威（第 3、8、9、11 頁）。
3. 副本應涵蓋銀河／宇宙競技場、高維競技場、鏡像、虛空、懸賞，各自狀態不同（第 5 頁）；鎖定／可挑戰／完成／回顧／空資料需驗收（第 5、11 頁）。
4. 正式裝備五槽、裝備外觀依裝備自己來源紀元及名稱，不只依玩家目前世界（第 7、11 頁）。
5. 各介面 L1/L2/L3 視覺完成度分別註記；每批新舊模式、觸控、回退和來源一致性測試不可省略（第 3、11、12 頁）。

### 被現行 main 取代／不應直接照抄的舊規劃
1. Word 第 10 頁 A1-01～A1-10 是歷史階段規劃，現在採 `3D_IMPLEMENTATION_PLAN.md` 的 1～40 批，19～23 已施工，24 起待做。不能把 Word 批次直接套用現行號碼。
2. Word 第 6 頁提議 Canvas 常駐 `#main` 之外／單引擎；目前實作按需 opt-in Preview Runtime、獨立 GM，共用 factory 並安全釋放，這是後續已確認的性能策略，不應為追 Word 硬改引擎。
3. Word 第 9 頁 Prototype 1.0 的初始「五畫面、假資料」是起點，不代表現在正式預覽和 GM 的完整清單；現在 GM 是 31 項唯讀場景，預覽資料可選正式外觀同步或 GM session fixture。
4. Word 提議的原型素材預算、Blender 工程、24 怪物家族屬未來資產要求，不代表目前低模 3D 已交付正式 GLB、高品質人物與怪物。
5. Word 的快照日期為 2026-10-09。正式副本如今有高維紀元、定相/異相競技場及高維無懸賞等後續規則，必須取當前 owner，不能引用 Word 舊簡表推定完整可玩模式。

### 已證實需修正，須納入第 24 批前一致性補修
- GM 懸賞紀元選單目前高維 option **disabled 但仍存在**，不合「高維沒有懸賞」語義：必須在懸賞項目完全移除，而不是只禁用；其他 GM 項目可以切換高維，不應受連帶影響。
- GM「副本、災厄與特殊演出」16 項內容過雜，依功能拆四類，總 8 類/31 項，且更新搜索/瀏覽器測試與快取。
- 正式 `formal-home.js` 的銀河災厄、宇宙災厄 snapshot 分別用滿級印記數及文明等級，無法代表逐隻災厄狀態與宇宙雙條件；需從 `calamityui.js`／`secondworldcalamityui.js` 的正式 status/definition 讀取。
- 宇宙回顧 3D 的 selectedMap 依 highest unlocked Boss 推算，可能不同於使用者正在看的回顧子視圖；修正前須找到正式 selected owner，不能猜。
- 高維競技場正式 3D `advancedSnapshot` 缺固定/變動模式（fixed/varied），GM 有同一控制；正式 owner 為 `thirdworldarenaui.js` 等。
- 正式戰鬥預覽的 shield/HP/結果採 DOM presence/inline width 猜測，必要時落入護盾預設，不等同正式事件快照；先查每種戰鬥模式 actual owner，再動視覺 adapter。
- 虛空無限樓層不應被 3D 畫成有上限階數；鏡像歷史最高連勝和當日挑戰／結果需分離。GM 目前有限的樓層代表值只是取樣點，不是最高層限制。
- 異宇宙 3D 已使用 200 宇宙×5 深度、20 文化的區段視覺，**不可再誤判為仍顯示固定十大區**；但尚需核對失敗/冷卻/鎖定/挑戰中狀態。
- 裝備 3D 目前依現紀元著色低模，正式裝備跨紀元外觀仍須回歸裝備來源 world/name/visualKey，這是尚待 B 階段正式模型的明確差距，而非已完成。
- 目前是靜態證據清單，無法由此認定所有 31 GM 場景及所有正式子路由已通過真機驗收。

### 執行順序
A. 下一輪先補 GM 八大分類與懸賞 option 移除，保護原 31 場景和回歸測試。
B. 然後處理災厄逐隻正式快照與三紀元回顧、戰鬥快照、競技場模式／虛空／鏡像；依正式 owner 加入針對性測試。
C. 再開始第 24 批的災厄與異宇宙 3D 美術精修。所有修改必須明示完成層級、GitHub SHA、程式檢查、可實測項及剩餘風險。

## 2026-10-10｜3D 第 23 批後全面一致性審核與未來修正要求（規劃；尚未實作）

使用者要求全 3D 正式預覽及 GM 中心逐項忠實對照原文字遊戲、重新分類過於龐大的「副本、災厄與特殊演出」，並要求 GM 懸賞戰紀元下拉 **完全移除** 高維，而不只是 disabled。本輪只更新文件，不動 JS/CSS/存檔。詳見 `3D_IMPLEMENTATION_PLAN.md` 同日「第 23 批後全面一致性審核」。

優先：GM 高維懸賞 option 徹底移除；銀河及宇宙文明災厄必須用逐隻正式 status/雙條件/回顧快照，不能以印記滿級數或文明等級充當全域災厄狀態；戰鬥 HP/護盾/結果不再從 DOM 模糊判斷或預設盾；宇宙回顧選定目標須用實際 owner；高維競技場正式快照補 mode；無限虛空與鏡像要分當前/歷史/日常狀態；裝備視覺來源取裝備 world 而非只看當前世界。異宇宙必須保留 200×5、20 文化體系，十節點僅代表當前體系。

GM 分類改版提案：現有主畫面、冒險地圖、角色養成、戰鬥四類保留；原 16 項混合分類拆為「副本與競技場」5、「文明災厄與異宇宙」3、「文明紀錄與轉生」3、「設定與管理」5，整體從 6 類調整為 8 類，**總 31 唯一預覽場景暫不變**。先修分類與控制項，再繼續第 24 批災厄/異宇宙視覺工作。每次修改後需回讀 main、更新 JS/CSS cache-bust、對照正式 owner 和 GM fixture，更新現有測試並報告實際跑過/未跑的 CI、手機與 Chrome 驗收。

## 2026-10-10｜第 23 批追加修正：GM 副本預覽真實規則與控制項

- 使用者指出高維競技場、鏡像戰與虛空幻境不應共用「十大區域」進度。確認原因為 `3d-test/test-center.js` 將通用 `fixtureProgress` 轉成高維階段、鏡像勝場與虛空樓層，和正式副本來源不符。
- GM「競技場」合併原一般／高維競技場兩個案例，紀元下拉切銀河、宇宙、高維；前兩者用階級及普通/困難/極限、後者用定相/異相及第一至第三戰。懸賞使用正式普通/高級/危險三類且高維禁用。鏡像用連勝 0～20 勝、虛空以歷史最高樓層設定；取消副本套用十大區的誤導欄位。
- 共用場景在既有 `createDungeonScene`/`createDungeonAdvancedScene` 讀取相應唯讀 fixture，未更動正式競技場、懸賞、鏡像、虛空戰鬥規則、存檔與授權。GM 六分類由 32 項整併至 31 項（副本／災厄分類 17→16），瀏覽器測試期待值同步更新。
- 語法／GitHub main 回讀屬靜態檢查，最新 CI exact-HEAD、玩家手機及所有正式副本進度實機測試仍須取得實際結果。下一原定批次仍為第 24 批。

## 2026-10-10｜第 23 批：副本中心、鏡像、虛空及競技場幾何精修

- `3d-test/prototype-engine.js` 的 `createDungeonScene` 依現有可見模式將傳送門區分為懸賞信標、競技場旗標、虛空塔、鏡像門；`createDungeonAdvancedScene` 增加鏡面與對手象徵、虛空深度階梯、高維競技場階段柱，並沿用共用相機觸控縮放設定。
- 場景仍由正式副本快照與 GM session fixture 唯讀提供資訊；沒有更動第三紀元無懸賞戰、GM 授權、正式副本挑戰、回顧、勝率、戰鬥、獎勵或存檔。GM 六分類 32 場景不增加重複預覽。
- 已更新入口快取及計畫／交接文件；程式施工已提交，最新 exact-HEAD CI、真實帳號各狀態與手機 WebGL 長時測試尚待驗收。下一批第 24 批。

## 2026-10-10｜3D 第 22 批：強化與養成場景精修

- `3d-test/prototype-engine.js` 的 `createForgeScene` 新增五槽強化進度幾何柱、依正式快照的靜態成功狀態色及非阻塞能源旋轉；`createGrowthScene` 新增養成節點進度柱、專精/印記/文明/核心封印環及緩速動效。角色/裝備共用的 `configureDisplayCamera` 用於強化與養成鏡頭。這些動畫是純視覺、不預測交易成功或失敗，也不讀寫存檔。
- 正式 `Civilization3DAppearance.scene` 與原本 `growthState` 仍提供正式唯讀資料；GM 沿用原本五槽鍛造、八專精、十印記、文明等級、界弦核心場景，六分類 32 項不變。
- 已更新正式/GM index 快取版本與兩份文件；完成 GitHub main 程式語法與回讀核對，尚未取得 exact-HEAD CI、手機 GPU、完整真實帳號實測結果。下一正式批次第 23 批。

## 2026-10-10｜3D 第 21 批：角色展示、長武器陳列及鏡頭精修

- `3d-test/prototype-engine.js` 新增共用 `configureDisplayCamera`，角色與裝備展示限制可轉角度、縮放範圍、觸控捏合參數及慣性。裝備第一槽長武器由普通多面體改為低面數長形武器、護手與尖端的幾何展示，並加入依紀元差異化的能源色。場景仍為唯讀、非最終 GLB／骨架／模組化換裝。
- 正式角色與背包，以及 GM 視覺測試中心繼續共用 `createCharacterScene`、`createEquipmentScene` 與 `Civilization3DAppearance.scene` 的正式外觀快照，無新 GM 重複測試案例；維持六大分類 32 項。
- 沒有更動正式角色資料、背包交易、強化、存檔或 3D 正式模式 release gate。程式已推 main；已做回讀與靜態檢查，Chromium exact-HEAD、手機 GPU 長測及真實長武器裁切仍待實測。下一批第 22 批。

## 2026-10-10｜正式 3D 第 20 批：全宇宙星圖與回顧導航視覺精修

- 共用 `3d-test/prototype-engine.js` 三紀元星圖調整：銀河顯示目前區域聚焦環與已完成區域色彩；宇宙十區百 Boss 從正式擊敗快照逐一表示已完成，增加目前區域聚焦環；高維十存在增加聚焦標示，保留永久 HP 比例。三者增加觸控縮放/鏡頭慣性參數。
- `3d-test/formal-home.js` 唯讀傳遞銀河區域完成快照與宇宙百 Boss 擊敗快照；`3d-test/test-center.js` 只改 GM 模擬快照，不改正式資料。32 項 GM 案例及六分類保持不變。所有真正的點擊挑戰、回顧、鎖定判定繼續由既有正式文字介面管理，不會在 3D 場景另開無權限入口。
- 第 20 批為視覺導航精修，不宣稱已達完整獨立 3D 可互動導航；桌機/手機真機 WebGL 效能與跨紀元回顧端到端測試待補。下一正式批次第 21 批。

## 2026-10-10｜正式 3D 第 19 批：三紀元指揮中心場景精修

- `3d-test/prototype-engine.js` 的 `createEpochScene` 已改為依 `world` 共用單一正式/GM 場景工廠：銀河軍事艦隊和軌道塔、宇宙暗能量核心與能量環、高維幾何框架及碎片，另有各紀元獨立色系、背景與低多邊形配置。
- 仍為唯讀幾何視覺；不影響正式紀元進度、遊戲主畫面操作、戰鬥、GM 權限、存檔或文字模式。GM 沿用原『三紀元主畫面』場景，總場景數仍 32、六分類不變。
- `index.html` 與 `3d-test/index.html` 版本接點更新；`resource-manifest.json` 的 prototype-engine 資源摘要同步核對。第 19 批程式施工已提交；實際手機 GPU 長測、跨紀元真實帳號、exact-HEAD CI 尚須確認，不可視為完整 3D 模式或第 26／40 批驗收完成。
- 下一正式批次為第 20 批；每批仍須 fresh-read main、自我檢查與更新兩份計畫/交接文件。

## 2026-10-10｜第 1～18 批後整合優化第 6／6 批：真實瀏覽器回歸、B19～40 施工規範

- **新實作**：`.github/workflows/runtime-integrity.yml` 的 Chromium smoke 新增 `tests/runtime/gm-3d-test-center-browser.js` 與 `tests/runtime/3d-mode-browser-regression.js`，不再僅跑 3D 靜態覆蓋檢查。GM 測試中心實際巡覽 32 個場景、主要控制/手機最大化及還原；GM 測試報告舊的 27 項字樣同步更正為 32 項。
- **模式實測**：新的 Playwright 瀏覽器測試在隔離測試用帳號資料中驗證 legacy `3d` 偏好暫回文字、結構化 `text` 讀取、換帳號、工作 blocker、未開放 3D 禁止切換，以及新帳號模式視窗重複 auth-ready 仍唯一、選文字後關閉且本機偏好正確；不對真實玩家帳號做存檔寫入。
- **後續規範**：新增 `docs/3D_BATCH19_40_ACCEPTANCE_RULES.md`，定義正式 owner/存檔安全、3D factory/GM 共享快照、cache-bust、手機畫面、WebGL fallback、測試及每批交接要求。原正式第 19～40 批編號不變，GM 3D 測試中心永久保留。
- **驗收界限**：本次將瀏覽器測試**接入 CI**並核對語法/引用，不代表工具本身已在這個對話中完成最新 exact-HEAD 的 GitHub Actions 執行或實機全綠。第 18 批缺少的實際真實帳號／特定紀元進度、手機裝置與完整 WebGL 故障注入仍需另行實測。六批整合優化的**程式施工**結束，不能等同完整版 3D 已上線。

## 2026-10-10｜第 1～18 批後整合優化第 5／6 批：雙模式安全與舊資料相容

- **模式安全修補**：`3d-test/mode-foundation.js` v3 統一以帳號 ID 為選模式視窗生命週期邊界；新帳號登入時移除前帳號殘留 selector；舊視窗點擊事件須確認現在登入 ID 與建構時一致，否則不儲存偏好。正式 3D release gate 依然為 `false`，`canPreview3D` 仍開放 opt-in 視覺預覽。
- **舊模式資料相容**：保留原 `civilization-war-presentation-mode-v1:<accountId>` key 與純文字 `text`／`3d` 資料；額外唯讀辨識有限大小的 JSON 物件 `{mode:"text"|"3d"}`，錯誤／未知格式不執行指令、不進入 3D。當記錄為尚未開放的 `3d`，本次直接安全運行文字模式，不反覆要求選擇、亦**不覆寫或刪除**原偏好。禁止未登入帳號及無本機儲存權限的持久化切換；偏好無法寫入時選擇頁可暫時進入文字版。登出清理的是執行期 selector，不刪其他帳號偏好。
- **安全切換**：沿用現有戰鬥／視窗與啟動就緒 gate，新增 `registerSwitchBlocker(id,probe)`／`unregisterSwitchBlocker(id)`，供未來正式雲端交易、背景戰鬥、轉生、離線結算等各 owner 主動註冊尚未完成的操作；目前這些 owner **尚未接入 blocker**，不可宣稱所有操作已完整禁止切換。因完整 3D 尚未上線，此輪仍實際無法選擇 3D。此介面不更動正式 save schema 或雲端流程。
- **第 14、16 項舊程式／快取盤點**：`index.html` 仍正式引用 `3d-test/mode-foundation.js` 與 `3d-test/formal-home.js`；正式預覽使用 `3d-test/runtime.js`、`appearance-snapshot.js`、`prototype-engine.js` 按需載入；GM 測試中心透過 `3d-test/test-center.js` 及 `3d-test/index.html` 載入同一場景工廠。歷史 cache-bust、GM `civilization-war-gm-resource-digests-v1`、帳號舊偏好都仍有讀取者／相容用途，本批**不刪任何檔案或 localStorage key**，避免誤傷舊瀏覽器或文字模式。正式第三紀元與異宇宙舊存檔處理仍交由既有 normalize／migration owner，3D 層不得修改。
- **玩家可見資訊**：第 17-B 服務預覽沿用「僅供視覺預覽」友善文字，GM 視覺測試中心繼續不展示內部案例 ID／批號／WebGL 診斷；測試及 Commit 保留工程內容。此輪不加任何新 GM 診斷選單。
- **已自我檢查**：mode foundation 與 B18 靜態 guard 的 JS 語法與 GitHub main 回讀；執行不連接真實帳號的隔離測試，確認舊 `3d` 偏好安全回退、JSON `text` 可讀、正式 3D gate 禁止、註冊的工作 blocker 生效、無存檔寫入；`index.html` cache-bust 已更新。尚無 exact-HEAD CI、手機／桌機真實換帳號及雲端進行中操作測試證據，應留到第 6 批實機回歸。
- **進度**：額外整合優化第 5 批已施工，下一批第 6 批；原正式 3D 第 19～40 批維持，正式 3D 不提前開放。

## 2026-10-10｜1～18 批後整合優化第 4／6 批：首頁啟動、GM 正式外觀快照及場景工具

- **首頁首次渲染**：`ui.js` 建立唯一 `window.civilizationRequestHomeEntryReconcile()`，採微任務合併觸發，仍只在當前為首頁且實際應有入口缺失時執行正式 `render()`。`alternateuniverseui.js` 移除獨立 `reconcileInitialHome()` 再次呼叫 `render()` 的分支，改交由統一協調入口。可減少 DOMContentLoaded 時重覆渲染，不更動異宇宙解鎖、路由、戰鬥與存檔。尚須實測銀河／宇宙／高維入口與轉生後首次刷新。
- **GM 正式外觀來源**：`3d-test/test-center.js` 在「正式角色資料」且快照 `source==="formal"` 時使用正式 `Civilization3DAppearance.scene(kind,a)` 轉成角色／背包／鍛造場景資料，不再與正式介面各有一份相似轉換；GM 自訂測試角色的既有 `visualScene` 後備仍保留。GM 測試中心透過版號 manifest 延遲載入 `appearance-snapshot.js`，不建立另一份假場景、也不存正式遊戲資料。
- **共用場景工具**：`3d-test/prototype-engine.js` 新增小型 `visualMaterial` helper，並用於第 17-B 共用服務控制台場景，保留原漫反射／自發光顏色，不修改 Babylon 品質預設或遊戲數值。這是保守的第一步共用重構，不宣稱所有多類場景已全數拆模組；大型 `formal-home.js` 路由仍保留單一入口以避免 19～40 批前期依賴斷裂。
- **cache-bust 與 guard**：`index.html` 更新 `ui.js` 和 `alternateuniverseui.js` 的快取版本；`3d-test/index.html` 更新 GM 測試中心版號；`tests/runtime/3d-b18-coverage-guard.js` 新增單一首頁協調、正式 GM 外觀來源與共用場景工具防回歸斷言。場景 factory 正式版本由 `resource-manifest.json` 自動取最新內容雜湊。
- **驗收界線**：已進行修改 JS 語法解析及 Github main 回讀；沒有完成 exact-HEAD GitHub Actions、真實 GM iframe、實際跨紀元重整、手機/WebGL 長時間測試。本批完成指定的保守重構，不表示所有獨立 3D 模式已完成。整合優化第 5 批為雙模式／舊資料安全清理，6 批仍須瀏覽器回歸；正式 3D 第 19～40 批不變。

## 2026-10-10｜1～18 批後整合優化第 3／6 批：3D 資源版本、GM 載入進度與預熱

- **實作**：`3d-test/formal-home.js` 正式 3D opt-in 預覽統一由 `resource-manifest.json` 取得 Babylon.js、`prototype-engine.js`、`runtime.js`、`appearance-snapshot.js` 四種版本 URL；清單缺值才個別用安全 fallback 版本。移除場景備援 URL 的過長歷史查詢參數；載入失敗清除 `resourceVersionPromise`，允許下一次重新查詢版本（舊成功載入腳本不重複執行）。3D 正式 Runtime/外觀/引擎仍只在玩家點預覽後按需載入，文字版不新增加載。
- **GM 資源政策**：共用 `Civilization3DSharedAssetWarm` 仍只預熱 Babylon 與場景資源，runtime／appearance 仍依原流程按需載入。GM 啟動校驗既有資源雜湊及腳本載入不改正式授權／帳號 owner；`scriptgrouploader.js` 為進行中共用 group 增加進度監聽訂閱與目前已載入比例，使另一個呼叫者加入已在進行的 GM 載入時也可收到中間進度，不必等待末尾跳至完成。失敗時清理進度追蹤，下次可重新開始。
- **進度條**：沿用 `backgroundpreload.js` 的 VERSION=5 真實子工作完成比例與單調顯示；本次未聲稱可推算下載位元組或剩餘時間，亦不修改已有效的啟動就緒契約。
- **防回歸**：`tests/runtime/3d-b18-coverage-guard.js` 加入資源清單四模組、GM 共用進度、失敗重查與預熱限定斷言，已經 Runtime Integrity workflow 引用；`index.html` 兩支 JS cache-bust 更新。此次未修改角色存檔、雲端、正式遊戲戰鬥、GM 權限或模式 release gate。
- **舊資料**：歷史查詢參數僅在正式場景備援 URL 精簡，保留原腳本存在與 asset 雜湊回退；既有本機 GM 檔案摘要 key、模式偏好及玩家存檔均不清除。跨版本 manifest 部署時序及既有 GM HTTP 雙階段快取仍需第 6 批真實瀏覽器／效能驗收。
- **驗收界線**：GitHub main 回讀及 JS 靜態語法／斷言核對，不代表本次已執行全套 exact-head CI、Chromium、手機與 WebGL 故障注入；後者待第 6 批。整合優化第 4 批下一步為首次渲染、外觀快照與場景結構；第 19～40 正式 3D 批次不變。

## 2026-10-10｜第 1～18 批後整合優化第 2／6 批：正式 3D 預覽生命週期與防重複

- **施工內容**：`3d-test/formal-home.js` 新增正式預覽控制項共用唯一性掃描 `uniqueControls()`，以 ID、文明紀錄的 kind 或服務控制台的 kind 辨識同頁重複控制組並保留第一個；新 `syncAllPreviewButtons()` 將可見預覽按鈕的初始文字、aria-pressed 與開關狀態同步，不再把其他未選取按鈕一起改為「關閉 3D 預覽」。
- **生命週期**：加入 `activeControl`／`activeHost` 追蹤，關閉時 `dispose()` scene、移除 Canvas，清空宿主／控制狀態；開啟途中使用 `epoch` 加 `host.isConnected` 防止非同步 3D 資源完成後掛載到已切頁 DOM；相同路由重新產生 DOM 而使原控制項離線時關閉舊預覽；保持 Babylon.js/runtime 按需載入與 GM 中心分離。服務控制台的延遲掛載仍由現有 scoped 監聽處理，新增共用去重。
- **自我檢查**：`tests/runtime/3d-b18-coverage-guard.js` 增加上述防回歸條件，`index.html` 已 cache-bust；程式語法與 main 回讀另行核對。本批不動正式角色存檔、GM 授權、戰鬥、雲端或世界突破。
- **界限**：此次為狀態及 DOM 生命周期強化，沒有本次 exact-HEAD CI／真實手機、桌機與 WebGL context lost 故障注入之通過證據。需於整合優化第 6 批追加實際瀏覽器壓力測試；第 3 批下一步為資源載入、快取與進度。原正式 3D 19～40 批尚未開始。

## 2026-10-10｜1～18 批後整合優化第 1 批：GM 視覺中心補齊 17-B 五種場景

- 補回第 17-B 批漏登記的五個**真正共用正式場景工廠**的唯讀 GM 預覽：設定中心（service-settings）、遊戲說明（service-guide）、帳號中心（service-account）、雲端存檔中心（service-cloud）、GM 管理中心（service-gm）；沿用 `createServiceConsoleScene`，不複製或生成獨立假場景。
- GM 3D 測試中心從 **27 → 32 項**，原 **六大分類不變**；五項列入「副本、災厄與特殊演出」，該分類 **12 → 17 項**。UI 不露出內部 ID／批號，僅顯示友善場景名稱及用途。此處即使選擇「GM 管理中心」，也只是一個幾何預覽，**絕不執行 GM 指令或帳號／雲端操作**。
- 程式調整：`3d-test/test-center.js` 新增案例和 service-kind factory、唯讀參數；`3d-test/index.html` 更新 cache-bust；`tests/runtime/gm-3d-test-center-browser.js` 更新 32/17 預期及五項場景檢查。
- 靜態自我檢查：修改 JS 語法解析、GitHub main 回讀、factory/fixture/key 與索引版本可驗證；**沒有取得本次 exact-HEAD CI 或真實 Chromium/WebGL/手機的通過結果**，必須等 Actions 與實機檢查。其餘 5 批整合優化尚未施工，這次不動正式 save、戰鬥、資源清理或帳號／GM 權限。
- 後續順序：整合優化第 2 批預覽生命週期、第 3 批資源快取、第 4 批場景/快照架構、第 5 批雙模式與舊資料、第 6 批全面回歸。原正式 3D 第 19～40 批數量不變。

## 2026-10-10｜第 17-B 服務預覽無限重複：桌機實測回歸修正

- **使用者實機證據**：設定、說明、GM、帳號及雲端存檔的「預覽 3D」按鈕各自反覆增加。根因確認：`3d-test/formal-home.js` 實際以 `control.dataset.service3dPreview=kind` 建立 `data-service3d-preview`，但 `ensureServiceControl` 查詢的是不同的 `data-service-3d-preview`；DOM 更新與 MutationObserver 重入時防重複失效。
- **修正**：統一明確設置 `data-service3d-preview`，查詢兼容兩種既有屬性，若找到多個只保留第一個；五種子頁均共用此唯一性邏輯。保留正式文字設定、雲端傳輸、GM 權限及原 3D 視覺場景，不改 save、戰鬥、雲端與授權 owner。修正 `index.html` cache-bust。
- **防回歸**：`tests/runtime/3d-b18-coverage-guard.js` 新增 DOM attribute 與查詢屬性一致性斷言，已接入 Runtime Integrity CI。已進行 GitHub main 靜態語法、斷言及版本核對；**最新 exact-HEAD CI 與桌機／手機實機重整後結果仍待確認**。修正後應在設定、遊戲說明、帳號、雲端、GM 各只剩一個對應預覽，重繪也不增加。
- **進度**：此為第 17-B／18 批暴露的回歸補修，不另增加批次；第 18 批完整實機驗收仍未結案。

## 2026-10-10｜正式第 18 批 A1 全介面覆蓋檢查（程式施工完成，實機總驗收未結案）

- 新增 `tests/runtime/3d-b18-coverage-guard.js`，由 `.github/workflows/runtime-integrity.yml` 在 main 的 Runtime Integrity 執行；靜態核對正式核心路由、既有各 3D 預覽接點、GM 授權、劇情操作列、角色唯一按鈕、虛空通用結算入口去重、文字版 3D runtime 懶載入與模式 gate。驗收測試檔曾發現一處 regex 語法錯誤，本次已修正並通過 JS 語法解析。
- 詳細全頁面覆蓋矩陣與未完成的實機清單已另存 `docs/3D_BATCH18_COVERAGE_2026-10-10.md`。本次檢查是正式程式和測試用 guard，不新增 GM 測試中心工程診斷項目，不修改存檔、交易、帳號權限、戰鬥規則。
- **實際驗收界限**：沒有本次 exact HEAD Runtime Integrity 全綠證據，也沒有已登入桌機／手機各頁、各紀元已解鎖／空／完成與 modal 的全覆蓋操作證據，因此「全部正式介面達 L1、常用介面 L2」**不得標記通過**。本批為驗收基礎施工與靜態檢查完成，實機總驗收仍未結案；不得將下一批第 19 批稱為已無條件可開工。
- 第 17-A/B 程式施工已完成但實機驗收待補；第 18 批需實際執行 CI 並補齊真實瀏覽器與手機操作證據，通過後才能正式關閉 A1 驗收。第 19～40 批 3D 開發及最終獨立模式仍未完成，文字版永久保留。

## 2026-10-10｜正式第 17-B 批：原定設定、說明、帳號、雲端與 GM 子頁視覺施工

- **原第 17 批與追加雙模式拆分**：17-A 為後來追加的帳號模式偏好／文字模式首次選擇；17-B 才是原本 `設定、說明、帳號、雲端與 GM 全子頁` 施工。原第 17 批不是雙模式批次，不能再混稱。
- **已實作視覺**：`3d-test/prototype-engine.js` 的 `createServiceConsoleScene({kind})` 為 `settings / guide / account / cloud / gm` 五類建置共用、各自不同的唯讀 3D 控制台幾何。它只產生 Babylon scene 與 metadata，不取用正式帳號憑證、雲端文件、GM 指令或角色存檔。
- **正式介面入口**：`3d-test/formal-home.js` 於設定／說明頁加入 opt-in 預覽；同一設定頁的帳號、雲端與 GM 現有子區塊可顯示相應預覽；GM 預覽只對經過既有 GM runtime 授權者顯示。帳號、雲端與 GM 可能由既有模組延後掛載，使用 scoped MutationObserver／事件作一次性防重複補掛載；不建立隱藏工程測試選單。預覽一律不代替正式設定、說明、自動出售／處理、手動雲端上傳／下載、登入登出、GM 權限與 Sandbox 執行。
- **生命週期**：沿用前置第三批 Babylon/runtime/外觀按需載入，以及現有 `Civilization3DRuntime` 開／關、切頁釋放、失敗回退機制。現有 GM 3D 視覺測試中心永久保留原本場景，原規劃第 17 批為非獨立視覺測試項目，不另添 GM 假工程診斷項目。正式 `index.html` 更新 `formal-home.js` cache-bust。
- **驗證與限制**：GitHub main 讀取 `gameguide.js`、`supabaseauth.js`、`cloudsave.js`、`ui.js`、兩支 3D JS 與 index；改動 JS 語法解析成功，五種視覺 factory、頁面 selector、GM 授權條件、唯一掛載及 JS cache-bust 已做靜態核對。尚無本批 browser/mobile 真實操作及 exact-HEAD CI 通過證據；第 18 批應逐一驗證設定、說明、帳號登入、雲端安全、GM 子頁及原 01～17 預覽。第 17-B 是**正式文字子頁的唯讀 3D 視覺入口／外觀施工**，不是已完成可獨立操作的完整 3D 設定／帳號／雲端／GM 模式；後者須依 19～40 批建置。
- **批次判定**：17-A、17-B 均完成程式施工（實機驗收待第 18 批），但不得把整個 3D 全模式提前宣布上線。下一正式批次第 18 批；文字模式完整保留，帳號與存檔 owner 完全不改。

## 2026-10-10｜正式 3D 第 17 批：帳號模式選擇基礎與設定接點（已施工，完整雙模式待後續驗收）

- **新增可見功能**：`3d-test/mode-foundation.js` v2 在 Supabase 工作階段確認後識別真實帳號 `user.id`，以 `civilization-war-presentation-mode-v1:<帳號ID>` 的本機瀏覽器 key 記住選擇；同帳號同裝置下次自動進入，不同帳號偏好互相隔離；未有偏好時顯示首次選模式畫面。正式 3D 尚未完成，選擇畫面只能選「文字模式」，3D 以「開發中」禁用並說明；既有 opt-in 3D 預覽保持可用。登出清除執行期模式顯示，**不刪除原帳號的本機選擇紀錄**。
- **設定頁**：`ui.js` 的正式設定增加「遊戲模式」與目前文字版／3D 開發中資訊，不侵入正式 `state.settings`、角色存檔或 GM 管理。提供模式 manager 的 `selectMode`、`canSwitch`、`settingsHtml`、`accountPreference` 基礎；將來開放 3D 時切換需檢查未結束戰鬥與彈窗，成功寫入帳號本機偏好後重新載入。**目前完整 3D release gate = false，因此對一般玩家不可切至 3D**。
- **資源與雙模式狀態**：沿用前置第 3 批的純文字啟動、正式預覽按需載入；仍未建成獨立正式 3D 遊戲 router／介面、完整按模式拆開原本同步核心腳本、3D 首屏及相關 L3 素材，因此不宣稱第 17 批已完成完整雙模式分流。遊戲說明、帳號／雲端／GM 的所有既有 UI 流程未改造；第 18 批需對其功能、雙模式入口、權限與所有頁面做正式回歸驗收。
- **已驗證**：GitHub main 回讀 `mode-foundation.js`、`ui.js`、`index.html`，兩支 JS 語法解析通過，驗證帳號 scope、登入／登出事件、模式 release gate、設定插入與 index cache-bust。**尚未取得最新 exact-HEAD Actions、實機冷／熱登入、跨帳號／跨裝置及手機操作證據**，不得宣稱全部功能通過。
- **施工接續**：第 18 批全介面／雙模式隔離驗收，補齊 account login restore、移動瀏覽器儲存不可用、劇情 modal、異宇宙首次首頁、GM 測試中心及第 01～17 批預覽回歸；第 19～39 批建立獨立可完整遊玩的 3D 模式，第 40 批實際開放與全程驗收後才允許啟用 3D 切換。文字版永久保留。
- **進度**：第 01～17 批已施工（非最終 3D 完工），下一個正式批次為**第 18 批**；後續每批持續同步更新本檔及 `PROJECT_HANDOFF.md`。

## 2026-10-10｜啟動進度停留約 75% 補修（已提交，實機待複驗）

- **根因**：`backgroundpreload.js` 先前以 `2＋關鍵背景數＋啟動任務數` 等權重計算進度；`scriptgrouploader.js` 的帳號與 GM（最多 32 支）資源檢查、預熱、腳本注入被視為一項，因此等待時數字常停在約 75%。
- **實作**：啟動協調器 `VERSION=5`，允許每個 startup task 接收單調的實際子項完成比率回呼；`account-resources` 採多步工作權重，仍保留 DOM、初始化與關鍵背景每項實際完成才推進。GM 資源版本驗證依已檢查檔案數逐步回報，GM 延後腳本依真實 `onload` 完成數逐步回報；已確認帳號後更新進度。顯示只隨已完成的事件增加，不使用假時間動畫，100% 仍須原正式 ready 條件成立。
- **限制**：此為「依實際完成里程碑計數的加權進度」，**不是網路位元組下載率或剩餘時間預測**，不同快取及 GM 狀態仍可能有階段跳動；未新增耗時資源請求，正式文字版、GM 授權、失敗重試、資源清單、WebGL/GPU 啟動與存檔邏輯保持原規則。
- **已檢查**：`backgroundpreload.js`、`scriptgrouploader.js` JavaScript 語法解析成功；`index.html` 兩支引用均已 cache-bust；重新讀取 main 確認。最新 GitHub Actions 與手機、桌機冷／熱啟動仍待實際測試，不能宣稱保證不再停格。若仍有長時間固定百分比，應實測是哪一項 IO 工作耗時，不可用假進度掩飾。
- 本次獨立啟動 UX 補修不佔 3D 40 批，正式下一批仍為第 17 批。

## 2026-10-10｜角色／虛空 3D 預覽重複入口補修

- 使用者手機實測發現角色介面有兩個同效果「預覽 3D 角色」，虛空幻境同時有「預覽 3D 虛空樓層」與「預覽 3D 戰鬥與結算」；後者為共用戰鬥預覽，不是虛空專屬功能，GM 3D 視覺中心保留共用戰鬥／結算預覽即可。
- 根因：`3d-test/formal-home.js` 的 `ensureCharacterControl` 在 `.character-layout` 裡查按鈕，實際卻以 `screen.before(controls)` 插在其外面，頁面更新後會反覆注入；`ensureBattlePreviewControl` 對 `.void-combat/.void-result` 的通用 DOM 判定，使虛空正式頁出現第二個不必要的預覽。
- 已改 `ensureCharacterControl` 使用全域唯一 ID 判定，避免重複；`ensureBattlePreviewControl` 遇 `view==="dungeon-void-mirage"` 直接不加第二顆按鈕，保留虛空樓層專屬預覽及 GM 戰鬥／結算專項。修正不改戰鬥、結算、進度、獎勵、存檔、場景 factory 或 GM 測試中心。
- `index.html` 已更新 `formal-home.js` cache-bust；靜態語法、GitHub main 回讀已核對。手機／桌機真實重新整理與切頁回歸仍需實測。這是第 16 批後的介面補修，不新增正式批號；下一批第 17 批。

## 2026-10-10｜重整後異宇宙／新紀元／轉生入口首次漏顯示修復

- **根因（main 確認）**：`ui.js` 載入末端執行 `load() → render()`，但 `worldphaseui.js`、`reincarnationui.js` 與 `alternateuniverseui.js` 在 `index.html` 中排在其後。初次 `homePage()` 無法呼叫稍後才註冊的入口函式，導致第三紀元已解鎖異宇宙入口首次消失；任意切頁回主畫面會重繪，所以入口又出現。同一時序也可能影響符合條件的新紀元突破與文明轉生入口。
- **修正**：`ui.js` 在 `DOMContentLoaded` 進行一次延後入口比對：以當下正式 `homePage()` 產生的權威內容檢查新紀元、轉生、異宇宙三個入口，**只有理應顯示且目前主畫面 DOM 缺少入口**時才呼叫原有 `render()`；若玩家已導航離開首頁不觸發。`alternateuniverseui.js` 自己亦在模組註冊後、DOM 就緒時，僅在正式異宇宙首頁入口應存在而缺少時做一次補繪，防止入口程式延後註冊。兩處皆不修改解鎖判定、戰鬥、存檔或帳號。
- **變更檔案／版本**：`ui.js`、`alternateuniverseui.js`、`index.html`（兩份 JS cache-bust）；是第 16 批之後的介面 bug 補修，不另增加 3D 正式批號。已回讀 GitHub main 並執行兩支 JS 語法解析，核對補繪條件與版本引用；沒有在本次取得完整 CI 或桌機／手機實機重整結果，待使用者測試。
- **必測**：第三紀元已解鎖異宇宙帳號直接刷新首頁、刷新後不切頁就應顯示入口；未解鎖帳號不應提前出現；第二紀元跨高維條件、第一紀元跨宇宙條件、符合文明轉生入口的高維角色首次刷新都應正常；點進其他頁再回首頁、不同帳號登入後重繪、GM 與原 3D 預覽不得退化。下一原定 3D 第 17 批仍未施工。

## 2026-10-10｜第 16 批劇情閱讀視窗排版回歸修復（已施工，實機待複驗）

- **使用者實際回報（桌機及手機）**：原劇情彈窗可看到「1/12、下一頁」，加入「預覽 3D 文明史書」後，點擊前後的操作區會被推出視窗，畫面下方變成空白。根因為 `story.css` 的 `.story-card` 固定三列 grid（標題／正文／頁碼按鈕），但第 16 批 `storyui.js` 將 `.story-3d-preview` 插入作為第四個直屬 grid 子元素，`story-actions` 自動落到溢出的第四列，遭 `overflow:hidden` 截掉。
- **本次修改**：`storyui.js` 將 `#storyBody` 與 `.story-3d-preview` 合併包在 `.story-content`，保持 `.story-card` 固定三個直屬 grid 子元素；`story.css` 在內容列內使用可縮放 flex 與獨立文字捲動，3D 預覽提供受容器高度約束的顯示舞台（含矮螢幕規則），保留原 `#storyActions` 頁碼／下一頁／上一頁／結束。正式劇情 owner 與回呼、轉生交易、回顧進度、存檔不變。
- **驗證**：已 GitHub main 回讀 `storyui.js`／`story.css`／`index.html`，JavaScript 語法解析成功，確認 wrapper／CSS 規則及 CSS/JS cache-bust 均存在；瀏覽器桌機、手機實際操作尚未取得本次修正後結果，不能宣稱已通過實機。驗收路徑：任一正式劇情 → 先確認頁碼和下一頁可見 → 點「預覽 3D 文明史書」→ 3D 在中間、文字可捲動、底部按鈕仍可用 → 切頁、關閉、重開 → 桌機和手機重測。
- **最新狀態**：第 16 批視覺預覽施工完成並已補修上述實際回報，仍待實機驗收；第 17 批尚未開始。每批雙文件同步規範維持。

## 2026-10-10｜正式第 16 批交接：劇情／戰線紀錄／文明轉生 3D 視覺預覽已施工

- 原 40 批目前 **第 01～16 批已有 3D 幾何預覽與介面接點施工，第 17～40 批未開始**；下一批第 17 批。完成施工不是完整 3D 遊戲或手機 GPU 驗收。
- `3d-test/prototype-engine.js` 的 `createChronicleTransitionScene` 新增「戰線紀錄、劇情閱讀、文明轉生」三種純視覺場景；`3d-test/formal-home.js` 把可選入口接至正式戰線紀錄與主畫面轉生卡，`storyui.js` 則在既有劇情 modal 提供獨立 3D 史書預覽、劇情關閉時 dispose。劇情文字、已解鎖紀元、回顧紀錄、上一頁／下一頁、獎勵與不可逆轉生確認依原 owner，沒有新增 3D 交易或第二套存檔。
- GM 3D 測試中心六大分類新增三個共用 factory 場景，案例 **24→27**；`tests/runtime/gm-3d-test-center-browser.js` 同步調整場景數與點擊案例；`3D_GM_TEST_CENTER_CATALOG.md` 記錄。正式與 GM HTML cache-bust 皆已更新。純文字啟動仍保留前置第三批的懶載入策略。
- **驗收界線**：已做 GitHub main 回讀與 JS 語法／靜態接點檢查；尚無本次 exact HEAD 全部 CI 成功或真實手機／桌機 3D/轉生彈窗點擊驗收證據，須繼續追蹤。若回顧戰／轉生確認回歸出錯，優先查正式 UI event/modal 與新增預覽生命週期，不可更動戰鬥結算或轉生交易 owner。
- **後續施工**：第 17 批完成設定／帳號／雲端及正式雙模式選擇、記住帳號裝置偏好、安全切換／重載與模式 loader；第 18 批重驗文字完整功能、雙模式相容、1～16 批預覽及所有 route/modal；第 19～40 批逐步獨立完整 3D，文字模式永久保留。每一批都要同步更新本檔及 `3D_IMPLEMENTATION_PLAN.md`。

## 2026-10-10｜雙模式前置第 3 批：程式接點與 3D 資源按需載入（已施工，待瀏覽器／手機驗收）

- **實際修改**：`index.html` 移除啟動時同步引入 `3d-test/runtime.js`、`3d-test/appearance-snapshot.js`；新增輕量 `3d-test/mode-foundation.js`（不存偏好、不改正式 save，現階段唯一有效文字正式模式）；保留 `3d-test/formal-home.js` 的既有文字 DOM 可選預覽入口。點選預覽後才平行載入 runtime、appearance、Babylon 與共用 3D scene，並以原 `Civilization3DRuntime.create/show/dispose` 管理畫面；暫時不改 `onRendered` 全路由 DOM 掛載方式。
- **資源政策**：現有一般文字入口不再於 DOMContentLoaded 無條件 prefetch Babylon／scene；`CivilizationPresentationMode.shouldWarm3DAtStartup()` 現為 false。正式 3D 預覽點擊時仍走 manifest digest URL 與原失敗重試；GM 已授權 ready 中原有的 3D bytes 預熱邏輯可獨立保留，這不等於無 GM 帳號啟動載入 3D。今後第 17 批需要依玩家選定模式與實際首屏政策重新啟用適量預抓。
- **基礎模式管理者已建立，但未啟用正式雙模式**：`CivilizationPresentationMode` 暴露 `modeIds`、`currentMode()`（目前永遠為 text）、`isFull3DAvailable()`（false）、`canPreview3D()`（true）、`shouldWarm3DAtStartup()`（false）。這是**刻意不持久化**的展示政策接點，非真正的帳號模式選擇／切換實作。模式偏好不進正式角色存檔。
- **三個原問題的處理狀態**：① 3D 的 Canvas/外觀與既有文字 DOM 預覽入口已有載入生命週期解耦，但正式 3D 路由不再依文字 DOM 的最後階段**未完成**；② runtime 與 appearance 已由同步改按需，formal-home 維持輕量入口且一般啟動不預抓大量 3D bytes；③ 有統一模式政策雛形但尚沒有帳號綁定／首次選擇／模式切換或交易中斷保護。**不得宣稱三個問題都已全面解決**。
- **第 17 批後續硬性施工**：完成帳號登入後「文字模式／3D 模式」首次選擇、帳號 ID＋裝置瀏覽器偏好隔離、同帳號同裝置直接恢復、設定頁安全保存與重新載入、進行中戰鬥／離線／交易阻斷策略、模式專用 boot/loader；完整 3D 尚未完成前不得對一般玩家開放空殼模式。將本批靜態策略接點升級為真實模式 manager 時，必須有測試且不得讓瀏覽器偏好變成正式 Save 規則。
- **第 18 批後續硬性驗收**：所有正式頁、三紀元、故事／轉生／回顧、子頁、modal、帳號／GM 權限、戰鬥與結算、離線、手機、3D 原型入口、錯誤回退、切換後記住偏好；驗證完整文字玩法不受 3D 影響、L0/L1/L2 模式資源隔離及前 01～15 批舊預覽功能回歸，缺瀏覽器／手機證據標記待驗。
- **第 19～40 批後續硬性規劃**：第 19～26 批建立真正可獨立操作的正式 3D 各路由／場景與按頁載入，第 27～34 批 GLB 人物／裝備／怪物／動畫／材質映射與資源指紋分層，第 35～39 批只讀正式戰鬥事件驅動 3D 全模式戰鬥演出（不複製戰鬥或獎勵 owner），第 40 批全功能雙模式與同存檔、跨模式切換、網路下載量、手機 GPU 長測、錯誤回退與上線驗收。**文字模式永久完整保留**，不得刪掉舊玩法或以 3D 取代。
- **檢查界線**：提交後 GitHub main 回讀、兩支改動 JS 語法解析、入口引入和延遲模組文字檢核可做；未取得真實瀏覽器／手機點擊與 exact HEAD CI 證據前，不得聲稱 3D 預覽全部正常。若發生 3D 舊入口未載入或 GM 共用衝突，先按本批修改重新查實際依賴，修正並加回歸測試；不得先回復所有 3D 同步下載。
- **交接規則**：本前置批不佔原 40 批，正式仍第 01～15 批已施工、**下一批第 16 批**；往後每完成正式一批，同步改本檔與 `PROJECT_HANDOFF.md`、更新 JS/CSS 的 index cache-bust、核對最新 main 與 CI／實機結果。

## 2026-10-10｜雙模式前置第 2 批交接（已完成，無程式變更）

- 依 `main` 重新核對 `index.html` 161 一般同步 script、97 deferred（32 GM）、`scriptgrouploader.js` GM 先驗證與 ready、`backgroundpreload.js` 啟動屏障、`3d-test/formal-home.js` 預取 Babylon／場景、`3d-test/test-center.js` GM 入口、`scripts/generate-resource-manifest.py` 指紋生成。**現有快取與 3D 預熱不等於已按文字／3D 模式拆分載入**，正式 index 仍直接載入 3D runtime／appearance／formal-home。
- 新增 [雙模式資源分層施工準備與測試矩陣](docs/DUAL_MODE_RESOURCE_LAYERING_PREP_2026-10-10.md)；分成 L0 帳號與選模式、L1 共用核心、L2-T 文字介面、L2-3D 首屏、L3 3D 延後場景與模型、L4 GM 授權層。先檢查每支 script 全域符號與初始化副作用，再以可回退的小批遷移；禁止直接大規模搬動同步腳本。保留銀河回顧、異宇宙、離線、GM 與文字遊戲回歸。
- **完成範圍**：現況盤點、分類與第 17～40 批資源分層指引、測試案例；**未完成**完整 161 檔符號級依賴清冊、登入選模式實作、按模式實際下載分流、正式獨立 3D 模式與瀏覽器／手機效能驗收。僅文件修改，無 JS/CSS/HTML 變動，無需 cache-bust。
- 兩個雙模式前置批次已留在 `main`；**原 40 批仍第 01～15 批已施工、第 16 批待執行**。繼續遵守修改後自我檢查與同步兩份交接文件。

## 2026-10-10｜雙模式前置第 1 批交接（已完成，正式 40 批進度不變）

- 已核對現行 `main` 的 3D 第 01～15 批主要正式接點、`index.html`、`3d-test/formal-home.js`、`appearance-snapshot.js`、`runtime.js`、`test-center.js`、`scriptgrouploader.js`。新增 [雙模式架構邊界契約](docs/DUAL_MODE_ARCHITECTURE_BOUNDARY_2026-10-10.md)，明示文字 UI 永久保留、3D 為另一套完整視覺、共用唯一正式 state／戰鬥／裝備／交易／存檔 owner。
- 確認現行 `civilization3dHomeRouteRendered(view)` 對文字頁 render／DOM 仍有耦合，因此**尚未**具有獨立 3D 導航；`Civilization3DAppearance.capture()/scene()` 提供正式唯讀外觀資料，`Civilization3DRuntime.create()/show()/dispose()` 提供獨立 Canvas，GM 測試 fixture 保持隔離。後續不得直接移除文字頁，也不得讓 3D 重算戰鬥、收益或存檔。
- **本批只完成依賴盤點與架構契約**，未變更 runtime JS/CSS/HTML，未建立登入選擇器／遊戲模式管理者，沒有可宣稱的瀏覽器、手機或 exact-HEAD CI 新驗收。下一步優先**前置第 2 批：資源分層與依賴準備**；原 3D 40 批仍第 01～15 批已施工、第 16 批未開始。
- 仍須依規範於後續每完成一批，同步更新本檔與 `3D_IMPLEMENTATION_PLAN.md`，按當時最新 main 與測試證據回報。

## 2026-10-10｜近期修正及雙模式規劃交接（最新）

- **銀河回顧戰已修的範圍**：`ui.js`、`playersemanticsui.js`、`firstworldtargetcontextbatch5.js` 處理點擊／高維畫面覆蓋／開戰 context／結算重打；`tests/runtime/galaxy-review-combat-browser.js` 有真實流程回歸。第 16、18、37、40 批需防退化；舊回顧不得取得正式收益、進度或影響存檔。最新 exact-HEAD CI／實機仍須另驗。
- **異宇宙 3D 已修的範圍**：20 體系 × 各 10 宇宙＝200 宇宙，每宇宙 5 深度；正式名單中同體系先後決定 1～10 階，不以連號當階級。正式資料 `alternateuniversedata.js`；3D 原型、GM 24 場景之一的異宇宙前線、快捷／文化選擇及唯讀深度預覽已有程式。它們是正式規則的視覺消費者，不可新增平行進度或更改怪物公式。
- **進入遊戲載入優化已施工**：啟動協調器中性百分比／失敗重試、依登入帳號隔離 GM 授權、GM 32 模組 ready／條件式快取、`resource-manifest.json` 逐檔內容指紋、本地 Babylon 及正式／GM 3D 場景共用版本化預抓，未開預覽不占 GPU。**尚未實作完整文字／3D 雙模式按需啟動；現有同步腳本不等於都已拆成模式別延後載入。** Pages 部署仍有 manifest 同步切換窗口。
- **正式新增設計決策（僅規劃）**：保留完整文字模式，增加完整 3D 模式，兩者共用帳號／角色／正式資料／戰鬥規則／存檔；登入後先依「帳號 ID＋裝置瀏覽器」自動取得上次模式，無紀錄才選擇，確定模式後才按層載入資源；設定可改模式，安全保存後重載，同帳號同裝置記住最後選擇、同帳號不同裝置互相獨立。3D 尚未完整交付前一般玩家不得進入空殼模式。
- **40 批資源分層最新規範**：L0 登入及模式決策最小層；L1 共用遊戲正式核心；L2-T 完整文字 UI；L2-3D 只載入選定紀元 3D 首屏必要資產；L3 3D 其他路由／角色／裝備／戰鬥延後載入；L4 GM 授權專層。第 16 批劇情／轉生／回顧回歸，第 17～18 批建立模式閘門與首次入口驗收，第 19～34 批逐頁場景與 GLB 素材分層，第 35～39 批唯讀戰鬥呈現，第 40 批雙模式全面一致性與實機性能驗收。詳細契約及細節已納入 `3D_IMPLEMENTATION_PLAN.md`；不新增第 41 批，**目前仍是第 01～15 批已施工、第 16 批待開始**。
- **雙文件更新強制**：每完成 3D 第 N 批必須在同次交付同步更新 `3D_IMPLEMENTATION_PLAN.md` 該批狀態／證據與本檔交接，不能將規劃冒稱已實作；本次僅更新文件，不修改程式、資源或正式存檔。

## 2026-10-10｜3D 40 批進度與雙文件同步規範（現行有效）

- **目前第 01～15 批已施工 3D 預覽與基礎，第 16～40 批未開始；下一批第 16 批。** 已施工不代表正式 3D 全覆蓋／實機完整驗收。GM 3D 測試中心 24 項預覽永久保留，正式預覽按鈕為過渡功能。
- **每完成一批 3D 工程（含補修或驗收結案），當次交付必須同時更新 `3D_IMPLEMENTATION_PLAN.md` 與本檔**：前者修訂該批狀態、日期、commit、測試證據、待驗項目、進度摘要及下一批；後者更新最新實作、重要決策、已知限制、交接位置。提交後重新讀取 current main 驗證兩檔一致。只改程式、只改其中一份文件或沿用過時進度都不能宣告批次完成。
- 此規範不改原定 40 批數量；另行完成的啟動載入 5 批、異宇宙 3D 補修不占用第 16 批。歷史紀錄若與現行摘要矛盾，須更正或標示為歷史，嚴禁將舊進度當成目前事實。

- **2026-10-10 GM 3D 測試中心與過渡預覽資源預載修正**：正式介面的 3D 預覽是過渡入口，`3d-test/formal-home.js` 改於 DOMContentLoaded 後短延遲啟動 versioned Babylon/scene prefetch（先前等到 window.load+idle），但**不阻塞一般玩家、也不提前建立 GPU 3D 場景**；提供 `window.Civilization3DSharedAssetWarm()` 下載共用 3D bytes。永久保留的 GM `3d-test/test-center.js` 由同源 `../resource-manifest.json` 解析 Babylon、`runtime.js`、`prototype-engine.js` 的逐檔 hash URL，與正式預覽共用相同版本引擎及場景快取，清單取得失敗時可沿用既有帶版本參數的 fallback。`scriptgrouploader.js` 僅於已授權 GM 啟動資源 ready 後，在等待遮罩內額外預熱共用 3D 引擎與場景，以及測試中心 runtime/test-center/alternate-universe 資料 JS 靜態 bytes（不執行、不建立 WebGL），預熱失敗不中斷正式 GM 遊戲。`index.html`、`3d-test/index.html` 更新快取版本，GM loader canonical integrity tests 同步修訂。這些 3D 預覽將來正式 3D 全覆蓋後需移除正式介面按鈕與對應 bridge 入口，但**不可移除 GM 測試中心**；未來正式 3D 場景本身轉為首屏必需時，要另調 boot critical policies。

- **2026-10-10 啟動載入優化第 5／5 批（資源版本與 3D 分層）**：新增 `scripts/generate-resource-manifest.py` 依當前 `index.html` 入口本地 JS/CSS、3D 引擎／正式場景程式及正式背景檔案產生逐檔 SHA-256 指紋清單 `resource-manifest.json`，目前約 326 項；`.github/workflows/asset-version-manifest.yml` 在本地資源更新時自動以最新 main 生成清單，發生並行提交時重試，只有資源內容指紋改變才發布額外清單 commit。這個額外 commit 會觸發 GitHub Pages 再部署，故正式資源以已部署 Pages 內容為準，不能以 main 尚未部署的提交視為可用。`3d-test/formal-home.js` 保留 **3D 僅按需建立 WebGL/GPU**，閒置時只預抓網路資源，從同站 `resource-manifest.json`（`cache:no-store`）為 Babylon 引擎與 3D 場景生成各自 `asset=<digest>` 的獨立版本 URL；缺清單時以既有版本 URL fallback。`scriptgrouploader.js` 在已授權 GM 啟動預抓前以同一清單為 32 個 GM 模組各自寫入內容版本 URL，保留 HTTP 條件驗證、逐檔 SHA-256 快取內容比較、原腳本執行順序及進遊戲前 ready 屏障；一般玩家不阻塞等待 GM。`tests/runtime/gm-startup-preload-browser.js` 增加冷／熱啟動實際耗時與快取辨識記錄，另新增 `tests/runtime/resource-manifest-integrity.js`，納入 Runtime Integrity；index.html 已更新 cache-bust，維持等待 UI 中性百分比不暴露 GM。**界限：** GitHub Pages 的先後部署不能視為完整的跨檔案原子交易，清單更新與同時部署存在短暫版本切換窗口，清單失效時 3D fallback 舊規則；現有正式頁主要為可選 3D 預覽，未來正式 3D 首頁／角色模型與材質檔加入時，必須依首屏必載 vs 其他場景延後再修資源清單與 GPU 初始化政策。冷／熱時間為 CI 環境觀察值，不保證任一用戶裝置實際加速比例。正式存檔／戰鬥規則未更動。第 1～5 批實作與待追蹤的部署原子性限制已記錄；以 main 唯一來源，更新後須依 CI 與頁面實測判定。

- **2026-10-10 啟動載入優化第 4／5 批（GM 預先就緒＋HTTP 條件快取）**：於 `scriptgrouploader.js` 預先註冊 `account-resources` 啟動任務，並由 `backgroundpreload.js` 的 `CivilizationStartupCoordinator` 載入啟動屏障。先等待 Supabase 工作階段就緒，僅已授權 GM 在揭露遊戲前條件式重新驗證 32 支 GM 腳本（`fetch(cache:'no-cache')`，最多六條並行，JavaScript 執行仍依原相依順序）、等待 `loadGroup('gm')` ready 且 `gmHtml` 可用；一般帳號跳過 GM 的啟動必要載入。設定帳號首次狀態已解析的事件記錄及 12 秒錯誤超時供重試，避免認證事件先到造成死等。GM 每檔 JS 內容透過 SHA-256 指紋在同瀏覽器保存版本比較結果，`CivilizationScriptLoader.gmResourceCacheSnapshot()` 只回傳檔案版本檢查統計；無玩家存檔、憑證／密碼放入此快取，GM 權限仍由第二批帳號隔離流程判定。新增 Playwright `tests/runtime/gm-startup-preload-browser.js` 檢查模擬已授權工作階段、重整、一般帳號繞過，納入 Runtime Integrity；更新相關 `index.html` cache-bust 與結構測試。**重要誠實邊界**：HTTP 條件式重新驗證只有在正式伺服器支援 validators 時才可避免未變更檔案重複傳輸；本批 SHA 指紋用於辨識實際內容差異，**尚未建立部署時自動生成的原子版本 Manifest／完整跨檔相依一致性**，此部分連同實機冷熱測量與 3D 資源分層應於第 5 批補足或如實保留為後續待辦，詳見 `docs/STARTUP_RESOURCE_AUDIT_2026-10-10.md`。首頁進度字串完全中性，未暴露 GM 身分。維持 main 唯一真實來源與修改後 CI 驗證。

- **2026-10-10 啟動載入優化第 3／5 批：中性百分比＋啟動就緒協調器**。已將 `backgroundpreload.js` 更新為 V4：統一入口 `window.CivilizationStartupCoordinator`（`register(id,asyncTask)`、`snapshot()`、`retry()`），追蹤 DOM ready、首屏 `render` 可用、關鍵圖片與預先登記的啟動任務；完成一項更新一次百分比，進度在必要工作未全部完成前至多 99%，所有完成後 100% 才揭露遊戲。首頁載入失敗／關鍵圖失敗／4.5 秒逾時保持啟動遮罩並顯示中性「部分資源載入失敗，請重新嘗試」，提供重試按鈕；異步前次載入 callback 不得污染重試進度。`index.html` 增加百分比及重試按鈕，`backgroundpreload.css` 調整桌機手機樣式，JS/CSS 快取版本已更新。新增 Playwright `tests/runtime/startup-readiness-browser.js` 驗證一般正常就緒與模擬暫時錯誤後手動重試，並加入 `.github/workflows/runtime-integrity.yml`。**邊界：目前 161 個一般同步 scripts 在 `backgroundpreload.js` 執行前已按瀏覽器正常機制載入，無法納入每檔即時百分比；百分比代表啟動協調器管理的必要就緒工作，不代表下載位元組；已登入 GM 的完整 32 個模組仍未納入阻塞屏障（第 4 批），未來正式 3D 及 GM 可經事先登記的必要任務擴充。**背景其餘圖片、劇情、非必要 3D 照舊延後。第 4 批需依已登入 GM 身分事先註冊必要 GM 任務、處理已部署逐檔 hash 及冷熱啟動，且不可在啟動遮罩顯示 GM／管理字詞；第 5 批整合 3D 分層及全面回歸。正式存檔與戰鬥規則未變。最新 CI 結果請以最新 main HEAD 驗證。

- **2026-10-10 啟動載入優化第 2／5 批**：已將 `gmruntimeauthorization.js` 的 GM 本機授權由跨帳號 `civilization-war-gm-authorized-v1` 改為綁定 Supabase 帳號 ID 的 `civilization-war-gm-authorized-v2-account-{id}`。沒有登入帳號時 fail-closed；舊跨帳號授權不能安全移轉，首次升級後原 GM 須再輸入一次 GM 密碼，成功後同帳號同瀏覽器重整可恢復。`scriptgrouploader.js` 於 auth-ready 重新判定 GM 並載入原 32 個 deferred GM 模組，登出清空運行權限，`supabaseauth.js` 登出成功撤銷當前帳號本機 GM 標記並避免切換帳號沿用狀態；正式存檔仍不保存 GM 身分。已更新 index.html 對相關 JS 的 cache-bust，補入 GM account-bound 與 legacy fail-closed 回歸檢查、調整 script loader 結構測試。此批**不改進入遊戲前的等待屏障**，該部分在第 3/4 批落實。須注意目前前端 GM 密碼機制本身不是後端可信權限驗證；本批只能隔離使用者本機狀態，不代表已建立伺服器端安全邊界。後續第 3～5 批必須實作中性百分比、GM 進入前就緒、逐檔內容版本/差異快取/已部署一致性、3D 分層、冷熱啟動驗證，詳細規範見 `docs/STARTUP_RESOURCE_AUDIT_2026-10-10.md`。修改前後核對 main，JS 修改已同步 cache-bust。

- **2026-10-10 啟動載入全面優化，第 1／5 批（僅盤點、不改時序）**：已由 `main` 的 `index.html` 及 `scriptgrouploader.js` 建立完整逐檔清冊 `docs/STARTUP_RESOURCE_AUDIT_2026-10-10.md`。258 個腳本引用：161 一般同步，32 GM deferred，HTML story 28／integrity 37；其中 `storyruntimeintegrity.js` 在 loader 被改歸 integrity，實際 story 27／integrity 38。盤點標示 A 啟動核心／B 首屏與當前紀元／C GM 條件必要／D 非首屏劇情與 3D／E 診斷；同步腳本的 A/B? 僅初步風險標記，**尚未完成每個檔案符號級依賴測量，禁止依標記直接移動**。確認背景遮罩只等待必要背景最多約 4500ms，不等 GM ready，GM 模組目前順序載入；正式 Babylon engine/scene 為額外的按需動態資源，不列在 258 個靜態引用內。此批沒有 JS/CSS/HTML 行為修改。下一批先處理登入帳號與 GM 本機授權的安全隔離；進度畫面僅中性百分比，絕不暴露 GM／管理字詞；依照規劃再做 coordinator、GM 屏障與 3D 分層驗證。以 main 為唯一來源，修改後應自我檢查並更新必要 cache-bust。

- **2026-10-10 異宇宙 3D 文化與階級正式修正**：`alternateuniversedata.js` 是唯一正式資料來源：20 種文明體系，每種 10 個宇宙，正式 U001～U200 編號交錯分布，體系內依正式名單先後即第 1～10 階、越後面越強；每個宇宙 5 層「外環、神庭、聖域、天座、主宰」。3D 場景 `3d-test/prototype-engine.js` 改從 `window.ALTERNATE_UNIVERSE_CULTURES`、`ALTERNATE_UNIVERSE_NAME_CULTURES`、`ALTERNATE_UNIVERSE_NAMES` 得到正式 culture/index/tier/name，不再用 U 編號 mod 4 的錯誤四模板；20 體系各有專屬色調與五種幾何 motif 組合，同體系第 1～10 階依階級遞增核心尺寸、能量遺跡數量、光效和活動感，場景 metadata 保留識別。GM `3d-test/index.html` 載入正式 alternateuniversedata.js（只讀），`test-center.js` 新增「宇宙體系」及「同體系十個具名宇宙」下拉與真實體系內階級標籤，並保留原本 20 編號區段、U001～U200、五深度與快捷操作；正式 `formal-home.js` 異宇宙預覽資訊顯示體系／宇宙名稱／體系內階級／正式深度名稱。已更新正式 `index.html`、GM `index.html` 及 Babylon 動態載入 cache-bust。GM browser 測試包括冰霜 U003 一階對 U181 十階的 3D 能量遺跡數目及文化 mapping。**本批未變更正式敵人戰力公式、挑戰或存檔**，視覺表現遵守越後面越強的原設定；CI 請以最新 main HEAD 為準。

- **2026-10-10 異宇宙 3D 第 3 批（UI/GM 操作）**：`3d-test/index.html`、`test-center.js`、`test-center.css` GM 異宇宙預覽新增上一/下一宇宙、上一/下一深度四個快捷按鈕，宇宙號在 U001～U200、深度 1～5 有界，跨 10 宇宙邊界時自動切換 20 區段；顯示第 X 區、UXXX、深度及 1000 層位置，手機以兩欄 42px 最小按鈕版面。`3d-test/formal-home.js` 正式異宇宙預覽入口讀取既有 `alternateUniverseProgressionSnapshot(...).deepestCleared`，顯示下一個宇宙與深度及已通過層數，不寫入存檔、不介入挑戰。已同步 GM CSS/JS、正式 3D bridge 的 `index.html` cache-bust，新增 GM Playwright 真實點擊快捷鍵、邊界、跨區及 390px 手機寬度驗證。僅為 3D 預覽 UI，正式異宇宙戰鬥/收益/存檔/進度不變。CI 結果須以最新 main HEAD 確認。

- **2026-10-10 異宇宙 3D 第 2 批視覺深化**：在第一批 20 區段 × 10 宇宙 × 5 深度基礎上，`3d-test/prototype-engine.js` 的 alternate frontier 新增由宇宙編號決定的四種可重用節點／中央核心幾何模板（球、多面體、柱、方），與四組深色宇宙能量色調；同一宇宙五層深度按固定規則逐漸增加能量訊號、核心衛星與旋轉效果。相同編號 deterministic，僅在 readonly Babylon 場景內生成，不增加正式進度欄位、不修改存檔、戰鬥、獎勵；災厄十封印分支不變。正式 `3d-test/formal-home.js` 與 GM `3d-test/test-center.js` 的 prototype-engine 載入版本均已更新，連帶更新 `index.html`、`3d-test/index.html` cache-bust。GM 瀏覽器回歸測試擴展至 Babylon NullEngine 真實建立 U137 depth1/depth4、U138 depth4、U200 depth5 場景，核對 10 宇宙節點、對應 1/4/4/5 深度訊號及 4 種 geometry 模板標識。驗收以最新 main GitHub Actions 實際結果為準。後續第3批正式 UI／GM 快速切換 UX 尚未施作。

- **2026-10-10 3D 異宇宙修正第 1 批（獨立於 3D 第 16～40 批）**：正式異宇宙預覽資料以 200 個宇宙 × 每宇宙 5 深度（總 1000 層）、20 區段 × 每區 10 宇宙為準；`3d-test/prototype-engine.js` 異宇宙 frontier 已建立每區 10 個真實編號節點及中央 5 深度環，scene metadata 保存 segment/universe/depth；文明災厄仍維持 10 封印獨立分支。`3d-test/formal-home.js` 以 `alternateUniverseProgressionSnapshot(...).deepestCleared` 定位下一個宇宙與深度（U200 深度 5 封頂），不寫入正式存檔。`3d-test/index.html`＋`test-center.js` GM 測試中心新增 1～20 區段、所屬 10 宇宙、1～5 深度控制，使用獨立 `universeCount:200` 等 fixture，不沿用十區 mapCount 與進度選擇器；更動後已更新 `index.html` 正式 script 及兩處動態 Babylon prototype loader cache-bust。`tests/runtime/gm-3d-test-center-browser.js` 新增區段 14/U137/深度4 與區段20/U200/深度5 瀏覽器回歸，GM 3D Test Center Browser 已在 commit b53b38b01 通過；完整 Runtime Integrity 應以最新 main HEAD 結果為準。本批只處理預覽資料與基本選擇器，尚未執行第2批場景模板的視覺深化、第3批正式玩家預覽的完整互動 UX，後續不要誤當成全部完成。3D 正式施工仍以 main 為準。

- **2026-10-10 銀河回顧無戰鬥根因修復（補強）**：真實瀏覽器發現高維紀元覆蓋 `adventurePage` 的 `phaseAwareAdventurePage` 優先回傳舊地圖，忽略 `adventureScreen=review-prepare/review-combat`；於 `ui.js` 最外層 `render()` 的冒險分派先行處理這兩個銀河回顧狀態，避開後置覆蓋；版本改為 `GALAXY_REVIEW_BATTLE_RUNTIME_VERSION=8`，已同步更新 `index.html` cache-bust 與兩處版本回歸斷言。`firstworldtargetcontextbatch5.js` 對正式回顧目標驗證失效時不再無訊息停戰：重建一次回顧 context，仍失效則直接呼叫純回顧戰鬥 owner，不可觸發正式收益或進度；不修改宇宙回顧計算。`tests/runtime/galaxy-review-combat-browser.js` 已經由 GitHub Actions 真實通過從選怪頁點擊、真正 `runCombatCore` 與戰鬥演出、結算、關閉、重打兩次（包含高維紀元與舊 context 不可用）；先前仍曾因 baseline 強制舊版本號 7 失敗，已更新至 8，應以最新 HEAD 完整 CI 結論為準。真機驗證另行確認。

- **2026-10-10 銀河紀元回顧戰「按開始卻沒有戰鬥」根因與修復（高維紀元介面接管）**：經 GitHub Actions 真正瀏覽器點擊、開戰、結算回歸檢查，查明 `playersemanticsui.js` 的 `phaseAwareAdventurePage()` 在高維紀元覆蓋了銀河回顧的 `review-prepare`、`review-combat` 畫面，導致狀態存在但畫面被取代。正式修正為這兩種狀態優先交回 `baseAdventurePage()`；`ui.js` 自身也先判斷回顧專屬畫面（`GALAXY_REVIEW_BATTLE_RUNTIME_VERSION=7`）。另 `firstworldtargetcontextbatch5.js` 舊目標驗證失效原會靜默取消挑戰；目前先以最新選怪座標重新驗證，仍不可用時只允許純回顧 `baseReviewStart`，不走任何正式收益、結算或進度流程；保留原始 `runCombatCore` 與 `animateStructuredCombatPresentation` owner。已在 `tests/runtime/galaxy-review-combat-browser.js` 新增正式地圖點選、單次開戰、真實核心與動畫、勝敗結算彈窗、關閉後重打、phase 2/3（含失效舊 context）及正式資源與裝備不變測試；該測試在 Runtime Integrity 執行中已輸出 `Galaxy review real-click combat/settlement/retry browser regression passed`，完整 CI 是否通過應以最新 main HEAD run 為準。已同步 `index.html` 相關 JS cache-bust，以及更新第一紀元 baseline version 7、AU 原 cache-bust 斷言。此為 3D 四十批計畫外的既有遊戲問題補修，原施工批號不變。

- **2026-10-10 銀河回顧實際開戰補修（後續第16批前獨立修正）**：修正 `ui.js` 的 `startGalaxyReviewBattle` 從只找 `window.monsterObj` 改為優先讀取與選怪畫面相同的正式 `monsterObj` 函式（保留 window 相容回退），避免選怪可顯示但開戰依賴不同函式出口；正式 `runCombatCore` 仍是唯一戰鬥 owner，不建立怪物或戰鬥副本。補強回傳結果基本驗證及缺少結算 modal 時解除銀河回顧鎖定；原本銀河／宇宙均由 `setAdventureReviewBattleActive` 管理跨紀元鎖定，銀河成功有結算 modal 時由 `closeBattleResultModal` 解鎖，失敗則在 catch 解鎖，宇宙依既有 `secondworldmainline.js` 生命週期；無更動兩紀元各自戰鬥公式。新增 `tests/runtime/galaxy-review-combat-browser.js`，納入 Runtime Integrity，使用實際瀏覽器點擊選怪、開始回顧、實際 runCombatCore、戰鬥畫面、結算 modal、關閉後重試及 state 不變。是否通過以該 HEAD Actions 結論為準；真機仍待驗。同步更新 `index.html` cache-bust。

- **2026-10-10 銀河紀元回顧按鈕可點擊性補強**：使用者回報銀河回顧十大區可展開，但地圖「回顧挑戰」按鈕無反應。確認原 `openGalaxyReviewMap` / `enterGalaxyReviewMap` 導覽程式在乾淨瀏覽器可正常工作；Playwright 加入實際點擊進怪物選擇頁的回歸測試（先排除未登入遮罩與初始化彈窗）。將地圖按鈕從 inline onclick 改為持續性 document click 委派與合法地圖索引檢查，避免反覆 render 後事件不一致；CSS 移除 `.galaxy-review-action` 低透明度並明確恢復可點擊層級。已更新 `index.html` JS/CSS cache bust。此修正不修改正式銀河回顧戰計算、收益／損失隔離、存檔與戰鬥。使用者原環境直接根因尚未完全重現，勿把 CI 模擬登入測試當作實機確認。

- **2026-10-10 3D 第15批（戰鬥 HUD、特殊遭遇、結算外觀）**：共用 `3d-test/prototype-engine.js` 增 `createBattlePresentationScene` 四種可旋轉幾何原型：戰場與 HP、護盾、特殊遭遇警示、結算戰利品；`3d-test/formal-home.js` 對正式可識別戰鬥／結果 DOM 提供 opt-in 3D 視覺入口；GM「戰鬥、動畫與特效」新增四項同源預覽，累計 24 項。正式 `combatfx.js`、Fast Catch-up、settlement、HP／盾條、獎勵、死亡與存檔維持原 owner，不由 3D 預覽計算或代替。**交付界線**：這是共用 3D 視覺底座／唯讀原型，並非所有模式正式 HUD 已全數替換或即時 3D HP 同步；第 18 批必須核對每個可見模式、特殊遭遇與結算入口，第 19～40 批逐步完成場景、動畫、模型與實機 GPU 測試。更新相關 HTML cache bust 和 GM Browser 測試；CI 狀態以最新 Actions 為準。

- **2026-10-09 3D 第 14 批**：新增共用 `createFrontierScene`，三種真正 Babylon 幾何視覺場景：銀河／宇宙文明災厄封印、異宇宙前線；正式 `calamity` 與 `alternateuniverse` 非戰鬥介面加入唯讀、按需開關的 3D 預覽。異宇宙獨立 renderPage 會通知同一 3D 橋接，切戰鬥時自動釋放；GM 既有「副本、災厄與特殊演出」增加 3 個視覺場景，總計 20。沒有修改雙紀元災厄門檻／永久 HP、異宇宙層域與失敗規則、戰鬥、收益或存檔。現有正式現身通知繼續有效，幾何預覽非最終模型，CI／實機結果分別核對。

- **2026-10-09 3D 高維副本三入口補修**：高維紀元沒有懸賞戰，正式 `thirdworlddungeonui.js` 會隱藏其副本卡。`createDungeonScene` 現按正式可見副本模式生成 3D 門戶並自動居中，高維只展示高維競技場／虛空／鏡像，銀河與宇宙依正式頁面保留各自入口。GM 副本作戰中心可切三紀元。GM Browser 測試修正字面 `\\n` 導致案例未執行的舊問題。只讀 UI，不改戰鬥／獎勵／次數／存檔。

- **2026-10-09 3D 第 13 批（高維競技場／鏡像紀錄／虛空樓層）**：正式副本延續 B12 opt-in WebGL 機制：`3d-test/prototype-engine.js` 新增共用 `createDungeonAdvancedScene`，由 `3d-test/formal-home.js` 透過現有 `registerDungeonPostRenderHook` 在高維競技場選擇頁、鏡像戰紀錄及虛空非戰鬥頁添加唯讀視覺預覽。GM「副本、災厄與特殊演出」新增同源三場景，共 17 項；場景按需載入、離頁或 rerender 釋放，不接管正式戰鬥、次數、陣容、VIP 積分、紀錄、樓層或存檔。第 14 批接災厄與異宇宙，第 15 批接戰鬥 HUD／結果；目前幾何佔位不等同完整 L1 或正式模型，手機真機待驗。

- **2026-10-09 3D 第 12 批（副本首頁／懸賞／銀河與宇宙一般競技場）**：`3d-test/prototype-engine.js` 共用 `createDungeonScene` 支援副本作戰中心、懸賞戰準備區、一般競技場三類 Babylon 幾何場景。透過既有 `registerDungeonPostRenderHook` 在正式 `dungeon`、`dungeon-bounty` ready、`dungeon-arena` select/ready 頁插入 opt-in 3D 預覽；離頁、rerender、combat/result 立即關閉／釋放。GM 六分類中既有「副本、災厄與特殊演出」新增三個視覺案例，使用相同 scene factory、測試資料僅在 GM session。沒有動正式副本 owner、戰鬥、每日次數、獎勵或存檔。第 13 批承接高維競技場、鏡像與虛空；第 15 批負責戰鬥／結果 3D；第 18 批驗收全頁 L1。手機真機與 GPU 長測仍待後續指定批次，切勿把幾何預覽冒稱最終美術。

**既有正式工程完成基準（2026-10-09 核對）**：Batch7：GM／測試工具正式收尾，7-1～7-5全部完成；第一紀元完整 Target Context 重構（Batch0～6）已完成。以上是既有正式工程歷史完成狀態，不代表 3D 第 12～40 批也已完成；以 main 實際 owner 和 PROJECT_PENDING_STATUS.md 為準。

- **2026-10-09 原始 3D 規格書已入庫**：已確認 `main` 根目錄存在 `《文明戰線》3D 全面升級・完整規劃與施工規格書.docx`（53,209 bytes）。此 Word 為設計歷史參考，不是強制施工清單；現行 `main` 程式與 40 批施工計畫優先。往後應直接讀取根目錄原檔，不再使用 `docs/reference/` 作為有效路徑。

- **2026-10-09 3D 前置補修**：現行 11 個 GM 視覺項目對應測試已由舊 v2／7 場景調整至 v3／11 場景，增加分場景自訂與來源隔離檢查。第 1～11 批為 opt-in WebGL 幾何預覽；Canvas runtime 提供 epoch、AbortController、dispose、WebGL fail 回退，維持按需開關策略，無須為歷史 Word 硬改常駐 Engine。第 18 批依玩家正式可見路由補驗 L1 覆蓋。原始 Word 僅供參考，現行 main、40 批計畫及最新定案優先，未必逐條施作；已確認 Word 原檔位於 GitHub main 根目錄。

- **2026-10-09 3D 第 11 批 GM 表單修正**：經確認 createCharacterScene 僅使用紀元設定，不使用 HP／ATK／DEF／暴擊／閃避／VIP／突破七數值；GM 角色全身展示不再有上述七個無效自訂欄位，正式快照仍保留數值。GM 八專精及十印記改四欄緊湊排版／手機四欄、文明等級與界弦核心改單行；正式印記名稱透過快照同步。不改動正式存檔和養成交易；後續任何新 GM 控制僅限能實際影響該場景的視覺參數。

**2026-10-09 第11批 GM 展示資料同步補修**：正式快照 v2 以原正式 state 與 playerCombatStats 唯讀取得角色戰鬥五能力、VIP、突破、五槽裝備與強化、八專精、十印記、文明等級、界弦核心；GM 四種養成視覺場景由同一快照取值，不得使用「區域進度」替代。GM 改名「展示資料來源／正式角色資料／自訂測試資料」，自訂輸入僅作用於 iframe 本次展示，與正式 save 無關。之後 12～40 批皆須遵守場景需要才顯示資料設定、資料真實來源唯讀、不同來源不能混用，以及實機驗收。

- **2026-10-09 第 11 批預覽位置修正**：專精頁移除跨系統四選單，只留八種專精；銀河災厄印記、宇宙災厄文明、高維戰線核心各在對應正式區塊前顯示唯讀入口，且災厄戰鬥／結果頁不插入口；GM 四項獨立展示維持。正式資料與交易不變，手機／回顧瀏覽器驗收待補。

- **2026-10-09 3D 第 11 批階段施工**：新增共用養成星環場景，分別表現八專精、十印記、文明等級與界弦核心；正式頁預覽入口同時涵蓋專精頁、銀河／宇宙災厄頁的印記／文明展示，以及高維冒險頁界弦核心；均保持唯讀，原交易按鈕與對話框不變。正式專精頁僅展示八種專精，GM 3D 視覺中心新增四項場景（fixture 僅在 iframe session 生效）。正式養成、印記、核心注入與資源結算 owner 不變；現為幾何佔位，尚非全面 L1／L2 或實機驗收完成。下一正式批次為 12。

## 每批修改完成的固定回報格式（強制）

往後每一批《文明戰線》修改完成，都必須固定回報以下四個部分，不得省略：

1. **修改內容**：說明實際改了哪些功能、畫面與檔案，區分已完成及仍未完成範圍。
2. **程式自我檢查**：列出實際執行的靜態檢查、自動化／瀏覽器測試、結果與未驗證項目；不得把程式碼回讀當成實機通過。
3. **實機驗收清單**：提供使用者可直接在手機或電腦操作的逐項測試，**每項必須寫清楚進入路徑、操作步驟、預期畫面或行為**，必要時含不同紀元、回顧、GM、最大化／還原與原功能回歸；讓使用者可用編號回報問題。此為每批必填，不能只寫「請實測」。
4. **GitHub 提交與待補事項**：列出分支、commit SHA、文件／cache-bust 更新、CI 狀態，以及尚待修正或人工驗收的項目。

即使當批是純工程變更、沒有新視覺入口，也須列出可操作的正式流程回歸測試；若實際無法在手機觀察技術內部結果，應明確說明可觀察的行為與需由 CI 驗證的部分。不得虛稱實機已通過。

# 《文明戰線》PROJECT HANDOFF

- **2026-10-09 GM 3D 手機場景清單修正**：原 `center-sidebar` 在 ≤770px／≤480px 被固定於約 44～46dvh 且 `overflow:auto`，七個分類擠走下方場景細項。現在手機模式解除側欄及細項區高度上限、改由整頁自然捲動，避免分類區遮住場景細項；桌機樣式不變。更新 3D 測試中心 CSS 快取。手機 Safari 實機待驗。


- **2026-10-09 GM 3D 外觀設定排版修正**：外觀設定面板僅用於角色、五槽裝備、鍛造台三個相關展示，三紀元主畫面與星圖不顯示；移到場景介紹下方改為預設收合的「展示設定」，展開後可切正式／自由模式與調整參數。把先前分散的行內 CSS 統整進 `3d-test/test-center.css`，以固定高度／自適應兩欄網格解決手機巨大輸入框及五槽 checkbox 直向堆疊。正式快照、iframe 權限與七場景 factory 均保留；手機、桌機 WebGL 及 CI 尚待驗收。



- **2026-10-09 3D 外觀快照前置整合**：新增 `3d-test/appearance-snapshot.js`（唯讀正式角色外觀資料，世界、等級、VIP、突破、五槽裝備基本辨識、強化等級和背包樣本；不採集 HP/ATK/DEF，不寫 Save）；`3d-test/formal-home.js` 的角色／裝備／鍛造場景改走同一份快照。GM `gm3dprototype.js` 經 iframe 同源及授權雙重檢查提供 request/response；`3d-test/test-center.js` 預設正式角色模式，自由展示獨立 session-only，支援重新同步與基本外觀選項；模型仍為佔位物件，尚無真 GLB 換裝或高階效果。原 40 批編號不變，11～40 批逐批接入視覺快照，不以快照取代戰鬥／交易 owner；瀏覽器與手機待驗。

- **2026-10-09 第 10 批階段施工**：新增五槽強化鍛造台 WebGL 場景，正式強化頁可開關預覽、GM「強化鍛造台」測試案例；僅唯讀展示正式強化等級／上下限。未變更 `enhancementui.js` 交易、確認、扣資源及 rollback，成功失敗 3D 動畫與完整 L1 待後續施工，實機未驗收。


- **2026-10-09 GM 3D 測試中心全頁視覺整理**：比照正式遊戲 `style.css`／`gmhub.js` 的黑灰、鐵灰、暖金視覺語言，重整測試中心頁首、側欄、分類與細項差異、類別場景數、場景資訊、參數面板、WebGL 舞台、操作列與手機響應式樣式。保留六個真實展示、分類篩選／搜尋、場景切換、畫質、放大還原、iframe 返回及測試邏輯；`test-center.js` 僅增加分類數字／細項文字 DOM，未改正式遊戲或存檔。真機視覺、縮放與 E2E 待驗。

- **2026-10-09 第 09 批階段施工**：新增背包頁只讀 3D 五槽裝備／背包樣本立體展示及 GM 五槽裝備陳列；換裝、鎖定、出售與贖回操作均沿用正式 owner，未把 3D 模型作為交易入口。尚非正式裝備模型，完整 L1、回歸 E2E／實機未驗收。


- **2026-10-09 3D 載入效能優化**：正式 3D 橋接於網頁完成後的閒置時段僅預先快取 Babylon.js 7.54.3 與共用 scene factory，不提前建立 WebGL／Canvas／GPU 場景；正式首次點擊改平行載入獨立 JS（並保留失敗重試），GM iframe 測試中心 Babylon.js／runtime／scene factory 改平行載入，GM 與正式頁使用同一共用場景資源 URL 以提高 HTTP 快取重用。保留使用者手動啟動、關閉釋放 GPU、場景與存檔不變。實際首開速度／網路與手機測試尚待量測。

- **2026-10-09 GM 啟動加速調整**：設定頁在 `state.gm` 已授權時先呈現 GM 管理載入區塊，GM deferred group 完成即原區塊注入完整 `gmHtml`，不強制重繪全頁或改存檔；`scriptgrouploader.js` 改於 DOMContentLoaded 排程，而非等待 window load（圖像等資源），仍維持 GM 模組原順序與授權驗證，失敗時提供重試按鈕。自動化／手機時間測量尚待驗收。


更新日期：2026-10-09（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只負責交接、索引與正式現況整理；若本檔、舊對話、舊設計文件、歷史文件或其他摘要與 current main 衝突，一律以 current main 為準。

---


## 3D 全面升級新計畫（2026-10-09，第 01～06 批已有階段性工程）

- **2026-10-09 銀河回顧 3D 預覽補齊**：宇宙紀元與高維紀元的「銀河紀元・回顧」正式區域列表，現在共用既有 `createGalaxyScene` 及可開關預覽入口。預覽解鎖呈現依已完成銀河的純回顧狀態、聚焦正式回顧選取地圖；切換紀元視圖會關閉舊預覽。正式回顧戰、存檔與進度規則不變。靜態回讀可核對，真機及 E2E 待驗。


- **2026-10-09 第 08 批階段施工**：角色頁新增獨立 opt-in 3D 全身幾何佔位展示，GM 視覺中心同步新增角色全身展示；既有角色能力、裝備、稱號挑選、突破 owner 未改。不是最終裝甲模型／稱號效果／突破動畫，完整 L1 與實機驗收待補。

- **2026-10-09 第 07 批階段施工**：高維紀元十名存在新增共用 3D 場景與正式冒險預覽、GM「高維紀元戰線」視覺預覽。讀取正式 Boss 進度快照，不接管 HP 計算、回顧或戰鬥交易；靜態檢查及回讀待確認，實機 E2E 未驗收。

- **2026-10-09 第 06 批階段施工**：正式宇宙主線及第三紀元中的宇宙回顧加入可開關 3D 宇宙星圖，共用十區 100 Boss 象徵場景工廠，依正式主線進度唯讀呈現；GM 視覺中心增加「宇宙紀元星圖」，仍保持六分類、無工程診斷。未替換原 HTML 戰鬥、選王、回顧、結算 owner；完整 L1、真機、回顧 E2E 尚待驗收。詳見第 06 批規劃紀錄。

- **2026-10-09 GM 3D 測試中心最新視覺版（覆蓋舊九類／八案例展示）**：使用者明確要求 GM 只顯示實際 3D 視覺成果；目前介面六類，僅「三紀元主畫面」「銀河紀元星圖」兩個展示入口，其餘只有後續真正有可見成果時才新增。技術性 ID、Bxx、Babylon.js/WebGL/Canvas、測試狀態及診斷按鈕從使用者 UI 移除，但保留程式／CI 內部檢查。測試情境選單僅提供對場景有可見影響者：主畫面紀元切換，星圖區域進度及聚焦位置。最大化還原後透過視窗捲動定位到目前預覽（避免手機跳回上方選單），不建立新 Canvas。最新版 `3D_GM_TEST_CENTER_CATALOG.md` 逐批區分視覺／非視覺；`3D_IMPLEMENTATION_PLAN.md` 全 40 批義務改成條件式視覺預覽或正式／CI 驗收，舊規定「每批都需要 GM 測試入口」失效。須看最新 CI／實機測試結果，不得以舊驗收狀態替代。

- **2026-10-09 GM 3D 測試中心新增「標準／最大化」雙模式：在同一場景舞台右上角切換；最大化填滿內嵌 GM iframe 允許的桌機／直式手機畫面，Esc 還原且不關閉 GM iframe；相機、選取案例、fixture 不重新建立。`3d-test/index.html`、`test-center.js`、`test-center.css`、`tests/runtime/gm-3d-test-center-browser.js` 同步更新，包含手機窄螢幕回歸測試。**

- **2026-10-09 GM 3D 狀態文字遮擋再修正**：使用者實機反映前次成功隱藏仍會看到底部文字，且當時 GitHub Pages 已成功部署；此回合將 `#status` DOM **徹底從 `.stage` 搬到 `.center-workspace` 內的 3D 畫面上方**，通知只在 loading／錯誤／WebGL 事件顯示，正常時 hidden；同步 CSS、JS cache bust、GM iframe URL 版本化及 `index.html` cache bust，並新增 DOM 位置瀏覽器回歸斷言。原本只是 hidden 的修法不可視為已驗收。須待 GitHub Pages 部署與使用者桌機／手機再次確認。

- **2026-10-09 GM 3D 狀態列遮擋鏡頭按鈕修正**：`3d-test/test-center.js` 在成功載入後隱藏底部 `#status`，保留載入中／失敗／WebGL 復原顯示；`test-center.css` 新增 `[hidden]` 明確隱藏規則；`3d-test/index.html` 更新 JS/CSS cache-bust。`tests/runtime/gm-3d-test-center-browser.js` 加入成功場景遮擋回歸測試，須待 CI 確認結果。正式遊戲 preview 不受影響。

- **2026-10-09 GM 3D 測試中心基礎架構已實作、前五批回填**：正式 GM 測試選單改稱「3D 測試中心」，`3d-test/index.html`＋`test-center.js`＋`test-center.css` 已建九大分類、搜尋、八筆案例、session 進度／紀元／情境、共用 Babylon scene factory 顯示、WebGL 故障測試及原 GM 入口返回。仍只有 B01～B05 既有的 3D 能力，B04 突破 Modal、B05 正式 3D 選怪及轉生完整 E2E 尚未完成。新增 Chromium 專屬 CI：run 37900894410 通過；其餘批次必須持續擴充 catalog。

- **2026-10-09 GM 3D 開發測試中心總目錄已建立（規劃文件，尚非 UI 施工）**：新增 `3D_GM_TEST_CENTER_CATALOG.md`，將第 01～40 批逐一分配到九大分類 A～I，含主次分類、正式／GM 同源場景、fixture、測試 IDs、回歸／裝置矩陣與未來新增分類規範；B01～B05 八個補登測試項目已定義。同步於 `3D_IMPLEMENTATION_PLAN.md` **每一批**新增 GM 同步義務與強制驗收規範。**下一步先升級 `gm3dprototype.js` → `3d-test/index.html` 的 GM 測試中心目錄、場景註冊與 B01～B05 回填，之後再施工 B06**。目錄規劃已入庫，但分類 UI、搜尋、真實案例接入尚未實作，不可標記完成。各批須同步正式預覽與 GM 分類入口，無 GM 對照者不得標記該批全數完成。

- **2026-10-09 共用 3D 大小模式**：`3d-test/runtime.js` 新增「放大視窗／還原視窗／關閉」操作（原 ＋／－／視角重置保留），直接切換 host class，不建立新場景／相機，並呼叫 engine.resize；`3d-test/preview-expand.css` 桌機中央寬約 85vw、高 80dvh、手機直式寬 95vw／高 88dvh、橫式矮螢幕 94vw／92dvh，沒有強制旋轉。`3d-test/formal-home.js` 關閉走正式 bridge；`index.html` 已更新快取。Chromium 專屬測試增加 class 與 Canvas/Camera identity 驗證；真機手機、桌機視覺布局仍須人工確認。

- **2026-10-09 3D 相機操作改善**：`3d-test/runtime.js` 共用 3D 預覽新增「＋」「－」「⟲ 重置視角」三控制鈕，並以 `{passive:false}` 於啟用中之 canvas 攔截 wheel 預設頁面捲動，畫布外維持原本滾動；scene 啟動時保存相機初始 radius/alpha/beta，dispose 移除新事件監聽。`index.html` 已更新 cache-bust。`tests/runtime/galaxy-3d-button-browser.js` 增加 mock engine + Chromium DOM 視角控制／wheel event 驗證，獨立 browser smoke workflow 已納入 3D runtime 檔案變更觸發。仍需實際桌機滾輪／手機觸控驗收。

- **2026-10-09 轉生銀河預覽入口補修**：使用者實測確認首輪銀河有入口、轉生重返正式銀河卻無。針對不同 world1 rerun HTML owner，新增正式 `render()` 後的 `civilization3dHomeRouteRendered()` 容錯補入口：只在 `currentWorldPhase()===1` 且正式 `getAdventureEraView()==='galaxy'` 的冒險區域列表補上按鈕，已存在則不重複；回顧世界不補。未更動世界判定與正式戰鬥 owner。 `tests/runtime/galaxy-3d-button-browser.js` 新增首輪銀河／轉生銀河／銀河回顧三情境（測試虛擬紀元路由與 DOM，不冒充真實轉生完整 E2E）。

- **2026-10-09 第 05 批實機入口修正：使用者確認是在正式銀河紀元冒險十區列表，不是回顧戰；`worldmapui.js` 的正式 `adventureMapPage()` 原本以 `typeof galaxy3dPreviewControl` 的條件式輸出按鈕，會在跨 script 作用域不可見時靜默省略。現已改為正式地圖 owner 直接輸出按鈕，`index.html` 更新 worldmapui cache-bust；另新增 `tests/runtime/galaxy-3d-button-browser.js` 和獨立 CI `.github/workflows/galaxy-3d-button-smoke.yml`，以 Chromium 真正 render `go('adventure')` 驗證按鈕與正式區域列表。非轉生回顧頁問題，未修改戰鬥或存檔。**

- **第 05 批 CI 補充（2026-10-09）**：GitHub exact-HEAD Runtime Integrity 在 `tests/runtime/js-integrity.js` 的既有 GM script-group loader cache 契約失敗（production `index.html` 已累積 v5～v8 cache token，但舊測試只允許到 v4）；暫時核對完整字串後下一項既有 GM 授權 owner 契約仍失敗。此為跨模組舊測試／正式程式不一致，非第 05 批新 JavaScript 語法失敗；已撤回臨時修改該舊測試的提交內容，未在本批放寬其他 GM 驗收。**Runtime Integrity 未通過；Playwright 瀏覽器 smoke 因前段失敗未執行**。詳見 [CI run 37894390745](https://github.com/franksky1207/rpg/actions/runs/37894390745)、[後續 CI run 37894599615](https://github.com/franksky1207/rpg/actions/runs/37894599615)。
- **2026-10-09 3D 第 05 批銀河冒險施工**：正式地圖 owner `worldmapui.js` 與準備頁 owner `ui.js` 加入手動「預覽 3D 銀河星圖」，`3d-test/prototype-engine.js` 新增十區域節點／五怪象徵 3D 幾何（只讀正式 WORLD_REGIONS、unlockedMap、selectedMap，按 mapStart 判定大區鎖定），`3d-test/formal-home.js` 將隔離 Canvas 用於冒險頁，切離冒險或進戰鬥自動回退並釋放；`3d-test/galaxy-b05.css` 更新地圖卡／怪物卡科幻視覺與響應式排版；`index.html` 已更新 cache-bust。**正式區域／怪物／進度／鎖定／戰鬥 Target Context／背包返回均沿原版 owner**。本批是 WebGL 星圖預覽與 HTML 原版流程共存，不是全頁 3D 選怪；真機、手機、回顧與不同進度存檔仍待驗，不能標記全面 L1 驗收。詳見 `3D_IMPLEMENTATION_PLAN.md` 第 05 批。

- **2026-10-09 3D 第 04 批第一階段已施工**：正式 `worldphaseui.js` 三種既有紀元 overlay 加入只讀 `data-world-phase-target`，CSS `3d-test/worldphase-b04.css` 加入宇宙／高維入口與條件、確認、解鎖通知差異；正式主畫面自選 3D 預覽新增讀取 `currentWorldPhase()` 的實體 portal torus。正式解鎖、轉換與存檔 owner 未改。`index.html` 同步更新 CSS 與 JS cache-bust。**完整導航/全部彈窗 WebGL L1、手機及瀏覽器實測仍待驗收**；第 05 批其後已施工（本句原為 2026-10-09 當時紀錄）。詳見 3D 計畫第 04 批。

- **2026-10-09 補強施工契約已入 GitHub**：`3D_IMPLEMENTATION_PLAN.md` 新增第 `6A` 節，將原版功能比對結果明確列為 **R01～R30 共 30 項驗收要求**、5 項全域硬性規範，以及第 18／34／40 批結案門檻。包括玩家名稱、46 種稱號／正式怪物名稱、HP／護盾、技能浮字、結算、各紀元資源、GM／離線／雲端、完整 route/subview/Modal/狀態矩陣。往後每批必核對相關編號，不准只完成主要畫面就宣布全功能完成。

- **2026-10-09 B01-G1 本地化完成**：GitHub Action `Vendor Babylon.js 7.54.3` 自官方 npm registry 取得完整 UMD 引擎（6,794,120 bytes），檢查 npm dist.integrity、`babylonjs@7.54.3`/Apache-2.0，將 `babylon.js`、`LICENSE`、`SOURCE.md` 放入 `vendor/babylonjs/7.54.3/`；正式 3D 預覽與 GM 3D 測試均已改用 repo 內本地路徑，且更新 `index.html` cache-bust。引擎 SHA-256：`420088fc4c31c22591703ce207c7736f15419faa556b0678d28f71dbf7ea523a`。GitHub Actions run `37892987459` 通過，vendor commit `51492689189566b053b3dd3e637d345aa22c34e7`。B01-G1 本地化已完成，但 GM/正式介面真實操作、手機、GPU 回退 E2E 仍未驗收。
- **2026-10-09 第 01～03 批基礎架構收尾追蹤**：依使用者四項要求加強 `3d-test/runtime.js` 的 engine dispose 次序、context-loss fail-closed；測試頁的重啟時清空舊 host、提示恢復方式；`gm3dprototype.js` 以同源/source 訊息處理 iframe 內 Escape，回到 GM 原頁並還原 window/`#main` 捲動與焦點；`3d-test/formal-home.js` 加強反覆啟閉與離頁清理；`index.html` 更新相關 JS cache-bust。**仍有真實缺口**：Babylon.js 7.54.3 完整引擎及授權 bytes 未入庫（外部 CDN 仍存在）、瀏覽器與手機沒有實測、其他正式路由尚未覆蓋、GLB/refcount/GPU 長時驗證待素材階段。不得宣稱已將第 01～03 批全部結案；詳見 3D 計畫末尾追蹤。
- **2026-10-09 第 03 批安全接入**：正式 `ui.js` 首頁提供「預覽 3D 艦橋」按鈕，預設關閉；`3d-test/formal-home.js` 只在點擊時非同步載入測試場景，畫面掛在 `#main` 之外既有的 `#civilization3dFormalHost`，離開首頁或場景失敗時清理。`index.html` 已更新 JS 引用及快取版本。**這不是完整的正式首頁 L1 3D、更不是已完成啟動／帳號頁 3D 化**；Babylon.js 本地化、手機瀏覽器 E2E、GPU 與 fallback 實測仍待補。正式登入、導航、數值、存檔、戰鬥 owner 不變。見 `3D_IMPLEMENTATION_PLAN.md` 第 03 批實作與限制。
- **2026-10-09 第 01～02 批缺口提前補修**：`3d-test/runtime.js` 增加 AbortController signal、epoch 取消、asset dispose、WebGL context lost/restored callbacks；`3d-test/index.html` 新增 WebGL 中斷測試；`gm3dprototype.js` 增加 GM iframe Esc 與返回原捲動位置；正式 `index.html` 增加 `#civilization3dFormalHost`（設於 `#main` 外、預設 hidden）與 runtime 腳本、更新 GM cache-bust。**這不是正式 3D 介面啟用**；未完成項目仍包括 Babylon engine bytes 入庫與 license、正式 route/scene 整合、非同步 GLB loader 真正配合 abort、GPU refcount 與瀏覽器/手機實測。完整紀錄在 `3D_IMPLEMENTATION_PLAN.md` 第 6A 節「缺口提前補修」。
- **第 01～02 批缺口追蹤**：新增 B01-G1 外部 Babylon CDN 尚未本地化、B01-G2 GM 返回及 WebGL/手機實測不足、B02-G1 Canvas 僅在獨立測試 iframe／正式 route 未接、B02-G2 epoch 不等於實際素材載入 abort 且 Map 未具正式 GPU refcount/dispose、B02-G3 context loss/重入及長時間 GPU 壓測未驗。這些是仍須完成的工程／驗收債務；第 01～02 批「程式已施工」不得誤寫「實機完全通過」。其餘 R01～R30 的正式 UI/稱號/怪物/戰鬥功能屬第 03～40 批，不得假稱前兩批已交付。
- 唯一完整批次表：[`3D_IMPLEMENTATION_PLAN.md`](3D_IMPLEMENTATION_PLAN.md)，含 **40 批**：A1 全正式介面 18 批 → A2 真 3D 場景 8 批 → B 人物／裝備／怪物 8 批 → C 正式 3D 戰鬥與總驗收 6 批。
- 使用者優先度：**先覆蓋進入遊戲能看到的所有正式介面／子頁面／動態彈窗**，不是先完成 3D 戰鬥。正式遊戲核心、存檔、Target Context、轉生與高速補播規則不得因視覺改造而變動。
- 素材、程式、GLB、資產登錄表原則留在單一 `franksky1207/rpg` GitHub 儲存庫，保留原版回退。
- **狀態：第 01 批程式已提交／靜態核對；瀏覽器與手機實測待補。第 02 批共用 runtime 程式已提交、實機仍待驗；第 03 批安全預覽程式已提交但正式 L1 尚未全驗收；第 04～15 批後續已施工、第 16～40 批未開始（2026-10-10 進度更正）。** 其他批次只依使用者指定執行。
- **2026-10-09 第 02 批共用 3D runtime**：新增 `3d-test/runtime.js`，提供外部 host Canvas、scene epoch/過期結果取消、同一 engine 跨場景重用、dispose、記憶體暫存 Map、low/medium/high 硬體縮放、fallback callback 與手機 Safe Area；`3d-test/index.html`/`prototype-engine.js`/`prototype.css` 已改成共用 runtime 驅動及畫質操作。正式 `#main`/正式存檔/正式戰鬥未更動，GM iframe 返回方式保留。程式提交至 `5bf7b093b7117d300be88ef0e8d563c16798ce59`，完整紀錄見 3D 計畫。**靜態檢查完成，尚無實機 GPU leak／瀏覽器或 exact HEAD CI 成功證據**。
- **2026-10-09 追加 GM 同頁測試入口**：GM → 測試 → 3D 場景測試。`gmhubextensions.js` 註冊測試 section；`gm3dprototype.js` 在原有授權 GM lazy group 載入，使用覆蓋層與 `3d-test/?embedded=1` iframe；點「返回原本畫面」或 Esc 只移除覆蓋層，不呼叫主遊戲 `go/render/reload`，保留原頁面 DOM、GM 展開狀態與捲動。`index.html` 已更新 GM JS cache-bust。靜態核對完成、真實瀏覽器與手機操作仍待驗證。
- 本次新增 `3d-test/index.html`、`3d-test/prototype-engine.js`、`3d-test/prototype.css`，固定 Babylon.js 7.54.3 測試載入；獨立 WebGL 場景、停用與重啟、失敗 fallback 和 dispose，不觸及正式首頁、存檔與戰鬥。測試頁現用外部固定版 CDN，正式使用前仍需將相依檔納回 GitHub。施工 commits：`b5e664268a9fc11bc83679f22d451398f77bec6a`、`23a229628dca1f91fcdf6f15442d7b7c259f35f2`、`a70438a14f8e7c2a7d3b0e122839d635e052c231`；本次沒有完整瀏覽器 E2E / 手機實測或 exact HEAD CI success。
- 此 3D 新計畫不覆蓋本交接檔的任何既有遊戲正式現況；每批操作先重讀 current `main`。

# 0. 本次交接基準

本次交接以 **2026-10-08 current `main`** 的實際程式碼為依據。更新交接檔前重新讀取了本檔，以及本次對話直接修改／依賴的正式 owner 與 regression，包括：`calamitycore.js`、`calamitygm.js`、`calamitygmintegrity.js`、`gmpowerbenchmark.js`、`savemigration.js`、`gmruntimeauthorization.js`、`scriptgrouploader.js`、`gmdevicepreferences.js`、`gmbackground.js`、`combatspeed.js`、相關 Runtime Integrity 測試與 `index.html`。其他既有系統仍以本檔 owner 索引＋current main 為準；**本檔不是 main 的替代品**。

此次只更新 `PROJECT_HANDOFF.md`；更新前 gameplay HEAD：

```text
d1cd0a4a5becf753cbd45beb578236780822a1cc
```

該 exact HEAD 查詢時 GitHub combined status／workflow runs 仍為空集合，因此**不可宣稱 current HEAD CI 已綠**。本檔內較早的 #2155／#6124／#1111 等 success 僅屬歷史驗證紀錄，不可套用到 current HEAD。

目前正式開發狀態：

```text
三大紀元正式 runtime                                   ✅ 完成並維護／實測中
裝備自動處理政策                                       ✅ 完成
轉生核心資料與首輪隔離                                 ✅ 完成
突破系統＋正式轉生                                     ✅ 完成
異宇宙／稱號／鏡像／第三紀元副本 access 收斂           ✅ 完成
Batch5～7、Target Context、Code Cleanup                ✅ 完成
劇情轉生分流 Batch1～4                                 ✅ 完成
劇情／災厄安全與 Fast Catch-up 優化                    ✅ 完成
銀河災厄 HP 平衡＋正式 final-damage owner 修正          ✅ 完成
GM 測試 context／結果 snapshot／正式印記 transaction    ✅ 完成
GM 災厄 no-progress＋formal-vs-GM parity regression     ✅ 完成
GM 授權首次 render／lazy group／auth-ready preference   ✅ 完成
目前已核准工程                                          ✅ 全部完成
```

本次對話沒有留下已核准但未施工的功能批次。下一輪若要再做 GM 載入最佳化，必須重新 fresh-read current main；不要把本次分析中尚未執行的低優先建議自動視為待辦。

---

## 2026-10-09 異宇宙戰鬥稱號顯示統一（Batch 1～3）

以當日 main 的 `alternateuniverseui.js`、`playertitlerenderer.js`、`playertitleintegrity.js`、`index.html` 為準：

- 異宇宙正式攻略玩家名稱已改用唯一正式 renderer `window.playerIdentityNameHtml({compact:true})`，與銀河／宇宙一般競技場及其他正式戰鬥的稱號判定來源一致；仍由共用 renderer 執行已解鎖、裝備中稱號判定及安全跳脫。異宇宙未載入 renderer 時僅以跳脫後純名稱降級顯示，不另行實作稱號規則。
- `alternateuniverseui.js` 的 `ALTERNATE_UNIVERSE_PLAYER_UI_VERSION=6`；已移除原本只回傳純玩家名稱的 `playerName()` helper，以及載入時 `install()` 安排的額外首頁 `render()`，保留正式對外入口／戰鬥 API。
- `index.html` 現在只載入一次 `alternateuniverseui.js`，且在 `playertitlerenderer.js` 之後；JS 修改均已更新對應 cache-bust。
- `playertitleintegrity.js` `VERSION=24`：新增使用假資料、不修改正式 `state` 的異宇宙戰鬥身分 renderer 回歸案例，涵蓋已裝備稱號、已解鎖未裝備、未解鎖、名稱 HTML 特殊字元跳脫、單一稱號節點和正式稱號 state 不變。這是 renderer 層的程式化驗證，不等於實際瀏覽器完整戰鬥 E2E。
- **資料相容：** 本次僅調整顯示／啟動與 Integrity，`titles` 仍為既有 root（`version/unlocked/equipped/pendingNotice`），不變更稱號取得或異宇宙進度，不新增正式存檔欄位；維持 `SAVE_SCHEMA_VERSION=17`，不需清舊資料、不需新 migration。
- **驗證界線：** 在沒有取得 exact HEAD 的 GitHub Actions 成功結果或實際瀏覽器畫面測試前，不得宣稱 CI 或完整戰鬥 E2E 已通過。

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前 fresh-read current main 的 `PROJECT_HANDOFF.md`、相關正式 owner／consumer；必要時再讀 `PROJECT_PENDING_STATUS.md`。
2. 使用者說「先討論／先檢查／先不要修改」時不得修改 GitHub；說「修改／做／執行／第N批」時可直接改 `main`，不用重複確認。
3. 每批修改後必須 fresh-read current main、compare base→head，自我檢查 UI／邏輯／正式 state 寫入／舊檔相容／transaction／runtime／Integrity。
4. JS／CSS production 修改必須同步更新 `index.html` cache-bust；Markdown-only 不需要。
5. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式。** 已有 registry／policy／transaction／normalizer／combat／offline／progression／target／world semantics owner 時，必須延伸正式 owner。
6. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark 不得污染 formal save。
7. Integrity／Actions 沒有 exact HEAD 的 success 不可宣稱綠燈。
8. W3 Story／Final 已完成，不自行重寫或擴增既有 11 篇正式主線。
9. 玩家正式用語固定：「10 名高維存在」、「突破等級」、「層域」。
10. `B`、`U37`、`1000U` 等只可作內部 shorthand，不重新出現在玩家正式 UI。
11. `offlineprogress.js` 是正式 compatibility/offline consumer；不得建立第二套 Offline pipeline。
12. W3 永久 HP settlement 契約 `formalStartHp → combatEndHp → permanent delta` 不得改變。
13. 正式轉生與其他大型 state mutation 必須走 shared transaction／backup owner。
14. 轉生／重征服硬原則：`reincarnation.count = 0` 維持首輪；只有 `count > 0` 啟用 rerun。
15. AU replay/review 已完整移除，不復活。
16. 第一紀元正式 battle authority 是 Target Context；`selectedMap / selectedEnemy` 只作 UI/navigation selection，不得再作 battle execution target authority。
17. Target Context post-prepare execution 必須 fail closed；validator／lifecycle owner 缺失、context stale、identity 不一致時不得 fallback 回 UI selection。
18. 三紀元角色／裝備 world semantics 優先共用 `currentWorldPhase()`、`sharedEquipmentWorld()`、`characterWorldSnapshot()`。
19. 異宇宙稱號門檻以 `alternateuniversedata.js` 的 `depthThreshold` 為唯一資料來源，不得重新寫 `depth/100` 第二套公式。
20. 第三紀元副本「永久資格」不得繞過紀元 availability；尤其懸賞戰在 W3 必須保持關閉。
21. 鏡像玩家結算與 GM 正式裁定共用 `settleMirrorDungeonResult()`，不得重做第二套歷史／稱號 settlement。

---

# 2. 三紀元正式基準

`currentWorldPhase()`：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

正式 persistent world roots 維持 `secondWorld` 與 `thirdWorld`。

正式等級：

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

正式 level owner：

```text
FIRST_WORLD_LEVEL_CAP  = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP  = 2000
ABSOLUTE_MAX_LEVEL     = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

W1→W2：Lv500＋W1 final boss＋8專精60＋五部位+20＋10印記10；首輪要求 final Story，rerun Story bypass。

W2→W3：Lv1000＋W2 entered/final boss＋五部位+40＋文明10＋VIP20＋8專精60＋10印記10；首輪要求 final Story，rerun Story bypass。

轉生不取消 Lv500／Lv1000 世界邊界與養成條件。

---

# 3. Save／Migration／資料安全

current 正式基準：

```text
SAVE_SCHEMA_VERSION = 17
SAVE_LOAD_PIPELINE_VERSION = 3
SAVE_NORMALIZATION_PIPELINE_VERSION = 3
SAVE_MIN_SUPPORTED_VERSION = 1
SAVE_LEGACY_SUPPORT_MODE = "all-known"
```

仍**不升 Schema18**。異宇宙稱號沿用既有 `titles` root：

```js
{ version: 1, unlocked: [], equipped: null, pendingNotice: null }
```

相容邊界：

- Schema1～16：legacy import，走 canonical migration。
- Schema17：current canonical schema。
- Schema18+：未明示支援前 fail closed。
- legacy `SAVE_VERSION=13`、`MAX_LEVEL=500` 只作 compatibility alias。
- legacy cleanup 只屬 `migrateSave()` 正式 migration owner。

## GM transient cleanup

`GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION = 3`，正式 migration 目前清除 **14 個**歷史 GM-only transient keys：

```text
gmTestWorld
gmTestLevel
gmTestEquipment
gmTestEquipmentSource
gmTestVipLevel
gmTestBreakthroughLevel
gmTestEnhancementLevels
gmTestSpecializations
gmTestMarkLevels
gmTestCivilizationLevel
gmTestContext
gmTestContextRevision
gmPowerBenchmark
gmTestResults
```

這些只屬 GM sandbox／benchmark runtime；舊存檔若曾誤寫入，migration 會移除。正式角色 save／Cloud Save 不應持久化上述欄位。

## 2026-10-07 migration diagnostics

`SAVE_MIGRATION_DIAGNOSTICS_VERSION = 1`。

`LAST_SAVE_MIGRATION_REPORT` 現在另外記錄：

- `alternateUniverseTitlesBackfilled`
- `alternateUniverseTitlesBackfilledIds`
- `mirrorHistoryInitialized`
- `mirrorHistoryRepaired`
- `mirrorMiracleDatesRemoved`

用途是讓舊存檔稱號／鏡像歷史修復可被 regression 明確驗證，不建立新的 persistent state。

---

# 4. 突破系統＋正式轉生

首輪 `count=0` 突破固定 Lv.0。

轉生輪跨 Lv.100／200／…／1000，各 +1，每輪最多10；Lv1000～2000不再給。一次跨多級補發；已領不重複；降級不扣。

每1突破：

```text
raw equipment HP / ATK / DEF +2.5%
final damage +0.05
```

正式轉生資格：Lv2000＋本輪10名高維存在全滅＋界弦核心Lv10；Story completion 不列資格。

轉生保留：VIP、永久突破、稱號、設定、daily、Story／戰線閱讀歷史、Mirror／Void永久歷史、AU unlock/deepest、符合規則的W3 Lv2000裝備、1.5×永久使用權。

轉生重置：Lv/EXP、W1/W2/W3本輪進度、強化、專精、印記、文明、本輪Arena、資源、offline sample/pending、pending encounter、lostGear、AU activeAttempt/current-life failures、本輪突破 milestones。

---

# 5. 轉生永久裝備安全邊界

`reincarnationpermanentgearguard.js`：

```text
VERSION = 3
POLICY = "evidence-gated-fallback-only"
REQUIRED_WORLD = 3
REQUIRED_LEVEL = 2000
```

只在「已轉生、尚未重新進入 W3 的 lower-world rerun」檢查 W3 永久裝備。

只接受明確 marker 或 legacy `reward-3-2000-` 證據作歷史損壞修復；模糊 W3 裝備只 warning，不猜測修復。

---

# 6. 異宇宙正式基準

異宇宙不是第四紀元：200宇宙 × 5層域 = 1000層域。

正式敵人基礎公式：

```text
HP    = 320000 + 30000U + 1500U²
ATK   = 26000 + 600U
DEF   = 12000 + 250U
CRIT  = 20%
DODGE = 20%
```

7種 canonical traits：

```text
strong / ferocious / hard / swift / deadly / berserk / giant
```

每次正式 attempt 固定2個不同 traits。

同一 life、同一 frontier 第10敗鎖到下一次轉生。正式轉生保留 deepestCleared，清 activeAttempt/current-life failures。

AU 共用正式 combat/stat/specialization/marks/VIP/equipment/breakthrough/final-damage owner；無 EXP／資源／裝備收益。

第一次 W3 10名高維存在全滅後永久解鎖；之後任何轉生輪／任何紀元／任何等級可進。

---

# 7. 異宇宙稱號系統（2026-10-06～10-07，Batch1～4 完成）

## 正式 catalog

`playertitlecore.js` current：

```text
PLAYER_TITLE_STATE_VERSION = 1
PLAYER_TITLE_CATALOG_VERSION = 5
PLAYER_TITLE_CANONICAL_CATALOG_VERSION = 4
PLAYER_TITLE_THIRD_WORLD_CATALOG_EXTENSION_VERSION = 1
PLAYER_TITLE_ALTERNATE_UNIVERSE_CATALOG_EXTENSION_VERSION = 1
PLAYER_TITLE_UNIFIED_DEFS_VERSION = 2
PLAYER_TITLE_MIRROR_LAST_ORDER_VERSION = 1
PLAYER_TITLE_ALTERNATE_UNIVERSE_THRESHOLD_OWNER_VERSION = 1
PLAYER_TITLE_NORMALIZATION_DIAGNOSTICS_VERSION = 1
```

正式稱號共 **46 個**：

```text
銀河災厄 10
宇宙災厄 10
高維 10
異宇宙 10
鏡像戰 6
```

正式顯示／持久化順序固定：

```text
銀河 → 宇宙 → 高維 → 異宇宙 → 鏡像
```

鏡像稱號永遠最後，保留其最稀有系列定位。

## 異宇宙10階門檻與名稱

唯一資料來源是 `alternateuniversedata.js` 的 `ALTERNATE_UNIVERSE_TITLE_ROWS`：

```text
100  層域：異界凌越
200  層域：萬界破境
300  層域：異律掌御
400  層域：諸宇錯序
500  層域：萬律凌駕
600  層域：諸界超脫
700  層域：萬宇無疆
800  層域：諸界歸一
900  層域：宇外凌絕
1000 層域：宇外無極
```

稱號 owner 依 `depthThreshold` 判定，不再維護 `deepest/100` 第二套推導。

## 取得／補發／永久性

- 正式越過門檻時可一次補齊跨過的多階稱號。
- 若一次跨多階，只把**最高新階**設成 `pendingNotice`。
- 舊存檔 normalization 會依正式 deepestCleared **靜默補發**應有 AU 稱號，不建立 pending notice。
- 已取得 AU 稱號是永久榮譽；之後 deepestCleared 降低也不回收 `unlocked`、`equipped`、`pendingNotice`。
- 正式轉生保留 AU 稱號、裝備中的稱號與待通知狀態。
- `LAST_PLAYER_TITLE_NORMALIZATION_REPORT` 會記錄 AU backfill IDs。

## 視覺

`playertitlesalternateuniverse.css` 是 AU 稱號專屬視覺 owner，10階各自有正式 selector；風格語義為重疊宇宙／法則干涉／phase displacement，不回到封閉方框。含 600px 與 360px mobile protection。

renderer current：

```text
PLAYER_TITLE_RENDERER_VERSION = 5
PLAYER_TITLE_ALTERNATE_UNIVERSE_RENDERER_VERSION = 1
PLAYER_TITLE_ALTERNATE_UNIVERSE_PRESENTATION_VERSION = 1
```

---

# 8. GM 稱號預覽與異宇宙正式管理

## GM 稱號預覽：只保留單一46稱號選單

`playertitlegmpreview.js` current：

```text
GM_PLAYER_TITLE_PREVIEW_VERSION = 11
GM_PLAYER_TITLE_PREVIEW_ALL_CATALOG_VERSION = 6
GM_PLAYER_TITLE_PREVIEW_CANONICAL_CATALOG_VERSION = 6
GM_PLAYER_TITLE_PREVIEW_DISPLAY_ORDER_VERSION = 4
GM_PLAYER_TITLE_PREVIEW_REDUNDANT_AU_QUICK_RETIRED_VERSION = 1
```

目前 GM 稱號預覽只有既有的**完整46稱號下拉選單**＋實戰名稱預覽。

先前曾新增的「異宇宙 1～10 階快速視覺測試」十顆按鈕已確認與上方下拉重複，已完整退休；相關 integrity 也已改成明確禁止該區塊復活。

GM 稱號預覽是 sandbox：

- 不解鎖正式稱號。
- 不改 equipped。
- 不改 AU deepest。
- 不改正式 save。

## GM 異宇宙正式管理

`gmalternateuniversemanage.js` current：

```text
GM_ALTERNATE_UNIVERSE_MANAGEMENT_VERSION = 4
GM_ALTERNATE_UNIVERSE_CANONICAL_MUTATION_VERSION = 3
GM_ALTERNATE_UNIVERSE_TRANSACTION_VERSION = 1
GM_ALTERNATE_UNIVERSE_FORMAL_SNAPSHOT_OWNER_VERSION = 2
GM_ALTERNATE_UNIVERSE_TITLE_SYNC_VERSION = 2
GM_ALTERNATE_UNIVERSE_TITLE_THRESHOLD_OWNER_VERSION = 1
```

正式管理只設定「最深已完成層域」：

- 正數 progress 會維持／建立 AU unlock。
- 同一 shared transaction 內同步補發達標 AU 稱號。
- 降低 progress 不回收已取得 AU 稱號。
- 調整 formal frontier 會清 activeAttempt 與 current-life failures。
- 0 不會把已解鎖 AU 自動鎖回。
- UI 會顯示目前稱號、下一稱號與門檻。

---

# 9. 鏡像戰：正式 settlement 與 GM 裁定收斂

`mirrordungeonstate.js` current：

```text
MIRROR_DUNGEON_STATE_VERSION = 3
MIRROR_DUNGEON_SETTLEMENT_OWNER_VERSION = 1
MIRROR_MIRACLE_DATE_DEDUP_VERSION = 1
```

玩家正式鏡像戰完成統一走：

```js
settleMirrorDungeonResult(...)
```

該 owner 同時負責：

- daily 結束狀態。
- history bestWins／bestDate。
- 15～20勝稱號 settlement。
- 20勝神蹟日期。
- miracleDates 去重。

舊存檔若有重複神蹟日期，normalization 會去重並由 migration diagnostics 回報移除數量。

## GM 正式鏡像戰結果

`mirrordungeongm.js`：

```text
GM_MIRROR_FORMAL_RESULT_VERSION = 2
GM_MIRROR_FORMAL_MIN_WINS = 15
```

GM 正式裁定：

- 只接受 **15～20勝**。
- 只允許提升歷史最高，不能降。
- 直接委派給 `settleMirrorDungeonResult(..., {requireRunning:false, requireUpgrade:true})`。
- 同步正式歷史與稱號。
- 20勝同步神蹟紀錄。
- 不補發 VIP 積分。
- 鏡像戰正在進行時不得介入正式結果。

GM 副本管理頁已正式接入 15～20 勝裁定按鈕。

---

# 10. 第三紀元副本 access 收斂

第三紀元副本紀元規則唯一 owner 是：

```text
thirdworlddungeonui.js
THIRD_WORLD_DUNGEON_ERA_POLICY_OWNER = "thirdworlddungeonui"
```

current：

```text
THIRD_WORLD_DUNGEON_UI_VERSION = 7
DUNGEON_MODE_AVAILABILITY_POLICY_VERSION = 5
THIRD_WORLD_DUNGEON_BOUNTY_HIDDEN_VERSION = 2
```

`reincarnationdungeonaccess.js` current：

```text
REINCARNATION_DUNGEON_ACCESS_VERSION = 4
REINCARNATION_DUNGEON_ERA_RESTRICTION_VERSION = 2
REINCARNATION_DUNGEON_ERA_POLICY_DELEGATION_VERSION = 1
REINCARNATION_DUNGEON_ACCESS_SNAPSHOT_VERSION = 2
```

access 已正式拆成兩層：

1. **qualification**：等級或「轉生後永久入口資格」。
2. **era availability**：目前紀元是否允許該副本。

snapshot 明確提供：

```text
permanentUnlocked
levelUnlocked
qualificationUnlocked
eraVisible
eraEnabled
eraAllowed
effectiveEnabled
unlocked = effectiveEnabled
```

因此「第一次轉生後永久入口」只代表 qualification 永久成立，**不能繞過紀元禁用**。

最重要的 current 規則：

> **高維紀元懸賞戰仍關閉。即使玩家已轉生、permanentUnlocked=true，W3 仍必須 eraAllowed=false、effectiveEnabled=false、visible=false、enabled=false。**

Arena／Void／Mirror 依各自 current era policy，不可把「永久入口」誤解成所有紀元無條件可用。

---

# 11. W3 重征服／settlement continuation 最新規則

W3 rerun 仍只對 `count>0` 生效；首輪不吃 rerun bypass。

`thirdworldprogress.js` current：

```text
THIRD_WORLD_PROGRESS_VERSION = 7
THIRD_WORLD_SETTLEMENT_VERSION = 5
THIRD_WORLD_STAGE_CROSSING_SETTLEMENT_VERSION = 2
THIRD_WORLD_REINCARNATION_STAGE_CONTINUATION_VERSION = 2
THIRD_WORLD_REINCARNATION_PROGRESS_EVENT_CONTINUATION_VERSION = 1
THIRD_WORLD_CONTINUATION_DECISION_VERSION = 2
```

正式 rerun policy 由 reincarnation lifecycle 的 `worldRerunPolicy` 提供；owner 缺失時 fail closed。

rerun current 行為：

- 仍解除首輪 5% 戰線限制。
- Boss HP／能力／phase／永久 HP settlement 不變。
- rerun 中跨 boss stage 時，不再因首輪能力解鎖 stage transition 強制中斷連續戰鬥。
- rerun 中 title/story aggregate progress event 可 bypass presentation stop，不重複把已完成首輪流程當成必要停點。
- **Boss 正式擊破仍是 terminal reason，不能被 rerun continuation 吃掉。**
- 首輪仍保留正常 title/story/stage event presentation。

新增 regression 鎖住：stage crossing、progress event、boss defeat、5% front 與正式 settlement 的順序不可倒退。

---

# 12. 災厄／戰鬥入口 transient UI 收斂

近期 UI 優化把戰鬥入口 viewport reset 收斂成共用 owner：

```js
resetBattleEntryViewport()
```

銀河文明災厄與宇宙文明災厄進戰鬥後共用該 owner，不再各自維護不同 scroll reset。

宇宙文明災厄 current：

```text
SECOND_WORLD_CALAMITY_UI_VERSION = 7
SECOND_WORLD_CALAMITY_BATTLE_ENTRY_SCROLL_RESET_VERSION = 2
SECOND_WORLD_CALAMITY_UI_TRANSIENT_STATE_VERSION = 1
SECOND_WORLD_CALAMITY_LIVE_PRESENTATION_VERSION = 1
SECOND_WORLD_CALAMITY_MINIMAL_MODE_VERSION = 3
```

transient UI lifecycle 已收斂，live／minimal mode 完成後同步正式畫面，不把 UI 暫態資料寫進 formal save。

第一紀元特殊遭遇也已接入共用 Fast Catch-up presentation policy：

```text
SPECIAL_ENCOUNTER_FAST_CATCH_UP_PRESENTATION_VERSION = 1
SPECIAL_ENCOUNTER_W1_EXPLICIT_TARGET_VERSION = 1
SPECIAL_ENCOUNTER_THIRD_WORLD_GUARD_VERSION = 1
```

---

# 13. Batch5／6／7 仍有效基準

## Batch5 rerun

- W1/W2/W3 轉生後重征服完成。
- W1/W2 高階 Boss 勝利正式向下回填前段主線。
- W3 rerun 只解除5%戰線限制；Boss能力與永久HP settlement維持。

## Batch6 overlevel

`reincarnationoverlevelrewards.js`：

```text
M = 1 + 0.03 × (enemyLevel - playerLevel)
```

只在 `count>0 && enemyLevel>playerLevel`；整數收益 `ceil(base × M)`；無 hard cap；裝備出售排除；W3 Offline 不接。

## Batch6 批次成長

`playerbatchupgrades.js`：

- W1 一鍵平均專精。
- W1/W2 平均最大強化。
- 共用正式成本與 shared transaction。
- W3 不提供。

## Batch6 Offline provenance

`OFFLINE_BATTLE_SAMPLE_VERSION = 4`；只有可靠 player/enemy level provenance 才可吃 overlevel；舊不可靠 sample／pending 固定1×。

## Batch7 GM

- GM 正式突破管理 only count>0。
- 角色能力測試突破是 sandbox，不污染 save。
- AU benchmark 是戰力基準第8模式。
- 21 trait diagnostics 不暴露成 GM 操作面板。
- multi-life closure 鎖定 milestone、AU deepest、Offline reset、Arena reset、Mirror/Void history、永久副本資格、overlevel、sandbox 隔離。

---

# 14. GM 正式寫入／授權／lazy runtime

## GM formal transaction

`gmformaltransaction.js` 的 formal GM mutation 仍以 shared `runSettlementTransaction()` 為唯一正式交易 owner；缺失時 fail closed。GM 正式印記修改已走 `gmCommitFormalMarkMutation()`，不得回到 direct `state → save()`。

## GM browser-local authorization

正式 startup owner 是 `gmruntimeauthorization.js`：

```text
GM_RUNTIME_AUTHORIZATION_CORE_VERSION = 1
GM_RUNTIME_AUTHORIZATION_VERSION = 2
GM_RUNTIME_EARLY_RESTORE_VERSION = 2
GM_RUNTIME_SAVE_BOUNDARY_VERSION = 2
GM_RUNTIME_LEGACY_RECONCILE_VERSION = 1
scope = browser-local-runtime
key = civilization-war-gm-authorized-v1
```

啟動流程：

```text
load()
→ normalizeCurrentSaveState()
→ gmReconcileRuntimeAuthorizationAfterLoad(state)
→ 原啟動 save(false)
→ 第一次 render()
```

因此已授權裝置在**第一次 main render 前**就恢復 `state.gm=true`。未授權但舊 save 殘留 `gm:true` 時只做 in-memory reconcile，再由原啟動 save 順手清乾淨；已移除舊 `stripLegacySaveAuthorization()+額外 save` 路徑。

正式 save boundary 仍使用 hook ID `gm-runtime-authorization-v1`：save 前暫時剝離 runtime `state.gm`，settlement 後恢復；GM authorization 不進正式角色 save／Cloud Save。

## Deferred GM group

`scriptgrouploader.js`：

```text
SCRIPT_GROUP_LOADER_VERSION = 1
SCRIPT_GROUP_ACTIVATION_POLICY_VERSION = 3
SCRIPT_GROUP_LOAD_BEHAVIOR_VERSION = 4
GM_AUTHORIZED_GROUP_RETRY_VERSION = 1
```

完整 GM Hub／benchmark／管理工具維持 deferred，不提前載全部 GM scripts。已授權恢復與首次密碼通過都共用 `ensureAuthorizedGmRuntime({retry:true})`；GM group 首次載入失敗會在 250ms 後 bounded retry 一次。即使兩次載入都失敗，也不把既有 browser-local authorization 誤判為失效。

## 背景戰鬥／主線鎖血／GM 倍速

早期常駐 owner：`gmdevicepreferences.js`

```text
GM_RUNTIME_DEVICE_PREFERENCE_CORE_VERSION = 2
GM_RUNTIME_DEVICE_PREFERENCE_AUTH_SYNC_VERSION = 2
GM_RUNTIME_DEVICE_PREFERENCE_ACCOUNT_RECONCILE_VERSION = 1
GM_DEVICE_BOOLEAN_PREFERENCE_VERSION = 2
```

它正式擁有背景戰鬥與主線鎖血 storage key／gate／semantic setter：

```text
civilization_frontline_gm_background_battle_v1_<userId>
civilization_frontline_gm_mainline_hp_lock_v1_<userId>
```

`gmbackground.js` 只保留 GM 管理 UI，不得再知道上述 key；寫入必須委派 `gmSetBackgroundBattlePreference()`／`gmSetMainlineHpLockPreference()`。

`combatspeed.js` 的帳號型 GM override key 維持：

```text
civilization_frontline_gm_combat_speed_v1_<userId>
```

且 `COMBAT_SPEED_GM_AUTH_SYNC_VERSION = 2`。收到 `civilization-auth-ready` 後會立刻恢復目前帳號的 background／HP-lock／GM speed；同帳號同值的重複 auth-ready 由 signature 去重，不重複廣播。帳號切換時若新帳號 background=false，而舊帳號仍有 active background flow，會立即呼叫共享 `backgroundProgressStop()`。

GM authorization 本身仍是**裝置 browser-local**，不是 account-scoped；背景戰鬥／主線鎖血／GM speed 才是 account-scoped。除非使用者重新決策，不要自行改成帳號型授權。

---

# 15. 三紀元角色／裝備 semantics

`playersemanticsui.js`：

```text
PLAYER_SEMANTICS_UI_VERSION = 15
CHARACTER_WORLD_SNAPSHOT_CANONICAL_PHASE_VERSION = 1
CHARACTER_WORLD_SNAPSHOT_OWNER = "playersemanticsui"
```

`characterWorldSnapshot()` 優先用 `currentWorldPhase()`：

```text
W1 → world=1 / 銀河紀元 / cap=500
W2 → world=2 / 宇宙紀元 / cap=1000
W3 → world=3 / 高維紀元 / cap=2000
```

裝備來源共用 `sharedEquipmentWorld(item)`；不要回到「是否 entered secondWorld」二分法。

---

# 16. 第一紀元強化正式成本

`enhancementcore.js`：

```text
FIRST_WORLD_ENHANCEMENT_CAP = 20
SECOND_WORLD_ENHANCEMENT_CAP = 40
BONUS_PERCENT_PER_LEVEL = 2.5
BASIC_COST_PER_TARGET_LEVEL = 25
ADVANCED_COST_PER_TARGET_LEVEL = 5
```

W1 +1～+20 單次：

```text
基礎強化石 = 25 × 目標強化等級
進階強化石 = 5 × 目標強化等級
```

單部位 +0→+20：

```text
基礎 5,250
進階 1,050
```

五部位：

```text
基礎 26,250
進階 5,250
```

不要自行改回舊的 50×target。

---

# 17. 第一紀元 Target Context

正式鏈路：

```text
UI / selection
→ prepare Target Context
→ encounter
→ battle context lock
→ combat
→ special / continuous / Fast Catch-up
→ settlement / progression / offline sample
```

核心 identity：

```text
world=1
mapIndex
enemyIndex
mode=formal / rerun / review
lifeId
reincarnation count
```

hard rules：

- `selectedMap / selectedEnemy` 只作 UI/navigation。
- post-prepare 不回頭用 selection reconstruction target。
- validator／lifecycle owner 缺失 fail closed。
- stale／identity／life/count mismatch fail closed。
- review 不給 formal rewards/progress。
- rerun 無合法 prepared target → `prepared-target-required`。
- Special Encounter 吃 explicit parent context。
- W1 Offline persisted identity 轉 canonical Target Context。
- Boss 不進 W1 offline sample。

---

# 18. Code Cleanup Batch1～8

全部完成。

核心邊界：

- legacy Schema1～17 支援保留。
- legacy cleanup 只屬 migration owner。
- Story／GM／Integrity lazy-loading boundary 保留。
- `docs/archive/` 只供歷史追溯。
- runtime API／compatibility owner／save hook owner 已收斂，不再新增同責任 second owner。

---

# 19. Schema17 舊檔相容矩陣與近期四批封箱（2026-10-07）

`tests/runtime/save-schema17-compatibility-matrix.js` 已加入以下正式 regression：

## 舊36稱號 catalog → AU稱號擴充

模擬舊 catalog：

```text
銀河10 + 宇宙10 + 高維10 + 鏡像6 = 36
```

若舊存檔 AU deepest=850：

- 舊36稱號完整保留。
- 靜默補發 AU 前8階。
- 總數 = 44。
- 已裝備 `mirror_title_19` 保留。
- `pendingNotice=mirror_title_20` 保留。
- 鏡像20勝歷史保留。
- migration diagnostics 回報補發8個 AU 稱號。

## AU 永久榮譽舊檔

即使現在 deepestCleared 比過去低，已取得／已裝備／pending AU 稱號不回收。

## W3 rerun 懸賞戰

Schema17 轉生角色即使：

```text
permanentUnlocked = true
qualificationUnlocked = true
```

W3 仍必須：

```text
eraAllowed = false
effectiveEnabled = false
unlocked = false
visible = false
enabled = false
```

## 鏡像 history repair

重複 miracleDates 會去重，migration diagnostics 會回報修復與移除數量。

## Recent optimization Batch4 closure

新增：

```text
tests/runtime/recent-optimization-batch4-closure.js
```

永久鎖定：

- W3 era policy 單一 owner。
- dungeon qualification／era availability 分離。
- 玩家／GM 鏡像共用 canonical settlement。
- miracleDates 去重。
- GM鏡像15～20勝範圍。
- AU title threshold data owner。
- migration diagnostics。
- Schema17 不升版。
- 第4批 old-save matrix 不得被移除。

該 closure 已加入 Runtime Integrity 並於 exact HEAD #2073 實際通過。

---

# 20. Runtime／Integrity current baseline

`.github/workflows/runtime-integrity.yml` current 涵蓋：

- 全 JS syntax／owner integrity。
- 真實 Chromium browser smoke。
- Save/global writer/new-state/load pipeline。
- Schema17 compatibility matrix。
- AU／稱號／鏡像／W3 access／Target Context／轉生／突破／GM sandbox 等既有 closure。
- 災厄 shared terminal Fast Catch-up、formal-vs-GM regression 與 GM result-context。
- `tests/runtime/gm-runtime-early-restore-integrity.js`。
- `tests/runtime/gm-runtime-auth-preferences-integrity.js`。
- Playwright `tests/runtime/gm-first-render-browser.js`，直接驗證 browser-local GM authorization 在 `#main` 第一次 render 時已恢復。
- GM mainline HP lock／runtime preference owner regression。

本次 handoff 更新前 gameplay HEAD：

```text
d1cd0a4a5becf753cbd45beb578236780822a1cc
```

查詢該 exact HEAD 時 combined status／workflow runs 為空集合，故本檔**不宣稱 current HEAD Runtime／Story／Pages 已 success**。歷史 success 可供追溯，但下一次修改後必須重新查看新的 exact HEAD Actions。

---

# 21. current owner 索引

## World／Player semantics
`worldphase.js`、`thirdworldphase.js`、`levelprogression.js`、`playersemanticsui.js`、`equipmentrewardcore.js`。

## Reincarnation／Breakthrough
`reincarnationstate.js`、`reincarnationcore.js`、`breakthroughcore.js`、`reincarnationui.js`、`reincarnationrerunworld1.js`、`reincarnationrerunworld2.js`、`reincarnationrerunworld3.js`、`reincarnationrerunprogress.js`、`reincarnationoverlevelrewards.js`、`reincarnationdungeonaccess.js`、`reincarnationpermanentgearguard.js`。

## W3 progression／dungeon
`thirdworldprogress.js`、`thirdworlddungeonui.js`、`thirdworldarena.js`、`thirdworldarenaui.js`。

## First World Target Context
`firstworldtargetcontext.js`、`battlepipeline.js`、`firstworldtargetcontextbatch4.js`、`firstworldtargetcontextbatch5.js`、`firstworldtargetcontextbatch6.js`、`specialencounter.js`、`offlineprogress.js`、`offlinestatecore.js`。

## Enhancement
`enhancementcore.js`、`enhancementui.js`、`enhancementrewards.js`、`enhancementcombat.js`、`playerbatchupgrades.js`、`enhancementintegrity.js`。

## Alternate Universe
`alternateuniversedata.js`、`alternateuniverseattempt.js`、`alternateuniversecombat.js`、`alternateuniverseprogression.js`、`alternateuniverseaccess.js`、`alternateuniverseui.js`、`traits.js`。

## Player titles
`playertitlecore.js`、`playertitlerenderer.js`、`playertitleui.js`、`playertitleintegrity.js`、`playertitlesalternateuniverse.css`、`playertitlesmirror.css`、`playertitleshigherdimensional.css`。

## Mirror
`mirrorconfig.js`、`mirrordungeonstate.js`、`mirrorcombatcore.js`、`mirrordungeongm.js`。

## Save／Offline／Runtime
`savemigration.js`、`saveversionguard.js`、`savehookcore.js`、`settlementtransaction.js`、`compatibilityowners.js`、`runtimeapi.js`、`gmruntimeauthorization.js`、`scriptgrouploader.js`、`gmdevicepreferences.js`、`combatspeed.js`、`backgroundprogress.js`、`offlinestatecore.js`、`offlinefarmtarget.js`、`offlineprogress.js`、`offlineworld3adapter.js`。

## Story／三紀元轉生後歷史
`reincarnationstate.js`（唯一轉生 context）、`storymigration.js`（舊 ID、待播資料安全）、`storyprogress.js`（首輪正式劇情／轉生不重播）、`storyrecordtabs.js`（唯讀歷史 UI）、`secondworldstoryregistry.js`（宇宙／高維 registry）、`thirdworldphase.js`（轉生後十王通關 owner）、`thirdworldprogress.js`（正式 HP／通關同交易）。

## 兩紀元文明災厄／背景連戰
`calamitycore.js`、`calamityrun.js`、`calamityui.js`、`secondworldcalamityrun.js`、`secondworldcalamityui.js`、`backgroundprogress.js`（共用 presentation／UI policy 與 Fast Catch-up）及 `tests/runtime/calamity-*.js`。

## GM
`gmhub.js`、`gmhubextensions.js`、`gmformaltransaction.js`、`gmbreakthroughmanage.js`、`gmalternateuniversemanage.js`、`playertitlegmpreview.js`、`mirrordungeongm.js`、`gmpowerbenchmark.js`、`gmpowerbenchmarkstate.js`、`gmpowerbenchmarkworldphase.js`、`gmalternateuniversebenchmark.js`、`vipgm.js`、`thirdworldarenagm.js`、`gmbatch16formalcontrols.js`、`calamitygm.js`、`secondworldcalamitygm.js`；GM runtime authorization／preferences 則分別由 `gmruntimeauthorization.js`、`gmdevicepreferences.js`、`combatspeed.js` 擁有。

---

# 22. 重要 bug 修正／防倒退規則

1. 永久 W3 裝備只依 evidence 修復，ambiguous item 不猜。
2. GM formal mutation 共用 shared transaction，不回復 direct `state→save()` 第二 owner。
3. GM lazy-load rejected promise 必須可 retry。
4. GM authorization 不得污染 formal save。
5. Schema1～17 歷史 GM test transient keys 全部 migration 清除。
6. W3 character snapshot 不得再誤判 W2。
7. W1 Target Drift：戰鬥開始後 UI selection 不得改 active target。
8. Target Context validator 缺失必須 fail closed。
9. review 不得污染 formal progression。
10. rerun post-prepare 禁止回讀 selection。
11. W1 基礎強化成本維持 25×target。
12. W3 rerun stage/progress event continuation 不得把「Boss正式擊破」當成可 bypass 的中間事件。
13. 轉生永久副本資格不得重開 W3 懸賞戰。
14. GM 鏡像正式裁定不得建立自己的 history/title 結算。
15. mirror miracleDates 必須去重。
16. AU 稱號門檻不得重新寫 `deepest/100`。
17. AU 稱號已取得後不得因 progress 降低或轉生回收。
18. GM 稱號預覽不得復活第二套 AU 1～10 快速按鈕。
19. 鏡像稱號必須保持 catalog 最後一組。
20. migration／runtime-only diagnostics 不得因此升 Schema18。
21. 轉生後 W1／W2／W3 歷史直接開放戰線紀錄，**不補寫 completedStories**、不自動 queue／播放正式劇情。
22. 轉生後 W3 十王通關只能由正式 W3 phase／settlement owner 判定，不因歷史 Final 設 `thirdWorld.completed`；首輪維持舊正式劇情完成契約。
23. Story group 尚未 ready，不可清理尚未完整載入的合法歷史；舊 W3 content migration 應保護 rerun 已完成的11篇。
24. 兩紀元災厄 terminal 最多一次正常 checkpoint，跳過 checkpoint 的終止場必補存；W1 正式存檔失敗回報須保留補存，W2 正式存檔回復快照不可取消。
25. 災厄最後一場 headless Fast Catch-up 不多等待 structured duration；兩 UI 決策共用既有 `backgroundprogress.js`，不可退回各自重複公式。
26. 銀河災厄正式戰鬥必須使用 formal final-damage owner；GM 與正式同條件 regression 不得另寫第二套倍率。
27. GM 災厄完整擊殺模擬連續100場零傷害時必須 no-progress 提前停止，不可空轉到100,000場。
28. GM browser-local authorization 必須在第一次 main render 前 reconcile；不得重新引入 deferred loader 後才恢復的時序。
29. 已授權 runtime `state.gm=true` 不得被當成 legacy save flag 再清除／額外 save。
30. 背景戰鬥／主線鎖血 storage key 只能由 `gmdevicepreferences.js` 擁有；`gmbackground.js` 只作 UI delegate。
31. 同帳號同值的重複 `civilization-auth-ready` 不得重複廣播 GM preference／speed；切換到 background=false 的帳號必須停止既有 active background flow。
32. 首次輸入 GM 密碼與既有授權恢復必須共用 `ensureAuthorizedGmRuntime({retry:true})`，不要再維護第二套 group load。

---

# 23. 明確不要自行復活／擴充

1. 不把 AU 做成 Lv2001+ 或第四紀元。
2. 不讓 AU 敵人依玩家突破 dynamic scaling。
3. 不新增 AU 刷裝貨幣／資源收益。
4. 不要求轉生後重看已讀劇情。
5. 不取消 Lv500／Lv1000 紀元邊界與養成條件。
6. 不讓裝備出售收益吃 overlevel。
7. 不復活 AU replay/review。
8. 不讓 UI／GM 自行維護可衍生 lifeId／lock 等第二套狀態。
9. 不重做第二套 final damage、transaction、save backup、combat、offline、progression、target、world semantics owner。
10. 不恢復高階 Boss 只記自身、不正式回填前段主線的舊規則。
11. 不把四副本永久入口誤做成全部 Arena rank 永久全開或 W3 bounty 永久可用。
12. 首輪 `count=0` 不可吃 rerun backfill、Story bypass、W3 5% bypass、overlevel 或突破。
13. 不把21 trait diagnostics塞進 GM 操作介面。
14. 不把戰力基準退回7模式；current正式為8模式。
15. 不讓 W1 battle execution 回頭用 `selectedMap / selectedEnemy` fallback。
16. 不把舊 GM transient test state 重新寫進 formal save。
17. 不因 migration cleanup、runtime-only snapshot、GM runtime auth、AU titles 而升 Schema18。
18. 不把 W1 基礎強化石成本改回 50×target，除非使用者重新做平衡決策。
19. 不復活 GM 稱號預覽「異宇宙1～10階快速視覺測試」按鈕區。
20. 不把 AU 稱號門檻 hardcode 成另一份 100倍數公式；正式資料只看 `depthThreshold`。
21. 不讓 reincarnation permanent qualification 覆蓋 `thirdworlddungeonui` 的 era policy。
22. 不讓 GM mirror 直接改 history/titles；必須委派 canonical settlement。

---

# 24. 目前尚未完成項目

目前**沒有使用者已核准但尚未施工的工程批次**。

本次對話已完成：銀河災厄 HP 砍半、突破 final-damage 正式／GM 收斂、GM testContext/result snapshot、正式印記 transaction、印記 progress canonical、GM transient cleanup V3、災厄 no-progress、formal-vs-GM parity，以及 GM authorization／first-render／auth-ready preference／帳號切換／retry owner 收斂。

先前檢查曾提出仍可考慮的低優先 GM 載入整理（例如 deferred GM group 的 runtime readiness contract、共用 current-user-id helper、localStorage 非法值 canonical cleanup、false key remove policy），**都尚未經使用者下令施工，不能視為既定待辦**。若下一個對話要處理，必須 fresh-read current main 後重新評估。

現階段仍屬正式遊玩、轉生、GM 工具與平衡實測期。若使用者提出新功能、新平衡、新 UI 或重構，先依第1節規範重新讀 main，再建立施工範圍。

---

## 2026-10-07 劇情／轉生隔離：第1批已完成

- `storyrecordtabs.js` 在正式 `storyReincarnationContext(state).reincarnationRun===true` 時，用「現已進入的紀元」與正式 Story catalog **唯讀推導**戰線紀錄：銀河101、宇宙100、高維11；同時保留既有 completed 歷史。
- 不寫 `storyProgress.completedStories`、不寫 `pendingStory`、不改 `thirdWorld.story`、`thirdWorld.completed`，也不觸發 `completeStory()` 或任何 formal progress；回顧使用 generic `openStory`、沒有 onComplete callback。
- 首輪 `count=0` 仍按既有已完成紀錄顯示。正式故事資料尚未就緒時，不把缺少 pages 的新回顧條目提前加入。
- 第1批僅處理**紀錄顯示與回顧**；第一、二紀元轉生後的正式劇情排隊／播放與舊 pending 清理由第2批完成；高維自動 queue、Final 與本輪完成完全隔離由第3批完成。
- 新增 `tests/story/record.js` 的 count 0／1／2／3、101／100／11、未入世界不提前開放、唯讀、高維 Final generic replay 驗證；`index.html` 更新 cache-bust。


## 2026-10-07 劇情／轉生隔離：第2批已完成

- `storyprogress.js` 接入正式 `storyReincarnationContext(target)` 生命週期 owner，新增 `STORY_REINCARNATION_W1_W2_SUPPRESSION_VERSION=1`，由同一個 `suppressRerunStory()` 判定銀河／宇宙故事是否停止 formal queue。
- 轉生 `count>=1` 後，W1 `queueBossStory()` 與 W2 `queueUniverseBossStory()` 不再建立 `pendingStory`／播放；首輪 `count=0` 維持原有首殺 Story 流程。
- 宇宙 `settleSecondWorldBossVictory` 仍執行原正式 Boss 結算，但轉生輪不再追加劇情排隊；宇宙 `startSecondWorldBossContinuous` 不再因首殺劇情強制改為單場。
- Story Progress normalization 清理轉生輪已辨識的 W1/W2 舊 `pendingStory`，不補寫 `completedStories`、不呼叫 `completeStory`、不發通知；W3 pending 清理由後續第3批實作並已完成。轉生輪停止依本輪 W1 Boss 擊殺補寫 Story history，由唯讀戰線紀錄顯示。
- `resume()` 的 W1 序章強制播放只對首輪執行；保留配裝等其他原有流程。W3 pending 在尚未進 W3 時不於低紀元提前顯示。
- 新增 `tests/story/reincarnation-trigger-batch2.js`（count 0／1／2／3／7、首輪保留、W1/W2 首殺及 W2 連戰、舊 pending、安全保留既有銀河序章；第3批後 W3 pending 同樣清除）；加入 Story Integrity CI；`index.html` cache-bust 已更新。Save Schema 仍為17。
- **此段為第2批施工沿革；第3／4批均已完成，不存在待做的 W3 pending／closure。**


## 2026-10-07 劇情／轉生隔離：第3批已完成

- 仍用 `storyprogress.js` 正式 Story Progress owner 與既有 `storyReincarnationContext()`，`STORY_REINCARNATION_W3_ISOLATION_VERSION=1`；不新增 persistent story 欄位、第二套進度 owner 或 Schema18。
- 轉生 `count>=1` 時，11篇 W3 正式劇情僅由第1批 `storyrecordtabs.js` 以唯讀方式提供回顧；`queueStory()`／`setPending()`／`completeStory()`／`queueThirdWorldEligibleStory()`／`drainThirdWorldPostFlowStories()`／`consumeThirdWorldSettlement()` 均不再建立／播出 W3 正式劇情，也不會藉高維 Final 的故事歷史污染本輪完成判定。
- Story Progress normalization 會清理轉生輪已辨識 W3 舊 `pendingStory`，但保留既有 `completedStories` 永久歷史；首輪仍保留原 W3 順序隊列、序章／階段／Final 正式完成與原結算。
- 轉生輪 `thirdWorld.story.introSeen=false`、`thirdWorld.story.finalSeen=false` 表示**本輪不重新播放**，不能從永久故事歷史推導；`thirdWorld.completed` **只由本輪10名高維存在正式血量全歸零**推導，並由後續優化移至 `thirdworldphase.js` 正式 owner、於 `thirdworldprogress.js` 正式戰鬥 transaction 同步落帳；即使 `story.unlockedStage` 因舊檔落後也不阻擋 Boss 完成判定。不得用 `completedStories` 的歷史 Final 當成本輪通關條件。
- 高維10王、永久血量、維度之弦／核心、突破／轉生資格與正式戰鬥公式未改動。轉生輪達到本輪十王全滅時 `thirdWorld.completed` 可正常成立，但 `finalSeen` 仍不被冒充為重播過 Final。
- 新增 `tests/story/reincarnation-higher-dimensional-batch3.js`：首輪流程、轉生1／2／3／7次、歷史11篇全保留、舊 W3 pending 清理、W3 queue／drain／formal completeStory 阻擋、Boss 未打與全部打完的區別、Final gate 不得繞過、零自動播放及無額外 Story save；加入 Story Integrity CI。生產 JS cache-bust 已更新。
- **第4批三紀元舊檔、跨紀元與重新載入回歸已完成並納入 Story／Runtime Integrity。**



## 2026-10-07 劇情／轉生隔離：第4批整體封箱已完成

- 新增 `tests/story/reincarnation-three-era-batch4-closure.js`，以正式 `storymigration.js`、`storyprogress.js`、`storyrecordtabs.js` 三個 owner 組成實際 VM 整合測試；不是只比對字串。
- 覆蓋首輪 count=0 與轉生 count=1／2／3／8：在轉生後不打 Boss，銀河101篇、宇宙100篇、高維11篇在進入對應紀元後即由唯讀戰線紀錄開放；首輪 W3 未完成故事仍鎖定且可照原規則 queue。
- 模擬 Schema17 既有欄位結構與 JSON 存檔／重新載入：W1/W2/W3 舊 `pendingStory` 清理、Story resume／reload 不自動播放、切換紀元後回顧前紀元仍有效、`completedStories` 永久歷史不被覆寫、不額外產生 Story formal save。
- 高維 Final 只以 `generic` 生命周期由戰線紀錄回顧，沒有 `onComplete`；未擊敗本輪10王時 `thirdWorld.completed=false`，十王全滅時即使 `story.unlockedStage=0` 也完成正式戰鬥判定，且不設定 `finalSeen`、不自動 queue Final。
- 宇宙首殺不再迫使轉生後連戰切為單場；正式 Boss settlement 照常運作，Story 只是紀錄展示，不干預養成、戰鬥、世界進入與轉生資格。
- 封箱 regression 已加入 `.github/workflows/story-integrity.yml` 與 `.github/workflows/runtime-integrity.yml`（Schema17相容矩陣後執行），避免後續非 Story 程式修改造成倒退。
- 本批只動測試、CI 與本交接檔；前3批 production 行為已由 latest main 確認，不需重改；沒有修改正式 Boss/Story/Save JS、不需 index cache-bust，Save Schema 仍為17。
- 注意：`PROJECT_HANDOFF.md` 為狀態索引，不取代 current `main` 正式 owner；後續改動仍需 fresh-read 並核對 exact HEAD Actions。


## 2026-10-07 劇情／災厄檢查後優化：第1批（項目1、2、7、9）

- **劇情 reference 資料安全：** `storymigration.js` 的 `normalizeFields()` 僅在正式 Story group 已回報 `ready` 時清理已退休的 `completedStories`／`pendingStory` ID；部分延遲載入的 catalog 不再被誤當成完整目錄。非 browser 的 VM 測試仍可透過 `catalogReady` 指定判定；未建立 Script Group Loader 的舊測試 harness 維持兼容。
- **舊版高維歷史：** 當 `thirdWorldContentVersion<1` 且玩家已轉生，migration 會用正式高維11篇 trigger descriptor 保留合法的歷史 completed ID；只清理退休 W3 ID／舊 pending。若正式 descriptor 尚未完整就緒，延後版本遷移，不先刪除也不先將 content version 標為最新。首輪 `count=0` 的舊開發版 W3 歷史重建政策維持原樣。
- **轉生高維正式完成 owner：** `thirdworldphase.js` 新增 `reconcileThirdWorldRerunCombatCompletion()`，由正式 W3 phase normalizer 和 `thirdworldprogress.js` 的共用 `runSettlementTransaction` mutation 內呼叫，以本輪10名高維存在永久 HP 全歸零更新 `thirdWorld.completed`，與本輪 HP 結算原子落帳。Story Progress 不再直接寫入或觸發轉生輪 `completed`，僅對 `introSeen/finalSeen` 遵循不重播政策。首輪 Final 正式流程不變。
- **待播診斷：** `LAST_STORY_PENDING_MIGRATION_REPAIR`、`LAST_STORY_PENDING_RERUN_REPAIR` 僅為 runtime 診斷，分別標記 catalogue-ready 退休 ID 與轉生歷史 Story pending 清理；不新增永久存檔欄位、不升 Schema17。
- **驗證：** 新增 `tests/story/optimization-batch1-history-safety.js`，加入 Story Integrity；更新 W3 Batch3/Batch4 harness 與 legacy/source-owner 合約。正式 JS 修改已更新 `index.html` cache-bust。**災厄 Fast Catch-up、重複存檔及 W2 snapshot 優化均未在本批修改。**


## 2026-10-07 災厄最後一場與轉生劇情工程：第2批優化

- 本批處理既定清單 **3／4／5**：宇宙災厄非 checkpoint 場次避免整份 state 快照、W1/W2 最後一場真正的動態 Fast Catch-up 回歸，以及連戰 terminal 不重複存檔。**未修改**首輪／轉生劇情歸檔、W3 生命週期或既有 Story schema。
- `secondworldcalamityrun.js` 的 `settle()` 只有在 `options.save!==false` 實際進行正式存檔時才 `JSON.stringify(state)` 建立 rollback 快照；需要存檔的場次仍保留完整 `saveAtomic(before)` 與失敗回復。非 checkpoint 場次只更新記憶體中的正式進度，最後終止時強制補一次存檔。
- `calamityrun.js`／`secondworldcalamityrun.js` 的 `finish(reason,{checkpoint})` 在已完成該場 checkpoint 時不重複寫入；原本 `save:false` 且因印記滿級、文明完成、首次稱號、單場或該場末尾手動停止而終止時，改由 `finish()` **只做一次** terminal checkpoint。第一紀元 `calamitycore.js` 會回報 `checkpointSaved`，若正常場次的第一個存檔明確失敗，terminal runner 會補存一次，避免消除重複存檔時損害既有失敗重試能力。非戰鬥停止／錯誤仍保留終止安全存檔。
- 新增 `tests/runtime/calamity-terminal-dynamic-opt-batch2.js`，使用真正的 `backgroundprogress.js` 共用 Fast Catch-up owner 與 W1/W2 正式 run/settle owner，在 VM 中模擬前景、背景回播、最後一場印記滿級／文明完成、初次稱號、手動停止、checkpoint 失敗回復及 save 次數。測試納入 `.github/workflows/runtime-integrity.yml`。
- JS 改動已更新 `index.html` cache-bust。兩紀元仍共用原有戰前 `battlePresentationPlan()`，未修改 UI 內容、戰鬥傷害、30次擊殺或 Save Schema17。
- **施工沿革備註：** 第2批當時沒有改 6／8／10／11／12；這些已在後續第3批完成，不再是待辦。


## 2026-10-07 劇情／災厄檢查後優化：第3批（原清單6、8、10、11、12）

- `storyrecordtabs.js` 的轉生歸檔可見性改為**直接委派** `storyReincarnationContext(state).reincarnationRun`，不再自算轉生 count，與正式 Story owner 一致；未新增持久化狀態。單次 `storyRecordPageHtml()` 重用同一組 `completedIds()` 計算結果，避免 render 內反覆建立 Set；不新增快取。
- 轉生後戰線紀錄文案改為「文明歷史已永久歸檔，可隨時回顧；不播放正式劇情、不給予獎勵，也不影響本輪任何進度。」首輪仍維持原先已完成正式劇情說明。
- `backgroundprogress.js` 既有共用 owner 新增純唯讀 `calamityContinuousUiDecision(policy,ended)`，集中解讀 W1／W2 災厄 UI 的 Fast Catch-up 呈現、刷新、yield 與最後一場略過 structured duration 條件；`calamityui.js` 與 `secondworldcalamityui.js` 使用同一判定，但各自保留原有美術動畫、render、UI、資源與正式結算，不另建第三套 UI runner／wrapper。
- `calamityrun.js`、`secondworldcalamityrun.js` 移除未被呼叫的 **run-local** `catchUpPreviewPolicy()`；保留共用 `backgroundprogress.js` 的 `previewCatchUp()` 公開 API，避免破壞其他 consumer 與 Integrity 契約。
- 新增 `tests/runtime/calamity-shared-ui-policy-opt-batch3.js`，覆蓋普通、Fast 預覽／跳過／刷新、最後一場的 immutable decision 與兩 UI consumer 接線；加入 Runtime Integrity。同步擴增 `tests/story/record.js`，測正式轉生 Context／文案／首輪不受影響。
- JS/CSS cache-bust 在 `index.html` 已更新；Save Schema 維持17，舊資料不需要遷移，永久 Story 紀錄與災厄養成欄位沒有任何新增或清空。本批完成後原清單1～12均已處理或明確保留既有正確機制。


## 2026-10-07 最終功能狀態統整（跨七批正式封箱）

### 一、目前唯一生效的劇情／轉生規則

| 條件 | W1 銀河 | W2 宇宙 | W3 高維 |
|---|---|---|---|
| 首輪（`count=0`） | 101篇依原劇情流程解鎖、播放 | 100篇依 Boss 首殺劇情解鎖、播放 | 序章＋9篇階段＋Final 共11篇依原流程 |
| 轉生（`count>0`） | 轉生完成立即在戰線紀錄開放101篇 | 再入宇宙立即在戰線紀錄開放100篇 | 再入高維立即在戰線紀錄開放11篇 |
| 轉生後正式劇情 | 不排隊、不自動播放、不需打 Boss | 不排隊、不自動播放、首殺不切斷連戰 | 不排隊、不自動播放、不補播 Final |
| 歷史回顧 | `openStory(id,{lifecycleOwner:"generic"})`，純閱讀，不產生正式完成事件 | 同左 | 同左，包含 Final |

- 可回顧的212篇是各紀元進入時由正式 registry／catalog **唯讀衍生**；不得批次向 `completedStories` 寫入212篇，也不得因閱讀觸發獎勵、Boss、災厄、印記、文明、核心、突破、存檔進度改動。首輪的正式 `completedStories` 仍保留其原有意義。
- `storyrecordtabs.js` 以 `storyReincarnationContext()` 判定轉生、單次 render 共用 completed Set；首輪保留原說明，轉生輪顯示「文明歷史已永久歸檔，可隨時回顧；不播放正式劇情、不給予獎勵，也不影響本輪任何進度。」
- W3 轉生輪 `introSeen/finalSeen` 不從舊歷史改寫；正式 `thirdWorld.completed` 由本輪10名高維存在的**永久 HP 全部歸零**決定。owner 是 `thirdworldphase.js` 的 `reconcileThirdWorldRerunCombatCompletion()`；`thirdworldprogress.js` 正式 `runSettlementTransaction` 同筆落帳，載入 normalization 亦由 W3 phase 調和。**Story Progress 不得回頭擁有通關寫入。**
- `storyprogress.js` 統一阻擋轉生後三紀元 `queueStory`、`setPending`、`completeStory`、W3 eligible/drain 及 W2 首殺 queue；無法用直接 API 呼叫繞過。正常首輪／配裝／世界進入條件不變。

### 二、舊存檔與 Story migration 安全邊界

- **Save Schema17** 不升版，不新增永久解鎖欄位。首輪／轉生輪皆保留合法的 `completedStories`；轉生輪載入時清除 W1／W2／W3 舊正式 `pendingStory`，避免重播。
- `storymigration.js` 只在正式延遲 Story group 回報 `ready` 後執行未知 ID 清理；目錄部分載入時不能刪合法歷史。對 `thirdWorldContentVersion<1` 的 rerun 舊存檔，以正式11篇 trigger descriptor 保留合法 W3 已完成紀錄、處理退休 ID；descriptor 尚未完整時延後版本遷移。首輪舊開發版 W3 migration 路線保留。
- `LAST_STORY_PENDING_MIGRATION_REPAIR` 與 `LAST_STORY_PENDING_RERUN_REPAIR` 是**runtime-only 唯讀診斷**，不持久化、不造成 Schema18。
- 三紀元 JSON round-trip／重新整理、轉生 count 0／1／2／3／8、進入紀元不打王即有歷史、W3 Final 只回顧不通關皆有 VM／CI 封箱測試；不應自行再寫一套 migration/backfill 或把 legacy 開發版紀錄當本輪成長。

### 三、災厄最後一場、背景 Fast Catch-up、checkpoint

- W1 `calamitycore.js` 回報 `settlement.checkpointSaved`；W1 `calamityrun.js` 與 W2 `secondworldcalamityrun.js` 的 `finish(reason,{checkpoint})` 避免同一場已保存又重複保存；`save:false` 的終止場（滿級／文明完成／首次稱號／單場／停止）須補一次 checkpoint。W1 首次存檔**明確失敗**須保留 terminal 補存路徑。
- W2 只有 `options.save!==false` 才執行完整 `JSON.stringify(state)` rollback 快照；真正的 checkpoint 場仍有 `saveAtomic(before)` 回復保障；背景非 checkpoint 場只在記憶體累進，由終止或後續正式 checkpoint 保存。**不可為減少快照而破壞 rollback。**
- 兩紀元都在戰鬥開始前取得共用 `battlePresentationPlan(options)`，用 pre-battle policy 決定呈現、structured duration、刷新與 checkpoint；最後一場即使背景 flow 在 `finish()` 停止，也不得又等待完整戰鬥動畫時間。
- 共用 `backgroundprogress.js` 的 `calamityContinuousUiDecision(policy,ended)` 是純 policy 判定，W1 `calamityui.js`、W2 `secondworldcalamityui.js` 共同採用；W1／W2 各自動畫、畫面、獎勵、災厄 state／Boss settlement 保持獨立，不新增 UI wrapper。兩個 runner 沒用到的 local `catchUpPreviewPolicy()` 已刪；共用 infra `previewCatchUp()` API **仍保留**。
- Runtime 動態 CI 同時測 W1 印記滿級／W2 文明完成最後場、前景／背景 headless、非終止場、首次稱號、手動停止、terminal 存檔一次、W1 save retry、W2 rollback；並有 shared UI policy 六情境與舊 static integrity 對齊新 owner。

### 四、其他正式數值、GM／UI 基準（沿用既有 owner，不在七批重算）

- W1 Lv1～500、W2 Lv501～1000、W3 Lv1000～2000；世界進入條件依本檔第2節，絕不能以永久故事回顧繞過 Boss／專精／強化／印記／文明／VIP 條件。
- W3 每級 EXP `10,000,000`（正式 `levelprogression.js`）；W1 強化基礎石 `25×目標等級`、進階石 `5×目標等級`、+20上限；W2 +40；強化每級能力加成2.5%。不得復活舊 50×。
- 轉生越級收益：`M=1+0.03×(enemyLevel-playerLevel)` 僅 rerun 且對方等級較高；適用範圍、向上取整、Offline provenance、裝備出售排除依第13節正式 owner。
- GM 正式修改必須走 shared transaction；GM 測試／預測角色／AU benchmark 與正式角色分離；原有 GM 突破、鏡像正式裁定、異宇宙管理與 benchmark 八模式、VIP 無上限但特殊特權至20、稱號視覺／AU title 門檻 owner 均維持原規則。這七批**沒有**更改這些 GM／平衡公式。
- 三紀元入口／回顧、災厄 UI、戰線紀錄回顧與轉生文案，仍按本檔 UI 索引與 `index.html` 正式資產載入；JS 改動已做 cache-bust。任何舊設計文檔與本段有衝突，請直接 fresh-read 正式 source。

### 五、CI、已知風險與待辦邊界

- 本對話**沒有未完成的已核准工程批次**；劇情四批、後續安全／災厄／UI 三批均完成。後續剩正式遊玩實測、效能與平衡觀察；不因歷史編號再自動開一批。
- 歷史驗證紀錄：gameplay HEAD `4e0c521940c915972a4f6a9ddb15d7cc80951e58` 曾有 Runtime Integrity **#2155 success** 與 GitHub Pages **#6124 success**；Story Integrity **#1111 success** 對應更早的 `a54691cf...`。這些都不是 2026-10-08 current HEAD 的 exact-HEAD 證據，只供追溯，不得宣稱為目前 CI 狀態。
- 尚無經實機存檔重現而確認的本批新 Bug；VM／CI 模擬不等同所有玩家設備的實際操作。若用戶回報現場問題，請先讀 `main` 與明確的實際數據／存檔，再查相關 owner，勿先宣稱無問題。
- 此次**只更新交接 Markdown，不修改任何正式 JS、CSS、Schema、GM、UI 或測試**；GitHub workflow 若只因文件變更而重新執行，也應比對新的 exact HEAD 狀態。

## 2026-10-07 銀河紀元文明災厄 HP 平衡調整（本次定案）

- 使用者確認**直接將銀河紀元 10 階災厄 HP 全部砍半**，首輪與轉生輪共用：正式唯一血量 owner `calamitystate.js` 的 `CALAMITY_HP_PER_LEVEL` 由 `500000` 調為 **`250000`**；血量公式 **`HP = 250,000 × 階級`**，第1階 250,000，第10階 2,500,000。
- `calamitycore.js` 同步對齊防禦性備援值，`calamitystateintegrity.js` 與 `calamitycoreintegrity.js` 同步修改端點、敵方戰鬥數值與 normalization clamp 測試；`index.html` 已更新上述 JS 的 cache-bust。
- **僅銀河 HP 調整**：銀河印記首次取得＋後續30次完整擊殺（合計31次）、ATK／DEF／暴擊／閃避、解鎖、Fast Catch-up、結算與存檔流程皆維持不變；宇宙紀元災厄仍維持 `1,000,000 + (階級−1)×200,000`、每隻30次完整擊殺。
- 使用者表示目前只有本人測試，**不要另外新增舊存檔災厄殘餘 HP 百分比換算或專用 migration**；既有 normalizer 仍照新上限 clamp 舊數值即可，不升 Save Schema17。
- 先前「銀河第10階500萬」等數字均視為**歷史測試基準、已失效**；之後平衡與 GM 實測應以最新 main 的250萬為準。

## 2026-10-08 GM 戰力基準／突破最終傷害修正

- 發現「同步正式角色 → GM 角色能力測試 → 戰力基準測試」原本只把突破對裝備 HP／ATK／DEF 的加成帶入 `gmTestPlayerStats()`，但多個 GM 戰鬥模式仍只傳文明倍率，**漏掉永久突破每級 +5% 的正式 final damage layer**；戰力基準純文字摘要也沒有列出突破等級。
- `vipgm.js` 新增 GM 測試共用 `gmTestFinalDamageSnapshot()`／`gmTestFinalDamageMultiplier()`，**直接委派正式 `formalPlayerFinalDamageSnapshot()`**；不得在 GM 各模式另寫 `突破×5%` 第二套公式。
- `gmpowerbenchmark.js` snapshot 現保存 `breakthroughLevel`、突破裝備加成、突破 final-damage add、`finalDamageMultiplier`；銀河／宇宙地圖怪、輸出診斷及戰力基準實戰一律使用總 final multiplier。摘要新增「突破 Lv.」「突破裝備加成／最終傷害」與「總最終傷害倍率」。
- `gmpowerbenchmarkworldphase.js` 高維 adapter 同樣使用 GM 共用正式 final-damage owner；高維角色快照文字會列突破與總 final multiplier。
- 同步修正 GM 模式：銀河／宇宙文明災厄、特殊怪、競技場、懸賞／虛空等 dungeon GM simulation，以及鏡像 GM snapshot；鏡像 snapshot 現明確攜帶 `breakthroughLevel`，由既有 mirror formal final-damage owner 正規化。
- 文明倍率欄位仍保留作為「文明單獨加成」的診斷值；真正戰鬥使用 `finalDamageMultiplier = 1 + civilizationAdd + breakthroughAdd` 的正式 owner 結果。**不是把兩個 multiplier 相乘。**
- 更新 `tests/runtime/gm-character-breakthrough-batch7-2-integrity.js`：鎖住 GM final owner＝正式 owner、戰力基準 snapshot 必須保存突破、B25 銀河總 final damage 為 ×2.25，且摘要必須顯示突破與總倍率。
- 本批不改正式角色突破公式、不改文明公式、不改 Save Schema17；只修 GM sandbox／benchmark 對正式 owner 的引用與顯示。相關 GM JS 已更新 `index.html` cache-bust。


## 2026-10-08 銀河災厄／GM 測試優化第1批（項目1、11）

- 正式第一紀元文明災厄 `calamitycore.js` 現在在進入 Combat Core 前直接呼叫正式唯一 final-damage owner：`formalPlayerFinalDamageMultiplier({world:1,state})`，並把結果作為 `playerFinalDamageMultiplier` 傳入 `runCombatCore()`。因此轉生後永久突破每級 +5% 最終傷害會正式套用到銀河災厄，不再出現「GM 有算突破、正式災厄沒算」的落差。
- 新增 `CALAMITY_FORMAL_FINAL_DAMAGE_VERSION=1`；若正式 final-damage owner 未載入，銀河災厄直接 fail closed，不另寫突破公式或使用第二套 fallback。
- `calamitygm.js` 的銀河災厄單場／完整擊殺結果 snapshot 現保存該次測試的 `breakthroughLevel` 與 `finalDamageMultiplier`。
- `gmpowerbenchmark.js` 的銀河文明災厄摘要現在會顯示「突破 Lv.X｜總最終傷害 ×X.XX」，與宇宙災厄的倍率資訊一致。
- `calamitycoreintegrity.js` 同步修正既有 Core V2 版本檢查，並新增正式 final-damage owner 契約檢查。
- `index.html` 已更新 `calamitycore.js`、`calamitygm.js`、`gmpowerbenchmark.js`、`calamitycoreintegrity.js` cache-bust。
- 本批沒有修改災厄 HP 250,000×階級、印記升級、舊 HP clamp、Save Schema17、GM 正式印記寫入、GM stale-result 管理與完整擊殺 no-progress；後者仍屬後續批次。



## 2026-10-08 GM 測試結果可信度優化第2批（項目2、8、9）

- 新增共用 GM 測試 context owner（`GM_TEST_CONTEXT_OWNER_VERSION=1`）：以 session-only `revision` 管理角色測試設定變更，`gmTestContextSnapshot()` 會保存角色紀元／等級／裝備來源與裝備、VIP、突破、強化、專精、文明、印記、能力值與正式 final-damage snapshot。
- VIP／突破／強化／角色紀元／等級／重新生成裝備／專精／印記／文明等級，以及「同步正式角色到測試設定」，統一改走 `gmNotifyTestConfigurationChanged()`；不再由各 setter 分散直接呼叫 benchmark invalidation。批次同步使用 `refresh=false` 時只在最後統一通知一次。
- `gmpowerbenchmark.js` 新增 `gmPowerBenchmarkInvalidateTestContext()`（`GM_POWER_BENCHMARK_TEST_CONTEXT_INVALIDATION_VERSION=1`）；角色測試設定一變更會同時清除 benchmark snapshot、地圖輸出／承傷／實戰結果與所有外部模式結果，再重新擷取目前角色 snapshot／刷新摘要。舊 `gmPowerBenchmarkInvalidateSnapshot()` 保留為相容別名並委派新 owner。
- 移除戰力基準宇宙文明等級下拉原本的「setter 後再手動 invalidate」重複清除，避免同一次設定變更重複 invalidation。
- 銀河文明災厄 GM 單場／完整擊殺結果現在保存完整 `testContext`；完整擊殺長迴圈用 context revision guard，若測試中途變更角色設定，該次結果直接作廢，不會在清除後又回填成舊結果。
- 宇宙文明災厄 GM 同步保存完整 `testContext` 並加入同樣的長迴圈 stale-result guard；context 僅作為 metadata／revision guard，不改原本 Combat Core、測試專精／印記或 benchmark snapshot 的戰鬥來源。
- `calamitygmintegrity.js`、`secondworldcalamitygmintegrity.js` 已加入 test-context／stale-result 契約檢查；相關 JS／integrity 已更新 `index.html` cache-bust。
- 本批仍不修改正式存檔、Save Schema17、正式災厄／印記資料、GM 正式管理 transaction、舊 HP migration、印記 progress canonical 與完整擊殺 no-progress；這些屬後續批次。



## 2026-10-08 GM result-context／舊資料安全優化第3批

- GM 測試結果全面採用共用 `testContext` envelope：`vipgm.js` 的 `gmAttachTestResultContext()` 為統一結果包裝入口，會把當次角色紀元／等級／裝備、VIP、突破、強化、專精、文明、印記、能力值與 final-damage snapshot 一起封進 result。
- 已套用於特殊怪、懸賞、虛空、銀河／宇宙／高維競技場、鏡像、銀河／宇宙災厄、地圖／輸出／承傷 benchmark、高維地圖怪，以及異宇宙 benchmark；結果 snapshot 可以自證「當時用什麼角色設定跑的」，摘要不再只能依賴目前畫面設定。
- 高維競技場、高維地圖怪與異宇宙 benchmark 補上 context revision guard；批次／非同步測試中途若改變 GM 角色設定，舊執行不得在 invalidation 後重新回填結果。
- `gmpowerbenchmark.js` 的 test-context invalidation 升為 V2，新增 listener registry（`GM_POWER_BENCHMARK_TEST_CONTEXT_INVALIDATION_REGISTRY_VERSION=1`）；高維地圖與異宇宙等延伸模式以 listener 註冊自己的 result clear，不再只靠包裝舊 `gmPowerBenchmarkInvalidateSnapshot()`。後續新增模式應註冊 listener，而不是再堆 wrapper。
- GM 正式印記修改已收斂到 `gmformaltransaction.js` 的 `gmCommitFormalMarkMutation()`，由 shared `runSettlementTransaction` 負責存檔與 rollback；`calamitygm.js` 不再直接修改正式 `state.marks` 後自行 save。
- `calamitystate.js` 的 persisted mark progress normalization 已 canonicalize：未取得固定 0、滿級固定 0、Lv.0～9 依 `MARK_UPGRADE_KILLS` 把 progress clamp 到下一級需求以下；`MARK_STATE_PROGRESS_CANONICAL_VERSION=1`。
- 舊存檔仍維持銀河災厄 HP 依新最大值直接 clamp，不做舊血量比例換算、不升 Save Schema17。
- `savemigration.js` 的 GM transient cleanup inventory 已涵蓋 `gmTestBreakthroughLevel`、`gmTestContext`、`gmTestContextRevision`、benchmark／result 暫存等 GM-only key；載入舊檔若曾誤存這些欄位會清除，正式 save 不會保存 GM sandbox context。
- 相關 integrity 與 `index.html` cache-bust 已同步。完整擊殺 no-progress 提前停止與 formal-vs-GM 災厄同條件 regression 留給第4批。



## 2026-10-08 銀河災厄／GM 測試優化第4批（項目4、12）

- 銀河文明災厄 GM「完整擊殺模擬」新增 no-progress guard：若連續 **100 場**完全造成 0 傷害，提前停止，不再空轉至 100,000 場安全上限；100,000 場 safety limit 仍保留作最後防線。UI 與統一摘要會明確顯示「無有效進度」及連續零傷害場數。
- 新增純判定 API `gmCalamityShouldStopForNoProgress()`，integrity 鎖住 99 場不停止、100 場停止；`GM_CALAMITY_NO_PROGRESS_GUARD_VERSION=1`。
- `calamitycore.js` 新增唯讀正式 headless combat owner：`runCivilizationCalamityHeadlessCombat()`（`CALAMITY_HEADLESS_COMBAT_VERSION=1`）。它只建立正式玩家／敵人／印記／final-damage Combat Core 輸入並回傳 combat，不做 settlement、不改災厄 HP、不升印記、不存檔。
- 正式 `runCivilizationCalamityBattle()` 已委派此 headless owner 執行 Combat Core，再走原本 settlement；並維持原先「進 Combat Core 前先把正式角色 HP 回滿」的時序。
- `calamitygmintegrity.js` 新增 formal-vs-GM 同條件 parity regression：以同一正式玩家能力、正式印記等級 map、相同災厄、相同 enemyStartHp、相同正式 final-damage multiplier、相同固定 RNG 序列，對比正式 headless 與 GM 單場沙盒的 win／enemyHp／playerHp／turns／倍率；GM regression 明確關閉 test specialization，避免拿 GM 專精污染正式對照。
- `calamitycoreintegrity.js` 鎖住正式 headless owner 契約；相關 JS／integrity／benchmark summary 已更新 `index.html` cache-bust。
- 本批不改正式災厄 HP、ATK／DEF、印記升級規則、Save Schema17、正式 settlement 與舊資料 migration。



## 2026-10-08 GM runtime／載入正式現況（覆蓋前兩版沿革）

- 早期「等 deferred GM group 載完才恢復 `state.gm`」的做法已失效；current 正式 owner 是 `gmruntimeauthorization.js`，並在 `ui.js` 第一次 render 前 reconcile。
- 舊 `stripLegacySaveAuthorization()+額外 save(false)` 路徑已移除；未授權舊 save 的 `gm:true` 由 startup reconcile 清理，已授權 runtime flag 不再被誤判為 legacy。
- `scriptgrouploader.js` 只管理 lazy groups／password bridge／bounded retry；authorization key 與 save boundary 不再由 loader 擁有。
- `gmdevicepreferences.js` V2 是背景戰鬥／主線鎖血唯一 runtime preference owner；`gmbackground.js` 只作 UI delegate，不得含 storage key。
- `combatspeed.js` auth sync V2 會在登入帳號 ready 時恢復 account-scoped GM speed；background／HP-lock／speed 對重複 auth-ready 做 signature 去重。
- 帳號切換到 background=false 時會立即停止 active background flow。
- 首次輸入 GM 密碼與已授權恢復共用 `ensureAuthorizedGmRuntime({retry:true})`；GM group 首次失敗 250ms 後再試一次。
- Playwright `gm-first-render-browser.js`、VM `gm-runtime-early-restore-integrity.js`、`gm-runtime-auth-preferences-integrity.js` 已鎖住上述行為。
- 三個 account-scoped key 名稱均維持 v1，相容既有 localStorage；GM authorization key 仍是 browser-local、非 account-scoped。

---

# 25. 下一個對話如何接手

新對話請直接使用：

```text
讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md，
再重新檢查 GitHub main 的實際程式碼與這次要處理功能的正式 owner／consumer，
完整承接《文明戰線》專案。

最高原則：main 是唯一真實來源。
不要只靠對話記憶、舊交接檔、歷史設計文件或舊 CI 結果。

操作規範：
1. 修改前先 fresh-read 相關正式檔案與 consumer。
2. 使用者說「先討論／先檢查／先不要修改」時，不得修改 GitHub。
3. 使用者說「做／修改／執行／第N批」時，可直接修改 GitHub main，不必再重複確認。
4. 優先修改正式來源；已有 owner 時延伸 owner，不要額外建立 wrapper、fallback、第二套公式、第二套 transaction 或第二套 state。
5. JS／CSS production 修改要同步更新 index.html cache-bust。
6. 修改後必須重新 fresh-read current main、compare base→head、自我檢查 UI／邏輯／正式資料寫入／舊資料相容／Integrity。
7. exact HEAD 沒有 Actions success 證據時，不可宣稱 CI 已綠。
8. GM formal management 與 GM sandbox／benchmark 必須分離，sandbox 不得污染正式 save。
9. Save Schema current=17；不要因 runtime-only GM authorization／preference／diagnostics 自行升 Schema。
10. 若 handoff 與 main 衝突，以 main 為準並直接修正 handoff。

目前《文明戰線》3D 全面升級 40 批規劃，詳見 `3D_IMPLEMENTATION_PLAN.md`；**第 01 批獨立原型已提交（瀏覽器實測待補），第 02～15 批後續已施工、第 16～40 批未開始（2026-10-10 進度更正）**。其他新優化仍須依需求重查 main。
```
