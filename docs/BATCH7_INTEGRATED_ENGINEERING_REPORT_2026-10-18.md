# 第7批整合施工報告（未封箱，禁止合併）

## 1. 修改內容

承接 `franksky1207/rpg` 原草稿 [PR #38](https://github.com/franksky1207/rpg/pull/38)，沿用分支 `batch7-era-player-sprite-20261018`，基礎施工 SHA `ba17656da5e03b6db3af5a100b1cb4703408c619`；fresh-read main 為 `29ab70fdc791dbbdce0e276a282f2e6b163f276b`，main 是分支祖先。保留原 PR 的全部合法修改，沒有重建第7批或另開 PR。

- 三張核准母圖與 ZIP 原 manifest／README 無損保存於 `development/combat-animation/batch7/approved-sources/`，沒有重複提交 ZIP。
- `mask-recipe.json` 記錄可重建去背種子、原尺寸及腳點；`scripts/batch7-prepare-candidates.cjs` 以 ImageMagick／Node 做連通區 Alpha 遮罩和統一縮放，不改角色 RGB。銀河保留原 Alpha；宇宙／高維只移除已盤點的白底負空間，保護白甲。
- 三張 `*-full-candidate.webp` 為 512×512 透明、右向3/4、pivot [0.5,0.9] 的候選完整角色。獨立 ID 為 `era-galaxy`／`era-universe`／`era-higher`，不是 G005/G007/G018。候選 manifest 記錄來源、SHA、容量、縮放／座標與未完成圖層。**acceptedLayers 為空，formalReleaseAllowed／formalBattleAllowed／gmPreviewAllowed 均為 false。**
- 修正 `era-appearance-contract.js`：從正式全域 lexical `state` 讀取轉生次數，避免 `window.state` 為 undefined 而永不解鎖；匯入／雲端置換 state 後即時重新讀取，不持有舊 reference；本機進度 owner 與登入帳號不符時拒絕解鎖，登出事件立即鎖定。
- 修正 `mode-foundation.js`：設定頁依 `currentWorldPhase()` 與正式紀元 roots 顯示目前外觀，不使用不存在的 `state.world`。明示新素材尚未正式推出，偏好僅本裝置／登入帳號，無跨裝置同步或隨存檔傳輸承諾。保留首次轉生預設高維、再次轉生保留選擇、下一場安全套用的既有契約。
- 更新兩個 JS 的 HTML 指紋及歷史 HTML 精確比較測試的對應指紋；沒有刪斷言、停用測試或擴大允許的 HTML 變動。
- 新增真頁面桌機／手機外觀測試、不可變來源／非發布邊界測試、Pillow 唯讀圖檔稽核及第7批安全 Actions。更新 handoff、來源交接與施工狀態；具體補圖要求在 `development/combat-animation/batch7/PATCH_REQUESTS.md`。

**正式 Renderer／SpritePool／GM／舊正式資源未換成候選素材。** 現役 G005/G007/G018 仍是未改動的既有發布，不能認列為新的三紀元外觀。這保留既有合法戰鬥，也避免把沒有攻擊身體的切圖假裝完成動畫。Save Schema17、雲端 owner、實際裝備、數值、結算、背景／離線、音效與 SW 未更動。未施工第8批或 Issue #37。

## 2. 程式及素材自我檢查

原檔 byte 數／SHA 全部與 ZIP manifest 相符；PNG RGBA／JPEG RGB 及尺寸經 Pillow 核對。

| 原圖 | 尺寸 | bytes | SHA-256 |
|---|---|---:|---|
| galaxy_approved_master.png | 1254×1254 | 963810 | `06e4bf6bb0ce50f4b90d8111db3608821ef0d582400cc760920abbfb45a54e56` |
| universe_approved_master.jpeg | 1254×1254 | 294184 | `e1b438fb7f7221d05a0468277f3e53e62173e95fd553d22cf333bea31e016239` |
| higher_approved_master.jpeg | 1024×1536 | 587032 | `43e80f7a84ccc41f9716a1f5aba6f08d4b9fd2c969c74010fb3422b61c54f3b6` |

| 候選完整切圖（均512×512） | bytes | SHA-256 |
|---|---:|---|
| galaxy-full-candidate.webp | 93246 | `bceb46a4c91d91afae79712e2fe88d9cda9e99815f44819be2f445421a0a860e` |
| universe-full-candidate.webp | 108134 | `9fcdc4b0e47c487bdf65907d4857b7545aff883fe06f3b18c8e0d911ac1561d0` |
| higher-full-candidate.webp | 151336 | `736b0fe6ea4b0fc794f301da75b18516c307944352c45fa3428895fa65ff8a45` |

銀河原 Alpha 範圍 0–255、四角透明，有 1,181,240 個全透明像素；alpha=1 遠端雜點使原圖完整 Alpha bounds 延伸至上下邊界，不能把原透明檔直接當已清理完畢。宇宙劍光仍有白色 matte；高維細金線白邊／封閉空隙未允收。三張候選縮放後四邊沒有裁切，但腳點／握點仍需圖層完成後正式視覺驗收。

已嘗試局部影像編輯：銀河去劍試稿改動腿甲；宇宙去背試稿無法證明保留全部母圖色彩；高維去背試稿出現額外光暈。這些生成試稿不採用、不入正式資源。候選完整切圖不等於分層；沒有合格的獨立武器、無武器攻擊身體或高維完整披風／星環／星體層，不能宣稱新六動作通過。

本機新增測試實際通過：來源及候選 SHA／格式／Alpha、Batch5/7 契約、正式 lexical state、三紀元設定文字、歷史轉生／合法 Schema17 migration／舊版污染 migration、首次預設／重複轉生偏好、混穿不變、帳號 owner mismatch、登出／重新登入／reload、手機選單寬度、外觀選擇不寫正式 save。另經**實際 cloudsave upload/download owner + 本機服務替身**確認偏好不進 payload，下載／migration／save／reload 後保留本帳號偏好；不代表真帳號遠端服務驗收。

### 固定30項覆蓋與缺口

「契約通過」只指已測的程式契約，不代表新素材或正式發布完成。

| 項 | 狀態 | 證據／缺口 |
|---|---|---|
| 01 | 已盤點 | contract、armor selection、formal sprites、Actor/Pool、Renderer、GM、資產與發布依賴已讀；舊資產保留。 |
| 02 | 部分 | 新外觀契約不讀五槽；正式 Renderer 仍是舊裝備選圖，待新層完成才替換。 |
| 03 | 契約通過 | 正式 currentWorldPhase 三紀元與設定文字測試；新三套實際顯示尚缺。 |
| 04 | 契約通過 | lexical 正式 count、歷史已轉生帳號、合法 migration；拒絕異帳號本機進度。 |
| 05 | 契約通過 | 首次預設高維，選擇後 count 增加仍保留；新 Sprite 視覺尚缺。 |
| 06 | 本裝置策略通過 | 帳號鍵值隔離與儲存失敗安全回退；不變更 Schema17，不聲稱跨裝置同步。 |
| 07 | 來源完成／Sprite未完 | 銀河母圖 SHA／Alpha 合法，候選切圖未有攻擊層。 |
| 08 | 來源完成／Sprite未完 | 宇宙原圖合法；白底初步遮罩，劍光去污染待修。 |
| 09 | 來源完成／Sprite未完 | 高維原圖合法；白金、披風、星環／星體保留，精準遮罩與獨立層待修。 |
| 10 | 阻擋 | 固定武器設計保留於母圖，獨立柄／手遮擋未補齊。 |
| 11 | 部分 | 512候選與 pivot／重建 recipe；沒有以三張完整切圖冒充可動畫分層。 |
| 12 | 來源保留 | 不改原人物設計／顏色／風格；小尺寸三套比例待新層視覺允收。 |
| 13 | 阻擋 | 現役六動作契約保留，新的三套六動作尚不能驗收。 |
| 14 | 部分 | 候選獨立 era-* ID，禁止發布；尚未正式 Sprite 登錄。 |
| 15 | 部分 | 原檔／候選 SHA、bytes、尺寸、來源、Alpha 測試；精準 matte／分層／握點未允收。 |
| 16 | 保護／未新增 | 候選不載入／不解碼，舊 Pool 引用與上限保留；新層負載未測。 |
| 17 | 阻擋 | 不改事件、傷害或時鐘；新外觀未接正式 Renderer。 |
| 18 | 阻擋 | 舊 GM 測試中心維持；新三套六動作／握點不能測成已完成。 |
| 19 | UI契約通過 | 桌機與390×844 viewport 下三選一、鎖定、預選、原動畫開關；明示尚未推出。 |
| 20 | 相容性通過／遠端未測 | 真頁面 A/B／登出／重登入／local owner／服務替身雲端測試；真帳號未測。 |
| 21 | 既有保護 | 沿用現役文字／極簡／背景／缺圖回退；新層故障路徑待正式接線。 |
| 22 | 既有保護 | 沒有新增 RAF、Canvas、listener 或 decode 流程；新 Sprite lifecycle 尚未驗收。 |
| 23 | 相容性通過 | 舊版污染丟棄、合法17轉生可讀、實際下載 owner＋reload；Schema17不變。 |
| 24 | 契約保留／新呈現未測 | 選擇只存設定、發 next-battle 事件、不重建進行中戰鬥；新 Sprite 安全切換待接線。 |
| 25 | 部分 | 候選右向／同畫布與定位；反向、握點、深度、攻擊位移待層完成。 |
| 26 | 來源工程完成 | 原檔、manifest、recipe、來源用途與補圖要求已保存；補繪來源尚缺。 |
| 27 | 既有保護／新發布未完 | HTML 指紋更新，候選排除正式 stage／manifest；新 Sprite SW 與公開版本待發布。 |
| 28 | 既有隔離保留 | 正式偏好不讀GM fixture；本次不給候選 GM 預覽權，不變更舊GM授權。 |
| 29 | 部分 | 既有 presenter／背景／GM／Cache 壓力回歸；新三套解碼／Canvas壓力無可用素材，未測。 |
| 30 | 未完成 | 有本機／Actions工程安全驗收；缺圖層與正式新素材驗收，草稿PR不合併。 |

## 3. 實機與 GitHub Actions 驗收

本檔建立時為施工文件，**最新實際提交 SHA 與 Actions 成功／失敗／未測紀錄統一記在原 [PR #38 說明](https://github.com/franksky1207/rpg/pull/38)**，避免為填入自身提交 SHA 而造成新的未驗收提交。Actions artifact 保留本機服務替身外觀與來源稽核證據；第7批安全 workflow 綠燈僅表示非發布邊界與已施工契約通過。

使用現役 Runtime／正式 Battle／GM／Sprite／Save／Cache／Publish suite 驗證受影響範圍，不停用測試。CI desktop/mobile viewport 不是 iPhone 真機；真帳號 Supabase 上下載、iPhone 發熱／熱節流、Safari 真機及新三套動作均未測。舊角色的正式戰鬥測試成功不能當新主角動作成功。

正式 Pages 檢查限於既有 main 的線上部署／快取；**未發布本分支新主角**，不進行會把缺層候選上線的 Pages 部署。

## 4. GitHub 提交與待補事項

唯一施工 PR 為 #38，保留草稿；本次施工 commit 與 CI URL 以原 PR 最新說明為準，main 未合併。三張原圖 SHA 固定如上；候選不能設定成 complete 或解除 release flag。

下一步先依 `PATCH_REQUESTS.md` 補齊必要局部素材及精準 matte；再核對新 ID／正式登錄／Actor分層／握點／同一Presenter／GM六動作／手機桌機／快取與發布。圖層未通過前，第7批不能完成。第8批與高維十王 Issue #37 保持不動。
