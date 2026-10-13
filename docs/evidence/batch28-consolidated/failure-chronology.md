# 本輪失敗與修正

- 初匯出鑰印low／medium58／82 triangles，被原rigid>=100門檻拒絕；改為小型核心／框100 triangles各tier保留，沒有降低門檻。初匯出／重匯出log及原contract斷言保留。
- 初Khronos與art-contract命令找不到gltf-validator；使用原已裝 `/workspace/.rpg-tools/node_modules` 的NODE_PATH後通過，沒有刪檢查。
- 初概念test批次批准0，現在G006/G007代理批准2；改驗具體兩ID，新增代理授權與歷史SHA負例，29項通過。
- 初GM來源與Fixture的舊registry／15GLB SHA不一致；原Fixture／controls／events SHA保留，歷史byte重現與新視覺註冊SHA分層銜接。原／新adapter與producer存inert source.txt，授權源鏈驗原git／archive／current；原B2source-lock未改。
- GM `Invalid offline input`：fixture adapter、Playback、Renderer query版本不一致造成WeakSet實例分離。統一版本；診斷原文見gm-invalid-input-diagnostic.log。沒有移除isVerifiedInput或嚴格身份／SHA門檻。
- source-version嚴格檢查拒絕GM query与新adapter／producer；保留原source-lock和T4歷史lock，新增精確原版／授權版本證據。自動審核拒絕改寫T4歷史lock的操作，改用原GM檔＋唯一明確query替換且其他字元完全一致的驗證；舊來源／歷史SHA未改。
- 新GM姿勢截圖locator等待stable逾時；改用實際canvas bounding box截圖，仍驗真53骨／五槽／三LOD／mask／dispose。姿勢軸從bone local校正為parent映射world axis，正側視實際確認膝彎曲，沒有只用finite值稱動作正確。
- 環境重新啟動後原session id失效，但同工作區檔案保留；重新執行GM三尺寸，未使用部分完成log宣稱全通過。
- registry代理藝術狀態／版本標籤更新後，新來源證據SHA仍指向更新前metadata，嚴格GM檢查拒絕；同步新registry、17檔version record、adapter的證據digest与manifest後契約通過，不改原before SHA／歷史lock。
- GM手動攻擊檢視的固定60ms讀到前一來源hit；改等實際plan.inspection=true、attack與滑桿有效時間一致，保留原attack断言。range的33.333步長會把300量化為299.997，不假設整数tick9。
- 兩個SwiftShader瀏覽器同時執行時，原始站台第二手機尺寸normal戰鬥sourceFrames=12但cueFrames=0，已保留整段診斷，原特效門檻保留；實際發布手機／父頁已完成，原站台改為單獨整組重跑。此非實機性能證據、不承諾任意負載不掉特效畫格。
