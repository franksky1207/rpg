# 第7批高維v2替換整合驗證

## 1. 修改內容

承接既有PR #38，基準9bd97344abdd6847ad3f91cacea4053851e292bc；main基準29ab70fdc791dbbdce0e276a282f2e6b163f276b。新版三張PNG無損入庫，原包manifest／README逐byte保留。原來源metadata保存在source-history.json，不再作為有效高維設計依據。

刪除舊高維：

- `development/combat-animation/batch7/layer-sources/higher_weapon.png`
- `development/combat-animation/batch7/layer-sources/higher_attack_body.jpeg`
- `development/combat-animation/batch7/layer-review/higher-review.png`
- `development/combat-animation/batch7/approved-sources/higher_approved_master.jpeg`
- `development/combat-animation/batch7/candidates/higher-full-candidate.webp`

新版診斷另命名higher-v2-review.png。移除舊高維mask recipe；生成器不再重建舊高維。更新approved／layers／candidates索引、三紀元review與audit、來源交接、整合報告、六層報告、交接與PATCH_REQUESTS。

撤銷：披風獨立層、前星環、後星環、四星體、動態披風幀、完整隱藏披風補繪。新高維無披風、無星環、無漂浮星體；只需完整角色、無武器身體、獨立武器。原正式遊戲穩定資源、銀河與宇宙來源不刪除。

## 2. 程式與素材自我檢查

| 新高維原檔 | 尺寸／模式 | SHA-256 |
|---|---|---|
| higher_complete_master_v2.png | 1024×1536 RGB | `d0a934a3d44bd36f3da12d2169b089020cb37d818cbd41dca8fd2053f24bf661` |
| higher_body_no_weapon_v2.png | 1024×1536 RGB | `7dff371cf2aac63478f2b5eada2a85313da2944ca591d20718d15ba94461bb7b` |
| higher_weapon_independent_v2.png | 1024×1536 RGBA | `1bd7d53030efabc1d0c08e1c9659221e9dd323bd16a06a9366a5574fb43494c1` |

三檔bytes／SHA與原包manifest吻合。完整圖及身體為RGB PNG，沒有透明Alpha；獨立武器為RGBA，Alpha範圍0–254（不因最大值254判壞）。

| 重組檢查 | 銀河 | 宇宙 | 高維v2 |
|---|---|---|---|
| 原座標 | 身體／武器非直接同座標，需相似變換 | 同左 | 同左；原始1024×1536不代表已對齊 |
| 手部遮擋 | 劍柄覆蓋拳面；前手指遮罩未核定 | 劍柄／拳面深度未核定 | body左手x250–375、y690–845為張開手掌；master是握柄，不能直接疊柄 |
| 握點 | 診斷估計，finalGrip=null | 同左 | 護手／劍尖擬合後握柄仍偏離張開手掌；finalGrip=null |
| 與完整圖一致 | 腿甲接縫／指節待局部修補 | 另一側拳與右靴也改變 | 原獨立劍握柄有菱形甲飾，母圖握持段不同；需按母圖修柄與指節深度 |
| 透明Alpha | body JPEG無Alpha | body JPEG棋盤為實際像素 | master及body RGB PNG無Alpha；精準matte未允收 |
| 512清晰度 | 已生成512座標比較 | 同左 | 身體輪廓可辨，手柄錯位仍可見；非正式透明驗收 |
| 正式Sprite | 阻擋 | 阻擋 | 阻擋 |

三套完整母圖、身體、護手／劍尖擬合、手柄局部與512座標證據位於layer-review。圖為診斷，保留來源背景，不是Sprite。現行六動作×三紀元18項全部仍blocked-not-accepted；未輸出新正式WebP，未接入新素材Renderer／GM，未改玩法數值或Save Schema17。候選發布／GM旗標全部false，真實Pool零下載／解碼及Actor失敗釋放仍受測試保護。

## 3. GitHub Actions與驗收

最新提交SHA與同SHA Actions連結以既有PR #38說明為準，避免填入自身SHA後再產生未驗收提交。舊SHA綠燈不是本次結果。工程安全測試不代表素材允收。

本機已通過：37項Sprite／武器／Formal／GM單元測試、3項候選真實Pool／Actor隔離測試、15項Python素材測試、原圖與新包SHA／bytes核驗、三紀元Alpha／重組audit、Batch5外觀契約、兩組歷史清理保護、Publish Dry Run／發布政策回歸及GM stage依賴驗證。原發布檢查起初因尚未stage刪除而讀到舊Git索引，stage後以原斷言重跑通過；歷史保護缺物件則正常fetch補齊。未放寬或停用驗證器。

本次沒有玩家載入JS／CSS或正式素材變更，因此不更動正式快取版本；高維工程review版本為20261018-higher-v2，原包及新來源由SHA鎖定。正式WebP／cache版本須等素材通過允收才一起更新。

正式戰鬥、GM、Sprite與Publish／Release Gate可驗證現役安全與候選排除；新版三紀元18動作、精準透明邊緣與握點尚未允收。Pages不部署未允收候選。iPhone／Safari真機、發熱與真帳號雲端未測。

## 4. GitHub提交與待補

沿用PR #38及原分支，保持Draft，不合併main。未施工第8批或Issue #37。

精確待補：銀河前手指節／護腕深度與腿甲局部，宇宙真Alpha及原右拳／右靴恢復，高維v2左手持柄局部與同一把劍握柄／護手回配、RGB去背。完整要求見PATCH_REQUESTS；不再要求任何舊高維附屬層。待三套重組、Alpha與握點通過後才做正式WebP／Renderer／GM／新六動作及Pages驗收。
