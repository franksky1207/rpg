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
function gmSecondWorldProgressCount(value){return typeof window.secondWorldProgressManagementClamp==="function"?window.secondWorldProgressManagementClamp(value):null;}
function gmSecondWorldProgressSnapshot(target=state){return typeof window.secondWorldProgressManagementSnapshot==="function"?window.secondWorldProgressManagementSnapshot(target):Object.freeze({version:1,completedBosses:0,totalBosses:GM_SECOND_WORLD_PROGRESS_BOSS_COUNT});}
function gmApplySecondWorldProgressCount(value,target=state){return typeof window.rebuildSecondWorldFormalProgress==="function"?window.rebuildSecondWorldFormalProgress(value,target):{ok:false,reason:"progress-owner-missing"};}
function gmSetSecondWorldProgress(){
 if(state?.secondWorld?.entered!==true||state?.thirdWorld?.entered===true)return alert("只有目前位於宇宙紀元時才能指定宇宙紀元進度。");
 if(typeof window.runSettlementTransaction!=="function")return alert("正式存檔 transaction owner 尚未載入。");
 if(typeof window.rebuildSecondWorldFormalProgress!=="function")return alert("宇宙紀元正式進度 owner 尚未載入。");
 const current=gmSecondWorldProgressSnapshot(state).completedBosses;
 const raw=prompt("指定宇宙紀元已擊破 Boss 數（0～100）",current);
 if(raw===null)return;
 const number=Number(raw),count=gmSecondWorldProgressCount(number);
 if(count==null||!Number.isInteger(number)||number<0||number>GM_SECOND_WORLD_PROGRESS_BOSS_COUNT){alert("請輸入 0～100 的整數。");return;}
 const tx=window.runSettlementTransaction({label:"gm-second-world-progress",mutate:live=>window.rebuildSecondWorldFormalProgress(count,live)});
 if(!tx?.ok){alert(`宇宙紀元進度更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return;}
 if(typeof render==="function")render();
 if(count>=GM_SECOND_WORLD_PROGRESS_BOSS_COUNT){alert("宇宙紀元主線已指定為 100 / 100 Boss 完成；對應宇宙故事進度已同步。文明等級與文明災厄養成維持原值。");return;}
 const next=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(count):null;
 const requirement=next?Math.max(500,Number(next.level)-5):null,level=Math.max(1,Math.floor(Number(state.level)||1));
 const levelNote=next&&level<requirement?`\n下一隻 ${next.name} Lv.${next.level} 仍需角色至少 Lv.${requirement} 才能挑戰。`:"";
 alert(`宇宙紀元主線已指定為 ${count} / 100 Boss 完成。對應宇宙故事進度已同步；文明等級與文明災厄養成維持原值。${levelNote}`);
}
window.GM_SECOND_WORLD_PROGRESS_MANAGEMENT_VERSION=2;
window.gmSecondWorldProgressSnapshot=gmSecondWorldProgressSnapshot;
window.gmApplySecondWorldProgressCount=gmApplySecondWorldProgressCount;
window.gmSetSecondWorldProgress=gmSetSecondWorldProgress;

const GM_THIRD_WORLD_PROGRESS_MAX=100;
function gmThirdWorldProgressPercent(value){return typeof window.thirdWorldProgressManagementClamp==="function"?window.thirdWorldProgressManagementClamp(value):null;}
function gmThirdWorldProgressSnapshot(target=state){return typeof window.thirdWorldProgressManagementSnapshot==="function"?window.thirdWorldProgressManagementSnapshot(target):Object.freeze({version:1,completionPercent:0,titleTier:0,storyStage:0,defeatedBosses:0,totalBosses:10,currentHp:null,maxHp:null});}
function gmApplyThirdWorldProgressPercent(value,target=state){return typeof window.rebuildThirdWorldFormalProgress==="function"?window.rebuildThirdWorldFormalProgress(value,target):{ok:false,reason:"progress-owner-missing"};}
function gmSetThirdWorldProgress(){
 if(state?.thirdWorld?.entered!==true)return alert("只有目前位於高維紀元時才能指定高維紀元進度。");
 if(typeof window.runSettlementTransaction!=="function")return alert("正式存檔 transaction owner 尚未載入。");
 if(typeof window.rebuildThirdWorldFormalProgress!=="function")return alert("高維紀元正式進度 owner 尚未載入。");
 const current=Math.round(Number(gmThirdWorldProgressSnapshot(state).completionPercent)||0);
 const raw=prompt("指定高維紀元攻略完成度（0～100%）",current);
 if(raw===null)return;
 const number=Number(raw),percent=gmThirdWorldProgressPercent(number);
 if(percent==null||!Number.isInteger(number)||number<0||number>GM_THIRD_WORLD_PROGRESS_MAX){alert("請輸入 0～100 的整數。");return;}
 const tx=window.runSettlementTransaction({label:"gm-third-world-progress",mutate:live=>window.rebuildThirdWorldFormalProgress(percent,live)});
 if(!tx?.ok){alert(`高維紀元進度更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return;}
 if(typeof render==="function")render();
 const snapshot=gmThirdWorldProgressSnapshot(state);
 alert(`高維紀元攻略完成度已指定為 ${percent}%：10 名高維存在的永久 HP、Stage、總體稱號 Tier 與高維故事階段已同步。${percent===100?"高維最終故事與紀元完成狀態亦已同步。":""}\n角色等級、EXP、維度之弦與高維核心養成維持原值。\n目前稱號 Tier：${snapshot.titleTier}｜故事 Stage：${snapshot.storyStage}`);
}
window.GM_THIRD_WORLD_PROGRESS_MANAGEMENT_VERSION=2;
window.gmThirdWorldProgressSnapshot=gmThirdWorldProgressSnapshot;
window.gmApplyThirdWorldProgressPercent=gmApplyThirdWorldProgressPercent;
window.gmSetThirdWorldProgress=gmSetThirdWorldProgress;

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
