# g003 2.5D 概念審查遷移

政策：equipment-2.5d-v3.0；複查日期：2026-10-15；起點main：a232efb3e44e035bea20075762bf6789332d0b14。

正式身份：
```json
{
  "id": "g003",
  "epoch": "galaxy",
  "sourceKey": "galaxy:earth:map:2",
  "directory": "development/3d-source/equipment/concepts/galaxy/g003-underground-military",
  "regionOrBoss": "地球戰爭 → 地下軍事設施",
  "equipmentNames": {
    "weapon": "試作振動刃",
    "helmet": "地堡密封盔",
    "armor": "實驗型護甲",
    "shoes": "封鎖區戰靴",
    "accessory": "軍規解碼器"
  }
}
```

- overview-front-side-back.webp: `035df705ff62e46722740ad02dc5f888f88ad7bf9102a3288b678b31c7828525`
- equipment-five-slots.webp: `b3aeb221c3164b7d914748a4094aa71a3c9a258f47a7a18398a8ae1f9bcfc480`

ChatGPT初審為歷史助手／代理審查的政策遷移，原始來源 `docs/BATCH28_G001_G020_IMAGE_AUDIT_2026-10-13.md`（SHA `3a774497c2398c597e31c4febfa1c4e368c37fa895f8c39aeb3e8bed7268f25c`）；沒有聲稱本輪重新呼叫另一名審查者。G006/G007以當前版本代理批准為準，其他舊細節fail依新政策分類為建議。Codex本輪以12張只讀比對圖檢視60原圖及小尺寸參考，獨立核對owner和歷史逐圖記錄。

- officialIdentity: g003 已從正式owner重抽核對epoch/sourceKey/目錄及五槽中文名；galaxy:earth:map:2，名稱以notes而非AI小字判定。
- imageIntegrity: g003 兩張WebP完整解碼、bytes/尺寸/SHA符合起始main索引，內容分別為總覽與五槽參考且SHA不同。
- contentIdentity: g003 可見縱肋銀灰收腰甲、紫刃與方形解碼器；兩圖主要材質、武器和背件對應，未見錯套或整套缺失。
- characterReadability: g003 主體完整，縱肋銀灰收腰甲、紫刃與方形解碼器在縮小參考檢視仍有主要形體；此為概念靜態檢視，不宣稱正式戰鬥或手機實測。
- provenanceLicense: g003 沿用專案既存生成／使用者提供來源聲明，僅開發概念用途；未導入第三方素材，無新增授權衝突證據，不宣稱已取得商用發布授權。

非阻擋建議：g003：甲膝與靴長脛殼銜接高度未標，不要求工程剖面。素材完成與GM實測須另驗。

來源限制：前20套沿用專案歷史來源；G021～G025來源為附件提供者的ChatGPT生成聲明，無獨立原PNG生成追蹤；G026～G030有十次生成記錄。這是開發用途來源審核，不是對著作權的第三方證明；正式發布獨立保持false。

結論：未見新版真正blocker；概念pass-with-advisory，可製作2.5D素材；素材not-started、GM not-tested、正式發布false。G007原3D模型狀態獨立保留，不能當作新2.5D素材完成。
