# 第 27 批人物美術補修：真人比例科幻戰鬥服（待使用者外觀確認）

日期：2026-10-11，Asia/Taipei。起始 main：`993ec3823997281f3445888848cc25c7b56b244f`。本次只補修第 27 批人物；不開始第 28～40 批，不自行美術封版。技術通過與使用者外觀接受是不同關卡。

## 人體與戰鬥服

維持 1.9 m／約八頭身 A pose，重整胸廓、腰與骨盆、三角肌、上臂／前臂、股四頭肌／膝／小腿、足跟與掌部。原創解剖截面經 voxel 重拓樸、表面 relaxation，形成一個封閉連通 quad 網格；取消獨立胸殼、圓球肩殼、膝殼、腰帶硬台階與浮空耳件。五指有不同長度、漸細指端及三段既有骨架；指間間距避免重拓樸黏合。

頭顱、下顎、鼻樑、頰骨及耳部為實際幾何，額頭／眼／虹膜／眉／唇／髮際使用原創 1024 atlas，取代橫條機械面罩。這是沒有表情 rig 的真人形態基座，不宣稱寫實臉部表情或第 31 批動作庫完成。貼身深色織物、柔性炭黑關節、柔性複合布片及少量鈦青縫線為五種 PBR；非大面積金屬胸甲，胸背都有服裝分片，沒有焊死頭盔、背包或正式裝備。

512 織物圖、連續頂點顏色與獨立 roughness 表現剪裁；減少硬邊色塊與過亮金屬。最後修正了 GLB LOD 在頭／領口插值出白色斑塊的來源色值。人物場景另調正面主光方向、增加中性填光、降低藍色側光；只影響角色預覽，未重構其他場景或下載系統。

## 實際 Blender／瀏覽器影像

[全部影像目錄](../development/3d-source/characters/player-v1/review/)。由 Blender Cycles CPU 原生渲染；不是生成式概念圖、加面數紀錄或合成角色照片。可用來源 `render_review.py` 重現相同鏡頭、光源、LOD 及關節姿勢。

| 檢視 | 實際影像 |
| --- | --- |
| 正面 | [01-front.png](../development/3d-source/characters/player-v1/review/01-front.png) |
| 背面 | [02-back.png](../development/3d-source/characters/player-v1/review/02-back.png) |
| 左側 | [03-left.png](../development/3d-source/characters/player-v1/review/03-left.png) |
| 右側 | [04-right.png](../development/3d-source/characters/player-v1/review/04-right.png) |
| 頭／胸近景 | [05-head-chest.png](../development/3d-source/characters/player-v1/review/05-head-chest.png) |
| 肩／臂／手指 | [06-shoulder-hand.png](../development/3d-source/characters/player-v1/review/06-shoulder-hand.png) |
| 腰／髖／膝／鞋 | [07-hip-knee-shoes.png](../development/3d-source/characters/player-v1/review/07-hip-knee-shoes.png) |
| 同鏡頭 low／medium／high，由左至右 | [08-lod-low-medium-high.png](../development/3d-source/characters/player-v1/review/08-lod-low-medium-high.png) |
| 遊戲風格光照 | [09-game-light.png](../development/3d-source/characters/player-v1/review/09-game-light.png) |
| 同一蒙皮實際彎曲 | [10-joint-deformation.png](../development/3d-source/characters/player-v1/review/10-joint-deformation.png) |
| 正式角色頁放大展示 | [11-formal-browser.png](../development/3d-source/characters/player-v1/review/11-formal-browser.png) |
| GM 高畫質最大化展示 | [12-gm-browser.png](../development/3d-source/characters/player-v1/review/12-gm-browser.png) |

這些施工影像及原始工程只留 GitHub，不進 Pages。正式網站展示入口：角色→預覽 3D 角色；GM→3D 測試中心→玩家、裝備與養成→角色全身展示。

## 骨架、蒙皮與換裝相容

全部 53 骨骼名稱／父子／head／tail及九個掛點的父骨與 local matrix 比對均與起始來源相同，[socket-diff.json](../development/3d-source/characters/player-v1/socket-diff.json) 保留舊新值。五槽仍為 weapon.R、helmet、armor、shoes.L（另有 R）及 accessory.back；左右武器、受擊和 root 特效錨點均保留，無座標／縮放遷移。

使用四權重線性蒙皮，Blender 與 glTF 一致，不以 Blender dual-quaternion 隱藏發布變形問題。初版權重邊界的肩／髖／指拉伸已由連續距離權重及柔和解剖支援修正。重新開啟來源驗證一個連通封閉 manifold、有效法線、四權重和總和 1；肘 80°／膝 75°／肩 45°／髖 50°／食指 55° 均通過，最大邊緣拉伸約 1.77／2.45／3.12／1.83／2.99 倍，嚴重壓縮邊零。數值守門不是代替真人對皺褶及關節美術的判斷。low 再匯出的完整 SHA 與發布檔一致。

來源 `region.head/torso/legs/feet/back` POINT Boolean attributes 為未來遮蔽規劃，與骨架權重隔離。頭盔可遮 head、胸甲遮 torso、腿件遮 legs、鞋子遮 feet；背飾只在其覆蓋範圍局部遮 back，不刪除整個軀幹。實際換裝／遮蔽執行留第 28～30 批；原有正式裝備名稱、五槽描述和快照 owner 不變。

## 實際自我檢查

- Blender 4.3.2 原始工程重新開啟、連通拓樸／法線、53 rig／skin／掛點、五種關節彎曲、呼吸及精確 low 再匯出通過；有 10 張實際 Blender 渲染，不以 validator 代替美術。配套沒有 OIDN；使用真正的 CPU samples，未把渲染錯誤當成功。
- Khronos validator 三個 GLB 均零 error／warning；實際 weights、五材質、兩個嵌入 PNG 和尺寸、COLOR_0、動畫、閉包、缺檔／hash／不准源格式／不准預載負向測試通過。匯出時 decimation 混合超過四 influences 的 exporter 訊息由 glTF 正規化為四權重，發布 binary 已逐 vertex 驗證，沒有略過 Khronos warning。
- Babylon 實際 PBR／512 織物及 1024 臉部 readiness、真實骨架呼吸及五種關節 CPU skin deformation 通過。變形檢查涵蓋全部 skinned material meshes，沒有把單一材質不含手指的零位移誤判成整套骨架失效。
- 正式角色唯讀快照、GM 真實同源授權橋接的正式／自由隔離、三紀元、三 LOD、10 次關閉重開、直橫向／最大化還原、真實 WebGL context loss、503 明確 geometry fallback、engine／container 歸零與同頁 CPU bytes 重用通過。帳號是瀏覽器隔離 SDK fixture，不是玩家正式帳號。
- Runtime／Story／Stage 4 的 93 個不同腳本實際完成；相關 cache／音訊／save／公式回歸保留。初次六個轉生 browser 失敗為本機舊 4173 server 空回覆，重啟後六項全通過，沒有改相關正式程式或放寬斷言。精簡成品九項 browser 檢查通過；最後素材／光照再跑人物及發布 gate。
- 本機 Chromium 154／SwiftShader、Playwright 1.55；外部 SDK 的代理憑證問題以既有經 TLS 驗證的官方 SDK fixture 解決，不關閉 TLS。CI 使用正常官方 CDN。手機 viewport 不等於 iPhone／真 GPU。

## 容量與效能

MB＝1,000,000 bytes；發布容量是實際成品逐檔量測，不是 ZIP 大小或靜態推估。完整來源／GLB SHA、比對數值及回歸證據見 [測量 JSON](3D_BATCH27_ART_REPAIR_MEASUREMENTS_2026-10-11.json)。

| 項目 | 補修前 bytes／三角面 | 補修後 bytes／三角面 |
| --- | ---: | ---: |
| Blender 原始工程 | 1,491,612 | 18,361,504 |
| low GLB | 519,184／7,204 | 809,780／8,480 |
| medium GLB | 1,285,168／26,864 | 1,746,540／27,140 |
| high GLB | 4,013,496／107,456 | 5,068,184／108,566 |
| 三 GLB 合計 | 5,817,848 | 7,624,504 |
| 材質／嵌入貼圖 | 5／1（512） | 5／2（512 織物、1024 臉部） |
| 精簡網站成品 | 33,698,840／366 檔 | 35,506,198／366 檔 |

low／medium／high 為雕刻表面 5%／16%／64% 真正簡化，使用服裝邊界／頭／手的柔和重要性遮罩。實際渲染曾發現硬鎖所有邊界耗盡 low 的頭部幾何預算，已捨棄硬鎖試驗；最終每層頭部與五指均保留、三人排開不重疊，不是三份同成本檔案；source quad 表面 84,812 vertices 保持可編輯。原始工程增大不影響 Pages。發布增加約 1.81 MB，主要為五官 atlas、連續顏色、UV／材質分區造成的 exported vertex 拆分，而不是失控增加三角面或全站預載。

首次按需 medium＋decoder 純內容為 2,034,815 bytes（原 1,573,443），low＋decoder 為 1,098,055（原 807,459）；未開人物的文字啟動仍零 GLB。熱開新增模型下載零；關閉 engine/container=0，兩份 CPU LRU 上限不變。新增 1024 RGBA face 的未壓縮 GPU texture 約 4 MB（mips 約 5.33 MB），不是精確 profiler；medium 場景代理 vertices 20,348（原 16,327），materials/meshes 都 6（含平台），不是新增 draw-call 系統。

受控比較在同一 Chromium、相同正式 UI／loader、隔離 context，舊資產從起始 Git SHA 取得並由原 registry SHA 驗證。單次 cold 為 1,314→1,286 ms、hot 為 1,076→1,157 ms；heap／texture 代理值保留在 JSON。熱開增加 81 ms，額外 atlas／顏色／UV 拆分增加解碼和 GPU 頂點成本，但單次差異不足以宣稱性能改善或回退；不能把軟體 GPU、並行測試負載或單次數值宣稱手機效能改善。真機 FPS、發熱、OS GPU 記憶體和 30 分鐘長測待使用者確認。

## 發布、安全、回退與待驗

沿用既有 Optimized Pages workflow／source，未切換 Pages。只發布顯式 registry 的三 GLB、本地解碼器和既有必要程式；源 `.blend`、兩 atlas、渲染、工具／報告不發布。32 WebP、17 OGG、49 媒體預載、Range 206、Cache Storage、增量指紋、清除與存檔隔離保持。動態 engine fallback 與正式／GM HTML 單一 `v=20261011-b27-art-r2` 同步更新；resource-manifest 重算，未另造下載器。

未修改戰鬥、成長、裝備數值、存檔／雲端、GM 授權、音樂／音效 owner；未刪除素材／玩家資料。起始提交完整保留舊來源及 GLB。回退以 `git revert <本次補修提交 SHA>` 做新提交，解決衝突時保留他人後續修改，再更新 registry／manifest 並走原 gate；禁止 reset/force-push 舊 main。

提交與 exact-HEAD Actions／Pages 結果由最終交付附真實 commit/run 連結，不以舊 SHA 綠燈代替。

使用者待驗：正／側／背、臉與指部、布料／金屬層次的美術接受；正式角色與 GM 自由／正式展示；iPhone Safari、Android Chrome 直橫向、觸控旋轉／縮放、放大／還原、背景／鎖屏返回；弱網／快取清除／更新後再開；桌機／手機 ≥30 分鐘 FPS／發熱／GPU。正式帳號／雲端不做具有覆蓋或刪除風險的測試。**完成自動驗收後仍等待使用者確認外觀，不能自行宣布第 27 批正式美術封版。**
