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
