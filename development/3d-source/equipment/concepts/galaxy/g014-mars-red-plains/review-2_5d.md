# g014 2.5D 概念審查遷移

政策：equipment-2.5d-v3.0；複查日期：2026-10-15；起點main：a232efb3e44e035bea20075762bf6789332d0b14。

正式身份：
```json
{
  "id": "g014",
  "epoch": "galaxy",
  "sourceKey": "galaxy:solar:map:3",
  "directory": "development/3d-source/equipment/concepts/galaxy/g014-mars-red-plains",
  "regionOrBoss": "太陽系戰爭 → 火星赤原戰場",
  "equipmentNames": {
    "weapon": "赤星重刃",
    "helmet": "沙暴戰盔",
    "armor": "火星重型甲",
    "shoes": "赤原突進靴",
    "accessory": "戰區火控模組"
  }
}
```

- overview-front-side-back.webp: `b366a95b47b1bc1ab55c0b4231df1a05d93ab0d4bcd07e04e4a03b784deec3f2`
- equipment-five-slots.webp: `956fb7158385058f3686ae6c15415bf928c0763b910eb784533d633093786078`

ChatGPT初審為歷史助手／代理審查的政策遷移，原始來源 `docs/BATCH28_G001_G020_IMAGE_AUDIT_2026-10-13.md`（SHA `3a774497c2398c597e31c4febfa1c4e368c37fa895f8c39aeb3e8bed7268f25c`）；沒有聲稱本輪重新呼叫另一名審查者。G006/G007以當前版本代理批准為準，其他舊細節fail依新政策分類為建議。Codex本輪以12張只讀比對圖檢視60原圖及小尺寸參考，獨立核對owner和歷史逐圖記錄。

- officialIdentity: g014 已從正式owner重抽核對epoch/sourceKey/目錄及五槽中文名；galaxy:solar:map:3，名稱以notes而非AI小字判定。
- imageIntegrity: g014 兩張WebP完整解碼、bytes/尺寸/SHA符合起始main索引，內容分別為總覽與五槽參考且SHA不同。
- contentIdentity: g014 可見紅色寬楔胸甲、重刃與雙鏡火控器；兩圖主要材質、武器和背件對應，未見錯套或整套缺失。
- characterReadability: g014 主體完整，紅色寬楔胸甲、重刃與雙鏡火控器在縮小參考檢視仍有主要形體；此為概念靜態檢視，不宣稱正式戰鬥或手機實測。
- provenanceLicense: g014 沿用專案既存生成／使用者提供來源聲明，僅開發概念用途；未導入第三方素材，無新增授權衝突證據，不宣稱已取得商用發布授權。

非阻擋建議：g014：大刃握把尺度和肩肘包絡尚非動態驗證。素材完成與GM實測須另驗。

來源限制：前20套沿用專案歷史來源；G021～G025來源為附件提供者的ChatGPT生成聲明，無獨立原PNG生成追蹤；G026～G030有十次生成記錄。這是開發用途來源審核，不是對著作權的第三方證明；正式發布獨立保持false。

結論：未見新版真正blocker；概念pass-with-advisory，可製作2.5D素材；素材not-started、GM not-tested、正式發布false。G007原3D模型狀態獨立保留，不能當作新2.5D素材完成。
