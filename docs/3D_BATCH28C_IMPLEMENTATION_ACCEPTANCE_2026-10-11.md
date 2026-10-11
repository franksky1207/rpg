# 《文明戰線》3D 第 28-C：古代科技遺址第一套正式五槽

起始 main：`76351e0967aa35adab3e9707f020b0dea26afbfc`。2026-10-11。僅製作銀河紀元→地球戰爭→古代科技遺址 Lv.31～35 的五件，嚴格來自 `worldmaps-earth.js`；不是 1,050 件裝備完成。裝備美術由使用者驗收，**尚未真 iPhone 驗收**。

## 1. 修改內容

| 槽 | 正式名稱 | 正式模型／跟隨 |
|---|---|---|
| weapon | 古代光刃 | 原創厚刃／青藍刃緣、護手、握柄、尾端；socket.weapon.R rigid；場景內可恢復右指握持，不改 bind／原 idle |
| helmet | 遺物守衛盔 | 封閉冠頂、兩側、後腦與下顎，完整不透明感知面甲；53-bone skin 的 head 權重，沒有露眼／鼻／口／透明面窗 |
| armor | 自律護衛甲 | 鈦灰胸／背、肩甲、前臂護甲、分節腹甲、腰帶／髖下擺；單一 armor 槽、分件 bone weights 隨 shared 53 joints |
| shoes | 遺跡浮行靴 | 成對鞋頭／厚底／踝護甲、側推進殼與青線；一槽一容器，左右 foot/shin 正確骨骼同步穿卸 |
| accessory | 古文明鑰印 | 背甲外側的古金厚鑰／內凹青藍核心／八角結構環；socket.accessory.back rigid；不將 resolver 寫死為背包 |

- 每槽 3 真 LOD，共 15 GLB。五材質最多，沒有新增貼圖、CDN、套件、獨立動畫；原創自製 CC0 幾何與來源工具。不是 primitive 佔位物：模型有完整自訂 profile、厚度、倒角、分件和前後面。
- `.blend` 保留人物 reference、原 rig／九掛點／idle、五件獨立可編輯 mesh／材質與權重；source 工具和驗收圖全部在 `development/3d-source/equipment/ancient-ruins-v1/`，不進 Pages。
- **人物 Blender 原檔和三個 GLB 一字節未改**。原 53 joint 名稱、父子、rest matrix、inverse bind、原權重與九 socket 完整保留。`rig-contract.json`、`source-validation.json` 可核對。
- 延伸原 `prepareEquipment()`／`equipmentSession()`；skinned 重綁前檢查 53 joint order/name/parent/index/bind，再使用人物 skeleton；rigid 只接正式 socket。registry/scripts validator 同時嚴格檢查權重、inverse bind、來源、SHA／bytes、LOD、嵌入資源和發佈閉包。
- 原 readonly capture／GM 同源 bridge 不變。名稱與 world 精確命中本套，其他未建模名稱不冒充此套。`equipmentFamilies` 允許後續家族沿用同介面擴充；人物 registry 重產工具保留設備與遮蔽，人物 SHA 改變時要求重產遮蔽而非默默接受舊分區。
- GM 既有五槽陳列載入同一 GLB；rigid 額外 display rotation 只用於陳列，避免 socket-local 武器在櫃台橫躺。沒有新 GM 案例或權限功能。
- 覆蓋 face/chest/boot/back 的**保守局部三角形分區**綁人物 LOD SHA；只改場景獨立 index GPU buffer，原頂點／skin／CPU bytes 不變。頭盔實體封閉幾何負責完整遮面；分區未覆蓋全部頭、髮、軀幹、腳，不粗暴整顆隱藏。卸裝／失敗恢復原 index 陣列。這不是完整布料／所有攻擊姿勢的碰撞求解。
- 逐槽 404／SHA／缺模型回退為該槽未安裝且人物基底可見；陳列保留已有程序替代。其餘成功槽與人物不受影響，後續更新可重試。空槽不下載、不顯示正式裝備。
- 同一既有 CPU LRU 依全套需要擴為 **8 buffers 且 16 MiB** 雙上限，GPU containers 仍各場景專有／退出 dispose；沒有平行 SW／第二快取。新資產均 preload=false，不加入 49 媒體預載。
- HTML cache-bust、JS 動態 fallback、resource-manifest 更新；未更動 Service Worker、音樂、戰鬥、正式強化／數值／掉落、存檔或雲端。
- 修正最新 main Runtime 失敗日誌的舊測試預期：先前 main 已把宇宙強化成本改為 v2／每件 200 暗能量，三件花 600，950 剩 **350**；舊測試仍期待 50。本批只更新具體測試結果，保留 steps／數值／交易回滾等重要斷言，沒有改公式。

## 2. 實際自我檢查

- 保存 `.blend` 可開啟；53 骨骼、九掛點 rest local、accepted source digest、三 skinned mesh 正規化權重；八姿勢有限值且每個剛性甲片 edge ratio 在 .99～1.01。
- Khronos glTF validator：人物三件＋裝備十五件 **18/18，零 error／warning**。人物舊驗收強度保留；新 joint 名稱／inverse bind 毀損負例必須失敗。
- 原生 Babylon：空裝、五個單件、五件全穿、移除任一槽保留另外四槽；雙靴同步；卸裝 index 精確回復，武器右指姿勢復原；30 次穿卸 equipment containers 固定 0／5，退出 0。
- 8 組實際頭／肩／肘／脊椎／髖／膝／踝／手骨姿勢變形，非僅靜態字串；封閉頭盔從三個臉部高度、八個方向 **24 條實際網格 ray** 均先命中面甲／封閉 shell。
- 正式頁、真實同源 GM iframe 的隔離 session fixture、GM 自由區域選取與裝備陳列；三 LOD、desktop／390×844 viewport、手機最大化／還原、實際 GLB 解碼與 shader。
- 注入 helmet 404 與錯 SHA：人物及其餘四槽成功，原臉部無殘留遮蔽；既有 session stale race／卸裝／close 仍測。
- 保留舊人物 browser 10 次重開、PBR／atlas／骨架動畫、WebGL context loss 與釋放；GM 31 場景 regression、音訊 lifecycle 50 browser cases／20 VM cases＋正式 audio regression／單一 SW cache／GLB Range／發布 HTTP bytes/指紋／17 音檔解碼均實跑通過。
- `3d-equipment-assets-browser.js`／`3d-equipment-contract.cjs` 加入 Runtime、Stage 4、Optimized Pages，report 隨 Actions artifact 保存；沒有停測或忽略 error。

本機瀏覽器使用系統 Chromium＋SwiftShader；正式帳號／雲端未寫入，viewport **不是**真 iPhone。完整碰撞／動作長測與實機 GPU 不作已完成宣稱。Actions／Pages 結果以**最終 main SHA** 的連結與 artifact 為準，最終交付附 SHA。

## 3. 實際圖片

所有圖片來源是已保存 Blender 的 Cycles 或真正 Babylon 畫面。

- Blender：[正面](../development/3d-source/equipment/ancient-ruins-v1/review/front.png)、[側面](../development/3d-source/equipment/ancient-ruins-v1/review/side.png)、[背面](../development/3d-source/equipment/ancient-ruins-v1/review/back.png)、[封閉頭盔近景](../development/3d-source/equipment/ancient-ruins-v1/review/helmet.png)、[關節姿勢](../development/3d-source/equipment/ancient-ruins-v1/review/joint-pose.png)。Blender 圖是原始 idle，握持 overlay 在 browser。
- 正式手機放大：[正面](../development/3d-source/equipment/ancient-ruins-v1/review/b28c-formal-mobile-max-front.png)、[側面](../development/3d-source/equipment/ancient-ruins-v1/review/b28c-formal-mobile-max-side.png)、[背面](../development/3d-source/equipment/ancient-ruins-v1/review/b28c-formal-mobile-max-back.png)。
- [正式桌機](../development/3d-source/equipment/ancient-ruins-v1/review/b28c-formal-desktop-front.png)、[GM 人物](../development/3d-source/equipment/ancient-ruins-v1/review/b28c-gm-front.png)、[GM 真裝備陳列](../development/3d-source/equipment/ancient-ruins-v1/review/b28c-gm-equipment-display.png)。

## 4. 效能與容量

| 項目 | 實測 bytes | 十進位 MB |
|---|---:|---:|
| 首套五槽 low 合計 | 283,084 | 0.283084 |
| 首套五槽 medium 合計 | 351,184 | 0.351184 |
| 首套五槽 high 合計 | 394,592 | 0.394592 |
| 五槽全部 15 GLB | 1,028,860 | 1.028860 |
| 新裝備可編輯 Blender 原檔 | 18,710,308 | 18.710308 |
| 起始 main 的實際精簡成品 | 35,330,335 | 35.330335 |
| 本批實際精簡成品（381 檔） | 36,454,816 | 36.454816 |

數字來自真正 build 輸出逐檔加總，不是靜態推估；新成品相對本次起始 main 增加 1.124481 MB。原人物三 GLB 共 7,443,320 bytes 不變。32 WebP／17 OGG／49 media preload 保持。

完整 GitHub tracked 檔案容量與排除容量見 [capacity JSON](3D_BATCH28C_CAPACITY_2026-10-11.json)；其中涵蓋來源、圖片、文件，且因報告自己也占 bytes，最後以 exact-commit Actions 的 `publish-stage3-report.json` 為準；不把 tracked blob 容量說成 Git history／clone 容量。

首次／熱開本機數據和完整 metadata 見 [browser measurements](3D_BATCH28C_BROWSER_MEASUREMENTS_2026-10-11.json)。本次與其他回歸並行，數字不是性能保證或優化前後對照；熱開成功復用已驗證 bytes，**0 GLB 新請求**。沒有宣稱跨 refresh 持久 GLB cache、FPS／真手機耗電改善。

## 5. 使用者實機待驗／28-D、29～30

1. **尚未真 iPhone 驗收**：Safari 直立／橫向正側背、全套和五單件、封閉盔不露臉／卸盔回原臉、雙靴／握柄／掛點、zoom／旋轉／放大還原；普通預覽距離的美術可讀性。
2. 桌機與 iPhone：已有該套真物品的正式角色與 GM 正式同步外觀一致；未持有時可在 GM 自由「銀河→地球戰爭→古代科技遺址」查看，勿為驗收改正式存檔。
3. 真機 30 分鐘反覆開關／換 LOD、背景切回、弱網、熱量／FPS／記憶體；本批只有自動化釋放／LRU 與網路代理證據。
4. 28-D：更多極端攻擊與握持動作／碰撞、長測；29～30：其他 209 套名稱家族。沒有擴做新裝備數值、正式換裝交易或完整 3D 模式。
5. 裝備美術封版由使用者根據以上實際圖片和真機決定。本批沿用既有 Pages source／workflow，不切換發布來源。
