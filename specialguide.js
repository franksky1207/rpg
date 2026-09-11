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
   case "shopRefreshDown": return `商店刷新價格降低 ${Math.max(0,Math.floor(Number(effect.value)||0))} 級`;
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
  return SPECIAL_MONSTERS.map(monster=>`<div class="item"><b>✦ ${monster.name}</b><div class="muted" style="margin-top:5px">${monster.description||"特殊遭遇中的罕見敵人。"}</div><div style="margin-top:5px">${sgMonsterRewardText(monster)}</div></div>`).join("");
 }

 function sgGuideHtml(){
  const rate=Math.round((Number(SPECIAL_ENCOUNTER_RATE)||0)*1000)/10;
  return `<details class="card" style="margin-top:14px"><summary style="cursor:pointer"><b>✦ 特殊遭遇說明</b></summary><div class="notice" style="margin-top:12px"><b>特殊遭遇規則</b><div class="muted" style="margin-top:6px">一般怪與菁英戰鬥後，每場約有 ${rate}% 機率觸發特殊遭遇；Boss 不會觸發。若目前怪物等級比玩家低 10 級以上，也不會觸發。主線每場戰鬥結束後會回滿 HP；觸發特殊遭遇時會自動進入戰鬥。特殊戰鬥結束後也會回滿 HP；勝利後繼續原本剩餘連戰，失敗則立即結束本次連戰。</div></div><div style="margin-top:12px"><b>特殊怪</b>${sgMonsterListHtml()}</div></details>`;
 }

 const sgBaseAdventurePreparePage=adventurePreparePage;
 adventurePreparePage=function(){
  let html=sgBaseAdventurePreparePage();
  const insertAt=html.lastIndexOf("</section>");
  if(insertAt<0)return html+sgGuideHtml();
  return html.slice(0,insertAt)+sgGuideHtml()+html.slice(insertAt);
 };
})();