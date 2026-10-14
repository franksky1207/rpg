# g002 2.5D 概念審查遷移

政策：equipment-2.5d-v3.0；複查日期：2026-10-15；起點main：a232efb3e44e035bea20075762bf6789332d0b14。

正式身份：
```json
{
  "id": "g002",
  "epoch": "galaxy",
  "sourceKey": "galaxy:earth:map:1",
  "directory": "development/3d-source/equipment/concepts/galaxy/g002-suburban-defense",
  "regionOrBoss": "地球戰爭 → 郊區防衛線",
  "equipmentNames": {
    "weapon": "壕溝軍刀",
    "helmet": "哨戒戰盔",
    "armor": "防線重甲",
    "shoes": "越野作戰靴",
    "accessory": "前線測距儀"
  }
}
```

- overview-front-side-back.webp: `ac69b16d73368dc16bfeb6d8b45a0ac229963ae66a51fe89cba7235a34365510`
- equipment-five-slots.webp: `3325ceb1ff3b234778c0e601ce0c5c9d00a968a31b5ce5b457900de86bf61510`

ChatGPT初審為歷史助手／代理審查的政策遷移，原始來源 `docs/BATCH28_G001_G020_IMAGE_AUDIT_2026-10-13.md`（SHA `3a774497c2398c597e31c4febfa1c4e368c37fa895f8c39aeb3e8bed7268f25c`）；沒有聲稱本輪重新呼叫另一名審查者。G006/G007以當前版本代理批准為準，其他舊細節fail依新政策分類為建議。Codex本輪以12張只讀比對圖檢視60原圖及小尺寸參考，獨立核對owner和歷史逐圖記錄。

- officialIdentity: g002 已從正式owner重抽核對epoch/sourceKey/目錄及五槽中文名；galaxy:earth:map:1，名稱以notes而非AI小字判定。
- imageIntegrity: g002 兩張WebP完整解碼、bytes/尺寸/SHA符合起始main索引，內容分別為總覽與五槽參考且SHA不同。
- contentIdentity: g002 可見橫向厚板、直軍刀與雙鏡測距器；兩圖主要材質、武器和背件對應，未見錯套或整套缺失。
- characterReadability: g002 主體完整，橫向厚板、直軍刀與雙鏡測距器在縮小參考檢視仍有主要形體；此為概念靜態檢視，不宣稱正式戰鬥或手機實測。
- provenanceLicense: g002 沿用專案既存生成／使用者提供來源聲明，僅開發概念用途；未導入第三方素材，無新增授權衝突證據，不宣稱已取得商用發布授權。

非阻擋建議：g002：膝脛零件未在短靴欄完整指派，屬細小分件建議。素材完成與GM實測須另驗。

來源限制：前20套沿用專案歷史來源；G021～G025來源為附件提供者的ChatGPT生成聲明，無獨立原PNG生成追蹤；G026～G030有十次生成記錄。這是開發用途來源審核，不是對著作權的第三方證明；正式發布獨立保持false。

結論：未見新版真正blocker；概念pass-with-advisory，可製作2.5D素材；素材not-started、GM not-tested、正式發布false。G007原3D模型狀態獨立保留，不能當作新2.5D素材完成。
