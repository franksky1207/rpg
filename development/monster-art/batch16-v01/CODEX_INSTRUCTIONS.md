# Codex 後續整合指引（僅供未來授權時使用）

1. 以 `franksky1207/rpg` 最新 `main` 為唯一來源；先讀 `PROJECT_HANDOFF.md`、`docs/MONSTER_ART_PRODUCTION_SOP.md`、`docs/BATCH15_4_FORMAL_GM_ACCEPTANCE_2026-10-21.md` 及實際程式。**本包不授權直接施工。**
2. 驗證本包 `manifest.json` 的 WebP SHA-256、512×512、RGBA Alpha（有真正透明像素）、左向 3/4、完整輪廓。不要重壓既有 20 張圖。
3. 先核對 `dungeonvoid.js` 中四種正式名稱是否完全一致，以及來源身份鍵、類別與呈現模式；不可用模糊名稱匹配。只在明確授權的虛空幻境模式啟用。
4. 沿用現有 `MonsterActor`、`monster-sprite-pool.mjs`、`monster-formal-resolver.mjs`、`t3b-formal-renderer.js` 與 `applyBattleSpriteLayout`。新資產應依目前的 `data/monsters/monster-assets.json`、`monster-mappings.json`、`monster-variants.json`、`scripts/generate-monster-trial-registry.py` 的單一來源流程登錄，不要手改衍生檔或另外建立版面 owner。
5. 四種身份共用一個 assetId；顏色／效果應是身份層資料。建議：幻境遊魂幽藍慢漂浮；異相戰影暗紅紫輪廓光；迷界殘像青紫輕殘影；空間殘響深紫短脈動。上述色彩／效果為設計提案，須實測後確認；不能假稱既有濾鏡已能達成。
6. 副本怪物與玩家的**實際 Alpha 可見高度**比例須在 [1.00, 1.50]；怪物本體量測不包含外圍光效。GM 與正式戰鬥使用同一比例；狹窄手機舞台雙方一起等比縮小。不要改動第一大批地圖怪物的 >=0.90 下限，也不要恢復已刪除的 `monster-visible-size.mjs`。
7. 使用既有 idle/attack/hit/dodge/return/defeat 動作與正式戰鬥事件，不建立新回合計時器，不改傷害、獎勵、存檔或背景戰鬥。效果避免半月光波、全畫面扭曲、高成本持續粒子與畫面跳動。
8. 資源預載、載入失敗 fallback、SHA 驗證、清空後重下載、下載中切換戰鬥、dispose/late lease 必須維持現有可靠性；避免手機過熱。
9. 正式驗收須包含四種身份 × 桌機 1365×900、手機直向 390×844、手機橫向 844×390，真實 Alpha 高度比例、可視辨識度、左右對打、無裁切、GM/正式一致、跨模式切換、Actions 與 Pages。後續整批驗收仍需涵蓋全部授權副本身份，而非只測這張圖。
10. 高維十王、高維競技場及其他高維相關內容全部延後；鏡像戰使用玩家角色 Sprite，不應錯用此圖。

## 建議啟動提示（使用者明確授權後才執行）
「請以 GitHub 最新 main 為唯一真實來源，先核對本 ZIP 的 manifest 與現有怪物 SOP，確認四個虛空身份的實際鍵值與正式 Renderer 接入方式；在不改動戰鬥邏輯與既有地圖怪物尺寸規則的前提下，依第16批規劃整合虛空幻影。每批完整施工、自我檢查、同 SHA Actions、合併後 Runtime/Pages 驗收後再回報。」
