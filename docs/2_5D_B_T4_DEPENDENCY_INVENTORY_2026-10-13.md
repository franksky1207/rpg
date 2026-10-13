# T4 預覽反向依賴盤點（已執行退場；共用依賴保留）

基準 main：48009e8d8f87afc8bfef0c68cb4c02e854b2944f。T3 的正式 owner 端到端素材可用／缺失、安全取消驗證已通過，開始解除 WAIT-T3。以 `rg` 檢查實際 HTML、JS、CSS 與 GM factory 呼叫，沒有僅按文件判定。

| 正式入口／來源 | 預覽 factory／資源 | GM／B 反向依賴 | 分類／具體移除方式 |
|---|---|---|---|
| index.html 的 civilization3dFormalHost 與 formal-dom.js／formal-home.js | 預覽控制、host、監聽、預熱，使用 runtime／prototype-engine | GM iframe 直接使用共用 factory；沒有引用 formal-dom／home | HISTORICAL-SOURCE／已退場；解除正式引用與 host，控制來源逐位元搬至 development/retired-formal-previews/20261013 |
| ui.js 首頁 HomeToggle 與 galaxy3dPreviewControl | createEpochScene／createGalaxyScene | GM 星圖／艦橋案例仍使用 factory | DELETE（已完成）；刪除正式 controls／helper，KEEP-SHARED factory |
| worldmapui.js adventureMapPage 內的 GalaxyToggle | createGalaxyScene | GM 星圖 still shared | DELETE（已完成）；移除 template 中控制段，不改 region 解鎖／展開／戰鬥卡 |
| storyui.js story modal 的 story-3d-preview／StoryHost／hideStoryPreview；story.css | createChronicleTransitionScene | GM chronicle 展示保留 | DELETE（已完成）；移除 modal 預覽段及 hide hook、專屬 CSS；保留正式故事播放與 GM factory |
| formal-dom.js 的三紀元／角色／背包／強化／專精／印記／文明／核心／副本／前線控制 | createCharacter／Equipment／Forge／Growth／Dungeon／Frontier 等 scene | GM 八分類 31 案例共用 factory | DELETE 控制（已完成）＋KEEP-SHARED factory；桌機／直向／橫向 11 路由及各 100 次切換負面 DOM／網路驗收通過 |
| formal-dom.js settings／account／cloud／guide／GM 周邊注入 | createServiceConsoleScene | GM service 案例仍用 | DELETE 正式裝飾（已完成）；不刪帳號／雲端／GM 授權服務 |
| formal-home.js 舊 battle preview | createBattlePresentationScene | GM battle sandbox 用此 factory；正式 B 使用新 Renderer | DELETE 正式舊展示（已完成）；保留 GM factory／原文字 HUD |
| 3d-test/prototype-engine.js、runtime.js、test-center.js | GM 31 cases、資源生命週期 | GM 正常展示；共用 source | KEEP-SHARED，不能整檔刪除 |
| 3d-test/shared-loader.js、formal-snapshots.js、appearance-snapshot.js、character-assets.js | lazy engine／唯讀正式角色與五槽 | GM 正式快照及正式 B 身份／模型來源 | KEEP-SHARED；之後僅刪已查清的裝飾 startup prefetch 呼叫，不刪 GM warm |
| assets/3d 三 LOD 玩家／G007 十五 GLB／registry | 53 骨／9 掛點／原三 LOD／五槽 | GM＋正式 B | KEEP-SHARED；身份缺材維持 unavailable，不替代 |
| preview-expand.css、galaxy-b05.css、worldphase-b04.css | 正式 host／地圖／手機最大化 | 需逐 selector 核對 GM iframe 與正式非預覽 map layout | preview-expand 僅正式 host，已搬歷史來源；galaxy CSS 僅刪控制 selector，保留 map card；worldphase CSS 全保留正常紀元入口。 |
| development/hybrid-comparison 與 development/3d-source | A/B/C、Blender、動畫、來源鎖、美術及失敗證據 | 歷史研究與原批次接續 | HISTORICAL-SOURCE，publish=false，保留 |

GM 的正式快照、自由展示、授權／iframe、最大化／返回位置已完成本批實際 browser 回歸；真手機仍待驗。本表不表示已完成八分類 31 案例實機驗收。

新增 GM atlas-review 為 KEEP-SHARED／MOVE-TO-GM 能力延伸：原戰場案例内檢視已核准清冊，無來源 unavailable；test-center／GM index 的 before/after SHA 與原件同保留在 ledger。31案例數量不變，不在正式頁建立入口。
