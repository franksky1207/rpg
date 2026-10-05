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
 if(typeof window.gmCommitFormalCharacterLevelMutation!=="function")return alert("正式 GM transaction owner 尚未載入。");
 const cap=typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(state):MAX_LEVEL;
 const raw=prompt(`指定等級（1～${cap}）`,state.level);
 if(raw===null)return false;
 const n=Number(raw);
 if(!Number.isFinite(n)||!Number.isInteger(n)||n<1||n>cap){alert(`請輸入 1～${cap} 的整數。`);return false;}
 const tx=window.gmCommitFormalCharacterLevelMutation(n);
 if(!tx?.ok){alert(`等級更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
 if(typeof render==="function")render();
 return true;
}

function gmFormalResourceCommit(kind,label,current){
 if(typeof window.gmCommitFormalResourceMutation!=="function")return alert("正式 GM transaction owner 尚未載入。");
 const raw=prompt(`指定${label}（0 以上）`,Math.max(0,Math.floor(Number(current)||0)));
 if(raw===null)return false;
 const n=Number(raw);
 if(!Number.isFinite(n)||!Number.isInteger(n)||n<0){alert("請輸入 0 以上的整數。");return false;}
 const tx=window.gmCommitFormalResourceMutation(kind,n);
 if(!tx?.ok){alert(`${label}更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
 if(typeof render==="function")render();
 return true;
}
function gmGold(){return gmFormalResourceCommit("gold","金幣",state.gold);}
function gmDarkMatter(){return gmFormalResourceCommit("dark-matter","暗物質",state.secondWorld?.darkMatter||0);}
function gmDarkEnergy(){return gmFormalResourceCommit("dark-energy","暗能量",state.secondWorld?.darkEnergy||0);}

function gmSetWorldProgress(){
 if(typeof window.gmFirstWorldProgressPlan!=="function"||typeof window.gmCommitFormalFirstWorldProgressMutation!=="function")return alert("正式 GM transaction owner 尚未載入。");
 const raw=prompt(`指定目前攻略到哪個等級關卡（1～${MAX_LEVEL}）`,state.level);
 if(raw===null)return false;
 const target=Number(raw),plan=Number.isInteger(target)?window.gmFirstWorldProgressPlan(target):{ok:false};
 if(!plan?.ok){alert(`請輸入 1～${MAX_LEVEL} 的整數。`);return false;}
 const tx=window.gmCommitFormalFirstWorldProgressMutation(target);
 if(!tx?.ok){alert(`銀河紀元進度更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
 selectedMap=plan.currentMap;
 selectedEnemy=plan.currentEnemy;
 selectedBattleCount=1;
 if(typeof render==="function")render();
 if(plan.currentEnemy===4&&state.level<target)alert(`主線進度已指定到 Lv.${target} Boss。依原本規則，角色需達 Lv.${target} 後 Boss 才會顯示。`);
 return true;
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
 if(typeof window.gmCommitFormalGeneratedEquipmentMutation!=="function")return alert("正式 GM transaction owner 尚未載入。");
 const q=Number(document.getElementById("gmGearQuality")?.value);
 const level=Number(document.getElementById("gmGearLevel")?.value);
 const type=document.getElementById("gmGearType")?.value;
 if(!Number.isInteger(q)||q<0||q>=QUALITY.length)return false;
 if(!Number.isInteger(level)||level<1||level>MAX_LEVEL)return false;
 const types=type==="all"?EQUIPMENT_TYPES.slice():EQUIPMENT_TYPES.includes(type)?[type]:[];
 if(!types.length)return false;
 const tx=window.gmCommitFormalGeneratedEquipmentMutation({world:1,q,level,types});
 if(!tx?.ok){alert(`銀河紀元裝備產生失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
 if(typeof render==="function")render();
 return true;
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
 if(typeof window.gmCommitFormalGeneratedEquipmentMutation!=="function")return alert("正式 GM transaction owner 尚未載入。");
 gmSecondWorldGearChangeBoss();
 const q=Math.floor(Number(document.getElementById("gmSecondWorldGearQuality")?.value));
 const type=document.getElementById("gmSecondWorldGearType")?.value;
 if(!Number.isInteger(q)||q<1||q>5)return false;
 const types=type==="all"?EQUIPMENT_TYPES.slice():EQUIPMENT_TYPES.includes(type)?[type]:[];
 if(!types.length)return false;
 const tx=window.gmCommitFormalGeneratedEquipmentMutation({world:2,q,bossIndex:gmSecondWorldGearBoss,types});
 if(!tx?.ok){alert(`宇宙紀元裝備產生失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
 if(typeof render==="function")render();
 alert(`已產生 ${tx?.value?.created||types.length} 件宇宙紀元裝備。`);
 return true;
}

function gmRefreshShop(){freeShopRefresh(currentShopMap());save(false);render()}
function gmResetShopPrice(){
 if(!state.shop||typeof state.shop!=="object")state.shop=newShopState();
 state.shop.refreshIndex=0;
 state.shop.resetAvailableAt=0;
 save(false);render();
}
function gmResetShop(){gmResetShopPrice()}

window.GM_TOOLS_FORMAL_WRITER_CONVERGENCE_VERSION=1;