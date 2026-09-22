(function(){
 function sgQualityName(index){
  return Array.isArray(QUALITY)&&QUALITY[index]?.n?QUALITY[index].n:`品質 ${index}`;
 }

 function sgEffectText(effect){
  if(!effect||!effect.type)return "";
  switch(effect.type){
   case "expMultiplier": return effect.value===1?"一般 EXP":`EXP ×${effect.value}`;
   case "goldMultiplier": return effect.value===1?"一般金幣":`金幣 ×${effect.value}`;
   case "dropChance": return Number(effect.value)<=0?"不掉落裝備":`裝備掉落率 ${Math.round(Number(effect.value)*100)}%`;
   case "guaranteedDrop": return "必定掉落裝備";
   case "minQuality": return `裝備至少為${sgQualityName(Number(effect.value)||0)}品質`;
   case "qualityTable": return "使用特殊品質掉落表";
   case "qualitySource": return effect.value==="normal"?"使用一般怪品質掉落表":"使用特殊掉落來源";
   case "dropCount": return `一次掉落 ${Math.max(1,Math.floor(Number(effect.value)||1))} 件裝備`;
   case "weakSlotDrop": return "優先補強目前較弱的裝備部位";
   case "randomReward": {
    const labels=(Array.isArray(effect.options)?effect.options:[]).map(x=>x?.label).filter(Boolean);
    return labels.length?`隨機獎勵：${labels.join("／")}`:"隨機特殊獎勵";
   }
   default: return "特殊獎勵";
  }
 }

 function sgMonsterRewardText(monster){
  const texts=(monster?.effects||[]).map(sgEffectText).filter(Boolean);
  return [...new Set(texts)].join("、")||"特殊獎勵";
 }

 function sgMonsterListHtml(){
  if(!Array.isArray(SPECIAL_MONSTERS)||!SPECIAL_MONSTERS.length)return `<div class="muted">目前沒有特殊怪資料。</div>`;
  const universe=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered();
  return SPECIAL_MONSTERS.map(base=>{const monster=typeof window.specialMonsterForWorld==="function"?window.specialMonsterForWorld(base,universe?2:1):base;return `<div class="item"><b>✦ ${monster.name}</b><div class="muted" style="margin-top:5px">${monster.description||"特殊遭遇中的罕見敵人。"}</div></div>`;}).join("");
 }

 function sgGuideHtml(){
  const universe=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered();
  const rule=universe?"宇宙主線 Boss 勝利後有機會觸發特殊遭遇。特殊戰鬥結束後 HP 回滿；失敗會結束連續戰鬥。":"普通怪與菁英怪勝利後有機會觸發特殊遭遇，Boss 不會觸發。特殊戰鬥結束後 HP 回滿；失敗會結束連續戰鬥。";
  return `<details class="card" style="margin-top:14px"><summary style="cursor:pointer"><b>✦ 特殊遭遇說明</b></summary><div class="notice" style="margin-top:12px"><b>特殊遭遇規則</b><div class="muted" style="margin-top:6px">${rule}</div></div><div style="margin-top:12px"><b>特殊怪</b>${sgMonsterListHtml()}</div></details>`;
 }

 const sgBaseAdventurePreparePage=adventurePreparePage;
 adventurePreparePage=function(){
  let html=sgBaseAdventurePreparePage();
  const insertAt=html.lastIndexOf("</section>");
  if(insertAt<0)return html+sgGuideHtml();
  return html.slice(0,insertAt)+sgGuideHtml()+html.slice(insertAt);
 };
window.SPECIAL_GUIDE_WORLD_AWARE_VERSION=1;
})();