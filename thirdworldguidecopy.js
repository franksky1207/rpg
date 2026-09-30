(function(){
 const VERSION=3;
 const INTEGRITY_VERSION=2;
 const ID_BY_CATEGORY_AND_TITLE=Object.freeze({
  gear:Object.freeze({
   "高維裝備":"third-gear-loot",
   "裝備等級":"third-gear-level",
   "裝備命名":"third-gear-name",
   "裝備處理":"third-gear-disposal",
   "裝備欄位強化":"third-gear-enhancement",
   "VIP20 裝備保護":"third-gear-vip-protection"
  }),
  combat:Object.freeze({
   "戰鬥結算":"third-combat-settlement",
   "戰鬥收益":"third-combat-rewards",
   "10 名高維存在的個體特化":"third-combat-specialization",
   "Stage 強化":"third-combat-stage",
   "共通能力":"third-combat-abilities",
   "死亡壓制":"third-combat-death-suppression",
   "戰鬥速度":"third-combat-speed"
  }),
  dungeon:Object.freeze({
   "高維副本":"third-dungeon-overview",
   "高維競技場":"third-dungeon-arena",
   "虛空幻境":"third-dungeon-void",
   "鏡像戰":"third-dungeon-mirror",
   "VIP 系統":"third-dungeon-vip",
   "VIP 裝備保護":"third-dungeon-vip-protection"
  }),
  growth:Object.freeze({
   "維度之弦":"third-growth-strings",
   "界弦核心":"third-growth-core",
   "核心注入":"third-growth-infusion",
   "高維稱號":"third-growth-title",
   "既有養成":"third-growth-existing",
   "極簡模式":"third-growth-minimal",
   "存檔":"third-growth-save"
  })
 });
 const EXPECTED_IDS=Object.freeze([
  "third-gear-vip-protection","third-combat-specialization","third-combat-stage","third-combat-abilities","third-dungeon-arena","third-dungeon-vip-protection","third-growth-strings","third-growth-core","third-growth-infusion","third-growth-title","third-growth-existing","third-growth-minimal","third-growth-save"
 ]);
 function category(categories,id){return Array.isArray(categories)?categories.find(row=>row?.id===id):null;}
 function ensureItemIds(categories){
  let assigned=0;
  Object.entries(ID_BY_CATEGORY_AND_TITLE).forEach(([categoryId,map])=>{
   const items=category(categories,categoryId)?.items;
   if(!Array.isArray(items))return;
   items.forEach(item=>{
    if(!Array.isArray(item))return;
    const id=map[String(item[0]||"")];
    if(!id)return;
    if(item[2]!==id){item[2]=id;assigned++;}
   });
  });
  return assigned;
 }
 function itemById(items,id){return Array.isArray(items)?items.find(item=>Array.isArray(item)&&item[2]===id):null;}
 function replaceById(items,id,text){const row=itemById(items,id);if(!row)return false;row[1]=text;return true;}
 function removeById(items,id){
  if(!Array.isArray(items))return false;
  const index=items.findIndex(item=>Array.isArray(item)&&item[2]===id);
  if(index<0)return false;
  items.splice(index,1);return true;
 }
 function audit(categories,mutation=null){
  const errors=[];
  const allItems=(Array.isArray(categories)?categories:[]).flatMap(row=>Array.isArray(row?.items)?row.items:[]).filter(Array.isArray);
  const ids=new Set(allItems.map(item=>String(item[2]||"")).filter(Boolean));
  const requiredPresent=EXPECTED_IDS.filter(id=>!id.endsWith("vip-protection"));
  requiredPresent.forEach(id=>{if(!ids.has(id))errors.push({code:"MISSING_STABLE_ITEM_ID",id});});
  if(ids.has("third-gear-vip-protection")||ids.has("third-dungeon-vip-protection"))errors.push({code:"VIP_PROTECTION_ITEM_STILL_VISIBLE"});
  const joined=allItems.map(item=>`${item[0]}\n${item[1]}`).join("\n");
  if(/30%[^\n]{0,80}裝備|裝備[^\n]{0,80}30%/.test(joined))errors.push({code:"DEATH_LOSS_PERCENT_LEAK"});
  if(/VIP20[^\n]{0,80}(裝備遺失|死亡裝備保護|攔下)/.test(joined))errors.push({code:"VIP20_PROTECTION_DETAIL_LEAK"});
  const arena=itemById(category(categories,"dungeon")?.items,"third-dungeon-arena");
  if(!arena||String(arena[1]||"").includes("尚未開放"))errors.push({code:"THIRD_ARENA_COPY_STALE"});
  const stage=itemById(category(categories,"combat")?.items,"third-combat-stage");
  if(!stage||/ATK|DEF|\+\d+%/.test(String(stage[1]||"")))errors.push({code:"THIRD_STAGE_COPY_TOO_DETAILED"});
  const core=itemById(category(categories,"growth")?.items,"third-growth-core");
  if(!core||/1,000,000,000|0\.100%|0\.008%|0\.50%|0\.04%/.test(String(core[1]||"")))errors.push({code:"THIRD_CORE_COPY_TOO_DETAILED"});
  if(mutation){
   const expectedReplacements=11;
   if(mutation.replaced!==expectedReplacements)errors.push({code:"COPY_REPLACEMENT_COUNT",expected:expectedReplacements,actual:mutation.replaced});
   if(mutation.removed!==2)errors.push({code:"COPY_REMOVAL_COUNT",expected:2,actual:mutation.removed});
  }
  return Object.freeze({version:INTEGRITY_VERSION,passed:errors.length===0,errors,checkedAt:Date.now(),mutation:mutation?Object.freeze({...mutation}):null});
 }
 window.THIRD_WORLD_GUIDE_PLAYER_COPY_VERSION=VERSION;
 window.THIRD_WORLD_GUIDE_COPY_INTEGRITY_VERSION=INTEGRITY_VERSION;
 window.runThirdWorldGuideCopyIntegrity=function(categories=null){
  const source=Array.isArray(categories)?categories:(typeof window.gameGuideCategoriesForState==="function"?window.gameGuideCategoriesForState({secondWorld:{entered:true},thirdWorld:{entered:true,entryVersion:2,bosses:Array.from({length:10},()=>({currentHp:1100000000})),story:{introSeen:true,unlockedStage:0,finalSeen:false}}}):[]);
  const report=audit(source);
  window.THIRD_WORLD_GUIDE_COPY_INTEGRITY_REPORT=report;
  return report;
 };
 if(typeof window.registerGameGuideExtension!=="function")return;
 window.registerGameGuideExtension({
  id:"third-world-player-copy",
  order:40,
  extendCategories(categories,context){
   if(Number(context?.phase)!==3)return categories;
   ensureItemIds(categories);
   const gear=category(categories,"gear"),combat=category(categories,"combat"),dungeon=category(categories,"dungeon"),growth=category(categories,"growth");
   let replaced=0,removed=0;
   removed+=removeById(gear?.items,"third-gear-vip-protection")?1:0;
   removed+=removeById(dungeon?.items,"third-dungeon-vip-protection")?1:0;
   replaced+=replaceById(combat?.items,"third-combat-specialization","10 名高維存在各自擁有不同的戰鬥特性；實際特化效果會顯示在各自的 Boss 卡片上。")?1:0;
   replaced+=replaceById(combat?.items,"third-combat-stage","高維存在的永久 HP 持續下降時，會逐步進入更高 Stage，整體戰鬥能力也會隨之提升。詳細狀態以 Boss 卡片顯示為準。")?1:0;
   replaced+=replaceById(combat?.items,"third-combat-abilities","高維存在會隨永久 HP 推進逐步解鎖共通能力；目前已解鎖的能力與效果以 Boss 卡片顯示為準。")?1:0;
   replaced+=replaceById(dungeon?.items,"third-dungeon-arena","高維競技場已開放。每輪為 3 場連續戰鬥，場間不回血；可選擇定相或異相模式，也可依剩餘每日次數一次進行多輪挑戰。完成挑戰可取得 VIP 積分，實際對手與獎勵以競技場頁面顯示為準。")?1:0;
   replaced+=replaceById(growth?.items,"third-growth-strings","維度之弦是第三紀元的主要永久成長資源，透過高維正式戰鬥取得，可用於強化界弦核心。")?1:0;
   replaced+=replaceById(growth?.items,"third-growth-core","界弦核心可使用維度之弦持續強化，主要用來減輕高維連戰的死亡壓制。每輪連戰開始後，本輪核心效果會固定到該輪結束。")?1:0;
   replaced+=replaceById(growth?.items,"third-growth-infusion","持有維度之弦時可注入界弦核心；高維連戰進行中不能注入，需先結束本輪戰鬥。")?1:0;
   replaced+=replaceById(growth?.items,"third-growth-title","高維稱號會隨 10 名高維存在的整體攻略進度逐步解鎖。")?1:0;
   replaced+=replaceById(growth?.items,"third-growth-existing","進入第三紀元前已完成的專精、強化、印記與文明等級會繼續保留並套用。")?1:0;
   replaced+=replaceById(growth?.items,"third-growth-minimal","高維連續戰鬥可使用極簡模式，只保留必要資訊；戰鬥停止時會明確顯示停止狀態與原因，滑動即可查看後續結果。")?1:0;
   replaced+=replaceById(growth?.items,"third-growth-save","第三紀元正式進度會持續寫入本機存檔；登入帳號後仍可在設定頁手動使用雲端上傳／下載。")?1:0;
   const report=audit(categories,{replaced,removed});
   window.THIRD_WORLD_GUIDE_COPY_INTEGRITY_REPORT=report;
   return categories;
  }
 });
})();
