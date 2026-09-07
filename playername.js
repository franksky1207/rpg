function currentPlayerName(){
 let name=typeof state?.playerName==="string"?state.playerName.trim():"";
 return name||"玩家";
}
function escapePlayerName(v){
 return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
function savePlayerName(){
 let input=document.getElementById("playerNameInput");
 let name=(input?.value||"").trim();
 if(!name)name="玩家";
 name=name.slice(0,12);
 state.playerName=name;
 save();
 render();
}

const basePlayerStatusHtmlForName=playerStatusHtml;
playerStatusHtml=function(){
 let html=basePlayerStatusHtmlForName();
 let name=escapePlayerName(currentPlayerName());
 return html.replace('<div class="card player-status-card">',`<div class="card player-status-card"><div style="font-size:18px;font-weight:700;color:#f0d494;margin-bottom:9px">${name}</div>`);
};

const baseCharacterPageForName=characterPage;
characterPage=function(){
 let html=baseCharacterPageForName();
 let name=escapePlayerName(currentPlayerName());
 return html.replace('<h2>角色</h2>',`<h2>角色｜${name}</h2>`);
};

const baseAdventureCombatPageForName=adventureCombatPage;
adventureCombatPage=function(){
 let html=baseAdventureCombatPageForName();
 let name=escapePlayerName(currentPlayerName());
 return html.replace(/<h2>玩家 Lv\./,`<h2>${name} Lv.`);
};

const baseSettingsPageForName=settingsPage;
settingsPage=function(){
 let html=baseSettingsPageForName();
 let name=escapePlayerName(currentPlayerName());
 let block=`<div class="setting-row" style="align-items:flex-end"><div style="flex:1"><div style="margin-bottom:6px">角色名稱</div><input id="playerNameInput" type="text" maxlength="12" value="${name}" placeholder="玩家" style="width:100%;padding:10px 11px;border-radius:8px;border:1px solid #424850;background:#0e1217;color:#fff"></div><button class="btn blue" onclick="savePlayerName()">儲存名稱</button></div><div class="muted" style="margin-top:6px">最多 12 個字；空白名稱儲存時會自動恢復成「玩家」。</div>`;
 return html.replace('<h3 style="margin-top:22px">遊戲設定</h3>',`<h3 style="margin-top:22px">遊戲設定</h3>${block}`);
};

if(!state.playerName||!String(state.playerName).trim()){
 state.playerName="玩家";
 save(false);
}
render();
