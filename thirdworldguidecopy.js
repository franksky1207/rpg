(function(){
 const VERSION=1;
 function category(categories,id){return Array.isArray(categories)?categories.find(row=>row?.id===id):null;}
 function replaceItem(items,title,text){
  if(!Array.isArray(items))return false;
  const row=items.find(item=>Array.isArray(item)&&item[0]===title);
  if(!row)return false;
  row[1]=text;
  return true;
 }
 function removeItem(items,predicate){
  if(!Array.isArray(items))return 0;
  let removed=0;
  for(let i=items.length-1;i>=0;i--){
   if(predicate(items[i])){items.splice(i,1);removed++;}
  }
  return removed;
 }
 window.THIRD_WORLD_GUIDE_PLAYER_COPY_VERSION=VERSION;
 if(typeof window.registerGameGuideExtension!=="function")return;
 window.registerGameGuideExtension({
  id:"third-world-player-copy",
  order:40,
  extendCategories(categories,context){
   if(Number(context?.phase)!==3)return categories;
   const gear=category(categories,"gear"),combat=category(categories,"combat"),dungeon=category(categories,"dungeon"),growth=category(categories,"growth");

   // 第三紀元已強制要求 VIP20，裝備保護讓玩家在實戰中自然感受，不再額外劇透機制。
   removeItem(gear?.items,item=>Array.isArray(item)&&/^VIP\d+ 裝備保護$/.test(String(item[0]||"")));
   removeItem(dungeon?.items,item=>Array.isArray(item)&&String(item[0]||"")==="VIP 裝備保護");

   // 戰鬥說明只保留玩家需要理解的方向；精確數值與當前狀態交給 Boss 卡片顯示。
   replaceItem(combat?.items,"10 名高維存在的個體特化","10 名高維存在各自擁有不同的戰鬥特性；實際特化效果會顯示在各自的 Boss 卡片上。");
   replaceItem(combat?.items,"Stage 強化","高維存在的永久 HP 持續下降時，會逐步進入更高 Stage，整體戰鬥能力也會隨之提升。詳細狀態以 Boss 卡片顯示為準。");
   replaceItem(combat?.items,"共通能力","高維存在會隨永久 HP 推進逐步解鎖共通能力；目前已解鎖的能力與效果以 Boss 卡片顯示為準。");

   // 高維競技場已正式完成，不再顯示舊的等待文字。
   replaceItem(dungeon?.items,"高維競技場","高維競技場已開放。每輪為 3 場連續戰鬥，場間不回血；可選擇定相或異相模式，也可依剩餘每日次數一次進行多輪挑戰。完成挑戰可取得 VIP 積分，實際對手與獎勵以競技場頁面顯示為準。");

   // 高維成長改成玩家導向說明，不公開後台調參與精確壓制數字。
   replaceItem(growth?.items,"維度之弦","維度之弦是第三紀元的主要永久成長資源，透過高維正式戰鬥取得，可用於強化界弦核心。");
   replaceItem(growth?.items,"界弦核心","界弦核心可使用維度之弦持續強化，主要用來減輕高維連戰的死亡壓制。每輪連戰開始後，本輪核心效果會固定到該輪結束。");
   replaceItem(growth?.items,"核心注入","持有維度之弦時可注入界弦核心；高維連戰進行中不能注入，需先結束本輪戰鬥。");
   replaceItem(growth?.items,"高維稱號","高維稱號會隨 10 名高維存在的整體攻略進度逐步解鎖。");
   replaceItem(growth?.items,"既有養成","進入第三紀元前已完成的專精、強化、印記與文明等級會繼續保留並套用。");
   replaceItem(growth?.items,"極簡模式","高維連續戰鬥可使用極簡模式，只保留必要資訊；切回一般畫面後會正常接續戰鬥。");
   replaceItem(growth?.items,"存檔","第三紀元正式進度會持續寫入本機存檔；登入帳號後仍可在設定頁手動使用雲端上傳／下載。");
   return categories;
  }
 });
})();
