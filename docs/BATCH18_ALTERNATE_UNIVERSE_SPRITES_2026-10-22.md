# 第18批異宇宙1000層 Boss Sprite

狀態：施工中，尚未宣稱發布或封箱。

開工前以 GitHub 即時資料核對 PR #72 head `10682f67d4ac6b948808fa4459ebcc812b449c65`，五項必要 Actions 全部 success、MERGEABLE/CLEAN，僅三份文件變更。已於2026-10-22T05:49:56Z合併；開工 main SHA `6ca6b863d897d94db92d2e652e88aa013535becb`。分支保護查詢403，未使用 admin bypass；GitHub正常合併成功。

固定範圍：依正式 alternateuniversedata.js 的20文化、200固定宇宙、五階段1000身份。14張沿用加AU-01～AU-06六張新原圖，每文化50身份共用唯一原型，不新增怪物名稱。保留原33張素材位元、695映射及全部玩法owner。重用MonsterActor/Pool、共用boss版面、GM單一中心、正式Renderer及智慧下載。無新動畫時鐘或額外生命週期。PNG僅development。

正式身份解析沿原生visualContext.mode=alternate與location=深度，直接查正式生成映射；不對顯示名稱猜文化。原生事件未提供怪物id/kind/name時保留該契約；若提供則必須精確匹配。GM以文明、宇宙、階段選擇，唯讀原型、動作、配色、實測高度；只載入所選Actor。

完整驗收、提交/PR/Actions/Pages及真實iPhone未測項目將依實際結果補記。不得使用舊SHA、部分通過、取消或跳過冒充完成。

## 自我檢查與測試設計

新增完整等值守衛：開工main的695筆身份、33原型metadata與每張WebP SHA不變；異宇宙資料、挑戰/結算/進度/UI、轉生、戰鬥core、事件bridge、離線owner全檔位元不變。既有總數守衛精確由33/695擴充為39/1695，原身份取樣與上下限斷言不變。第17批scope明確限定原30身份；媒體總數精確88→94，原12圖快取仍逐張受測。歷史PR48守衛只加入兩個明確cache token正規化，完整blob比對保留；不改歷史fixture或數值斷言。

首輪3000測試架使用identity.world=both作為角色外觀紀元，導致正式prepare拒絕；GM尺寸已通過但該輪整體失敗，原始失敗記錄first-harness-failure.json保留。修正測試架指定higher玩家外觀，沒有修改Runtime尺寸/倍率/上下限斷言。

六張人工視覺覆核：冰冠霜甲與晶槍、雷翼分岔槍、海獸鰭鬚、樹靈藤根生命核、紅金龍翼尾、法老砂金符文，輪廓互異、面向左、主體完整。原圖按附件原位元整合，未重新製圖。
