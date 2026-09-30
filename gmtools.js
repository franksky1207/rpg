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
 const cap=typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(state):MAX_LEVEL;
 const raw=prompt(`指定等級（1～${cap}）`,state.level);
 if(raw===null)return;
 const n=Math.floor(Number(raw));
 if(!Number.isFinite(n)||n<1||n>cap){alert(`請輸入 1～${cap} 的整數。`);return;}
 state.level=typeof window.clampEffectiveGameLevel==="function"?window.clampEffectiveGameLevel(n,state):clampGameLevel(n);
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

function gmDarkMatter(){
 if(!(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()))return alert("目前尚未進入宇宙紀元。");
 const raw=prompt("指定暗物質（0 以上）",state.secondWorld?.darkMatter||0);
 if(raw===null)return;
 const n=Math.floor(Number(raw));
 if(!Number.isFinite(n)||n<0){alert("請輸入 0 以上的數字。");return;}
 state.secondWorld.darkMatter=n;save();render();
}
function gmDarkEnergy(){
 if(!(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()))return alert("目前尚未進入宇宙紀元。");
 const raw=prompt("指定暗能量（0 以上）",state.secondWorld?.darkEnergy||0);
 if(raw===null)return;
 const n=Math.floor(Number(raw));
 if(!Number.isFinite(n)||n<0){alert("請輸入 0 以上的數字。");return;}
 state.secondWorld.darkEnergy=n;save();render();
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

const GM_SECOND_WORLD_PROGRESS_BOSS_COUNT=100;
function gmSecondWorldProgressCount(value){
 const n=Math.floor(Number(value));
 return Number.isFinite(n)?Math.max(0,Math.min(GM_SECOND_WORLD_PROGRESS_BOSS_COUNT,n)):null;
}
function gmSecondWorldStoryIds(){
 if(typeof window.universeStoryIdForBossIndex!=="function")return [];
 return Array.from({length:GM_SECOND_WORLD_PROGRESS_BOSS_COUNT},(_,index)=>window.universeStoryIdForBossIndex(index)).filter(Boolean);
}
function gmSecondWorldProgressSnapshot(target=state){
 const rows=target?.secondWorld?.mainline?.bossKilled;
 let completed=0;
 if(Array.isArray(rows))for(let i=0;i<GM_SECOND_WORLD_PROGRESS_BOSS_COUNT&&rows[i]===true;i++)completed++;
 const nextBoss=completed<GM_SECOND_WORLD_PROGRESS_BOSS_COUNT&&typeof window.secondWorldBoss==="function"?window.secondWorldBoss(completed):null;
 return Object.freeze({version:1,completedBosses:completed,totalBosses:GM_SECOND_WORLD_PROGRESS_BOSS_COUNT,highestClearedBossIndex:completed-1,nextBossIndex:nextBoss?.index??null,nextBossLevel:nextBoss?.level??null,nextBossName:nextBoss?.name||null});
}
function gmApplySecondWorldProgressCount(value,target=state){
 const count=gmSecondWorldProgressCount(value),holder=target&&typeof target==="object"?target:null;
 if(!holder||count==null)return {ok:false,reason:"invalid-target"};
 if(holder?.secondWorld?.entered!==true||holder?.thirdWorld?.entered===true)return {ok:false,reason:"wrong-world"};
 if(!holder.secondWorld.mainline||typeof holder.secondWorld.mainline!=="object")holder.secondWorld.mainline={};
 const storyIds=gmSecondWorldStoryIds();
 if(storyIds.length!==GM_SECOND_WORLD_PROGRESS_BOSS_COUNT||typeof window.universeBossIndexForStoryId!=="function")return {ok:false,reason:"story-owner-missing"};
 const progress=holder?.storyProgress;
 if(!progress||typeof progress!=="object"||!Array.isArray(progress.completedStories))return {ok:false,reason:"story-progress-missing"};
 holder.secondWorld.mainline.bossKilled=Array.from({length:GM_SECOND_WORLD_PROGRESS_BOSS_COUNT},(_,index)=>index<count);
 const universeIds=new Set(storyIds),preserved=progress.completedStories.filter(id=>!universeIds.has(id));
 progress.completedStories=Array.from(new Set([...preserved,...storyIds.slice(0,count)]));
 if(window.universeBossIndexForStoryId(progress.pendingStory)!=null)progress.pendingStory=null;
 if(typeof window.normalizeSecondWorldCalamityState==="function")window.normalizeSecondWorldCalamityState(holder);
 return {ok:true,...gmSecondWorldProgressSnapshot(holder),completedUniverseStories:count};
}
function gmSetSecondWorldProgress(){
 if(state?.secondWorld?.entered!==true||state?.thirdWorld?.entered===true)return alert("只有目前位於宇宙紀元時才能指定宇宙紀元進度。");
 if(typeof window.runSettlementTransaction!=="function")return alert("正式存檔 transaction owner 尚未載入。");
 const current=gmSecondWorldProgressSnapshot(state).completedBosses;
 const raw=prompt("指定宇宙紀元已擊破 Boss 數（0～100）",current);
 if(raw===null)return;
 const number=Number(raw),count=gmSecondWorldProgressCount(number);
 if(count==null||!Number.isInteger(number)||number<0||number>GM_SECOND_WORLD_PROGRESS_BOSS_COUNT){alert("請輸入 0～100 的整數。");return;}
 const tx=window.runSettlementTransaction({label:"gm-second-world-progress",mutate:live=>gmApplySecondWorldProgressCount(count,live)});
 if(!tx?.ok){alert(`宇宙紀元進度更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return;}
 if(typeof render==="function")render();
 if(count>=GM_SECOND_WORLD_PROGRESS_BOSS_COUNT){alert("宇宙紀元主線已指定為 100 / 100 Boss 完成；對應宇宙故事進度已同步。文明等級與文明災厄養成維持原值。");return;}
 const next=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(count):null;
 const requirement=next?Math.max(500,Number(next.level)-5):null,level=Math.max(1,Math.floor(Number(state.level)||1));
 const levelNote=next&&level<requirement?`\n下一隻 ${next.name} Lv.${next.level} 仍需角色至少 Lv.${requirement} 才能挑戰。`:"";
 alert(`宇宙紀元主線已指定為 ${count} / 100 Boss 完成。對應宇宙故事進度已同步；文明等級與文明災厄養成維持原值。${levelNote}`);
}
window.GM_SECOND_WORLD_PROGRESS_MANAGEMENT_VERSION=1;
window.gmSecondWorldProgressSnapshot=gmSecondWorldProgressSnapshot;
window.gmApplySecondWorldProgressCount=gmApplySecondWorldProgressCount;
window.gmSetSecondWorldProgress=gmSetSecondWorldProgress;

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

let gmSecondWorldGearRegion=0;
let gmSecondWorldGearBoss=0;
function gmSecondWorldGearRegions(){return Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[]}
function gmSecondWorldGearBosses(regionIdx=gmSecondWorldGearRegion){return typeof window.secondWorldBossesForRegion==="function"?window.secondWorldBossesForRegion(regionIdx):[]}
function normalizeGmSecondWorldGearSelection(){
 const regions=gmSecondWorldGearRegions();
 gmSecondWorldGearRegion=Math.max(0,Math.min(Math.max(0,regions.length-1),Math.floor(Number(gmSecondWorldGearRegion)||0)));
 const bosses=gmSecondWorldGearBosses(gmSecondWorldGearRegion);
 if(!bosses.some(b=>b.index===gmSecondWorldGearBoss))gmSecondWorldGearBoss=bosses[0]?.index??0;
}
function gmSecondWorldGearRegionOptions(){
 normalizeGmSecondWorldGearSelection();
 return gmSecondWorldGearRegions().map((r,i)=>`<option value="${i}" ${i===gmSecondWorldGearRegion?"selected":""}>${r.name}（Lv.${r.minLevel}～${r.maxLevel}）</option>`).join("");
}
function gmSecondWorldGearBossOptions(){
 normalizeGmSecondWorldGearSelection();
 return gmSecondWorldGearBosses(gmSecondWorldGearRegion).map(b=>`<option value="${b.index}" ${b.index===gmSecondWorldGearBoss?"selected":""}>Boss ${b.index+1}｜${b.name} Lv.${b.level}</option>`).join("");
}
function gmSecondWorldGearSelection(){normalizeGmSecondWorldGearSelection();return {regionIdx:gmSecondWorldGearRegion,bossIdx:gmSecondWorldGearBoss}}
function gmSecondWorldGearChangeRegion(){
 const region=document.getElementById("gmSecondWorldGearRegion"),boss=document.getElementById("gmSecondWorldGearBoss");
 gmSecondWorldGearRegion=Math.max(0,Math.min(Math.max(0,gmSecondWorldGearRegions().length-1),Math.floor(Number(region?.value)||0)));
 gmSecondWorldGearBoss=gmSecondWorldGearBosses(gmSecondWorldGearRegion)[0]?.index??0;
 if(boss){boss.innerHTML=gmSecondWorldGearBossOptions();boss.value=String(gmSecondWorldGearBoss);}
}
function gmSecondWorldGearChangeBoss(){
 const boss=document.getElementById("gmSecondWorldGearBoss"),bosses=gmSecondWorldGearBosses(gmSecondWorldGearRegion),requested=Math.floor(Number(boss?.value));
 gmSecondWorldGearBoss=bosses.some(b=>b.index===requested)?requested:(bosses[0]?.index??0);
}
function gmCreateSecondWorldGear(){
 if(typeof window.makeSecondWorldEquipmentForBoss!=="function")return alert("宇宙紀元裝備 owner 尚未載入。");
 gmSecondWorldGearChangeBoss();
 const q=Math.floor(Number(document.getElementById("gmSecondWorldGearQuality")?.value));
 const type=document.getElementById("gmSecondWorldGearType")?.value;
 if(!Number.isInteger(q)||q<1||q>5)return;
 const types=type==="all"?EQUIPMENT_TYPES.slice():EQUIPMENT_TYPES.includes(type)?[type]:[];
 if(!types.length)return;
 let created=0;
 types.forEach(slot=>{const item=window.makeSecondWorldEquipmentForBoss(gmSecondWorldGearBoss,{forcedQ:q,forcedType:slot,state});if(item){state.inventory.push(item);created++;}});
 if(!created)return alert("無法產生宇宙紀元裝備。");
 save();render();alert(`已產生 ${created} 件宇宙紀元裝備。`);
}

function gmRefreshShop(){freeShopRefresh(currentShopMap());save(false);render()}
function gmResetShopPrice(){
 if(!state.shop||typeof state.shop!=="object")state.shop=newShopState();
 state.shop.refreshIndex=0;
 state.shop.resetAvailableAt=0;
 save(false);render();
}
function gmResetShop(){gmResetShopPrice()}
