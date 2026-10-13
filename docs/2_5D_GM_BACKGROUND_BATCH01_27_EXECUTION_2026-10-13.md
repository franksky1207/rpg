# 2.5D GM／背景同步／第01～27批補查施工紀錄

施工起點：b2e4f3c69a387f7c86412ed4cd4687f6b13a6552。連續施工中，尚未整體結案。

## B 已重現與修正

使用者確認背景正式結算仍運作。瀏覽器實際重現 presentation.playerHp=0 而新 DOM 為1000/1000，敌方亦受相同舊screen guard阻擋。新DOM只持有同token且舊screen已斷開時可重綁；新戰鬥／其他route無法繼承。修前測試在部分HP更新斷言失敗，修後Chromium/WebKit×桌機/手機尺寸均通過。

persisted pagehide原本清空runtime，已改保留可恢復頁面；非persisted離頁仍清理，不持久化runtime，不建立reload自動結算。補算final從同一正式最後step／snapshot恢復場數／死亡／cap，提示移除；極簡讀同runId的正式計數。catch-up跳過動畫消耗原structured duration及外層gap，沿用既有時間owner。

615abc47與起始main的thirdworldrun.js及combatfx.js逐byte相同（SHA見Git與原始檔）；不能僅按檔案修改推定T3造成計算退步。已確認的根因是DOM重建與呈現screen綁定錯位；可恢復pagehide及只計gap屬另外重現的生命周期／補算缺陷，不冒稱iPhone OS事件序列已真人證實。

證據：docs/evidence/gm-background-compatibility/w3-before-failure.log、w3-chromium.json、w3-webkit.json。原核心/RNG/掉落/正式雲端owner不改，測試是隔離新角色與唯讀／本機SDK fixture。

## 尚待完成

B：第一、二紀元及虛空真瀏覽器背景／極簡，WebGL正常／故障／文字回歸。
A：GM單一B Renderer整合、五案例／五槽／LOD／控制／手機放大還原／來源發布測試。
C：01～27成果逐批分類台帳、反向依賴與必要修正、自動化驗收。
最後：完整交接、main推送、最新HEAD Actions逐項核對。iPhone App切換／桌機手機真GPU由真人驗收；後續28～40未開始。
