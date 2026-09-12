const GM_TEST_RUNS=100;

function gmCreateSandboxSnapshot(){
 return {stateJson:JSON.stringify(state),upgradeDropNoticePending};
}
function gmResetSandbox(snapshot){
 if(!snapshot)return;
 state=JSON.parse(snapshot.stateJson);
 upgradeDropNoticePending=snapshot.upgradeDropNoticePending;
}
function gmRestoreSandbox(snapshot){
 gmResetSandbox(snapshot);
 save(false);
}

function gmRewardSummaryHtml(summary,extraRows=""){
 const qualityRows=(summary.qualityCounts||[]).map((n,i)=>n?`<span class="${qClass(i)}">${QUALITY[i].n} ${n}</span>`:"").filter(Boolean).join("　")||"無";
 return `<div class="notice" style="margin-top:10px"><b>模擬獎勵合計</b><div style="margin-top:6px">EXP +${(summary.totalXp||0).toLocaleString()}　金幣 +${(summary.totalGold||0).toLocaleString()}</div>${summary.convertedGold?`<div class="muted" style="margin-top:6px">其中滿等 EXP 轉換金幣：+${summary.convertedGold.toLocaleString()}</div>`:""}<div class="muted" style="margin-top:6px">裝備掉落 ${summary.dropCount||0} 件：${qualityRows}</div>${summary.totalSellValue?`<div class="muted" style="margin-top:6px">掉落裝備依本次測試鑑價專精的售價合計：${summary.totalSellValue.toLocaleString()} 金幣</div>`:""}${extraRows}</div>`;
}

function gmLevel(){
 const raw=prompt(`指定等級（1～${MAX_LEVEL}）`,state.level);
 if(raw===null)return;
 const n=Math.floor(Number(raw));
 if(!Number.isFinite(n)){alert("請輸入有效等級。");return;}
 state.level=clampGameLevel(n);
 state.exp=0;
 state.hp=playerCombatStats().hp;
 save();render();
}

function gmGold(){
 const raw=prompt("指定金幣（0 以上）",state.gold);
 if(raw===null)return;
 const n=Math.floor(Number(raw));
 if(!Number.isFinite(n)||n<0){alert("請輸入 0 以上的數字。");return}
 state.gold=n;save();render();
}

function gmSetWorldProgress(){
 const raw=prompt(`指定目前攻略到哪個等級關卡（1～${MAX_LEVEL}）`,state.level);
 if(raw===null)return;
 const target=Math.floor(Number(raw));
 if(!Number.isFinite(target)||target<1||target>MAX_LEVEL){alert(`請輸入 1～${MAX_LEVEL} 的整數。`);return}

 const count=MAPS.length;
 const currentMap=Math.max(0,Math.min(count-1,Math.floor((target-1)/5)));
 const currentEnemy=(target-1)%5;
 const mapProgress=Array.from({length:count},()=>[0,0,0,0]);
 const bossProgress=Array(count).fill(0);
 const bossLocked=Array(count).fill(false);
 const bossKilled=Array(count).fill(false);

 for(let i=0;i<currentMap;i++){
  mapProgress[i]=[10,10,10,10];
  bossKilled[i]=true;
 }

 const p=mapProgress[currentMap];
 if(currentEnemy>=1)p[0]=10;
 if(currentEnemy>=2)p[1]=10;
 if(currentEnemy>=3)p[2]=10;
 if(currentEnemy>=4)p[3]=10;

 state.unlockedMap=currentMap;
 state.mapProgress=mapProgress;
 state.bossProgress=bossProgress;
 state.bossLocked=bossLocked;
 state.bossKilled=bossKilled;
 selectedMap=currentMap;
 selectedEnemy=currentEnemy;
 selectedBattleCount=1;
 save();render();

 if(currentEnemy===4&&state.level<target)alert(`主線進度已指定到 Lv.${target} Boss。依原本規則，角色需達 Lv.${target} 後 Boss 才會顯示。`);
}

function gmCreateGear(){
 const q=Number(document.getElementById("gmGearQuality")?.value);
 const level=Number(document.getElementById("gmGearLevel")?.value);
 const type=document.getElementById("gmGearType")?.value;
 if(!Number.isInteger(q)||q<0||q>=QUALITY.length)return;
 if(!Number.isInteger(level)||level<1||level>MAX_LEVEL)return;
 const types=type==="all"?EQUIPMENT_TYPES.slice():EQUIPMENT_TYPES.includes(type)?[type]:[];
 if(!types.length)return;
 const mapIdx=Math.max(0,Math.min(MAPS.length-1,Math.floor((level-1)/5)));
 types.forEach(slot=>state.inventory.push(makeItem(level,mapIdx,"normal",q,slot)));
 save();render();
}

function gmRefreshShop(){freeShopRefresh(currentShopMap());save(false);render()}
function gmResetShopPrice(){
 if(!state.shop||typeof state.shop!=="object")state.shop=newShopState();
 state.shop.refreshIndex=0;
 state.shop.resetAvailableAt=0;
 save(false);render();
}
function gmResetShop(){gmResetShopPrice()}
function gmHeal(){state.hp=playerCombatStats().hp;save();render()}
function gmClearInventory(){
 if(!state.inventory.length){alert("背包目前是空的。");return}
 if(!confirm(`確定要清空背包中的 ${state.inventory.length} 件裝備嗎？\n目前穿戴中的裝備不會受到影響。`))return;
 state.inventory=[];selectedItem=null;save();render();
}