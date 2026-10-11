# 玩家真人科幻戰鬥服基座 v1／第 27 批美術補修

狀態：`human-sci-fi-art-revision-awaiting-user-acceptance`。真人比例、連續蒙皮表面的美術修正版；**等待使用者看實際渲染及正式網站後確認，未自行正式美術封版**。沒有開始第 28～40 批。起始 main `993ec3823997281f3445888848cc25c7b56b244f` 中的舊 `.blend`／生成器／GLB 完整留在 Git history，沒有建立第二套遊戲來源。

約 1.9 m、成年約八頭身；原創解剖截面經 voxel 重拓樸接合肩／髖／掌部，原始工程保留可編輯 quad 表面、UV、五種 PBR、53 個骨架、四權重線性混合、掛點和呼吸相容 Action。頭部使用實際顱骨／下顎／鼻樑輪廓及原創 1024 PNG 五官／髮際 atlas；512 織物 atlas 與連續頂點顏色表現贴身服裝分片、柔性關節及低調科技縫線。不固定頭盔、胸甲、背包或正式裝備。

公尺、Z up、-Y forward、足底原點；glTF +Y up、+Z forward、scale 1。53 骨架的名称／父子／head／tail及全部掛點 local matrix **與起始提交相同**。裝備 pivot／socket-local quaternion 契約保持，不另改角色身份或智慧下載。五槽換裝、專屬裝備及完整動作仍留第 28～31 批。

`region.head/torso/legs/feet/back` 為來源網格的 POINT Boolean attributes（不是骨架權重），僅規劃後續遮蔽。頭盔只遮 head、胸甲遮 torso、腿件遮 legs、鞋子遮 feet；背部飾品僅有覆蓋布片時局部遮 back，不能整片刪除軀幹。後續使用套件的覆蓋範圍與同 rig 貼身替代件避免穿模，不在本批實作執行時隱藏。

原創網格、atlas、生成器使用 CC0-1.0：https://creativecommons.org/publicdomain/zero/1.0/ 。無下載角色／借用 IP／遠端素材；本地 Babylon loader 另為 Apache-2.0。

```sh
# Blender 4.3.2；在 repository root。重建會更新 tracked 來源及 GLB。
blender -b --python-exit-code 1 --python development/3d-source/characters/player-v1/build_player.py
blender -b development/3d-source/characters/player-v1/player-foundation.blend --python-exit-code 1 --python development/3d-source/characters/player-v1/validate_source.py
blender -b development/3d-source/characters/player-v1/player-foundation.blend --python-exit-code 1 --python development/3d-source/characters/player-v1/render_review.py -- --output /tmp/player-review --samples 48
# 已有手工編輯的工程可直接匯出，避免重建覆蓋雕刻：
blender -b development/3d-source/characters/player-v1/player-foundation.blend --python-exit-code 1 --python development/3d-source/characters/player-v1/export_lods.py
node scripts/update-3d-registry.cjs
python3 scripts/generate-resource-manifest.py > resource-manifest.json
node scripts/build-publish-dry-run.cjs
```

三種 LOD 由相同雕刻表面，以服裝邊界／頭部／手部重要性遮罩真正簡化為 5%／16%／64% 幾何，維持五材質、兩張嵌入 PNG、53 joints 及標準掛點；不使用 Draco／Basis／外部貼圖。來源檢查包含封閉 manifold、法線、四權重、骨架、呼吸與肘／膝／肩／髖／指的變形及 low 精確再匯出。Blender 線性蒙皮與 glTF 相同；未開啟 dual-quaternion 冒充發布變形。

`review/` 為實際 Cycles 渲染與正式／GM browser 證據，只保留 GitHub。`render_review.py` 可重現四面、三近景、LOD 比較、遊戲光照及關節姿勢；配套 Blender 沒有 OIDN，使用原生 CPU 48 samples，不以不存在的 denoiser 產生成功記錄。玩家發布只包含 registry 登錄 GLB、既有本地解碼器及必要程式；原始工程、atlas、渲染、工具與報告全部排除。

## 第三階段快速精修

`refine_player.py` 直接精修前版 `.blend` 的既有表面、atlas 和同一 idle 動畫；建置程式也呼叫同一函式，可重製。原拓樸／權重／rest rig 不改。`export_lods.py` 只將獨立臉部 COLOR_0 accessor 寫為中性 1，修正 glTF 必然乘色而 Blender 臉部不讀頂點色的不一致；來源 cloth 色保留，三 GLB 有逐值測試與 Khronos 驗證。

新圖在 `review-fast/`，含前版與精修後手機畫面；原 `review/` 保留上輪證據。詳見 `docs/3D_BATCH27_FAST_POLISH_ACCEPTANCE_2026-10-11.md`。仍等待使用者外觀確認，不自行封版。
