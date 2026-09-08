function gmHtml(){
 const qualityOptions=QUALITY.map((q,i)=>`<option value="${i}" ${i===3?"selected":""}>${q.n}</option>`).join("");
 const levelOptions=Array.from({length:50},(_,i)=>{const lv=i+1;return `<option value="${lv}" ${lv===state.level?"selected":""}>Lv.${lv}</option>`}).join("");
 const typeOptions=EQUIPMENT_TYPES.map(type=>`<option value="${type}">${equipmentTypeLabel(type)}</option>`).join("");
 return `<div class="gm"><h3>管理／GM 模式</h3>
  <div class="controls">
   <button class="btn" onclick="gmLevel()">指定等級</button>
   <button class="btn" onclick="gmGold()">指定金幣</button>
   <button class="btn" onclick="gmUnlock()">解鎖全部地圖與怪物</button>
   <button class="btn blue" onclick="gmRefreshShop()">刷新商店</button>
   <button class="btn blue" onclick="gmResetShopPrice()">重置商店</button>
   <button class="btn" onclick="gmHeal()">補滿 HP</button>
   <button class="btn danger" onclick="gmClearInventory()">清空背包</button>
  </div>
  <div class="item" style="margin-top:14px"><b>產生裝備</b>
   <div class="controls" style="align-items:end">
    <label>品質<br><select id="gmGearQuality" class="btn">${qualityOptions}</select></label>
    <label>等級<br><select id="gmGearLevel" class="btn">${levelOptions}</select></label>
    <label>部位<br><select id="gmGearType" class="btn">${typeOptions}</select></label>
    <button class="btn primary" onclick="gmCreateGear()">產生裝備</button>
   </div>
  </div>
  <div class="controls" style="margin-top:14px"><button class="btn" onclick="state.gm=false;save();render()">關閉管理模式</button></div>
 </div>`;
}

function gmGold(){
 const raw=prompt("指定金幣（0 以上）",state.gold);
 if(raw===null)return;
 const n=Math.floor(Number(raw));
 if(!Number.isFinite(n)||n<0){alert("請輸入 0 以上的數字。");return}
 state.gold=n;save();render();
}

function gmUnlock(){
 state.unlockedMap=9;
 state.mapProgress=Array.from({length:10},()=>[10,10,10,10]);
 state.bossProgress=Array(10).fill(10);
 state.bossLocked=Array(10).fill(false);
 state.bossKilled=Array(10).fill(true);
 save();render();
}

function gmCreateGear(){
 const q=Number(document.getElementById("gmGearQuality")?.value);
 const level=Number(document.getElementById("gmGearLevel")?.value);
 const type=document.getElementById("gmGearType")?.value;
 if(!Number.isInteger(q)||q<0||q>=QUALITY.length)return;
 if(!Number.isInteger(level)||level<1||level>50)return;
 if(!EQUIPMENT_TYPES.includes(type))return;
 const mapIdx=Math.min(9,Math.floor((level-1)/5));
 state.inventory.push(makeItem(level,mapIdx,"normal",q,type));
 save();render();
}

function gmRefreshShop(){freeShopRefresh(currentShopMap());save(false);render()}
function gmResetShopPrice(){
 if(!state.shop||typeof state.shop!=="object")state.shop=newShopState();
 state.shop.refreshIndex=0;
 state.shop.resetAvailableAt=0;
 save(false);render();
}
function gmHeal(){state.hp=equippedStats().hp;save();render()}
function gmClearInventory(){
 if(!state.inventory.length){alert("背包目前是空的。");return}
 if(!confirm(`確定要清空背包中的 ${state.inventory.length} 件裝備嗎？\n目前穿戴中的裝備不會受到影響。`))return;
 state.inventory=[];selectedItem=null;save();render();
}
