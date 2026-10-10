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
