# 原第01～27批：B方案相容性補查台帳

基準：`b2e4f3c69a387f7c86412ed4cd4687f6b13a6552`。本次逐批補查現存成果，不重做歷史施工，不將舊文件的「未開始」覆蓋已完成成果。新B方案優先；歷史美術失敗與未批准項目不改為通過。

## 逐批依賴分類

| 原批 | 分類 | 現存來源／權威依賴與處置 |
|---|---|---|
| 01 本地引擎 | KEEP／FIX | `vendor/babylonjs/7.54.3`、`shared-loader.js`、比較管線 `vendor.mjs`。GM已有Babylon時僅補本地GLB解碼器，避免重載SDK；不換引擎。 |
| 02 Canvas／生命週期 | KEEP／FIX | `runtime.js`、B Controller／entry、GM `safeStop`。GM B使用同舞台與取消signal；既有最大化對僅有ResizeObserver的B適配器採可選resize呼叫，避免TypeError。 |
| 03 主頁 | MOVE-TO-GM／HISTORICAL | `createEpochScene`仍由GM使用；原正式HomeToggle／formal-home控制已T4退場，原件逐byte留歷史。 |
| 04 紀元入口 | KEEP／MOVE-TO-GM | `worldphaseui.js`與`worldphase-b04.css`保留正式2D入口／確認／鎖定；紀元3D門由GM場景展示，不初始化正式裝飾WebGL。 |
| 05 銀河地圖 | KEEP／MOVE-TO-GM | 正式`worldmapui.js`／Target Context不變；`createGalaxyScene`供GM，正式GalaxyToggle已刪，不恢復。 |
| 06 宇宙地圖／回顧 | KEEP／MOVE-TO-GM | `secondworldmainline.js`、Boss／回顧身份保持；`createUniverseScene`只GM。背景／極簡實際回歸。 |
| 07 高維戰線 | KEEP／FIX／MOVE-TO-GM | `thirdworldrun/playerflow/ui.js`保持十王永久HP與正式結算；修同token HUD重綁、背景checkpoint退出、權威極簡計數、可恢復pagehide。地圖幾何供GM。 |
| 08 角色快照 | KEEP | `appearance-snapshot.js`、`formal-snapshots.js`、`gm3dprototype.js`同源／指定iframe／GM授權只讀。GM B始終fixture，不將正式角色快照當其數值輸入。 |
| 09 背包／五槽 | KEEP／MOVE-TO-GM | 正式穿卸／鎖定／出售／贖回owner不變；快照可混紀元、空槽；`createEquipmentScene`供GM，B共用既有五槽GLB與精確身份映射。 |
| 10 強化 | KEEP／MOVE-TO-GM | 正式強化transaction不變；`createForgeScene`與五槽強化快照供GM，不恢復養成頁Canvas。 |
| 11 養成 | KEEP／MOVE-TO-GM | 八專精、十印記、文明、界弦核心由各正式owner決定；`createGrowthScene`與四個原案例保留，不新增數值模擬。 |
| 12 副本／競技場 | KEEP／MOVE-TO-GM | `dungeonModeAvailability`／正式副本owner保留；GM `createDungeonScene`保留，高維懸賞仍不出現。 |
| 13 高維競技／鏡像／虛空 | KEEP／MOVE-TO-GM | `createDungeonAdvancedScene`、正式定相／異相三戰與鏡像／虛空owner保留；虛空背景／極簡Chromium與WebKit實際回歸，不改正常虛空機制。 |
| 14 災厄／異宇宙 | KEEP／MOVE-TO-GM／FIX | `createFrontierScene`、AU200×5／20文化身份、兩紀元災厄owner保留；跨紀元診斷對齊現存共用`battlePresentationPlan`、極簡decorator之只讀原owner，維持原檢查責任。 |
| 15 HUD／特殊／結算 | KEEP／FIX／MOVE-TO-GM | `combatfx.js`／CombatEvents與正式結算保留。GM原C-15-BATTLE整併命名「2.5D 戰鬥模擬」，仍可切回「戰場與生命顯示」；另三案例與atlas-review不刪。 |
| 16 劇情／回顧／轉生 | KEEP／MOVE-TO-GM／HISTORICAL | 正式story／回顧／轉生owner不變；GM `createChronicleTransitionScene`保留。T4退場控制原件／測試證據保留。 |
| 17 設定／GM／帳號／雲端 | KEEP／MOVE-TO-GM | GM授權／device preferences／cloud save owners不變；`createServiceConsoleScene`供GM原五案例。沒有GM B收益、save或雲端寫入。 |
| 18 覆蓋守門 | KEEP／FIX | 原覆蓋、GM31、唯讀快照、故障、發布與source-lock測試保留；舊C-15標籤改為整併入口，原展示能力仍由legacy子頁驗證。新增真B／真背景／WebKit斷言。 |
| 19 三紀元場景 | MOVE-TO-GM／KEEP | `createEpochScene`三紀元幾何與背景保留；正式2D紀元入口／32背景資產保持。 |
| 20 星圖／回顧導航 | MOVE-TO-GM／KEEP | 三個地圖factory、正式選取與回顧來源保留；正式頁沒有為星圖展示預熱／建立額外WebGL。 |
| 21 玩家／裝備展示 | KEEP／MOVE-TO-GM | `character-assets.js`、角色／裝備factory及GM正式／自由來源保留；B共用已登錄資源，缺G006不得假借G007。 |
| 22 鍛造／養成幾何 | MOVE-TO-GM／KEEP | Forge／Growth原案例、唯讀能力與低物件數展示保留，正式成長規則／UI未改。 |
| 23 副本場景 | MOVE-TO-GM／KEEP | Dungeon／Advanced factory與身份／解鎖／三戰來源保留，不以GM象徵幾何提供正式入口。 |
| 24 災厄／異宇宙環境 | MOVE-TO-GM／KEEP | Frontier幾何、異宇宙分層身份與三紀元背景成果保留，原素材沒有一鍵刪除。 |
| 25 全息／劇情展示 | MOVE-TO-GM／KEEP | Chronicle與正式2D故事／回顧背景保留；Canvas／裝飾hook已退場，不另建正式預覽。 |
| 26 效能／取消 | KEEP／FIX | 既有Runtime租用／abort／epoch／context loss／observer／RAF釋放保持；B GM切換僅一個Renderer／engine，不遺留舊API持有fixture。暖cache保持原24MiB、atlas解碼32MiB上限。 |
| 27 人物基座 | KEEP／FUTURE-28-40 | 三原GLB均53骨／9掛點／三LOD；原19登錄資產與15件G007五槽GLB SHA／bytes／license不變。B動畫沿原相容骨架重定向，不重製人物。未核准正式裝備／敵圖仍unavailable。 |

## DELETE／歷史／後續界線

DELETE只承接已驗證T4退場的正式`formal-home.js`、`formal-dom.js`、`preview-expand.css`、Home/Galaxy/Story preview controls及單用途host／hook；本次查反向依賴未找到可再安全整檔刪除的共用factory。十五factory均有現存GM consumer，不能因prototype/3d檔名刪除。

HISTORICAL：A／C比较程式、B2原始Blender／GLB／atlas與r1/r2美術失败證據、T4原件與本次`combatfx.js`修前原件保留。A/C不在新GM選項出現；獨立comparison仍是非正式開發／歷史入口。現有Pages流程在正式候選完成驗證後另行stage瀏覽器必需開發閉包，供GM B重用；不將publish=false素材登錄為正式核准資產，也不把source工程全部發布。

FUTURE-28-40：核對concept索引實際位於`development/3d-source/equipment/concepts/_concept-index.json`，非galaxy子目錄。G001～G020共20套／40張WebP，SHA／bytes及conceptApproved=false原樣保持；既有五槽resolver／卸裝／stale dispose條件可承接第28批。未製作29～40量產美術，未改概念圖批准狀態，`FULL_3D_AVAILABLE=false`與`formalReleased=false`不解除。

## 可重製證據與回退

`python scripts/batch01-27-compatibility-audit.py`產生機器台帳，逐項驗證19登錄資產、三GLB骨架／掛點、40概念圖、原source-lock／退場原件、現存module及factory反向consumer。此靜態盤點須與實際GM31、正式只讀快照、32五槽组合／100次真Renderer釋放、三紀元背景／虛空、source/publish與存檔／音訊測試一併判讀，不能當真人驗收。

回退：依本任務commit反序`git revert`（連同HTML版本／manifest／源鎖），不reset main，不刪玩家存檔。真iPhone App切換、實體GPU／發熱與正式帳號雲端仍由真人驗收；Linux WebKit不等同iPhone OS事件實測。
