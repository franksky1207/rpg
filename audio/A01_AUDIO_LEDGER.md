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

# 《文明戰線》音訊 A01 素材台帳
目前為 CC0 遠端試聽候選，非正式本地化素材或已通過聽覺品質驗收。
- galaxy-battle：Space Battle，MintoDog，CC0，https://opengameart.org/content/space-battle
- boss-orchestra：The Final Battle，skrjablin，CC0，https://opengameart.org/content/the-final-battle
- laser-preview：Pew Laser Fire，sketcherskt，CC0，https://opengameart.org/content/pew-laser-fire-sound

## 強制規則
文字和 3D 標準模式同介面同事件共用一套音訊；所有極簡模式絕對靜音；背景分頁停止、返回依目前情境恢復；首互動後音樂預設開啟。音訊試聽中心獨立於 3D 中心。

## A01 未完成項目
1. 合法真實音訊素材本地化 GitHub、SHA 與版本追溯，以及 3 首正式配樂、8～12 組音效實際聽覺驗收。
2. 正式遊戲情境自動配樂與背景／極簡離開後的目前情境恢復。
3. 正式設定音量與帳號／裝置偏好、Web Audio 混音匯流排、淡入淡出及資產釋放。
4. 來源網站可用性、手機瀏覽器、Chromium、GM 授權與 exact-HEAD 自動測試。
不得以遠端候選或程式波形聲取代正式遊戲音樂音效。

## A02 初步施工狀態（2026-10-10）
- 已於 combatfx.js 兩條結構化播放路徑（標準／鏡像）接入單一 CivilizationAudio.combatEvent，不更動傷害、回合與收益。
- 新增 attack、critical、dodge、combo、counter、shield、drain、penetration、mark、berserk、victory、defeat 事件目錄；僅普通攻擊暫時指向 A01 的雷射候選音檔，其他事件待真正授權素材，禁止用蜂鳴或不合適素材替代。
- GM 聲音測試中心可模擬事件路由與查看待素材狀態，並保留離開測試即停止及試聽音量重設。
- 全部極簡靜音與背景靜音、最多 3 個戰鬥聲道、240ms 節流、Fast Catch-up 略過音訊。
- A02 尚未通過完工 Gate：所有合法素材與武器／敵人家族專屬映射、全戰鬥模式 hook 覆蓋、實機播放驗證均待後續補齊；此批目前僅基礎程序已提交，不得標記完整完成。

## A01～A02 場景測試中心補修（2026-10-10）
- GM 音樂音效測試中心不再按照 A01/A02 批次展示，改八個正式使用情境：主畫面與系統、銀河紀元、宇宙紀元、高維紀元、戰鬥與技能、怪物與特殊遭遇、副本與特殊戰鬥、情境混音測試。
- 同一素材 ID 可由多個正式情境共用。GM 跨紀元只做試聽，不解鎖地圖，不修改玩家存檔或角色所在紀元。
- 增加 8 筆 SRG774 / Dark Sci-Fi Audio Pack CC0 來源站候選：
  - dark-sector：sector_0.mp3（探索）
  - dark-airy：airy_0.mp3（環境）
  - dark-pulse：pulse_0.mp3（未知與深空）
  - dark-urgent：urgent_0.mp3（緊張）
  - dark-transmission：transmission_1.mp3（過場）
  - dark-victory：victory_4.mp3（勝利）
  - dark-hover：hover_0.mp3（UI）
  - dark-title：title_6.mp3（主題）
- 作者授權原始來源：https://opengameart.org/content/dark-sci-fi-audio-pack （CC0）。
- 目前共 11 個「來源站候選播放 URL」，**不是 11 筆已本地化或 11 筆全部成功聽覺驗收**。部分情境借同一素材暫作候選，不能當作紀元正式專屬配樂。怪物／Boss／不同武器族專屬聲音仍缺，會明確顯示「待素材」。
- GM 試聽中心的「情境混音測試」目前仍是單音檔候選試聽入口，尚未做到背景＋環境＋技能的多軌混音，不得宣稱混音功能已完成。
- 二進位正式音檔尚未提交 GitHub main，來源網址能否穩定播放、音訊品質、手機播放與全部模式覆蓋均待實測。

## 2026-10-10｜自動載入檢查與音量修正
- GM 音樂音效測試中心在進入或切換分類時，自動使用瀏覽器 Audio metadata 非播放載入測試；顯示「檢查中／可載入／無法載入／待素材・不可播放」，檢查最長約 9 秒。可載入僅代表 metadata 可解析，正式播放與聽覺品質仍以實際音檔驗收為準；自動檢查不出聲、不干擾正式角色。
- 自動檢查採目前分類循序測試，避免一次大量連線，測過的狀態供同一工作階段重用；遠端來源網站可能因網路或防盜鏈政策仍無法供瀏覽器直接播放。
- UI 短音效播放增益係數暫從 1.0 提升至 1.8（最終 Audio.volume 上限 1.0），提醒與勝利音效 1.35；音樂 0.85、環境聲 0.75、戰鬥 1.0。這是播放層的相對音量調整，並不是完成 LUFS／真峰值／動態壓縮標準化。聲檔本地化後必須實測響度，調整強化與升級不同類別的音效素材，避免過小或失真。

## 2026-10-10｜音訊 A03 情境管理第一階段（程式已施工；素材與全場景映射未結案）
- 新增 `audio/audio-scenes.js`：唯一三紀元音訊情境表（銀河／宇宙／高維／共用），涵蓋主畫面、探索、戰鬥、Boss、災厄、異宇宙、競技場、懸賞（只在前兩紀元）、鏡像、虛空、轉生、勝利、背包、強化、專精、雲端等情境的音訊映射或待素材空位；不寫正式存檔。
- 提供 `CivilizationAudioScenes.setContext(era,scene)`、`notify(type,detail)`、`current()`、`restore()`、`stop()`、`catalog` 與文件事件 `civilization-audio-scene`。三紀元僅用同一 `CivilizationAudio` 正式播放 owner。
- `combatfx.js` 兩條結構化事件播放路徑橋接戰鬥情境，戰鬥結束後延遲 3.5 秒恢復探索，連戰防止每場重播曲頭；不更動傷害、數值、掉落。音效仍由 A02 共用事件 owner。
- 第一互動解鎖音訊時通知音訊情境管理員；背景／極簡停止後預留回來按目前情境恢復。環境層已可與配樂同時播放，但只是臨時雙 HTMLAudioElement，非完成 Web Audio 混音系統。
- A03 **尚未完工**：大多數正式 UI／劇情／轉生／特殊模式缺獨立可信事件橋接；高維正式事件 identity 不等於推測狀態；11 筆遠端候選音檔尚未本地化或品質驗收；無正式響度統一、淡入淡出、多軌交叉混音、三維定位。A04 亦不得宣稱完成；先做 A03/A04 程式，再集中補素材並由使用者回報聆聽摘要。
- GM 音樂音效測試中心仍依場景分類、四個評分按鈕、本機儲存與摘要複製。使用者未貼回評價前，不根據未取得的評價修改正式素材。

