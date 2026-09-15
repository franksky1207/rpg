(function(){
 const PROJECT_URL="https://kotnpnnbvttdklkhrmvh.supabase.co";
 const PUBLISHABLE_KEY="sb_publishable_mkLiOerztii2FJqOO0Tluw_zpkvt1w9";
 const AUTH_VERSION=5;
 const RECOVERY_FLAG="civilization_frontline_password_recovery_v1";
 let client=null;
 let currentSession=null;
 let mode="login";
 let busy=false;
 let renderHookInstalled=false;
 let recoveryActive=false;

 try{recoveryActive=sessionStorage.getItem(RECOVERY_FLAG)==="1"||/[#?&]type=recovery(?:&|$)/.test(location.hash+location.search);}catch(e){}

 window.CIVILIZATION_AUTH_REQUIRED=true;
 window.CIVILIZATION_AUTH_VERSION=AUTH_VERSION;

 function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function gate(){return document.getElementById("civilizationAuthGate");}
 function statusEl(){return document.getElementById("civilizationAuthStatus");}
 function formEl(){return document.getElementById("civilizationAuthForm");}
 function emailEl(){return document.getElementById("civilizationAuthEmail");}
 function passwordEl(){return document.getElementById("civilizationAuthPassword");}
 function confirmEl(){return document.getElementById("civilizationAuthPasswordConfirm");}
 function mountCloudSave(){try{window.civilizationCloudSave?.mount?.();}catch(e){console.error("Cloud save mount failed",e);}}

 function authMessage(error){
  const raw=String(error?.message||error||"").trim();
  if(!raw)return "發生未知錯誤，請稍後再試。";
  const lower=raw.toLowerCase();
  if(lower.includes("invalid login credentials"))return "Email 或密碼不正確。";
  if(lower.includes("email not confirmed"))return "此 Email 尚未完成驗證，請先到信箱點擊驗證連結。";
  if(lower.includes("user already registered"))return "這個 Email 已經建立過帳號，請改用登入。";
  if(lower.includes("password should be at least")||lower.includes("password")&&lower.includes("characters"))return "密碼至少需要 8 個字元。";
  if(lower.includes("rate limit")||lower.includes("too many requests"))return "操作過於頻繁，請稍後再試。";
  if(lower.includes("unable to validate email")||lower.includes("invalid email"))return "Email 格式不正確。";
  return raw;
 }

 function setStatus(message,type="info"){
  const el=statusEl();if(!el)return;
  el.textContent=message||"";
  el.dataset.type=type;
  el.hidden=!message;
 }
 function setBusy(next){
  busy=!!next;
  const submit=document.getElementById("civilizationAuthSubmit");
  const forgot=document.getElementById("civilizationAuthForgot");
  const back=document.getElementById("civilizationAuthBackLogin");
  const tabs=document.querySelectorAll("[data-auth-mode]");
  if(submit)submit.disabled=busy;
  if(forgot)forgot.disabled=busy;
  if(back)back.disabled=busy;
  tabs.forEach(btn=>btn.disabled=busy);
 }
 function applyMode(next){
  if(recoveryActive&&next!=="recovery")return enterRecoveryMode();
  mode=next==="signup"?"signup":next==="forgot"?"forgot":"login";
  document.querySelectorAll("[data-auth-mode]").forEach(btn=>btn.classList.toggle("active",btn.dataset.authMode===mode));
  const title=document.getElementById("civilizationAuthFormTitle");
  const submit=document.getElementById("civilizationAuthSubmit");
  const emailWrap=document.getElementById("civilizationAuthEmailWrap");
  const passwordWrap=document.getElementById("civilizationAuthPasswordWrap");
  const confirmWrap=document.getElementById("civilizationAuthConfirmWrap");
  const forgot=document.getElementById("civilizationAuthForgot");
  const back=document.getElementById("civilizationAuthBackLogin");
  const note=document.getElementById("civilizationAuthModeNote");
  if(title)title.textContent=mode==="signup"?"建立帳號":mode==="forgot"?"忘記密碼":"登入帳號";
  if(submit)submit.textContent=mode==="signup"?"建立帳號":mode==="forgot"?"寄送重設密碼信":"登入";
  if(emailWrap)emailWrap.hidden=false;
  if(passwordWrap)passwordWrap.hidden=mode==="forgot";
  if(confirmWrap)confirmWrap.hidden=mode!=="signup";
  if(forgot)forgot.hidden=mode!=="login";
  if(back)back.hidden=mode!=="forgot";
  if(note){note.hidden=mode!=="forgot";note.textContent="輸入建立帳號時使用的 Email，我們會寄送重設密碼連結。";}
  if(passwordEl()){
   passwordEl().required=mode!=="forgot";
   passwordEl().setAttribute("autocomplete",mode==="signup"?"new-password":"current-password");
  }
  if(confirmEl())confirmEl().required=mode==="signup";
  setStatus("");
 }
 function enterRecoveryMode(){
  recoveryActive=true;
  try{sessionStorage.setItem(RECOVERY_FLAG,"1");}catch(e){}
  mode="recovery";
  const tabs=document.getElementById("civilizationAuthTabs");
  const title=document.getElementById("civilizationAuthFormTitle");
  const submit=document.getElementById("civilizationAuthSubmit");
  const emailWrap=document.getElementById("civilizationAuthEmailWrap");
  const passwordWrap=document.getElementById("civilizationAuthPasswordWrap");
  const confirmWrap=document.getElementById("civilizationAuthConfirmWrap");
  const forgot=document.getElementById("civilizationAuthForgot");
  const back=document.getElementById("civilizationAuthBackLogin");
  const note=document.getElementById("civilizationAuthModeNote");
  if(tabs)tabs.hidden=true;
  if(title)title.textContent="設定新密碼";
  if(submit)submit.textContent="更新密碼";
  if(emailWrap)emailWrap.hidden=true;
  if(passwordWrap)passwordWrap.hidden=false;
  if(confirmWrap)confirmWrap.hidden=false;
  if(forgot)forgot.hidden=true;
  if(back)back.hidden=true;
  if(note){note.hidden=false;note.textContent="請輸入新的密碼兩次。更新完成後會直接回到遊戲。";}
  if(passwordEl()){
   passwordEl().required=true;
   passwordEl().value="";
   passwordEl().setAttribute("autocomplete","new-password");
  }
  if(confirmEl()){
   confirmEl().required=true;
   confirmEl().value="";
  }
  setStatus("");
  showGate();
 }
 function showGate(){
  const el=gate();if(!el)return;
  el.hidden=false;
  document.body.classList.add("auth-gate-open");
 }
 function hideGate(){
  const el=gate();if(!el)return;
  el.hidden=true;
  document.body.classList.remove("auth-gate-open");
 }
 function accountSettingsHtml(){
  const email=escapeHtml(currentSession?.user?.email||"未取得 Email");
  return `<section id="civilizationAccountSettings" class="civilization-account-settings"><h3>帳號</h3><div class="civilization-account-row"><div><div class="civilization-account-label">目前登入</div><div class="civilization-account-email">${email}</div></div><button type="button" class="btn danger" onclick="civilizationAccountLogout()">登出</button></div><div class="muted civilization-account-note">登出只會結束這台裝置的登入狀態，不會刪除目前本機遊戲進度。</div></section>`;
 }
 function mountAccountSettings(){
  if(!currentSession)return;
  const existing=document.getElementById("civilizationAccountSettings");
  if(existing){
   const emailNode=existing.querySelector(".civilization-account-email");
   if(emailNode)emailNode.textContent=currentSession?.user?.email||"未取得 Email";
   mountCloudSave();
   return;
  }
  const title=document.getElementById("settingsTitle");
  if(!title)return;
  const card=title.closest(".card");
  if(!card)return;
  const danger=card.querySelector(".danger-zone");
  const holder=document.createElement("div");
  holder.innerHTML=accountSettingsHtml();
  const section=holder.firstElementChild;
  if(!section)return;
  if(danger)danger.before(section);else card.appendChild(section);
  mountCloudSave();
 }
 function installRenderHook(){
  if(renderHookInstalled||typeof window.render!=="function")return;
  const baseRender=window.render;
  const wrapped=function(...args){
   const result=baseRender.apply(this,args);
   mountAccountSettings();
   return result;
  };
  window.render=wrapped;
  try{render=wrapped;}catch(e){}
  renderHookInstalled=true;
  mountAccountSettings();
 }
 function notifySignedIn(session){
  currentSession=session||null;
  window.civilizationAuthSession=currentSession;
  if(currentSession){
   if(recoveryActive){showGate();enterRecoveryMode();return;}
   hideGate();
   mountAccountSettings();
   window.dispatchEvent(new CustomEvent("civilization-auth-ready",{detail:{session:currentSession}}));
  }else showGate();
 }
 function renderGate(){
  if(gate())return;
  const wrap=document.createElement("div");
  wrap.id="civilizationAuthGate";
  wrap.className="civilization-auth-gate";
  wrap.hidden=true;
  wrap.innerHTML=`<div class="civilization-auth-shell"><div class="civilization-auth-card">
   <div class="civilization-auth-brand">文明戰線</div>
   <div class="civilization-auth-subtitle">帳號驗證</div>
   <div id="civilizationAuthTabs" class="civilization-auth-tabs" role="tablist" aria-label="帳號操作">
    <button type="button" class="civilization-auth-tab active" data-auth-mode="login">登入</button>
    <button type="button" class="civilization-auth-tab" data-auth-mode="signup">建立帳號</button>
   </div>
   <form id="civilizationAuthForm" class="civilization-auth-form" novalidate>
    <h2 id="civilizationAuthFormTitle">登入帳號</h2>
    <div id="civilizationAuthModeNote" class="civilization-auth-mode-note" hidden></div>
    <label id="civilizationAuthEmailWrap">Email<input id="civilizationAuthEmail" type="email" inputmode="email" autocomplete="email" maxlength="254" required placeholder="name@example.com"></label>
    <label id="civilizationAuthPasswordWrap">密碼<input id="civilizationAuthPassword" type="password" autocomplete="current-password" minlength="8" required placeholder="至少 8 個字元"></label>
    <button id="civilizationAuthForgot" type="button" class="civilization-auth-link" onclick="civilizationForgotPassword()">忘記密碼？</button>
    <label id="civilizationAuthConfirmWrap" hidden>再次輸入密碼<input id="civilizationAuthPasswordConfirm" type="password" autocomplete="new-password" minlength="8" placeholder="再次輸入密碼"></label>
    <div id="civilizationAuthStatus" class="civilization-auth-status" hidden aria-live="polite"></div>
    <button id="civilizationAuthSubmit" type="submit" class="civilization-auth-submit">登入</button>
    <button id="civilizationAuthBackLogin" type="button" class="civilization-auth-secondary" onclick="civilizationBackToLogin()" hidden>返回登入</button>
   </form>
   <div class="civilization-auth-note">此裝置登入成功後會保持登入。遊戲進度不會自動上傳或下載雲端存檔。</div>
  </div></div>`;
  document.body.appendChild(wrap);
  wrap.querySelectorAll("[data-auth-mode]").forEach(btn=>btn.addEventListener("click",()=>applyMode(btn.dataset.authMode)));
  formEl()?.addEventListener("submit",handleSubmit);
  if(recoveryActive)enterRecoveryMode();else applyMode("login");
 }

 function resetRedirectUrl(){return `${location.origin}${location.pathname}`;}
 async function sendPasswordReset(email){
  if(!client)throw new Error("帳號服務尚未初始化。");
  const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:resetRedirectUrl()});
  if(error)throw error;
 }
 function clearRecoveryState(){
  recoveryActive=false;
  try{sessionStorage.removeItem(RECOVERY_FLAG);}catch(e){}
  try{history.replaceState({},document.title,location.pathname);}catch(e){}
 }
 async function updateRecoveredPassword(password){
  if(!client)throw new Error("帳號服務尚未初始化。");
  const {data,error}=await client.auth.updateUser({password});
  if(error)throw error;
  if(data?.user&&currentSession)currentSession={...currentSession,user:data.user};
 }
 async function handleSubmit(event){
  event.preventDefault();
  if(busy||!client)return;
  const email=String(emailEl()?.value||"").trim();
  const password=String(passwordEl()?.value||"");
  if(mode==="forgot"){
   if(!email){setStatus("請輸入建立帳號時使用的 Email。","error");return;}
   setBusy(true);setStatus("正在寄送重設密碼信…","info");
   try{
    await sendPasswordReset(email);
    setStatus("如果這個 Email 已建立帳號，重設密碼信會寄到該信箱。請開啟信件並點擊重設連結。","success");
   }catch(error){setStatus(authMessage(error),"error");}
   finally{setBusy(false);}
   return;
  }
  if(mode==="recovery"){
   if(password.length<8){setStatus("新密碼至少需要 8 個字元。","error");return;}
   const confirmPassword=String(confirmEl()?.value||"");
   if(password!==confirmPassword){setStatus("兩次輸入的新密碼不一致。","error");return;}
   setBusy(true);setStatus("正在更新密碼…","info");
   try{
    await updateRecoveredPassword(password);
    clearRecoveryState();
    setStatus("密碼已更新完成，正在進入遊戲…","success");
    setTimeout(()=>notifySignedIn(currentSession),700);
   }catch(error){setStatus(authMessage(error),"error");setBusy(false);}
   return;
  }
  if(!email){setStatus("請輸入 Email。","error");return;}
  if(password.length<8){setStatus("密碼至少需要 8 個字元。","error");return;}
  setBusy(true);setStatus(mode==="signup"?"正在建立帳號…":"正在登入…","info");
  try{
   if(mode==="signup"){
    const confirmPassword=String(confirmEl()?.value||"");
    if(password!==confirmPassword){setStatus("兩次輸入的密碼不一致。","error");return;}
    const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:resetRedirectUrl()}});
    if(error)throw error;
    if(data?.session){notifySignedIn(data.session);return;}
    setStatus(`驗證信已寄到 ${email}。請到信箱點擊驗證連結，完成後再回來登入。`,"success");
    applyModeAfterSignup(email);
   }else{
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data?.session)throw new Error("登入未取得有效工作階段，請再試一次。");
    notifySignedIn(data.session);
   }
  }catch(error){setStatus(authMessage(error),"error");}
  finally{setBusy(false);}
 }
 function applyModeAfterSignup(email){
  mode="login";
  document.querySelectorAll("[data-auth-mode]").forEach(btn=>btn.classList.toggle("active",btn.dataset.authMode==="login"));
  const title=document.getElementById("civilizationAuthFormTitle"),submit=document.getElementById("civilizationAuthSubmit"),confirmWrap=document.getElementById("civilizationAuthConfirmWrap"),forgot=document.getElementById("civilizationAuthForgot");
  if(title)title.textContent="完成 Email 驗證後登入";
  if(submit)submit.textContent="登入";
  if(confirmWrap)confirmWrap.hidden=true;
  if(forgot)forgot.hidden=false;
  if(confirmEl())confirmEl().required=false;
  if(emailEl())emailEl().value=email;
  if(passwordEl()){passwordEl().value="";passwordEl().setAttribute("autocomplete","current-password");}
  if(confirmEl())confirmEl().value="";
 }
 async function signOutLocal(){
  if(!client)return {ok:false,error:new Error("帳號服務尚未初始化。")};
  try{
   const {error}=await client.auth.signOut({scope:"local"});
   if(error)throw error;
   currentSession=null;
   window.civilizationAuthSession=null;
   clearRecoveryState();
   const tabs=document.getElementById("civilizationAuthTabs");if(tabs)tabs.hidden=false;
   showGate();
   applyMode("login");
   if(emailEl())emailEl().value="";
   if(passwordEl())passwordEl().value="";
   if(confirmEl())confirmEl().value="";
   setStatus("已登出。","success");
   return {ok:true};
  }catch(error){return {ok:false,error};}
 }
 window.civilizationForgotPassword=function(){if(!busy&&!recoveryActive)applyMode("forgot");};
 window.civilizationBackToLogin=function(){
  if(busy||recoveryActive)return;
  const tabs=document.getElementById("civilizationAuthTabs");if(tabs)tabs.hidden=false;
  applyMode("login");
 };
 window.civilizationAccountLogout=async function(){
  if(busy)return;
  if(!confirm("確定要登出這台裝置嗎？本機遊戲進度不會因此刪除。"))return;
  const button=document.querySelector("#civilizationAccountSettings .btn.danger");
  if(button){button.disabled=true;button.textContent="登出中…";}
  const result=await signOutLocal();
  if(!result.ok){if(button){button.disabled=false;button.textContent="登出";}alert(authMessage(result.error));}
 };

 async function initialize(){
  renderGate();showGate();
  if(!window.supabase||typeof window.supabase.createClient!=="function"){
   setStatus("帳號服務載入失敗，請確認網路連線後重新整理頁面。","error");
   return;
  }
  client=window.supabase.createClient(PROJECT_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  window.civilizationSupabase=client;
  window.civilizationAuth={
   version:AUTH_VERSION,
   getClient:()=>client,
   getSession:()=>currentSession,
   getUser:()=>currentSession?.user||null,
   getEmail:()=>currentSession?.user?.email||"",
   signOut:signOutLocal,
   sendPasswordReset,
   updateRecoveredPassword,
   showGate,
   hideGate,
   mountAccountSettings
  };
  installRenderHook();
  client.auth.onAuthStateChange((event,session)=>{
   if(event==="PASSWORD_RECOVERY"){
    recoveryActive=true;
    try{sessionStorage.setItem(RECOVERY_FLAG,"1");}catch(e){}
    notifySignedIn(session);
    return;
   }
   notifySignedIn(session);
  });
  try{
   const {data,error}=await client.auth.getSession();
   if(error)throw error;
   notifySignedIn(data?.session||null);
  }catch(error){
   currentSession=null;window.civilizationAuthSession=null;showGate();setStatus(authMessage(error),"error");
  }
 }

 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();