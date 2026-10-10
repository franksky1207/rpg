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

