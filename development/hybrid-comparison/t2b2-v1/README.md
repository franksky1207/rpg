# T2-B2 共用候選資產・隔離與重製

本目錄是共用美術、必要動作與離線驗收，**沒有 A/B/C Renderer**。
所有資產 prototype／pending；技術驗證成功不等於使用者美術批准。
原正式 runtime、18 GLB、Rig Contract、Fixture、音訊與發布清單不改。

- `enemies/{normal,elite,boss}/source.blend`：三個可編輯原創機械工程，
  分別對應遺址守衛機 Lv.31、遠古戰爭機甲 Lv.34、遺址中樞核心 Lv.35。
  `design.json` 保留正式來源定位，formalId=null，沒有新增技能或數值。
- 同目錄 `candidate.glb`／`atlases/atlas.json`：同一源稿的六個真實關節
  動作，A/B 共用同一圖集，C 使用該源稿 GLB。模型有造型輪廓、層疊護板、
  關節、材質、UV 與原創貼圖；不是既有幾何場景或立方體佔位。
- `player/animation-source.blend`：原玩家/G007 參考完整留在新工程，另加
  六個相容動作、右手握柄和候選接地修正。原網格、權重、rest rig、掛點
  逐值未改；三候選 GLB 不內嵌裝備，仍引用原 G007 十五檔。
- `player/atlases`：五槽獨立 RGBA＋深度，加原身體五個保守遮蔽分區。
  [layer-contract.json](layer-contract.json) 是 B3 的對位、深度、空槽、缺材
  與時間規則。不是 32 套合成圖片；33 組 contact sheet 只作離線 QC。
- `shared`：原創遺址分層背景工程／PNG、impact 八影格工程、接觸陰影。
  完全靜音，沒有 HP、傷害、勝負、掉落或音訊觸發。
- `source-lock.json`／`inventory.json`：73 份原始來源鎖定，逐檔 SHA、
  實際 bytes、GLB 面數／關節／動畫時間範圍、授權與 pending 狀態。
- [review.html](review.html)／`review`：真實 Cycles32/GLB/Babylon 檢驗
  圖像、姿勢／穿模風險、32 穿卸＋混穿、像素比對、精確再製證據。

## 開啟圖冊

在 repo root：`python3 -m http.server 4173 --bind 127.0.0.1`。
開 `http://127.0.0.1:4173/development/hybrid-comparison/t2b2-v1/review.html`。
手機使用同路徑 HTTPS 開發轉送；不是正式 GitHub Pages。無登入、GM、
Storage、雲端或 audio。B1 頁面仍是技術占位，B3 未接入。

## 原始工程與動作再製

Blender 4.3.2、Python Pillow/numpy。先執行 source-lock/inventory check。
已手工修改的工程只用 `reexport.py`，不要重建覆蓋修改。建置器預設拒絕
覆蓋已有候選，只有明示 `-- --rebuild` 才重建本開發目錄。

```sh
# 以下三個是初次建置；有工程時會拒絕覆蓋。
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/build_enemies.py
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/build_player.py
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/build_stage.py
# 對實際變形取樣，候選根骨接地修正，不改任何正式來源。
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/ground_candidates.py
# 每個 actor：normal／elite／boss／player。輸出先放 /tmp，驗後才收候選。
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/reexport.py -- --actor normal --output /tmp/b2-export/normal
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/render_frames.py -- --actor normal --output /tmp/b2-frames
python3 development/hybrid-comparison/t2b2-v1/tools/pack_atlases.py --frames /tmp/b2-frames
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/validate_blender.py
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/render_glb_review.py -- --actor normal
python3 development/hybrid-comparison/t2b2-v1/tools/verify_pixels.py
python3 development/hybrid-comparison/t2b2-v1/tools/verify_reproduction.py --exports /tmp/t2b2-reexport --frames /tmp/t2b2-repro-frames
python3 development/hybrid-comparison/t2b2-v1/tools/inventory.py --check
node tests/runtime/hybrid-comparison-art-contract.cjs
node tests/runtime/hybrid-comparison-art-browser.js
```

`pack_atlases` 需要四 actor 都已烘焙，不是只 normal 即可。獨立再製取樣
使用 `render_frames.py --sample-only`，包含 0/300/700ms；完整 source
影格為 0..21 ticks，22 個取樣，**700ms 端點不另加播放時間**。GLB 保留
原 frame1 時間起點，700ms 是 end-start；B3 必須以 elapsed 時間接線。

原始影格 256²，Cycles CPU32 samples、固定35°/15°，player鏡像視向。
圖集每動作共同 trim＋3px透明餘量、2px cell padding、不用 mipmap，
straight RGBA8／sRGB；depth PNG16 是6～14m線性相機距離、透明=65535。
所有 pivot／trim／UV／頁號／frameCount/fps／encoded/decoded plane bytes
完整保留。decoded plane bytes 是影像資料容量，**不是實測 GPU/RAM**。
不在本批作紋理壓縮／完整畫质選型；B3/B4 需按需載入與實機量測。

## 誠實保留的 Gate

肩甲和背飾仍有 signed-nearest 表面穿模風險；詳見 `review/blender-qc.json`。
這不是精確碰撞求解，亦不是「無穿模」證明。G006 頭盔沒有真實模型，
不以 G007 冒充。只有六個基本 clip，沒有獨立 crit/combo/counter/drain
美術封版。來源與 reimported GLB 的輪廓幾乎相同，但 native shader／
材質轉換仍有色彩差異；`source-vs-glb-pixels.json` 如實保留數據。
Boss 重量感、光照一致、遮臉、手腳、全部姿勢及真手機需使用者確認。

低/中 LOD 的 A 專用重烘焙未交付；目前 A 是 high-reference，三方案
高品質基準可用。後續低品質公平比較須明確設定共同可見像素預算，
不能把本批三 LOD 綁定驗證當成三種 A 圖集已製作。

不把上述 Gate 當成通過；不自動進 B3、B4、T2-C，不決定勝者。
