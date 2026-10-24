# 全模式共用怪物外觀整合／工程驗收紀錄

狀態：**工程整合、必要自動化回歸與正式發布驗證完成；人工肉眼與iPhone真機尚待驗收，不列成功。** 功能main與同SHA證據見末尾正式發布紀錄。

## 基準與範圍

唯一施工基準為當下最新main `b0241d67c9073c2dbf48f972b5e414cadf111d1c`。分支 `monster-visual-integration-20261024`；本次使用者明確授權完整整合，優先於舊規劃「未授權」與拆批建議。沒有新增原型圖片。

盤點發現：正式JSON有1695映射，圖鑑另有10個高維投影，總1705身份。高維懸賞由 `thirdworlddungeonui.js` 明確關閉，不存在可新增外觀的正式第三套懸賞；高維競技場由 `thirdworldarena.js` 真實映射十王。虛空20身份已共用三紀元；鏡像由 `mirrorcombatcore.js` 玩家snapshot（含equipment）、正式WholeSuitActor與目前玩家外觀產生，不是固定怪物原型。

舊規劃保留「其他模式不改」與現有 dungeon-only 效果門檻、圖鑑獨立CSS濾鏡，均與此次明確要求矛盾；本次以正式Actor先行、共用純規格與繪製模組取代。高維懸賞不虛構補齊，投影不新增十款。

## 生效規則

- `3d-test/monster-appearance.mjs` 是正式外觀純函式與繪製owner。以正式registry查身份；同原型的身份序位、模式、進度、普通／菁英／Boss及實際強度決定外觀。沒有每次載入亂數、區域統一主色或宇宙deep-space回退。
- 正式 `MonsterActor.init` 從已驗證pool bitmap準備一次512px靜態來源；既有 `draw` 只沿原姿勢畫此來源。圖鑑以正式mapping讀相同resolver及paint，GM沿正式Actor。沒有三套另行配色／特效。
- 真實逐像素雙色分區，保留來源明暗細節；8款大面積局部分色、12身體色族×8對比輔色及6輪廓高光，10種紋理原語、8種多邊能量場及層次／文化轉角組合。這些畫在原始Alpha內，不是假稱CSS全圖filter可局部雙色。
- 目前全體實際出現273組色彩、413種紋理／能量場／層級／文化組合。數量不是肉眼驗收結論。低核、effects-off與reduced-motion仍保留相同靜態辨識；原既有副本微漂浮／脈動依原政策降級。
- 強度rank依序為主線1、特殊2、副本3、銀河災厄4、宇宙災厄5、高維6、異宇宙7；主線內普通0層、菁英1層、Boss2層，宇宙後十王增加能量層。高階透過線層、色彩、覆蓋、標記而非改大尺寸。能量幾何全部Alpha內，避免遮蔽HUD或改尺寸。
- 異宇宙200宇宙原出場順序與20原型映射完全保留；每原型十版顏色與靜態效果均相異，各宇宙五階完全相同。高維競技投影直接解析原十王。
- 鏡像保留玩家裝備像素、身形、比例及水平反射；正式／GM共用 `applyMirrorAppearance` 的兩條冷色零模糊邊緣及裝備像素後方的三條薄碎鏡光紋，不增怪物或玩家資源。
- `monster-appearance-designs.mjs` 包含經全同原型比較選出的實測近似身份的確定性設計選擇，共99筆，包含5個異宇宙宇宙owner；由64px全同原型候選距離優化後，再以128px正式Actor全面比較。不是隨機運行或隱藏測試白名單。

## 指紋與視覺稽核

完整逐身份規格／fingerprint與明確白名單見 [1705身份稽核JSON](monster-appearance-fingerprints-2026-10-24.json)。895個有效外觀；200組「同異宇宙五隻」、10組「高維王／對應投影」白名單；非白名單完全重複0。指紋只含實際繪製欄位，不以名稱、palette key、無效配置或尺寸湊唯一率。

第一輪128px同原型比對發現124疑似近似配對，修正大面積分色與紋理後剩10，經明確身份設計修正後在原門檻（初輪mean RGB差>=15、差異>20的實體像素比例>=25%；之後再提高為mean>=20、像素比例>=30%）全部通過。這是篩查工具，不能證明人眼辨識或取代人工核准。

人工入口：正式站部署後 `/3d-test/monster-appearance-review.html`。直接使用正式Actor，提供所有原型跨模式、銀河同圖連續身份、宇宙100王、20組異宇宙各十版、災厄／高維／副本及玩家／鏡像。上一隻／下一隻支援快速取消舊lease；圖鑑實際上一隻／下一隻由原既有測試另驗。200款完整比較圖及像素結果由Functional CI artifact保存，不將大量預覽圖部署到離線資源。

## 保護與效能

三份原始JSON、所有WebP、正式怪物身份／出場／數值／掉落／存檔／戰鬥公式、玩家裝備renderer、尺寸定位與動畫owner逐位元保護；新契約測試驗證。原decode pool上限2張／2MiB不變。每活躍MonsterActor新增一張512px靜態來源（1MiB），dispose釋放；圖鑑畫完釋放臨時來源，不保留895個bitmap。既有智慧下載、SHA、清快取重載及離線策略不改，只沿原manifest生成器加入共用模組。

怪物不新增CSS filter、blur、粒子、計時器或逐幀pixel readback；鏡像固定兩個零模糊drop-shadow與三條CSS背景細線。Alpha逐像素相同，幾何／能量紋理不改本體尺寸或動畫包絡。不加入半月攻擊效果。

既有exact-source guard透過 `monster-appearance-approved.json` 的逐檔before／after SHA嚴格組合此授權呈現修訂，再跑原歷史斷言；任何未登記位元仍失敗。沒有刪除、跳過或放寬原驗收標準。

## 驗收狀態與發布證據

本節保留施工期檢查範圍，最終實測與發布證據見下方。已取得本機Chromium的895靜態來源、全部同原型配對、Alpha逐像素、資源pool上限與釋放結果，以及20組異宇宙與各模式比較圖。既有鏡像三viewport六動作／玩家反射像素測試通過。

完整回歸、最終PR HEAD Actions、功能main與Pages URL／SHA已取得，精確證據見末尾正式發布紀錄。瀏覽器安裝與主機WebKit系統依賴限制需如實記錄，環境失敗須重跑或明列。iPhone Safari真機、長時間溫度／耗電／記憶體、鎖屏切App及人工「肉眼明顯差異」核准均尚未完成，不能宣稱通過。

### 回歸守衛與測試依賴修正

PR首輪 GM terminology job [40079411490](https://github.com/franksky1207/rpg/actions/runs/40079411490) 揭露歷史清理守衛未登記四個新增呈現檔；已加入精確四檔名稱及SHA校驗，不增加整目錄例外。完整Batch6另外揭露四個舊隔離fixture未載入最新main必需的combatlifecycle.js；補齊真實owner後保留所有原斷言，並增加舊播放被取代必須回報COMBAT_INTERRUPTED的斷言。不修改正式戰鬥owner。首輪失敗不算成功；修正後另核對最新HEAD全部必要Actions。

加嚴後本機Chromium：895來源、18221同原型跨模式配對、原圖Alpha每像素相同、疑似近似0；最近配對mean RGB差21.2333、差異>20像素比例49.8973%。這些門檻只是篩查，人工辨識仍待驗收。三視窗鏡像六動作及水平反射像素在最終碎鏡標記下通過。

舊逐身份測試的CSS palette字串比對已升級成正式有效fingerprint＋GM／正式Canvas逐RGBA像素相等，保留原尺寸、分離、裁切、六動作、死亡清空斷言，沒有移除案例。低階／effects-off測試仍驗證回到基礎動作，但加驗身份靜態像素必須保留、不能等同無身份原圖。這些回歸已納入原Functional CI monster job；維持既有workflow，不另建重複Actions。

本機已完成：Batch6 32/32類別（36個不同原始測試、同次執行不引用舊結果）；銀河／宇宙／特殊609×3=1827案例、副本／特殊222案例、災厄／高維／投影180案例均通過，含GM／正式逐RGBA一致。異宇宙3000案例亦已通過，遠端以最新HEAD為準。

最後有效規格稽核：fingerprint排除零層能量場的無效field／fieldInk／culture，以及文化角度取餘數後相同的配置，不能用未生效欄位湊唯一率；普通怪實際0層、菁英1層、Boss2層。273色彩／413實際效果組合、895外觀、非白名單完全重複0不變。加嚴像素比較再次通過，最近配對仍mean21.2333。完整39原型GM／動畫／故障／快速切換／授權隔離三視窗及260跨模式／降級／資源回收通過。

手機驗收頁記憶體上限：每頁最多40張256px靜態快照（約10MiB），換頁主動將舊Canvas縮至1px後移除，另保留一張焦點預覽。銀河500身份可按頁／上一隻／下一隻完整走訪；異宇宙每組十版仍一次完整並排，沒有常駐500個Canvas。390px實測分頁、回上一頁、鏡像六張、異宇宙十版及零pageerror通過；不等於iPhone硬體驗收。

## 正式工程發布紀錄（人工項目另列待驗收）

- 整合PR：[ #97](https://github.com/franksky1207/rpg/pull/97)，已squash合併；最終PR HEAD `bf26305c02285cab48dc8f5d88be97dff135355e`，六支workflow／14項檢查全部success。
- 功能main：`6caa0664db5cbd413620a35c8f7b5648ce671844`；13支適用workflow全部success，包含Runtime兩個job、Functional CI全模式與Pages build／deploy。
- 正式人工驗收入口：[手機／桌機比較頁](https://franksky1207.github.io/rpg/3d-test/monster-appearance-review.html)。以正式Actor產生靜態圖，異宇宙20組各十版完整檢視；大分類分頁至多40張。
- 最終PR證據：[Functional CI／完整artifact](https://github.com/franksky1207/rpg/actions/runs/40082829551)、[Runtime Integrity](https://github.com/franksky1207/rpg/actions/runs/40082829548)。Artifact [12556291928](https://github.com/franksky1207/rpg/actions/runs/40082829551/artifacts/12556291928)，22,855,569 bytes，SHA256 `0672226ad00210a5ae243fef11f3384d94678e02abee868d626c75687310cebc`；已下載逐份讀取，不以啟動或舊SHA代替成功。Artifact依現有政策保留14天，正式比較頁與指紋JSON可永久重現。

| 功能main工作流 | 結果／證據 |
|---|---|
| Asset Version Manifest | [success](https://github.com/franksky1207/rpg/actions/runs/40084556654) |
| Equipment 2.5D Formal Battle | [success](https://github.com/franksky1207/rpg/actions/runs/40084556619) |
| Equipment 2.5D GM Integration | [success](https://github.com/franksky1207/rpg/actions/runs/40084556680) |
| Functional CI | [success](https://github.com/franksky1207/rpg/actions/runs/40084556599) |
| GM 3D Test Center Browser | [success](https://github.com/franksky1207/rpg/actions/runs/40084556633) |
| Galaxy 3D Button Browser Smoke | [success](https://github.com/franksky1207/rpg/actions/runs/40084556607) |
| HTML JS CSS Cache Version Guard | [success](https://github.com/franksky1207/rpg/actions/runs/40084556632) |
| Publication Dry Run (Stage 3) | [success](https://github.com/franksky1207/rpg/actions/runs/40084556622) |
| Publish Asset Audit (Stage 2) | [success](https://github.com/franksky1207/rpg/actions/runs/40084556617) |
| Publish Optimized GitHub Pages | [success](https://github.com/franksky1207/rpg/actions/runs/40084556677) |
| Publish Release Gate (Stage 4) | [success](https://github.com/franksky1207/rpg/actions/runs/40084556672) |
| Runtime Integrity | [success](https://github.com/franksky1207/rpg/actions/runs/40084556597) |
| Story Integrity | [success](https://github.com/franksky1207/rpg/actions/runs/40084556605) |

### 最終驗證結果

- 1705身份（1695正式mapping＋10高維投影）、895有效外觀；273實際色彩組合、413實際效果組合。200組異宇宙五階＋10組高維王／投影明確白名單；非白名單完全重複0。原始JSON palette欄位保留相容性，不能以舊palette字串判定現行生效外觀；正式來源是共用解析／paint。
- Chromium與WebKit各895款、各18221同原型跨模式配對、原Alpha逐像素不變、近似警示0；最近平均RGB距離分別21.2333／21.1717。兩瀏覽器各20組×十版完整比較圖，非只抽樣幾張。這不是人工視覺核准。
- 最終PR artifact內1827原身份、222副本／特殊、180災厄／高維／投影、3000異宇宙三視窗案例，合計5229，全部通過。保留原尺寸／分離／裁切／六動作／死亡清空門檻，並逐RGBA確認GM與正式畫面一致。609歷史套件的27個special正式不適用案例未冒充正式通過；18特殊怪×紀元×三視窗的54案例由副本／特殊套件另驗正式。
- 本機最終HEAD `bf26305c02285cab48dc8f5d88be97dff135355e` 的Batch6 32/32類別、36個不同原始測試，同次完整執行通過；260次跨模式、39原型GM三視窗、故障恢復／快速切換／授權隔離與Khronos GLB零errors／warnings通過。
- 正式Pages：67檔（程式、映射、資源池、玩家來源、所有39原型及現役紀元素材）HTTP／SHA256與功能main逐位元一致；已以正式站重跑60個三視窗／三紀元原生異宇宙入口，全部通過。
- 正式站圖鑑1735檢查、1705目錄、零pageerror。首輪路由中斷被Service Worker快取服務，未觸發預期故障；沒有當作功能成功。後以僅隔離SW的測試載具重跑全部原斷言通過，獨立SW實測仍啟用，驗94項暖快取、損毀修復與預設單項失敗後的清除重載；不刪除或放寬故障斷言，也未為測試修改遊戲程式。
- [Pages build／deploy同功能main成功](https://github.com/franksky1207/rpg/actions/runs/40084556677)。本次文件補記只更新三份Markdown，不改任何Runtime或素材，不冒稱文件SHA另跑完整Runtime；補記後適用Actions／Pages以最新main工作流紀錄核對。

### 人工視覺與 iPhone 真機待驗收（未列成功）

入口：https://franksky1207.github.io/rpg/3d-test/monster-appearance-review.html

- [ ] 正常遊戲顯示尺寸下，比較同圖五隻、相鄰身份、同原型跨進度；逐一確認色彩和靜態造型不是近似重複。
- [ ] 實際圖鑑上一隻／下一隻切換，涵蓋宇宙100王、兩類災厄、高維十王與跨模式共用原型。
- [ ] 20組異宇宙各十版本完整200款，每組均同時具有清楚色彩與靜態效果差異；同一宇宙五階允許完全相同。
- [ ] 強度順位與效果上限觀感：異宇宙＞高維＞宇宙災厄＞銀河災厄＞副本＞特殊＞地圖；普通／菁英／Boss層次有感。
- [ ] 高維競技投影沿用十王；鏡像能一眼辨識，玩家裝備、身形與六動作沒有被靜態光紋遮蓋。
- [ ] iPhone Safari 的色彩、零模糊邊緣、裁切、Canvas回收與降低動態設定；反覆切換、鎖屏／切App、長時間溫度、耗電及記憶體。

自動化像素距離、指紋唯一率及桌機WebKit不能代替以上人工驗收。沒有真帳號雲端往返硬體證據也不列成功。
