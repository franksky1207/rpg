> 28-C 接續狀態：第一套正式 15 GLB、嚴格 joint/rest/inverse-bind 重綁與局部可恢復遮蔽已施工。下文為本批當時的歷史限制；最新實跑與待驗見 [28-C 驗收](3D_BATCH28C_IMPLEMENTATION_ACCEPTANCE_2026-10-11.md)。

# 《文明戰線》3D 第 28-A 批｜正式五槽模型技術契約與資產規格

施工日：2026-10-11（Asia/Taipei）。核對起點 main `d46b03cf0a73d3c226b9933d24dc25d84dd8fd06`；**每次施工仍以當下 main 為準**。本批只完成施工規格與現況查核，不宣稱五槽 GLB、Runtime 遮蔽或正式人物掛裝已完成。參照 `docs/3D_BATCH28_PREFLIGHT_RISK_LOCK_2026-10-11.md` 與第 27 批三階段驗收文件。

## 1. 已核實並沿用的唯一資料來源

| 欄位／能力 | 目前權威 | 第 28 批規則 |
|---|---|---|
| 正式裝備實穿 | `state.equipment[slot]` → `3d-test/appearance-snapshot.js` 的 `capture()` | 唯讀；不能新建一套物品背包或存檔 |
| 名稱／身份 | `name`、`visualKey`、`world`、`quality`、`level` | 保留三紀元、混搭及既有 1,050 名稱位置來源；不把 visualKey 當成 GLB 檔案路徑 |
| 強化 | `state.enhancement.levels[slot]` → `enhancement` | 視覺效果唯讀；不碰暗能量、能力與裝備公式 |
| GM 正式同步 | `Civilization3DAppearance.capture()/scene()` 同源授權快照 | 無正式資料不得假裝已同步 |
| GM 自由展示 | 隔離 fixture 模擬相同 descriptor 結構 | 不可寫回正式 state／save／雲端 |
| 模型驗證與發佈 | `assets/3d/asset-registry.json`、`scripts/asset-registry.cjs`、既有發布流程 | 每個 GLB 明確 ID、SHA、bytes、source、license、preload=false |
| 現有顯示 | 人物正式 GLB 已用於角色展示；`createEquipmentScene` 仍為 geometry fallback | 不得宣稱目前有正式五槽穿戴 |

五槽固定順序：`weapon,helmet,armor,shoes,accessory`。空裝 `present=false` 不可掛上裝備；`present=true` 無 GLB 時可逐槽以正式定義的回退顯示，不得用假 GLB 或改寫正式名稱。前置提交的 `resolveEquipment()` 是唯讀解析接口，非已接入正式畫面的換裝。

## 2. 第 27 批禁止破壞的人物契約

人物為已經使用者接受的真人比例科幻戰鬥服，身高約 1.9m；`rigContract=cw.humanoid.rig.v1`。53 根骨骼的名稱、父子關係、rest pose/rest matrices 與既有 skin weights 不因第 28 批重做；九掛點 local matrix 與父骨不得改。人物低中高三 LOD 及 `CW_Idle_Breathing_Compatibility` 繼續沿用。Blender 公尺、+Z up／-Y forward；glTF 公尺、+Y up／+Z forward；scale=[1,1,1]。

| slot | 主要掛點 | 額外連結及幾何要求 | 建議裝備方式 | 首批必要遮蔽 |
|---|---|---|---|---|
| weapon | `socket.weapon.R` | 既有左手武器輔助掛點；把手 pivot、握持朝向須與第 27 批 bind 對齊 | rigid socket | 手部相交僅修模型/握持，不能改人物手骨 |
| helmet | `socket.helmet` | 保留頭頸與視線，頭轉不得滑動 | rigid 或局部 skinned，需姿勢驗證 | `region.head` 精確髮／包覆部位 |
| armor | `socket.armor` | 肩、胸、腰、肘、髖需隨人體彎曲；不可只用單一 rigid 胸掛點假裝皮甲 | 53-bone 相容 skinned 或可驗證的分件 rigid+skin | `region.torso`、必要上肢包覆面 |
| shoes | `socket.shoes.L` | 右鞋另有專用掛點；鞋槽需兩腳同步穿卸、各自跟隨左右腳踝 | pair rigid／skinned，以姿勢測試決定 | `region.feet`；有需要才擴至小腿 |
| accessory | `socket.accessory.back` | 不得穿過背甲；必要時使用 root／背部變體錨點 | rigid socket，軟性飾品須額外驗證 | `region.back` 只在實際包覆時隱藏 |

**注意**：registry 的 `slots` 目前只列五個主要掛點，其他四個輔助掛點需要從真 Blender/GLB 與第 27 批測量/驗收查證完整節點名稱後才能寫入機器契約；不從自然語言推測或創造不存在的 node 名稱。正式 Codex 模型開工前，應有九掛點名稱、父骨及 local transforms 的機器快照，逐一對照來源 Blender 與所有人物 LOD。

## 3. 第 28-C 裝備資產的機器可讀規格

建議每套正式裝備各槽各 LOD 有獨立 asset ID，例如 `equipment.starter.weapon.low`；實際正式路徑和 ID 以產出的檔案與 SHA 為準，不預先在 registry 填入不存在的 GLB。資產至少包含：
- `id,type:'equipment',slot,quality:'low'|'medium'|'high',mount:'rigid'|'skinned',rigContract:'cw.humanoid.rig.v1'`。
- `path,sha256,bytes,source:{path,sha256},license,epochs,scenes,lod,dependencies,preload:false,fallback`。
- 同一槽 low／medium／high 對應可驗證的 asset ID；`registry.equipment[slot][quality]` 只引用真實存在、雜湊通過、槽及 LOD 符合的資產。
- rigid GLB 不要求獨立人物動畫或 53-bone skeleton，但需有效 mesh/material 與正確 socket-local pivot。skinned GLB 必須有 skin 與可驗證的同名 bone mapping/bind 相容，不允許僅憑「有 skin」認定適配。
- 原始 `.blend`、貼圖母檔、權重與遮蔽規則留 `development/`，Pages 只帶必要正式 GLB 與執行依賴。新裝備不可混入既有 49 件背景預載。
- 現有 `scripts/asset-registry.cjs` 已具裝備 type/rigid/skinned 基礎分類，但**還沒有**完整 rig rest matrix／socket pivot／skin joint name／遮蔽資料等高強度檢查；這些應在正式五槽入庫前擴充。不能以現有初階分類通過宣稱真模型相容。

## 4. 動態遮蔽與場景生命週期契約

來源已存在 `region.head,region.torso,region.legs,region.feet,region.back` 語意，不表示 glTF 輸出已有獨立可切換 submesh 或 mask。**28-B 在程式接入遮蔽前，先驗證所有 LOD 的實際 mesh/submesh material 分組、可切換粒度**。不得在 runtime 隨意刪除頂點、破壞共享 CPU cache。

遮蔽依每個 scene instance 的穿戴集合重新算：`hideRegion = union(equippedItem.hideRegions)`；卸任意槽、換 LOD、取消載入、失敗回退、GM 模式切換及 close/reopen 都必須重新求值並可還原。若來源粒度不夠，必須明確交由 28-C Blender 重新切分裝備覆蓋面，**不能用隱藏整顆頭或整片軀幹冒充修正**。

`3d-test/character-assets.js` 已有 per-scene `equipmentSession(scene)` 版本控制/清理原型：回傳結果可以阻止舊載入覆蓋最新，但**目前不會自行下載、掛載或 render 任何裝備**。28-B 的 loader 必須提供真正 Babylon container 與 dispose、在首次場景取消/LOD 切換時清除所有 GPU 實例，並驗證失敗時不會錯誤遮蔽基底。

## 5. 正式與 GM 驗收矩陣（先測一套五槽，不擴充 1050 模型）

1. 空五槽、五個單件、五槽全穿與移除任意槽，均使用同一位正式人物基座。
2. 以不同 `world/quality/enhancement/name/visualKey` 混搭時，正式名稱不變、模型共享規則明確且不造假不同外觀。
3. 雙鞋成對穿卸；武器左右手掛點、頭轉、肩肘、腰髖、膝踝姿勢與 idle 可視確認。
4. 遮蔽開/關/換 LOD/切模式完全復原；不能露出基底穿模或整塊人體消失。
5. 正式角色、背包、鍛造、戰鬥只讀 owner；GM 八類／31 唯一視覺案例沿用既有角色全身展示／五槽裝備陳列，不新增無意義工程案例。
6. 模型 404、SHA 錯誤、WebGL 遺失、兩次快速相反穿卸、30 次切換、關閉重開時保持原人物/文字回退及 GPU 釋放。
7. 真實 Pages artifact 查閉包、逐檔指紋、載入 bytes、同 LOD 熱開不新增 GLB 請求、首次和重訪容量；Chromium mobile viewport 測試與真 iPhone GPU 長測嚴格區分。

## 6. 施工切分與關卡

- **28-A 本批**：資料/掛點/遮蔽/資產契約、前置檢查及施工清單；不需要再改人物比例、骨架或音樂。既有前置 JS 的改動屬 28-A 安全基礎，但非完成五槽。
- **28-B ChatGPT**：完成 `registry.equipment` 明確 identity 與 valid type contract、GLB 真實 loader/staging、遮蔽按場景更新、正式和 GM 共用 renderer，使用無正式資產時安全 fallback 測試。
- **28-C Codex（主要一輪）**：用第 27 批來源建立第一套真正五槽裝備，Blender／權重／雙鞋／分區遮蔽／三 LOD／可重製、姿勢驗證／正式 GLB／SHA 台帳。不能只做五個無法上身的模型。
- **28-D/E ChatGPT**：正式與 GM 視覺整合、名稱映射、快速穿卸、資產發布與回歸。
- **28-F 視需要 Codex**：只在大量穿模、權重或瀏覽器長測確有必要時啟用。
- **第 29～30 批**：三紀元完整裝備家族、品質強化視覺差異與 1,050 正式名稱位置的藝術擴充；不是第 28-A 的交付物。

## 7. 本批自我檢查與限制

依 `main` 實讀：`appearance-snapshot.js` 有現成五槽正式來源與 `resolveEquipment()`；`character-assets.js` 有人物資產驗證與 `equipmentSession()`；`asset-registry.json` 仍只有正式人物 3 LOD + decoder；`scripts/asset-registry.cjs` 具初階 equipment 分類驗證；`prototype-engine.js` 五槽展示仍為幾何。第 28-A **不能宣稱五槽正式資產已存在**。

此階段只改規格文件；沒有執行真瀏覽器／Blender 新模型驗收，不增音樂、戰鬥公式、存檔、GM 權限、Cache SW 或 Pages 配置。下一階段須在正式新資產交付前補齊 joint mapping、mask runtime 與真 GLB 測試。
