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

# 三大紀元主題音樂本地化驗收簿（2026-10-10）

> 使用者已明確指定 03／09／06 三首配樂。**本地化不等於音樂切換規則已上線**；正式音訊程式及原有 73 個舊情境目前仍有各種舊配樂，須另批依精簡版規格改造。

| 紀元 | 選定曲目 | 作者 | 授權 | 原始來源 |
|---|---|---|---|---|
| 銀河 | The Fall of Arcana (03) | Matthew Pablo | CC BY 3.0 | https://opengameart.org/content/the-fall-of-arcana-epic-game-theme-music |
| 宇宙 | Epic Orchestral Fantasy Theme (09) | Markus Lindner (linxiaoma) | CC BY 4.0 | https://opengameart.org/content/epic-orchestral-fantasy-theme |
| 高維 | Exploration Theme (06) | Cleyton Kauffman | CC0 | https://opengameart.org/content/exploration-theme |

- **授權聲明**：銀河與宇宙曲正式發布時必須在遊戲 credits／授權清單中展示名稱、作者、來源、授權與修改說明；高維 CC0 法律上不強制署名，但仍保留來源供追溯。CC BY 要求標示修改（例如為本遊戲製作交叉淡化循環版本），不表示原作者認可遊戲。
- **本地化路徑**：`audio/assets/era-themes/`，自動流程 `.github/workflows/era-theme-localize.yml` 從上列 OpenGameArt 官方附件下載，保存原檔及適合 Web 播放的 `*-theme-loop.ogg`，以 `manifest.json` 記錄 SHA256、原始與循環長度、檔案大小及許可。原始檔與變更版必須清楚區分。
- **循環**：高維原作者聲明可無縫循環；銀河、宇宙未聲明。先用原曲頭尾交叉淡化製作可重播 OGG 候選，應逐曲用耳機檢查接縫是否有節拍、樂句、音高或音量突變；人工驗收前不可標示完美無縫或正式封版。原曲起奏與循環版的音樂句落點仍待選擇。
- **漸強／漸弱**：**整首內部自然動態保留**，不把長曲每 10 秒調音量；切換「紀元主題↔戰鬥配樂」時才讓播放器逐漸淡出舊音樂、淡入新音樂；單紀元切換角色、背包、裝備等普通介面不切曲也不重播。建議跨曲轉場約 1～2 秒，可依耳感微調，避免戰鬥短間隔頻繁重播。**此播放端轉場功能仍須另批實作**。
- **GM**：只有在三首實際本地資產上傳成功且可從遊戲 URL 開啟後，才能把它們加入 GM 的正式候選試聽入口；單一音量百分比必須和 `HTMLAudioElement.volume` 直接一致。正式介面的音樂來源更新需依真實遊戲情境事件一併施工。
- **不動**：戰鬥公式、掉落、進度、存檔、速度、連戰和場間等待。
