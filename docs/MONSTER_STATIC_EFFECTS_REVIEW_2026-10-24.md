# 全怪物模組化靜態效果（只供人工看圖）

**[直接開 HTTPS 分類預覽](https://htmlpreview.github.io/?https://github.com/franksky1207/rpg/blob/review/monster-static-effects-20261024/development/monster-art/full-review/index.html)**

- [元件庫／自由組合試作台](https://htmlpreview.github.io/?https://github.com/franksky1207/rpg/blob/review/monster-static-effects-20261024/development/monster-art/full-review/effect-library.html)
- [效果使用分布](https://htmlpreview.github.io/?https://github.com/franksky1207/rpg/blob/review/monster-static-effects-20261024/development/monster-art/full-review/effect-statistics.html)
- [全量總覽圖](../development/monster-art/full-review/effect-sheets/index.html)
- [完整說明及未來正式接入方式](../development/monster-art/full-review/EFFECTS_REVIEW.md)
- [895 張本體 SHA256 證據](../development/monster-art/full-review/effects-audit/index.html)

承接 main `658d5db2` 與已完成調色 `ab521304`，12 隻認可基準不變。

48 個可執行幾何元件、8 個家族；895 套有效外觀、556 種實際元件集合，覆蓋1705身份。L0～L5 皆有靜態效果；異宇宙每原型十種組合、同宇宙五階完全共用，十王投影與本尊共用。

原本895張body逐檔位元組完全相同，連同原型、認可樣本與調色資料共960個檔案SHA一致。新完整預覽在本體非透明座標的RGBA完全一致；效果這些座標全部透明、畫布外緣8px透明。沒有覆寫舊full或認可B。

建議先「同原型→效果獨立→正常／放大」，再看十王、災厄與異宇宙各十版，最後用家族／元件／組合篩選檢查細部。新增元件與效果都仍是候選，是否好看由人工決定。

僅做必要本機頁面、像素、SHA、快取、390／768／1440px檢查。工作分支無PR，提交含 `[skip ci]`，沒有觸發、追蹤或等待Actions；未改workflow、正式MonsterActor、圖鑑、GM、動畫、大小或遊戲數值，未合併／正式發布。
