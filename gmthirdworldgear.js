(function(){
 const VERSION=1;
 let selectedBossIndex=0;
 const baseRenderer=typeof window.gmGeneralManagementHtml==="function"?window.gmGeneralManagementHtml:null;

 function gameState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function active(){const s=gameState();return !!s?.thirdWorld?.entered;}
 function bosses(){return Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS:[];}
 function normalizeBoss(){
  const rows=bosses();
  if(!rows.some(row=>Number(row?.index)===selectedBossIndex))selectedBossIndex=Number(rows[0]?.index)||0;
  return selectedBossIndex;
 }
 function bossOptions(){
  normalizeBoss();
  return bosses().map(row=>`<option value="${Number(row.index)}" ${Number(row.index)===selectedBossIndex?"selected":""}>${row.name}</option>`).join("");
 }
 function typeOptions(){
  const types=Array.isArray(window.EQUIPMENT_TYPES)?window.EQUIPMENT_TYPES:[];
  const label=type=>typeof window.equipmentTypeLabel==="function"?window.equipmentTypeLabel(type):String(type);
  return `<option value="all">全部 5 部位</option>${types.map(type=>`<option value="${type}">${label(type)}</option>`).join("")}`;
 }
 function qualityOptions(){
  const legendary=window.QUALITY?.[4]?.n||"傳說",mythic=window.QUALITY?.[5]?.n||"神話";
  return `<option value="4">${legendary}</option><option value="5" selected>${mythic}</option>`;
 }
 function cardHtml(){
  if(!active())return "";
  const level=Math.max(1000,Math.min(2000,Math.floor(Number(gameState()?.level)||1000)));
  return `<div class="item" style="margin-top:12px"><b>產生高維紀元裝備</b><div class="muted" style="margin-top:5px">依第三紀元正式裝備規則產生；裝備等級使用目前角色等級（Lv.${level}），名稱依目前高維整體進度決定。高維裝備只會出現傳說與神話品質。</div><div class="controls" style="align-items:end;margin-top:8px"><label>高維存在<br><select id="gmThirdWorldGearBoss" class="btn" onchange="gmThirdWorldGearChangeBoss()">${bossOptions()}</select></label><label>品質<br><select id="gmThirdWorldGearQuality" class="btn">${qualityOptions()}</select></label><label>部位<br><select id="gmThirdWorldGearType" class="btn">${typeOptions()}</select></label><button class="btn gm-create" onclick="gmCreateThirdWorldGear()">產生裝備</button></div></div>`;
 }
 function renderer(){return `${baseRenderer?baseRenderer():""}${cardHtml()}`;}

 window.gmThirdWorldGearChangeBoss=function(){
  const rows=bosses(),requested=Math.floor(Number(document.getElementById("gmThirdWorldGearBoss")?.value));
  selectedBossIndex=rows.some(row=>Number(row?.index)===requested)?requested:(Number(rows[0]?.index)||0);
 };
 window.gmCreateThirdWorldGear=function(){
  if(!active())return alert("目前尚未進入高維紀元。");
  if(typeof window.makeThirdWorldEquipmentForBoss!=="function")return alert("高維紀元裝備 owner 尚未載入。");
  window.gmThirdWorldGearChangeBoss();
  const q=Math.floor(Number(document.getElementById("gmThirdWorldGearQuality")?.value));
  if(q!==4&&q!==5)return alert("高維紀元裝備品質只能選擇傳說或神話。");
  const selectedType=document.getElementById("gmThirdWorldGearType")?.value;
  const equipmentTypes=Array.isArray(window.EQUIPMENT_TYPES)?window.EQUIPMENT_TYPES:[];
  const types=selectedType==="all"?equipmentTypes.slice():equipmentTypes.includes(selectedType)?[selectedType]:[];
  if(!types.length)return;
  const s=gameState();let created=0;
  types.forEach(type=>{
   const item=window.makeThirdWorldEquipmentForBoss(selectedBossIndex,{state:s,forcedQ:q,forcedType:type,sourceTag:"gm-third-world"});
   if(item){s.inventory.push(item);created++;}
  });
  if(!created)return alert("無法產生高維紀元裝備。");
  if(typeof save==="function")save();
  if(typeof render==="function")render();
  alert(`已產生 ${created} 件高維紀元裝備。`);
 };
 window.gmThirdWorldGearManagementHtml=renderer;
 window.GM_THIRD_WORLD_GEAR_MANAGEMENT_VERSION=VERSION;
 window.GM_THIRD_WORLD_GEAR_QUALITY_POLICY=Object.freeze({allowed:Object.freeze([4,5]),defaultQuality:5});
 window.GM_THIRD_WORLD_GEAR_MANAGEMENT_INTEGRITY=Object.freeze({
  version:VERSION,
  passed:typeof window.makeThirdWorldEquipmentForBoss==="function"&&Number(window.THIRD_WORLD_EQUIPMENT_QUALITY_POLICY_VERSION)>=1&&Number(window.THIRD_WORLD_EQUIPMENT_BASE_POLICY?.legendaryChance)===.95&&Number(window.THIRD_WORLD_EQUIPMENT_BASE_POLICY?.mythicChance)===.05,
  allowedQualities:Object.freeze([4,5]),
  defaultQuality:5
 });

 window.gmGeneralManagementHtml=renderer;
 if(typeof window.replaceGmHubSectionRenderer==="function")window.replaceGmHubSectionRenderer("manage","general-manage",renderer,"角色管理");
})();
