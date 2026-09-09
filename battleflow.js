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
 const e=getPreviewEncounter(selectedMap,selectedEnemy),count=e.kind==="boss"?1:selectedBattleCount;
 healBeforeBattle();
 beginCombat(count);
}

render();
