# T2-B3：隔離 A／B／C 戰鬥展示

入口沿用 `development/hybrid-comparison/index.html`。A=純 Canvas2D 深度分層圖集；B=Babylon 即時玩家＋同源圖集敵人；C=Babylon 即時玩家與敵人。所有角色先以同一 source camera／128、192、256 pixel grid 渲染，再共用 Canvas2D 舞台合成、站位、接地影、前景與 cue，沒有三套事件或 HUD。B/C 的角色為實際 WebGL 動態 GLB，不是用圖片冒充。

`contract.mjs` 是原事件的純視覺投影，`assets.mjs` 僅 session-local SHA 驗證，不建玩家下載／持久快取；`atlas.mjs` 解碼 PNG16 與每 pixel 深度組裝；`native.mjs` 接原53骨9掛點、三LOD與G007；`renderer.mjs` 共用所有權／rAF／dispose；`vendor.mjs` 在B/C首次需要時載入既有本地 Babylon＋loader（SRI驗證），A不啟動WebGL。

不創造第二個戰鬥時鐘。每次 rAF 只讀 B1 Playback 的 now/due/remaining，暫停凍結、背景只顯有效 final checkpoint。原700ms視覺步驟：attack取0～300ms並保持impact tick9，return在520～700ms把同源return clip取0～700ms；hit在impact後以共用phase retiming播放。三方案取相同22格（native frame=(tick+1)*2／60fps，排除loader補零格）。這是共同展示節奏，不改正式遊戲或B2原clip長度。

counter／combo非傷害marker只顯cue；其後原attack事件才產生攻擊／受擊和來源damage。未知中間HP不推算；defeat用原actor-defeated事件在同一owner clock完整播放700ms，且computed final HP必須為0，沒有提交結算。六動作檢視與slider明示純視覺，不產生事件。

停止時GPU／場景／rAF釋放，只保留一張明示停止的stage最後畫格，下一selection或page dispose移除。晚到factory由B1 signal/isCurrent拒絕掛載；一次最多一個pending factory。所有素材錯誤明示，來源SHA不符不可用假素材補位。WebGL失敗可選A，G006只有unavailable文字與原裸頭。

**B2兩項C仍失敗**：native光影（本展示用已在庫的Babylon ACES，源圖為AgX；AREA近似／IBL／陰影尚非等效）與肩甲／護手／劍首接觸。人工美術／真手機／GPU未批准；不可用本畫面作正式選型／效能證據。所有新檔development-only／publish=false，不改正式runtime／Pages／存檔／音訊。

B2 `source-lock.json`完整保留。`source-evolution.json`只容許B1 HTML／CSS／UI及原死亡事件700ms視覺步驟四檔，before SHA逐一核对固定e094f4e8 Git blob，after SHA精確核對B3檔；其餘來源（含原Fixture／正式runtime）仍逐byte不變。原失敗圖片、數據、Blender、GLB、圖集均未覆寫。

從repo root：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

開 `http://127.0.0.1:4173/development/hybrid-comparison/index.html`；手機需HTTPS轉送／localhost USB轉送。`?renderer=none`為同頁的B1控制契約模式，原B1的無素材請求／12listener等斷言仍完整執行；B3專用browser必測預設真Renderer模式。

[實際展示證據圖冊](review.html)與inventory.json保留source SHA／bytes／授權；verify-source.py只讀實際Blender四工程與24多關節clips，不覆寫B2證據。

B有一個offscreen NativeActor engine／scene，C有兩個，最後由共同Canvas2D合成；實際資源數／釋放由browser檢查。此架構的shader、readback、CPU圖集與decode成本須由後續B4實測，不冒稱最優或零成本。
