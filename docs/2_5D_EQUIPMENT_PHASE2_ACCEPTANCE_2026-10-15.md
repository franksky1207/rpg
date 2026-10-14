# 210套裝備2.5D轉型第2批成果與第3批交接

日期：2026-10-15。起點為GitHub main `a232efb3e44e035bea20075762bf6789332d0b14`。只修改開發資料、Python、測試與文件／CI；未製作新角色圖片、未接入正式戰鬥、未修改正式JS/CSS，不需index cache-bust。

## 實際資料與審查

- 逐套核對G001～G030正式owner、永久ID／sourceKey、epoch／目錄／五槽名、兩張WebP尺寸／bytes／完整解碼／SHA與歷史審查，並檢視60圖與約180px主體參考。各套`review-2_5d.md`列出獨特造型與局部建議，沒有由圖片存在自動批准。此靜態參考檢查不等於真機或正式戰鬥驗收。
- 30套未見新制度真正blocker，逐套遷移為`pass-with-advisory`。G006/G007原批准仍驗證；G001～G025舊分槽／剖面／細節待補依新政策分類，不再當作新2.5D工程級阻擋。
- G024原鞋欄膝盤重複、G030甲背空掛座缺獨立展示，以使用者本批明確指示建立限定身份／兩圖SHA／用途的`explicitlyAcceptedExceptions`。驗證器必須核對固定接受紀錄及證據指紋才通過；無修圖、無補證、無直接改索引true。
- [原檔保存清冊](evidence/equipment-phase2/preservation.json)核對60張概念圖及8份schema1／2審查逐byte不變，G006/G007歷史圖與模型來源保留。G006/G007較大的拆件WebP仍超過800KB建議值，未壓縮或重製。
- G031～G100、U001～U100、H01～H10共180套無圖、未批准、無製作資格。210套／1,050槽與既有重名（u019／u068頭盔）保持正式owner原值。

## 驗證制度與狀態

`equipment-art-review.py`新增schema3，`equipment-review-policy-v3.json`固定政策版本與SHA；分開blockers、advisories、使用者限定例外。審查綁完整身份、兩圖SHA、ChatGPT初審、Codex複查、來源／日期／SHA、Markdown SHA、canonical evidenceFingerprint。ChatGPT階段為**既有助手／代理審查的政策遷移**，明確附原始來源；本輪沒有假稱另外呼叫獨立ChatGPT審查者。Codex本輪重查實際圖片、owner及歷史圖審。

新證據放各套`review-2_5d.json`及`.md`，舊`art-review.json`保留原始結論。schema2仍驗證原規範；固定歷史SOP原文使編輯現行SOP不會無差別撤銷既有批准。schema1只保留當前已知G006/G007原批准，不允許偽造新舊式紀錄繞過schema3。來源快照固定在`docs/evidence/equipment-policy/`，不讓現行作業文件的文字更新變成全體撤銷。

| 層次 | 欄位／本批結果 |
|---|---|
| 概念審查 | `conceptApproved`：30套true，180套false，由證據推導 |
| 2.5D素材製作資格 | `assetProductionEligible`：同上；`modelingEligible`為相容別名 |
| 新2.5D素材實際完成 | `asset2_5dStatus=not-started`：全部210套 |
| 新素材GM測試 | `gm2_5dTestStatus=not-tested`：全部210套 |
| 正式發布 | `formalReleaseAllowed=false`：全部210套 |

G007的`modelStatus=refined-model-art-reviewed`與原15GLB是獨立舊3D事實，不能拿來充當新2.5D素材。新入口為`python3 scripts/equipment-asset-production-gate.py --set ID`，舊`equipment-modeling-gate.py`保持相容；兩者重驗owner／全索引／實際檔案與審查，不讀單一快取true放行。

素材來源審查沿用專案已存生成與使用者提供聲明，僅開發概念用途。G021～G025沒有獨立原PNG生成追蹤，只有附件來源聲明；保留此限制，沒有冒稱新增生成紀錄、第三方著作權證明或商用發布批准。

## Actions run 38652498691 根因

實際job `116154404372`、提交`04e898de378e312f8e1b34d62532185d4f1495d3`，log為：

```text
FAIL equipment concepts: g024: autonomous authorization changed/missing
```

schema2記錄綁定原SOP SHA `f7e281bb156f65ccc14e2544fb5bf853dc106446d1422ab4a92c00fce584a123`。第1批將2.5D政策說明加到整份SOP後，程式仍逐byte對當前SOP，第一套g024便拒絕；不是圖片缺失／身份索引錯誤。本機於改造前重現相同錯誤。修正為從原提交`33fbf27e78e1374839022175dd6217e5390bd905`取回相同SHA歷史SOP，繼續驗證舊規則；schema3另綁穩定版本。未停用檢查、未重寫舊審查SHA。

額外發現`batch01-27-compatibility-audit.py`對GM檔案仍使用T4舊afterSHA直接判斷；實際現行變更為既有G007整合授權的單一GM import query。現沿用T4/B3已有`source-version.cjs`，核對原始git內容、原鎖、精確字串替換；其他檔仍嚴格SHA。未改source-evolution鎖、GM或Runtime。T4測試另含附加未授權變更拒絕，防止此修正變成任意放行。

## 實際自我檢查

最終命令及exit code見本批`docs/evidence/equipment-phase2/`記錄；提交後的Actions另依exact commit回報，不由本機成功推定。

- `equipment-concepts.py generate`／`validate`、再次generate零變更；210套／1,050位置、60圖／30套、180未生成。
- 裝備unittest包含schema1／2相容、新schema3、原圖缺失／損毀／SHA變動、身份各欄、假true／缺初複審／缺真來源、例外挪用、真blocker、來源與政策指紋、G007舊批准及模型、未批准素材發布隔離。最終68項全數通過，保存完整log。
- G024與G030新舊入口通過；原圖SHA不變，素材未完成／GM未測／發布false。
- 既有G007裝備與preflight、B方案契約／renderer／playback／glTF、T3政策與正式橋／時鐘／投影／session／renderer、T4退役、發布稽核／建置及文件檢查、01～27相容稽核已實跑；19條命令全部exit 0，詳細結果見命令記錄。
- 初次額外回歸曾因沙箱Node `spawnSync git EPERM`及缺`gltf-validator`失敗；使用正常Git子程序權限及CI固定`gltf-validator@2.0.0-dev.3.10`（僅/tmp）後重跑，未放寬測試。Python舊GM SHA失敗則按上述精確來源機制修正。
- 本批沒有執行真手機、正式遊戲瀏覽器、GPU／音訊／雲端互動測試；沒有把既有測試歷史冒充本輪實測。

## 使用者實機與第3批

本批僅資料與工具，沒有新增需要使用者在桌機／手機操作的功能。真機角色顯示、動畫、HP／護盾、背景／極簡／倍速、音效、存檔／雲端與Pages/SW更新，留待第3～5批具備實際素材／接入後驗收。

第3批先盤點現有B方案與素材管線，再制定透明整套角色、定位／比例、待機／攻擊／受擊／閃避／死亡共用模板；使用G007及另兩套不同輪廓已通過概念試行。主外觀候選以鎧甲正式套ID決定，但須先盤點實際空槽與裝備格式。不能把兩張概念板直接當正式透明角色；缺素材要明示未完成／回退，不能代換別套。第4批才接GM，第5批才接正式B，不重寫原Renderer或改數值、存檔、GM授權及發布隔離。

回退：對本批提交做git revert；不遷移玩家資料。正式發布資格與既有功能開關始終未改。
