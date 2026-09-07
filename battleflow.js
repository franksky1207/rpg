const baseAdventurePreparePageForBattleFlow=adventurePreparePage;
adventurePreparePage=function(){
 let html=baseAdventurePreparePageForBattleFlow();
 html=html.replace(">挑戰 Boss</button>",">回血並挑戰 Boss</button>");
 html=html.replace(">開始戰鬥</button>",">回血並開始戰鬥</button>");
 html=html.replace('<button class="btn ok" onclick="rest()">回城休息</button>',"");
 return html;
};

function healBeforeBattle(){
 state.hp=equippedStats().hp;
 save(false);
}

function startBattles(){
 if(battleBusy)return;
 let e=getPreviewEncounter(selectedMap,selectedEnemy),count=e.kind==="boss"?1:selectedBattleCount;
 pendingBattleCount=count;
 pendingContinuousBattle=null;
 healBeforeBattle();
 beginCombat(count);
}

function showRiskModal(mode,remaining=0){
 riskMode=mode;
 let modal=document.getElementById("riskModal"),msg=document.getElementById("riskMessage"),continueBtn=document.getElementById("riskContinueBtn"),abandonBtn=modal?.querySelector(".controls .btn.ok");
 if(mode==="continuous"){
  let ctx=pendingContinuousBattle,done=ctx?.completed||0,total=ctx?.originalCount||(done+remaining);
  if(msg)msg.innerHTML=`目前 HP 已低於 50%，連續戰鬥已暫停。<br>已完成 <b>${done} / ${total}</b> 場。回血並重新戰鬥會補滿 HP，並從第 1 場重新開始原本的 ${total} 場；已取得的 EXP、金幣與裝備會保留。`;
  if(continueBtn)continueBtn.textContent="回血並重新戰鬥";
  if(abandonBtn)abandonBtn.textContent="放棄戰鬥";
 }else{
  if(msg)msg.textContent="目前 HP 已低於 50%。";
  if(continueBtn)continueBtn.textContent="回血並開始戰鬥";
  if(abandonBtn)abandonBtn.textContent="放棄戰鬥";
 }
 if(modal)modal.classList.add("show");
}

function continueRiskBattle(){
 closeRiskModal();
 if(riskMode==="continuous"&&pendingContinuousBattle){
  let count=pendingContinuousBattle.originalCount||selectedBattleCount||1;
  pendingContinuousBattle=null;
  pendingResultAfterRest=null;
  healBeforeBattle();
  beginCombat(count);
  return;
 }
 healBeforeBattle();
 beginCombat(pendingBattleCount||1);
}

function riskRest(){
 closeRiskModal();
 pendingContinuousBattle=null;
 pendingResultAfterRest=null;
 currentCombatEncounter=null;
 healBeforeBattle();
 adventureScreen="prepare";
 render();
}

const battleFlowMobileStyle=document.createElement("style");
battleFlowMobileStyle.textContent='@media(max-width:760px){.prepare-actions{grid-template-columns:repeat(2,1fr)!important}.prepare-actions .btn{font-size:14px}}';
document.head.appendChild(battleFlowMobileStyle);

render();
