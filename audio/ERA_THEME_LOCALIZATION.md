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
