# 第 27 批：人物資產技術基礎驗收（部分完成，未正式美術封版）

日期：2026-10-11（Asia/Taipei）。施工起始 main：`fbaaa9d1f84045542d58fe418501172dce44c0a6`。

**本批未全部完成。** 已交付可編輯來源、可變形 GLB、掛點、按需載入與發布閉包；人物仍為 `technical-art-study-awaiting-human-art-acceptance`。已查看瀏覽器實際畫面，其面部、肩髖接縫、手指輪廓、科幻裝甲細節及貼圖層次仍未達正式高品質角色標準。不能把技術測試通過等同美術驗收通過；不解鎖完整版 3D，也不自行開始第 28～40 批。

## 已交付的技術內容

- 原創 quad surface 人形（不是球／柱／方塊組裝人形），完整頭頸、軀幹、四肢、雙腳、每手五指；高度 1.9 m。原始工程 3,672 vertices，可直接編輯網格、UV、53 個骨架、vertex groups、Armature modifier、材質節點、Action 與 socket empties。
- 五種 PBR 材質：織物、金屬面板、發光條、頭部表面、面罩；原創 512×512 織物 PNG 嵌入每個 GLB。原始圖留在 source；GLB 不使用外部圖片、Draco、Basis 或 CDN 解碼器。
- 骨架有真實 skin weights（每 vertex 最多四個權重且總和 1）及可變形呼吸相容測試 Action。重新開啟 `.blend` 後姿勢變形最大位移 0.018202 m；重新匯出 low 的 SHA 與提交資產完全相同。這不是第 31 批完整動作庫。
- 三個 LOD 共用 rig、材質及掛點。正式角色預覽預設 ≤700px 選 low，其餘 medium；GM「省電／平衡／高畫質」選 low／medium／high，變更會重建場景並釋放舊容器。
- 正式頁面與既有 GM「角色全身展示」共用同一 `createCharacterScene`／GLB loader。正式角色及五槽描述仍讀 `appearance-snapshot.js`；GM 自由 fixture 與同源授權正式快照隔離。基座飛行服不是任何正式裝備名稱，五槽裝備陳列仍是明確的幾何過渡展示，實際掛裝留第 28 批。
- 真實 GLB 成功標示 `skinned-glb`；失敗保留原 `geometry-fallback` 並顯示「替代外觀」。WebGL/context loss 回退文字介面；不假稱 GLB 成功。

## 原始工程與掛點契約

來源目錄：`development/3d-source/characters/player-v1/`。包含 `.blend`、原始 atlas、`build_player.py`、`validate_source.py`、輸出測量及 README。網格／atlas 為本批原創，公開使用 CC0-1.0；本地 Babylon loader 為 7.54.3／Apache-2.0，npm tarball SHA-512 integrity 與逐檔 SHA-256 已核對，來源見 vendor 的 SOURCE.md。

Blender：公尺、+Z up、-Y forward、足底中心原點。glTF：公尺、+Y up、+Z forward，scale `[1,1,1]`。裝備 pivot 對齊 socket 局部原點，使用 socket-local quaternion，不個別硬改人物 root。

| 五槽 | 標準節點 |
|---|---|
| 武器 | socket.weapon.R |
| 頭盔 | socket.helmet |
| 鎧甲 | socket.armor |
| 鞋子 | socket.shoes.L（另有右鞋） |
| 飾品 | socket.accessory.back |

另有左手武器、右鞋、胸口受擊及 root 特效錨點。掛點為實際 bone parent 的 Empty／glTF node；契約與來源 SHA 都在 `assets/3d/asset-registry.json`。

可重製操作（repository root，Blender 4.3.2）：

```sh
blender -b development/3d-source/characters/player-v1/player-foundation.blend --python development/3d-source/characters/player-v1/validate_source.py
# 只有授權重建資產時才執行下列命令；會修改 tracked source / GLB。
blender -b --python development/3d-source/characters/player-v1/build_player.py
node scripts/update-3d-registry.cjs
python3 scripts/generate-resource-manifest.py > resource-manifest.json
node scripts/build-publish-dry-run.cjs
```

## 台帳、發布與快取

`asset-registry.json` 記錄穩定 asset ID、相對發布路徑、完整 SHA-256、實際 bytes、source SHA、授權、紀元、使用場景、LOD、依賴、`preload:false` 與 fallback。它只管理素材，不取代正式人物／裝備身份 owner。

共享發布政策讀取顯式 registry，驗證存在、hash／bytes／來源、依賴 ID、循環、LOD 對應、GLB 內嵌依賴及掛點。不存在的 asset、依賴或錯誤指紋使建置失敗；未登錄 3D 和未知原始格式預設排除，正式碼引用不允許的模型使建置失敗。可驗證 GLB 在獨立精簡候選網站以實際 Babylon 解碼，而不靠檔名文字掃描猜動態路徑。

發布包逐檔重算 fingerprint，包含 registry、本地 loader、三個 GLB 及必要 JS。原始 `.blend`／PNG／工具／文件不進 Pages。32 WebP、六首配樂、11 個 SFX（五類）維持原使用池；全站仍僅預載原有 49 媒體。GLB 只於場景需要時下載，仍可使用 SHA 媒體快取、Range 206、版本淘汰及手動媒體清除，不碰帳號／save／GM／音效偏好。

同頁 CPU buffer LRU 最多兩份，in-flight 去重；每個 Babylon AssetContainer 綁定單一場景並在 dispose 時回收。CPU 快取不冒充 GPU 已釋放量。JS／CSS 不改成永久 cache-first；HTML 直接入口與動態 fallback URL 已更新快取版本。

## 實際執行與修復

- Blender 重新開啟、拓樸／法線／縮放／weights／53 bones／掛點 parents、姿勢變形與 low 精確再匯出：通過。
- Khronos glTF validator：三個 GLB 均零 error、零 warning；Babylon 實際載入與已 ready 的 PBR／貼圖、骨架動畫矩陣變動：通過。
- Runtime／Story workflow 的 100 個其他唯一檢查已執行；初次一項舊 runtime fallback cache token 斷言失敗，核對新版入口後更新預期值重跑通過，沒有移除安全斷言。另增第 27 批人物瀏覽器測試並通過。
- 新 registry／負向閉包／publish-build regression／audio／cache behavior 與 prefetch：通過。新增 GLB 不預載、實際 binary Range、只淘汰改版 GLB 而保留未變音訊的測試。
- 精簡候選原有七項 browser checks：正式啟動、GM 八類／31 場景、mode gate、存檔 pipeline、銀河 3D 按鈕、全成品 HTTP bytes/hash／音訊解碼／49 媒體／Range／清除隔離：通過。
- 第 27 批 browser：正式角色、GM 授權 iframe 正式／自由、三紀元、三 LOD、真實 skin 動畫、關閉重開 10 輪、直向／橫向／最大化還原、真實 context loss、503 GLB 明確 fallback、engine／container 回收及正式 state／音訊偏好不變：通過。
- 修復測試必須用實際 UI 完成劇情、領取初始裝備及「踏上征途」，避免開場 modal 攔住角色按鈕造成假性失敗；沒有修改遊戲開場邏輯或強制點擊遮罩。
- 本機 browser 使用系統 Chromium 154／SwiftShader；CI 使用 Playwright 1.55 配套 Chromium。登入／GM 為隔離 SDK fixture，不是使用者正式帳號，沒有執行正式雲端寫入。
- 最新提交的 Runtime、Stage 4 Gate、Optimized Pages 都新增本批 registry／Khronos／browser gate。提交後必須按 exact main SHA 查最終 Actions；本文件不能代替未來 CI 成功證據，結論於交付回報附實際 run 連結。

## 容量與下載實測

MB 使用十進位 1,000,000 bytes，測量為工作樹 tracked 檔案總和及實際 `.publish-stage3` 輸出總和；**不是 .git 歷史容量，也不是 ZIP artifact 壓縮大小**。本批最終數據和完整 SHA 見同目錄 `3D_BATCH27_MEASUREMENTS_2026-10-11.json`／asset registry。

| 資產 | bytes | 三角面 | 發布使用 |
|---|---:|---:|---|
| low GLB | 519,184 | 7,204 | ≤700px／省電 |
| medium GLB | 1,285,168 | 26,864 | 桌機預设／平衡 |
| high GLB | 4,013,496 | 107,456 | GM 手動高畫質 |
| 三 GLB 合計 | 5,817,848 | — | 同 rig、53 joints、5 PBR、1 動畫／1 嵌入 PNG |
| 本地 glTF loader | 288,275 | — | 初次人物才載 |
| Blender 工程 | 1,491,612 | — | 原始來源，不發布 |
| 原始 atlas PNG | 220,544 | — | 原始來源，不另發；每 GLB 內嵌一份 |

只驗證 idle，相容骨架不等於第 31 批 Move／Attack／Dodge 等完成。內嵌 PNG 的 bytes 已算在各 GLB，不再重複加總。

網路量用 CDP `Network.loadingFinished.encodedDataLength`，包含 HTTP headers；明確區分真實外部 SDK 的未登入首頁、隔離登入 fixture 的測量時點、首次人物額外量及同頁熱開。背景 49 媒體可能與場景同時下載，不能將該窗口量解釋成純 GLB 容量或所有玩家的固定下載量。模型／loader 純內容額外量由實際 verified buffer 計數；保留報告中的測量條件。

關閉及 context loss 後 engines=0、containers=0、pending=0；CPU LRU 保留 medium＋low 共 1,804,352 bytes。JS heap 是 Chromium 代理測值，非精確 GC／GPU profiler 數據，不能宣稱沒有所有記憶體成長。真手機與 30 分鐘實際 GPU 長測仍待真人驗收。

## 使用者實機驗收與未完成

1. 正式網站登入自己的角色，文字介面「角色」→「預覽 3D 角色」：正面、旋轉、縮放、關閉／重開；核對正式能力與穿戴名稱。當前畫面為未美術封版的基座，不是正式五槽換装。
2. GM→3D 測試中心→「玩家、裝備與養成」→「角色全身展示」，開啟外觀控制，切換「同步正式角色」／「自由展示」、三紀元與省電／平衡／高畫質；名稱仍沿用正式 owner，基座未替換成三紀元專屬裝備。
3. 真手機 Safari／Chrome：直橫向、放大還原、觸控、網速慢／斷線、反覆關開與背景恢復；桌機／手機至少 30 分鐘檢查 FPS、發熱與 GPU/記憶體。Playwright viewport 不代替真機。
4. 由真人評估造型、面部／手指／關節、金屬與非金屬層次及科幻細節。目前高品質美術仍未完成，需專業角色美術修整後再驗。
5. 真實帳號／雲端同步使用隔離測試帳號驗收；本批沒有測正式帳號覆寫／刪除，不要求對玩家正式存檔做危險測試。真人確認原配樂／SFX 聽感與偏好保持正常。

第 28 批五槽實際掛裝、29～30 三紀元專屬美術與完整 1,050 裝備位置映射、31 完整動畫、32～40 怪物／場景／戰鬥／完整模式 gate 均未開始；本批人物模型品質不足不能轉嫁為第 28 批完成。

Pages 實際起始設定為 workflow、main:/，既有 Optimized Pages 基準成功 run 38111752933。**本次不修改 Pages 發布來源**；main 正常提交由既有 workflow 驗證後更新站點。部署失敗保留上次成功版本；回退應 revert 本批提交並保留其他人的後續修改，以起始 SHA／既有成功 artifact 為比對基準，不強制覆寫 main。
