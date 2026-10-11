# 玩家人形基座 v1／第 27 批

狀態：可編輯、可變形的原創技術美術研究模型；**尚待正式高品質美術驗收，不能宣稱第 27 批正式美術封版**。它不是既有球／柱／方塊替代人形；採獨立 quad surface、53 個骨架關節、四權重混合、五種 PBR 材質和完整五指。仍需專業角色美術修整面部、肩／髖接縫、手指輪廓及更精緻的板件／貼圖。

來源：本目錄 build_player.py 原創網格／織物 atlas，無下載人物或第三方幾何。工程、產生器及織物圖公開使用 CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；Babylon loader 另外使用 Apache-2.0。

用 Blender 4.3.2 開啟 player-foundation.blend，可直接編輯 quad mesh、UV、材料節點、Armature、vertex groups 和 socket empties；CW_Idle_Breathing_Compatibility 是變形相容測試，不冒充第 31 批完整動畫。

重建：在 repository root 執行 `blender -b --python development/3d-source/characters/player-v1/build_player.py`，再執行 `node scripts/update-3d-registry.cjs`。低／中／高版分別採原始表面／一級／二級 subdivision；同骨架和掛點，不使用 Draco／Basis／外部貼圖。512×512 PNG 直接嵌入 GLB。先驗證、更新 manifest，再建候選。

Blender 使用公尺、Z 向上、-Y 正面、原點在足底中心；glTF 匯出轉成 Y 向上、+Z 正面。固定縮放 1，掛點為骨骼子 Empty；裝備原點對 socket 局部原點，旋轉使用局部四元數，不直接硬改人物 root。五槽以發布 asset-registry.json.slots 為契約，另提供左右手、雙鞋、背部、胸口受擊／root 特效錨點。

基座飛行服的面板不是任何正式裝備名稱／數值。五槽換裝、三紀元不同正式裝備美術與 1,050 位置模型映射留給第 28～30 批；正式外觀仍讀 appearance-snapshot.js，不生成第二套角色身份。

`.blend`、織物源圖、此說明、生成與檢查腳本／報表只留 GitHub 開發來源，玩家端只取 registry 的三個 GLB 與本地解碼器。高版仍需桌機效能／美術接受；真手機須驗低版，Playwright viewport 不代表實機。
